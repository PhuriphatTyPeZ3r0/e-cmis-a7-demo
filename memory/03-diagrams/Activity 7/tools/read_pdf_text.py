import os
import sys
import fitz

sys.stdout.reconfigure(encoding="utf-8")

pdf_dir = os.path.join("ประชุมกิจกรรมที่ 7-20082569", "อายุความ")
for f in sorted(os.listdir(pdf_dir)):
    if f.endswith(".pdf"):
        print("=============================")
        print("FILE:", f)
        doc = fitz.open(os.path.join(pdf_dir, f))
        for i, page in enumerate(doc):
            print(f"--- Page {i+1} ---")
            print(page.get_text())

km_dir = os.path.join("ประชุมกิจกรรมที่ 7-20082569", "คำต่อมาตรา")
if os.path.exists(km_dir):
    for f in sorted(os.listdir(km_dir)):
        if f.endswith(".pdf"):
            print("=============================")
            print("FILE:", f)
            doc = fitz.open(os.path.join(km_dir, f))
            for i, page in enumerate(doc):
                print(f"--- Page {i+1} ---")
                print(page.get_text())