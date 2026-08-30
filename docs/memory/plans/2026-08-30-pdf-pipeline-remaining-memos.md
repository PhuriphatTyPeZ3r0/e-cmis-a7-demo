# 📋 Task Plan: ต่อ PDF → template pipeline — memo pane order.html (ไฟล์ 4 PoC, แล้ว 1/3/7)

> **Plan ID:** `2026-08-30-pdf-pipeline-remaining-memos`
> **Date:** 2026-08-30
> **Author / Agent:** Claude Code
> **Status:** 🟡 In Progress — ไฟล์ 4 (notify_discipline) wire เป็น "ร่าง" แล้ว · ไฟล์ 1/3/7 ยังไม่ทำ
> **Branch / PR:** `main`

---

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

## 7. ค้าง / งานถัดไป
- **ไฟล์ 1, 3, 7** — narrative report ~10 หน้า ยังไม่ทำ ใช้สูตรเดียวกับไฟล์ 4:
  extract → เขียน schema เอง → hand-author bodyHtml จาก PDF/reference.docx → wire → verify
  (ดู [[pdf-pipeline-narrative-blocked]])
- **ตรวจถ้อยคำกฎหมาย** ไฟล์ 4 โดยฝ่ายเลขานุการ กก.ป.ป.ท. / `board_sec` — เมื่อผ่านแล้วให้ถอด
  "(ร่าง)" / แบนเนอร์ออกจาก `notify_discipline` (label, runningTitle, block แรกใน bodyHtml)
- **`pipeline.bundle` เต็มรูป** ต้อง regenerate `output-template/` ของไฟล์ 2/5/6 ด้วย ถึงจะรัน bundle
  แทนการ append มือได้ (ตอนนี้ block #4 append ด้วยสคริปต์มือ)

---

## 🏁 6. Completion & Sign-off
- **ไฟล์ 4 PoC:** เสร็จ · CI ผ่าน · verify ใน browser แล้ว
- **Commit:** commit เดียว (main, local, ไม่ push)
- **History Log:** `D:\Obsidain\Project\Activity 7\` — `ตัวแทน AI: Claude Code`
