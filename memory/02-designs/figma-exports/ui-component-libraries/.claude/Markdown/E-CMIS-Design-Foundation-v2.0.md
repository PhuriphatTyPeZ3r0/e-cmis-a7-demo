# E-CMIS Design Foundation — v2.0
### Source of Truth for Design Tokens
**Status:** Materialised from the Rebuild Spec Sheet v2.0 established in session.
**Consumed by:** `E-CMIS-Phase3-Hybrid-Spec.md` (r5), `E-CMIS-Phase3-Figma-Maker-Checklist.md`
**Live in Figma:** file `eGV3ESj90HSq712gz0f5uI`, 3 variable collections, **120 variables**.

> **Why this file exists.** Until now the token ramps lived only in conversation context. The Phase 3 Master Spec contains just **25 distinct hex values** — nine of the ten `brand` steps were absent from it. Any downstream agent reading only the Master Spec would have had to invent them. **This file is the authority for every colour, space, radius, and size in E-CMIS.** If a value is not here, it does not exist.

---

## §0 — Hard Rules

1. **Never bind a component to `1. Primitives`.** It is `hiddenFromPublishing`. Components bind to `2. Semantic` and `3. Dimension` only.
2. **Never write a raw hex into a layer.** The one sanctioned exception is `#04112A` inside the three `elevation/*` Effect Styles — Figma cannot bind a colour variable to a shadow.
3. **No value outside these scales.** Not `13px`, not `2.3rem`, not `#7066e0`.
4. **`brand-500` is a decorative fill only.** At **2.34:1** it fails even the 3:1 non-text floor. It is never text, never a border, never a button.
5. **Line-height is always absolute px.** Never `Auto`. Thai stacks four vertical zones; `Auto` clips tone marks.

---

## §1 — `1. Primitives` (39 variables)

Figma collection `VariableCollectionId:611:2` · mode `Value` · **all `hiddenFromPublishing = true`**.

```jsonc
{
  "brand": {                 // Cyan. MERGED from the legacy #14B5E7 + #18B9E7.
    "50":  "#E4F6FD",
    "100": "#C3EBF9",
    "200": "#8FDBF3",
    "300": "#52C8EC",
    "400": "#2BBEE9",
    "500": "#16B7E7",        // ⛔ FILL ONLY — 2.34:1 on white. Never text/border/button.
    "600": "#0E92BC",        // floor for borders, underlines, focus ring (3.59:1)
    "700": "#0B7396",        // floor for text (5.38 white / 4.82 page)
    "800": "#0D5D78",
    "900": "#104C61"
  },

  "primary": {               // Navy. The ACTION hue.
    "500": "#1B3F82",        // 10.10:1
    "600": "#102B63",        // 13.57:1 — primary button fill, link text, headings
    "700": "#0C2150",        // 15.57:1 — hover
    "800": "#081739",        // 17.62:1 — active / pressed
    "900": "#04112A"         // 18.77:1
  },

  "neutral": {               // Blue-grey. Surfaces, borders, body copy.
    "0":   "#FFFFFF",
    "50":  "#F4F8FD",        // table row hover
    "100": "#EEF3FB",        // page background
    "200": "#E6EDF6",        // subtle surface
    "300": "#D5DEEB",        // ⛔ DIVIDERS ONLY — 1.36:1. Never a control border.
    "400": "#A8B5C5",        // ⛔ DECORATIVE ONLY — 2.08:1. Never a border.
    "500": "#7C8CA3",        // interactive control borders (3.42:1)
    "600": "#526075",        // BODY TEXT (6.39 white / 5.73 page)
    "700": "#3E4A5F",        // strong / emphasis text (8.94:1)
    "900": "#04112A"
  },

  "success": {
    "bg":  "#DCFCE7",
    "500": "#1FB65F",        // ⛔ DECORATIVE FILL ONLY — 2.65:1
    "600": "#17994E",        // icon / dot (3.68 white · 3.35 on success/bg)
    "700": "#15803D",
    "800": "#166534"         // TEXT (7.13 white · 6.40 page · 6.49 on success/bg)
  },

  "warning": {
    "bg":  "#FEF3C7",
    "500": "#DE8C0B",        // ⛔ DECORATIVE FILL ONLY — 2.67:1
    "600": "#C2740A",        // icon on white (3.62:1)
    "700": "#B45309",        // icon / dot on warning/bg (4.51:1)
    "800": "#854D0E"         // TEXT (6.85 white · 6.15 page)
  },

  "danger": {
    "bg":  "#FEE2E2",
    "600": "#DC2626",        // fill + white-label button (4.83:1). ⛔ NOT body text (4.33 on page).
    "700": "#B91C1C",        // hover fill (6.47:1)
    "800": "#991B1B"         // TEXT (8.31 white · 7.46 page) — the model triad
  }
}
```

