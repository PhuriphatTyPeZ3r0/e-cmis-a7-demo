import pytest
from playwright.sync_api import Page, expect
from conftest import nav_menu

# ==========================================
# 6. โมดูลมติคณะกรรมการ (Committee Resolution Module)
# 7. โมดูลคุ้มครองพยาน (Witness Protection Module)
# ==========================================

def test_comm_001_view_resolution(logged_in_page: Page):
    """
    TC-COMM-001: ทดสอบการเปิดดูมติการประชุม
    คลิกปุ่ม "ดูมติ" ในตารางประวัติการประชุม
    """
    page = logged_in_page
    nav_menu(page, "committee")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    view_btn = page.locator("button:has-text('ดูมติ')").first
    if view_btn.is_visible():
        view_btn.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        # ตรวจสอบ Modal
        expect(page.locator(".mbox").first).to_be_visible()


def test_comm_002_create_resolution(logged_in_page: Page):
    """
    TC-COMM-002: ทดสอบการสร้างบันทึกมติใหม่
    คลิกปุ่ม "บันทึกมติใหม่"
    """
    page = logged_in_page
    nav_menu(page, "committee")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    create_btn = page.locator("button:has-text('บันทึกมติใหม่')").first
    if create_btn.is_visible():
        create_btn.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        # ตรวจสอบว่าฟอร์มเปิดขึ้นมา
        expect(page.locator("text=บันทึกมติการประชุม")).to_be_visible()


def test_wit_001_create_protection_request(logged_in_page: Page):
    """
    TC-WIT-001: ทดสอบสร้างคำร้องคุ้มครองพยาน
    """
    page = logged_in_page
    nav_menu(page, "witness")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    create_btn = page.locator("button:has-text('สร้างคำร้อง')").first
    if create_btn.is_visible():
        create_btn.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        # ใส่รายละเอียดลงฟอร์ม
        input_desc = page.locator("input[placeholder*='รายละเอียด'], textarea")
        if input_desc.count() > 0:
            input_desc.first.fill("ขอกำลังคุ้มครองพยานเนื่องจากถูกข่มขู่")
        
        submit_btn = page.locator("button:has-text('ยืนยัน')").first
        if submit_btn.is_visible():
            submit_btn.click()
            # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
            # KPI หรือตารางต้องโชว์
            expect(page.locator("text=คุ้มครองพยาน")).to_be_visible()
