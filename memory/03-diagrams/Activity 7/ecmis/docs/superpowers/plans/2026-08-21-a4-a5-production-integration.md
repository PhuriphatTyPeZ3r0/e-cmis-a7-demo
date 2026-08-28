# E-CMIS A4+5 Production Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** นำ A4+5 รุ่นปัจจุบันจาก `/Users/jetsadasomporn/Downloads/E-CMIS-A4-Production/E-CMIS-A4` เข้า `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation` โดยรักษา aggregate shell, login/RBAC, case registry, cross-activity handoff และ Activity 7 ของ `ecmis` ไว้ พร้อมมีทาง rollback ที่ไม่ล้างข้อมูล browser เดิม

**Architecture:** ใช้ controlled file sync สำหรับ source A4+5 และเพิ่ม adapter บาง ๆ ระหว่าง internal A4/A5 state กับ contract กลาง `ECMISHub`/`ECMISHandoff` ของ aggregate ห้ามให้สองฝั่งเขียนทับ state ทั้งก้อนของกันและกัน A4+5 ยังทำงาน standalone ได้ แต่เมื่ออยู่ใต้ `ecmis` จะใช้ aggregate auth และ handoff เป็นเจ้าของการส่งข้ามกิจกรรม

**Tech Stack:** Static HTML/CSS/JavaScript, browser `localStorage`/`sessionStorage`/IndexedDB, Node.js test runner, Playwright 1.62.1, Python static HTTP server

**Source of truth:**

