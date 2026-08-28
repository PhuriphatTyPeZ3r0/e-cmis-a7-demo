import os, sys, docx
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้_ปรับปรุงตารางและProcessแล้ว.docx')

print(f'Total tables: {len(doc.tables)}')

# Let's inspect each table from 129 to 206:
# Table index, Function Name, Menu Name, Page Code, Ref
table_mapping = []
for t_idx in range(129, len(doc.tables)):
    tbl = doc.tables[t_idx]
    func_name = tbl.rows[0].cells[1].text.strip() if len(tbl.rows[0].cells) > 1 else ''
    menu_name = tbl.rows[1].cells[1].text.strip() if len(tbl.rows[1].cells) > 1 else ''
    page_code = tbl.rows[2].cells[1].text.strip() if len(tbl.rows[2].cells) > 1 else ''
    ref_name = tbl.rows[3].cells[1].text.strip() if len(tbl.rows[3].cells) > 1 else ''
    
    # Get image blip
    blips = tbl.rows[4].cells[1]._tc.xpath('.//a:blip')
    rid = blips[0].attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed') if blips else None
    partname = doc.part.related_parts.get(rid).partname if rid else None
    
    print(f'Table {t_idx}: [{func_name}] (Ref: {ref_name}) -> image: {partname}')
