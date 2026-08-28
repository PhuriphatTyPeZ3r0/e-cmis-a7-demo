# TOR 12 Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the TOR 12 "ระบบวิเคราะห์และรายงานผล" dashboard at `/analytics` with 12 analysis sections, dual dark/light themes, CSV export, and print support — using live data from `ComplaintApiService`.

**Architecture:** Rewrite `Pages/Analytics/Index.razor` as the single page with all 12 analysis sections. Chart.js 4.4.0 (already loaded) is called via a new `analytics.js` JS interop file. All LINQ computations happen in Blazor C# from `ComplaintApiService.GetComplaintsAsync()`. NavMenu gets a dedicated "วิเคราะห์/รายงาน" group (separated from "จัดการระบบ").

**Tech Stack:** Blazor WebAssembly (.NET 8), Chart.js 4.4.0, Bootstrap Icons 1.11.3, `window.ecmis.downloadTextFile` (existing), `window.ecmis.printReport` (existing), scoped CSS custom properties for dual-theme

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/Components/Layout/NavMenu.razor` | Modify | Add `group12Open`, new analytics nav group, update `SetActiveGroup` |
| `src/wwwroot/js/analytics.js` | Create | Generic Chart.js init/destroy for analytics page |
| `src/wwwroot/index.html` | Modify | Load `analytics.js` after `dashboard.js` |
| `src/Pages/Analytics/Index.razor.css` | Create | Dual dark/light theme via CSS custom properties |
| `src/Pages/Analytics/Index.razor` | Rewrite | All 12 analysis sections + KPI + export |

---

## Task 1: Add Analytics Nav Group to NavMenu

**Files:**
- Modify: `src/Components/Layout/NavMenu.razor` (lines ~235–261 and ~571–583)

- [ ] **Step 1: Open NavMenu.razor and locate the two edit points**

  Read the file and find:
  1. The `group11Open` block (Data Migration) ending around line 261 — we insert the analytics group after it
  2. The `SetActiveGroup` method (line 572) — we update the `groupSysOpen` line

- [ ] **Step 2: Add `group12Open` bool to the field declarations (around line 663)**

  In the `@code` section, add after `private bool group11Open;`:

  ```csharp
  private bool group12Open;
  ```

- [ ] **Step 3: Insert the new "วิเคราะห์/รายงาน" nav group block**

  Insert after the closing `}` of the `group11Open` (Data Migration) block (after line ~261), before the `@* — ระบบ (User Management) — *@` comment:

  ```razor
  @* — ระบบงานที่ 12: ANALYTICS / วิเคราะห์และรายงานผล — *@
  @if (_navReady && CanReadReports)
  {
      <div class="nav-group">
          <div class="nav-group-toggle @(group12Open ? "open" : "")" @onclick="() => group12Open = !group12Open" title="วิเคราะห์และรายงานผล">
              <div class="nav-group-label">
                  <i class="bi bi-bar-chart-line-fill"></i>
                  <span>วิเคราะห์/รายงาน</span>
              </div>
              <i class="bi bi-chevron-down nav-group-arrow"></i>
          </div>
          <div class="nav-group-items @(group12Open ? "open" : "")">
              <NavLink class="nav-sublink" href="/analytics" Match="NavLinkMatch.All">
                  <i class="bi bi-speedometer2"></i> แดชบอร์ดวิเคราะห์
              </NavLink>
          </div>
      </div>
  }
  ```

- [ ] **Step 4: Remove the analytics link from "จัดการระบบ" group**

  In the "จัดการระบบ" group (around line 286–289), remove these lines:

  ```razor
  @if (CanReadReports)
  {
      <NavLink class="nav-sublink" href="/analytics" Match="NavLinkMatch.All">
          <i class="bi bi-bar-chart-line"></i> สถิติ/วิเคราะห์
      </NavLink>
  }
  ```

- [ ] **Step 5: Update SetActiveGroup to open group12 for /analytics**

  In `SetActiveGroup` method, find the line:
  ```csharp
  groupSysOpen = path.StartsWith("/admin") || path.StartsWith("/analytics");
  ```

  Change to:
  ```csharp
  groupSysOpen = path.StartsWith("/admin");
  group12Open  = path.StartsWith("/analytics");
  ```

- [ ] **Step 6: Run the app and verify**

  ```bash
  cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web/src
  dotnet run
  ```

  Expected: sidebar shows "วิเคราะห์/รายงาน" group with "แดชบอร์ดวิเคราะห์" link. Click `/analytics` — group12 opens, groupSys does not. No link to analytics inside "จัดการระบบ" anymore.

- [ ] **Step 7: Commit**

  ```bash
  git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/Components/Layout/NavMenu.razor
  git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(nav): add dedicated analytics nav group for TOR 12"
  ```

---

## Task 2: Create analytics.js

**Files:**
- Create: `src/wwwroot/js/analytics.js`

- [ ] **Step 1: Create the file**

  Create `/Users/thanthita.korn/Desktop/E-CMIS/ecmis-web/src/wwwroot/js/analytics.js`:

  ```javascript
  window._analyticsCharts = {};

  window.initAnalyticsChart = function (canvasId, type, labels, data, bgColors, isDark) {
      if (window._analyticsCharts[canvasId]) {
          window._analyticsCharts[canvasId].destroy();
          delete window._analyticsCharts[canvasId];
      }
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      isDark = isDark !== false;
      const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,27,62,0.07)';
      const tickColor  = isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(13,27,62,0.5)';
      const tooltipBg  = isDark ? 'rgba(8,12,28,0.95)'     : 'rgba(255,255,255,0.97)';
      const tooltipTxt = isDark ? '#fff'                    : '#1a3575';

      const isHorizontal = type === 'bar-h';
      const chartType = isHorizontal ? 'bar' : type;

      const config = {
          type: chartType,
          data: {
              labels: labels,
              datasets: [{
                  data: data,
                  backgroundColor: bgColors || labels.map((_, i) => `hsl(${(i * 37 + 200) % 360},55%,${isDark ? 55 : 48}%)`),
                  borderColor: 'transparent',
                  borderWidth: 0,
                  borderRadius: type === 'bar' || isHorizontal ? 4 : 0,
                  hoverOffset: type === 'doughnut' ? 6 : 0
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: isHorizontal ? 'y' : 'x',
              plugins: {
                  legend: {
                      display: type === 'doughnut',
                      position: 'right',
                      labels: { color: tickColor, font: { family: 'Sarabun', size: 11 }, padding: 12 }
                  },
                  tooltip: {
                      backgroundColor: tooltipBg,
                      titleColor: tooltipTxt,
                      bodyColor: tickColor,
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,27,62,0.12)',
                      borderWidth: 1,
                      padding: 10
                  }
              },
              scales: type === 'doughnut' ? {} : {
                  x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 } } },
                  y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 } }, beginAtZero: true }
              },
              cutout: type === 'doughnut' ? '62%' : undefined
          }
      };

      window._analyticsCharts[canvasId] = new Chart(canvas.getContext('2d'), config);
  };

  window.initGroupedBarChart = function (canvasId, labels, datasets, isDark) {
      if (window._analyticsCharts[canvasId]) {
          window._analyticsCharts[canvasId].destroy();
          delete window._analyticsCharts[canvasId];
      }
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      isDark = isDark !== false;
      const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,27,62,0.07)';
      const tickColor = isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(13,27,62,0.5)';
      const tooltipBg = isDark ? 'rgba(8,12,28,0.95)'     : 'rgba(255,255,255,0.97)';

      window._analyticsCharts[canvasId] = new Chart(canvas.getContext('2d'), {
          type: 'bar',
          data: { labels, datasets: datasets.map(ds => ({ ...ds, borderRadius: 4 })) },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: { labels: { color: tickColor, font: { family: 'Sarabun', size: 11 } } },
                  tooltip: { backgroundColor: tooltipBg, titleColor: tickColor, bodyColor: tickColor, borderWidth: 1, borderColor: gridColor, padding: 10 }
              },
              scales: {
                  x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 } } },
                  y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 } }, beginAtZero: true }
              }
          }
      });
  };

  window.destroyAllAnalyticsCharts = function () {
      Object.values(window._analyticsCharts).forEach(c => c.destroy());
      window._analyticsCharts = {};
  };

  window.reinitAnalyticsChartsIfNeeded = function (isDark) {
      // Called by MainLayout on theme toggle — Blazor re-renders and calls initAnalyticsChart again
      // So we just destroy here; the Blazor AfterRender will re-init
      window.destroyAllAnalyticsCharts();
  };
  ```

- [ ] **Step 2: Register the script in index.html**

  In `src/wwwroot/index.html`, find the line with `dashboard.js` and add after it:

  ```html
  <script src="js/analytics.js?v=1"></script>
  ```

  So the block looks like:
  ```html
  <script src="js/dashboard.js?v=3"></script>
  <script src="js/analytics.js?v=1"></script>
  ```

- [ ] **Step 3: Commit**

  ```bash
  git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/wwwroot/js/analytics.js src/wwwroot/index.html
  git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(analytics): add analytics.js for Chart.js interop"
  ```

---

## Task 3: Create Index.razor.css (dual-theme)

**Files:**
- Create: `src/Pages/Analytics/Index.razor.css`

- [ ] **Step 1: Create the CSS file**

  Create `/Users/thanthita.korn/Desktop/E-CMIS/ecmis-web/src/Pages/Analytics/Index.razor.css`:

  ```css
  /* ── Dark theme tokens (default) ─────────────────────────── */
  .an-shell {
    --an-bg:         #0f1117;
    --an-card-bg:    #1c1c2e;
    --an-card-bd:    rgba(255,255,255,.07);
    --an-title-c:    #e2e8f0;
    --an-sub-c:      rgba(255,255,255,.45);
    --an-label-c:    rgba(255,255,255,.55);
    --an-value-c:    #fff;
    --an-note-c:     rgba(255,255,255,.35);
    --an-sep:        rgba(255,255,255,.06);
    --an-row-hover:  rgba(255,255,255,.04);
    --an-badge-c:    rgba(255,255,255,.08);

    /* KPI accent colors */
    --an-kpi1-bg:    rgba(26,53,117,.35);
    --an-kpi1-bd:    rgba(26,53,117,.6);
    --an-kpi1-c:     #93b4ff;
    --an-kpi2-bg:    rgba(217,119,6,.15);
    --an-kpi2-bd:    rgba(217,119,6,.35);
    --an-kpi2-c:     #fbbf24;
    --an-kpi3-bg:    rgba(5,150,105,.12);
    --an-kpi3-bd:    rgba(5,150,105,.3);
    --an-kpi3-c:     #34d399;
    --an-kpi4-bg:    rgba(124,58,237,.12);
    --an-kpi4-bd:    rgba(124,58,237,.3);
    --an-kpi4-c:     #a78bfa;

    /* Alert row */
    --an-alert-bg:   rgba(220,38,38,.08);
    --an-alert-bd:   rgba(220,38,38,.25);
    --an-alert-c:    #f87171;
  }

  /* ── Light theme override ────────────────────────────────── */
  .app-light .an-shell {
    --an-bg:         #f5f6fa;
    --an-card-bg:    #fff;
    --an-card-bd:    #e2e8f0;
    --an-title-c:    #0d1b3e;
    --an-sub-c:      #64748b;
    --an-label-c:    #475569;
    --an-value-c:    #0d1b3e;
    --an-note-c:     #94a3b8;
    --an-sep:        #e2e8f0;
    --an-row-hover:  #f1f5f9;
    --an-badge-c:    #f1f5f9;

    --an-kpi1-bg:    #eff6ff;
    --an-kpi1-bd:    #bfdbfe;
    --an-kpi1-c:     #1d4ed8;
    --an-kpi2-bg:    #fffbeb;
    --an-kpi2-bd:    #fde68a;
    --an-kpi2-c:     #92400e;
    --an-kpi3-bg:    #f0fdf4;
    --an-kpi3-bd:    #bbf7d0;
    --an-kpi3-c:     #065f46;
    --an-kpi4-bg:    #f5f3ff;
    --an-kpi4-bd:    #ddd6fe;
    --an-kpi4-c:     #5b21b6;

    --an-alert-bg:   #fff5f5;
    --an-alert-bd:   #fed7d7;
    --an-alert-c:    #9b1c1c;
  }

  /* ── Layout ─────────────────────────────────────────────── */
  .an-shell {
    background: var(--an-bg);
    min-height: 100%;
    padding: 0 0 32px;
  }

  .an-header {
    padding: 20px 0 16px;
    border-bottom: 1px solid var(--an-sep);
    margin-bottom: 20px;
  }

  .an-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--an-title-c);
    line-height: 1.3;
  }

  .an-subtitle {
    font-size: .825rem;
    color: var(--an-sub-c);
    margin-top: 3px;
  }

  /* ── KPI Banner ─────────────────────────────────────────── */
  .an-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
    margin-bottom: 22px;
  }

  .an-kpi {
    background: var(--an-card-bg);
    border: 1px solid var(--an-card-bd);
    border-radius: 12px;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .an-kpi.kpi-1 { background: var(--an-kpi1-bg); border-color: var(--an-kpi1-bd); }
  .an-kpi.kpi-2 { background: var(--an-kpi2-bg); border-color: var(--an-kpi2-bd); }
  .an-kpi.kpi-3 { background: var(--an-kpi3-bg); border-color: var(--an-kpi3-bd); }
  .an-kpi.kpi-4 { background: var(--an-kpi4-bg); border-color: var(--an-kpi4-bd); }

  .an-kpi-label { font-size: .775rem; color: var(--an-label-c); font-weight: 500; }
  .an-kpi-value { font-size: 2rem; font-weight: 800; color: var(--an-value-c); line-height: 1; }
  .an-kpi.kpi-1 .an-kpi-value { color: var(--an-kpi1-c); }
  .an-kpi.kpi-2 .an-kpi-value { color: var(--an-kpi2-c); }
  .an-kpi.kpi-3 .an-kpi-value { color: var(--an-kpi3-c); }
  .an-kpi.kpi-4 .an-kpi-value { color: var(--an-kpi4-c); }
  .an-kpi-note  { font-size: .73rem; color: var(--an-note-c); }

  /* ── Section Cards ──────────────────────────────────────── */
  .an-card {
    background: var(--an-card-bg);
    border: 1px solid var(--an-card-bd);
    border-radius: 12px;
    overflow: hidden;
  }

  .an-card-header {
    padding: 14px 18px 12px;
    border-bottom: 1px solid var(--an-sep);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .an-card-title {
    font-size: .875rem;
    font-weight: 600;
    color: var(--an-title-c);
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .an-card-body { padding: 16px 18px; }

  .an-chart-wrap { position: relative; height: 220px; }
  .an-chart-wrap-sm { position: relative; height: 170px; }

  /* ── Table ─────────────────────────────────────────────── */
  .an-table { width: 100%; border-collapse: collapse; font-size: .825rem; }
  .an-table th { color: var(--an-label-c); font-weight: 600; padding: 7px 10px; border-bottom: 1px solid var(--an-sep); text-align: left; }
  .an-table td { color: var(--an-value-c); padding: 7px 10px; border-bottom: 1px solid var(--an-sep); }
  .an-table tr:last-child td { border-bottom: none; }
  .an-table tr:hover td { background: var(--an-row-hover); }

  /* ── Alert table ────────────────────────────────────────── */
  .an-alert-row td { background: var(--an-alert-bg); color: var(--an-alert-c); }
  .an-alert-badge {
    background: var(--an-alert-bg);
    border: 1px solid var(--an-alert-bd);
    color: var(--an-alert-c);
    border-radius: 999px;
    padding: 2px 10px;
    font-size: .73rem;
    font-weight: 600;
  }

  /* ── Export bar ─────────────────────────────────────────── */
  .an-export-bar {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding: 16px 18px;
    border-top: 1px solid var(--an-sep);
    background: var(--an-card-bg);
    border-radius: 0 0 12px 12px;
  }

  .an-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    border-radius: 8px;
    font-size: .825rem;
    font-weight: 600;
    border: 1px solid var(--an-card-bd);
    background: var(--an-badge-c);
    color: var(--an-title-c);
    cursor: pointer;
    transition: opacity .15s;
  }
  .an-btn:hover { opacity: .75; }
  .an-btn-primary { background: #1a3575; border-color: #1a3575; color: #fff; }
  .app-light .an-btn-primary { background: #1a3575; border-color: #1a3575; color: #fff; }

  /* ── Section label dot ──────────────────────────────────── */
  .an-dot {
    width: 9px; height: 9px; border-radius: 50%;
    display: inline-block; flex-shrink: 0;
  }

  /* ── Closed-rate KPI ────────────────────────────────────── */
  .an-rate-big {
    font-size: 3rem; font-weight: 800; color: var(--an-kpi3-c); line-height: 1;
  }
  .an-rate-label { font-size: .8rem; color: var(--an-label-c); margin-top: 4px; }

  /* ── Responsive grid ────────────────────────────────────── */
  .an-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .an-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  @media (max-width: 900px) {
    .an-grid-2, .an-grid-3 { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .an-kpi-grid { grid-template-columns: 1fr 1fr; }
  }
  ```

- [ ] **Step 2: Verify file created**

  ```bash
  ls /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web/src/Pages/Analytics/
  ```
  Expected: `Index.razor  Index.razor.css`

- [ ] **Step 3: Commit**

  ```bash
  git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/Pages/Analytics/Index.razor.css
  git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(analytics): dual-theme CSS for analytics dashboard"
  ```

---

## Task 4: Rewrite Analytics/Index.razor

**Files:**
- Rewrite: `src/Pages/Analytics/Index.razor`

This is the main task. The page loads all complaint rows once, computes all 12 analysis datasets via LINQ in C#, then renders charts + tables. Charts are initialized via `analytics.js` JS interop in `OnAfterRenderAsync`.

- [ ] **Step 1: Write the new Index.razor**

  Replace the entire content of `src/Pages/Analytics/Index.razor` with:

  ```razor
  @page "/analytics"
  @using EcmisWeb.Data
  @inject ComplaintApiService ComplaintApi
  @inject IJSRuntime JS

  <div class="an-shell">

    {{<!-- HEADER -->}}
    <div class="an-header">
      <div class="an-title"><i class="bi bi-bar-chart-line-fill me-2" style="color:var(--teal)"></i>ระบบวิเคราะห์และรายงานผล</div>
      <div class="an-subtitle">TOR 12 — ข้อมูลจากระบบรับเรื่องร้องเรียน ปปท. | อัปเดต: @DateTime.Now.ToString("dd/MM/yyyy HH:mm")</div>
    </div>

    @if (_loading)
    {
      <div class="text-center py-5" style="color:var(--an-sub-c)">
        <div class="spinner-border spinner-border-sm me-2"></div>กำลังโหลดข้อมูล...
      </div>
    }
    else
    {
      {{<!-- 1. KPI BANNER -->}}
      <div class="an-kpi-grid">
        <div class="an-kpi kpi-1">
          <div class="an-kpi-label">เรื่องร้องเรียนทั้งหมด</div>
          <div class="an-kpi-value">@_total</div>
          <div class="an-kpi-note">ข้อมูลทั้งระบบ</div>
        </div>
        <div class="an-kpi kpi-2">
          <div class="an-kpi-label">รอดำเนินการ</div>
          <div class="an-kpi-value">@_pendingCount</div>
          <div class="an-kpi-note">สถานะ pending / review</div>
        </div>
        <div class="an-kpi kpi-3">
          <div class="an-kpi-label">กำลังดำเนินการ</div>
          <div class="an-kpi-value">@_activeCount</div>
          <div class="an-kpi-note">สถานะ active</div>
        </div>
        <div class="an-kpi kpi-4">
          <div class="an-kpi-label">ดำเนินการเสร็จแล้ว</div>
          <div class="an-kpi-value">@_closedCount</div>
          <div class="an-kpi-note">closed / ส่งต่อ / วินัย</div>
        </div>
      </div>

      {{<!-- ROW A: แนวโน้มรายเดือน + ตามสถานะ -->}}
      <div class="an-grid-2 mb-3">
        <div class="an-card">
          <div class="an-card-header">
            <div class="an-card-title"><span class="an-dot" style="background:#6366f1"></span>แนวโน้มการรับเรื่องรายเดือน</div>
          </div>
          <div class="an-card-body"><div class="an-chart-wrap"><canvas id="chartMonthly"></canvas></div></div>
        </div>
        <div class="an-card">
          <div class="an-card-header">
            <div class="an-card-title"><span class="an-dot" style="background:#f59e0b"></span>สัดส่วนตามสถานะ</div>
          </div>
          <div class="an-card-body"><div class="an-chart-wrap"><canvas id="chartStatus"></canvas></div></div>
        </div>
      </div>

      {{<!-- ROW B: ตามประเภท + ตามช่องทางรับ -->}}
      <div class="an-grid-2 mb-3">
        <div class="an-card">
          <div class="an-card-header">
            <div class="an-card-title"><span class="an-dot" style="background:#10b981"></span>ตามประเภทเรื่องร้องเรียน (มาตรา)</div>
          </div>
          <div class="an-card-body"><div class="an-chart-wrap"><canvas id="chartCategory"></canvas></div></div>
        </div>
        <div class="an-card">
          <div class="an-card-header">
            <div class="an-card-title"><span class="an-dot" style="background:#3b82f6"></span>ตามช่องทางรับเรื่อง</div>
          </div>
          <div class="an-card-body"><div class="an-chart-wrap"><canvas id="chartChannel"></canvas></div></div>
        </div>
      </div>

      {{<!-- ROW C: ตามจังหวัด + ตามความเร่งด่วน -->}}
      <div class="an-grid-2 mb-3">
        <div class="an-card">
          <div class="an-card-header">
            <div class="an-card-title"><span class="an-dot" style="background:#8b5cf6"></span>ตามพื้นที่/จังหวัด</div>
          </div>
          <div class="an-card-body">
            <table class="an-table">
              <thead><tr><th>#</th><th>จังหวัด</th><th>จำนวน</th><th>%</th></tr></thead>
              <tbody>
                @foreach (var (prov, cnt, i) in _byProvince)
                {
                  <tr>
                    <td style="color:var(--an-label-c)">@(i+1)</td>
                    <td>@prov</td>
                    <td><strong>@cnt</strong></td>
                    <td style="color:var(--an-label-c)">@((cnt * 100.0 / _total).ToString("F0"))%</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div class="an-card">
          <div class="an-card-header">
            <div class="an-card-title"><span class="an-dot" style="background:#ec4899"></span>ตามความเร่งด่วน</div>
          </div>
          <div class="an-card-body"><div class="an-chart-wrap"><canvas id="chartPriority"></canvas></div></div>
        </div>
      </div>

      {{<!-- ROW D: ตามหน่วยงานผู้ถูกร้อง + SLA -->}}
      <div class="an-grid-2 mb-3">
        <div class="an-card">
          <div class="an-card-header">
            <div class="an-card-title"><span class="an-dot" style="background:#f97316"></span>หน่วยงานผู้ถูกร้อง (Top 10)</div>
          </div>
          <div class="an-card-body">
            <table class="an-table">
              <thead><tr><th>#</th><th>หน่วยงาน</th><th>จำนวน</th></tr></thead>
              <tbody>
                @foreach (var (agency, cnt, i) in _byAgency)
                {
                  <tr>
                    <td style="color:var(--an-label-c)">@(i+1)</td>
                    <td>@agency</td>
                    <td><strong>@cnt</strong></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div class="an-card">
          <div class="an-card-header">
            <div class="an-card-title"><span class="an-dot" style="background:#14b8a6"></span>SLA — วันคงเหลือในการดำเนินการ</div>
          </div>
          <div class="an-card-body"><div class="an-chart-wrap"><canvas id="chartSla"></canvas></div></div>
        </div>
      </div>

      {{<!-- ROW E: เรื่องใกล้หมดอายุความ (full width) -->}}
      <div class="an-card mb-3">
        <div class="an-card-header">
          <div class="an-card-title">
            <i class="bi bi-exclamation-triangle-fill" style="color:#ef4444"></i>
            เรื่องที่ใกล้หมดอายุความ (วันคงเหลือ ≤ 30 วัน)
          </div>
          <span class="an-alert-badge">@_expiring.Count เรื่อง</span>
        </div>
        <div class="an-card-body" style="padding:0">
          @if (_expiring.Count == 0)
          {
            <div style="padding:20px 18px;color:var(--an-sub-c);font-size:.825rem">ไม่มีเรื่องที่ใกล้หมดอายุความ</div>
          }
          else
          {
            <table class="an-table">
              <thead><tr><th>เลขคดี</th><th>ผู้ถูกร้อง</th><th>หน่วยงาน</th><th>จังหวัด</th><th>วันคงเหลือ</th><th>สถานะ</th></tr></thead>
              <tbody>
                @foreach (var r in _expiring)
                {
                  <tr class="an-alert-row">
                    <td><strong>@r.CaseNo</strong></td>
                    <td>@r.Accused</td>
                    <td>@r.AccusedAgency</td>
                    <td>@r.Province</td>
                    <td><strong>@(r.DaysRemaining <= 0 ? "หมดแล้ว" : r.DaysRemaining + " วัน")</strong></td>
                    <td>@ComplaintData.StatusLabel(r.Status)</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

      {{<!-- ROW F: รับ vs ปิด รายเดือน + อัตราปิดคดี -->}}
      <div class="an-grid-2 mb-3">
        <div class="an-card">
          <div class="an-card-header">
            <div class="an-card-title"><span class="an-dot" style="background:#6366f1"></span>เปรียบเทียบรับเรื่อง vs. ปิดคดีรายเดือน</div>
          </div>
          <div class="an-card-body"><div class="an-chart-wrap"><canvas id="chartReceivedVsClosed"></canvas></div></div>
        </div>
        <div class="an-card">
          <div class="an-card-header">
            <div class="an-card-title"><span class="an-dot" style="background:#10b981"></span>อัตราการปิดคดี</div>
          </div>
          <div class="an-card-body" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;min-height:170px">
            <div class="an-rate-big">@_closedRate%</div>
            <div class="an-rate-label">จาก @_total เรื่องทั้งหมด ปิดแล้ว @_closedCount เรื่อง</div>
            <div style="margin-top:8px;width:100%;max-width:200px">
              <div style="height:10px;border-radius:999px;background:var(--an-sep);overflow:hidden">
                <div style="height:100%;width:@_closedRate%;background:var(--an-kpi3-c);border-radius:999px;transition:width .5s"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {{<!-- SECTION 12: ส่งออกข้อมูล -->}}
      <div class="an-card">
        <div class="an-card-header">
          <div class="an-card-title"><i class="bi bi-download me-1"></i>ส่งออกรายงาน (ส่วนที่ 12)</div>
        </div>
        <div class="an-export-bar">
          <button class="an-btn an-btn-primary" @onclick="ExportCsvAsync">
            <i class="bi bi-filetype-csv"></i> ส่งออก CSV
          </button>
          <button class="an-btn" @onclick="PrintReportAsync">
            <i class="bi bi-printer"></i> พิมพ์/PDF
          </button>
        </div>
        <div class="an-card-body" style="padding-top:0">
          <table class="an-table" id="exportTable">
            <thead>
              <tr>
                <th>เลขคดี</th><th>ช่องทาง</th><th>ประเภท</th><th>จังหวัด</th>
                <th>ความเร่งด่วน</th><th>สถานะ</th><th>วันรับเรื่อง</th>
              </tr>
            </thead>
            <tbody>
              @foreach (var r in _rows)
              {
                <tr>
                  <td>@r.CaseNo</td>
                  <td>@r.Channel</td>
                  <td>@ComplaintData.CategoryLabel(r.Category)</td>
                  <td>@r.Province</td>
                  <td>@ComplaintData.PriorityLabel(r.Priority)</td>
                  <td>@ComplaintData.StatusLabel(r.Status)</td>
                  <td>@ComplaintData.ToThaiShortDate(r.ReceivedAt)</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  </div>

  @code {
      private bool _loading = true;
      private IReadOnlyList<ComplaintRow> _rows = [];

      // KPI
      private int _total, _pendingCount, _activeCount, _closedCount;
      private string _closedRate = "0";

      // Chart datasets
      private (string[] Labels, int[] Data) _monthly;
      private (string[] Labels, int[] Data) _statusData;
      private (string[] Labels, int[] Data) _categoryData;
      private (string[] Labels, int[] Data) _channelData;
      private (string[] Labels, int[] Data) _priorityData;
      private (string[] Labels, int[] Data) _slaData;

      // Table datasets
      private List<(string Name, int Count, int Index)> _byProvince = [];
      private List<(string Name, int Count, int Index)> _byAgency = [];
      private List<ComplaintRow> _expiring = [];

      // Grouped bar
      private string[] _monthlyLabels = [];
      private int[] _monthlyReceived = [];
      private int[] _monthlyClosed = [];

      private bool _chartsReady;

      protected override async Task OnInitializedAsync()
      {
          _rows = await ComplaintApi.GetComplaintsAsync();
          ComputeStats();
          _loading = false;
      }

      protected override async Task OnAfterRenderAsync(bool firstRender)
      {
          if (!_loading && !_chartsReady)
          {
              _chartsReady = true;
              await RenderChartsAsync();
          }
      }

      private void ComputeStats()
      {
          _total = _rows.Count;
          _pendingCount = _rows.Count(r => r.Status is "pending" or "review");
          _activeCount  = _rows.Count(r => r.Status == "active");
          _closedCount  = _rows.Count(r => r.Status is "closed" or "transfer" or "discipline");
          _closedRate   = _total == 0 ? "0" : (_closedCount * 100 / _total).ToString();

          // Monthly trend
          var byMonth = _rows
              .GroupBy(r => ComplaintData.ParseDate(r.ReceivedAt)?.ToString("MM/yy") ?? "?")
              .OrderBy(g => g.Key)
              .ToList();
          _monthly = (byMonth.Select(g => g.Key).ToArray(), byMonth.Select(g => g.Count()).ToArray());

          // Status
          var statuses = new[] { "pending", "active", "review", "transfer", "closed", "discipline" };
          _statusData = (
              statuses.Select(s => ComplaintData.StatusLabel(s)).ToArray(),
              statuses.Select(s => _rows.Count(r => r.Status == s)).ToArray()
          );

          // Category
          var cats = new[] { "ม.18/4", "ม.58/2", "ส่งคืน ป.ป.ช.", "วินัยภายใน" };
          _categoryData = (
              cats.Select(c => ComplaintData.CategoryLabel(c)).ToArray(),
              cats.Select(c => _rows.Count(r => r.Category == c)).ToArray()
          );

          // Channel
          var byChannel = _rows.GroupBy(r => r.Channel).OrderByDescending(g => g.Count()).ToList();
          _channelData = (byChannel.Select(g => g.Key).ToArray(), byChannel.Select(g => g.Count()).ToArray());

          // Province (table)
          _byProvince = _rows
              .GroupBy(r => r.Province)
              .OrderByDescending(g => g.Count())
              .Select((g, i) => (g.Key, g.Count(), i))
              .ToList();

          // Agency top 10 (table)
          _byAgency = _rows
              .Where(r => r.AccusedAgency != "-" && r.AccusedAgency != "ไม่ทราบหน่วยงาน")
              .GroupBy(r => r.AccusedAgency)
              .OrderByDescending(g => g.Count())
              .Take(10)
              .Select((g, i) => (g.Key, g.Count(), i))
              .ToList();

          // Priority
          var priorities = new[] { "high", "medium", "low" };
          _priorityData = (
              priorities.Select(p => ComplaintData.PriorityLabel(p)).ToArray(),
              priorities.Select(p => _rows.Count(r => r.Priority == p)).ToArray()
          );

          // SLA buckets: หมดแล้ว, 0-30, 31-90, 91-180, >180
          _slaData = (
              new[] { "หมดแล้ว", "≤30 วัน", "31-90 วัน", "91-180 วัน", ">180 วัน" },
              new[]
              {
                  _rows.Count(r => r.DaysRemaining < 0),
                  _rows.Count(r => r.DaysRemaining >= 0 && r.DaysRemaining <= 30),
                  _rows.Count(r => r.DaysRemaining >= 31 && r.DaysRemaining <= 90),
                  _rows.Count(r => r.DaysRemaining >= 91 && r.DaysRemaining <= 180),
                  _rows.Count(r => r.DaysRemaining > 180)
              }
          );

          // Expiring soon
          _expiring = _rows.Where(r => r.DaysRemaining <= 30).OrderBy(r => r.DaysRemaining).ToList();

          // Received vs Closed by month
          _monthlyLabels = _monthly.Labels;
          _monthlyReceived = _monthly.Data;
          _monthlyClosed = _monthlyLabels
              .Select(label => _rows.Count(r =>
                  (ComplaintData.ParseDate(r.ReceivedAt)?.ToString("MM/yy") ?? "?") == label
                  && r.Status is "closed" or "transfer" or "discipline"))
              .ToArray();
      }

      private async Task RenderChartsAsync()
      {
          var isDark = true; // theme detection from localStorage is handled by JS

          string[] statusColors = ["#fbbf24","#818cf8","#60a5fa","#f97316","#34d399","#f43f5e"];
          string[] catColors    = ["#6366f1","#10b981","#f59e0b","#ec4899"];
          string[] priorColors  = ["#ef4444","#3b82f6","#94a3b8"];
          string[] slaColors    = ["#ef4444","#f97316","#fbbf24","#60a5fa","#34d399"];

          await JS.InvokeVoidAsync("initAnalyticsChart", "chartMonthly", "bar",
              _monthly.Labels, _monthly.Data.Select(d => (object)d).ToArray(),
              (object?)null, isDark);

          await JS.InvokeVoidAsync("initAnalyticsChart", "chartStatus", "doughnut",
              _statusData.Labels, _statusData.Data.Select(d => (object)d).ToArray(),
              statusColors, isDark);

          await JS.InvokeVoidAsync("initAnalyticsChart", "chartCategory", "bar",
              _categoryData.Labels, _categoryData.Data.Select(d => (object)d).ToArray(),
              catColors, isDark);

          await JS.InvokeVoidAsync("initAnalyticsChart", "chartChannel", "bar-h",
              _channelData.Labels, _channelData.Data.Select(d => (object)d).ToArray(),
              (object?)null, isDark);

          await JS.InvokeVoidAsync("initAnalyticsChart", "chartPriority", "doughnut",
              _priorityData.Labels, _priorityData.Data.Select(d => (object)d).ToArray(),
              priorColors, isDark);

          await JS.InvokeVoidAsync("initAnalyticsChart", "chartSla", "bar",
              _slaData.Labels, _slaData.Data.Select(d => (object)d).ToArray(),
              slaColors, isDark);

          // Grouped bar: received vs closed
          await JS.InvokeVoidAsync("initGroupedBarChart", "chartReceivedVsClosed",
              _monthlyLabels,
              new object[]
              {
                  new { label = "รับเรื่อง", data = _monthlyReceived, backgroundColor = "#6366f1" },
                  new { label = "ปิดคดี",   data = _monthlyClosed,   backgroundColor = "#34d399" }
              },
              isDark);
      }

      private async Task ExportCsvAsync()
      {
          var sb = new System.Text.StringBuilder();
          sb.AppendLine("เลขคดี,ช่องทาง,ประเภท,จังหวัด,ความเร่งด่วน,สถานะ,วันรับเรื่อง");
          foreach (var r in _rows)
              sb.AppendLine($"{r.CaseNo},{r.Channel},{ComplaintData.CategoryLabel(r.Category)},{r.Province},{ComplaintData.PriorityLabel(r.Priority)},{ComplaintData.StatusLabel(r.Status)},{ComplaintData.ToThaiShortDate(r.ReceivedAt)}");
          await JS.InvokeVoidAsync("ecmis.downloadTextFile",
              $"analytics_{DateTime.Now:yyyyMMdd}.csv",
              "text/csv;charset=utf-8;",
              sb.ToString(), true);
      }

      private async Task PrintReportAsync()
      {
          var title = $"<h2>รายงานวิเคราะห์เรื่องร้องเรียน — {DateTime.Now:dd/MM/yyyy}</h2>";
          var table = await JS.InvokeAsync<string>("eval",
              "document.getElementById('exportTable').outerHTML");
          await JS.InvokeVoidAsync("ecmis.printReport",
              "รายงานวิเคราะห์", title + table);
      }
  }
  ```

  > **Note:** Replace `{{<!-- ... -->}}` comment syntax with plain `<!-- ... -->` in the actual file — it was escaped here for documentation clarity.

- [ ] **Step 2: Fix comment syntax in the file**

  The razor file uses HTML comments (`<!-- -->`), not escaped braces. When writing the file, ensure comment lines are:
  ```razor
  @* KPI BANNER *@
  ```
  or plain HTML `<!-- -->`. The `{{...}}` in the plan are documentation markers only.

- [ ] **Step 3: Build to check for compile errors**

  ```bash
  cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web/src
  dotnet build 2>&1 | grep -E "error|warning" | head -30
  ```

  Expected: 0 errors. Fix any compile errors before proceeding.

- [ ] **Step 4: Run and verify in browser**

  ```bash
  dotnet run
  ```

  Open `http://localhost:5000/analytics`. Verify:
  - 4 KPI cards show counts from real data (not 89/41/22/11 hardcoded)
  - 6 charts render (monthly trend, status doughnut, category bar, channel bar-h, priority doughnut, SLA bar)
  - Province table shows rows grouped and sorted
  - Agency table shows top 10 (or fewer if data is small)
  - Expiring section shows rows with DaysRemaining ≤ 30
  - Grouped bar (received vs closed) renders
  - Closed-rate KPI shows percentage + progress bar
  - "ส่งออก CSV" downloads a `.csv` file
  - "พิมพ์/PDF" opens print popup

- [ ] **Step 5: Test dark/light toggle**

  Click the sun/moon icon in the top bar. Verify the analytics page respects the theme (card backgrounds change). Charts will need a page reload to re-render with theme colors (this is acceptable for MVP — theme-aware chart re-render is a future enhancement).

- [ ] **Step 6: Commit**

  ```bash
  git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/Pages/Analytics/Index.razor
  git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(tor12): full analytics dashboard with 12 analysis sections"
  ```

---

## Task 5: Wire MainLayout to destroy analytics charts on theme toggle

**Files:**
- Modify: `src/Components/Layout/MainLayout.razor` (the `ToggleTheme` method)

The existing `reinitDashChartIfNeeded(!_isLight)` call handles the dashboard chart. We need to also call `reinitAnalyticsChartsIfNeeded` so the analytics page's charts are destroyed when the theme changes. The Blazor OnAfterRender will re-init them on next render.

- [ ] **Step 1: Find the ToggleTheme method in MainLayout.razor**

  Read `src/Components/Layout/MainLayout.razor` and find the method that calls `reinitDashChartIfNeeded`. It looks like:
  ```csharp
  private async Task ToggleThemeAsync()
  {
      _isLight = !_isLight;
      await JS.InvokeVoidAsync("applyDashTheme", !_isLight);
      await JS.InvokeVoidAsync("setDashTheme", _isLight ? "light" : "dark");
      await JS.InvokeVoidAsync("reinitDashChartIfNeeded", !_isLight);
  }
  ```

- [ ] **Step 2: Add analytics chart cleanup call**

  Modify the `ToggleThemeAsync` method to also call `reinitAnalyticsChartsIfNeeded` after `reinitDashChartIfNeeded`:

  ```csharp
  private async Task ToggleThemeAsync()
  {
      _isLight = !_isLight;
      await JS.InvokeVoidAsync("applyDashTheme", !_isLight);
      await JS.InvokeVoidAsync("setDashTheme", _isLight ? "light" : "dark");
      await JS.InvokeVoidAsync("reinitDashChartIfNeeded", !_isLight);
      await JS.InvokeVoidAsync("reinitAnalyticsChartsIfNeeded", !_isLight);
  }
  ```

- [ ] **Step 3: Update `_chartsReady` to reset when theme changes**

  In `Index.razor`, charts won't re-render on theme toggle because `_chartsReady` is already `true`. We need to reset it on each render for theme changes.

  In `Index.razor @code`, change `OnAfterRenderAsync` to:

  ```csharp
  protected override async Task OnAfterRenderAsync(bool firstRender)
  {
      if (!_loading)
      {
          await RenderChartsAsync();
      }
  }
  ```

  > This calls `initAnalyticsChart` on every render after load. Since `initAnalyticsChart` in JS always destroys the previous chart instance before creating a new one, this is safe — it will re-render with the correct theme whenever Blazor re-renders the page.

  Remove the `_chartsReady` field entirely.

- [ ] **Step 4: Build and verify**

  ```bash
  cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web/src
  dotnet build 2>&1 | grep error
  dotnet run
  ```

  Go to `/analytics`, toggle theme — charts should re-render with correct colors (after a brief flicker).

- [ ] **Step 5: Commit**

  ```bash
  git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/Components/Layout/MainLayout.razor src/Pages/Analytics/Index.razor
  git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(analytics): theme-aware chart re-render on toggle"
  ```

---

## Spec Coverage Checklist

| TOR 12 Requirement | Covered By |
|---|---|
| KPI รับเรื่อง / ระหว่างดำเนินการ / ปิดแล้ว | Task 4 — KPI Banner (4 cards) |
| วิเคราะห์แนวโน้มรายเดือน | Task 4 — `chartMonthly` (bar chart) |
| วิเคราะห์ตามสถานะ | Task 4 — `chartStatus` (doughnut) |
| วิเคราะห์ตามประเภท (มาตรา) | Task 4 — `chartCategory` (bar) |
| วิเคราะห์ตามช่องทางรับ | Task 4 — `chartChannel` (horizontal bar) |
| วิเคราะห์ตามพื้นที่/จังหวัด | Task 4 — Province table |
| วิเคราะห์ตามหน่วยงานผู้ถูกร้อง | Task 4 — Agency table top 10 |
| วิเคราะห์ตามความเร่งด่วน | Task 4 — `chartPriority` (doughnut) |
| SLA / ระยะเวลาคงเหลือ | Task 4 — `chartSla` (bar, 5 buckets) |
| เรื่องใกล้หมดอายุความ | Task 4 — Alert table (≤30 days) |
| เปรียบเทียบรับ vs. ปิด | Task 4 — `chartReceivedVsClosed` (grouped bar) |
| อัตราการปิดคดี | Task 4 — Rate KPI + progress bar |
| ส่งออก CSV | Task 4 — `ExportCsvAsync` |
| พิมพ์/PDF | Task 4 — `PrintReportAsync` |
| เมนูแยกต่างหาก (ไม่ปนกับ จัดการระบบ) | Task 1 — "วิเคราะห์/รายงาน" nav group |
| Dual dark/light theme | Task 3 — CSS custom properties |
| Chart.js integration | Task 2 — `analytics.js` |
