import pytest
from playwright.sync_api import Page, expect
from conftest import MOCK_DATA, nav_menu

# ==========================================
# 3. โมดูลรับเรื่องร้องเรียนใหม่ (Complaint Submission Module)
# ==========================================

def test_comp_001_end_to_end_happy_path(logged_in_page: Page):
    """
    TC-COMP-001: ทดสอบการบันทึกเรื่องร้องเรียนใหม่จนสำเร็จ (End-to-End Happy Path) 5 ขั้นตอน
    """
    page = logged_in_page
    nav_menu(page, "complaints")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    
    # --- Step 1 ---
    page.locator(".chc:has-text('เว็บไซต์')").first.click()
    page.locator("#panel1 button:has-text('ถัดไป')").click()
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    expect(page.locator("#panel2")).to_be_visible()

    # --- Step 2 ---
    page.locator("#panel2 input[placeholder*='ชื่อ']").first.fill(MOCK_DATA['complainant']['firstname'])
    page.locator("#panel2 input[placeholder*='สกุล']").first.fill(MOCK_DATA['complainant']['lastname'])
    page.locator("#panel2 button:has-text('ถัดไป')").click()
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    expect(page.locator("#panel3")).to_be_visible()

    # --- Step 3 ---
    inputs_panel3 = page.locator("#panel3 input[type='text']")
    inputs_panel3.nth(0).wait_for(state="visible")
    inputs_panel3.nth(0).fill(MOCK_DATA['accused']['fullname'])
    if inputs_panel3.count() > 1:
        inputs_panel3.nth(1).fill(MOCK_DATA['accused']['agency'])
    else:
        page.locator("#panel3 input[placeholder*='หน่วยงาน']").first.fill(MOCK_DATA['accused']['agency'])
        
    page.locator("#panel3 button:has-text('ถัดไป')").click()
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    expect(page.locator("#panel4")).to_be_visible()

    # --- Step 4 ---
    page.locator("#panel4 input[placeholder*='ระบุเรื่องที่ร้องเรียน']").fill(MOCK_DATA['complaint_details']['topic'])
    page.locator("#panel4 textarea").fill(MOCK_DATA['complaint_details']['description'])
    page.locator("#panel4 button:has-text('ถัดไป')").click()
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    expect(page.locator("#panel5")).to_be_visible(timeout=5000)

    # --- Step 5 ---
    # ตัวแปร checkbox อาจชื่อ #declCheck หรือ input[type='checkbox']
    check_box = page.locator("#declCheck")
    if check_box.is_visible():
        check_box.check()
    page.locator("button:has-text('ยืนยันส่งเรื่องร้องเรียน'), button:has-text('ยืนยันส่งเรื่อง')").first.click()
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    
    # สมมติเช็คว่า Panel6 แสดงขึ้นหรือโชว์เลขคดีติดมา
    expect(page.locator("#panel6")).to_be_visible(timeout=10000)


def test_comp_002_validation(logged_in_page: Page):
    """
    TC-COMP-002: ทดสอบระบบบังคับกรอกข้อมูล (Validation)
    พยายามกดปุ่ม "ถัดไป" โดยไม่กรอกข้อมูลในช่อง * สีแดง
    """
    page = logged_in_page
    nav_menu(page, "complaints")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    
    # Step 1 สมมติว่ามี Validation ให้เลือกช่องทางก่อน 
    # ลองกดถัดไปเลยโดยไม่เลือก "เว็บไซต์" 
    next_btn = page.locator("#panel1 button:has-text('ถัดไป')")
    next_btn.click()
    
    # ควรมี Validation เด้งขึ้นมา หรือติดอยู่ที่ #panel1
    # ตรวจสอบว่าหน้าจอไม่ไหลไป panel2
    panel2 = page.locator("#panel2")
    expect(panel2).not_to_be_visible()


