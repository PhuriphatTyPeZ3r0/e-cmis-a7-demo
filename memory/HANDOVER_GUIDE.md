# คู่มือการส่งมอบงานระบบ E-CMIS (System Handover Guide)
**โครงการพัฒนาระบบ Electronic Case Management Intelligence System (E-CMIS)**
**ผู้รับมอบงาน:** ตูน (`GitHub: SLEEP S`)

---

## 1. บริบทและสถาปัตยกรรมของโครงการ (Project Context & Architecture)

ระบบ E-CMIS เป็นระบบศูนย์กลางในการรับเรื่องร้องเรียน จัดการสำนวนคดี ติดตามการไต่สวนข้อเท็จจริง และออกมติของ **สำนักงาน ป.ป.ท.**

### 1.1 แผนผังกิจกรรมหลักของระบบ (Activity Workflow Matrix)

| กิจกรรม (Activity) | ชื่อระบบงาน | รายละเอียดความรับผิดชอบและขอบเขตงาน |
| :--- | :--- | :--- |
| **Activity 4** | **ระบบรับเรื่องร้องเรียน** | ช่องทางประชาชน/หน่วยงานภายนอกยื่นเรื่อง, เจ้าหน้าที่ตรวจรับ (Staff Intake), ตรวจสอบความถูกต้องและส่งต่อสำนวน |
| **Activity 5** | **ระบบกระบวนงานกล่าวหา** | สืบสวนข้อเท็จจริง, บันทึกคำให้การ, รวบรวมพยานหลักฐาน, จัดทำรายงาน 213/644, การขอขยายระยะเวลาไต่สวน |
| **Activity 6** | **ระบบคุ้มครองพยาน** | บันทึกคำร้องขอความคุ้มครอง, ประเมินระดับภัยคุกคาม, จัดส่งเจ้าหน้าที่คุ้มครอง |
| **Activity 7** | **ระบบมติคณะกรรมการ ป.ป.ท.** | บรรจุวาระการประชุม, พิจารณาชี้มูลความผิด (ทางวินัย/อาญา), จัดทำรายงานมติและหนังสือแจ้งหน่วยงาน |
| **Activity 8** | **ระบบตรวจสอบประวัติบุคคล** | ตรวจสอบประวัติอาชญากรรมและวินัยข้าราชการ เชื่อมโยงฐานข้อมูลภายนอก |
| **Activity 9** | **ระบบหมายจับ** | ร้องขอและบันทึกหมายจับ, ประสานงานจับกุม, ติดตามสถานะหมายจับ |
| **Activity 10** | **ระบบกฎหมายในทางคดี** | การดำเนินคดีชั้นศาล, การอุทธรณ์/ฎีกา, จัดการคดีแพ่ง/คดีอาญา |
| **Activity 11** | **ระบบถ่ายโอนข้อมูล** | นำเข้าข้อมูลประวัติเก่าและถ่ายโอนระหว่างหน่วยงาน |
| **Activity 12** | **ระบบวิเคราะห์และรายงาน** | Dashboard สถิติคดี, Heatmap พื้นที่ทุจริต, รายงานตัวชี้วัดผู้บริหาร |
| **Activity 13** | **ระบบเชื่อมโยง API** | เชื่อมโยงกับ ป.ป.ช., DOPA, ศาล, ตำรวจ, และหน่วยงานรัฐภายนอก |
| **Activity 14** | **ระบบบริหารกลางและสนับสนุน** | จัดการผู้ใช้งาน, สิทธิ์การเข้าถึง (RBAC), Audit Log, Config ระบบ |

---

## 2. บทบาทและสิทธิ์ผู้ใช้งาน (Role Matrix)

