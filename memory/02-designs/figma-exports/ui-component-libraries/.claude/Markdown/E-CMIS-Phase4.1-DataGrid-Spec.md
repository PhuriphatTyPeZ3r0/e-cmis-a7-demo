# E-CMIS Design System — Phase 4.1 Spec Sheet (Data Grid & Filters)
### Advanced Data Grid · Pagination · Filter Bar
**Depends on:** `E-CMIS-Design-Foundation-v2.0.md` (tokens) · Master Spec r5 (`Checkbox` `632:29`, `Button` `638:18`, `Icon/*` sets, `elevation/*`)
**Scope:** Activities 4–14 share one generic, column-agnostic grid. This spec defines the *mechanism*; each activity supplies its own columns via the same binding pattern already used for the Digital Signature table (Foundation §3.5).
**Status: FINAL — Revision r2.** All five open decisions (D1–D5) ratified by the Architect. Icon dependencies (§6.1) fetched and verified.
**Revision r2 note:** during the Phase 4.2 build, empirical Figma verification uncovered the **Row Height Crisis** — `Cell[type=twoLine]` measures `78px` against every other type's `54px` baseline, leaving 8 of 10 cell types' bottom borders stranded `24px` short of the true row edge. The Architect has ratified a fix: `HeaderCell` and every `Cell` type change vertical sizing from `Hug` to **`Fill`**, with internal content set to **`Center`** alignment. This is now the mandatory standard — see §2.8. **This revision documents the ratified standard; it has not yet been re-applied to the already-built Figma nodes (`HeaderCell` `646:39`, `Cell` `648:49`) — a follow-up execution pass is required.**

---

## §0 — Stack Reality Check: Data Tables in Blazor

| Assumption a generic spec might make | Actual, for this project | Consequence |
|---|---|---|
| A JS grid library (AG Grid, Tabulator, etc.) does sorting/filtering/virtualization | **Forbidden by this task's constraint**, and there is no `package.json` to add one to (confirmed in Phase 3 §0) | Sort, filter, and paginate are **C# operations** — LINQ over `List<T>` or a server round-trip. The header click triggers a C# event handler, not a client library callback. |
| React/Vue-style virtual DOM makes large re-renders cheap | Blazor Server diffs a render tree over SignalR; a naive `foreach` without `@key` **re-mounts every `<tr>` on any state change**, which drops focus, closes an open dropdown mid-row, and — critically — can desync checkbox `checked` state from the visual DOM during a partial update | **Every row must carry `@key="row.Id"`.** This is not optional polish; without it, `Row Selection` will visibly misbehave the first time a sort or filter re-orders the list while rows are selected. |
| Selection state is a `bool IsSelected` field on each row model | Mutating the model on every click causes a full row re-render | **Selection state lives in the container**, not the row: `HashSet<TKey> SelectedIds` in the code-behind. Each row reads membership (`SelectedIds.Contains(row.Id)`), it does not own it. |
| A big table can always render as a plain scrolling `<table>` | Blazor ships a first-party **`<Virtualize>`** component for large lists, but it renders a *fixed-height item template* — it does not virtualize individual `<tr>` cells inside a shared `<table>` layout the way some JS grids do | **✅ RESOLVED — D2.** `<table>` under 500 rows, `<Virtualize>` (CSS Grid rows, not literal `<tr>`) at 500+. The switch is internal to `DataGrid<TItem>` and invisible to consumers — see §2.7. |
| Sticky headers are "just CSS" | True, but only inside a **bounded scroll container** — `position: sticky` does nothing without a parent with `overflow-y: auto` and a defined height, which is the same pattern already established for `ModalBody` (Phase 3 §2A, `overflowDirection = 'VERTICAL'`, confirmed scriptable in Figma) | **✅ RESOLVED — D5.** Sticky header is unconditional whenever `DataGridContainer` receives a `MaxHeight` parameter; when unset (page lets the table grow naturally), sticky is meaningless and simply doesn't apply. |
| Icons render trivially | `bootstrap-icons@1.11.3` is already CDN-loaded (Phase 3 §0) and every glyph used below **must already exist in the built `Icon/*` sets** or be flagged as a new build dependency | **✅ RESOLVED — §6.1.** All five previously-missing glyphs (`bi-chevron-down`, `bi-chevron-up`, `bi-chevron-expand`, `bi-download`, `bi-search`) fetched from `bootstrap-icons@1.11.3` and verified (`0 0 16 16` viewBox, path counts confirmed). Ready for Figma import. |
| Row hover/zebra striping are both fine to use together | Already settled in the original v2.0 audit: *"Do not combine zebra striping with row hover — the two backgrounds fight and the hover becomes imperceptible on odd rows."* | **No zebra striping anywhere in this grid.** Carried forward verbatim; not re-litigated. |

---

## §1 — Token Reconciliation

No new colour, spacing, or radius primitives are introduced. Every token below already exists in `2. Semantic` / `3. Dimension`. Where a pairing is genuinely new (not previously exercised), the ratio was computed fresh, not assumed.

