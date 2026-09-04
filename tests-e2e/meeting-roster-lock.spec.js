const { test, expect, setRole } = require('./fixtures');

test.describe('Meeting-wide board roster lock', () => {
  test.beforeEach(async ({ page }) => {
    await setRole(page, 'board_sec');
    await page.route('**/assets/agenda-registry-data.js', route => route.fulfill({
      status:200,
      contentType:'application/javascript',
      body:`window.AgendaRegistry={
        MEETINGS:[{trc_id:9001,trc_name:'57/2569',trc_date:'2569-10-10',trc_status:'0',trc_confirmed:false}],
        ITEMS:[
          {trci_id:9101,trc_id:9001,trci_number:'5.1',trci_topic:'หัวเรื่องจากวาระทดสอบ',remark:'รายละเอียดจากวาระทดสอบ',case_ref:'0012/2565'},
          {trci_id:9102,trc_id:9001,trci_number:'5.2',trci_topic:'เรื่องทดสอบสอง',case_ref:'CASE-2'}
        ],
        ready:Promise.resolve(),
        itemsOf(id){return this.ITEMS.filter(item=>item.trc_id===id)},
        save(){return Promise.resolve()},confirmMeeting(){return Promise.resolve()}
      };`
    }));
    await page.goto('/meeting-docs.html?meet=9001');
    await page.evaluate(() => {
      localStorage.removeItem('ecmis.meetingBoardRosters.v1');
      localStorage.removeItem('ecmis.lockedBoardRoster');
    });
    await page.reload();
  });

  test('resolution form loads title and details from the linked agenda item', async ({ page }) => {
    await page.goto('/board-resolution.html?case=0012%2F2565');

    await expect(page.locator('#meetNo')).toHaveValue('57/2569');
    await expect(page.locator('#agendaNo')).toHaveValue('5.1');
    await expect(page.locator('#caseSubject')).toHaveValue('หัวเรื่องจากวาระทดสอบ');
    await expect(page.locator('#agendaDetails')).toHaveValue('รายละเอียดจากวาระทดสอบ');
    await expect(page.locator('#docPaper')).toContainText('หัวเรื่องจากวาระทดสอบ');
  });

  test('applies one locked roster to every agenda and isolates an agenda override', async ({ page }) => {
    await expect(page.locator('#agendaRosterRows .agenda-roster-row')).toHaveCount(2);
    await page.locator('#masterRoster1').uncheck();
    await page.locator('#lockBoardRoster').check();

    await expect(page.locator('#itemsPreviewTb tr').nth(0)).toContainText('6/7 คน · ชุดกลาง');
    await expect(page.locator('#itemsPreviewTb tr').nth(1)).toContainText('6/7 คน · ชุดกลาง');

    await page.locator('#agendaUnlock9101').check();
    await page.locator('#agendaRoster9101-2').uncheck();

    await expect(page.locator('#itemsPreviewTb tr').nth(0)).toContainText('5/7 คน · เฉพาะวาระ');
    await expect(page.locator('#itemsPreviewTb tr').nth(1)).toContainText('6/7 คน · ชุดกลาง');

    const attendance = await page.evaluate(() => {
      const board = [
        { n:'นายวิชัย ยุติธรรม' }, { n:'พลเอก จิระ โกมุทพงศ์' },
        { n:'พันตำรวจโท วันนพ สมจินตนากุล' }, { n:'นายวิเชียร จันทรโณทัย' },
        { n:'นายพรเทพ อัมพรกลิ่นแก้ว' }, { n:'นายกมล สกลเดชา' }, { n:'นายสุรพงษ์ อินทรถาวร' }
      ];
      return {
        agendaOne:ECMIS.getLockedBoardAttendance({ id:'0012/2565' }, board),
        agendaTwo:ECMIS.getLockedBoardAttendance({ id:'CASE-2' }, board)
      };
    });
    expect(attendance.agendaOne['พันตำรวจโท วันนพ สมจินตนากุล']).toBe('recused');
    expect(attendance.agendaTwo['พันตำรวจโท วันนพ สมจินตนากุล']).toBe('present');
    expect(attendance.agendaTwo['พลเอก จิระ โกมุทพงศ์']).toBe('duty');
  });

  test('loads the latest linked meeting, agenda, and per-agenda attendance on the resolution page', async ({ page }) => {
    await page.evaluate(() => {
      const names = [
        'นายวิชัย ยุติธรรม', 'พลเอก จิระ โกมุทพงศ์', 'พันตำรวจโท วันนพ สมจินตนากุล',
        'นายวิเชียร จันทรโณทัย', 'นายพรเทพ อัมพรกลิ่นแก้ว', 'นายกมล สกลเดชา', 'นายสุรพงษ์ อินทรถาวร'
      ];
      localStorage.setItem('ecmis.meetingBoardRosters.v1', JSON.stringify({
        9001:{ locked:true, meetingName:'57/2569', caseRefs:['0012/2565','CASE-2'], present:names.filter((_, i) => i !== 1),
          overrides:{ 9101:{ unlocked:true, caseRefs:['0012/2565'], present:names.filter((_, i) => i !== 1 && i !== 2) } } }
      }));
    });
    await page.goto('/resolution.html?case=0012%2F2565');

    await expect(page.locator('#meetNo')).toHaveValue('57/2569');
    await expect(page.locator('#meetDate')).toHaveValue('2569-10-10');
    await expect(page.locator('#agendaNo')).toHaveValue('5.1');
    await expect(page.locator('#boardTb tr').nth(1).locator('.attend')).toHaveValue('duty');
    await expect(page.locator('#boardTb tr').nth(2).locator('.attend')).toHaveValue('recused');
  });
});
