using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using EcmisWeb.Data;
using Microsoft.AspNetCore.Components.Forms;

namespace EcmisWeb.Services;

public sealed class ComplaintApiService(HttpClient http)
{
    private static readonly TimeSpan ComplaintCacheTtl = TimeSpan.FromSeconds(20);
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    private IReadOnlyList<ComplaintRow>? cachedComplaints;
    private DateTime cachedComplaintsAt;
    private Task<IReadOnlyList<ComplaintRow>>? complaintsInFlight;

    public Task WarmupComplaintsAsync()
        => EnsureComplaintsLoadedAsync(forceRefresh: false);

    public async Task<IReadOnlyList<ComplaintRow>> GetComplaintsAsync(CancellationToken ct = default)
        => await EnsureComplaintsLoadedAsync(forceRefresh: false, ct);

    public async Task<IReadOnlyList<ComplaintRow>> RefreshComplaintsAsync(CancellationToken ct = default)
        => await EnsureComplaintsLoadedAsync(forceRefresh: true, ct);

    private Task<IReadOnlyList<ComplaintRow>> EnsureComplaintsLoadedAsync(
        bool forceRefresh,
        CancellationToken ct = default)
    {
        if (!forceRefresh
            && cachedComplaints is not null
            && DateTime.UtcNow - cachedComplaintsAt < ComplaintCacheTtl)
        {
            return Task.FromResult(cachedComplaints);
        }

        if (!forceRefresh && complaintsInFlight is not null)
        {
            return complaintsInFlight;
        }

        complaintsInFlight = LoadComplaintsFromApiAsync(ct);
        return complaintsInFlight;
    }

    private async Task<IReadOnlyList<ComplaintRow>> LoadComplaintsFromApiAsync(CancellationToken ct)
    {
        try
        {
            var envelope = await GetEnvelopeAsync<PagedResult<ComplaintResponse>>(
                "api/complaints?page=1&pageSize=50",
                ct);

            cachedComplaints = envelope.Data?.Items.Select(ToRow).ToList() ?? [];
            cachedComplaintsAt = DateTime.UtcNow;
            return cachedComplaints;
        }
        finally
        {
            complaintsInFlight = null;
        }
    }

    public async Task<ComplaintRow?> GetComplaintByIdAsync(long id, CancellationToken ct = default)
    {
        var envelope = await GetEnvelopeAsync<ComplaintResponse>($"api/complaints/{id}", ct);
        return envelope.Data is null ? null : ToRow(envelope.Data);
    }

    public async Task<IReadOnlyList<TimelineItem>> GetTimelineAsync(long id, CancellationToken ct = default)
    {
        var envelope = await GetEnvelopeAsync<List<TimelineItem>>($"api/complaints/{id}/timeline", ct);
        return envelope.Data ?? [];
    }

    public async Task<IReadOnlyList<AvailableAction>> GetAvailableActionsAsync(long id, CancellationToken ct = default)
    {
        var envelope = await GetEnvelopeAsync<List<AvailableAction>>($"api/complaints/{id}/available-actions", ct);
        return envelope.Data ?? [];
    }

    public async Task<PublicTrackingResponse?> GetPublicTrackingAsync(string trackNo, CancellationToken ct = default)
    {
        var encodedTrackNo = Uri.EscapeDataString(trackNo.Trim());
        var envelope = await GetEnvelopeAsync<PublicTrackingResponse>($"api/public/complaints/track?trackNo={encodedTrackNo}", ct);
        return envelope.Data;
    }

    public async Task<ComplaintRow> CreateComplaintAsync(CreateComplaintRequest request, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync("api/complaints", request, JsonOptions, ct);
        var envelope = await ReadEnvelopeAsync<ComplaintResponse>(response, ct);

        if (envelope.Data is null)
        {
            throw new InvalidOperationException("API did not return created complaint data.");
        }

        return ToRow(envelope.Data);
    }

