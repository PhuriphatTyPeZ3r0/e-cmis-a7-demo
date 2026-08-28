import os, sys, docx
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้-20260817-update อีกแล้วTT[arm].docx')

print(f'Total tables in doc: {len(doc.tables)}')

for i in range(120, len(doc.tables)):
    tbl = doc.tables[i]
    first_row = [c.text.strip().replace('\n', ' ') for c in tbl.rows[0].cells]
    has_img = len(tbl._tbl.xpath('.//a:blip')) > 0
    print(f'Table {i} ({len(tbl.rows)} rows x {len(tbl.columns)} cols): {first_row[:2]} | Has Image: {has_img}')
