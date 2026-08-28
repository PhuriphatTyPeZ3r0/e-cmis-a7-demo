# Analytics Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/analytics` ให้เข้ากับ design language ของ E-CMIS — เพิ่ม MainLayout navbar, ใช้ gold/navy token เดียวกับ Login, รองรับ light/dark toggle

**Architecture:** Token variables scope อยู่ใน `.an-page` wrapper class override `wr-*` styles ที่มีอยู่ โดยไม่กระทบหน้าอื่น Layout เปลี่ยนจาก `BlankLayout` → `MainLayout` Theme state เก็บใน `Index.razor @code` block

**Tech Stack:** Blazor WebAssembly (.NET 8), CSS custom properties, Chart.js 4.4, Bootstrap Icons

---

## Files ที่แก้ไข

| File | Action | หน้าที่ |
|------|--------|---------|
| `src/wwwroot/css/analytics.css` | Modify | เพิ่ม token block + override `wr-*` + header CSS |
| `src/Pages/Analytics/Index.razor` | Modify | เปลี่ยน layout, wrapper class, `_isDark` state, header markup, bug fix |
| `src/Pages/Analytics/Index.razor.css` | Modify | ลบ `an-*` classes ที่ไม่ได้ใช้ (cleanup) |

**ไม่แตะ:** Login.razor, ComplaintCreate.razor, ecmis.css, Program.cs, Data/ ทั้งหมด

---

### Task 1: เพิ่ม design token block ใน analytics.css

**Files:**
- Modify: `src/wwwroot/css/analytics.css` (prepend ด้านบนสุดของไฟล์)

- [ ] **Step 1: เพิ่ม token block ก่อน comment `/* ═══ E-CMIS ... */` ที่อยู่บรรทัดแรก**

```css
/* ── ANALYTICS PAGE TOKENS ─────────────────────────────────── */
.an-page {
  --ec-bg:      #050b18;
  --ec-bg2:     #080f1f;
  --ec-card-bg: #0d1422;
  --ec-card-bd: rgba(200,169,110,.18);
  --ec-gold:    #c8a96e;
  --ec-gold-hi: #e8c98a;
  --ec-gold-lo: rgba(200,169,110,.12);
  --ec-text:    #e2e8f0;
  --ec-muted:   rgba(255,255,255,.42);
  --ec-sep:     rgba(255,255,255,.07);
}
.an-page.an-light {
  --ec-bg:      #eaf0fb;
  --ec-bg2:     #ffffff;
  --ec-card-bg: #ffffff;
  --ec-card-bd: rgba(26,53,117,.14);
  --ec-text:    #0d1b42;
  --ec-muted:   rgba(13,27,62,.48);
  --ec-sep:     #e2e8f0;
}

```

- [ ] **Step 2: verify token อยู่บนสุด**

```bash
head -20 /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web/src/wwwroot/css/analytics.css
```

Expected: เห็น `.an-page {` ที่บรรทัดแรกๆ

---

### Task 2: Override wr-* panel styles ด้วย tokens

**Files:**
- Modify: `src/wwwroot/css/analytics.css` (append ด้านล่างสุด)

- [ ] **Step 1: Append override block ท้ายไฟล์** (ต้องอยู่หลัง `wr-*` definitions ทั้งหมด เพื่อ cascade ชนะ)

