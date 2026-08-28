using Xunit;
using EcmisWeb.Data;
using EcmisWeb.Models;

namespace EcmisWeb.Tests;

public class CaseIdentityTests
{
    private static StatRecord Sample(int day = 5, Zone zone = Zone.Pt6, CaseStatus status = CaseStatus.Pending)
        => new(2569, new DateTime(2568, 10, day), LegalType.M62, 3, zone, "ชลบุรี", status, BehaviorType.Corruption, RoutingAction.Assigned);

    [Fact]
    public void Same_record_always_gets_same_identity()
    {
        var a = CaseIdentity.Describe(Sample());
        var b = CaseIdentity.Describe(Sample());
        Assert.Equal(a, b);
    }

    [Fact]
    public void Different_records_usually_differ()
    {
        var a = CaseIdentity.Describe(Sample(day: 5));
        var b = CaseIdentity.Describe(Sample(day: 6));
        Assert.NotEqual(a.CaseNo, b.CaseNo);
    }

    [Fact]
    public void Identity_has_all_fields()
    {
        var d = CaseIdentity.Describe(Sample());
        Assert.StartsWith("สนง-ปปท/2569/", d.CaseNo);
        Assert.False(string.IsNullOrWhiteSpace(d.Title));
        Assert.False(string.IsNullOrWhiteSpace(d.Owner));
        Assert.Contains(d.Owner[..3], new[] { "นาย", "นาง", "น.ส" });
    }

    [Fact]
    public void Owners_are_spread_across_pool()
    {
        var owners = Enumerable.Range(1, 25)
            .Select(d => CaseIdentity.Describe(Sample(day: (d % 27) + 1, zone: (Zone)(d % 15))).Owner)
            .Distinct()
            .Count();
        Assert.True(owners >= 8, $"เจ้าของคดีกระจุกเกินไป ({owners} คนจาก 25 คดี)");
    }
}
