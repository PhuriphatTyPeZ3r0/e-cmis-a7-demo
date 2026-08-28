# E-CMIS Design System — Phase 3 Spec Sheet (Hybrid)
### Overlays · Feedback · Domain Components · Signature Flow
**Supersedes:** the "delete SweetAlert2" directive in the previous Phase 3 draft.
**Depends on:** Rebuild Spec Sheet v2.0.
**Revision r5.** Variable foundation is **LIVE in Figma** (120 variables, 3 collections). `--size-icon-xxl` **renamed** to `--size-icon-2xl`; `size/control/*` added. Three semantic tokens ratified as **Locked / System-derived**. Token ramps materialised to `E-CMIS-Design-Foundation-v2.0.md` — that file is now the **source of truth** for every colour, space, radius, and size.
**Revision r4.** Resolves **C6** (Tabs container-fill inversion), **C7** (Checkbox `20px` ratified), **C8** (icon size variables added to `3. Dimension`). All Figma Maker Checklist blockers cleared.
**Revision r3 —** adds §7 (Icon Library · Checkbox · Tabs[pill]); raises **C6** (Tabs selected-pill boundary) and **C7** (Checkbox box-size derivation).
**Revision r2 —** adds §0.2 (elevation / motion / stacking tokens); resolves conflicts **C1** (`DayGrid` sizing) and **C2** (`SignatureCanvas` width). Both resolutions approved by the operator.

---

## §0 — Stack Reality Check

| Assumption in v2.0 / prior Phase 3 | Actual | Consequence |
|---|---|---|
| React / Next.js | **ASP.NET Core — Blazor Server + MVC Razor** | Custom Modal is a `.razor` component over native `<dialog>`, not Radix. |
| Token pipeline (Style Dictionary / Tailwind) | **None. No `package.json`.** | Tokens ship as plain CSS custom properties in `wwwroot/style.css :root`. Export from Figma Variables manually or via a "Variables → CSS" plugin. |
| SweetAlert2 not themeable | **67 `--swal2-*` CSS variables** (verified against `sweetalert2@11`, latest `11.26.25`) | Theming via variables works. Buttons and icons need two extra mechanisms — see §1.1. |
| One token vocabulary | **Three.** Figma labels, v2.0 semantic layer, and `wwwroot/style.css` | Must reconcile before anything else. See §5. |

**Icons:** `bootstrap-icons@1.11.3` is already loaded from jsDelivr in both `Components/App.razor:12` and `Views/Shared/_Layout.cshtml:16`. Every `bi-*` name in this document resolves today. No new dependency.

### 0.1 Three live bugs to fix in the first commit

```razor
@* Components/App.razor:19  AND  Views/Shared/_Layout.cshtml:23 *@

@* ❌ DELETE. Loads a dark SweetAlert2 theme on any dark-mode OS,
   while the rest of E-CMIS has no dark mode. Dialogs render dark
   on a light app. v2.0's Semantic collection ships `Light` only. *@
<link href="https://cdn.jsdelivr.net/npm/@@sweetalert2/theme-dark@5/dark.css"
      rel="stylesheet" media="(prefers-color-scheme: dark)">

@* ❌ Floating major. A minor release can change class names.  *@
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
@* ✅ Pin it. *@
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.26.25"></script>
```

> **Reinstate the dark theme only when `2. Semantic` ships a `Dark` mode and the app honours it.** Until then it is a defect, not a feature.

### 0.2 Elevation, Motion & Stacking Tokens

Modals, toasts, popovers, and the skeleton pulse cannot be built without elevation, motion, and stacking primitives. v2.0 did not ship them. **Do not define shadows, durations, or `z-index` values inline per component** — that is exactly how `#166534` and `#5F6F86` leaked into the original Figma file.

Add these to the `3. Dimension` collection as new `elevation/`, `motion/`, and `z/` groups. **These are the only values in this document that do not originate in v2.0.**

```css
/* ── Elevation. Shadows derive from neutral-900 #04112A, NOT pure black —
      this keeps them in the navy family and matches --bg-overlay,
      which already uses navy-900 @ 18%.                                  */
:root {
  --elevation-sm: 0 1px  2px  rgb(4 17 42 / 0.06);   /* cards, FileItem            */
  --elevation-md: 0 4px  12px rgb(4 17 42 / 0.10);   /* dropdowns, popovers, tooltips, DatePicker */
  --elevation-lg: 0 12px 32px rgb(4 17 42 / 0.16);   /* Modal, Toast, swal popup    */

  /* ── Motion */
  --motion-fast:  150ms;   /* hover, focus, chip                    */
  --motion-base:  200ms;   /* toast in/out, dropdown, PIN error shake */
  --motion-slow:  300ms;   /* modal enter                           */
  --motion-ease:  cubic-bezier(0.2, 0, 0, 1);

  /* ── Stacking */
  --z-dropdown: 1000;
  --z-overlay:  1100;
  --z-modal:    1110;
  --z-popover:  1200;
  --z-toast:    1300;   /* toasts sit above modals AND above .swal2-container —
                           a save error raised during a dialog must stay visible */
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; }
}
```

**In Figma:** `--elevation-*` become three **Effect Styles** named `elevation/sm`, `elevation/md`, `elevation/lg`. Each is a single **Drop shadow** with **Spread `0`** and colour **`#04112A`**:

| Effect Style | X | Y | Blur | Spread | Colour | Alpha |
|---|---:|---:|---:|---:|---|---:|
| `elevation/sm` | `0` | `1` | `2` | `0` | `#04112A` | **6%** |
| `elevation/md` | `0` | `4` | `12` | `0` | `#04112A` | **10%** |
| `elevation/lg` | `0` | `12` | `32` | `0` | `#04112A` | **16%** |

Motion and stacking have no Figma equivalent — record them in each component's **Description** field so they survive handoff.

---

## §1 — Hybrid Overlay Architecture

### 1.0 The Boundary Rule — decide once, enforce in lint

A dialog goes to **SweetAlert2** if and only if **all four** are true:

1. It contains **no form fields** the user must fill.
2. It has **≤ 2 buttons**.
3. It requires **no async validation** before closing.
4. Its content is **title + text + icon only** — no custom layout.

Everything else is a **Custom Modal**. There is no third option and no judgement call.

| Dialog | System | Why |
|---|---|---|
| `บันทึกข้อมูลสำเร็จ` | **SweetAlert2** | Acknowledge only |
| `เกิดข้อผิดพลาด` | **SweetAlert2** | Acknowledge only |
| `ยืนยันการลบใบรับรอง DS-000001?` | **SweetAlert2** | Yes/No, no fields |
| `ยืนยันการส่งเรื่องร้องเรียน?` | **SweetAlert2** | Yes/No, no fields |
| `ผลการตรวจสอบประวัติบุคคล` | **SweetAlert2** | Acknowledge only |
| **`SignaturePad`** | **Custom Modal** | Canvas + tabs + toolbar |
| **`PinConfirm`** | **Custom Modal** | 6 fields, async validation, lockout |
| **`SignaturePlacement`** | **Custom Modal** | Drag/resize on a PDF |
| **`FileUploader` dialog** | **Custom Modal** | File list, progress, retry |
| **Any dialog with a `<form>`** | **Custom Modal** | Always |

> 🔴 **Ban `Swal.fire({ input: … })` outright.** SweetAlert2's `input`, `inputValidator`, and `preConfirm` options are exactly what will tempt a developer to build the PIN modal inside SweetAlert2. It renders in a portal outside the Blazor render tree, so it gets no `@bind`, no `EditContext`, no validation, and no `IJSRuntime` lifecycle. Add a lint rule or a code-review checklist item. This is the single rule that keeps the hybrid from collapsing into one badly-behaved system.

---

### 1.1 SweetAlert2 Theming Reference

#### 1.1.1 Figma: a reference frame, not components

Rename and rebuild the existing `Sweet Alert Library` frame (`535:320`):

- **Frame name:** `📐 REFERENCE / SweetAlert2 Theme — DO NOT INSTANCE`
- **Lock the frame.** Designers must never draw a new SweetAlert2 dialog. They pick one of the five below and name it in the spec.
- These are **documentation artboards**, not Figma Components. They will never be instanced, because in code they are produced by `Swal.fire()`, not by a design component.
- **Fix the typos while rebuilding:** frame `Sussess` → `Success`; frame `Alternative` → `Error`; the button label `Erorr` → `ตกลง`. All three would otherwise be copy-pasted into `app.js`.

Five artboards, each annotated with its CSS-variable mapping:

| Artboard | `icon` | `iconHtml` | Buttons |
|---|---|---|---|
| `swal/success` | `success` | `bi-check-circle-fill` | `ตกลง` |
| `swal/error` | `error` | `bi-x-circle-fill` | `ตกลง` |
| `swal/warning` | `warning` | `bi-exclamation-triangle-fill` | `ตกลง` |
| `swal/info` | `info` | `bi-info-circle-fill` | `ตกลงรับทราบ` |
| `swal/confirm` | `question` | `bi-question-circle-fill` | `ยกเลิก` + `ยืนยัน` |

**Geometry (matches the shipped SweetAlert2 DOM, so the artboard is honest):**

