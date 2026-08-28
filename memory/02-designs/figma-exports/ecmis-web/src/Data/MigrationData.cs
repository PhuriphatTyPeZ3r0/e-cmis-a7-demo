namespace EcmisWeb.Data;

public record MigrationJob(
    string JobId,
    string SourceSystem,
    int TotalRecords,
    int ProcessedRecords,
    int ErrorRecords,
    string Status, // running, completed, pending, failed
    string StartedAt,
    string ETA
);

public record ValidationIssue(
    int Id,
    string SourceRecordId,
    string SuspectedDuplicateId,
    string AccusedName,
    string IssueType, // duplicate, missing_mandatory, format_error
    string ConfidenceScore
);

public record DataMaskIntance(
    string OriginalName,
    string MaskedName,
    string Status
);

public static class MigrationData
{
    private static readonly IReadOnlyList<MigrationJob> activeJobs =
    [
        new("JOB-2570-001", "Legacy Windows App (ไต่สวนเดิม)", 25400, 20350, 45, "running", "08:00 AM", "45 mins"),
        new("JOB-2570-002", "PCMS Web App (ร้องเรียนใหม่)", 12500, 12500, 12, "completed", "06:00 AM", "-"),
        new("JOB-2570-003", "e-Report", 2100, 0, 0, "pending", "-", "-")
    ];

    private static readonly IReadOnlyList<ValidationIssue> validationIssues =
    [
        new(1, "LEG-99120", "SN-2565-0101", "นายสมศักดิ์ รักชาติ", "duplicate", "98%"),
        new(2, "LEG-99211", "SN-2564-0012", "นางวิไล ใจดี", "duplicate", "95%"),
        new(3, "PCMS-4501", "-", "นายกิตติ ทุจริต", "missing_mandatory", "-")
    ];

    private static readonly IReadOnlyList<DataMaskIntance> maskLogs =
    [
        new("นายสมชาย มุ่งมั่น", "นายส******* ม******", "Success"),
        new("นางสาวสุดใจ บารมี", "น.ส.ส***** บ****", "Success"),
        new("นายวิชิต มาตรา", "นายวิ*** ม****", "Success")
    ];

    public static IReadOnlyList<MigrationJob> ActiveJobs => activeJobs;
    public static IReadOnlyList<ValidationIssue> ValidationIssues => validationIssues;
    public static IReadOnlyList<DataMaskIntance> MaskLogs => maskLogs;

    // Helper to calculate progress percentage
    public static int GetProgressPercentage(MigrationJob job)
    {
        if (job.TotalRecords == 0) return 0;
        return (int)Math.Round((double)job.ProcessedRecords / job.TotalRecords * 100);
    }
}
