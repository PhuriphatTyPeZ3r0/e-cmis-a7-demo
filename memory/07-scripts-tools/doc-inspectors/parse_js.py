import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity5-workspace.js', encoding='utf-8') as f:
    text5 = f.read()

print('=== Roles in Activity 5 (staff-workflow) ===')
for m in sorted(set(re.findall(r'role:\s*["\']([^"\']+)["\']', text5))):
    print('  role:', m)

for m in sorted(set(re.findall(r'function\s+render([A-Za-z0-9_]+)', text5))):
    if any(k in m for k in ['View', 'Tab', 'Section', 'Step', 'Modal', 'Role', 'Screen', 'Page']):
        print('  render func:', m)

with open('activity4-workspace.js', encoding='utf-8') as f:
    text4 = f.read()

print('\n=== Roles/Views in Activity 4 (staff-intake) ===')
for m in sorted(set(re.findall(r'role:\s*["\']([^"\']+)["\']', text4))):
    print('  role:', m)

for m in sorted(set(re.findall(r'function\s+render([A-Za-z0-9_]+)', text4))):
    if any(k in m for k in ['View', 'Tab', 'Section', 'Step', 'Modal', 'Role', 'Screen', 'Page']):
        print('  render func:', m)
