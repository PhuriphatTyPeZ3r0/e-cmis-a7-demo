# Zone Heatmap บนแดชบอร์ดวิเคราะห์ (V6) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** แทนแผนที่ canvas "WARNING HEATMAP" ใน layout V6 ของ `/analytics` ด้วยฮีทแมพ SVG เรื่องร้องเรียนรายเขต ปปท.1–9 (port จาก `ThailandHeatmap.tsx` ของ p-ecmis) ใช้ข้อมูลจริงจาก `IComplaintStatsService` และคลิกเขตเพื่อไป `/analytics/complaint-stats?zone=...`

**Architecture:** Component Blazor ล้วน (`ThailandHeatmap.razor`) เรนเดอร์ SVG จาก static asset `thai-provinces.json`; ตรรกะคำนวณ (สี, จังหวัด→เขต, centroid) แยกเป็นคลาส C# `HeatmapLogic` ที่เทสได้; Index.razor (V6) ป้อนข้อมูลจาก `ZoneVm.ByRegion` ของ snapshot; ComplaintStats.razor รับ query param `zone` ตั้ง filter ตั้งต้น

**Tech Stack:** Blazor WebAssembly (.NET 8), xUnit (โปรเจกต์เทสที่มีอยู่), ไม่มี JS/dependency ใหม่

**Spec:** `docs/superpowers/specs/2026-06-10-zone-heatmap-dashboard-design.md`

**Conventions:**
- ทุกคำสั่งรันจาก repo root `/Users/thanthita.korn/Desktop/E-CMIS/ecmis-web`
- ทำงานบน branch ใหม่: `git checkout -b feat/zone-heatmap-dashboard` ก่อนเริ่ม Task 0
- Build: `dotnet build src/EcmisWeb.csproj` / Test: `dotnet test tests/EcmisWeb.Tests/EcmisWeb.Tests.csproj`
- Commit ทุกท้าย task

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/wwwroot/data/thai-provinces.json` | Create | SVG path 78 locations (77 จังหวัด + ทะเลสาบ) จาก `@svg-maps/thailand` (MIT) |
| `src/Models/HeatmapModels.cs` | Create | `ZoneHeatValue`, DTO ของ JSON (`ProvinceMapData`, `ProvinceLocation`) |
| `src/Pages/Analytics/Components/HeatmapLogic.cs` | Create | ตารางจังหวัด→เขต, สูตรสี, centroid, parse label เขต (C# ล้วน) |
| `tests/EcmisWeb.Tests/HeatmapLogicTests.cs` | Create | เทสตรรกะทั้งหมด |
| `src/Pages/Analytics/Components/ThailandHeatmap.razor` | Create | SVG heatmap component (โหลด JSON, hover, click, legend) |
| `src/Pages/Analytics/Components/ThailandHeatmap.razor.css` | Create | สไตล์ scoped |
| `src/Pages/Analytics/Index.razor` | Modify | V6: สลับ canvas → component, โหลด snapshot, ตัดการเรียก `initV6WarningMap` |
| `src/Pages/Analytics/ComplaintStats.razor` | Modify | รับ `?zone=` + select เขตแสดงค่าที่เลือก |

---

## Task 0: สร้าง branch + asset `thai-provinces.json`

**Files:**
- Create: `src/wwwroot/data/thai-provinces.json`

- [ ] **Step 1: สร้าง branch**

```bash
git checkout -b feat/zone-heatmap-dashboard
```

- [ ] **Step 2: แปลงข้อมูลจากแพ็กเกจ @svg-maps/thailand**

```bash
node -e "
const t = require('/Users/thanthita.korn/p-ecmis/node_modules/@svg-maps/thailand');
const m = t.default || t;
const out = { viewBox: m.viewBox, locations: m.locations.map(l => ({ id: l.id, name: l.name, path: l.path })) };
require('fs').writeFileSync('src/wwwroot/data/thai-provinces.json', JSON.stringify(out));
console.log('viewBox:', out.viewBox, '| locations:', out.locations.length);
"
```

Expected output: `viewBox: 0 0 560 1025 | locations: 78`

- [ ] **Step 3: ตรวจไฟล์**

Run: `node -e "const j=require('./src/wwwroot/data/thai-provinces.json'); console.log(j.locations.find(l=>l.id==='bkk').name)"`
Expected: `Bangkok`

- [ ] **Step 4: Commit**

```bash
git add src/wwwroot/data/thai-provinces.json
git commit -m "feat(heatmap): add Thailand province SVG paths asset (from @svg-maps/thailand, MIT)"
```

---

## Task 1: Models + HeatmapLogic (TDD)

**Files:**
- Create: `src/Models/HeatmapModels.cs`
- Create: `src/Pages/Analytics/Components/HeatmapLogic.cs`
- Test: `tests/EcmisWeb.Tests/HeatmapLogicTests.cs`

- [ ] **Step 1: เขียนเทส (ต้อง fail ก่อน)**

สร้าง `tests/EcmisWeb.Tests/HeatmapLogicTests.cs`:

```csharp
using EcmisWeb.Data;
using EcmisWeb.Models;
using EcmisWeb.Pages.Analytics.Components;

