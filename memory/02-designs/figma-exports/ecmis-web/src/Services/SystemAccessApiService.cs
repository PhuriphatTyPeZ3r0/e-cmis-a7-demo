using Microsoft.JSInterop;
using System.Net.Http.Json;
using System.Text.Json;

namespace EcmisWeb.Services;

/// <summary>
/// API client สำหรับ System Access (TOBE 14.4.6 + 14.1.2 ข้อ 7)
/// - System catalog CRUD
/// - User-System access workflow
/// - System Admin assignments
/// - Self-service org/role change
/// - Menu query
/// </summary>
public sealed class SystemAccessApiService(HttpClient http, SessionService sessionService, IJSRuntime js)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web) { PropertyNameCaseInsensitive = true };

    private MyMenuResult? _cachedMenu;
    // Menu is scoped to the current browser session only — do not persist to localStorage
    // (stale cache caused users to keep seeing menus after permissions were revoked).

    private async Task EnsureAuthAsync()
    {
        if (await sessionService.IsAccessTokenExpiringAsync())
            await sessionService.TryRefreshAsync(http);
        var token = await sessionService.GetAccessTokenAsync();
        var type = await sessionService.GetTokenTypeAsync();
        if (!string.IsNullOrEmpty(token))
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(type ?? "Bearer", token);
    }

    // ── Public list (anonymous OK — สำหรับ Register form) ──────────────────
    public async Task<List<SystemDto>> ListPublicSystemsAsync(bool modulesOnly = true, CancellationToken ct = default)
    {
        var qs = modulesOnly ? "?modulesOnly=true" : "?modulesOnly=false";
        var resp = await http.GetAsync("api/systems/public" + qs, ct);
        var list = await UnwrapAsync<List<SystemDto>>(resp, ct) ?? new();
        NormalizeSystemNames(list);
        return modulesOnly ? FilterModuleRootsOnly(list) : list;
    }

    // ── System Catalog ─────────────────────────────────────────────────────
    public async Task<List<SystemDto>> ListSystemsAsync(bool includeInactive = false, string? layer = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var qs = new List<string>();
        if (includeInactive) qs.Add("includeInactive=true");
        if (!string.IsNullOrWhiteSpace(layer)) qs.Add($"layer={Uri.EscapeDataString(layer)}");
        var url = "api/admin/systems" + (qs.Count > 0 ? "?" + string.Join("&", qs) : "");
        var resp = await http.GetAsync(url, ct);
        var list = await UnwrapAsync<List<SystemDto>>(resp, ct) ?? new();
        NormalizeSystemNames(list);
        if (string.Equals(layer, "module", StringComparison.OrdinalIgnoreCase))
            return FilterModuleRootsOnly(list);
        return list;
    }

    /// <summary>โมดูลหลัก sidebar: รหัส mod.* และไม่มี parent</summary>
    public static List<SystemDto> FilterModuleRootsOnly(IEnumerable<SystemDto> items) =>
        items
            .Where(s => s.IsMainModule
                || (s.ParentId is null && (s.Code ?? "").StartsWith("mod.", StringComparison.OrdinalIgnoreCase)))
            .GroupBy(s => s.Id)
            .Select(g => g.First())
            .OrderBy(s => s.DisplayOrder)
            .ThenBy(s => s.Code, StringComparer.OrdinalIgnoreCase)
            .ToList();

    private static void NormalizeSystemNames(List<SystemDto> items)
    {
        foreach (var s in items)
        {
        }
    }

    public async Task<SystemDto?> GetSystemAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync($"api/admin/systems/{id}", ct);
        return await UnwrapAsync<SystemDto>(resp, ct);
    }

    public async Task<int> CreateSystemAsync(SystemUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/admin/systems", req, Json, ct);
        var data = await UnwrapAsync<IdResult>(resp, ct);
        return data!.Id;
    }

    public async Task UpdateSystemAsync(int id, SystemUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PutAsJsonAsync($"api/admin/systems/{id}", req, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task DeleteSystemAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.DeleteAsync($"api/admin/systems/{id}", ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task<List<SystemMenuAdminDto>> ListSystemMenusAsync(int systemId, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync($"api/admin/systems/{systemId}/menus", ct);
        return await UnwrapAsync<List<SystemMenuAdminDto>>(resp, ct) ?? new();
    }

    public async Task<int> CreateSystemMenuAsync(int systemId, SystemMenuUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync($"api/admin/systems/{systemId}/menus", req, Json, ct);
        return (await UnwrapAsync<IdResult>(resp, ct))!.Id;
    }

    public async Task UpdateSystemMenuAsync(int systemId, int menuId, SystemMenuUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PutAsJsonAsync($"api/admin/systems/{systemId}/menus/{menuId}", req, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task DeleteSystemMenuAsync(int systemId, int menuId, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.DeleteAsync($"api/admin/systems/{systemId}/menus/{menuId}", ct);
        await UnwrapAsync<object>(resp, ct);
    }

    // ── System Access workflow ─────────────────────────────────────────────
    public async Task<List<MySystemAccessDto>> MySystemAccessAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/me/system-access", ct);
        return await UnwrapAsync<List<MySystemAccessDto>>(resp, ct) ?? new();
    }

    public async Task<int> RequestSystemAccessAsync(int systemId, string reason, int? roleId = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/me/system-access/request",
            new { systemId, reason, requestedRoleId = roleId }, Json, ct);
        var d = await UnwrapAsync<IdResult>(resp, ct);
        return d!.Id;
    }

    public async Task<List<PendingSystemAccessDto>> PendingSystemAccessAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/admin/system-access/pending", ct);
        return await UnwrapAsync<List<PendingSystemAccessDto>>(resp, ct) ?? new();
    }

    public async Task ApproveSystemAccessAsync(int id, string? note = null, DateTimeOffset? effectiveUntil = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync($"api/admin/system-access/{id}/approve",
            new { note, effectiveUntil }, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task RejectSystemAccessAsync(int id, string note, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync($"api/admin/system-access/{id}/reject", new { note }, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task RevokeSystemAccessAsync(int id, string? note = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync($"api/admin/system-access/{id}/revoke", new { note }, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task<int> AdminAssignSystemAccessAsync(int userId, int systemId, string? note = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync($"api/admin/users/{userId}/system-access/assign",
            new { systemId, note }, Json, ct);
        var d = await UnwrapAsync<IdResult>(resp, ct);
        return d!.Id;
    }

    // ── System Admin Assignment ─────────────────────────────────────────────
    public async Task<List<SystemAdminAssignmentDto>> ListSystemAdminsAsync(int? systemId = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var url = "api/admin/system-admins" + (systemId.HasValue ? $"?systemId={systemId.Value}" : "");
        var resp = await http.GetAsync(url, ct);
        return await UnwrapAsync<List<SystemAdminAssignmentDto>>(resp, ct) ?? new();
    }

    public async Task<int> AssignSystemAdminAsync(int userId, int systemId, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/admin/system-admins", new { userId, systemId }, Json, ct);
        var d = await UnwrapAsync<IdResult>(resp, ct);
        return d!.Id;
    }

    public async Task RevokeSystemAdminAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.DeleteAsync($"api/admin/system-admins/{id}", ct);
        await UnwrapAsync<object>(resp, ct);
    }

    // ── Org-System Baseline ────────────────────────────────────────────────
    public async Task<List<OrgSystemBaselineDto>> GetOrgBaselineAsync(int? orgId = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var url = orgId.HasValue ? $"api/admin/org-system-baseline?orgId={orgId}" : "api/admin/org-system-baseline";
        var resp = await http.GetAsync(url, ct);
        return await UnwrapAsync<List<OrgSystemBaselineDto>>(resp, ct) ?? new();
    }

    public async Task<int> AddOrgBaselineAsync(int orgId, int systemId, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/admin/org-system-baseline", new { orgId, systemId }, Json, ct);
        var d = await UnwrapAsync<IdResult>(resp, ct);
        return d!.Id;
    }

    public async Task RemoveOrgBaselineAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.DeleteAsync($"api/admin/org-system-baseline/{id}", ct);
        await UnwrapAsync<object>(resp, ct);
    }

    // ── Menu Query ─────────────────────────────────────────────────────────
    public async Task<MyMenuResult?> MyMenuAsync(CancellationToken ct = default)
    {
        if (_cachedMenu != null) return _cachedMenu;

        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/me/menu", ct);
        _cachedMenu = await ReadMenuResponseAsync(resp, ct);
        NormalizeMenuResult(_cachedMenu);

        if (!HasMenuModules(_cachedMenu))
            _cachedMenu = null;

        return _cachedMenu;
    }

    public void InvalidateMenuCache()
    {
        _cachedMenu = null;
        _ = TryClearMenuStorageAsync();
    }

    private static bool HasMenuModules(MyMenuResult? menu) =>
        menu is not null && (menu.Modules.Count > 0 || menu.Systems.Count > 0);

    private static async Task<MyMenuResult?> ReadMenuResponseAsync(HttpResponseMessage resp, CancellationToken ct)
    {
        var body = await resp.Content.ReadAsStringAsync(ct);
        if (string.IsNullOrWhiteSpace(body))
        {
            if (!resp.IsSuccessStatusCode) throw new InvalidOperationException($"HTTP {(int)resp.StatusCode}");
            return null;
        }
        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;
        var success = root.TryGetProperty("success", out var s) && s.ValueKind == JsonValueKind.True;
        if (!resp.IsSuccessStatusCode || !success)
        {
            var err = root.TryGetProperty("error", out var e) && e.ValueKind == JsonValueKind.String
                ? e.GetString() : $"HTTP {(int)resp.StatusCode}";
            throw new InvalidOperationException(err ?? "API call failed");
        }
        if (!root.TryGetProperty("data", out var data) || data.ValueKind == JsonValueKind.Null)
            return null;
        if (data.ValueKind == JsonValueKind.Object)
            return data.Deserialize<MyMenuResult>(Json);
        // API เก่าคืน array แบน — ไม่ใช้ cache; ให้ผู้ใช้รีสตาร์ท ecmis-admin
        return null;
    }

    private static void NormalizeMenuResult(MyMenuResult? menu)
    {
        if (menu is null) return;
        if (menu.Modules.Count == 0 && menu.Systems.Count > 0)
            menu.Modules = menu.Systems;
        if (menu.Systems.Count == 0 && menu.Modules.Count > 0)
            menu.Systems = menu.Modules;
    }

    private async Task TryClearMenuStorageAsync()
    {
        try
        {
            // Legacy keys from older builds (v3 localStorage cache)
            await js.InvokeVoidAsync("localStorage.removeItem", "ecmis-menu-v3");
            await js.InvokeVoidAsync("localStorage.removeItem", "ecmis-menu-ts");
            await js.InvokeVoidAsync("localStorage.removeItem", "ecmis-menu-owner");
        }
        catch { }
    }

    // ── Self-service Change Requests ────────────────────────────────────────
    public async Task<List<MyChangeRequestDto>> MyChangeRequestsAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/me/change-requests", ct);
        return await UnwrapAsync<List<MyChangeRequestDto>>(resp, ct) ?? new();
    }

    public async Task<int> RequestOrgChangeAsync(int targetOrgId, string reason, int? attachmentId = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/me/org-change-request",
            new { targetOrgId, reason, attachmentId }, Json, ct);
        var d = await UnwrapAsync<IdResult>(resp, ct);
        return d!.Id;
    }

    public async Task<int> RequestRoleChangeAsync(int targetRoleId, string reason, int? attachmentId = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/me/role-change-request",
            new { targetRoleId, reason, attachmentId }, Json, ct);
        var d = await UnwrapAsync<IdResult>(resp, ct);
        return d!.Id;
    }

    public async Task<int> RequestPositionChangeAsync(int targetPositionId, string reason, int? attachmentId = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/me/position-change-request",
            new { targetPositionId, reason, attachmentId }, Json, ct);
        var d = await UnwrapAsync<IdResult>(resp, ct);
        return d!.Id;
    }

    public async Task<List<PendingChangeRequestDto>> PendingChangeRequestsAsync(string? type = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var url = "api/admin/change-requests/pending" + (string.IsNullOrEmpty(type) ? "" : $"?type={type}");
        var resp = await http.GetAsync(url, ct);
        return await UnwrapAsync<List<PendingChangeRequestDto>>(resp, ct) ?? new();
    }

    public async Task ApproveChangeRequestAsync(int id, string? note = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync($"api/admin/change-requests/{id}/approve", new { note }, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task RejectChangeRequestAsync(int id, string note, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync($"api/admin/change-requests/{id}/reject", new { note }, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task<List<MyRoleDto>> MyRolesAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/me/roles", ct);
        return await UnwrapAsync<List<MyRoleDto>>(resp, ct) ?? new();
    }

    // GET /api/me/activity-log — ประวัติการใช้งานส่วนตัว
    public async Task<List<MyActivityLogDto>> GetMyActivityLogAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/me/activity-log", ct);
        return await UnwrapAsync<List<MyActivityLogDto>>(resp, ct) ?? new();
    }

    // ── Lookups ─────────────────────────────────────────────────────────────
    public async Task<List<LookupOrgDto>> LookupOrganizationsAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/lookups/organizations", ct);
        return await UnwrapAsync<List<LookupOrgDto>>(resp, ct) ?? new();
    }

    public async Task<List<LookupRoleDto>> LookupRolesAsync(string? scope = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var url = "api/lookups/roles";
        if (!string.IsNullOrWhiteSpace(scope))
            url += $"?scope={Uri.EscapeDataString(scope.Trim())}";
        var resp = await http.GetAsync(url, ct);
        return await UnwrapAsync<List<LookupRoleDto>>(resp, ct) ?? new();
    }

    public async Task<List<LookupPositionDto>> LookupPositionsAsync(string? scope = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var url = "api/lookups/positions";
        if (!string.IsNullOrWhiteSpace(scope))
            url += $"?scope={Uri.EscapeDataString(scope.Trim())}";
        var resp = await http.GetAsync(url, ct);
        return await UnwrapAsync<List<LookupPositionDto>>(resp, ct) ?? new();
    }

    // ── Master Data: Organizations CRUD ─────────────────────────────────────
    public async Task<List<OrganizationDto>> ListOrganizationsAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/admin/organizations", ct);
        return await UnwrapAsync<List<OrganizationDto>>(resp, ct) ?? new();
    }
    public async Task<int> CreateOrganizationAsync(OrganizationUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/admin/organizations", req, Json, ct);
        return (await UnwrapAsync<IdResult>(resp, ct))!.Id;
    }
    public async Task UpdateOrganizationAsync(int id, OrganizationUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PutAsJsonAsync($"api/admin/organizations/{id}", req, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }
    public async Task DeleteOrganizationAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.DeleteAsync($"api/admin/organizations/{id}", ct);
        await UnwrapAsync<object>(resp, ct);
    }

    // ── Master Data: Positions CRUD ──────────────────────────────────────────
    public async Task<List<PositionDto>> ListPositionsAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/admin/positions", ct);
        return await UnwrapAsync<List<PositionDto>>(resp, ct) ?? new();
    }

    public async Task<List<PositionHolderDto>> GetPositionHoldersAsync(int positionId, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync($"api/admin/positions/{positionId}/holders", ct);
        return await UnwrapAsync<List<PositionHolderDto>>(resp, ct) ?? new();
    }

    public async Task<int> CreatePositionAsync(PositionUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/admin/positions", req, Json, ct);
        return (await UnwrapAsync<IdResult>(resp, ct))!.Id;
    }
    public async Task UpdatePositionAsync(int id, PositionUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PutAsJsonAsync($"api/admin/positions/{id}", req, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }
    public async Task DeletePositionAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.DeleteAsync($"api/admin/positions/{id}", ct);
        await UnwrapAsync<object>(resp, ct);
    }

    // ── System Groups CRUD ──────────────────────────────────────────────────
    public async Task<List<SystemGroupDto>> ListSystemGroupsAsync(string? scope = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var url = string.IsNullOrWhiteSpace(scope)
            ? "api/admin/system-groups"
            : $"api/admin/system-groups?scope={Uri.EscapeDataString(scope)}";
        var resp = await http.GetAsync(url, ct);
        return await UnwrapAsync<List<SystemGroupDto>>(resp, ct) ?? new();
    }

    public async Task<List<PositionRoleDto>> ListPositionRolesAsync(int positionId, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync($"api/admin/positions/{positionId}/roles", ct);
        return await UnwrapAsync<List<PositionRoleDto>>(resp, ct) ?? new();
    }

    public async Task<int> CreatePositionRoleAsync(int positionId, PositionRoleUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync($"api/admin/positions/{positionId}/roles", req, Json, ct);
        return (await UnwrapAsync<IdResult>(resp, ct))!.Id;
    }

    public async Task UpdatePositionRoleAsync(int positionId, int roleId, PositionRoleUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PutAsJsonAsync($"api/admin/positions/{positionId}/roles/{roleId}", req, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task DeletePositionRoleAsync(int positionId, int roleId, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.DeleteAsync($"api/admin/positions/{positionId}/roles/{roleId}", ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task SetDefaultPositionRoleAsync(int positionId, int roleId, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsync($"api/admin/positions/{positionId}/roles/{roleId}/set-default", null, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task<AssignableRolesDto?> GetAssignableRolesForUserAsync(int userId, int? orgId = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var url = orgId is > 0
            ? $"api/admin/users/{userId}/assignable-roles?orgId={orgId.Value}"
            : $"api/admin/users/{userId}/assignable-roles";
        var resp = await http.GetAsync(url, ct);
        return await UnwrapAsync<AssignableRolesDto>(resp, ct);
    }

    public async Task<AdminContextDto?> GetAdminContextAsync(CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.GetAsync("api/me/admin-context", ct);
        return await UnwrapAsync<AdminContextDto>(resp, ct);
    }

    public async Task<List<OrgGroupDto>> ListOrgGroupsAsync(int? departmentId = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var url = departmentId is > 0
            ? $"api/admin/org-groups?departmentId={departmentId.Value}"
            : "api/admin/org-groups";
        var resp = await http.GetAsync(url, ct);
        return await UnwrapAsync<List<OrgGroupDto>>(resp, ct) ?? new();
    }

    public async Task<int> CreateOrgGroupAsync(OrgGroupUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/admin/org-groups", req, Json, ct);
        return (await UnwrapAsync<OrgGroupCreateResult>(resp, ct))!.Id;
    }

    public async Task UpdateOrgGroupAsync(int id, OrgGroupUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PutAsJsonAsync($"api/admin/org-groups/{id}", req, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task DeleteOrgGroupAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.DeleteAsync($"api/admin/org-groups/{id}", ct);
        await UnwrapAsync<object>(resp, ct);
    }
    public async Task<int> CreateSystemGroupAsync(SystemGroupUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/admin/system-groups", req, Json, ct);
        return (await UnwrapAsync<IdResult>(resp, ct))!.Id;
    }
    public async Task UpdateSystemGroupAsync(int id, SystemGroupUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PutAsJsonAsync($"api/admin/system-groups/{id}", req, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }
    public async Task DeleteSystemGroupAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.DeleteAsync($"api/admin/system-groups/{id}", ct);
        await UnwrapAsync<object>(resp, ct);
    }
    public async Task SetSystemGroupAsync(int systemId, int? groupId, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PatchAsJsonAsync($"api/admin/systems/{systemId}/group", new { groupId }, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }

    public async Task<int> RequestIndividualAccessAsync(int functionGroupId, string reason, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/me/individual-access-request",
            new { functionGroupId, reason }, Json, ct);
        var result = await UnwrapAsync<IndividualAccessRequestResult>(resp, ct);
        return result?.RequestId ?? 0;
    }

    public sealed record IndividualAccessRequestResult(int RequestId);

    // ── Master Data: Reference Data CRUD ────────────────────────────────────
    public async Task<List<RefDataDto>> ListRefDataAsync(string? category = null, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var url = string.IsNullOrWhiteSpace(category) ? "api/admin/ref-data" : $"api/admin/ref-data?category={Uri.EscapeDataString(category)}";
        var resp = await http.GetAsync(url, ct);
        return await UnwrapAsync<List<RefDataDto>>(resp, ct) ?? new();
    }
    public async Task<int> CreateRefDataAsync(RefDataUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PostAsJsonAsync("api/admin/ref-data", req, Json, ct);
        return (await UnwrapAsync<IdResult>(resp, ct))!.Id;
    }
    public async Task UpdateRefDataAsync(int id, RefDataUpsertRequest req, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.PutAsJsonAsync($"api/admin/ref-data/{id}", req, Json, ct);
        await UnwrapAsync<object>(resp, ct);
    }
    public async Task DeleteRefDataAsync(int id, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        var resp = await http.DeleteAsync($"api/admin/ref-data/{id}", ct);
        await UnwrapAsync<object>(resp, ct);
    }

    // ── File Upload ─────────────────────────────────────────────────────────
    public async Task<UploadResult?> UploadFileAsync(Stream file, string filename, string category, CancellationToken ct = default)
    {
        await EnsureAuthAsync();
        using var content = new MultipartFormDataContent();
        var streamContent = new StreamContent(file);
        content.Add(streamContent, "file", filename);
        content.Add(new StringContent(category), "category");
        var resp = await http.PostAsync("api/uploads", content, ct);
        return await UnwrapAsync<UploadResult>(resp, ct);
    }

    // ── Internal helper ─────────────────────────────────────────────────────
    private static async Task<T?> UnwrapAsync<T>(HttpResponseMessage resp, CancellationToken ct)
    {
        var body = await resp.Content.ReadAsStringAsync(ct);
        if (string.IsNullOrWhiteSpace(body))
        {
            if (!resp.IsSuccessStatusCode) throw new InvalidOperationException($"HTTP {(int)resp.StatusCode}");
            return default;
        }
        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;
        var success = root.TryGetProperty("success", out var s) && s.ValueKind == JsonValueKind.True;
        if (!resp.IsSuccessStatusCode || !success)
        {
            var err = root.TryGetProperty("error", out var e) && e.ValueKind == JsonValueKind.String
                ? e.GetString() : $"HTTP {(int)resp.StatusCode}";
            throw new InvalidOperationException(err ?? "API call failed");
        }
        if (!root.TryGetProperty("data", out var data) || data.ValueKind == JsonValueKind.Null) return default;
        return data.Deserialize<T>(Json);
    }
}

// ── DTOs (AC-14: int PK) ────────────────────────────────────────────────────
public sealed class SystemDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string NameEn { get; set; } = "";
    public int? ActivityNo { get; set; }
    public string TorSection { get; set; } = "";
    public string Description { get; set; } = "";
    public string Remark { get; set; } = "";
    public string Path { get; set; } = "";
    public int? ParentId { get; set; }
    public bool IsMainModule { get; set; }
    public string Icon { get; set; } = "";
    public string Color { get; set; } = "";
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public bool ShowInRegister { get; set; } = true;
    public int? GroupId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class SystemUpsertRequest
{
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string? Path { get; set; }
    public int? ParentId { get; set; }
    public bool IsMenu { get; set; } = true;
    public string? Remark { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class MySystemAccessDto
{
    public int Id { get; set; }
    public int SystemId { get; set; }
    public string SystemCode { get; set; } = "";
    public string SystemName { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Color { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTimeOffset RequestedAt { get; set; }
    public string RequestedReason { get; set; } = "";
    public DateTimeOffset ReviewedAt { get; set; }
    public string ReviewNote { get; set; } = "";
    public string Reviewer { get; set; } = "";
    public DateTimeOffset? EffectiveUntil { get; set; }
}

public sealed class PendingSystemAccessDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public int SystemId { get; set; }
    public string SystemCode { get; set; } = "";
    public string SystemName { get; set; } = "";
    public DateTimeOffset RequestedAt { get; set; }
    public string RequestedReason { get; set; } = "";
    public string RequestedRole { get; set; } = "";
}

public sealed class SystemAdminAssignmentDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string FullName { get; set; } = "";
    public int SystemId { get; set; }
    public string SystemCode { get; set; } = "";
    public string SystemName { get; set; } = "";
    public DateTimeOffset AssignedAt { get; set; }
    public string AssignedBy { get; set; } = "";
}

public sealed class OrgSystemBaselineDto
{
    public int Id { get; set; }
    public int OrgId { get; set; }
    public string OrgName { get; set; } = "";
    public int SystemId { get; set; }
    public string SystemName { get; set; } = "";
    public string SystemCode { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Color { get; set; } = "";
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class MyMenuResult
{
    public List<MenuSystemDto> Modules { get; set; } = new();
    public List<MenuSystemDto> Systems { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public bool IsSuperAdmin { get; set; }
}

public sealed class MenuSystemDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string NameEn { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Color { get; set; } = "";
    public int DisplayOrder { get; set; }
    public List<MenuItemDto> Menus { get; set; } = new();
}

public sealed class MenuItemDto
{
    public int Id { get; set; }
    public int SystemId { get; set; }
    public int? ParentMenuId { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string NameEn { get; set; } = "";
    public string Route { get; set; } = "";
    public string Icon { get; set; } = "";
    public string PermissionCode { get; set; } = "";
    public int DisplayOrder { get; set; }
}

public sealed class MyChangeRequestDto
{
    public int Id { get; set; }
    public string RequestType { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTimeOffset RequestedAt { get; set; }
    public int? TargetOrgId { get; set; }
    public string TargetOrgName { get; set; } = "";
    public int? TargetRoleId { get; set; }
    public string TargetRoleName { get; set; } = "";
    public int? TargetPositionId { get; set; }
    public string TargetPositionName { get; set; } = "";
    public string Reason { get; set; } = "";
    public DateTimeOffset ReviewedAt { get; set; }
    public string ReviewNote { get; set; } = "";
    public string Reviewer { get; set; } = "";
}

public sealed class PendingChangeRequestDto
{
    public int Id { get; set; }
    public string RequestType { get; set; } = "";
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string FullName { get; set; } = "";
    public int? TargetOrgId { get; set; }
    public string TargetOrgName { get; set; } = "";
    public int? TargetRoleId { get; set; }
    public string TargetRoleName { get; set; } = "";
    public int? TargetPositionId { get; set; }
    public string TargetPositionName { get; set; } = "";
    public string Reason { get; set; } = "";
    public DateTimeOffset RequestedAt { get; set; }
    public int? AttachmentId { get; set; }
}

public sealed class MyRoleDto
{
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string LandingRoute { get; set; } = "";
    public string[] Permissions { get; set; } = Array.Empty<string>();
}

public sealed class SystemMenuAdminDto
{
    public int Id { get; set; }
    public int SystemId { get; set; }
    public int? ParentMenuId { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string NameEn { get; set; } = "";
    public string Route { get; set; } = "";
    public string Icon { get; set; } = "";
    public string PermissionCode { get; set; } = "";
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public sealed class SystemMenuUpsertRequest
{
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string? NameEn { get; set; }
    public string? Route { get; set; }
    public string? Icon { get; set; }
    public string? PermissionCode { get; set; }
    public int? ParentMenuId { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class UploadResult
{
    public int Id { get; set; }
    public string StoragePath { get; set; } = "";
    public string DownloadUrl { get; set; } = "";
    public string OriginalName { get; set; } = "";
    public string MimeType { get; set; } = "";
    public long SizeBytes { get; set; }
}

public sealed class OrganizationDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    /// <summary>API field <c>detail</c> → <c>tsd_detail</c></summary>
    [System.Text.Json.Serialization.JsonPropertyName("detail")]
    public string Detail { get; set; } = "";
    public bool IsActive { get; set; }
}

public sealed class OrganizationUpsertRequest
{
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string? Detail { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class PositionDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    [System.Text.Json.Serialization.JsonPropertyName("detail")]
    public string Detail { get; set; } = "";
    public bool IsActive { get; set; }
    public int RoleCount { get; set; }
    public int HolderCount { get; set; }
}

public sealed class PositionHolderDto
{
    public int UserPosDeptId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string AccountStatus { get; set; } = "";
    public int? OrgId { get; set; }
    public string OrgName { get; set; } = "";
    public string PositionName { get; set; } = "";
    public DateTimeOffset? AssignedAt { get; set; }
}

public sealed class PositionRoleDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public int MenuCount { get; set; }
}

public sealed class PositionRoleUpsertRequest
{
    public string NameTh { get; set; } = "";
    public string? Code { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; }
}

public sealed class AssignableRolesDto
{
    public int? PositionId { get; set; }
    public List<AssignableRoleItemDto> PositionRoles { get; set; } = new();
    public List<AssignableRoleItemDto> SpecialGroups { get; set; } = new();
    public List<AssignableRoleItemDto> OrgGroups { get; set; } = new();
}

public sealed class AdminContextDto
{
    public bool IsSuperAdmin { get; set; }
    public bool IsOrgAdmin { get; set; }
    public bool CanManageOrgGroups { get; set; }
    public List<int> OrgScopeIds { get; set; } = new();
}

public sealed class OrgGroupDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public bool IsActive { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = "";
    public string DepartmentCode { get; set; } = "";
    public int MenuCount { get; set; }
}

public sealed class OrgGroupUpsertRequest
{
    public string NameTh { get; set; } = "";
    public int? DepartmentId { get; set; }
    public string? Code { get; set; }
    public bool IsActive { get; set; } = true;
}

internal sealed class OrgGroupCreateResult
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
}

public sealed class AssignableRoleItemDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public bool IsDefault { get; set; }
    public string Kind { get; set; } = "";
}

public sealed class PositionUpsertRequest
{
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string? Detail { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class LookupOrgDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
}

public sealed class LookupRoleDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
}

public sealed class LookupPositionDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public bool IsActive { get; set; } = true;
}

internal sealed class IdResult
{
    public int Id { get; set; }
}

public sealed class MyActivityLogDto
{
    public int Id { get; set; }
    public string Action { get; set; } = "";
    public string TargetTable { get; set; } = "";
    public string? TargetId { get; set; }
    public string Metadata { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public string ActorUsername { get; set; } = "";
}

public sealed class SystemGroupDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string Type { get; set; } = "";
    public string NameEn { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Color { get; set; } = "";
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public int? PositionId { get; set; }
    public bool IsDefault { get; set; }
    public int SystemCount { get; set; }
}

public sealed class SystemGroupUpsertRequest
{
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string? NameEn { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class RefDataDto
{
    public int Id { get; set; }
    public string Category { get; set; } = "";
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    [System.Text.Json.Serialization.JsonPropertyName("nameEn")]
    public string Detail { get; set; } = "";
    public bool IsActive { get; set; }
}

public sealed class RefDataUpsertRequest
{
    public string Category { get; set; } = "";
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    [System.Text.Json.Serialization.JsonPropertyName("nameEn")]
    public string? Detail { get; set; }
    public bool IsActive { get; set; } = true;
}