**`info` has no primitives.** It aliases the brand ramp: `info-bg → brand/50`, `info-icon → brand/600`, `info-text → brand/700`. The hexes are identical.

**Retired.** `#18B9E7` (duplicate blue) · `#596FF2` (unrelated indigo, no system role) · `#6D7D99` (old body text — **failed AA at 4.16:1 on white**).

---

## §2 — `2. Semantic` (47 variables)

Figma collection `VariableCollectionId:612:2` · mode `Light` (add `Dark` here later — the alias layer is what makes that a one-day job).
**44 aliased into `1. Primitives`. 3 locked direct values (§2.2).**

```css
:root {
  /* ── Surfaces ─────────────────────────────────────── */
  --bg-page:              #EEF3FB;   /* → neutral/100 */
  --bg-surface:           #FFFFFF;   /* → neutral/0   */
  --bg-surface-subtle:    #E6EDF6;   /* → neutral/200 */
  --bg-surface-hover:     #F4F8FD;   /* → neutral/50  */
  --bg-overlay:  rgb(4 17 42 / 0.18);/* 🔒 LOCKED — see §2.2 */

  /* ── Text — all ≥4.5:1 on BOTH #FFFFFF and #EEF3FB ── */
  --text-primary:         #102B63;   /* → primary/600  13.57 / 12.18 */
  --text-body:            #526075;   /* → neutral/600   6.39 /  5.73 */
  --text-strong:          #3E4A5F;   /* → neutral/700   8.94 /  8.02 */
  --text-inverse:         #FFFFFF;   /* → neutral/0     */
  --text-disabled:        #7C8CA3;   /* → neutral/500 — WCAG 1.4.3 exempt */
  --text-link:            #0B7396;   /* → brand/700     5.38 /  4.82 */

  /* ── Borders ──────────────────────────────────────── */
  --border-divider:       #D5DEEB;   /* → neutral/300 — hairlines only */
  --border-control:       #7C8CA3;   /* → neutral/500 (3.42:1) */
  --border-control-hover: #6B7A91;   /* 🔒 LOCKED — see §2.2 */
  --border-control-active:#526075;   /* → neutral/600 — MUST darken on press */
  --border-focus:         #0E92BC;   /* → brand/600 (3.59:1) */

  /* ── Actions ──────────────────────────────────────── */
  --action-primary:        #102B63;  /* → primary/600 */
  --action-primary-hover:  #0C2150;  /* → primary/700 */
  --action-primary-active: #081739;  /* → primary/800 */
  --action-danger:         #DC2626;  /* → danger/600  */
  --action-danger-hover:   #B91C1C;  /* → danger/700  */
  --action-danger-active:  #991B1B;  /* → danger/800  */
  --action-disabled-bg:    #D5DEEB;  /* → neutral/300 */
  --action-disabled-text:  #526075;  /* → neutral/600 (4.71:1 on the disabled fill) */

  /* ── Accent (brand cyan). FILL ONLY. ──────────────── */
  --accent-brand:          #16B7E7;  /* → brand/500 — logo, illustration, decorative bars */
  --accent-emphasis:       #0E92BC;  /* → brand/600 — active-tab underline, selected indicator */

  /* ── Feedback triads (fill · icon · bg · text) ────── */
  --feedback-success-fill: #1FB65F;  /* → success/500 */
  --feedback-success-icon: #17994E;  /* → success/600 */
  --feedback-success-bg:   #DCFCE7;  /* → success/bg  */
  --feedback-success-text: #166534;  /* → success/800 */

  --feedback-warning-fill: #DE8C0B;  /* → warning/500 */
  --feedback-warning-icon: #B45309;  /* → warning/700 */
  --feedback-warning-bg:   #FEF3C7;  /* → warning/bg  */
  --feedback-warning-text: #854D0E;  /* → warning/800 */

  --feedback-danger-fill:  #DC2626;  /* → danger/600  */
  --feedback-danger-icon:  #DC2626;  /* → danger/600  */
  --feedback-danger-bg:    #FEE2E2;  /* → danger/bg   */
  --feedback-danger-text:  #991B1B;  /* → danger/800  */

  --feedback-info-fill:    #16B7E7;  /* → brand/500 */
  --feedback-info-icon:    #0E92BC;  /* → brand/600 */
  --feedback-info-bg:      #E4F6FD;  /* → brand/50  */
  --feedback-info-text:    #0B7396;  /* → brand/700 */

  /* ── Table surfaces ───────────────────────────────── */
  --table-header-bg:       #EEF3FB;  /* → neutral/100 */
  --table-row-bg:          #FFFFFF;  /* → neutral/0   */
  --table-row-hover:       #F4F8FD;  /* → neutral/50  */
  --table-row-selected:    #E4F1FB;  /* 🔒 LOCKED — see §2.2 */
  --table-border:          #D5DEEB;  /* → neutral/300 */
}
```

