# 🛠 Figma Maker Checklist — E-CMIS Phase 3

### Execution tickets for the human designer

**Source of truth:** `.claude/Markdown/E-CMIS-Phase3-Hybrid-Spec.md` (Revision **r5**)
**Token authority:** `.claude/Markdown/E-CMIS-Design-Foundation-v2.0.md` — every colour, space, radius, size
**Live in Figma:** `1. Primitives` (39) · `2. Semantic` (47) · `3. Dimension` (34) = **120 variables**
**Scope:** This document is *how to draw it in the Figma UI*. It contains no design rationale and no business logic. For *what* and *why*, read the Master Spec.

---

## §0 — PRE-FLIGHT

### 0.1 ✅ Elevation tokens — RESOLVED (Master Spec §0.2)

| Effect Style | X | Y | Blur | Spread | Colour | Alpha |
|---|---:|---:|---:|---:|---|---:|
| `elevation/sm` | `0` | `1` | `2` | `0` | `#04112A` | **6%** |
| `elevation/md` | `0` | `4` | `12` | `0` | `#04112A` | **10%** |
| `elevation/lg` | `0` | `12` | `32` | `0` | `#04112A` | **16%** |

Motion (`--motion-fast|base|slow|ease`) and stacking (`--z-*`) have no Figma equivalent. Record them in component **Description** fields only.

### 0.2 ✅ Shared primitives — RESOLVED (Master Spec §7)

`Icon/{20,24,32,40,48}`, `Checkbox`, and `Tabs[pill]` are fully specified. **Tickets 3A, 3B, and 3D are unblocked.** Build them via **Tickets 1C, 1D, 1E** below.

### 0.3 ✅ Variable foundation — BUILT AND VERIFIED IN FIGMA

All three collections exist in file `eGV3ESj90HSq712gz0f5uI`. **Nothing needs to be created; bind to them.**

| Collection | Mode | Vars | Notes |
|---|---|---:|---|
| `1. Primitives` | `Value` | 39 | **`hiddenFromPublishing`** — never bind a component to it |
| `2. Semantic` | `Light` | 47 | 44 aliased · 3 **🔒 Locked / System-derived** |
| `3. Dimension` | `Value` | 34 | `space/` 11 · `radius/` 7 · `table/col/` 7 · `size/icon/` 6 · `size/control/` 3 |

Scopes are constrained — `space/*` → **Gap** only, `radius/*` → **Corner radius** only, `size/*` and `table/col/*` → **Width & height** only. You physically cannot pick the wrong token.

### 0.4 Ordering gate — build in this order or you will backtrack

- [x] **Variable foundation** — 120 variables, live.
- [ ] **Ticket 1A** — `elevation/*` Effect Styles.
- [ ] **Ticket 1C** — `Icon/*` sets. *(Everything else instances them.)*
- [ ] `Button` component set (Foundation §2 / §3.4). **Must exist and be published.**
- [ ] **Ticket 1D** — `Checkbox`. **Ticket 1E** — `Tabs[pill]`.
- [ ] **Ticket 1B** — SweetAlert2 reference frame. Then §2, §3.

> ✅ **All blockers cleared as of Master Spec r5.** C6 (Tabs container-fill inversion), C7 (`Checkbox` `20px` ratified), C8 (`size/icon/*` + `size/control/*` live), C9 (three Locked tokens ratified). Nothing in this checklist is provisional. **Build it.**

---

## §1 — Setup & Foundations

### Ticket 1A — Create the 3 Effect Styles

- [ ] Draw a temporary rectangle (**`R`**). It is a scratch surface; delete it afterwards.
- [ ] Right panel → **Effects** → **`+`**. Leave the type on **Drop shadow**.
- [ ] Click the **⚙ (settings) icon** on the effect row to open the editor.
- [ ] `elevation/sm`: **X `0`** · **Y `1`** · **Blur `2`** · **Spread `0`** · **Colour `#04112A`** · **Alpha `6%`**.
- [ ] Click the **four-dot style icon** on the **Effects** section header → **`+`** → name exactly **`elevation/sm`** → **Create style**.
- [ ] Repeat for **`elevation/md`** (`0 / 4 / 12 / 0`, **10%**) and **`elevation/lg`** (`0 / 12 / 32 / 0`, **16%**).
- [ ] Delete the scratch rectangle. Styles persist in **Assets → Local styles → Effects**.

**Naming is load-bearing.** The `/` creates the `elevation` folder. Any other name breaks the mapping to `--elevation-sm|md|lg`.

> ℹ️ **Figma behaviour you rely on in Tickets 1D and 3A:** a **Drop shadow** with **`Blur: 0`** and a positive **Spread** renders as a hard ring — identical to a CSS `box-shadow` with zero blur.

---

### Ticket 1C — Build the `Icon/*` sets ✅ **RESOLVED** *(size variables now live; unblocks 1B, 2, 3A–3D)*

**Source:** `bootstrap-icons@1.11.3`, already loaded. Import the SVGs; do not redraw them.

Each size is a **folder of Components** — *not* a component set with a `glyph` variant. A variant set would force every consumer to carry ~100 glyphs.

#### Per icon

- [ ] **`F`** → frame **`size × size`**, **Fixed × Fixed**. **No auto-layout.**
- [ ] Paste the SVG. Flatten to **exactly one** vector layer. **`Ctrl+R`** → rename it `vector`.
- [ ] Give `vector` **one solid fill**. (A single fill is what lets consumers override the colour on the instance.)
- [ ] **No padding baked into the canvas.** The glyph fills the square.
- [ ] **`Ctrl+Alt+K`** → name it the bare glyph name, e.g. `bi-check-circle-fill`.
- [ ] Place it in the folder `Icon/24/` (the `/` in the component name creates the folder).

#### The seven sets

| Set | px | Grid | v2.0 token | Consumed by |
|---|---:|---|---|---|
| `Icon/14` | 14 | ❌ **sanctioned exception** | none | `Chip/Status`, `Badge/SignatureVerification` |
| `Icon/16` | 16 | ✅ | `--size-icon-sm` | `Button[sm,md]`, `InlineError`, **`Checkbox` glyph** |
| `Icon/20` | 20 | ✅ | `--size-icon-md` | `Alert`, `Toast`, `Button[lg]`, `DatePicker/Field` |
| `Icon/24` | 24 | ✅ | `--size-icon-lg` | `Modal` `IconBadge`, `FileItem` `FileIcon` |
| `Icon/32` | 32 | ✅ | **`size/icon/xl`** | `Uploader/Dropzone` |
| `Icon/40` | 40 | ✅ | **`size/icon/2xl`** | swal `IconBadge` |
| `Icon/48` | 48 | ✅ | **`size/icon/3xl`** | `EmptyState` `IconBadge` |

