using Xunit;
using EcmisWeb.Data;
using EcmisWeb.Models;
using EcmisWeb.Services;

namespace EcmisWeb.Tests;

public class SnapshotTests
{
    private static StatsSnapshot Snap(StatsFilter? f = null)
        => new SeedComplaintStatsService().GetSnapshotAsync(f ?? StatsFilter.Default).Result;

    [Fact]
    public void Kpi_unfiltered_matches_book()
    {
        var k = Snap().Kpi;
        Assert.Equal(560, k.ReceivedThisYear);
        Assert.Equal(42510, k.Accumulated);
        Assert.Equal(163, k.M62);
        Assert.Equal(394, k.M18_4_2);
    }

    [Fact]
    public void YearlyTrend_has_all_years_and_total()
    {
        var t = Snap().YearlyTrend;
        Assert.Equal(19, t.Bars.Count);
        Assert.Equal(42510, t.Bars.Sum(b => b.Count));
    }

    [Fact]
    public void Quarters_aggregate_months()
    {
        var m = Snap().Monthly;
        Assert.Equal(560, m.ByQuarter.Sum(q => q.Count));
    }

    [Fact]
    public void Channels_top5_excludes_zero_and_has_five()
    {
        var c = Snap().Channels;
        Assert.Equal(5, c.Top5Labels.Count);
        Assert.Contains("สนง.ปปช./ปปจ. (ม.62)", c.Top5Labels);
    }

    [Fact]
    public void Zones_grouped_into_regions_sum_to_total()
    {
        var z = Snap().Zones;
        Assert.Equal(560, z.ByRegion.Sum(r => r.Count));
        Assert.Contains(z.ByRegion, r => r.Label == "ส่วนกลาง");
    }

    [Fact]
    public void TopProvinces_sorted_and_bangkok_first()
    {
        var p = Snap().TopProvinces;
        Assert.Equal("กรุงเทพมหานคร", p[0].Label);
        Assert.Equal(143, p[0].Count);
    }

    [Fact]
    public void Filter_by_type_reduces_rows()
    {
        var snap = Snap(StatsFilter.Default with { Type = LegalType.M62 });
        Assert.Equal(163, snap.Rows.Count);
        Assert.All(snap.Rows, r => Assert.Equal(LegalType.M62, r.Type));
    }

    [Fact]
    public void Filter_by_zone_reduces_rows()
    {
        var snap = Snap(StatsFilter.Default with { Zone = Zone.Pt4 });
        Assert.Equal(55, snap.Rows.Count);
    }

    [Fact]
    public void Calendar_mode_2569_excludes_oct_nov_2568()
    {
        var snap = Snap(new StatsFilter(YearMode.Calendar, 2569));
        Assert.Empty(snap.Rows);
    }

    [Fact]
    public void Fiscal_mode_2569_includes_oct_nov_2568()
    {
        var snap = Snap(new StatsFilter(YearMode.Fiscal, 2569));
        Assert.Equal(560, snap.Rows.Count);
    }
}
