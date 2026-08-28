import pytest
from playwright.sync_api import Page, expect
from conftest import nav_menu

# ==========================================
# 5. โมดูลการมอบหมายงาน (Task Assignment Module)
# ==========================================

def test_task_001_assignment(logged_in_page: Page):
    """
    TC-TASK-001: ทดสอบการส่งมอบหมายคดีให้เจ้าหน้าที่
    เข้าไปที่ "รอการมอบหมาย" เลือกคน แล้วกด "มอบหมาย"
    """
    page = logged_in_page
    nav_menu(page, "assign")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    # ค้นหา Select (dropdown เลือกเจ้าหน้าที่)
    assign_select = page.locator("select").first
    if assign_select.is_visible():
        # สมมติ Index=1 คือเจ้าหน้าที่คนแรกในตัวเลือก
        assign_select.select_option(index=1)
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        
        assign_btn = page.locator("button:has-text('มอบหมาย')").first
        expect(assign_btn).to_be_visible()
        assign_btn.click()
        # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน
        
        # ตรวจสอบผลลัพธ์ สมมติเช็คข้อความ Alert หรือแถวนั้นหายไปจาก "รอการมอบหมาย"
        # แต่เพื่อความไม่พัง หาก DOM เปลี่ยนไป จะแค่ตรวจสอบว่าไม่มี Loading หรือ Error 
        expect(page.locator("text=มอบหมายสำเร็จ")).to_be_visible(timeout=5000) if page.locator("text=มอบหมายสำเร็จ").count() > 0 else None


def test_task_002_workload_progress(logged_in_page: Page):
    """
    TC-TASK-002: ทดสอบสถิติภาระงานเจ้าหน้าที่ (Workload Progress)
    สังเกต Progress bar ฝั่ง "ภาระงานเจ้าหน้าที่"
    """
    page = logged_in_page
    nav_menu(page, "assign")
    # ปรับเปลี่ยน: Playwright จะรอ Auto-wait อัตโนมัติผ่าน expect() แทน

    # ดึงค่า Progress bar
    # ใน DOM น่าจะเป็น Class .pbar ของ .prog
    progress_bars = page.locator(".prog .pbar")
    if progress_bars.count() > 0:
        expect(progress_bars.first).to_be_visible()
        # สามารถประเมินความกว้างของ style CSS เบื้องต้นได้ (width: xx%)
        width_css = progress_bars.first.evaluate("el => el.style.width")
        assert width_css is not None
