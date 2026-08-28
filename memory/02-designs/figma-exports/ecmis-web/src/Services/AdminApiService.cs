using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace EcmisWeb.Services;

public sealed class AdminApiService(HttpClient http, SessionService sessionService)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly SessionService _sessionService = sessionService;

    private async Task SetAuthHeaderAsync()
    {
        if (await _sessionService.IsAccessTokenExpiringAsync())
            await _sessionService.TryRefreshAsync(http);

        var token = await _sessionService.GetAccessTokenAsync();
        var tokenType = await _sessionService.GetTokenTypeAsync();

        if (!string.IsNullOrEmpty(token))
        {
            http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue(tokenType ?? "Bearer", token);
        }
    }

    // GET /api/admin/registrations - รายการคำขอทั้งหมด
    public async Task<List<RegistrationDto>> GetRegistrationsAsync(string? status = null, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var url = "api/admin/registrations";
        if (!string.IsNullOrWhiteSpace(status))
        {
            url += $"?status={Uri.EscapeDataString(status)}";
        }

        var response = await http.GetAsync(url, ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<List<RegistrationDto>>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    // GET /api/admin/registrations/{id} - รายละเอียด
    public async Task<RegistrationDto> GetRegistrationAsync(int id, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var response = await http.GetAsync($"api/admin/registrations/{id}", ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<RegistrationDto>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    // GET /api/admin/registrations/assignable-groups — กลุ่มสิทธิ์สำหรับหน้าอนุมัติลงทะเบียน
    public async Task<List<AssignableGroupDto>> GetAssignableGroupsForRegistrationAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync("api/admin/registrations/assignable-groups", ct);
        return await ReadEnvelopeAsync<List<AssignableGroupDto>>(response, ct) ?? new();
    }

    // POST /api/admin/registrations/{id}/approve - อนุมัติสร้างบัญชี + มอบกลุ่มสิทธิ์
    public async Task ApproveRegistrationAsync(
        int id,
        string? note,
        string? reviewedBy,
        int? targetOrgId,
        int[] functionGroupIds,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var response = await http.PostAsJsonAsync($"api/admin/registrations/{id}/approve", new
        {
            note,
            reviewedBy,
            targetOrgId,
            functionGroupIds
        }, JsonOptions, ct);

        await ReadEnvelopeAsync<object>(response, ct);
    }

    // POST /api/admin/registrations/{id}/reject - ปฏิเสธ
    public async Task RejectRegistrationAsync(int id, string? reason, string? reviewedBy, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var response = await http.PostAsJsonAsync($"api/admin/registrations/{id}/reject", new
        {
            reason,
            reviewedBy
        }, JsonOptions, ct);

        await ReadEnvelopeAsync<object>(response, ct);
    }

    // GET /api/admin/users - รายชื่อ users ทั้งหมด
    public async Task<List<UserDto>> GetUsersAsync(string? status = null, string? role = null, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var url = "api/admin/users";
        var queryParams = new List<string>();
        if (!string.IsNullOrWhiteSpace(status))
            queryParams.Add($"status={Uri.EscapeDataString(status)}");
        if (!string.IsNullOrWhiteSpace(role))
            queryParams.Add($"role={Uri.EscapeDataString(role)}");

        if (queryParams.Any())
        {
            url += "?" + string.Join("&", queryParams);
        }

        var response = await http.GetAsync(url, ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<List<UserDto>>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    // GET /api/admin/org-admins — ผู้ดูแลสำนัก (org_admin), optional filter by department
    public async Task<List<OrgAdminDto>> GetOrgAdminsAsync(int? departmentId = null, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var url = departmentId is > 0
            ? $"api/admin/org-admins?departmentId={departmentId.Value}"
            : "api/admin/org-admins";
        var resp = await http.GetAsync(url, ct);
        var envelope = await resp.Content.ReadFromJsonAsync<ApiEnvelope<List<OrgAdminDto>>>(JsonOptions, ct);
        return envelope?.Data ?? new();
    }

    public async Task<List<FunctionGroupMemberDto>> GetFunctionGroupMembersAsync(int groupId, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var resp = await http.GetAsync($"api/admin/function-groups/{groupId}/members", ct);
        return await ReadEnvelopeAsync<List<FunctionGroupMemberDto>>(resp, ct);
    }

    // GET /api/admin/reports/users - รายงานผู้ใช้งาน
    public async Task<List<UserReportDto>> GetUserReportAsync(
        string? status = null,
        string? orgId = null,
        string? role = null,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var queryParams = new List<string>();
        if (!string.IsNullOrWhiteSpace(status))
            queryParams.Add($"status={Uri.EscapeDataString(status)}");
        if (!string.IsNullOrWhiteSpace(orgId))
            queryParams.Add($"orgId={Uri.EscapeDataString(orgId)}");
        if (!string.IsNullOrWhiteSpace(role))
            queryParams.Add($"role={Uri.EscapeDataString(role)}");

        var url = "api/admin/reports/users";
        if (queryParams.Any())
            url += "?" + string.Join("&", queryParams);

        var response = await http.GetAsync(url, ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<List<UserReportDto>>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    // GET /api/admin/reports/login-history - รายงานประวัติการเข้าใช้งาน
    public async Task<List<LoginHistoryReportDto>> GetLoginHistoryReportAsync(
        string? userId = null,
        string? from = null,
        string? to = null,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var queryParams = new List<string>();
        if (!string.IsNullOrWhiteSpace(userId))
            queryParams.Add($"userId={Uri.EscapeDataString(userId)}");
        if (!string.IsNullOrWhiteSpace(from))
            queryParams.Add($"from={Uri.EscapeDataString(from)}");
        if (!string.IsNullOrWhiteSpace(to))
            queryParams.Add($"to={Uri.EscapeDataString(to)}");

        var url = "api/admin/reports/login-history";
        if (queryParams.Any())
            url += "?" + string.Join("&", queryParams);

        var response = await http.GetAsync(url, ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<List<LoginHistoryReportDto>>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    // GET /api/admin/reports/audit - รายงาน audit logs
    public async Task<List<AuditReportDto>> GetAuditReportAsync(
        string? userId = null,
        string? actionType = null,
        string? from = null,
        string? to = null,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var queryParams = new List<string>();
        if (!string.IsNullOrWhiteSpace(userId))
            queryParams.Add($"userId={Uri.EscapeDataString(userId)}");
        if (!string.IsNullOrWhiteSpace(actionType))
            queryParams.Add($"actionType={Uri.EscapeDataString(actionType)}");
        if (!string.IsNullOrWhiteSpace(from))
            queryParams.Add($"from={Uri.EscapeDataString(from)}");
        if (!string.IsNullOrWhiteSpace(to))
            queryParams.Add($"to={Uri.EscapeDataString(to)}");

        var url = "api/admin/reports/audit";
        if (queryParams.Any())
            url += "?" + string.Join("&", queryParams);

        var response = await http.GetAsync(url, ct);
        var content = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"API request failed: {(int)response.StatusCode}");

        using var doc = System.Text.Json.JsonDocument.Parse(content);
        var root = doc.RootElement;
        if (!root.TryGetProperty("success", out var successEl) || successEl.ValueKind != System.Text.Json.JsonValueKind.True)
        {
            var err = root.TryGetProperty("error", out var e) && e.ValueKind == System.Text.Json.JsonValueKind.String
                ? e.GetString() : "API request failed";
            throw new InvalidOperationException(err ?? "API request failed");
        }

        if (!root.TryGetProperty("data", out var dataEl) || dataEl.ValueKind != System.Text.Json.JsonValueKind.Array)
            return new List<AuditReportDto>();

        return dataEl.Deserialize<List<AuditReportDto>>(JsonOptions) ?? new();
    }

    // GET /api/admin/users/{id} - รายละเอียดผู้ใช้งาน (TOBE 14.1.4 page 03)
    public async Task<UserDetailDto> GetUserDetailAsync(int id, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync($"api/admin/users/{id}", ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<UserDetailDto>>(JsonOptions, ct);
        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }
        return envelope.Data;
    }

    // GET /api/admin/log-categories
    public async Task<List<LogCategoryDto>> GetLogCategoriesAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync("api/admin/log-categories", ct);
        return await ReadEnvelopeAsync<List<LogCategoryDto>>(response, ct);
    }

    // POST /api/admin/log-categories
    public async Task SaveLogCategoryAsync(Guid? id, string code, string nameTh, string? description, string? color, string[] patterns, int sortOrder, bool isActive, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var body = new { code, nameTh, description, color, actionPatterns = patterns, sortOrder, isActive };
        var response = id.HasValue
            ? await http.PutAsJsonAsync($"api/admin/log-categories/{id}", body, JsonOptions, ct)
            : await http.PostAsJsonAsync("api/admin/log-categories", body, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // DELETE /api/admin/log-categories/{id}
    public async Task DeleteLogCategoryAsync(Guid id, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.DeleteAsync($"api/admin/log-categories/{id}", ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // POST /api/admin/log-categories/classify
    public async Task<int> ClassifyLogsAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync("api/admin/log-categories/classify", new { }, JsonOptions, ct);
        var env = await response.Content.ReadFromJsonAsync<ApiEnvelope<ClassifyResultDto>>(JsonOptions, ct);
        return env?.Data?.Classified ?? 0;
    }

    // GET /api/admin/audit-logs/by-category
    public async Task<List<CategoryCountDto>> GetAuditLogsByCategoryAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync("api/admin/audit-logs/by-category", ct);
        return await ReadEnvelopeAsync<List<CategoryCountDto>>(response, ct);
    }

    // GET /api/admin/security-alerts
    public async Task<List<SecurityAlertDto>> GetSecurityAlertsAsync(string? severity = null, string? status = "open", CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var url = "api/admin/security-alerts";
        var qs = new List<string>();
        if (!string.IsNullOrWhiteSpace(severity)) qs.Add($"severity={Uri.EscapeDataString(severity)}");
        if (!string.IsNullOrWhiteSpace(status)) qs.Add($"status={Uri.EscapeDataString(status)}");
        if (qs.Any()) url += "?" + string.Join("&", qs);
        var response = await http.GetAsync(url, ct);
        return await ReadEnvelopeAsync<List<SecurityAlertDto>>(response, ct);
    }

    // PUT /api/admin/security-alerts/{id}/resolve
    public async Task ResolveSecurityAlertAsync(int id, string action, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PutAsJsonAsync($"api/admin/security-alerts/{id}/resolve", new { action }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // PUT /api/admin/users/{id} - แก้ไขข้อมูลผู้ใช้
    public async Task UpdateUserAsync(
        int id,
        string firstName,
        string lastName,
        string? emailMain,
        string? emailBackup,
        string phoneNumber,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PutAsJsonAsync($"api/admin/users/{id}", new
        {
            firstName, lastName, emailMain, emailBackup, phoneNumber
        }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // POST /api/admin/users/{id}/reset-password - Reset รหัสผ่าน
    public async Task<ResetPasswordResult> ResetPasswordAsync(int id, string? newPassword = null, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var response = await http.PostAsJsonAsync($"api/admin/users/{id}/reset-password", new
        {
            newPassword
        }, JsonOptions, ct);

        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<ResetPasswordResult>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    // POST /api/admin/users/{id}/deactivate - ระงับบัญชี
    public async Task DeactivateUserAsync(int id, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var response = await http.PostAsJsonAsync($"api/admin/users/{id}/deactivate", new { }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // POST /api/admin/users/{id}/activate - Activate บัญชี
    public async Task ActivateUserAsync(int id, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var response = await http.PostAsJsonAsync($"api/admin/users/{id}/activate", new { }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // GET /api/admin/transfer-requests - รายการคำขอย้ายหน่วยงาน
    public async Task<List<TransferRequestDto>> GetTransferRequestsAsync(
        string? status = null,
        string? userId = null,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();

        var queryParams = new List<string>();
        if (!string.IsNullOrWhiteSpace(status))
            queryParams.Add($"status={Uri.EscapeDataString(status)}");
        if (!string.IsNullOrWhiteSpace(userId))
            queryParams.Add($"userId={Uri.EscapeDataString(userId)}");

        var url = "api/admin/transfer-requests";
        if (queryParams.Any())
            url += "?" + string.Join("&", queryParams);

        var response = await http.GetAsync(url, ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<List<TransferRequestDto>>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    // POST /api/admin/users/{id}/transfer-requests - สร้างคำขอย้ายหน่วยงาน
    public async Task CreateTransferRequestAsync(
        int userId,
        int toOrgId,
        string? reason,
        DateOnly? effectiveDate = null,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync($"api/admin/users/{userId}/transfer-requests", new
        {
            toOrgId,
            reason,
            effectiveDate
        }, JsonOptions, ct);

        await ReadEnvelopeAsync<object>(response, ct);
    }

    // POST /api/admin/transfer-requests/{id}/approve
    public async Task ApproveTransferRequestAsync(int transferRequestId, string? note, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync($"api/admin/transfer-requests/{transferRequestId}/approve", new
        {
            note
        }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // POST /api/admin/transfer-requests/{id}/reject
    public async Task RejectTransferRequestAsync(int transferRequestId, string? note, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync($"api/admin/transfer-requests/{transferRequestId}/reject", new
        {
            note
        }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // GET /api/admin/apps - รายการระบบ (function groups)
    public async Task<List<AppDto>> GetAppsAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync("api/admin/apps", ct);
        return await ReadEnvelopeAsync<List<AppDto>>(response, ct);
    }

    // GET /api/admin/permissions - รายการ permission
    public async Task<List<PermissionDto>> GetPermissionsAsync(int? appId = null, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var url = appId.HasValue ? $"api/admin/permissions?appId={Uri.EscapeDataString(appId.Value.ToString())}" : "api/admin/permissions";
        var response = await http.GetAsync(url, ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<List<PermissionDto>>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    // GET /api/admin/roles — รายการ roles พร้อม permission IDs
    public async Task<List<RoleWithPermissionsDto>> GetRolesAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync("api/admin/roles", ct);
        return await ReadEnvelopeAsync<List<RoleWithPermissionsDto>>(response, ct);
    }

    // GET /api/admin/permissions/menu-tree — ต้นไม้ Main/Sub สำหรับ matrix
    public async Task<MenuPermissionTreeResult> GetMenuPermissionTreeAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync("api/admin/permissions/menu-tree", ct);
        return await ReadEnvelopeAsync<MenuPermissionTreeResult>(response, ct);
    }

    // PUT /api/admin/roles/{roleId}/permissions — อัปเดต permission set ของ role
    public async Task SetRolePermissionsAsync(
        int roleId,
        IEnumerable<int> permissionIds,
        IEnumerable<int>? moduleIds = null,
        bool viewOnly = true,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PutAsJsonAsync($"api/admin/roles/{roleId}/permissions", new
        {
            permissionIds = permissionIds.ToList(),
            moduleIds = moduleIds?.ToList(),
            viewOnly
        }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // POST /api/admin/roles — สร้าง role ใหม่
    public async Task<RoleWithPermissionsDto> CreateRoleAsync(string code, string name, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync("api/admin/roles", new { code, name }, JsonOptions, ct);
        return await ReadEnvelopeAsync<RoleWithPermissionsDto>(response, ct);
    }

    // POST /api/admin/users/{id}/assign-admin - แต่งตั้ง admin
    public async Task AssignAdminAsync(int userId, int orgId, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync($"api/admin/users/{userId}/assign-admin", new
        {
            orgId
        }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // POST /api/admin/apps/{appId}/users/{userId}/permissions - ตั้งสิทธิ์รายผู้ใช้ในแอป
    public async Task SetUserAppPermissionsAsync(
        int appId,
        int userId,
        IEnumerable<PermissionAssignmentDto> permissions,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync($"api/admin/apps/{appId}/users/{userId}/permissions", new
        {
            permissions = permissions.Select(x => new
            {
                permissionId = x.PermissionId,
                grantType = x.GrantType
            }).ToList()
        }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // GET /api/admin/users/{userId}/groups — กลุ่มทั้งหมดของ user
    public async Task<List<UserGroupDto>> GetUserGroupsAsync(int userId, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync($"api/admin/users/{userId}/groups", ct);
        return await ReadEnvelopeAsync<List<UserGroupDto>>(response, ct);
    }

    // POST /api/admin/users/{userId}/assign-group — เพิ่ม user เข้ากลุ่ม
    public async Task AssignGroupAsync(int userId, int groupId, int orgId, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync($"api/admin/users/{userId}/assign-group",
            new { groupId, orgId }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // DELETE /api/admin/users/{userId}/groups/{authId} — ลบ user ออกจากกลุ่ม
    public async Task RemoveUserGroupAsync(int userId, int authId, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.DeleteAsync($"api/admin/users/{userId}/groups/{authId}", ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // GET /api/users/registrations/status/{trackingId} - Public tracking
    public async Task<RegistrationStatusDto> GetRegistrationStatusAsync(string trackingId, CancellationToken ct = default)
    {
        var response = await http.GetAsync($"api/users/registrations/status/{Uri.EscapeDataString(trackingId)}", ct);
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<RegistrationStatusDto>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    // POST /api/auth/password-reset/request - ขอ reset link
    public async Task RequestPasswordResetAsync(PasswordResetRequest request, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/auth/password-reset/request", request, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    // POST /api/auth/password-reset/confirm - ยืนยัน reset token + ตั้งรหัสใหม่
    public async Task ConfirmPasswordResetAsync(PasswordResetConfirmRequest request, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/auth/password-reset/confirm", request, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    private static async Task<T> ReadEnvelopeAsync<T>(HttpResponseMessage response, CancellationToken ct)
    {
        var raw = await response.Content.ReadAsStringAsync(ct);
        if (string.IsNullOrWhiteSpace(raw))
            throw new InvalidOperationException(
                $"API returned empty body (HTTP {(int)response.StatusCode}). ตรวจสอบว่า ecmis-admin รันอยู่และ route ถูกต้อง");

        ApiEnvelope<T>? envelope;
        try
        {
            envelope = JsonSerializer.Deserialize<ApiEnvelope<T>>(raw, JsonOptions);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                $"API response ไม่ใช่ JSON (HTTP {(int)response.StatusCode}): {raw.AsSpan(0, Math.Min(120, raw.Length))}…", ex);
        }

        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }
}

// DTOs
public record RegistrationApplicationDetailDto(
    string? Bureau = null,
    string? Division = null,
    string? SubDivision = null,
    string? OfficerType = null,
    string? JobTitle = null,
    string? FirstNameEn = null,
    string? LastNameEn = null);

public record RegistrationDto(
    int Id,
    string Username,
    string Email,
    string AccountStatus,
    DateTimeOffset CreatedAt,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string TrackingId,
    string ApprovalStatus,
    string ItNote,
    string ItReviewedBy,
    DateTimeOffset? ItReviewedAt,
    string AdminNote,
    string RejectReason,
    string AdminApprovedBy,
    DateTimeOffset? AdminApprovedAt,
    int? TargetOrgId = null,
    string TargetOrgNameTh = "",
    string PositionName = "",
    int[]? RequestedSystemIds = null,
    List<RegistrationAssignedGroupDto>? AssignedGroups = null,
    RegistrationApplicationDetailDto? ApplicationDetail = null);

public record AssignableGroupDto(int Id, string Code, string NameTh, bool IsActive);

public record RegistrationAssignedGroupDto(
    int GroupId,
    string GroupCode,
    string GroupName,
    string OrgName);

public record UserDto(
    int Id,
    string Username,
    string Email,
    string AccountStatus,
    string UserType,
    DateTimeOffset? LastLoginAt,
    DateTimeOffset? CreatedAt,
    string FirstName,
    string LastName,
    string[]? Roles = null,
    [property: JsonPropertyName("deptName")] string OrgName = "",
    string PositionName = "",
    string[]? Systems = null);

public record UserReportDto(
    string Username,
    string Email,
    string AccountStatus,
    string UserType,
    DateTimeOffset? CreatedAt,
    DateTimeOffset? LastLoginAt,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string Roles,
    string Orgs);

public record LoginHistoryReportDto(
    int? UserId,
    string Username,
    DateTimeOffset? LoginAt);

public record AuditReportDto(
    int Id,
    int? UserId,
    string Username,
    string Action,
    DateTimeOffset? CreatedAt);

public record TransferRequestDto(
    int Id,
    int UserId,
    string Username,
    int FromOrgId,
    string FromOrgName,
    int ToOrgId,
    string ToOrgName,
    string AssignmentType,
    string Reason,
    DateOnly? EffectiveDate,
    string Status,
    DateTimeOffset RequestedAt,
    DateTimeOffset? ReviewedAt,
    string ReviewNote,
    int RequestedBy,
    string RequestedByUsername,
    int? ReviewedBy,
    string ReviewedByUsername);

public record AppDto(
    int Id,
    string Code,
    string NameTh,
    int SortOrder);

public record PermissionDto(
    int Id,
    int? AppId,
    string Code,
    string Resource,
    string Action,
    string Description);

public record PermissionAssignmentDto(
    int PermissionId,
    string GrantType = "grant");

public record UserGroupDto(
    int AuthId,
    int GroupId,
    string GroupCode,
    string GroupName,
    string GroupType,
    int? OrgId,
    string OrgName,
    bool IsDefault,
    DateTime AssignedAt);

public record ResetPasswordResult(
    string Message,
    string TemporaryPassword);

public sealed class PasswordResetRequest
{
    public string Email { get; set; } = "";
    public string Username { get; set; } = "";
}

public sealed class PasswordResetConfirmRequest
{
    public string Email { get; set; } = "";
    public string Token { get; set; } = "";
    public string NewPassword { get; set; } = "";
    public string ConfirmPassword { get; set; } = "";
}

public record RegistrationStatusDto(
    string TrackingId,
    string Status,
    string ItNote,
    string ProvisionedBy,
    DateTimeOffset? ProvisionedAt,
    string AdminNote,
    string RejectReason,
    string ReviewedBy,
    DateTimeOffset? ReviewedAt,
    DateTimeOffset? SubmittedAt,
    string Username,
    string Email,
    string AccountStatus,
    string FirstName,
    string LastName);

public sealed class UserDetailDto
{
    public UserDetailInfo User { get; set; } = new();
    public List<UserDetailAssignmentDto> Assignments { get; set; } = new();
    public List<UserDetailRoleDto> Roles { get; set; } = new();
    public List<UserDetailSystemDto> Systems { get; set; } = new();
    public List<UserAuditEntryDto> RecentAudits { get; set; } = new();
}

public sealed class UserDetailAssignmentDto
{
    public int AssignmentId { get; set; }
    public int? DeptId { get; set; }
    public string DeptCode { get; set; } = "";
    public string DeptName { get; set; } = "";
    public int? PositionId { get; set; }
    public string PositionCode { get; set; } = "";
    public string PositionName { get; set; } = "";
    public DateTimeOffset? CreatedAt { get; set; }
}

public sealed class UserDetailInfo
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string EmailMain { get; set; } = "";
    public string EmailBackup { get; set; } = "";
    public string AccountStatus { get; set; } = "";
    public string UserType { get; set; } = "";
    public DateTimeOffset? LastLoginAt { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public bool ForcePasswordChange { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    [JsonPropertyName("deptName")]
    public string OrgName { get; set; } = "";
    [JsonPropertyName("deptId")]
    public int? OrgId { get; set; }
    public string PositionName { get; set; } = "";
}

public sealed class UserDetailRoleDto
{
    public int RoleId { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string GroupType { get; set; } = "";
    [JsonPropertyName("groupDeptId")]
    public int? GroupDeptId { get; set; }
    public string OrgName { get; set; } = "";
    public int MenuPermCount { get; set; }
    public DateTimeOffset? AssignedAt { get; set; }
}

public sealed class UserDetailSystemDto
{
    public int AccessId { get; set; }
    public int SystemId { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Color { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset ReviewedAt { get; set; }
    public string ReviewNote { get; set; } = "";
    public DateTimeOffset? EffectiveUntil { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string RevokedReason { get; set; } = "";
}

public sealed class UserAuditEntryDto
{
    public int Id { get; set; }
    public string Action { get; set; } = "";
    public string TargetTable { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public string Metadata { get; set; } = "";
    public string ActorUsername { get; set; } = "";
}

public sealed class RoleWithPermissionsDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public List<int> PermissionIds { get; set; } = new();
}

public sealed class MenuPermissionTreeResult
{
    public MenuPermissionGlossary Glossary { get; set; } = new();
    public List<MenuPermissionModuleDto> Modules { get; set; } = new();
    public List<MenuPermissionLeafDto> StandalonePermissions { get; set; } = new();
}

public sealed class MenuPermissionGlossary
{
    public string MainMenu { get; set; } = "";
    public string SubMenu { get; set; } = "";
    public string FunctionGroup { get; set; } = "";
    public string Mapping { get; set; } = "";
    public string Authorization { get; set; } = "";
}

public sealed class MenuPermissionModuleDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public int Sort { get; set; }
    public string Layer { get; set; } = "";
    public string Table { get; set; } = "";
    public string Hint { get; set; } = "";
    public List<MenuPermissionLeafDto> Children { get; set; } = new();
}

public sealed class MenuPermissionLeafDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string Path { get; set; } = "";
    public int Sort { get; set; }
    public bool IsMenu { get; set; }
    public string Layer { get; set; } = "";
    public string Table { get; set; } = "";
    public string Hint { get; set; } = "";
    public string GrantAction { get; set; } = "";
}

public sealed class SecurityAlertDto
{
    public int Id { get; set; }
    public string Severity { get; set; } = "";
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public string AlertType { get; set; } = "";
    public int? RelatedUserId { get; set; }
    public string RelatedUsername { get; set; } = "";
    public string Status { get; set; } = "";
    public int? ResolvedBy { get; set; }
    public string ResolvedUsername { get; set; } = "";
    public DateTimeOffset? ResolvedAt { get; set; }
    public string Metadata { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class LogCategoryDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = "";
    public string NameTh { get; set; } = "";
    public string Description { get; set; } = "";
    public string Color { get; set; } = "#64748b";
    public List<string> ActionPatterns { get; set; } = new();
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class CategoryCountDto
{
    public string Category { get; set; } = "";
    public long Count { get; set; }
}

public sealed class ClassifyResultDto
{
    public int Classified { get; set; }
}

public sealed class FunctionGroupMemberDto
{
    public int AuthId { get; set; }
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

public sealed class OrgAdminDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string AccountStatus { get; set; } = "";
    public string RoleCode { get; set; } = "";
    public string RoleName { get; set; } = "";
    public int? OrgId { get; set; }
    public string OrgName { get; set; } = "";
    public DateTimeOffset? AssignedAt { get; set; }
}