- [ ] **Bind every icon frame's width AND height to its `size/icon/*` variable.** All six exist in `3. Dimension`, scoped `WIDTH_HEIGHT`. Never type a raw px value.
- [ ] `Icon/14` is the one exception — **it has no variable, by design.** Set `14 × 14` literally.

> ℹ️ **Renamed in r5:** the 40px step is **`size/icon/2xl`**, not `xxl`. It aligns with `radius/2xl`. If you see `xxl` anywhere, that document is stale.

- [ ] ⛔ **`Icon/14` is off-grid and stays off-grid.** At 14px it is optically matched to the 14px label inside a 32px `Chip`. `Icon/16` overpowers the pill. **Do not "correct" it.**
- [ ] ⛔ **Never scale an instance.** An `Icon/16` placed at 24px renders a 1.5× stroke weight that will not match a real `Icon/24`. Swap the set.
- [ ] Colour is **never** baked in. Consumers override the `vector` fill with a `2. Semantic` variable.

#### Minimum glyph inventory for Phase 3 (30 glyphs)

```
bi-check-circle-fill      bi-x-circle-fill           bi-exclamation-triangle-fill
bi-info-circle-fill       bi-question-circle-fill    bi-x-lg
bi-check-lg               bi-dash-lg                 bi-eye
bi-eye-slash              bi-shield-lock-fill        bi-shield-fill-check
bi-shield-fill-x          bi-shield-fill-exclamation bi-shield-slash-fill
bi-patch-question-fill    bi-hourglass-split         bi-arrow-counterclockwise
bi-arrow-clockwise        bi-eraser                  bi-trash
bi-cloud-arrow-up-fill    bi-file-earmark-lock-fill  bi-file-earmark-x
bi-calendar3              bi-chevron-left            bi-chevron-right
bi-chevron-double-left    bi-chevron-double-right    bi-inbox
```

---

### Ticket 1D — Build `Checkbox` ✅ **RESOLVED** *(unblocks 3A, 3B)*

> ✅ **`20px` is ratified as the standard (Master Spec §8, C7).** `20 % 4 = 0`, so it is grid-compliant, and it binds to `size/icon/md` — which now exists in `3. Dimension`. The legacy `22px` box (`428:7`) is **retired** — it was off-grid.

#### Step 1 — the box

- [ ] **`F`** → frame **`20 × 20`**, **Fixed × Fixed**. Bind width & height to the variable **`size/icon/md`**.
- [ ] **`Shift+A`** → **Horizontal**, **center × center**, **Padding `0`**, **Gap `0`**.
- [ ] **Radius `--radius-md`** (6px).
- [ ] Place an **`Icon/16`** instance inside → `bi-check-lg`. Fill **`--text-inverse`**.
- [ ] **`Ctrl+Alt+K`** → name **`Checkbox`**.

#### Step 2 — the 6 `state` variants

- [ ] **Properties → `+` → Variant** → name **`state`**, value `default`.
- [ ] **`Ctrl+D`** ×5 → `hover`, `focus`, `checked`, `indeterminate`, `disabled`.

| `state` | Box fill | Border | Glyph | Glyph colour |
|---|---|---|---|---|
| `default` | `--bg-surface` | `1px` `--border-control` | hidden | — |
| `hover` | `--bg-surface-hover` | `1px` `--border-control-hover` | hidden | — |
| `focus` | `--bg-surface` | `1px` `--border-control` **+ ring (Step 3)** | hidden | — |
| `checked` | `--action-primary` | none | `bi-check-lg` | `--text-inverse` |
| `indeterminate` | `--action-primary` | none | **`bi-dash-lg`** | `--text-inverse` |
| `disabled` | `--bg-surface-subtle` | `1px` `--border-divider` | hidden | — |

- [ ] 🔴 **`indeterminate` is NOT `disabled`.** The legacy Figma (`428:12`–`428:14`) draws a dash and labels it `ปิดใช้งาน (disabled)`. That is a bug. A dash means *partially selected* (the DataTable header checkbox when some rows are ticked). Both states exist above. **Do not merge them.**
- [ ] ⛔ **Never use `opacity` for `disabled`.** Opacity multiplies against whatever is behind, making contrast unpredictable. Use the explicit tokens.

#### Step 3 — the 2-layer `--focus-ring`

- [ ] Select `state=focus` → **Effects → `+` → Drop shadow** → **⚙**: **X `0`** · **Y `0`** · **Blur `0`** · **Spread `2`** · **Colour `--bg-surface`**
- [ ] **Effects → `+` → Drop shadow** (a second one) → **⚙**: **X `0`** · **Y `0`** · **Blur `0`** · **Spread `5`** · **Colour `--border-focus`**
- [ ] ✅ **Verify stacking order.** In the **Effects** list, the **`spread 2` white shadow must sit ABOVE the `spread 5` brand shadow.** Figma draws the topmost effect closest to the layer, mirroring CSS `box-shadow` order. If the brand ring renders in front, drag the white one up.

#### Step 4 — `CheckboxField`

- [ ] **`F`** → **`Shift+A`** → **Horizontal** · **Hug × Hug** · **Vertical alignment: Center** · **Gap `--space-2`**.
- [ ] Set **min-height `40`** (`--size-control-md`).
- [ ] 🔴 Frame panel → **`Clip content` OFF.** Otherwise the 5px focus ring is sliced at the box boundary. *(This will cost you an hour if you skip it.)*
- [ ] Children: `Checkbox` instance + `Label` (**`body/md`**, `--text-primary`).
- [ ] **`Ctrl+Alt+K`** → name **`CheckboxField`**. Expose a `label` **Text** property and pass `state` through to the child.
- [ ] **Description field:** `Entire row is the click target (<label> wraps the input), not the 20px box.`

---

### Ticket 1E — Build `Tabs[pill]` ✅ **RESOLVED** *(unblocks 3B)*

> ✅ **C6 RESOLVED (Master Spec §8, Option ②).** The **container** now carries the track fill; `TabItem[default]` is **transparent**. This is the segmented-control inversion. The selected pill always sits on its own `--bg-surface-subtle` track, so its boundary is a deterministic **`1.18:1` on every host surface** — it was `1.00:1` on `--bg-surface`, which is precisely where `SignaturePad` puts it.

