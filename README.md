# E-CMIS Activity 7 Demo

Static HTML/JS prototype of Activity 7 (กิจกรรมที่ 7 — การพิจารณาสั่งการ กลั่นกรอง และบรรจุวาระของคณะกรรมการ ป.ป.ท.) for E-CMIS, the case management system for สำนักงาน ป.ป.ท. Front-end only, backed optionally by Supabase, with mock data as a fallback.

## Quick start

```
python server.py
```

Then open `http://localhost:8000/`. The server serves clean URLs (`/login` resolves to `login.html`, `/res/chairman` to `res/chairman.html`, etc.) and disables caching so edits show up on refresh.

## Demo accounts

Login accepts any password — only the username below needs to match. Pick one to see that role's view:

| Username     | Role                                              |
|--------------|----------------------------------------------------|
| `Apichat.S`  | เลขาธิการคณะกรรมการ ป.ป.ท. (secgen)                |
| `Jiraporn.N` | อนุกรรมการสนับสนุนเลขาธิการฯ (support_sub)          |
| `Wichai.Y`   | ประธานกรรมการ ป.ป.ท. (chairman)                    |
| `Thanakrit.B`| เจ้าหน้าที่กลุ่มงานคำวินิจฉัยและมติคณะกรรมการ (board_sec) |
| `Somboon.T`  | กรรมการ ป.ป.ท. (board)                             |
| `Siriporn.K` | เจ้าหน้าที่กลุ่มงานกิจการคณะกรรมการ (affairs)        |

Switch roles anytime from the sidebar's user chip without logging out.

## Structure

- `index.html`, `login.html` — public landing page and login, live at the project root
- `res/` — the actual application, 20 pages (work inbox, case review, screening, chairman order/sign, board resolution, meeting docs, ม.24 orders, ruling reports, dashboards, ...)
- `assets/` — shared `ecmis-app.js` (roles, status/workflow state machine, permissions, shared UI helpers), `ecmis-model.js`, styles, fonts, and the mail-merge `.docx` templates used by document generation
- `outputs/` — generated build/design artifacts, not hand-edited

## Tech stack

Bootstrap 5.3.3, FontAwesome 6.5.2, SweetAlert2, jQuery — all loaded from CDN, no build step. `assets/ecmis-app.js` is the single source of truth for roles, case statuses, the status-transition table, and page routing; every page in `res/` includes it and calls `ECMIS.renderShell(...)` to render the shared topbar/sidebar.

## Data

Pages try Supabase first (`tbl_res_request` → `tbl_cmp_case` → `tbl_cmp_case_accused`) and fall back to the mock `ECMIS.CASES` dataset in `ecmis-app.js` if the fetch fails or returns nothing — so the demo works fully offline.
