import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity4-workspace.js', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'wiIntakeRegion', text):
    start = m.start()
    snippet = text[max(0, start-100):min(len(text), start+200)]
    print('wiIntakeRegion context:\n ', snippet.replace('\n', ' '))