### 2.1 The focus ring is a two-layer construct

```css
:root { --focus-ring: 0 0 0 2px var(--bg-surface), 0 0 0 5px var(--border-focus); }
*:focus-visible { outline: none; box-shadow: var(--focus-ring); }
```

The white offset is **not decoration**. A bare `#0E92BC` ring against the danger fill `#DC2626` measures **1.35:1** — invisible. With the white layer: white-on-danger `4.83:1`, then ring-on-white `3.59:1`.

**In Figma:** two stacked Drop Shadows, `Blur: 0` — `#FFFFFF spread 2` **above** `#0E92BC spread 5`. Figma draws the topmost effect closest to the layer, mirroring CSS `box-shadow` order. The parent frame must have **`Clip content` OFF**.

### 2.2 🔒 Locked / System-derived tokens

These three cannot be aliased. They are **ratified by the Architect** and carry `LOCKED / SYSTEM-DERIVED` in their Figma variable descriptions. **They will not follow a primitive retheme.**

| Token | Value | Why it cannot alias |
|---|---|---|
| `bg/overlay` | `rgb(4 17 42 / 0.18)` | Structural. Figma cannot apply alpha to an opaque primitive. Derived from `neutral/900` @ 18%. |
| `border/control-hover` | `#6B7A91` | No primitive exists. Sits between `neutral/500` (`#7C8CA3`) and `neutral/600` (`#526075`). |
| `table/row-selected` | `#E4F1FB` | Exists in no ramp. Body text on it = `5.56:1`; the 3px `accent/emphasis` indicator = `3.12:1`. |

To un-lock: add two `neutral`-adjacent primitives, then re-point `border/control-hover` and `table/row-selected`. `bg/overlay` can never alias.

---

## §3 — `3. Dimension` (34 variables)

Figma collection `VariableCollectionId:612:50` · mode `Value`.
**Scopes are constrained so the wrong token cannot be picked.**

### 3.1 Spacing — strict 4px grid · scope `GAP`