- Popup: `400px` wide · `--radius-2xl` (16px) · `--bg-surface` · `elevation/lg`
- Icon: `80×80` circle, **centered**, `--feedback-{type}-bg` fill, 40px `bi-*` glyph in `--feedback-{type}-icon`
- Title: `heading/md` · `--text-primary` · centered
- Text: `body/md` · `--text-body` · centered
- Actions: **centered**, gap `--space-3`, order `[ยกเลิก] [ยืนยัน]`

> **The two dialog systems will not look identical, and that is the correct outcome.** SweetAlert2 is centered — *read and acknowledge*. The Custom Modal is left-aligned with a 48px icon badge — *read and do*. Make it a documented distinction rather than a compromise you keep apologising for. What must match is the **button order** (`ยกเลิก` left, confirm right) and the **token values**.

#### 1.1.2 CSS: three mechanisms, because one is not enough

Verified against `sweetalert2@11.26.25`. **Popup chrome is themeable by variable. Buttons and icons are not** — icons have **zero** `--swal2-{success|error|warning|info|question}` variables (confirmed: grep count `0`), and buttons receive inline styles when `buttonsStyling` is left on.

**Mechanism 1 — variables, for popup chrome.** Add to `wwwroot/style.css`:

```css
/* ── SweetAlert2 → E-CMIS token bridge ─────────────────────────────
   Verified against sweetalert2@11.26.25. Defaults shown in comments. */
:root {
  --swal2-width:            400px;                 /* was 32em      */
  --swal2-background:       var(--bg-surface);     /* was white     */
  --swal2-color:            var(--text-body);      /* was #545454   */
  --swal2-border-radius:    var(--radius-2xl);     /* was 0.3125rem */
  --swal2-border:           none;
  --swal2-backdrop:         var(--bg-overlay);     /* was rgba(0,0,0,.4) */
  --swal2-padding:          0 0 var(--space-6);
  --swal2-container-padding: var(--space-6);
  --swal2-title-padding:    var(--space-4) var(--space-6) 0;
  --swal2-html-container-padding: var(--space-3) var(--space-6) var(--space-2);

  --swal2-actions-justify-content: center;         /* centered = "acknowledge" idiom */
  --swal2-actions-margin:   var(--space-6) 0 0;

  --swal2-outline:          var(--focus-ring);     /* was rgba(100,150,200,.5) */
  --swal2-action-button-focus-box-shadow: var(--focus-ring);
  --swal2-input-focus-box-shadow:         var(--focus-ring);

  --swal2-show-animation:   swal2-show var(--motion-slow) var(--motion-ease);
  --swal2-hide-animation:   swal2-hide var(--motion-fast) forwards;
}

/* SweetAlert2's default container z-index sits below our toasts.
   Pin it to the modal layer so a save-error toast stays visible. */
.swal2-container { z-index: var(--z-modal); }

@media (prefers-reduced-motion: reduce) {
  :root { --swal2-show-animation: none; --swal2-hide-animation: none; }
}
```

> **SweetAlert2's default confirm button is `#7066e0` — an indigo-purple.** That is the exact "AI default" palette the design system exists to avoid. It is currently only masked because `app.js` overrides it inline. Remove the inline override *and* set the variable, or the purple returns.

**Mechanism 2 — `buttonsStyling: false`, for buttons.** This is mandatory. With the default `buttonsStyling: true`, SweetAlert2 applies `confirmButtonColor` as an **inline style**, which outranks `--swal2-confirm-button-background-color` and any class. Turning it off makes SweetAlert2 render bare `<button>` elements that your own `.ecmis-btn` classes style — so the SweetAlert2 confirm button *is literally the E-CMIS Button component*, not a lookalike.

**Mechanism 3 — class overrides, for icons.** Required, because no icon variables exist.

```css
/* Strip SweetAlert2's own icon chrome so bi-* glyphs can show through. */
.swal2-icon {
  border: none !important;
  width: 80px; height: 80px;
  margin: var(--space-6) auto 0;
  border-radius: var(--radius-full);
}
.swal2-icon .swal2-icon-content { font-size: 40px; line-height: 1; }
.swal2-success-ring,
.swal2-success-line-tip,
.swal2-success-line-long,
[class^="swal2-x-mark"] { display: none !important; }

.swal2-icon.swal2-success  { background: var(--feedback-success-bg); color: var(--feedback-success-icon); }
.swal2-icon.swal2-error    { background: var(--feedback-danger-bg);  color: var(--feedback-danger-icon); }
.swal2-icon.swal2-warning  { background: var(--feedback-warning-bg); color: var(--feedback-warning-icon); }
.swal2-icon.swal2-info     { background: var(--feedback-info-bg);    color: var(--feedback-info-icon); }
.swal2-icon.swal2-question { background: var(--bg-surface-subtle);   color: var(--text-body); }

.swal2-title { font: 600 20px/30px var(--font-family-base); color: var(--text-primary); }
.swal2-html-container { font: 400 14px/24px var(--font-family-base); color: var(--text-body); }
```

Contrast, all measured: success icon-on-bg **3.35** · warning **4.51** · danger **3.95** · info **3.23** — all clear the 3:1 non-text floor. Title **13.57**, body **5.81 / 5.73 / 5.23 / 5.75** on the four tinted surfaces.

**The single `Swal.mixin` every call site must use.** Replace the 12+ ad-hoc `Swal.fire({...confirmButtonColor:'#1A2F6B'})` calls in `wwwroot/app.js` with:

```js
// wwwroot/app.js — define once, near the top.
const EcmisSwal = Swal.mixin({
  buttonsStyling: false,            // ← REQUIRED. Kills the inline styles.
  reverseButtons: true,             // ← ยกเลิก left, ยืนยัน right. Matches Custom Modal.
  customClass: {
    confirmButton: 'ecmis-btn ecmis-btn--primary ecmis-btn--md',
    denyButton:    'ecmis-btn ecmis-btn--danger  ecmis-btn--md',
    cancelButton:  'ecmis-btn ecmis-btn--secondary ecmis-btn--md',
  },
  allowOutsideClick: false,         // destructive confirms must be explicit
});

// Success / error / info: acknowledge only.
EcmisSwal.fire({
  icon: 'success',
  iconHtml: '<i class="bi bi-check-circle-fill" aria-hidden="true"></i>',
  title: 'บันทึกสำเร็จ',
  text: 'ระบบบันทึกข้อมูลเรียบร้อยแล้ว',
  confirmButtonText: 'ตกลง',
});

// Destructive confirm: focus the SAFE action.
EcmisSwal.fire({
  icon: 'warning',
  iconHtml: '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>',
  title: 'ยืนยันการลบใบรับรอง',
  text: 'ต้องการลบ DS-000001 (Dev Admin) ใช่หรือไม่? การกระทำนี้ย้อนกลับไม่ได้',
  showCancelButton: true,
  confirmButtonText: 'ลบออก',
  cancelButtonText: 'ยกเลิก',
  focusCancel: true,                                       // ← never pre-focus destroy
  customClass: { confirmButton: 'ecmis-btn ecmis-btn--danger ecmis-btn--md' },
});
```

**Delete every `confirmButtonColor` and `cancelButtonColor` option** — `app.js` lines `299, 772–773, 1204, 1268, 1287, 1358, 1775–1776, 1895–1896, 1965–1966`, and any others. With `buttonsStyling: false` they are dead options; leaving them in guarantees a future developer re-enables styling and gets `#1A2F6B` back.

`focusCancel: true` on every destructive confirm mirrors the Custom Modal rule: **a user who hits `Enter` reflexively must not delete a certificate.**

---

### 1.2 `Modal` — Custom, Figma Component Set

Reserved for complex interaction. In Blazor, implement over the native `<dialog>` element and open with `showModal()` — this gives focus trap, `Esc`-to-close, inert background, and the top layer for free, with no library.

**Properties**

| Property | Type | Values | Default |
|---|---|---|---|
| `tone` | Variant | `neutral` · `info` · `success` · `warning` · `danger` | `neutral` |
| `size` | Variant | `sm` · `md` · `lg` | `md` |
| `actions` | Variant | `single` · `dual` | `dual` |
| `hasIcon` | Boolean | — | `true` |
| `hasCloseButton` | Boolean | — | `true` |
| `title` / `description` | Text | — | — |
| `iconSwap` | Instance swap | `Icon/24/*` | per `tone` |

`5 × 3 × 2 = 30 variants.` Author `size=md` (10 frames), then duplicate.

```
ModalOverlay              ── Fixed viewport · Fill --bg-overlay · z --z-overlay · center × center
└── ModalDialog           ── Vertical AL · Fixed width × HUG height
    │                        Fill --bg-surface · Radius --radius-2xl (16)
    │                        Effect elevation/lg · Clip content ON · max-height 90vh
    │
    ├── ModalHeader       ── Horizontal AL · Fill × Hug · Align top
    │   │                    Padding --space-6 --space-6 --space-4 --space-6   (24/24/16/24)
    │   │                    Gap --space-4
    │   ├── IconBadge     ── [hasIcon] 48×48 · --radius-full
    │   │                    Fill --feedback-{tone}-bg · Icon 24px --feedback-{tone}-icon
    │   ├── HeaderText    ── Vertical AL · FILL × Hug · gap --space-2
    │   │   ├── Title     ── heading/md · --text-primary
    │   │   └── Desc      ── body/md    · --text-body
    │   └── CloseButton   ── [hasCloseButton] Button[ghost, sm] bi-x-lg
    │
    ├── ModalBody         ── Vertical AL · Fill × Hug · gap --space-4
    │                        Padding 0 --space-6 · overflow-y: auto   ← the scrollable region
    │
    └── ModalFooter       ── Horizontal AL · Fill × Hug · Align RIGHT
        │                    Padding --space-6 · Gap --space-3
        ├── Secondary     ── [actions=dual] Button[secondary, md]
        └── Primary       ── Button[md], variant bound to tone
```

