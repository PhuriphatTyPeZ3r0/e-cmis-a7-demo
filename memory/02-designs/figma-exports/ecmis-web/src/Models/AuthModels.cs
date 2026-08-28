namespace EcmisWeb.Models;

public enum RegistrationStatus
{
    Pending,
    Approved,
    Rejected
}

public enum UserRole
{
    Viewer,
    Officer,
    Supervisor,
    Admin,
    ITSupport
}

public class RegistrationRequest
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8].ToUpper();
    public string? TrackingIdOverride { get; set; }
    public string TrackingId => TrackingIdOverride ?? $"REG-{Id}";

    // ── บัญชีผู้ใช้งาน ──────────────────────────────────────────
    public string Username { get; set; } = "";

    // ── ข้อมูลส่วนบุคคล (บันทึก tsr_name / tsr_lname) ─────────
    public string TitleTh { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Nickname { get; set; } = "";
    public DateOnly? BirthDate { get; set; }

    // ── ชื่อ Latin สำหรับสร้าง tsr_username (ไม่มีคอลัมน์แยกใน DB) ──
    public string FirstNameEn { get; set; } = "";
    public string LastNameEn { get; set; } = "";

    // ── ช่องทางติดต่อ ────────────────────────────────────────────
    public string PhoneInternal { get; set; } = "";
    public string PhoneExtension { get; set; } = "";
    public string Mobile { get; set; } = "";
    public string MobileBackup { get; set; } = "";
    /// <summary>อีเมลราชการ (@pacc.go.th)</summary>
    public string Email { get; set; } = "";
    /// <summary>อีเมลสำรอง/ส่วนตัว (ไม่บังคับ)</summary>
    public string EmailBackup { get; set; } = "";

    // ── ThaiD ────────────────────────────────────────────────────
    public string NationalId { get; set; } = "";
    public bool ThaiDVerified { get; set; }
    public string? ThaiDCitizenId { get; set; }
    public string? ThaiDReference { get; set; }

    // ── ตำแหน่งงาน ───────────────────────────────────────────────
    public string JobTitle { get; set; } = "";
    public string Bureau { get; set; } = "";
    public string Division { get; set; } = "";
    public string SubDivision { get; set; } = "";
    public string OfficerType { get; set; } = "";

    // ═══ TOBE 14.1.1: NEW FIELDS ═══
    public int? TargetOrgId { get; set; }
    public bool PrivacyConsent { get; set; }

    // ═══ TOBE 14.4.6: ระบบงานที่ขอเข้าใช้งานตอนสมัคร ═══
    public int[]? RequestedSystemIds { get; set; }
    // ── Legacy / admin fields ─────────────────────────────────────
    public string Phone => Mobile;
    public string Department { get; set; } = "";
    public string Position { get; set; } = "";
    public string SupervisorName { get; set; } = "";
    public string SupervisorEmail { get; set; } = "";
    public string Password { get; set; } = "";

    // ── Registration workflow fields ─────────────────────────────────
    public DateTime SubmittedAt { get; set; }
    public RegistrationStatus Status { get; set; }
    public string? AssignedUsername { get; set; }
    public string? AssignedRole { get; set; }
    public string? ITNote { get; set; }
    public DateTime? ProvisionedAt { get; set; }
    public string? ProvisionedBy { get; set; }
    public string? RejectReason { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedBy { get; set; }
    public string? AdminNote { get; set; }
}

public sealed class UsernameCheckResult
{
    public string Username { get; set; } = "";
    public string OriginalUsername { get; set; } = "";
    public bool Available { get; set; }
    public bool WasAdjusted { get; set; }
    public int SurnameCharactersUsed { get; set; }
    public string CheckedAgainst { get; set; } = "";
}

public sealed class RegistrationSubmitResult
{
    public string TrackingId { get; set; } = "";
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string AccountStatus { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTimeOffset? OtpExpiresAt { get; set; }
    public string DevOtp { get; set; } = "";
    public bool EmailSent { get; set; }
}

public sealed class CitizenRegistrationRequest
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string? Mobile { get; set; }
    public string? NationalId { get; set; }
    public bool PrivacyConsent { get; set; }
    public bool ThaiDVerified { get; set; }
    public string? ThaiDReference { get; set; }
}

public sealed class CitizenRegistrationResult
{
    public string TrackingId { get; set; } = "";
    public int UserId { get; set; }
}

public sealed class TosDto
{
    public int Id { get; set; }
    public string Version { get; set; } = "";
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string EffectiveDate { get; set; } = "";
}