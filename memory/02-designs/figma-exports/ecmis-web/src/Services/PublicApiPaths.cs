namespace EcmisWeb.Services;

/// <summary>Admin API routes and Blazor pages that must work without a logged-in session.</summary>
internal static class PublicApiPaths
{
    public static bool IsAnonymousApiPath(string path)
    {
        if (string.IsNullOrEmpty(path)) return true;

        return path.StartsWith("/data/", StringComparison.OrdinalIgnoreCase) // static asset (เช่น thai-provinces.json) — สาธารณะ ใช้ในหน้าแชร์ read-only
            || path.StartsWith("/api/auth/", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/api/organizations", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/api/users/register", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/api/users/registrations/status/", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/api/users/check-username", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/api/citizens/", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/api/systems/public", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/api/central-support/public-news", StringComparison.OrdinalIgnoreCase);
    }

    public static bool IsPublicAppPath(string path)
    {
        path = path.TrimEnd('/');
        if (string.IsNullOrEmpty(path)) return false;

        return path.StartsWith("/share/warroom/", StringComparison.OrdinalIgnoreCase) // มุมมองผู้บริหารอ่านอย่างเดียว
            || path.Equals("/login", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/login-light", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/citizen/login", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/register", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/register/citizen", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/register/status", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/citizen/register", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/reset-password", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/forgot-password", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/thaid-callback", StringComparison.OrdinalIgnoreCase);
    }
}
