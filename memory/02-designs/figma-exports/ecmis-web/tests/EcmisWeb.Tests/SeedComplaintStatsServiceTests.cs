using Xunit;
using EcmisWeb.Data;
using EcmisWeb.Models;
using EcmisWeb.Services;

namespace EcmisWeb.Tests;

public class SeedComplaintStatsServiceTests
{
    private static IReadOnlyList<StatRecord> Rows()
        => new SeedComplaintStatsService().DebugRows;

    [Fact]
    public void Generates_exactly_560_rows()
        => Assert.Equal(560, Rows().Count);

    [Fact]
    public void Monthly_totals_match_book()
    {
        var rows = Rows();
        Assert.Equal(250, rows.Count(r => r.ReceivedAt.Month == 10));
        Assert.Equal(310, rows.Count(r => r.ReceivedAt.Month == 11));
    }

    [Fact]
    public void LegalType_marginals_match_book()
    {
        var rows = Rows();
        Assert.Equal(163, rows.Count(r => r.Type == LegalType.M62));
        Assert.Equal(394, rows.Count(r => r.Type == LegalType.M18_4_2));
        Assert.Equal(3, rows.Count(r => r.Type == LegalType.Other));
    }

    [Fact]
    public void Zone_counts_sum_to_total()
        => Assert.Equal(560, Rows().Sum(_ => 1));

    [Fact]
    public void Each_zone_count_matches_book()
    {
        var rows = Rows();
        // กอท. carries the +1 "ออกเลขเพิ่ม" row that has no zone in the book
        foreach (var (zone, expected) in ComplaintStatsData.ZoneTotals)
        {
            var allowed = zone == Zone.Kot ? expected + 1 : expected;
            Assert.Equal(allowed, rows.Count(r => r.Zone == zone));
        }
    }

    [Fact]
    public void Channel_marginals_match_book()
    {
        var rows = Rows();
        for (var i = 0; i < ComplaintStatsData.ChannelTotals.Length; i++)
            Assert.Equal(ComplaintStatsData.ChannelTotals[i].Total,
                         rows.Count(r => r.ChannelIndex == i));
    }

    [Fact]
    public void Province_named_rows_match_constant()
    {
        var expected = Math.Min(ComplaintStatsData.ProvinceTotals.Sum(p => p.Count), 560);
        var named = Rows().Count(r => r.Province != "ไม่ระบุพื้นที่");
        Assert.Equal(expected, named);
    }

    [Fact]
    public void Generation_is_deterministic()
    {
        var a = new SeedComplaintStatsService().DebugRows;
        var b = new SeedComplaintStatsService().DebugRows;
        Assert.Equal(a, b);
    }

    [Fact]
    public void Behavior_marginals_match_book()
    {
        var rows = Rows();
        foreach (var (behavior, expected) in ComplaintStatsData.BehaviorTotals)
            Assert.Equal(expected, rows.Count(r => r.Behavior == behavior));
    }

    [Fact]
    public void Routing_marginals_match_book()
    {
        var rows = Rows();
        foreach (var (action, expected) in ComplaintStatsData.RoutingTotals)
            Assert.Equal(expected, rows.Count(r => r.Routing == action));
    }
}