| Region | Token | Value |
|---|---|---|
| Grid container | `bg/surface`, `radius/xl` (12) | matches "Card / Table container" per Foundation §3.2 |
| Header row | `table/header-bg` → `#EEF3FB` | |
| Header text | `table/header` style (12/20/600) | |
| Body row default | `table/row-bg` → `#FFFFFF` | |
| Body row hover | `table/row-hover` → `#F4F8FD` | |
| Body row selected | `table/row-selected` → `#E4F1FB` 🔒 *(Locked/System-derived, Foundation §2.2 — will not follow a retheme)* | |
| Row divider | `table/border` → `#D5DEEB` | hairline only |
| Cell text | `table/cell` style (14/22/400), `text-body` | |
| Selection accent | `accent/emphasis` → `#0E92BC` | 3px left indicator on `selected` |

---

## §2 — `DataGrid`

### 2.1 Structural blueprint

```
DataGridContainer          ── Vertical AL · Fill × Fixed(MaxHeight) or Hug
│                              Fill --bg-surface · Radius --radius-xl (12)
│                              Stroke 1px --table-border · Clip content ON
│                              overflow-y: auto WHEN MaxHeight is set (D5) — sticky header anchors here
│
├── DataGridHeader          ── Horizontal AL · Fill × Fixed 44 (see 2.4 for derivation)
│   │                           Fill --table-header-bg · position: sticky; top: 0 — UNCONDITIONAL under D5
│   │                           Stroke bottom 1px --table-border
│   ├── HeaderCell/Checkbox ── Fixed w = table/col/checkbox (48) · h = FILL (see 2.8)
│   │                           Contains: Checkbox[state] instance — see 2.3
│   ├── HeaderCell ×N       ── w bound to a per-activity table/col/* variable · h = FILL, content Center (see 2.8)
│   └── HeaderCell/Actions  ── Fixed w = table/col/actions (140) · h = FILL
│
├── DataGridBody             ── Vertical AL · Fill × Hug · gap 0
│   │                           D2: renders as <tbody><tr> when Items.Count() < 500,
│   │                           <Virtualize> over CSS Grid rows when >= 500 — internal switch, see 2.7
│   └── DataGridRow ×N       ── component set (state variant) — see 2.2. Row itself stays Fill × HUG —
│       │                        it is the anchor cells stretch against, per §2.8. Do not make the row FILL too.
│       ├── Cell/Checkbox    ── h = FILL, content Center
│       ├── Cell/<type>      ── text | twoLine | code | date | number | badge | actions — ALL h = FILL, content Center (§2.8)
│       └── Cell/Actions
│
├── EmptyState                (reuse Hybrid §2.3 — sibling of DataGridBody, not nested inside it)
├── TableSkeleton              (reuse Hybrid §2.4 — same sibling swap pattern)
└── DataGridError              (see 2.6)
```

### 2.2 `DataGridRow` — component properties

| Property | Type | Values | Default |
|---|---|---|---|
| `state` | Variant | `default` · `hover` · `selected` · `selectedHover` · `disabled` | `default` |
| `density` | Variant | `comfortable` · `compact` | `comfortable` |
| `hasCheckbox` | Boolean | — | `true` |
| `hasActions` | Boolean | — | `true` |

Structure: Horizontal AL, **`Fill × Hug`**, gap `0`, padding `0`. **Cells own their own padding; the row owns only the background and the bottom border** — carried forward unchanged from v2.0 §3.4. The row's own `Hug` is deliberate and unchanged by the FILL ruling in §2.8 — it is the height *reference* that every FILL-sizing cell inside it stretches to match, computed from whichever cell's natural content is tallest.

#### Row state → token, and per-type baseline heights (not enforced heights — see §2.8)

Row height was previously stated as `56` / `44` for comfortable/compact without being derived from the actual tokens. Recomputing from `table/cell` (22px line-height, the documented density floor) and the real padding values gives each cell type's **natural/baseline** height — the height it would Hug to in isolation, and therefore the height it contributes when it happens to be the *tallest* cell in a given row. **As of §2.8, this number no longer directly determines the rendered row height on its own — `Fill` sizing does that.** It still matters: it is what a row Hugs to when every cell in it shares that baseline (the common case), and it is the per-type minimum a shorter cell must be able to stretch beyond without its content overflowing or looking cramped.

| `state` | Background | Body-text ratio | Left indicator |
|---|---|---:|---|
| `default` | `#FFFFFF` | **6.39** ✅ | — |
| `hover` | `#F4F8FD` | **5.99** ✅ | — |
| `selected` | `#E4F1FB` | **5.56** ✅ | `accent/emphasis` **3.12** ✅ |
| `selectedHover` | `#DBEBF8` | **5.25** ✅ | `accent/emphasis` **2.95** ✅ *(accepted, see below)* |
| `disabled` | `#FFFFFF` | text → `text/disabled` | — |

