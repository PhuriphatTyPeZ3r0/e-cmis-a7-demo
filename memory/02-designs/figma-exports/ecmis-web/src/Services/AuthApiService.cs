using System.Net.Http.Json;
using System.Text.Json;

namespace EcmisWeb.Services;

public sealed class AuthApiService(HttpClient http, SessionService sessionService)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    /// <summary>Login with username/password, then require OTP.</summary>
    public async Task<LoginResponse> LoginAsync(string username, string password, bool rememberMe = false, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/auth/login", new
        {
            username,
            password,
            remember_me = rememberMe
        }, JsonOptions, ct);
        return await ReadEnvelopeAsync<LoginResponse>(response, ct);
    }

    /// <summary>Change password after force change — ส่ง username + otp ที่ค้างจาก verify-otp กลับมาเพื่อยืนยัน</summary>
    public async Task<LoginResponse> ChangePasswordAsync(
        string username,
        string otp,
        string newPassword,
        string confirmPassword,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync(ct);
        var response = await http.PostAsJsonAsync("api/auth/change-password", new
        {
            username,
            otp,
            newPassword,
            confirmPassword
        }, JsonOptions, ct);
        return await ReadEnvelopeAsync<LoginResponse>(response, ct);
    }

    public async Task<LoginResponse> VerifyOtpAsync(string username, string otp, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/auth/verify-otp", new
        {
            username,
            otp
        }, JsonOptions, ct);

        return await ReadEnvelopeAsync<LoginResponse>(response, ct);
    }

    public async Task<LoginResponse> ResendOtpAsync(
        string username,
        bool rememberMe = false,
        CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/auth/resend-otp", new
        {
            username,
            remember_me = rememberMe
        }, JsonOptions, ct);

        return await ReadEnvelopeAsync<LoginResponse>(response, ct);
    }

    /// <summary>ThaiD login → JWT tokens directly (TOBE 14.1.2 — no OTP)</summary>
    public async Task<LoginResponse> VerifyThaiDLoginAsync(string refToken, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/auth/thaid/verify", new { @ref = refToken }, JsonOptions, ct);
        var envelope = await ReadEnvelopeAsync<LoginResponse>(response, ct);
        return envelope;
    }

    /// <summary>
    /// Register ThaiD — ส่งคืน 2 รูปแบบ:
    /// - existingAccount=true → web auto-login ทันที (TOBE: ไม่ต้องลงทะเบียนซ้ำ)
    /// - existingAccount=false → web เก็บ identity แล้วไปหน้า Register
    /// </summary>
    public async Task<ThaiDRegisterResolveResult> FetchThaiDIdentityAsync(string refNonce, CancellationToken ct = default)
    {
        var response = await http.GetAsync($"api/auth/thaid/identity/{Uri.EscapeDataString(refNonce)}", ct);
        return await ReadEnvelopeAsync<ThaiDRegisterResolveResult>(response, ct);
    }

    /// <summary>Server-side logout: revoke session + audit (TOBE 14.5.1).</summary>
    public async Task LogoutAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync(ct);
        try
        {
            await http.PostAsync("api/auth/logout", null, ct);
        }
        catch
        {
            // Client session will still be cleared even if the network call fails.
        }
    }

    public async Task<ForgotPasswordResult> ForgotPasswordAsync(string email, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/auth/password-reset/request", new { email }, JsonOptions, ct);
        ForgotPasswordResponse data;
        try { data = await ReadEnvelopeAsync<ForgotPasswordResponse>(response, ct); }
        catch (InvalidOperationException ex) { return ForgotPasswordResult.Fail(ex.Message); }
        return ForgotPasswordResult.Ok(data.Message);
    }

    public async Task<ResetPasswordVerifyResponse> VerifyResetPasswordAsync(string token, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/auth/reset-password/verify", new
        {
            token
        }, JsonOptions, ct);
        return await ReadEnvelopeAsync<ResetPasswordVerifyResponse>(response, ct);
    }

    public async Task ResetPasswordAsync(string token, string newPassword, string confirmPassword, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/auth/reset-password/confirm", new
        {
            token,
            newPassword,
            confirmPassword
        }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    private static async Task<T> ReadEnvelopeAsync<T>(HttpResponseMessage response, CancellationToken ct)
    {
        var content = await response.Content.ReadAsStringAsync(ct);
        if (!string.IsNullOrWhiteSpace(content))
        {
            try
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                var success = root.TryGetProperty("success", out var successElement)
                              && successElement.ValueKind == JsonValueKind.True;

                if (response.IsSuccessStatusCode && success)
                {
                    if (!root.TryGetProperty("data", out var dataElement) || dataElement.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined)
                        throw new InvalidOperationException("API response data is missing");

                    var parsed = dataElement.Deserialize<T>(JsonOptions);
                    if (parsed is null)
                        throw new InvalidOperationException("API response data is invalid");

                    return parsed;
                }

                throw new InvalidOperationException(BuildApiErrorMessage(root, (int)response.StatusCode));
            }
            catch (JsonException)
            {
                // Fall through to non-envelope handling for unexpected payloads.
            }
        }

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"API request failed: {(int)response.StatusCode}");

        var direct = await response.Content.ReadFromJsonAsync<T>(JsonOptions, ct);
        if (direct is null)
            throw new InvalidOperationException("API response data is invalid");

        return direct;
    }

    private static string BuildApiErrorMessage(JsonElement root, int statusCode)
    {
        string? message = null;

        if (root.TryGetProperty("error", out var errorElement) && errorElement.ValueKind == JsonValueKind.String)
            message = errorElement.GetString();

        if (string.IsNullOrWhiteSpace(message)
            && root.TryGetProperty("message", out var messageElement)
            && messageElement.ValueKind == JsonValueKind.String)
            message = messageElement.GetString();

        string? trackingId = null;
        if (root.TryGetProperty("data", out var dataElement) && dataElement.ValueKind == JsonValueKind.Object)
        {
            if (string.IsNullOrWhiteSpace(message)
                && dataElement.TryGetProperty("error", out var nestedError)
                && nestedError.ValueKind == JsonValueKind.String)
                message = nestedError.GetString();

            if (dataElement.TryGetProperty("trackingId", out var trackingElement) && trackingElement.ValueKind == JsonValueKind.String)
                trackingId = trackingElement.GetString();
        }

        var finalMessage = string.IsNullOrWhiteSpace(message)
            ? $"API request failed: {statusCode}"
            : message.Trim();

        if (!string.IsNullOrWhiteSpace(trackingId) && !finalMessage.Contains(trackingId, StringComparison.OrdinalIgnoreCase))
            finalMessage = $"{finalMessage} (trackingId: {trackingId})";

        return finalMessage;
    }

    public Task<bool> EnsureSessionFreshAsync(CancellationToken ct = default)
        => sessionService.EnsureValidSessionAsync(http);

    public Task<bool> TryRestoreSessionAsync(CancellationToken ct = default)
        => sessionService.TryRestoreSessionAsync(http);

    private async Task SetAuthHeaderAsync(CancellationToken ct)
    {
        await sessionService.EnsureValidSessionAsync(http);

        var token = await sessionService.GetAccessTokenAsync();
        var tokenType = await sessionService.GetTokenTypeAsync();

        if (!string.IsNullOrWhiteSpace(token))
            http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue(tokenType ?? "Bearer", token);
    }
}

