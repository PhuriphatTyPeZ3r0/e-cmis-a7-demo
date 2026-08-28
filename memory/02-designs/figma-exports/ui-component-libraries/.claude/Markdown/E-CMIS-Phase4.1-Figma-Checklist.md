# 🛠 Figma Maker Checklist — E-CMIS Phase 4.1
### Data Grid & Filters — Reusable Blocks Only

**Source of truth:** `.claude/Markdown/E-CMIS-Phase4.1-DataGrid-Spec.md` (FINAL — D1–D5 ratified)
**Token authority:** `.claude/Markdown/E-CMIS-Design-Foundation-v2.0.md`
**Scope boundary:** This checklist stops at reusable primitives. **Do not assemble the full 10-column Digital Signature `DataGrid` this round** — that is Phase 4.1 §6.3 step 7, deliberately deferred to its own future pass.
**Build order:** 4A Icons → 4B TableCell primitives → 4C Pagination → 4D FilterBar base.

---

## §0 — PRE-FLIGHT

### 0.1 What already exists — reuse, do not rebuild

| Component | Node ID | Reused by |
|---|---|---|
| `Icon/16` set (30 glyphs) | `618:2` | 4A adds 5 more into this same folder |
| `Button` (27-variant set) | `638:18` | `ExportButton` (4D) instances `variant=secondary, size=md` |
| `Checkbox` (6-state set) | `632:29` | `HeaderCell/Checkbox` and row checkboxes (out of scope this round — deferred with the full grid) |
| `elevation/sm`, `elevation/md`, `elevation/lg` | Effect Styles | `PageButton[current]` does **not** use one (§3.2 of spec — deliberate); `DropdownTrigger[open]` panel uses `elevation/md` |
| `ModalDialog`'s `CloseButton` pattern | `641:18` subtree | `Pagination`'s `PrevButton`/`NextButton` reuse this exact 32×32 icon-hit-area shape |

### 0.2 What this checklist depends on that does NOT exist yet

> **WARNING: `Chip/Status` is not built.** `Cell[type=badge]` (Ticket 4B) can only be built as an **empty slot frame** ready to receive a `Chip/Status` instance later — it cannot be fully populated this round. This is expected, not a blocker; noted at the relevant step.

### 0.3 Ordering gate

- [ ] **Ticket 4A** — 5 new icon glyphs. *(Everything else instances them.)*
- [ ] **Ticket 4B** — `HeaderCell` + `Cell` primitives.
- [ ] **Ticket 4C** — `Pagination` (`RowsPerPage` built as a stub — see 4C step 5).
- [ ] **Ticket 4D** — `FilterBar` base, including `DropdownTrigger`.
- [ ] **Ticket 4C.1** — return to `Pagination` and wire the real `DropdownTrigger` instance into `RowsPerPage`. *(Cannot happen until 4D is done — this is the resolved sequencing conflict; see the note at the top of this document.)*

---

## §1 — Ticket 4A: Import the 5 New Icon Glyphs

**Source:** `bootstrap-icons@1.11.3`, already fetched and verified (Phase 4.1 spec §6.1) — `chevron-down`, `chevron-up`, `chevron-expand`, `download` (2 paths, needs flattening), `search`. All confirmed `viewBox="0 0 16 16"`.

Same mechanism as the original 30-glyph build — **only `Icon/16` this round.** Nothing in Phase 4.1 calls for these at any other size; do not pre-derive `Icon/20`/`24`/etc. speculatively.

#### Per icon

- [ ] **`F`** → frame `16 × 16`, **Fixed × Fixed**. **No auto-layout.**
- [ ] Paste the SVG. Flatten to **exactly one** vector layer. **`Ctrl+R`** → rename it `vector`.
- [ ] Give `vector` **one solid fill**.
- [ ] **`Ctrl+Alt+K`** → name it the bare glyph name, e.g. `bi-chevron-down`.
- [ ] Place it in the existing `Icon/16/` folder (same folder as the other 30 — do **not** create a new folder).
- [ ] Bind width **and** height to `size/icon/sm`.

| Glyph | Special handling |
|---|---|
| `bi-chevron-down` | none |
| `bi-chevron-up` | none |
| `bi-chevron-expand` | none |
| `bi-download` | 🔴 **2 paths in the source SVG.** Select both, **flatten before** naming the layer `vector` — same step used for `bi-eye-slash`, `bi-trash`, `bi-calendar3`, `bi-arrow-clockwise` etc. in the original build. If you skip this, the component will have 2 vector children instead of 1, and every fill-override script written against this icon set assumes exactly one. |
| `bi-search` | none |