> ✅ **D1 — RESOLVED: ACCEPTED.** `selectedHover`'s left indicator measures `2.95:1`, marginally under the 3:1 non-text floor. This was previously marked "✅" in the v2.0 draft without being computed; it has now been measured and the Architect has ratified it as acceptable **because selection is never signalled by this indicator alone** — the checked `Checkbox`, the row-background shift, and `aria-selected="true"` (mandatory, §5) are three independent, redundant cues. The indicator itself is not fixed and not replaced. Do not "improve" this later without re-opening the decision — it was measured, considered, and accepted, not overlooked.

| `density` | Cell padding (V per-side) | Derived row height | Corrected from |
|---|---|---:|---|
| `comfortable` | `--space-4` (16) | **16 + 22 + 16 = 54px** | was stated `56px` |
| `compact` | `--space-2` (8) | **8 + 22 + 8 = 38px** | was stated `44px` |

Both corrections follow the exact pattern already used for `Button[lg]` (26→24 line-height, to land the derived height precisely on its target). Here there is no pre-existing "target" token to hit — `54`/`38` are simply the arithmetically correct results of grid-aligned inputs, and don't need to be forced onto a rounder number.

#### `Cell` — the 7 types and their baseline heights (comfortable density)

Referenced above as `Cell/<type>` in the blueprint but never previously broken out into its own table in this document — added here for completeness, since it is the exact table the Row Height Crisis (§2.8) was discovered against.

| `type` | Content | Padding (V, per-side) | Baseline height |
|---|---|---|---:|
| `text` | Single line, `table/cell` | `--space-4` (16, bound) | `16+22+16=`**`54`** |
| `code` / `date` / `number` | Single line, `table/cell`, `tabular-nums`, right-aligned | `--space-4` (16, bound) | **`54`** |
| **`twoLine`** | Two stacked lines: `table/cell` (22) + `meta/md` (20), gap `--space-1` (4) | `--space-4` (16, bound) | `16+22+4+20+16=`🔴 **`78`** — the outlier that triggered §2.8 |
| `badge` | One `Chip/Status` instance (32px tall) | **`11`** (literal, unbound — D9) | `11+32+11=`**`54`** |
| `actions` | One `Button[ghost,sm]` instance (32px tall) | **`11`** (literal, unbound — D9) | `11+32+11=`**`54`** |

`twoLine` is the only type whose natural content genuinely requires more than `54px` — every other type was already deliberately reconciled to `54` (five by construction, two by the D9 override). It is therefore the type that, in any row where it appears, becomes the `Fill` reference height under §2.8 — and since `user` (a `twoLine` column) is present in essentially every real table this system will render, `78px` is the *de facto* standard row height, not `54px`.

### 2.3 Selection — reusing the built `Checkbox`, not redefining it

The header's "select all" checkbox and every row checkbox are **instances of the existing `Checkbox` component set (`632:29`)**. No new checkbox variant is introduced.

| Header checkbox state | Condition |
|---|---|
| `default` | zero rows selected |
| `checked` | all visible rows selected |
| `indeterminate` | some, not all, visible rows selected |

Row checkbox: `default` unchecked / `checked` selected / `disabled` when the row itself is non-selectable (e.g. a locked record). Clicking anywhere in `Cell/Checkbox`'s hit area toggles it — the checkbox glyph alone is a 20px target, too small on its own per WCAG 2.5.5; the whole cell is the target, matching the `CheckboxField` click-target rule already established.

### 2.4 `HeaderCell` — sortable column header

| Property | Type | Values |
|---|---|---|
| `sort` | Variant | `unsortable` · `none` · `asc` · `desc` |
| `align` | Variant | `left` · `right` · `center` |

- Horizontal AL, `Fixed × Fill`, gap `--space-1` (4), padding `--space-3 / --space-4` (12/16). Label `table/header` (12/20/600), fill `text/strong`.
- Height: the notation `Fixed × Fill` was **always** the intent — width fixed per-column, height filling `DataGridHeader`'s `44px`. **This is now explicit and non-negotiable under §2.8's ruling, with content set to `Center` alignment.** ⚠️ Note: the Phase 4.1 Figma build never explicitly set `layoutSizingVertical` on the built `HeaderCell` instances (`646:39`) — it relied on default auto-layout Hug behavior, which happened to *also* produce `44px` since that's `HeaderCell`'s own natural content height. A height reading of `44` in the current file therefore does **not** confirm the sizing *mode* is actually `Fill` — this needs an explicit verification pass (read `layoutSizingVertical`, not just `.height`) before being treated as compliant.
- `12 + 20 + (12×2 vertical padding split evenly)` → **44px** is `HeaderCell`'s own natural/baseline height, and not coincidentally identical to `DataGridHeader`'s fixed `44` — headers have no `twoLine`-equivalent outlier, so the crisis in §2.8 does not affect the header row. Header and body rows remain independently sized; they only ever share **column width**, never row height.
- **No `text-transform: uppercase`.** Carried forward verbatim from v2.0 §3.3 — Thai has no case, and the original legacy table shouted `CERTIFICATE / CERT CODE` next to un-transformed `วันหมดอายุ`, an inconsistency this design system explicitly rejected.
- Sort icon, 16px, right of the label (left of label if `align=right`):
  - `unsortable` → hidden
  - `none` → `bi-chevron-expand`, fill `text/disabled` (**3.42** ✅)
  - `asc` → `bi-chevron-up`, fill `text/primary` (**13.57** ✅)
  - `desc` → `bi-chevron-down`, fill `text/primary`
