# Sub-Agent 4 Output — Frontend & Mockup Developer (Activity 7)

Generated 2026-08-05. Branch: `Mock-up-7` (working tree, uncommitted).

**Reconciliation note (sibling `Mockup/` vs repo `activity7/`):** Diffed the sibling folder
`C:\6_Working\PMO1-03-08-2026\E-CMIS\diagram\Activity 7\Mockup` against `activity7/` in this repo.
`activity7/` is materially ahead on every shared file (`01-work-inbox.html`, `02-case-register.html`,
`03-report-213.html`, `04-approval-review.html`, `08-board-resolution.html`, `09-order-m24.html`,
`assets/ecmis-app.js`) — the repo version carries the full G1–G5 gateway logic, the ม.28
three-directive data model (`M28_ORDERS`), a state-transition table (`TRANSITIONS`), quorum/panel
composition rules, and a `RESOLUTIONS`/`FORWARD_TARGETS` model that do not exist in the sibling
copy at all. `activity7/11-secgen-desk.html` (the Secretary-General desk/inbox) has **no
counterpart** in the sibling folder — it only exists in this repo. Conclusion: nothing worth
pulling in from the sibling folder; it is a stale, earlier snapshot. No files were copied from it.

**Figma:** Not reachable/authenticated in this environment (no `use_figma` / `get_design_context`
session available for `https://www.figma.com/design/eGV3ESj90HSq712gz0f5uI/E-CMIS`). Fell back to
the existing design tokens and component conventions already established in
`activity7/assets/ecmis-app.css` and `activity7/assets/ecmis-app.js`, and to the layout/interaction
patterns already used in `04-approval-review.html` and `08-board-resolution.html` (card-ecmis,
action-bar, `Swal`-based dialogs, `sig-box`, `rule-panel`, `law-note`), per the task's fallback
instruction.

**What was already in place (not rebuilt):** `11-secgen-desk.html` was already a comprehensive
Secretary-General inbox (sign queue S1, ม.28 reporting-cycle queue, ม.24 ว.1 order queue, SLA
alerts, decision-power reference panel). `04-approval-review.html` already had a single-signer OTP
`signDialog`, a Return/Recall panel, and G1/G3 gateway logic. These were left untouched except
where extended below — per the task constraint not to rewrite what's already adequate.

**Gaps found and closed by this stage:**
1. The ม.28 three-directive order (`ACCEPT` / `REJECT` / `DISMISS`, already modeled in
   `ECMIS.M28_ORDERS`) had no reachable UI — the secgen's "sign" action always implied acceptance.
2. No "Assign" (มอบหมาย) action existed anywhere in the secgen flow, only an implicit routing via a
   "ซับซ้อน" checkbox.
3. E-signature was single-signer only (`ECMIS.signDialog`) — no sequential/multi-party signature
   flow existed, despite the G3 rule text already stating a second signature (ผอ.กบค.) is required
   before Bypass.

---

## 1. Document Mapping Matrix

| Step | Google Drive Template File | UI Component / Field | Data Mapping (Auto-fill/Manual) |
|---|---|---|---|
| S1 — เลขาธิการฯ พิจารณา/ลงนามรายงาน 213/644 | ไม่สามารถเข้าถึงได้ / ต้องยืนยัน (โครงเอกสารใน `04-approval-review.html#docPaper` อ้างอิงรูปแบบรายงาน 213/644 จากข้อมูลตัวบทกฎหมาย ไม่ใช่ไฟล์ Drive ที่ยืนยันแล้ว) | `#docPaper` (`kase.id`, `kase.subject`, `kase.owner`, `kase.ownerOrg`, `kase.allegation`, `#myOpinion`) | Auto-fill จาก `ECMIS.CASES` (เลขเรื่อง/เรื่อง/ผู้รับผิดชอบ/ข้อกล่าวหา) + Manual (ความเห็นเลขาธิการฯ ในช่อง `#myOpinion`, แสดงผ่าน `ECMIS.mergeField`) |
| S1 — มาตรา 28 คำสั่งเบื้องต้น (ใหม่ในสเตจนี้) | ไม่สามารถเข้าถึงได้ / ต้องยืนยัน | `#m28List` (radio `name="m28order"`), `#m28Law` (มาตรา ม.25/ม.26) | Manual — เลขาธิการฯ เลือก 1 ใน 3 ทาง (`ECMIS.M28_ORDERS`: ACCEPT/REJECT/DISMISS) + อ้างอิงมาตราบังคับเมื่อไม่ใช่ ACCEPT |
| S1 — มอบหมายเข้าคณะอนุสนับสนุนฯ (ใหม่ในสเตจนี้) | ไม่สามารถเข้าถึงได้ / ต้องยืนยัน | ปุ่ม `data-act="assign"` (`04-approval-review.html`), ปุ่ม `data-assign` แถวคิว (`11-secgen-desk.html`) | ตั้งค่าอัตโนมัติ: เช็ก `#g1yes` และเติมข้อความเหตุผลเริ่มต้นใน `#g1reason` (auto-fill) — เลขาธิการฯ แก้ไข/ยืนยันได้ (manual) ก่อนลงนามจริง |
| S1 — e-Signature (single) | ไม่สามารถเข้าถึงได้ / ต้องยืนยัน | `ECMIS.signDialog()` → `#swal-otp` | Manual — กรอก OTP 6 หลัก (ทดสอบ: 123456), ผลลัพธ์ auto-fill กลับเข้า `#sigBox`/`#docSign` |
| S1/G3 — Sequential e-Signature (ใหม่ในสเตจนี้: เลขาธิการฯ → ผอ.กบค. รับรองใบด่วน) | ไม่สามารถเข้าถึงได้ / ต้องยืนยัน | `ECMIS.sequentialSignDialog()` แสดงลำดับผู้ลงนามทั้งชุด, รับ OTP เฉพาะผู้ลงนามลำดับปัจจุบัน | Auto-fill รายชื่อ/ตำแหน่งผู้ลงนามแต่ละลำดับจากข้อมูลกลาง (`SEC`, ผอ.กบค.) + Manual OTP ต่อคน |
| S1 — คิวลงนามด่วน (Assign/Return quick actions ใหม่ในสเตจนี้) | ไม่สามารถเข้าถึงได้ / ต้องยืนยัน | ปุ่ม `data-assign`, `data-return` ในตาราง `#signQueue` (`11-secgen-desk.html`) | Manual — เหตุผลตีกลับบังคับเลือกจาก `ECMIS.RETURN_REASONS` / ขอบเขตจาก `ECMIS.RETURN_SCOPES` |
| S11 — คำสั่งแต่งตั้งองค์คณะ ม.24 ว.1/ว.3 | ปปท. ๕-๐๑ (ว.1) / ปปท. ๕-๐๔ (ว.3) — ระบุชื่อไฟล์ไว้ในโค้ดเดิม (`09-order-m24.html`) แต่ตัวไฟล์จริงยังไม่พบใน Google Drive Folder ที่ให้มา (หมายเหตุเดิมในโค้ด: "ต้องขอไฟล์ต้นฉบับจาก ป.ป.ท. เพิ่มเติม") | `#docPaper` (`09-order-m24.html`), ตารางองค์ประกอบ `#memberTb` | Auto-fill (เลขเรื่อง/มติ/วันประชุม) + Manual (รายชื่อองค์คณะ, เลขที่คำสั่ง) |
| G5 — มติที่ประชุมคณะกรรมการ ป.ป.ท. | `มติการประชุม ไต่สวนเบื้องต้น.docx` (ระบุไว้ในโค้ดเดิมว่าถอดถ้อยคำมาทั้งฉบับ — ไม่ได้ตรวจสอบไฟล์ต้นฉบับซ้ำในสเตจนี้) | `#docPaper` (`08-board-resolution.html`) | Auto-fill (วาระ/ผู้ถูกร้อง/ข้อกล่าวหา) + Manual (ผลมติ, ความเห็นที่ประชุม, องค์ประชุม/คะแนนเสียง) |

