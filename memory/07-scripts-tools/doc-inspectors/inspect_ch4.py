import docx, sys
sys.stdout.reconfigure(encoding='utf-8')

f_arm = 'เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้-20260817-update อีกแล้วTT[arm].docx'
d_arm = docx.Document(f_arm)

# List all elements in Chapter 4
in_ch4 = False
for child in d_arm.element.body:
    tag = child.tag.split('}')[-1]
    if tag == 'p':
        p = docx.text.paragraph.Paragraph(child, d_arm)
        t = p.text.strip()
        if 'บทที่ 4' in t:
            in_ch4 = True
        elif 'บทที่ 5' in t:
            in_ch4 = False
        if in_ch4:
            imgs = child.xpath('.//a:blip/@r:embed')
            print(f'P [{p.style.name}]: {t} [IMG: {imgs}]')
    elif tag == 'tbl' and in_ch4:
        tbl = docx.table.Table(child, d_arm)
        rows_txt = [' | '.join([c.text.strip().replace('\n', ' ') for c in r.cells]) for r in tbl.rows]
        imgs = child.xpath('.//a:blip/@r:embed')
        print(f'TABLE ({len(tbl.rows)}x{len(tbl.columns)}) [IMG: {imgs}]:\n  ' + '\n  '.join(rows_txt))