- [ ] ✅ **Verify count:** `Icon/16` folder now holds **35** components (30 original + 5 new).

---

## §2 — Ticket 4B: TableCell Primitives

### 2.1 `HeaderCell` — component set

**Scope decision, flagged:** the full property matrix is `sort × align` = 4 × 3 = 12 cells. Following the same "build the core, flag the rest" discipline already used for `Button` (27 of 72 cells), **this ticket builds the 4 `sort` states at `align=left` only** — the majority case. `align=right`/`center` are structurally identical with the icon and text order mirrored; build them as a follow-up once a real numeric/date column needs one, rather than speculatively now.

#### Step 1 — the base cell

- [ ] **`F`** → **`Shift+A`** → **Horizontal** · **`Fixed × Fill`** · gap **`--space-1`** (4) bound.
- [ ] Padding: vertical **`--space-3`** (12) bound, horizontal **`--space-4`** (16) bound.
- [ ] Label: **`table/header`** style — **12px / 20px line-height / 600 weight (Sarabun SemiBold)**. Fill bound **`text/strong`**.
- [ ] ⛔ **No `text-transform: uppercase`.** Thai has no case; this was explicitly rejected in the original audit. Leave the label exactly as typed.
- [ ] ✅ **Height must read `44`.** `12 + 20 + 12 = 44`. Leave height on **Hug** — do not type `44`.

#### Step 2 — the 4 `sort` variants

- [ ] **`Ctrl+Alt+K`** → **Properties → `+` → Variant** → name **`sort`**, value `unsortable`.
- [ ] **`Ctrl+D`** ×3 → `none`, `asc`, `desc`.

| `sort` | Icon | Icon colour | Visibility |
|---|---|---|---|
| `unsortable` | — | — | icon hidden |
| `none` | `bi-chevron-expand` | `text/disabled` | visible |
| `asc` | `bi-chevron-up` | `text/primary` | visible |
| `desc` | `bi-chevron-down` | `text/primary` | visible |

- [ ] Icon sits **right of the label**, 16px, instance of the matching `Icon/16` component from Ticket 4A.
- [ ] Add a fixed **`align`** value (not yet a variant axis) — the label is left-aligned within the cell. Note in the component **Description**: *"align=right/center not yet built as variant values — same 4 sort states, icon position mirrors to the left of the label when built."*

### 2.2 `Cell` — component set

7 `type` values, per the spec's structural blueprint. Each type has a genuinely different internal tree — that's expected, not a modeling error.

- [ ] **Properties → `+` → Variant** → name **`type`**, value `text`. Build, then **`Ctrl+D`** ×6 for the remaining types.

| `type` | Internal structure | Notes |
|---|---|---|
| `text` | Single text node, `table/cell` (14/22/400), fill `text/body` | Default |
| `twoLine` | Vertical AL, gap `--space-1` (4): primary line `table/cell` + `text/primary`, secondary line `meta/md` + `text/body` | e.g. name + username |
| `code` | Single text, `table/cell`, `tabular-nums`, `align=right` | Certificate serials, IDs |
| `date` | Single text, `table/cell`, `tabular-nums`, `align=right` | |
| `number` | Single text, `table/cell`, `tabular-nums`, `align=right` | |
| `badge` | 🔴 **Empty slot frame only** — `Hug × 32`, no content | `Chip/Status` doesn't exist yet (§0.2). Leave a clearly-named empty frame `ChipSlot` ready to receive an instance later. **Do not fake a badge with ad-hoc colors** — that would just recreate the exact "invented token" problem this whole system was built to eliminate. |
| `actions` | Horizontal AL, `align=right`, empty slot for future `Button[ghost, sm]`/overflow-menu instances | Also a slot — the specific actions are per-activity, out of scope here |

- [ ] All 7 variants: **Fixed × Fill** width (each will be bound to a per-activity `table/col/*` variable when actually used in a real grid — leave width unbound-Fixed at a placeholder `160px` for now, since no specific column exists to bind to yet).
- [ ] **`type=code/date/number`**: confirm **`tabular-nums`** is applied — check the text's OpenType features panel, not just visually plausible-looking digits.

---

## §3 — Ticket 4C: Pagination

### Step 1 — `PageButton` component set

