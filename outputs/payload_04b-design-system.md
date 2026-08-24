# Sub-Agent 4 Output (Follow-up) — PDF Design System Extraction & Application

Generated 2026-08-05. Branch: `Mock-up-7` (working tree, uncommitted).

## 0. Method

Figma MCP was not used for this pass — the user instead exported the design system as 37 static
PDFs (one per component + 3 master layouts + `E-CMIS.pdf`, the master style-guide sheet) to
`C:\6_Working\PMO1-03-08-2026\E-CMIS\diagram\Activity 7\`. The PDF text layer does not carry the
swatch colors, so each PDF was rendered to PNG with PyMuPDF (`fitz`, already available in this
Python environment — `pdftoppm`/poppler is not installed here) and read as an image. For the token
sheet specifically, colors were **not** eyeballed: a small Python/Pillow script averaged pixel RGB
under each swatch's known grid position and printed exact hex, so the values below are sampled, not
estimated. Typography values (24/32, 20/28, etc.) were read directly off the PDF's own labels.

Reviewed: `E-CMIS.pdf` (full token/typography panel + sidebar/header/modal/badge/table/pagination/
date-picker/file-uploader usage samples), `Master Screen Layout Desktop/Tablet/Mobile.pdf`,
`Button`, `ModalDialog`, `InlineAlert`, `Toast`, `Pagination`+`PageButton`+`NextButton`+`PrevButton`,
`Sidebar`, `Header`, `TabItem`+`Tabs`, `TextInput`, `Select`, `Checkbox`+`CheckboxField`,
`Radio`+`RadioField`, `Textarea`, `SearchInput`, `FilterBar`, `DataGridContainer`, `SummaryCard`,
`DatePicker`, `FileUploader` (all "high-traffic" tier), plus `Avatar`, `DropdownTrigger`,
`NotificationBadge`, `NotificationDot`, `ProgressBar`, `Loading Spinner`, `Tooltip` (lower-traffic
tier, lighter pass as the task allowed).

## 1. Token Table

All values are **sampled hex**, not hand-picked. "Where used" = the `ecmis-app.css` selector(s)
now wired to that token; `--ecmis-*` = pre-existing variable kept as an alias (see §3).

| Token | Value | Where used in `ecmis-app.css` |
|---|---|---|
| `bg/surface` | `#FFFFFF` | `.card-ecmis`, `.app-topbar`, dropdown-trigger, table rows |
| `bg/surface-hover` | `#F4F8FD` | `.role-switcher .btn:hover`, `.pagination-ecmis .page-btn:hover`, `table.tbl-ecmis tbody tr:hover` (=`table/row-hover`) |
| `bg/page` | `#EDF2FB` | `--ecmis-bg` (page background), `.card-ecmis > .card-header` |
| `bg/surface-subtle` | `#E6EDF6` | `.chip`, `.no-permission`, `.sig-box`, `.app-topbar #sbToggle`, `.avatar-ecmis`, `.tabs-ecmis`, `.progress-ecmis` track |
| `bg/overlay` | `#D2D5D9` | defined, not yet consumed (no modal-backdrop override needed — Swal2 ships its own) |
| `text/inverse` | `#FFFFFF` | `.btn-navy`, sidebar nav text base |
| `text/primary` | `#0F2A62` | `--ecmis-navy` alias, `.page-head h1`, `.case-no`, headings |
| `text/strong` | `#3D495E` | `--ecmis-ink` alias, body text, `.tooltip-ecmis` bg, table header text |
| `text/body` | `#526075` | `.page-head .sub` fallback, `.btn-outline-secondary` |
| `text/disabled` | `#7C8CA3` | `--ecmis-muted` alias, `.kv .k`, `.action-bar .role-hint` |
| `text/link` | `#0A7295` | defined; no plain-text link component in current markup to attach it to yet |
| `border/control` | `#7C8CA3` | `.form-control`, `.form-select`, `.sig-box`, `.dropdown-trigger-ecmis` |
| `border/control-hover` | `#6B7990` | `.form-control:hover`, `.role-switcher .btn:hover` |
| `border/control-active` | `#526075` | defined, available for pressed-state form controls |
| `border/focus` | `#0E91BC` | `.form-control:focus`, `.form-check-input:focus` (paired with `accent/brand` glow) |
| `border/divider` | `#D4DDEB` | `--ecmis-line` alias, `.card-ecmis`, `.app-topbar` border-bottom |
| `action/primary` | `#0F2A62` | `--ecmis-navy` alias — **near-identical to the old hand-picked `#0a2647`**, so the navy brand survives essentially unchanged |
| `action/primary-hover` | `#0C2150` | `--ecmis-navy-2` alias |
| `action/primary-active` | `#081638` | `--ecmis-navy-dark` alias, sidebar gradient dark end |
| `action/danger` | `#DB2626` | `--ecmis-red` alias — **brighter than the old `#a5322a`** |
| `action/danger-hover` | `#B81C1C` | `.btn-outline-danger:hover` |
| `action/danger-active` | `#991A1A` | `feedback/danger-text` reuse |
| `action/disabled-bg` | `#D4DDEB` | defined for future disabled-button styling |
| `action/disabled-text` | `#526075` | defined for future disabled-button styling |
| `accent/brand` | `#16B6E6` (cyan) | focus-ring glow color, `feedback/info-fill` |
| `accent/emphasis` | `#0E91BC` (teal) | `border/focus` |
| `accent/gold` (not in PDF's own "Accent" row — see note) | `#D0A830` | `--ecmis-gold` alias, sidebar active nav item + wordmark subtitle + `.btn-gold` + `.action-bar` top border |
| `feedback/success-bg/fill/icon/text` | `#DBFBE6` / `#1FB65E` / `#16994D` / `#166434` | `.st-done`, `.sla-ok`, `.rule.pass`, `.autofill-tag`, `.sig-box.signed`, Swal success toast |
| `feedback/warning-bg/fill/icon/text` | `#FDF2C6` / `#DD8C0A` / `#B35208` / `#854D0E` | `.st-pending`, `.sla-warn`, `.mergefield`, Swal warning toast |
| `feedback/danger-bg/fill/icon/text` | `#FDE2E2` / `#DB2626` / `#DB2626` / `#991A1A` | `.st-urgent`, `.st-returned`, `.sla-late`, `.is-invalid-ecmis`, `.mergefield.empty`, Swal error toast |
| `feedback/info-bg/fill/icon/text` | `#E4F6FD` / `#16B6E6` / `#0E91BC` / `#0A7295` | `.st-review`, Swal info toast |
| `table/row-bg` | `#FFFFFF` | `table.tbl-ecmis` base |
| `table/row-hover` | `#F4F8FD` | `table.tbl-ecmis tbody tr:hover` |
| `table/header-bg` | `#EDF2FB` | `table.tbl-ecmis thead th` — **was solid navy w/ white text, now light per DataGridContainer.pdf** |
| `table/row-selected` | `#E4F0FB` | `table.tbl-ecmis tbody tr.selected` (new, no current consumer) |
| `table/border` | `#D4DDEB` | `table.tbl-ecmis` cell/header borders |

**Gold isn't a cataloged token.** `E-CMIS.pdf`'s own "Accent" row only has `brand` (cyan) and
`emphasis` (teal) — no gold. But `Sidebar.pdf` unambiguously uses a gold/amber color
(pixel-scanned, not guessed: dominant non-anti-aliased pixel = `rgb(208,168,48)` = `#D0A830`) for
the sidebar wordmark subtitle "สำนักงาน ป.ป.ท.", the active-nav-item text/icon, and the collapsed
active-icon highlight. Per the task's instruction to keep navy/gold branding if the swatches
actually show it, I kept gold as its own `--accent-gold` token — sourced from a real, repeated
color in the source files, just not filed under "Accent" in the token sheet. `--ecmis-gold` now
aliases to it (`#D0A830` vs the old hand-picked `#c9a227` — very close).

## 2. Typography Scale (`E-CMIS.pdf`, all Noto Sans Thai)

| Style | Size/Line-height | Weight | Applied as |
|---|---|---|---|
| Heading 1 | 24/32 | Bold | `--text-h1-size/-lh`, `.page-head h1` |
| Heading 2 | 20/28 | Bold | `--text-h2-size/-lh`, `.swal2-title` |
| Body Medium | 14/22 | Regular | `--text-body-md-size/-lh`, `.swal2-html-container` |
| Body Small | 12/20 | Regular | `--text-body-sm-size/-lh`, `.page-head .sub` |
| Meta Medium | 14/20 | Regular | `--text-meta-md-size/-lh` (defined, not yet attached) |
| Meta Small | 12/16 | Regular | `--text-meta-sm-size/-lh` (defined, not yet attached) |
| Table Header | 12/20 | Bold | `--text-table-header-size/-lh`, `table.tbl-ecmis thead th` |

**Font swap:** the PDF uses **Noto Sans Thai** for everything, including headings — the mockup
previously used `Prompt` (body) + `Noto Serif Thai` (headings/card headers). `--serif` now aliases
to `--font-sans` (Noto Sans Thai), and the Google Fonts `<link>` in all 11 screens was updated from
`family=Noto+Serif+Thai` to `family=Noto+Sans+Thai`. **Exception, intentional:** `.doc-paper` (the
simulated printed government document — reports, orders, resolutions) keeps `Noto Serif Thai`
directly, since it's imitating an actual printed paper document, not the app's UI chrome that this
type scale governs.

## 3. Layout Metrics (`Master Screen Layout Desktop.pdf`)

| Metric | PDF value | Old value | New CSS var |
|---|---|---|---|
| Sidebar width (expanded) | 260px | 264px | `--sidebar-w` |
| Sidebar width (collapsed) | 68px | *(no collapse existed)* | `--sidebar-w-collapsed` (defined; collapse **interaction** deferred — see §5) |
| Header height | 64px | 60px | `--topbar-h` |
| Main content width | 1180px | *(unbounded)* | `--content-max-w` |

## 4. Components — Fully Applied vs. Deferred

### Applied (foundation + high-traffic)
- **Tokens & typography** — full `:root` rewrite, all 32 sampled tokens + 7-step type scale, `--ecmis-*` legacy variables re-pointed onto them (see mapping table above) so every existing class keeps working.
- **Header (`Header.pdf`)** — corrected from a navy gradient bar to the PDF's actual **light** header (white bg, thin divider, 64px), navy text/icons. DOM unchanged (brand link, bell, role-switcher).
- **Sidebar (`Sidebar.pdf`)** — dark navy gradient (was flat white), white nav text/icons, gold active-item + wordmark subtitle, 260px width.
- **Buttons (`Button.pdf`)** — 10px radius, `.btn-navy` on `action/primary` + hover/active states, `.btn-outline-danger/-primary/-secondary` recolored.
- **Modal (`ModalDialog.pdf`)** — SweetAlert2 overrides: 20px radius, navy bold title (Noto Sans Thai, H2 scale), navy filled confirm + outline cancel, matching input styling. This hits **every** action-bar interaction on **every** screen since Swal is the app's only dialog mechanism.
- **Toast (`Toast.pdf`)** — Swal toast severity backgrounds now match the PDF's full-pastel-bg pattern per type (success/warning/danger/info), not a neutral white toast.
- **Status badges / SLA pills (`InlineAlert.pdf` color pairing)** — `.st-*`, `.sla-*` remapped to `feedback/*` bg+text pairs.
- **Forms (`TextInput`, `Select`, `Checkbox`, `Radio`, `Textarea`, `SearchInput`, `FilterBar`, `DropdownTrigger`)** — 10px radius, `border/control` border, **cyan focus ring** (was gold — this is a real, well-evidenced correction: every one of these 7 sheets shows a cyan/teal focus/selected state, never gold), checked-state fill on `action/primary`.
- **Table (`DataGridContainer.pdf`)** — header corrected from solid-navy/white-text to the PDF's light `table/header-bg` + bold dark text; row hover/border/selected wired to the `table/*` tokens.
- **Tags/chips, mergefield highlighting, rule-panels, sig-box, autofill tags** — all recolored onto `feedback/*` tokens.
- **New, documented, unused-for-now classes** (task explicitly allows this for components with no current markup consumer): `.inline-alert-*` (`InlineAlert.pdf`), `.avatar-ecmis` (`Avatar.pdf`), `.tooltip-ecmis` (`Tooltip.pdf`), `.progress-ecmis` (`ProgressBar.pdf`), `.spinner-ecmis` (`Loading Spinner.pdf`), `.notif-badge`/`.notif-dot` (`NotificationBadge/Dot.pdf`), `.pagination-ecmis` (`Pagination`+`PageButton`+`NextButton`+`PrevButton.pdf`), `.tabs-ecmis`/`.tab-item` (`Tabs`+`TabItem.pdf`), `.dropdown-trigger-ecmis` (`DropdownTrigger.pdf`).
- **Inline hex alignment** — 73 hardcoded hex literals across 10 of the 11 HTML files (KPI colors, Swal `confirmButtonColor`, inline `style="color:#..."`) were mechanically remapped to the *same* new values their corresponding CSS variable now holds (e.g. every literal `#a5322a` → `#DB2626`, matching the new `--ecmis-red`), so JS-generated content stays visually consistent with the CSS everywhere, not just where a class is used.

### Deferred (documented, not applied)
- **Sidebar collapse interaction** — `--sidebar-w-collapsed:68px` token exists, but wiring an actual collapse toggle is a JS/structural change beyond a CSS pass; `renderShell()` in `ecmis-app.js` was left untouched.
- **Header search bar / dark-mode toggle / avatar-with-dropdown** — `Header.pdf` shows these three extra elements; the current `renderShell()` topbar markup doesn't have them. Adding them would mean new interactive DOM + JS wiring (real search logic, a working dark/light toggle beyond the existing `body.dark-mode` class, an avatar menu), which is outside "restyle existing markup." Only the *existing* topbar elements (brand, bell, role-switcher) were restyled.
- **`DatePicker.pdf` custom calendar popover, `FileUploader.pdf` custom dropzone widget** — both PDFs show bespoke popovers with real interaction logic (month navigation, drag-drop). No screen currently instantiates a custom calendar or dropzone (forms use plain `<input>` / native controls), so building the full widget was out of scope; only shared `.form-control` radius/border/focus styling applies to whatever native inputs exist today.
- **`Pagination`/`PageButton`/`NextButton`/`PrevButton`** — classes defined (`.pagination-ecmis`), but **zero screens in `activity7/` currently render a paginated list** (every table shows its full row set), so there was no markup to restyle. Nominally "high-traffic" per the design system, effectively zero-traffic in this mockup today.
- **`Avatar`, `Tooltip`, `ProgressBar`, `Loading Spinner`, `NotificationBadge/Dot`, `DropdownTrigger` as standalone elements** — same reasoning: classes exist and are documented, not force-inserted into a page with no use case.
- **Long tail of one-off pale background tints** (e.g. `#fdf3e2`, `#fdecea`, `#eef3f9`, `#f4f0fa`, `#fbf9f3`, `#dcd8cc` and similar decorative/hover-state hex scattered in a handful of spots) were **not** individually remapped — only the 10 high-frequency, semantically-unambiguous brand colors (red/navy/navy-2/navy-dark/info-blue/warn-amber/ok-green/gold/muted-gray/tan-border) were mechanically substituted. The long tail is low-impact (subtle background tints, not brand-identity colors) and doing a fully manual per-instance audit across 11 files wasn't a good use of the remaining pass given the task's explicit "don't need pixel-perfect fidelity" allowance.
- **`.law-note` / `.warn-note`** — these are still `display:none !important` (set by an earlier content-cleansing pass on this same branch, before this task started). That's an editorial decision outside this task's scope (visual/styling alignment, not content decisions), so it was left as-is; only the *color values* those rules would use if re-enabled were kept consistent with the new tokens.

## 5. Git / Branch Status

- Branch `Mock-up-7`, no git commands beyond `status`/`diff`/`log` were run this task — no add/commit/push.
- `git status --short` at the end of this task:
  ```
   M activity7/01-work-inbox.html
   M activity7/02-case-register.html
   M activity7/03-report-213.html
   M activity7/04-approval-review.html
   M activity7/05-urgent-memo.html
   M activity7/06-chairman-agenda.html
   M activity7/07-subcommittee-screening.html
   M activity7/08-board-resolution.html
   M activity7/09-order-m24.html
   M activity7/10-user-permissions.html
   M activity7/11-secgen-desk.html
   M activity7/assets/ecmis-app.css
  ```
  Nothing outside `activity7/` was touched (`docs/`, `outputs/` other than this new report, `scripts/`, `tests/` are untouched).
- **Mid-task interruption note:** this run was resumed after a transient API stream stall. On resume, `ecmis-app.css` was re-read from disk and confirmed syntactically complete (brace-balance checked programmatically: depth 0 at EOF, both before and after the remaining edits) — nothing was duplicated or left half-written. Separately, between the *original* Sub-Agent 4 pass (ม.28 selector / Assign action / sequential e-signature) and this design-system pass, an unrelated `git pull --ff` landed two new upstream commits on this branch (visible in `git log`/`reflog`) that already carried equivalent HTML/JS content — that's why `git status` shows only CSS as new/modified going into this task; it is not a sign of lost work (verified: `sequentialSignDialog`, the `m28Card` selector, and the `data-assign`/`data-return` quick actions are all still present in the current files).
- Regression check: `node --test activity7/tests/*.test.mjs` — both `resolution-rules.test.mjs` (53 assertion groups) and `secgen-rules.test.mjs` still pass. `ecmis-app.css` brace-balance verified programmatically (0 at EOF). All 11 HTML files' inline `<script>` blocks re-verified with `new Function(...)` after the hex-literal remap — no syntax errors introduced.

## 6. Source Files Changed

- `activity7/assets/ecmis-app.css` — full token/typography rewrite (§1–§2), topbar/sidebar restyle, buttons/forms/table/badges/chips/sig-box recolor, new SweetAlert2 modal+toast overrides, new documented-but-unused component classes (§4).
- `activity7/01-work-inbox.html` through `activity7/11-secgen-desk.html` (all 11) — Google Fonts `<link>` swapped from `Noto+Serif+Thai` to `Noto+Sans+Thai`; hardcoded brand hex literals (red/navy/info/warn/ok/gold/muted/tan-border — 73 instances across 10 files) remapped to match the new CSS token values. No markup structure, IDs, JS logic, or Thai copy was changed.
