# -*- coding: utf-8 -*-
"""
Generate 13 cover page (ใบนำส่งเอกสาร) .docx files for E-CMIS project.
Uses the user-modified layout template as base, modifies per-document fields.
"""
import os
from docx import Document

# === PATHS ===
base = r'c:\Users\iznamu\OneDrive - Panyapiwat Institute of Management\CAI 2nd Year 2025\CAI 2.2 2026\PMO1-03-08-2026\E-CMIS\document\as-is to-be'

template_dir = None
for d in os.listdir(base):
    full = os.path.join(base, d)
    if os.path.isdir(full) and 'template' in d.lower():
        template_dir = full
        break

layout_template = os.path.join(template_dir, '_layout_template.docx')

# Output directory
output_dir = os.path.join(template_dir, 'ใบนำส่งเอกสาร_13เล่ม')
os.makedirs(output_dir, exist_ok=True)

# === 13 DOCUMENT DEFINITIONS ===
documents = [
    {
        "num": "01",
        "activity": "กิจกรรมที่ 4",
        "title": "ระบบรับเรื่องร้องเรียน",
        "filename": "01_ใบนำส่งเอกสาร_กจ4_ระบบรับเรื่องร้องเรียน_E-CMIS.docx",
    },
    {
        "num": "02",
        "activity": "กิจกรรมที่ 5",
        "title": "ระบบกระบวนการดำเนินงานกล่าวหา",
        "filename": "02_ใบนำส่งเอกสาร_กจ5_ระบบกระบวนการดำเนินงานกล่าวหา_E-CMIS.docx",
    },
    {
        "num": "03",
        "activity": "กิจกรรมที่ 6",
        "title": "ระบบคุ้มครองพยาน",
        "filename": "03_ใบนำส่งเอกสาร_กจ6_ระบบคุ้มครองพยาน_E-CMIS.docx",
    },
    {
        "num": "04",
        "activity": "กิจกรรมที่ 7",
        "title": "ระบบมติคณะกรรมการ ป.ป.ท.",
        "filename": "04_ใบนำส่งเอกสาร_กจ7_ระบบมติคณะกรรมการ_ปปท_E-CMIS.docx",
    },
    {
        "num": "05",
        "activity": "กิจกรรมที่ 8",
        "title": "ระบบตรวจสอบประวัติบุคคล",
        "filename": "05_ใบนำส่งเอกสาร_กจ8_ระบบตรวจสอบประวัติบุคคล_E-CMIS.docx",
    },
    {
        "num": "06",
        "activity": "กิจกรรมที่ 9",
        "title": "ระบบหมายจับ",
        "filename": "06_ใบนำส่งเอกสาร_กจ9_ระบบหมายจับ_E-CMIS.docx",
    },
    {
        "num": "07",
        "activity": "กิจกรรมที่ 10",
        "title": "ระบบกฎหมายในทางคดี",
        "filename": "07_ใบนำส่งเอกสาร_กจ10_ระบบกฎหมายในทางคดี_E-CMIS.docx",
    },
    {
        "num": "08",
        "activity": "กิจกรรมที่ 11",
        "title": "นำเข้าข้อมูลและถ่ายโอนข้อมูล",
        "filename": "08_ใบนำส่งเอกสาร_กจ11_นำเข้าและถ่ายโอนข้อมูล_E-CMIS.docx",
    },
    {
        "num": "09",
        "activity": "กิจกรรมที่ 12",
        "title": "ระบบวิเคราะห์และรายงานผล",
        "filename": "09_ใบนำส่งเอกสาร_กจ12_ระบบวิเคราะห์และรายงานผล_E-CMIS.docx",
    },
    {
        "num": "10",
        "activity": "กิจกรรมที่ 13",
        "title": "ระบบเชื่อมโยงข้อมูล API",
        "filename": "10_ใบนำส่งเอกสาร_กจ13_ระบบเชื่อมโยงข้อมูล_API_E-CMIS.docx",
    },
    {
        "num": "11",
        "activity": "กิจกรรมที่ 14",
        "title": "ระบบบริหารกลางและสนับสนุน",
        "filename": "11_ใบนำส่งเอกสาร_กจ14_ระบบบริหารกลางและสนับสนุน_E-CMIS.docx",
    },
    {
        "num": "12",
        "activity": "สถาปัตยกรรมระบบ",
        "title": "รายงานการออกแบบสถาปัตยกรรมระบบเบื้องต้น",
        "filename": "12_ใบนำส่งเอกสาร_สถาปัตยกรรมระบบ_E-CMIS.docx",
    },
    {
        "num": "13",
        "activity": "ศึกษาและวิเคราะห์ความต้องการของผู้ที่เกี่ยวข้องเพิ่มเติม",
        "title": "ความต้องการผู้มีส่วนได้ส่วนเสีย",
        "filename": "13_ใบนำส่งเอกสาร_ศึกษาและวิเคราะห์ความต้องการ_E-CMIS.docx",
    },
]

print(f"Layout Template: {layout_template}")
print(f"Output dir: {output_dir}")
print(f"Generating {len(documents)} document transmittal sheet files...\n")

for doc_info in documents:
    # Load layout template
    doc = Document(layout_template)
    
    # Modify P2 (Document title) and P3 (Activity)
    paragraphs = doc.paragraphs
    
    if len(paragraphs) > 2:
        p2 = paragraphs[2]
        if p2.runs:
            p2.runs[0].text = f"เอกสาร: {doc_info['title']}"
            
    if len(paragraphs) > 3:
        p3 = paragraphs[3]
        if p3.runs:
            p3.runs[0].text = f"{doc_info['activity']}"
            
    # Save
    output_path = os.path.join(output_dir, doc_info['filename'])
    doc.save(output_path)
    print(f"  OK [{doc_info['num']}] {doc_info['filename']}")

print(f"\n{'='*60}")
print(f"สร้างใบนำส่งเอกสารสำเร็จ {len(documents)} ไฟล์")
print(f"บันทึกที่: {output_dir}")
