namespace EcmisWeb.Services;

/// <summary>Maps tbl_sys_change_request.tscr_type codes to display labels.</summary>
public static class ChangeRequestDisplay
{
    public static string NormalizeType(string? tscrType) => (tscrType ?? "").Trim() switch
    {
        "01" or "08" or "09" => "org",
        "02" or "05" => "position",
        "06" or "07" => "role",
        "org" or "position" or "role" => (tscrType ?? "").Trim(),
        _ => (tscrType ?? "").Trim()
    };

    public static string TypeLabel(string? tscrType) => NormalizeType(tscrType) switch
    {
        "org" => "หน่วยงาน",
        "position" => "ตำแหน่ง",
        "role" => "กลุ่มสิทธิ์",
        _ => string.IsNullOrEmpty(tscrType) ? "—" : tscrType.Trim()
    };

    /// <summary>หัวข้อการ์ด/คอลัมน์ใน Approvals</summary>
    public static string ApprovalTabLabel(string tabKey) => tabKey switch
    {
        "org-change" => "หน่วยงาน",
        "position-change" => "ตำแหน่ง",
        "role-change" => "กลุ่มสิทธิ์",
        _ => "รายการ"
    };

    public static string ApprovalCardTitle(string tabKey) => tabKey switch
    {
        "org-change" => "คำขอเปลี่ยนหน่วยงาน",
        "position-change" => "คำขอเปลี่ยนตำแหน่ง",
        "role-change" => "คำขอเพิ่มกลุ่มสิทธิ์",
        _ => "คำขอแก้ไข"
    };

    public static string ApprovalTargetColumnHeader(string tabKey) => tabKey switch
    {
        "org-change" => "หน่วยงานใหม่",
        "position-change" => "ตำแหน่งใหม่",
        "role-change" => "กลุ่มสิทธิ์ที่ขอ",
        _ => "รายการใหม่"
    };

    public static string FormatPositionOption(string nameTh, string code) =>
        string.IsNullOrWhiteSpace(code)
            ? nameTh.Trim()
            : $"{nameTh.Trim()}  [ตำแหน่ง · {code.Trim()}]";

    public static string FormatGrantableGroupOption(string name, string code) =>
        string.IsNullOrWhiteSpace(code)
            ? name.Trim()
            : $"{name.Trim()}  [สิทธิ์ · {code.Trim()}]";

    public static string TargetLabel(
        string? tscrType,
        string? orgName,
        string? positionName,
        string? roleName)
    {
        var name = NormalizeType(tscrType) switch
        {
            "org" => orgName,
            "position" => positionName,
            "role" => roleName,
            _ => null
        };
        return string.IsNullOrWhiteSpace(name) ? "—" : name.Trim();
    }

    public static string NormalizeStatus(string? status) => (status ?? "").Trim() switch
    {
        "0" => "pending",
        "1" => "approved",
        "2" => "rejected",
        "pending" or "approved" or "rejected" or "revoked" or "cancelled" => (status ?? "").Trim(),
        _ => (status ?? "").Trim()
    };

    public static string StatusLabel(string? status) => NormalizeStatus(status) switch
    {
        "pending" => "รออนุมัติ",
        "approved" => "อนุมัติ",
        "rejected" => "ปฏิเสธ",
        "revoked" => "ยกเลิก",
        "cancelled" => "ยกเลิกโดยผู้ขอ",
        _ => string.IsNullOrEmpty(status) ? "—" : status.Trim()
    };

    public static string StatusBg(string? status) => NormalizeStatus(status) switch
    {
        "approved" => "#dcfce7",
        "pending" => "#fef3c7",
        "rejected" => "#fee2e2",
        "revoked" or "cancelled" => "#f1f5f9",
        _ => "#f0f2f8"
    };

    public static string StatusColor(string? status) => NormalizeStatus(status) switch
    {
        "approved" => "#15803d",
        "pending" => "#92400e",
        "rejected" => "#991b1b",
        "revoked" or "cancelled" => "#475569",
        _ => "#4a5568"
    };
}
