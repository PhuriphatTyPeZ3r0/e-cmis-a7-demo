using System.Globalization;

namespace EcmisWeb.Data;

public sealed record ComplaintRow(
    int Id,
    int No,
    string CaseNo,
    string TrackNo,
    string ReceivedAt,
    string StatusText,
    string Unit,
    string Channel,
    string Status,
    // — Extended fields for Activity 4 —
    string Complainant = "-",
    string Accused = "-",
    string AccusedAgency = "-",
    string Category = "ม.18/4",  // ม.18/4, ม.58/2, ส่งคืน ป.ป.ช., วินัยภายใน
    string RoutingStatus = "pending", // pending, routed, returned, discipline
    string Province = "กรุงเทพมหานคร",
    string Description = "",
    string Priority = "medium", // high, medium, low
    int DaysRemaining = 999,
    string ParentCaseNo = ""  // for case splitting
);

public static class ComplaintData
{
    private static readonly IReadOnlyList<ComplaintRow> rows =
    [
        new(1247, 1, "7/2566", "4444|2956", "06/07/2566 15:13:52",
            "สรุปผลเรื่องร้องเรียนแล้ว อยู่ในกระบวนการติดตาม",
            "ปปท.เขต9", "เว็บไซต์", "active",
            "นายสมชาย มุ่งมั่น", "นายวิชิต มาตรา", "อบต.ดอนเมือง",
            "ม.18/4", "routed", "นนทบุรี",
            "เจ้าหน้าที่เรียกรับเงินในการอนุมัติใบอนุญาตก่อสร้างอาคาร", "high", 120),

        new(1246, 2, "6/2566", "9090|2618", "06/07/2566 14:55:01",
            "เรื่องได้รับจากสำนัก/กอง รอกลั่นกรอง",
            "ปปท.เขต9", "เว็บไซต์", "pending",
            "น.ส.วันดี รักเรียน", "นายประเสริฐ ทองดี", "สำนักงานเขตบางซื่อ",
            "ม.18/4", "pending", "กรุงเทพมหานคร",
            "เจ้าหน้าที่ปฏิบัติหน้าที่โดยมิชอบ ทุจริตงบประมาณโครงการ", "medium", 300),

        new(1245, 3, "5/2566", "1234|7610", "06/07/2566 14:42:50",
            "เรื่องใหม่ รับโดยส่วนกลาง",
            "ปปท.เขต9", "จดหมาย", "review",
            "ไม่เปิดเผยตัวตน", "นางสมศรี อำนาจดี", "อบจ.ชลบุรี",
            "ม.58/2", "pending", "ชลบุรี",
            "ประชาชนเดือดร้อนจากการปฏิบัติหน้าที่ล่าช้า ไม่ออกใบอนุญาตตามกำหนด", "low", 500),

        new(1244, 4, "4/2566", "CALL-1206-001122", "05/07/2566 09:30:00",
            "ส่งคืน ป.ป.ช. เนื่องจากอยู่ในอำนาจ ป.ป.ช.",
            "สำนักรับเรื่อง", "สายด่วน 1206", "transfer",
            "นายธนา วงศ์ประเสริฐ", "นายอดิศร ชัยกุล", "กรมที่ดิน",
            "ส่งคืน ป.ป.ช.", "returned", "เชียงใหม่",
            "ร่ำรวยผิดปกติ มีทรัพย์สินเกินกว่ารายได้ที่แจ้ง", "high", 10),

        new(1243, 5, "3/2566", "PACC-WEB-000501", "04/07/2566 10:15:00",
            "รับเรื่องจากแอปทางรัฐ อยู่ระหว่างคัดกรอง",
            "สำนักรับเรื่อง", "แอปทางรัฐ", "pending",
            "นายกิตติ สุขสมบูรณ์", "พ.ต.อ.สมบัติ มั่งมี", "สถานีตำรวจภูธรบ้านโป่ง",
            "ม.18/4", "pending", "ราชบุรี",
            "เจ้าหน้าที่ตำรวจเรียกรับสินบนจากผู้ต้องหาเพื่อไม่ดำเนินคดี", "high", 340),

        new(1242, 6, "2/2566", "SPN-1111-007788", "03/07/2566 08:45:00",
            "รับจาก สปน.1111 ส่งต่อสำนักไต่สวนแล้ว",
            "สำนักรับเรื่อง", "สปน. 1111", "active",
            "นางมาลี จันทร์เพ็ญ", "นายเอกชัย ราชวงค์", "เทศบาลนครขอนแก่น",
            "ม.18/4", "routed", "ขอนแก่น",
            "นายกเทศมนตรีใช้งบประมาณส่วนตัวในนามหน่วยงาน", "medium", 200),

        new(1241, 7, "1/2566", "WALK-IN-000301", "02/07/2566 13:00:00",
            "ผู้ร้องเดินทางมาร้องเรียนด้วยตนเอง",
            "ปปท.เขต1", "ยื่นด้วยตนเอง", "review",
            "นายประสิทธิ์ ดีใจ", "นายอนันต์ เลิศล้ำ", "สำนักงานที่ดินจังหวัดปทุมธานี",
            "ม.58/2", "pending", "ปทุมธานี",
            "ที่ดินถูกออกเอกสารสิทธิ์ทับที่ทำกินของประชาชน", "medium", 150),

        new(1240, 8, "12/2565", "FB-MSG-001234", "01/07/2566 16:20:00",
            "รับเรื่องจาก Facebook ส่งต่อสำนักรับเรื่อง",
            "สำนักรับเรื่อง", "Facebook", "pending",
            "ไม่เปิดเผยตัวตน", "ไม่ทราบชื่อ", "ไม่ทราบหน่วยงาน",
            "ม.18/4", "pending", "สงขลา",
            "มีการเรียกรับผลประโยชน์ในการรับเหมาก่อสร้างถนนในพื้นที่", "low", 400),

        new(1239, 9, "11/2565", "MAIL-PACC-000912", "30/06/2566 11:00:00",
            "ร้องเรียนเจ้าหน้าที่ ป.ป.ท. ส่ง สพท.",
            "สำนักรับเรื่อง", "อีเมล", "discipline",
            "นายวิทยา ซื่อสัตย์", "เจ้าหน้าที่ ป.ป.ท.", "สำนักงาน ป.ป.ท.",
            "วินัยภายใน", "discipline", "กรุงเทพมหานคร",
            "เจ้าหน้าที่ ป.ป.ท. ประพฤติมิชอบระหว่างปฏิบัติหน้าที่", "high", 0),

        new(1238, 10, "10/2565", "EXT-DOC-000456", "29/06/2566 09:30:00",
            "หนังสือจากหน่วยงานภายนอก อายุความใกล้หมด",
            "สำนักรับเรื่อง", "หนังสือหน่วยงาน", "expired_warning",
            "หน่วยงานร้องเรียน", "นายสุรชัย อำนาจเจริญ", "กรมศุลกากร",
            "ม.18/4", "pending", "สมุทรปราการ",
            "เจ้าหน้าที่ศุลกากรเรียกรับผลประโยชน์จากการนำเข้าสินค้า อายุความเหลือ 4 เดือน", "high", -1, ParentCaseNo: "8/2565"),

        new(1237, 11, "9/2565", "TANG-RAT-002211", "28/06/2566 14:10:00",
            "รับจากแอปทางรัฐ ดำเนินการเสร็จสิ้น",
            "ปปท.เขต3", "แอปทางรัฐ", "closed",
            "นายชัยวัฒน์ มีสุข", "นายพิเชษฐ์ ทรงอำนาจ", "อบต.หนองแค",
            "ม.18/4", "routed", "สระบุรี",
            "เจ้าหน้าที่ อบต. ใช้ตำแหน่งหน้าที่แสวงหาประโยชน์ส่วนตัว", "low", 0),

        new(1236, 12, "8/2565", "HOTLINE-1206-003300", "25/06/2566 10:45:00",
            "รับจากสายด่วน 1206 แตกเป็นคดีย่อย",
            "สำนักรับเรื่อง", "สายด่วน 1206", "active",
            "นายอำนวย รักชาติ", "กลุ่มเจ้าหน้าที่ศุลกากร", "กรมศุลกากร",
            "ม.18/4", "routed", "สมุทรปราการ",
            "กลุ่มเจ้าหน้าที่ศุลกากรร่วมกันเรียกรับผลประโยชน์อย่างเป็นระบบ", "high", 90)
    ];

