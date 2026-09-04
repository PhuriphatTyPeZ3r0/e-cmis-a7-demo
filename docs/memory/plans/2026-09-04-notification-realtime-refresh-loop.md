# Task Plan: Stop notification Realtime refresh loop

> **Plan ID:** `2026-09-04-notification-realtime-refresh-loop`  
> **Date:** 2026-09-04  
> **Author / Agent:** Codex  
> **Status:** Completed  
> **Branch / PR:** `main`

## 1. Problem Statement & Business Objective

The production Notification Center repeatedly refreshed and prevented user interaction. Realtime emits separate changes for an event and each recipient; concurrent forced hydrations combined with persistence side effects during rendering could feed database writes back into Realtime.

## 2. Affected Routes & Modules

- `assets/ecmis-app.js`: deduplicate refreshes and eliminate writes for existing events.
- `notifications.html`: keep rendering side-effect free.
- `tests-e2e/notifications.spec.js`: regression coverage and database isolation.

## 3. Anti-Regression Pre-Check

- [x] Preserve the required case-type table column.
- [x] Do not expose the agenda registry to chairman/affairs.
- [x] Continue using the shared Supabase singleton.
- [x] Run `npm run sync` after root HTML changes.
- [x] Do not alter government A4 geometry.
- [x] Do not bypass commit hooks.

## 4. Implementation Tasks

- [x] Reuse an active hydration instead of starting overlapping forced reads.
- [x] Debounce event/recipient Realtime changes into one refresh.
- [x] Return existing idempotent events without another database write.
- [x] Remove reminder scheduling side effects from the Notification Center render function.
- [x] Disable the live notification database explicitly in isolated E2E tests.

## 5. Verification

- [x] `npm run sync` passes with 35 paired routes.
- [x] `npm test` passes all five CI layers.
- [x] Notification Playwright regression passes 5/5.
- [x] Added a test proving three duplicate `createEvent` calls persist exactly once.
- [x] Confirmed no `test-*` notification events remained in Supabase.

## 6. Completion & Sign-off

- **Completed Date:** 2026-09-04
- **Commit Reference:** Not committed (working-tree implementation)
- **Notes:** Realtime remains enabled, but it is now read-only on refresh and coalesces change bursts before hydration.