- Source A4+5: `/Users/jetsadasomporn/Downloads/E-CMIS-A4-Production/E-CMIS-A4`
- Production aggregate target: `/Users/jetsadasomporn/Downloads/ecmis`
- Target module: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation`
- Aggregate case contract: `/Users/jetsadasomporn/Downloads/ecmis/cases.js`
- Aggregate handoff contract: `/Users/jetsadasomporn/Downloads/ecmis/shared-assets/handoff.js`
- Aggregate mock auth: `/Users/jetsadasomporn/Downloads/ecmis/shared-assets/auth.js`
- Activity 7 owner: `/Users/jetsadasomporn/Downloads/ecmis/board-resolution`

## Confirmed Baseline

- Source commit: `1a2a47d0c574575fd9a1061aa2abf5892361c740` และ source working tree clean ตอนเริ่ม Task 2; commit นี้รวม current A4+5 work ที่เดิมยังไม่ commit ไว้แล้ว
- Target commit: `644859316fea3429471837a5f02e1da6bdd68687` และ target working tree clean ตอนเริ่ม implementation; commit นี้รวมงานใหม่ของ `intake-investigation/01-work-inbox.html` และ module อื่นที่ต้องรักษาไว้
- Snapshot source หลังตัด `.git`, agent artifacts, dependencies และ outputs มี 193 ไฟล์; controlled runtime set ที่จะ sync มี 182 ไฟล์: เหมือนกัน 97, ต่างกัน 49, source-only 36 และ target-only ที่ต้องรักษาอย่างน้อย 25
- Source มี test A4+5 จำนวน 43 ไฟล์ ส่วน target module มี 28 ไฟล์
- `intake-investigation/staff-workflow.html` ปัจจุบันไม่ได้โหลด `../shared-assets/auth.js`, `../cases.js` หรือ `../shared-assets/handoff.js`
- Target-only Activity 7 HTML ที่อยู่ใน `intake-investigation` อ้าง local assets ที่ไม่มีจริง; Activity 7 ที่ใช้งานได้อยู่ที่ `/board-resolution`
- Baseline command `node tests/seam-logic.test.mjs` บน clean target ผ่าน 48 และ fail 5: fixed seed count 1 จุด, Activity 7 bridge 2 จุด, Activity 10 bridge 2 จุด
- ทั้ง source และ target เป็น browser-storage prototype ไม่มี backend/database/system-of-record ใน scope นี้ คำว่า production ในแผนหมายถึง deployment repository ไม่ใช่ production-grade security

## Global Constraints

- ห้าม copy `.git`, `node_modules`, `.DS_Store`, browser screenshots, test output, temporary files หรือ local secrets
- ห้ามใช้ `cp -R`, `rsync --delete` หรือ replace folder ทั้งก้อน
- ห้ามแก้ source A4+5 ระหว่าง migration; source เป็น read-only input หลังสร้าง snapshot manifest
- ห้ามทำงานตรง `main`; ใช้ branch `integrate/a4-a5-current-20260821`
- ห้ามลบหรือเขียนทับ `/board-resolution`, `/shared-assets`, `/cases.js` และ module อื่นเพื่อให้ A4+5 ผ่าน
- ห้ามใช้ `localStorage.clear()` หรือ reset seed อัตโนมัติระหว่าง cutover
- Uploaded binary ต้องอยู่ IndexedDB ต่อไป ห้ามย้าย base64/blob กลับเข้า `localStorage`
- `บันทึกร่าง` และ mock submission ของรายงาน 213 ต้องไม่เพิ่ม strict legal/content validation กลับมา
- รักษา flow ที่ตกลงล่าสุด: กบค. กด `ส่งมติบอร์ด` → Activity 7 บันทึกผล → ผลกลับไปงานธุรการคดีประจำเขต
- URL `role=` ใช้เลือก demo role ได้เฉพาะ standalone หรือ `demo=1`; เมื่ออยู่ใน aggregate ต้องไม่ใช้ query parameter เป็น authorization
- ทุก Task ต้องเริ่มจาก failing test และจบด้วย focused test ก่อน commit
- ถ้า source snapshot เปลี่ยนหลัง Task 2 ให้หยุดและสร้าง manifest ใหม่ ห้าม sync ต่อจาก manifest เก่า

## Scope Boundaries

อยู่ในแผน:

- A4 รับเรื่องร้องเรียนและ A5 กระบวนการไต่สวนปัจจุบัน
- aggregate login/RBAC adapter
- case registry/handoff adapter ไป Activity 7 และผลกลับ
- state migration ที่ไม่ทำลายข้อมูลเดิม
- reproducible tests และ cutover/rollback

ไม่อยู่ในแผน:

- เปลี่ยน mock auth เป็น backend auth
- ย้าย `localStorage`/IndexedDB ไป database
- redesign Activity 7 หรือ module อื่น
- แก้กฎหมาย/แบบเอกสารนอกเหนือจาก behavior ที่อยู่ใน source snapshot
- deploy ขึ้น server จริง เพราะยังไม่มี deployment mechanism/credentials ที่ยืนยันได้

## File Ownership

- Source-owned และ sync ได้: `intake-investigation/assets/**`, core A4/A5 HTML, A4/A5 tests ที่อยู่ใน source manifest
- Aggregate-owned และห้าม sync ทับ: root `cases.js`, `shared-assets/**`, `board-resolution/**`, `legal-case/**`, root login/index และ root tests
- Integration-owned: adapter ใหม่ภายใต้ `intake-investigation/assets/`, migration tests ภายใต้ `intake-investigation/tests/`, sync tooling ภายใต้ root `scripts/`
- Target-only legacy Activity 7 pages ใน `intake-investigation` ไม่ลบในแผนนี้ เพื่อไม่ขยาย scope; ให้บันทึกเป็น cleanup backlog หลัง cutover

## Task 1: ทำให้ Aggregate Baseline เชื่อถือได้ก่อนรับ A4+5

**Files:**

- Modify: `/Users/jetsadasomporn/Downloads/ecmis/tests/seam-logic.test.mjs`
- Modify: `/Users/jetsadasomporn/Downloads/ecmis/board-resolution/assets/ecmis-app.js`
- Modify: `/Users/jetsadasomporn/Downloads/ecmis/legal-case/assets/ecmis-app.js`
- Test: `/Users/jetsadasomporn/Downloads/ecmis/tests/seam-logic.test.mjs`

- [ ] **Step 1: สร้าง integration branch และยืนยัน target clean**

Run:

```bash
cd /Users/jetsadasomporn/Downloads/ecmis
git status --short
git switch -c integrate/a4-a5-current-20260821
git tag pre-a4-a5-integration-20260821 644859316fea3429471837a5f02e1da6bdd68687
```

Expected: `git status --short` ไม่มี output และ tag ชี้ baseline ก่อน migration

- [ ] **Step 2: ยืนยัน baseline failure เดิม**

Run: `node tests/seam-logic.test.mjs`

Expected: ผ่าน 48, fail 5 ตาม Confirmed Baseline ถ้าผลต่างจากนี้ให้หยุดและอัปเดตแผนก่อนแก้

- [ ] **Step 3: แก้ test seed count ไม่ให้ผูกกับจำนวน seed ตายตัว**

แก้ test ให้จำจำนวนก่อนเพิ่ม case และตรวจว่าเพิ่มขึ้นหนึ่งรายการ:

```js
const before = H.getAllCases().length
H.saveCase({ id: '0002/2569', subject: 'เรื่องใหม่ทดสอบ' })
eq('ทะเบียนเพิ่มเคสใหม่หนึ่งรายการ', H.getAllCases().length, before + 1)
```

- [ ] **Step 4: เพิ่ม scoped hub bridge หลัง local restore ของ Activity 7 และ Activity 10**

Bridge ต้องทำเฉพาะ active case จาก `ECMISHub.activeCaseId()` ห้าม dump `CASES` ทั้งชุดกลับทะเบียนกลาง:

```js
function __hubBridgeCases() {
  const hub = window.ECMISHub
  if (!hub) return
  const shared = hub.getCase(hub.activeCaseId())
  if (!shared) return
  const index = CASES.findIndex(item => hub.normId(item.id) === hub.normId(shared.id))
  if (index === -1) CASES.push({ ...shared })
  else Object.assign(CASES[index], shared)
}
```

Activity 10 ใช้ชื่อ `bridgeFromHub` แต่ contract เดียวกัน เรียกหลัง block ที่ restore `CASES.length = 0` ทั้งสอง module

- [ ] **Step 5: รัน baseline suite**

Run: `node tests/seam-logic.test.mjs`

Expected: failures=0

- [ ] **Step 6: Commit baseline repair แยกจาก migration**

```bash
git add tests/seam-logic.test.mjs board-resolution/assets/ecmis-app.js legal-case/assets/ecmis-app.js
git commit -m "fix(seams): restore scoped hub bridges"
```

## Task 2: ล็อก Source Snapshot ปัจจุบัน

**Files:**

- Create: `/Users/jetsadasomporn/Downloads/ecmis/docs/migrations/a4-a5-source-20260821.md`
- Create: `/Users/jetsadasomporn/Downloads/ecmis/docs/migrations/a4-a5-source-20260821.sha256`
- Create: `/Users/jetsadasomporn/Downloads/ecmis/tests/a4-a5-source-manifest.test.mjs`

- [ ] **Step 1: เขียน manifest test ให้ fail เมื่อยังไม่มี snapshot**

Test ต้องตรวจ:

```js
assert.ok(manifest.length > 0)
assert.equal(manifest.some(line => line.includes('node_modules/')), false)
assert.equal(manifest.some(line => line.includes('/.git/')), false)
assert.equal(manifest.some(line => line.includes('.DS_Store')), false)
assert.ok(manifest.some(line => line.endsWith('  assets/activity5-workspace.js')))
```

- [ ] **Step 2: สร้าง human-readable snapshot record**

บันทึก source root, source commit, ผล `git status --short`, include/exclude rules และ timestamp ลง `a4-a5-source-20260821.md` โดยไม่แก้ source

- [ ] **Step 3: สร้าง checksum manifest แบบ deterministic**

ใช้ `find -print0`, `sort -z`, `shasum -a 256` กับ source โดย exclude `.git`, `node_modules`, `.DS_Store`, outputs และ temporary files ผลลัพธ์ต้องใช้ relative paths เพื่อ rerun ได้บนเครื่องอื่น

- [ ] **Step 4: Verify manifest**

Run:

```bash
node tests/a4-a5-source-manifest.test.mjs
cd /Users/jetsadasomporn/Downloads/E-CMIS-A4-Production/E-CMIS-A4
shasum -a 256 -c /Users/jetsadasomporn/Downloads/ecmis/docs/migrations/a4-a5-source-20260821.sha256
```

Expected: ทุกไฟล์ `OK`

- [ ] **Step 5: Commit snapshot metadata**

```bash
cd /Users/jetsadasomporn/Downloads/ecmis
git add docs/migrations tests/a4-a5-source-manifest.test.mjs
git commit -m "chore(intake): record A4 A5 source snapshot"
```

## Task 3: สร้าง Controlled Sync Tool แทนการ Copy Folder

**Files:**

- Create: `/Users/jetsadasomporn/Downloads/ecmis/scripts/sync-intake-investigation.mjs`
- Create: `/Users/jetsadasomporn/Downloads/ecmis/tests/intake-sync-manifest.test.mjs`
- Create: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/.source-sync.json`

**Interface:**

```text
node scripts/sync-intake-investigation.mjs --source <path>           # dry-run
node scripts/sync-intake-investigation.mjs --source <path> --check   # fail on drift
node scripts/sync-intake-investigation.mjs --source <path> --apply   # copy managed paths
```

- [ ] **Step 1: เขียน failing tests สำหรับ include/exclude และ no-delete**

Test fixtures ต้องพิสูจน์ว่า tool:

- copy source-managed HTML/assets/tests
- ไม่ copy `.git`, `node_modules`, `.DS_Store`, screenshots และ output
- ไม่ลบ target-only file
- dry-run ไม่แก้ filesystem
- `--check` exit non-zero เมื่อ managed file ต่าง
- ปฏิเสธ source ถ้า checksum ไม่ตรง Task 2

- [ ] **Step 2: เขียน `.source-sync.json` เป็น allowlist**

กำหนด managed paths จาก snapshot จริง ไม่ใช้ wildcard ครอบ repo ทั้งก้อน โครงสร้างขั้นต่ำ:

```json
{
  "sourceManifest": "../docs/migrations/a4-a5-source-20260821.sha256",
  "managedRoots": ["assets", "tests"],
  "managedFiles": ["staff-workflow.html", "complaint-form.html", "tracking.html"],
  "exclude": [".git", "node_modules", ".DS_Store", "outputs", "screenshots"]
}
```

รายชื่อ `managedFiles` ต้องสร้างจาก source snapshot และ review ทีละไฟล์ ห้ามใช้สามไฟล์ตัวอย่างนี้เป็นรายการครบถ้วน

- [ ] **Step 3: Implement sync tool ด้วย Node standard library**

ใช้ `fs.cp` เฉพาะ path ที่ allowlist ระบุ, เปรียบ SHA-256 ก่อนเขียน, พิมพ์ summary `added/changed/unchanged/preserved-target-only`, และหยุดก่อนเขียนถ้าพบ checksum mismatch

- [ ] **Step 4: รัน test และ dry-run กับ repo จริง**

```bash
node tests/intake-sync-manifest.test.mjs
node scripts/sync-intake-investigation.mjs \
  --source /Users/jetsadasomporn/Downloads/E-CMIS-A4-Production/E-CMIS-A4
```

Expected จาก verified snapshot `1a2a47d`: added 36, changed 49, unchanged 97 และ preserved-target-only 25 ตัวเลขต้องตรงจนกว่า source manifest หรือ target baseline จะเปลี่ยน

- [ ] **Step 5: Commit tooling**

```bash
git add scripts/sync-intake-investigation.mjs tests/intake-sync-manifest.test.mjs intake-investigation/.source-sync.json
git commit -m "build(intake): add deterministic A4 A5 sync"
```

## Task 4: Import A4+5 Current Snapshot เข้า Target Module

**Files:**

- Modify/Create: paths ที่ `.source-sync.json` ระบุภายใต้ `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation`
- Test: source-managed tests ภายใต้ `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/tests`

- [ ] **Step 1: Apply sync จาก snapshot ที่ verify แล้ว**

```bash
node scripts/sync-intake-investigation.mjs \
  --source /Users/jetsadasomporn/Downloads/E-CMIS-A4-Production/E-CMIS-A4 \
  --apply
```

- [ ] **Step 2: ตรวจว่า target-only files ไม่หาย**

Run: `git status --short`

Expected: ไม่มี deletion ของ Activity 7 legacy HTML หรือ aggregate-owned files

- [ ] **Step 3: รัน A4+5 source tests ในตำแหน่ง target**

Run:

```bash
node --test intake-investigation/tests/*.test.mjs
node --check intake-investigation/assets/activity4-workspace.js
node --check intake-investigation/assets/activity5-workspace.js
node --check intake-investigation/assets/activity5-workflow.js
```

Expected: zero failures และ syntax checks ผ่าน ถ้า test จำนวนไม่เท่ากับ source snapshot ให้หยุดและตรวจ allowlist

- [ ] **Step 4: ตรวจ sync drift หลัง apply**

```bash
node scripts/sync-intake-investigation.mjs \
  --source /Users/jetsadasomporn/Downloads/E-CMIS-A4-Production/E-CMIS-A4 \
  --check
```

Expected: zero managed drift

- [ ] **Step 5: Commit import แยกจาก adapter**

```bash
git add intake-investigation
git commit -m "feat(intake): sync current A4 A5 implementation"
```

## Task 5: ต่อ Aggregate Auth โดยไม่ทำลาย Standalone Demo

**Files:**

- Create: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/assets/ecmis-auth-adapter.js`
- Create: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/tests/ecmis-auth-adapter.test.mjs`
- Modify: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/staff-workflow.html`
- Modify: role bootstrap owner ที่ test ชี้ว่ารับ `role=` อยู่ใน A4/A5 assets

**Interface:**

```js
window.ECMISIntakeAuth = {
  mode(),
  currentIdentity(),
  currentRole(),
  can(action, context)
}
```

- [ ] **Step 1: เขียน failing contract tests**

ครอบคลุม:

- Aggregate mode ใช้ `ECMISAuth.getAuth()` และ `ECMISAuth.canSee('intake-investigation')`
- `ECMISAuth.isReadOnly()` บังคับ read-only
- `?role=...` ไม่ override aggregate identity
- standalone หรือ `?demo=1` ยังใช้ role selector ของ A4+5 ได้
- mapping ใช้ `roleId`/capability/title ตาม registry ไม่ hard-code username
- ไม่มี auth ให้ redirect ไป root login แทน render ข้อมูลคดี

- [ ] **Step 2: โหลด shared auth ก่อน local workspaces**

ใน `staff-workflow.html` โหลดตามลำดับ:

```html
<script src="../shared-assets/auth.js" defer></script>
<script src="assets/ecmis-auth-adapter.js" defer></script>
```

Adapter ต้องตรวจ path/mode ก่อนใช้ shared auth เพื่อให้ source standalone ไม่พัง

- [ ] **Step 3: เชื่อม role bootstrap เข้ากับ adapter จุดเดียว**

ห้ามกระจาย `ECMISAuth.getAuth()` ไปหลาย workspace ให้ local code ขอ normalized role จาก `ECMISIntakeAuth.currentRole()` และรักษา role names ที่ source ใช้อยู่ เช่น investigator, unit director, GBK clerk และ case clerk

- [ ] **Step 4: รัน focused tests**

```bash
node intake-investigation/tests/ecmis-auth-adapter.test.mjs
node tests/register-dropdowns.test.mjs
node tests/rbac.test.mjs
```

Expected: aggregate identity ตรง activity, stale/query role ไม่ยกระดับสิทธิ์ และ standalone demo ยังเปิดได้

- [ ] **Step 5: Commit**

```bash
git add intake-investigation/assets/ecmis-auth-adapter.js intake-investigation/tests/ecmis-auth-adapter.test.mjs intake-investigation/staff-workflow.html
git commit -m "feat(intake): bind A4 A5 roles to aggregate auth"
```

## Task 6: ต่อ Case Registry และ Handoff A4+5 ↔ Activity 7

**Files:**

- Create: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/assets/ecmis-aggregate-adapter.js`
- Create: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/tests/ecmis-aggregate-adapter.test.mjs`
- Modify: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/staff-workflow.html`
- Modify: source owner ของ action `ส่งมติบอร์ด` และ board-result consumption ใน Activity 5 workspace/workflow
- Use unchanged: `/Users/jetsadasomporn/Downloads/ecmis/cases.js`
- Use unchanged: `/Users/jetsadasomporn/Downloads/ecmis/shared-assets/handoff.js`

**Interface:**

```js
window.ECMISIntakeAggregate = {
  isAvailable(),
  publishCase(localState),
  sendReport213ToBoard(localState, actor),
  consumeBoardResult(caseId)
}
```

- [ ] **Step 1: เขียน failing adapter tests**

พิสูจน์ว่า:

- `publishCase` map เฉพาะ summary/route/status fields ไม่ copy A4/A5 state ทั้งก้อน
- `sendReport213ToBoard` เรียก `ECMISHandoff.send()` ด้วย `from: 'intake-investigation'`, `to: 'board-resolution'`, active case id, report 213 docs และ audit fields ครบ
- local state เปลี่ยนเป็นรอผลมติหลัง `send()` สำเร็จเท่านั้น
- send fail แล้ว local state/owner ไม่ขยับ
- `consumeBoardResult` อ่าน event/patch ของ case เดียว ไม่ใช้ seed fallback
- standalone mode ใช้ mock shortcut เดิมโดยไม่ throw

- [ ] **Step 2: โหลด aggregate contract ตามลำดับก่อน adapter**

```html
<script src="../cases.js" defer></script>
<script src="../shared-assets/handoff.js" defer></script>
<script src="assets/ecmis-aggregate-adapter.js" defer></script>
```

- [ ] **Step 3: Map A4 dispatch และ A5 identity ให้ทะเบียนกลาง**

ใช้ case id/เลขสำนวนจริงจาก local state, destination unit ที่ผู้ใช้ยืนยันล่าสุด, source decision, signed document version และ dispatch metadata ห้าม fallback เป็น seed case เมื่อไม่พบ id

- [ ] **Step 4: เชื่อมปุ่ม `ส่งมติบอร์ด` ของ กบค.**

Envelope ขั้นต่ำ:

```js
ECMISHandoff.send({
  caseId,
  from: 'intake-investigation',
  to: 'board-resolution',
  trigger: 'กบค. ส่งรายงาน 213 เพื่อรับมติคณะกรรมการ',
  docs: ['รายงาน 213', 'สำนวนและเอกสารประกอบ'],
  statusBefore,
  statusAfter: 'รอผลมติคณะกรรมการ ป.ป.ท.',
  by: actor,
  patch: { report213: 'ส่งกิจกรรมที่ 7 แล้ว' }
})
```

- [ ] **Step 5: เชื่อมผลมติกลับธุรการคดีประจำเขต**

Activity 7 เป็นเจ้าของค่ามติ ต้องส่งกลับผ่าน hub event/patch เดิม โดย adapter ฝั่ง A5 map เฉพาะ:

- resolution code/text/reference
- decided timestamp
- order/committee type ถ้ามีในผลจริง
- destination unit เดิม
- owner เป็น case-clerk ของ destination unit

ห้ามสร้างมติสมมติใน A5 ถ้า Activity 7 ยังไม่บันทึกผล

- [ ] **Step 6: รัน focused tests**

```bash
node intake-investigation/tests/ecmis-aggregate-adapter.test.mjs
node tests/seam-logic.test.mjs
node --test intake-investigation/tests/activity5-*.test.mjs
```

- [ ] **Step 7: Commit**

```bash
git add intake-investigation/assets/ecmis-aggregate-adapter.js intake-investigation/tests/ecmis-aggregate-adapter.test.mjs intake-investigation/staff-workflow.html intake-investigation/assets
git commit -m "feat(seams): connect A4 A5 with board resolution"
```

## Task 7: ทำ State Migration แบบไม่ล้างงานเดิมและไม่ชน Quota

**Files:**

- Create: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/assets/ecmis-storage-migration.js`
- Create: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/tests/ecmis-storage-migration.test.mjs`
- Modify: `/Users/jetsadasomporn/Downloads/ecmis/intake-investigation/staff-workflow.html`

**Known stores:**

- `ecmis-a4-workspace-v3`
- A5 seed/workspace store ที่ source snapshot ใช้จริง
- A4→A5 handoff store ที่ source snapshot ใช้จริง
- IndexedDB document store `ecmis-case-documents`
- Migration marker `ecmis-intake-production-migration-v1`

- [ ] **Step 1: เขียน migration tests ก่อน**

ครอบคลุม:

- migration idempotent
- legacy state เปิด case เดิมได้
- old report-213 waiting status ถูก normalize เป็นสถานะรอผลที่ source current รองรับ
- destination unit/assignee/signature/document metadata ไม่หาย
- IndexedDB blob ไม่ถูก stringify เข้า localStorage
- Quota error คืน actionable result และไม่ทิ้ง active stores
- ไม่มี `localStorage.clear()`

- [ ] **Step 2: Implement copy-on-transform ใน memory**

อ่าน state เดิม, normalize เฉพาะ schema ที่จำเป็น, เขียนกลับ key เดิมหรือ versioned key ที่เล็กกว่า และเขียน marker หลัง write สำเร็จทั้งหมดเท่านั้น ห้ามทำ backup ซ้ำทั้งก้อนใน localStorage เพราะเป็นสาเหตุ quota เต็ม

- [ ] **Step 3: จำกัด cleanup เฉพาะ disposable keys**

อนุญาตลบเฉพาะ invalid snapshots/temporary UI cache ที่มี allowlist ชัดเจน ห้ามลบ case, handoff, signature, uploaded document metadata หรือ aggregate auth

- [ ] **Step 4: โหลด migration ก่อน workspace state initialization**

ใน `staff-workflow.html` ให้ `ecmis-storage-migration.js` มาก่อน `activity4-workspace.js` และ `activity5-workspace.js`

- [ ] **Step 5: รัน tests**

```bash
node intake-investigation/tests/ecmis-storage-migration.test.mjs
node --test intake-investigation/tests/*storage*.test.mjs
```

- [ ] **Step 6: Commit**

```bash
git add intake-investigation/assets/ecmis-storage-migration.js intake-investigation/tests/ecmis-storage-migration.test.mjs intake-investigation/staff-workflow.html
git commit -m "feat(intake): migrate browser state without reset"
```

## Task 8: ทำ Test Toolchain ของ Production Repo ให้ Reproducible

**Files:**

- Create: `/Users/jetsadasomporn/Downloads/ecmis/package.json`
- Create: `/Users/jetsadasomporn/Downloads/ecmis/package-lock.json`
- Modify: `/Users/jetsadasomporn/Downloads/ecmis/tests/rbac.test.mjs`
- Modify: browser tests ที่ import Playwright ด้วย absolute source path

- [ ] **Step 1: เขียน test ห้าม absolute dependency path**

Test ต้อง scan `tests/**/*.mjs` และ fail เมื่อพบ `/Users/jetsadasomporn/` หรือ import Playwright จาก source repo

- [ ] **Step 2: สร้าง minimal package config**

```json
{
  "private": true,
  "scripts": {
    "test:logic": "node tests/seam-logic.test.mjs",
    "test:unit": "node --test intake-investigation/tests/*.test.mjs",
    "test:e2e": "node tests/seam-dom.test.mjs && node tests/rbac.test.mjs"
  },
  "devDependencies": {
    "playwright": "1.62.1"
  }
}
```

- [ ] **Step 3: เปลี่ยน browser tests เป็น package import**

```js
import { chromium } from 'playwright'
```

- [ ] **Step 4: Install และรัน focused tests**

```bash
npm ci
npm run test:logic
npm run test:unit
```

ห้าม commit `node_modules`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tests
git commit -m "test: make aggregate checks reproducible"
```

