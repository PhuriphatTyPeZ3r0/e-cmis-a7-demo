namespace EcmisWeb.Services;

public sealed class PublicRelationsService
{
    private static int NextId = 1000;
    private readonly List<PublicNewsItem> news = SeedNews();

    public IReadOnlyList<string> Categories { get; } =
    [
        "ข่าวผู้บริหาร",
        "ข่าวคณะกรรมการ",
        "ข่าวประชาสัมพันธ์",
        "ข่าวป้องกัน",
        "ข่าวปราบปราม",
        "วิดีโอ"
    ];

    public IReadOnlyList<string> CategoriesWithAll => ["ทั้งหมด", .. Categories];

    public IReadOnlyList<PublicNewsItem> GetPublishedNews() =>
        news
            .Where(n => n.Status == NewsStatus.Published)
            .OrderByDescending(n => n.Featured)
            .ThenByDescending(n => n.PublishedAt ?? n.UpdatedAt)
            .ToList();

    public IReadOnlyList<PublicNewsItem> GetBackofficeNews() =>
        news
            .OrderByDescending(n => n.UpdatedAt)
            .ToList();

    public PublicNewsItem SaveDraft(PublicNewsDraft draft)
    {
        var item = BuildItem(draft, NewsStatus.Draft, null);
        Upsert(item);
        return item;
    }

    public PublicNewsItem Publish(PublicNewsDraft draft)
    {
        var now = DateTimeOffset.Now;
        var item = BuildItem(draft, NewsStatus.Published, now);

        if (item.Featured)
        {
            for (var i = 0; i < news.Count; i++)
            {
                news[i] = news[i] with { Featured = false };
            }
        }

        Upsert(item);
        return item;
    }

    public void Unpublish(int id)
    {
        var idx = news.FindIndex(n => n.Id == id);
        if (idx < 0) return;
        news[idx] = news[idx] with
        {
            Status = NewsStatus.Draft,
            Featured = false,
            UpdatedAt = DateTimeOffset.Now
        };
    }

    public PublicNewsDraft ToDraft(PublicNewsItem item) => new()
    {
        Id = item.Id,
        Type = item.Type,
        Title = item.Title,
        Summary = item.Summary,
        Body = item.Body,
        Owner = item.Owner,
        DateText = item.DateText,
        Featured = item.Featured,
        VisualClass = item.VisualClass,
        VisualLabel = item.VisualLabel,
        ImageFileName = item.ImageFileName,
        ImageDataUrl = item.ImageDataUrl
    };

    private PublicNewsItem BuildItem(PublicNewsDraft draft, string status, DateTimeOffset? publishedAt)
    {
        var now = DateTimeOffset.Now;
        var type = string.IsNullOrWhiteSpace(draft.Type) ? Categories[0] : draft.Type.Trim();
        var label = string.IsNullOrWhiteSpace(draft.VisualLabel)
            ? BuildVisualLabel(type)
            : draft.VisualLabel.Trim();

        return new PublicNewsItem(
            draft.Id == 0 ? NextId++.GetHashCode() : draft.Id,
            type,
            draft.Title.Trim(),
            draft.Summary.Trim(),
            draft.Body.Trim(),
            string.IsNullOrWhiteSpace(draft.DateText) ? now.ToString("d MMM yyyy") : draft.DateText.Trim(),
            string.IsNullOrWhiteSpace(draft.Owner) ? "กลุ่มสื่อสารองค์กร" : draft.Owner.Trim(),
            draft.Featured,
            string.IsNullOrWhiteSpace(draft.VisualClass) ? VisualClassFor(type) : draft.VisualClass,
            label,
            status,
            draft.ImageFileName,
            draft.ImageDataUrl,
            now,
            publishedAt);
    }

    private void Upsert(PublicNewsItem item)
    {
        var idx = news.FindIndex(n => n.Id == item.Id);
        if (idx >= 0)
        {
            news[idx] = item;
            return;
        }

        news.Add(item);
    }

