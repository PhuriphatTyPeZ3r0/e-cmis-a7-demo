import os, sys
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

roles = [
    ('regional-director', 'ผอ.สำนักงาน ป.ป.ท. เขต'),
    ('regional-officer', 'เจ้าหน้าที่รับเรื่องประจำเขต'),
    ('regional-clerk', 'ธุรการประจำเขต'),
    ('central-registry-clerk', 'ธุรการสารบรรณกลาง ชั้น 14'),
    ('acting', 'ผู้รักษาราชการแทนตามคำสั่ง'),
    ('admin', 'ธุรการ ศรร.'),
    ('division', 'ผอ.กบค.'),
    ('center', 'ผอ.ศรร.'),
    ('case-admin-clerk', 'ธุรการ กบค.'),
    ('officer', 'เจ้าหน้าที่รับเรื่อง'),
    ('anonymous', 'กล่องบัตรสนเท่ห์'),
]

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    page = context.new_page()
    
    for r_key, r_label in roles:
        url = f'https://e-cmis-a4.vercel.app/staff-workflow.html?role={r_key}'
        page.goto(url, wait_until='networkidle')
        page.wait_for_timeout(600)
        
        # Check title / headings / case rows
        case_rows = page.query_selector_all('tr[data-id], .ws-table tr, .case-row, tbody tr')
        tabs = page.query_selector_all('.nav-tabs .nav-link, .ws-tabs button, .tab-btn')
        tab_texts = [t.inner_text().strip() for t in tabs if t.inner_text().strip()]
        
        print(f'Role: {r_label:30s} ({r_key}) | Rows: {len(case_rows)} | Tabs: {tab_texts}')
        
    browser.close()