- [ ] **`F`** → **`32 × 32`** Fixed × Fixed, AL horizontal center × center, radius bound `radius/lg`.
- [ ] Label: **`table/cell`** weight, **`tabular-nums`**, centered.
- [ ] **`Ctrl+Alt+K`** → variant **`state`**: `default` · `hover` · `current` · `disabled`.

| `state` | Fill | Text |
|---|---|---|
| `default` | transparent | `text/body` |
| `hover` | `bg/surface-hover` | `text/primary` |
| `current` | `action/primary` (solid) | `text/inverse` |
| `disabled` | transparent | `text/disabled` |

- [ ] ⛔ **`current` does NOT get `elevation/sm`.** This is a deliberate deviation from the `Tabs[selected]` pattern — re-read spec §3.2 before "fixing" this to look more like a tab. A solid pill was chosen specifically to avoid the Tabs C6 low-contrast-boundary risk.

### Step 2 — `PrevButton` / `NextButton`

- [ ] Two separate components (not a variant set — they're mirror images, not states of one thing), each **32 × 32**, same construction as `ModalDialog`'s `CloseButton` (`641:18` subtree): transparent fill, centered `Icon/16` instance.
- [ ] `PrevButton` → `bi-chevron-left` (already exists, no new dependency).
- [ ] `NextButton` → `bi-chevron-right` (already exists).
- [ ] Each needs a `disabled` state: icon fill `text/disabled` (3.42 — exempt). **In the eventual Blazor build this uses the real `disabled` HTML attribute, not just a recoloured icon** — note this in each component's Description so it isn't lost between Figma and code.

### Step 3 — `Pagination` container

- [ ] **`F`** → **`Shift+A`** → **Horizontal** · **Fill × Fixed 56** · **Space between**.
- [ ] Padding: horizontal `--space-4` (16) bound. Stroke: top only, 1px `table/border`.
- [ ] `ResultsSummary` — text, `meta/md`, fill `text/body`, literal demo string `"แสดง 1–20 จาก 214 รายการ"` (real Thai numerals/copy, not lorem ipsum).
- [ ] `PageControls` — Horizontal AL, gap `--space-1` (4) bound: `PrevButton` instance → 3–5 `PageButton` instances (mix of `default` and one `current`) → `Ellipsis` (plain text `…`, `meta/md`, `text/disabled`) → `NextButton` instance.

### Step 4 — `RowsPerPage` group (built as a stub)

- [ ] **`F`** → Horizontal AL, gap `--space-2` (8) bound: label text `"แถวต่อหน้า"` (`meta/md`) + **a placeholder frame** named `DropdownTriggerSlot` (bordered rectangle, `border/control`, no real dropdown behavior yet).
- [ ] 🟡 **This is intentionally incomplete.** `RowsPerPage` needs a real `DropdownTrigger` instance, which is built in Ticket 4D — which comes *after* this ticket per your stated priority order. Leaving a bordered slot here, rather than skipping the region entirely, keeps `Pagination`'s layout dimensions correct so nothing shifts when 4C.1 swaps the real component in.

---

## §4 — Ticket 4D: FilterBar Base

### Step 1 — `SearchInput`

- [ ] **`F`** → **`320 × 40`** Fixed × Fixed (`size/control/md`). Stroke 1px `border/control` bound, radius `radius/lg` bound.
- [ ] AL horizontal, center-align, padding horizontal `--space-3` (12) bound, gap `--space-2` (8) bound.
- [ ] `SearchIcon` — `Icon/16/bi-search` instance (built in 4A), fill `text/disabled`.
- [ ] Text layer: `body/md`, placeholder demo copy `"ค้นหาเลขที่คดี, ชื่อผู้ใช้งาน..."`, fill `text/disabled` *(placeholder — see the spec's explicit note that placeholder-only contrast is acceptable here only because a real label/icon accompanies it)*.
- [ ] `ClearButton` — `Icon/16/bi-x-lg` instance (already existed pre-4A), **Boolean property `hasValue`**, hidden by default.
- [ ] Variant **`state`**: `default` (border `border/control`, 3.42) · `focus` (**2-layer `--focus-ring`**, identical construct to `Checkbox`'s focus ring — white spread 2 above `border/focus` spread 5, both `Blur 0`).

### Step 2 — `DropdownTrigger` component set

- [ ] **`F`** → **`Hug × 40`** (`size/control/md`). Stroke 1px bound, radius `radius/lg` bound. AL horizontal center-align, padding horizontal `--space-3` (12) bound, gap `--space-2` (8) bound.
- [ ] Label: `body/md`, `text/primary`, demo copy `"สถานะ: ทั้งหมด"`.
- [ ] `Chevron` — `Icon/16/bi-chevron-down` instance (built in 4A).
- [ ] **`Ctrl+Alt+K`** → variant **`state`**: `default` · `hover` · `open` · `disabled`.

| `state` | Border |
|---|---|
| `default` | `border/control` |
| `hover` | `border/control-hover` |
| `open` | `border/focus` + `--focus-ring` |
| `disabled` | `border/divider` |

- [ ] `open`'s dropdown panel is **out of scope this round** (D3 — deferred to Phase 4.2, per the spec). Do not build a menu; the trigger alone is the deliverable.

### Step 3 — `ExportButton`

- [ ] **Not a new component.** Instance `Button` set (`638:18`) → `variant=secondary, size=md, state=default`.
- [ ] Relabel the instance text to `"ส่งออกข้อมูล"`.
- [ ] 🟡 Composite an `Icon/16/bi-download` instance immediately to its left inside a small wrapping frame (Hug × Hug, gap `--space-2`) — **this is a stand-in, not real icon-slot support.** `Button` has no `iconLeft` property yet (same limitation flagged for `ModalDialog`'s `CloseButton`). Note this composite frame's Description: *"Placeholder pending Button iconLeft/iconRight boolean properties — see Phase 3 Ticket 2A."*

### Step 4 — `FilterBar` container

- [ ] **`F`** → **`Shift+A`** → **Horizontal** · **Fill × Fixed 64** · **Space between**.
- [ ] Fill `bg/surface` bound. Padding `--space-4` (16) bound, all sides. Radius `radius/xl` (12) bound — **top two corners only** (use Independent corners toggle; bottom corners `0`).
- [ ] Stroke: bottom only, 1px `table/border`.
- [ ] `SearchGroup` (Horizontal AL, gap `--space-3` bound): `SearchInput` instance + `DropdownTrigger` instance.
- [ ] `ActionsGroup` (Horizontal AL, gap `--space-2` bound): `ExportButton` composite from Step 3.

---

## §5 — Ticket 4C.1: Wire the Real `RowsPerPage` Dropdown

*(Only after Ticket 4D is complete.)*

- [ ] Return to the `Pagination` component built in §3.
- [ ] Delete the `DropdownTriggerSlot` placeholder frame.
- [ ] In its place, insert a real `DropdownTrigger` instance (`state=default`), label overridden to `"20"` (a representative preset value from `[10, 20, 50, 100]`).
- [ ] ✅ Confirm `Pagination`'s overall height/layout did not shift — the stub's dimensions were deliberately matched to the real component in §3 Step 4 for exactly this reason.

---

## §6 — Ticket Completion Gate

- [ ] `Icon/16` folder holds **35** components. `bi-download`'s vector layer is **one** flattened path, not two.
- [ ] `HeaderCell` has **4** variants (`sort` only; `align` not yet a variant axis — noted in the component Description, not silently absent).
- [ ] `Cell` has **7** `type` variants. `type=badge` is an empty `ChipSlot` — no ad-hoc colors were invented to fake a badge.
- [ ] `PageButton[current]` has **no** `elevation/sm` effect style applied — confirm this wasn't "fixed" to match `Tabs`.
- [ ] `PrevButton`/`NextButton` are **two separate components**, not one variant set.
- [ ] `SearchInput`'s `focus` state ring: white `spread 2` **above** `border/focus` `spread 5`, both `Blur 0` — same verification steps as the `Checkbox` focus ring.
- [ ] `DropdownTrigger[open]` has **no** menu panel built (D3 deferred).
- [ ] `ExportButton`'s icon is a **composited sibling frame**, not a true icon-slot on `Button` — Description notes the pending enhancement.
- [ ] `FilterBar` radius is **top-corners-only** `radius/xl` (12) — bottom corners `0`, so it reads as one continuous card with the (future) `DataGridContainer` beneath it.
- [ ] `Pagination`'s `RowsPerPage` region shows a **real** `DropdownTrigger` instance, not the Ticket 4C stub (post-4C.1).
- [ ] **Zero raw hex values** anywhere in this session's work. Every fill, stroke, and text colour resolves to a `2. Semantic` variable; every spacing/radius/size value resolves to `3. Dimension`.
- [ ] **The full 10-column `DataGrid` was NOT assembled.** This checklist's scope ends at the reusable primitives, by design.
