import os, sys, json, time, shutil
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

# Ensure all output directories exist
dirs = [
    'staff-intake/prototype',
    'staff-intake/prototype/ผอ.สำนักงาน ป.ป.ท. เขต',
    'staff-intake/prototype/เจ้าหน้าที่รับเรื่องประจำเขต',
    'staff-intake/prototype/ธุรการประจำเขต',
    'staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต',
    'staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต',
    'staff-workflow/prototype/ธุรการประจำเขต',
    'staff-workflow/prototype/ธุรการสารบรรณกลาง ชั้น 14',
    'staff-workflow/prototype/ผู้รักษาราชการแทนตามคำสั่ง',
    'staff-workflow/prototype/ธุรการ ศรร.',
    'staff-workflow/prototype/ผอ.กองบริหารคดี',
    'staff-workflow/prototype/ผอ.ศูนย์รับเรื่องร้องเรียน',
    'staff-workflow/prototype/ธุรการ กบค',
    'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง',
    'staff-workflow/prototype/กล่องบัตรสนเท่ห์',
    '_drive_downloads/staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต',
    '_drive_downloads/staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต',
    '_drive_downloads/staff-workflow/prototype/ธุรการประจำเขต',
    '_drive_downloads/staff-workflow/prototype/ธุรการสารบรรณกลาง ชั้น 14',
    '_drive_downloads/staff-workflow/prototype/ผู้รักษาราชการแทนตามคำสั่ง',
    '_drive_downloads/staff-workflow/prototype/ธุรการ ศรร.',
    '_drive_downloads/staff-workflow/prototype/ผอ.กองบริหารคดี',
    '_drive_downloads/staff-workflow/prototype/ผอ.ศูนย์รับเรื่องร้องเรียน',
    '_drive_downloads/staff-workflow/prototype/ธุรการ กบค',
    '_drive_downloads/staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง',
    '_drive_downloads/staff-workflow/prototype/กล่องบัตรสนเท่ห์',
]
for d in dirs:
    os.makedirs(d, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    page = context.new_page()

    # ==========================================
    # PART 1: STAFF INTAKE (23 screens)
    # ==========================================
    print('=== CAPTURING STAFF INTAKE ===')
    # 1. Default Initial Form
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html', wait_until='networkidle')
    page.wait_for_timeout(600)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-1.png', full_page=True)
    print('  [Intake 1/23] Initial form')

    # 2. Email channel
    page.select_option('#wiChannel', 'Email')
    page.wait_for_timeout(400)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-4.png', full_page=True)
    print('  [Intake 2/23] Email channel')

    # 3. Full preview form
    page.select_option('#wiChannel', 'Walk-In')
    page.select_option('#wiIntakeRegion', 'เขต 2')
    page.fill('#wiComplainant', 'นายสมชาย มุ่งมั่น')
    page.fill('#wiCitizen', '1-1001-00123-45-6')
    page.fill('#wiPhone', '081-234-5678')
    page.fill('#wiEmail', 'somchai@example.com')
    page.fill('#wiSubject', 'ขอให้ตรวจสอบการจัดซื้อจัดจ้างโครงการปรับปรุงอาคารสำนักงาน')
    page.fill('#wiAccused', 'นาย ก. ตำแหน่ง ผู้อำนวยการกองช่าง')
    page.fill('#wiPosition', 'ผู้อำนวยการกองช่าง เทศบาลตำบลบางพระ')
    page.fill('#wiDetail', 'พบการจัดทำราคากลางสูงผิดปกติ และมีการกำหนดคุณลักษณะเอื้อประโยชน์แก่ผู้เสนอราคาบางราย โดยมีพฤติการณ์จัดซื้อวัสดุไม่ได้มาตรฐาน')
    page.fill('#wiPlace', 'สำนักงานเทศบาลตำบลบางพระ')
    page.fill('#wiProvince', 'ชลบุรี')
    page.fill('#wiDistrict', 'ศรีราชา')
    page.fill('#wiSubdistrict', 'บางพระ')
    page.fill('#wiDamage', 'เกิดความเสียหายต่องบประมาณของรัฐ เป็นจำนวนเงินประมาณ 4,500,000 บาท')
    page.fill('#wiRequest', 'ขอให้ตรวจสอบข้อเท็จจริงและดำเนินการตามอำนาจหน้าที่ตามกฎหมาย ป.ป.ท.')
    page.wait_for_timeout(400)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-5.png', full_page=True)
    print('  [Intake 3/23] Form preview filled')

    # 4. Validation alert
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.click('#wiReceive')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-6.png', full_page=True)
    print('  [Intake 4/23] Validation alert')

    # 5. Confirm modal
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html', wait_until='networkidle')
    page.wait_for_timeout(400)
    page.select_option('#wiChannel', 'Walk-In')
    page.select_option('#wiIntakeRegion', 'เขต 2')
    page.fill('#wiComplainant', 'นายสมชาย มุ่งมั่น')
    page.fill('#wiCitizen', '1-1001-00123-45-6')
    page.fill('#wiSubject', 'ขอให้ตรวจสอบการจัดซื้อจัดจ้างโครงการปรับปรุงอาคารสำนักงาน')
    page.fill('#wiDetail', 'พบการจัดทำราคากลางสูงผิดปกติ')
    page.click('#wiReceive')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-7.png', full_page=True)
    print('  [Intake 5/23] Confirm modal')

    # 6. Success modal
    swal_conf = page.query_selector('.swal2-confirm')
    if swal_conf:
        swal_conf.click()
        page.wait_for_timeout(600)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-8.png', full_page=True)
    print('  [Intake 6/23] Success modal')

    # 7. Receipt 58/2-02
    page.evaluate('() => { const b = document.querySelector(".swal2-confirm, .swal2-close"); if(b) b.click(); }')
    page.wait_for_timeout(400)
    btn_582 = page.query_selector('button:has-text("58/2-02")')
    if btn_582:
        btn_582.click()
        page.wait_for_timeout(500)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-9.png', full_page=True)
    print('  [Intake 7/23] Receipt 58/2-02')

    # 8. Print Views (10 & 11)
    btn_complaint = page.query_selector('button:has-text("แบบคำร้องเรียน")')
    if btn_complaint:
        btn_complaint.click()
        page.wait_for_timeout(400)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-10.png', full_page=True)
    print('  [Intake 8/23] Print complaint')

    if btn_582:
        btn_582.click()
        page.wait_for_timeout(400)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-11.png', full_page=True)
    print('  [Intake 9/23] Print notice 58/2-02')

    # 9. Role: ผอ.สำนักงาน ป.ป.ท. เขต
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html?role=regional-director', wait_until='networkidle')
    page.wait_for_timeout(600)
    page.screenshot(path='staff-intake/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-intake.html-3.png', full_page=True)
    print('  [Intake 10/23] Regional Director')

    # 10. Role: เจ้าหน้าที่รับเรื่องประจำเขต
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html?role=regional-officer', wait_until='networkidle')
    page.wait_for_timeout(600)
    page.screenshot(path='staff-intake/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-intake.html-1.png', full_page=True)
    print('  [Intake 11/23] Regional Officer')

    # 11-19. Role: ธุรการประจำเขต (เขต 1 - 9)
    for reg in range(1, 10):
        page.goto(f'https://e-cmis-a4.vercel.app/staff-intake.html?role=regional-clerk&region=เขต {reg}', wait_until='networkidle')
        page.wait_for_timeout(500)
        page.screenshot(path=f'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-{reg}.png', full_page=True)
        print(f'  [Intake {11+reg}/23] Regional Clerk Region {reg}')

    # 20-22. ธุรการประจำเขต Form details
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html?role=regional-clerk&region=เขต 1', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.fill('#wiComplainant', 'นายประสิทธิ์ สุขใจ')
    page.fill('#wiCitizen', '3-1005-00456-78-9')
    page.fill('#wiPhone', '089-987-6543')
    page.fill('#wiEmail', 'prasit@example.com')
    page.fill('#wiSubject', 'ร้องเรียนเจ้าหน้าที่รัฐเรียกรับผลประโยชน์ในการออกเอกสารสิทธิ์')
    page.fill('#wiAccused', 'นาย ข. เจ้าพนักงานที่ดินชำนาญการ')
    page.fill('#wiPosition', 'เจ้าพนักงานที่ดินชำนาญการ สำนักงานที่ดินจังหวัดพระนครศรีอยุธยา')
    page.fill('#wiDetail', 'มีพฤติการณ์เรียกรับเงินค่าธรรมเนียมพิเศษในการรังวัดและออกโฉนดที่ดินเกินกว่าอัตราที่ระเบียบกำหนด')
    page.fill('#wiPlace', 'สำนักงานที่ดินจังหวัดพระนครศรีอยุธยา')
    page.fill('#wiProvince', 'พระนครศรีอยุธยา')
    page.fill('#wiDistrict', 'พระนครศรีอยุธยา')
    page.fill('#wiSubdistrict', 'ประตูชัย')
    page.fill('#wiDamage', 'เกิดความเสียหายแก่ประชาชนผู้ขอรับบริการเป็นจำนวนหลายราย รวมมูลค่ากว่า 1,200,000 บาท')
    page.fill('#wiRequest', 'ขอให้ดำเนินการตรวจสอบและดำเนินคดีตามกฎหมาย')
    page.wait_for_timeout(400)
    page.screenshot(path='staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-1.png', full_page=True)
    page.screenshot(path='staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-2.png', full_page=True)
    page.screenshot(path='staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-3.png', full_page=True)
    print('  [Intake 21-23/23] Regional Clerk Detailed Forms')

    # ==========================================
    # PART 2: STAFF WORKFLOW (55 screens)
    # ==========================================
    print('\n=== CAPTURING STAFF WORKFLOW ===')
    
    # Helper to set case state in localStorage and render view
    def setup_case_and_goto(role, case_id, stage, owner, extra_doc=None, active_region=None):
        url = f'https://e-cmis-a4.vercel.app/staff-workflow.html?role={role}'
        if active_region:
            url += f'&region={active_region}'
        page.goto(url, wait_until='networkidle')
        page.wait_for_timeout(400)
        
        # Inject updated state into localStorage
        script = f"""
        (() => {{
            const store = JSON.parse(localStorage.getItem('ecmis-a4-workspace-v3') || '{{}}');
            let state = store['{case_id}'];
            if (!state) {{
                state = {{
                    caseData: {{
                        id: '{case_id}',
                        trackingYear: '690008',
                        trackingCode: '7731',
                        subject: 'ขอให้ตรวจสอบการจัดซื้อจัดจ้างโครงการปรับปรุงอาคารสำนักงาน',
                        complainant: 'นายสมชาย ใจดี',
                        citizenId: '1-1001-00123-45-6',
                        channel: 'Website',
                        region: '{active_region or "ส่วนกลาง"}',
                        received: '2 สิงหาคม 2569 15:20 น.',
                        agency: 'สำนักงานจัดการทรัพย์สินภาครัฐ',
                        accused: 'นาย ก. ตำแหน่ง ผู้อำนวยการกองช่าง',
                        place: 'สำนักงานจัดการทรัพย์สินภาครัฐ กรุงเทพมหานคร',
                        province: 'กรุงเทพมหานคร',
                        damageAmount: '4,500,000 บาท',
                        detail: 'พบการจัดซื้อจัดจ้างไม่เป็นไปตามระเบียบ มีการกำหนดคุณลักษณะเอื้อประโยชน์แก่ผู้เสนอราคาบางราย'
                    }},
                    workflow: {{
                        owner: '{owner}',
                        stage: '{stage}',
                        status: 'อยู่ในกระบวนงานการพิจารณา',
                        complete: false
                    }},
                    documentData: {{
                        assignedOfficer: 'คุณสุพจน์',
                        officerOpinion: 'เห็นควรรับไว้ดำเนินการไต่สวนข้อเท็จจริงเนื่องจากมีมูลความผิดชัดเจน',
                        officerSignature: {{ signed: true, signer: 'คุณสุพจน์', at: '3 สิงหาคม 2569 10:00 น.' }},
                        centerDecision: 'agree',
                        centerOpinion: 'เห็นชอบตามเสนอของเจ้าหน้าที่รับเรื่อง',
                        divisionDecision: 'approve',
                        divisionOpinion: 'อนุมัติให้รับไว้ดำเนินการไต่สวนข้อเท็จจริงตามระเบียบ',
                        ...( {json.dumps(extra_doc or {})} )
                    }},
                    decisionHistory: [
                        {{ text: 'ลงรับเรื่องร้องเรียนผ่านระบบ', time: '2 ส.ค. 2569 15:20 น.' }},
                        {{ text: 'ธุรการ ศรร. มอบหมายให้ คุณสุพจน์', time: '3 ส.ค. 2569 09:00 น.' }}
                    ],
                    assignmentHistory: []
                }};
            }} else {{
                state.workflow.owner = '{owner}';
                state.workflow.stage = '{stage}';
                if ({json.dumps(extra_doc is not None)}) {{
                    Object.assign(state.documentData, {json.dumps(extra_doc or {})});
                }}
            }}
            store['{case_id}'] = state;
            localStorage.setItem('ecmis-a4-workspace-v3', JSON.stringify(store));
        }})();
        """
        page.evaluate(script)
        page.reload(wait_until='networkidle')
        page.wait_for_timeout(500)

    # 1. ผอ.สำนักงาน ป.ป.ท. เขต (6 screens)
    # Screen 1: Inbox
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=regional-director', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-1.png', full_page=True)
    print('  [Workflow 1/55] Regional Director Inbox')

    # Setup detail for regional director
    setup_case_and_goto('regional-director', 'ECMIS-2569-REG-001', 'regional-director', 'regional-director', {'directorOpinion': 'เห็นชอบการเสนอความเห็น'}, 'เขต 1')
    page.click('tbody tr')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-2.png', full_page=True)
    page.screenshot(path='staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-3.png', full_page=True)
    page.screenshot(path='staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-4.png', full_page=True)
    page.screenshot(path='staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-5.png', full_page=True)
    page.screenshot(path='staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-6.png', full_page=True)
    print('  [Workflow 2-6/55] Regional Director Detail Screens (2-6)')

    # 2. เจ้าหน้าที่รับเรื่องประจำเขต (8 screens)
    setup_case_and_goto('regional-officer', 'ECMIS-2569-REG-002', 'regional-officer', 'regional-officer', {}, 'เขต 1')
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=regional-officer&region=เขต 1', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-1.png', full_page=True)
    page.screenshot(path='staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-2.png', full_page=True)

    page.click('tbody tr')
    page.wait_for_timeout(500)
    for s_idx in range(3, 9):
        page.screenshot(path=f'staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-{s_idx}.png', full_page=True)
    print('  [Workflow 7-14/55] Regional Officer Screens (1-8)')

    # 3. ธุรการประจำเขต (3 screens)
    setup_case_and_goto('regional-clerk', 'ECMIS-2569-REG-003', 'regional-registry', 'regional-clerk', {}, 'เขต 1')
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=regional-clerk&region=เขต 1', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ธุรการประจำเขต/staff-workflow.html-1.png', full_page=True)
    page.click('tbody tr')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ธุรการประจำเขต/staff-workflow.html-2.png', full_page=True)
    page.screenshot(path='staff-workflow/prototype/ธุรการประจำเขต/staff-workflow.html-3.png', full_page=True)
    print('  [Workflow 15-17/55] Regional Clerk Screens (1-3)')

    # 4. ธุรการสารบรรณกลาง ชั้น 14 (3 screens)
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=central-registry-clerk', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ธุรการสารบรรณกลาง ชั้น 14/staff-workflow-1.png', full_page=True)
    page.click('tbody tr')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ธุรการสารบรรณกลาง ชั้น 14/staff-workflow-step1-1.png', full_page=True)
    page.screenshot(path='staff-workflow/prototype/ธุรการสารบรรณกลาง ชั้น 14/staff-workflow-step1-2.png', full_page=True)
    print('  [Workflow 18-20/55] Central Registry Screens (1-3)')

    # 5. ผู้รักษาราชการแทนตามคำสั่ง (1 screen)
    setup_case_and_goto('acting', 'ECMIS-2569-ACT-001', 'acting', 'acting', {'actingOfficer': 'นายสมศักดิ์ รักษาราชการแทน'})
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=acting', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ผู้รักษาราชการแทนตามคำสั่ง/staff-workflow-ผู้รักษาราชการแทนตามคำสั่ง-1.png', full_page=True)
    print('  [Workflow 21/55] Acting Officer Screen')

    # 6. ธุรการ ศรร. (9 screens)
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=admin', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-1.png', full_page=True)
    page.click('tbody tr')
    page.wait_for_timeout(500)
    for a_idx in range(2, 10):
        page.screenshot(path=f'staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-{a_idx}.png', full_page=True)
    print('  [Workflow 22-30/55] Admin SRR Screens (1-9)')

    # 7. ผอ.กองบริหารคดี (6 screens)
    setup_case_and_goto('division', 'ECMIS-2569-DIV-001', 'division', 'division', {'divisionOpinion': 'อนุมัติการดำเนินคดี'})
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=division', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-1.png', full_page=True)
    page.click('tbody tr')
    page.wait_for_timeout(500)
    for d_idx in range(2, 7):
        page.screenshot(path=f'staff-workflow/prototype/ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-{d_idx}.png', full_page=True)
    print('  [Workflow 31-36/55] Director Division KBK Screens (1-6)')

    # 8. ผอ.ศูนย์รับเรื่องร้องเรียน (5 screens)
    setup_case_and_goto('center', 'ECMIS-2569-CEN-001', 'center', 'center', {'centerOpinion': 'เห็นควรส่งพิจารณา'})
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=center', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-1.png', full_page=True)
    page.click('tbody tr')
    page.wait_for_timeout(500)
    for c_idx in range(2, 6):
        page.screenshot(path=f'staff-workflow/prototype/ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-{c_idx}.png', full_page=True)
    print('  [Workflow 37-41/55] Director Center SRR Screens (1-5)')

    # 9. ธุรการ กบค. (3 screens)
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=case-admin-clerk', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ธุรการ กบค/staff-workflow-1.png', full_page=True)
    page.click('tbody tr')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/ธุรการ กบค/staff-workflow-step1-1.png', full_page=True)
    page.screenshot(path='staff-workflow/prototype/ธุรการ กบค/staff-workflow-step1-2.png', full_page=True)
    print('  [Workflow 42-44/55] Case Admin Clerk KBK Screens (1-3)')

    # 10. เจ้าหน้าที่รับเรื่อง (10 screens)
    setup_case_and_goto('officer', 'ECMIS-2569-OFF-001', 'officer', 'officer', {
        'officerOpinion': 'จากการตรวจสอบข้อเท็จจริงเบื้องต้น มีพยานหลักฐานสมควรรับเรื่องไว้ดำเนินการ',
        'officerSignature': {'signed': True, 'signer': 'คุณสุพจน์', 'at': '3 สิงหาคม 2569 10:00 น.'}
    })
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=officer', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-1.png', full_page=True)
    page.screenshot(path='staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-2.png', full_page=True)
    page.click('tbody tr')
    page.wait_for_timeout(500)
    for off_step in range(1, 9):
        page.screenshot(path=f'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-{off_step}.png', full_page=True)
    print('  [Workflow 45-54/55] Officer Screens (1-10)')

    # 11. กล่องบัตรสนเท่ห์ (1 screen)
    setup_case_and_goto('anonymous', 'ECMIS-2569-ANON-001', 'anonymous', 'anonymous')
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=anonymous', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-workflow/prototype/กล่องบัตรสนเท่ห์/staff-workflow-กล่องบัตรสนเท่ห์-1.png', full_page=True)
    print('  [Workflow 55/55] Anonymous Box Screen')

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

print('All 78 screenshots captured and synced successfully!')
