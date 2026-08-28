# Analytics Page Redesign — Design Spec
**Date:** 2026-05-25  
**Scope:** `src/Pages/Analytics/Index.razor` และไฟล์ CSS ที่เกี่ยวข้องเท่านั้น  
**ไม่แตะ:** Login, Complaint, หน้าอื่นๆ ทั้งหมด

---

## เป้าหมาย

ทำให้หน้า Analytics ดู "เป็นแอปเดียวกัน" กับหน้า Login และ Complaint โดย:
1. เพิ่ม navbar/sidebar ผ่าน MainLayout
2. ใช้ชุดสีและ token เดียวกับ Login (navy + gold)
3. รองรับ light/dark toggle

---

## Section 1 — Design Tokens (Scoped)

Token จะ **ไม่ใช้ `:root`** เพื่อหลีกเลี่ยงผลกระทบกับหน้าอื่น ใส่ใน wrapper class แทน

```css
/* analytics.css หรือ Index.razor.css */
.an-page {
  --ec-bg:        #050b18;
  --ec-bg2:       #080f1f;
  --ec-card-bg:   #0d1422;
  --ec-card-bd:   rgba(200,169,110,.18);
  --ec-gold:      #c8a96e;
  --ec-gold-hi:   #e8c98a;
  --ec-gold-lo:   rgba(200,169,110,.12);
  --ec-text:      #e2e8f0;
  --ec-muted:     rgba(255,255,255,.42);
  --ec-sep:       rgba(255,255,255,.07);
  --ec-navy:      #1a3575;
}

.an-page.an-light {
  --ec-bg:        #eaf0fb;
  --ec-bg2:       #ffffff;
  --ec-card-bg:   #ffffff;
  --ec-card-bd:   rgba(26,53,117,.14);
  --ec-text:      #0d1b42;
  --ec-muted:     rgba(13,27,62,.48);
  --ec-sep:       #e2e8f0;
}
```

สีเหล่านี้มาจาก Login.razor โดยตรง (`--ink`, `--gold`, `--gold-hi`, `--navy`)

---

## Section 2 — Layout & Header

### Layout
```razor
@layout MainLayout   ← เปลี่ยนจาก BlankLayout
```

### Header bar
- Icon box สี gold (เหมือน Login's `lx-icon`)
- ชื่อ "วิเคราะห์สถิติ TOR 12" + subtitle "สำนักงาน ป.ป.ท."
- `● LIVE` pulsing green badge
- Timestamp อัปเดตล่าสุด
- ปุ่ม dark/light toggle มุมขวา (icon `bi-sun-fill` / `bi-moon-stars-fill`)
- เส้น gold shimmer 1px ด้านบน header (เหมือน `lx-right::before` ใน Login)

### Toggle state (Blazor)
```csharp
private bool _isDark = true;
private void ToggleTheme() => _isDark = !_isDark;
```
Wrapper div: เพิ่ม `an-page` เข้าไปในคลาสที่มีอยู่แล้ว ไม่ลบ `wr-page wr-command-center`:
```razor
<div class="wr-page wr-command-center an-page @(_isDark ? "" : "an-light")">
```
`wr-*` ยังทำงานด้าน layout/structure, `an-page` token override ด้านสี

---

## Section 3 — Panel & Card Style

### การเปลี่ยนแปลง
CSS เดิม `wr-*` ยังคงอยู่ครบ เพิ่ม override ด้วย token ใหม่เท่านั้น

| Property | เดิม | ใหม่ |
|----------|------|------|
| Panel background | `#0d1422` hardcode | `var(--ec-card-bg)` |
| Panel border | `rgba(60,100,200,.15)` navy | `var(--ec-card-bd)` gold/navy |
| Panel top shimmer | ไม่มี | เส้น gold 1px ด้านบน |
| Panel title color | `#cbd5e1` | `var(--ec-text)` |
| Muted text | `rgba(255,255,255,.35)` | `var(--ec-muted)` |
| Separator | `rgba(255,255,255,.06)` | `var(--ec-sep)` |

### KPI Cards
- Top accent bar 3px ยังคงเหมือนเดิม (blue/teal/violet/red gradient)
- เฉพาะ card "เรื่องร้องเรียนทั้งหมด" และ "สัญญาณเสี่ยงสูง" เปลี่ยน accent เป็น gold gradient
- Background ใช้ `var(--ec-card-bg)` แทน hardcode

### Risk Score Badges
- `.risk-red`, `.risk-orange`, `.risk-yellow` — คงไว้เหมือนเดิม (ชัดเจนและ semantic)

---

## Section 4 — Light Mode

### สิ่งที่เปลี่ยนเมื่อ toggle เป็น light

| Element | Dark | Light |
|---------|------|-------|
| Page bg | `#050b18` | `#eaf0fb` |
| Card bg | `#0d1422` | `#ffffff` |
| Card border | gold บาง | navy บาง |
| ข้อความหลัก | `#e2e8f0` | `#0d1b42` |
| Muted text | `rgba(255,255,255,.42)` | `rgba(13,27,62,.48)` |
| Table row hover | dark overlay | `#f8fafc` |
| Rank table header | `rgba(255,255,255,.35)` | `#64748b` |

### Charts
`initAnalyticsChart(id, type, labels, data, colors, isDark)` รับ `isDark` parameter อยู่แล้ว  
เปลี่ยนจาก hardcode `true` → ส่ง `_isDark` แทน:
```csharp
await JS.InvokeVoidAsync("initAnalyticsChart", "chartMonthly", "bar",
    _monthlyLabels, _monthlyData.Cast<object>().ToArray(),
    new[] { "#2563eb", ... }, _isDark);  // ← ส่ง _isDark
```

---

## ไฟล์ที่เปลี่ยน

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `src/Pages/Analytics/Index.razor` | เปลี่ยน layout, เพิ่ม header, เพิ่ม `_isDark` state, แก้ `RenderChartsAsync` |
| `src/wwwroot/css/analytics.css` | เพิ่ม `.an-page` token block, override `wr-*` ด้วย token |
| `src/Pages/Analytics/Index.razor.css` | ลบ class `an-*` ที่ไม่ได้ใช้ออก (cleanup) |

**ไม่แตะเลย:** Login.razor, ComplaintCreate.razor, ecmis.css, Program.cs, ComplaintData.cs

---

## ข้อจำกัด / สิ่งที่ไม่ทำ

- ข้อมูล hardcode (TOP 10 ความเสี่ยง, ALERT feed, 12 modules) — คงไว้ทั้งหมด
- แก้ bug `OnAfterRenderAsync` ที่ไม่เช็ค `firstRender` — **ทำด้วยเลยในครั้งนี้** เพราะเกี่ยวกับ chart re-render
- ไม่สร้าง shared token file ระดับโปรเจกต์ — scope ใน `.an-page` เท่านั้น
