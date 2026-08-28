namespace EcmisWeb.Data;

// สำนวนคดีที่อยู่ระหว่างดำเนินการ — วิเคราะห์อายุความและการขยายระยะเวลา (Customer Request)
// กฎหมาย: ไต่สวนเสร็จภายใน 2 ปีนับแต่วันรับเรื่อง, ขยายได้ไม่เกิน 4 ครั้ง ครั้งละ 1 ปี
public sealed record CaseProgress(
    int Id,
    string CaseNo,
    string Subject,
    string AccusedAgency,
    string AssignedUnit,      // กปท.1-5 | ปปท.เขต 1-9
    string AssignedOfficer,
    string IntakeDate,        // YYYY-MM-DD
    string Stage,             // ไต่สวนเบื้องต้น | ไต่สวนวินิจฉัยชี้มูล
    int ExtensionCount        // 0-4 ครั้งที่ขยาย
);

public static class PrescriptionData
{
    // วันนี้ = 2026-06-08 (ตาม system context)
    // DueDate = IntakeDate + (2 + ExtensionCount) ปี
    private static readonly IReadOnlyList<CaseProgress> cases =
    [
        // ── ExtensionCount = 0 (ยังไม่ขยาย, กำหนด 2 ปี) ─────────────────────────
        new( 1, "สน.045/2565", "ทุจริตจัดซื้อจัดจ้างโครงการก่อสร้าง",  "อบต.หนองแค",                   "กปท.1",        "นายวีรชัย บุญมี",         "2024-07-15", "ไต่สวนเบื้องต้น",          0),  // due 2026-07-15, left  37d CRITICAL
        new( 2, "สน.082/2565", "เบียดบังทรัพย์ราชการ ม.147",            "เทศบาลนครเชียงใหม่",            "กปท.2",        "น.ส.พิชญา ศรีสุวรรณ",    "2024-08-25", "ไต่สวนเบื้องต้น",          0),  // due 2026-08-25, left  78d CRITICAL
        new( 3, "สน.011/2566", "ละเว้นการปฏิบัติหน้าที่ ม.157",         "กรมชลประทาน",                   "กปท.3",        "นายอดิศร กมลสุทธิ",       "2024-10-20", "ไต่สวนเบื้องต้น",          0),  // due 2026-10-20, left 134d NEAR
        new( 4, "สน.033/2566", "ทุจริตค่าสวัสดิการและค่ารักษาพยาบาล",   "สพท.นนทบุรี",                   "กปท.4",        "น.ส.สุนิตา รัตนวงศ์",    "2024-12-10", "ไต่สวนเบื้องต้น",          0),  // due 2026-12-10, left 185d WATCH
        new( 5, "สน.067/2566", "รับสินบนจากผู้รับจ้าง",                  "กระทรวงสาธารณสุข",              "กปท.5",        "นายพงศ์พัฒน์ ชัยวัฒนา",  "2025-01-15", "ไต่สวนเบื้องต้น",          0),  // due 2027-01-15, left 221d WATCH

        // ── ExtensionCount = 1 (ขยาย 1 ครั้ง, กำหนด 3 ปี) ───────────────────────
        new( 6, "สน.112/2564", "ออกใบอนุญาตก่อสร้างโดยมิชอบ",           "อบต.วังน้ำเขียว",               "ปปท.เขต 1",   "น.ส.ปราณี ตันติกุล",     "2023-06-20", "ไต่สวนเบื้องต้น",          1),  // due 2026-06-20, left  12d CRITICAL
        new( 7, "สน.098/2564", "ทุจริตการเบิกจ่ายเงินงบประมาณ",          "สำนักงานตำรวจแห่งชาติ",        "ปปท.เขต 2",   "นายกิตติภพ สมบูรณ์",     "2023-07-28", "ไต่สวนเบื้องต้น",          1),  // due 2026-07-28, left  50d CRITICAL
        new( 8, "สน.155/2564", "ออกเอกสารสิทธิ์โดยมิชอบ ม.162",         "กรมที่ดิน",                      "ปปท.เขต 3",   "น.ส.วาสนา ทรัพย์มาก",   "2023-09-22", "ไต่สวนวินิจฉัยชี้มูล",    1),  // due 2026-09-22, left 106d NEAR
        new( 9, "สน.030/2565", "ทุจริตงบพัฒนาท้องถิ่นอย่างต่อเนื่อง",   "สพท.ขอนแก่น",                   "ปปท.เขต 4",   "นายสุริยะ พุทธิวงศ์",    "2023-11-10", "ไต่สวนวินิจฉัยชี้มูล",    1),  // due 2026-11-10, left 155d NEAR
        new(10, "สน.074/2565", "ฮั้วประมูลโครงการก่อสร้าง",              "เทศบาลตำบลบ้านบึง",            "ปปท.เขต 5",   "น.ส.อมรรัตน์ ใจดี",     "2024-01-10", "ไต่สวนเบื้องต้น",          1),  // due 2027-01-10, left 216d WATCH
        new(11, "สน.091/2565", "เบียดบังทรัพย์ราชการสาธารณะ",            "กรมทางหลวงชนบท",               "ปปท.เขต 6",   "นายทวีพงศ์ รุ่งเรือง",   "2024-03-25", "ไต่สวนเบื้องต้น",          1),  // due 2027-03-25, left 290d WATCH
        new(12, "สน.043/2563", "ทุจริตจัดซื้อยาและเวชภัณฑ์",             "กระทรวงมหาดไทย",               "ปปท.เขต 7",   "น.ส.ชุติมา สว่างจิต",   "2022-05-05", "ไต่สวนวินิจฉัยชี้มูล",    1),  // due 2025-05-05, left-399d OVERDUE

        // ── ExtensionCount = 2 (ขยาย 2 ครั้ง, กำหนด 4 ปี) ───────────────────────
        new(13, "สน.178/2562", "ทุจริตโครงการก่อสร้างถนน",               "อบจ.ประจวบคีรีขันธ์",           "ปปท.เขต 8",   "นายวินัย ประสิทธิ์",     "2022-06-15", "ไต่สวนวินิจฉัยชี้มูล",    2),  // due 2026-06-15, left   7d CRITICAL
        new(14, "สน.056/2563", "รับสินบนอนุมัติใบอนุญาตสถานประกอบการ",   "เทศบาลเมืองเพชรบุรี",          "กปท.1",        "นายวีรชัย บุญมี",         "2022-08-05", "ไต่สวนวินิจฉัยชี้มูล",    2),  // due 2026-08-05, left  58d CRITICAL
        new(15, "สน.200/2562", "ทุจริตสวัสดิการรักษาพยาบาล",             "กรมป่าไม้",                      "กปท.2",        "น.ส.พิชญา ศรีสุวรรณ",    "2022-10-10", "ไต่สวนเบื้องต้น",          2),  // due 2026-10-10, left 124d NEAR
        new(16, "สน.134/2562", "ยักยอกเงินค่าจ้างรายวันชุมชน",            "สำนักงานตำรวจแห่งชาติ เขต 2", "กปท.3",        "นายอดิศร กมลสุทธิ",       "2022-12-25", "ไต่สวนเบื้องต้น",          2),  // due 2026-12-25, left 200d WATCH
        new(17, "สน.089/2562", "เบียดบังที่ดินราชพัสดุ",                   "อบต.แม่ริม",                    "กปท.4",        "น.ส.สุนิตา รัตนวงศ์",    "2023-02-15", "ไต่สวนเบื้องต้น",          2),  // due 2027-02-15, left 252d WATCH
        new(18, "สน.022/2561", "ทุจริตจัดซื้อครุภัณฑ์ราชการ",             "อบต.ป่าตาล",                    "ปปท.เขต 1",   "น.ส.ปราณี ตันติกุล",     "2021-04-15", "ไต่สวนวินิจฉัยชี้มูล",    2),  // due 2025-04-15, left-419d OVERDUE

        // ── ExtensionCount = 3 (ขยาย 3 ครั้ง, กำหนด 5 ปี) ───────────────────────
        new(19, "สน.067/2560", "ออกเอกสารเท็จประกอบการอนุมัติโครงการ",   "กระทรวงศึกษาธิการ",            "ปปท.เขต 4",   "นายสุริยะ พุทธิวงศ์",    "2021-08-01", "ไต่สวนวินิจฉัยชี้มูล",    3),  // due 2026-08-01, left  54d CRITICAL
        new(20, "สน.145/2560", "ทุจริตจัดสรรที่ดินเพื่อการเกษตร",         "เทศบาลนครพิษณุโลก",            "ปปท.เขต 6",   "นายทวีพงศ์ รุ่งเรือง",   "2021-10-20", "ไต่สวนวินิจฉัยชี้มูล",    3),  // due 2026-10-20, left 134d NEAR
        new(21, "สน.203/2560", "เรียกรับผลประโยชน์ในการดำเนินการ",        "กรมพัฒนาชุมชน",                "กปท.5",        "นายพงศ์พัฒน์ ชัยวัฒนา",  "2022-01-15", "ไต่สวนเบื้องต้น",          3),  // due 2027-01-15, left 221d WATCH
        new(22, "สน.088/2559", "ทุจริตงบประมาณซ่อมแซมถนน",               "อบต.ทุ่งใหญ่",                  "ปปท.เขต 7",   "น.ส.ชุติมา สว่างจิต",   "2021-05-20", "ไต่สวนวินิจฉัยชี้มูล",    3),  // due 2026-05-20, left -19d OVERDUE

        // ── ExtensionCount = 4 MAX (ขยายสูงสุด 4 ครั้ง, กำหนด 6 ปี) ───────────
        new(23, "สน.111/2558", "เบียดบังพัสดุราชการมูลค่าสูง",            "กรมประมง",                      "กปท.5",        "นายพงศ์พัฒน์ ชัยวัฒนา",  "2020-07-22", "ไต่สวนวินิจฉัยชี้มูล",    4),  // due 2026-07-22, left  44d CRITICAL สิ้นสุดสิทธิ์ขยาย!
        new(24, "สน.078/2558", "ทุจริตค่าอาหารกลางวันนักเรียน",            "กระทรวงสาธารณสุข เขต 3",      "ปปท.เขต 3",   "น.ส.วาสนา ทรัพย์มาก",   "2020-10-15", "ไต่สวนวินิจฉัยชี้มูล",    4),  // due 2026-10-15, left 129d NEAR
        new(25, "สน.032/2558", "ยักยอกเงินกองทุนหมู่บ้านและชุมชนเมือง",   "อบต.ทุ่งหว้า",                  "ปปท.เขต 9",   "น.ส.พัชรี ดวงแก้ว",     "2020-04-20", "ไต่สวนวินิจฉัยชี้มูล",    4),  // due 2026-04-20, left -49d OVERDUE
    ];