## Task 9: End-to-End Acceptance และ Cutover Gate

**Files:**

- Create: `/Users/jetsadasomporn/Downloads/ecmis/tests/a4-a5-production-seam.test.mjs`
- Modify: `/Users/jetsadasomporn/Downloads/ecmis/tests/seam-dom.test.mjs`
- Modify: `/Users/jetsadasomporn/Downloads/ecmis/tests/rbac.test.mjs`
- Create: `/Users/jetsadasomporn/Downloads/ecmis/docs/migrations/a4-a5-cutover-checklist.md`

- [ ] **Step 1: เขียน E2E scenarios ก่อน**

ทดสอบแยก browser context ต่อ scenario:

1. login aggregate → เจ้าหน้าที่รับเรื่องสร้าง/เปิดเรื่อง → ผอ.อนุมัติ → dispatch เขต 1
2. ธุรการคดีเขต 1 เห็น case เดียวกันและรับ/มอบหมายได้
3. investigator รับมอบ → ทำแผน → ผอ.เขตอนุมัติ → กลับ investigator
4. บันทึกร่าง 213 ได้โดยไม่บังคับมาตรา/ความครบแบบ production validator
5. เสนอ 213 → กบค. กด `ส่งมติบอร์ด` → hub มี pending handoff ไป Activity 7
6. Activity 7 role เห็น case, บันทึกมติ และส่งผลกลับ
7. ธุรการคดีเขตเดิมเห็นผลมติและงานถัดไป
8. upload หลายไฟล์, preview, reload แล้ว metadata/preview ยังอยู่
9. reload/back/query case ไม่เปลี่ยนเป็น seed case
10. role อื่นเปิด URL ตรงแล้วไม่เห็น action ที่ไม่มีสิทธิ์

