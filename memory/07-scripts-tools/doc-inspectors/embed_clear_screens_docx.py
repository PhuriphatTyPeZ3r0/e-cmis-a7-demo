import os, sys, zipfile, shutil
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update doc2 (เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้_ปรับปรุงตารางและProcessแล้ว.docx)
# which contains all 78 SDD specification tables with image53.png to image130.png!

doc2_path = 'เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้_ปรับปรุงตารางและProcessแล้ว.docx'
backup_path = doc2_path.replace('.docx', '-backup-before-clear-screens.docx')
if not os.path.exists(backup_path):
    shutil.copy2(doc2_path, backup_path)
    print(f'Created backup: {backup_path}')

# Mapping of all 78 images in doc2 (image53.png to image130.png)
image_map_78 = {
    # ผอ.สำนักงาน ป.ป.ท. เขต (6)
    'image53.png': 'staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-1.png',
    'image54.png': 'staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-2.png',
    'image55.png': 'staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-3.png',
    'image56.png': 'staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-4.png',
    'image57.png': 'staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-5.png',
    'image58.png': 'staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-6.png',

    # เจ้าหน้าที่รับเรื่องประจำเขต (8)
    'image59.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-1.png',
    'image60.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-2.png',
    'image61.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-3.png',
    'image62.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-4.png',
    'image63.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-5.png',
    'image64.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-6.png',
    'image65.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-7.png',
    'image66.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-8.png',

    # ธุรการประจำเขต (3)
    'image67.png': 'staff-workflow/prototype/ธุรการประจำเขต/staff-workflow.html-1.png',
    'image68.png': 'staff-workflow/prototype/ธุรการประจำเขต/staff-workflow.html-2.png',
    'image69.png': 'staff-workflow/prototype/ธุรการประจำเขต/staff-workflow.html-3.png',

    # ธุรการสารบรรณกลาง ชั้น 14 (3)
    'image70.png': 'staff-workflow/prototype/ธุรการสารบรรณกลาง ชั้น 14/staff-workflow-1.png',
    'image71.png': 'staff-workflow/prototype/ธุรการสารบรรณกลาง ชั้น 14/staff-workflow-step1-1.png',
    'image72.png': 'staff-workflow/prototype/ธุรการสารบรรณกลาง ชั้น 14/staff-workflow-step1-2.png',

    # ผู้รักษาราชการแทนตามคำสั่ง (1)
    'image73.png': 'staff-workflow/prototype/ผู้รักษาราชการแทนตามคำสั่ง/staff-workflow-ผู้รักษาราชการแทนตามคำสั่ง-1.png',

    # ธุรการ ศรร. (9)
    'image74.png': 'staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-1.png',
    'image75.png': 'staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-2.png',
    'image76.png': 'staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-3.png',
    'image77.png': 'staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-4.png',
    'image78.png': 'staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-5.png',
    'image79.png': 'staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-6.png',
    'image80.png': 'staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-7.png',
    'image81.png': 'staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-8.png',
    'image82.png': 'staff-workflow/prototype/ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-9.png',

    # ผอ.กองบริหารคดี (6)
    'image83.png': 'staff-workflow/prototype/ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-1.png',
    'image84.png': 'staff-workflow/prototype/ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-2.png',
    'image85.png': 'staff-workflow/prototype/ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-3.png',
    'image86.png': 'staff-workflow/prototype/ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-4.png',
    'image87.png': 'staff-workflow/prototype/ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-5.png',
    'image88.png': 'staff-workflow/prototype/ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-6.png',

    # ผอ.ศูนย์รับเรื่องร้องเรียน (5)
    'image89.png': 'staff-workflow/prototype/ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-1.png',
    'image90.png': 'staff-workflow/prototype/ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-2.png',
    'image91.png': 'staff-workflow/prototype/ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-3.png',
    'image92.png': 'staff-workflow/prototype/ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-4.png',
    'image93.png': 'staff-workflow/prototype/ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-5.png',

    # ธุรการ กบค. (3)
    'image94.png': 'staff-workflow/prototype/ธุรการ กบค/staff-workflow-1.png',
    'image95.png': 'staff-workflow/prototype/ธุรการ กบค/staff-workflow-step1-1.png',
    'image96.png': 'staff-workflow/prototype/ธุรการ กบค/staff-workflow-step1-2.png',

    # เจ้าหน้าที่รับเรื่อง (10)
    'image97.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-1.png',
    'image98.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-2.png',
    'image99.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-1.png',
    'image100.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-2.png',
    'image101.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-3.png',
    'image102.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-4.png',
    'image103.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-5.png',
    'image104.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-6.png',
    'image105.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-7.png',
    'image106.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-8.png',

    # กล่องบัตรสนเท่ห์ (1)
    'image107.png': 'staff-workflow/prototype/กล่องบัตรสนเท่ห์/staff-workflow-กล่องบัตรสนเท่ห์-1.png',

    # Staff Intake (23)
    'image108.png': 'staff-intake/prototype/staff-intake.html-1.png',
    'image109.png': 'staff-intake/prototype/staff-intake.html-4.png',
    'image110.png': 'staff-intake/prototype/staff-intake.html-5.png',
    'image111.png': 'staff-intake/prototype/staff-intake.html-6.png',
    'image112.png': 'staff-intake/prototype/staff-intake.html-7.png',
    'image113.png': 'staff-intake/prototype/staff-intake.html-8.png',
    'image114.png': 'staff-intake/prototype/staff-intake.html-9.png',
    'image115.png': 'staff-intake/prototype/staff-intake.html-10.png',
    'image116.png': 'staff-intake/prototype/staff-intake.html-11.png',
    'image117.png': 'staff-intake/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-intake.html-3.png',
    'image118.png': 'staff-intake/prototype/เจ้าหน้าที่รับเรื่องประจำเขต/staff-intake.html-1.png',
    'image119.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-1.png',
    'image120.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-2.png',
    'image121.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-3.png',
    'image122.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-4.png',
    'image123.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-5.png',
    'image124.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-6.png',
    'image125.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-7.png',
    'image126.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-8.png',
    'image127.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-2-9.png',
    'image128.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-1.png',
    'image129.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-2.png',
    'image130.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-3.png',
}