```css
--space-0:  0px;    --space-5:  20px;
--space-1:  4px;    --space-6:  24px;   /* default section gap      */
--space-2:  8px;    --space-8:  32px;
--space-3:  12px;   --space-10: 40px;
--space-4:  16px;   --space-12: 48px;   /* default component padding at -4 */
                    --space-16: 64px;
```

**Eleven steps. There is no `space-7`, `-9`, `-11`, `-13`, `-14`, `-15`.** Do not create them.

### 3.2 Radius — scope `CORNER_RADIUS`

```css
--radius-xs:   2px;
--radius-sm:   4px;    /* Skeleton bars                    */
--radius-md:   6px;    /* Checkbox                         */
--radius-lg:   8px;    /* Button, Input, TabItem, Tooltip  */
--radius-xl:   12px;   /* Card, Table container, Dropzone, Tabs container */
--radius-2xl:  16px;   /* Modal, swal popup                */
--radius-full: 9999px; /* Chip, Avatar, Toggle, DayCell    */
```

**Concentric radius rule:** an outer container's radius must equal `child radius + padding`. `Tabs` = `--radius-lg (8) + --space-1 (4)` = `--radius-xl (12)`.

### 3.3 Icon sizes — scope `WIDTH_HEIGHT`

```css
--size-icon-sm:  16px;   /* Button[sm,md], InlineError, Checkbox glyph */
--size-icon-md:  20px;   /* Alert, Toast, Button[lg], Checkbox box     */
--size-icon-lg:  24px;   /* Modal IconBadge, FileItem FileIcon         */
--size-icon-xl:  32px;   /* Uploader/Dropzone                          */
--size-icon-2xl: 40px;   /* swal IconBadge glyph                       */
--size-icon-3xl: 48px;   /* EmptyState IconBadge                       */
```

**`Icon/14` deliberately has no variable.** It is an optical exception, matched to the 14px label inside a 32px `Chip`. Binding it would legitimise 14px as a reusable step. It is also the only icon size off the 4px grid, and it stays that way.

> Renamed from `--size-icon-xxl` → **`--size-icon-2xl`** to align with `--radius-2xl`.

### 3.4 Control heights — scope `WIDTH_HEIGHT`

```css
--size-control-sm: 32px;   /* Button[sm]                        */
--size-control-md: 40px;   /* Button[md], TabItem, DatePicker field, CheckboxField row */
--size-control-lg: 48px;   /* Button[lg], Tabs container        */
```

**Derive these from padding + line-height. Never type them.** `Button[md]` = `10 + 20 + 10 = 40`. `TabItem` = `8 + 24 + 8 = 40`. If a component's height does not fall out of its padding, the padding is wrong.

### 3.5 Table column widths — scope `WIDTH_HEIGHT`

```css
--table-col-checkbox:   48px;
--table-col-user:      280px;   /* the one Fill-container column */
--table-col-certCode:  240px;
--table-col-expiryDate:160px;
--table-col-certAge:   160px;
--table-col-status:    180px;
--table-col-actions:   140px;
```

**Bind the header cell width AND the body cell width to the same variable.** This is the mechanism that makes column drift structurally impossible. Exactly one column (`user`) is `Fill container`; the rest are `Fixed`.

### 3.6 Border widths

```css
--border-width-thin:  1px;
--border-width-thick: 2px;
```

---

## §4 — Typography (Sarabun)

**The font is `Sarabun`, not `Prompt`.** Sarabun is the Thai government standard face, has true weight cuts, and holds legibility at 14px in dense table cells. Verified installed in the Figma file with 16 styles.

**The 600 weight is `SemiBold` — one word, no space.** `Sarabun Semi Bold` will throw `Cannot write to node with unloaded font`.

```css
--font-family-base: 'Sarabun', 'Noto Sans Thai', Arial, sans-serif;
--font-weight-regular:  400;
--font-weight-semibold: 600;
--font-weight-bold:     700;
```

### 4.1 Three mandatory Figma settings