- [ ] **Step 2: รัน static server และ full suite**

Terminal 1:

```bash
cd /Users/jetsadasomporn/Downloads/ecmis
python3 tests/serve.py
```

Terminal 2:

```bash
npm run test:logic
npm run test:unit
npm run test:e2e
node tests/a4-a5-production-seam.test.mjs
```

Expected: zero failures, zero browser `pageerror`, route/reload/back scenarios ผ่าน

- [ ] **Step 3: Manual smoke test ด้วย fresh profile และ existing-state profile**

ตรวจสองแบบแยกกัน:

- fresh profile: seed/demo เปิดได้และ aggregate auth route ถูก
- existing-state profile: case เดิม, signatures, assignment, 213 draft และ uploads ไม่หาย

ห้ามใช้ `localStorage.clear()` เพื่อทำ existing-state test

- [ ] **Step 4: Verify file boundary และ repository state**

```bash
git diff --check pre-a4-a5-integration-20260821...HEAD
git status --short
git diff --name-status pre-a4-a5-integration-20260821...HEAD
```

Expected:

- worktree clean
- ไม่มี `.git`, `node_modules`, screenshots, secrets หรือ deletion ของ module อื่น
- changes แบ่งตาม commits ของแต่ละ Task

- [ ] **Step 5: ทำ cutover checklist**