**Widths:** `sm 400` · `md 520` · `lg 720` (4px grid).

| `tone` | IconBadge fill | Icon | Icon color | Primary button |
|---|---|---|---|---|
| `neutral` | `--bg-surface-subtle` | `bi-question-circle-fill` | `--text-body` | `primary` |
| `info` | `--feedback-info-bg` | `bi-info-circle-fill` | `--feedback-info-icon` | `primary` |
| `success` | `--feedback-success-bg` | `bi-check-circle-fill` | `--feedback-success-icon` | `primary` |
| `warning` | `--feedback-warning-bg` | `bi-exclamation-triangle-fill` | `--feedback-warning-icon` | `primary` |
| `danger` | `--feedback-danger-bg` | `bi-x-circle-fill` | `--feedback-danger-icon` | **`danger`** |

**Behaviour (annotate in the Figma component description):**

- Only `ModalBody` scrolls. Header and footer stay pinned at `max-height: 90vh`.
- On open, focus the **safe** action. For `tone=danger` that is `ยกเลิก`.
- Overlay click dismisses only when `tone ≠ danger`.
- On close, return focus to the trigger.
- `<dialog>` handles `role="dialog"`, `aria-modal`, focus trap, and `Esc`. Add `aria-labelledby={titleId}` and `aria-describedby={descId}`.

---

## §2 — Feedback & States

### 2.1 `Alert` (Inline Banner)

Fixes the WCAG 1.4.1 violation at `428:75` / `428:80` / `428:85`, where success, warning, and error banners all use an identical `!` glyph, separated by hue alone.

| Property | Type | Values | Default |
|---|---|---|---|
| `type` | Variant | `success` · `warning` · `danger` · `info` | `info` |
| `hasTitle` / `hasAction` / `dismissible` | Boolean | — | `false` |

```
Alert                ── Horizontal AL · FILL × Hug · gap --space-3
│                       Fill --feedback-{type}-bg · Radius --radius-lg · Clip ON
│                       Padding --space-3 --space-4 (LEFT padding 0 — the bar owns it)
├── AccentBar        ── Fixed 4px × FILL · Fill --feedback-{type}-icon
├── Icon             ── 20px · --feedback-{type}-icon · Align top
├── Content          ── Vertical AL · FILL × Hug · gap --space-1
│   ├── Title        ── [hasTitle] body/md-strong · --feedback-{type}-text
│   └── Message      ── body/md · --text-body
├── Action           ── [hasAction] Button[ghost, sm]
└── Dismiss          ── [dismissible] Button[ghost, sm] bi-x-lg
```

> ⚠️ **`AccentBar` uses `--feedback-{type}-icon`, never `--feedback-{type}-fill`.** Measured on their own backgrounds: `success-fill` **2.42** ✗ · `warning-fill` **2.40** ✗ · `info-fill` **2.11** ✗. The `-icon` tokens pass: **3.35 / 4.51 / 3.95 / 3.23**. Same trap that disqualified `brand-500` as an underline. (The existing bar is 5px — off-grid. Use `--space-1`.)

| `type` | Bootstrap Icon | icon / bar | title | body | text ratio |
|---|---|---|---|---|---|
| `success` | **`bi-check-circle-fill`** | `--feedback-success-icon` | `--feedback-success-text` | `--text-body` | 6.49 / **5.81** |
| `warning` | **`bi-exclamation-triangle-fill`** | `--feedback-warning-icon` | `--feedback-warning-text` | `--text-body` | 6.15 / **5.73** |
| `danger` | **`bi-x-circle-fill`** | `--feedback-danger-icon` | `--feedback-danger-text` | `--text-body` | 6.80 / **5.23** |
| `info` | **`bi-info-circle-fill`** | `--feedback-info-icon` | `--feedback-info-text` | `--text-body` | 4.84 / **5.75** |

The triangle is doing real work: it is the only non-circular glyph, discriminable in greyscale and by a red-green dichromat at 20px. `role="alert"` for `danger`; `role="status"` otherwise.

### 2.2 `Toast`

Distinct from `Alert` — transient, floats, announced by a live region. Never a restyled banner.

```
Toast          ── Horizontal AL · HUG × Hug · min-w 320 · max-w 480
│                 Fill --bg-surface   ← NOT the feedback tint; toasts float over arbitrary content
│                 Stroke 1px --border-divider · Radius --radius-lg · Effect elevation/lg
│                 Padding --space-3 --space-4 · Gap --space-3
├── Icon       ── 20px --feedback-{type}-icon   (3.68 / 5.02 / 4.83 / 3.59 on white ✓)
├── Message    ── body/md --text-primary · Hug
├── Action     ── [hasAction] Button[ghost, sm]  "เลิกทำ" / "ลองใหม่"
└── Dismiss    ── Button[ghost, sm] bi-x-lg
```

Same four icons. Container: fixed bottom-right, `--space-6` inset, vertical AL, gap `--space-3`, `z: --z-toast`, max 3 visible.

- Auto-dismiss **4000ms** (matches the existing `เด้งชั่วคราว 3–4 วินาที`). Pause on hover and focus-within.
- **`type=danger` never auto-dismisses.** An error the user did not read is an error that did not happen.
- `aria-live="polite"`, or `assertive` + `role="alert"` for `danger`.
- `--z-toast` sits **above** `--z-modal` **and above `.swal2-container`** (§1.1.2). A save failure raised during a dialog must remain visible.

### 2.3 `EmptyState`

| Property | Type | Values | Default |
|---|---|---|---|
| `size` | Variant | `sm` (in-table) · `md` (page) | `md` |
| `hasAction` / `hasSecondaryAction` | Boolean | — | `true` / `false` |
| `title` / `description` | Text | — | — |
| `iconSwap` | Instance swap | `Icon/48/*` | `bi-inbox` |

```
EmptyState        ── Vertical AL · FILL × Hug · center × center
│                    Gap --space-4 · Padding --space-12 --space-6
│                    min-height 240 (sm) / 320 (md)
├── IconBadge     ── 96×96 · --radius-full · Fill --bg-surface-subtle
│                    Icon 48px · --text-disabled
├── Title         ── heading/sm · --text-primary · center
├── Description   ── body/md · --text-body · center · max-width 360
└── Actions       ── Horizontal AL · Hug · gap --space-3
```

- Icon is `--text-disabled`, **not `--accent-brand`** (2.34:1 — a 48px icon nobody can see defeats the purpose). Legal here only because the icon is `aria-hidden` and the title carries the meaning.
- `max-width: 360px` on the description. Real Thai copy wraps; a full-width centered paragraph is unreadable.
- `role="status"`, so the skeleton → empty transition is announced.
- **Ship two instances: "no data yet" vs "no results for this filter."** Different copy, different CTA (`สร้างรายการแรก` vs `ล้างตัวกรอง`).

### 2.4 `Skeleton` + `TableSkeleton`

A spinner is not a loading state for content. The spinner at `428:97` is for *indeterminate actions* — a button mid-request.

**`Skeleton/Bar`** — `height` variant `h12 · h16 · h20 · h24`. Fill `--bg-surface-subtle`, radius `--radius-sm`, resizing **`Fill × Fixed`** (width comes from the parent cell).

```
TableSkeleton          ── Vertical AL · Fill × Hug · gap 0
└── SkeletonRow ×5     ── Horizontal AL · Fill × Fixed 56   (= density=comfortable)
    │                     Stroke bottom 1px --border-divider
    ├── checkbox       ── w = table/col/checkbox    → Bar h16, 16px
    ├── user           ── w = table/col/user        → Vertical AL: Bar h16 (70%) + Bar h12 (50%)
    ├── certCode       ── w = table/col/certCode    → Bar h16 (60%)
    ├── expiryDate     ── w = table/col/expiryDate  → Bar h16 (55%)
    ├── certAge        ── w = table/col/certAge     → Bar h16 (45%)
    ├── status         ── w = table/col/status      → Bar h24 (88px, --radius-full)
    └── actions        ── w = table/col/actions     → Bar h24 (64px)
```

- **Stagger the widths** (70/50/60/55/45%). Uniform bars read as a broken grid, not as loading content.
- **Bind cell widths to the same `table/col/*` variables as the real table.** This is why the skeleton shifts layout by 0px on resolve.
- Motion: `opacity 1 → 0.4 → 1`, `1500ms ease-in-out infinite`. Under `prefers-reduced-motion`, render **static** — a pulsing screen is a vestibular trigger, and shape alone still communicates.
- a11y: wrapper `aria-busy="true"` + visually-hidden `กำลังโหลดข้อมูล`. Every bar `aria-hidden="true"`.
- `--bg-surface-subtle` on `--bg-surface` is **1.18:1**. Correct and intentional — skeletons are decorative and exempt. Do not "fix" it.

---

## §3 — Complex Domain Components

### 3.1 `DatePicker` — E-CMIS Standard (พ.ศ.)

