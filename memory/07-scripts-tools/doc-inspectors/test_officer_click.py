import os, sys
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    page = context.new_page()
    
    # Check officer role
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=officer', wait_until='networkidle')
    page.wait_for_timeout(500)
    
    # Check available buttons or links in officer role
    btns = page.query_selector_all('button, .ws-btn, .btn, tr[data-id], .case-item, td')
    print('Officer elements:')
    for b in btns[:20]:
        t = b.inner_text().strip().replace('\n', ' ')
        if t:
            print('  b:', t[:60])
            
    # Try clicking the first case row or action button
    first_case = page.query_selector('tbody tr, tr[data-id], .ws-case-row')
    if first_case:
        print('Clicking first case row...')
        first_case.click()
        page.wait_for_timeout(500)
        
        # Check what appears after clicking case
        sub_tabs = page.query_selector_all('.nav-link, .ws-tab, button, h1, h2, h3, h4, h5, h6')
        print('After click headings & tabs:')
        for st in sub_tabs[:25]:
            txt = st.inner_text().strip().replace('\n', ' ')
            if txt and len(txt) < 80:
                print('   ->', txt)
                
    browser.close()
