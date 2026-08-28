import os, sys
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')

def scan_dir(base_dir):
    print(f'=== DIRECTORY: {base_dir} ===')
    for root, dirs, files in os.walk(base_dir):
        for f in sorted(files):
            if f.endswith('.png') or f.endswith('.jpg') or f.endswith('.svg'):
                p = os.path.join(root, f)
                try:
                    im = Image.open(p)
                    print(f'{p}: size={im.size}, mode={im.mode}')
                except Exception as e:
                    print(f'{p}: svg or error {e}')

scan_dir('staff-workflow')
scan_dir('staff-intake')
scan_dir('_drive_downloads/staff-workflow')
