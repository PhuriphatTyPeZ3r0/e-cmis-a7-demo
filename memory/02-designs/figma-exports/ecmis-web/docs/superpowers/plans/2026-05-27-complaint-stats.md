# TOR 12.2 Complaint Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/analytics/complaint-stats` page with KPI cards, date-range filter, 5 charts (channel donut, monthly trend, category bar, province top-10, status donut) and CSV/print export.

**Architecture:** Rewrite the placeholder `ComplaintStats.razor` as a self-contained Blazor page. Filter and aggregation run client-side on `ComplaintService.GetComplaintsAsync()` data — no new API endpoints. Chart.js is already loaded via `analytics.js`; a new `initTrendChart` function handles the 2-dataset line chart.

**Tech Stack:** Blazor WebAssembly (.NET 8), Chart.js 4.4.0 (existing), `ComplaintData.ParseDate()` for Thai-BE date parsing, `ecmis.downloadTextFile` / `ecmis.printReport` for export (both already in `dashboard.js`).

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/Pages/Analytics/ComplaintStats.razor` | Rewrite | Page HTML + @code |
| `src/Pages/Analytics/ComplaintStats.razor.css` | Create | Page-scoped styles |
| `src/wwwroot/js/analytics.js` | Modify | Add `initTrendChart` for 2-line chart |

---

### Task 1: Data loading, filter state, and apply logic

**Files:**
- Modify: `src/Pages/Analytics/ComplaintStats.razor`

- [ ] **Step 1: Rewrite ComplaintStats.razor with skeleton + @code block**

Replace the entire file with:

```razor
@page "/analytics/complaint-stats"
@layout MainLayout
@implements IDisposable
@using EcmisWeb.Data
@inject ComplaintApiService ComplaintApi
@inject IJSRuntime JS

<div class="cs-page">
    @* Content added in later tasks *@
</div>

@code {
    // ── raw data ──────────────────────────────────────────
    private List<ComplaintRow> _all = new();

    // ── filter state ──────────────────────────────────────
    private string _fromDate = "";   // "YYYY-MM-DD" from <input type="date">
    private string _toDate   = "";
    private string _channel  = "";
    private string _category = "";
    private string _province = "";

    // ── derived / computed ────────────────────────────────
    private List<ComplaintRow> _filtered = new();
    private bool _loading = true;
    private bool _noData  = false;
    private bool _chartsReady = false;
    private bool _isDark  = true;

    // ── dropdown options ──────────────────────────────────
    private List<string> _channels  = new();
    private List<string> _categories = new();
    private List<string> _provinces  = new();

    protected override async Task OnInitializedAsync()
    {
        var theme = await JS.InvokeAsync<string?>("localStorage.getItem", "dashTheme");
        _isDark = theme != "light";

        _all = (await ComplaintApi.GetComplaintsAsync()).ToList();

        _channels   = _all.Select(r => r.Channel).Distinct().OrderBy(x => x).ToList();
        _categories = _all.Select(r => r.Category).Distinct().OrderBy(x => x).ToList();
        _provinces  = _all.Select(r => r.Province).Distinct().OrderBy(x => x).ToList();

        _loading = false;
        ApplyFilter();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!_loading && !_noData && !_chartsReady)
        {
            _chartsReady = true;
            await RenderChartsAsync();
        }
    }

    private void ApplyFilter()
    {
        _chartsReady = false;

        var q = _all.AsEnumerable();

        if (DateTime.TryParse(_fromDate, out var from))
            q = q.Where(r => ComplaintData.ParseDate(r.ReceivedAt) >= from);

        if (DateTime.TryParse(_toDate, out var to))
            q = q.Where(r => ComplaintData.ParseDate(r.ReceivedAt) <= to);

        if (!string.IsNullOrEmpty(_channel))
            q = q.Where(r => r.Channel == _channel);

        if (!string.IsNullOrEmpty(_category))
            q = q.Where(r => r.Category == _category);

        if (!string.IsNullOrEmpty(_province))
            q = q.Where(r => r.Province == _province);

        _filtered = q.ToList();
        _noData   = _filtered.Count == 0;
    }

    private async Task OnApplyFilter()
    {
        ApplyFilter();
        StateHasChanged();
        if (!_noData)
            await RenderChartsAsync();
    }

    private async Task OnResetFilter()
    {
        _fromDate = _toDate = _channel = _category = _province = "";
        ApplyFilter();
        StateHasChanged();
        if (!_noData)
            await RenderChartsAsync();
    }

    private Task RenderChartsAsync() => Task.CompletedTask; // implemented in Task 3

    public void Dispose() { }
}
```

- [ ] **Step 2: Verify project builds**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet build src/EcmisWeb.csproj 2>&1 | tail -5
```
Expected: `Build succeeded`

