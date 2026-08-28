using Microsoft.Extensions.Configuration;
using Microsoft.JSInterop;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace EcmisWeb.Services;

/// <summary>
/// Session tokens: refresh valid 8h for all users (server). Tokens always stored in localStorage
/// so sessions survive tab close/browser restart within the 8-hour window.
/// "Remember me" on login only controls username pre-fill — passwords use the browser password manager.
/// </summary>
public sealed class SessionService(IJSRuntime js, IConfiguration configuration)
{
    private const string AccessTokenKey   = "ecmis_access_token";
    private const string RefreshTokenKey  = "ecmis_refresh_token";
    private const string TokenTypeKey     = "ecmis_token_type";
    private const string AccessExpiresKey = "ecmis_access_expires_at";
    private const string RememberMeKey    = "ecmis_remember_me";
    private const string SavedUsernameKey = "ecmis_saved_username";

    private static readonly string[] SessionKeys =
    [
        AccessTokenKey, RefreshTokenKey, TokenTypeKey, AccessExpiresKey, RememberMeKey
    ];

    public async Task SetSessionAsync(
        string accessToken,
        string refreshToken,
        string tokenType,
        DateTimeOffset? accessExpiresAt = null,
        bool rememberMe = false,
        int? expiresInSeconds = null)
    {
        var expires = accessExpiresAt
            ?? (expiresInSeconds is > 0
                ? DateTimeOffset.UtcNow.AddSeconds(expiresInSeconds.Value)
                : AuthSessionConstants.DefaultAccessExpiresAt());

        await ClearTokenStorageAsync();
        await js.InvokeVoidAsync("localStorage.setItem", AccessTokenKey, accessToken);
        await js.InvokeVoidAsync("localStorage.setItem", RefreshTokenKey, refreshToken);
        await js.InvokeVoidAsync("localStorage.setItem", TokenTypeKey, tokenType);
        await js.InvokeVoidAsync("localStorage.setItem", AccessExpiresKey, expires.ToString("O"));
        await js.InvokeVoidAsync("localStorage.setItem", RememberMeKey, rememberMe ? "1" : "0");
    }

    public async Task ApplyAuthTokensAsync(
        string accessToken,
        string refreshToken,
        string tokenType,
        bool rememberMe,
        int? expiresInSeconds = null,
        string? usernameToSave = null)
    {
        await SetSessionAsync(
            accessToken,
            refreshToken,
            tokenType,
            rememberMe: rememberMe,
            expiresInSeconds: expiresInSeconds);

        // Option A: never store password — only username for pre-fill; browser vault holds the password.
        if (rememberMe && !string.IsNullOrWhiteSpace(usernameToSave))
            await js.InvokeVoidAsync("localStorage.setItem", SavedUsernameKey, usernameToSave.Trim());
        else
            await js.InvokeVoidAsync("localStorage.removeItem", SavedUsernameKey);

        await ClearLegacyMenuCacheAsync();
    }

    private async Task ClearLegacyMenuCacheAsync()
    {
        try
        {
            await js.InvokeVoidAsync("localStorage.removeItem", "ecmis-menu-v3");
            await js.InvokeVoidAsync("localStorage.removeItem", "ecmis-menu-ts");
            await js.InvokeVoidAsync("localStorage.removeItem", "ecmis-menu-owner");
        }
        catch { /* best-effort */ }
    }

    public async Task<string?> LoadSavedUsernameAsync()
        => await js.InvokeAsync<string?>("localStorage.getItem", SavedUsernameKey);

    public async Task<bool> GetRememberMeAsync()
    {
        var raw = await GetStoredValueAsync(RememberMeKey);
        return raw == "1";
    }

    private async Task<string?> GetStoredValueAsync(string key)
    {
        // Tokens are stored in localStorage; legacy sessionStorage blanks must not shadow them.
        if (IsSessionKey(key))
        {
            var local = await js.InvokeAsync<string?>("localStorage.getItem", key);
            if (!string.IsNullOrWhiteSpace(local)) return local;
            var session = await js.InvokeAsync<string?>("sessionStorage.getItem", key);
            return string.IsNullOrWhiteSpace(session) ? null : session;
        }

        var sessionVal = await js.InvokeAsync<string?>("sessionStorage.getItem", key);
        if (!string.IsNullOrWhiteSpace(sessionVal)) return sessionVal;
        return await js.InvokeAsync<string?>("localStorage.getItem", key);
    }

    private static bool IsSessionKey(string key) =>
        key is AccessTokenKey or RefreshTokenKey or TokenTypeKey or AccessExpiresKey;

