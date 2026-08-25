# 🤖 CLAUDE.md — Master Project Context & AI Coding Guidelines

> **Project:** E-CMIS Activity 7 — การประชุมคณะกรรมการ ป.ป.ท. และการออกคำสั่ง ม.๒๔ / รายงานวินิจฉัยชี้มูล (Meeting & Resolution Management System)  
> **Repository:** `PhuriphatTyPeZ3r0/e-cmis-a7-demo`  
> **Tech Stack:** Vanilla JavaScript (ES6+), Bootstrap 5.3.3, Font Awesome 6.5.2, SweetAlert2, Supabase JS Client, HTML5, CSS3 (No Node/Build bundler required, static web application).  
> **Knowledge Base:** Obsidian Vault `E-CMIS-Mockup-7` (`C:\Users\iznamu\OneDrive\Documents\Obsidian Vault\E-CMIS-Mockup-7\`)

---

## ⚡ 1. Daily Development Commands (คำสั่งที่ใช้งานประจำ)

```bash
# 1. ติดตั้งระบบ Pre-commit Hook ลงในเครื่อง (รันครั้งแรกเพียงครั้งเดียว)
npm run setup

# 2. ตรวจสอบความถูกต้องและคุณภาพโค้ดทั้งระบบ (5 ด่าน)
npm test
# หรือ
npm run check

# 3. ซิงค์หน้าจอ Root ไปยัง /res/ อัตโนมัติพร้อมแปลง Asset Path
npm run sync

# 4. บันทึก Commit (Git Pre-commit Hook จะทำงานอัตโนมัติ)
git add .
git commit -m "feat(module): message"
```

---

## 🏛️ 2. Project Architecture & Dual-Route Pattern

The project uses a **Dual-Routing Architecture**:
1. **Root Directory (`/`):** Standard web entry point (e.g. `inbox.html`, `board-resolution.html`, `resolution-72.html`). Asset paths use `assets/...`.
2. **Mirror Directory (`/res/`):** Nested route mirror for backward-compatible routing (e.g. `res/inbox.html`, `res/resolution-72.html`). Asset paths use `../assets/...`.

### 🧠 Core Architecture Services:
- `assets/ecmis-app.js`: Global state, Role definitions, RBAC Page Guard, Header/Sidebar Shell rendering, Supabase client singleton, and UI Components.
- `assets/ecmis-app.css`: Primary styling, badges (`.meet-badge`), and document styling (`.doc-paper`).
- `assets/a4-ecmis-workspace.css`: Two-pane Document Workspace layout (Left: Form/Data, Right: A4 Document Preview).
- `assets/agenda-registry-data.js`: Agenda and Meeting registry mock data store.
- `scripts/ci-check.js`: 5-layer CI verification engine (Syntax, Dual-Route 33 pages, Zero-404 Links, Anti-Regression, A4 Layout).
- `scripts/auto-sync-res.js`: Automated mirroring from Root to `/res/`.

---

## ⛔ 3. The 6 Golden Anti-Regression Rules (กฎเหล็กข้อห้ามเด็ดขาด)

All AI agents and developers **MUST ALWAYS** obey these 6 rules:

1. **❌ Never Remove the "ประเภทเรื่อง" (Case Type) Column:**  
   Tables in `inbox.html`, `res/inbox.html`, and `resolution-inbox.html` **MUST have 7 columns** with column 3 being `<th>ประเภทเรื่อง</th>` (`ไต่สวนเบื้องต้น`, `วินิจฉัยชี้มูล`, `เรื่องทั่วไป`).
2. **❌ Never Expose `agenda-registry.html` to `chairman` (ประธาน ป.ป.ท.) or `affairs`:**  
   The Chairman only reviews and orders agendas via `inbox.html` and `chairman-agenda.html`.
3. **❌ Never Call `supabase.createClient()` Directly in Page Scripts:**  
   **MUST** call through the Singleton `ECMIS.getSupabaseClient(url, key)` to prevent multiple GoTrueClient instances and memory leaks.
4. **❌ Never Edit Only Root or Only `/res/`:**  
   Always run `npm run sync` after editing Root HTML files so `/res/` is synchronized 100%.
5. **❌ Never Alter Government A4 Geometry Standards:**  
   - Margin/Padding: `padding: 15mm 15mm 18mm 20mm` across Screen, Print (`@media print`), and Pagination Probe.
   - Secret Footer: `position: absolute; bottom: 8mm; color: #b91c1c; font-weight: 700; font-size: 18pt; text-align: center;`.
   - Typography: Thai Sarabun `16pt` with `line-height: 1.25` for single spacing.
6. **❌ Never Bypass Pre-commit Hooks (`--no-verify`):**  
   All commits must pass the 5-layer CI checks.

---

## 📑 4. Resolution Categorization & 6 Real PACC Templates Matrix

The system classifies resolutions into 3 main groups (`7.1`, `7.2`, `7.3`) mapping directly to **6 official PACC DOCX templates**:

| Case Type | Subtype / Official Workflow | Official DOCX Template | Agenda No. | Target UI Route | Mock Case IDs |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **7.1 ไต่สวนเบื้องต้น** | **1. เสนอตรงผ่านเลขาธิการ ป.ป.ท.** | `มติการประชุม ไต่สวนเบื้องต้น.docx` | วาระที่ ๕ (เช่น 5.9) | `board-resolution.html` | `1547/2568` |
| **7.1 ไต่สวนเบื้องต้น** | **2. ผ่านคณะอนุกลั่นกรอง คณะที่ ๑ - ๘** | `มติการประชุม ผ่านอนุกลั่นกรองคณะฯ.docx` | วาระที่ ๕ (เช่น 5.6) | `board-resolution.html` | `0807/2568`, `1525/2558` |
| **7.2 วินิจฉัยชี้มูล** | **3. กรณีชี้มูลความผิด (ม.72)** | `มติการประชุม ไต่สวน กรรีชี้มูลความผืด.docx` | วาระที่ ๕/๖ (เช่น 5.4) | `resolution-72.html` | `1396/2564`, `100175/2563` |
| **7.2 วินิจฉัยชี้มูล** | **4. กรณีไม่ชี้มูล / ทำเพิ่ม / ข้อกล่าวหาตกไป** | `มติการประชุม ไต่สวน กรณี ไม่ชี้มูล-ทำเพิ่ม.docx` | วาระที่ ๕/๖ (เช่น 5.7) | `resolution-72.html` | `1855/2568`, `1119/2565` |
| **7.3 เรื่องทั่วไป/กกม.** | **5. เรื่องของ กกม. (อุทธรณ์/ฎีกา/อสส. ม.43)** | `มติการประชุม เรื่องของ กกม.docx` | วาระที่ ๓ (เช่น 3.2) | `board-resolution.html` | `กจ.102/2569` |
| **7.3 เรื่องทั่วไป/กกม.** | **6. เรื่องทั่วไป (นโยบาย/บริหาร/แต่งตั้ง)** | `มติการประชุม เรื่องทั่วไป.docx` | วาระที่ ๓ (เช่น 3.1) | `board-resolution.html` | `กจ.103/2569` |

---

## 👥 5. User Roles & RBAC Page Guard (`PAGE_PERMISSIONS`)

Primary user roles in `ECMIS.ROLES`:
- `secgen`: เลขาธิการ ป.ป.ท. (Home: `inbox.html`)
- `support_sub`: อนุกรรมการสนับสนุนและกลั่นกรองฯ (Home: `support-subcommittee-inbox.html`)
- `chairman`: ประธาน ป.ป.ท. (Home: `inbox.html`, orders via `chairman-agenda.html`)
- `board_sec`: ฝ่ายเลขานุการ กก.ป.ป.ท. / กบค. (Home: `agenda-registry.html`, handles `resolution-inbox.html`)
- `board`: กรรมการ ป.ป.ท. (Home: `board-inbox.html`, attends `board-room.html`)
- `affairs`: กลุ่มงานประชุมและประสานมติ (Home: `inbox.html`, handles drafting)

Unauthorized access automatically redirects to `ECMIS.homeHref(role.id)` with a Toast notification.

---

## 🎨 6. UI & Component Standards

1. **Document Toolbar (`ws-doc-toolbar`):**  
   Always rendered via `ECMIS.renderDocToolbar()`. Features:
   - Normalized single button for **"พิมพ์/PDF"** (triggers preview modal with `html2pdf.js`).
   - Word download button (`.docx`).
   - Rich Text editor button.
   - Document pane toggle button.
2. **Back Navigation Breadcrumb:**  
   Always placed above `<h1>` in `.page-head` using `ECMIS.renderBackButton()`.
3. **Dynamic Auto-Pagination Engine:**  
   `ECMIS.paginateDoc()` calculates element heights into atomic blocks and creates seamless multi-page flows keeping headers, footers, and page numbers compliant.

---

## 📚 7. Obsidian Vault Architecture Documentation
For deep context, refer to the following notes in `C:\Users\iznamu\OneDrive\Documents\Obsidian Vault\E-CMIS-Mockup-7\`:
- `00 - ภาพรวมระบบและสถาปัตยกรรม (System Architecture).md`
- `01 - มาตรฐาน Component กลาง (UI & Toolbar Standards).md`
- `02 - สิทธิ์การใช้งานและระบบป้องกัน (Roles, RBAC & Page Guard).md`
- `03 - Git Workflow และข้อห้ามเด็ดขาด (Anti-Regression Rules).md`
- `04 - บันทึกการตัดสินใจทางสถาปัตยกรรม (Architecture Decision Records - ADR).md`
- `05 - โครงสร้างและแม่แบบมติการประชุม (Resolution Templates & Data Mapping).md`