- [ ] **Step 3: Commit**

```bash
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/Pages/Analytics/ComplaintStats.razor
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(analytics): complaint-stats scaffold with filter state and data loading"
```

---

### Task 2: KPI cards + Filter bar UI

**Files:**
- Modify: `src/Pages/Analytics/ComplaintStats.razor`
- Create: `src/Pages/Analytics/ComplaintStats.razor.css`

- [ ] **Step 1: Add KPI computed properties to @code**

Add these properties inside `@code { }` after `_provinces`:

```csharp
private int Total     => _filtered.Count;
private int Closed    => _filtered.Count(r => r.Status is "closed" or "transfer");
private int Active    => _filtered.Count(r => r.Status == "active");
private int Pending   => _filtered.Count(r => r.Status == "pending");
private int Transfer  => _filtered.Count(r => r.Status == "transfer");
private string Pct(int n) => Total == 0 ? "0%" : $"{n * 100 / Total}%";
```

- [ ] **Step 2: Replace `@* Content added in later tasks *@` with page header + KPI cards + filter bar**

```razor
<div class="cs-page">
    @* ── Page header ── *@
    <div class="cs-header">
        <div>
            <div class="cs-title">
                <i class="bi bi-inbox-fill"></i> สถิติการรับเรื่องร้องเรียน
                <span class="cs-title-sub">TOR 12.2 · ป.ป.ท.</span>
            </div>
        </div>
        <div class="cs-export-group">
            <button class="btn btn-sm btn-outline-secondary" @onclick="PrintReportAsync">
                <i class="bi bi-printer"></i> พิมพ์ PDF
            </button>
            <button class="btn btn-sm btn-primary" @onclick="ExportCsvAsync">
                <i class="bi bi-file-earmark-spreadsheet"></i> Export Excel
            </button>
        </div>
    </div>

    @if (_loading)
    {
        <div class="cs-loading"><span class="spinner-border spinner-border-sm"></span> กำลังโหลด...</div>
    }
    else
    {
        @* ── KPI Cards ── *@
        <div class="cs-kpi-row">
            <div class="cs-kpi-card cs-kpi-blue">
                <div class="cs-kpi-label">เรื่องทั้งหมด</div>
                <div class="cs-kpi-value">@Total.ToString("N0")</div>
                <div class="cs-kpi-sub">ช่วงที่เลือก</div>
            </div>
            <div class="cs-kpi-card cs-kpi-green">
                <div class="cs-kpi-label">เสร็จสิ้นแล้ว</div>
                <div class="cs-kpi-value">@Closed.ToString("N0")</div>
                <div class="cs-kpi-sub">@Pct(Closed)</div>
            </div>
            <div class="cs-kpi-card cs-kpi-orange">
                <div class="cs-kpi-label">กำลังดำเนินการ</div>
                <div class="cs-kpi-value">@Active.ToString("N0")</div>
                <div class="cs-kpi-sub">@Pct(Active)</div>
            </div>
            <div class="cs-kpi-card cs-kpi-red">
                <div class="cs-kpi-label">รอดำเนินการ</div>
                <div class="cs-kpi-value">@Pending.ToString("N0")</div>
                <div class="cs-kpi-sub">@Pct(Pending)</div>
            </div>
            <div class="cs-kpi-card cs-kpi-purple">
                <div class="cs-kpi-label">ส่งต่อหน่วยงาน</div>
                <div class="cs-kpi-value">@Transfer.ToString("N0")</div>
                <div class="cs-kpi-sub">@Pct(Transfer)</div>
            </div>
        </div>

        @* ── Filter bar ── *@
        <div class="cs-filter-bar">
            <div class="cs-filter-group">
                <label class="cs-filter-label">วันที่รับเรื่อง จาก</label>
                <input type="date" class="form-control form-control-sm cs-filter-input"
                       @bind="_fromDate" @bind:event="oninput" />
            </div>
            <div class="cs-filter-group">
                <label class="cs-filter-label">ถึง</label>
                <input type="date" class="form-control form-control-sm cs-filter-input"
                       @bind="_toDate" @bind:event="oninput" />
            </div>
            <div class="cs-filter-group">
                <label class="cs-filter-label">ช่องทางรับ</label>
                <select class="form-select form-select-sm cs-filter-input" @bind="_channel">
                    <option value="">ทั้งหมด</option>
                    @foreach (var ch in _channels)
                    {
                        <option value="@ch">@ch</option>
                    }
                </select>
            </div>
            <div class="cs-filter-group">
                <label class="cs-filter-label">ประเภทคดี</label>
                <select class="form-select form-select-sm cs-filter-input" @bind="_category">
                    <option value="">ทั้งหมด</option>
                    @foreach (var cat in _categories)
                    {
                        <option value="@cat">@ComplaintData.CategoryLabel(cat)</option>
                    }
                </select>
            </div>
            <div class="cs-filter-group">
                <label class="cs-filter-label">จังหวัด</label>
                <select class="form-select form-select-sm cs-filter-input" @bind="_province">
                    <option value="">ทั้งหมด</option>
                    @foreach (var pv in _provinces)
                    {
                        <option value="@pv">@pv</option>
                    }
                </select>
            </div>
            <button class="btn btn-sm btn-primary cs-filter-btn" @onclick="OnApplyFilter">
                <i class="bi bi-search"></i> แสดงผล
            </button>
            <button class="btn btn-sm btn-outline-secondary cs-filter-btn" @onclick="OnResetFilter">
                <i class="bi bi-arrow-counterclockwise"></i> ล้างค่า
            </button>
        </div>

        @* ── No data state ── *@
        @if (_noData)
        {
            <div class="cs-no-data">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="mt-2 text-muted">ไม่พบข้อมูลในช่วงที่เลือก กรุณาเปลี่ยนตัวกรอง</p>
            </div>
        }
        else
        {
            @* Charts added in Task 3–5 *@
        }
    }
</div>
```