```css

/* ── TOKEN OVERRIDES — must come after all wr-* definitions ── */

/* light mode: override wr-command-center gradient background */
.an-page.an-light,
.an-page.an-light.wr-command-center {
  background: var(--ec-bg) !important;
}

/* panels */
.an-page .wr-panel {
  background: var(--ec-card-bg);
  border-color: var(--ec-card-bd);
  position: relative;
}
.an-page .wr-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg,
    transparent, var(--ec-gold-hi) 40%,
    var(--ec-gold) 50%, var(--ec-gold-hi) 60%, transparent);
  opacity: .4;
  pointer-events: none;
}
.an-page .wr-panel-head    { border-bottom-color: var(--ec-sep); }
.an-page .wr-panel-title   { color: var(--ec-text); }
.an-page .wr-panel-badge   { background: var(--ec-gold-lo); color: var(--ec-gold-hi); }

/* tables */
.an-page .wr-rank-tbl th   { color: var(--ec-muted); border-bottom-color: var(--ec-sep); }
.an-page .wr-rank-tbl td   { color: var(--ec-text);  border-bottom-color: var(--ec-sep); }
.an-page .wr-rank-tbl tr:hover td        { background: rgba(200,169,110,.04); }
.an-page.an-light .wr-rank-tbl tr:hover td { background: #f1f5f9; }

/* text helpers */
.an-page .wr-strong  { color: var(--ec-text); }
.an-page .wr-muted   { color: var(--ec-muted); }

/* map side */
.an-page .wr-region-row         { background: var(--ec-card-bg); border-bottom-color: var(--ec-sep); }
.an-page .wr-region-row span    { color: var(--ec-muted); }
.an-page .wr-map-metric         { border-color: var(--ec-sep); background: rgba(15,23,42,.5); }
.an-page.an-light .wr-map-metric { background: #f0f4ff; }
.an-page .wr-panel-mini-title   { color: var(--ec-muted); }

/* alert feed */
.an-page .wr-alert-feed-row        { background: var(--ec-card-bg); border-color: var(--ec-sep); }
.an-page .wr-alert-copy strong     { color: var(--ec-text); }
.an-page .wr-alert-copy small      { color: var(--ec-muted); }

/* analysis cards */
.an-page .wr-analysis-body div  { background: var(--ec-card-bg); }
.an-page .wr-analysis-body      { background: var(--ec-sep); }
.an-page .wr-analysis-title     { color: var(--ec-text); }

/* stat rows */
.an-page .wr-stat-label { color: var(--ec-muted); }
.an-page .wr-stat-val   { color: var(--ec-text); }

/* buttons */
.an-page .wr-btn       { color: var(--ec-text); border-color: var(--ec-sep); background: var(--ec-gold-lo); }
.an-page .wr-btn:hover { background: rgba(200,169,110,.18); }

/* footer */
.an-page .wr-footer-bar  { border-top-color: var(--ec-sep); }
.an-page .wr-footer-src  { color: var(--ec-muted); border-color: var(--ec-sep); background: rgba(255,255,255,.02); }
.an-page.an-light .wr-footer-src { background: var(--ec-card-bg); }

/* section strip */
.an-page .wr-section-strip        { color: var(--ec-muted); }
.an-page .wr-section-strip::after { background: var(--ec-sep); }
```

- [ ] **Step 2: ตรวจว่า override block อยู่หลัง WAR ROOM PAGE definition**

```bash
grep -n "TOKEN OVERRIDES\|WAR ROOM PAGE" /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web/src/wwwroot/css/analytics.css
```

Expected: line ของ `TOKEN OVERRIDES` > line ของ `WAR ROOM PAGE`

---

### Task 3: เพิ่ม header CSS ใน analytics.css

**Files:**
- Modify: `src/wwwroot/css/analytics.css` (append ต่อจาก Task 2 block)

- [ ] **Step 1: Append header CSS ท้ายไฟล์**

```css

/* ── ANALYTICS HEADER ───────────────────────────────────────── */
.an-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0 14px; border-bottom: 1px solid var(--ec-sep);
  margin-bottom: 16px; flex-wrap: wrap; gap: 10px; position: relative;
}
.an-hdr::before {
  content: '';
  position: absolute; top: 0; left: 8%; right: 8%; height: 1px;
  background: linear-gradient(90deg,
    transparent, var(--ec-gold-hi) 40%,
    var(--ec-gold) 50%, var(--ec-gold-hi) 60%, transparent);
  opacity: .55;
}
.an-hdr-left  { display: flex; align-items: center; gap: 14px; }
.an-hdr-right { display: flex; align-items: center; gap: 10px; }

.an-hdr-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(150deg, #12265a 0%, #060c1a 100%);
  border: 1px solid rgba(200,169,110,.38);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: var(--ec-gold-hi); flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0,0,0,.35), 0 0 0 4px rgba(200,169,110,.06);
}
.an-page.an-light .an-hdr-icon {
  background: linear-gradient(150deg, #1a3575, #0d2258);
  border-color: rgba(26,53,117,.25); color: #fff;
}

.an-hdr-title { font-size: 1.05rem; font-weight: 800; color: var(--ec-text); letter-spacing: .01em; }
.an-hdr-sub   { font-size: .73rem; color: var(--ec-muted); margin-top: 2px; }

.an-live-bdg {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 999px;
  background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.3);
  color: #34d399; font-size: .7rem; font-weight: 700;
}
.an-live-bdg::before {
  content: ''; width: 7px; height: 7px; border-radius: 50%;
  background: #34d399; animation: an-hdr-pulse 1.4s infinite;
}
@keyframes an-hdr-pulse {
  0%,100% { opacity: 1; transform: scale(1); }
  50%     { opacity: .5; transform: scale(.7); }
}

.an-hdr-ts {
  font-size: .75rem; color: var(--ec-muted);
  padding: 4px 10px; border: 1px solid var(--ec-sep);
  border-radius: 8px; background: rgba(255,255,255,.03);
}
.an-page.an-light .an-hdr-ts { background: var(--ec-card-bg); }

.an-theme-btn {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; cursor: pointer; transition: transform .22s, background .22s;
  background: rgba(255,255,255,.07);
  border: 1.5px solid rgba(200,169,110,.25);
  color: rgba(200,169,110,.8);
}
.an-theme-btn:hover { transform: scale(1.12); background: rgba(200,169,110,.14); color: var(--ec-gold-hi); }
.an-page.an-light .an-theme-btn { background: #eef3ff; border-color: rgba(13,27,62,.14); color: #1a3575; }
.an-page.an-light .an-theme-btn:hover { background: #dce8ff; color: #0d2258; }

@media (max-width: 600px) {
  .an-hdr-ts    { display: none; }
  .an-hdr-title { font-size: .9rem; }
}
```

