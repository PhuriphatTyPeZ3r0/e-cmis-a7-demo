namespace EcmisWeb.Services;

internal static class AuthSessionConstants
{
    /// <summary>Access token สั้น — ต่ออายุอัตโนมัติผ่าน refresh (8 ชม.)</summary>
    public const int AccessTokenLifetimeMinutes = 15;
    /// <summary>ระยะเวลา login รวม — นับจาก refresh token ฝั่ง server</summary>
    public const int RefreshTokenLifetimeHours = 8;

    public static DateTimeOffset DefaultAccessExpiresAt() =>
        DateTimeOffset.UtcNow.AddMinutes(AccessTokenLifetimeMinutes);
}
