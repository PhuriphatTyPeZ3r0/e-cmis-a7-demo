using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Components.Forms;

namespace EcmisWeb.Services;

public sealed class CentralSupportApiService(HttpClient http, SessionService sessionService)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<SupportCenterDto> GetSupportCenterAsync(CancellationToken ct = default)
    {
        var response = await http.GetAsync("api/central-support/support-center", ct);
        return await ReadEnvelopeAsync<SupportCenterDto>(response, ct);
    }

    public async Task<List<PhonebookPersonDto>> SearchPhonebookAsync(string query, CancellationToken ct = default)
    {
        var response = await http.GetAsync($"api/central-support/phonebook?q={Uri.EscapeDataString(query)}", ct);
        return await ReadEnvelopeAsync<List<PhonebookPersonDto>>(response, ct);
    }

    public async Task<List<PublicNewsDto>> GetPublicNewsAsync(string category = "", string q = "", CancellationToken ct = default)
    {
        var response = await http.GetAsync($"api/central-support/public-news?category={Uri.EscapeDataString(category)}&q={Uri.EscapeDataString(q)}", ct);
        return await ReadEnvelopeAsync<List<PublicNewsDto>>(response, ct);
    }

    public async Task<PublicNewsDto> GetPublicNewsDetailAsync(int id, CancellationToken ct = default)
    {
        var response = await http.GetAsync($"api/central-support/public-news/{id}", ct);
        return await ReadEnvelopeAsync<PublicNewsDto>(response, ct);
    }

    public async Task<List<DigitalSignatureCertificateDto>> GetDigitalSignatureCertificatesAsync(
        string query = "",
        string status = "",
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync(
            $"api/central-support/digital-signatures?q={Uri.EscapeDataString(query)}&status={Uri.EscapeDataString(status)}", ct);
        return await ReadEnvelopeAsync<List<DigitalSignatureCertificateDto>>(response, ct);
    }

    public async Task<DigitalSignatureCertificateDetailDto> GetDigitalSignatureCertificateAsync(
        int id,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync($"api/central-support/digital-signatures/{id}", ct);
        return await ReadEnvelopeAsync<DigitalSignatureCertificateDetailDto>(response, ct);
    }

    public async Task<List<DigitalSignatureUserDto>> SearchDigitalSignatureUsersAsync(
        string query,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync($"api/central-support/digital-signatures/users?q={Uri.EscapeDataString(query)}", ct);
        return await ReadEnvelopeAsync<List<DigitalSignatureUserDto>>(response, ct);
    }

    public async Task<DigitalSignatureValidationResultDto> ValidateDigitalSignatureCertificateAsync(
        IBrowserFile file,
        int? ownerUserId,
        string password,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        using var content = BuildCertificateForm(file, ownerUserId, password, "");
        var response = await http.PostAsync("api/central-support/digital-signatures/validate", content, ct);
        return await ReadEnvelopeAsync<DigitalSignatureValidationResultDto>(response, ct);
    }

    public async Task<DigitalSignatureImportResultDto> ImportDigitalSignatureCertificateAsync(
        IBrowserFile file,
        int ownerUserId,
        string password,
        string note,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        using var content = BuildCertificateForm(file, ownerUserId, password, note);
        var response = await http.PostAsync("api/central-support/digital-signatures/import", content, ct);
        return await ReadEnvelopeAsync<DigitalSignatureImportResultDto>(response, ct);
    }

    public async Task<DigitalSignatureDisableResultDto> DisableDigitalSignatureCertificateAsync(
        int id,
        string reason,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync($"api/central-support/digital-signatures/{id}/disable", new { reason }, JsonOptions, ct);
        return await ReadEnvelopeAsync<DigitalSignatureDisableResultDto>(response, ct);
    }

    public async Task<DigitalSignatureSignResultDto> SignDigitalDocumentAsync(
        string documentRef,
        string documentName,
        string workflowCode,
        string note,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync("api/central-support/digital-signatures/sign", new
        {
            documentRef,
            documentName,
            workflowCode,
            note
        }, JsonOptions, ct);
        return await ReadEnvelopeAsync<DigitalSignatureSignResultDto>(response, ct);
    }

    public async Task<SubmitResultDto> CreateSupportTicketAsync(
        string title,
        string description,
        string requesterName,
        string requesterEmail,
        CancellationToken ct = default)
    {
        // ไม่บังคับ login — landing page แจ้งปัญหาได้แบบสาธารณะ
        if (await sessionService.GetAccessTokenAsync() is not null)
            await SetAuthHeaderAsync();

        var response = await http.PostAsJsonAsync("api/central-support/support-tickets", new
        {
            title,
            description,
            requesterName,
            requesterEmail
        }, JsonOptions, ct);
        return await ReadEnvelopeAsync<SubmitResultDto>(response, ct);
    }

    public async Task<SubmitResultDto> RequestPhonebookUpdateAsync(
        string contactName,
        string orgName,
        string phone,
        string email,
        string requestedChanges,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync("api/central-support/phonebook/update-requests", new
        {
            contactName,
            orgName,
            phone,
            email,
            requestedChanges
        }, JsonOptions, ct);
        return await ReadEnvelopeAsync<SubmitResultDto>(response, ct);
    }

    public async Task<List<PhonebookRequestDto>> GetPhonebookRequestsAsync(string statusFilter = "", CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync($"api/central-support/phonebook/update-requests?status={Uri.EscapeDataString(statusFilter)}", ct);
        return await ReadEnvelopeAsync<List<PhonebookRequestDto>>(response, ct);
    }

    public async Task<SubmitResultDto> ReviewPhonebookRequestAsync(
        int id,
        string status,
        string? adminNote,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PutAsJsonAsync($"api/central-support/phonebook/update-requests/{id}/review", new
        {
            status,
            adminNote
        }, JsonOptions, ct);
        return await ReadEnvelopeAsync<SubmitResultDto>(response, ct);
    }

    public async Task<List<SupportTicketDto>> GetSupportTicketsAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync("api/central-support/support-tickets", ct);
        return await ReadEnvelopeAsync<List<SupportTicketDto>>(response, ct);
    }

    public async Task<SupportTicketDetailDto> GetSupportTicketAsync(int id, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync($"api/central-support/support-tickets/{id}", ct);
        return await ReadEnvelopeAsync<SupportTicketDetailDto>(response, ct);
    }

    public async Task<SubmitResultDto> UpdateSupportTicketStatusAsync(
        int id,
        string status,
        string? resolution,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PutAsJsonAsync($"api/central-support/support-tickets/{id}/status", new
        {
            status,
            resolution
        }, JsonOptions, ct);
        return await ReadEnvelopeAsync<SubmitResultDto>(response, ct);
    }

    public async Task<List<NewsCategoryDto>> GetNewsCategoriesAsync(CancellationToken ct = default)
    {
        var response = await http.GetAsync("api/central-support/news-categories", ct);
        return await ReadEnvelopeAsync<List<NewsCategoryDto>>(response, ct);
    }

    public async Task<SubmitResultDto> CreateNewsCategoryAsync(string name, int sortOrder, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync("api/central-support/news-categories", new { name, sortOrder }, JsonOptions, ct);
        return await ReadEnvelopeAsync<SubmitResultDto>(response, ct);
    }

    public async Task<SubmitResultDto> UpdateNewsCategoryAsync(int id, string name, int sortOrder, bool isActive, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PutAsJsonAsync($"api/central-support/news-categories/{id}", new { name, sortOrder, isActive }, JsonOptions, ct);
        return await ReadEnvelopeAsync<SubmitResultDto>(response, ct);
    }

    public async Task<List<AdminAnnouncementDto>> GetAdminAnnouncementsAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync("api/central-support/admin/announcements", ct);
        return await ReadEnvelopeAsync<List<AdminAnnouncementDto>>(response, ct);
    }

    public async Task CreateAnnouncementAsync(string kind, string title, string body, string attachmentUrl, string videoUrl, bool publish, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync("api/central-support/admin/announcements", new { kind, title, body, attachmentUrl, videoUrl, publish }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    public async Task UpdateAnnouncementAsync(int id, string kind, string title, string body, string attachmentUrl, string videoUrl, bool publish, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PutAsJsonAsync($"api/central-support/admin/announcements/{id}", new { kind, title, body, attachmentUrl, videoUrl, publish }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    public async Task DeleteAnnouncementAsync(int id, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.DeleteAsync($"api/central-support/admin/announcements/{id}", ct);
        if (!response.IsSuccessStatusCode)
        {
            var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<object>>(JsonOptions, ct);
            throw new InvalidOperationException(envelope?.Error ?? envelope?.Message ?? "ลบประกาศไม่สำเร็จ");
        }
    }

    public async Task<List<AdminFaqDto>> GetAdminFaqsAsync(CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync("api/central-support/admin/faqs", ct);
        return await ReadEnvelopeAsync<List<AdminFaqDto>>(response, ct);
    }

    public async Task CreateFaqAsync(string category, string question, string answer, int sortOrder, bool isActive, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync("api/central-support/admin/faqs", new { category, question, answer, sortOrder, isActive }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    public async Task UpdateFaqAsync(int id, string category, string question, string answer, int sortOrder, bool isActive, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PutAsJsonAsync($"api/central-support/admin/faqs/{id}", new { category, question, answer, sortOrder, isActive }, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    public async Task DeleteFaqAsync(int id, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.DeleteAsync($"api/central-support/admin/faqs/{id}", ct);
        if (!response.IsSuccessStatusCode)
        {
            var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<object>>(JsonOptions, ct);
            throw new InvalidOperationException(envelope?.Error ?? envelope?.Message ?? "ลบ FAQ ไม่สำเร็จ");
        }
    }

    public async Task<List<AdminNewsDto>> GetAdminNewsAsync(string category = "", string status = "", string q = "", CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.GetAsync(
            $"api/central-support/admin/public-news?category={Uri.EscapeDataString(category)}&status={Uri.EscapeDataString(status)}&q={Uri.EscapeDataString(q)}", ct);
        return await ReadEnvelopeAsync<List<AdminNewsDto>>(response, ct);
    }

    public async Task<SubmitResultDto> UpdatePublicNewsAsync(
        int id,
        string category,
        string title,
        string summary,
        string body,
        string coverImageUrl,
        string attachmentUrl,
        bool publish,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PutAsJsonAsync($"api/central-support/public-news/{id}", new
        {
            category,
            title,
            summary,
            body,
            coverImageUrl,
            attachmentUrl,
            publish
        }, JsonOptions, ct);
        return await ReadEnvelopeAsync<SubmitResultDto>(response, ct);
    }

    public async Task DeletePublicNewsAsync(int id, CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.DeleteAsync($"api/central-support/public-news/{id}", ct);
        if (!response.IsSuccessStatusCode)
        {
            var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<object>>(JsonOptions, ct);
            throw new InvalidOperationException(envelope?.Error ?? envelope?.Message ?? "ลบข่าวไม่สำเร็จ");
        }
    }

    public async Task<SubmitResultDto> CreatePublicNewsAsync(
        string category,
        string title,
        string summary,
        string body,
        string coverImageUrl,
        string attachmentUrl,
        bool publish,
        CancellationToken ct = default)
    {
        await SetAuthHeaderAsync();
        var response = await http.PostAsJsonAsync("api/central-support/public-news", new
        {
            category,
            title,
            summary,
            body,
            coverImageUrl,
            attachmentUrl,
            publish
        }, JsonOptions, ct);
        return await ReadEnvelopeAsync<SubmitResultDto>(response, ct);
    }

    private async Task SetAuthHeaderAsync()
    {
        if (await sessionService.IsAccessTokenExpiringAsync())
            await sessionService.TryRefreshAsync(http);

        var token = await sessionService.GetAccessTokenAsync();
        var tokenType = await sessionService.GetTokenTypeAsync();

        if (!string.IsNullOrWhiteSpace(token))
            http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue(tokenType ?? "Bearer", token);
    }

    private static async Task<T> ReadEnvelopeAsync<T>(HttpResponseMessage response, CancellationToken ct)
    {
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<T>>(JsonOptions, ct);
        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope.Data;
    }

    private static MultipartFormDataContent BuildCertificateForm(
        IBrowserFile file,
        int? ownerUserId,
        string password,
        string note)
    {
        var content = new MultipartFormDataContent();
        var streamContent = new StreamContent(file.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024));
        streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(
            string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType);
        content.Add(streamContent, "file", file.Name);
        if (ownerUserId.HasValue)
            content.Add(new StringContent(ownerUserId.Value.ToString()), "ownerUserId");
        content.Add(new StringContent(password ?? ""), "password");
        content.Add(new StringContent(note ?? ""), "note");
        return content;
    }
}

// ── Admin Announcement / FAQ CRUD ─────────────────────────────────────────
// GetAdminAnnouncementsAsync, CreateAnnouncementAsync, UpdateAnnouncementAsync, DeleteAnnouncementAsync
// GetAdminFaqsAsync, CreateFaqAsync, UpdateFaqAsync, DeleteFaqAsync

public sealed record SupportCenterDto(
    List<CentralSupportAnnouncementDto> Announcements,
    List<CentralSupportFaqDto> Faqs);

public sealed record CentralSupportAnnouncementDto(
    int Id,
    string Kind,
    string Title,
    string Body,
    string AttachmentUrl,
    string VideoUrl,
    string Status,
    DateTimeOffset? PublishedAt,
    DateTimeOffset CreatedAt);

public sealed record AdminAnnouncementDto(
    int Id,
    string Kind,
    string Title,
    string Body,
    string AttachmentUrl,
    string VideoUrl,
    string Status,
    DateTimeOffset? PublishedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record AdminFaqDto(
    int Id,
    string Category,
    string Question,
    string Answer,
    int SortOrder,
    string Status,
    DateTimeOffset CreatedAt);

public sealed record CentralSupportFaqDto(
    int Id,
    string Category,
    string Question,
    string Answer,
    int SortOrder);

public sealed record PhonebookPersonDto(
    string DisplayName,
    string OrgName,
    string JobTitle,
    string Phone,
    string Email);

public sealed record PublicNewsDto(
    int Id,
    string Category,
    string Title,
    string Summary,
    string Body,
    string CoverImageUrl,
    string AttachmentUrl,
    string Status,
    DateTimeOffset? PublishedAt,
    DateTimeOffset CreatedAt);

public sealed record SubmitResultDto(
    int Id,
    string? TicketNo,
    string Status,
    DateTimeOffset CreatedAt);

public sealed record DigitalSignatureCertificateDto(
    int Id,
    string CertCode,
    int OwnerUserId,
    string OwnerName,
    string OrgName,
    string SubjectCn,
    string IssuerCn,
    string SerialNumber,
    string ThumbprintSha256,
    DateTimeOffset ValidFrom,
    DateTimeOffset ValidTo,
    string Status,
    bool PrivateKeyPresent,
    string PrivateKeyStorageStatus,
    DateTimeOffset ImportedAt,
    string DisplayStatus);

public sealed record DigitalSignatureUserDto(
    int Id,
    string DisplayName,
    string Email,
    string OrgName,
    string JobTitle,
    string ActiveCertCode,
    DateTimeOffset? ActiveCertValidTo);

public sealed record DigitalSignatureValidationOwnerDto(
    int UserId,
    string DisplayName,
    string Email,
    string OrgName,
    string JobTitle,
    string ActiveCertCode);

public sealed record DigitalSignatureCertificateMetadataDto(
    string SubjectCn,
    string SubjectName,
    string IssuerCn,
    string IssuerName,
    string SerialNumber,
    string ThumbprintSha256,
    DateTimeOffset ValidFrom,
    DateTimeOffset ValidTo,
    bool IsCurrentlyValid,
    bool PrivateKeyPresent,
    string PublicCertificatePem);

public sealed record DigitalSignatureValidationResultDto(
    DigitalSignatureCertificateMetadataDto Metadata,
    DigitalSignatureValidationOwnerDto? Owner,
    string OwnerMatch,
    string DuplicateCertCode,
    bool CanImport);

public sealed record DigitalSignatureImportResultDto(
    int Id,
    string CertCode,
    string Status,
    int? ReplacedCertificateId);

public sealed record DigitalSignatureDisableResultDto(
    int Id,
    string Status);

public sealed record DigitalSignatureSignResultDto(
    int Id,
    int CertificateId,
    string CertCode,
    string DocumentRef,
    string DocumentName,
    DateTimeOffset SignedAt);

public sealed record DigitalSignatureCertificateDetailDto(
    DigitalSignatureCertificateDto Certificate,
    List<DigitalSignatureAuditLogDto> Logs);

public sealed record DigitalSignatureAuditLogDto(
    string EventType,
    string ResultStatus,
    string Message,
    string ActorName,
    string IpAddress,
    DateTimeOffset CreatedAt);

public sealed record NewsCategoryDto(
    int Id,
    string Name,
    int SortOrder,
    bool IsActive);

public sealed record AdminNewsDto(
    int Id,
    string Category,
    string Title,
    string Summary,
    string Body,
    string CoverImageUrl,
    string AttachmentUrl,
    string Status,
    DateTimeOffset? PublishedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record PhonebookRequestDto(
    int Id,
    int? RequesterUserId,
    string ContactName,
    string OrgName,
    string Phone,
    string Email,
    string RequestedChanges,
    string Status,
    string AdminNote,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ReviewedAt);

public sealed record SupportTicketDto(
    int Id,
    string TicketNo,
    string RequesterName,
    string RequesterEmail,
    string Title,
    string Description,
    string Status,
    string AssignedTeam,
    string Resolution,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record SupportTicketDetailDto(
    int Id,
    string TicketNo,
    int? RequesterUserId,
    string RequesterName,
    string RequesterEmail,
    string Title,
    string Description,
    string Status,
    string AssignedTeam,
    string Resolution,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
