using System.Text;

namespace EcmisWeb.Services;

/// <summary>โทเคนลิงก์แชร์แบบอ่านอย่างเดียว (war room) — base64url ของ "{unixExpiry}.{guid}"
/// หมายเหตุ: ตรวจอายุฝั่ง client เพื่อเดโม่เท่านั้น production ต้องให้ ecmis-admin ออก/ตรวจแทน
/// (จุดเสียบ: แทนที่คลาสนี้ด้วย API call โดย signature เดิม)</summary>
public static class ShareToken
{
    public static string Create(DateTime expiresUtc)
    {
        var raw = $"{new DateTimeOffset(expiresUtc.ToUniversalTime()).ToUnixTimeSeconds()}.{Guid.NewGuid():N}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(raw))
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public static bool TryGetExpiry(string token, out DateTime expiresUtc)
    {
        expiresUtc = default;
        if (string.IsNullOrWhiteSpace(token)) return false;
        try
        {
            var s = token.Replace('-', '+').Replace('_', '/');
            s = s.PadRight(s.Length + (4 - s.Length % 4) % 4, '=');
            var raw = Encoding.UTF8.GetString(Convert.FromBase64String(s));
            var dot = raw.IndexOf('.');
            if (dot <= 0 || !long.TryParse(raw[..dot], out var unix)) return false;
            expiresUtc = DateTimeOffset.FromUnixTimeSeconds(unix).UtcDateTime;
            return true;
        }
        catch
        {
            return false;
        }
    }

    public static bool IsValid(string token, DateTime nowUtc)
        => TryGetExpiry(token, out var exp) && exp > nowUtc;
}
