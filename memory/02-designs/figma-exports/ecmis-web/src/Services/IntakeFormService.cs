using EcmisWeb.Data;

namespace EcmisWeb.Services;

/// <summary>
/// Smart Intake Form Service
/// - Single Data Input that feeds data to investigation layer automatically
/// - Reduces double entry pain point
/// - ThaiID API integration
/// - AI-based case type recommendation
/// </summary>
public class IntakeFormService
{
    private List<IntakeFormData> _forms = new();
    private List<AuditLog> _auditLogs = new();

    // Simulate ThaiID API and AI recommendation
    private readonly HttpClient _httpClient;
    private readonly ILogger<IntakeFormService> _logger;

    public IntakeFormService(HttpClient httpClient, ILogger<IntakeFormService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    /// <summary>
    /// Create new intake form entry
    /// </summary>
    public async Task<IntakeFormData> CreateFormAsync(IntakeFormData form)
    {
        try
        {
            form.Id = _forms.Count + 1;
            form.FirstReceivedDate = DateTime.Now;
            
            // Log audit
            LogAudit(form.ComplaintNo, "Create", "", "Form Created", "System");
            
            _forms.Add(form);
            _logger.LogInformation($"Intake form created: {form.ComplaintNo}");
            
            return form;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating intake form: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Fetch complainant info from ThaiID API
    /// </summary>
    public async Task<(string Name, string FullInfo)> GetThaiIDInfoAsync(string idNo)
    {
        try
        {
            // Mock ThaiID API call
            // In production: Call actual ThaiID API
            
            if (string.IsNullOrEmpty(idNo))
                throw new ArgumentException("ID number is required");

            // Simulate API response
            await Task.Delay(100);
            return ($"Name from ThaiID {idNo}", $"Full info from ThaiID for {idNo}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching ThaiID info: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// AI-based recommendation for case category (ม.18/4 or ม.58/2)
    /// </summary>
    public string GetAICategoryRecommendation(string description, string accusedAgency)
    {
        try
        {
            // Mock AI recommendation
            // In production: Call ML model or AI service
            
            if (string.IsNullOrEmpty(description))
                return "ม.18/4";

            // Simple logic: if accused is government agency + misconduct language -> ม.18/4
            if (accusedAgency.Contains("ราชการ") || 
                description.Contains("ประพฤติมิชอบ") || 
                description.Contains("ทุจริต"))
            {
                return "ม.18/4";
            }

            // Otherwise -> ม.58/2
            return "ม.58/2";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in AI recommendation: {ex.Message}");
            return "ม.18/4"; // Default
        }
    }

    /// <summary>
    /// Update intake form with AI recommendation
    /// </summary>
    public async Task<IntakeFormData> UpdateWithAIRecommendationAsync(IntakeFormData form)
    {
        var oldCategory = form.Category;
        form.Category = GetAICategoryRecommendation(form.Description, form.AccusedAgency);
        
        if (oldCategory != form.Category)
        {
            LogAudit(form.ComplaintNo, "Update", $"Category: {oldCategory}", $"Category: {form.Category}", "AI Service");
        }

        return form;
    }

    /// <summary>
    /// Get all intake forms
    /// </summary>
    public List<IntakeFormData> GetAllForms()
    {
        return _forms;
    }

    /// <summary>
    /// Get form by ID
    /// </summary>
    public IntakeFormData? GetFormById(int id)
    {
        return _forms.FirstOrDefault(f => f.Id == id);
    }

    /// <summary>
    /// Update intake form (records audit log)
    /// </summary>
    public async Task<IntakeFormData> UpdateFormAsync(IntakeFormData updatedForm, string modifiedBy)
    {
        try
        {
            var existingForm = _forms.FirstOrDefault(f => f.Id == updatedForm.Id);
            if (existingForm == null)
                throw new KeyNotFoundException($"Form not found: {updatedForm.Id}");

            // Log changes for audit
            if (existingForm.Description != updatedForm.Description)
            {
                LogAudit(updatedForm.ComplaintNo, "Update", $"Description: {existingForm.Description}", 
                    $"Description: {updatedForm.Description}", modifiedBy);
            }

            // Replace with updated form
            _forms[_forms.IndexOf(existingForm)] = updatedForm;
            _logger.LogInformation($"Intake form updated: {updatedForm.ComplaintNo}");
            
            return updatedForm;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating intake form: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get audit logs for a case
    /// </summary>
    public List<AuditLog> GetAuditLogsForCase(string caseNo)
    {
        return _auditLogs.Where(a => a.CaseNo == caseNo).ToList();
    }

    /// <summary>
    /// Log audit trail
    /// </summary>
    private void LogAudit(string caseNo, string action, string oldValue, string newValue, string modifiedBy)
    {
        _auditLogs.Add(new AuditLog
        {
            Id = _auditLogs.Count + 1,
            CaseNo = caseNo,
            Action = action,
            OldValue = oldValue,
            NewValue = newValue,
            ModifiedBy = modifiedBy,
            ModifiedDate = DateTime.Now
        });
    }
}
