/* E-CMIS กิจกรรมที่ 5 — Phase 0 persistence guard (corrective-rebuild plan)
 *
 * Purpose (Phase 0, Task 3): install ONE chokepoint that every case-state
 * persistence write in activity5-workspace.js passes through, so that a
 * blocked action ID cannot land a write to localStorage/sessionStorage —
 * structurally, not by convention. Task 4 (next task) populates the deny
 * list below using exactly the "Deny-list for Task 4" section of
 * action-matrix.md. This file ships with an EMPTY deny list; Task 3 must
 * not disable any real action.
 *
 * Must load BEFORE activity5-workspace.js (see staff-workflow.html).
 *
 * ---------------------------------------------------------------------
 * HARD_BLOCK definition (Phase 0, Task 3 step 5 — verbatim; Task 4
 * references this definition rather than re-specify it):
 *
 *   A hard-blocked action (a) performs zero writes to `localStorage` or
 *   `sessionStorage`, (b) returns the Section 4.5 Result envelope with
 *   `ok: false`, a stable `code`, a `messageTh` in Thai, and `state`
 *   identical to the input state (not a clone with edits), and (c) causes
 *   the UI to surface the Thai message to the user. It never throws an
 *   unhandled error and never silently no-ops.
 * ---------------------------------------------------------------------
 *
 * Recommended Task 4 usage pattern (the "register the action ID" pattern):
 *
 *   const Guard = globalThis.ECMISActivity5Phase0Guard;
 *   if (Guard.isBlocked(actionId)) return Guard.blockedResult(actionId, state);
 *   // ...otherwise proceed exactly as before...
 *
 * That single check, placed before any read/mutate/write logic for a
 * denied action, is the primary mechanism and is what satisfies clause
 * (b)/(c) of HARD_BLOCK (a clean Result envelope, no thrown error).
 *
 * `withAction(actionId, fn)` below is a SECONDARY, defense-in-depth
 * mechanism: it marks `actionId` as "currently executing" for the
 * duration of `fn`, so that if a write is *still* attempted while a
 * blocked action ID is active (e.g. the primary check above was
 * forgotten or bypassed by a fail-open call site — see action-matrix.md
 * Category 5's `currentA5ActorForAuthority`/`late-*` findings), the
 * actual persistence chokepoints (`writeStore`, `issueOrderNo213`, the
 * `publish()` public-status mirror) refuse to write and throw a
 * `Phase0GuardBlockedError` instead of silently no-oping. This is what
 * makes clause (a) of HARD_BLOCK structurally true rather than merely
 * conventionally true.
 */
(() => {
  'use strict';

  // Task 3 ships this EMPTY. Only Task 4 may add entries, and only the
  // exact action_id strings listed under "Deny-list for Task 4" in
  // action-matrix.md — no more, no fewer. 16 IDs, grouped under the five
  // category headings quoted verbatim from the master plan (Phase 0,
  // งาน item 3). Populated by Task 4 (2026-08-15).
  const DENY_LIST = Object.freeze([
    // 1) review approve/return ที่ข้าม opinion/signature/package
    'chain-approve', 'chain-return', 'chain-skip-group',
    'report-213-review-approve', 'report-644-review-approve',
    // 2) direct send A7 ที่ไม่มี frozen package
    'report-213-send-a7',
    // 3) committee result ที่ไม่มี actor guard
    'mti213-decide', 'mti644-decide',
    // 4) direct close-case
    'close-case', 'case-close', 'm62-recall',
    // 5) role-changing path ที่สร้าง authority จาก string
    'late-review', 'late-secretary', 'late-skip-group', 'start', 'submit-decision'
  ]);

  const BLOCK_CODE = 'PHASE0_HARD_BLOCK';
  const BLOCK_MESSAGE_TH = 'การดำเนินการนี้ถูกระงับชั่วคราวเพื่อป้องกันความเสี่ยงตามมาตรการควบคุมของระบบ กรุณาติดต่อผู้ดูแลระบบหากจำเป็นต้องดำเนินการต่อ';

  // Stack rather than a single slot so a guarded action whose body calls
  // into another guarded action (re-entrancy) unwinds correctly.
  const currentActionStack = [];

  function isBlocked(actionId) {
    return DENY_LIST.includes(String(actionId ?? ''));
  }

  function currentActionId() {
    return currentActionStack.length ? currentActionStack[currentActionStack.length - 1] : null;
  }

  function withAction(actionId, fn) {
    currentActionStack.push(String(actionId ?? ''));
    try {
      return fn();
    } finally {
      currentActionStack.pop();
    }
  }

  // Section 4.5 Result envelope. `state` is returned by reference — never
  // cloned, never mutated here — so it is structurally identical to the
  // input, satisfying "failure ไม่ mutate state" by construction rather
  // than by a downstream equality check.
  function blockedResult(actionId, state) {
    return {
      ok: false,
      code: BLOCK_CODE,
      messageTh: BLOCK_MESSAGE_TH,
      state,
      auditEvent: { type: 'phase0-hard-block', actionId: String(actionId ?? ''), at: new Date().toISOString() },
      focusTarget: null
    };
  }

  class Phase0GuardBlockedError extends Error {
    constructor(actionId) {
      super(`ECMISActivity5Phase0Guard: persistence attempted while action "${actionId}" is hard-blocked`);
      this.name = 'Phase0GuardBlockedError';
      this.phase0Blocked = true;
      this.actionId = actionId;
    }
  }

  // Callable from any persistence chokepoint. `actionId`, if passed
  // explicitly, overrides the ambient `withAction` scope for that one
  // call; otherwise the ambient scope (if any) is used. Throws — never
  // silently no-ops — when the resolved action ID is on the deny list.
  function assertWritable(actionId) {
    const id = actionId !== undefined && actionId !== null ? String(actionId) : currentActionId();
    if (id && isBlocked(id)) throw new Phase0GuardBlockedError(id);
  }

  globalThis.ECMISActivity5Phase0Guard = Object.freeze({
    isBlocked,
    blockedResult,
    assertWritable,
    withAction,
    currentActionId,
    Phase0GuardBlockedError
  });

  if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.ECMISActivity5Phase0Guard;
})();
