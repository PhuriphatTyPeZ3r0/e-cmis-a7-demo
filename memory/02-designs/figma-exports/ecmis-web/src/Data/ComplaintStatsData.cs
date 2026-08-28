namespace EcmisWeb.Data;

public enum LegalType { M18_4_2, M62, M58_2, M18_1Ka, Other }
public enum Zone { Kpt1, Kpt2, Kpt3, Kpt4, Kpt5, Pt1, Pt2, Pt3, Pt4, Pt5, Pt6, Pt7, Pt8, Pt9, Kot }
public enum Region { Pt1, Pt2, Pt3, Pt4, Pt5, Pt6, Pt7, Pt8, Pt9, Central }
public enum CaseStatus { Pending, Review, Active, Transfer, Closed, Discipline }
public enum YearMode { Fiscal, Calendar }
public enum BehaviorType { Corruption, Misconduct, Grievance }
public enum RoutingAction { Assigned, Forwarded, Returned, Recalled, SentToNacc }

public static class ComplaintStatsData
{
    // Appendix 1.1 — yearly totals (รวม 42,510)
    public static readonly IReadOnlyDictionary<int, int> YearlyTotals = new Dictionary<int, int>
    {
        [2551] = 342, [2552] = 1066, [2553] = 1141, [2554] = 2094, [2555] = 4114,
        [2556] = 4004, [2557] = 3460, [2558] = 4310, [2559] = 6634, [2560] = 4606,
        [2561] = 3196, [2562] = 2045, [2563] = 1374, [2564] = 659, [2565] = 264,
        [2566] = 433, [2567] = 697, [2568] = 1511, [2569] = 560,
    };

    public const int SeedYear = 2569;
    public const int SeedTotal = 560;

    // Appendix 1.2 — monthly totals FY2569 (month index, calendar year, total)
    public static readonly (int Month, int CalYear, int Total)[] MonthlyTotals =
    {
        (10, 2568, 250), (11, 2568, 310),
    };

    // Appendix 1.5 — legal type per-row totals (sum 560) — authoritative for StatRecord.Type
    public static readonly IReadOnlyDictionary<LegalType, int> LegalTypeTotals = new Dictionary<LegalType, int>
    {
        [LegalType.M62] = 163,
        [LegalType.M18_4_2] = 394,
        [LegalType.Other] = 3,
        [LegalType.M58_2] = 0,
        [LegalType.M18_1Ka] = 0,
    };

    // Appendix 1.2 — "section" view (different book categorization, display-only, NOT from rows)
    public static readonly (string Month, int M62Section, int M184)[] MonthlyBySection =
    {
        ("ต.ค. 2568", 65, 185), ("พ.ย. 2568", 101, 208),
    };

    // Appendix 1.3 — 17 channels (label, total). First is ม.62; rest are ม.18/4 + ออกเลข. Sum = 560.
    public static readonly (string Label, int Total)[] ChannelTotals =
    {
        ("สนง.ปปช./ปปจ. (ม.62)", 163),
        ("Walk-in", 40),
        ("สายด่วน 1206", 68),
        ("ไปรษณีย์", 94),
        ("ไปรษณีย์อิเล็กทรอนิกส์", 31),
        ("ศปท.", 7),
        ("กอท. (ข่าว)", 3),
        ("ข้อสั่งการ", 7),
        ("ระบบภาษีไปไหน", 0),
        ("Traffy Fondue", 4),
        ("Line@", 0),
        ("Facebook Fanpage", 3),
        ("www.pacc.go.th", 99),
        ("หน่วยงานอื่นๆ", 4),
        ("GCC1111", 0),
        ("เครือข่าย/สนง.ปปท.", 1),
        ("พนักงานสอบสวน", 0),
        ("แอพทางรัฐ", 33),
        ("ออกเลขเพิ่มเติม", 3),
    };

    // Appendix 1.4 — by zone, total only (sum 559 + 1 ออกเลข = 560)
    public static readonly IReadOnlyDictionary<Zone, int> ZoneTotals = new Dictionary<Zone, int>
    {
        [Zone.Kpt1] = 27, [Zone.Kpt2] = 37, [Zone.Kpt3] = 16, [Zone.Kpt4] = 48, [Zone.Kpt5] = 44,
        [Zone.Pt1] = 48, [Zone.Pt2] = 41, [Zone.Pt3] = 46, [Zone.Pt4] = 55, [Zone.Pt5] = 29,
        [Zone.Pt6] = 43, [Zone.Pt7] = 41, [Zone.Pt8] = 39, [Zone.Pt9] = 18, [Zone.Kot] = 27,
    };