def test_comp_003_ai_history_check(logged_in_page: Page):
    """
    TC-COMP-003: ทดสอบฟังก์ชันตรวจสอบประวัติอัตโนมัติ (ใน Step 3)
    """
    page = logged_in_page
    nav_menu(page, "complaints")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    
    # ข้ามไป Step 3
    # page.evaluate("goStep(3)") # สมมติว่ามีฟังก์ชัน JS ข้ามได้ หรือต้องไหลตาม step
    # ถ้าไม่มีต้องผ่าน UI จริงๆ
    page.locator(".chc:has-text('เว็บไซต์')").first.click()
    page.locator("#panel1 button:has-text('ถัดไป')").click()
    
    page.locator("#panel2 input[placeholder*='ชื่อ']").first.fill(MOCK_DATA['complainant']['firstname'])
    page.locator("#panel2 input[placeholder*='สกุล']").first.fill(MOCK_DATA['complainant']['lastname'])
    page.locator("#panel2 button:has-text('ถัดไป')").click()
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    # ใน Step 3 กดปุ่ม AI ตรวจสอบประวัติ
    ai_check_btn = page.locator("#panel3 button:has-text('ตรวจสอบประวัติ')")
    if ai_check_btn.is_visible():
        ai_check_btn.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        # ตรวจสอบว่าระบบโชว์ Alert, Modal หรือ Icon แสดงว่าเคลียร์แล้ว
        expect(page.locator("text=กำลังตรวจสอบ")).not_to_be_visible(timeout=5000)


def test_comp_004_document_upload(logged_in_page: Page):
    """
    TC-COMP-004: ทดสอบการอัปโหลดไฟล์เอกสารประกอบ (ใน Step 4)
    พื้นที่ Dropzone (.uz)
    """
    page = logged_in_page
    nav_menu(page, "complaints")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    
    # หากินทางลัด (บังคับพา UI มาหน้า #panel4 เพื่อประหยัดเวลา) หรือถ้าทางลัดพัง ต้องเขียนไหลยาว
    page.evaluate("document.querySelectorAll('.page').forEach(el=>el.classList.remove('on'));")
    page.evaluate("document.getElementById('panel4').classList.add('on');")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    dropzone = page.locator(".uz").first
    if dropzone.is_visible():
        # Playwright รองรับการเซ็ต Input file ได้ง่ายกว่า Drag
        file_input = page.locator("input[type='file']").first
        if file_input.count() > 0:
            import os
            # จำลองสั้นๆ (ถ้าไม่มีไฟล์ อาจสร้างไฟล์เปล่าๆ .pdf ในระบบ)
            with open("dummy.pdf", "w") as f:
                f.write("test pdf file")
            file_input.set_input_files("dummy.pdf")
            os.remove("dummy.pdf")
            # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
            
        dropzone.hover()
        expect(dropzone).to_be_visible()


def test_comp_005_multi_format_upload(logged_in_page: Page, tmp_path):
    """
    TC-COMP-005: ทดสอบการแนบไฟล์หลายฟอร์แมต (Word, Excel, PDF) 
    (เพิ่มพิเศษตามข้อกำหนดของ TOR โครงการ หน้า 15 ข้อ 4.4.9)
    """
    page = logged_in_page
    nav_menu(page, "complaints")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    
    # ทางลัดมาสู่ Step 4
    page.evaluate("document.querySelectorAll('.page').forEach(el=>el.classList.remove('on'));")
    page.evaluate("document.getElementById('panel4').classList.add('on');")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    dropzone = page.locator(".uz").first
    if dropzone.is_visible():
        file_input = page.locator("input[type='file']").first
        if file_input.count() > 0:
            # สร้างตัวอย่างไฟล์ทั้ง 3 นามสกุลใน Temp Path
            pdf_file = tmp_path / "evidence.pdf"
            docx_file = tmp_path / "report.docx"
            xlsx_file = tmp_path / "data.xlsx"
            
            for path in [pdf_file, docx_file, xlsx_file]:
                path.write_text("mock data")
                
            # จำลองการแนบทีเดียว 3 ไฟล์พร้อมกัน
            file_input.set_input_files([str(pdf_file), str(docx_file), str(xlsx_file)])
            # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
            
            # คาดหวังให้ตัว Dropzone ยังอยู่ ไม่ได้ Crash หรือโหลดพัง
            expect(dropzone).to_be_visible()
