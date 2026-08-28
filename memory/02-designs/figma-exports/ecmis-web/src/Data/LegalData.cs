namespace EcmisWeb.Data;

// ── Existing types (backward compat with Legal/Index.razor, Legal/InfoRequest.razor) ──
public record CourtCase(
    int Id,
    string CaseNo,
    string AccusedName,
    string ProsecutorOrder,
    string Court1stStatus,
    string CourtAppStatus,
    string CourtSupStatus,
    string AppealDeadline,
    bool IsFinal
);

public record AdminCase(
    int Id,
    string AdminCourtNo,
    string PlaintiffName,
    string LinkedCaseNo,
    string Status,
    string Deadline
);

public record InfoRequest(
    int Id,
    string RequestNo,
    string RequesterName,
    string TargetCaseNo,
    string RequestDate,
    string Status
);

// ── New record for Analytics/LegalStats (TOR 12.6) ──────────────────────────
// Stage: อัยการ | ศาลชั้นต้น | อุทธรณ์ | ฎีกา
// Result: ชนะ | แพ้ | ถอนฟ้อง | ยุติ | อยู่ระหว่าง
public record LegalCase(
    int Id,
    string CaseNo,
    string AccusedName,
    string CaseType,     // อาญา | แพ่ง | ปกครอง
    string Court,        // ศาลอาญาคดีทุจริตและประพฤติมิชอบ | ศาลแพ่ง | ศาลปกครองกลาง
    string Stage,
    string Result,
    int FiscalYear,
    int DurationDays     // 0 = ยังดำเนินการอยู่
);

public static class LegalData
{
    // ── Old seed data ────────────────────────────────────────────────────────
    private static readonly IReadOnlyList<CourtCase> courtCases =
    [
        new(101, "สน.001/2565", "นายวิชิต มาตรา",       "indicted",     "decided_guilty",   "pending",          "", "",            false),
        new(102, "สน.015/2564", "นายกิตติ มุ่งงาน",     "non-indicted", "pending",          "",                 "", "2026-05-10",  false),
        new(103, "สน.022/2563", "นางสาวนารี งามดี",     "indicted",     "decided_dismissed","decided_guilty",   "pending", "",   false),
        new(104, "สน.003/2566", "พ.ต.อ. อำนาจ บารมี",   "pending",      "",                 "",                 "", "",            false),
        new(105, "สน.040/2562", "นายสุรพล คงกระพัน",    "indicted",     "decided_guilty",   "decided_guilty",   "decided_guilty","", true)
    ];

    private static readonly IReadOnlyList<AdminCase> adminCases =
    [
        new(201, "อ.123/2566", "นางสุดใจ บุญมี",    "สน.010/2565", "drafting_defense", "2026-04-15"),
        new(202, "อ.15/2565",  "นายรณชัย ใจกล้า",   "สน.021/2564", "investigating",    "2026-05-20"),
        new(203, "อ.22/2564",  "ส.ต.อ. วินัย แซ่ลี้","สน.033/2563", "closed",           "")
    ];

    private static readonly IReadOnlyList<InfoRequest> infoRequests =
    [
        new(301, "ขส.001/2566", "ทนายเดชา เพื่อเพื่อน",  "สน.015/2564", "2026-04-01", "pending"),
        new(302, "ขส.002/2566", "นางสาวนารี งามดี",       "สน.022/2563", "2026-03-15", "partially_approved"),
        new(303, "ขส.003/2566", "นายอำนาจ บารมี",         "สน.003/2566", "2026-03-10", "denied")
    ];

