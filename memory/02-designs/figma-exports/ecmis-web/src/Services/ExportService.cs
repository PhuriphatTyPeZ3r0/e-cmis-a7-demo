using EcmisWeb.Data;

namespace EcmisWeb.Services;

/// <summary>
/// Export Service
/// One-Click Export for:
/// - แบบ 103 (Standard form)
/// - ปกสำนวน (Cover page)
/// - หนังสือแจ้ง (Notification letter)
/// Output: PDF/Word format
/// </summary>
public class ExportService
{
    private readonly ILogger<ExportService> _logger;

    public ExportService(ILogger<ExportService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Export case as "แบบ 103" template (PDF)
    /// </summary>
    public async Task<byte[]> ExportAsForm103Async(ExportTemplate template)
    {
        try
        {
            _logger.LogInformation($"Exporting as Form 103: {template.CaseNo}");

            // Mock PDF generation
            // In production: Use iTextSharp, SelectPdf, or similar library
            var pdfContent = GenerateForm103PDF(template);

            return pdfContent;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error exporting Form 103: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Export case as "ปกสำนวน" template (PDF)
    /// </summary>
    public async Task<byte[]> ExportAsCoverPageAsync(ExportTemplate template)
    {
        try
        {
            _logger.LogInformation($"Exporting as Cover Page: {template.CaseNo}");

            // Mock PDF generation
            var pdfContent = GenerateCoverPagePDF(template);

            return pdfContent;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error exporting Cover Page: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Export case as "หนังสือแจ้ง" template (PDF)
    /// </summary>
    public async Task<byte[]> ExportAsNotificationLetterAsync(ExportTemplate template)
    {
        try
        {
            _logger.LogInformation($"Exporting as Notification Letter: {template.CaseNo}");

            // Mock PDF generation
            var pdfContent = GenerateNotificationLetterPDF(template);

            return pdfContent;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error exporting Notification Letter: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Export all templates as ZIP file
    /// </summary>
    public async Task<byte[]> ExportAllTemplatesAsync(ExportTemplate template)
    {
        try
        {
            _logger.LogInformation($"Exporting all templates for: {template.CaseNo}");

            // Mock ZIP creation
            // In production: Use System.IO.Compression
            var zipContent = GenerateZipWithAllTemplates(template);

            return zipContent;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error exporting all templates: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Generate Form 103 PDF (Mock)
    /// </summary>
    private byte[] GenerateForm103PDF(ExportTemplate template)
    {
        var content = @$"
═══════════════════════════════════════════════════════════════
                        แบบ 103
              เอกสารการรับเรื่องร้องเรียน ป.ป.ท.
═══════════════════════════════════════════════════════════════

เรื่องที่: {template.CaseNo}
วันที่บันทึก: {template.ProcessDate:dd/MM/yyyy}

ข้อมูลผู้ร้องเรียน:
ชื่อ: {template.ComplainantName}

ข้อมูลบุคคลที่ถูกร้องเรียน:
ชื่อ: {template.AccusedName}
หน่วยงาน: {template.AccusedAgency}

รายละเอียดคำร้องเรียน:
{template.Description}

มอบหมายให้: {template.AssignedToUnit}
วันที่มอบหมาย: {DateTime.Now:dd/MM/yyyy}

───────────────────────────────────────────────────────────────
ลงชื่อ ___________________
     (ผู้รับเรื่อง)
";

        return System.Text.Encoding.UTF8.GetBytes(content);
    }

    /// <summary>
    /// Generate Cover Page PDF (Mock)
    /// </summary>
    private byte[] GenerateCoverPagePDF(ExportTemplate template)
    {
        var content = @$"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              สำนักงาน ปลัดปองคณะ ป.ป.ท.                       ║
║                 PACC ADMINISTRATION OFFICE                    ║
║                                                               ║
║                      ปกสำนวน                                  ║
║                 (CASE COVER PAGE)                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

เรื่องที่: {template.CaseNo}
ประเภท: แบบ 103

ผู้ร้องเรียน: {template.ComplainantName}
บุคคลที่ถูกร้องเรียน: {template.AccusedName}

นำส่งให้: {template.AssignedToUnit}
วันที่นำส่ง: {DateTime.Now:dd/MM/yyyy}

───────────────────────────────────────────────────────────────
หมายเหตุ: เอกสารนี้เป็นปกสำนวนสำหรับการจัดเก็บและติดตามเรื่อง
";

        return System.Text.Encoding.UTF8.GetBytes(content);
    }

    /// <summary>
    /// Generate Notification Letter PDF (Mock)
    /// </summary>
    private byte[] GenerateNotificationLetterPDF(ExportTemplate template)
    {
        var content = @$"
═══════════════════════════════════════════════════════════════

สำนักงาน ปลัดปองคณะ ป.ป.ท.

                      หนังสือแจ้งผล

═══════════════════════════════════════════════════════════════

เรื่อง: แจ้งผลการพิจารณาคำร้องเรียน เรื่องที่ {template.CaseNo}

เรียน: {template.ComplainantName}

ตามคำร้องเรียนของท่านเรื่อง {template.Description}
ที่อยู่เรื่อง การกระทำผิดของ {template.AccusedName} หน่วยงาน {template.AccusedAgency}

สำนักงาน ป.ป.ท. ได้พิจารณาแล้ว โดยดำเนินการดังนี้:

✓ ได้รับเรื่องเมื่อวันที่ {template.ProcessDate:dd/MM/yyyy}
✓ มอบหมายให้กับ: {template.AssignedToUnit}
✓ สถานะ: ในขั้นตอนไต่สวน (Under Investigation)

ท่านจะติดต่อได้ที่ สำนักงาน ป.ป.ท. โทรศัพท์ 1206 หรือ www.anti-corruption.go.th

                    ---ลงชื่อ---

              (องคมนตรี ป.ป.ท.)
              วันที่ {DateTime.Now:dd/MM/yyyy}

───────────────────────────────────────────────────────────────
";

        return System.Text.Encoding.UTF8.GetBytes(content);
    }

    /// <summary>
    /// Generate ZIP with all templates (Mock)
    /// </summary>
    private byte[] GenerateZipWithAllTemplates(ExportTemplate template)
    {
        // Mock implementation
        var zipHeader = new byte[] { 0x50, 0x4B, 0x03, 0x04 }; // ZIP signature
        _logger.LogInformation($"Created ZIP file with all templates for {template.CaseNo}");

        return zipHeader;
    }

    /// <summary>
    /// Get available export templates
    /// </summary>
    public List<string> GetAvailableTemplates()
    {
        return new List<string>
        {
            "แบบ 103",
            "ปกสำนวน",
            "หนังสือแจ้ง"
        };
    }
}
