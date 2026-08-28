using Xunit;
using EcmisWeb.Data;

namespace EcmisWeb.Tests;

public class SlaCaseDataTests
{
    [Fact]
    public void Generates_exact_bucket_totals()
    {
        var cases = SlaCaseData.GenerateCases(175, 82);
        Assert.Equal(175, cases.Count(c => c.Bucket == "yellow"));
        Assert.Equal(82, cases.Count(c => c.Bucket == "red"));
    }

    [Fact]
    public void Yellow_is_46_to_60_days_red_is_over_60()
    {
        var cases = SlaCaseData.GenerateCases(175, 82);
        Assert.All(cases.Where(c => c.Bucket == "yellow"), c => Assert.InRange(c.DaysOver, 46, 60));
        Assert.All(cases.Where(c => c.Bucket == "red"), c => Assert.InRange(c.DaysOver, 61, 150));
    }

    [Fact]
    public void Received_date_matches_days_over()
    {
        var cases = SlaCaseData.GenerateCases(10, 5);
        Assert.All(cases, c => Assert.Equal(c.DaysOver, (SlaCaseData.AsOf - c.ReceivedAt).Days));
    }

    [Fact]
    public void Case_numbers_are_unique()
    {
        var cases = SlaCaseData.GenerateCases(175, 82);
        Assert.Equal(cases.Count, cases.Select(c => c.CaseNo).Distinct().Count());
    }

    [Fact]
    public void Generation_is_deterministic()
    {
        var a = SlaCaseData.GenerateCases(175, 82);
        var b = SlaCaseData.GenerateCases(175, 82);
        Assert.Equal(a, b);
    }

    [Fact]
    public void Zone_subtotals_sum_to_bucket_totals()
    {
        var cases = SlaCaseData.GenerateCases(175, 82);
        Assert.Equal(175, cases.Where(c => c.Bucket == "yellow").GroupBy(c => c.Zone).Sum(g => g.Count()));
        Assert.Equal(82, cases.Where(c => c.Bucket == "red").GroupBy(c => c.Zone).Sum(g => g.Count()));
        // กระจายหลายเขต ไม่กองที่เดียว
        Assert.True(cases.Select(c => c.Zone).Distinct().Count() >= 10);
    }

    [Fact]
    public void Every_case_has_title_and_stage()
    {
        var cases = SlaCaseData.GenerateCases(50, 20);
        Assert.All(cases, c =>
        {
            Assert.False(string.IsNullOrWhiteSpace(c.Title));
            Assert.False(string.IsNullOrWhiteSpace(c.Stage));
            Assert.StartsWith("สนง-ปปท/2569/", c.CaseNo);
        });
    }
}
