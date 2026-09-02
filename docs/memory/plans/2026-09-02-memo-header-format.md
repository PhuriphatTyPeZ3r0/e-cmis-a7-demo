# 2026-09-02 — จัด format หัวเอกสาร memo mode (order.html) ให้ตรง DOCX ลูกค้า

## โจทย์
`order.html?case=3027/2569&mode=memo` — หัวเอกสาร (ส่วนราชการ/ที่/เรื่อง/เรียน) format เพี้ยน
เทียบ `memo-7x-*.docx`: font เล็กกว่าปกติ, มี gap เต็มบรรทัดคั่นหัว, แท็บ "เสนอไต่สวน"
ไม่มีบล็อก "ปป 0004.3/…… ลว. ……" ขวาบน

## ข้อเท็จจริงจาก DOCX (memo-7x-notify-zone / transmit-kbc / submit-inquiry)
- หัวเรื่อง "บันทึกข้อความ" = 29pt
- ฟิลด์ ส่วนราชการ/ที่/วันที่/เรื่อง/เรียน = 16pt (เท่า body)
- ไม่มีบรรทัดเปล่าคั่น — spacing 3pt (before เรียน 6pt)
- "ที่ / วันที่" บรรทัดเดียวกัน คั่น tab
- `submit_inquiry.docx` P1/P2: `ปป 0004.3/` + จุด 20, `ลว. ` + จุด 36 — ชิดขวา เหนือหัวเรื่อง (เส้นจุดกรอกมือ)

## การแก้

### CSS `.doc-memo-hdr` — 4 ไฟล์ (order.html / order-m24.html / meeting-docs.html / agenda-meeting-docs.html)
`font-size:16px;margin-bottom:2px` → `font-size:16pt;line-height:1.25;margin:3pt 0 0`
(+ `.doc-memo-lbl` เพิ่ม `vertical-align:top`)

### หัวเรื่อง "บันทึกข้อความ" → 29pt
- ต้องใช้ `!important` inline เพราะ `a4-ecmis-workspace.css:1476 .doc-paper .doc-title{font-size:18pt !important}` ทับ
- `order.html`/`order-m24.html` renderMemoBaseDoc + `order-memo-docs.js` × 5 standard docs

### `order-memo-docs.js` — 5 standard บันทึกข้อความ docs (notify_zone, transmit_kbc, timebar_report, submit_inquiry, timebar_secgen)
- ลบ `<div class="doc-gap">` ทั้งหมดในบล็อกหัว (ระหว่าง + หลัง เรียน) → single-spaced
- แปลง 4 บรรทัดหัวเป็น `<span class="doc-memo-lbl">LABEL</span>value` (align คอลัมน์เดียวเหมือน base memo)
- "ที่" line: เพิ่ม secondary label `วันที่`
- `min-height:52px` → `64px` (รองรับหัวเรื่อง 29pt)
- `notify_discipline` (หนังสือภายนอก) ได้ label span เฉพาะ เรื่อง/เรียน; `ruling_report` ไม่แตะ (คนละ doc type)

### submit_inquiry — เพิ่มบล็อกขวาบน
`<div style="text-align:right;font-size:16pt;line-height:1.5;margin:0 0 2pt">ปป 0004.3/....................<br>ลว. ....................................</div>`
วางก่อน container ครุฑ/หัวเรื่อง

## นอกขอบเขต
- ไม่แตะ DOCX (`memo-7x-*.docx` = ต้นฉบับลูกค้า; submit_inquiry.docx มีบล็อก ปป 0004.3 อยู่แล้ว)
- ไม่แตะ pagination / catchword / body

## ทดสอบ
- `npm run sync` (4 root → /res/), `npm test` 5/5 ผ่าน
- manual Chrome (login affairs, `?mode=memo`, ทั้ง 8 แท็บ, fresh assets):
  - `.doc-memo-hdr` computed = 21.33px (16pt) ✓
  - หัวเรื่อง = 38.67px (29pt) ✓ (ruling_report คง 24px — ถูกต้อง)
  - interHeaderGap = 0 ทั้ง 8 แท็บ ✓
  - submit_inquiry: บล็อก "ปป 0004.3/…… ลว. ……" ชิดขวา เหนือหัวเรื่อง ✓
  - ไม่มี console error, 2 หน้า/แท็บ ไม่มีหน้าเปล่า (ยกเว้น timebar_secgen ที่มีหน้าเปล่าเดิม — นอกขอบเขต)
