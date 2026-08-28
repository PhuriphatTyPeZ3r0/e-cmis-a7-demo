import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity4-workspace.js', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'canView', text):
    start = m.start()
    print('Found canView at', start)
    print(text[max(0, start-50):min(len(text), start+300)])