/// <summary>Login API response.</summary>
public sealed class LoginResponse
{
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public bool RequiresOtp { get; set; }
    public bool MustChangePassword { get; set; }
    public bool MustResetPassword { get; set; }
    public string AccessToken { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public string TokenType { get; set; } = "";
    public int ExpiresIn { get; set; }
    public int RefreshExpiresIn { get; set; }
    public DateTimeOffset? OtpExpiresAt { get; set; }
    public string DevOtp { get; set; } = "";
    public bool EmailSent { get; set; }
    public string Error { get; set; } = "";
    public string TrackingId { get; set; } = "";
}

public sealed class ResetPasswordVerifyResponse
{
    public bool Valid { get; set; }
    public string Username { get; set; } = "";
    public string MaskedEmail { get; set; } = "";
}

internal sealed record ForgotPasswordResponse
{
    public string Message { get; set; } = "หากอีเมลนี้มีในระบบ จะส่งลิงค์รีเซ็ตไปยังอีเมลดังกล่าว";
}

public sealed record ForgotPasswordResult(bool Success, string? Error, string Message = "")
{
    public static ForgotPasswordResult Ok(string message) => new(true, null, message);
    public static ForgotPasswordResult Fail(string error) => new(false, error);
}

public sealed class ThaiDRegisterResolveResult
{
    public bool ExistingAccount { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public bool MustChangePassword { get; set; }
    public string AccessToken { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public string TokenType { get; set; } = "";
    public string Flow { get; set; } = "";   // "register" | "register_citizen"
    public ThaiDIdentity? Identity { get; set; }
}
