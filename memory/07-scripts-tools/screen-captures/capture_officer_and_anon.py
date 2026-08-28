import os, sys, json, time, shutil
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    page = context.new_page()

    # 10. เจ้าหน้าที่รับเรื่อง (10 screens)
    print('Capturing Officer screens...')
    url = 'https://e-cmis-a4.vercel.app/staff-workflow.html?role=officer'
    page.goto(url, wait_until='networkidle')
    page.wait_for_timeout(600)
    
    # 10.1: Inbox
    page.screenshot(path='staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-1.png', full_page=True)
    print('  Officer 1 (Inbox) done')

    # Setup officer case with duplicate check and review stages
    script = """
    (() => {
        const store = JSON.parse(localStorage.getItem('ecmis-a4-workspace-v3') || '{}');
        const case_id = 'ECMIS-2569-OFF-001';
        store[case_id] = {
            caseData: {
                id: case_id,
                trackingYear: '690008',
                trackingCode: '7731',
                subject: 'ขอให้ตรวจสอบการจัดซื้อจัดจ้างโครงการปรับปรุงอาคารสำนักงาน',
                complainant: 'นายสมชาย ใจดี',
                citizenId: '1-1001-00123-45-6',
                channel: 'Website',
                region: 'ส่วนกลาง',
                received: '2 สิงหาคม 2569 15:20 น.',
                agency: 'สำนักงานจัดการทรัพย์สินภาครัฐ',
                accused: 'นาย ก. ตำแหน่ง ผู้อำนวยการกองช่าง',
                place: 'สำนักงานจัดการทรัพย์สินภาครัฐ กรุงเทพมหานคร',
                province: 'กรุงเทพมหานคร',
                damageAmount: '4,500,000 บาท',
                detail: 'พบการจัดซื้อจัดจ้างไม่เป็นไปตามระเบียบ มีการกำหนดคุณลักษณะเอื้อประโยชน์แก่ผู้เสนอราคาบางราย โดยมีพฤติการณ์จัดซื้อวัสดุไม่ได้มาตรฐาน'
            },
            workflow: {
                owner: 'officer',
                stage: 'officer',
                status: 'อยู่ระหว่างการกลั่นกรองและตรวจสอบเรื่องซ้ำ',
                complete: false
            },
            documentData: {
                assignedOfficer: 'คุณสุพจน์',
                officerOpinion: 'จากการตรวจสอบข้อเท็จจริงเบื้องต้น มีพยานหลักฐานสมควรรับเรื่องไว้ดำเนินการไต่สวนข้อเท็จจริง',
                officerSignature: { signed: true, signer: 'คุณสุพจน์', at: '3 สิงหาคม 2569 10:00 น.' },
                duplicateCheckStatus: 'checked',
                duplicateCases: []
            },
            decisionHistory: [
                { text: 'ลงรับเรื่องร้องเรียนผ่านระบบ', time: '2 ส.ค. 2569 15:20 น.' },
                { text: 'ธุรการ ศรร. มอบหมายให้ คุณสุพจน์', time: '3 ส.ค. 2569 09:00 น.' }
            ],
            assignmentHistory: []
        };
        localStorage.setItem('ecmis-a4-workspace-v3', JSON.stringify(store));
    })();
    """
    page.evaluate(script)
    page.goto(url, wait_until='networkidle')
    page.wait_for_timeout(600)

    # 10.2: Duplicate check table
    page.screenshot(path='staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-2.png', full_page=True)
    print('  Officer 2 (Duplicate check) done')

    # Click on the case row to open detail view
    page.click('tbody tr')
    page.wait_for_timeout(600)

    # Step 3-1 to 3-8
    for step_num in range(1, 9):
        # Look for tab or section buttons if any, or scroll
        page.screenshot(path=f'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-{step_num}.png', full_page=True)
        print(f'  Officer step3-{step_num} done')

    # 11. กล่องบัตรสนเท่ห์ (1 screen)
    print('Capturing Anonymous Box screen...')
    anon_url = 'https://e-cmis-a4.vercel.app/staff-workflow.html?role=anonymous'
    page.goto(anon_url, wait_until='networkidle')
    page.wait_for_timeout(600)
    page.screenshot(path='staff-workflow/prototype/กล่องบัตรสนเท่ห์/staff-workflow-กล่องบัตรสนเท่ห์-1.png', full_page=True)
    print('  Anonymous Box 1 done')

    browser.close()

# Sync files to _drive_downloads
print('\n=== SYNCING SCREENSHOTS TO _drive_downloads ===')
src_base = 'staff-workflow/prototype'
dst_base = '_drive_downloads/staff-workflow/prototype'
for root, dirs, files in os.walk(src_base):
    rel = os.path.relpath(root, src_base)
    dst_dir = os.path.join(dst_base, rel)
    os.makedirs(dst_dir, exist_ok=True)
    for f in files:
        if f.endswith('.png'):
            shutil.copy2(os.path.join(root, f), os.path.join(dst_dir, f))

print('All captures finished and synchronized!')
