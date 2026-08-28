import os, sys, docx
sys.stdout.reconfigure(encoding='utf-8')

def inspect_doc_images(doc_path):
    doc = docx.Document(doc_path)
    print(f'=== Inspecting: {doc_path} ===')
    print(f'Total tables: {len(doc.tables)}')
    for t_idx, table in enumerate(doc.tables):
        for r_idx, row in enumerate(table.rows):
            for c_idx, cell in enumerate(row.cells):
                # Check for blips (images)
                blips = cell._tc.xpath('.//a:blip')
                if blips:
                    for blip in blips:
                        rId = blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                        image_part = doc.part.related_parts.get(rId)
                        target_ref = image_part.partname if image_part else 'None'
                        print(f'Table {t_idx} Row {r_idx} Col {c_idx} -> Image rId={rId}, part={target_ref}, title={table.rows[0].cells[1].text.strip() if len(table.rows[0].cells)>1 else ""}')

inspect_doc_images('เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้_ปรับปรุงตารางและProcessแล้ว.docx')
