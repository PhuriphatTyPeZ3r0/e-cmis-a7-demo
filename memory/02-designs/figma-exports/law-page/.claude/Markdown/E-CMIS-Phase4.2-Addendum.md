# E-CMIS Design System — Phase 4.2 Addendum
### `Chip/CertStatus` · `Button` Icon Properties · Migration Record
**Depends on:** `E-CMIS-Design-Foundation-v2.0.md` · Phase 4.2 Spec & Checklist (D6–D9 ratified) · `Button` (`638:18`), `Icon/16` (`618:2`)
**Status:** As-built record. Everything in this document reflects what was actually constructed and verified in Figma, not what was originally planned — where the two diverge, both are stated, with the reason.

---

## §1 — `Chip/CertStatus`

### 1.1 What this is, and what it replaced

The Phase 4.2 spec originally called for a generic **`Chip/Status`** with 6 case-workflow states (Draft/Pending/Approved/Rejected/Canceled/Completed). During ratification (D7), the Architect redirected this to a domain-accurate **`Chip/CertStatus`** with 4 states matching a certificate's actual lifecycle — `ready`/`expiring`/`expired`/`revoked` — and the generic `Chip/Status` was explicitly deferred, not built. **`Chip/CertStatus` (`654:71`) is the only status chip that exists in this file.**

### 1.2 Anatomy

```
Chip/CertStatus         ── Horizontal AL · Hug × 32 (Fixed)
                            Padding: 6 (literal, vertical) / --space-3 (12, horizontal, bound)
                            Gap --space-2 (8) bound · Radius --radius-full
                            Height: 6 + 20 + 6 = 32 ✅
├── Icon/14              ── 14×14, off-grid by design — first-ever use of the Icon/14 tier
└── Label                 ── body/md (14/20/400)
```

### 1.3 The 4 states

| `status` | Thai label | bg | text | icon colour | glyph | text ratio | icon ratio |
|---|---|---|---|---|---|---:|---:|
| `ready` | พร้อมใช้งาน | `feedback/success-bg` `#DCFCE7` | `feedback/success-text` `#166534` | `feedback/success-icon` `#17994E` | `bi-check-circle-fill` | **6.49** ✅ | **3.35** ✅ |
| `expiring` | ใกล้หมดอายุ | `feedback/warning-bg` `#FEF3C7` | `feedback/warning-text` `#854D0E` | `feedback/warning-icon` `#B45309` | `bi-exclamation-triangle-fill` | **6.15** ✅ | **4.51** ✅ |
| `expired` | หมดอายุ | `feedback/danger-bg` `#FEE2E2` | `feedback/danger-text` `#991B1B` | `feedback/danger-icon` `#DC2626` | `bi-x-circle-fill` | **6.80** ✅ | **3.95** ✅ |
| `revoked` | ถูกเพิกถอน | `feedback/danger-bg` `#FEE2E2` | `feedback/danger-text` `#991B1B` | `feedback/danger-icon` `#DC2626` | `bi-shield-slash-fill` | **6.80** ✅ | **3.95** ✅ |

