# 2026-09-02 — เพิ่มแท็บ v.2 (pipeline docs) ในหน้า ruling-report.html

## โจทย์ (ต่อจาก Task 68)
Task 68 ตัด `notify_discipline` + `ruling_report` ออกจากแท็บ order.html memo mode — user ต้องการ
ให้เอา 2 doc นั้นมาเป็นแท็บใน `ruling-report.html?case=1355/2566` ชื่อ "<ชื่อ> (v.2)"

## การตัดสิน (grill)
- เพิ่ม 2 แท็บ เรียง: `ruling` · `discipline` · **รายงานวินิจฉัยชี้มูล (v.2)** · **แจ้งโทษวินัย (v.2)**
- เนื้อหา: เรนเดอร์ `OrderMemoDocs['ruling_report'/'notify_discipline'].bodyHtml`, map `{token}` จาก
  ฟอร์มเดิมของ ruling-report + `kase` + `presentMembers`/`chair`
- token ที่ไม่มีแหล่ง → `M('', field.placeholder)` (merge-field ว่าง)
- แบ่งหน้าแบบ order.html: ตัด block (intro/flow/sign) + `pageCatchword:true` + `docClass:'doc-order'`
  + running header `- ๒ -`
- DOCX: `ECMIS.exportDocToDocx(docPaper, ...)` snapshot (เหมือนแท็บเดิม), filename `_v2_`
- `discipline_v2` อิสระจาก `hasCriminalToggle`
- ไม่มี split-accused ในแท็บ v.2

## การแก้ — `ruling-report.html` (+ `res/` ผ่าน npm run sync)
1. `<head>`: `<script src="assets/order-memo-docs.js">` (res → `../assets/...` auto)
2. `#docTabs`: +2 ปุ่ม `data-doc="ruling_v2"` / `data-doc="discipline_v2"`
3. `renderDoc()`: เปลี่ยน `} else {` (discipline) → `} else if (docTab === 'discipline') {`
   แล้วเพิ่ม `} else if (docTab === 'ruling_v2' || docTab === 'discipline_v2') { … }`:
   สร้าง `v2` map (case_no/meeting_no/agenda_item/pacc_region/inquiry_orders/accused_summary/
   board_present/board_absent/issue_*/limitation_period/board_opinion/resolution_*/chair_name จาก
   ฟอร์ม ruling; agency_name/accused_*/offense_summary/case_officer จากฟอร์ม discipline + kase),
   replace `{token}` → `M(value, placeholder)`, split blocks, `ECMIS.paginateDoc(...)`
4. `toggleFormCards()`: `rulingLike = ruling|ruling_v2`, `discLike = discipline|discipline_v2`;
   split pane ยังโชว์เฉพาะ `ruling` จริง
5. `btnExportDocx`: +branch `ruling_v2` / `discipline_v2` → filename `_v2_`, ใช้ `exportDocToDocx` เดิม

## ไม่แตะ
- `assets/order-memo-docs.js` (Task 68 delist แล้ว; object def ยังอยู่ — v.2 ใช้ตัวนี้)
- แท็บ ruling/discipline เดิม, ฟอร์มเดิม, `order.html`

## ทดสอบ
- `npm run sync` (ruling-report.html → res/, path rewrite ✓) + `npm test` 5/5 ผ่าน
- manual Chrome (login board_sec/Thanakrit.B, `ruling-report.html?case=1355/2566`):
  - 4 แท็บ; `order-memo-docs.js` โหลด (`ECMIS.OrderMemoDocs.ruling_report` มี)
  - `ruling_v2` (2 หน้า): render pipeline bodyHtml, map ครบ — เรื่องที่ ๑๓๕๕/๒๕๖๖, ครั้งที่ ๖๑/๒๕๖๙
    (จาก `#meetNo`), วาระ ๕.๕, `inquiry_orders` จาก `#orderNo`, `accused_summary` จาก `kase.accused`,
    `board_present` จาก presentMembers (มีประธาน+กรรมการ), `resolution_criminal` มี "ม.157"
  - `discipline_v2` (2 หน้า): render notify_discipline bodyHtml
  - แท็บ ruling(3 หน้า)/discipline(2 หน้า) เดิม ไม่ regression
  - ไม่มี console error ทุกแท็บ; screenshot ยืนยัน
- [ ] manual: กด ส่งออก DOCX บนแท็บ v.2 (snapshot .docx)
