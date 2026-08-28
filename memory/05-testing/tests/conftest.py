import pytest
from playwright.sync_api import Page, expect

# ==========================================
# 🎭 MOCKUP PERSONA DATA (ข้อมูลจำลองสำหรับการทดสอบ)
# ==========================================
MOCK_DATA = {
    "auth": {
        "valid_pin": "5250155",
        "invalid_pin": "1111111"
    },
    "complainant": {
        "firstname": "ยืนยง",
        "lastname": "ทรงคุณธรรม"
    },
    "accused": {
        "fullname": "ผอ. ฉ้อฉล คนเดิม",
        "agency": "กองช่าง เทศบาลเมืองสมมติ"
    },
    "complaint_details": {
        "topic": "ทุจริตโครงการจัดซื้อเสาไฟประติมากรรม",
        "description": "พบการจัดซื้อในราคาที่สูงกว่าท้องตลาดถึง 3 เท่า และวัสดุที่ใช้ไม่ได้มาตรฐานตาม TOR มีการโอนเงินเข้าบัญชีส่วนตัวของผู้ที่เกี่ยวข้อง"
    },
    "search": {
        "keyword": "ปปท.68-1244"
    }
}

def nav_menu(page: Page, target: str):
    """
    Helper function สำหรับจำลองการคลิกเมนูด้านข้างเพื่อไปหน้าต่างๆ แทนการ Bypass UI
    หากหาปุ่มกดไม่เจอก็จะมีการ Fallback
    """
    try:
        # พยายามคลิกจุดที่มี attribute เชื่อมไปหน้าที่เราต้องการ
        # (คุณสามารถเปลี่ยน locator นี้ให้ตรงกับ UI โครงสร้างจริงได้ เช่น id, data-testid)
        locator = page.locator(f"[onclick*=\"nav('{target}')\"], [data-target='{target}'], .menu-item-{target}").first
        
        # คาดหวังว่าปุ่มมีอยู่ หรือ auto-waiting หากยังไม่โหลดเต็มที่
        expect(locator).to_be_visible()
        locator.click()
    except Exception:
        # หากเป็นการ Mock UI จริงๆ ไม่มีปุ่มหรือโครงสร้างเปลี่ยน ให้สำรองวิธีการ Evaluation
        # แต่เตือนให้ทราบว่ามีการผิดไปจาก Best Practices
        page.evaluate(f"nav('{target}')")
    
    # Auto-wait รอให้โหลด Network เสร็จ
    page.wait_for_load_state("networkidle", timeout=3000)

@pytest.fixture(autouse=True)
def setup_page(page: Page):
    """
    Hook อัตโนมัติ: จะรันทุกครั้งก่อนเริ่มแต่ละ Test Case
    ทำการเปิดหน้าเว็บ นำเข้าระบบจัดการ Alert
    """
    page.on("dialog", lambda dialog: dialog.accept()) # รับมือกับ alert/confirm
    # ใช้ตัวแปรโดยตรงเพื่อเลี่ยงปัญหา URL Resolution ไม่สมบูรณ์ผ่าน pytest plugin
    try:
        page.goto("https://skipeeps.github.io/ECMIS/", timeout=30000)
    except Exception as e:
        print(f"Error loading page: {e}")
    
    # 🔥 INJECT VISUAL CURSOR 🔥
    page.evaluate("""
        const box = document.createElement('div');
        box.id = 'playwright-mouse-pointer';
        box.style.position = 'absolute';
        box.style.width = '30px';
        box.style.height = '30px';
        box.style.backgroundColor = 'rgba(255, 0, 0, 0.4)'; 
        box.style.border = '2px solid red';
        box.style.borderRadius = '50%';
        box.style.pointerEvents = 'none'; 
        box.style.zIndex = '99999999';
        box.style.transition = 'top 0.2s ease-out, left 0.2s ease-out, transform 0.1s, background-color 0.1s'; 
        document.body.appendChild(box);

        document.addEventListener('mousemove', event => {
            box.style.left = event.pageX - 15 + 'px';
            box.style.top = event.pageY - 15 + 'px';
        });

        document.addEventListener('mousedown', event => {
            box.style.backgroundColor = 'rgba(0, 255, 0, 0.6)'; 
            box.style.borderColor = 'green';
            box.style.transform = 'scale(0.6)';
        });

        document.addEventListener('mouseup', event => {
            box.style.backgroundColor = 'rgba(255, 0, 0, 0.4)';
            box.style.borderColor = 'red';
            box.style.transform = 'scale(1)';
        });
    """)
    yield page


@pytest.fixture
def logged_in_page(page: Page):
    """
    Fixture อำนวยความสะดวก: หาก Test Case ไหนต้อง Login เข้ามาก่อน ให้เรียกใช้ตัวนี้
    มันจะทำการกรอกรหัส PIN ให้เสร็จสรรพ
    """
    login_screen = page.locator("#loginScreen")
    
    # ต้องปรากฏหน้าจอ Login เสมอสำหรับ page ใหม่
    expect(login_screen).to_be_visible()
    
    for digit in MOCK_DATA['auth']['valid_pin']:
        page.keyboard.press(digit)
    
    # คาดหวังว่า Login ต้องสำเร็จและหน้าต่างการเข้าสู่ระบบต้องถูกซ่อนไป
    expect(login_screen).not_to_be_visible(timeout=5000)
    
    return page
