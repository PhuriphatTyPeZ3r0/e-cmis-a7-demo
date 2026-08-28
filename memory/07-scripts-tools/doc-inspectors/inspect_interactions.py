import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('ecmis-sidebar.js', encoding='utf-8') as f:
    sb = f.read()
print('=== SIDEBAR CODE ===')
print(sb)

with open('activity4-workspace.js', encoding='utf-8') as f:
    a4 = f.read()

print('\n=== A4 (staff-intake) KEY FUNCTIONS ===')
for m in set(re.findall(r'function\s+([A-Za-z0-9_]+)\s*\(', a4)):
    if any(k in m for k in ['render', 'switch', 'show', 'open', 'select', 'submit', 'print', 'modal']):
        print('  func:', m)