    public async Task UploadComplaintDocumentsAsync(long id, IEnumerable<IBrowserFile> files, CancellationToken ct = default)
    {
        using var content = new MultipartFormDataContent();

        foreach (var file in files)
        {
            var fileContent = new StreamContent(file.OpenReadStream(50L * 1024 * 1024, ct));
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(
                string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType);
            content.Add(fileContent, "files", file.Name);
        }

        var response = await http.PostAsync($"api/complaints/{id}/documents", content, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    public async Task<ComplaintRow> RouteAsync(long id, RoutingRequest request, CancellationToken ct = default)
    {
        var response = await http.PatchAsJsonAsync($"api/complaints/{id}/route", request, JsonOptions, ct);
        var envelope = await ReadEnvelopeAsync<ComplaintResponse>(response, ct);

        if (envelope.Data is null)
        {
            throw new InvalidOperationException("API did not return routed complaint data.");
        }

        return ToRow(envelope.Data);
    }

    public async Task ExecuteActionAsync(long id, string action, ComplaintActionInput? input = null, CancellationToken ct = default)
    {
        input ??= new ComplaintActionInput();
        string endpoint;
        object payload;

        switch (action)
        {
            case "create_pcms":
                endpoint = $"api/complaints/{id}/pcms";
                payload = new
                {
                    receiveDate = input.ReceiveDate,
                    assignedUnitId = input.AssignedUnitId,
                    assignedOfficerId = input.AssignedOfficerId,
                    note = input.Note
                };
                break;
            case "create_investigation":
                endpoint = $"api/complaints/{id}/investigations";
                payload = new
                {
                    assignedOfficerId = input.AssignedOfficerId,
                    assignedOfficerName = input.AssignedOfficerName,
                    dueDate = input.DueDate,
                    note = input.Note
                };
                break;
            case "create_assignment":
                endpoint = $"api/complaints/{id}/assignments";
                payload = new
                {
                    assignedToOfficerId = input.AssignedOfficerId,
                    assignedToOfficerName = input.AssignedOfficerName,
                    assignedToUnitId = input.AssignedUnitId,
                    dueDate = input.DueDate,
                    note = input.Note
                };
                break;
            case "create_hardship_review":
                endpoint = $"api/complaints/{id}/hardship-review";
                payload = new
                {
                    hardshipFound = input.HardshipFound,
                    hardshipDetail = input.HardshipDetail,
                    recommendedRelief = input.RecommendedRelief,
                    reviewedByOfficerId = input.AssignedOfficerId,
                    reviewedByOfficerName = input.AssignedOfficerName,
                    legalBasis = input.LegalBasis
                };
                break;
            case "create_external_forwarding":
                endpoint = $"api/complaints/{id}/external-forwardings";
                payload = new
                {
                    targetAgencyName = input.TargetAgencyName,
                    targetAgencyCode = input.TargetAgencyCode,
                    reason = input.Reason,
                    legalBasis = input.LegalBasis,
                    referenceNo = input.ReferenceNo,
                    note = input.Note
                };
                break;
            case "return_to_nacc":
                endpoint = $"api/complaints/{id}/return-to-nacc";
                payload = new
                {
                    returnReason = input.Reason,
                    legalBasis = input.LegalBasis,
                    naccReferenceNo = input.ReferenceNo,
                    note = input.Note
                };
                break;
            case "create_closure":
                endpoint = $"api/complaints/{id}/closure-decision";
                payload = new
                {
                    closureReason = input.Reason,
                    closureType = input.ClosureType,
                    outcomeSummary = input.OutcomeSummary,
                    legalBasis = input.LegalBasis
                };
                break;
            default:
                throw new NotSupportedException($"Unsupported action: {action}");
        }

        var response = await http.PostAsJsonAsync(endpoint, payload, JsonOptions, ct);
        await ReadEnvelopeAsync<object>(response, ct);
    }

    private async Task<ApiEnvelope<T>> GetEnvelopeAsync<T>(string url, CancellationToken ct)
    {
        var response = await http.GetAsync(url, ct);
        return await ReadEnvelopeAsync<T>(response, ct);
    }

    private static async Task<ApiEnvelope<T>> ReadEnvelopeAsync<T>(HttpResponseMessage response, CancellationToken ct)
    {
        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<T>>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode || envelope?.Success != true)
        {
            var message = envelope?.Error ?? envelope?.Message ?? $"API request failed: {(int)response.StatusCode}";
            throw new InvalidOperationException(message);
        }

        return envelope;
    }

    private static ComplaintRow ToRow(ComplaintResponse item)
    {
        var status = ToStatusKey(item.Status);
        var category = ToCategoryLabel(item.Category);
        var routingStatus = ToRoutingStatus(item.RoutingDecision);
        var receivedAt = item.FirstReceivedDate == default
            ? item.CreatedAt
            : item.FirstReceivedDate;

        return new ComplaintRow(
            Id: checked((int)item.Id),
            No: checked((int)item.Id),
            CaseNo: string.IsNullOrWhiteSpace(item.CaseNo) ? item.Id.ToString() : item.CaseNo,
            TrackNo: item.TrackNo,
            ReceivedAt: ToThaiDateTime(receivedAt),
            StatusText: ToStatusText(item.Status, item.RoutingDecision),
            Unit: item.RoutedToUnit ?? "สำนักรับเรื่อง",
            Channel: item.Channel,
            Status: status,
            Complainant: item.Anonymous ? "ไม่เปิดเผยตัวตน" : item.ComplainantName ?? "-",
            Accused: item.AccusedName ?? "-",
            AccusedAgency: item.AccusedAgency ?? "-",
            Category: category,
            RoutingStatus: routingStatus,
            Province: item.Province ?? "-",
            Description: item.Description,
            Priority: item.Priority?.ToLowerInvariant() switch
            {
                "high" => "high",
                "low" => "low",
                _ => "medium"
            },
            DaysRemaining: item.DaysUntilRoutingDeadline
        );
    }

    private static string ToThaiDateTime(DateTime value)
    {
        var local = value.Kind == DateTimeKind.Utc ? value.ToLocalTime() : value;
        return $"{local:dd/MM}/{local.Year + 543:0000} {local:HH:mm:ss}";
    }

    private static string ToStatusKey(string status) => status switch
    {
        "Active" => "active",
        "Review" => "review",
        "Transfer" => "transfer",
        "Discipline" => "discipline",
        "Closed" => "closed",
        "ExpiredWarning" => "expired_warning",
        _ => "pending"
    };

    private static string ToCategoryLabel(string category) => category switch
    {
        "Distress" => "ม.58/2",
        "ReturnPacc" => "ส่งคืน ป.ป.ช.",
        "DisciplineInternal" => "วินัยภายใน",
        _ => "ม.18/4"
    };

    private static string ToRoutingStatus(string routingDecision) => routingDecision switch
    {
        "Accept" => "routed",
        "ReturnToOmbudsman" => "returned",
        "SendToDiscipline" => "discipline",
        _ => "pending"
    };

    private static string ToStatusText(string status, string routingDecision) => routingDecision switch
    {
        "Accept" => "รับดำเนินการและมอบหมายแล้ว",
        "ReturnToOmbudsman" => "ส่งคืน ป.ป.ช.",
        "SendToDiscipline" => "ส่ง สพท. วินัย",
        _ => status switch
        {
            "Active" => "อยู่ระหว่างดำเนินการ",
            "Review" => "รอพิจารณา",
            "Closed" => "ดำเนินการแล้ว",
            "Transfer" => "ส่งต่อ/ส่งคืน",
            "Discipline" => "ส่ง สพท. วินัย",
            "ExpiredWarning" => "อายุความใกล้หมด",
            _ => "รอดำเนินการ"
        }
    };
}

public sealed record CreateComplaintRequest
{
    public string Channel { get; init; } = string.Empty;
    public string? SourceDetail { get; init; }
    public bool Anonymous { get; init; }
    public string? CitizenId { get; init; }
    public string? ComplainantPrefix { get; init; }
    public string? ComplainantFirstName { get; init; }
    public string? ComplainantLastName { get; init; }
    public string? ComplainantEmail { get; init; }
    public string? ComplainantPhone { get; init; }
    public string? ComplainantNetwork { get; init; }
    public string? AccusedPrefix { get; init; }
    public string? AccusedFirstName { get; init; }
    public string? AccusedLastName { get; init; }
    public string? AccusedAgency { get; init; }
    public string? AccusedPosition { get; init; }
    public string Description { get; init; } = string.Empty;
    public DateTime? IncidentDate { get; init; }
    public string? IncidentTime { get; init; }
    public string? Province { get; init; }
    public string? District { get; init; }
    public string? SubDistrict { get; init; }
    public string? Location { get; init; }
    public DateTime FirstReceivedDate { get; init; }
}

public sealed record RoutingRequest
{
    public string Decision { get; init; } = "Pending";
    public string? AssignedToUnit { get; init; }
    public string? AssignedToOfficer { get; init; }
    public string? ReturnReason { get; init; }
    public string? DisciplineUnit { get; init; }
}

public sealed class ComplaintActionInput
{
    public string Decision { get; set; } = "Accept";
    public DateTime ReceiveDate { get; set; } = DateTime.Today;
    public DateTime? DueDate { get; set; } = DateTime.Today.AddDays(60);
    public string AssignedUnitId { get; set; } = "unit-intake";
    public string AssignedOfficerId { get; set; } = "officer-001";
    public string AssignedOfficerName { get; set; } = "เจ้าหน้าที่รับผิดชอบ";
    public string TargetAgencyName { get; set; } = "หน่วยงานภายนอก";
    public string TargetAgencyCode { get; set; } = "EXT";
    public string Reason { get; set; } = "ดำเนินการตามผลการพิจารณา";
    public string LegalBasis { get; set; } = "ตามอำนาจหน้าที่";
    public string ReferenceNo { get; set; } = $"REF-{DateTime.Today:yyyyMMdd}";
    public string ClosureType { get; set; } = "ยุติเรื่อง";
    public string OutcomeSummary { get; set; } = "ยุติเรื่องตามผลการพิจารณา";
    public bool HardshipFound { get; set; } = true;
    public string HardshipDetail { get; set; } = "พบความเดือดร้อนจากข้อร้องเรียน";
    public string RecommendedRelief { get; set; } = "แจ้งหน่วยงานที่เกี่ยวข้องดำเนินการช่วยเหลือ";
    public string Note { get; set; } = "บันทึกจากหน้าเว็บ";
}

public sealed record TimelineItem
{
    public long Id { get; init; }
    public string? FromStatus { get; init; }
    public string ToStatus { get; init; } = string.Empty;
    public string ActionType { get; init; } = string.Empty;
    public string? ActionNote { get; init; }
    public string? PerformedByName { get; init; }
    public string? PerformedByRole { get; init; }
    public DateTime PerformedAt { get; init; }
}

public sealed record AvailableAction
{
    public string Action { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string Endpoint { get; init; } = string.Empty;
    public List<string> RequiresInput { get; init; } = [];
}

public sealed record PublicTrackingResponse
{
    public string TrackNo { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string StatusLabel { get; init; } = string.Empty;
    public DateTime FirstReceivedDate { get; init; }
    public string? RoutedToUnit { get; init; }
    public DateTime? LastUpdatedAt { get; init; }
}

internal sealed record ComplaintResponse
{
    public long Id { get; init; }
    public string CaseNo { get; init; } = string.Empty;
    public string TrackNo { get; init; } = string.Empty;
    public string Channel { get; init; } = string.Empty;
    public string? SourceDetail { get; init; }
    public bool Anonymous { get; init; }
    public string? ComplainantName { get; init; }
    public string? ComplainantEmail { get; init; }
    public string? ComplainantPhone { get; init; }
    public string? AccusedName { get; init; }
    public string? AccusedAgency { get; init; }
    public string? AccusedPosition { get; init; }
    public string Description { get; init; } = string.Empty;
    public DateTime? IncidentDate { get; init; }
    public string? Province { get; init; }
    public string Category { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string RoutingDecision { get; init; } = string.Empty;
    public string? Priority { get; init; }
    public DateTime FirstReceivedDate { get; init; }
    public DateTime? RoutingDeadline { get; init; }
    public int DaysUntilRoutingDeadline { get; init; }
    public string? RoutedToUnit { get; init; }
    public string? RoutedToOfficer { get; init; }
    public DateTime CreatedAt { get; init; }
    public int DocumentCount { get; init; }
}

internal sealed record ApiEnvelope<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }
    public string? Message { get; init; }
}

internal sealed record PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
}