- **Blazor:** clicking toggles `none → asc → desc → none`, fires a C# `SortChanged` callback; the parent re-runs `.OrderBy()`/`.OrderByDescending()` over the in-memory or server-fetched list. No client sort logic — the header is a dumb trigger.

### 2.5 Status column — integrates `Chip/CertStatus`

**Update (r2):** the generic 6-state `Chip/Status` (Draft/Pending/Approved/Rejected/Canceled/Completed) referenced here originally was **deferred to Phase 4.2 and never built.** In its place, a domain-accurate **`Chip/CertStatus`** (4 states — `ready`/`expiring`/`expired`/`revoked`, matching a certificate's real lifecycle rather than a generic case-workflow vocabulary) was specified, ratified as D7, and built (see the Phase 4.2 Addendum for the full token table). `Cell/badge`'s master now hosts a real `Chip/CertStatus[status=ready]` instance by default — not an empty slot.
`Chip/CertStatus`: `Hug × 32px`, `radius/full`, each state with a distinct glyph (never colour alone). `Cell/badge` hosts one instance, left-aligned. **"Vertically centered in the row" is no longer a per-component note — it is now the universal `Center` alignment rule mandated for every `Cell` type under §2.8.**

### 2.6 Sibling states

| State | Behaviour |
|---|---|
| `EmptyState` | reuse Hybrid §2.3 verbatim. Two copies needed: "no data yet" vs "no results for this filter" (that section's own requirement — restated here because the Filter Bar in §4 is what triggers the second variant). |
| `TableSkeleton` | reuse Hybrid §2.4 verbatim — bind skeleton cell widths to the **same `table/col/*` variables** as the real grid so there is zero layout shift on resolve. |
| `DataGridError` | `bi-exclamation-triangle-fill` in `feedback/danger-icon` + message (`body/md`, `text/body`) + `Button[secondary, sm]` "ลองใหม่". Same shape as `TableError` was already sketched in the original v2.0 draft; formalized here since Activities 4–14 are the first real consumers. |

### 2.7 Blazor architecture — `<Column>` child-content components (D4)

> ✅ **D4 — RESOLVED: BLAZOR COMPONENT-BASED.** The earlier draft sketched an `IDataGridColumn<TItem>` C# interface consumed via a `Columns` list parameter. The Architect rejected that shape in favour of **Razor child-content components**, mirroring the real mechanism .NET's own `QuickGrid` uses: `<Column>`-family components cascade-register themselves with the parent `DataGrid<TItem>` during `OnInitialized`, rather than being passed as data.

**Consumer-facing markup:**

```razor
<DataGrid TItem="CaseFile" Items="@Cases" @bind-SelectedIds="SelectedIds" MaxHeight="480px">
    <PropertyColumn Property="@(c => c.CaseNumber)" Title="เลขคดี" Width="var(--table-col-certCode)" Sortable="true" />
    <PropertyColumn Property="@(c => c.OwnerName)" Title="ผู้ใช้งาน" Width="var(--table-col-user)" />
    <PropertyColumn Property="@(c => c.ExpiryDate)" Title="วันหมดอายุ" Width="var(--table-col-expiryDate)" Format="dd/MM/yyyy" />
    <TemplateColumn Title="สถานะ" Width="var(--table-col-status)">
        <ChildContent Context="row">
            <StatusChip Status="@row.Status" />
        </ChildContent>
    </TemplateColumn>
</DataGrid>
```

**Internal registration mechanism** (matches how `QuickGrid`'s `PropertyColumn`/`TemplateColumn` actually cascade-register — not invented from scratch):

```csharp
// DataGrid.razor.cs — the parent
public partial class DataGrid<TItem> : ComponentBase
{
    [Parameter] public IEnumerable<TItem> Items { get; set; } = default!;
    [Parameter] public RenderFragment ChildContent { get; set; } = default!;
    [Parameter] public string? MaxHeight { get; set; }              // drives D5's sticky-header CSS class
    [Parameter] public HashSet<object> SelectedIds { get; set; } = new(); // §0: lives on the container, not the row

    internal List<IDataGridColumn<TItem>> Columns { get; } = new();
    internal void AddColumn(IDataGridColumn<TItem> column) => Columns.Add(column);

    // D2: internal, invisible to the consumer of <Column>
    private bool UseVirtualization => Items.Count() >= 500;
}
```

```csharp
// PropertyColumn.razor.cs — a child <Column>
public partial class PropertyColumn<TItem, TProp> : ComponentBase, IDataGridColumn<TItem>
{
    [CascadingParameter] private DataGrid<TItem> Grid { get; set; } = default!;
    [Parameter] public Expression<Func<TItem, TProp>> Property { get; set; } = default!;
    [Parameter] public string Title { get; set; } = "";
    [Parameter] public string Width { get; set; } = "";
    [Parameter] public bool Sortable { get; set; }

    protected override void OnInitialized() => Grid.AddColumn(this);
}
```

`DataGrid.razor`'s markup renders `@ChildContent` inside a `<CascadingValue Value="this">` **before** rendering the actual `<table>`/`<Virtualize>` body — this is what lets each `<PropertyColumn>`/`<TemplateColumn>` register into `Grid.Columns` during its own `OnInitialized`, so by the time the parent reaches its own rendering pass, `Columns` is fully populated. `IDataGridColumn<TItem>` remains as the **internal contract** the two column types implement — D4 rejected exposing it as the public API surface, not the interface's existence entirely.

**D2 in code** — the `<table>` / `<Virtualize>` switch is a private implementation detail of `DataGrid<TItem>`, never something a page author branches on:

```razor
@if (UseVirtualization)
{
    <div class="datagrid-body-virtualized" style="@(MaxHeight is not null ? $"max-height:{MaxHeight};overflow-y:auto" : "")">
        <Virtualize Items="@Items.ToList()" Context="row">
            <DataGridRowVirtual Row="row" Columns="Columns" Selected="@SelectedIds.Contains(GetId(row))" />
        </Virtualize>
    </div>
}
else
{
    <table>
        <tbody>
            @foreach (var row in Items)
            {
                <tr @key="GetId(row)" class="@RowStateClass(row)">
                    @foreach (var col in Columns) { <td>@col.RenderCell(row)</td> }
                </tr>
            }
        </tbody>
    </table>
}
```

`Virtualize`'s row template (`DataGridRowVirtual`) is CSS Grid, not literal `<tr>`/`<td>` — this is why §0 called out that the two render paths are structurally different markup, not just a performance toggle. Both paths honour the same `Columns` list built by the cascaded `<Column>` children, so `<PropertyColumn>`/`<TemplateColumn>` authors never need to know or care which path renders.

### 2.8 The Row Height Crisis — discovery, and the ratified `Fill` + `Center` standard (D10)

#### What happened

Building the first fully-populated representative `DataGridRow` in Figma (Digital Signature context, 10 columns), every cell's height was read back programmatically rather than assumed correct. Nine of ten cells measured the expected `54px`. The `user` column — a `Cell[type=twoLine]` — measured `78px`. The row, sized `Fill × Hug`, hugged to its tallest child, so the whole row rendered at `78px`.

That alone is a height *mismatch*, which would be a minor cosmetic issue. The actual defect is worse: **the other 8 cells did not stretch to match.** Each one is independently bottom-bordered (`border/divider`, per-cell, established back in Phase 4.1 Ticket 4B), and each border is drawn at that cell's *own* `54px` mark — `24px` short of the row's true `78px` bottom edge. In the one row built so far this was invisible, because that row's `selected` background tint (`table/row-selected`) happens to fill the gap below the short borders with the same colour as everything else. **On any `default`-state row — which is the majority of every real table — that `24px` gap renders as a plain white strip between a cell's border and the actual row boundary, with the *next* row's own top edge appearing to float inside it.** This would have shipped as a visibly broken table the moment a real, unselected, multi-row grid was rendered.

#### Why `Hug`-per-cell was always going to fail here

The pre-crisis model gave every `Cell` type its own independent `Hug`-computed height, individually reconciled to a shared target (`54px`, achieved for 5 types by construction and 2 more via the D9 padding override). This works only as long as **no type in the row ever needs more than the target.** `twoLine` — two stacked lines of real content (a name plus a username) — structurally cannot fit in `54px` without either shrinking `meta/md` below its specified size or eliminating the inter-line gap entirely, neither of which is acceptable. The model had no mechanism for "this type is allowed to be taller than the target, and everything else must follow it" — it could only push every type down *to* a fixed number, never let one type set the number for the row.

#### The ratified fix — `Fill` + `Center`, replacing per-type `Hug`

**D10 — RATIFIED.** `HeaderCell` and every `Cell` type change vertical sizing from `Hug` to **`Fill`**. Internal content (text, `Chip/CertStatus`, `Button` instances) is set to **`Center`** alignment within the now-variable-height cell box.

```
DataGridRow            ── stays Fill × HUG — the anchor. Height is computed from
│                          the tallest cell's OWN natural (un-stretched) size.
├── Cell[type=text]    ── h = FILL (stretches to match the row) · content Center
├── Cell[type=twoLine] ── h = FILL — in practice this IS the row's natural height,
│                          so for this cell FILL and its own natural size coincide
├── Cell[type=badge]   ── h = FILL · Chip/CertStatus instance vertically centered
│                          in whatever extra space Fill adds beyond its own 54px
└── Cell[type=actions] ── h = FILL · Button instance vertically centered, same as above
```

This is the same mechanism CSS Flexbox uses for `align-items: stretch` on an `auto`-height flex container: the container's cross-size is computed from children's *natural*, unconstrained sizes first; children flagged to stretch are then expanded to match *after* that computation. Figma's auto-layout is modeled directly on Flexbox's single-axis behavior, so this should resolve correctly without requiring one cell to be excluded from `Fill` as a manual "anchor." **This expectation has not yet been empirically re-verified against the actual Figma engine for this specific all-children-Fill configuration** — every other assumption about Figma's `Fill`/`Hug` interaction made without direct verification during this project has produced a real bug (the `selectedHover` indicator math was measured, not assumed, and every `Fill`-related build step this session was read back after writing, not trusted from the API call alone). The same discipline applies here: **before this ruling is treated as fully implemented, read back each cell's actual rendered height in a row containing a `twoLine` cell, and confirm all cells (not just `twoLine`) report `78px` — not just that the row's overall height is `78`.**

#### What this changes, and what it doesn't

- **D9's `11px` badge/actions padding override remains valid and necessary.** It establishes those two types' *baseline* height at `54px`, matching the majority-case row. `Fill` does not replace that — it is the layer that activates *only* when a taller cell like `twoLine` is present in the same row. A row containing no `twoLine` cell still Hugs to `54px` exactly as before, and `Fill` on the other cells becomes a no-op (they're already at the row's natural height).
- **The per-type baseline-height table in §2.2 is retained, not deleted** — it is now correctly framed as "what this type contributes when it is the tallest cell present," not "the enforced height in all cases."
- **`Cell[type=twoLine]`'s `78px` is the *de facto* standard row height** for any table that includes a `user`-style two-line column — which is essentially every table in this system. Documenting this plainly rather than letting `54px` continue to be read as the system's row-height standard, which it never actually was once `twoLine` is in play.

---

## §3 — `Pagination`

### 3.1 Anatomy

```
Pagination              ── Horizontal AL · Fill × Fixed 56 · space-between
│                           Padding --space-4 (16) horizontal · Stroke top 1px --table-border
├── ResultsSummary       ── "แสดง 1–20 จาก 214 รายการ"  meta/md · text/body
├── PageControls          ── Horizontal AL · Hug × Hug · gap --space-1
│   ├── PrevButton        ── IconButton 32×32, bi-chevron-left
│   ├── PageButton ×N     ── component set, see 3.2
│   ├── Ellipsis           ── "…" meta/md text/disabled (when page count > 7)
│   └── NextButton         ── IconButton 32×32, bi-chevron-right
└── RowsPerPage           ── Horizontal AL · Hug × Hug · gap --space-2
                              "แถวต่อหน้า" meta/md + DropdownTrigger (§4.2) preset [10, 20, 50, 100]
```

### 3.2 `PageButton`

| Property | Type | Values |
|---|---|---|
| `state` | Variant | `default` · `hover` · `current` · `disabled` |

- `Fixed 32×32`, `radius/lg`, centered `table/cell`-weight number (`tabular-nums`, mandatory — page numbers are exactly the kind of column that needs it).

| `state` | Fill | Text | Measured |
|---|---|---|---|
| `default` | transparent | `text/body` | 6.39 on white ✅ |
| `hover` | `bg/surface-hover` | `text/primary` | 12.72 ✅ |
| `current` | `action/primary` (solid pill) | `text/inverse` | **13.57** ✅ |
| `disabled` | transparent | `text/disabled` | 3.42 — *exempt* |

`current` deliberately does **not** reuse the Tabs `selected` pattern (`bg/surface` + `elevation/sm` on a matching track), even though that pattern exists and was already verified. Pagination page-numbers don't sit on a differentiated track the way `Tabs` does — a solid `action/primary` pill gives an unambiguous **13.57:1** with zero risk of the C6-style near-invisible-boundary problem, at the cost of one extra bit of visual weight per page. This is a deliberate choice, not an oversight; flagging so it isn't "corrected" back to the Tabs pattern later without reconsidering why it wasn't used here.

### 3.3 `PrevButton` / `NextButton`

Same 32×32 `IconButton` shape used for `ModalDialog`'s `CloseButton` (Phase 3 §2A) — not a `Button` instance, since `Button` still has no icon-slot support (flagged there, still true here). `disabled` state (first/last page) uses `text/disabled` at **3.42:1**, exempt under 1.4.3, but the button must also be removed from the tab order (`disabled` HTML attribute), not merely recoloured.

---

## §4 — Filter Bar (Toolbar)

### 4.1 Anatomy

```
FilterBar               ── Horizontal AL · Fill × Fixed 64 · space-between
│                           Fill --bg-surface · Padding --space-4 (16) · Radius --radius-xl (12), top corners only
│                           Stroke bottom 1px --table-border
│                           (shares the DataGridContainer's radius/xl — sits as its own header slab, not a separate floating card)
├── SearchGroup           ── Horizontal AL · Hug × Hug · gap --space-3
│   ├── SearchInput        ── see 4.2
│   └── DropdownTrigger    ── see 4.3, generic filter (e.g. "สถานะ: ทั้งหมด")
└── ActionsGroup           ── Horizontal AL · Hug × Hug · gap --space-2
    └── ExportButton        ── Button[secondary, md] + bi-download — see 4.4
```

`FilterBar`'s fill is `bg/surface`, matching the grid container beneath it (not `bg/page`) — a divider-on-white measures **1.36:1** vs divider-on-page's **1.22:1**; marginal, but the real reason is that `FilterBar` and `DataGridContainer` read as **one continuous card** (toolbar slab + table), sharing the same surface and only the top two corners of `radius/xl`, rather than as two separate floating elements on the page background.

> **D3 — RESOLVED: DEFERRED to Phase 4.2.** Applied-filter chips (multi-select tag removal UI) are explicitly out of scope for this pass. `DropdownTrigger` (§4.2) is the only filter-input primitive specified here; the menu contents it opens (checkbox list, radio list, date range) and any resulting chip row are Phase 4.2 work.

### 4.2 `SearchInput`

```
SearchInput             ── Horizontal AL · Fixed 320 × Fixed 40 (size/control/md)
                            Stroke 1px --border-control · Radius --radius-lg
                            Padding 0 --space-3 (12) · Gap --space-2 (8)
├── SearchIcon            ── Icon/16 bi-search — fetched & verified, §6.1
├── Input text / placeholder ── body/md, text/body when populated
└── ClearButton            ── [hasValue] Icon/16 bi-x-lg, shown only once text is entered
```

- Border `border/control` on white: **3.42:1** ✅ — identical resting-state contrast already established for every other form control in this system (`Checkbox`, `DatePicker/Field`).
- **Placeholder text uses `text/disabled` (3.42:1), which is intentionally lighter than the input's own type colour.** This is acceptable *only* because the search field carries a visible icon and a real (even if visually-hidden) `<label>` — placeholder text is never the sole label. Flagging this explicitly since WCAG guidance on placeholder-only contrast is easy to over- or under-apply.
- Focus state reuses `--focus-ring` verbatim (2-layer, `bg/surface` spread 2 + `border/focus` spread 5) — the exact construct already verified correct for `Checkbox`.

### 4.3 `DropdownTrigger`

```
DropdownTrigger          ── Horizontal AL · Hug × Fixed 40 (size/control/md)
                             Stroke 1px --border-control · Radius --radius-lg
                             Padding 0 --space-3 (12) · Gap --space-2 (8)
├── Label                  ── body/md, text/primary — e.g. "สถานะ: ทั้งหมด"
└── Chevron                 ── Icon/16 bi-chevron-down — fetched & verified, §6.1
```

| `state` | Border | Effect |
|---|---|---|
| `default` | `border/control` (3.42) | — |
| `hover` | `border/control-hover` (4.09) | — |
| `open` | `border/focus` (3.59) + `--focus-ring` | dropdown panel below, `elevation/md`, same construct as `DatePicker/Calendar` |
| `disabled` | `border/divider` | *exempt* |

This is the **generic trigger primitive**. Per D3, the actual filter menu contents are Phase 4.2 work.

### 4.4 `ExportButton`

**`Button[secondary, size=md]`**, not `ghost`. Both variants already exist and are verified (`638:18`). `ghost`'s `default` state is fully transparent with zero border — for a toolbar action a user must be able to *find*, that's a discoverability failure; `secondary`'s visible outline (`border/control`, 3.42:1) makes it locatable at rest without demanding hover-to-reveal. Deliberate choice, considered and rejected `ghost`, not an oversight.

Icon `bi-download` — fetched and verified (§6.1). Once `Button`'s icon-slot properties exist, this becomes `Button[secondary, md, iconLeft=true]`; until then, treat as a text-only instance labeled "ส่งออกข้อมูล" with the icon composited alongside it, per the same limitation already flagged for `CloseButton`.

---

## §5 — Accessibility Consolidated

- `DataGrid` → `role="table"` semantics on the plain-`<table>` path (native, no ARIA needed); `role="grid"` + full `aria-rowindex`/`aria-colindex` on the `<Virtualize>` path (D2), since that path is CSS Grid, not a native table element.
- `DataGridRow[state=selected]` → `aria-selected="true"`. Given `selectedHover`'s indicator sits at 2.95:1 (D1, accepted), this attribute is **not optional** — it is the one fully-reliable selection signal in that compound state.
- Sort `HeaderCell` → `aria-sort="ascending"|"descending"|"none"` mirroring the visual `sort` variant.
- `Pagination` → `nav` landmark, `aria-current="page"` on the `current` `PageButton`, disabled prev/next removed from tab order (not just recoloured).
- `SearchInput` → visible or `aria-label`-equivalent label always present, regardless of placeholder.
- Keyboard: arrow-key row navigation is a stated goal of every prior composite component in this system (`Tabs`, `DatePicker` grid) — carrying that expectation forward, `DataGridRow` should support `↑`/`↓` between rows and `Space` to toggle the row checkbox when a row is focused. Flagged as a requirement, not yet detailed as a full interaction spec (out of scope for this structural pass).

---

## §6 — Build Dependencies

### 6.1 Icon glyphs — ✅ RESOLVED, fetched and verified

All five previously-missing glyphs were fetched from `bootstrap-icons@1.11.3` (same CDN version already loaded, per Phase 3 §0) and verified structurally correct before this document was finalized:

| Glyph | Needed by | Verified |
|---|---|---|
| `bi-chevron-down` | `HeaderCell[sort=desc]`, `DropdownTrigger` | ✅ `viewBox="0 0 16 16"`, 1 path |
| `bi-chevron-up` | `HeaderCell[sort=asc]` | ✅ `viewBox="0 0 16 16"`, 1 path |
| `bi-chevron-expand` | `HeaderCell[sort=none]` | ✅ `viewBox="0 0 16 16"`, 1 path |
| `bi-download` | `ExportButton` | ✅ `viewBox="0 0 16 16"`, **2 paths — will need flattening** on import, same as the multi-path glyphs already handled in the original 30-glyph `Icon/16` build |
| `bi-search` | `SearchInput` | ✅ `viewBox="0 0 16 16"`, 1 path |

`bi-chevron-left`/`bi-chevron-right` **already exist** (used by `Pagination`'s prev/next — no new dependency there).

### 6.2 Component dependencies not yet built in Figma

- `Chip/Status` — specified (original Hybrid draft §2.2) but never constructed. `Cell/badge` cannot be built until it exists.
- `TableSkeleton`, `EmptyState` — specified (Hybrid §2.3/§2.4), not yet built.
- `Button` icon-slot properties (`iconLeft`/`iconRight`) — still absent, per the `CloseButton` flag in Phase 3 Ticket 2A. `ExportButton` inherits the same limitation.

### 6.3 Suggested order

1. ~~Fetch the 5 missing icon glyphs~~ — **done, §6.1.**
2. Import and build the 5 glyphs into `Icon/16` (and derived sizes where needed) — pure Figma mechanics, no new decisions.
3. Build `Chip/Status` (needed by `Cell/badge`).
4. Build `DataGridRow` + `HeaderCell` + `Cell/*` primitives, binding to per-activity `table/col/*` variables (each activity adds its own set, following Foundation §3.5's mechanism).
5. Build `Pagination`.
6. Build `FilterBar` (`SearchInput`, `DropdownTrigger`, `ExportButton` instance).
7. Assemble one full reference `DataGrid` composition using Digital Signature's existing columns as the worked example, mirroring how `SweetAlert2` artboards served as the worked reference for dialogs. **Not this pass** — see the accompanying Figma Maker Checklist, which stops before full assembly by design.

---

## §7 — Resolved Decisions

All five decisions raised in the prior draft have been ratified by the Architect. Recorded here for provenance — this is the historical record of what was decided and why, not an open question list.

| # | Decision | Resolution | Rationale |
|---|---|---|---|
| **D1** | `selectedHover` indicator at `2.95:1` | **ACCEPT** | Redundant cues (checked `Checkbox`, background shift, mandatory `aria-selected`) mean the indicator is never the sole selection signal. |
| **D2** | Plain `<table>` vs Blazor `<Virtualize>` | **THRESHOLD: `<table>` under 500 rows, `<Virtualize>` at 500+** | Avoids paying `<Virtualize>`'s CSS Grid complexity on small tables while preventing a 5,000-row audit log from rendering every `<tr>` at once. Internal to `DataGrid<TItem>` — §2.7. |
| **D3** | Applied-filter chips | **DEFERRED to Phase 4.2** | Objective bullet 3 asked for Search + Dropdown trigger + Export only; chips are natural follow-on work once a real multi-select filter exists. |
| **D4** | Column configuration API shape | **Blazor component-based** — `<PropertyColumn>`/`<TemplateColumn>` child content, cascade-registering into the parent, mirroring .NET `QuickGrid`'s real mechanism | Idiomatic to the framework; consumers write declarative markup instead of building a C# list by hand. Full mechanism in §2.7. |
| **D5** | Sticky header | **ACCEPT — always sticky when `MaxHeight` is set** | Matches the already-established `ModalBody` scroll pattern; meaningless (and skipped) when the table is allowed to grow unbounded on the page. |
| **D9** | `Cell`'s padding is heterogeneous (5 types bound to `space/4`, 2 literal `11`) | **ACCEPTED** (ratified in Phase 4.2) | Direct consequence of the row-height reconciliation ruling that predates D10. Documented here for completeness — was missing from this table in r1. |
| **D10** | `HeaderCell`/`Cell` vertical sizing: `Hug` → `Fill`, content `Center` | **RATIFIED** — see §2.8 | Discovered via empirical Figma read-back that per-type `Hug` reconciliation (D9) cannot survive the presence of a genuinely taller type (`twoLine`, `78px`) — 8 of 10 cell types' borders were left stranded `24px` short of the true row edge. `Fill` lets the tallest cell set the row height and every other cell stretch to match, which `Hug`-per-type structurally cannot do. |