- [ ] **Step 3: Create `ComplaintStats.razor.css`**

```css
/* ── Layout ── */
.cs-page { padding: 16px 20px; max-width: 1200px; }

.cs-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 14px;
}
.cs-title {
    font-size: 17px; font-weight: 700; color: var(--navy, #1a237e);
    display: flex; align-items: center; gap: 8px;
}
.cs-title-sub { font-size: 12px; font-weight: 400; color: #888; }
.cs-export-group { display: flex; gap: 8px; }
.cs-loading { padding: 40px; text-align: center; color: #888; }

/* ── KPI ── */
.cs-kpi-row {
    display: grid; grid-template-columns: repeat(5, 1fr);
    gap: 12px; margin-bottom: 14px;
}
.cs-kpi-card {
    background: var(--card-bg, white); border-radius: 10px;
    padding: 12px 14px; border-left: 4px solid;
    box-shadow: 0 1px 4px rgba(0,0,0,.07);
}
.cs-kpi-blue   { border-color: #1a73e8; }
.cs-kpi-green  { border-color: #34a853; }
.cs-kpi-orange { border-color: #fa7b17; }
.cs-kpi-red    { border-color: #ea4335; }
.cs-kpi-purple { border-color: #9c27b0; }

.cs-kpi-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: .4px; }
.cs-kpi-value { font-size: 24px; font-weight: 800; margin: 2px 0; }
.cs-kpi-sub   { font-size: 11px; color: #aaa; }

.cs-kpi-blue   .cs-kpi-value { color: #1a73e8; }
.cs-kpi-green  .cs-kpi-value { color: #34a853; }
.cs-kpi-orange .cs-kpi-value { color: #fa7b17; }
.cs-kpi-red    .cs-kpi-value { color: #ea4335; }
.cs-kpi-purple .cs-kpi-value { color: #9c27b0; }

/* ── Filter ── */
.cs-filter-bar {
    background: var(--card-bg, white); border-radius: 10px;
    padding: 12px 16px; margin-bottom: 14px;
    display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
    box-shadow: 0 1px 4px rgba(0,0,0,.07);
}
.cs-filter-group { display: flex; flex-direction: column; gap: 3px; }
.cs-filter-label { font-size: 11px; font-weight: 600; color: #555; }
.cs-filter-input { min-width: 120px; }
.cs-filter-btn   { align-self: flex-end; }

/* ── No data ── */
.cs-no-data {
    text-align: center; padding: 60px 20px;
    background: var(--card-bg, white); border-radius: 10px;
}

/* ── Charts ── */
.cs-charts-top {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 12px; margin-bottom: 12px;
}
.cs-charts-bot {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px; margin-bottom: 14px;
}
.cs-chart-card {
    background: var(--card-bg, white); border-radius: 10px;
    padding: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.07);
}
.cs-chart-title {
    font-size: 12px; font-weight: 700; color: #444;
    margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
}
.cs-chart-canvas { position: relative; height: 180px; }

/* ── Summary table ── */
.cs-status-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
.cs-status-table th {
    background: rgba(0,0,0,.04); padding: 6px 10px;
    text-align: left; color: #555; font-weight: 600;
    border-bottom: 2px solid rgba(0,0,0,.08);
}
.cs-status-table td { padding: 6px 10px; border-bottom: 1px solid rgba(0,0,0,.05); }

/* ── Export footer ── */
.cs-export-footer {
    background: var(--card-bg, white); border-radius: 10px;
    padding: 12px 16px; display: flex; align-items: center;
    justify-content: space-between; box-shadow: 0 1px 4px rgba(0,0,0,.07);
    font-size: 12px; color: #555;
}
.cs-export-footer strong { color: var(--navy, #1a237e); }

/* ── Print ── */
@media print {
    .cs-header .cs-export-group,
    .cs-filter-bar,
    .cs-export-footer { display: none !important; }
}
```

