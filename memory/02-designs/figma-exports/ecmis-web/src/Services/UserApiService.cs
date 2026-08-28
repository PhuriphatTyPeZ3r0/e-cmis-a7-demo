using System.Net.Http.Json;
using System.Text.Json;
using EcmisWeb.Models;

namespace EcmisWeb.Services;

public sealed class UserApiService(HttpClient http, SessionService sessionService)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private async Task EnsureAuthAsync()
    {
        if (await sessionService.IsAccessTokenExpiringAsync())
            await sessionService.TryRefreshAsync(http);

        var token = await sessionService.GetAccessTokenAsync();
        var tokenType = await sessionService.GetTokenTypeAsync();

        if (!string.IsNullOrEmpty(token))
        {
            http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue(tokenType ?? "Bearer", token);
        }
    }

    public async Task<UsernameCheckResult> CheckUsernameAsync(
        string firstNameEn,
        string lastNameEn,
        CancellationToken ct = default)
    {
        var firstName = Uri.EscapeDataString(firstNameEn);
        var lastName = Uri.EscapeDataString(lastNameEn);
        var response = await http.GetAsync($"api/users/check-username?firstName={firstName}&lastName={lastName}", ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<UsernameCheckResult>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    public async Task<RegistrationSubmitResult> RegisterAsync(
        RegistrationRequest request,
        CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/users/register", request, JsonOptions, ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<RegistrationSubmitResult>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    public async Task<CitizenRegistrationResult> RegisterCitizenAsync(
        CitizenRegistrationRequest request,
        CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/citizens/register", request, JsonOptions, ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<CitizenRegistrationResult>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    public async Task UpdateProfileAsync(
        string firstName,
        string lastName,
        string? emailMain,
        string? emailBackup,
        string? phoneNumber,
        CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var response = await http.PutAsJsonAsync("api/users/me", new
        {
            firstName,
            lastName,
            emailMain,
            emailBackup,
            phoneNumber
        }, JsonOptions, ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<object>>(JsonOptions, ct);
        if (!response.IsSuccessStatusCode || envelope?.Success != true)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }
    }

    public async Task<List<OrgItem>> GetOrganizationsAsync(CancellationToken ct = default)
    {
        var response = await http.GetAsync("api/organizations", ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<List<OrgItem>>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    public async Task<TosDto?> GetActiveTosAsync(CancellationToken ct = default)
    {
        try
        {
            var response = await http.GetAsync("api/users/tos", ct);
            if (!response.IsSuccessStatusCode) return null;
            var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<TosDto>>(JsonOptions, ct);
            return envelope?.Success == true ? envelope.Data : null;
        }
        catch
        {
            return null;
        }
    }

    public async Task<List<MyTransferRequestDto>> GetMyTransferRequestsAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var response = await http.GetAsync("api/me/transfer-requests", ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<List<MyTransferRequestDto>>>(JsonOptions, ct);
        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }
        return envelope.Data;
    }

    public async Task CreateMyTransferRequestAsync(
        int toOrgId,
        string? reason,
        DateOnly? effectiveDate = null,
        CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var response = await http.PostAsJsonAsync("api/me/transfer-request", new
        {
            toOrgId,
            reason,
            effectiveDate
        }, JsonOptions, ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<object>>(JsonOptions, ct);
        if (!response.IsSuccessStatusCode || envelope?.Success != true)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }
    }
}

public sealed class MyTransferRequestDto
{
    public int Id { get; set; }
    public string FromOrgName { get; set; } = "";
    public string ToOrgName { get; set; } = "";
    public string Status { get; set; } = "";
    public string Reason { get; set; } = "";
    public DateTimeOffset RequestedAt { get; set; }
    public string? ReviewNote { get; set; }
}
