# 📋 Task Plan: Lock หน้ากลั่นกรองเมื่อดำเนินการเสร็จ (read-only view)

> **Plan ID:** `2026-09-04-subcommittee-screening-lock`
> **Date:** 2026-09-04
> **Author / Agent:** Claude Code
> **Status:** Completed
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement & Business Objective

- **ปัญหา / ความต้องการ:** เมื่อสำนวนในคิวคณะอนุกรรมการกลั่นกรองฯ **ดำเนินการเสร็จแล้ว** (กลั่นกรอง
  แล้วเสร็จ = `DONE`, หรือส่งคืนเจ้าของสำนวน = `RETURNED`) แล้วผู้ใช้กด "ดูผล" เข้ามาที่
  `subcommittee-screening.html` ต้องการให้หน้า **ล็อก** — เปิดดูเนื้อหา/เอกสาร/ประวัติได้ แต่
  **แก้ไข / ลงนาม / ส่งซ้ำไม่ได้**
- **สถานะปัจจุบัน:** action bar ล็อกอยู่แล้วบางส่วน (`renderActionButtons()` เรียก `ECMIS.actionBar()`
  โดยไม่ส่ง `forceAllowed` → `canAct()` คืน false เมื่อ `STATUS[status].owner !== 'subcommittee'`)
  **แต่** ฟิลด์ในฟอร์ม (`#subOpinion`, radio, ครั้งที่ประชุม ฯลฯ) ยังพิมพ์ได้, ปุ่ม "แก้ไขเอกสาร"
  (`#btnDocEdit`) ยังกดได้, การ์ดลายเซ็นยังอยู่, และไม่มีแบนเนอร์ที่บอกชัดว่า "กลั่นกรองแล้วเสร็จ"
  `applyViewOnlyGuard()` ที่มีอยู่ล็อกเฉพาะตอน `role.id !== 'subcommittee'` เท่านั้น
- **ข้อกฎหมาย / มติที่เกี่ยวข้อง:** ต่อยอดจาก [[2026-09-04-subcommittee-screening-status]] —
  มติ/ความเห็นของคณะอนุฯ (subOutcome) เมื่อลงนามและส่งแล้วถือเป็นเอกสารที่เสนอต่อคณะกรรมการ ป.ป.ท.
  แล้ว (ม.๒๔ ว.๕ / พ.ร.ป. ป.ป.ช. ๒๕๖๑) จึงไม่ควรแก้ย้อนหลัง — immutability เพื่อ audit trail

---

## 📐 2. Design Decisions (จาก grilling session — 2026-09-04)

1. **เงื่อนไข lock:** `ECMIS.isScreeningLocked(kase)` = `true` เมื่อ `subScreeningStatus(kase)` **ไม่ใช่**
   `PENDING` และ **ไม่ใช่** `MORE_INFO` (คือเป็น `DONE` หรือ `RETURNED`)
   - `DONE` = case ถึง `AGENDA_SET` / `PENDING_INVITE_72` ที่มี `subOutcome` กลุ่ม DONE
   - `RETURNED` = `RETURNED` / `RETURNED_72` ที่มี `subOutcome` กลุ่ม RETURNED (`NEED_MORE_INQUIRY` / `NEED_MORE`)
   - case ที่ข้ามคิวไปโดยไม่มี `subOutcome` (เช่น urgent bypass) → `subScreeningStatus` คืน `PENDING`
     → **ไม่โดนแบนเนอร์นี้** (แต่ action bar เดิมก็ล็อกด้วย `canAct` อยู่แล้ว)
2. **ล็อกถาวร** — ไม่มีปุ่ม reopen; ปลดล็อกเองเมื่อ case วนกลับเข้า `IN_SCREENING` / `IN_SCREENING_72`
   ตาม transition ปกติ (`SCREENING_RESUBMIT` / `MORE_INFO_SUPPLIED` ฯลฯ)
3. **โหมด locked ทำได้:** ดู preview เอกสาร (พิมพ์ / ส่งออก DOCX ได้), ดู timeline ประวัติคณะอนุฯ,
   เห็นฟิลด์ทั้งหมดแบบ read-only
4. **โหมด locked ห้าม:** แก้ฟิลด์ใด ๆ, กด `#btnDocEdit` (rich-text), เห็น/ใช้การ์ดลายเซ็น `#sigCard`,
   ปุ่มดำเนินการ/ลงนามทั้งหมด
5. **แบนเนอร์** แทนที่ `#actionBarSlot` (ด้านล่าง) — badge สถานะ + SLA ด้านบน (`#stBadge`) คงเดิม
   ข้อความแยก DONE vs RETURNED + แสดง outcome label + มาตรา + คณะ + วันที่ (ดึงจาก `kase.subOutcome*`
   หรือ history entry ล่าสุด)
6. **ขอบเขต:** เฉพาะ `screening.html` + `subcommittee-screening.html` (byte-identical — แก้คู่กัน)
   ไม่แตะ `board-resolution.html` / `resolution-72.html`
7. **inbox:** ปุ่มแถวที่ `screenStatus ∈ {DONE, RETURNED}` → "ดูผล" (`btn-outline-secondary` + `fa-eye`);
   `PENDING` / `MORE_INFO` คง "ดำเนินการ" (`btn-navy` + `fa-pen-to-square`)
8. **ไม่มี** STATUS / TRANSITION / STATUS_CODE ใหม่ — UI lock ล้วน ๆ

---

## 📂 3. Affected Routes & Modules

