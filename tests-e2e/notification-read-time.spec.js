const { test, expect, setRole } = require('./fixtures');

test.describe('Existing notification dropdown database read timestamp', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width:1920, height:1080 });
    await page.addInitScript(() => {
      const readRows = () => JSON.parse(sessionStorage.getItem('test.notificationReceipts') || '[]');
      const writeRows = rows => sessionStorage.setItem('test.notificationReceipts', JSON.stringify(rows));
      window.__ecmisSupabaseClient = {
        from(table) {
          return {
            select() { return this; },
            eq(column, value) {
              if (table === 'ecmis_notification_read_receipt') {
                return Promise.resolve({ data:readRows().filter(row => row[column] === value), error:null });
              }
              return Promise.resolve({ data:[], error:null });
            }
          };
        },
        async rpc(name, args) {
          if (name !== 'ecmis_record_notification_read') return { data:null, error:{ message:'Unexpected RPC' } };
          const rows = readRows();
          let row = rows.find(item => item.notification_id === args.p_notification_id && item.user_id === args.p_user_id);
          if (!row) {
            row = { notification_id:args.p_notification_id, user_id:args.p_user_id, read_at:new Date().toISOString() };
            rows.push(row);
            writeRows(rows);
          }
          sessionStorage.setItem('test.notificationRpcCalls', String(Number(sessionStorage.getItem('test.notificationRpcCalls') || 0) + 1));
          return { data:row.read_at, error:null };
        }
      };
    });
    await setRole(page, 'affairs');
    await page.goto('/inbox.html');
    await page.evaluate(() => {
      sessionStorage.removeItem('test.notificationReceipts');
      sessionStorage.removeItem('test.notificationRpcCalls');
    });
    await page.reload();
  });

  test('records the first click through the database RPC and restores it after reload', async ({ page }) => {
    const item = page.locator('.notif-item[data-notif-id="demo-1"]');
    await item.click({ force:true });

    await expect(item.locator('.notif-read-tag')).toBeVisible();
    await expect(item.locator('.notif-read-time')).not.toHaveText('');
    const firstDisplayedAt = await item.locator('.notif-read-time').innerText();
    const firstStoredAt = await page.evaluate(() => JSON.parse(sessionStorage.getItem('test.notificationReceipts'))[0].read_at);

    await item.click({ force:true });
    expect(await page.evaluate(() => sessionStorage.getItem('test.notificationRpcCalls'))).toBe('1');
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('test.notificationReceipts'))[0].read_at)).toBe(firstStoredAt);

    await page.reload();
    const restoredItem = page.locator('.notif-item[data-notif-id="demo-1"]');
    await expect(restoredItem.locator('.notif-read-time')).toHaveText(firstDisplayedAt);
  });

  test('uses the same database-backed timestamp UI for deadline notifications', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const item = document.createElement('li');
      item.className = 'notif-item';
      item.dataset.notifId = 'deadline-test';
      item.innerHTML = '<span class="notif-unread-dot"></span><small class="notif-read-tag d-none">อ่านแล้ว <span class="notif-read-time"></span></small>';
      document.body.appendChild(item);
      await ECMIS.markNotifRead('deadline-test');
      return {
        rows:JSON.parse(sessionStorage.getItem('test.notificationReceipts')),
        displayedAt:item.querySelector('.notif-read-time').textContent,
        visible:!item.querySelector('.notif-read-tag').classList.contains('d-none')
      };
    });
    expect(result.rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ notification_id:'deadline-test', user_id:'affairs' })
    ]));
    expect(result.displayedAt).toBeTruthy();
    expect(result.visible).toBe(true);
  });
});
