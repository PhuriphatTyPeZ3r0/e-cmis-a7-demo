/*
 * Flow 7.1 (ไต่สวนเบื้องต้น) — full continuous UI chain:
 * board-resolution.html (lock) -> order.html (send, as drafter) -> order.html
 * (sign, as chairman/secgen). Design doc:
 * docs/memory/standards/test-design-e2e-flow-71-73.md
 */
const { test, expect, db, seedE2ECase, restoreE2ECase, setRole, trackConsoleErrors } = require('./fixtures');

// real, mock-registered case (assets/ecmis-app.js CASES) with a live tbl_res_request
// row — required because ECMIS.requireCase() rejects unknown ids before Supabase data
// can load (see the long comment on seedExistingCase() in scripts/lib/supabase-rest.js)
const CASE_ID = '1609/2568';

test.describe('Flow 7.1 — บอร์ดลงมติ → ส่งออกคำสั่ง → ลงนาม', () => {
  test('board-resolution lock -> order.html send -> order.html sign, end to end', async ({ page }) => {
    const fx = await seedE2ECase(CASE_ID, '012');
    const consoleTrack = trackConsoleErrors(page);

    try {
      // ---------- Step 1: board_sec locks the resolution ----------
      await setRole(page, 'board_sec');
      await page.goto(`/board-resolution.html?case=${encodeURIComponent(fx.tccNo)}`);

      await page.fill('#agendaDetails', 'พฤติการณ์จากมติบอร์ดสำหรับคำสั่งแต่งตั้ง ม.24');
      await page.fill('#boardOpinion', 'ทดสอบระบบอัตโนมัติ — E2E flow 7.1');
      await page.locator('.action-bar [data-act="save_resolution"]').click();
      await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
      await page.locator('.swal2-confirm').click();

      // Recording the resolution returns board_sec to the inbox. Open the generated
      // M.24 form explicitly as the next actor, matching the real cross-role hand-off.
      await page.waitForURL(/inbox\.html/, { timeout: 5000 });

      let row = await db.getRequest(fx.trrId);
      expect(row.trr_status, 'board-resolution lock should persist trr_status=015 (RESOLVED)').toBe('015');
      expect(row.trr_resolution_data.agendaDetails).toBe('พฤติการณ์จากมติบอร์ดสำหรับคำสั่งแต่งตั้ง ม.24');
      expect(row.trr_resolution_data.accusedSnapshot[0].name).toBe('นายวีระ ขับขี่ดี');

      // ---------- Step 2: affairs (drafter) sends the order for signature ----------
      await setRole(page, 'affairs');
      await page.goto(`/order.html?case=${encodeURIComponent(fx.tccNo)}`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('#allegationBox')).toContainText('พฤติการณ์จากมติบอร์ดสำหรับคำสั่งแต่งตั้ง ม.24');
      await expect(page.locator('#boardAccusedNames')).toHaveValue(/นายวีระ ขับขี่ดี/);
      await page.fill('#boardOffenseBasis', 'ฐานความผิดที่เจ้าหน้าที่ปรับแต่งในร่างคำสั่ง');

      const signCardHidden = await page.locator('#signCard').evaluate(el => el.classList.contains('d-none'));
      expect(signCardHidden, 'drafter (affairs) must not see the signature card — session #5 fix').toBe(true);

      await page.fill('#orderNo', '999/2569-E2E');
      await page.locator('.action-bar [data-act="send_order"]').click();
      await page.waitForURL(/inbox\.html/, { timeout: 5000 });

      row = await db.getRequest(fx.trrId);
      expect(['018', '019']).toContain(row.trr_status);
      expect(row.trr_resolution_data.order24OffenseBasis).toBe('ฐานความผิดที่เจ้าหน้าที่ปรับแต่งในร่างคำสั่ง');
      const isSub = row.trr_status === '018';
      const signerRole = isSub ? 'chairman' : 'secgen';

      // ---------- Step 3: the real signer opens the case and signs ----------
      await setRole(page, signerRole);
      await page.goto(`/order.html?case=${encodeURIComponent(fx.tccNo)}`);
      await page.waitForLoadState('networkidle');

      const signCardVisibleNow = await page.locator('#signCard').evaluate(el => !el.classList.contains('d-none'));
      expect(signCardVisibleNow, 'signer must see the signature card').toBe(true);

      // The drafter's order number is part of trr_resolution_data and must be loaded
      // before the signer sees the read-only form.
      const orderNoBeforeSigning = await page.inputValue('#orderNo');
      expect(orderNoBeforeSigning, 'orderNo should carry over from the drafter to the signer').toBe('999/2569-E2E');

      await page.locator('.action-bar [data-act="sign"]').click();
      await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
      await page.locator('.swal2-confirm').click();
      await expect(page.locator('.action-bar [data-act="save_order"]')).toBeVisible({ timeout: 5000 });

      // Known gap being confirmed here (not assumed): order.html's 'sign' action is
      // local-only (no Supabase write) — trr_status must still read whatever send_order
      // set it to (018/019), unchanged by the act of signing itself.
      row = await db.getRequest(fx.trrId);
      expect(row.trr_status, "order.html 'sign' does not itself persist anything to Supabase — trr_status stays at the send_order value").toBe(isSub ? '018' : '019');

      // ---------- Step 4: save_order — the actual final "order issued" step, now persisted ----------
      const fromStatusBeforeSaveOrder = row.trr_status;
      await page.locator('.action-bar [data-act="save_order"]').click();
      await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
      await page.locator('.swal2-confirm').click();
      await page.waitForURL(url => !url.toString().includes('order.html'), { timeout: 5000 });

      row = await db.getRequest(fx.trrId);
      expect(row.trr_status, 'save_order should persist trr_status=020 (UNDER_INVESTIGATION) — previously this key wasn\'t even in ECMIS.STATUS_CODE at all').toBe('020');
      const eventsAfterSave = await db.getEvents(fx.trrId);
      const saveSignedEvt = eventsAfterSave.find(e => e.trre_from_status === fromStatusBeforeSaveOrder && e.trre_to_status === '020');
      expect(saveSignedEvt, 'a SIGNED audit event for the save_order transition should exist').toBeTruthy();

      const realErrors = consoleTrack.errors();
      expect(realErrors, `no real console errors expected during flow 7.1 (excluding known extension noise): ${JSON.stringify(realErrors)}`).toEqual([]);
    } finally {
      await restoreE2ECase(fx.trrId, fx.snapshot);
    }
  });
});
