using Xunit;
using EcmisWeb.Services;

namespace EcmisWeb.Tests;

public class DirectorReportTests
{
    [Fact]
    public async Task Snapshot_carries_inquiry_totals()
    {
        var svc = new SeedDirectorReportService(new SeedComplaintStatsService());
        var snap = await svc.GetSnapshotAsync();
        Assert.Equal(15, snap.Inquiry.Count);
        Assert.Equal(1448, snap.InquiryTotal[4]);
        Assert.Equal("เมษายน 2569", snap.ReportMonth);
    }

    [Fact]
    public async Task Receiving_compare_uses_book_values()
    {
        var svc = new SeedDirectorReportService(new SeedComplaintStatsService());
        var snap = await svc.GetSnapshotAsync();
        Assert.Equal(1511, snap.Prev.Total);
        Assert.Equal(1635, snap.Cur.Total);
    }
}
