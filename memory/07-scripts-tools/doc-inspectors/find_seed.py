import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity4-workspace.js', encoding='utf-8') as f:
    text = f.read()

# Search for initial cases definition
for m in re.finditer(r'const\s+([A-Z0-9_]+CASES[A-Z0-9_]*)\s*=', text):
    var_name = m.group(1)
    start = m.start()
    print(f'Found: {var_name} at pos {start}')
    print(text[start:start+500])
