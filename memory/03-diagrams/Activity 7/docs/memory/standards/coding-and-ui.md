# 📐 มาตรฐานการพัฒนาโค้ดและ UI (Coding & UI Standards)

## 🎨 Design System & Fonts
- **Primary Color Palette:**
  - Navy Primary: `#0F2A62` (Header / Action / Brand)
  - Gold Accent: `#D0A830` / Hover `#B89224` (CTA / Signature Buttons)
  - Line / Border: `#E2E8F0` / `#CBD5E1`
  - Slate Background: `#F8FAFC`
- **Typography:**
  - `THSarabunIT9` / `Sarabun`: สำหรับหนังสือราชการและเอกสารทางกฎหมาย
  - `Prompt` / `Noto Sans Thai`: สำหรับระบบ UI, ตาราง, และ Dashboard
- **Accessibility & Modes:**
  - Light Mode (`body`)
  - Dark Mode (`body.dark-mode`)
  - High Contrast Mode (`body.high-contrast`)
  - Adjustable Font Steps (`changeFont(-1/0/+1)`)

---

## 💻 Code Architecture & Process Rules
- ทุกหน้าจอต้องเรียก `ECMIS.renderShell('<filename>')`
- ใช้ `ECMIS.homeHref(roleId)` สำหรับการย้ายหน้าไปยัง Work Inbox ประจำตำแหน่ง
- ใช้ `ECMIS.pageForCaseByStatus(kase)` สำหรับการคำนวณหน้าจอปลายทางอัตโนมัติตามสถานะสำนวน
- หลีกเลี่ยงการ Hardcode หมายเลขไฟล์ลำดับเก่า

---

## 🚫 ข้อห้ามเด็ดขาดและมาตรฐาน UI (Mandatory Directives)
1. **ห้ามใช้เลขไทยใน UI ทั้งหมด (Zero Thai Numerals in UI):**
   - **ห้าม** ใช้เลขไทย (๑, ๒, ๓, ๔, ๕, ๖, ๗, ๘, ๙, ๐) ในส่วนติดต่อผู้ใช้ทุกจุด เช่น Dropdown, Filter Select, Badge, KPI Cards, Status Label, หัวตาราง, ตาราง, ข้อความแจ้งเตือน, และปุ่มกด
   - **ต้องใช้เลขอารบิกเสมอ** เช่น 1, 2, 3, 4, 5, 6, 7.1, 7.2, 7.3, ม.24, ม.28, ปปท. 5-02, ปปท. 7-02
   - *(ข้อยกเว้นเพียงจุดเดียว: เนื้อหาข้อความภายในเอกสารหนังสือราชการทางการที่เป็นแบบฟอร์มกระดาษ A4 ตามระเบียบสำนักนายกฯ เท่านั้น)*
2. **การไหลของงานหลังบันทึกมติ (Post-Resolution Flow):**
   - เมื่อกลุ่มงานคำวินิจฉัยและมติคณะกรรมการ (`board_sec`) บันทึกมติเสร็จสิ้น (`RESOLVED` / `RESOLVED_PENDING_72`):
   - สำนวนที่มีมติแล้วจะ**ต้องไหลส่งต่อไปยังกลุ่มงานกิจการคณะกรรมการ (`affairs`)** เพื่อดำเนินการจัดทำเอกสารและกระบวนงานต่อเนื่อง:
     - สายไต่สวนเบื้องต้น (7.1) ที่รับไว้ไต่สวน (เช่น สำนวน `1189/2569`) → ไหลไป `affairs` เพื่อจัดทำคำสั่งแต่งตั้งคณะอนุฯ/พนักงานไต่สวน ม.24 (`order.html`)
     - สายวินิจฉัยชี้มูล (7.2) ที่มีมติชี้มูล (เช่น สำนวน `1119/2565`) → ไหลไป `affairs` เพื่อจัดทำรายงานวินิจฉัยชี้มูล ปปท. 7-02 (`ruling-report.html`) และส่งดำเนินคดี
3. **ห้ามใส่ Context ตัวเลขนำหน้าหรือคำกำกับในวงเล็บในสถานะ (Clean Text Directive):**
   - ในการแสดงผลสถานะมติ (Resolution Stages), ตัวกรอง (Filter Select), Badges, และ KPI Cards **ห้ามใส่ตัวเลขนำหน้า** (เช่น 1., 2., 3...) และ**ห้ามใส่ข้อความกำกับในวงเล็บ** (เช่น (Stage 1), (ม.24), (กรณีชี้มูล), (7.1, 7.2, 7.3))
   - ให้ใช้ชื่อข้อความแท้แบบเดิม (Pure Clean Text) เสมอ เช่น:
     - `ทั้งหมด`
     - `อยู่ระหว่างการจัดทำมติ`
     - `จัดทำมติแล้วเสร็จ`
     - `ส่งสำเนามติเพื่อจัดทำคำสั่ง`
     - `ส่งมติและเอกสารที่เกี่ยวข้องเพื่อทำความเห็นชี้มูล`
     - `ส่งมติและเอกสารที่เกี่ยวข้องคืนเจ้าของสำนวน/ผู้รับผิดชอบ`
     - `จัดทำรายงานประชุมแล้วเสร็จ`
     - และประเภทเรื่อง: `ไต่สวนเบื้องต้น`, `วินิจฉัยชี้มูล`, `เรื่องทั่วไป`
4. **ห้ามแสดงกล่อง Rule Panel / Quorum Box สรุปเกณฑ์องค์ประชุมบนหน้าจอ (Clean Board Form Directive):**
   - **ห้าม** แสดงกล่อง `<div class="rule-panel" id="quorumBox">` (การ์ดสรุป ม.12, ม.15, ม.16) ใต้ตารางกรรมการบนหน้าบันทึกมติ (`resolution.html`, `resolution-72.html`)
   - ระบบจะตรวจความถูกต้องขององค์ประชุมและเกณฑ์เสียงข้างมาก (Validation) อยู่เบื้องหลัง และแจ้งเตือนผ่าน Dialog เมื่อกดปุ่ม 'บันทึกมติและล็อก PDF' เท่านั้น
5. **มาตรฐานแถบเครื่องมือเอกสาร (Unified Document Toolbar Directive - `.ws-doc-toolbar`):**
   - ในทุกหน้าจอที่มีแผงเอกสาร (`.ws-doc-pane`) ต้องจัดวางปุ่มแถบเครื่องมือให้เป็นรูปแบบเดียวกันทั้งหมด 100%:
     - **ฝั่งซ้าย:** ชื่อเอกสาร + ไอคอน + ป้าย Mail-Merge หรือ แถบสลับเอกสาร (`#docTabs`)
     - **ฝั่งขวา (เรียงลำดับเดียวกันเสมอ):**
       1. (ปุ่มแก้ไขเอกสาร `#btnDocEdit` หากหน้านั้นมีระบบแก้เอกสารในตัว)
       2. ปุ่มพิมพ์: `<button class="btn btn-sm btn-light" onclick="window.print()" title="พิมพ์เฉพาะเอกสาร Preview"><i class="fa-solid fa-print"></i></button>`
       3. ปุ่มดาวน์โหลด Word: `<button class="btn btn-sm btn-light" id="btnDocx" title="ดาวน์โหลด .docx"><i class="fa-solid fa-download me-1"></i>.docx</button>`
       4. ปุ่มย่อแผงเอกสาร: `<button type="button" class="ws-doc-pane-toggle" id="btnPaneCollapse" title="ย่อแผงเอกสาร"><i class="fa-solid fa-angles-right"></i></button>`