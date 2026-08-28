import os, sys, time
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

os.makedirs('staff-intake/prototype', exist_ok=True)
os.makedirs('staff-intake/prototype/ผอ.สำนักงาน ป.ป.ท. เขต', exist_ok=True)
os.makedirs('staff-intake/prototype/เจ้าหน้าที่รับเรื่องประจำเขต', exist_ok=True)
os.makedirs('staff-intake/prototype/ธุรการประจำเขต', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    page = context.new_page()

    # 1. Default Initial Form (Walk-in, fresh)
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html', wait_until='networkidle')
    page.wait_for_timeout(800)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-1.png', full_page=True)
    print('1. Default intake form captured')

    # 2. Channel: Email
    page.select_option('#wiChannel', 'Email')
    page.wait_for_timeout(500)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-4.png', full_page=True)
    print('2. Email channel captured')

    # 3. Full form filled with realistic data (Walk-In)
    page.select_option('#wiChannel', 'Walk-In')
    page.wait_for_timeout(300)
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
    page.wait_for_timeout(500)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-5.png', full_page=True)
    print('3. Filled form preview captured')

    # 4. Trigger Alert (Validation warning on empty submit)
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.click('#wiReceive')
    page.wait_for_timeout(600)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-6.png', full_page=True)
    print('4. Validation alert captured')

    # 5. Confirmation Modal
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.select_option('#wiChannel', 'Walk-In')
    page.select_option('#wiIntakeRegion', 'เขต 2')
    page.fill('#wiComplainant', 'นายสมชาย มุ่งมั่น')
    page.fill('#wiCitizen', '1-1001-00123-45-6')
    page.fill('#wiPhone', '081-234-5678')
    page.fill('#wiSubject', 'ขอให้ตรวจสอบการจัดซื้อจัดจ้างโครงการปรับปรุงอาคารสำนักงาน')
    page.fill('#wiDetail', 'พบการจัดทำราคากลางสูงผิดปกติ')
    page.click('#wiReceive')
    page.wait_for_timeout(600)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-7.png', full_page=True)
    print('5. Confirm modal captured')

    # 6. Success Modal
    confirm_swal = page.query_selector('.swal2-confirm')
    if confirm_swal:
        confirm_swal.click()
        page.wait_for_timeout(800)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-8.png', full_page=True)
    print('6. Success modal captured')

    # Dismiss swal if open
    close_swal = page.query_selector('.swal2-confirm, .swal2-close')
    if close_swal:
        close_swal.click()
        page.wait_for_timeout(500)
    
    # 7. Receipt 58/2-02 tab
    btn_582 = page.query_selector('button:has-text("58/2-02")')
    if btn_582:
        btn_582.click()
        page.wait_for_timeout(600)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-9.png', full_page=True)
    print('7. Receipt 58/2-02 captured')

    # 8. Print Views (A4 print layouts: Complaint & Tracking Notice)
    # Print preview for complaint form
    btn_complaint_tab = page.query_selector('button:has-text("แบบคำร้องเรียน")')
    if btn_complaint_tab:
        btn_complaint_tab.click()
        page.wait_for_timeout(400)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-10.png', full_page=True)
    print('8. Print view 10 captured')

    # Print preview for 58/2-02
    if btn_582:
        btn_582.click()
        page.wait_for_timeout(400)
    page.screenshot(path='staff-intake/prototype/staff-intake.html-11.png', full_page=True)
    print('8. Print view 11 captured')

    # 9. Role: ผอ.สำนักงาน ป.ป.ท. เขต
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html?role=regional-director', wait_until='networkidle')
    page.wait_for_timeout(800)
    page.screenshot(path='staff-intake/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-intake.html-3.png', full_page=True)
    print('9. Regional Director intake captured')

    # 10. Role: เจ้าหน้าที่รับเรื่องประจำเขต
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html?role=regional-officer', wait_until='networkidle')
    page.wait_for_timeout(800)
    page.screenshot(path='staff-intake/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-intake.html-1.png', full_page=True)
    print('10. Regional Officer intake captured')

    # 11-19. Role: ธุรการประจำเขต (เขต 1 to 9)
    for reg_num in range(1, 10):
        reg_label = f'เขต {reg_num}'
        page.goto(f'https://e-cmis-a4.vercel.app/staff-intake.html?role=regional-clerk&region={reg_label}', wait_until='networkidle')
        page.wait_for_timeout(600)
        page.screenshot(path=f'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-{reg_num}.png', full_page=True)
        print(f'Captured Regional Clerk {reg_label}')

    # 20-22. ธุรการประจำเขต (12-1, 12-2, 12-3 detailed sections)
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html?role=regional-clerk&region=เขต 1', wait_until='networkidle')
    page.wait_for_timeout(600)
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
    page.wait_for_timeout(500)
    
    # 12-1: Full form
    page.screenshot(path='staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-1.png', full_page=True)
    
    # 12-2: Incident location section focus
    page.screenshot(path='staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-2.png', full_page=True)

    # 12-3: Damage & attachments focus
    page.screenshot(path='staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-3.png', full_page=True)

    browser.close()

print('All 23 staff intake screenshots captured successfully!')
