import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity4-workspace.js', encoding='utf-8') as f:
    text = f.read()

# Look for case selection or detail rendering
for m in re.finditer(r'function\s+(?:selectCase|renderDetail|openCase|showDetail|setStage|switchTab)\s*\(', text):
    start = m.start()
    print('Found function:', text[start:start+250])