#### Step 1 — `TabItem`

- [ ] **`F`** → **`Shift+A`** → **Horizontal** · **Hug × Hug** · **Vertical alignment: Center**.
- [ ] **Padding:** vertical **`--space-2`** (8) · horizontal **`--space-4`** (16). **Radius `--radius-lg`** (8).
- [ ] Label → **`body/md-strong`** (14 / 24 / **600**).
- [ ] ✅ **Height must read `40`.** `24 + 8 + 8 = 40` = `--size-control-md`. **Leave the height on Hug** — do not type `40`.
- [ ] **`Ctrl+Alt+K`** → name **`TabItem`** → **Properties → `+` → Variant** → **`state`**: `default` · `hover` · `selected` · `disabled`.

| `state` | Fill | Label colour | Effect | Label contrast |
|---|---|---|---|---|
| `default` | **transparent** | `--text-body` | none | 5.42 ✅ |
| `hover` | `--bg-surface-hover` | `--text-primary` | none | 12.72 ✅ |
| `selected` | `--bg-surface` | `--text-primary` | **`elevation/sm`** | 13.57 ✅ |
| `disabled` | **transparent** | `--text-disabled` | none | 2.90 *(exempt)* |

- [ ] ⛔ **`default` and `disabled` have NO fill.** Set the fill to none — the container's track shows through. Do **not** fill them with `--bg-surface-subtle`; that was the r3 spec and it made the selected pill vanish.
- [ ] ⛔ **The label weight stays `600` in every state.** Sarabun's 600 glyphs are wider than its 400 glyphs — varying weight on selection reflows the strip and slides the other tabs out from under the user's cursor. **Vary colour only.**

#### Step 2 — `Tabs` container (the track)

- [ ] **`F`** → **`Shift+A`** → **Horizontal** · **Hug × Hug** · **Gap `--space-1`** (4).
- [ ] ✅ **Fill `--bg-surface-subtle`** ← the track *(r4, C6)*
- [ ] ✅ **Padding `--space-1`** (4, all sides) ← *(r4, C6)*
- [ ] ✅ **Radius `--radius-xl`** (12) ← **concentric rule:** child radius `8` + padding `4` = `12`. Any other value and the corners visibly diverge.
- [ ] ✅ **Height must read `48`.** `40 + 4 + 4`. **Leave it on Hug** — do not type `48`.
- [ ] 🔴 **`Clip content` OFF** — focus rings on `TabItem` must escape.
- [ ] Drop in `TabItem` instances. **`Ctrl+Alt+K`** → name **`Tabs`**.
- [ ] Add **Variant** properties `variant` = `pill` and `size` = `md` (single-value today; they reserve the namespace for `underline` and `sm`).
- [ ] **Description field:** `role=tablist / tab / tabpanel. aria-selected is MANDATORY — the selected pill is only 1.18:1 against its track, so the programmatic cue is what satisfies SC 1.4.1. Roving tabindex: only the selected tab is in the tab order. ←/→ move selection, Home/End jump to first/last. Disabled tabs leave the roving sequence.`

> ⚠️ **Residual, by design.** `1.18:1` is still under the 3:1 WCAG 1.4.11 asks of a state boundary, and **no v2.0 token closes it** (`--border-divider` on the pill = `1.15` vs track; `--border-control` = `2.90`). Selection is therefore carried redundantly by **label colour**, **`elevation/sm`**, and **`aria-selected`**. **Do not remove any of the three.**

---

### Ticket 1B — Rebuild the SweetAlert2 Reference Frame

These are **documentation artboards**, not components. **Never press `Ctrl+Alt+K` inside this frame.** In code these dialogs are produced by `Swal.fire()`; a Figma component would be a lie that designers would start instancing.

#### Step 1 — Salvage, then demolish

- [ ] Open frame **`535:320`** (`Sweet Alert Library`).
- [ ] **Copy the Thai strings to a scratch note before deleting anything.** They are real domain copy:
  - `เสร็จสิ้น` / `ดำเนินการเสร็จสิ้น` (from `448:4263`)
  - `เกิดข้อผิดพลาด` / `ไม่สามารถดำเนินการได้` (from `448:4273`)
  - `ยืนยันการส่งเรื่องร้องเรียน?` / `ท่านต้องการส่งหนังสือไปยังศูนย์รับเรื่องร้องเรียน เพื่อดำเนินการออกเลขรับ ใช่หรือไม่?` (from `451:4283`)
  - `ผลการตรวจสอบประวัติบุคคล` / `พบข้อมูลประวัติการถูกฟ้องคดีในระบบ` (from `451:4296`)
- [ ] Delete all four child frames: `448:4263`, `448:4273`, `451:4283`, `451:4296`.
- [ ] Select the parent frame → **`Ctrl+R`** → rename to exactly:
  ```
  📐 REFERENCE / SweetAlert2 Theme — DO NOT INSTANCE
  ```

#### Step 2 — Build the 5 artboards

Build **one** perfectly, then **`Ctrl+D`** it four times and swap the icon, fills, and copy.

- [ ] **`F`** → frame → **Width `400`**, **Height: Hug**.
- [ ] **`Shift+A`** → **Vertical** · **Horizontal alignment: Center** · **Vertical alignment: Top** · **Gap `0`**
- [ ] **Padding:** Top `0` · Right `0` · Bottom **`--space-6`** · Left `0`
- [ ] **Fill `--bg-surface`** · **Radius `--radius-2xl`** · **Effect `elevation/lg`**

| Layer | Figma settings |
|---|---|
| `IconBadge` | Frame **80 × 80**, **Fixed × Fixed**, radius **`--radius-full`**. **Auto-layout Horizontal, center × center.** Top margin **`--space-6`**. Contains one **`Icon/40`** instance. |
| `Title` | Text, **`heading/md`**, fill **`--text-primary`**, **align Center**, **Fill × Hug**. Padding-top **`--space-4`**, sides **`--space-6`**. |
| `Text` | Text, **`body/md`**, fill **`--text-body`**, **align Center**, **Fill × Hug**. Padding top **`--space-3`**, sides **`--space-6`**, bottom **`--space-2`**. |
| `Actions` | Frame → **`Shift+A`** → **Horizontal**, **alignment Center**, gap **`--space-3`**, **Hug × Hug**, margin-top **`--space-6`**. Contains `Button` **instances**. |

