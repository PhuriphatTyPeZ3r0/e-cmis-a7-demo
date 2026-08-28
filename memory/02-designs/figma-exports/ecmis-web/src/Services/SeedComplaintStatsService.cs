using EcmisWeb.Data;
using EcmisWeb.Models;

namespace EcmisWeb.Services;

public sealed class SeedComplaintStatsService : IComplaintStatsService
{
    private readonly List<StatRecord> _rows;

    public SeedComplaintStatsService() => _rows = GenerateRows();

    // exposed for unit tests only
    public IReadOnlyList<StatRecord> DebugRows => _rows;

    public Task<StatsSnapshot> GetSnapshotAsync(StatsFilter filter, CancellationToken ct = default)
    {
        var rows = ApplyFilter(_rows, filter);

        var kpi = new KpiVm(
            ReceivedThisYear: rows.Count,
            Accumulated: ComplaintStatsData.YearlyTotals.Values.Sum(),
            M62: rows.Count(r => r.Type == LegalType.M62),
            M18_4_2: rows.Count(r => r.Type == LegalType.M18_4_2),
            Other: rows.Count(r => r.Type == LegalType.Other));

        var yearlyBars = ComplaintStatsData.YearlyTotals
            .OrderBy(kv => kv.Key)
            .Select(kv => new NamedCount(kv.Key.ToString(), kv.Value))
            .ToList();
        int? cmpVal = filter.CompareYear is int cy && ComplaintStatsData.YearlyTotals.TryGetValue(cy, out var v) ? v : null;
        var yearly = new YearlyTrendVm(yearlyBars, filter.CompareYear, cmpVal);

        var byMonth = rows
            .GroupBy(r => new DateTime(r.ReceivedAt.Year, r.ReceivedAt.Month, 1))
            .OrderBy(g => g.Key)
            .Select(g => new NamedCount(ThaiMonth(g.Key), g.Count()))
            .ToList();
        var byQuarter = rows
            .GroupBy(r => FiscalQuarter(r.ReceivedAt, filter.YearMode))
            .OrderBy(g => g.Key)
            .Select(g => new NamedCount($"ไตรมาส {g.Key}", g.Count()))
            .ToList();
        var monthly = new MonthlyVm(byMonth, byQuarter);

        var section = new SectionVm(
            ComplaintStatsData.MonthlyBySection.Select(s => s.Month).ToList(),
            ComplaintStatsData.MonthlyBySection.Select(s => s.M62Section).ToList(),
            ComplaintStatsData.MonthlyBySection.Select(s => s.M184).ToList());

        var legal = new LegalTypeVm(ComplaintStatsData.LegalTypeTotals
            .Where(kv => kv.Value > 0 || kv.Key is LegalType.M58_2 or LegalType.M18_1Ka)
            .Select(kv => new NamedCount(ComplaintStatsData.LegalTypeLabel(kv.Key),
                                         rows.Count(r => r.Type == kv.Key)))
            .ToList());

        var channelCounts = Enumerable.Range(0, ComplaintStatsData.ChannelTotals.Length)
            .Select(i => new NamedCount(ComplaintStatsData.ChannelTotals[i].Label,
                                        rows.Count(r => r.ChannelIndex == i)))
            .ToList();
        var top5 = channelCounts.Where(c => c.Count > 0)
            .OrderByDescending(c => c.Count).Take(5).Select(c => c.Label).ToList();
        var channels = new ChannelVm(channelCounts, top5);

        var byRegion = rows
            .GroupBy(r => ComplaintStatsData.ToRegion(r.Zone))
            .OrderBy(g => g.Key)
            .Select(g => new NamedCount(ComplaintStatsData.RegionLabel(g.Key), g.Count()))
            .ToList();
        var zones = new ZoneVm(byRegion);

        var behavior = new BehaviorVm(ComplaintStatsData.BehaviorTotals
            .Select(kv => new NamedCount(ComplaintStatsData.BehaviorLabel(kv.Key),
                                         rows.Count(r => r.Behavior == kv.Key)))
            .ToList());

        var topProvinces = rows
            .Where(r => r.Province != "ไม่ระบุพื้นที่")
            .GroupBy(r => r.Province)
            .Select(g => new NamedCount(g.Key, g.Count()))
            .OrderByDescending(p => p.Count).ThenBy(p => p.Label)
            .ToList();

        var snapshot = new StatsSnapshot(kpi, yearly, monthly, section, legal, channels, zones, behavior,
                                         topProvinces, rows, DateTime.Now);
        return Task.FromResult(snapshot);
    }

