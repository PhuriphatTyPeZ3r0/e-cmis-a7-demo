import re, sys, os
sys.stdout.reconfigure(encoding='utf-8')

for root, dirs, files in os.walk('.'):
    for f in files:
        if f.endswith('.js') or f.endswith('.html'):
            p = os.path.join(root, f)
            try:
                with open(p, encoding='utf-8') as fh:
                    txt = fh.read()
                    if 'ecmis-demo-cases' in txt or 'ecmis-a4-workspace' in txt:
                        print(f'{p}: found match')
                        for line in txt.splitlines():
                            if 'ecmis-demo-cases' in line or 'ecmis-a4-workspace' in line:
                                print('  ', line[:120])
            except Exception as e:
                pass
