# V6 ซ่อนแท็บซ้ำซาก + แชร์ Read-only ผ่านลิงก์/QR — Design Spec

**วันที่:** 2026-06-11 · **สถานะ:** อนุมัติแล้ว (ผ่าน session)

## 1. Topbar V6 สะอาดขึ้น

แท็บ ภาพรวม/จัดซื้อจัดจ้าง/ใบอนุญาต/ร้องเรียน/คดีเผชิญเหตุฯ/รายงาน/รายงานผู้บริหาร **ไม่ขับเคลื่อนอะไรใน V6** (ActiveTab ใช้แค่ V1) → ซ่อนทั้ง 7 รายการเมื่อ `SelectedVersion == 6`; **ปุ่มเฟือง (dev mode) คงไว้**; V1–V5 เห็นแท็บเหมือนเดิม

## 2. แชร์มุมมองอ่านอย่างเดียว

### ปุ่ม + กล่องแชร์ (ฝั่งเจ้าหน้าที่)

- ปุ่ม `bi-share-fill` บน topbar ข้างปุ่มเต็มจอ → เปิด popover:
  - ตัวเลือกอายุลิงก์: 1 ชม. / 24 ชม. / **7 วัน (ค่าเริ่มต้น)** / 30 วัน — เปลี่ยนแล้ว gen ลิงก์+QR ใหม่
  - ช่องลิงก์ (readonly) + ปุ่มคัดลอก (`navigator.clipboard`)
  - **QR code** (lib `qrcodejs` ผ่าน jsdelivr CDN แบบเดียวกับ SheetJS) ให้ผู้บริหารสแกน
  - ข้อความ: "ผู้รับลิงก์ดูได้อย่างเดียว ไม่ต้องเข้าสู่ระบบ"

### Token

`src/Services/ShareToken.cs` (static, C# ล้วน, มี unit test):
- `Create(expiresUtc)` → base64url ของ `"{unixExpiry}.{guid}"`
- `TryGetExpiry(token, out exp)` / `IsValid(token, nowUtc)`

> **ข้อจำกัด (ระบุชัด):** ตรวจอายุฝั่ง client เพื่อเดโม่เท่านั้น — ใครรู้รูปแบบก็ปลอม token ได้ Production จริงต้องให้ ecmis-admin ออก/ตรวจ token (จุดเสียบ: แทน `ShareToken` ด้วย API call เดียว)

### หน้า Read-only (ฝั่งผู้บริหาร)

- `src/Pages/Public/SharedWarRoom.razor` — `@page "/share/warroom/{Token}"` + `@layout BlankLayout` (ไม่ผ่าน auth ของ MainLayout)
- token ถูกต้อง → render `<Pages.Analytics.Index ShareMode="true" />`; หมดอายุ/ผิด → หน้าข้อความ "ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่"
- `Index.ShareMode = true` มีผล:
  - บังคับ V6, เพิ่มคลาส `v6-share` ที่ shell (สูง `100dvh` เต็ม, margin 0 — เพราะไม่มี topbar/padding ของ MainLayout)
  - ซ่อน: ปุ่ม Export, ปุ่มแชร์, ปุ่มเฟือง dev, ลิงก์ "สถิติฉบับเต็ม" ใน drill (พาไปหน้า auth)
  - แสดงแบดจ์ "อ่านอย่างเดียว" บน topbar; ปุ่มเต็มจอ + drill-down แผนที่ + ค้นหาคดี ใช้ได้ (เป็นการอ่าน)
- กัน fragile: ห่อ `ComplaintApi.GetComplaintsAsync()` ใน try/catch (เดิมไม่มี — backend ล่มแล้วหน้าตายทั้งหน้า กระทบหน้าแชร์โดยตรง)

## Testing

- xUnit: ShareToken create→valid, expired→invalid, token ขยะ→invalid (ไม่ throw)
- Playwright: เปิดลิงก์ valid → เห็น war room ไม่มี sidebar + แบดจ์ read-only + ไม่มีปุ่ม Export; token หมดอายุ → ข้อความหมดอายุ; กล่องแชร์โชว์ลิงก์+QR
- เทสเดิมผ่านครบ, build 0 errors

## ไม่ทำ (YAGNI)

ไม่มีระบบเพิกถอนลิงก์, ไม่มี audit log การเปิดดู, ไม่มีรหัสผ่านลิงก์ — รอ backend จริง