namespace EcmisWeb.Tests;

public class HeatmapLogicTests
{
    [Fact]
    public void ProvinceZone_covers_76_provinces_all_zones_1_to_9()
    {
        Assert.Equal(76, HeatmapLogic.ProvinceZone.Count);
        Assert.All(HeatmapLogic.ProvinceZone.Values, z => Assert.InRange(z, 1, 9));
        for (var z = 1; z <= 9; z++)
            Assert.Contains(HeatmapLogic.ProvinceZone.Values, v => v == z);
        Assert.False(HeatmapLogic.ProvinceZone.ContainsKey("bkk")); // กทม. = ส่วนกลาง
    }

    [Fact]
    public void ColorForT_green_at_0_red_at_1_and_clamps()
    {
        Assert.Equal("hsl(140, 75%, 45%)", HeatmapLogic.ColorForT(0));
        Assert.Equal("hsl(0, 75%, 45%)", HeatmapLogic.ColorForT(1));
        Assert.Equal("hsl(70, 75%, 45%)", HeatmapLogic.ColorForT(0.5));
        Assert.Equal("hsl(140, 75%, 45%)", HeatmapLogic.ColorForT(-5));
        Assert.Equal("hsl(0, 75%, 45%)", HeatmapLogic.ColorForT(2));
    }

    [Fact]
    public void TFor_divides_by_max_and_handles_zero()
    {
        Assert.Equal(0.5, HeatmapLogic.TFor(5, 10), 3);
        Assert.Equal(0, HeatmapLogic.TFor(5, 0), 3);
        Assert.Equal(1, HeatmapLogic.TFor(20, 10), 3); // clamp
    }

    [Theory]
    [InlineData("ปปท.1", 1)]
    [InlineData("ปปท.4", 4)]
    [InlineData("ปปท.9", 9)]
    public void ZoneFromRegionLabel_parses_region_labels(string label, int expected)
        => Assert.Equal(expected, HeatmapLogic.ZoneFromRegionLabel(label));

    [Fact]
    public void ZoneFromRegionLabel_central_returns_null()
        => Assert.Null(HeatmapLogic.ZoneFromRegionLabel("ส่วนกลาง"));

    [Fact]
    public void ZoneName_has_all_9_zones()
    {
        for (var z = 1; z <= 9; z++)
            Assert.False(string.IsNullOrEmpty(HeatmapLogic.ZoneName(z)));
        Assert.StartsWith("เขต 4", HeatmapLogic.ZoneName(4));
    }

    [Fact]
    public void ComputeCentroids_averages_path_coordinates_per_zone()
    {
        // nbi อยู่เขต 1; ตัวเลขใน path = (10,20),(30,40) → centroid (20,30)
        var locs = new List<ProvinceLocation>
        {
            new() { Id = "nbi", Name = "Nonthaburi", Path = "m 10,20 30,40 z" },
        };
        var c = HeatmapLogic.ComputeCentroids(locs);
        Assert.Equal(20, c[1].X, 3);
        Assert.Equal(30, c[1].Y, 3);
        Assert.False(c.ContainsKey(2)); // เขตอื่นไม่มีข้อมูล
    }

    [Fact]
    public void Zone_enum_parses_query_param_format()
    {
        Assert.True(Enum.TryParse<Zone>("Pt4", out var z));
        Assert.Equal(Zone.Pt4, z);
        Assert.False(Enum.TryParse<Zone>("xx", out _));
    }
}
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `dotnet test tests/EcmisWeb.Tests/EcmisWeb.Tests.csproj --filter HeatmapLogicTests`
Expected: FAIL (compile error — `HeatmapLogic` ยังไม่มี)

