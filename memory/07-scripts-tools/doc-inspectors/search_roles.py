import re, sys
sys.stdout.reconfigure(encoding='utf-8')

# Search for role selector, buttons, tabs in ecmis-sidebar.js, activity5-workspace.js, activity4-workspace.js

for fname in ['assets/ecmis-sidebar.js', 'assets/activity5-workspace.js', 'assets/activity5-workflow.js', 'assets/activity4-workspace.js']:
    print(f'=== {fname} ===')
    with open(fname.split('/')[-1], encoding='utf-8') as f:
        content = f.read()
    
    # Look for role definitions, labels, menus
    for line in content.splitlines():
        if any(kw in line for kw in ['ผอ.', 'ธุรการ', 'เจ้าหน้าที่', 'บัตรสนเท่ห์', 'ผู้รักษา', 'ศรร.', 'กบค.', 'สารบรรณ', 'เขต 1', 'role-select', 'roleSelect', 'activeRole', 'currentRole']):
            if len(line.strip()) < 150:
                print(' ', line.strip())
