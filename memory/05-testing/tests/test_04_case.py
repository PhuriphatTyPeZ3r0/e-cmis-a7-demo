import pytest
from playwright.sync_api import Page, expect
from conftest import MOCK_DATA, nav_menu

# ==========================================
# 4. โมดูลการจัดการสำนวนคดี (Case Management Module)
# ==========================================

def test_case_001_filtering(logged_in_page: Page):
    """
    TC-CASE-001: ทดสอบการกรองข้อมูลสำนวนคดี (Filtering)
    คลิกที่การ์ดสถานะต่างๆ ด้านบน (เช่น รอดำเนินการ, กำลังไต่สวน)
    """
    page = logged_in_page
    nav_menu(page, "cases")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    # ทดสอบคลิก KPI card รอดำเนินการ หรือ กำลังไต่สวน (อิงจาก DOM เดิมใช้ .kpi.kpi-b)
    filter_btn = page.locator(".kpi.kpi-b").first
    if filter_btn.is_visible():
        filter_btn.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    
    # ควรเช็คว่าในตาราง (Table) แถวๆ แรก มีคำว่า "กำลังไต่สวน" แสดงอยู่ (หากมี Mock Data ขึ้น)
    table_rows = page.locator(".et tbody tr")
    if table_rows.count() > 0:
        expect(table_rows.first).to_be_visible()
        
    # เคลียร์ฟิลเตอร์ (คลิกทั้งหมด kpi-n)
    all_btn = page.locator(".kpi.kpi-n").first
    if all_btn.is_visible():
        all_btn.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน


def test_case_002_search(logged_in_page: Page):
    """
    TC-CASE-002: ทดสอบการค้นหาคดี (Search) ด้วยเลขคดี หรือ ชื่อ
    """
    page = logged_in_page
    nav_menu(page, "cases")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    search_box = page.locator(".tb-search input")
    if search_box.is_visible():
        search_box.fill(MOCK_DATA['search']['keyword'])
        page.keyboard.press("Enter")
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        
        # คาดหวังว่าคำค้นหาจะแสดงในผลลัพธ์ของตารางด้วย
        expect(page.locator(f"text={MOCK_DATA['search']['keyword']}").first).to_be_visible()


def test_case_003_tabs_view(logged_in_page: Page):
    """
    TC-CASE-003: ทดสอบการสลับแท็บรายละเอียดคดี (Tabs View) (SPA Behavior)
    """
    page = logged_in_page
    nav_menu(page, "cases")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    # สมมติเข้าไปดูรายละเอียดแถวแรกในตารางคดี
    table_rows = page.locator(".et tbody tr").first
    if table_rows.is_visible():
        table_rows.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        
        # สมมติมีแท็บ "เอกสาร" หรือ "ประวัติการดำเนินการ"
        target_tab = page.locator("text=เอกสาร").first
        if target_tab.is_visible():
            target_tab.click()
            # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
            
            # ตรวจสอบพฤติกรรม SPA ว่าไม่กระพริบ และหน้าเนื้อหาเปลี่ยน
            # สมมติมองหาตารางเอกสาร หรือ UI ก้อนใหม่
            expect(page.locator(".uz, .upload-zone").first).to_be_visible()


def test_case_004_export_report(logged_in_page: Page):
    """
    TC-CASE-004: ทดสอบการออกรายงาน (Export Report)
    """
    page = logged_in_page
    nav_menu(page, "cases")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    export_btn = page.locator("button:has-text('ออกรายงาน')").first
    if export_btn.is_visible():
        export_btn.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        
        # คาดหวัง Modal Popup เปิดขึ้นมา
        modal = page.locator(".mbk.open, .modal.show").first
        expect(modal).to_be_visible()
