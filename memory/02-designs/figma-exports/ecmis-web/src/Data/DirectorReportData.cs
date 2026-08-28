namespace EcmisWeb.Data;

public static class DirectorReportData
{
    public const string ReportMonth = "เมษายน 2569";
    public const string AsOf = "ข้อมูล ณ วันที่ 17 เมษายน 2569";

    // 2.1 receiving comparison (fallback values; slide 2 prefers live service)
    public static readonly (int M62, int M184, int Total) Prev2568 = (723, 788, 1511);
    public static readonly (int M62, int M184, int Total) Cur2569 = (506, 1129, 1635);
    public const double YoYPercent = 108.2;

    // 2.2 / 2.4 inquiry (ไต่สวนเบื้องต้น): per zone [m62done, m62remain, m184done, m184remain, totalDone, totalRemain]
    public static readonly (string Zone, int[] V)[] Inquiry =
    {
        ("กปท.1", new[]{34,40,23,9,57,49}), ("กปท.2", new[]{11,29,29,29,40,58}),
        ("กปท.3", new[]{23,12,26,14,49,26}), ("กปท.4", new[]{36,14,97,16,133,30}),
        ("กปท.5", new[]{22,11,105,22,127,33}), ("ปปท.1", new[]{27,29,106,18,133,47}),
        ("ปปท.2", new[]{37,9,54,10,91,19}), ("ปปท.3", new[]{0,0,129,24,129,24}),
        ("ปปท.4", new[]{0,0,133,65,133,65}), ("ปปท.5", new[]{23,21,60,37,83,58}),
        ("ปปท.6", new[]{29,19,120,66,149,85}), ("ปปท.7", new[]{31,23,88,24,119,47}),
        ("ปปท.8", new[]{26,35,65,27,91,62}), ("ปปท.9", new[]{24,14,38,19,62,33}),
        ("กอท.", new[]{29,20,23,4,52,24}),
    };
    public static readonly int[] InquiryTotal = { 352, 276, 1096, 384, 1448, 660 };

    // 2.5 / 2.6 merit (ไต่สวนชี้มูล)
    public static readonly (string Zone, int[] V)[] Merit =
    {
        ("กปท.1", new[]{10,45,0,0,10,45}), ("กปท.2", new[]{6,39,0,0,6,39}),
        ("กปท.3", new[]{14,23,0,2,14,25}), ("กปท.4", new[]{15,20,2,0,17,20}),
        ("กปท.5", new[]{20,21,0,1,20,22}), ("ปปท.1", new[]{20,64,0,0,20,64}),
        ("ปปท.2", new[]{13,7,0,1,13,8}), ("ปปท.3", new[]{23,20,1,2,24,22}),
        ("ปปท.4", new[]{20,31,0,3,20,34}), ("ปปท.5", new[]{38,74,0,0,38,74}),
        ("ปปท.6", new[]{37,26,0,6,37,32}), ("ปปท.7", new[]{43,57,0,0,43,57}),
        ("ปปท.8", new[]{25,32,0,0,25,32}), ("ปปท.9", new[]{25,34,0,0,25,34}),
        ("กอท.", new[]{8,13,0,0,8,13}),
    };
    public static readonly int[] MeritTotal = { 317, 506, 3, 15, 320, 521 };

    // 2.6 post-resolution flow (สไลด์ 7)
    public static readonly (string Label, int Value)[] PostResolution =
    {
        ("พิจารณาวินิจฉัยชี้มูล", 7074), ("ชี้มูลอาญาและวินัย", 3648),
        ("ไม่ชี้มูลอาญาแต่ชี้มูลวินัย", 31), ("ส่ง ป.ป.ช.", 287),
        ("ส่งพนักงานสอบสวน", 739), ("ยุติเรื่อง", 2366), ("ส่งต้นสังกัด", 3),
    };
    public static readonly (string Label, int Value)[] CourtProgress =
    {
        ("ส่งพนักงานอัยการแล้ว", 2065), ("อยู่ระหว่างจัดส่ง", 116),
        ("ศาลพิพากษาแล้ว", 1334), ("ศาลยกฟ้อง", 133),
    };

    // 2.7 budget
    public const long BudgetTotal = 2568375;
    public const long BudgetUsed = 1226625;
    public const long BudgetRemain = 1341750;
}
