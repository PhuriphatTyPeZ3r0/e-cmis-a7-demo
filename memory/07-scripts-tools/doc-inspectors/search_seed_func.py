import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity4-workspace.js', encoding='utf-8') as f:
    text = f.read()

# Search for initial store seeding
for m in re.finditer(r'function\s+seed|initStore|resetStore|initialStore|ensureSeed', text):
    start = m.start()
    print('Found seed func at', start)
    print(text[start:start+400])

# Search for where readStore is called
for m in re.finditer(r'readStore\(\)', text):
    start = m.start()
    snippet = text[max(0, start-50):min(len(text), start+150)]
    if 'writeStore' in snippet or 'localStorage' in snippet or 'Object.keys' in snippet:
        print('readStore usage:\n ', snippet.replace('\n', ' '))
