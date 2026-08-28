# Zone Heatmap บนแดชบอร์ดวิเคราะห์ (V6) — Design Spec

**วันที่:** 2026-06-10
**สถานะ:** รอรีวิว
**ที่มา:** port `ThailandHeatmap.tsx` จากโปรเจกต์ p-ecmis (`~/p-ecmis/src/components/ThailandHeatmap.tsx`) มาเป็น Blazor component บนหน้า `/analytics` (เมนู วิเคราะห์รายงาน → แดชบอร์ดวิเคราะห์)

## เป้าหมาย

แทนที่แผนที่ canvas "WARNING HEATMAP" (mock risk data) ใน layout V6 ของ `src/Pages/Analytics/Index.razor` ด้วยฮีทแมพ SVG **เรื่องร้องเรียนรายเขต ปปท. 1–9** ที่ใช้ข้อมูลจริงจาก `IComplaintStatsService` (560 เรื่อง ปีงบ 2569, เล่ม พย68) — หน้าตา/พฤติกรรมเหมือนต้นฉบับ p-ecmis: choropleth เขียว→แดง, ตัวเลขกลางเขต, hover banner, legend, คลิกเขตเพื่อ drill-down

## ขอบเขต

**ทำ:**
1. Component ใหม่ `ThailandHeatmap.razor` (SVG ล้วน ไม่มี JS)
2. Static asset `thai-provinces.json` (SVG path 77 จังหวัด)
3. ติดตั้งแทนแผนที่เดิมเฉพาะใน **V6** ของ `/analytics`
4. คลิกเขต → นำทางไป `/analytics/complaint-stats?zone=<Zone>` พร้อม filter เขตตั้งต้น
5. Unit tests ใน `tests/EcmisWeb.Tests`

**ไม่ทำ (YAGNI):**
- ไม่แตะ layout V1–V5 และไม่ลบฟังก์ชัน JS เดิม (`initV6WarningMap`, `drawThailandV6GeoMap`)
- ไม่มี animation, ไม่มี dropdown สลับเมตริก, ไม่แสดงระดับจังหวัด
- ไม่แตะ backend / API

**พฤติกรรมที่เปลี่ยน (ตั้งใจ):** คลิกบนแผนที่ V6 เดิมเปิด modal รายจังหวัด (`ClickProvince`) — เวอร์ชันใหม่คลิกแล้ว**นำทางไปหน้าสถิติพร้อม filter เขต**แทน. Drilldown panel ม.62 ที่เปิดจากการ์ดข้าง (`ShowV6Drilldown`) คงไว้เหมือนเดิม

## สถาปัตยกรรม

```
IComplaintStatsService.GetSnapshotAsync(StatsFilter.Default)
        │  ZoneVm.ByRegion  (ปปท.1–9 + ส่วนกลาง)
        ▼
Index.razor (V6 map card)
        │  Dictionary<int,(Value,Total)> เขต 1–9  + ตัวเลขส่วนกลาง
        ▼
ThailandHeatmap.razor ── โหลด thai-provinces.json (HttpClient, ครั้งเดียว/แคชใน static)
        │  คลิกเขต n
        ▼
NavigationManager → /analytics/complaint-stats?zone=Pt{n}
        ▼
ComplaintStats.razor อ่าน query param → ตั้ง _filter.Zone ตั้งต้น
```

## หน่วยที่ 1 — `src/Pages/Analytics/Components/ThailandHeatmap.razor`

Port ตรงจาก p-ecmis (React → Blazor):

| ของเดิม (tsx) | ของใหม่ (razor) |
|---|---|
| props `zones, maxValue, valueLabel, compact, onZoneClick` | `[Parameter] Zones (IReadOnlyDictionary<int, ZoneHeatValue>), MaxValue, ValueLabel, OnZoneClick (EventCallback<int>)` — ตัด `compact` ทิ้ง (มีผู้ใช้เดียว) |
| `import thailand from "@svg-maps/thailand"` | โหลด `data/thai-provinces.json` ผ่าน `HttpClient` (แคชใน `static Task<ProvinceMapData?>` กันโหลดซ้ำ) |
| `useState(hoverZone)` | field `_hoverZone` + `@onmouseover`/`@onmouseout` ราย path |
| `useMemo(zoneCentroids)` | คำนวณครั้งเดียวหลังโหลด JSON |
| click → `onZoneClick(zone)` | `@onclick` → `OnZoneClick.InvokeAsync(zone)` |