- [ ] **Step 4: Build**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet build src/EcmisWeb.csproj 2>&1 | tail -5
```
Expected: `Build succeeded`

- [ ] **Step 5: Commit**

```bash
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/Pages/Analytics/ComplaintStats.razor src/Pages/Analytics/ComplaintStats.razor.css
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(analytics): KPI cards, filter bar, no-data state"
```

---

### Task 3: Channel donut, Category bar, Province top-10 charts

**Files:**
- Modify: `src/Pages/Analytics/ComplaintStats.razor`

- [ ] **Step 1: Add chart data computed properties to @code**

Add inside `@code { }`:

```csharp
// ── chart data ────────────────────────────────────────────
private (string[] Labels, int[] Data, string[] Colors) ChannelChartData()
{
    var groups = _filtered
        .GroupBy(r => r.Channel)
        .OrderByDescending(g => g.Count())
        .ToList();
    var colors = new[] { "#1a73e8", "#34a853", "#fbbc04", "#ea4335", "#9c27b0",
                         "#00bcd4", "#ff7043", "#8bc34a" };
    return (
        groups.Select(g => g.Key).ToArray(),
        groups.Select(g => g.Count()).ToArray(),
        groups.Select((_, i) => colors[i % colors.Length]).ToArray()
    );
}

private (string[] Labels, int[] Data) CategoryChartData()
{
    var groups = _filtered
        .GroupBy(r => r.Category)
        .OrderByDescending(g => g.Count())
        .ToList();
    return (
        groups.Select(g => ComplaintData.CategoryLabel(g.Key)).ToArray(),
        groups.Select(g => g.Count()).ToArray()
    );
}

private (string[] Labels, int[] Data) ProvinceChartData()
{
    var groups = _filtered
        .GroupBy(r => r.Province)
        .OrderByDescending(g => g.Count())
        .Take(10)
        .ToList();
    return (
        groups.Select(g => g.Key).ToArray(),
        groups.Select(g => g.Count()).ToArray()
    );
}
```

- [ ] **Step 2: Replace `@* Charts added in Task 3–5 *@` with chart HTML (top row)**

```razor
@* ── Charts top row ── *@
<div class="cs-charts-top">
    <div class="cs-chart-card">
        <div class="cs-chart-title"><i class="bi bi-pie-chart-fill"></i> ช่องทางรับเรื่อง</div>
        <div class="cs-chart-canvas"><canvas id="csChartChannel"></canvas></div>
    </div>
    <div class="cs-chart-card">
        <div class="cs-chart-title"><i class="bi bi-graph-up"></i> แนวโน้มรายเดือน</div>
        <div class="cs-chart-canvas"><canvas id="csChartTrend"></canvas></div>
    </div>
    <div class="cs-chart-card">
        <div class="cs-chart-title"><i class="bi bi-bar-chart-fill"></i> ประเภทคดี</div>
        <div class="cs-chart-canvas"><canvas id="csChartCategory"></canvas></div>
    </div>
