# V6 Fullscreen Button + Map Drill-down — Design Spec

**วันที่:** 2026-06-11 · **สถานะ:** อนุมัติแล้ว (เลือกผ่าน session)

## ฟีเจอร์ 1 — ปุ่มดูเต็มจอ (เต็มจอจริงทั้งหน้าจอ)

- ปุ่มไอคอน `bi-arrows-fullscreen` ใน `wr-topbar` ข้างปุ่ม Export, tooltip "ดูเต็มจอ"
- กด → เรียก JS `toggleWarRoomFullscreen()` (เพิ่มใน `analytics.js`): ถ้าไม่อยู่ใน fullscreen เรียก `requestFullscreen()` บน `.cs-shell.an-fullscreen`; ถ้าอยู่แล้ว `exitFullscreen()` — ESC ออกได้ตามปกติ
- **ไม่ต้องเขียน CSS ใหม่:** กฎ `.an-fullscreen.cs-shell:fullscreen { position:fixed; inset:0; ... }` ใน `war-room-fullscreen.css` มีครบอยู่แล้ว (ซ่อน sidebar/topbar ระบบอัตโนมัติ)

## ฟีเจอร์ 2 — แผนที่ drill-down จบในหน้าเดียว

คลิกเขตบนฮีทแมพ → **ไม่นำทางออก** ฝั่งขวา (ใต้แถว KPI) สลับเป็นข้อมูลของเขตนั้น มี breadcrumb กดย้อนได้

### State (ใน Index.razor @code)

```
Zone?  _drillZone       // null = ระดับประเทศ (แสดงแดชบอร์ดปกติ)
string? _drillProvince  // null = ระดับเขต
StatsSnapshot? _drillSnap
```

### Data flow

- คลิกเขต n → `GetSnapshotAsync(StatsFilter.Default with { Zone = Pt{n} })` (service เดิม ไม่แตะ backend)
- คลิกจังหวัดในลิสต์ → `... with { Zone, Province = ชื่อ }`
- breadcrumb: "ประเทศ" (ล้าง drill ทั้งหมด) → "ปปท. เขต n" (ล้างจังหวัด) → "จังหวัด"
- ปิด drill → `_chartsInitialized = false` เพื่อให้กราฟ Chart.js เดิม (chartCompareV6/chartIntakeV6) วาดใหม่ตอนกลับมา

### Drill view (แทนแถวกลาง+ล่างของคอลัมน์ขวา เมื่อ `_drillZone != null`)

1. **แถว breadcrumb** + ปุ่ม × ปิด + ลิงก์เล็ก "เปิดหน้าสถิติเต็ม →" (ไป `/analytics/complaint-stats?zone=`)
2. **แถวสรุป 3 กลุ่ม** (การ์ดธีมเดิม):
   - มาตรา — จาก `snap.LegalType.Slices` (แท่ง HTML สัดส่วน ไม่ใช้ Chart.js)
   - สถานะ — group `snap.Rows` ตาม `Status` (`ComplaintStatsData.StatusLabel`)
   - รายเดือน — `snap.Monthly.ByMonth` เป็นแท่ง HTML
3. **ลิสต์อันดับ** —
   - ระดับเขต: Top 10 จังหวัดของเขต (`snap.TopProvinces`) **คลิกต่อได้** → ระดับจังหวัด
   - ระดับจังหวัด: ช่องทางรับเรื่องของจังหวัด (`snap.Channels.All` ที่ Count > 0)

### Heatmap highlight

`ThailandHeatmap` เพิ่ม `[Parameter] int? SelectedZone` — ถ้ามีค่า เขตอื่นจางลง (สีเทาอ่อน) เขตที่เลือกสีเต็ม; คลิกเขตเดิมซ้ำ = ปิด drill

## ไม่ทำ (YAGNI)

ไม่มี zoom แผนที่เข้าไประดับจังหวัด, ไม่มี animation เพิ่ม, ไม่แตะ V1–V5/service/backend

## Verification

- Playwright: คลิกเขต 4 → breadcrumb "ประเทศ > ปปท. เขต 4", ยอดรวมเขต = 55, คลิก "อุดรธานี" → ระดับจังหวัด, กด "ประเทศ" → กลับแดชบอร์ดปกติ + กราฟกลับมา
- ปุ่มเต็มจอ: คลิกแล้ว `document.fullscreenElement` ไม่เป็น null
- เทสเดิม 33 ตัวผ่าน, build 0 errors, จอยังพอดี viewport