- [ ] Name each artboard **exactly** as the left column — this string is what the developer passes to `EcmisSwal.fire({ icon: … })`.

| Artboard name | `IconBadge` fill | `Icon/40` colour | `bi-*` glyph | Buttons (left → right) |
|---|---|---|---|---|
| `swal/success` | `--feedback-success-bg` | `--feedback-success-icon` | `bi-check-circle-fill` | `[ ตกลง ]` primary |
| `swal/error` | `--feedback-danger-bg` | `--feedback-danger-icon` | `bi-x-circle-fill` | `[ ตกลง ]` primary |
| `swal/warning` | `--feedback-warning-bg` | `--feedback-warning-icon` | `bi-exclamation-triangle-fill` | `[ ตกลง ]` primary |
| `swal/info` | `--feedback-info-bg` | `--feedback-info-icon` | `bi-info-circle-fill` | `[ ตกลงรับทราบ ]` primary |
| `swal/confirm` | `--bg-surface-subtle` | `--text-body` | `bi-question-circle-fill` | `[ ยกเลิก ]` secondary · `[ ยืนยัน ]` primary |

> ⚠️ **`swal/confirm` button order is `ยกเลิก` LEFT, `ยืนยัน` RIGHT.** This matches `reverseButtons: true` in the `EcmisSwal` mixin and the Custom Modal footer. If the artboard shows confirm-first, the developer will trust the artboard over the code.

#### Step 3 — Annotate and lock

- [ ] Beside each artboard add a text layer (**`meta/md`**, **`--text-body`**) listing its variable mapping, e.g.
  ```
  --swal2-width: 400px
  --swal2-background: var(--bg-surface)
  --swal2-border-radius: var(--radius-2xl)
  --swal2-backdrop: var(--bg-overlay)
  --swal2-actions-justify-content: center
  ```
- [ ] Select the parent frame → **Right-click → Lock** (**`Ctrl+Shift+L`**).
- [ ] Confirm the 🔒 icon appears in the **Layers** panel.

**Do not create a component set here.** The lock is what stops a designer duplicating an artboard into a screen mock.

---

## §2 — The Custom Modal Builder

The `Modal` component set contains **`ModalDialog` only.** Build **`ModalOverlay` as a separate, single component** — nesting it would multiply one backdrop into 30 copies.

### Ticket 2A — Build the perfect `md / neutral / dual` base

- [ ] **`F`** → frame → **Width `520`** (`size=md`) × **Height: Hug**.
- [ ] **`Ctrl+R`** → name `ModalDialog`.
- [ ] **`Shift+A`** → **Vertical** · **Gap `0`** · **Padding `0`** (the three regions own their padding).
- [ ] **Fill `--bg-surface`** · **Radius `--radius-2xl`** · **Effect `elevation/lg`**
- [ ] Frame panel → tick **Clip content**.
- [ ] `max-height: 90vh` → ⛔ **Figma cannot express viewport units.** Leave the frame at **Hug**. Type `max-height: 90vh; ModalBody scrolls` into the **Description** field. **Do not substitute a pixel value.**

#### `ModalHeader`

- [ ] Child frame → **`Shift+A`** → **Horizontal** · **Fill × Hug** · **Vertical alignment: Top**
- [ ] **Gap `--space-4`** · **Padding:** Top `--space-6` · Right `--space-6` · Bottom `--space-4` · Left `--space-6`
- [ ] `IconBadge` — Frame **48 × 48**, **Fixed × Fixed**, radius `--radius-full`, **Auto-layout Horizontal, center × center**, one **`Icon/24`** instance inside.
- [ ] `HeaderText` — **`Shift+A`** → **Vertical** · **Fill × Hug** · **Gap `--space-2`**
  - `Title` → **`heading/md`**, `--text-primary`, **Fill × Hug**
  - `Desc` → **`body/md`**, `--text-body`, **Fill × Hug**
- [ ] `CloseButton` — `Button[variant=ghost, size=sm]`, icon `bi-x-lg`.

#### `ModalBody`

- [ ] Child frame → **`Shift+A`** → **Vertical** · **Fill × Hug** · **Gap `--space-4`**
- [ ] **Padding:** Top `0` · Right `--space-6` · Bottom `0` · Left `--space-6`
- [ ] Select `ModalBody` → **Prototype** tab → **Overflow behavior → Vertical scrolling.** This is the only region that scrolls.

#### `ModalFooter`

- [ ] Child frame → **`Shift+A`** → **Horizontal** · **Fill × Hug**
- [ ] **Horizontal alignment: Right (end)** · **Gap `--space-3`** · **Padding `--space-6`** (all four sides)
- [ ] `Secondary` → `Button[variant=secondary, size=md]` · `Primary` → `Button[variant=primary, size=md]`

---

### Ticket 2B — The 30-variant workflow

**The order below matters.** Non-variant properties added to the base component **propagate to every variant created afterwards.** Add them first and you configure them once instead of thirty times.

#### Phase 1 — Non-variant properties (on the single base frame)

- [ ] Select `ModalDialog` → **`Ctrl+Alt+K`**.
- [ ] **Properties → `+` → Text** → `title`, default `ยืนยันการดำเนินการ`. Bind to `Title`.
- [ ] **`+` → Text** → `description`. Bind to `Desc`.
- [ ] **`+` → Boolean** → `hasIcon`, default **true**. Bind to `IconBadge` **Visibility**.
- [ ] **`+` → Boolean** → `hasCloseButton`, default **true**. Bind to `CloseButton` **Visibility**.
- [ ] **`+` → Instance swap** → `iconSwap`, preferred values = the **`Icon/24`** folder.

✅ **Four properties, configured once. They now exist on all 30 variants automatically.**

#### Phase 2 — `tone` (→ 5)

- [ ] **Properties → `+` → Variant**. Figma wraps it in a component set.
- [ ] Rename the property to **`tone`**, value to **`neutral`**.
- [ ] **`Ctrl+D`** ×4 → `info`, `success`, `warning`, `danger`. For each, change **only** `IconBadge` fill and `Icon/24` colour:

