/*
 * Flow 7.2 (วินิจฉัยชี้มูล) — split into segments to walk the full chain:
 * resolution-72.html (lock) -> ruling-report.html (send to sign) ->
 * ruling-report.html (sign) / chairman.html (sign, alternate entry point).
 * Design doc: docs/memory/standards/test-design-e2e-flow-71-73.md
 *
 * Segments A/A2/C used to document a real, confirmed gap: ruling-report.html's
 * own #btnDraftDone/#btnSignRuling wrote only to ECMIS.Model.CaseStore (local
 * mock) — never touched by the session that connected resolution-72.html/
 * chairman.html to Supabase. That gap is now closed (see #btnDraftDone/
 * #btnSignRuling in ruling-report.html) — Segment A2 asserts the fix directly
 * instead of confirming the old gap.
 *
 * Also discovered while writing this suite (not previously known, still true
 * after the fix above): the app has TWO independent "sign the 7.2 ruling
 * report" code paths — ruling-report.html's own #btnSignRuling (redirects to
 * register.html) and chairman.html's save_status handler (redirects to
 * agenda-registry.html, reachable when a case is queued at
 * PENDING_SIGN_RULING_72). Neither knows about the other, and each writes to
 * Supabase independently (both now correctly, but via separate code paths) —
 * Segment C exercises the former, Segment B the latter.
 */
const { test, expect, db, seedE2ECase, restoreE2ECase, setRole, trackConsoleErrors } = require('./fixtures');

// two different real, mock-registered 7.2-track cases so Segment A/A2/C and Segment B
// don't have to share (and serialize on) the same fixture
const CASE_ID_A = '1402/2565';
const CASE_ID_B = '1855/2568';

