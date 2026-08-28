using EcmisWeb.Models;

namespace EcmisWeb.Services;

public class RegistrationService
{
    private readonly HashSet<string> _usersTable = new(StringComparer.OrdinalIgnoreCase)
    {
        "somchai.j",
        "pranee.s",
        "anucha.m"
    };

    private readonly List<RegistrationRequest> _requests = new()
    {
        new RegistrationRequest
        {
            Id = "A1B2C3D4",
            FirstName = "สมชาย", LastName = "ใจดี",
            FirstNameEn = "Somchai", LastNameEn = "Jaidee",
            Username = "somchai.j",
            Email = "somchai.j@pacc.go.th", Mobile = "081-234-5678",
            Department = "กลุ่มงานสืบสวน", Position = "นักวิชาการยุติธรรมชำนาญการ",
            SupervisorName = "นางสาวมาลี รักดี", SupervisorEmail = "malee.r@pacc.go.th",
            NationalId = "1234567890123",
            ThaiDVerified = true,
            SubmittedAt = DateTime.Now.AddDays(-2),
            Status = RegistrationStatus.Pending
        },
        new RegistrationRequest
        {
            Id = "E5F6G7H8",
            FirstName = "ปราณี", LastName = "สุขสันต์",
            FirstNameEn = "Pranee", LastNameEn = "Suksan",
            Username = "pranee.s",
            Email = "pranee.s@pacc.go.th", Mobile = "082-345-6789",
            Department = "กลุ่มงานกฎหมาย", Position = "นิติกรปฏิบัติการ",
            SupervisorName = "นายวีระ ยุติธรรม", SupervisorEmail = "veera.y@pacc.go.th",
            NationalId = "9876543210987",
            ThaiDVerified = true,
            SubmittedAt = DateTime.Now.AddDays(-1),
            Status = RegistrationStatus.Pending,
            AssignedUsername = "pranee.s",
            AssignedRole = nameof(UserRole.Officer),
            ITNote = "ตรวจสอบแล้ว — สร้าง AD account เรียบร้อย",
            ProvisionedAt = DateTime.Now.AddHours(-3),
            ProvisionedBy = "IT-Admin01"
        },
        new RegistrationRequest
        {
            Id = "I9J0K1L2",
            FirstName = "อนุชา", LastName = "มั่นคง",
            FirstNameEn = "Anucha", LastNameEn = "Mankong",
            Username = "anucha.m",
            Email = "anucha.m@pacc.go.th", Mobile = "083-456-7890",
            Department = "กลุ่มงานบริหาร", Position = "เจ้าพนักงานธุรการ",
            SupervisorName = "นางสมศรี ผดุงชาติ", SupervisorEmail = "somsri.p@pacc.go.th",
            NationalId = "1122334455667",
            ThaiDVerified = false,
            SubmittedAt = DateTime.Now.AddDays(-3),
            Status = RegistrationStatus.Approved,
            AssignedUsername = "anucha.m",
            AssignedRole = nameof(UserRole.Viewer),
            ProvisionedAt = DateTime.Now.AddDays(-2),
            ProvisionedBy = "IT-Admin01",
            ReviewedAt = DateTime.Now.AddDays(-1),
            ReviewedBy = "Admin-Sunisa"
        }
    };

    public List<RegistrationRequest> GetAll() =>
        _requests.OrderByDescending(r => r.SubmittedAt).ToList();

    public List<RegistrationRequest> GetByStatus(RegistrationStatus status) =>
        _requests.Where(r => r.Status == status).OrderByDescending(r => r.SubmittedAt).ToList();

    public RegistrationRequest? GetById(string id) =>
        _requests.FirstOrDefault(r => r.Id == id);

    public RegistrationRequest? GetByTrackingId(string trackingId) =>
        _requests.FirstOrDefault(r => r.TrackingId == trackingId);

    public RegistrationRequest Submit(RegistrationRequest req)
    {
        req.SubmittedAt = DateTime.Now;
        req.Status = RegistrationStatus.Pending;
        _requests.Add(req);
        if (!string.IsNullOrWhiteSpace(req.Username))
            _usersTable.Add(req.Username);
        return req;
    }

    public async Task<UsernameCheckResult> CheckUsernameAsync(string firstNameEn, string lastNameEn)
    {
        // Mock API delay. Replace this method with HTTP GET /api/users/check-username
        // when the auth/user backend is ready.
        await Task.Delay(180);

        var firstName = NormalizeEnglishName(firstNameEn);
        var lastName = NormalizeEnglishName(lastNameEn);

        if (firstName.Length == 0 || lastName.Length == 0)
        {
            return new UsernameCheckResult
            {
                Available = false,
                CheckedAgainst = "users"
            };
        }

        var original = $"{firstName}.{lastName[0]}";
        var candidate = original;
        var used = 1;

        for (var length = 1; length <= lastName.Length; length++)
        {
            candidate = $"{firstName}.{lastName[..length]}";
            used = length;

            if (!UsernameExists(candidate))
            {
                return new UsernameCheckResult
                {
                    Username = candidate,
                    OriginalUsername = original,
                    Available = true,
                    WasAdjusted = !string.Equals(candidate, original, StringComparison.OrdinalIgnoreCase),
                    SurnameCharactersUsed = used,
                    CheckedAgainst = "users"
                };
            }
        }

        var suffix = 2;
        while (UsernameExists($"{firstName}.{lastName}{suffix}"))
            suffix++;

        candidate = $"{firstName}.{lastName}{suffix}";

        return new UsernameCheckResult
        {
            Username = candidate,
            OriginalUsername = original,
            Available = true,
            WasAdjusted = true,
            SurnameCharactersUsed = lastName.Length,
            CheckedAgainst = "users"
        };
    }

    public void ProvisionAccount(string id, string username, string role, string note, string provisionedBy)
    {
        var req = GetById(id);
        if (req is null) return;
        req.AssignedUsername = username;
        req.AssignedRole = role;
        req.ITNote = note;
        req.ProvisionedAt = DateTime.Now;
        req.ProvisionedBy = provisionedBy;
        req.Status = RegistrationStatus.Pending;
    }

    public void Approve(string id, string adminNote, string reviewedBy)
    {
        var req = GetById(id);
        if (req is null) return;
        req.AdminNote = adminNote;
        req.ReviewedAt = DateTime.Now;
        req.ReviewedBy = reviewedBy;
        req.Status = RegistrationStatus.Approved;
    }

    public void Reject(string id, string rejectReason, string reviewedBy)
    {
        var req = GetById(id);
        if (req is null) return;
        req.RejectReason = rejectReason;
        req.ReviewedAt = DateTime.Now;
        req.ReviewedBy = reviewedBy;
        req.Status = RegistrationStatus.Rejected;
    }

    public void RequestMoreInfo(string id, string note, string reviewedBy)
    {
        var req = GetById(id);
        if (req is null) return;
        req.AdminNote = note;
        req.ReviewedBy = reviewedBy;
        req.Status = RegistrationStatus.Pending;
    }

    public int CountByStatus(RegistrationStatus status) =>
        _requests.Count(r => r.Status == status);

    private bool UsernameExists(string username) =>
        _usersTable.Contains(username) ||
        _requests.Any(r =>
            string.Equals(r.Username, username, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(r.AssignedUsername, username, StringComparison.OrdinalIgnoreCase));

    private static string NormalizeEnglishName(string value) =>
        new((value ?? "")
            .Trim()
            .ToLowerInvariant()
            .Where(c => c is >= 'a' and <= 'z')
            .ToArray());
}
