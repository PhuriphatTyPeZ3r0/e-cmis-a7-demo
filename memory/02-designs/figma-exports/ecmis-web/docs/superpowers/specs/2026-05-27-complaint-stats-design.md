# TOR 12.2 — สถิติการรับเรื่องร้องเรียน `/analytics/complaint-stats`

## Overview

หน้าวิเคราะห์สถิติข้อมูลการรับเรื่องร้องเรียนของสำนักงาน ป.ป.ท. ตาม TOR 12.2  
ผู้ใช้: Officer / ผู้ใช้งานที่มีสิทธิ์ `CanReadReports`

Flow: เข้าเมนู → เห็นภาพรวม → กรองช่วงวันที่/ช่องทาง → วิเคราะห์ประเภท/พื้นที่ → สรุปสถานะ → Export

---

## Layout: Dashboard-first (Option A)

```
[Page Header: ชื่อหน้า + ปุ่ม Export PDF / Excel]
[KPI Cards Row: 5 ใบ]
[Filter Bar]
[Charts Row 1: Donut | Line | Bar]
[Charts Row 2: Horizontal Bar | Stacked Bar + Table]
[Export Summary Bar]
```

---

## KPI Cards (5 ใบ)

| Card | ค่า | สี |
|------|-----|----|
| เรื่องทั้งหมด | COUNT(*) | น้ำเงิน |
| เสร็จสิ้นแล้ว | COUNT(status=closed) + % | เขียว |
| กำลังดำเนินการ | COUNT(status=active) + % | ส้ม |
| รอดำเนินการ | COUNT(status=pending) + % | แดง |
| ส่งต่อหน่วยงาน | COUNT(status=transfer) + % | ม่วง |

---

## Filter Bar

| Filter | ประเภท | Field |
|--------|--------|-------|
| วันที่รับเรื่อง จาก–ถึง | Date range (2 inputs) | `ReceivedAt` |
| ช่องทางรับ | Dropdown | `Channel` |
| ประเภทคดี | Dropdown | `Category` |
| จังหวัด | Dropdown | `Province` |
| ปุ่มแสดงผล | Primary button | — |
| ปุ่มล้างค่า | Outline button | — |

กรณีไม่พบข้อมูล → แสดง badge "ไม่พบข้อมูลในช่วงที่เลือก" พร้อมปิด charts ให้ user เปลี่ยนตัวกรอง (ตรง Flow "ไม่พบ → วนกลับ")

---

## Charts

### Row 1

**Chart 1 — ช่องทางรับเรื่อง (Donut)**
- Library: Chart.js (มีอยู่แล้วใน project)
- Data: GROUP BY `Channel` → count + %
- แสดง legend ข้างๆ donut

**Chart 2 — แนวโน้มรายเดือน (Line)**
- Data: GROUP BY MONTH(`ReceivedAt`) ปีปัจจุบัน vs ปีก่อน
- 2 เส้น: ปีที่เลือก (solid) vs ปีก่อน (dashed)

**Chart 3 — ประเภทคดี (Horizontal Bar)**
- Data: GROUP BY `Category`
- สี: ม.18/4=น้ำเงิน, ม.58/2=เขียว, ส่งคืน=เหลือง, วินัย=แดง

### Row 2

**Chart 4 — Top 10 จังหวัด (Horizontal Bar)**
- Data: GROUP BY `Province` ORDER BY count DESC LIMIT 10

**Chart 5 — สถานะเรื่อง (Stacked Bar + Table)**
- Stacked horizontal bar แสดงสัดส่วน
- ตารางสรุป: สถานะ / จำนวน / สัดส่วน

---

## Export

- **Excel**: ส่งออก raw data ที่ filter ไว้ทั้งหมด (ใช้ `window.ecmis.downloadTextFile` pattern เดิม)
- **PDF**: `window.print()` พร้อม `@media print` CSS — ซ่อน sidebar/filter แสดงแค่ charts และตาราง
- Export button อยู่ทั้ง header และ footer ของหน้า

---

## Data Source

- `ComplaintService.GetComplaintsAsync()` — load ทั้งหมดแล้ว filter/group ใน Blazor client-side
- Fields ที่ใช้: `ReceivedAt`, `Channel`, `Category`, `Province`, `Status`
- ไม่ต้องเพิ่ม API endpoint ใหม่ (ใช้ข้อมูลที่ ComplaintService มีอยู่แล้ว)

---

## File Structure

| ไฟล์ | Action |
|------|--------|
| `src/Pages/Analytics/ComplaintStats.razor` | Rewrite (จาก placeholder) |
| `src/Pages/Analytics/ComplaintStats.razor.css` | Create |

---

## Permission

ใช้ `@layout MainLayout` + guard เดิมจาก NavMenu (`CanReadReports`) — ไม่ต้องเพิ่ม route guard ใหม่