| `tone` | `IconBadge` fill | Icon colour | Default `iconSwap` | `Primary` button |
|---|---|---|---|---|
| `neutral` | `--bg-surface-subtle` | `--text-body` | `bi-question-circle-fill` | `primary` |
| `info` | `--feedback-info-bg` | `--feedback-info-icon` | `bi-info-circle-fill` | `primary` |
| `success` | `--feedback-success-bg` | `--feedback-success-icon` | `bi-check-circle-fill` | `primary` |
| `warning` | `--feedback-warning-bg` | `--feedback-warning-icon` | `bi-exclamation-triangle-fill` | `primary` |
| `danger` | `--feedback-danger-bg` | `--feedback-danger-icon` | `bi-x-circle-fill` | **`danger`** |

**Count: 5.**

#### Phase 3 — `actions` (→ 10)

- [ ] Select **all 5** → **`Ctrl+D`** → drag into a new row below.
- [ ] Select the **component set frame** (dashed purple boundary) → **Properties → `+` → Variant** → **`actions`**, default `dual`.
- [ ] Set the new row to `actions = single`. In each, set `Secondary`'s **Visibility → off**.

**Count: 10.**

#### Phase 4 — `size` (→ 30)

`size` changes the frame **width and nothing else**. Padding, gaps, and type styles are identical across `sm`/`md`/`lg`.

- [ ] Select **all 10** → **`Ctrl+D`** → drag below.
- [ ] Component set → **Properties → `+` → Variant** → **`size`**, default `md`.
- [ ] Set the new block to `size = sm` → select all 10 → **Width `400`**.
- [ ] **`Ctrl+D`** the `md` block again → `size = lg` → **Width `720`**.

**Count: 30.** ✅

- [ ] Rename the component set to exactly **`Modal`**.
- [ ] Paste the four behaviour rules from Master Spec §1.2 into the set's **Description**.

> 💡 If **`Ctrl+D`** on a multi-selection misbehaves, duplicate the block, then use the **variant value dropdown** to set the whole selection at once. Never hand-edit 30 frames.

---

## §3 — Complex Component Assembly

### Ticket 3A — `PinConfirm` ✅ **RESOLVED** *(was blocked on `Checkbox`)*

Build **`PinCell`** as its own component first. Assembling six loose frames is the mistake that makes the focus ring unfixable later.

#### Step 1 — `PinCell`

- [ ] **`F`** → frame → **Width `48` (Fixed)** × **Height `56` (Fixed)**.
- [ ] **`Shift+A`** → **Horizontal**, **center × center**, **Padding `0`**, **Gap `0`**.
- [ ] **Fill `--bg-surface`** · **Stroke `1px` `--border-control`**, position **Inside** · **Radius `--radius-lg`**.
- [ ] **`T`** → `●` → **`heading/md`**, fill **`--text-primary`**, **align Center**, **Resizing: Hug**.
- [ ] **`Ctrl+Alt+K`** → **`PinCell`**.

#### Step 2 — `state` variants

- [ ] **Properties → `+` → Variant** → **`state`**, value `default`. **`Ctrl+D`** ×5 → `focus`, `error`, `verifying`, `disabled`, `locked`.

| `state` | Stroke | Fill |
|---|---|---|
| `default` | `1px` `--border-control` | `--bg-surface` |
| `focus` | `1px` `--border-control` **+ 2-layer ring** | `--bg-surface` |
| `error` | `2px` `--feedback-danger-icon` | `--feedback-danger-bg` |
| `verifying` | `1px` `--border-control` | `--bg-surface-subtle` |
| `disabled` | `1px` `--border-divider` | `--bg-surface-subtle` |
| `locked` | `1px` `--border-divider` | `--bg-surface-subtle` |

#### Step 3 — The 2-layer `--focus-ring`

Identical to **Ticket 1D Step 3**. White **`spread 2`** above brand **`spread 5`**, both **`Blur 0`**.

> 🔴 **A Drop shadow is clipped by any ancestor with `Clip content` ON.** `PinInput` **must have `Clip content` OFF**, or the 5px ring is sliced at the cell boundary.

#### Step 4 — `PinInput`

- [ ] **`F`** → **`Shift+A`** → **Horizontal** · **Hug × Hug** · **Gap `--space-2`** · **Horizontal alignment: Center**.
- [ ] **`Clip content` OFF.** Drop in **6 instances** of `PinCell`.
- [ ] **`Ctrl+Alt+K`** → **`PinInput`** → variant **`state`**, same six values, driving all six children.

#### Step 5 — Assemble into the Modal

- [ ] Place **`Modal[size=sm, tone=neutral, hasIcon=true, actions=dual]`**.
- [ ] `iconSwap` → **`bi-shield-lock-fill`**. Override `IconBadge` fill to **`--feedback-info-bg`**.
- [ ] `title` → `ยืนยันการลงนาม`
- [ ] `description` → `กรอกรหัส PIN ของใบรับรอง DS-000001 (Dev Admin) เพื่อลงนามในเอกสาร`
- [ ] Into `ModalBody` (Vertical AL, gap `--space-4`), in order:
  - `PinInput` instance
  - `VisibilityToggle` → `Button[ghost, sm]`, `bi-eye`
  - `InlineError` → **`Shift+A`** → **Horizontal**, **gap `--space-2`**, **Hug × Hug**. Children: `Icon/16` `bi-x-circle-fill` in `--feedback-danger-icon`; text **`body/md`** in **`--feedback-danger-text`**.
  - ✅ `RememberCheckbox` → **`CheckboxField`** instance (Ticket 1D). Label `จดจำ 15 นาที`. **Ship it unchecked by default.**
- [ ] `ModalFooter`: `[ ยกเลิก ]` secondary · `[ ลงนาม ]` primary.
- [ ] **Description field:** `error shakes for --motion-base (200ms); suppressed under prefers-reduced-motion. Do not auto-submit on 6th digit without state=verifying.`

---

### Ticket 3B — `SignaturePad` ✅ **RESOLVED** *(was blocked on `Tabs[pill]` + `Checkbox`)*

- [ ] Place **`Modal[size=lg, tone=neutral, hasIcon=false, actions=dual]`**. Title `ลงลายมือชื่อ`.
- [ ] `ModalBody` is already **Vertical AL · Fill × Hug · gap `--space-4` · padding `0 --space-6`**. Do not change it.
- [ ] Set `ModalBody`'s **Horizontal alignment: Center** — this is the C2 resolution.

#### ✅ Canvas width — RESOLVED (C2 = Option A)

`Modal[lg]` `720` − `2 × --space-6` = **672px** content box. `SignatureCanvas` stays **Fixed `640 × 240`**, centre-aligned → **16px gutters each side.**