</div>

@* ── Charts bottom row — added in Task 4–5 *@
```

- [ ] **Step 3: Implement RenderChartsAsync (replace the stub) in @code**

```csharp
private async Task RenderChartsAsync()
{
    await Task.Yield(); // let Blazor finish DOM render

    var (chLabels, chData, chColors) = ChannelChartData();
    await JS.InvokeVoidAsync("initAnalyticsChart",
        "csChartChannel", "doughnut", chLabels,
        chData.Cast<object>().ToArray(), chColors, _isDark);

    var trendData = TrendChartData();
    await JS.InvokeVoidAsync("initTrendChart",
        "csChartTrend", trendData.Labels,
        trendData.ThisYear.Cast<object>().ToArray(),
        trendData.LastYear.Cast<object>().ToArray(),
        _isDark);

    var (catLabels, catData) = CategoryChartData();
    await JS.InvokeVoidAsync("initAnalyticsChart",
        "csChartCategory", "bar", catLabels,
        catData.Cast<object>().ToArray(),
        new[] { "#1a73e8", "#34a853", "#fbbc04", "#ea4335", "#9c27b0" }, _isDark);

    var (pvLabels, pvData) = ProvinceChartData();
    await JS.InvokeVoidAsync("initAnalyticsChart",
        "csChartProvince", "bar-h", pvLabels,
        pvData.Cast<object>().ToArray(), null, _isDark);

    var (stLabels, stData, stColors) = StatusChartData();
    await JS.InvokeVoidAsync("initAnalyticsChart",
        "csChartStatus", "doughnut", stLabels,
        stData.Cast<object>().ToArray(), stColors, _isDark);
}
```

Note: `TrendChartData()` and `StatusChartData()` are added in later tasks. Add stub methods now:

```csharp
private (string[] Labels, int[] ThisYear, int[] LastYear) TrendChartData()
    => (Array.Empty<string>(), Array.Empty<int>(), Array.Empty<int>());

private (string[] Labels, int[] Data, string[] Colors) StatusChartData()
    => (Array.Empty<string>(), Array.Empty<int>(), Array.Empty<string>());
```

- [ ] **Step 4: Build**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet build src/EcmisWeb.csproj 2>&1 | tail -5
```
Expected: `Build succeeded`

- [ ] **Step 5: Commit**

```bash
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/Pages/Analytics/ComplaintStats.razor
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(analytics): channel, category, province chart wiring"
```

---

### Task 4: Trend 2-line chart — add `initTrendChart` to analytics.js

**Files:**
- Modify: `src/wwwroot/js/analytics.js`

- [ ] **Step 1: Append `initTrendChart` at the end of analytics.js**

```js
window.initTrendChart = function (canvasId, labels, thisYearData, lastYearData, isDark) {
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

    window._analyticsCharts[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'ปีนี้',
                    data: thisYearData,
                    borderColor: '#1a73e8',
                    backgroundColor: 'rgba(26,115,232,0.08)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#1a73e8'
                },
                {
                    label: 'ปีที่แล้ว',
                    data: lastYearData,
                    borderColor: '#aaa',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.35,
                    borderWidth: 1.5,
                    borderDash: [5, 4],
                    pointRadius: 2,
                    pointBackgroundColor: '#aaa'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: tickColor, font: { family: 'Sarabun', size: 10 }, boxWidth: 20, padding: 10 }
                },
                tooltip: {
                    backgroundColor: tooltipBg,
                    titleColor: tooltipTxt,
                    bodyColor: tooltipTxt,
                    borderColor: 'rgba(128,128,128,0.2)',
                    borderWidth: 1
                }
            },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 10 } } },
                y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 10 } }, beginAtZero: true }
            }
        }
    });
};
```