    // ── New seed data (TOR 12.6 — 30 คดี ปีงบ 2566-2569) ────────────────────
    // Stage ของคดีที่ปิดแล้ว = ชั้นศาลที่สิ้นสุด | Result = ผลสุดท้าย
    // Stage ของคดีที่ดำเนินอยู่ = ชั้นศาลปัจจุบัน | Result = อยู่ระหว่าง
    private static readonly IReadOnlyList<LegalCase> legalCases =
    [
        // ── ปีงบ 2566 ─────────────────────────────────────────────────────
        new( 1, "LC-001/2566", "นายวิชิต มาตรา",           "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "ศาลชั้นต้น", "ชนะ",      2566, 420),
        new( 2, "LC-002/2566", "พ.ต.ท. กิตติ บุญทวี",     "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "ฎีกา",       "อยู่ระหว่าง", 2566, 0),
        new( 3, "LC-003/2566", "นายสุรพล คงกระพัน",        "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "อัยการ",     "ถอนฟ้อง",  2566, 150),
        new( 4, "LC-004/2566", "นางสาวนารี งามดี",         "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "อุทธรณ์",   "อยู่ระหว่าง", 2566, 0),
        new( 5, "LC-005/2566", "นายรณชัย ใจกล้า",          "แพ่ง",   "ศาลแพ่ง",                          "ศาลชั้นต้น", "แพ้",       2566, 210),
        new( 6, "LC-006/2566", "บริษัทแสงสุรีย์ จำกัด",   "แพ่ง",   "ศาลแพ่ง",                          "ศาลชั้นต้น", "อยู่ระหว่าง", 2566, 0),
        new( 7, "LC-007/2566", "นางสุดใจ บุญมี",           "ปกครอง", "ศาลปกครองกลาง",                    "ศาลชั้นต้น", "ยุติ",      2566, 300),
        new( 8, "LC-008/2566", "นายอำนาจ บารมี",           "ปกครอง", "ศาลปกครองกลาง",                    "ศาลชั้นต้น", "อยู่ระหว่าง", 2566, 0),
        // ── ปีงบ 2567 ─────────────────────────────────────────────────────
        new( 9, "LC-009/2567", "พ.ต.อ. อนันต์ ชำนาญ",     "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "ฎีกา",       "ชนะ",      2567, 450),
        new(10, "LC-010/2567", "นายวินัย แซ่ลี้",           "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "อุทธรณ์",   "ชนะ",      2567, 480),
        new(11, "LC-011/2567", "น.ส.ปภาวรินทร์ สวย",       "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "อุทธรณ์",   "อยู่ระหว่าง", 2567, 0),
        new(12, "LC-012/2567", "นายรัตนชัย วุฒิ",           "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "ศาลชั้นต้น", "อยู่ระหว่าง", 2567, 0),
        new(13, "LC-013/2567", "บริษัทเพชรทอง จำกัด",      "แพ่ง",   "ศาลแพ่ง",                          "ศาลชั้นต้น", "ชนะ",      2567, 280),
        new(14, "LC-014/2567", "นางจุฬาลักษณ์ เพ็ง",       "แพ่ง",   "ศาลแพ่ง",                          "อุทธรณ์",   "อยู่ระหว่าง", 2567, 0),
        new(15, "LC-015/2567", "นายประสิทธิ์ ทองดี",        "ปกครอง", "ศาลปกครองกลาง",                    "ศาลชั้นต้น", "ยุติ",      2567, 320),
        new(16, "LC-016/2567", "น.ส.สุมาลี ดอกไม้",         "ปกครอง", "ศาลปกครองกลาง",                    "ศาลชั้นต้น", "อยู่ระหว่าง", 2567, 0),
        // ── ปีงบ 2568 ─────────────────────────────────────────────────────
        new(17, "LC-017/2568", "นายทวีศักดิ์ เลิศ",         "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "ฎีกา",       "ชนะ",      2568, 510),
        new(18, "LC-018/2568", "นางพรรณี รักดี",             "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "อุทธรณ์",   "แพ้",       2568, 390),
        new(19, "LC-019/2568", "พ.ต.ต. ชัยวัฒน์ สิงห์",    "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "อุทธรณ์",   "อยู่ระหว่าง", 2568, 0),
        new(20, "LC-020/2568", "นายเกรียงไกร มีชัย",         "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "ศาลชั้นต้น", "อยู่ระหว่าง", 2568, 0),
        new(21, "LC-021/2568", "บริษัทรุ่งเรือง จำกัด",     "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "อัยการ",     "อยู่ระหว่าง", 2568, 0),
        new(22, "LC-022/2568", "นายภาสกร หวัง",              "แพ่ง",   "ศาลแพ่ง",                          "ศาลชั้นต้น", "ถอนฟ้อง",  2568, 180),
        new(23, "LC-023/2568", "บริษัทสัมฤทธิ์ จำกัด",     "แพ่ง",   "ศาลแพ่ง",                          "ศาลชั้นต้น", "อยู่ระหว่าง", 2568, 0),
        new(24, "LC-024/2568", "นายพิเชษฐ์ ดำรงค์",         "ปกครอง", "ศาลปกครองกลาง",                    "อุทธรณ์",   "อยู่ระหว่าง", 2568, 0),
        new(25, "LC-025/2568", "นายเฉลิม ศรีทอง",            "ปกครอง", "ศาลปกครองกลาง",                    "อุทธรณ์",   "ยุติ",      2568, 240),
        // ── ปีงบ 2569 ─────────────────────────────────────────────────────
        new(26, "LC-026/2569", "นายสมชาย พัฒนา",             "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "ศาลชั้นต้น", "ชนะ",      2569, 360),
        new(27, "LC-027/2569", "น.ส.สิริพร ไพบูลย์",         "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "ศาลชั้นต้น", "อยู่ระหว่าง", 2569, 0),
        new(28, "LC-028/2569", "พ.ต.ท. วีระ แก้ว",           "อาญา",   "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", "อัยการ",     "อยู่ระหว่าง", 2569, 0),
        new(29, "LC-029/2569", "นายประพันธ์ สุข",             "แพ่ง",   "ศาลแพ่ง",                          "ศาลชั้นต้น", "อยู่ระหว่าง", 2569, 0),
        new(30, "LC-030/2569", "นายปรีชา สุขใจ",              "ปกครอง", "ศาลปกครองกลาง",                    "ศาลชั้นต้น", "อยู่ระหว่าง", 2569, 0),
    ];

    // ── Public accessors ─────────────────────────────────────────────────────
    public static IReadOnlyList<CourtCase> CourtCases     => courtCases;
    public static IReadOnlyList<AdminCase> AdminCases     => adminCases;
    public static IReadOnlyList<InfoRequest> InfoRequests => infoRequests;
    public static IReadOnlyList<LegalCase> LegalCases     => legalCases;

    // ── Helpers for LegalCase (TOR 12.6) ────────────────────────────────────
    public static string StageLabel(string s) => s switch
    {
        "อัยการ"      => "อัยการพิจารณา",
        "ศาลชั้นต้น"  => "ศาลชั้นต้น",
        "อุทธรณ์"     => "ชั้นอุทธรณ์",
        "ฎีกา"         => "ชั้นฎีกา",
        _              => s
    };

    public static string ResultLabel(string r) => r switch
    {
        "ชนะ"          => "ชนะคดี",
        "แพ้"           => "แพ้คดี",
        "ถอนฟ้อง"      => "ถอนฟ้อง",
        "ยุติ"          => "ยุติคดี",
        "อยู่ระหว่าง"  => "อยู่ระหว่างดำเนินการ",
        _               => r
    };

    public static string ResultClass(string r) => r switch
    {
        "ชนะ"          => "lg-res-win",
        "แพ้"           => "lg-res-lose",
        "ถอนฟ้อง"      => "lg-res-withdraw",
        "ยุติ"          => "lg-res-term",
        "อยู่ระหว่าง"  => "lg-res-ongoing",
        _               => ""
    };

    public static string StageClass(string s) => s switch
    {
        "อัยการ"       => "lg-stg-pros",
        "ศาลชั้นต้น"   => "lg-stg-first",
        "อุทธรณ์"      => "lg-stg-appeal",
        "ฎีกา"          => "lg-stg-sup",
        _               => ""
    };

    // ── Old helpers (backward compat) ────────────────────────────────────────
    public static int DaysUntil(string dateStr)
    {
        if (DateTime.TryParse(dateStr, out var date))
        {
            var diff = date.Date - DateTime.Today;
            return diff.TotalDays > 0 ? (int)diff.TotalDays : 0;
        }
        return 999;
    }

    public static string InfoRequestStatusLabel(string status) => status switch
    {
        "pending"            => "รอพิจารณาคำร้อง",
        "approved"           => "อนุญาตทั้งหมด",
        "partially_approved" => "อนุญาตบางส่วน",
        "denied"             => "ไม่อนุญาต",
        _                    => status
    };

    public static string InfoRequestStatusClass(string status) => status switch
    {
        "pending"            => "review",
        "approved"           => "closed",
        "partially_approved" => "urgent",
        "denied"             => "danger",
        _                    => "pending"
    };

    public static string CourtStageText(string status)
    {
        if (string.IsNullOrEmpty(status)) return "-";
        return status switch
        {
            "pending"                  => "อยู่ระหว่างพิจารณา",
            "indicted"                 => "อัยการสั่งฟ้อง",
            "non-indicted"             => "อัยการสั่งไม่ฟ้อง",
            "appealing_non_indict"     => "เห็นแย้งอัยการ (อสส.ชี้ขาด)",
            "decided_guilty"           => "พิพากษาลงโทษ",
            "decided_dismissed"        => "พิพากษายกฟ้อง",
            "appealing"                => "อยู่ระหว่างอุทธรณ์/ฎีกา",
            _                          => status
        };
    }
}
