import os, sys, docx
sys.stdout.reconfigure(encoding='utf-8')

doc1_path = 'เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้-20260817-update อีกแล้วTT[arm].docx'
doc1 = docx.Document(doc1_path)

print(f'=== Doc 1 ({doc1_path}) ===')
print(f'Total tables: {len(doc1.tables)}')

for t_idx in range(len(doc1.tables)-12, len(doc1.tables)):
    tbl = doc1.tables[t_idx]
    func_name = tbl.rows[0].cells[1].text.strip() if len(tbl.rows[0].cells) > 1 else ''
    blips = tbl._tbl.xpath('.//a:blip')
    rids = [b.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed') for b in blips]
    parts = [doc1.part.related_parts.get(rid).partname for rid in rids if doc1.part.related_parts.get(rid)]
    print(f'Table {t_idx}: [{func_name}] -> images: {parts}')
