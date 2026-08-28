using Xunit;
using EcmisWeb.Data;

namespace EcmisWeb.Tests;

public class IntakeInsightDataTests
{
    [Fact]
    public void Monthly2568_sums_to_book_total()
        => Assert.Equal(ComplaintStatsData.YearlyTotals[2568], IntakeInsightData.Monthly2568().Sum(m => m.Count));

    [Fact]
    public void Monthly2568_has_12_months_starting_october()
    {
        var m = IntakeInsightData.Monthly2568();
        Assert.Equal(12, m.Count);
        Assert.Equal("ต.ค.", m[0].Month);
        Assert.Equal("ก.ย.", m[11].Month);
    }

    [Fact]
    public void TopMinistries_department_counts_sum_to_ministry_count()
    {
        foreach (var m in IntakeInsightData.TopMinistries)
            Assert.Equal(m.Count, m.Departments.Sum(d => d.Count));
    }

    [Fact]
    public void Keyword_percents_do_not_exceed_100()
        => Assert.True(IntakeInsightData.TopKeywords.Sum(k => k.Percent) <= 100);

    [Fact]
    public void KeywordTrend_has_6_months_with_positive_values()
    {
        var t = IntakeInsightData.KeywordTrend();
        Assert.Equal(6, t.Count);
        Assert.All(t, m => { Assert.True(m.Procurement > 0); Assert.True(m.Road > 0); Assert.True(m.License > 0); });
    }

    [Fact]
    public void NccSyncStatus_has_entries_with_values()
        => Assert.All(IntakeInsightData.NccSyncStatus, s => Assert.False(string.IsNullOrWhiteSpace(s.Value)));

    [Fact]
    public void Duplicate_offenders_sorted_desc()
    {
        var times = IntakeInsightData.DuplicateOffenders.Select(d => d.Times).ToArray();
        Assert.Equal(times.OrderByDescending(t => t), times);
    }
}
