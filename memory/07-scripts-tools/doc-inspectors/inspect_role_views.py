import os, sys
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    
    # Let's test each role and see what views we can trigger
    for role in [
        'regional-director',
        'regional-officer',
        'regional-clerk',
        'central-registry-clerk',
        'acting',
        'admin',
        'division',
        'center',
        'case-admin-clerk',
        'officer',
        'anonymous'
    ]:
        url = f'https://e-cmis-a4.vercel.app/staff-workflow.html?role={role}'
        page.goto(url, wait_until='networkidle')
        page.wait_for_timeout(400)
        
        # Check rows
        rows = page.query_selector_all('tbody tr')
        buttons = page.query_selector_all('button, .ws-btn, .btn, .nav-link')
        btn_texts = [b.inner_text().strip().replace('\n', ' ') for b in buttons if b.inner_text().strip()][:10]
        print(f'Role [{role}]: {len(rows)} rows | Buttons: {btn_texts}')
        
        if rows:
            rows[0].click()
            page.wait_for_timeout(400)
            sub_btns = page.query_selector_all('button, .ws-btn, .btn, .nav-link, h2, h3, h4, h5')
            sub_txts = [b.inner_text().strip().replace('\n', ' ') for b in sub_btns if b.inner_text().strip()][:10]
            print(f'  After click detail: {sub_txts}')
            
    browser.close()