- [ ] **Step 3: สร้าง models**

สร้าง `src/Models/HeatmapModels.cs`:

```csharp
namespace EcmisWeb.Models;

/// <summary>ค่าหนึ่งเขตบนฮีทแมพ: Value = ค่าเมตริกที่เลือก, Total = ทั้งหมดในเขต</summary>
public record ZoneHeatValue(int Value, int Total);

/// <summary>DTO ของ wwwroot/data/thai-provinces.json (จาก @svg-maps/thailand, MIT)</summary>
public class ProvinceMapData
{
    public string ViewBox { get; set; } = "";
    public List<ProvinceLocation> Locations { get; set; } = new();
}

public class ProvinceLocation
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Path { get; set; } = "";
}
```

- [ ] **Step 4: สร้าง HeatmapLogic**

สร้าง `src/Pages/Analytics/Components/HeatmapLogic.cs` (ตาราง `ProvinceZone` ยกมาทั้งตารางจาก p-ecmis `ThailandHeatmap.tsx` — ยืนยันเขตอำนาจ ป.ป.ท. จริงแล้ว ห้ามแก้เอง):

```csharp
using System.Globalization;
using System.Text.RegularExpressions;
using EcmisWeb.Models;

namespace EcmisWeb.Pages.Analytics.Components;

public static class HeatmapLogic
{
    /// <summary>รหัสจังหวัด (svg id) → เขต ปปท. 1–9; กทม./ทะเลสาบไม่อยู่ในตาราง (= ส่วนกลาง/ไม่มีเขต)</summary>
    public static readonly IReadOnlyDictionary<string, int> ProvinceZone = new Dictionary<string, int>
    {
        ["nbi"] = 1, ["pte"] = 1, ["aya"] = 1, ["sri"] = 1, ["lri"] = 1, ["sbr"] = 1, ["atg"] = 1, ["cnt"] = 1,
        ["cbi"] = 2, ["ryg"] = 2, ["cti"] = 2, ["trt"] = 2, ["cco"] = 2, ["pri"] = 2, ["skw"] = 2, ["nyk"] = 2, ["spk"] = 2,
        ["nma"] = 3, ["brm"] = 3, ["srn"] = 3, ["ssk"] = 3, ["ubn"] = 3, ["yst"] = 3, ["acr"] = 3, ["cpm"] = 3,
        ["kkn"] = 4, ["udn"] = 4, ["lei"] = 4, ["nki"] = 4, ["nbp"] = 4, ["bkn"] = 4, ["snk"] = 4, ["npm"] = 4,
        ["mdh"] = 4, ["mkm"] = 4, ["ret"] = 4, ["ksn"] = 4,
        ["cmi"] = 5, ["lpn"] = 5, ["lpg"] = 5, ["utd"] = 5, ["pre"] = 5, ["nan"] = 5, ["pyo"] = 5, ["cri"] = 5, ["msn"] = 5,
        ["nsn"] = 6, ["uti"] = 6, ["kpt"] = 6, ["tak"] = 6, ["sti"] = 6, ["plk"] = 6, ["pct"] = 6, ["pnb"] = 6,
        ["rbr"] = 7, ["kri"] = 7, ["spb"] = 7, ["npt"] = 7, ["skn"] = 7, ["skm"] = 7, ["pbi"] = 7, ["pkn"] = 7,
        ["nrt"] = 8, ["kbi"] = 8, ["pna"] = 8, ["pkt"] = 8, ["sni"] = 8, ["rng"] = 8, ["cpn"] = 8,
        ["ska"] = 9, ["stn"] = 9, ["trg"] = 9, ["plg"] = 9, ["ptn"] = 9, ["yla"] = 9, ["nwt"] = 9,
    };

    public static string ZoneName(int zone) => zone switch
    {
        1 => "เขต 1 (ภาคกลาง)", 2 => "เขต 2 (ภาคตะวันออก)", 3 => "เขต 3 (อีสานใต้)",
        4 => "เขต 4 (อีสานบน)", 5 => "เขต 5 (เหนือบน)", 6 => "เขต 6 (เหนือล่าง)",
        7 => "เขต 7 (ตะวันตก)", 8 => "เขต 8 (ใต้บน)", 9 => "เขต 9 (ใต้ล่าง)",
        _ => $"เขต {zone}",
    };

    /// <summary>0 = เขียว (น้อย) → 1 = แดง (มาก) — สูตรเดียวกับ p-ecmis</summary>
    public static string ColorForT(double t)
    {
        var c = Math.Clamp(t, 0, 1);
        var hue = (140 * (1 - c)).ToString("0.##", CultureInfo.InvariantCulture);
        return $"hsl({hue}, 75%, 45%)";
    }

    public static double TFor(int value, int maxValue)
        => maxValue <= 0 ? 0 : Math.Clamp((double)value / maxValue, 0, 1);

    /// <summary>"ปปท.4" → 4, "ส่วนกลาง"/อื่นๆ → null (ใช้ map ZoneVm.ByRegion → เลขเขต)</summary>
    public static int? ZoneFromRegionLabel(string label)
        => label.StartsWith("ปปท.") && int.TryParse(label[4..], out var n) && n is >= 1 and <= 9 ? n : null;

    /// <summary>จุดกึ่งกลางเขต = เฉลี่ยตัวเลขใน path ของจังหวัดในเขต (วิธีเดียวกับ p-ecmis)</summary>
    public static Dictionary<int, (double X, double Y)> ComputeCentroids(IEnumerable<ProvinceLocation> locations)
    {
        var acc = new Dictionary<int, (double X, double Y, int N)>();
        foreach (var loc in locations)
        {
            if (!ProvinceZone.TryGetValue(loc.Id, out var zone)) continue;
            var nums = Regex.Matches(loc.Path, @"-?\d+\.?\d*");
            double sx = 0, sy = 0; var n = 0;
            for (var i = 0; i + 1 < nums.Count; i += 2)
            {
                sx += double.Parse(nums[i].Value, CultureInfo.InvariantCulture);
                sy += double.Parse(nums[i + 1].Value, CultureInfo.InvariantCulture);
                n++;
            }
            if (n == 0) continue;
            var a = acc.TryGetValue(zone, out var v) ? v : (0, 0, 0);
            acc[zone] = (a.Item1 + sx / n, a.Item2 + sy / n, a.Item3 + 1);
        }
        return acc.ToDictionary(kv => kv.Key, kv => (kv.Value.X / kv.Value.N, kv.Value.Y / kv.Value.N));
    }
}
```