1. **ประชาชน / ผู้ร้องเรียน (Citizen / Whistleblower):** ยื่นคำร้องผ่านเว็บ/โมบายล์, ติดตามสถานะคดีผ่าน Tracking Code
2. **เจ้าหน้าที่รับเรื่อง (Intake Staff):** ตรวจสอบเอกสารเบื้องต้น, คัดกรองเรื่องซ้ำ, ออกเลขรับเรื่อง
3. **เจ้าหน้าที่สืบสวน/ไต่สวน (Investigator / Officer):** บันทึกคำให้การ, รวบรวมพยานหลักฐาน, บันทึก Worklog, ทำเรื่องขอขยายเวลา
4. **ผู้อำนวยการกอง / ผู้บังคับบัญชา (Supervisor / Director):** ตรวจสอบและให้ความเห็นชอบรายงาน, มอบหมายผู้รับผิดชอบ
5. **คณะกรรมการ ป.ป.ท. (Board / Committee):** ตรวจสอบสำนวน, พิจารณาชี้มูล, ลงมติการประชุม
6. **ผู้ดูแลระบบ (System Admin):** จัดการ Role & Permission, ดูแลความปลอดภัย, ตรวจสอบ System Audit Log

---

## 3. คู่มือการติดตั้งและรัน Service (Developer Quickstart)

### 3.1 Agent Service (`04-agent-service`)
Service ที่พัฒนาด้วย TypeScript / Node.js สำหรับเชื่อมต่อ MCP Server และ Gemini API

```bash
# 1. เข้าสู่โฟลเดอร์ service
cd 04-agent-service

# 2. ติดตั้ง Dependencies
npm install

# 3. รันในโหมด Development
npm run dev

# 4. ทดสอบ MCP Client
npx ts-node testMcp.ts
```

### 3.2 End-to-End Test Suite (`05-testing`)
ชุดการทดสอบแบบอัตโนมัติด้วย Python, Playwright และ Pytest

```bash
# 1. เข้าสู่โฟลเดอร์ testing
cd 05-testing

# 2. สร้างและเปิดใช้งาน Virtual Environment
python -m venv .venv
# บน Windows PowerShell
.venv\Scripts\Activate.ps1

# 3. ติดตั้ง Playwright และ Pytest
pip install pytest playwright pytest-playwright
playwright install

# 4. รันการทดสอบทั้งหมด
pytest -v
```

### 3.3 เครื่องมือตรวจสอบและจับภาพหน้าจอ (`07-scripts-tools`)
- `screen-captures/`: เครื่องมือจับภาพหน้าจอระบบอัตโนมัติสำหรับจัดทำเล่มรายงาน
- `doc-inspectors/`: สคริปต์ Python สำหรับตรวจสอบตารางและ Format ของเอกสาร Word/PDF

---

## 4. Design System & Frontend Specifications

- **เอกสาร Design Tokens:** ดูที่ [02-designs/Design.md](02-designs/Design.md)
- **Primary Color:** Deep Navy (`#0D1B3E`), Navy Brand (`#1A2F6B`), Accent Gold (`#C9A84C`)
- **Typography:** Font `Sarabun` รองรับการแสดงผลภาษาไทยเป็นหลัก
- **UI Components:** ดู SVG Component Library ที่ [02-designs/components/Components UI  V 1.1.svg](02-designs/components/Components UI  V 1.1.svg)
- **Mockup Screens:** ดูหน้าจอตัวอย่างใน [02-designs/mockups/](02-designs/mockups/)

---

## 5. Backlog & งานที่ต้องดำเนินการต่อ (Pending Tasks & Next Steps)

- [ ] **Push ขึ้น GitHub:** สร้าง Remote Repository บน GitHub ของคุณตูน (`SLEEP S`) และ Push โค้ด `01_E-CMIS`
- [ ] **E2E Test Coverage:** ขยาย Test Case ใน `05-testing/tests` ให้ครอบคลุม Activity 7 (Board Resolution) และ Activity 10 (Legal Case)
- [ ] **API Client Integration:** อัปเดต `04-agent-service/src/apiClient.ts` ให้เชื่อมต่อกับ Production Endpoint จริงของ ป.ป.ท.
- [ ] **SDD Alignment:** ตรวจสอบความสอดคล้องระหว่าง Wireframe LAW001-LAW003 กับเอกสาร SDD งวด 2
