/*
 * Shared helpers for the Playwright E2E "เล่นหน้าจอ" suite (flow 7.1/7.2/7.3).
 * Design doc: docs/memory/standards/test-design-e2e-flow-71-73.md
 *
 * Fixture creation/cleanup reuses scripts/lib/supabase-rest.js (same module the
 * data-layer integration test uses) rather than duplicating it — tagged
 * TEST-E2E- instead of TEST-INTEGRATION- so the two suites' fixtures are easy
 * to tell apart in the database if either is interrupted mid-run.
 */
const { test, expect } = require('@playwright/test');
const db = require('../scripts/lib/supabase-rest');

/* seedCase()'s synthetic tcc_no does NOT work here — see the long comment on
   seedExistingCase() in scripts/lib/supabase-rest.js for why (ECMIS.requireCase()
   redirects away before an unknown id's Supabase data can ever load). Every E2E spec
   in this suite borrows a real, pre-existing mock-registered case id and restores its
   exact original tbl_res_request values afterward. */
function seedE2ECase(tccNo, status, extraTrrFields = {}) {
  return db.seedExistingCase(tccNo, status, extraTrrFields);
}

function restoreE2ECase(trrId, snapshot) {
  return db.restoreExistingCase(trrId, snapshot);
}

/* Role switching in this app is entirely sessionStorage-based (no real login
   flow is wired to Supabase — login.html is explicitly out of scope for this
   suite) — this is the exact bypass used manually via
   mcp__claude-in-chrome__javascript_tool throughout the session that built
   the persistence layer this suite now exercises through the UI. */
async function setRole(page, roleId) {
  await page.addInitScript((role) => {
    sessionStorage.setItem('ecmis_role', role);
    sessionStorage.setItem('ecmis_username', role);
    sessionStorage.setItem('ecmis_authed', '1');
  }, roleId);
}

/* This project's Chrome extension environment throws a stray, unrelated console
   error on essentially every page ("A listener indicated an asynchronous
   response by returning true, but the message channel closed before a
   response was received") — confirmed harmless/unrelated to app code during
   manual testing this session. Filter it out so real app errors aren't buried. */
function isRealConsoleError(msg) {
  if (msg.type() !== 'error') return false;
  if (msg.text().includes('message channel closed before a response was received')) return false;
  // Notification persistence intentionally resolves duplicate event_key inserts by
  // catching PostgreSQL 23505 and selecting the existing row. Chromium still emits a
  // generic resource error for that handled 409, so do not treat it as an app failure.
  const sourceUrl = msg.location()?.url || '';
  if (msg.text().includes('status of 409') && sourceUrl.includes('/ecmis_notification_event')) return false;
  return true;
}

/* Attach a console-error collector to a page; call .errors() any time to read
   what's accumulated so far. */
function trackConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (isRealConsoleError(msg)) errors.push(msg.text());
  });
  return { errors: () => errors.slice() };
}

module.exports = { test, expect, db, seedE2ECase, restoreE2ECase, setRole, isRealConsoleError, trackConsoleErrors };
