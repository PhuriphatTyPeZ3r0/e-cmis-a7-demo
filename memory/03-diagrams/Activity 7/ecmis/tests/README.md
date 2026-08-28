# tests — ตรวจความไร้รอยต่อ + สิทธิ์ของ ecmis-transform

สร้าง 2026-08-17 (รอบ 0–3) · เพิ่ม RBAC 2026-08-18 (รอบ 4)
อ้างอิง `ECMIS-TRANSFORM-SEAM-AUDIT-2026-08-17.md`

| ไฟล์ | ตรวจอะไร | ต้องมีอะไร |
|---|---|---|
| `register-dropdowns.test.mjs` | master data และ dependent dropdown ของหน้า register — ประเภทเจ้าหน้าที่/สายงาน/ระดับตำแหน่ง/หน่วยงาน 3 ระดับ, validation และ payload ที่บันทึก | node เท่านั้น (<1 วินาที) |
| `seam-logic.test.mjs` | logic ของ `cases.js` + `handoff.js` ด้วย `node:vm` — getCase strict, envelope 13 ฟิลด์, ack, revision, การกัน `global.ECMIS` ทับ, bridge ของ ก7/ก10 | node เท่านั้น (~2 วิ) |
| `seam-dom.test.mjs` | เรนเดอร์จริงด้วย Chromium — แถบเคส/ท่อขึ้นทุกกิจกรรม, CSS ที่กู้คืน, ฟอนต์ local, ท่อ ก5→ก7 end-to-end, เส้นตีกลับ ก7→ก5, หน้าสาธารณะสะอาด, regression จอ 768 / hash router / แถวจริง / sessionStorage | เซิร์ฟเวอร์ + playwright (~7 นาที) |
| `rbac.test.mjs` | สิทธิ์ต่อผู้ใช้ — 11 บัญชี × 10 กิจกรรม, การ์ดที่ล็อก, เข้าตรงด้วย URL, ท่อที่ปลายทางนอกสิทธิ์, สลับผู้ใช้แล้วรับเรื่องต่อ, read-only, ก11, ก14 | เซิร์ฟเวอร์ + playwright (~4 นาที) |

## รัน

```bash
# ตรวจหน้า register ได้โดยไม่ต้องเปิดเซิร์ฟเวอร์
node tests/register-dropdowns.test.mjs

# 1) เปิดเซิร์ฟเวอร์ก่อน (จำเป็นสำหรับ 2 ชุดหลัง)
cd /Users/jetsadasomporn/Downloads/ecmis-transform
python3 tests/serve.py &

# 2) รันทีละชุด — อย่ารันพร้อมกัน จะแย่ง Chromium
node tests/seam-logic.test.mjs
node tests/seam-dom.test.mjs
node tests/rbac.test.mjs
```

> **ใช้ `tests/serve.py` อย่าใช้ `python3 -m http.server`** — ตัวหลังรับ Chromium หลายสิบ context
> พร้อมกันไม่ไหว จะหลุดเป็นครั้งคราวแล้วเทสต์ฟ้อง `net::ERR_SOCKET_NOT_CONNECTED`
> ทั้งที่โค้ดไม่ได้ผิด · `serve.py` เป็น ThreadingTCPServer + คิว 128
>
> ชุดที่ใช้เบราว์เซอร์เปิด Chromium หลายสิบ context จึงกินเวลาหลายนาที
> อยากเช็กเร็ว ๆ ใช้ `seam-logic` อย่างเดียวก็จับ regression ของชั้นข้อมูลได้แล้ว

> **`seam-dom` ไม่ได้ทดสอบสิทธิ์** — มันล็อกอินด้วย `visible:['*']` เสมอ เพื่อให้เดินทุกกิจกรรมได้
> ฉะนั้น "seam-dom เขียว" ไม่ได้แปลว่าสิทธิ์ถูกต้อง เรื่องสิทธิ์อยู่ที่ `rbac.test.mjs` อย่างเดียว

ทั้งสองชุดที่ใช้เบราว์เซอร์ import playwright จาก `E-CMIS-A4/node_modules`
(โปรเจกต์ต้นทาง ก4+5 ติดตั้งไว้แล้ว) ถ้าย้ายเครื่องให้แก้ path บรรทัด `import` หรือ `npm i -D playwright`

## บัญชีที่ใช้ทดสอบ

`g4_officer` · `g5_invest` · `g6_witness` · `g7_sec` · `g7_board` · `g8_check` ·
`g9_warrant` · `g10_legal` · `g12_report` (อ่านอย่างเดียว) · `g14_admin` (เห็นทุกกิจกรรม) — รหัส `1234`
`demo / demo` เห็นทั้งหมด ใช้เดินดูทั้งสายงาน
แก้ได้ที่ `shared-assets/auth.js` → `AUTH_USERS`

## ภาพหน้าจอ

| ไฟล์ | สิ่งที่เห็น |
|---|---|
| `shot-0-hub.png` | หน้ารวมกิจกรรม |
| `shot-1-ก5-pipes.png` | ท่อส่งต่อของ ก5 |
| `shot-2-ก7-inbox.png` | ก7 รับเรื่อง + envelope 13 ฟิลด์ + เลขรับ |
| `shot-3-timeline.png` | เส้นทางเคสข้ามกิจกรรม |
| `shot-4-ก9-new.png` | ก9 เวอร์ชัน 785K |
| `shot-5-return-reason.png` | เลือกเหตุที่ตีกลับ |
| `shot-6-ก5-returned.png` | ก5 เห็นสำนวนถูกตีกลับ |
| `shot-7-ก8-chk002-row.png` | แถว B-2026-07-004 ในตาราง CHK002 |
| `shot-8-deny.png` | ฉากกั้นเมื่อไม่มีสิทธิ์ |
| `shot-9-queued.png` | ส่งแล้วรอปลายทางรับ (ปลายทางนอกสิทธิ์) |
| `shot-10-ก11.png` | ก11 นำเข้าข้อมูล |
| `shot-11-ก14-matrix.png` | ตารางสิทธิ์ใน ก14 |