    public static IReadOnlyList<ComplaintRow> Rows => rows;

    public static ComplaintRow? GetById(int id) => rows.FirstOrDefault(r => r.Id == id);

    public static IEnumerable<ComplaintRow> GetSubCases(string parentCaseNo) =>
        rows.Where(r => r.ParentCaseNo == parentCaseNo);

    public static bool IsToday(string receivedAt)
    {
        var date = ParseDate(receivedAt);
        return date.HasValue && date.Value.Date == DateTime.Today;
    }

    public static bool IsThisMonth(string receivedAt)
    {
        var date = ParseDate(receivedAt);
        return date.HasValue
            && date.Value.Month == DateTime.Today.Month
            && date.Value.Year == DateTime.Today.Year;
    }

    public static DateTime? ParseDate(string receivedAt)
    {
        var datePart = receivedAt.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        if (datePart is null)
        {
            return null;
        }

        var parts = datePart.Split('/');
        if (parts.Length == 3
            && int.TryParse(parts[0], out var day)
            && int.TryParse(parts[1], out var month)
            && int.TryParse(parts[2], out var year))
        {
            var gregYear = year > 2400 ? year - 543 : year;
            try
            {
                return new DateTime(gregYear, month, day);
            }
            catch
            {
                return null;
            }
        }

        if (DateTime.TryParse(datePart, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
        {
            return parsed;
        }

        return null;
    }

    public static string ToThaiShortDate(string receivedAt)
    {
        var dt = ParseDate(receivedAt);
        if (!dt.HasValue)
        {
            return receivedAt;
        }

        var thaiYear = dt.Value.Year + 543;
        return $"{dt.Value:dd/MM}/{thaiYear % 100:00}";
    }

    public static string StatusClass(string status) => status switch
    {
        "pending" => "pending",
        "active" => "active",
        "review" => "review",
        "transfer" => "transfer",
        "closed" => "closed",
        "discipline" => "discipline",
        "expired_warning" => "expired",
        _ => "pending"
    };

    public static string StatusLabel(string status) => status switch
    {
        "pending" => "รอดำเนินการ",
        "active" => "กำลังไต่สวน",
        "review" => "รอพิจารณา",
        "transfer" => "ส่งคืน ป.ป.ช.",
        "closed" => "ดำเนินการแล้ว",
        "discipline" => "ส่ง สพท. วินัย",
        "expired_warning" => "อายุความใกล้หมด",
        _ => "รอดำเนินการ"
    };

    public static string StatusIcon(string status) => status switch
    {
        "pending" => "bi-hourglass-split",
        "active" => "bi-search",
        "review" => "bi-check2-square",
        "transfer" => "bi-arrow-right",
        "closed" => "bi-check-circle",
        "discipline" => "bi-shield-exclamation",
        "expired_warning" => "bi-exclamation-triangle-fill",
        _ => "bi-hourglass-split"
    };

    public static string CategoryLabel(string category) => category switch
    {
        "ม.18/4" => "ม.18/4 ประพฤติมิชอบ",
        "ม.58/2" => "ม.58/2 ความเดือดร้อน",
        "ส่งคืน ป.ป.ช." => "ส่งคืน ป.ป.ช.",
        "วินัยภายใน" => "วินัยภายใน สพท.",
        _ => category
    };

    public static string CategoryClass(string category) => category switch
    {
        "ม.18/4" => "cat-misconduct",
        "ม.58/2" => "cat-distress",
        "ส่งคืน ป.ป.ช." => "cat-return",
        "วินัยภายใน" => "cat-discipline",
        _ => "cat-misconduct"
    };

    public static string PriorityLabel(string priority) => priority switch
    {
        "high" => "เร่งด่วน",
        "medium" => "ปกติ",
        "low" => "ต่ำ",
        _ => "ปกติ"
    };
}