- [ ] **Step 2: Implement `TrendChartData()` in ComplaintStats.razor @code (replace the stub)**

```csharp
private (string[] Labels, int[] ThisYear, int[] LastYear) TrendChartData()
{
    var thaiMonths = new[] { "ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.",
                             "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย." };

    // fiscal year starts Oct (month 10). Reference year from latest data or today.
    var refYear = _filtered
        .Select(r => ComplaintData.ParseDate(r.ReceivedAt)?.Year)
        .Where(y => y.HasValue)
        .Select(y => y!.Value)
        .DefaultIfEmpty(DateTime.Today.Year)
        .Max();

    int CountMonth(int year, int month) =>
        _all.Count(r => {
            var d = ComplaintData.ParseDate(r.ReceivedAt);
            return d.HasValue && d.Value.Year == year && d.Value.Month == month;
        });

    // fiscal year months: Oct=10..Sep=9
    var fiscalMonths = new[] { 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9 };
    var thisYear = fiscalMonths.Select(m => CountMonth(m >= 10 ? refYear : refYear + 1, m)).ToArray();
    var lastYear = fiscalMonths.Select(m => CountMonth(m >= 10 ? refYear - 1 : refYear, m)).ToArray();

    return (thaiMonths, thisYear, lastYear);
}
```

- [ ] **Step 3: Build**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet build src/EcmisWeb.csproj 2>&1 | tail -5
```
Expected: `Build succeeded`

- [ ] **Step 4: Commit**

```bash
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/wwwroot/js/analytics.js src/Pages/Analytics/ComplaintStats.razor
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(analytics): trend 2-line chart with fiscal year grouping"
```

---

### Task 5: Province chart + Status donut + summary table

**Files:**
- Modify: `src/Pages/Analytics/ComplaintStats.razor`

- [ ] **Step 1: Implement `StatusChartData()` (replace the stub) in @code**

```csharp
private (string[] Labels, int[] Data, string[] Colors) StatusChartData()
{
    var map = new (string Status, string Label, string Color)[]
    {
        ("closed",   "เสร็จสิ้น",       "#34a853"),
        ("active",   "กำลังดำเนินการ",  "#fa7b17"),
        ("transfer", "ส่งต่อ",          "#9c27b0"),
        ("pending",  "รอดำเนินการ",     "#ea4335"),
        ("review",   "กำลังตรวจสอบ",   "#1a73e8"),
    };
    var counts = map.Select(m => _filtered.Count(r => r.Status == m.Status)).ToArray();
    return (
        map.Select(m => m.Label).ToArray(),
        counts,
        map.Select(m => m.Color).ToArray()
    );
}
```

- [ ] **Step 2: Replace `@* ── Charts bottom row — added in Task 4–5 *@` with bottom row + export footer**

```razor
@* ── Charts bottom row ── *@
<div class="cs-charts-bot">
    <div class="cs-chart-card">
        <div class="cs-chart-title"><i class="bi bi-geo-alt-fill"></i> Top 10 จังหวัด</div>
        <div class="cs-chart-canvas"><canvas id="csChartProvince"></canvas></div>
    </div>
    <div class="cs-chart-card">
        <div class="cs-chart-title"><i class="bi bi-circle-half"></i> สัดส่วนสถานะเรื่อง</div>
        <div class="cs-chart-canvas"><canvas id="csChartStatus"></canvas></div>
        <table class="cs-status-table" id="exportTable">
            <thead>
                <tr><th>สถานะ</th><th>จำนวน</th><th>สัดส่วน</th></tr>
            </thead>
            <tbody>
                @foreach (var (label, count, color) in StatusRows())
                {
                    <tr>
                        <td><span style="color:@color; font-weight:600">@label</span></td>
                        <td>@count.ToString("N0")</td>
                        <td>@Pct(count)</td>
                    </tr>
                }
            </tbody>
        </table>
    </div>
</div>