- [ ] **Step 5: รันเทสให้ผ่าน**

Run: `dotnet test tests/EcmisWeb.Tests/EcmisWeb.Tests.csproj --filter HeatmapLogicTests`
Expected: PASS — 8 เทสเขียวทั้งหมด

- [ ] **Step 6: Commit**

```bash
git add src/Models/HeatmapModels.cs src/Pages/Analytics/Components/HeatmapLogic.cs tests/EcmisWeb.Tests/HeatmapLogicTests.cs
git commit -m "feat(heatmap): heatmap logic (province-zone map, color scale, centroids) with tests"
```

---

## Task 2: ThailandHeatmap.razor component

**Files:**
- Create: `src/Pages/Analytics/Components/ThailandHeatmap.razor`
- Create: `src/Pages/Analytics/Components/ThailandHeatmap.razor.css`

- [ ] **Step 1: สร้าง component**

สร้าง `src/Pages/Analytics/Components/ThailandHeatmap.razor`:

```razor
@using System.Globalization
@using System.Net.Http.Json
@inject HttpClient Http

<div class="thm-root">
    @if (_loadFailed)
    {
        <div class="thm-msg">ไม่สามารถโหลดแผนที่ได้</div>
    }
    else if (_map is null)
    {
        <div class="thm-msg">กำลังโหลดแผนที่...</div>
    }
    else
    {
        <div class="thm-banner" style="color:@BannerColor">@BannerText</div>
        <div class="thm-svg-wrap">
            <svg viewBox="@_map.ViewBox" preserveAspectRatio="xMidYMid meet" role="img"
                 aria-label="แผนที่ @ValueLabel รายเขต ปปท." @onmouseout="ClearHover">
                @foreach (var loc in _map.Locations)
                {
                    var zone = HeatmapLogic.ProvinceZone.TryGetValue(loc.Id, out var zz) ? zz : (int?)null;
                    <path d="@loc.Path"
                          fill="@FillFor(zone)"
                          stroke="@(zone is not null && zone == _hoverZone ? "#0f172a" : "#ffffff")"
                          stroke-width="@(zone is not null && zone == _hoverZone ? "1.6" : "0.7")"
                          style="cursor:@(zone is null ? "default" : "pointer")"
                          @onmouseover="() => SetHover(zone)"
                          @onclick="() => ClickZone(zone)">
                        <title>@TitleFor(zone)</title>
                    </path>
                }
                @foreach (var lbl in CentroidLabels())
                {
                    <text x="@Inv(lbl.X)" y="@Inv(lbl.Y)" text-anchor="middle" dominant-baseline="central"
                          font-size="28" font-weight="800" fill="#ffffff"
                          stroke="rgba(15,23,42,0.55)" stroke-width="5" paint-order="stroke"
                          style="pointer-events:none">@lbl.Value</text>
                }
            </svg>
        </div>
        <div class="thm-legend">
            <span>น้อย</span>
            @foreach (var t in new[] { 0d, 0.25, 0.5, 0.75, 1d })
            {
                <span class="thm-dotcol">
                    <i style="background:@HeatmapLogic.ColorForT(t)"></i>
                    <small>@((int)Math.Round(t * MaxValue))</small>
                </span>
            }
            <span>มาก</span>
        </div>
    }
</div>

@code {
    [Parameter, EditorRequired] public IReadOnlyDictionary<int, ZoneHeatValue> Zones { get; set; } = new Dictionary<int, ZoneHeatValue>();
    [Parameter] public int MaxValue { get; set; }
    [Parameter] public string ValueLabel { get; set; } = "เรื่องร้องเรียน";
    [Parameter] public EventCallback<int> OnZoneClick { get; set; }

    private const string NoData = "#e5e7eb";
    private const string NoZone = "#f1f5f9";

    private static Task<ProvinceMapData?>? _mapTask;   // โหลด JSON ครั้งเดียวต่อ session
    private ProvinceMapData? _map;
    private bool _loadFailed;
    private int? _hoverZone;
    private Dictionary<int, (double X, double Y)> _centroids = new();

    protected override async Task OnInitializedAsync()
    {
        try
        {
            _mapTask ??= Http.GetFromJsonAsync<ProvinceMapData>("data/thai-provinces.json");
            _map = await _mapTask;
            if (_map is null || _map.Locations.Count == 0) { _loadFailed = true; return; }
            _centroids = HeatmapLogic.ComputeCentroids(_map.Locations);
        }
        catch
        {
            _loadFailed = true;
        }
    }

    private void SetHover(int? zone) { if (zone is int z) _hoverZone = z; }
    private void ClearHover() => _hoverZone = null;

    private async Task ClickZone(int? zone)
    {
        if (zone is int z) await OnZoneClick.InvokeAsync(z);
    }

    private string FillFor(int? zone)
    {
        if (zone is not int z) return NoZone;
        if (!Zones.TryGetValue(z, out var zv) || zv.Total == 0) return NoData;
        return HeatmapLogic.ColorForT(HeatmapLogic.TFor(zv.Value, MaxValue));
    }

    private string ValueText(int z)
        => Zones.TryGetValue(z, out var zv)
            ? (zv.Value == zv.Total ? $"{zv.Value}" : $"{zv.Value}/{zv.Total}")
            : "0";

    private string TitleFor(int? zone)
        => zone is int z
            ? $"ปปท. {HeatmapLogic.ZoneName(z)} — {ValueText(z)} เรื่อง (คลิกเพื่อดูสถิติเขต)"
            : "ส่วนกลาง (ไม่ใช่เขตพื้นที่)";

    private string BannerColor
        => _hoverZone is int z && Zones.TryGetValue(z, out var zv)
            ? HeatmapLogic.ColorForT(HeatmapLogic.TFor(zv.Value, MaxValue))
            : "#94a3b8";

    private string BannerText
        => _hoverZone is int z
            ? $"ปปท. {HeatmapLogic.ZoneName(z)} — {ValueText(z)} เรื่อง"
            : "ชี้ที่เขตเพื่อดูตัวเลข · คลิกเพื่อดูสถิติเขต";

    private IEnumerable<(int Zone, double X, double Y, int Value)> CentroidLabels()
    {
        foreach (var (zone, c) in _centroids)
            if (Zones.TryGetValue(zone, out var zv) && zv.Total > 0)
                yield return (zone, c.X, c.Y, zv.Value);
    }

    private static string Inv(double v) => v.ToString("0.#", CultureInfo.InvariantCulture);
}
```