**Two bugs first.** `428:38` reads `พฤษภาคม 2027`; the table reads `29/06/2027`. Every displayed year is **543 short**. And the frame is named `addon/Date / Time Picker` but contains no time picker — rename it to `DatePicker`, and build `TimePicker` separately or drop the promise.

```
พ.ศ. = ค.ศ. + 543

STORE      Gregorian ISO-8601, UTC        2027-06-29T00:00:00Z
TRANSMIT   Gregorian ISO-8601             2027-06-29
DISPLAY    Buddhist Era, Asia/Bangkok     29/06/2570

NEVER persist, sort, compare, or serialise a พ.ศ. year.
Convert at the presentation boundary ONLY. A พ.ศ. year that reaches
the database is a data-corruption incident, not a formatting bug.
```

Input mask `DD/MM/YYYY` (พ.ศ. year). Placeholder `วว/ดด/ปปปป`.

```
DatePicker/Calendar    ── Vertical AL · Fixed 320 × Hug
│                         Fill --bg-surface · Radius --radius-lg · Effect elevation/md
│                         Padding --space-4 · Gap --space-3
├── CalendarHeader     ── Horizontal AL · Fill × Fixed 40 · gap --space-1
│     [ bi-chevron-double-left ] [ bi-chevron-left ]
│     [ MonthYearButton · ghost · FILL · "พฤษภาคม 2570" → cycles view ]
│     [ bi-chevron-right ] [ bi-chevron-double-right ]
├── WeekdayHeader      ── Horizontal AL · 7 × Fixed 40 · meta/md · --text-body
│                         อา  จ  อ  พ  พฤ  ศ  ส          ← SUNDAY-FIRST
├── DayGrid            ── Vertical AL · ALWAYS 6 × Week · Week = 7 × DayCell (40×40)
├── MonthGrid          ── [view=months] 3×4 · Fixed 96×48 · มกราคม … ธันวาคม
├── YearGrid           ── [view=years]  3×4 · Fixed 96×48 · 2565 … 2576  (12-year page, พ.ศ.)
└── CalendarFooter     ── space-between · Stroke top 1px --border-divider
                          [ ghost "วันนี้" ]   [ ghost "ล้าง" ]
```

**Properties:** `view`: `days · months · years` · `mode`: `single · range` · `hasPresets`: Boolean

| `DayCell` state | Fill | Text | Stroke | Measured |
|---|---|---|---|---|
| `default` | transparent | `--text-body` | — | **6.39** ✅ |
| `hover` | `--bg-surface-hover` | `--text-body` | — | **5.99** ✅ |
| `today` | transparent | `--text-primary` (600) | 1px `--accent-emphasis` | ring **3.59** ✅ |
| `selected` | `--action-primary` | `--text-inverse` | — | **13.57** ✅ |
| `disabled` / `outsideMonth` | transparent | `--text-disabled` | — | 3.42 — *1.4.3 exempt* |
| `rangeStart` / `rangeEnd` | `--action-primary` | `--text-inverse` | — | **13.57** ✅ |
| `rangeMiddle` | `--feedback-info-bg` | `--text-primary` | — | **12.21** ✅ |

- **`DayGrid` is always exactly 6 rows,** padded with `outsideMonth` cells. Otherwise the popover height jumps between months and the footer moves under the cursor.
- **The `MonthYearButton` + double-chevrons are the navigation fix.** The current picker exposes only `‹` `›` — reaching พ.ศ. 2560 from 2570 takes ~120 clicks. Clicking the label opens `view=years`: 2 clicks.
- **`outsideMonth` and `disabled` MUST be non-interactive.** `--text-disabled` is 3.42:1 — below the 4.5:1 text floor, legal *only* under the WCAG 1.4.3 disabled exemption. If they ever become clickable they must switch to `--text-body`.
- **Do not color อา red and ส purple.** That is a color-only indicator, and it is decorative custom, not information.
- `hasPresets` adds a 140px left rail: `วันนี้` · `7 วันล่าสุด` · `30 วันล่าสุด` · `เดือนนี้` · **`ปีงบประมาณนี้`** (1 ต.ค. – 30 ก.ย.). Required for `วิเคราะห์/รายงาน`.
- a11y: `role="grid"`, arrow keys, `PageUp/Down` = month, `Shift+PageUp/Down` = year. Each cell `aria-label="29 มิถุนายน 2570"` — full Thai date, spelled month, พ.ศ. year.

#### 3.1.1 Grid sizing — **RESOLVED (C1 = Option A)**

`Calendar` is `320` wide with `--space-4` padding, giving a **288px content box**. `MonthGrid` / `YearGrid` are `3 × 96 = 288` — an exact fit. `DayGrid` is `7 × 40 = 280` — **8px short.**

**Resolution:** `DayGrid` and `WeekdayHeader` are set to **Hug (280px)** and **centre-aligned** inside `Calendar`, yielding 4px optical gutters on the day grid only.

| Layer | Width | Height |
|---|---|---|
| `DayCell` | **Fixed `40`** | **Fixed `40`** |
| `Week` | **Hug** (= 280) | **Hug** (= 40) |
| `DayGrid` | **Hug** (= 280) | **Hug** (= 240) |
| `WeekdayHeader` | **Hug** (= 280) | **Fixed `40`** |
| `Calendar` | **Fixed `320`** | **Hug** |

- `Calendar`'s auto-layout **horizontal alignment must be `Center`**, so the 8px surplus splits evenly.
- ⛔ **Never set `DayGrid` to `Fill`.** It would force each `DayCell` to `41.14px` — off the 4px grid, and a direct reintroduction of the fractional-coordinate defect found in 210 nodes during the v2.0 audit.
- **Accepted trade-off:** the day grid has 4px side gutters; the month and year grids have 0px. This is invisible at 320px and is the only option in which every cell stays on the grid.

### 3.2 `FileUploader`

**`Uploader/Dropzone`** — `state`: `idle · hover · dragover · disabled · error`

```
Dropzone           ── Vertical AL · FILL × Hug · center × center
│                     Radius --radius-xl · Padding --space-8 · Gap --space-3
│                     Stroke 2px DASHED (Figma: Stroke → Advanced → Dash 8, Gap 6)
├── Icon           ── 32px bi-cloud-arrow-up-fill
├── Title          ── body/md-strong · --text-primary  "ลากไฟล์ .p12 / .pfx มาวางที่นี่"
├── Hint           ── meta/md · --text-body            "หรือกดเลือกไฟล์ · สูงสุด 5 MB"
└── BrowseButton   ── Button[secondary, sm]  "เลือกไฟล์"
```

| `state` | Fill | Stroke | Measured |
|---|---|---|---|
| `idle` | `--bg-surface` | `--border-control` | **3.42** ✅ |
| `hover` | `--bg-surface-hover` | `--border-control-hover` | **4.09** ✅ |
| `dragover` | `--feedback-info-bg` | `--border-focus`, **2px solid** | **3.23** ✅ |
| `disabled` | `--bg-surface-subtle` | `--border-divider` | *exempt* |
| `error` | `--feedback-danger-bg` | `--feedback-danger-icon`, 2px solid | **3.95** ✅ |

- On `dragover` the border goes **dashed → solid**, not merely recolored. That is a non-color state cue.
- `BrowseButton` is a real `<button>` over a visually-hidden `<input type="file">`. **The dropzone is not keyboard-operable; the button is.** Drag-and-drop must never be the only path (SC 2.1.1).

**`Uploader/FileItem`** — `state`: `uploading · success · error · rejected` · `hasRemove`: Boolean

```
FileItem              ── Horizontal AL · FILL × Hug · center
│                        Fill --bg-surface · Stroke 1px --border-divider
│                        Radius --radius-lg · Padding --space-3 --space-4 · Gap --space-3
│                        Effect elevation/sm
├── FileIcon          ── 24px
├── Info              ── Vertical AL · FILL × Hug · gap --space-1
│   ├── Filename      ── body/md · --text-primary · truncate MIDDLE
│   ├── Meta          ── meta/md
│   └── ProgressTrack ── [uploading] FILL × Fixed 8 · --radius-full · --bg-surface-subtle
│       └── ProgressFill ── CHILD, not sibling. Fixed % × FILL · --accent-emphasis · --radius-full
└── Actions           ── Horizontal AL · Hug · gap --space-1
```

| `state` | FileIcon | Icon color | Meta | Surface | Actions |
|---|---|---|---|---|---|
| `uploading` | `bi-file-earmark-lock-fill` | `--text-disabled` | `1.2 MB · 65%` / `--text-body` | default | `bi-x-lg` ghost |
| `success` | `bi-file-earmark-lock-fill` | `--feedback-success-icon` | `อัปโหลดสำเร็จ` / `--text-body` | default | `bi-check-circle-fill` + `bi-trash` |
| `error` | `bi-exclamation-triangle-fill` | `--feedback-danger-icon` | `อัปโหลดไม่สำเร็จ` / `--feedback-danger-text` | `--feedback-danger-bg` + 1px `--feedback-danger-icon` | `bi-arrow-clockwise` "ลองใหม่" + `bi-trash` |
| `rejected` | `bi-file-earmark-x` | `--feedback-danger-icon` | `ชนิดไฟล์ไม่รองรับ (.pdf) — รองรับเฉพาะ .p12 / .pfx` | as `error` | `bi-trash` only |

