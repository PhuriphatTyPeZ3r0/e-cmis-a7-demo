import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity4-workspace.js', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'function\s+readStore\s*\(\)\s*\{([\s\S]*?)\n\s*function', text)
if m:
    print('readStore():\n', m.group(0)[:2000])

# Look for INITIAL_CASES
m_init = re.search(r'const\s+INITIAL_CASES\s*=\s*(\{[\s\S]*?\n\s*\});', text)
if m_init:
    print('INITIAL_CASES keys:\n')
    import json
    # Let's extract keys
    keys = re.findall(r'"([0-9]{4}/256[0-9])":', m_init.group(1))
    print('Case IDs:', keys)