test.describe('Flow 7.2 — บันทึกมติวินิจฉัยชี้มูล', () => {
  test('Segment A/A2/C — resolution-72.html lock -> ruling-report.html send -> ruling-report.html sign, end to end', async ({ page }) => {
    const fx = await seedE2ECase(CASE_ID_A, '110');
    const consoleTrack = trackConsoleErrors(page);

    try {
      // ---------- Segment A: board_sec locks the resolution (GUILTY_72) ----------
      await setRole(page, 'board_sec');
      await page.goto(`/resolution-72.html?case=${encodeURIComponent(fx.tccNo)}`);

      // GUILTY_72 is the default-selected resolution on this page (confirmed manually
      // this session) — only need to satisfy the other required fields.
      await page.check('#guiltyDiscipline');
      await page.fill('#agendaDetails', 'พฤติการณ์จากมติบอร์ดสำหรับทดสอบการส่งต่อรายงาน ม.72');
      await page.fill('#disciplinaryFinding', 'ฐานความผิดทางวินัยจากมติบอร์ดสำหรับผู้ถูกกล่าวหา');
      await page.fill('#boardOpinion', 'ทดสอบระบบอัตโนมัติ — E2E flow 7.2 segment A');

      await page.locator('.action-bar [data-act="lock"]').click();
      await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
      await page.locator('.swal2-confirm').click();

      await page.waitForURL(/ruling-report\.html\?case=/, { timeout: 5000 });
      // ruling-report.html shows #btnDraftDone immediately from the synchronous mock-array
      // render, before its own async initData() (the Supabase fetch that populates
      // kase.trr_id) resolves. Clicking before that finishes would make updateCaseStatus()'s
      // "if (sb && kase.trr_id)" guard silently skip the write — wait for the network to
      // settle first so kase.trr_id is actually populated by click time.
      await page.waitForLoadState('networkidle');

      let row = await db.getRequest(fx.trrId);
      expect(row.trr_status, 'resolution-72 lock should persist trr_status=111 (RESOLVED_PENDING_72)').toBe('111');
      expect(row.trr_resolution_data.factSummary72).toBe('พฤติการณ์จากมติบอร์ดสำหรับทดสอบการส่งต่อรายงาน ม.72');
      expect(row.trr_resolution_data.accusedDecisions72).toHaveLength(1);
      expect(row.trr_resolution_data.accusedDecisions72[0].name).toBe('นายภัทร ศุลกากร');
      expect(row.trr_resolution_data.accusedDecisions72[0].status).toBe('GUILTY_72');

      const perAccusedFact = page.locator('.accused-fact-text').first();
      const perAccusedOffense = page.locator('.accused-offense-text').first();
      const perAccusedAdditional = page.locator('.accused-additional-text').first();
      await expect(perAccusedFact).toHaveValue('พฤติการณ์จากมติบอร์ดสำหรับทดสอบการส่งต่อรายงาน ม.72');
      await expect(perAccusedOffense).toHaveValue('ฐานความผิดทางวินัยจากมติบอร์ดสำหรับผู้ถูกกล่าวหา');
      await perAccusedAdditional.fill('ข้อความที่เจ้าหน้าที่ปรับแต่งเพิ่มเติมตามสถานะชี้มูล');

      // ---------- Segment A2, same fixture/page: #btnDraftDone (gap now closed) ----------
      // still on ruling-report.html after the redirect above
      const draftDoneBtn = page.locator('#btnDraftDone');
      await expect(draftDoneBtn, 'ruling-report.html should offer "จัดทำรายงานวินิจฉัยชี้มูลเสร็จ" for board_sec when status is RESOLVED_PENDING_72').toBeVisible({ timeout: 5000 });
      // Start waiting for the reload before clicking. The handler first persists the edited
      // form payload, then writes the new status in a second PATCH, and finally reloads. Waiting
      // for only the first PATCH races the status update and can observe the old status (111).
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'load' }),
        draftDoneBtn.click()
      ]);
      // let this reload's own load + initData() Supabase re-fetch fully settle before Segment C
      // triggers a second reload — otherwise the two reloads' initData() calls can overlap and
      // race, corrupting which status ends up applied to kase.
      await page.waitForLoadState('networkidle');

      row = await db.getRequest(fx.trrId);
      expect(row.trr_status, 'FIX CONFIRMED: #btnDraftDone now persists trr_status=112 (PENDING_SIGN_RULING_72) via ECMIS.updateCaseStatus() — previously this assertion documented the opposite (gap) on purpose').toBe('112');
      expect(row.trr_resolution_data.accusedDecisions72[0].additionalText).toBe('ข้อความที่เจ้าหน้าที่ปรับแต่งเพิ่มเติมตามสถานะชี้มูล');

      const realErrors = consoleTrack.errors();
      expect(realErrors, `no real console errors expected in segment A/A2: ${JSON.stringify(realErrors)}`).toEqual([]);

      // ---------- Segment C, same fixture/page: chairman signs via ruling-report.html's own #btnSignRuling ----------
      await setRole(page, 'chairman');
      await page.reload();
      await page.waitForLoadState('networkidle'); // same initData() race as Segment A2 above

      const fromStatusBeforeSign = row.trr_status;
      const signRulingBtn = page.locator('#btnSignRuling');
      await expect(signRulingBtn, 'ruling-report.html should offer "ลงนามรายงานวินิจฉัยชี้มูล" for chairman when status is PENDING_SIGN_RULING_72').toBeVisible({ timeout: 5000 });
      await signRulingBtn.click();
      await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
      await page.locator('.swal2-confirm').click();

      await page.waitForURL(/register\.html/, { timeout: 5000 });

      row = await db.getRequest(fx.trrId);
      // GUILTY_72 selected in Segment A -> nextStatusPatchByResolution()'s default branch -> 115 (PENDING_DISPATCH_GUILTY_72)
      expect(row.trr_status, '#btnSignRuling should persist trr_status=115 (PENDING_DISPATCH_GUILTY_72) for a GUILTY_72 case').toBe('115');
      const events = await db.getEvents(fx.trrId);
      const signedEvt = events.find(e => e.trre_from_status === fromStatusBeforeSign && e.trre_to_status === '115');
      expect(signedEvt, 'a SIGNED audit event for the #btnSignRuling transition should exist').toBeTruthy();
    } finally {
      await restoreE2ECase(fx.trrId, fx.snapshot);
    }
  });

  test('Segment B — chairman.html signs a 7.2 case (seeded directly at PENDING_SIGN_RULING_72, the alternate entry point)', async ({ page }) => {
    const fx = await seedE2ECase(CASE_ID_B, '112'); // 112 = PENDING_SIGN_RULING_72
    const consoleTrack = trackConsoleErrors(page);

    try {
      await setRole(page, 'chairman');
      await page.goto(`/chairman.html?case=${encodeURIComponent(fx.tccNo)}`);

      await page.locator('.action-bar [data-act="sign"]').click();
      await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
      await page.locator('.swal2-confirm').click();

      await expect(page.locator('.action-bar [data-act="save_status"]')).toBeVisible({ timeout: 5000 });
      await page.locator('.action-bar [data-act="save_status"]').click();
      await expect(page.locator('.swal2-confirm')).toBeVisible({ timeout: 5000 });
      await page.locator('.swal2-confirm').click();

      await page.waitForURL(/inbox\.html/, { timeout: 5000 });

      const row = await db.getRequest(fx.trrId);
      expect(row.trr_status, 'chairman.html save_status should persist trr_status=109 (PENDING_INVITE_72) via ECMIS.updateCaseStatus()').toBe('109');

      const events = await db.getEvents(fx.trrId);
      const signedEvt = events.find(e => e.trre_type === 'SIGNED');
      expect(signedEvt, 'a SIGNED audit event should exist').toBeTruthy();

      const realErrors = consoleTrack.errors();
      expect(realErrors, `no real console errors expected in segment B: ${JSON.stringify(realErrors)}`).toEqual([]);
    } finally {
      await restoreE2ECase(fx.trrId, fx.snapshot);
    }
  });
});
