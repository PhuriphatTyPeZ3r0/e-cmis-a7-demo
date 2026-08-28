# Figma → Code Integration Rules (E-CMIS law-page)

Rules doc for implementing Figma designs (via the Figma MCP) into this codebase.
Read this **before** translating any Figma frame into code. It captures where tokens,
components, styles, and views actually live so generated code matches existing patterns.

---

## 0. Architecture in one paragraph (read first)

This is a **hybrid ASP.NET Core 9 app**, not a pure SPA. It runs **MVC** (`Controllers/HomeController.cs`
+ `Views/**/*.cshtml` + `Views/Shared/_Layout.cshtml`) **and** a **Blazor Web App**
(`Components/App.razor` root + Interactive Server components) in the same process (see `Program.cs`:
`AddRazorComponents().AddInteractiveServerComponents()` + `AddControllersWithViews()` + `MapBlazorHub()`).
The heavy data screens (case tables, filters, KPIs) are static HTML in `Views/*.cshtml` whose rows are
rendered at runtime by **vanilla JS in `wwwroot/app.js`** against `localStorage`-seeded data — the
"SPA-under-MVC" pattern. Reusable Blazor components live in `Components/Shared/Ecmis*.razor`.
**When implementing a Figma design, first decide which of the two runtimes it belongs to (§8).**

---

## 1. Token Definitions

- **Where:** CSS custom properties in `wwwroot/style.css`, `:root { … }` (lines 1–14). This is the single
  source of truth for design tokens. Values are annotated with their Figma origin.
- **Format:** plain CSS variables (`--name: value;`). No Style Dictionary / no JSON token pipeline / no transform build step.
- **Current tokens:**