- `ZoneHeatValue` = record `(int Value, int Total)` — ประกาศใน `src/Models/` (ไฟล์ `HeatmapModels.cs`) พร้อม `ProvinceMapData`/`ProvinceLocation` (DTO ของ JSON)
- ตาราง `PROVINCE_ZONE` (รหัสจังหวัด → เขต 1–9, กทม. = null) **ยกมาทั้งตารางจาก p-ecmis** ซึ่งยืนยันเขตอำนาจจริงแล้ว — เก็บในคลาส logic ข้อ 1.1
- สีและสเกล: `hsl(140×(1−t), 75%, 45%)`, ไม่มีข้อมูล = `#e5e7eb`, นอกเขต (กทม.) = `#f1f5f9` — ค่าเดียวกับต้นฉบับ
- ตัวเลขสีขาว stroke น้ำเงินเข้มที่ centroid เขต, hover banner เหนือแผนที่, dot legend 5 ระดับใต้แผนที่ — โครงเดียวกับต้นฉบับ
- ขนาด: SVG ไม่ fix ขนาดเป็น px — ใช้ `viewBox="0 0 560 1025"` + `style="width:100%;height:100%"` ให้การ์ดแม่ (parent) คุมขนาดผ่าน CSS ฝั่งเดียว

### 1.1 `src/Pages/Analytics/Components/HeatmapLogic.cs` (C# ล้วน — testable)

- `static IReadOnlyDictionary<string,int> ProvinceZone` — ตารางจังหวัด→เขต
- `static string ColorForT(double t)` — สูตร HSL
- `static double TFor(value, maxValue)` — clamp 0..1
- `static Dictionary<int,(double X,double Y)> ComputeCentroids(locations)` — เฉลี่ยพิกัดจาก path
- `static int? ZoneFromRegionLabel(string label)` — "ปปท.4" → 4, "ส่วนกลาง" → null (ใช้ตอน map `ZoneVm.ByRegion`)

## หน่วยที่ 2 — `src/wwwroot/data/thai-provinces.json`

- สร้างครั้งเดียวจาก `~/p-ecmis/node_modules/@svg-maps/thailand/build/index.js` (แพ็กเกจ MIT) ด้วยสคริปต์ node สั้นๆ ตอน implement — ไม่เพิ่ม dependency ใดๆ ใน ecmis-web
- รูปแบบ: `{ "viewBox": "0 0 560 1025", "locations": [{ "id": "cmi", "name": "Chiang Mai", "path": "m..." }] }` (77 รายการ)
- ใส่คอมเมนต์ที่มา+license ใน design spec นี้และใน README ของ data ไม่ได้ (JSON ไม่มีคอมเมนต์) → ระบุที่มาในไฟล์นี้ถือว่าเพียงพอ (MIT แค่ต้องคง copyright notice ใน source ที่แจกจ่าย — เพิ่มบรรทัด attribution ใน `docs/` นี้)

## หน่วยที่ 3 — ติดตั้งใน `Index.razor` (V6)

แก้บล็อก `v6-map-area` (บริเวณบรรทัด ~818–827):

