const { test, expect, setRole, trackConsoleErrors } = require('./fixtures');

test.describe('Notification center and read receipts', () => {
  test.beforeEach(async ({ page }) => {
    await setRole(page, 'investigator_demo');
    await page.goto('/notifications.html');
    await page.evaluate(() => {
      localStorage.removeItem('ecmis.notifications.v1');
      localStorage.removeItem('ecmis.notificationReceipts.v1');
    });
  });

  test('creates idempotent per-user notification and keeps badge until item is opened', async ({ page }) => {
    const consoleLog = trackConsoleErrors(page);
    await page.goto('/notifications.html');
    await page.evaluate(() => {
      const event = {
        eventKey:'test-agenda:1547/2568:37/2569:5.2', type:'AGENDA_PLACED', caseId:'1547/2568',
        recipientIds:['investigator_demo','director_demo','case_clerk_demo'],
        title:'บรรจุวาระการประชุมแล้ว', body:'สำนวน 1547/2568 วาระ 5.2', href:'notifications.html',
        meetingDate:'2569-09-07', meetingNo:'37/2569', agendaNo:'5.2'
      };
      ECMIS.NotificationStore.createEvent(event);
      ECMIS.NotificationStore.createEvent(event);
    });
    await page.reload();

    await expect(page.locator('#unreadCount')).toHaveText('1');
    await expect(page.locator('.notification-row')).toHaveCount(1);
    await expect(page.locator('#notifBadge')).toHaveText('1');

    await page.locator('.notification-row').click();
    await expect(page.locator('#unreadCount')).toHaveText('0');
    await expect(page.locator('#notifBadge')).toBeHidden();
    await page.getByRole('button', { name:'ทั้งหมด', exact:true }).click();
    await page.locator('.notification-row').click();
    await expect(page.locator('#notificationEvidence')).toContainText('อ่านแล้ว');
    await expect(page.locator('#notificationEvidence')).toContainText('ยังไม่ได้อ่าน');
    expect(consoleLog.errors().filter(message => !message.includes('net::ERR_NETWORK_ACCESS_DENIED'))).toEqual([]);
  });

  test('calculates previous Thai business day for CE and BE dates including a holiday', async ({ page }) => {
    await page.goto('/notifications.html');
    const dates = await page.evaluate(() => ({
      ceMonday:ECMIS.previousThaiBusinessDay('2026-09-07'),
      beMonday:ECMIS.previousThaiBusinessDay('2569-09-07'),
      afterQueenBirthday:ECMIS.previousThaiBusinessDay('2569-08-13')
    }));
    expect(dates.ceMonday).toBe('2026-09-04');
    expect(dates.beMonday).toBe('2026-09-04');
    expect(dates.afterQueenBirthday).toBe('2026-08-11');
  });

  test('isolates receipts by recipient account', async ({ page }) => {
    await page.goto('/notifications.html');
    const result = await page.evaluate(() => {
      const n = ECMIS.NotificationStore.createEvent({
        eventKey:'test-receipt-isolation', type:'RESOLUTION_DISPATCHED', caseId:'1119/2565',
        recipientIds:['investigator_demo','director_demo'], title:'ส่งมติแล้ว', body:'ทดสอบ', href:'notifications.html'
      });
      ECMIS.NotificationStore.markRead(n.id, 'investigator_demo');
      return {
        investigator:ECMIS.NotificationStore.unreadCount('investigator_demo'),
        director:ECMIS.NotificationStore.unreadCount('director_demo'),
        investigatorReadAt:ECMIS.NotificationStore.listFor('investigator_demo')[0].readAt,
        directorReadAt:ECMIS.NotificationStore.listFor('director_demo')[0].readAt
      };
    });
    expect(result.investigator).toBe(0);
    expect(result.director).toBe(1);
    expect(result.investigatorReadAt).toBeTruthy();
    expect(result.directorReadAt).toBeNull();
  });

  test('quick login opens the notification center for all four recipient accounts', async ({ context }) => {
    const loginPage = await context.newPage();
    const accounts = [
      ['นักสืบสวน (Somchai.I)', 'investigator_demo'],
      ['ผอ.หน่วยงาน (Narin.D)', 'director_demo'],
      ['ธุรการคดี (Kanda.C)', 'case_clerk_demo'],
      ['ติดตามคดี กจ.8 (Suda.T)', 'discipline_tracker_demo']
    ];
    for (const [label, roleId] of accounts) {
      await loginPage.goto('/login.html');
      await loginPage.getByRole('button', { name:label, exact:true }).click();
      await expect(loginPage).toHaveURL(/\/notifications\.html$/);
      await expect.poll(() => loginPage.evaluate(() => sessionStorage.getItem('ecmis_role'))).toBe(roleId);
    }
    await loginPage.close();
  });
});
