using Xunit;
using EcmisWeb.Data;

namespace EcmisWeb.Tests;

public class ComplaintStatsDataTests
{
    [Theory]
    [InlineData(Zone.Kpt1, "ปราบ 1")]
    [InlineData(Zone.Kpt2, "ปราบ 2")]
    [InlineData(Zone.Kpt3, "ปราบ 3")]
    [InlineData(Zone.Kpt4, "ปราบ 4")]
    [InlineData(Zone.Kpt5, "ปราบ 5")]
    public void ZoneLabel_uses_prab_naming_for_central_units(Zone zone, string expected)
        => Assert.Equal(expected, ComplaintStatsData.ZoneLabel(zone));

    [Fact]
    public void StatusLabel_review_matches_client_wording()
        => Assert.Equal("ตรวจสอบแล้ว", ComplaintStatsData.StatusLabel(CaseStatus.Review));
}
