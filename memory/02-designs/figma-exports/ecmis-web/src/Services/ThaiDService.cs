using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace EcmisWeb.Services;

/// <summary>
/// จัดการ ThaiD OAuth flow ฝั่ง frontend
/// client_secret และ api_key อยู่ backend เท่านั้น — ไม่มีในไฟล์นี้
/// </summary>
public sealed class ThaiDService(IConfiguration config, NavigationManager nav, IJSRuntime js)
{
    private const string IdentityKey = "thaid_identity";

    // ─────────────────────────────────────────────────────────────
    // Initiate
    // ─────────────────────────────────────────────────────────────

    /// <summary>
    /// สร้าง ThaiD auth URL แล้วพา user ออกไปยืนยันตัวตน
    /// flow = "login" | "register" | "register_citizen"
    /// </summary>
    public async Task RedirectToThaiDAsync(string flow)
    {
        await Task.CompletedTask;
        var apiBase = config["ApiBaseUrl:EcmisAdmin"]
            ?? config["ApiBaseUrl:AdminService"]
            ?? "http://localhost:5001/";
        var url = $"{apiBase.TrimEnd('/')}/api/auth/thaid/start?flow={Uri.EscapeDataString(flow)}";
        nav.NavigateTo(url, forceLoad: true);
    }

    // ─────────────────────────────────────────────────────────────
    // Identity (register flow — store/read/clear)
    // ─────────────────────────────────────────────────────────────

    public async Task StoreIdentityAsync(ThaiDIdentity identity)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(identity);
        await js.InvokeVoidAsync("sessionStorage.setItem", IdentityKey, json);
    }

    public async Task<ThaiDIdentity?> ReadIdentityAsync()
    {
        var json = await js.InvokeAsync<string?>("sessionStorage.getItem", IdentityKey);
        if (string.IsNullOrEmpty(json)) return null;
        return System.Text.Json.JsonSerializer.Deserialize<ThaiDIdentity>(json);
    }

    public async Task ClearIdentityAsync() =>
        await js.InvokeVoidAsync("sessionStorage.removeItem", IdentityKey);

    // ── Generic sessionStorage helpers (ใช้ภายใน flow) ─────────────
    public async Task StoreRawAsync(string key, string value) =>
        await js.InvokeVoidAsync("sessionStorage.setItem", key, value);

    public async Task<string?> ReadRawAsync(string key) =>
        await js.InvokeAsync<string?>("sessionStorage.getItem", key);

    public async Task ClearRawAsync(string key) =>
        await js.InvokeVoidAsync("sessionStorage.removeItem", key);

}

// ─────────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────────

public sealed class ThaiDIdentity
{
    public string Reference    { get; set; } = "";
    public string Pid          { get; set; } = "";
    public string TitleTh      { get; set; } = "";
    public string FirstNameTh  { get; set; } = "";
    public string LastNameTh   { get; set; } = "";
    public string FirstNameEn  { get; set; } = "";
    public string LastNameEn   { get; set; } = "";
    public string Ial          { get; set; } = "";
    public string NameTh       { get; set; } = "";
    public string NameEn       { get; set; } = "";
    public string Birthdate    { get; set; } = "";
    public string Gender       { get; set; } = "";
    public string Address      { get; set; } = "";
    public string SmartcardCode { get; set; } = "";
    public string DateOfIssuance { get; set; } = "";
    public string DateOfExpiry { get; set; } = "";
}