- ⛔ **Do not set `SignatureCanvas` to `Fill container`.** The 32px slack is intentional: it preserves the **8:3 aspect ratio** the signature raster is exported at for PDF compositing.

#### 1. `Tabs` ✅

- [ ] Instance of **`Tabs[variant=pill, size=md]`** (Ticket 1E). **Resizing: Fill × Hug.**
- [ ] Three `TabItem`s: `วาดลายเซ็น` *(state=selected)* · `อัปโหลดรูปลายเซ็น` · `ใช้ลายเซ็นที่บันทึกไว้`
- [ ] ✅ **C6 is resolved.** The `Tabs` container carries a `--bg-surface-subtle` track, so the selected pill reads against it rather than against `ModalBody`'s white fill. Nothing to fix locally — the component already handles it.

#### 2. `SignatureCanvas`

- [ ] **`F`** → frame **`640` (Fixed) × `240` (Fixed)**.
- [ ] **NO auto-layout.** This is a drawing surface; children are positioned absolutely.
- [ ] **Fill `--bg-surface`** · **Stroke `1px` `--border-control`** · **Radius `--radius-lg`** · **`Clip content` ON.**
- [ ] `BaselineGuide` — **`L`** (Line) → width **`592`** (= `640 − --space-6 − --space-6`), **`1px`**, stroke **`--border-divider`**. Click the **Absolute position** icon → **Y = `180`** (75% of 240).
- [ ] `Hint` — **`T`** → `ลงลายมือชื่อในกรอบนี้` → **`meta/md`**, **`--text-disabled`**, **align Center**. **Absolute position**, centred both axes.
- [ ] Variant property **`state`**: `empty` · `drawing` · `filled` · `disabled`. `Hint` **Visibility ON** only in `empty`.

#### 3. `Toolbar`

- [ ] **`F`** → **`Shift+A`** → **Horizontal** · **Fill × Hug** · **Horizontal alignment: Right (end)** · **Gap `--space-2`**.
- [ ] `Button[ghost, sm]` `bi-arrow-counterclockwise` → `เลิกทำ`
- [ ] `Button[ghost, sm]` `bi-eraser` → `ล้าง`

#### 4. `SaveCheckbox` ✅

- [ ] **`CheckboxField`** instance (Ticket 1D). Label `บันทึกลายเซ็นนี้ไว้ใช้ครั้งถัดไป`.

- [ ] `ModalFooter`: `[ ยกเลิก ]` secondary · `[ ถัดไป ]` primary, **`state=disabled`** in the default variant.

> 🔴 **The three tabs are the accessibility conformance path, not a convenience.** A `<canvas>` cannot be operated by keyboard. Never mock a `SignaturePad` with the Draw tab alone.

---

### Ticket 3C — `DatePicker`

#### ✅ Grid sizing — RESOLVED (C1 = Option A)

`Calendar` `320` − `2 × --space-4` = **288px** content box. `MonthGrid`/`YearGrid` = `3 × 96` = **288** (exact). `DayGrid` = `7 × 40` = **280**.
**`DayGrid` and `WeekdayHeader` are `Hug` (280px), centre-aligned** → 4px optical gutters on the day grid only.

- ⛔ **Never set `DayGrid` to `Fill`.** It forces each `DayCell` to **`41.14px`** — off the 4px grid, and a direct reintroduction of the fractional-coordinate defect found in 210 nodes during the v2.0 audit.

#### The resizing table — get these right and the grid cannot jump

| Layer | Width | Height | Why |
|---|---|---|---|
| `DayCell` | **Fixed `40`** | **Fixed `40`** | ⛔ **Never Hug.** A two-digit day (`29`) would widen the cell and shear the column grid. |
| `Week` | **Hug** (280) | **Hug** (40) | 7 × 40, always. |
| `DayGrid` | **Hug** (280) | **Hug** (240) | 6 × 40, always. |
| `WeekdayHeader` | **Hug** (280) | **Fixed `40`** | Columns must align with `Week`. |
| `Calendar` | **Fixed `320`** | **Hug** | Height is constant because `DayGrid` is constant. |

#### Build order

- [ ] `DayCell` → **`F`** → **`40 × 40`**, **Fixed × Fixed**. **`Shift+A`** → **Horizontal**, **center × center**, padding `0`. Text = **`table/cell`**, **`tabular-nums`**, align Center.
- [ ] **`Ctrl+Alt+K`** → variant **`state`**, **9** values: `default` · `hover` · `today` · `selected` · `disabled` · `outsideMonth` · `rangeStart` · `rangeMiddle` · `rangeEnd`.

| `state` | Fill | Text | Stroke | Radius |
|---|---|---|---|---|
| `default` | none | `--text-body` | — | `--radius-full` |
| `hover` | `--bg-surface-hover` | `--text-body` | — | `--radius-full` |
| `today` | none | `--text-primary` (600 wt) | `1px --accent-emphasis` | `--radius-full` |
| `selected` | `--action-primary` | `--text-inverse` | — | `--radius-full` |
| `disabled` / `outsideMonth` | none | `--text-disabled` | — | — |
| `rangeStart` | `--action-primary` | `--text-inverse` | — | L: full · R: `0` |
| `rangeMiddle` | `--feedback-info-bg` | `--text-primary` | — | `0` |
| `rangeEnd` | `--action-primary` | `--text-inverse` | — | L: `0` · R: full |

> For `rangeStart`/`rangeEnd`, use the **Independent corners** toggle (the ⌐ icon in the corner-radius field).

- [ ] `Week` → **`Shift+A`** → **Horizontal** · **Gap `0`** · **Hug × Hug**. Drop in **exactly 7** `DayCell` instances.
- [ ] `DayGrid` → **`Shift+A`** → **Vertical** · **Gap `0`** · **Hug × Hug**. Drop in **exactly 6** `Week` instances.
- [ ] ✅ **Never delete a `Week`.** A month that fits in 5 rows still renders 6; pad the last row with `state=outsideMonth`. This is the entire anti-jump mechanism.
- [ ] `WeekdayHeader` → **`Shift+A`** → **Horizontal** · **Gap `0`** · **Hug × Hug** · 7 cells of **Fixed `40`**, text **`meta/md`** / **`--text-body`**, centred.
  - Order, left → right: **`อา  จ  อ  พ  พฤ  ศ  ส`** ← **Sunday-first.**
  - Do **not** colour `อา` or `ส`.