Notes:
- Fields already marked `.mergefield.filled` (green) vs `.mergefield.empty` (red) in the rendered
  document preview are the existing visual convention for Auto-fill vs Manual/missing — reused
  as-is, not re-invented.
- No Google Drive folder access was available in this environment; every "Google Drive Template
  File" cell reflects what the existing codebase already asserts about template provenance
  (including its own prior admission that two files are still missing), not a fresh Drive lookup.

## 2. Git Branch Merge Status

- Branch `Mock-up-7` was already checked out at task start; no branch switch or merge was
  performed.
- No git commands were run (no `add`/`commit`/`push`) per the task constraint — all changes below
  are **uncommitted working-tree modifications**, left for review.
- `git status --short` at the end of this stage shows exactly 3 modified files, matching the scope
  of this task (no unrelated files touched):
  ```
   M activity7/04-approval-review.html
   M activity7/11-secgen-desk.html
   M activity7/assets/ecmis-app.js
  ```
- Regression check: re-ran the existing test suite (`node --test activity7/tests/*.test.mjs`)
  before and after every edit. Both `resolution-rules.test.mjs` (53 assertion groups) and
  `secgen-rules.test.mjs` still pass — no existing exported function's behavior (`g1Triggers`,
  `effectiveSlaLimit`, `M28`, `m28Pending`, `RESOLUTIONS`, `forwardTarget`, `isUpstreamRole`,
  `canAct`, etc.) was changed; only new HTML/JS was added.
- Also verified both edited HTML files' inline `<script>` blocks parse without syntax errors
  (`new Function(...)` check).

## 3. Source Code (Updated / New Files Only)

- `activity7/assets/ecmis-app.js` — added `sequentialSignDialog(docName, signers)`, a reusable
  multi-signer e-signature modal (ordered signer list, OTP accepted only for the current signer,
  later signers shown as "pending in a later flow step"); exported it alongside the existing
  `signDialog`. No existing exports were modified.
- `activity7/04-approval-review.html` — added a ม.28 three-directive selector (`#m28Card`,
  `#m28List` populated from `ECMIS.M28_ORDERS`, `#m28Law` reject-law reference) that gates
  visibility of the existing G1/G3 boxes and branches the `sign` handler (ACCEPT keeps the
  original G1/G3 routing; REJECT/DISMISS closes the case with ม.28-referenced messaging); added an
  explicit **Assign** action (`data-act="assign"`) that pre-sets G1=ใช่ and hands off to the
  signature step; wired `ECMIS.sequentialSignDialog` into the G3 urgent-bypass path (เลขาธิการฯ →
  ผอ.กบค.) instead of the single-signer dialog; added `?assign=1` deep-link handling so the inbox's
  quick "Assign" button can pre-populate this page.
- `activity7/11-secgen-desk.html` — added row-level quick actions (**Assign** / **Return**) to the
  S1 sign queue table, reusing `ECMIS.RETURN_REASONS` / `ECMIS.RETURN_SCOPES` / `ECMIS.confirmAction`
  / `ECMIS.toastOk` for consistency with the existing return-dialog copy in
  `04-approval-review.html`; the existing "เห็นชอบ / ลงนาม" (Approve) link was kept unchanged since
  full approval still legally requires an opinion + digital signature and cannot be a one-click
  shortcut from the inbox row.

No files were created from scratch; all changes extend existing screens already covering the
Secretary-General Inbox & Actions flow.