    public static IReadOnlyList<CaseProgress> Cases => cases;

    // ── Calculation helpers ─────────────────────────────────────────────────

    public static int DaysSinceIntake(string intakeDateStr)
    {
        if (DateTime.TryParse(intakeDateStr, out var d))
            return (int)(DateTime.Today - d.Date).TotalDays;
        return 0;
    }

    public static DateTime DueDate(string intakeDateStr, int extensionCount)
    {
        if (DateTime.TryParse(intakeDateStr, out var d))
            return d.AddYears(2 + extensionCount);
        return DateTime.Today;
    }

    public static string DueDateStr(string intakeDateStr, int extensionCount) =>
        DueDate(intakeDateStr, extensionCount).ToString("yyyy-MM-dd");

    public static int DaysUntilDue(string intakeDateStr, int extensionCount) =>
        (int)(DueDate(intakeDateStr, extensionCount).Date - DateTime.Today).TotalDays;

    // critical=≤90d | near=91-180d | watch=181-365d | overdue=<0d | ok=>365d
    public static string UrgencyLevel(string intakeDateStr, int extensionCount)
    {
        var days = DaysUntilDue(intakeDateStr, extensionCount);
        if (days < 0)   return "overdue";
        if (days <= 90)  return "critical";
        if (days <= 180) return "near";
        if (days <= 365) return "watch";
        return "ok";
    }