    public async Task<string?> GetAccessTokenAsync()
        => await GetStoredValueAsync(AccessTokenKey);

    public async Task<string?> GetRefreshTokenAsync()
        => await GetStoredValueAsync(RefreshTokenKey);

    public async Task<string?> GetTokenTypeAsync()
        => await GetStoredValueAsync(TokenTypeKey);

    public async Task ClearSessionAsync()
    {
        await ClearTokenStorageAsync();
        await ClearLegacyMenuCacheAsync();
    }

    private async Task ClearTokenStorageAsync()
    {
        foreach (var key in SessionKeys)
        {
            await js.InvokeVoidAsync("sessionStorage.removeItem", key);
            await js.InvokeVoidAsync("localStorage.removeItem", key);
        }
    }

    public async Task<bool> IsAuthenticatedAsync()
    {
        var token = await GetAccessTokenAsync();
        if (!string.IsNullOrEmpty(token))
            return true;
        return !string.IsNullOrEmpty(await GetRefreshTokenAsync());
    }

    public async Task<bool> IsAccessTokenExpiringAsync()
    {
        var raw = await GetStoredValueAsync(AccessExpiresKey);
        if (raw is null || !DateTimeOffset.TryParse(raw, out var expiresAt))
            return true;
        return DateTimeOffset.UtcNow >= expiresAt.AddSeconds(-60);
    }

    public Task<bool> EnsureValidSessionAsync(HttpClient? _ = null) => EnsureValidSessionCoreAsync();

    public Task<bool> TryRestoreSessionAsync(HttpClient? _ = null) => TryRestoreSessionCoreAsync();

    private async Task<bool> EnsureValidSessionCoreAsync()
    {
        var refresh = await GetRefreshTokenAsync();
        if (string.IsNullOrEmpty(refresh))
            return !string.IsNullOrEmpty(await GetAccessTokenAsync());

        if (await IsAccessTokenExpiringAsync())
            return await TryRefreshCoreAsync();

        return true;
    }

    private async Task<bool> TryRestoreSessionCoreAsync()
    {
        // Must validate with server (refresh); do not trust access token in localStorage alone.
        if (string.IsNullOrEmpty(await GetRefreshTokenAsync()))
            return false;

        return await TryRefreshCoreAsync();
    }

    private static Task<bool>? _ongoingRefresh;

    public Task<bool> TryRefreshAsync(HttpClient? _ = null) => TryRefreshCoreAsync();

    private Task<bool> TryRefreshCoreAsync()
    {
        if (_ongoingRefresh is not null)
            return _ongoingRefresh;

        _ongoingRefresh = ExecuteRefreshAsync();
        return _ongoingRefresh;
    }

    private Uri AdminApiBase =>
        new(configuration["ApiBaseUrl:EcmisAdmin"]
            ?? configuration["ApiBaseUrl:AdminService"]
            ?? "http://localhost:5001/");

    private async Task<bool> ExecuteRefreshAsync()
    {
        try
        {
            var refreshToken = await GetRefreshTokenAsync();
            if (string.IsNullOrEmpty(refreshToken))
                return false;

            using var refreshHttp = new HttpClient { BaseAddress = AdminApiBase };
            var response = await refreshHttp.PostAsJsonAsync("api/auth/refresh", new { refreshToken });
            if (!response.IsSuccessStatusCode)
            {
                await ClearSessionAsync();
                return false;
            }

            var result = await response.Content.ReadFromJsonAsync<RefreshResponse>();
            if (result is null || string.IsNullOrEmpty(result.Data?.AccessToken))
            {
                await ClearSessionAsync();
                return false;
            }

            var rememberMe = await GetRememberMeAsync();
            await SetSessionAsync(
                result.Data.AccessToken,
                result.Data.RefreshToken ?? refreshToken,
                result.Data.TokenType ?? "Bearer",
                rememberMe: rememberMe,
                expiresInSeconds: result.Data.ExpiresIn > 0 ? result.Data.ExpiresIn : null);

            return true;
        }
        catch
        {
            return false;
        }
        finally
        {
            _ongoingRefresh = null;
        }
    }

    private sealed class RefreshResponse
    {
        [JsonPropertyName("data")]
        public RefreshData? Data { get; set; }
    }

    private sealed class RefreshData
    {
        [JsonPropertyName("accessToken")]
        public string? AccessToken { get; set; }
        [JsonPropertyName("refreshToken")]
        public string? RefreshToken { get; set; }
        [JsonPropertyName("tokenType")]
        public string? TokenType { get; set; }
        [JsonPropertyName("expiresIn")]
        public int ExpiresIn { get; set; }
    }
}