- [ ] `Calendar` → **Width `320` Fixed** × **Height Hug** → **`Shift+A`** → **Vertical** · **Gap `--space-3`** · **Padding `--space-4`**.
- [ ] **Horizontal alignment: Center** (the C1 resolution).
- [ ] **Fill `--bg-surface`** · **Radius `--radius-lg`** · **Effect `elevation/md`**.
- [ ] `CalendarHeader` → **Horizontal** · **Fill × Fixed `40`** · **Gap `--space-1`**:
  `bi-chevron-double-left` · `bi-chevron-left` · `MonthYearButton` (`Button[ghost]`, **Fill**, label `พฤษภาคม 2570`) · `bi-chevron-right` · `bi-chevron-double-right`
- [ ] Variant property **`view`** = `days` · `months` · `years`.
  - `MonthGrid` / `YearGrid` → **`Shift+A` Vertical** of 4 rows × **Horizontal** of 3 cells, each **Fixed `96 × 48`**.
  - `YearGrid` labels are **พ.ศ.**: `2565 … 2576`.
- [ ] `CalendarFooter` → **Horizontal** · **Fill × Hug** · **Space between** · **Stroke: Top only, `1px` `--border-divider`** (use the **individual strokes** toggle) · `[ วันนี้ ]` `[ ล้าง ]` ghost buttons.

---

### Ticket 3D — `FileUploader` ✅ **RESOLVED** *(was blocked on `Icon/32`)*

#### Part 1 — `Uploader/Dropzone`

- [ ] **`F`** → **`Shift+A`** → **Vertical** · **Fill × Hug** · **Horizontal alignment: Center** · **Vertical alignment: Center**.
- [ ] **Padding `--space-8`** (all sides) · **Gap `--space-3`** · **Radius `--radius-xl`**.
- [ ] **Stroke `2px`** → in the **Stroke** panel click the **`⋯` / Advanced stroke** icon → **Dashes `8`**, **Gaps `6`**.
- [ ] Children: ✅ **`Icon/32`** `bi-cloud-arrow-up-fill` (Ticket 1C) · `Title` (**`body/md-strong`**, `--text-primary`) · `Hint` (**`meta/md`**, `--text-body`) · `BrowseButton` (`Button[secondary, sm]`, `เลือกไฟล์`).
- [ ] **`Ctrl+Alt+K`** → variant **`state`**: `idle` · `hover` · `dragover` · `disabled` · `error`.

| `state` | Fill | Stroke | Stroke style |
|---|---|---|---|
| `idle` | `--bg-surface` | `--border-control` | **Dashed** 2px |
| `hover` | `--bg-surface-hover` | `--border-control-hover` | **Dashed** 2px |
| `dragover` | `--feedback-info-bg` | `--border-focus` | **SOLID** 2px |
| `disabled` | `--bg-surface-subtle` | `--border-divider` | Dashed 2px |
| `error` | `--feedback-danger-bg` | `--feedback-danger-icon` | **SOLID** 2px |

> `dragover` and `error` switch **dashed → solid.** Clear the **Dashes/Gaps** fields (set both to `0`) in those two variants. That stroke-style change is the non-colour state cue; do not skip it.

#### Part 2 — `Uploader/FileItem`, and the `ProgressFill` nesting fix

The audit found `ProgressFill` (`428:101`) sitting as a **sibling** of `ProgressTrack` (`428:100`). Fixing it is a **Layers-panel drag**, not a reposition.

- [ ] `FileItem` → **`Shift+A`** → **Horizontal** · **Fill × Hug** · **Vertical alignment: Center**.
- [ ] **Padding:** vertical `--space-3` · horizontal `--space-4` · **Gap `--space-3`**
- [ ] **Fill `--bg-surface`** · **Stroke `1px` `--border-divider`** · **Radius `--radius-lg`** · **Effect `elevation/sm`**
- [ ] Child 1 — `FileIcon`: **`Icon/24`** instance, **Fixed**.
- [ ] Child 2 — `Info`: **`Shift+A`** → **Vertical** · **Fill × Hug** · **Gap `--space-1`**
  - `Filename` → **`body/md`**, `--text-primary`, **Fill × Hug**
  - `Meta` → **`meta/md`**
  - `ProgressTrack` → below
- [ ] Child 3 — `Actions`: **`Shift+A`** → **Horizontal** · **Hug × Hug** · **Gap `--space-1`**

##### The `ProgressTrack` / `ProgressFill` build — this exact order

- [ ] **`F`** → draw `ProgressTrack` inside `Info`. **Fill container (width) × Fixed `8` (height)**.
- [ ] **Fill `--bg-surface-subtle`** · **Radius `--radius-full`** · **`Clip content` ON.**
- [ ] Select `ProgressTrack` → **`Shift+A`** → **Horizontal** · **Padding `0`** · **Gap `0`** · **Horizontal alignment: Left**.
- [ ] **`F`** → draw `ProgressFill`. **Fill `--accent-emphasis`** · **Radius `--radius-full`** · **Height: Fill container.**
- [ ] 🔴 **In the Layers panel, drag `ProgressFill` ONTO `ProgressTrack`** so it becomes a child.
- [ ] ✅ **Verify:** `ProgressFill` is **indented one level beneath** `ProgressTrack` in the Layers panel. If it is a sibling, you have reproduced the original bug.

> ⛔ **Figma cannot express a percentage width.** `ProgressFill` takes a **Fixed** px width in the master. Use **`208`** against a **`320`** demo track — the 65% ratio from legacy nodes `428:100` / `428:101`, so the number is evidence-backed rather than invented. Type `width driven by aria-valuenow at runtime; 208/320 is illustrative only` into the **Description** field.

##### `FileItem` variants

- [ ] Variant **`state`**: `uploading` · `success` · `error` · `rejected`. Boolean **`hasRemove`**.

| `state` | `FileIcon` glyph | Icon colour | `Meta` colour | Frame fill / stroke | `ProgressTrack` |
|---|---|---|---|---|---|
| `uploading` | `bi-file-earmark-lock-fill` | `--text-disabled` | `--text-body` | default | **visible** |
| `success` | `bi-file-earmark-lock-fill` | `--feedback-success-icon` | `--text-body` | default | hidden |
| `error` | `bi-exclamation-triangle-fill` | `--feedback-danger-icon` | `--feedback-danger-text` | `--feedback-danger-bg` / `1px --feedback-danger-icon` | hidden |
| `rejected` | `bi-file-earmark-x` | `--feedback-danger-icon` | `--feedback-danger-text` | `--feedback-danger-bg` / `1px --feedback-danger-icon` | hidden |