- [ ] **Step 2: สร้าง scoped CSS**

สร้าง `src/Pages/Analytics/Components/ThailandHeatmap.razor.css`:

```css
.thm-root { display:flex; flex-direction:column; height:100%; min-height:0; gap:4px; }
.thm-banner { min-height:20px; font-size:13px; font-weight:600; text-align:center; flex-shrink:0; }
.thm-svg-wrap { flex:1; min-height:0; display:flex; justify-content:center; }
.thm-svg-wrap svg { width:100%; height:100%; }
.thm-legend { display:flex; gap:12px; justify-content:center; align-items:flex-start; font-size:10px; color:#94a3b8; flex-shrink:0; padding-bottom:4px; }
.thm-dotcol { display:flex; flex-direction:column; align-items:center; gap:2px; }
.thm-dotcol i { width:12px; height:12px; border-radius:50%; display:block; }
.thm-msg { padding:30px; text-align:center; color:#94a3b8; }
```

- [ ] **Step 3: Build**

Run: `dotnet build src/EcmisWeb.csproj`
Expected: Build succeeded, 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/Pages/Analytics/Components/ThailandHeatmap.razor src/Pages/Analytics/Components/ThailandHeatmap.razor.css
git commit -m "feat(heatmap): ThailandHeatmap SVG component (port from p-ecmis)"
```

---

## Task 3: ติดตั้งใน Index.razor (V6)

**Files:**
- Modify: `src/Pages/Analytics/Index.razor` (4 จุด: inject, การ์ดแผนที่ ~บรรทัด 811–827, `OnV6WarningTypeChanged` ~1362, render block V6 ~1802, `OnInitializedAsync` ~1524)

- [ ] **Step 1: เพิ่ม inject + using ที่หัวไฟล์**

ที่หัว `src/Pages/Analytics/Index.razor` แก้บล็อก inject เดิม:

```razor
@page "/analytics"
@layout MainLayout
@implements IDisposable
@using EcmisWeb.Data
@using System.Globalization
@inject ComplaintApiService ComplaintApi
@inject IJSRuntime JS
```

เป็น:

```razor
@page "/analytics"
@layout MainLayout
@implements IDisposable
@using EcmisWeb.Data
@using System.Globalization
@using EcmisWeb.Pages.Analytics.Components
@inject ComplaintApiService ComplaintApi
@inject IComplaintStatsService Stats
@inject NavigationManager Nav
@inject IJSRuntime JS
```

- [ ] **Step 2: สลับการ์ดแผนที่ V6**

ในบล็อก V6 (`v6-main-left`, ~บรรทัด 811) แทนที่ส่วนหัวการ์ด + พื้นที่แผนที่ — **เดิม:**

```razor
                            <div class="tc-head">
                                <div class="tc-row1">
                                    <div class="tc-title"><i class="bi bi-map-fill text-emerald"></i> แผนที่แจ้งเตือนความเสี่ยงรายภูมิภาค (WARNING HEATMAP)</div>
                                    <span class="bdg-nv border-emerald text-emerald font-monospace uppercase">@SelectedWarningType</span>
                                </div>
                            </div>
                            <div class="v6-map-area" style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-height: 0; position: relative;">
                                <canvas id="thailandRiskMapV6" class="wr-thailand-canvas" style="flex: 1; min-height: 0; width: 100%; object-fit: contain;"></canvas>
                                <div class="v6-map-legend">
                                    <span><i style="background:rgba(16,185,129,0.85);display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;"></i>&lt;50% ต่ำ</span>
                                    <span><i style="background:rgba(250,204,21,0.85);display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;"></i>50-65% ปานกลาง</span>
                                    <span><i style="background:rgba(249,115,22,0.85);display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;"></i>65-79% สูง</span>
                                    <span><i style="background:rgba(239,68,68,0.85);display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;"></i>≥80% สูงมาก</span>
                                </div>
                            </div>