```css
/* wwwroot/style.css */
:root {
    --primary-dark:  #0D1B3E;   /* Deep Navy (Figma)  */
    --primary-light: #1A2F6B;   /* Royal Navy         */
    --gold:          #CBA258;   /* Muted Gold (Figma) */
    --gold-light:    #E3C27E;
    --bg-panel:      #FFFFFF;
    --bg-main:       #F4F7FC;   /* Figma background   */
    --border-color:  #E3E9F4;
    --text-main:     #0D1B3E;
    --text-muted:    #6B7A99;
    --shadow-sm:     0 2px 8px rgba(13, 27, 62, 0.04);
    --shadow-md:     0 4px 16px rgba(13, 27, 62, 0.08);
    --transition-smooth: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Rule:** When Figma gives a hex that maps to one of these, **use the `var(--token)`, never the raw hex.**
If Figma introduces a genuinely new brand color, add a new `--token` to `:root` first, then reference it.
Status colors (semantic) are their own scale — see §5/§6.

---

## 2. Component Library

- **Where:** `Components/Shared/Ecmis*.razor` — the reusable Blazor component set:
  - `EcmisButton.razor` — button with `Variant` (navy/gold/danger/warning/success/secondary/light) + `IsOutline`, `Icon`.
  - `EcmisStatusBadge.razor` — status pill; explicit `Variant` **or** auto-maps from Thai status text.
  - `EcmisTable.razor` — **generic** `@typeparam TItem` paginated table (`Items`, `HeaderTemplate`, `RowTemplate`, `ItemsPerPage`).
  - `EcmisModal.razor`, `EcmisStatusBadge`, `EcmisSidebar`, and view-level components
    (`EcmisCaseRegistryView`, `EcmisDisclosureView`, `EcmisAdminCasesView`, `EcmisDashboardView`, `EcmisPocView`).
- **Architecture:** parameter-driven Razor components. Consistent parameter convention on every component:
  `[Parameter] public string Class` and `[Parameter] public string Style` for pass-through styling; `ChildContent` for slots.
- **Docs / storybook:** `Components/Pages/ComponentDemo.razor` is the living demo/"storybook" (route + sidebar link
  "🧩 Custom Components Demo"). **Add new components to ComponentDemo when you create them.**

Example — the button component maps a semantic `Variant` to CSS gradient/outline classes:

```razor
@* EcmisButton.razor *@
<EcmisButton Variant="navy" Icon="bi-search" Text="ค้นหา" OnClick="DoSearch" />
@* navy/gold → btn-grad-{variant} or btn-outline-{variant}; others fall back to Bootstrap btn-{variant} *@
```

**Rule:** Prefer composing an existing `Ecmis*` component over hand-writing markup. Only add a new component
when the Figma element has no existing match; put it in `Components/Shared/Ecmis<Name>.razor` following the
`Class`/`Style`/`ChildContent` parameter convention.

---

## 3. Frameworks & Libraries

- **UI runtime:** Blazor Web App (Interactive **Server**) on **.NET 9** + ASP.NET Core **MVC** (Razor views). No React/Vue.
- **Component packages:** `MudBlazor` 9.6.0 and `Radzen.Blazor` 11.1.2 (registered in `Program.cs`;
  Radzen used for charts in `EcmisPocView`). Prefer the in-house `Ecmis*` components for app-styled UI; use
  MudBlazor/Radzen for rich widgets (charts, complex inputs) only.
- **CSS framework:** **Bootstrap 5.3.2** (grid `row/col-md-*`, utilities `d-flex gap-* p-* fw-bold`, components), loaded via CDN.
- **Other JS:** SweetAlert2 (dialogs), Flatpickr (date pickers), Chart.js 4.4.1, all via CDN.
- **Build/bundler:** the .NET SDK (`Microsoft.NET.Sdk.Web`) + `MapStaticAssets` (fingerprinted static assets via
  `@Assets["…"]`). **No npm / webpack / vite.** Do not introduce a JS build step.
- **Server-side doc export:** ClosedXML (Excel), DocumentFormat.OpenXml (Word), QuestPDF (PDF).

---

## 4. Asset Management

- **Static root:** `wwwroot/` (currently only `app.css`, `app.js`, `style.css` — **no images/fonts committed**).
- **Referencing:** in Blazor host (`App.razor`) use fingerprinted `@Assets["style.css"]`, `@Assets["app.js"]`;
  in MVC `_Layout.cshtml` use plain `/app.js`. Serve/optimize via `app.MapStaticAssets()` in `Program.cs`.
- **CDN:** all third-party CSS/JS come from `cdn.jsdelivr.net`; **fonts from Google Fonts** (Sarabun).
- **Rule:** When a Figma design ships raster/vector assets, export them into a new `wwwroot/images/` (or `wwwroot/assets/`)
  folder and reference via `@Assets["images/foo.svg"]` (Blazor) or `/images/foo.svg` (MVC). Prefer inline SVG or an
  existing Bootstrap Icon (§5) over exporting a bitmap when the design element is an icon.

---

## 5. Icon System

- **Library:** **Bootstrap Icons 1.11.3** (CDN, `bootstrap-icons.min.css`). No local icon assets, no custom sprite.
- **Usage:** `<i class="bi bi-<name>"></i>` in markup; in `EcmisButton` pass the full class via `Icon="bi-search"`.
- **Naming convention:** always `bi bi-<kebab-name>` (e.g. `bi-inbox-fill`, `bi-file-earmark-check-fill`, `bi-bank2`).
- **Rule:** Map Figma icons to the nearest Bootstrap Icon name. Only export a custom SVG (into `wwwroot/images/`)
  when no `bi-*` equivalent exists.

---

## 6. Styling Approach

- **Methodology:** **global stylesheet** `wwwroot/style.css` (~1090 lines) using semantic BEM-ish class names
  (`.kpi-card`, `.filter-container`, `.custom-table`, `.status-badge`, `.btn-grad-navy`, `.submenu-link`).
  Component-scoped CSS only where needed via `*.razor.css` (e.g. `Components/Layout/MainLayout.razor.css`).
  `wwwroot/app.css` is minimal Blazor-error-UI styling. **No CSS Modules / Styled Components / Tailwind / SCSS.**
- **Typography:** font family `'Sarabun', sans-serif` (Thai UI); sizes are literal px in `style.css`
  (common scale: 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 14 / 16 / 18 px). Match this scale — do not introduce rem-based type.
- **Semantic status scale** (badges / pills):

```css
.status-teal   { background: rgba(76,175,80,.10);  color: #4CAF50; }
.status-orange { background: rgba(255,152,0,.10);  color: #FF9800; }
.status-red    { background: rgba(244,67,54,.10);  color: #F44336; }
.status-green  { background: rgba(76,175,80,.10);  color: #4CAF50; }
.status-badge.status-navy   { background: rgba(26,47,107,.10); color: var(--primary-light); }
.status-badge.status-yellow { background: rgba(213,180,91,.15); color: #B38F2E; }
```

- **Responsive:** Bootstrap grid + breakpoint utilities (`col-md-*`, `d-xl-none`, offcanvas sidebar).
  Custom desktop overrides under `@media (min-width: 1200px)` (`style.css:646`); print styles under `@media print`.
  Sidebar collapses to a Bootstrap **offcanvas** below `xl`.
- **Rule:** Reuse existing semantic classes; add new rules to `style.css` using `var(--token)` values and the
  existing naming style. Reserve `*.razor.css` for truly component-local layout.

---

## 7. Project Structure

```
law-page/
├─ Program.cs                     # DI + pipeline: MVC + Blazor Server both mapped
├─ law-page.csproj                # net9.0; MudBlazor, Radzen, ClosedXML, OpenXml, QuestPDF
├─ Controllers/HomeController.cs  # MVC controller (serves the .cshtml views)
├─ Views/                         # MVC (server-rendered HTML shells)
│  ├─ Home/Index.cshtml           #   main SPA host page (app-view divs)
│  └─ Shared/_Layout.cshtml       #   MVC layout: loads /app.js THEN blazor.server.js (order matters, see §9)
├─ Components/                    # Blazor Web App
│  ├─ App.razor                   #   Blazor root host (loads @Assets["app.js"] then blazor.web.js — see §9)
│  ├─ Routes.razor                #   Router, DefaultLayout = MainLayout
│  ├─ Layout/MainLayout.razor(.css)
│  ├─ Pages/                      #   Home, ComponentDemo (storybook), Error
│  └─ Shared/Ecmis*.razor         #   reusable design-system components
└─ wwwroot/
   ├─ style.css                   # design tokens (:root) + all app styles
   ├─ app.js                      # vanilla JS: view switching, table rendering, localStorage seed data
   └─ app.css                     # Blazor error-UI only
```

- **Feature/view identity:** each screen is a numbered "view" (`10.1` registry, `10.2` disclosure, `10.3` admin
  cases, `dashboard`, `poc`, `components-demo`). The sidebar (`EcmisSidebar.razor`) switches views by calling the
  global JS `switchView(name)`, and app.js toggles the matching `#view-…` element's `.active-view` class.
- **Data (mock):** seed arrays in `app.js` (`SEED_CASES_101`, hydrated into `DB_CASES_101` etc.) persisted to
  `localStorage`; rendered by `renderCases101Table()`-style functions. There is **no backend data API** yet.

---

## 8. Deciding where a Figma design goes (decision rule)

1. **Reusable UI element / control** (button, badge, modal, generic table, card) → new/extended `Ecmis*.razor`
   component in `Components/Shared/`, demoed in `ComponentDemo.razor`.
2. **A data-heavy screen matching the existing 10.x view pattern** (filters + KPI cards + case table) → follow the
   **SPA-under-MVC** path: add the static shell to a `Views/*.cshtml` `#view-…` div and render rows/data with a
   function in `app.js` against a `localStorage` collection. Wire it into `switchView()` and `EcmisSidebar`.
3. **A net-new interactive Blazor page** → `Components/Pages/*.razor` with `@rendermode InteractiveServer` and a
   route, using `Ecmis*` components.

When in doubt for a *table-centric* design, match the closest existing screen (`EcmisCaseRegistryView` /
`Views/Home/Index.cshtml` + `renderCases101Table`) so behavior (pagination, empty state `ไม่พบข้อมูลในตาราง`,
Thai labels) stays consistent.

---

## 9. Gotcha: JS interop script order (already bit us)

Blazor components call **global** JS functions from `app.js` (e.g. `EcmisSidebar` →
`JSRuntime.InvokeVoidAsync("switchView", …)`). `app.js` must load and define `window.switchView` **before**
the Blazor script boots the interactive circuit. Both hosts are now ordered correctly:
`App.razor` and `_Layout.cshtml` load `app.js` **before** `blazor.web.js` / `blazor.server.js`.
**If you add a new `InvokeVoidAsync("<fn>")` call, ensure `<fn>` is assigned to `window` at the top level of
`app.js` (see the `window.switchView = switchView;` block) — a throw in `initializeAll()` must not prevent that
assignment (it's now guarded by `safeInitializeAll`).**

---

## 10. Quick checklist before committing Figma-derived code

- [ ] Colors reference `var(--token)`; new brand colors added to `:root` first.
- [ ] Spacing/type use the existing px scale + Bootstrap utilities (no new SCSS/Tailwind).
- [ ] Icons are `bi bi-*`; assets (if any) exported to `wwwroot/images/`.
- [ ] Reused an `Ecmis*` component where one exists; new ones follow `Class`/`Style`/`ChildContent` convention.
- [ ] Placed in the correct runtime per §8 (MVC+app.js vs Blazor component/page).
- [ ] Thai copy preserved; table empty-state + pagination consistent with `EcmisTable`.
- [ ] Any new `window.*` JS interop fn declared at app.js top level (§9); `dotnet build` clean.
```
