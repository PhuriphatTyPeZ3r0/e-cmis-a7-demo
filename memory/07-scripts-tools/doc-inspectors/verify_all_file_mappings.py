import os, sys

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

missing = []
for k, v in image_map_78.items():
    if not os.path.exists(v):
        missing.append((k, v))

print(f'Total mapped: {len(image_map_78)}')
print(f'Missing files: {len(missing)}')
if missing:
    print('Missing:', missing)
else:
    print('All 78 files exist and verified!')
