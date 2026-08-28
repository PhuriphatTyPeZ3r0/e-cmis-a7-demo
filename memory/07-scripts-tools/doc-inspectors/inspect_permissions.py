import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity4-workspace.js', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'function\s+canViewState\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*function', text)
if m:
    print('canViewState():\n', m.group(0))

m2 = re.search(r'function\s+canAccessRole\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*function', text)
if m2:
    print('canAccessRole():\n', m2.group(0))
