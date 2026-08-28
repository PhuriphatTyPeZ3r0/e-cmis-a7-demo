import os, sys
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page()
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html', wait_until='networkidle')
    
    inputs = page.query_selector_all('input, select, textarea, button')
    print(f'Total elements: {len(inputs)}')
    for el in inputs:
        tag = el.evaluate('e => e.tagName.toLowerCase()')
        e_id = el.get_attribute('id') or ''
        e_name = el.get_attribute('name') or ''
        e_type = el.get_attribute('type') or ''
        e_txt = el.inner_text().strip().replace('\n', ' ')[:40] if tag == 'button' else ''
        print(f'<{tag}> id="{e_id}" name="{e_name}" type="{e_type}" text="{e_txt}"')
    
    browser.close()