    // Appendix 1.8 — provinces (73 named, sum = 560 = ทุก row geo-coded; reconcile vs PDF ตอน implement)
    public static readonly (string Name, int Count)[] ProvinceTotals =
    {
        ("กรุงเทพมหานคร", 143), ("อุดรธานี", 22), ("ชลบุรี", 18), ("อุบลราชธานี", 18),
        ("นนทบุรี", 18), ("เพชรบุรี", 17), ("นครราชสีมา", 15), ("ขอนแก่น", 14),
        ("เชียงใหม่", 13), ("นครสวรรค์", 12), ("นครศรีธรรมราช", 12), ("ราชบุรี", 10),
        ("ศรีสะเกษ", 10), ("ระยอง", 9), ("กาญจนบุรี", 9), ("ประจวบคีรีขันธ์", 9),
        ("เลย", 9), ("สมุทรปราการ", 8), ("ชุมพร", 8), ("สุราษฎร์ธานี", 7), ("เชียงราย", 7),
        ("สกลนคร", 6), ("สระบุรี", 6), ("มหาสารคาม", 6), ("บุรีรัมย์", 6), ("พิจิตร", 6),
        ("นครปฐม", 6), ("สงขลา", 5), ("ปทุมธานี", 5), ("น่าน", 5), ("นราธิวาส", 5),
        ("เพชรบูรณ์", 5), ("พะเยา", 5), ("สุโขทัย", 5), ("สุพรรณบุรี", 4), ("กาฬสินธุ์", 4),
        ("ปราจีนบุรี", 4), ("ตาก", 4), ("ฉะเชิงเทรา", 4), ("แม่ฮ่องสอน", 4), ("กระบี่", 4),
        ("ร้อยเอ็ด", 4), ("ชัยภูมิ", 4), ("ลพบุรี", 4), ("พังงา", 4), ("อุตรดิตถ์", 4),
        ("พระนครศรีอยุธยา", 4), ("หนองคาย", 3), ("พิษณุโลก", 3), ("ยะลา", 3), ("สิงห์บุรี", 3),
        ("กำแพงเพชร", 3), ("ระนอง", 3), ("สุรินทร์", 3), ("อำนาจเจริญ", 2), ("นครนายก", 2),
        ("ลำปาง", 2), ("ปัตตานี", 2), ("ตรัง", 2), ("สมุทรสงคราม", 2), ("ลำพูน", 2),
        ("หนองบัวลำภู", 2), ("จันทบุรี", 2), ("นครพนม", 1), ("อ่างทอง", 1), ("ตราด", 1),
        ("อุทัยธานี", 1), ("สตูล", 1), ("ภูเก็ต", 1), ("สมุทรสาคร", 1), ("ยโสธร", 1),
        ("แพร่", 1), ("พัทลุง", 1),
    };

    // Synthetic-only status mix (book has no status for received complaints). Sums to 560.
    public static readonly IReadOnlyDictionary<CaseStatus, int> StatusTotals = new Dictionary<CaseStatus, int>
    {
        [CaseStatus.Pending] = 230, [CaseStatus.Review] = 150, [CaseStatus.Active] = 110,
        [CaseStatus.Transfer] = 40, [CaseStatus.Closed] = 25, [CaseStatus.Discipline] = 5,
    };

    // TOR 4.1.3 — แยกประเภทพฤติการณ์ (ทุจริต/ประพฤติมิชอบ/ปัญหาความเดือดร้อน).
    // เล่ม พย68 ไม่ได้แยกมุมนี้ไว้ — ค่าสังเคราะห์ตามสัดส่วนที่พบทั่วไปในเรื่องร้องเรียน ปปท., sum 560.
    public static readonly IReadOnlyDictionary<BehaviorType, int> BehaviorTotals = new Dictionary<BehaviorType, int>
    {
        [BehaviorType.Corruption] = 320, [BehaviorType.Misconduct] = 180, [BehaviorType.Grievance] = 60,
    };

