# A4+A5 Cutover Checklist

วันที่ตรวจ: 21 สิงหาคม 2569

## Build identity

- Integration branch: `integrate/a4-a5-current-20260821`
- Tested code commit: `a9c15341e4765765ebe52c55f878ddec25c05566`
- Source A4+A5 commit: `1a2a47d0c574575fd9a1061aa2abf5892361c740`
- Source checksum manifest SHA-256: `42b51c792b9540eb51ea842514baa9f871335576a11f994a4c508da29b5a9ec9`
- Rollback tag: `pre-a4-a5-integration-20260821`
- Playwright: `1.62.1`

## Verified gates

- [x] Source checksum manifest and controlled sync manifest verified
- [x] Controlled sync reports `added=0 changed=0 unchanged=171 target-overrides=11 preserved-target-only=31`
- [x] Aggregate identity overrides A4/A5 query role and locks the operational unit to the authenticated organization
- [x] A4 dispatches to เขต 1 and A5 เขต 1 receives the same case scope
- [x] Investigator assignment, acceptance, case plan submission and director approval return to the investigator
- [x] Report 213 draft saves incomplete Mock content without strict legal/content validation
- [x] GBK sends Report 213 to Activity 7 and Activity 7 returns the board result to the destination case clerk
- [x] Multiple uploads, preview and reload persistence verified through IndexedDB
- [x] Case query, reload and back navigation retain the active case
- [x] Unauthorized direct A5 URL exposes no A5 action
- [x] No browser `pageerror` in the acceptance routes

## Test evidence

| Command | Result |
|---|---|
| `npm run test:logic` | PASS 53/53 |
| `npm run test:unit` | PASS 187/187 |
| `npm run test:e2e` | PASS seam DOM and RBAC |
| `node tests/a4-a5-production-seam.test.mjs` | PASS 10/10 scenarios |
| `node scripts/sync-intake-investigation.mjs --source /Users/jetsadasomporn/Downloads/E-CMIS-A4-Production/E-CMIS-A4 --check` | PASS, no managed drift |
| `git diff --check` | PASS |

Browser smoke ran with isolated fresh contexts and an existing-state context that retained case state and uploaded files across reload. Human-operated manual acceptance is not recorded in this repository and remains a cutover approval item.

## Cache versions

- `intake-investigation/assets/activity5-workspace.js?v=20260821u`
- `board-resolution/assets/ecmis-app.js?v=20260821a` on the board-resolution result page

## Deployment gate

- Deployment owner: ไม่รู้
- Environment: ไม่รู้
- Production URL: ไม่รู้
- Deployment mechanism and credentials: ยืนยันไม่ได้
- External deploy: NOT STARTED

Do not merge or deploy until the deployment owner confirms the target, access method, maintenance window and rollback authority.

## Rollback

Before merge, return to the integration baseline with tag `pre-a4-a5-integration-20260821` or discard this branch. After a reviewed merge, revert the merge commit. Do not clear `localStorage`, IndexedDB or existing browser profiles during rollback.

The storage migration is additive and idempotent. Uploaded binary remains in IndexedDB. The cutover does not move browser state to a server-side system of record.

## Known limitations

- Authentication and workflow state remain browser-side Mock data.
- There is no backend authorization, server-side organization scope or database transaction.
- Cross-activity writes are not atomic across browser storage keys.
- Browser quota and per-device state remain operational constraints.
- External production availability, Safari behavior and deployment cache headers are not verified.
- Target-only legacy Activity 7 pages under `intake-investigation` remain cleanup backlog; the active Activity 7 owner is `/board-resolution`.