```

**ใหม่:**

```razor
                            <div class="tc-head">
                                <div class="tc-row1">
                                    <div class="tc-title"><i class="bi bi-map-fill text-emerald"></i> แผนที่เรื่องร้องเรียนรายเขต ปปท. (ปีงบ 2569)</div>
                                    <span class="bdg-nv border-emerald text-emerald font-monospace uppercase">รวม @_heatTotal เรื่อง</span>
                                </div>
                            </div>
                            <div class="v6-map-area" style="flex: 1; display: flex; flex-direction: column; min-height: 0; position: relative;">
                                <ThailandHeatmap Zones="_heatZones" MaxValue="_heatMax" ValueLabel="เรื่องร้องเรียน" OnZoneClick="GoToZoneStats" />
                                <div style="text-align:center; font-size:12px; color:#94a3b8; padding:4px 0; flex-shrink:0;">
                                    ส่วนกลาง (กปท.1–5 + กอท.): <b style="color:#e2e8f0">@_centralCount</b> เรื่อง — ไม่มีอาณาเขตบนแผนที่
                                </div>
                            </div>
```

(ส่วน drilldown panel ม.62 ที่อยู่ถัดลงไปในการ์ดเดียวกัน **ไม่แตะ**)

- [ ] **Step 3: เพิ่ม field + โหลดข้อมูลใน @code**

เพิ่ม fields ใกล้ `SelectedWarningType` (~บรรทัด 1227):

```csharp
    // Zone heatmap (V6) — ข้อมูลจริงจาก IComplaintStatsService
    private Dictionary<int, ZoneHeatValue> _heatZones = new();
    private int _heatMax;
    private int _heatTotal;
    private int _centralCount;
