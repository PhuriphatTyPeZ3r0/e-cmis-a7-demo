import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

os.makedirs('test_captures', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    
    # Configure context with high DPI (device_scale_factor=2) and 1920 viewport
    context = browser.new_context(
        viewport={'width': 1600, 'height': 1000},
        device_scale_factor=2
    )
    page = context.new_page()
    
    # 1. Test staff-workflow
    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html', wait_until='networkidle')
    page.wait_for_timeout(1000)
    
    # Capture full page
    page.screenshot(path='test_captures/workflow_default.png', full_page=True)
    
    # 2. Test staff-intake
    page.goto('https://e-cmis-a4.vercel.app/staff-intake.html', wait_until='networkidle')
    page.wait_for_timeout(1000)
    page.screenshot(path='test_captures/intake_default.png', full_page=True)
    
    browser.close()

print('Saved test captures:')
for f in os.listdir('test_captures'):
    p = os.path.join('test_captures', f)
    im = Image.open(p)
    print(f'{f}: size={im.size}')
