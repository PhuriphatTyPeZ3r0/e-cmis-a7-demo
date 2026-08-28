namespace EcmisWeb.Data;

/// <summary>คดีค้างเกินกรอบเวลา (SLA & Ageing) หนึ่งรายการ — ข้อมูลสังเคราะห์ deterministic</summary>
public sealed record SlaCase(
    string CaseNo,
    string Title,
    Zone Zone,
    string LegalLabel,
    DateTime ReceivedAt,
    int DaysOver,
    string Bucket,   // yellow (เกิน 45 วัน) | red (เกิน 60 วัน)
    string Stage);

/// <summary>สร้างรายการคดีค้าง SLA แบบสังเคราะห์ให้ยอดตรงตัวเลขบนแดชบอร์ดเป๊ะ
/// (แนวเดียวกับ SeedComplaintStatsService: marginal ตรง, รายละเอียดสุ่มแบบ seed คงที่)
/// เมื่อเชื่อม ecmis-investigation แล้วแทนที่คลาสนี้ด้วยข้อมูลจริงได้ทันที</summary>
public static class SlaCaseData
{
    public static readonly DateTime AsOf = new(2568, 11, 30); // ข้อมูล ณ 30 พ.ย. 2568 (พ.ศ. ตามชุดข้อมูลหลัก)

    private static readonly string[] Topics =
    {
        "ทุจริตจัดซื้อครุภัณฑ์", "ก่อสร้างถนนไม่ได้มาตรฐาน", "เรียกรับผลประโยชน์การออกใบอนุญาต",
        "ทุจริตงบอาหารกลางวัน", "จัดจ้างขุดลอกคลองผิดระเบียบ", "เบียดบังเงินราชการ",
        "ละเว้นการปฏิบัติหน้าที่", "ฮั้วประมูลโครงการก่อสร้าง", "ทุจริตเบี้ยยังชีพผู้สูงอายุ",
        "ออกเอกสารสิทธิ์ที่ดินโดยมิชอบ", "ทุจริตงบซ่อมแซมระบบประปา", "จัดซื้อวัสดุการแพทย์แพงเกินจริง",
    };

    private static readonly string[] Units = { "อบต.", "อบจ.", "เทศบาล", "โรงเรียนสังกัดเทศบาล", "รพ.สต.", "สำนักงานเขตพื้นที่" };

    private static readonly string[] Stages = { "สืบสวนเบื้องต้น", "แสวงหาข้อเท็จจริง", "รวบรวมพยานหลักฐาน", "รอเสนอคณะอนุกรรมการ" };

    private static readonly string[] Legals = { "ม.18/4", "ม.62", "ม.18/1ก", "ม.58/2" };

    public static IReadOnlyList<SlaCase> GenerateCases(int yellowTotal, int redTotal)
    {
        var rng = new Random(25681130); // seed คงที่ → ผลเหมือนเดิมทุกครั้ง
        var zones = Enum.GetValues<Zone>();
        var list = new List<SlaCase>(yellowTotal + redTotal);
        var caseNo = 101;

        foreach (var (bucket, total, minDays, spread) in new[]
                 {
                     ("red", redTotal, 61, 75),     // 61–135 วัน
                     ("yellow", yellowTotal, 46, 15), // 46–60 วัน
                 })
        {
            foreach (var (zone, count) in DistributeByZone(zones, total))
            {
                for (var i = 0; i < count; i++)
                {
                    var days = minDays + rng.Next(spread);
                    list.Add(new SlaCase(
                        CaseNo: $"สนง-ปปท/2569/{caseNo++:0000}",
                        Title: $"{Topics[rng.Next(Topics.Length)]} {Units[rng.Next(Units.Length)]}",
                        Zone: zone,
                        LegalLabel: Legals[rng.Next(Legals.Length)],
                        ReceivedAt: AsOf.AddDays(-days),
                        DaysOver: days,
                        Bucket: bucket,
                        Stage: Stages[rng.Next(Stages.Length)]));
                }
            }
        }

        return list.OrderByDescending(c => c.DaysOver).ThenBy(c => c.CaseNo).ToList();
    }

    /// <summary>กระจายยอดตามสัดส่วน ZoneTotals ของเล่มจริง (largest remainder → ผลรวมตรงเป๊ะ)</summary>
    private static IEnumerable<(Zone Zone, int Count)> DistributeByZone(Zone[] zones, int total)
    {
        var weights = zones.Select(z => (Zone: z, W: ComplaintStatsData.ZoneTotals.GetValueOrDefault(z, 1))).ToList();
        var sumW = weights.Sum(x => x.W);
        var alloc = weights
            .Select(x => (x.Zone, Exact: (double)total * x.W / sumW))
            .Select(x => (x.Zone, x.Exact, Floor: (int)Math.Floor(x.Exact)))
            .ToList();
        var remain = total - alloc.Sum(a => a.Floor);
        var bonus = alloc.OrderByDescending(a => a.Exact - a.Floor).Take(remain).Select(a => a.Zone).ToHashSet();
        return alloc.Select(a => (a.Zone, a.Floor + (bonus.Contains(a.Zone) ? 1 : 0)));
    }
}