> ⚠️ **`ProgressFill` on `ProgressTrack` measures 3.04:1** — it passes with 0.04 of headroom. Do not lighten the track to `--bg-surface-hover`, and do not lighten the fill to `--accent-brand` (2.34:1). If someone asks for "softer," the answer is no.

- The audit found the progress fill was a **sibling** of its track (`428:100` / `428:101`). It must be a **child**.
- **`rejected` ≠ `error`.** Rejected = client-side type/size refusal, no request was made, retry is meaningless. Error = the request failed, retry is the primary action. Never silently drop a rejected file.
- Truncate the filename in the **middle**. `sample-certificate-2570-final.p12` truncated at the end loses `.p12` — the most important token in the string.
- `FileList`: `role="list"`, `aria-live="polite"`. `ProgressFill`: `role="progressbar"` + `aria-valuenow/min/max`.

---

## §4 — Digital Signature Flow

**All four components below use the Custom Modal. None may use SweetAlert2** — every one carries a form, async validation, or custom layout, and therefore fails the §1.0 boundary rule on at least one clause.

```
[1] เลือกเอกสาร  → PdfPreview
[2] วางลายเซ็น    → SignaturePlacement   (§4.4)
[3] สร้างลายเซ็น  → SignaturePad         (§4.1)
[4] ยืนยันตัวตน   → PinConfirm           (§4.2)
[5] ผลลัพธ์       → Toast + Badge/SignatureVerification (§4.3)
```

### 4.1 `SignaturePad`

Hosted in `Modal[size=lg, tone=neutral, hasIcon=false]`. Title `ลงลายมือชื่อ`. `state`: `empty · drawing · filled · disabled`.

```
ModalBody
├── Tabs                 ── Tabs[pill]   ← the SC 2.1.1 conformance path, MANDATORY
│     [ วาดลายเซ็น ] [ อัปโหลดรูปลายเซ็น ] [ ใช้ลายเซ็นที่บันทึกไว้ ]
├── SignatureCanvas      ── Fixed 640 × 240 · Fill --bg-surface
│   │                       Stroke 1px --border-control (3.42 ✓) · Radius --radius-lg
│   ├── BaselineGuide    ── 1px --border-divider, inset --space-6, at 75% height (aria-hidden)
│   └── Hint             ── meta/md · --text-disabled · "ลงลายมือชื่อในกรอบนี้" (hides on first stroke)
├── Toolbar              ── Horizontal AL · Align RIGHT · gap --space-2
│     [ ghost bi-arrow-counterclockwise "เลิกทำ" ]  [ ghost bi-eraser "ล้าง" ]
└── SaveCheckbox         ── "บันทึกลายเซ็นนี้ไว้ใช้ครั้งถัดไป"

ModalFooter              ── [ ยกเลิก secondary ] [ ถัดไป primary · disabled until strokes > 0 ]
```

- Ink: `--text-primary` (13.57:1), 2px, round cap/join.
- 🔴 **A `<canvas>` is not keyboard-operable. The two alternate tabs are not optional — they are the conformance path.** `อัปโหลดรูปลายเซ็น` and `ใช้ลายเซ็นที่บันทึกไว้` must reach the identical outcome with a keyboard alone. Ship all three tabs or the feature is inaccessible.
- The `Hint` at 3.42:1 is a **placeholder, not a label**. The modal title carries the accessible name.
- Render at `devicePixelRatio`, export at ≥2×. A signature rasterised at 1× looks forged in print.

#### 4.1.1 Canvas width — **RESOLVED (C2 = Option A)**

`Modal[size=lg]` is `720` wide with `--space-6` padding on `ModalBody`, giving a **672px content box**. `SignatureCanvas` is fixed at **640 × 240** — leaving **32px of slack**.

**Resolution:** `SignatureCanvas` stays **Fixed `640 × 240`**. `ModalBody`'s auto-layout **horizontal alignment is set to `Center`**, producing 16px gutters on each side.

- **Rationale:** the canvas keeps a stable **8:3 aspect ratio**. The signature raster is composited onto a PDF at ≥2×; a canvas whose width floats with the modal would change the export aspect between viewports and distort the affixed signature.
- ⛔ Do **not** set `SignatureCanvas` to `Fill container`. The 32px of slack is intentional.
- `BaselineGuide` is therefore `640 − --space-6 − --space-6` = **592px** wide, absolutely positioned at **`Y = 180`** (75% of 240).

### 4.2 `Modal / PinConfirm`

`Modal[size=sm, tone=neutral, hasIcon=true, actions=dual]`, `iconSwap = bi-shield-lock-fill`, badge fill `--feedback-info-bg`.

- **Title** `ยืนยันการลงนาม` · **Description** `กรอกรหัส PIN ของใบรับรอง DS-000001 (Dev Admin) เพื่อลงนามในเอกสาร`

```
ModalBody
├── PinInput          ── Horizontal AL · Hug · gap --space-2 · center
│   └── PinCell ×6    ── Fixed 48 × 56 · Radius --radius-lg · Stroke 1px --border-control
│                        heading/md · --text-primary · centered · masked "●"
├── VisibilityToggle  ── Button[ghost, sm] bi-eye / bi-eye-slash  "แสดง PIN"
├── InlineError       ── [error] bi-x-circle-fill 16px --feedback-danger-icon
│                        body/md --feedback-danger-text  "PIN ไม่ถูกต้อง เหลืออีก 2 ครั้ง"
└── RememberCheckbox  ── "จดจำ 15 นาที"

ModalFooter           ── [ ยกเลิก secondary ] [ ลงนาม primary · state=loading while verifying ]
```

**`PinInput` states:** `default · focus · error · verifying · disabled · locked`

| `state` | Stroke | Fill | Measured |
|---|---|---|---|
| `default` | 1px `--border-control` | `--bg-surface` | 3.42 ✅ |
| `focus` | `--focus-ring`, **active cell only** | `--bg-surface` | 3.59 ✅ |
| `error` | 2px `--feedback-danger-icon` | `--feedback-danger-bg` | border 4.83 ✅ · digit 11.11 ✅ |
| `verifying` | 1px `--border-control` | `--bg-surface-subtle` | — |
| `disabled` / `locked` | 1px `--border-divider` | `--bg-surface-subtle` | *exempt* |

- **PIN never leaves memory.** Not in the URL, `localStorage`, analytics, a log line, or an error message. Clear on unmount and on close.
- Auto-advance on entry; `Backspace` on an empty cell moves focus back. **Do not auto-submit on the 6th digit without transitioning to `verifying`** — a silent submit gives no chance to correct a typo.
- `error` shakes for `--motion-base`. Under `prefers-reduced-motion`, **do not shake** — the red border and `InlineError` already carry it.
- **Always show remaining attempts.** Lockout without warning is a support ticket. On lockout, replace with `Modal[tone=danger]`: `บัญชีถูกระงับชั่วคราว`.
- `type="password"` `inputmode="numeric"` `autocomplete="off"`. Each cell `aria-label="หลักที่ 3 จาก 6"`. `InlineError` is `role="alert"`.
- **Ship `จดจำ 15 นาที` off by default.** For a ป.ป.ท. case system, caching a signing credential is a policy decision, not a UX convenience.

### 4.3 `Badge / SignatureVerification`

Same geometry as `Chip/Status` (v2.0 §2.2): `Hug × 32px`, `--radius-full`, gap `--space-2`, icon 14px, `body/md`. **Separate component set** — the domain and icons differ.

**Property:** `status` · **Boolean:** `hasDetail`

| `status` | Thai label | bg | text | icon color | Bootstrap Icon | text / icon |
|---|---|---|---|---|---|---|
| `valid` | ลายเซ็นถูกต้อง | `--feedback-success-bg` | `--feedback-success-text` | `--feedback-success-icon` | **`bi-shield-fill-check`** | 6.49 / 3.35 ✅ |
| `invalid` | ลายเซ็นไม่ถูกต้อง | `--feedback-danger-bg` | `--feedback-danger-text` | `--feedback-danger-icon` | **`bi-shield-fill-x`** | 6.80 / 3.95 ✅ |
| `expired` | ใบรับรองหมดอายุ | `--feedback-warning-bg` | `--feedback-warning-text` | `--feedback-warning-icon` | **`bi-shield-fill-exclamation`** | 6.15 / 4.51 ✅ |
| `revoked` | ใบรับรองถูกเพิกถอน | `--feedback-danger-bg` | `--feedback-danger-text` | `--feedback-danger-icon` | **`bi-shield-slash-fill`** | 6.80 / 3.95 ✅ |
| `untrusted` | ผู้ออกใบรับรองไม่น่าเชื่อถือ | `--feedback-warning-bg` | `--feedback-warning-text` | `--feedback-warning-icon` | **`bi-patch-question-fill`** | 6.15 / 4.51 ✅ |
| `pending` | กำลังตรวจสอบ | `--feedback-info-bg` | `--feedback-info-text` | `--feedback-info-icon` | **`bi-hourglass-split`** | 4.84 / 3.23 ✅ |

Six statuses, six **shapes**, six labels — `valid` and `revoked` share no glyph even though `invalid` and `revoked` share a palette.

**Two rules the engineer enforces, not the designer:**

