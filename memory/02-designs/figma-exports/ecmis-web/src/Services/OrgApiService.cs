using System.Net.Http.Json;
using System.Text.Json;
using EcmisWeb.Models;

namespace EcmisWeb.Services;

public sealed class OrgApiService(HttpClient http)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<List<OrgItem>> GetOrganizationsAsync(CancellationToken ct = default)
    {
        var response = await http.GetAsync("api/organizations", ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<List<OrgItem>>>(JsonOptions, ct);
        return envelope?.Data ?? new List<OrgItem>();
    }
}

public class OrgItem
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
}
