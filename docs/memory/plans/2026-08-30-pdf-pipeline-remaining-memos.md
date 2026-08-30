# 📋 Task Plan: ต่อ PDF → template pipeline — memo pane order.html (ไฟล์ 4 PoC, แล้ว 1/3/7)

> **Plan ID:** `2026-08-30-pdf-pipeline-remaining-memos`
> **Date:** 2026-08-30
> **Author / Agent:** Claude Code
> **Status:** 🟢 ทำครบทั้ง 4 ไฟล์ (1, 3, 4, 7) wire เข้า order.html แล้ว
> **Branch / PR:** `main`

---

## 🔄 อัปเดต 2026-08-30 (รอบ 3): revert Case สาธิต + ถอด "ร่าง"

- ผู้ใช้สั่ง: (1) `git revert` เคสสาธิต `111674/2560` (ไม่ต้องการ Case ใหม่) (2) ถอดป้าย "(ร่าง)" + แบนเนอร์แดง ออกจาก 4 แม่แบบ ให้เป็น `{field}` template ปกติเหมือน 2/5/6
- **commit `28a3335`** `git revert fd2026c` — ลบ CASES `111674/2560` + `memoDocs` ออกจาก `assets/ecmis-app.js`
- **commit ถัดไป** — `assets/order-memo-docs.js` + `tools/pdf-template-pipeline/pipeline/build.py` (`ORDER_DOC_META`):
  - ถอด " (ร่าง)" จาก `label` + `runningTitle` ของ notify_discipline / submit_inquiry / ruling_report / timebar_secgen
  - ลบ `<div>` แบนเนอร์แดง (`#b91c1c` "ร่าง — แม่แบบนี้ยังไม่ผ่านการตรวจ…") block แรกใน bodyHtml ทั้ง 4
  - re-anonymise: `(ปุระเชษฐ์ฯ)` → `(เจ้าหน้าที่ผู้ประสานงาน)` ใน submit_inquiry + timebar_secgen · แก้ hint ที่มีชื่อจริง (นเรศวร → "มหาวิทยาลัย…", พวงชมภู → "คำนำหน้า + ชื่อ-สกุล")
  - คงคอมเมนต์ในโค้ดว่าถ้อยคำ 4 แม่แบบเป็น **AI ร่างจาก PDF ต้นฉบับ ยังไม่ผ่านการตรวจถ้อยคำโดยฝ่ายเลขานุการ กก.ป.ป.ท.** (ไม่มีใน UI)
- **ไม่แตะ** 3 แม่แบบเดิม (notify_zone/transmit_kbc/timebar_report) รวม `(ปุระเชษฐ์ฯ)` ที่ฝังใน bodyHtml เดิม (มาจาก commit ก่อนหน้า session นี้ เป็นคำย่อป้ายติดต่อ)
- verify: `order.html?case=<เคสใดก็ได้>&mode=memo` → 8 แท็บ, 4 แท็บใหม่ไม่มี "(ร่าง)"/แบนเนอร์, pagination ปกติ, ไม่มีชื่อบุคคลจริงใน 4 แม่แบบ; `npm test` 5/5
- **ผลสุทธิ:** ไม่มี Case สาธิต · 4 แม่แบบเป็น `{field}` template ปกติ (prefill เมื่อเปิดกับสำนวนที่มี `memoDocs` — ตอนนี้ยังไม่มีสำนวนไหนมี)

## 🎯 1. Problem Statement & Business Objective
- `tools/pdf-template-pipeline/` แปลง PDF สารบรรณ → form-template → memo pane ของ `order.html`
  (`assets/order-memo-docs.js`). เดิมทำสำเร็จ 3 ไฟล์: 2 = แจ้งเขต, 5 = ส่ง กบค., 6 = ขาดอายุความ→ผอ.กบค.
- ไฟล์ 1/3/4/7 ถูก defer เพราะเป็น narrative report. รอบนี้ทำ **ไฟล์ 4** (หนังสือแจ้งให้พิจารณาโทษ
  ทางวินัย) เป็น Proof-of-Concept ของวิธี "pipeline เป็นนั่งร้าน + hand-author bodyHtml + wire"
- **วิธี:** pipeline สร้าง reference.docx/template.docx/โครง fragment → คนเขียน `bodyHtml` ใหม่ด้วยมือ
  (ถ้อยคำกฎหมายคงที่ + `{field}` เฉพาะจุดผันแปร) → wire เข้า `ORDER_DOC_META`/`bundle.py`
- **draft:** ถ้อยคำกฎหมายในแม่แบบยังไม่ผ่านการตรวจโดยฝ่ายเลขานุการ กก.ป.ป.ท. จึง mark เป็น "(ร่าง)"
  ทั้ง label แท็บ, runningTitle และแบนเนอร์แดงหน้า 1

---

