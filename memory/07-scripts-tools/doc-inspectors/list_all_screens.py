import os, sys
sys.stdout.reconfigure(encoding='utf-8')

# Let's list all 69 prototype screen files and their exact paths
workflow_screens = [
    # 1. ผอ.สำนักงาน ป.ป.ท. เขต (6 screens)
    ('ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-1.png', 'regional-director', 'inbox', 'หน้ารายการเรื่องร้องเรียน ผอ.เขต'),
    ('ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-2.png', 'regional-director', 'detail', 'รายละเอียดเรื่องร้องเรียน ผอ.เขต'),
    ('ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-3.png', 'regional-director', 'opinion', 'บันทึกความเห็นและคำสั่ง ผอ.เขต'),
    ('ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-4.png', 'regional-director', 'sign', 'การลงนามอิเล็กทรอนิกส์ ผอ.เขต'),
    ('ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-5.png', 'regional-director', 'history', 'ประวัติการตัดสินใจและอนุมัติ ผอ.เขต'),
    ('ผอ.สำนักงาน ป.ป.ท. เขต/staff-workflow.html-6.png', 'regional-director', 'forward', 'การส่งต่อ/มอบหมายงาน ผอ.เขต'),
    
    # 2. เจ้าหน้าที่รับเรื่องประจำเขต (8 screens)
    ('เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-1.png', 'regional-officer', 'inbox', 'รายการเรื่องร้องเรียน เจ้าหน้าที่เขต'),
    ('เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-2.png', 'regional-officer', 'duplicate', 'ตรวจสอบเรื่องซ้ำ เจ้าหน้าที่เขต'),
    ('เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-3.png', 'regional-officer', 'detail', 'รายละเอียดเรื่องร้องเรียน เจ้าหน้าที่เขต'),
    ('เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-4.png', 'regional-officer', 'opinion', 'กลั่นกรองเรื่องซ้ำและความเห็น'),
    ('เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-5.png', 'regional-officer', 'facts', 'บันทึกข้อเท็จจริงและความเสียหาย'),
    ('เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-6.png', 'regional-officer', 'routing', 'เส้นทางการพิจารณาและลงนาม'),
    ('เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-7.png', 'regional-officer', 'packet', 'จัดชุดเอกสารส่งพิจารณา'),
    ('เจ้าหน้าที่รับเรื่องประจำเขต/staff-workflow.html-8.png', 'regional-officer', 'summary', 'สรุปจำนวนหน้าเอกสารและประวัติ'),

    # 3. ธุรการประจำเขต (3 screens)
    ('ธุรการประจำเขต/staff-workflow.html-1.png', 'regional-clerk', 'inbox', 'รายการเรื่องร้องเรียน ธุรการเขต'),
    ('ธุรการประจำเขต/staff-workflow.html-2.png', 'regional-clerk', 'detail', 'รายละเอียดและรอออกเลขรับ ธุรการเขต'),
    ('ธุรการประจำเขต/staff-workflow.html-3.png', 'regional-clerk', 'register', 'ลงทะเบียนรับและมอบหมายงาน ธุรการเขต'),

    # 4. ธุรการสารบรรณกลาง ชั้น 14 (3 screens)
    ('ธุรการสารบรรณกลาง ชั้น 14/staff-workflow-1.png', 'central-registry-clerk', 'inbox', 'รายการหนังสือรับใหม่ สารบรรณกลาง'),
    ('ธุรการสารบรรณกลาง ชั้น 14/staff-workflow-step1-1.png', 'central-registry-clerk', 'detail', 'ตรวจสอบเอกสารและลงรับ สารบรรณกลาง'),
    ('ธุรการสารบรรณกลาง ชั้น 14/staff-workflow-step1-2.png', 'central-registry-clerk', 'forward', 'ส่งต่อเรื่องไปยัง กบค.'),

    # 5. ผู้รักษาราชการแทนตามคำสั่ง (1 screen)
    ('ผู้รักษาราชการแทนตามคำสั่ง/staff-workflow-ผู้รักษาราชการแทนตามคำสั่ง-1.png', 'acting', 'inbox', 'รายการเรื่องเสนอผู้รักษาราชการแทน'),

    # 6. ธุรการ ศรร. (9 screens)
    ('ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-1.png', 'admin', 'inbox', 'รายการเรื่องร้องเรียนรอลงรับ ธุรการ ศรร.'),
    ('ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-2.png', 'admin', 'detail', 'รายละเอียดเรื่องร้องเรียน ธุรการ ศรร.'),
    ('ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-3.png', 'admin', 'assign', 'มอบหมายเจ้าหน้าที่รับเรื่อง ธุรการ ศรร.'),
    ('ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-4.png', 'admin', 'backup', 'จัดการผู้รับผิดชอบหลักและผู้ปฏิบัติงานแทน'),
    ('ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-5.png', 'admin', 'tracking', 'ติดตามสถานะงาน ธุรการ ศรร.'),
    ('ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-6.png', 'admin', 'recall', 'ดึงงานกลับ/ปรับเปลี่ยนผู้รับผิดชอบ'),
    ('ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-7.png', 'admin', 'returned', 'รายการเรื่องส่งกลับจากผู้บริหาร'),
    ('ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-8.png', 'admin', 'history', 'ประวัติการมอบหมายงาน ธุรการ ศรร.'),
    ('ธุรการ ศรร./staff-workflow-ธุรการ-ศรร-9.png', 'admin', 'report', 'ส่งออกและรายงานสรุป ธุรการ ศรร.'),

    # 7. ผอ.กองบริหารคดี (6 screens)
    ('ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-1.png', 'division', 'inbox', 'รายการเรื่องรอพิจารณา ผอ.กบค.'),
    ('ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-2.png', 'division', 'detail', 'ข้อมูลเรื่องร้องเรียนก่อนพิจารณา ผอ.กบค.'),
    ('ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-3.png', 'division', 'opinion', 'ความเห็นและคำสั่ง ผอ.กบค.'),
    ('ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-4.png', 'division', 'sign', 'ลงนามอิเล็กทรอนิกส์และออกเลขสำนวน ผอ.กบค.'),
    ('ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-5.png', 'division', 'return', 'สั่งการแก้ไขและส่งกลับ ผอ.กบค.'),
    ('ผอ.กองบริหารคดี/staff-workflow-ผอ.กบค.-6.png', 'division', 'history', 'ประวัติการตัดสินใจและอนุมัติ ผอ.กบค.'),

    # 8. ผอ.ศูนย์รับเรื่องร้องเรียน (5 screens)
    ('ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-1.png', 'center', 'inbox', 'รายการเรื่องร้องเรียน ผอ.ศรร.'),
    ('ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-2.png', 'center', 'detail', 'รายละเอียดเรื่องร้องเรียน ผอ.ศรร.'),
    ('ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-3.png', 'center', 'officer_info', 'ข้อมูลจากเจ้าหน้าที่รับเรื่อง'),
    ('ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-4.png', 'center', 'opinion', 'ความเห็นและการลงนาม ผอ.ศรร.'),
    ('ผอ.ศูนย์รับเรื่องร้องเรียน/staff-workflow-ผอ.ศรร.-5.png', 'center', 'history', 'ประวัติการตัดสินใจ ผอ.ศรร.'),

    # 9. ธุรการ กบค. (3 screens)
    ('ธุรการ กบค/staff-workflow-1.png', 'case-admin-clerk', 'inbox', 'รายการเรื่องร้องเรียน ธุรการ กบค.'),
    ('ธุรการ กบค/staff-workflow-step1-1.png', 'case-admin-clerk', 'detail', 'รายละเอียดและรอออกเลขรับ กบค.'),
    ('ธุรการ กบค/staff-workflow-step1-2.png', 'case-admin-clerk', 'register', 'ลงทะเบียนรับ กบค. และส่งต่อ ศรร.'),

    # 10. เจ้าหน้าที่รับเรื่อง (10 screens)
    ('เจ้าหน้าที่รับเรื่อง/staff-workflow-1.png', 'officer', 'inbox', 'รายการเรื่องร้องเรียน เจ้าหน้าที่รับเรื่อง'),
    ('เจ้าหน้าที่รับเรื่อง/staff-workflow-2.png', 'officer', 'duplicate', 'ตารางแสดงการตรวจสอบเรื่องซ้ำ'),
    ('เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-1.png', 'officer', 'detail', 'รายละเอียดเรื่องร้องเรียน เจ้าหน้าที่รับเรื่อง'),
    ('เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-2.png', 'officer', 'screening', 'กลั่นกรองเรื่องซ้ำและความเห็น'),
    ('เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-3.png', 'officer', 'facts', 'ข้อมูลเรื่องร้องเรียนโดยละเอียด'),
    ('เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-4.png', 'officer', 'options', 'ตัวเลือกผลการพิจารณาและข้อเสนอ'),
    ('เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-5.png', 'officer', 'damage', 'ความเสียหายและข้อมูลการมอบหมาย'),
    ('เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-6.png', 'officer', 'routing', 'เส้นทางการพิจารณาและลงนาม'),
    ('เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-7.png', 'officer', 'packet', 'จัดชุดเอกสารส่งพิจารณา (ใบปกเอกสารลับ)'),
    ('เจ้าหน้าที่รับเรื่อง/staff-workflow-step3-8.png', 'officer', 'summary', 'สรุปจำนวนหน้าเอกสารและประวัติ'),

    # 11. กล่องบัตรสนเท่ห์ (1 screen)
    ('กล่องบัตรสนเท่ห์/staff-workflow-กล่องบัตรสนเท่ห์-1.png', 'anonymous', 'inbox', 'กล่องบัตรสนเท่ห์ (ภาพรวม)')
]

