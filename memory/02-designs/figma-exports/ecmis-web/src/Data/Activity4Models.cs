namespace EcmisWeb.Data;

/// <summary>
/// Smart Intake Form Model - Single Data Input
/// </summary>
public record IntakeFormData
{
    public int Id { get; set; }
    public string ComplaintNo { get; set; } = "";
    public string ChannelReceived { get; set; } = "";  // 15 channels
    public DateTime ReceivedDate { get; set; } = DateTime.Now;
    
    // Complainant Info
    public string ComplainantName { get; set; } = "";
    public string ComplainantType { get; set; } = "individual"; // individual, organization
    public string ComplainantIdNo { get; set; } = "";
    public string ComplainantPhone { get; set; } = "";
    
    // Accused Person/Agency
    public string AccusedName { get; set; } = "";
    public string AccusedAgency { get; set; } = "";
    public string AccusedPosition { get; set; } = "";
    
    // Complaint Details
    public string Category { get; set; } = "ม.18/4";  // ม.18/4 or ม.58/2
    public string Description { get; set; } = "";
    public string Province { get; set; } = "";
    
    // Documents
    public List<DocumentMetadata> AttachedDocuments { get; set; } = new();
    
    // SLA
    public DateTime FirstReceivedDate { get; set; }  // Not equal to KeyDate
    public string ParentCaseNo { get; set; } = "";   // for case splitting
    
    // Routing (for Dashboard display)
    public string AssignedToUnit { get; set; } = "";
    public string AssignedToOfficer { get; set; } = "";
    public string RoutingStatus { get; set; } = "pending";  // pending, accepted, returned, discipline
}

/// <summary>
/// Document Metadata with Split File Logic
/// </summary>
public record DocumentMetadata
{
    public int Id { get; set; }
    public string FileName { get; set; } = "";
    public long FileSizeBytes { get; set; }
    public string FileType { get; set; } = "";  // PDF, Word, Image, etc.
    public int PageCount { get; set; }
    public DateTime UploadedDate { get; set; }
    
    // Split Logic
    public bool IsSplit { get; set; }
    public int TotalSplitParts { get; set; } = 1;  // 1, 2, 3... (100-500 pages per part)
    public int CurrentPartNumber { get; set; } = 1;
    public string SplitGroupId { get; set; } = "";  // Links all parts together
}

/// <summary>
/// Case Routing Decision
/// </summary>
public record CaseRoutingDecision
{
    public int Id { get; set; }
    public string CaseNo { get; set; } = "";
    public DateTime DecisionDate { get; set; } = DateTime.Now;
    
    public string RoutingDecision { get; set; } = "accept";  // accept, returnToOmbudsman, discipline
    
    // Accept case
    public string AssignedToUnit { get; set; } = "";
    public string AssignedToOfficer { get; set; } = "";
    
    // Return to Ombudsman (must be within 15 days)
    public string ReturnReason { get; set; } = "";
    public DateTime? ReturnDate { get; set; }
    
    // Send to Discipline (สพท.)
    public string DisciplineUnit { get; set; } = "";
    
    // Audit
    public string CreatedBy { get; set; } = "";
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string ModifiedBy { get; set; } = "";
    public DateTime? ModifiedDate { get; set; }
    public List<AuditLog> AuditLogs { get; set; } = new();
}

/// <summary>
/// Audit Log for all modifications
/// </summary>
public record AuditLog
{
    public int Id { get; set; }
    public string CaseNo { get; set; } = "";
    public string Action { get; set; } = "";  // Create, Update, Delete, Export
    public string OldValue { get; set; } = "";
    public string NewValue { get; set; } = "";
    public string ModifiedBy { get; set; } = "";
    public DateTime ModifiedDate { get; set; } = DateTime.Now;
}

/// <summary>
/// SLA Tracking
/// </summary>
public record SLATracking
{
    public int Id { get; set; }
    public string CaseNo { get; set; } = "";
    public DateTime FirstReceivedDate { get; set; }  // SLA starts here
    public DateTime Deadline { get; set; }
    public int RemainingDays { get; set; }
    public bool IsNearDeadline { get; set; }  // < 6 months
    public string Status { get; set; } = "in-progress";  // in-progress, completed, overdue
}

/// <summary>
/// Export Template Model
/// </summary>
public record ExportTemplate
{
    public string TemplateType { get; set; } = "";  // "แบบ103", "ปกสำนวน", "หนังสือแจ้ง"
    public string CaseNo { get; set; } = "";
    public string ComplainantName { get; set; } = "";
    public string AccusedName { get; set; } = "";
    public string AccusedAgency { get; set; } = "";
    public string Description { get; set; } = "";
    public DateTime ProcessDate { get; set; } = DateTime.Now;
    public string AssignedToUnit { get; set; } = "";
}

/// <summary>
/// 15 Complaint Channels Statistics
/// </summary>
public record ChannelStatistics
{
    public string ChannelName { get; set; } = "";
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}

/// <summary>
/// Province Heatmap Data
/// </summary>
public record ProvinceHeatmap
{
    public string ProvinceName { get; set; } = "";
    public int CaseCount { get; set; }
    public decimal Percentage { get; set; }
    public int AlertCount { get; set; }  // Cases near SLA deadline
}

/// <summary>
/// Dashboard KPI Cards
/// </summary>
public record DashboardKPI
{
    public int NewCases { get; set; }
    public int PendingFilter { get; set; }
    public int ReturnedToOmbudsman { get; set; }
    public int SentToDiscipline { get; set; }
    public int TotalCases { get; set; }
    public List<ChannelStatistics> ChannelStats { get; set; } = new();
    public List<ProvinceHeatmap> ProvinceHeatmaps { get; set; } = new();
    public List<SLATracking> AlertCases { get; set; } = new();  // < 6 months remaining
}
