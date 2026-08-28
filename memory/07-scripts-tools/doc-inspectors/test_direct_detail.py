import os, sys
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    
    url = 'https://e-cmis-a4.vercel.app/staff-workflow.html?role=officer&id=ECMIS-2569-000184'
    page.goto(url, wait_until='networkidle')
    page.wait_for_timeout(800)
    
    # Check if detail view is visible
    detail_visible = page.is_visible('#caseDetailView')
    print('Detail view visible:', detail_visible)
    
    headings = [h.inner_text().strip() for h in page.query_selector_all('h1, h2, h3, h4, h5, .nav-link, button') if h.inner_text().strip()]
    print('Headings sample:', headings[:20])
    
    page.screenshot(path='test_officer_direct.png', full_page=True)
    browser.close()

print('Screenshot test_officer_direct.png saved!')
