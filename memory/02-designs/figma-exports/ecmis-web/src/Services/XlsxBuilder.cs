using System.IO.Compression;
using System.Text;

namespace EcmisWeb.Services;

/// <summary>
/// สร้างไฟล์ .xlsx (Office Open XML) จริงโดยไม่พึ่ง library ภายนอก
/// ใช้ inline string ทุก cell — เพียงพอสำหรับรายงานตาราง header + rows
/// </summary>
public static class XlsxBuilder
{
    public static byte[] Build(string sheetName, IReadOnlyList<string> headers, IReadOnlyList<string[]> rows)
    {
        using var stream = new MemoryStream();
        using (var zip = new ZipArchive(stream, ZipArchiveMode.Create, leaveOpen: true))
        {
            AddEntry(zip, "[Content_Types].xml", """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                  <Default Extension="xml" ContentType="application/xml"/>
                  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
                  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
                  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
                </Types>
                """);

            AddEntry(zip, "_rels/.rels", """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
                </Relationships>
                """);

            AddEntry(zip, "xl/workbook.xml", $"""
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
                  <sheets><sheet name="{XmlEscape(SafeSheetName(sheetName))}" sheetId="1" r:id="rId1"/></sheets>
                </workbook>
                """);

            AddEntry(zip, "xl/_rels/workbook.xml.rels", """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
                  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
                </Relationships>
                """);

            AddEntry(zip, "xl/styles.xml", """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
                  <fonts count="2">
                    <font><sz val="11"/><name val="Tahoma"/></font>
                    <font><b/><sz val="11"/><name val="Tahoma"/></font>
                  </fonts>
                  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
                  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
                  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
                  <cellXfs count="2">
                    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
                    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
                  </cellXfs>
                </styleSheet>
                """);

            AddEntry(zip, "xl/worksheets/sheet1.xml", BuildSheetXml(headers, rows));
        }
        return stream.ToArray();
    }

    private static string BuildSheetXml(IReadOnlyList<string> headers, IReadOnlyList<string[]> rows)
    {
        var sb = new StringBuilder();
        sb.Append("""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>""");
        sb.Append("""<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>""");

        sb.Append("<row>");
        foreach (var h in headers)
            AppendCell(sb, h, styleIndex: 1);
        sb.Append("</row>");

        foreach (var row in rows)
        {
            sb.Append("<row>");
            foreach (var cell in row)
                AppendCell(sb, cell, styleIndex: 0);
            sb.Append("</row>");
        }

        sb.Append("</sheetData></worksheet>");
        return sb.ToString();
    }

    private static void AppendCell(StringBuilder sb, string? value, int styleIndex)
    {
        sb.Append("<c t=\"inlineStr\" s=\"").Append(styleIndex).Append("\"><is><t xml:space=\"preserve\">")
          .Append(XmlEscape(value ?? ""))
          .Append("</t></is></c>");
    }

    private static string XmlEscape(string value)
    {
        var sb = new StringBuilder(value.Length);
        foreach (var ch in value)
        {
            switch (ch)
            {
                case '&': sb.Append("&amp;"); break;
                case '<': sb.Append("&lt;"); break;
                case '>': sb.Append("&gt;"); break;
                case '"': sb.Append("&quot;"); break;
                // ตัดอักขระควบคุมที่ XML 1.0 ไม่อนุญาต
                case < ' ' when ch is not '\t' and not '\n' and not '\r': break;
                default: sb.Append(ch); break;
            }
        }
        return sb.ToString();
    }

    private static string SafeSheetName(string name)
    {
        var cleaned = new string(name.Where(c => c is not ('\\' or '/' or '*' or '[' or ']' or ':' or '?')).ToArray());
        if (string.IsNullOrWhiteSpace(cleaned)) cleaned = "Sheet1";
        return cleaned.Length <= 31 ? cleaned : cleaned[..31];
    }

    private static void AddEntry(ZipArchive zip, string path, string content)
    {
        var entry = zip.CreateEntry(path, CompressionLevel.Optimal);
        using var writer = new StreamWriter(entry.Open(), new UTF8Encoding(false));
        writer.Write(content.TrimStart());
    }
}