def replace_images_in_docx(in_docx, out_docx, img_map):
    tmp_out = out_docx + '.tmp.zip'
    with zipfile.ZipFile(in_docx, 'r') as zin:
        with zipfile.ZipFile(tmp_out, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                fname = item.filename
                # Check if this item is in img_map
                base_fname = os.path.basename(fname)
                if fname.startswith('word/media/') and base_fname in img_map:
                    rep_path = img_map[base_fname]
                    with open(rep_path, 'rb') as f_rep:
                        zout.writestr(item, f_rep.read())
                    print(f'Replaced {fname} with {rep_path}')
                else:
                    zout.writestr(item, zin.read(fname))
    if os.path.exists(out_docx):
        os.remove(out_docx)
    os.rename(tmp_out, out_docx)
    print(f'Successfully wrote: {out_docx}')

# 1. Replace all 78 images in doc2
replace_images_in_docx(doc2_path, doc2_path, image_map_78)

# 2. Also update target file: เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้-20260817-update อีกแล้วTT[arm].docx
target_doc = 'เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้-20260817-update อีกแล้วTT[arm].docx'
target_backup = target_doc.replace('.docx', '-backup-original.docx')
if not os.path.exists(target_backup):
    shutil.copy2(target_doc, target_backup)
    print(f'Created backup: {target_backup}')

# In target_doc (master 10 tables version), image53 to image61 are:
# image53: 5.2.1 แบบฟอร์มบันทึกรับเรื่องร้องเรียนประจำเขต -> staff-intake/prototype/staff-intake.html-5.png
# image54: 5.2.2 แบบฟอร์มบันทึกสถานที่เกิดเหตุและมูลค่าความเสียหาย -> staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-2.png
# image55: 5.2.3 ระบบลงรับเรื่องร้องเรียนและออกเลขรับบริการอัตโนมัติ -> staff-intake/prototype/staff-intake.html-8.png
# image56: 5.2.4 ระบบพิมพ์เอกสารราชการและใบแจ้งเลขติดตาม -> staff-intake/prototype/staff-intake.html-9.png
# image57: 5.3.1 หน้ารายการเรื่องร้องเรียนและกล่องข้อความงานหลักตามสิทธิ์ -> staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-1.png
# image58: 5.3.2 หน้ารายละเอียดเรื่องร้องเรียนและประวัติการดำเนินงาน -> staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-1.png
# image59: 5.3.3 ระบบแฟ้มสำนวนการกลั่นกรอง ตรวจสอบเรื่องซ้ำ -> staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-2.png
# image60: 5.3.4 ระบบพิจารณา อนุมัติ และลงนามอิเล็กทรอนิกส์ -> staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-4.png
# image61: 5.3.5 ระบบบริหารจัดการกล่องบัตรสนเท่ห์ -> staff-workflow/prototype/กล่องบัตรสนเท่ห์/staff-workflow-กล่องบัตรสนเท่ห์-1.png

master_map = {
    'image53.png': 'staff-intake/prototype/staff-intake.html-5.png',
    'image54.png': 'staff-intake/prototype/ธุรการประจำเขต/staff-intake.html-12-2.png',
    'image55.png': 'staff-intake/prototype/staff-intake.html-8.png',
    'image56.png': 'staff-intake/prototype/staff-intake.html-9.png',
    'image57.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-1.png',
    'image58.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-1.png',
    'image59.png': 'staff-workflow/prototype/เจ้าหน้าที่รับเรื่อง/staff-workflow-2.png',
    'image60.png': 'staff-workflow/prototype/ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-4.png',
    'image61.png': 'staff-workflow/prototype/กล่องบัตรสนเท่ห์/staff-workflow-กล่องบัตรสนเท่ห์-1.png',
}

replace_images_in_docx(target_doc, target_doc, master_map)

# Also update doc2 to target_doc name if user wants the full 78 tables in target docx name:
# Let's save a copy as `เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้-20260817-update อีกแล้วTT[arm]_สมบูรณ์ครบ78หน้าจอ.docx`
full_78_target = 'เล่ม 4 - กจ_4_2.1.3_2.1.4 ออกแบบส่วนการติดต่อกับผู้ใช้-20260817-update อีกแล้วTT[arm]_สมบูรณ์ครบ78หน้าจอ.docx'
shutil.copy2(doc2_path, full_78_target)
print(f'Successfully created full 78 SDD tables version: {full_78_target}')