    public static string UrgencyLabel(string level) => level switch
    {
        "critical" => "วิกฤต (≤90 วัน)",
        "near"     => "ใกล้กำหนด (91-180 วัน)",
        "watch"    => "ติดตาม (181-365 วัน)",
        "overdue"  => "เกินกำหนด",
        "ok"       => "ปกติ (>365 วัน)",
        _          => level
    };

    public static string UrgencyClass(string level) => level switch
    {
        "critical" => "urg-critical",
        "near"     => "urg-near",
        "watch"    => "urg-watch",
        "overdue"  => "urg-overdue",
        _          => "urg-ok"
    };

    // ── Age-based categorisation (DaysSinceIntake) ────────────────────────
    // "ใกล้ครบ 2 ปี" = อยู่ระหว่าง 18-24 เดือน (548-730 วัน) นับแต่วันรับเรื่อง
    // "เกิน 2 ปี"    = เกิน 730 วัน
    // "เกิน 3 ปี"    = เกิน 1095 วัน

    public static string AgeCategory(string intakeDateStr)
    {
        var days = DaysSinceIntake(intakeDateStr);
        if (days > 1460) return "over4yr";   // > 4 ปี
        if (days > 1095) return "over3yr";   // > 3 ปี
        if (days > 730)  return "over2yr";   // > 2 ปี
        if (days >= 548) return "near2yr";   // 1.5-2 ปี
        return "normal";
    }

    public static string AgeCategoryLabel(string cat) => cat switch
    {
        "near2yr" => "ใกล้ครบ 2 ปี (1.5–2 ปี)",
        "over2yr" => "เกิน 2 ปี",
        "over3yr" => "เกิน 3 ปี",
        "over4yr" => "เกิน 4 ปี",
        _         => "น้อยกว่า 1.5 ปี",
    };

    // ── Distinct lists for filters ─────────────────────────────────────────
    public static IReadOnlyList<string> AllUnits =>
        cases.Select(c => c.AssignedUnit).Distinct()
             .OrderBy(u => u.StartsWith("กปท") ? 0 : 1)
             .ThenBy(u => u)
             .ToList();

    public static IReadOnlyList<string> AllOfficers =>
        cases.Select(c => c.AssignedOfficer).Distinct().OrderBy(o => o).ToList();
}