บันทึก:

- tested commit SHA
- source checksum manifest SHA-256
- test commands/results
- cache-busted asset version ที่ deploy
- deployment owner/environment/URL
- rollback commit/tag
- known prototype limitations: browser auth/storage, no backend atomicity, no server authorization

- [ ] **Step 6: หยุดก่อน deploy จริงถ้ายังไม่มี deployment mechanism**

สถานะปัจจุบันยืนยันได้แค่ Git repository และ static local runtime ยังยืนยันไม่ได้ว่า production ใช้ Vercel, GitHub Pages, server copy หรือ pipeline ใด ผู้ลงมือ implementation ต้องขอ deployment target/credentials/approval ก่อนทำ external deployment

- [ ] **Step 7: Merge และ rollback strategy หลังได้รับ deployment authority**

Merge ด้วย reviewed PR/merge commit จาก `integrate/a4-a5-current-20260821` เท่านั้น

Rollback code:

```bash
git revert <merge-commit-sha>
```

Rollback ต้องไม่ล้าง browser storage; migration ต้อง backward-compatible กับ pre-integration code หรือ cutover ต้องระบุ schema compatibility ก่อน merge

## Release Gates

ห้ามผ่านไป Task ถัดไปเมื่อ Gate ก่อนหน้า fail:

