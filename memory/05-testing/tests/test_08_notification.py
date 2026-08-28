import pytest
from playwright.sync_api import Page, expect

# ==========================================
# 10. โมดูลระบบแจ้งเตือน (Notification Module)
# ==========================================

def test_noti_001_realtime_alert(logged_in_page: Page):
    """
    TC-NOTI-001: ทดสอบการรับการแจ้งเตือนแบบเรียลไทม์ (Real-time Alert)
    """
    page = logged_in_page
    
    # อิงจาก DOM ทดสอบหาปุ่มกระดิ่งมุมบนขวา
    bell_icon = page.locator(".ib:has(.ndot)").first
    # หากไม่มีตัวแจ้งเตือนแดง ให้หาไอคอนกระดิ่งอย่างเดียว
    if not bell_icon.is_visible():
        bell_icon = page.locator(".ib:has(i.fa-bell)").first
        
    expect(bell_icon).to_be_visible()
    
    # คลิกที่กระดิ่ง
    bell_icon.click()
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    
    # ควรเปิด Dropdown แจ้งเตือน หรือเปลี่ยนไปหน้าแจ้งเตือน
    expect(page.locator("text=แจ้งเตือน, #notiDropdown")).to_be_visible()


def test_noti_002_navigation(logged_in_page: Page):
    """
    TC-NOTI-002: ทดสอบการคลิกเพื่อเปลี่ยนเส้นทาง (Notification Navigation)
    คลิกที่รายการแจ้งเตือนคดีใหม่ เพื่อพาไปหน้าคดี
    """
    page = logged_in_page

    bell_icon = page.locator(".ib:has(.ndot)").first
    if not bell_icon.is_visible():
        bell_icon = page.locator(".ib:has(i.fa-bell)").first
        
    if bell_icon.is_visible():
        bell_icon.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

        # สมมติคลิกที่ Item แรกในการแจ้งเตือน
        noti_item = page.locator(".noti-item, .dropdown-item:has-text('คดี')").first
        if noti_item.is_visible():
            noti_item.click()
            # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
            
            # คาดหวังว่าจะพามาลงเอยที่หน้า Case detail
            expect(page.locator("text=รายละเอียดสำนวนคดี, #caseDetail")).to_be_visible()
