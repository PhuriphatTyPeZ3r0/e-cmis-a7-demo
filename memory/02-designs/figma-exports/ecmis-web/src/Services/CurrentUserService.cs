using System.Net.Http.Json;
using System.Text.Json;

namespace EcmisWeb.Services;

public sealed class CurrentUserService(HttpClient http, SessionService sessionService)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private CurrentUserDto? _cached;

    public async Task<CurrentUserDto?> GetCurrentUserAsync(CancellationToken ct = default)
    {
        if (_cached != null) return _cached;

        var response = await http.GetAsync("api/users/me", ct);
        if (!response.IsSuccessStatusCode)
            return null;

        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<CurrentUserDto>>(JsonOptions, ct);
        _cached = envelope?.Success == true ? envelope.Data : null;
        return _cached;
    }

    public void InvalidateCache() => _cached = null;
}

public sealed class CurrentUserDto
{
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string EmailMain { get; set; } = "";
    public string EmailBackup { get; set; } = "";
    public string UserType { get; set; } = "";
    public string AccountStatus { get; set; } = "";
    public bool ForcePasswordChange { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string[] Roles { get; set; } = [];
    public string[] Permissions { get; set; } = [];
    public int? OrgId { get; set; }
    public string OrgName { get; set; } = "";
    public int? PositionId { get; set; }
    public string PositionName { get; set; } = "";
    public string NextUrl { get; set; } = "/dashboard";
}
