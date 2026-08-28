namespace EcmisWeb.Data;

public sealed record PostCase(
    int Id,
    string CaseNo,
    string Accused,
    string AccusedAgency,
    string ResolutionDate,
    string CaseType,       // criminal, discipline, both
    string CriminalStatus, // not_started, tracking_60d, delayed, sent_to_prosecutor
    string DisciplineStatus,// not_started, awaiting_agency, follow_up_1, follow_up_2, Agency_responded, closed
    int DaysPassedSinceResolution
);

public static class PostCommitteeData
{
    private static readonly IReadOnlyList<PostCase> cases =
    [
        new(801, "สน.001/2566", "นายวิชิต มาตรา", "อบต.ดอนเมือง", "30/08/2566", "criminal", "tracking_60d", "not_started", 45),
        new(802, "สน.015/2565", "นายกิตติ มุ่งงาน", "กรมป่าไม้", "15/07/2566", "both", "delayed", "follow_up_1", 72),
        new(803, "สน.022/2565", "นางสาวนารี งามดี", "รพ.สต.บ้านแพรก", "10/09/2566", "discipline", "not_started", "awaiting_agency", 20),
        new(804, "สน.003/2566", "นายอำนาจ บารมี", "อบจ.เชียงใหม่", "01/09/2566", "discipline", "not_started", "Agency_responded", 35),
        new(805, "สน.040/2564", "นายสุรพล คงกระพัน", "ที่ทำการปกครองอำเภอ", "15/05/2566", "both", "sent_to_prosecutor", "closed", 120)
    ];

    public static IReadOnlyList<PostCase> Cases => cases;

    public static PostCase? GetById(int id) => cases.FirstOrDefault(c => c.Id == id);

    public static int SlaDaysRemaining(int daysPassed) => Math.Max(0, 60 - daysPassed);

    public static string StatusLabel(string status) => status switch
    {
        "not_started" => "-",
        "tracking_60d" => "อยู่ในกรอบ 60 วัน",
        "delayed" => "ล่าช้าเกิน 60 วัน",
        "sent_to_prosecutor" => "จัดส่งอัยการแล้ว",
        "awaiting_agency" => "รอต้นสังกัดพิจารณา",
        "follow_up_1" => "ติดตามครั้งที่ 1",
        "follow_up_2" => "ติดตามครั้งที่ 2",
        "Agency_responded" => "ต้นสังกัดแจ้งผลแล้ว",
        "closed" => "ปิดและยุติเรื่อง",
        _ => status
    };

    public static string StatusClass(string status) => status switch
    {
        "not_started" => "",
        "tracking_60d" => "active",
        "delayed" => "urgent", // red badge
        "sent_to_prosecutor" => "closed", // green
        "awaiting_agency" => "review", // orange
        "follow_up_1" => "discipline", // red/orange
        "follow_up_2" => "urgent", // red
        "Agency_responded" => "active", // blue
        "closed" => "closed", // green
        _ => "pending"
    };

    public static string TypeLabel(string type) => type switch
    {
        "criminal" => "คดีอาญา",
        "discipline" => "คดีวินัย",
        "both" => "อาญาและวินัย",
        _ => type
    };
}