@* ── Export footer ── *@
<div class="cs-export-footer">
    <span>
        แสดงผล <strong>@Total.ToString("N0") เรื่อง</strong>
        @if (!string.IsNullOrEmpty(_fromDate) || !string.IsNullOrEmpty(_toDate))
        {
            <span> · @(_fromDate) – @(_toDate)</span>
        }
        @if (!string.IsNullOrEmpty(_channel)) { <span> · @_channel</span> }
        @if (!string.IsNullOrEmpty(_category)) { <span> · @ComplaintData.CategoryLabel(_category)</span> }
        @if (!string.IsNullOrEmpty(_province)) { <span> · @_province</span> }
    </span>
    <div class="cs-export-group">
        <button class="btn btn-sm btn-outline-secondary" @onclick="PrintReportAsync">
            <i class="bi bi-printer"></i> พิมพ์ PDF
        </button>
        <button class="btn btn-sm btn-primary" @onclick="ExportCsvAsync">
            <i class="bi bi-file-earmark-spreadsheet"></i> Export Excel
        </button>
    </div>
</div>
```

- [ ] **Step 3: Add `StatusRows()` helper in @code**

```csharp
private IEnumerable<(string Label, int Count, string Color)> StatusRows()
{
    var (labels, data, colors) = StatusChartData();
    return labels.Select((label, i) => (Label: label, Count: data[i], Color: colors[i]));
}
```

- [ ] **Step 4: Build**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet build src/EcmisWeb.csproj 2>&1 | tail -5
```
Expected: `Build succeeded`

- [ ] **Step 5: Commit**

```bash
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/Pages/Analytics/ComplaintStats.razor
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(analytics): province, status charts and summary table"
```

---

### Task 6: Export — CSV and Print PDF

**Files:**
- Modify: `src/Pages/Analytics/ComplaintStats.razor`

- [ ] **Step 1: Implement `ExportCsvAsync` in @code (replace `private Task RenderChartsAsync() => Task.CompletedTask;` — that was already replaced in Task 3; add below StatusRows)**

```csharp
private async Task ExportCsvAsync()
{
    var sb = new System.Text.StringBuilder();
    sb.AppendLine("เลขคดี,ช่องทาง,ประเภท,จังหวัด,สถานะ,วันรับเรื่อง");
    foreach (var r in _filtered)
    {
        sb.AppendLine(string.Join(",",
            r.CaseNo,
            r.Channel,
            ComplaintData.CategoryLabel(r.Category),
            r.Province,
            ComplaintData.StatusLabel(r.Status),
            ComplaintData.ToThaiShortDate(r.ReceivedAt)));
    }
    await JS.InvokeVoidAsync("ecmis.downloadTextFile",
        $"complaint_stats_{DateTime.Now:yyyyMMdd}.csv",
        "text/csv;charset=utf-8;",
        sb.ToString(),
        true);
}

private async Task PrintReportAsync()
{
    var title = $"<h2>รายงานสถิติรับเรื่องร้องเรียน TOR 12.2 ป.ป.ท. | {DateTime.Now:dd/MM/yyyy}</h2>";
    var table = await JS.InvokeAsync<string>("eval",
        "document.getElementById('exportTable').outerHTML");
    await JS.InvokeVoidAsync("ecmis.printReport",
        "สถิติรับเรื่องร้องเรียน", title + table);
}
```

- [ ] **Step 2: Build**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet build src/EcmisWeb.csproj 2>&1 | tail -5
```
Expected: `Build succeeded`

- [ ] **Step 3: Commit**

```bash
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add src/Pages/Analytics/ComplaintStats.razor
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "feat(analytics): CSV export and print PDF for complaint stats"
```

---

### Task 7: Final verification

- [ ] **Step 1: Full build**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet build src/EcmisWeb.csproj 2>&1 | tail -8
```
Expected: `Build succeeded. 0 Error(s)`

- [ ] **Step 2: Run dev server**

```bash
cd /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web && dotnet run --project src/EcmisWeb.csproj 2>&1 &
```
Open `https://localhost:5001/analytics/complaint-stats` and verify:
- KPI cards show counts
- Filter date inputs work → click แสดงผล → charts re-render
- Empty filter state shows "ไม่พบข้อมูล" message
- Reset filter restores all data
- Export Excel downloads CSV file
- พิมพ์ PDF opens print dialog

- [ ] **Step 3: Final commit**

```bash
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web add docs/
git -C /Users/thanthita.korn/Desktop/E-CMIS/ecmis-web commit -m "docs: complaint-stats design spec and implementation plan"
```