- **ลบ:** `<canvas id="thailandRiskMapV6">` + `v6-map-legend` (legend ฮีทแมพใหม่มาจาก component เอง)
- **ใส่:** `<ThailandHeatmap Zones="_heatZones" MaxValue="_heatMax" ValueLabel="เรื่องร้องเรียน" OnZoneClick="GoToZoneStats" />`
- **หัวการ์ด:** เปลี่ยนเป็น "แผนที่เรื่องร้องเรียนรายเขต ปปท. (ปีงบ 2569)" badge แสดงยอดรวม
- **แถวสรุปส่วนกลาง:** ใต้แผนที่ในการ์ดเดียวกัน — "ส่วนกลาง (กปท.1–5 + กอท.): NNN เรื่อง" เพราะหน่วยส่วนกลางไม่มีอาณาเขตบนแผนที่
- **@code:** inject `IComplaintStatsService`; ใน `OnInitializedAsync` (เฉพาะครั้งแรก ไม่ผูกกับ timer ที่มีอยู่) เรียก `GetSnapshotAsync(StatsFilter.Default)` แล้วแปลง `ByRegion` → `_heatZones` (เขต 1–9) + `_centralCount`; `_heatMax` = ค่าสูงสุดในเขต 1–9
- **ลบการเรียก** `initV6WarningMap("thailandRiskMapV6", ...)` 2 จุด (บรรทัด ~1366, ~1802) — ตัวฟังก์ชันใน analytics.js คงไว้
- ส่วนอื่นของ V6 (drilldown ม.62, การ์ดขวา, KPI) **ไม่แตะ**

หมายเหตุ: `Total` ของ `ZoneHeatValue` ในบริบทนี้ = ยอดเรื่องทั้งเขต (ใช้ค่าเดียวกับ `Value` เพราะเมตริกคือ "เรื่องทั้งหมด") — banner จะแสดงเฉพาะ Value ถ้า Value==Total

## หน่วยที่ 4 — `ComplaintStats.razor` รับ query param

- เพิ่ม `[SupplyParameterFromQuery(Name = "zone")] public string? ZoneParam { get; set; }`
- ใน `OnInitializedAsync`: ถ้า parse `ZoneParam` เป็น enum `Zone` ได้ → `_filter = _filter with { Zone = parsed }` ก่อน `ReloadAsync()`
- dropdown เขตต้องแสดงค่าที่เลือก: เพิ่ม `value="@(_filter.Zone?.ToString() ?? "")"` ที่ `<select>` ของเขต (ของ Type/Status ไม่จำเป็นต้องแก้)

## Error handling

- โหลด `thai-provinces.json` ล้มเหลว → component แสดง `<div>` ข้อความ "ไม่สามารถโหลดแผนที่ได้" แทน SVG — หน้าอื่นๆ ทำงานต่อปกติ
- `GetSnapshotAsync` ล้มเหลว/ยังไม่มา → การ์ดแสดงสถานะ "กำลังโหลด..." (snapshot เป็น seed ใน-memory จึงแทบเป็นไปไม่ได้ แต่กันไว้)
- เขตที่ไม่มีข้อมูล (count 0) → สีเทา `#e5e7eb` ไม่แสดงตัวเลข

## Testing (xUnit ใน `tests/EcmisWeb.Tests/HeatmapLogicTests.cs`)

1. `ProvinceZone` มี 76 จังหวัด (77 − กทม.) และค่าอยู่ในช่วง 1–9 ครบทุกเขต
2. `ColorForT(0)` = เขียว (`hsl(140, ...)`), `ColorForT(1)` = แดง (`hsl(0, ...)`), clamp นอกช่วง
3. `ZoneFromRegionLabel`: "ปปท.1"→1 … "ปปท.9"→9, "ส่วนกลาง"→null
4. `ComputeCentroids` กับ path ตัวอย่าง → ค่าเฉลี่ยถูกต้อง
5. Query param: `Enum.TryParse<Zone>("Pt4")` → `Zone.Pt4` (กันชื่อ enum เปลี่ยน)

ตรวจด้วยตา (manual): `/analytics` V6 แผนที่ระบายสีตามข้อมูลจริง (เขต Pt4=55 เข้มสุด, Pt9=18 อ่อนสุด), hover/คลิกทำงาน, คลิก ปปท.4 → หน้าสถิติแสดง 55 เรื่อง dropdown เขตเลือก ปปท.4 อยู่

## Attribution

ข้อมูลรูปร่างจังหวัด: [`@svg-maps/thailand`](https://github.com/VictorCazanave/svg-maps) © Victor Cazanave, MIT License — แปลงเป็น `thai-provinces.json` เพื่อใช้ใน ecmis-web
