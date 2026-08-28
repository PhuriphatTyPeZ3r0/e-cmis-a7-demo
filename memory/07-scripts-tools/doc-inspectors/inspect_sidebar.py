import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity5-workspace.js', encoding='utf-8') as f:
    c5 = f.read()

m = re.search(r'(?:const|let|var)\s+ROLE_LABELS\s*=\s*\{([^}]+)\}', c5)
if m:
    print('ROLE_LABELS:\n', m.group(0))
else:
    print('No ROLE_LABELS regex match, searching for role mappings:')
    for line in c5.splitlines():
        if 'ROLE' in line and '=' in line:
            print(' ', line[:120])

print('\n=== Options in c5 ===')
for val, text in set(re.findall(r'<option[^>]*value=["\']([^"\']*)["\'][^>]*>([^<]*)</option>', c5)):
    if any(k in text for k in ['ผอ.', 'ธุรการ', 'เจ้าหน้าที่', 'บัตรสนเท่ห์', 'เขต', 'ส่วนกลาง', 'ผู้รักษา']):
        print(f'  {val} -> {text}')

with open('ecmis-sidebar.js', encoding='utf-8') as f:
    cs = f.read()
print('\n=== ecmis-sidebar.js ===')
print(cs[:1500])
