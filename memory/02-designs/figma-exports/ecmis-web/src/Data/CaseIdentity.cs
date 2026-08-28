using EcmisWeb.Models;

namespace EcmisWeb.Data;

/// <summary>แปลง StatRecord (แถวสถิติสังเคราะห์) เป็นข้อมูลประจำคดีแบบ deterministic:
/// record เดียวกัน → เลขสำนวน/ชื่อเรื่อง/ผู้รับผิดชอบ เดิมเสมอ ไม่ว่ามาจาก filter ไหน
/// เมื่อเชื่อม ecmis-investigation แล้วฟิลด์เหล่านี้มาจากระบบจริงแทน</summary>
public static class CaseIdentity
{
    private static readonly string[] Topics =
    {
        "ทุจริตจัดซื้อครุภัณฑ์", "ก่อสร้างถนนไม่ได้มาตรฐาน", "เรียกรับผลประโยชน์การออกใบอนุญาต",
        "ทุจริตงบอาหารกลางวัน", "จัดจ้างขุดลอกคลองผิดระเบียบ", "เบียดบังเงินราชการ",
        "ละเว้นการปฏิบัติหน้าที่", "ฮั้วประมูลโครงการก่อสร้าง", "ทุจริตเบี้ยยังชีพผู้สูงอายุ",
        "ออกเอกสารสิทธิ์ที่ดินโดยมิชอบ", "ทุจริตงบซ่อมแซมระบบประปา", "จัดซื้อวัสดุการแพทย์แพงเกินจริง",
    };

    private static readonly string[] Units = { "อบต.", "อบจ.", "เทศบาล", "โรงเรียนสังกัดเทศบาล", "รพ.สต.", "สำนักงานเขตพื้นที่" };

    private static readonly string[] Officers =
    {
        "นายปกรณ์ วัฒนชัยกุล", "นางสาวอรุณี ศรีสุวรรณ", "นายธีรเดช บุญประเสริฐ", "นางพิมลพรรณ จันทร์เพ็ญ",
        "นายวีรยุทธ แก้วกาญจน์", "นางสาวชุติมา พงศ์พิพัฒน์", "นายอนุชิต รัตนโชติ", "นางวราภรณ์ สีหานาม",
        "นายคมกริช อินทรสุวรรณ", "นางสาวนภัสวรรณ ตั้งตระกูล", "นายศุภชัย มั่นคงดี", "นางสุดารัตน์ วงศ์ประทุม",
        "นายเอกพันธ์ คำหอมกุล", "นางสาวปาริชาต เลิศวิริยะ", "นายภาณุวัฒน์ ทองสุขดี", "นางจิราพร อุดมทรัพย์",
    };

    public static (string CaseNo, string Title, string Owner) Describe(StatRecord r)
    {
        var h = Hash(r);
        var caseNo = $"สนง-ปปท/2569/{(h % 8900) + 1000:0000}";
        var title = $"{Topics[(h >> 8) % (uint)Topics.Length]} {Units[(h >> 16) % (uint)Units.Length]} จ.{r.Province}";
        var owner = Officers[(h >> 4) % (uint)Officers.Length];
        return (caseNo, title, owner);
    }

    /// <summary>FNV-1a จากทุกฟิลด์ของ record — เสถียรข้ามรัน (ไม่ใช้ GetHashCode ที่สุ่มต่อโปรเซส)</summary>
    private static uint Hash(StatRecord r)
    {
        var s = $"{r.ReceivedAt:yyyyMMdd}|{r.Type}|{r.ChannelIndex}|{r.Zone}|{r.Province}|{r.Status}";
        unchecked
        {
            var h = 2166136261u;
            foreach (var c in s) { h ^= c; h *= 16777619u; }
            return h;
        }
    }
}
