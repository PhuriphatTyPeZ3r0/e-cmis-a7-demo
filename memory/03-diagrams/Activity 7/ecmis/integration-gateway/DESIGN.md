# E-CMIS Product Interface

## Theme

Light operational workspace for government case officers working on desktop displays in normal office lighting. Dense enough for repeated investigation work, but with clear progression from search to candidate selection to verified detail.

## Color

- Navigation: deep navy `#0d1b3e`
- Primary action: blue `#16558f`
- Official accent: gold `#c6a13d`, used sparingly
- Page surface: cool gray `#edf2f7`
- Content surface: tinted paper `#fbfdff`
- Text: navy ink `#172943`
- Success: green `#24714a`
- Warning: ochre `#8a6111`
- Error: muted red `#ad3f3d`
- Every semantic state includes text or an icon, never color alone

## Typography

- Primary family: Kanit, with Noto Sans Thai and Tahoma fallbacks
- Page heading: 25px, weight 600
- Section heading: 17px, weight 600
- Body: 14px, weight 400
- Labels and metadata: 10.5px to 12px
- Technical keys: system monospace at 10px to 11px
- Letter spacing remains zero in application content

## Layout

- Existing 268px sidebar and 68px top bar remain stable
- Main content uses a restrained operational hierarchy
- Search mode, input, candidate selection, verified result, and import are distinct states
- Repeated information uses tables only when comparison is the task
- Service diagnostics live in a collapsed disclosure, not the primary workflow
- Responsive breakpoints restructure grids; typography does not scale with viewport width

## Components

- Buttons use 7px radius and familiar Font Awesome icons
- Inputs and selects use 7px radius with visible focus outlines
- Cards use at most 10px radius and only frame real tools or repeated records
- Search modes use a segmented control
- Candidate matches use one stable selection panel with previous and next controls because the API returns one `recordNumber` at a time
- Verified data uses tabs for person, address, name history, status, death certificate, and card history
- Import is a focused confirmation dialog because it commits data into a case
- Loading uses a compact progress state with per-service labels

## Content Rules

- Use `ที่อยู่ตามทะเบียนบ้าน`, not `ที่อยู่ปัจจุบัน`
- Separate `ที่อยู่ตามทะเบียนบ้าน` from `ที่อยู่บนบัตรประชาชน`; the latter always carries a warning that it may be outdated
- Use `ข้อมูลทะเบียนเพิ่มเติม`, not `ข้อมูลเชิงลึก`
- Distinguish `ไม่พบข้อมูล`, `ไม่ได้รับสิทธิ์`, and `บริการไม่พร้อม`
- Label all mock data as Sandbox Mock
- Never invent a service field such as photo capture date when it is absent from the official output specification
- Printed person reports use the house-registration address, list every known name, and source contact phone numbers from the E-CMIS case rather than DOPA
- Historical portrait UI remains a marked mock until its service ID and access contract are confirmed