- [ ] `Actions` per state: `uploading` → `bi-x-lg` ghost · `success` → `bi-check-circle-fill` + `bi-trash` · `error` → `bi-arrow-clockwise` (`ลองใหม่`) + `bi-trash` · `rejected` → `bi-trash` only.

> ⛔ **Figma has no middle-truncation.** Its **Truncate text** setting only ellipsises at the *end*, which would destroy `.p12` — the most important token in the filename. **Type the literal demo string `sample-certi…cate.p12`** into `Filename` and note in the Description that middle-truncation is a runtime behaviour.

---

## §4 — Conflict Register

| # | Type | Location | Status |
|---|---|---|---|
| **C1** | Spec arithmetic | `DatePicker` grid | ✅ **RESOLVED — Option A.** `DayGrid`/`WeekdayHeader` = Hug (280), centred. `Fill` forbidden (would force `41.14px` cells). Master Spec §3.1.1. |
| **C2** | Spec arithmetic | `SignatureCanvas` width | ✅ **RESOLVED — Option A.** Fixed `640 × 240`, `ModalBody` centre-aligned, 16px gutters. Preserves the 8:3 export aspect. Master Spec §4.1.1. |
| **C3** | Figma platform limit | `ModalDialog` | ⛔ No viewport units. `max-height: 90vh` lives in the **Description** field; frame stays **Hug**. |
| **C4** | Figma platform limit | `FileItem` → `Filename` | ⛔ No middle-truncation. Literal demo string used. |
| **C5** | Figma platform limit | `ProgressFill` | ⛔ No `%` widths. Fixed `208 / 320` (65%), from legacy `428:100` / `428:101`. |
| **C6** | a11y defect | `Tabs[pill]` selected state | ✅ **RESOLVED — Option ②.** Container takes `--bg-surface-subtle` + `--space-1` padding + `--radius-xl`; `TabItem[default|disabled]` transparent. Pill boundary now a deterministic **`1.18:1`** on every host (was `1.00:1` on `--bg-surface`). **Residual under 3:1 accepted** — `aria-selected` + `elevation/sm` + label colour are all mandatory. Master Spec §7.3 / §8, C6. |
| **C7** | Derivation | `Checkbox` box size | ✅ **RESOLVED — `20px` ratified.** `20 % 4 = 0`; binds to `--size-icon-md`. Legacy `22px` (`428:7`) retired as off-grid. Master Spec §8, C7. |
| **C8** | Missing token names | `Icon/32`, `Icon/40`, `Icon/48` | ✅ **RESOLVED · LIVE IN FIGMA.** `size/icon/xl: 32`, `size/icon/2xl: 40`, `size/icon/3xl: 48` created in `3. Dimension`, scope `WIDTH_HEIGHT`. Renamed `xxl`→`2xl` in r5. `Icon/14` deliberately gets none. Master Spec §7.1 / §8, C8. |
| **C9** | Un-aliasable tokens | `bg/overlay`, `border/control-hover`, `table/row-selected` | ✅ **RATIFIED as 🔒 Locked / System-derived.** Direct values in `2. Semantic`, documented in each variable's description. **They will NOT follow a primitive retheme.** Master Spec §8, C9 · Foundation §2.2. |

---

## §5 — Ticket Completion Gate

- [ ] `elevation/sm`, `elevation/md`, `elevation/lg` exist under **Assets → Local styles → Effects** with the exact X / Y / Blur / Spread / Alpha from §0.1.
- [ ] Seven `Icon/*` folders exist. Each icon is a Component with **one** vector layer named `vector` and **one** solid fill. **No icon has a baked-in colour.**
- [ ] Every icon frame's width **and** height is bound to `size/icon/{sm,md,lg,xl,2xl,3xl}`. **No raw px.**
- [ ] Every control height falls out of padding + line-height and matches `size/control/{sm,md,lg}`. **Never typed.**
- [ ] `Icon/14` is still **14px** and has **no** size variable. Nobody "corrected" it to 16.
- [ ] `Checkbox` box is **`20 × 20`** bound to `--size-icon-md`. **Not 22.**
- [ ] `Checkbox` has **6** states. `indeterminate` uses `bi-dash-lg`; `disabled` uses no glyph. **They are not the same variant.**
- [ ] `CheckboxField` has **`Clip content` OFF**; min-height `40`.
- [ ] `Tabs` container has **fill `--bg-surface-subtle`**, **padding `--space-1`**, **radius `--radius-xl`**, height **48**.
- [ ] `TabItem[default]` and `TabItem[disabled]` have **no fill**. Only `hover` and `selected` are filled.
- [ ] `Tabs` → `TabItem` label weight is **600 in every state**. Height reads **40**, set by padding, not typed.
- [ ] `Tabs` has **`Clip content` OFF**.
- [ ] `📐 REFERENCE / SweetAlert2 Theme — DO NOT INSTANCE` is **locked**, holds exactly 5 artboards, contains **zero components**.
- [ ] `swal/confirm` shows `ยกเลิก` left, `ยืนยัน` right.
- [ ] `Modal` component set has **exactly 30** variants plus 5 non-variant properties.
- [ ] `ModalBody` is the **only** frame with **Overflow behavior: Vertical scrolling**.
- [ ] `PinCell[state=focus]` has **two** Drop shadows, `Blur 0`, white `spread 2` **above** brand `spread 5`; `PinInput` has **`Clip content` OFF**.
- [ ] `SignatureCanvas` is **Fixed `640 × 240`**; `ModalBody` horizontal alignment is **Center**.
- [ ] `DayGrid` contains **exactly 6** `Week` frames; every `DayCell` is **Fixed `40 × 40`**; `DayGrid` resizing is **Hug**, never Fill.
- [ ] `Calendar` horizontal alignment is **Center**.
- [ ] `WeekdayHeader` starts with **`อา`**.
- [ ] `YearGrid` reads **`2565 … 2576`** (พ.ศ.), never `2022 … 2033`.
- [ ] `ProgressFill` is **indented beneath** `ProgressTrack` in the Layers panel.
- [ ] `Dropzone[state=dragover]` and `[state=error]` have **solid** strokes; the other three are **dashed 8 / 6**.
- [ ] **Zero raw hex values.** Every fill, stroke, and effect colour resolves to a **`2. Semantic`** variable. (`#04112A` appears only inside the three `elevation/*` Effect Styles — Figma cannot bind a colour variable to a shadow.)