- [ ] **Step 2: verify keyframe ไม่ซ้ำ**

```bash
grep -c "an-hdr-pulse" /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web/src/wwwroot/css/analytics.css
```

Expected: `2` (1 ที่ `animation:` และ 1 ที่ `@keyframes`)

---

### Task 4: Update Index.razor — layout + wrapper + state

**Files:**
- Modify: `src/Pages/Analytics/Index.razor`

- [ ] **Step 1: เปลี่ยน layout directive บรรทัด 2**

เดิม:
```razor
@layout BlankLayout
```
ใหม่:
```razor
@layout MainLayout
```

- [ ] **Step 2: เพิ่ม fields และ stub method ใน `@code` block หลัง `private bool _loading = true;`**

```csharp
private bool _isDark = true;
private bool _chartsInitialized;
private void ToggleTheme() => _isDark = !_isDark;
```

(Task 6 จะ upgrade `ToggleTheme` เป็น `async Task` ภายหลัง)

- [ ] **Step 3: เปลี่ยน outer wrapper div (บรรทัด ~7)**

เดิม:
```razor
<div class="wr-page wr-command-center">
```
ใหม่:
```razor
<div class="wr-page wr-command-center an-page @(_isDark ? "" : "an-light")">
```

- [ ] **Step 4: build ทดสอบ**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet build src/EcmisWeb.csproj 2>&1 | tail -5
```

Expected: `Build succeeded.`

---

### Task 5: เพิ่ม header markup ใน Index.razor

**Files:**
- Modify: `src/Pages/Analytics/Index.razor`

- [ ] **Step 1: เพิ่ม header block หลัง `<div class="wr-page wr-command-center an-page ...">` ก่อน `<div class="wr-command-grid wr-mb">`**

```razor
    <div class="an-hdr">
        <div class="an-hdr-left">
            <div class="an-hdr-icon">
                <i class="bi bi-bar-chart-fill"></i>
            </div>
            <div>
                <div class="an-hdr-title">วิเคราะห์สถิติ TOR 12</div>
                <div class="an-hdr-sub">สำนักงาน ป.ป.ท. · ปีงบประมาณ 2567</div>
            </div>
        </div>
        <div class="an-hdr-right">
            <span class="an-live-bdg">LIVE</span>
            <span class="an-hdr-ts">อัปเดต @DateTime.Now.ToString("HH:mm")</span>
            <button class="an-theme-btn" @onclick="ToggleTheme"
                    title="@(_isDark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด")">
                <i class="bi @(_isDark ? "bi-sun-fill" : "bi-moon-stars-fill")"></i>
            </button>
        </div>
    </div>
```

- [ ] **Step 2: build ทดสอบ**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet build src/EcmisWeb.csproj 2>&1 | tail -5
```

Expected: `Build succeeded.`

---

### Task 6: แก้ bug OnAfterRenderAsync + update ToggleTheme + chart calls

**Files:**
- Modify: `src/Pages/Analytics/Index.razor` (`@code` block)

- [ ] **Step 1: เปลี่ยน `OnAfterRenderAsync` ให้ render charts แค่ครั้งเดียว**

เดิม:
```csharp
protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (!_loading)
    {
        await RenderChartsAsync();
    }
}
```
ใหม่:
```csharp
protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (!_loading && !_chartsInitialized)
    {
        _chartsInitialized = true;
        await RenderChartsAsync();
    }
}
```

- [ ] **Step 2: เปลี่ยน `ToggleTheme` จาก sync void → async Task เพื่อ re-render charts ด้วย isDark ใหม่**

เดิม:
```csharp
private void ToggleTheme() => _isDark = !_isDark;
```
ใหม่:
```csharp
private async Task ToggleTheme()
{
    _isDark = !_isDark;
    await JS.InvokeVoidAsync("destroyAllAnalyticsCharts");
    await RenderChartsAsync();
}
```

- [ ] **Step 3: เปลี่ยน `true` hardcode → `_isDark` ทุก call ใน `RenderChartsAsync`**