    private static List<StatRecord> ApplyFilter(IEnumerable<StatRecord> src, StatsFilter f)
    {
        var (from, to) = YearRange(f.YearMode, f.Year);
        if (f.PeriodFrom is { } pf && pf > from) from = pf;
        if (f.PeriodTo is { } pt && pt < to) to = pt;

        return src.Where(r =>
            r.ReceivedAt >= from && r.ReceivedAt <= to &&
            (f.Type is null || r.Type == f.Type) &&
            (f.Status is null || r.Status == f.Status) &&
            (f.Zone is null || r.Zone == f.Zone) &&
            (f.Province is null || r.Province == f.Province))
            .ToList();
    }

    private static (DateTime From, DateTime To) YearRange(YearMode mode, int beYear) =>
        mode == YearMode.Fiscal
            ? (new DateTime(beYear - 1, 10, 1), new DateTime(beYear, 9, 30, 23, 59, 59))
            : (new DateTime(beYear, 1, 1), new DateTime(beYear, 12, 31, 23, 59, 59));

    private static int FiscalQuarter(DateTime d, YearMode mode)
    {
        if (mode == YearMode.Calendar) return (d.Month - 1) / 3 + 1;
        var m = (d.Month + 2) % 12 + 1;
        return (m - 1) / 3 + 1;
    }

    private static string ThaiMonth(DateTime d)
    {
        string[] m = { "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
                       "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค." };
        return $"{m[d.Month - 1]} {d.Year}";
    }

    private static List<StatRecord> GenerateRows()
    {
        const int total = ComplaintStatsData.SeedTotal; // 560
        var rng = new Random(20690101);                 // fixed seed → deterministic

        // 1) months: 250 Oct (10/2568), 310 Nov (11/2568)
        var months = new List<DateTime>();
        foreach (var (m, y, cnt) in ComplaintStatsData.MonthlyTotals)
            for (var i = 0; i < cnt; i++)
                months.Add(new DateTime(y, m, 1 + (i % 27)));   // spread day 1..27

        // 2) dimension columns, each exactly matching its marginal
        var types     = Expand(ComplaintStatsData.LegalTypeTotals.Select(kv => (kv.Key, kv.Value)), total);
        var statuses  = Expand(ComplaintStatsData.StatusTotals.Select(kv => (kv.Key, kv.Value)), total);
        var behaviors = Expand(ComplaintStatsData.BehaviorTotals.Select(kv => (kv.Key, kv.Value)), total);
        var routing   = Expand(ComplaintStatsData.RoutingTotals.Select(kv => (kv.Key, kv.Value)), total);
        var channels  = ExpandIndex(ComplaintStatsData.ChannelTotals.Select(c => c.Total), total);

        // zones: book sums to 559 — the 1 "ออกเลขเพิ่ม" row has no zone → fold into กอท. (central)
        var zones = Expand(ComplaintStatsData.ZoneTotals.Select(kv => (kv.Key, kv.Value)), total).Take(total).ToList();
        while (zones.Count < total) zones.Add(Zone.Kot);

        // provinces: book list sums to total (all geo-coded). Take/pad keeps it robust if reconciled later.
        var provinces = ComplaintStatsData.ProvinceTotals
            .SelectMany(p => Enumerable.Repeat(p.Name, p.Count)).Take(total).ToList();
        while (provinces.Count < total) provinces.Add("ไม่ระบุพื้นที่");

        // 3) shuffle each column independently (deterministic) so cross-tabs look mixed
        Shuffle(months, rng); Shuffle(types, rng); Shuffle(zones, rng);
        Shuffle(statuses, rng); Shuffle(channels, rng); Shuffle(provinces, rng);
        Shuffle(behaviors, rng); Shuffle(routing, rng);

        // 4) zip
        var rows = new List<StatRecord>(total);
        for (var i = 0; i < total; i++)
            rows.Add(new StatRecord(ComplaintStatsData.SeedYear, months[i], types[i],
                                    channels[i], zones[i], provinces[i], statuses[i], behaviors[i], routing[i]));
        return rows;
    }

    private static List<T> Expand<T>(IEnumerable<(T Key, int Count)> buckets, int total)
    {
        var list = new List<T>(total);
        foreach (var (key, count) in buckets)
            for (var i = 0; i < count; i++) list.Add(key);
        return list;
    }

    private static List<int> ExpandIndex(IEnumerable<int> counts, int total)
    {
        var list = new List<int>(total);
        var idx = 0;
        foreach (var count in counts)
        {
            for (var i = 0; i < count; i++) list.Add(idx);
            idx++;
        }
        return list;
    }

    private static void Shuffle<T>(IList<T> list, Random rng)
    {
        for (var i = list.Count - 1; i > 0; i--)
        {
            var j = rng.Next(i + 1);
            (list[i], list[j]) = (list[j], list[i]);
        }
    }
}
