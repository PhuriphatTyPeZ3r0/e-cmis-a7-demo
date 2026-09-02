# 2026-09-02 — รวมบันทึกเสนอ + คำสั่ง เป็นเอกสารชุดเดียวในโหมด appoint (order.html)

## โจทย์
`order.html` โหมด appoint (คำสั่งแต่งตั้ง ปปท.5-02/5-05/5-08/5-17) — เดิมแสดง/พิมพ์เฉพาะตัวคำสั่ง
ต้องการให้เป็น "เอกสารชุดเดียว": บันทึกเสนอเพื่อลงนาม (ปปท.5-01 sub / 5-04 base) นำหน้า + คำสั่งต่อท้าย

## การตัดสิน (grill)
- รวมเป็นชุดเดียว (ไม่ใช่ toggle)
- คำสั่ง **ขึ้นแผ่นใหม่**, เลขหน้า **เริ่มนับ ๑ ใหม่ที่คำสั่ง** (แต่ละเอกสารนับเลขหน้าเอง)
- ข้อมูลบันทึกเสนอ: ดึงจาก `kase` (`meetingNo`/`meetingDate`/`agendaNo`) + รายชื่อคณะจากฟอร์ม appoint; ช่องที่ไม่มี → เส้นจุด (ไม่เพิ่มการ์ดฟอร์มใหม่)
- ลายเซ็น: digital sign 2-step ทำเฉพาะคำสั่ง; บันทึกเสนอเป็นบล็อกเส้นจุด (ผอ.กบค. เสนอ / ประธานฯ เห็นชอบ-ลงนาม)
- พิมพ์/PDF = ไฟล์เดียวรวม; DOCX = follow-up (ยังออกเฉพาะคำสั่ง — `downloadTemplate` static)
- ทำกับ appoint ทุกแบบ (`buildAppointCoverMemoHtml` เลือก 5-01/5-04 ตาม `isSub`)
- โหมด memo (base + 7.x tabs) และ amend — คงเดิมทั้งหมด

## การแก้

### `assets/ecmis-app.js` — `paginateDoc()` รองรับ `opts.append`
`containerEl.innerHTML = ...` → ถ้า `opts.append` ใช้ `insertAdjacentHTML('beforeend', ...)` แทน
(เรนเดอร์หลายเอกสารต่อกันใน container เดียว, แต่ละชุด paginate แยก)

### `order.html`
1. `paginateFromHtml(container, html, title, opts)` — เพิ่ม param `opts.append`, ส่งต่อเข้า `paginateDoc`; แยก `runningHeaderHtml` ออกมาใช้ร่วม
2. `renderAppointDoc()` ท้ายฟังก์ชัน: `docPaper.innerHTML=''` → `paginateFromHtml(cover memo, {append:true})` → `paginateFromHtml(appointHtml, {append:true})`
3. `buildAppointCoverMemoHtml()` ใหม่ — สำเนา template จาก `renderMemoBaseDoc` แต่ source จาก `kase` + `members` (ฟอร์ม appoint), ช่องว่าง = เส้นจุด, ลายเซ็นเส้นจุด. ไม่แตะ `renderMemoBaseDoc()` เดิม (memo mode ยังใช้)

## ไม่แตะ
- โหมด memo / amend, `renderMemoBaseDoc()`, DOCX export path, catchword/pagination engine (นอกจาก append)

## ทดสอบ
- `npm run sync` (order.html → res/) + `npm test` 5/5 ผ่าน
- manual Chrome (login affairs, `order.html?case=3027/2569` appoint):
  - **4 หน้า**: หน้า 1-2 = บันทึกเสนอ (หน้า 1 ไม่มี running header, หน้า 2 = `- ๒ -`), หน้า 3-4 = คำสั่ง (**หน้า 3 ไม่มี running header = เริ่มนับใหม่**, หน้า 4 = `- ๒ -`) ✓
  - คำสั่งขึ้น `.doc-paper` ใหม่ (แผ่นใหม่) ✓
  - ไม่มี console error; สลับ memo(2 หน้า)/amend(1 หน้า)/กลับ appoint(4 หน้า) ไม่ regression
  - `#docSignLine` ยังอยู่ใน DOM (digital sign flow หา element ได้ — เคส 3027 status RESOLVED เลยไม่มีปุ่ม sign ให้กดตอนนี้ แต่ path ไม่กระทบ)
- [ ] manual verify: พิมพ์/PDF ออกไฟล์เดียว 4 หน้า (html2pdf บน #docPaper)
