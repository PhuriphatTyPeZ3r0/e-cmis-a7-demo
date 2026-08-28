import re, sys
sys.stdout.reconfigure(encoding='utf-8')

for fname in ['activity4-document-rules.js', 'activity4-workspace.js']:
    with open(fname, encoding='utf-8') as f:
        text = f.read()
    for m in re.finditer(r'function\s+roleCanSeeState|const\s+roleCanSeeState', text):
        start = m.start()
        print(f'=== {fname} ===')
        print(text[start:start+1200])
