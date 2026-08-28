using EcmisWeb.Data;

namespace EcmisWeb.Models;

public record StatRecord(
    int Year,
    DateTime ReceivedAt,
    LegalType Type,
    int ChannelIndex,          // index into ComplaintStatsData.ChannelTotals
    Zone Zone,
    string Province,           // "ไม่ระบุพื้นที่" if not geo-coded
    CaseStatus Status,
    BehaviorType Behavior,
    RoutingAction Routing);

public record StatsFilter(
    YearMode YearMode = YearMode.Fiscal,
    int Year = ComplaintStatsData.SeedYear,
    int? CompareYear = null,
    LegalType? Type = null,
    CaseStatus? Status = null,
    Zone? Zone = null,
    string? Province = null,
    DateTime? PeriodFrom = null,
    DateTime? PeriodTo = null)
{
    public static StatsFilter Default => new();
}

public record NamedCount(string Label, int Count);
public record KpiVm(int ReceivedThisYear, int Accumulated, int M62, int M18_4_2, int Other);
public record YearlyTrendVm(IReadOnlyList<NamedCount> Bars, int? CompareYear, int? CompareValue);
public record MonthlyVm(IReadOnlyList<NamedCount> ByMonth, IReadOnlyList<NamedCount> ByQuarter);
public record SectionVm(IReadOnlyList<string> Months, IReadOnlyList<int> M62, IReadOnlyList<int> M18_4);
public record LegalTypeVm(IReadOnlyList<NamedCount> Slices);
public record ChannelVm(IReadOnlyList<NamedCount> All, IReadOnlyList<string> Top5Labels);
public record ZoneVm(IReadOnlyList<NamedCount> ByRegion);
public record BehaviorVm(IReadOnlyList<NamedCount> Slices);

public record StatsSnapshot(
    KpiVm Kpi,
    YearlyTrendVm YearlyTrend,
    MonthlyVm Monthly,
    SectionVm Section,
    LegalTypeVm LegalType,
    ChannelVm Channels,
    ZoneVm Zones,
    BehaviorVm Behavior,
    IReadOnlyList<NamedCount> TopProvinces,
    IReadOnlyList<StatRecord> Rows,
    DateTime GeneratedAt);
