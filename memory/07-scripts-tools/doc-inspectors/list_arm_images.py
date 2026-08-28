import docx, zipfile, io, sys
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')

f_arm = 'เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้-20260817-update อีกแล้วTT[arm].docx'
d_arm = docx.Document(f_arm)
z_arm = zipfile.ZipFile(f_arm)

print('=== ALL IMAGES IN ARM DOCX ===')
for rid, rel in d_arm.part.rels.items():
    if 'image' in rel.target_ref:
        data = z_arm.read('word/' + rel.target_ref)
        im = Image.open(io.BytesIO(data))
        print(f'{rid} -> {rel.target_ref}: size={im.size}, bytes={len(data)}')
