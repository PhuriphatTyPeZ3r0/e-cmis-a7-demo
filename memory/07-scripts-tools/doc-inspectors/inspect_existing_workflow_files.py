import os, sys
sys.stdout.reconfigure(encoding='utf-8')

for base in ['staff-workflow/prototype', '_drive_downloads/staff-workflow/prototype']:
    print(f'=== {base} ===')
    for root, dirs, files in os.walk(base):
        for f in sorted(files):
            if f.endswith('.png'):
                p = os.path.join(root, f)
                rel = os.path.relpath(p, base)
                sz = os.path.getsize(p)
                print(f'  {rel} ({sz} bytes)')
