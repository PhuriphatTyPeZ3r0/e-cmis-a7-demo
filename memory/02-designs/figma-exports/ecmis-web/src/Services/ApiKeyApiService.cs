using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace EcmisWeb.Services;

public sealed class ApiKeyApiService(HttpClient http, SessionService sessionService)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web) { PropertyNameCaseInsensitive = true };

    private async Task EnsureAuthAsync()
    {
        if (await sessionService.IsAccessTokenExpiringAsync())
            await sessionService.TryRefreshAsync(http);
        var token = await sessionService.GetAccessTokenAsync();
        var type = await sessionService.GetTokenTypeAsync();
        if (!string.IsNullOrEmpty(token))
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(type ?? "Bearer", token);
    }

    public async Task<ApiKeyStatsDto?> GetStatsAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/admin/api-keys/stats", ct);
        return await UnwrapAsync<ApiKeyStatsDto>(resp, ct);
    }

    public async Task<ApiKeyPageResult?> ListAsync(
        string? status = null, string? endpoint = null,
        int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var qs = $"?page={page}&pageSize={pageSize}";
        if (!string.IsNullOrEmpty(status)) qs += $"&status={Uri.EscapeDataString(status)}";
        if (!string.IsNullOrEmpty(endpoint)) qs += $"&endpoint={Uri.EscapeDataString(endpoint)}";
        var resp = await http.GetAsync($"api/admin/api-keys{qs}", ct);
        return await UnwrapAsync<ApiKeyPageResult>(resp, ct);
    }

    public async Task<ApiKeyDetail?> GetDetailAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync($"api/admin/api-keys/{id}", ct);
        return await UnwrapAsync<ApiKeyDetail>(resp, ct);
    }

    public async Task<ApiKeyCreateResult?> CreateAsync(ApiKeyCreateRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/admin/api-keys", req, Json, ct);
        return await UnwrapAsync<ApiKeyCreateResult>(resp, ct);
    }

    public async Task<bool> SuspendAsync(int id, string reason, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PatchAsJsonAsync($"api/admin/api-keys/{id}/suspend", new { reason }, ct);
        return resp.IsSuccessStatusCode;
    }

    public async Task<bool> RenewAsync(int id, DateTimeOffset newExpiresAt, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PatchAsJsonAsync($"api/admin/api-keys/{id}/renew", new { newExpiresAt }, ct);
        return resp.IsSuccessStatusCode;
    }

    public async Task<bool> RevokeAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.SendAsync(
            new HttpRequestMessage(HttpMethod.Delete, $"api/admin/api-keys/{id}/revoke"), ct);
        return resp.IsSuccessStatusCode;
    }

    private static async Task<T?> UnwrapAsync<T>(HttpResponseMessage resp, CancellationToken ct)
    {
        if (!resp.IsSuccessStatusCode) return default;
        var env = await resp.Content.ReadFromJsonAsync<ApiEnvelopeDto<T>>(Json, ct);
        return env is { Success: true } ? env.Data : default;
    }
}

// ── Local DTOs (mirror ApiModels.cs records) ──────────────────────────────────
public sealed record ApiKeyStatsDto(
    int Total, int Active, int Suspended, int Expired, int Revoked, int UniqueAgencies);

public sealed record ApiKeyDto(
    int Id,
    string AgencyName,
    string AgencyCode,
    string ContactName,
    string ContactEmail,
    string Purpose,
    string EndpointCode,
    string KeyPrefix,
    string Status,
    DateTimeOffset ExpiresAt,
    DateTimeOffset? LastUsedAt,
    long CallCount,
    string? SuspendReason,
    DateTimeOffset CreatedAt);

public sealed record ApiKeyPageResult(
    IReadOnlyList<ApiKeyDto> Data,
    int Total,
    int Page,
    int PageSize);

public sealed record ApiKeyCreateRequest(
    string AgencyName,
    string AgencyCode,
    string ContactName,
    string ContactEmail,
    string Purpose,
    string EndpointCode,
    DateTimeOffset ExpiresAt);

public sealed record ApiKeyCreateResult(
    int Id,
    string RawKey,
    string KeyPrefix,
    string EndpointCode,
    DateTimeOffset ExpiresAt);

public sealed record ApiKeyAccessLogDto(
    int Id,
    string EndpointCode,
    string? IpAddress,
    int HttpStatus,
    DateTimeOffset CalledAt);

public sealed record ApiKeyDetail(ApiKeyDto Key, IReadOnlyList<ApiKeyAccessLogDto> Logs);

file sealed record ApiEnvelopeDto<T>(
    [property: JsonPropertyName("success")] bool Success,
    [property: JsonPropertyName("data")] T? Data,
    [property: JsonPropertyName("error")] string? Error);