```

ใน `OnInitializedAsync` (~บรรทัด 1524) เพิ่มต่อท้ายก่อนปิด method (หลัง `_loading = false;`):

```csharp
        var snap = await Stats.GetSnapshotAsync(StatsFilter.Default);
        foreach (var r in snap.Zones.ByRegion)
        {
            if (HeatmapLogic.ZoneFromRegionLabel(r.Label) is int zi)
                _heatZones[zi] = new ZoneHeatValue(r.Count, r.Count);
            else
                _centralCount += r.Count;
        }
        _heatMax = _heatZones.Count > 0 ? _heatZones.Values.Max(v => v.Value) : 0;
        _heatTotal = snap.Kpi.ReceivedThisYear;
```

และเพิ่ม method นำทาง (วางใกล้ `ShowV6Drilldown`):

```csharp
    private void GoToZoneStats(int zone) => Nav.NavigateTo($"/analytics/complaint-stats?zone=Pt{zone}");
```

- [ ] **Step 4: ตัดการเรียก initV6WarningMap (2 จุด)**

จุดที่ 1 (~บรรทัด 1362) — **เดิม:**

```csharp
    private async Task OnV6WarningTypeChanged(ChangeEventArgs e)
    {
        SelectedWarningType = e.Value?.ToString() ?? "all";
        await Task.Delay(10);
        await JS.InvokeVoidAsync("initV6WarningMap", "thailandRiskMapV6", SelectedWarningType);
    }
```

**ใหม่** (selector ยังใช้กรองการ์ดอื่นใน V6 จึงคงไว้ แค่ไม่วาดแผนที่แล้ว):

```csharp
    private void OnV6WarningTypeChanged(ChangeEventArgs e)
        => SelectedWarningType = e.Value?.ToString() ?? "all";
```

จุดที่ 2 (~บรรทัด 1802) ในบล็อก `else if (SelectedVersion == 6)` — ลบบรรทัดนี้ทิ้ง:

```csharp
            await JS.InvokeVoidAsync("initV6WarningMap", "thailandRiskMapV6", SelectedWarningType);
```

(ฟังก์ชัน `initV6WarningMap`/`drawThailandV6GeoMap` ใน `analytics.js` **คงไว้** ไม่ลบ)

- [ ] **Step 5: Build**

Run: `dotnet build src/EcmisWeb.csproj`
Expected: Build succeeded, 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/Pages/Analytics/Index.razor
git commit -m "feat(heatmap): replace V6 warning map with zone complaint heatmap (real data)"
```

---