- **`valid` means "cryptographically verified at render time."** Never a boolean read from a database column. If verification cannot run, the status is `pending`, not `valid`.
- **`expired-at-signing` ≠ `expired-now`.** A signature made while the certificate was live and covered by an RFC-3161 timestamp remains **`valid`** after expiry. Rendering it as `expired` would invalidate legitimate case files. Only a signature made *after* expiry is `invalid`.

`hasDetail` attaches a popover (`elevation/md`, `--radius-lg`, `--bg-surface`, 360px): `ผู้ลงนาม` · `ตำแหน่ง` · `วันเวลาที่ลงนาม` (**พ.ศ. + `+07:00`**) · `เลขที่ใบรับรอง` · `Serial` · `ผู้ออกใบรับรอง (CA)` · `อัลกอริทึม` · `สถานะ CRL / OCSP` · `เอกสารถูกแก้ไขหลังลงนามหรือไม่`. Labels `label/md` `--text-strong`; values `body/md` `--text-body`; serials and dates `tabular-nums`.

### 4.4 Also required by the flow

- **`SignaturePlacement`** — `PdfPreview` canvas with a draggable, resizable `SignatureAnchor` (`--border-focus` 2px dashed, 8px handles), page nav, zoom. Without it the user has a signature image and nowhere to put it.
- **`SignatureAuditRow`** — the `ประวัติลงนาม` tab (`428:131`) exists and leads nowhere. Timeline row: avatar, action, timestamp (พ.ศ.), cert serial, verification badge.
- **Failure dialogs**, each `Modal[tone=danger]` (**not** SweetAlert2 — they need a retry handler): cert not found · cert expired before signing · PIN lockout · network failure mid-sign · **document hash changed between preview and sign** (a tamper signal — it must block, not offer `ลองใหม่`).

---

## §5 — Token Collision: `wwwroot/style.css`

"Strictly use the established Semantic Tokens" is **currently impossible.** `wwwroot/style.css` defines a rival vocabulary that predates v2.0 and is referenced throughout `app.js` and every `.razor` view. Resolve it before Phase 3 code lands, or you will ship a fourth vocabulary.

**Contrast audit of the shipped tokens (never previously tested):**

| Shipped token | Value | vs `--bg-panel` (white) | vs `--bg-main` `#F4F7FC` | Verdict |
|---|---|---:|---:|---|
| `--text-main` / `--primary-dark` | `#0D1B3E` | 16.89 | 15.73 | ✅ |
| `--primary-light` | `#1A2F6B` | 12.63 | 11.76 | ✅ |
| **`--text-muted`** | `#6B7A99` | **4.31** | **4.02** | ❌ **fails both** |
| **`--gold`** | `#CBA258` | **2.37** | **2.21** | ❌ fails text *and* 3:1 |
| **`--gold-light`** | `#E3C27E` | **1.71** | **1.59** | ❌ |
| `--border-color` | `#E3E9F4` | 1.22 | 1.14 | ⚠️ divider only, never a control border |
| `--case-black` | `#111111` | 18.88 | 17.59 | ✅ |
| `--case-red` | `#C0392B` | 5.44 | 5.06 | ✅ |

**Migration map:**

| `wwwroot/style.css` | → v2.0 semantic | Note |
|---|---|---|
| `--primary-dark` `#0D1B3E` | `--action-primary` `#102B63` | Consolidate. Both navy, both pass. |
| `--primary-light` `#1A2F6B` | `--action-primary` | This is the hard-coded `confirmButtonColor`. |
| `--bg-panel` | `--bg-surface` | |
| `--bg-main` `#F4F7FC` | `--bg-page` `#EEF3FB` | |
| `--border-color` `#E3E9F4` | `--border-divider` `#D5DEEB` | Dividers only. Controls use `--border-control`. |
| `--text-main` | `--text-primary` | |
| **`--text-muted` `#6B7A99`** | **`--text-body` `#526075`** | 🔴 **Live failure at 4.31 / 4.02.** This is the *fourth* body-grey in the project — `#6D7D99` (Figma label), `#5F6F86` (Figma actual), `#6B7A99` (shipped CSS), `#526075` (v2.0). One survives. |
| `--shadow-sm` / `--shadow-md` | `--elevation-sm` / `--elevation-md` | Already `rgba(13,27,62,…)` — rebase on `#04112A` to match `--bg-overlay`. |
| `--transition-smooth` | `--motion-base` + `--motion-ease` | |
| **`--gold` / `--gold-light`** | **no equivalent** | 🔴 Exists in no Figma palette, no audit, no v2.0 ramp. At 2.37:1 it cannot be text or a border. **Decide: delete it, or promote it to a real ramp with a passing text shade.** Do not leave it undocumented. |

### 5.1 `--case-black` / `--case-red` are domain tokens, and they have a 1.4.1 problem

```css
/* เลขคดีดำ / เลขคดีแดง — ระบายสีตามชื่อเพื่อแยกแยะด้วยสายตา */
--case-black: #111111;
--case-red:   #C0392B;
```

The comment says it outright: *"colored by name so they can be told apart visually."* But **เลขคดีดำ (pending) and เลขคดีแดง (judgment issued) are a case-status distinction, not a decoration** — and encoding a status difference in hue alone is precisely SC 1.4.1.

Both colors pass as text (18.88 and 5.44). Keep them, promote them into `2. Semantic` as a `case/` group — they are domain semantics, not feedback semantics, and must not be collapsed into `--feedback-danger-*`. A red case number is not an error.

**But add `Chip/Status` variants `caseBlack` and `caseRed` carrying a label and a distinct glyph**, and render the number inside the chip. A monochrome user, a color-blind user, or anyone reading a printed สำนวน must be able to tell a pending case from an adjudicated one without seeing hue.

---

## §6 — Build Order & Definition of Done