    // TOR 4.1.7/4.2 — มอบหมาย/ส่งต่อ/ส่งคืน/ดึงเรื่องกลับ/ส่งต่อ ป.ป.ช. ค่าสังเคราะห์, sum 560.
    public static readonly IReadOnlyDictionary<RoutingAction, int> RoutingTotals = new Dictionary<RoutingAction, int>
    {
        [RoutingAction.Assigned] = 410, [RoutingAction.Forwarded] = 90,
        [RoutingAction.Returned] = 35, [RoutingAction.Recalled] = 15, [RoutingAction.SentToNacc] = 10,
    };

    public static Region ToRegion(Zone z) => z switch
    {
        Zone.Pt1 => Region.Pt1, Zone.Pt2 => Region.Pt2, Zone.Pt3 => Region.Pt3,
        Zone.Pt4 => Region.Pt4, Zone.Pt5 => Region.Pt5, Zone.Pt6 => Region.Pt6,
        Zone.Pt7 => Region.Pt7, Zone.Pt8 => Region.Pt8, Zone.Pt9 => Region.Pt9,
        _ => Region.Central,
    };

    public static string ZoneLabel(Zone z) => z switch
    {
        Zone.Kpt1 => "ปราบ 1", Zone.Kpt2 => "ปราบ 2", Zone.Kpt3 => "ปราบ 3", Zone.Kpt4 => "ปราบ 4",
        Zone.Kpt5 => "ปราบ 5", Zone.Pt1 => "ปปท.1", Zone.Pt2 => "ปปท.2", Zone.Pt3 => "ปปท.3",
        Zone.Pt4 => "ปปท.4", Zone.Pt5 => "ปปท.5", Zone.Pt6 => "ปปท.6", Zone.Pt7 => "ปปท.7",
        Zone.Pt8 => "ปปท.8", Zone.Pt9 => "ปปท.9", Zone.Kot => "กอท.", _ => z.ToString(),
    };

    public static string RegionLabel(Region r) => r switch
    {
        Region.Pt1 => "ปปท.1", Region.Pt2 => "ปปท.2", Region.Pt3 => "ปปท.3", Region.Pt4 => "ปปท.4",
        Region.Pt5 => "ปปท.5", Region.Pt6 => "ปปท.6", Region.Pt7 => "ปปท.7", Region.Pt8 => "ปปท.8",
        Region.Pt9 => "ปปท.9", Region.Central => "ส่วนกลาง", _ => r.ToString(),
    };

    public static string LegalTypeLabel(LegalType t) => t switch
    {
        LegalType.M18_4_2 => "ม.18/4(2)", LegalType.M62 => "ม.62 / 18/1(ข)",
        LegalType.M58_2 => "ม.58/2", LegalType.M18_1Ka => "ม.18/1ก", _ => "อื่นๆ (ออกเลขเพิ่ม)",
    };

    public static string StatusLabel(CaseStatus s) => s switch
    {
        CaseStatus.Pending => "รอตรวจสอบ", CaseStatus.Review => "ตรวจสอบแล้ว",
        CaseStatus.Active => "กำลังดำเนินการ", CaseStatus.Transfer => "ส่งต่อ",
        CaseStatus.Closed => "ปิดเรื่อง", CaseStatus.Discipline => "วินัย", _ => s.ToString(),
    };

    public static string BehaviorLabel(BehaviorType b) => b switch
    {
        BehaviorType.Corruption => "การกระทำทุจริต", BehaviorType.Misconduct => "ประพฤติมิชอบ",
        BehaviorType.Grievance => "ปัญหาความเดือดร้อน", _ => b.ToString(),
    };

    public static string RoutingLabel(RoutingAction a) => a switch
    {
        RoutingAction.Assigned => "มอบหมายแล้ว", RoutingAction.Forwarded => "ส่งต่อหน่วยงานในสังกัด",
        RoutingAction.Returned => "ส่งคืนเรื่อง", RoutingAction.Recalled => "ดึงเรื่องกลับ",
        RoutingAction.SentToNacc => "ส่งต่อ ป.ป.ช.", _ => a.ToString(),
    };
}