intake_screens = [
    # General (9 screens)
    ('staff-intake.html-1.png', 'general', 'init', 'บันทึกข้อมูลเรื่องร้องเรียน (แบบฟอร์มเริ่มต้น)'),
    ('staff-intake.html-4.png', 'general', 'email', 'บันทึกข้อมูลเรื่องร้องเรียน (ช่องทาง Email)'),
    ('staff-intake.html-5.png', 'general', 'preview', 'บันทึกข้อมูลเรื่องร้องเรียน (แสดงตัวอย่างเอกสารเต็ม)'),
    ('staff-intake.html-6.png', 'general', 'alert', 'บันทึกข้อมูลเรื่องร้องเรียน (แจ้งเตือนยังไม่ระบุเขต)'),
    ('staff-intake.html-7.png', 'general', 'modal', 'ยืนยันการลงรับเรื่อง (Modal)'),
    ('staff-intake.html-8.png', 'general', 'success', 'ลงรับเรื่องสำเร็จ (แจ้งเลขรับบริการ)'),
    ('staff-intake.html-9.png', 'general', 'receipt_582', 'ใบแจ้งเลขติดตามเรื่องร้องเรียน (58/2-02)'),
    ('staff-intake.html-10.png', 'general', 'print_complaint', 'เอกสารแจ้งการร้องเรียน/เบาะแส (แบบพิมพ์เต็มหน้า)'),
    ('staff-intake.html-11.png', 'general', 'print_notice', 'แบบแจ้งเลขเรื่องร้องเรียนและเลขติดตาม (แบบพิมพ์เต็มหน้า)'),

    # Roles & Regions (14 screens)
    ('ผอ.สำนักงาน ป.ป.ท. เขต/staff-intake.html-3.png', 'regional-director', 'intake', 'บันทึกข้อมูลเรื่องร้องเรียน - ผอ.สำนักงาน ป.ป.ท. เขต'),
    ('เจ้าหน้าที่รับเรื่องประจำเขต/staff-intake.html-1.png', 'regional-officer', 'intake', 'บันทึกข้อมูลเรื่องร้องเรียน - เจ้าหน้าที่รับเรื่องประจำเขต'),
    ('ธุรการประจำเขต/staff-intake.html-2-1.png', 'regional-clerk', 'region_1', 'บันทึกข้อมูลเรื่องร้องเรียน - ธุรการประจำเขต (เขต 1)'),
    ('ธุรการประจำเขต/staff-intake.html-2-2.png', 'regional-clerk', 'region_2', 'บันทึกข้อมูลเรื่องร้องเรียน - ธุรการประจำเขต (เขต 2)'),
    ('ธุรการประจำเขต/staff-intake.html-2-3.png', 'regional-clerk', 'region_3', 'บันทึกข้อมูลเรื่องร้องเรียน - ธุรการประจำเขต (เขต 3)'),
    ('ธุรการประจำเขต/staff-intake.html-2-4.png', 'regional-clerk', 'region_4', 'บันทึกข้อมูลเรื่องร้องเรียน - ธุรการประจำเขต (เขต 4)'),
    ('ธุรการประจำเขต/staff-intake.html-2-5.png', 'regional-clerk', 'region_5', 'บันทึกข้อมูลเรื่องร้องเรียน - ธุรการประจำเขต (เขต 5)'),
    ('ธุรการประจำเขต/staff-intake.html-2-6.png', 'regional-clerk', 'region_6', 'บันทึกข้อมูลเรื่องร้องเรียน - ธุรการประจำเขต (เขต 6)'),
    ('ธุรการประจำเขต/staff-intake.html-2-7.png', 'regional-clerk', 'region_7', 'บันทึกข้อมูลเรื่องร้องเรียน - ธุรการประจำเขต (เขต 7)'),
    ('ธุรการประจำเขต/staff-intake.html-2-8.png', 'regional-clerk', 'region_8', 'บันทึกข้อมูลเรื่องร้องเรียน - ธุรการประจำเขต (เขต 8)'),
    ('ธุรการประจำเขต/staff-intake.html-2-9.png', 'regional-clerk', 'region_9', 'บันทึกข้อมูลเรื่องร้องเรียน - ธุรการประจำเขต (เขต 9)'),
    ('ธุรการประจำเขต/staff-intake.html-12-1.png', 'regional-clerk', 'full_form', 'บันทึกข้อมูลเรื่องร้องเรียน (แบบเต็ม) - ธุรการประจำเขต'),
    ('ธุรการประจำเขต/staff-intake.html-12-2.png', 'regional-clerk', 'location', 'บันทึกข้อมูลเรื่องร้องเรียน (สถานที่เกิดเหตุ)'),
    ('ธุรการประจำเขต/staff-intake.html-12-3.png', 'regional-clerk', 'damage', 'บันทึกข้อมูลเรื่องร้องเรียน (มูลค่าความเสียหาย ต่อ)')
]

print(f'Workflow screens total: {len(workflow_screens)}')
print(f'Intake screens total: {len(intake_screens)}')
print(f'Total screens to capture: {len(workflow_screens) + len(intake_screens)}')
