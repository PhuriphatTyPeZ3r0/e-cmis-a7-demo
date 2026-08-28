import os, sys
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    page.goto('https://e-cmis-a4.vercel.app/', wait_until='networkidle')
    page.wait_for_timeout(600)
    page.screenshot(path='homepage_master.png', full_page=True)
    browser.close()

print('homepage_master.png captured!')
