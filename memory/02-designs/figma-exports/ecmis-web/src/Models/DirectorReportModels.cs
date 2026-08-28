namespace EcmisWeb.Models;

public record ZoneCaseRow(string Zone, int[] Values);     // [m62done,m62remain,m184done,m184remain,totalDone,totalRemain]
public record YearCompare(int M62, int M184, int Total);
public record LabeledValue(string Label, long Value);

public record DirectorReportSnapshot(
    string ReportMonth,
    string AsOf,
    YearCompare Prev,
    YearCompare Cur,
    double YoYPercent,
    IReadOnlyList<ZoneCaseRow> Inquiry,
    int[] InquiryTotal,
    IReadOnlyList<ZoneCaseRow> Merit,
    int[] MeritTotal,
    IReadOnlyList<LabeledValue> PostResolution,
    IReadOnlyList<LabeledValue> CourtProgress,
    long BudgetTotal,
    long BudgetUsed,
    long BudgetRemain);