เดิม:
```csharp
await JS.InvokeVoidAsync("initAnalyticsChart", "chartMonthly", "bar",
    _monthlyLabels, _monthlyData.Cast<object>().ToArray(), new[] { "#2563eb", "#0f766e", "#d97706", "#7c3aed", "#dc2626" }, true);

await JS.InvokeVoidAsync("initAnalyticsChart", "chartInvestigation", "bar",
    new[] { "รับใหม่", "เบื้องต้น", "ชี้มูล", "หลังมติ", "ยุติ" },
    new object[] { 124, 96, 67, 54, 19 },
    new[] { "#2563eb", "#0f766e", "#7c3aed", "#d97706", "#dc2626" }, true);

await JS.InvokeVoidAsync("initAnalyticsChart", "chartRisk", "doughnut",
    new[] { "สูงมาก", "สูง", "ปานกลาง", "ต่ำ" },
    new object[] { 189, 456, 389, 200 },
    new[] { "#dc2626", "#ea580c", "#d97706", "#65a30d" }, true);
```
ใหม่ (เปลี่ยนแค่ `true` → `_isDark` ทุก call):
```csharp
await JS.InvokeVoidAsync("initAnalyticsChart", "chartMonthly", "bar",
    _monthlyLabels, _monthlyData.Cast<object>().ToArray(), new[] { "#2563eb", "#0f766e", "#d97706", "#7c3aed", "#dc2626" }, _isDark);

await JS.InvokeVoidAsync("initAnalyticsChart", "chartInvestigation", "bar",
    new[] { "รับใหม่", "เบื้องต้น", "ชี้มูล", "หลังมติ", "ยุติ" },
    new object[] { 124, 96, 67, 54, 19 },
    new[] { "#2563eb", "#0f766e", "#7c3aed", "#d97706", "#dc2626" }, _isDark);

await JS.InvokeVoidAsync("initAnalyticsChart", "chartRisk", "doughnut",
    new[] { "สูงมาก", "สูง", "ปานกลาง", "ต่ำ" },
    new object[] { 189, 456, 389, 200 },
    new[] { "#dc2626", "#ea580c", "#d97706", "#65a30d" }, _isDark);
```

- [ ] **Step 4: build ทดสอบ**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet build src/EcmisWeb.csproj 2>&1 | tail -5
```

Expected: `Build succeeded.`

---

### Task 7: Clean up Index.razor.css

**Files:**
- Modify: `src/Pages/Analytics/Index.razor.css`

- [ ] **Step 1: แทนที่ไฟล์ทั้งหมด** — `an-*` classes ที่มีอยู่ไม่มี markup ใดใช้ (markup ใช้ `wr-*` และ `an-hdr-*` ที่อยู่ใน `analytics.css` แล้ว)

```css
/* Analytics scoped styles — global styles live in wwwroot/css/analytics.css */
```

- [ ] **Step 2: verify**

```bash
wc -l /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web/src/Pages/Analytics/Index.razor.css
```

Expected: `1` หรือ `2` (comment เดียว)

---

### Task 8: Visual verification + commit

- [ ] **Step 1: เปิดแอปที่ `http://localhost:5000/analytics`**

ถ้าแอปไม่ได้รันอยู่:
```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet run --project src/EcmisWeb.csproj --no-build
```

- [ ] **Step 2: ตรวจ dark mode (default)**
  - มี sidebar/navbar จาก MainLayout
  - header: gold shimmer line ด้านบน, icon box สี gold, LIVE badge กระพริบ, toggle button
  - panels มีขอบทองบาง + gold shimmer ด้านบนแต่ละ panel
  - panel badge สี gold แทน navy
  - charts แสดงถูกต้อง (dark grid, dark tooltip)

- [ ] **Step 3: กดปุ่ม toggle ☀ — ตรวจ light mode**
  - พื้นหลังเปลี่ยนเป็น `#eaf0fb`
  - cards สีขาว ขอบ navy
  - icon box เปลี่ยนเป็น navy gradient
  - charts re-render ด้วย light grid
  - toggle icon เปลี่ยนเป็น 🌙

- [ ] **Step 4: กดปุ่ม toggle 🌙 — กลับ dark mode**
  - ทุกอย่างกลับสู่ dark mode
  - charts re-render ด้วย dark grid

- [ ] **Step 5: commit**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && git add src/Pages/Analytics/Index.razor src/Pages/Analytics/Index.razor.css src/wwwroot/css/analytics.css && git commit -m "$(cat <<'EOF'
feat: redesign analytics page to match E-CMIS design language

- เปลี่ยน BlankLayout → MainLayout เพิ่ม navbar/sidebar
- เพิ่ม token block (gold/navy) scoped ใน .an-page ไม่กระทบหน้าอื่น
- override wr-* panel/card ด้วย token สีใหม่ (gold border + shimmer)
- เพิ่ม header พร้อม icon gold, LIVE badge, dark/light toggle
- รองรับ light mode ผ่าน .an-light class
- แก้ bug OnAfterRenderAsync ที่ render charts ซ้ำทุก re-render

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```