- **`Vertical trim: Standard`** — never `Cap height to baseline`. That trim clips สระบน and วรรณยุกต์ (`ิ ี ึ ื` + `่ ้ ๊ ๋`) off the top of every string.
- **`Resizing: Auto height`** on every text layer. Never a fixed height.
- **`Letter spacing: 0`.** Thai is never tracked — it breaks glyph-cluster shaping of tone marks.

### 4.2 The scale — line-height is **absolute px**, never `Auto`

| Figma Text Style | Size | Line-height | Ratio | Weight | Applied to |
|---|---:|---:|---:|---:|---|
| `heading/xl` | 28px | **40px** | 1.43 | 700 | Page title |
| `heading/lg` | 24px | **34px** | 1.42 | 700 | Section title |
| `heading/md` | 20px | **30px** | 1.50 | 600 | Card / modal title |
| `heading/sm` | 16px | **24px** | 1.50 | 600 | Subsection |
| `body/lg` | 16px | **26px** | 1.63 | 400 | Lead paragraph |
| **`body/md`** | 14px | **24px** | 1.71 | 400 | **Default body — multi-line Thai** |
| `body/md-strong` | 14px | **24px** | 1.71 | 600 | Emphasis, `TabItem` label |
| `label/md` | 14px | **20px** | 1.43 | 600 | Form labels (single-line) |
| `button/md` | 14px | **20px** | 1.43 | 600 | Button labels (single-line) |
| `table/header` | 12px | **20px** | 1.67 | 600 | Column headers |
| `table/cell` | 14px | **22px** | 1.57 | 400 | Table cells — **density floor** |
| `meta/md` | 12px | **20px** | 1.67 | 400 | Timestamps, helper text |
| `number/display` | 20px | **28px** | 1.40 | 700 | Summary card figures |

**Rules.** Line-height ratio **≥ 1.55 for any text that can wrap.** `1.40–1.43` is permitted *only* for guaranteed single-line labels inside a padded frame, where the frame padding — not the line box — provides vertical room. `table/cell` at **22px** is the absolute minimum; for density reduce **padding**, never line-height. Apply `font-variant-numeric: tabular-nums` to every numeric, date, and certificate-serial column.

---

## §5 — Elevation · Motion · Stacking

Defined in `E-CMIS-Phase3-Hybrid-Spec.md` **§0.2**. Reproduced here for completeness.

```css
:root {
  --elevation-sm: 0 1px  2px  rgb(4 17 42 / 0.06);   /* cards, FileItem, selected TabItem */
  --elevation-md: 0 4px  12px rgb(4 17 42 / 0.10);   /* dropdowns, popovers, DatePicker   */
  --elevation-lg: 0 12px 32px rgb(4 17 42 / 0.16);   /* Modal, Toast, swal popup          */

  --motion-fast: 150ms;  --motion-base: 200ms;  --motion-slow: 300ms;
  --motion-ease: cubic-bezier(0.2, 0, 0, 1);

  --z-dropdown: 1000;  --z-overlay: 1100;  --z-modal: 1110;
  --z-popover:  1200;  --z-toast:   1300;   /* toasts above modals AND .swal2-container */
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; }
}
```

**Figma Effect Styles.** Each is a single **Drop shadow**, **Spread `0`**, colour **`#04112A`**:

| Effect Style | X | Y | Blur | Spread | Alpha |
|---|---:|---:|---:|---:|---:|
| `elevation/sm` | `0` | `1` | `2` | `0` | **6%** |
| `elevation/md` | `0` | `4` | `12` | `0` | **10%** |
| `elevation/lg` | `0` | `12` | `32` | `0` | **16%** |

Shadows derive from `neutral/900` `#04112A`, not pure black — keeping them in the navy family and matching `--bg-overlay`. **This is the only sanctioned raw hex in Figma**, because a colour variable cannot be bound to a shadow.

---

## §6 — Contrast Reference (measured, WCAG 2.1)

Every pair below was computed, not estimated. **Text ≥ 4.5:1 · non-text UI ≥ 3:1.**

