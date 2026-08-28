import pytest
from playwright.sync_api import Page, expect
from conftest import nav_menu

# ==========================================
# 8. โมดูลระบบวิเคราะห์ข้อมูล (AI Analytics Module)
# 9. โมดูลการตั้งค่าระบบ (Settings Module)
# ==========================================

def test_ai_001_forecast_risk_score(logged_in_page: Page):
    """
    TC-AI-001: ทดสอบการแสดงผลการพยากรณ์ และ ความเสี่ยง (Risk Score)
    """
    page = logged_in_page
    nav_menu(page, "analytics")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน # รอโหลดข้อมูล

    # เช็ค Risk Score ว่าเรนเดอร์มาหรือไม่
    risk_cards = page.locator(".kpi-r, .sb-r") 
    if risk_cards.count() > 0:
        expect(risk_cards.first).to_be_visible()
    
    expect(page.locator("canvas").first).to_be_visible()


def test_ai_002_update_analysis(logged_in_page: Page):
    """
    TC-AI-002: ทดสอบการอัปเดตข้อมูลวิเคราะห์
    """
    page = logged_in_page
    nav_menu(page, "analytics")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    update_btn = page.locator("button:has-text('อัปเดตการวิเคราะห์'), button:has-text('อัปเดต')").first
    if update_btn.is_visible():
        update_btn.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        # ตรวจสอบหลังดึงข้อมูล (สมมติหา indicator ว่าโหลดเสร็จ)
        expect(page.locator("canvas").first).to_be_visible()


def test_set_001_menu_switching(logged_in_page: Page):
    """
    TC-SET-001: ทดสอบการสลับแท็บการตั้งค่า (Menu Switching)
    """
    page = logged_in_page
    nav_menu(page, "settings")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    # เมนูการตั้งค่าย่อย (สมมติว่าคลาส .settings-menu หรือปุ่มต่างๆ)
    menu_tabs = page.locator(".st, .sidebar-link, li:has-text('ผู้ใช้งาน')")
    if menu_tabs.count() > 0:
        menu_tabs.first.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        # หน้าจอฝั่ง Right Content จะต้องเปลี่ยนตาม
        expect(page.locator("text=ตั้งค่า")).to_be_visible()
