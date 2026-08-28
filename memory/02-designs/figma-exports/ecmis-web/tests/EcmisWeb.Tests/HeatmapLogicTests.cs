using Xunit;
using EcmisWeb.Data;
using EcmisWeb.Models;
using EcmisWeb.Pages.Analytics.Components;

namespace EcmisWeb.Tests;

public class HeatmapLogicTests
{
    [Fact]
    public void ProvinceZone_covers_76_provinces_all_zones_1_to_9()
    {
        Assert.Equal(76, HeatmapLogic.ProvinceZone.Count);
        Assert.All(HeatmapLogic.ProvinceZone.Values, z => Assert.InRange(z, 1, 9));
        for (var z = 1; z <= 9; z++)
            Assert.Contains(HeatmapLogic.ProvinceZone.Values, v => v == z);
        Assert.False(HeatmapLogic.ProvinceZone.ContainsKey("bkk")); // กทม. = ส่วนกลาง
    }

    [Fact]
    public void ColorForT_green_at_0_red_at_1_and_clamps()
    {
        Assert.Equal("hsl(140, 75%, 45%)", HeatmapLogic.ColorForT(0));
        Assert.Equal("hsl(0, 75%, 45%)", HeatmapLogic.ColorForT(1));
        Assert.Equal("hsl(70, 75%, 45%)", HeatmapLogic.ColorForT(0.5));
        Assert.Equal("hsl(140, 75%, 45%)", HeatmapLogic.ColorForT(-5));
        Assert.Equal("hsl(0, 75%, 45%)", HeatmapLogic.ColorForT(2));
    }

    [Fact]
    public void TFor_divides_by_max_and_handles_zero()
    {
        Assert.Equal(0.5, HeatmapLogic.TFor(5, 10), 3);
        Assert.Equal(0, HeatmapLogic.TFor(5, 0), 3);
        Assert.Equal(1, HeatmapLogic.TFor(20, 10), 3); // clamp
    }

    [Theory]
    [InlineData("ปปท.1", 1)]
    [InlineData("ปปท.4", 4)]
    [InlineData("ปปท.9", 9)]
    public void ZoneFromRegionLabel_parses_region_labels(string label, int expected)
        => Assert.Equal(expected, HeatmapLogic.ZoneFromRegionLabel(label));

    [Fact]
    public void ZoneFromRegionLabel_central_returns_null()
        => Assert.Null(HeatmapLogic.ZoneFromRegionLabel("ส่วนกลาง"));

    [Fact]
    public void ZoneName_has_all_9_zones()
    {
        for (var z = 1; z <= 9; z++)
            Assert.False(string.IsNullOrEmpty(HeatmapLogic.ZoneName(z)));
        Assert.StartsWith("เขต 4", HeatmapLogic.ZoneName(4));
    }

    [Fact]
    public void ComputeCentroids_walks_relative_path_to_absolute_points()
    {
        // nbi อยู่เขต 1; "m 10,20 30,40 z" → จุดสัมบูรณ์ (10,20),(40,60) → centroid (25,40)
        var locs = new List<ProvinceLocation>
        {
            new() { Id = "nbi", Name = "Nonthaburi", Path = "m 10,20 30,40 z" },
        };
        var c = HeatmapLogic.ComputeCentroids(locs);
        Assert.Equal(25, c[1].X, 3);
        Assert.Equal(40, c[1].Y, 3);
        Assert.False(c.ContainsKey(2)); // เขตอื่นไม่มีข้อมูล
    }

    [Fact]
    public void Zone_enum_parses_query_param_format()
    {
        Assert.True(Enum.TryParse<Zone>("Pt4", out var z));
        Assert.Equal(Zone.Pt4, z);
        Assert.False(Enum.TryParse<Zone>("xx", out _));
    }
}
