# 2026-09-02 — คำเชื่อมระหว่างแผ่น order.html / order-m24.html (~15 อักษร)

## โจทย์
หน้า `order.html?case=3027/2569` — คำเชื่อมมุมขวาล่าง (footer ชิดขวา) ยาวเกิน (~60 ตัวอักษร)
ต้องการให้ ~15 อักษร อิงถ้อยคำที่จะขึ้นต้นหน้าถัดไปจริง เช่น หน้าถัดไปเริ่ม
"๔. รับผิดชอบดำเนินการใด ๆ ..." → คำเชื่อม "รับผิดชอบ..."

## สภาพเดิม
- ฟีเจอร์ `pageCatchword` มีอยู่แล้วใน `ECMIS.paginateDoc()` และ `order.html` / `order-m24.html`
  (+ `/res/` mirror) ส่ง `pageCatchword: true` อยู่แล้ว
- `firstWordsOf(html, 15)` → cap 15 token หรือ 15*4 = 60 อักขระ → ยาวเกินสำหรับภาษาไทย
- CSS `.doc-catchword` = `position:absolute; bottom:8mm; right:15mm; text-align:right` (ชิดขวาล่างอยู่แล้ว)

## การแก้ (เฉพาะ `assets/ecmis-app.js` ใน `paginateDoc()`)
แทน `firstWordsOf()` ด้วย `catchwordFromNextPage(html)`:
1. เอา `textContent` ของบล็อกหน้าถัดไป ยุบช่องว่าง
2. ข้ามอักขระนำหน้าข้อ 1 ชุด: เลขข้อไทย/อารบิก (จุดย่อยได้ เช่น ๒.๒) + `.`/`)`/`(...)`/`ฯ`
   หรือ bullet `- • * ·` — regex ครั้งเดียว (ไม่ข้ามคำว่า "ข้อ"/เนื้อความ)
3. ตัดที่ ~15 code point บนขอบเขตคำไทยจริงด้วย `Intl.Segmenter('th',{granularity:'word'})`
   สะสมคำจนกว่าจะเกิน 15 แล้วหยุดก่อนคำที่ทำให้เกิน; คำแรกเดียวเกิน 15 → ตัดแข็งที่ 15;
   ไม่มี `Intl.Segmenter` → fallback ตัดแข็งที่ 15
4. ต่อท้าย `...` เสมอ
5. เหลือว่าง → ไม่แสดงคำเชื่อมหน้านั้น

## ขอบเขต
- กระทบเฉพาะหน้าที่ opt-in `pageCatchword`: `order.html` + `order-m24.html` (+ `/res/` mirror)
- `board-resolution` family ไม่มีคำเชื่อมเหมือนเดิม (ไม่ opt-in)
- ไม่แตะ HTML / CSS / routing / DOCX export (DOCX = follow-up)

## ทดสอบ
- `npm test` 5/5 (รวม anti-regression + A4 layout) — ผ่าน
- simulate `catchwordFromNextPage` ด้วย Node (Intl.Segmenter): ผลถูกต้อง 7/7 เคส
  ("๔. รับผิดชอบดำเนินการใด ๆ ..." → "รับผิดชอบดำเนิน...", "- เห็นชอบ" → "เห็นชอบ...", ฯลฯ)
- [x] manual Chrome (login: affairs / Siriporn.K): `order.html?case=3027/2569`
  - โหมด **ออกคำสั่งแต่งตั้ง** (2 หน้า): หน้า 1 คำเชื่อม `"รับผิดชอบดำเนิน..."` (15 อักษร + `...`, ข้าม `๔. ` สำเร็จ), หน้า 2 (สุดท้าย) ไม่มี
  - โหมด **บันทึกเสนอ (memo)** (2 หน้า): หน้า 1 `"ความเห็นผู้ตรวจ..."`, หน้า 2 ไม่มี
  - โหมด **แก้ไของค์ประกอบ (amend)** (1 หน้า): ไม่มีคำเชื่อม (ถูกต้อง)
  - ตำแหน่ง: `position:absolute; bottom:8mm; right:15mm; text-align:right; 16pt` — footer ชิดขวา ✓
  - ไม่มี console error
