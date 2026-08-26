/*
 * Flow 7.3 (เรื่องของ กกม. / เรื่องทั่วไป) — shorter chain than 7.1/7.2: locking
 * the resolution is the whole flow, there is no ม.24 order to issue
 * afterwards. Design doc: docs/memory/standards/test-design-e2e-flow-71-73.md
 *
 * Bigger finding from building this spec than the flow itself: the DB's own
 * CHECK constraints (tbl_cmp_case_doc_type_check / tbl_cmp_case_legal_base_check)
 * don't even allow the values pickTemplate() checks for legal73/general73
 * classification (kase.docType==='GENERAL', kase.legalBase==='ม.33' for
 * legal73) — tcc_doc_type only permits '213'/'RULING'/'644', tcc_legal_base
 * only 'ม.18/4'/'ม.62'. Confirmed directly against real data: both
 * กจ.102/2569 and กจ.103/2569's live rows carry tcc_doc_type='213' — neither
 * ever matches 'GENERAL'. 7.3 classification only works at all because
 * supabaseRowToCase() unconditionally overlays docType/legalBase from the
 * local mock CASES array on top of whatever the real row has. There is
 * currently no way to represent a legal73/general73 case using real Supabase
 * data alone — this test necessarily rides that same mock-array fallback.
 *
 * Uses กจ.103/2569 (general73, no fixed resolution picklist — free-text via
 * boardOpinion) rather than กจ.102/2569 (legal73): กจ.102/2569's own mock
 * `status` field is 'RESOLVED', so board-resolution.html's synchronous
 * initial render (built from mock data before the async Supabase refresh
 * lands) shows an already-locked/read-only view no matter what trr_status is
 * set to underneath — confirmed while building this test (timed out waiting
 * for the normal edit form). กจ.103/2569's mock status is 'IN_MEETING',
 * matching what this suite seeds, avoiding that mismatch.
 */
const { test, expect, db, seedE2ECase, restoreE2ECase, setRole, trackConsoleErrors } = require('./fixtures');

const CASE_ID = 'กจ.103/2569';

test.describe('Flow 7.3 — เรื่องทั่วไป (general73)', () => {
  test('board-resolution.html renders the general73 free-text form and locking ends the flow without an order.html step', async ({ page }) => {
    const fx = await seedE2ECase(CASE_ID, '012');
    const consoleTrack = trackConsoleErrors(page);

    try {
      await setRole(page, 'board_sec');
      await page.goto(`/board-resolution.html?case=${encodeURIComponent(fx.tccNo)}`);

      // confirms pickTemplate() actually resolved kind='general73' from the mock
      // array's docType/legalBase for this case id — general73 has no fixed
      // resolution picklist at all (unlike 7.1/legal73), so #resListSection stays
      // hidden and boardOpinion doubles as the free-text resolution
      await expect(page.locator('#resListSection'), 'general73 kind must hide the fixed resolution picklist').toHaveClass(/d-none/);
      await expect(page.locator('#resFreeTextNote'), 'general73 kind must show the free-text note instead').not.toHaveClass(/d-none/);

      await page.fill('#boardOpinion', 'ทดสอบระบบอัตโนมัติ — E2E flow 7.3 (เรื่องทั่วไป)');

      await page.locator('.action-bar [data-act="sign"]').click();
      await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
      await page.locator('.swal2-confirm').click();

      await page.locator('.action-bar [data-act="lock"]').click();
      await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
      await page.locator('.swal2-confirm').click();

      // 7.3 has no ม.24 order step — lock() only sends order.html-bound cases when
      // r.code is ACCEPT_S24P1/ACCEPT_S24P3; everything else goes to ECMIS.homeHref()
      await page.waitForTimeout(1600); // lock()'s redirect fires via a 1400ms setTimeout
      expect(page.url(), '7.3 must NOT redirect to order.html — there is no ม.24 order for this case type').not.toContain('order.html');

      const row = await db.getRequest(fx.trrId);
      expect(row.trr_status, 'board-resolution lock should persist trr_status=015 (RESOLVED) for 7.3 same as 7.1').toBe('015');
      expect(row.trr_resolution_data && row.trr_resolution_data.code, 'general73 resolution_data.code should be the free-text sentinel, not an ACCEPT_S24P* code').not.toMatch(/^ACCEPT_S24/);

      const realErrors = consoleTrack.errors();
      expect(realErrors, `no real console errors expected in flow 7.3: ${JSON.stringify(realErrors)}`).toEqual([]);
    } finally {
      await restoreE2ECase(fx.trrId, fx.snapshot);
    }
  });
});