## 📂 2. Affected Files (ไฟล์ 4)
- [x] `tools/pdf-template-pipeline/pipeline/build.py` — `ORDER_DOC_META["4"] = {id: notify_discipline, label: "แจ้งโทษวินัย (ร่าง)", ...}`
- [x] `tools/pdf-template-pipeline/pipeline/bundle.py` — เพิ่ม `notify_discipline` ใน `DOCS` / `ORDER` / `PREFILL`
- [x] `assets/order-memo-docs.js` — เพิ่ม block #4 `OrderMemoDocs["notify_discipline"]` + ต่อ `OrderMemoDocOrder`
      (append ด้วยมือ เพราะ output-template/ ของไฟล์ 2/5/6 ไม่มีในเครื่อง `pipeline.bundle` เต็มรูปจึงรันไม่ได้)
- [x] `assets/templates/memo-7x-notify-discipline.docx` — template.docx จาก pipeline (auto-place บางส่วน)
- เสิร์ฟทั้ง `order.html` + `res/order.html` (bundle ไฟล์เดียวใน root `assets/`) — ไม่แตะ HTML, ไม่แตะ `order-m24.html`
- `output-template/` = git-ignored (candidates.json, schema.json 20 fields, reference.docx, ฯลฯ)

---

## 🛡️ 3. Anti-Regression Pre-Check
- [x] 1. ไม่แตะตาราง "ประเภทเรื่อง"
- [x] 2. ไม่แตะ RBAC / `agenda-registry.html`
- [x] 3. ไม่เรียก Supabase
- [x] 4. `npm run sync` แล้ว (33 files, 0 changed — ไม่มี root HTML เปลี่ยน)
- [x] 5. ไม่แตะ A4 geometry — generator ใช้ CSS repo เดิม (`doc-indent`/`doc-memo-hdr`/`doc-sign`/`doc-gap`)
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 4. สิ่งที่ทำจริง (ไฟล์ 4)
- [x] `pipeline.extract` ไฟล์ 4 → candidates.json (31 candidates)
- [x] เขียน `schema.json` ด้วยมือ — **20 field** (prefill 6: `case_no→caseId`, `meeting_no→meetingNo`,
      `meeting_date→meetingDateISO`, `agenda_item→agendaNo`, `pacc_region→paccRegion`, `case_officer→ownerName`)
- [x] `pipeline.build` → reference.docx + template.docx + build-report (1/20 auto-placed — ปกติ เพราะ hand-author bodyHtml)
- [x] อ่าน PDF จริง (pymupdf) เป็น reference → **hand-author `order-fragment.js` bodyHtml**:
      แบนเนอร์ร่าง → หัวหนังสือ (ที่/วันที่/เรื่อง/เรียน/สิ่งที่ส่งมาด้วย) → ย่อหน้าไต่สวน →
      ความผิดทางอาญา (`{offense_summary}` textarea + ย่อหน้ามาตรากลาง) → ความผิดทางวินัย (`{univ_regulation}`) →
      ย่อหน้าปิด ม.๓๘/๔๑ + อัยการ → บล็อกลงนาม (`{signatory_name}`/`{signatory_position}`) →
      สำนักงานเขต `{pacc_region}` / โทร `{contact_phone}` / เจ้าของสำนวน `{case_officer}`
      แต่ละย่อหน้าเป็น `<div>` แยก (กัน pagination clip) · token ทั้ง 20 มีครบใน bodyHtml
- [x] wire: `ORDER_DOC_META` + `bundle.py` + append block #4 ใน `order-memo-docs.js` + copy docx
- [x] `npm run sync` + `npm test` → **ผ่าน 5/5 ด่าน (0 error, 0 warning)**

---

## 🧪 5. Verification (browser — order.html?case=1547/2568&mode=memo, role affairs)
- [x] แท็บที่ 5 "แจ้งโทษวินัย (ร่าง)" ขึ้นต่อจาก 4 แท็บเดิม (sync จาก `OrderMemoDocOrder`)
- [x] preview render 2 หน้า · pagination ถูก (หน้า 2 มี running title "...(ร่าง) (ต่อ)" + บล็อกลงนาม)
- [x] แบนเนอร์ร่างสีแดงบนหน้า 1
- [x] prefill 6 ค่าจาก `kase`: 1547/2568, 37/2569, 2569-08-20, 5.2, เขต 1, นายสมชาย ใจซื่อ
- [x] กรอก form → preview อัปเดตสด, merge-field เปลี่ยนเป็น `.filled` (8 → 14), ไม่มี `{token}` ค้าง
- [x] ไม่มี console error · `.doc-secret-foot` "ลับ" ยังอยู่
- ⚠️ ควิร์ก: `<input type=date>` แสดง `08/20/2569` (native picker ตีความปี พ.ศ. ตรงตัว) — preview แปลงเป็น "20 สิงหาคม 2569" ถูก; ไม่มี widget BE-aware ในระบบ (นอกขอบเขต)
- ⚠️ `template.docx` auto-place ได้ 1/20 — ต้องเติม `{field}` ใน Word ด้วยมือถ้าจะใช้ดาวน์โหลด DOCX จริง (PoC เน้น web preview)

