import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity4-workspace.js', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'const\s+CASES\s*=\s*(\[[\s\S]*?\n\s*\]);', text)
if m:
    print('CASES definition length:', len(m.group(1)))
    # print case ids and titles
    for cm in re.finditer(r'\{[\s\S]*?id:\s*[\'"]([^\'"]+)[\'"][\s\S]*?subject:\s*[\'"]([^\'"]+)[\'"]', m.group(1)):
        print(f'Case: {cm.group(1)} -> {cm.group(2)}')
