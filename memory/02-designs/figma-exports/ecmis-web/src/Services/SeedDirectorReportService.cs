using EcmisWeb.Data;
using EcmisWeb.Models;

namespace EcmisWeb.Services;

public sealed class SeedDirectorReportService(IComplaintStatsService stats) : IDirectorReportService
{
    private readonly IComplaintStatsService _stats = stats;

    public Task<DirectorReportSnapshot> GetSnapshotAsync(CancellationToken ct = default)
    {
        var snap = new DirectorReportSnapshot(
            ReportMonth: DirectorReportData.ReportMonth,
            AsOf: DirectorReportData.AsOf,
            Prev: new YearCompare(DirectorReportData.Prev2568.M62, DirectorReportData.Prev2568.M184, DirectorReportData.Prev2568.Total),
            Cur:  new YearCompare(DirectorReportData.Cur2569.M62, DirectorReportData.Cur2569.M184, DirectorReportData.Cur2569.Total),
            YoYPercent: DirectorReportData.YoYPercent,
            Inquiry: DirectorReportData.Inquiry.Select(z => new ZoneCaseRow(z.Zone, z.V)).ToList(),
            InquiryTotal: DirectorReportData.InquiryTotal,
            Merit: DirectorReportData.Merit.Select(z => new ZoneCaseRow(z.Zone, z.V)).ToList(),
            MeritTotal: DirectorReportData.MeritTotal,
            PostResolution: DirectorReportData.PostResolution.Select(p => new LabeledValue(p.Label, p.Value)).ToList(),
            CourtProgress: DirectorReportData.CourtProgress.Select(p => new LabeledValue(p.Label, p.Value)).ToList(),
            BudgetTotal: DirectorReportData.BudgetTotal,
            BudgetUsed: DirectorReportData.BudgetUsed,
            BudgetRemain: DirectorReportData.BudgetRemain);
        return Task.FromResult(snap);
    }
}