---

## 7b. ไฟล์ 1, 3, 7 — ทำครบแล้ว (2026-08-30 รอบสอง)

ใช้สูตรเดียวกับไฟล์ 4 (extract → เขียน schema เอง → hand-author bodyHtml จาก PDF จริง → wire):

| ไฟล์ | doc id | label แท็บ | fields | prefill | โครง bodyHtml |
|---|---|---|---|---|---|
| 1 | `submit_inquiry` | เสนอไต่สวน (ร่าง) | 16 | 6 | บันทึกข้อความ เสนอ กก.ป.ป.ท. (ผ่าน ผอ.กบค): 1.เรื่องเดิม (มติ+`{inquiry_orders}`+`{resolution_summary}`+`{discipline_finding}`) · 2.ข้อเท็จจริง `{assign_facts}` · 3.ข้อพิจารณา · บล็อกลงนาม นิติกร→กลั่นกรอง ผอ.กลุ่มงาน→ผอ.กบค · `{board_opinion}` เป็น optional (แทน red drafter note ใน PDF) |
| 3 | `ruling_report` | รายงานวินิจฉัยชี้มูล (ร่าง) | 19 | 5 | section-skeleton: หัวเรื่อง+`{case_no}`+`{ruling_date}` · ผู้ถูกกล่าวหา · กรรมการมา/ไม่มาประชุม · 4 ประเด็น (การไต่สวน/สถานะ/อำนาจหน้าที่/การกระทำผิด) เป็น `<div class="doc-h">` + textarea · ความเห็น · มติอาญา/วินัย · ลงนามประธาน |
| 7 | `timebar_secgen` | ขาดอายุความ (เลขาฯ) (ร่าง) | 23 | 6 | คู่แฝดของ `timebar_report` แต่ → เลขาธิการ ป.ป.ท.: อ้างมติมอบหมาย `{prior_meeting_*}` · report sections (`{accused_summary}`/`{case_facts}`/`{resolution_summary}`) · `{lapsed_offences}` · บล็อกตรวจ ผอ.กบค/ผอ.กลุ่มงาน/ผู้จัดทำ |

**wire:** `ORDER_DOC_META["1"|"3"|"7"]` (build.py) + `DOCS`/`ORDER`/`PREFILL` (bundle.py) + append 3 block ใน `assets/order-memo-docs.js` (`OrderMemoDocOrder` เป็น 7 รายการ) + copy 3 docx (`memo-7x-submit-inquiry|ruling-report|timebar-secgen.docx`)

**verify (browser, order.html?case=1547/2568&mode=memo):** แท็บทั้ง 8 (base + 7) ขึ้นครบ (grid 4 คอลัมน์ = 2 แถว); 3 แท็บใหม่ render 2 หน้า/แท็บ, banner ร่างหน้า 1, running title "...(ร่าง) (ต่อ)" หน้า 2, prefill 8/6/7 ค่า, textarea field กรอกแล้ว preview อัปเดตสด, ไม่มี `{token}` ค้าง, ไม่มี console error; `npm test` 5/5

## 7c. ค้าง / งานถัดไป
- **ตรวจถ้อยคำกฎหมาย** ทั้ง 4 แม่แบบ (1/3/4/7) โดยฝ่ายเลขานุการ กก.ป.ป.ท. / `board_sec` — ผ่านแล้วถอด "(ร่าง)" + แบนเนอร์ ออกจากแต่ละ doc (label, runningTitle, block แรก bodyHtml)
- **ตรวจถ้อยคำกฎหมาย** ไฟล์ 4 โดยฝ่ายเลขานุการ กก.ป.ป.ท. / `board_sec` — เมื่อผ่านแล้วให้ถอด
  "(ร่าง)" / แบนเนอร์ออกจาก `notify_discipline` (label, runningTitle, block แรกใน bodyHtml)
- **`pipeline.bundle` เต็มรูป** ต้อง regenerate `output-template/` ของไฟล์ 2/5/6 ด้วย ถึงจะรัน bundle
  แทนการ append มือได้ (ตอนนี้ block #4 append ด้วยสคริปต์มือ)

---

## 🏁 6. Completion & Sign-off
- **ไฟล์ 4 PoC:** เสร็จ · CI ผ่าน · verify ใน browser แล้ว
- **Commit:** commit เดียว (main, local, ไม่ push)
- **History Log:** `D:\Obsidain\Project\Activity 7\` — `ตัวแทน AI: Claude Code`
