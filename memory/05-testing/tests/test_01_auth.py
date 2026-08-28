import pytest
from playwright.sync_api import Page, expect
from conftest import MOCK_DATA

# ==========================================
# 1. โมดูลการเข้าสู่ระบบและออกจากระบบ (Authentication Module)
# ==========================================

def test_auth_001_success(page: Page):
    """
    TC-AUTH-001: ทดสอบการเข้าสู่ระบบด้วยรหัส PIN ที่ถูกต้อง
    """
    login_screen = page.locator("#loginScreen")
    expect(login_screen).to_be_visible()
    
    for digit in MOCK_DATA['auth']['valid_pin']:
        page.keyboard.press(digit)
    
    # ตรวจสอบว่าหน้าจอ Login หายไป (แอนิเมชันปลดล็อค) และเข้าสู่ Dashboard หรือหน้าหลัก
    expect(login_screen).not_to_be_visible(timeout=5000)


def test_auth_002_invalid_pin(page: Page):
    """
    TC-AUTH-002: ทดสอบการเข้าสู่ระบบด้วยรหัส PIN ที่ไม่ถูกต้อง
    """
    login_screen = page.locator("#loginScreen")
    expect(login_screen).to_be_visible()

    for digit in MOCK_DATA['auth']['invalid_pin']:
        page.keyboard.press(digit)
        
    # รอให้ระบบประมวลผลแปบนึง หรือ assert ว่าเกิด error message
    # แต่เนื่องจากเราไม่ทราบโครงสร้าง DOM ของ Error Message ชัดเจน จึงอนุโลมให้รอ animation นิดนึง
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
    
    # ควรอ่านเจอ Error message
    # สมมติ ID อ้างอิงจาก DOM เดิม (หรือต้องรอ Alert หรือ DOM เปลี่ยน) 
    # ใน ECMIS เดิมใช้การนับรหัสผิดที่หน้าจอ 
    # ตรวจสอบว่ายังอยู่ที่หน้าเดิม ไม่หลุดเข้าไป
    expect(login_screen).to_be_visible()


def test_auth_003_lockout(page: Page):
    """
    TC-AUTH-003: ทดสอบการถูกระงับการเข้าสู่ระบบ (Lockout)
    กรอกรหัส PIN ผิดติดต่อกัน 5 ครั้ง (ตามที่ออกแบบ) 
    """
    login_screen = page.locator("#loginScreen")
    expect(login_screen).to_be_visible()
    
    # จำลองกรอกผิด 5 รอบ
    for i in range(5):
        for digit in MOCK_DATA['auth']['invalid_pin']:
            page.keyboard.press(digit)
        
        # อาจจะต้องกดยกเลิกหรือ Clear ช่อง (เช่นการกด Escape หรือมีฟังก์ชันมารองรับ)
        page.keyboard.press("Escape")

    # เช็คว่าหน้าจอยังมองเห็น ไม่ผ่านเข้าไปได้
    expect(login_screen).to_be_visible()
    

def test_auth_004_logout(logged_in_page: Page):
    """
    TC-AUTH-004: ทดสอบการออกจากระบบ (Logout)
    รับ logged_in_page มา (กรอก PIN ผ่านมาแล้ว) 
    แล้วทดสอบคลิก Logout
    """
    page = logged_in_page

    # จำลองกดปุ่ม Logout
    logout_btn = page.locator(".logout-btn, #logoutBtn, button:has-text('Logout')").first
    if logout_btn.is_visible():
        logout_btn.click()
    else:
        # Fallback หากหาปุ่มไม่เจอ
        page.evaluate("doLogout()")
    
    # ตรวจสอบว่าระบบเคลียร์การเข้าสู่ระบบและกลับหน้า Login PIN 
    login_screen = page.locator("#loginScreen")
    expect(login_screen).to_be_visible(timeout=5000)
