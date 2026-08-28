import os, sys, json
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8')

os.makedirs('captures_workflow_test', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    page = context.new_page()

    page.goto('https://e-cmis-a4.vercel.app/staff-workflow.html?role=admin', wait_until='networkidle')
    page.wait_for_timeout(800)

    # Let's inspect the localStorage contents
    store = page.evaluate("() => JSON.parse(localStorage.getItem('ecmis-a4-workspace-v3') || '{}')")
    print(f'Store cases count: {len(store)}')
    for k, v in list(store.items())[:5]:
        print(f'Case {k}: owner={v.get("workflow", {}).get("owner")}, stage={v.get("workflow", {}).get("stage")}, status={v.get("workflow", {}).get("status")}')

    browser.close()