## Task 4: ComplaintStats.razor รับ query param `zone`

**Files:**
- Modify: `src/Pages/Analytics/ComplaintStats.razor` (select เขต ~บรรทัด 937, `OnInitializedAsync` ~บรรทัด 122)

- [ ] **Step 1: เพิ่ม query parameter + ใช้ตอน init**

ใน `@code` แก้ — **เดิม:**

```csharp
    protected override async Task OnInitializedAsync() => await ReloadAsync();
```

**ใหม่:**

```csharp
    [SupplyParameterFromQuery(Name = "zone")]
    public string? ZoneParam { get; set; }

    protected override async Task OnInitializedAsync()
    {
        if (Enum.TryParse<Zone>(ZoneParam, out var z))
            _filter = _filter with { Zone = z };
        await ReloadAsync();
    }
```

- [ ] **Step 2: ให้ dropdown เขตแสดงค่าที่เลือก**

แก้ select เขต — **เดิม:**

```razor
        <select class="cs-select" @onchange="OnZoneChanged">
```

**ใหม่:**

```razor
        <select class="cs-select" value="@(_filter.Zone?.ToString() ?? "")" @onchange="OnZoneChanged">
```

> หมายเหตุ: ไฟล์มี `<select class="cs-select"` 3 ตัว (Type/Status/Zone) — ตัวเขตคือตัวที่ `@onchange="OnZoneChanged"` เท่านั้น

- [ ] **Step 3: Build + รันเทสทั้งหมด**

Run: `dotnet build src/EcmisWeb.csproj && dotnet test tests/EcmisWeb.Tests/EcmisWeb.Tests.csproj`
Expected: Build 0 errors; เทสผ่านทั้งหมด (21 เดิม + 8 ใหม่ = 29)

- [ ] **Step 4: Commit**

```bash
git add src/Pages/Analytics/ComplaintStats.razor
git commit -m "feat(heatmap): ComplaintStats accepts ?zone= query param as initial filter"
```

---

## Task 5: ตรวจด้วยตา (manual verification)

**Files:** ไม่มี (ตรวจใน browser)

- [ ] **Step 1: รันแอป**

Run: `dotnet run --project src/EcmisWeb.csproj` แล้วเปิด `http://localhost:5000/analytics`

- [ ] **Step 2: ตรวจตามรายการ**

- V6 (ค่าเริ่มต้น): การ์ดซ้ายแสดงฮีทแมพ SVG หัวการ์ด "แผนที่เรื่องร้องเรียนรายเขต ปปท. (ปีงบ 2569)" badge "รวม 560 เรื่อง"
- สีตามข้อมูลจริง: ปปท.4 (55) เข้มสุด, ปปท.9 (18) อ่อนสุด, กทม. สีเทาอ่อน
- ตัวเลขสีขาวกลางเขตครบ 9 เขต; แถวล่าง "ส่วนกลาง (กปท.1–5 + กอท.): **200** เรื่อง" (กปท.1–5 = 172, กอท. = 27+1 ออกเลข = 28; ตรวจทาน: เขต 1–9 รวม 360 + 200 = 560)
- Hover เขต → banner เปลี่ยนเป็นชื่อเขต + ตัวเลข, เส้นขอบเขตเข้มขึ้น
- คลิก ปปท.4 → ไป `/analytics/complaint-stats?zone=Pt4` → KPI แสดง 55, dropdown เขตค้างที่ ปปท.4
- กดปุ่ม "ล้าง" ในหน้าสถิติ → กลับเป็น 560 ทุกเขต
- สลับ DEV VERSION เป็น V1–V5 → แผนที่/หน้าเดิมยังทำงานปกติ (canvas เดิมของ V1–V3 ไม่พัง)
- เปิด `/analytics/complaint-stats` ตรงๆ (ไม่มี query) → ไม่ filter เขต ทำงานเหมือนเดิม

- [ ] **Step 3: หยุดแอป (Ctrl+C) — ไม่มี commit (ตรวจอย่างเดียว)**

---

## Final verification

- [ ] รันเทสทั้งหมด: `dotnet test tests/EcmisWeb.Tests/EcmisWeb.Tests.csproj` → PASS ทั้งหมด
- [ ] Build สะอาด: `dotnet build src/EcmisWeb.csproj` → 0 errors