1. **Reconcile `style.css`** with v2.0 (§5). Delete `--gold` or promote it. Fix `--text-muted`. *(1 day)*
2. **Fix the three live bugs** (§0.1): drop the dark theme link, pin `sweetalert2@11.26.25`. *(1 hr)*
3. **SweetAlert2 bridge**: add the variable block, `.swal2-*` icon overrides, and `EcmisSwal` mixin. **Strip all 12+ `confirmButtonColor` / `cancelButtonColor` options from `app.js`.** *(1 day)*
4. **Figma reference frame** `📐 REFERENCE / SweetAlert2 Theme` — five artboards, locked, typos fixed. *(0.5 day)*
5. **Custom `Modal`** over native `<dialog>` — 10 frames at `size=md`. Everything in §4 depends on it. *(2 days)*
6. **`Alert` + `Toast`** — the four `bi-*` icons close the 1.4.1 violation. *(1 day)*
7. **`EmptyState` + `Skeleton` + `TableSkeleton`** — unblocks the v2.0 DataTable. *(1.5 days)*
8. **`DatePicker`** — พ.ศ. first, then Sunday-first, then `view` navigation. *(2.5 days)*
9. **`FileUploader`** — Dropzone, then FileItem, `ProgressFill` nested in `ProgressTrack`. *(1.5 days)*
10. **Signature flow** — `Badge` (cheapest, unblocks the table's status column) → `PinConfirm` → `SignaturePad` → `SignaturePlacement`. *(4 days)*

### Definition of Done

- [ ] `wwwroot/style.css` has **one** token vocabulary. `--gold`, `--text-muted`, `--primary-light` are gone or aliased.
- [ ] `grep -c "confirmButtonColor" wwwroot/app.js` returns **0**.
- [ ] Every `Swal.fire` goes through `EcmisSwal`. `buttonsStyling: false` everywhere.
- [ ] `grep -c "Swal.fire.*input:" wwwroot/app.js` returns **0**. No form ever renders inside SweetAlert2.
- [ ] The dark-theme `<link>` is removed from both `App.razor` and `_Layout.cshtml`.
- [ ] SweetAlert2 and the Custom Modal put `ยกเลิก` **left**, confirm **right**. Destructive dialogs pre-focus `ยกเลิก`.
- [ ] Success / warning / danger / info are distinguished by **glyph shape**. Zero `!` icons remain outside `warning`.
- [ ] Every banner accent bar uses `--feedback-*-icon`. **Zero** use `--feedback-*-fill` (2.42 / 2.40 / 2.11 — all fail 3:1).
- [ ] `danger` toasts do not auto-dismiss. Toasts sit above both `.swal2-container` and `--z-modal`.
- [ ] `TableSkeleton` reuses `table/col/*` and shifts layout by **0px** on resolve. No spinner replaces content.
- [ ] The calendar shows **พ.ศ.** Any year is reachable in ≤ 3 clicks. Sunday-first, always 6 rows.
- [ ] `ProgressFill` is a **child** of `ProgressTrack`. `rejected` ≠ `error`. No file is silently dropped.
- [ ] `SignaturePad` has two keyboard-operable alternatives to the canvas.
- [ ] PIN never appears in a URL, log, or storage. Remaining attempts always visible.
- [ ] เลขคดีดำ / เลขคดีแดง carry a label and a glyph, not only a hue.

---

## §7 — Shared Primitives (Icon · Checkbox · Tabs)

Added in **r3**. These three primitives are consumed throughout §1–§4 but were never specified in v2.0. Figma Maker Checklist tickets **3A**, **3B**, and **3D** were blocked on them.

---

### 7.1 Icon Library

**Source:** `bootstrap-icons@1.11.3`, already loaded from jsDelivr (§0). No new dependency.
**Naming convention:** `Icon/{size}/{bi-name}` — e.g. `Icon/24/bi-check-circle-fill`.

Each size is a **folder of Components**, one component per glyph — *not* a component set with a `glyph` variant. A variant set would force every consumer to carry all ~100 glyphs. The folder is what an **Instance swap** property's `preferredValues` points at.

#### Structure of a single icon component

- Frame, **`size × size`**, **Fixed × Fixed**. **No auto-layout.**
- **No padding baked into the canvas.** The glyph fills the square; optical padding is the glyph's own.
- Exactly **one** child vector, named `vector`, with **one solid fill**. The single fill is what lets a consumer override the colour on the instance.
- **`Ctrl+Alt+K`** → component. Name it `bi-check-circle-fill`, inside the `Icon/24/` folder.
- Icons are decorative: `aria-hidden="true"` unless the consumer supplies an `aria-label`.

#### The size sets

| Set | px | On 4px grid | v2.0 size token | Consumed by |
|---|---:|---|---|---|
| `Icon/14` | 14 | ❌ **sanctioned optical exception** | none | `Chip/Status`, `Badge/SignatureVerification` |
| `Icon/16` | 16 | ✅ | `--size-icon-sm` | `Button[sm,md]`, `InlineError`, `Checkbox` glyph |
| `Icon/20` | 20 | ✅ | `--size-icon-md` | `Alert`, `Toast`, `Button[lg]`, `DatePicker/Field` |
| `Icon/24` | 24 | ✅ | `--size-icon-lg` | `Modal` `IconBadge`, `FileItem` `FileIcon` |
| `Icon/32` | 32 | ✅ | `--size-icon-xl` | `Uploader/Dropzone` |
| `Icon/40` | 40 | ✅ | `--size-icon-2xl` | swal `IconBadge` (§1.1.1) |
| `Icon/48` | 48 | ✅ | `--size-icon-3xl` | `EmptyState` `IconBadge` |

#### Size variables — **RESOLVED (C8) · LIVE IN FIGMA (r5)**

Created in the `3. Dimension` collection (`VariableCollectionId:612:50`), scope `WIDTH_HEIGHT`. Bind each icon frame's width **and** height to its variable; never type a raw px value.

```css
/* 3. Dimension → size/icon/* */
:root {
  --size-icon-sm:  16px;   /* Button[sm,md], InlineError, Checkbox glyph */
  --size-icon-md:  20px;   /* Alert, Toast, Button[lg] — also the Checkbox box, §7.2 */
  --size-icon-lg:  24px;   /* Modal IconBadge, FileItem FileIcon */
  --size-icon-xl:  32px;   /* Uploader/Dropzone      */
  --size-icon-2xl: 40px;   /* swal IconBadge glyph   */
  --size-icon-3xl: 48px;   /* EmptyState IconBadge   */
}

/* 3. Dimension → size/control/* — derive from padding + line-height, never type */
:root {
  --size-control-sm: 32px;   /* Button[sm]  */
  --size-control-md: 40px;   /* Button[md], TabItem, DatePicker field, CheckboxField row */
  --size-control-lg: 48px;   /* Button[lg], Tabs container */
}
```

> **Renamed in r5:** `--size-icon-xxl` → **`--size-icon-2xl`**, aligning the `3. Dimension` collection with `--radius-2xl`. The r4 spelling is retired.

`Icon/14` intentionally has **no variable.** It is an optical exception, not a step on the scale — binding it would legitimise 14px as a reusable size.

- **`Icon/14` is off-grid and stays off-grid.** At 14px it is optically matched to the 14px label inside a 32px `Chip`. `--size-icon-sm` (16px) overpowers the pill. Do not "correct" it.
- **Never scale an instance.** Placing an `Icon/16` at 24px produces a 1.5× stroke weight that will not match a real `Icon/24`. Swap the set instead.
- Colour is never baked in. The consumer overrides the `vector` fill with a `2. Semantic` variable.

#### Minimum glyph inventory required by Phase 3

`bi-check-circle-fill` · `bi-x-circle-fill` · `bi-exclamation-triangle-fill` · `bi-info-circle-fill` · `bi-question-circle-fill` · `bi-x-lg` · `bi-check-lg` · `bi-dash-lg` · `bi-eye` · `bi-eye-slash` · `bi-shield-lock-fill` · `bi-shield-fill-check` · `bi-shield-fill-x` · `bi-shield-fill-exclamation` · `bi-shield-slash-fill` · `bi-patch-question-fill` · `bi-hourglass-split` · `bi-arrow-counterclockwise` · `bi-arrow-clockwise` · `bi-eraser` · `bi-trash` · `bi-cloud-arrow-up-fill` · `bi-file-earmark-lock-fill` · `bi-file-earmark-x` · `bi-calendar3` · `bi-chevron-left` · `bi-chevron-right` · `bi-chevron-double-left` · `bi-chevron-double-right` · `bi-inbox`

---

### 7.2 `Checkbox`

**Consumed by:** `PinConfirm` (`RememberCheckbox`, §4.2), `SignaturePad` (`SaveCheckbox`, §4.1), `DataTable` row selection (v2.0 §3.4).

#### Anatomy

```
CheckboxField          ── Horizontal AL · Hug × Hug · Align: Center
│                         Gap --space-2 · min-height --size-control-md (40)
│                         Clip content: OFF   ← the focus ring must escape
├── Checkbox           ── Fixed 20 × 20   (--size-icon-md — RATIFIED r4, §8 C7)
│   │                     Radius --radius-md (6px, per v2.0)
│   │                     Auto-layout Horizontal, center × center, padding 0
│   └── Glyph          ── Icon/16 · bi-check-lg (checked) | bi-dash-lg (indeterminate)
└── Label              ── body/md · --text-primary
```

- The **entire `CheckboxField` row is the click target** (`<label>` wrapping the input). Not the 20px box.
- **`Clip content` must be OFF** on `CheckboxField`, or the 5px focus ring is sliced at the box boundary.

#### Component properties

| Property | Type | Values | Default |
|---|---|---|---|
| `state` | Variant | `default` · `hover` · `focus` · `checked` · `indeterminate` · `disabled` | `default` |
| `label` | Text | — | `ตัวเลือก` |

#### State → token → hex mapping (all pairs measured)

| `state` | Box fill | Border | Glyph | Glyph colour | Measured |
|---|---|---|---|---|---|
| `default` | `--bg-surface` `#FFFFFF` | `1px` `--border-control` `#7C8CA3` | — | — | border **3.42** ✅ |
| `hover` | `--bg-surface-hover` `#F4F8FD` | `1px` `--border-control-hover` `#6B7A91` | — | — | border **4.09** ✅ |
| `focus` | `--bg-surface` `#FFFFFF` | `1px` `--border-control` `#7C8CA3` **+ `--focus-ring`** | — | — | ring **3.59** ✅ |
| `checked` | `--action-primary` `#102B63` | none | `bi-check-lg` | `--text-inverse` `#FFFFFF` | glyph **13.57** ✅ |
| `indeterminate` | `--action-primary` `#102B63` | none | `bi-dash-lg` | `--text-inverse` `#FFFFFF` | glyph **13.57** ✅ |
| `disabled` *(unchecked)* | `--bg-surface-subtle` `#E6EDF6` | `1px` `--border-divider` `#D5DEEB` | — | — | *1.4.3 exempt* |
| `disabled` *(checked)* | `--action-disabled-bg` `#D5DEEB` | none | `bi-check-lg` | `--action-disabled-text` `#526075` | **4.71** *(exempt, but legible)* |

- On `--bg-page` `#EEF3FB`, the `default` border measures **3.07** — still clears the 3:1 boundary minimum. Verified.
- **Never use `opacity` for `disabled`.** Opacity multiplies against whatever sits behind, making contrast unpredictable. Use the explicit disabled tokens above.

#### The 2-layer `--focus-ring`

`--focus-ring` (v2.0 §1.3) = `0 0 0 2px var(--bg-surface), 0 0 0 5px var(--border-focus)`.

In Figma, two stacked **Drop shadows** with **`Blur: 0`**:

| Order in Effects list | X | Y | Blur | Spread | Colour |
|---|---:|---:|---:|---:|---|
| **1st (top)** | `0` | `0` | `0` | `2` | `--bg-surface` `#FFFFFF` |
| **2nd** | `0` | `0` | `0` | `5` | `--border-focus` `#0E92BC` |

Figma draws the topmost effect closest to the layer, mirroring CSS `box-shadow` ordering. The white offset is what keeps the ring visible when the checkbox sits on a saturated fill.

#### `indeterminate` is a distinct state, not `disabled`

The legacy Figma (`428:12`–`428:14`) draws a **dash `–`** and labels it `ปิดใช้งาน (disabled)`. **That is a bug.** A dash is the universal glyph for *indeterminate* (a partially-selected group, e.g. the DataTable header checkbox when some rows are selected). `disabled` is a *greyed* state. Both are specified above. Do not merge them.

---

### 7.3 `Tabs[pill]`

**Consumed by:** `SignaturePad` (§4.1) — the three-tab keyboard-conformance path.

#### Anatomy

**Amended in r4 (C6).** The container carries the track fill; `TabItem[default]` is transparent. This is the standard segmented-control inversion.

```
Tabs (TabContainer)    ── Horizontal AL · Hug × Hug
│                         Fill: --bg-surface-subtle        ← r4 (C6)
│                         Padding --space-1 (4)            ← r4 (C6)
│                         Radius --radius-xl (12)          ← r4, concentric: 8 + 4
│                         Gap --space-1 (4)
│                         Clip content: OFF   ← focus rings must escape
│                         → resulting height = 40 + 4 + 4 = 48
└── TabItem ×N         ── Horizontal AL · Hug × Hug · Align: Center
                          Padding --space-2 --space-4  (8 / 16)
                          Radius --radius-lg (8)
                          Label: body/md-strong (14 / 24 / 600)
                          → resulting height = 24 + 8 + 8 = 40 = --size-control-md ✅
```

**Concentric radius rule.** The container radius must equal the child radius plus the padding, or the corners visibly diverge: `--radius-lg (8) + --space-1 (4) = 12` = **`--radius-xl`**. This is an exact match against an existing token; no new radius was introduced.

#### Component properties

| Property | Type | Values | Default |
|---|---|---|---|
| `variant` | Variant | `pill` | `pill` |
| `size` | Variant | `md` | `md` |
| `state` | Variant | `default` · `hover` · `selected` · `disabled` | `default` |
| `label` | Text | — | `แท็บ` |

#### State → token → hex mapping (all pairs measured)

| `state` | `TabItem` fill | Label colour | Effect | Label contrast |
|---|---|---|---|---|
| `default` | **transparent** *(r4 — track shows through)* | `--text-body` `#526075` | none | **5.42** ✅ |
| `hover` | `--bg-surface-hover` `#F4F8FD` | `--text-primary` `#102B63` | none | **12.72** ✅ |
| `selected` | `--bg-surface` `#FFFFFF` | `--text-primary` `#102B63` | **`elevation/sm`** | **13.57** ✅ |
| `disabled` | **transparent** | `--text-disabled` `#7C8CA3` | none | 2.90 — *1.4.3 exempt* |

`default` and `disabled` labels sit directly on the container's `--bg-surface-subtle` track, which is what the **5.42** and **2.90** figures are measured against.

- **The label weight is `600` in every state.** Sarabun's 600 glyphs are wider than its 400 glyphs; varying weight on selection would reflow the tab strip and move the other tabs under the user's cursor. Vary **colour only**.
- `TabItem` height lands exactly on **40px** (`--size-control-md`) with no fixed height set. Leave it **Hug**.

#### Selected-pill boundary — **RESOLVED (C6, Option ②)** with a documented residual

Before r4, `state=selected` filled `--bg-surface` and sat directly on whatever surface hosted the strip. It was **host-dependent and, in the one place it is actually used, invisible**:

| Host surface | **r3 (before)** | **r4 (after)** |
|---|---:|---:|
| `--bg-surface` `#FFFFFF` — `ModalBody`, where `SignaturePad` puts it | **1.00** ❌ | **1.18** |
| `--bg-page` `#EEF3FB` | 1.11 ❌ | **1.18** |
| `--bg-surface-subtle` `#E6EDF6` | 1.18 | **1.18** |

The container-fill inversion makes the pill **always sit on its own `--bg-surface-subtle` track**, so the boundary is now **deterministic at `1.18:1` on every host.** The selected tab can no longer disappear.

> ⚠️ **Residual, accepted and recorded.** `1.18:1` is still below the 3:1 that WCAG 1.4.11 asks of a state boundary. **No token in v2.0 closes that gap:** a `--border-divider` stroke on the pill measures `1.15` against the track, and `--border-control` measures `2.90` — both fail. The state is therefore carried by three redundant cues, and **all three are mandatory**:
>
> 1. **Label colour** — `--text-body` `#526075` → `--text-primary` `#102B63` (a 5.42 → 13.57 shift against the track).
> 2. **`elevation/sm`** — the raised pill.
> 3. **`aria-selected="true"`** — the programmatic cue. **Non-negotiable.** It is what satisfies SC 1.4.1, because the state is then determinable without perceiving the fill at all.
>
> Closing the visual gap to 3:1 would require a new colour token and is deferred beyond Phase 3.

#### Accessibility (annotate in the component Description)

- `role="tablist"` on `Tabs`; `role="tab"` + `aria-selected` on each `TabItem`; `role="tabpanel"` on the panel.
- **Roving `tabindex`:** only the selected tab is in the tab order. `←` / `→` move selection, `Home` / `End` jump to first / last.
- `aria-selected` is the non-visual selection cue and is **mandatory**, given C6.
- `disabled` tabs are removed from the roving sequence.

---

## §8 — Open Decisions

**Where I'd push back on the PM, briefly.** Keeping SweetAlert2 is defensible and I've specced it properly — the boundary rule in §1.0 is what makes it safe. But the speed argument is thinner than it looks: after `buttonsStyling: false`, the icon overrides, and the mixin, you have written roughly as much CSS as a `<dialog>` wrapper would have cost, and you still carry a CDN dependency and a purple default. The real win is that **five existing `Swal.fire` patterns in `app.js` keep working**, which is worth something. Just hold the line on §1.0 — the moment `Swal.fire({ input: 'password' })` appears, the PIN modal is unfixable.

**The `--gold` token needs a human decision.** `#CBA258` at 2.37:1 is currently in `style.css` and in no design artifact anywhere. Somebody added a gold accent to a ป.ป.ท. system and it never reached Figma. Find out whether it's load-bearing before anyone deletes it.

---

### C6 — ✅ RESOLVED in r4 (Option ②, container-fill inversion)

**Raised r3. Closed r4 by the Architect.**

`Tabs` container takes **`fill: --bg-surface-subtle`**, **`padding: --space-1`**, **`radius: --radius-xl`** (concentric: `8 + 4`). `TabItem[default]` and `TabItem[disabled]` become **transparent**. `TabItem[selected]` is unchanged (`--bg-surface` + `elevation/sm`).

The selected pill now always sits on its own track. Its boundary is **deterministic at `1.18:1` on every host surface** — previously `1.00:1` on `--bg-surface`, which is exactly where `SignaturePad` puts it.

**Residual (accepted, recorded in §7.3):** `1.18:1` remains below the 3:1 of WCAG 1.4.11. No v2.0 token closes the gap — `--border-divider` on the pill measures `1.15` against the track and `--border-control` measures `2.90`. The state is therefore carried redundantly by **label colour** (5.42 → 13.57), **`elevation/sm`**, and **`aria-selected`**. All three are mandatory. `aria-selected` is what satisfies SC 1.4.1. Closing the visual gap needs a new colour token; deferred beyond Phase 3.

---

### C7 — ✅ RESOLVED in r4 (`20px` ratified)

`Checkbox` box is **`20 × 20`**, bound to **`--size-icon-md`**. Radius `--radius-md` (6px, per v2.0).

Formalised as the standard on 4px-grid grounds: `20 % 4 = 0`. The legacy Figma (`428:7`) drew the box at **`22px`** — off-grid — and that value is retired. No new token was created; the existing `--size-icon-md` carries it.

---

### C8 — ✅ RESOLVED in r4 · LIVE IN FIGMA in r5

The `3. Dimension` collection carries six icon sizes and three control heights, all on the 4px grid, all scoped `WIDTH_HEIGHT`. See §7.1 for the full block.

**Naming note resolved in r5.** `--size-icon-xxl` (r4) is **renamed to `--size-icon-2xl`**, aligning the collection with `--radius-2xl`. The r4 spelling is retired everywhere.

`Icon/14` deliberately receives **no** variable — binding it would legitimise 14px as a reusable step rather than the optical exception it is.

---

### C9 — ✅ RATIFIED in r5: three Locked / System-derived semantic tokens

Three of the 47 tokens in `2. Semantic` cannot be aliased into `1. Primitives`. The Architect has ratified them as direct values. Each carries `LOCKED / SYSTEM-DERIVED` in its Figma variable description.

| Token | Value | Why it cannot alias |
|---|---|---|
| `bg/overlay` | `rgb(4 17 42 / 0.18)` | **Structural.** Figma cannot apply alpha to an opaque primitive. Derived from `neutral/900` @ 18%. Can never alias. |
| `border/control-hover` | `#6B7A91` | No primitive exists. Sits between `neutral/500` (`#7C8CA3`) and `neutral/600` (`#526075`). |
| `table/row-selected` | `#E4F1FB` | Exists in no ramp. Body text on it = `5.56:1`; the 3px `accent/emphasis` indicator = `3.12:1`. |

> ⚠️ **These three will NOT follow a primitive retheme.** To un-lock the latter two, add two `neutral`-adjacent primitives and re-point them. `bg/overlay` is permanent.

---

### Status

**All Phase 3 blockers are cleared, and the token foundation is live in Figma.**

- C1–C2 resolved (r2) · C6–C8 resolved (r4) · C9 ratified (r5).
- C3–C5 are immutable Figma platform limits, documented and worked around.
- **`1. Primitives` (39) · `2. Semantic` (47) · `3. Dimension` (34) = 120 variables**, verified in file `eGV3ESj90HSq712gz0f5uI`.
- Token ramps are materialised at **`E-CMIS-Design-Foundation-v2.0.md`** — that file, not this one, is the source of truth for colour, space, radius, and size values.

The only item still open in this document is **`--gold`**, above, which is a `wwwroot/style.css` question and does not block the Figma rebuild.
