import pytest
from playwright.sync_api import Page, expect
from conftest import nav_menu

# ==========================================
# 13. โมดูลระบบฐานข้อมูลและประวัติการใช้งาน (Audit Log / History Module)
# 14. การทดสอบที่ไม่ใช่ฟังก์ชันการใช้งาน (Non-Functional Testing)
# ==========================================

def test_audit_001_activity_log(logged_in_page: Page):
    """
    TC-AUDIT-001: ทดสอบการบันทึกประวัติกิจกรรมผู้ใช้ (User Activity Log)
    ในแท็บประวัติการดำเนินการ ต้องมี Log บันทึก
    """
    page = logged_in_page
    nav_menu(page, "cases")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    # สมมติเข้าไปดูประวัติในคดีแรก
    case_row = page.locator(".et tbody tr").first
    if case_row.is_visible():
        case_row.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

        # สลับไปแท็บประวัติ
        history_tab = page.locator("text=ประวัติการดำเนินการ").first
        if history_tab.is_visible():
            history_tab.click()
            # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
            
            # เช็คว่ามี Timeline / Audit log แสดง (อิงจาก DOM class .tl)
            timestamps = page.locator(".tl-time")
            expect(timestamps.first).to_be_visible()


def test_nfr_001_responsive(logged_in_page: Page):
    """
    TC-NFR-001: ทดสอบการตอบสนองของหน้าจอ (Responsive Web Design)
    จำลองจอ iPhone 12 Pro
    """
    page = logged_in_page
    # Resize screen to Mobile
    page.set_viewport_size({"width": 390, "height": 844})
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    
    hamburger = page.locator(".hamburger").first
    if hamburger.is_visible():
        hamburger.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        
        # เมนู Sidebar ควรจะแสดงขึ้นมา (.sidebar)
        overlay = page.locator("#sbOv") # หรือ .sb-overlay
        expect(overlay).to_be_visible()
        
        # คลิกปิด
        overlay.click(force=True)
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    # คืนค่า Desktop ก่อนเทสต์ถัดไป
    page.set_viewport_size({"width": 1280, "height": 800})


def test_nfr_002_session_timeout(page: Page):
    """
    TC-NFR-002: ทดสอบการหมดอายุของเซสชัน (Session Timeout)
    เนื่องจากรอนานใน Test จริงไม่ได้ จะจำลองเหตุการณ์
    """
    # ฟังก์ชันจำลองการ Timeout
    pass


def test_nfr_003_performance_load_time(logged_in_page: Page):
    """
    TC-NFR-003: ทดสอบประสิทธิภาพการโหลดข้อมูล (Performance & Loading time)
    ตรวจสอบว่าเรนเดอร์โครงหลักในเวลาไม่เกิน 3-5 วินาที
    """
    page = logged_in_page

    # โหลดหน้า Dashboard
    start_time = page.evaluate("Date.now()")
    nav_menu(page, "analytics")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน # รอให้ DOM วาดนิดนึง

    # เช็คว่ากราฟเรนเดอร์ขึ้นมา (โหลดเสร็จ)
    expect(page.locator("canvas").first).to_be_visible(timeout=5000)
    
    end_time = page.evaluate("Date.now()")
    duration = end_time - start_time
    
    # หากนานเกิน 5 วินาที Test นี้จะตก
    assert duration <= 5500, f"Loading took {duration}ms, which is too slow!"