| Gate | เงื่อนไขผ่าน |
|---|---|
| G0 Baseline | clean target, branch/tag แล้ว, seam logic zero failures |
| G1 Source | checksum manifest ครบและ source ไม่เปลี่ยน |
| G2 Sync | dry-run review แล้ว, no target-only deletion, source tests zero failures |
| G3 Auth | aggregate identity บังคับใช้, query role ยกระดับสิทธิ์ไม่ได้ |
| G4 Handoff | case เดียวกันไป Activity 7 และผลกลับ destination clerk ได้ |
| G5 Storage | existing browser state เปิดได้, no reset, no quota regression |
| G6 Acceptance | unit/logic/E2E/manual smoke ผ่าน, zero pageerror |
| G7 Deploy | รู้ deployment target, owner, credentials, rollback และได้รับอนุมัติ |

## Expected Commit Sequence

```text
fix(seams): restore scoped hub bridges
chore(intake): record A4 A5 source snapshot
build(intake): add deterministic A4 A5 sync
feat(intake): sync current A4 A5 implementation
feat(intake): bind A4 A5 roles to aggregate auth
feat(seams): connect A4 A5 with board resolution
feat(intake): migrate browser state without reset
test: make aggregate checks reproducible
test(e2e): cover A4 A5 production seam
docs: add A4 A5 cutover checklist
```

## Decision Summary

- **เลือก controlled sync + adapters:** ใช้เวลามากกว่า copy ทับ แต่แยก source change ออกจาก aggregate integration และ rollback ได้
- **ไม่ fork A4+5 ต่อในสองที่:** หลัง cutover ให้ source A4+5 เป็น upstream snapshot แล้วใช้ sync tool ตรวจ drift ลดปัญหาแก้คนละ repo
- **ไม่ย้าย Activity 7 เข้า A4+5:** `/board-resolution` เป็นเจ้าของมติอยู่แล้ว การมี Activity 7 สองชุดทำให้ state/role/document แยกกัน
- **ไม่อ้าง production security:** auth และ state ยังอยู่ browser; แผนนี้ทำ deployment integration ไม่ได้แก้ security architecture
- **ไม่ deploy จนรู้ pipeline จริง:** merge-ready กับ deployed เป็นคนละสถานะ ต้องมี G7 ก่อนแตะ environment ภายนอก
