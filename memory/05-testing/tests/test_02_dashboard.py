import pytest
from playwright.sync_api import Page, expect
from conftest import nav_menu

# ==========================================
# 2. โมดูลหน้าหลัก (Dashboard Module)
# ==========================================

def test_dash_001_kpi_charts(logged_in_page: Page):
    """
    TC-DASH-001: ทดสอบการแสดงผลข้อมูลสถิติภาพรวม (KPIs & Charts)
    """
    page = logged_in_page
    
    # นำทางไปที่ Dashboard ด้วยปุ่มเมนู
    dash_menu = page.locator(".menu-item-dashboard, [onclick*=\"nav('dashboard')\"], button:has-text('Dashboard')").first
    if dash_menu.is_visible():
        dash_menu.click()
    else:
        page.evaluate("nav('dashboard')")
    
    # ตรวจสอบว่ามี KPI cards 
    kpi_cards = page.locator(".kpi")
    expect(kpi_cards.first).to_be_visible(timeout=5000)
    
    # Hover เพื่อทดสอบ Interaction ของ KPI
    kpi_cards.first.hover()
    
    # กราฟน่าจะใช้ canvas อ้างอิงจาก Chart.js 
    charts = page.locator("canvas")
    if charts.count() > 0:
        expect(charts.first).to_be_visible()


def test_dash_002_quick_actions(logged_in_page: Page):
    """
    TC-DASH-002: ทดสอบการใช้งานเมนูด่วน (Quick Actions)
    คลิกปุ่ม 'รับเรื่องใหม่', 'สำนวนคดี'
    """
    page = logged_in_page
    
    nav_menu(page, "dashboard")

    # ทดสอบคลิกปุ่ม 'สำนวนคดี' (สมมติหาด้วยคำว่า "สำนวนคดี")
    quick_btn = page.locator("button:has-text('สำนวนคดี')").first
    
    # ถ้าไม่มีแบบ button อาจจะเป็นโครงสร้าง .kpi 
    if not quick_btn.is_visible():
        quick_btn = page.locator(".kpi:has-text('สำนวนคดี')").first

    expect(quick_btn).to_be_visible()
    quick_btn.click()
    
    # ควรเปลี่ยนหน้าไปยังหน้าค้นหา/รายการเคสคดี (ID #cases หรือ #page-cases เป็นต้น)
    # สมมติเช็คจากแถบค้นหา หรือ Table cases 
    search_box = page.locator(".tb-search input, #searchBox").first
    expect(search_box).to_be_visible(timeout=5000)
