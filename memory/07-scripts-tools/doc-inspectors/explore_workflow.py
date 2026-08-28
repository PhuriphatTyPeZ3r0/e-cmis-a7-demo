import os, sys
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

os.makedirs('captures_explore', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    page = context.new_page()
    
    # 1. Test Admin (ธุรการ ศรร.)
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=admin', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='captures_explore/admin_inbox.png', full_page=True)
    
    # Click first case in admin
    rows = page.query_selector_all('tbody tr')
    print(f'Admin rows: {len(rows)}')
    if rows:
        rows[0].click()
        page.wait_for_timeout(500)
        page.screenshot(path='captures_explore/admin_detail.png', full_page=True)
        
    # 2. Test Center (ผอ.ศรร.)
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=center', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='captures_explore/center_inbox.png', full_page=True)
    rows = page.query_selector_all('tbody tr')
    print(f'Center rows: {len(rows)}')
    if rows:
        rows[0].click()
        page.wait_for_timeout(500)
        page.screenshot(path='captures_explore/center_detail.png', full_page=True)
        
    # 3. Test Division (ผอ.กบค.)
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=division', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='captures_explore/division_inbox.png', full_page=True)
    rows = page.query_selector_all('tbody tr')
    print(f'Division rows: {len(rows)}')
    if rows:
        rows[0].click()
        page.wait_for_timeout(500)
        page.screenshot(path='captures_explore/division_detail.png', full_page=True)

    # 4. Test Regional Director (ผอ.สำนักงาน ป.ป.ท. เขต)
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=regional-director', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='captures_explore/regional_director_inbox.png', full_page=True)
    rows = page.query_selector_all('tbody tr')
    print(f'Regional Director rows: {len(rows)}')
    if rows:
        rows[0].click()
        page.wait_for_timeout(500)
        page.screenshot(path='captures_explore/regional_director_detail.png', full_page=True)

    # 5. Test Regional Officer (เจ้าหน้าที่รับเรื่องประจำเขต)
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=regional-officer', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='captures_explore/regional_officer_inbox.png', full_page=True)
    rows = page.query_selector_all('tbody tr')
    print(f'Regional Officer rows: {len(rows)}')
    if rows:
        rows[0].click()
        page.wait_for_timeout(500)
        page.screenshot(path='captures_explore/regional_officer_detail.png', full_page=True)

    browser.close()

print('Exploration screenshots taken!')