Every ratio is a **direct reuse of already-verified Foundation numbers** — nothing new was computed. `expired` and `revoked` deliberately share the danger palette (an admin-revoked cert and a naturally-expired one are both "invalid," and both deserve the same visual severity) but are distinguished by glyph shape alone (`bi-x-circle-fill` vs `bi-shield-slash-fill`) — the same WCAG 1.4.1 discipline applied to every other same-palette pairing in this system (`Tabs`, `PageButton`, the original `Chip/Status` draft's `approved`/`completed` pairing).

### 1.4 Icon dependency — `Icon/14` built for the first time

`Icon/14` was specified from the earliest Master Spec revision as a deliberate off-grid optical exception, referenced repeatedly across three phases, and **never actually built until this component needed it.** All 4 glyphs `Chip/CertStatus` needs (`bi-check-circle-fill`, `bi-exclamation-triangle-fill`, `bi-x-circle-fill`, `bi-shield-slash-fill`) already existed at `Icon/16` — no new SVG fetch was required. Each was cloned from its `Icon/16` master and resized to `14×14`, with **no bound size variable**, matching the original rule precisely. Host: `653:54`.

> **Note on scope:** the 3 SVGs originally fetched-and-flagged for the *generic* `Chip/Status` (`bi-file-earmark`, `bi-slash-circle`, `bi-check2-all`) were **not** fetched this round — nothing in `Chip/CertStatus`'s ratified 4-state scope consumes them. They remain a dependency only if/when the generic `Chip/Status` is revived.

---

## §2 — `Button`: `iconLeft`, `iconRight`, `iconOnly`

### 2.1 What was ratified vs. what Figma can actually do

D6 ratified `iconOnly` as a **Boolean** that "hides the label, equalizes padding for a square aspect." This cannot be built as a functioning Boolean in Figma: **Boolean component properties can only toggle a layer's visibility or swap an instance-swap target — they cannot conditionally change a numeric property (padding) on the same node.** Two genuinely different fixes exist for two genuinely different problems, and they were kept separate rather than forced into one:

| Property | Type | Mechanism | Status |
|---|---|---|---|
| `iconLeft` | Boolean | Toggles a nested `Icon/16` instance's visibility | ✅ **Fully wired and proven** |
| `iconRight` | Boolean | Same, mirrored | ✅ **Fully wired and proven** |
| `iconLeftSwap` / `iconRightSwap` | Instance swap | Swaps which glyph the icon instance points to | ✅ **Fully wired and proven** |
| `iconOnly` | Boolean | Exists on the property panel (API/Blazor-parity shape) | 🟡 **Not functionally wired in Figma — see §2.3** |

### 2.2 `iconLeft` / `iconRight` — genuinely functional, not just present

Added at the `Button` set (`638:18`) level via `addComponentProperty`. Wired into **2 of 27 variants** — `variant=secondary, size=md, state=default` and `variant=ghost, size=sm, state=default` — the exact two the `ExportButton`/`CloseButton` migration (§3) needed. The other 25 variants carry the property definitions (visible in the panel) but have no nested icon children yet, so toggling `iconLeft`/`iconRight` on them currently renders nothing. This was a deliberate scope match to what this session's migration actually consumed, not an oversight — wiring all 27 when 2 were needed would have worked against the repeated rate-limit constraint this build operated under.

**The wiring was proven, not assumed.** A disposable test instance of `secondary/md/default` was created, `iconLeft` toggled `false → true → false`, and the nested icon's `.visible` property read back at each step (`false → true → false`, confirmed). The swap property was proven the same way (`iconLeftSwap` set to `bi-search`'s id, nested instance's `mainComponent.name` read back as `Icon/16/bi-search`, confirmed). The test instance was discarded after verification.

**Icon size is not uniform across the `size` axis** — `sm` and `md` both use `size/icon/sm` (16px); only `lg` steps up to `size/icon/md` (20px). Both wired variants this round (`secondary/md`, `ghost/sm`) use `size/icon/sm` — no `lg` variant has been wired yet, so the 20px case remains unverified in practice.

### 2.3 `iconOnly` — the real behavior is a separate standalone component

Since padding cannot be conditionally driven by a Boolean, the actual square-icon-button behavior D6 asked for lives in a **new standalone component**, `Button/ghost-icon-only/sm` (`656:64`) — architecturally a sibling of `Button`, not a variant inside it, matching the precedent already set by `Pagination`'s `PrevButton`/`NextButton` (also standalone, also outside the `Button` set).

```
Button/ghost-icon-only/sm   ── Horizontal AL · Hug × Hug · center × center
                                Padding: --space-2 (8) bound, ALL four sides equal
                                Radius --radius-lg · Fill: transparent (ghost)
└── Icon/16                  ── bound to size/icon/sm, fill text/body — swap via mainComponent

Resulting size: 8 + 16 + 8 = 32×32, exactly square.
```

**The `8px` padding is not arbitrary — it is the one case where the square-aspect math happens to land exactly on an existing token.** General formula: `(target_control_size − icon_size) / 2`.

| Size | Icon | Target (`size/control/*`) | Padding math | Result |
|---|---:|---:|---|---|
| `sm` | 16 | 32 | `(32−16)/2 = 8` = `space/2` (bound) | **Built** |
| `md` | 16 | 40 | `(40−16)/2 = 12` = `space/3` (bound) | Not built — same pattern, one more component when needed |
| `lg` | 20 | 48 | `(48−20)/2 = 14` — **off-grid, would need a literal**, same precedent as `Cell`'s `11px` (D9) | Not built |

Only `sm` was built, because it's the only size the `CloseButton` migration (§3) required. `md` and `lg` follow the identical pattern and are one small component each whenever a consumer needs them — not built speculatively.

### 2.4 What `iconOnly` the Boolean is actually for

It exists on `Button`'s property panel purely so the **Blazor `Button.razor` component's real API shape** can be documented and previewed consistently — a real HTML/CSS `<button>` *can* conditionally apply square padding via a CSS class driven by a C# `bool`, since CSS has no equivalent restriction to Figma's. The Boolean is therefore accurate documentation of the *code-side* contract even though it has no working Figma-side behavior. This asymmetry — one property, two different levels of "real" depending on which layer you're looking at — is unusual enough to warrant this explicit callout so a future editor doesn't assume parity that doesn't exist.

---

## §3 — Migration Record

Both hand-built hacks flagged since Phase 3 are now replaced with real component instances.

| Before | After | Verified |
|---|---|---|
| `ExportButton` — a composited `Icon/16/bi-download` + `Button` sibling-frame wrapper (Phase 4.1) | Single instance of `Button[variant=secondary, size=md, state=default]` with `iconLeft=true`, `iconLeftSwap=bi-download`, label `"ส่งออกข้อมูล"` | ✅ Instance `656:69`, `mainComponent.id` confirmed, label and icon-visibility read back correct |
| `CloseButton` — a hand-built 32×32 frame inside `ModalDialog` (Phase 3) | Instance of `Button/ghost-icon-only/sm` (`656:64`), icon swapped to `bi-x-lg` | ✅ Instance `656:78`, height confirmed `32px` (matches the original hand-built shape exactly), `ModalHeader` child order preserved |

Both migrations render **visually identical** to their pre-migration hacks — the point of the migration was structural (real components, real bindings) not visual.

---

## §4 — Open Items

| Item | Status |
|---|---|
| `iconLeft`/`iconRight` wired into the other 25 `Button` variants | Not done — build on demand, same 2-variant pattern used this round |
| `Button/ghost-icon-only/md` and `/lg` | Not built — formula documented in §2.3, build when a consumer needs one |
| Generic `Chip/Status` (Draft/Pending/Approved/Rejected/Canceled/Completed) | Still deferred (D7 redirected scope to `Chip/CertStatus` instead) — the 3 icon SVGs it needs were never fetched |
| `iconOnly` as a genuine Figma variant axis (not just a documentation Boolean) | Not attempted — would require doubling relevant portions of the 27-variant matrix; revisit if more than one icon-only shape/size is needed simultaneously |
| Icon size verification for `lg`-sized icon buttons (20px case) | Unverified — only `sm`-sized wiring (16px) has been exercised and proven |