    private static string BuildVisualLabel(string type) => type switch
    {
        "ข่าวผู้บริหาร" => "PACC",
        "ข่าวคณะกรรมการ" => "BOARD",
        "ข่าวป้องกัน" => "PREV",
        "ข่าวปราบปราม" => "LAW",
        "วิดีโอ" => "PLAY",
        _ => "PR"
    };

    private static string VisualClassFor(string type) => type switch
    {
        "ข่าวผู้บริหาร" => "photo-blue",
        "ข่าวคณะกรรมการ" => "photo-gold",
        "ข่าวป้องกัน" => "photo-green",
        "ข่าวปราบปราม" => "photo-red",
        "วิดีโอ" => "photo-navy",
        _ => "photo-teal"
    };

    private static string NewsImage(string fileName) => $"/img/public-relations/{fileName}";

    private static List<PublicNewsItem> SeedNews()
    {
        var now = DateTimeOffset.Now;
        return
        [
            new(NextId++, "ข่าวผู้บริหาร", "แนวคิดการแก้ไขปัญหาการทุจริตของรัฐบาลต้องนำไปสู่การปฏิบัติที่ชัดเจน", "เข้าตรวจราชการและมอบนโยบายด้านการป้องกันและปราบปรามการทุจริตในภาครัฐของสำนักงาน ป.ป.ท.", "ภาพประชาสัมพันธ์คำกล่าวและสารสำคัญจากผู้บริหาร สำหรับเผยแพร่บนหน้าประชาสัมพันธ์", "24 เม.ย. 2569", "กลุ่มสื่อสารองค์กร", true, "photo-blue", "PACC", NewsStatus.Published, "24-04-69.jpg", NewsImage("24-04-69.jpg"), now.AddDays(-1), now.AddDays(-1)),
            new(NextId++, "ข่าวผู้บริหาร", "ผมเชื่อว่าข้าราชการทุกคนมีความตั้งใจที่จะรับใช้ชาติ", "สื่อประชาสัมพันธ์การประชุมเชิงปฏิบัติการ การบูรณาการเพื่อเสริมสร้างธรรมาภิบาลและความโปร่งใสในหน่วยงานภาครัฐ", "ภาพประชาสัมพันธ์คำกล่าวและสารสำคัญจากผู้บริหาร สำหรับเผยแพร่บนหน้าประชาสัมพันธ์", "31 มี.ค. 2569", "กลุ่มสื่อสารองค์กร", false, "photo-blue", "PACC", NewsStatus.Published, "31-03-69-2.png", NewsImage("31-03-69-2.png"), now.AddDays(-2), now.AddDays(-2)),
            new(NextId++, "ข่าวป้องกัน", "การป้องกันการทุจริตต้องอาศัยความร่วมมือจากทุกภาคส่วน", "ย้ำการสร้างเครือข่ายที่เข้มแข็งเพื่อยับยั้งการทุจริตตั้งแต่ต้นทาง ก่อนเกิดความเสียหายต่อประชาชนและประเทศชาติ", "ภาพประชาสัมพันธ์คำกล่าวและสารสำคัญจากผู้บริหาร สำหรับเผยแพร่บนหน้าประชาสัมพันธ์", "31 มี.ค. 2569", "กลุ่มสื่อสารองค์กร", false, "photo-green", "PREV", NewsStatus.Published, "31-03-69-1.png", NewsImage("31-03-69-1.png"), now.AddDays(-3), now.AddDays(-3)),
            new(NextId++, "ข่าวปราบปราม", "หากพบเจ้าหน้าที่ทุจริตหรือละเลยไม่ปฏิบัติหน้าที่ ผู้บังคับบัญชาไม่สามารถปฏิเสธความรับผิดชอบได้", "ยกระดับความร่วมมือป้องกันและปราบปรามการทุจริต เอาผิดเจ้าหน้าที่รัฐที่เอี่ยวยาเสพติดตามนโยบายเร่งด่วนของรัฐบาล", "ภาพประชาสัมพันธ์คำกล่าวและสารสำคัญจากผู้บริหาร สำหรับเผยแพร่บนหน้าประชาสัมพันธ์", "18 มี.ค. 2569", "กลุ่มสื่อสารองค์กร", false, "photo-red", "LAW", NewsStatus.Published, "key_note_18-03-69.jpg", NewsImage("key_note_18-03-69.jpg"), now.AddDays(-4), now.AddDays(-4)),
            new(NextId++, "ข่าวปราบปราม", "การก่อสร้างสถานที่ต้องมีการขออนุญาตก่อน เมื่อถูกบุกรุกแล้วก็ต้องมีคนรับผิด", "สำนักงาน ป.ป.ท. ร่วมกับหน่วยงานที่เกี่ยวข้อง เปิดปฏิบัติการเข้าตรวจสอบสถานะพื้นที่ครอบครองของที่พักสงฆ์รักษาใจ จังหวัดสระบุรี", "ภาพประชาสัมพันธ์คำกล่าวและสารสำคัญจากผู้บริหาร สำหรับเผยแพร่บนหน้าประชาสัมพันธ์", "18 ก.พ. 2569", "กลุ่มสื่อสารองค์กร", false, "photo-green", "LAW", NewsStatus.Published, "18-02-69.jpg", NewsImage("18-02-69.jpg"), now.AddDays(-5), now.AddDays(-5)),
            new(NextId++, "ข่าวผู้บริหาร", "รัฐบาลจะปฏิรูประบบการอนุมัติ อนุญาต เพื่อสร้างความมั่นใจให้กับนักลงทุน", "พร้อมเร่งทำให้ พ.ร.บ. อำนวยความสะดวกถูกบังคับใช้อย่างจริงจัง และดำเนินการกับผู้มีพฤติกรรมทุจริตคอร์รัปชันอย่างเด็ดขาด", "ภาพประชาสัมพันธ์คำกล่าวและสารสำคัญจากผู้บริหาร สำหรับเผยแพร่บนหน้าประชาสัมพันธ์", "12 ก.พ. 2569", "กลุ่มสื่อสารองค์กร", false, "photo-blue", "PACC", NewsStatus.Published, "12-02-69-5.jpg", NewsImage("12-02-69-5.jpg"), now.AddDays(-6), now.AddDays(-6)),
            new(NextId++, "ข่าวประชาสัมพันธ์", "The Government will reform the approval and licensing system to strengthen investor confidence", "Press release on the 2025 Corruption Perceptions Index (CPI) result at the Government Press Center, Government House", "ภาพประชาสัมพันธ์คำกล่าวและสารสำคัญจากผู้บริหาร สำหรับเผยแพร่บนหน้าประชาสัมพันธ์", "12 ก.พ. 2569", "กลุ่มสื่อสารองค์กร", false, "photo-gold", "PR", NewsStatus.Published, "12-02-69-6.jpg", NewsImage("12-02-69-6.jpg"), now.AddDays(-7), now.AddDays(-7)),
            new(NextId++, "ข่าวคณะกรรมการ", "ต้นเหตุทุจริต คือ การมีกฎหมายมาก ระเบียบมาก และกฎหมายนั้นไปสร้างภาระให้กับประชาชน", "เสนอแนวทางลดกฎหมาย ลดขั้นตอน นำเทคโนโลยีมาใช้เพื่อลดการเผชิญหน้า และให้การคุ้มครองผู้แจ้งเบาะแสทุจริต", "ภาพประชาสัมพันธ์คำกล่าวและสารสำคัญจากผู้บริหาร สำหรับเผยแพร่บนหน้าประชาสัมพันธ์", "12 ก.พ. 2569", "กลุ่มสื่อสารองค์กร", false, "photo-gold", "BOARD", NewsStatus.Published, "12-02-69-4.jpg", NewsImage("12-02-69-4.jpg"), now.AddDays(-8), now.AddDays(-8)),
            new(NextId++, "ข่าวผู้บริหาร", "การอนุมัติ อนุญาต ที่เป็นอุปสรรคแก่นักลงทุน วันนี้เราจะต้องทำให้อุปสรรคเหล่านี้ไม่ให้เป็นอุปสรรคอีกต่อไป", "แถลงข่าวผลคะแนนดัชนีการรับรู้การทุจริต ประจำปี 2568 ณ ศูนย์แถลงข่าวรัฐบาล ตึกนารีสโมสร ทำเนียบรัฐบาล", "ภาพประชาสัมพันธ์คำกล่าวและสารสำคัญจากผู้บริหาร สำหรับเผยแพร่บนหน้าประชาสัมพันธ์", "12 ก.พ. 2569", "กลุ่มสื่อสารองค์กร", false, "photo-blue", "PACC", NewsStatus.Published, "12-02-69-3.jpg", NewsImage("12-02-69-3.jpg"), now.AddDays(-9), now.AddDays(-9)),
            new(NextId++, "ข่าวปราบปราม", "ลงพื้นที่ตรวจสอบข้อเท็จจริงกรณีการเบิกงบแข่งขันฮอกกี้น้ำแข็ง", "สำนักงาน ป.ป.ท. ลงพื้นที่ตรวจสอบข้อเท็จจริงตามนโยบายความรวดเร็ว โปร่งใส และเป็นธรรม", "ภาพประชาสัมพันธ์คำกล่าวและสารสำคัญจากผู้บริหาร สำหรับเผยแพร่บนหน้าประชาสัมพันธ์", "4 ก.พ. 2569", "กลุ่มสื่อสารองค์กร", false, "photo-blue", "LAW", NewsStatus.Published, "04-02-69.jpg", NewsImage("04-02-69.jpg"), now.AddDays(-10), now.AddDays(-10)),

            // ── PACC Videos ──
            new(NextId++, "วิดีโอ", "การประพฤติมิชอบ", "หากพบเจ้าหน้าที่รัฐปฏิบัติหน้าที่ล่าช้า เพิกเฉย หรือประพฤติมิชอบ แจ้ง ป.ป.ท. ได้ทันที สายด่วน 1206", "วิดีโอประชาสัมพันธ์รณรงค์ต่อต้านการทุจริตและประพฤติมิชอบในภาครัฐ", "2568", "PaccThailand", false, "photo-navy", "▶", NewsStatus.Published, "", "", now.AddDays(-1), now.AddDays(-1)),
            new(NextId++, "วิดีโอ", "สรุปผลการดำเนินงานสำคัญของสำนักงาน ป.ป.ท.", "ครบรอบ 17 ปี ป.ป.ท. พลังศรัทธา พลังล่าทุจริต ผลการดำเนินงานและความสำเร็จที่สำคัญตลอด 17 ปีที่ผ่านมา", "วิดีโอสรุปผลการดำเนินงานประจำปีของสำนักงาน ป.ป.ท.", "2568", "PaccThailand", false, "photo-blue", "▶", NewsStatus.Published, "", "", now.AddDays(-2), now.AddDays(-2)),
            new(NextId++, "วิดีโอ", "การ์ตูนแอนิเมชัน เรื่อง \"รูปแบบการทุจริต\"", "การ์ตูนเพื่อการเรียนรู้ด้านการป้องกันการทุจริต สร้างความเข้าใจให้ประชาชนทุกวัย", "สื่อการ์ตูนแอนิเมชันเพื่อการป้องกันและปราบปรามการทุจริต", "2568", "PaccThailand", false, "photo-gold", "▶", NewsStatus.Published, "", "", now.AddDays(-3), now.AddDays(-3)),
            new(NextId++, "วิดีโอ", "ใจ พ.ร.บ. มาตรการของขวัญ กำนัลและประโยชน์อื่นใด", "สำนักงาน ป.ป.ท. รณรงค์ No Gift Policy เสริมสร้างวัฒนธรรมองค์กรให้โปร่งใสและซื่อสัตย์", "วิดีโอรณรงค์ No Gift Policy ประจำปี 2568", "2568", "PaccThailand", false, "photo-red", "▶", NewsStatus.Published, "", "", now.AddDays(-4), now.AddDays(-4)),
            new(NextId++, "วิดีโอ", "เส้นทางคนซื่อสัตย์ ตอนที่ 1", "ซีรีส์วิดีโอส่งเสริมคุณธรรมจริยธรรมข้าราชการ เพื่อสร้างแรงบันดาลใจในการปฏิบัติหน้าที่ด้วยความซื่อสัตย์", "ซีรีส์วิดีโอส่งเสริมคุณธรรมจริยธรรม", "2568", "PaccThailand", false, "photo-green", "▶", NewsStatus.Published, "", "", now.AddDays(-5), now.AddDays(-5)),
            new(NextId++, "วิดีโอ", "รายงานประจำปี ป.ป.ท. 2568", "ผลการดำเนินงานตามพันธกิจด้านการป้องกันและปราบปรามการทุจริตในภาครัฐ ประจำปีงบประมาณ 2568", "วิดีโอรายงานประจำปีสำนักงาน ป.ป.ท.", "2568", "PaccThailand", false, "photo-navy", "▶", NewsStatus.Published, "", "", now.AddDays(-6), now.AddDays(-6)),
            new(NextId++, "วิดีโอ", "ป.ป.ท. ปราบโกง ตอน ยาเสพติด", "ยกระดับความร่วมมือป้องกันและปราบปรามเจ้าหน้าที่รัฐที่เกี่ยวพันกับยาเสพติดตามนโยบายรัฐบาล", "วิดีโอรณรงค์ปราบปรามการทุจริตเกี่ยวกับยาเสพติด", "2568", "PaccThailand", false, "photo-blue", "▶", NewsStatus.Published, "", "", now.AddDays(-7), now.AddDays(-7)),
            new(NextId++, "วิดีโอ", "ธรรมาภิบาลภาครัฐ สู่ประเทศไทยใสสะอาด", "การบูรณาการธรรมาภิบาลและความโปร่งใสในหน่วยงานภาครัฐ เพื่อสร้างความเชื่อมั่นให้ประชาชน", "วิดีโอส่งเสริมธรรมาภิบาลและความโปร่งใส", "2568", "PaccThailand", false, "photo-teal", "▶", NewsStatus.Published, "", "", now.AddDays(-8), now.AddDays(-8))
        ];
    }
}

public static class NewsStatus
{
    public const string Draft = "draft";
    public const string Published = "published";
}

public sealed record PublicNewsItem(
    int Id,
    string Type,
    string Title,
    string Summary,
    string Body,
    string DateText,
    string Owner,
    bool Featured,
    string VisualClass,
    string VisualLabel,
    string Status,
    string ImageFileName,
    string ImageDataUrl,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? PublishedAt);

public sealed class PublicNewsDraft
{
    public int Id { get; set; }
    public string Type { get; set; } = "ข่าวประชาสัมพันธ์";
    public string Title { get; set; } = "";
    public string Summary { get; set; } = "";
    public string Body { get; set; } = "";
    public string Owner { get; set; } = "กลุ่มสื่อสารองค์กร";
    public string DateText { get; set; } = "";
    public bool Featured { get; set; }
    public string VisualClass { get; set; } = "photo-teal";
    public string VisualLabel { get; set; } = "PR";
    public string ImageFileName { get; set; } = "";
    public string ImageDataUrl { get; set; } = "";
}