| Foreground | Background | Ratio | Verdict |
|---|---|---:|---|
| `primary/600` `#102B63` | white | **13.57** | ✅ |
| `neutral/600` `#526075` | white | **6.39** | ✅ body text |
| `neutral/600` `#526075` | `#EEF3FB` | **5.73** | ✅ |
| `neutral/500` `#7C8CA3` | white | **3.42** | ✅ control border |
| `brand/600` `#0E92BC` | white | **3.59** | ✅ focus ring, underline |
| `brand/700` `#0B7396` | white | **5.38** | ✅ link text |
| **`brand/500` `#16B7E7`** | white | **2.34** | ❌ **fails even 3:1** |
| `danger/800` `#991B1B` | `danger/bg` | **6.80** | ✅ the model triad |
| `success/800` `#166534` | `success/bg` | **6.49** | ✅ |
| `success/600` `#17994E` | `success/bg` | **3.35** | ✅ icon |
| `success/500` `#1FB65F` | `success/bg` | **2.42** | ❌ never the accent bar |
| `warning/800` `#854D0E` | `warning/bg` | **6.15** | ✅ |
| `warning/700` `#B45309` | `warning/bg` | **4.51** | ✅ icon |
| `warning/500` `#DE8C0B` | white | **2.40** | ❌ never the accent bar |
| `danger/600` `#DC2626` | white | **4.83** | ✅ fill; ❌ body text on `#EEF3FB` (4.33) |
| `brand/600` `#0E92BC` | `#E6EDF6` | **3.04** | ⚠️ progress fill — 0.04 headroom |
| `#FFFFFF` | `#E6EDF6` | **1.18** | ⚠️ `Tabs` selected pill — `aria-selected` mandatory |
| **RETIRED** `#6D7D99` | white | **4.16** | ❌ old body text, failed AA |

---

## §7 — Figma Binding Map

| Collection | ID | Mode | Vars | Publishing |
|---|---|---|---:|---|
| `1. Primitives` | `VariableCollectionId:611:2` | `Value` | 39 | **hidden** |
| `2. Semantic` | `VariableCollectionId:612:2` | `Light` | 47 | published |
| `3. Dimension` | `VariableCollectionId:612:50` | `Value` | 34 | published |
| | | | **120** | |

**Scope constraints — a designer physically cannot pick the wrong token:**

| Group | Figma scope |
|---|---|
| `bg/*`, `action/*` (fills), `feedback/*-bg`, `feedback/*-fill`, `table/*-bg`, `table/row-*` | `FRAME_FILL`, `SHAPE_FILL` |
| `text/*`, `feedback/*-text`, `action/disabled-text` | `TEXT_FILL` |
| `border/*`, `table/border` | `STROKE_COLOR` |
| `feedback/*-icon` | `SHAPE_FILL`, `TEXT_FILL`, `STROKE_COLOR` |
| `accent/*` | `FRAME_FILL`, `SHAPE_FILL`, `STROKE_COLOR` |
| `space/*` | `GAP` |
| `radius/*` | `CORNER_RADIUS` |
| `size/icon/*`, `size/control/*`, `table/col/*` | `WIDTH_HEIGHT` |

---

## §8 — Known Gaps

- **`--gold` `#CBA258` / `--gold-light` `#E3C27E`** exist in `wwwroot/style.css` and in **no design artifact**. At `2.37:1` and `1.71:1` neither can be text or a border. **Not represented in any ramp.** Decide: delete, or promote to a real ramp with a passing text shade.
- **`--case-black` `#111111` / `--case-red` `#C0392B`** — เลขคดีดำ / เลขคดีแดง. Both pass as text (18.88, 5.44). They are **domain semantics, not feedback semantics** and must not collapse into `--feedback-danger-*`. A red case number is not an error. They belong in a `case/` group, and the distinction must carry a **label and a glyph**, never hue alone.
- **No `Dark` mode.** `2. Semantic` ships `Light` only. The `@sweetalert2/theme-dark` CSS link must stay removed until a `Dark` mode exists.