- [x] Assets JS: `assets/ecmis-app.js` — เพิ่ม `isScreeningLocked(kase)` + export ใน `window.ECMIS`
- [x] Root HTML: `screening.html` **และ** `subcommittee-screening.html` (แก้คู่กันให้ตรงทุกตัวอักษร)
  - `SCREEN_LOCKED` const, ปรับ `applyViewOnlyGuard()` → รองรับทั้ง status-lock และ role-lock,
    ซ่อน `#sigCard`, disable `#btnDocEdit`, แบนเนอร์ DONE/RETURNED, กัน `handle()` ทั้ง 7.1/7.2
- [x] Root HTML: `subcommittee-inbox.html` — ปุ่ม "ดูผล" ครอบ `RETURNED` ด้วย
- [x] Mirror HTML (ผ่าน `npm run sync`): `res/screening.html`, `res/subcommittee-screening.html`,
  `res/subcommittee-inbox.html`

---

## 🛡️ 4. The 6 Golden Anti-Regression Pre-Check

- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง" (ไม่แตะ inbox.html / resolution-inbox.html)
- [x] 2. ไม่เปิดสิทธิ์ `agenda-registry.html` ให้ Chairman / Affairs (ไม่แตะ)
- [x] 3. ไม่เรียก Supabase โดยตรง (UI lock ล้วน)
- [x] 4. วางแผนรัน `npm run sync` หลังแก้ Root
- [x] 5. ไม่แตะ A4 margin/geometry — แบนเนอร์อยู่ใน `#actionBarSlot` เดิม ไม่แตะ `.doc-paper` / secret footer
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 5. Step-by-Step Implementation Tasks

- [x] **Task 1:** `assets/ecmis-app.js` — `function isScreeningLocked(kase){ const s = subScreeningStatus(kase);
  return s === 'DONE' || s === 'RETURNED'; }` + export
- [x] **Task 2:** `screening.html` — เพิ่ม `const SCREEN_LOCKED = ECMIS.isScreeningLocked(kase);`
  หลัง `SUB_CAN_WRITE`
- [x] **Task 3:** `screening.html` — ปรับ `applyViewOnlyGuard()`:
  - เปลี่ยนเงื่อนไข early-return เป็น `if (SUB_CAN_WRITE && !SCREEN_LOCKED) return;`
  - disable inputs (เดิม) + `document.getElementById('btnDocEdit')?.setAttribute('disabled','')`
    + `document.getElementById('sigCard')?.classList.add('d-none')`
  - แบนเนอร์: ถ้า `SCREEN_LOCKED` → ข้อความ DONE/RETURNED (ดู `subScreeningStatus`) พร้อม
    `mapSubOutcome(kase.subOutcome)` label + lawRef + `kase.subOutcomeTeam` + `kase.subOutcomeAt`;
    ไม่งั้น (role-lock) → ข้อความเดิม
- [x] **Task 4:** `screening.html` — เพิ่ม `|| SCREEN_LOCKED` ใน guard ต้น `handle(act)` ทั้ง 7.1 และ 7.2
  (toast "สำนวนนี้กลั่นกรองแล้วเสร็จ — แก้ไขไม่ได้")
- [x] **Task 5:** คัดลอก `screening.html` → `subcommittee-screening.html` ให้ตรงกันทุกตัวอักษร
- [x] **Task 6:** `subcommittee-inbox.html` — `const done = c.screenStatus === 'DONE' || c.screenStatus === 'RETURNED';`
- [x] **Task 7:** `npm run sync`
- [x] **Task 8:** `npm test` + `npm run test:integration`

---

## 🧪 6. Verification & Quality Gate Matrix

- [~] **Manual UI Walkthrough:** ยังไม่ได้เดินจริงบน Chrome — ตรวจด้วย node smoke test แทน
  (`isScreeningLocked` / `subScreeningStatus` ให้ผลถูกต้องกับ mock 6 เรื่อง: PENDING/MORE_INFO →
  locked=false, DONE/RETURNED → locked=true) เคสที่ควรเดินจริงภายหลัง:
  - login `subcommittee` → inbox คณะที่ 2 → แถว DONE ปุ่มเป็น "ดูผล" → กดเข้า → หน้าล็อก:
    ฟิลด์ disabled, ไม่มีการ์ดลายเซ็น, `#btnDocEdit` กดไม่ได้, แบนเนอร์ "🔒 สำนวนนี้กลั่นกรองแล้วเสร็จ
    — เห็นควรชี้มูลความผิด (ม.๗๒) ...", ปุ่มพิมพ์/DOCX ยังกดได้, timeline แสดงครบ
  - inbox คณะที่ 1 → แถว RETURNED ปุ่ม "ดูผล" → หน้าล็อก แบนเนอร์ "🔒 ส่งคืนเจ้าของสำนวน..."
  - inbox คณะที่ 1 → แถว MORE_INFO ปุ่ม "ดำเนินการ" → หน้า**ไม่**ล็อก แก้ opinion + กด transition ได้
  - inbox คณะที่ 4 → แถว PENDING → หน้าปกติ
  - login `board_sec` เปิด DONE case → ล็อก (แบนเนอร์ status-lock ชนะ role-lock)
- [x] **Dual-Route Sync:** `npm run sync` diff = 0
- [x] **Enterprise CI (5-Layer):** `npm test` ผ่าน 100%
- [x] **Integration Test:** `npm run test:integration` ผ่าน

---

## 🏁 7. Completion & Sign-off

- **Completed Date:** 2026-09-04
- **Commit Reference:** _(commit ถัดจาก 3795729)_
- **Notes / Retrospective:** action bar เดิมล็อกด้วย canAct อยู่แล้ว งานนี้เพิ่ม: freeze ฟิลด์ + ซ่อน sigCard + disable btnDocEdit + แบนเนอร์ DONE/RETURNED เฉพาะเจาะจง + ปุ่ม "ดูผล" ใน inbox ครอบ RETURNED. npm test 5/5, integration 60/60.
