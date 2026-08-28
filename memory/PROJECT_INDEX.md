# สารบัญและพิกัดเอกสารโครงการ E-CMIS (Project Document Index)
เอกสารฉบับนี้จัดทำขึ้นเพื่อใช้เป็นสารบัญอ้างอิงตำแหน่งไฟล์เอกสารทางการทั้งหมดของโครงการ สำนักงาน ป.ป.ท. E-CMIS

---

## 📑 1. เอกสารส่งมอบและกระบวนงานหลัก (Core Deliverables)

| หมวดหมู่ | ชื่อเอกสาร / ไฟล์อ้างอิง | ตำแหน่งที่อยู่ (Relative Path) | สถานะความถูกต้อง |
| :--- | :--- | :--- | :--- |
| **เล่มหลัก AS-IS / TO-BE** | `01_เล่มหลัก_E-CMIS_AS-IS_TO-BE_V1_8_8.pdf` | `01-docs/as-is-to-be/` | **Authoritative (สมบูรณ์ล่าสุด)** |
| **Business Process TO-BE** | `เอกสารการวิเคราะห์กระบวนงาน AS-IS  TO-BE (Business Process).pdf` | `01-docs/as-is-to-be/to-be version/` | ล่าสุด |
| **SRS (System Requirement)** | `SRS ECMIS Ver.1.0.docx` | `01-docs/minutes-meetings/1. SRS (1 เล่ม)/` | ใช้งานอ้างอิง |
| **SDD (System Detail Design)**| `SDD PM Service Ver.1.0.docx` | `01-docs/minutes-meetings/2. SDD (1 เล่ม)/` | ใช้งานอ้างอิง |
| **Developer Guide** | `ECMIS_Developer_Guide.pdf` | `01-docs/developer-guide/` | คู่มือมาตรฐาน |
| **User Manuals** | `User Manual ADM / Dashboard / IC / NOC Ver.1.0` | `01-docs/minutes-meetings/5. User Manual (6 เล่ม)/` | คู่มือผู้ใช้งาน |

---

## 📂 2. เอกสารส่งมอบตามงวดงาน (Milestone Deliverables)

### งวดที่ 1: การวิเคราะห์ความต้องการและกระบวนงาน AS-IS
- **โฟลเดอร์:** `01-docs/as-is-to-be/template-งวด-1/`
- **เอกสารแยกตามกิจกรรม (13 เล่ม):**
  - กจ.4: `02_กจ4_ระบบรับเรื่องร้องเรียน_E-CMIS.docx`
  - กจ.5: `03_กจ5_ระบบกระบวนการดำเนินงานกล่าวห_E-CMIS.docx`
  - กจ.6: `04_กจ6_ระบบคุ้มครองพยาน_E-CMIS.docx`
  - กจ.7: `05_กจ7_ระบบมติคณะกรรมการ_ป.ป.ท._E-CMIS.docx`
  - กจ.8: `06_กจ8_ระบบตรวจสอบประวัติบุคคล_E-CMIS.docx`
  - กจ.9: `07_กจ9_ระบบหมายจับ_E-CMIS.docx`
  - กจ.10: `08_กจ10_ระบบกฎหมายในทางคดี_E-CMIS.docx`
  - กจ.11: `09_กจ11_นำเข้าข้อมูลและถ่ายโอนข้อมูล_E-CMIS.docx`
  - กจ.12: `10_กจ12_ระบบวิเคราะห์และรายงานผล_E-CMIS.docx`
  - กจ.13: `11_กจ13_ระบบเชื่อมโยงข้อมูล_API_E-CMIS.docx`
  - กจ.14: `12_กจ14_ระบบบริหารกลางและสนับสนุน_E-CMIS.docx`
  - ความต้องการผู้มีส่วนได้ส่วนเสีย: `14_ความต้องการผู้มีส่วนได้ส่วนเสีย_E-CMIS.docx`

### งวดที่ 2: การออกแบบระบบและหน้าจอติดต่อผู้ใช้งาน
- **โฟลเดอร์:** `01-docs/deliverable-milestones/งวด 2/`
- **เอกสารประกอบ:**
  - สถาปัตยกรรมระบบ: `เอกสารการออกแบบโครงสร้างของระบบงาน_E-CMIS_V1.docx`
  - ภาพรวมการออกแบบ: `เอกสารภาพออกแบบระบบ_E-CMIS_V1_2.docx`
  - UI Design: `เล่ม 3 - 2.1.3 ออกแบบส่วนการติดต่อกับผู้ใช้งาน (User Interface Design) - 20260807.docx`
- **ใบปะหน้าและเอกสารตรวจรับ:** `01-docs/deliverable-milestones/ใบปะหน้า/`

---

## 🎨 3. งานออกแบบและ Design Tokens

| รายการ | รายละเอียด | ตำแหน่งที่อยู่ |
| :--- | :--- | :--- |
| **Design System & Tokens** | เอกสาร CSS Variables, Color Tokens, Components UI | `02-designs/Design.md` |
| **UI Components SVG** | รวม Vector Components สำหรับ Web App | `02-designs/components/Components UI  V 1.1.svg` |
| **Wireframe Specifications**| รายละเอียดหน้าจอ LAW001 ถึง LAW003 (งานกฎหมาย) | `02-designs/wireframes/UI-Wireframe-Design_LAW001-LAW003.md` |
| **HTML/JS Prototypes** | หน้าเว็บจำลองสำหรับทดสอบ Workflow | `02-designs/mockups/` |

---

## 🔄 4. แผนผังกระบวนงาน (Activity Workflows & Diagrams)

- **Activity 4 (รับเรื่องร้องเรียน):** `03-diagrams/Activity 4/`
- **Activity 5 (ดำเนินงานเรื่องกล่าวหา):** `03-diagrams/Activity 5/`
- **Activity 6 (คุ้มครองพยาน):** `03-diagrams/Activity 6/`
- **Activity 7 (มติคณะกรรมการ ป.ป.ท.):** `03-diagrams/Activity 7/`
- **Activity 8 (ตรวจสอบประวัติบุคคล):** `03-diagrams/Activity 8/`
- **Activity 9 (ระบบหมายจับ):** `03-diagrams/Activity 9/`
- **Activity 10 (กฎหมายในทางคดี):** `03-diagrams/Activity 10/`
- **Activity 12 (วิเคราะห์และรายงานผล):** `03-diagrams/Activity 12/`
- **Activity 14 (บริหารกลางและสนับสนุน):** `03-diagrams/Activity 14/`
- **Gap Analysis & Compliance Check:** `03-diagrams/gap-analysis/`
