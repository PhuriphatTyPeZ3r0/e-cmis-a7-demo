import os
import sys
import fitz

sys.stdout.reconfigure(encoding="utf-8")

def inspect_folder(folder_path):
    print(f"=== Folder: {folder_path} ===")
    for root, dirs, files in os.walk(folder_path):
        for f in files:
            full_p = os.path.join(root, f)
            sz = os.path.getsize(full_p)
            print(f"{f} ({sz} bytes)")

inspect_folder("ประชุมกิจกรรมที่ 7-20082569")