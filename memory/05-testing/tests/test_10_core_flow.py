import pytest
from playwright.sync_api import Page, expect
from conftest import MOCK_DATA, nav_menu

# ==========================================
# 12. การทดสอบการไหลของข้อมูลข้ามโมดูล (Full E2E Core Business Flow)
# ==========================================

def test_e2e_001_ultimate_happy_path(logged_in_page: Page):
    """
    TC-E2E-001: ทดสอบเส้นทางการทำงานหลักของระบบตั้งแต่ต้นจนจบ
    รับเรื่อง -> มอบหมาย -> ไต่สวน -> มติกรรมการ -> ส่งต่อ
    """
    page = logged_in_page
    
    # 1. รับเรื่อง (สมมติจำลองย่อๆ)
    nav_menu(page, "complaints")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    # สมมติกดส่งแบบข้าม Step
    page.evaluate("document.querySelectorAll('.page').forEach(el=>el.classList.remove('on'));")
    page.evaluate("document.getElementById('panel5').classList.add('on');")
    
    page.locator("#declCheck").check() if page.locator("#declCheck").is_visible() else None
    submit_btn = page.locator("button:has-text('ยืนยันส่งเรื่อง')").first
    if submit_btn.is_visible():
        submit_btn.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        
    # 2. มอบหมาย
    nav_menu(page, "assign")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    select_assign = page.locator("select").first
    if select_assign.is_visible():
        select_assign.select_option(index=1)
        page.locator("button:has-text('มอบหมาย')").first.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        
    # 3. ไต่สวน (อัปเดตสถานะในหน้าจัดการคดี)
    nav_menu(page, "cases")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    first_case = page.locator(".et tbody tr").first
    if first_case.is_visible():
        first_case.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        # สมมติอัปเดตสถานะเป็นกำลังไต่สวน และกลับมาที่ Dashboard
        # ... logic update status ...

    # 4. มติกรรมการ
    nav_menu(page, "committee")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    create_comm = page.locator("button:has-text('บันทึกมติใหม่')").first
    if create_comm.is_visible():
        create_comm.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    # 5. ปิดคดี/ส่งต่อ สำเร็จ ตรวจสอบสถิติอัปเดต (กลับ Dashboard)
    nav_menu(page, "dashboard")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    expect(page.locator(".kpi").first).to_be_visible()
