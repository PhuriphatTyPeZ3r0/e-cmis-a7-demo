# Skill.md

## ชื่อทักษะ
ECMIS Code-to-Figma SVG Skill

## วัตถุประสงค์
ทักษะนี้ใช้สำหรับให้ AI ศึกษาโค้ดของหน้าเว็บในโปรเจกต์ แล้วแปลงออกมาเป็นไฟล์ `.svg` ที่สามารถนำเข้า Figma ได้ และสามารถแก้ไขได้ทุกส่วน โดยไม่จำเป็นต้องมี screenshot จากผู้ใช้เสมอไป

ทักษะนี้ถูกถอดมาจากรูปแบบการทำงานจริงใน session นี้ ตั้งแต่คำสั่ง:
- “ให้คุณศึกษาหน้า /register โดยละเอียด และทำการแปลงเป็นไฟล์ .svg ...”
จนถึง
- “ให้ทำหน้าลืมรหัสผ่าน /login จะอยู่หลังจากกด ลืมรหัสผ่าน?”

เอกสารนี้ตั้งใจให้ใช้เป็นมาตรฐานการทำงานร่วมกันในทีม และสามารถนำไปใช้กับ AI ตัวอื่นได้ ไม่จำกัดเฉพาะโมเดลใดโมเดลหนึ่ง

---

## 1) Use Case ของ Skill นี้
เหมาะสำหรับงานลักษณะต่อไปนี้

1. แปลงหน้าเว็บจาก code เป็นไฟล์ SVG สำหรับ Figma
2. สร้างทั้ง
   - Prototype version
   - Wireframe version
3. สร้างหลาย state ของหน้าเดียวกัน เช่น
   - Step 1 / Step 2 / Step 3
   - After submit / success / pending / status tracking
   - ก่อนกด / หลังกดปุ่ม
4. ทำ UI ที่อ้างอิงจาก route จริงในระบบ เช่น
   - `/register`
   - `/register/status?id=REG-00000086`
   - `/forgot-password`
5. ใช้กับโปรเจกต์ที่มี source code จริง เช่น Razor, React, Next.js, Vue, Angular ฯลฯ

---

## 2) ขอบเขตที่ถอดได้จาก session นี้
ใน session นี้ รูปแบบงานที่เกิดขึ้นจริงประกอบด้วย:

1. อ่าน code จาก zip project
2. หา route/page ที่เกี่ยวข้อง
3. อ่านหน้า page หลัก + CSS ที่เกี่ยวข้อง + component ย่อยที่มีผลกับ layout
4. ทำความเข้าใจ state ของหน้า
5. วาดใหม่เป็น SVG แบบ editable
6. ทำ 2 เวอร์ชันเสมอ
   - Prototype
   - Wireframe
7. ตรวจงานก่อนส่ง
8. ส่งเฉพาะ `.svg` ให้ผู้ใช้ ไม่ส่ง `.png`

---

## 3) สิ่งที่ AI ต้องรับจากผู้ใช้
อย่างน้อยควรมีข้อมูลต่อไปนี้

### 3.1 Input ที่จำเป็น
- source code ของโปรเจกต์ หรือไฟล์ของหน้าที่ต้องการศึกษา
- route หรือ path ของหน้าที่ต้องการ เช่น `/register`
- state ที่ต้องการ เช่น
  - Step ไหน
  - หลังกดปุ่มอะไร
  - ค่า query string อะไร
  - สถานะใด เช่น approved / pending / rejected

### 3.2 Input ที่ควรถามหรือสรุปให้ชัด
- ต้องการ Prototype อย่างเดียว หรือ Prototype + Wireframe
- ขนาด artboard ที่ต้องการ
- naming convention ของไฟล์
- ต้องการยึด design จาก code เพียว ๆ หรือมี screenshot reference เพิ่มเติม

### 3.3 กติกาที่ผู้ใช้กำหนดใน session นี้
ผู้ใช้ได้กำหนดกติกาเพิ่มเติมชัดเจนว่า:

1. ความกว้างของงาน = `1440 px`
2. ความสูง = ตามขนาดจริงของ content
3. ถ้าความสูงจริงไม่เกิน `900 px` ให้ใช้ `900 px`
4. ทุกครั้งต้องทำ `2 ไฟล์`
   - `prototype`
   - `wireframe`
5. ไม่ต้องส่ง `.png`
6. ต้องเป็น SVG ที่ import เข้า Figma ได้ และแก้ไขได้ทุกส่วน

กติกานี้ถือเป็น “working standard” ของทีมสำหรับงานประเภทนี้ ถ้าไม่ได้มี requirement ใหม่เข้ามาให้ override

---

## 4) มาตรฐานผลลัพธ์ (Output Contract)
AI ต้องส่งมอบงานตามเงื่อนไขต่อไปนี้

### 4.1 ประเภทไฟล์
- ส่งออกเป็น `.svg`
- ต้องเป็น vector จริง ไม่ใช่เอารูป screenshot ไปฝังใน SVG
- ไม่ควรมี `<image>` raster ฝังอยู่ในไฟล์

### 4.2 การแก้ไขใน Figma
ไฟล์ต้องมีคุณสมบัติดังนี้
- เปิดใน Figma ได้
- แก้ไขได้ทุกส่วน เช่น
  - ข้อความ
  - ปุ่ม
  - input
  - card
  - background
  - icon แบบ vector
  - เส้น divider / status / timeline
- ไม่ล็อกเป็นภาพเดียวทั้งหมด

### 4.3 จำนวนไฟล์
ต่อ 1 หน้าหรือ 1 state ต้องมี 2 ไฟล์เสมอ
- `prototype`
- `wireframe`

### 4.4 Naming Convention
รูปแบบที่ใช้ใน session นี้สรุปได้ดังนี้

- `ecmis_register_prototype_1440.svg`
- `ecmis_register_wireframe_1440.svg`
- `ecmis_register_step2_prototype_1440.svg`
- `ecmis_register_step2_wireframe_1440.svg`
- `ecmis_register_step3_prototype_1440.svg`
- `ecmis_register_step3_wireframe_1440.svg`
- `ecmis_register_step4_prototype_1440.svg`
- `ecmis_register_step4_wireframe_1440.svg`
- `ecmis_register_status_prototype_1440.svg`
- `ecmis_register_status_wireframe_1440.svg`
- `ecmis_forgot_password_prototype_1440.svg`
- `ecmis_forgot_password_wireframe_1440.svg`

ดังนั้น naming format ที่ควรใช้คือ:

`{project_or_module}_{page_or_state}_{prototype|wireframe}_{width}.svg`

เช่น
- `ecmis_login_prototype_1440.svg`
- `ecmis_login_wireframe_1440.svg`
- `ecmis_register_step3_prototype_1440.svg`

---

## 5) Workflow มาตรฐานที่ถอดได้จาก session นี้

## Step A — รับและแตก source code
1. รับไฟล์ zip หรือ source ที่ผู้ใช้อัปโหลด
2. แตกไฟล์โปรเจกต์
3. ตรวจโครงสร้างไฟล์
4. หา route/page ที่เกี่ยวข้องกับคำสั่ง

ตัวอย่างจาก session:
- แตก `ecmis-web.zip`
- หาไฟล์ของ `/register`
- พบหน้าใน `src/Pages/Public/Register.razor`
- หา CSS ที่เกี่ยวข้องใน `src/wwwroot/css/ecmis-public.css`
- หา component ย่อย เช่น `TimelineStep.razor`

> หลักการสำคัญ: ต้องดูทั้ง page file และ style/context ที่เกี่ยวข้อง ไม่ใช่ดูแค่ markup อย่างเดียว

---

## Step B — วิเคราะห์ state ของหน้าที่ต้องการ
AI ต้องแปลคำสั่งภาษาธรรมชาติของผู้ใช้ให้เป็น “state ของหน้าจริง”

### ตัวอย่าง mapping จาก session
1. “หน้า `/register`”
   - ตีความเป็นหน้า register state หลัก
   - แล้วผู้ใช้ค่อยระบุ state ย่อย เช่น Step 2, Step 3

2. “หน้า `/register` แต่จะอยู่ Step 2 สังกัดที่ปฏิบัติงาน”
   - ตีความเป็น register flow ที่ active step = 2

3. “หน้า `/register` แต่จะอยู่ Step 3 ยืนยันข้อมูล”
   - active step = 3
   - ต้องแสดงข้อมูลยืนยันก่อน submit

4. “หลัง Step 3 ยืนยันข้อมูล กดปุ่มยืนยัน คำขอลงทะเบียนถูกส่งแล้ว”
   - เป็น success/submitted state หลัง submit สำเร็จ
   - ไม่ใช่หน้าฟอร์มเดิม

5. “`register/status?id=REG-00000086`”
   - เป็นหน้า status tracking
   - query id ต้องถูกสะท้อนบนหน้าจอ
   - state ใน session นี้ตีความเป็น `pending`

6. “หน้าลืมรหัสผ่าน /login จะอยู่หลังจากกด ลืมรหัสผ่าน?”
   - ตีความเป็นหน้า `/forgot-password`
   - state เริ่มต้นก่อน submit

> หลักการสำคัญ: ผู้ใช้มักอธิบายผ่าน “flow การใช้งาน” ไม่ได้บอกชื่อ component ตรง ๆ AI ต้อง map ให้ได้ว่าเป็น state ไหน

---

## Step C — อ่าน code และ style ให้ครบ
AI ต้องอ่านอย่างน้อย 3 ชั้น

### 1. Page component
เช่น
- `Register.razor`
- `RegisterStatus.razor`
- `ForgotPassword.razor`

### 2. CSS / style หลัก
เช่น
- `ecmis-public.css`

### 3. Component ย่อยที่ส่งผลต่อ UI
เช่น
- `TimelineStep.razor`

### สิ่งที่ต้องเก็บจาก code
- โครงสร้าง layout
- ข้อความจริงบนหน้า
- labels / placeholders
- button text
- field groups
- state conditions (`if`, `else`, stepper, badge, alert)
- สี/spacing/ขนาด โดยประมาณจาก CSS
- interaction flow ที่ส่งผลต่อ state

---

## Step D — สร้าง visual spec ของหน้าก่อนวาด
ก่อน generate SVG ควรสรุปให้ตัวเองชัดเจนว่า หน้า 1 หน้า จะมีอะไรบ้าง เช่น

### ตัวอย่าง visual spec ของหน้า register step 3
- top brand area
- stepper 3 steps (step 3 active)
- card container
- title: “ตรวจสอบและยืนยันข้อมูล”
- summary rows หลายรายการ
- privacy note / warning box
- action buttons 2 ปุ่ม

### ตัวอย่าง visual spec ของหน้า register status
- tracker card ขนาดกลาง centered
- header
- search row
- id block
- status badge
- timeline 3 steps
- footer links

> หลักการสำคัญ: อย่ารีบวาดทันทีจาก code ที่อ่านครั้งเดียว ควรสรุป screen structure ก่อน

---

## Step E — วาด SVG ใหม่จากโครงสร้างที่วิเคราะห์
ใน session นี้ วิธีทำจริงคือ “วาดใหม่” เป็น SVG จาก code ไม่ใช่ capture หน้าเว็บเป็นภาพแล้ว convert

### หลักการวาด
1. สร้าง artboard ตามขนาดที่กำหนด
2. วาด background
3. วาด card / container หลัก
4. วาง brand / header
5. วาด form / input / cards / badges / timelines
6. ใส่ข้อความจริง
7. ใช้ icon แบบ vector path / line / circle
8. แยก prototype และ wireframe โดยรักษา layout เดียวกัน แต่เปลี่ยน visual treatment

---

## 6) ขนาดมาตรฐานที่ต้องใช้

## 6.1 ความกว้าง
ใช้ `1440 px` เป็น default ตามที่ผู้ใช้สั่งใน session นี้

## 6.2 ความสูง
ใช้ logic นี้

1. ประเมินความสูงจาก content จริงของหน้า
2. ถ้าความสูงจริง `<= 900` → ใช้ `900`
3. ถ้าความสูงจริง `> 900` → ใช้ความสูงจริงที่เหมาะสมกับ content

### ตัวอย่างจาก session
- Register Step 2 → 900 px
- Register Step 3 → 1160 px
- Register success after submit → 900 px
- Register status → 900 px
- Forgot password → 900 px

> หมายเหตุ: การประเมินความสูงควรอิงจากจำนวน section / content blocks / white space ที่เหมาะสม ไม่ควรยัดจนแน่นหรือโล่งเกินไป

---

## 7) หลักการออกแบบ Prototype vs Wireframe

## 7.1 Prototype
Prototype ใน session นี้มีลักษณะดังนี้
- ใช้โทนสีแบรนด์ ECMIS / PACC
- พื้นหลังอ่อน + grid/subtle radial background
- card สีขาว มี shadow นุ่ม ๆ
- สีหลักโทน navy / gold / blue / green ตาม state
- มีความ “ใกล้หน้าใช้งานจริง”
- ใช้ typography ชัดเจน hierarchy ดี
- มี badge / state color / timeline color

### Visual DNA ที่ใช้บ่อย
- พื้นหลังอ่อนสีฟ้า/เทา
- card สีขาวขอบอ่อน
- gradient ปุ่มโทน navy
- badge สีตามสถานะ
- stepper และ timeline ตาม state จริง

## 7.2 Wireframe
Wireframe ใน session นี้มีลักษณะดังนี้
- monochrome / neutral
- ตัดสีสันออก เหลือเส้นดำ/เทา/ขาว
- คง layout เดิมทุกอย่าง
- คง labels และ text content
- ไม่มี shadow หรือมีน้อยมาก
- ใช้ stroke ชัดเจนในการสื่อโครงสร้าง

### หลักที่ต้องจำ
Wireframe ไม่ใช่ redesign ใหม่ แต่เป็น “same layout, reduced styling”

---

## 8) Page/State patterns ที่ถอดได้จาก session นี้

## 8.1 Register — Step 1: ข้อมูลผู้ใช้
องค์ประกอบหลัก
- brand/top bar
- stepper
- card
- section: ThaiD
- section: เลขบัตรประชาชน
- section: บัญชีผู้ใช้
- section: ข้อมูลส่วนบุคคล
- section: ช่องทางติดต่อ
- button ไป Step ถัดไป

## 8.2 Register — Step 2: สังกัดที่ปฏิบัติงาน
องค์ประกอบหลักที่ AI ควรมี
- same shell กับ Step 1
- active step = 2
- ฟอร์มเกี่ยวกับหน่วยงาน / ตำแหน่ง / ประเภทบุคลากร / สำนัก / กอง / ฝ่าย / กลุ่ม / หน่วยงานย่อย
- ปุ่มย้อนกลับ / ถัดไป

> แม้ใน session จะไม่ได้โชว์รายละเอียดโค้ดของ Step 2 ในข้อความสุดท้าย แต่รูปแบบการทำงานคือให้ AI สร้างตาม state ของ flow และโครงสร้างระบบ

## 8.3 Register — Step 3: ยืนยันข้อมูล
องค์ประกอบหลัก
- active step = 3
- summary rows ของข้อมูลทั้งหมด
- note / warning
- ปุ่มกลับ
- ปุ่มส่งคำขอลงทะเบียน

## 8.4 Register — Submitted success state
องค์ประกอบหลัก
- success icon
- ข้อความ “คำขอลงทะเบียนถูกส่งแล้ว”
- ชื่อผู้ใช้
- tracking id
- status pending badge
- ปุ่มไปหน้าเข้าสู่ระบบ
- ปุ่มตรวจสอบสถานะ

## 8.5 Register status page
องค์ประกอบหลัก
- title “ติดตามสถานะคำขอลงทะเบียน”
- search input + ค้นหา button
- result card / id block
- status badge
- timeline 3 steps
- footer

### State ที่ใช้ใน session นี้
- `Pending`
- query id = `REG-00000086`

## 8.6 Forgot password page
องค์ประกอบหลัก
- title “ลืมรหัสผ่าน”
- short instruction text
- email input
- send reset button
- footer links

### State ที่ใช้ใน session นี้
- pre-submit state (ยังไม่ส่ง)
- ไม่ใช่ state “ส่งลิงก์แล้ว”

---

## 9) กฎการเลือก state ของหน้า
AI ต้องแยกให้ออกว่า page เดียวกันอาจมีหลาย state เช่น

### 9.1 Conditional UI from code
ตัวอย่าง
- `if (!linkSent)` → หน้ากรอกอีเมล
- `else` → หน้าส่งลิงก์แล้ว

### 9.2 Step-based UI
ตัวอย่าง
- Step 1
- Step 2
- Step 3
- post-submit success

### 9.3 Query-driven state
ตัวอย่าง
- `/register/status?id=REG-00000086`

### 9.4 Action-driven state
ตัวอย่าง
- “หลังจากกดลืมรหัสผ่าน?”
- “หลังกดปุ่มยืนยัน”

> สรุป: ถ้าผู้ใช้ไม่ได้ขอ “state เริ่มต้น” ให้คิดว่าเขากำลังอธิบาย transition หรือผลลัพธ์หลัง action ต้อง map ให้ถูก

---

## 10) กฎการตรวจสอบก่อนส่งงาน
ใน session นี้ ผู้ใช้ย้ำว่า “ก่อนจะให้ฉันดาวน์โหลด โปรดตรวจสอบความเรียบร้อยของงานให้ครบถ้วน” ดังนั้น AI ต้องมี checklist ชัดเจน

## 10.1 Functional checks
- route ที่ทำตรงกับคำสั่งหรือไม่
- state ตรงหรือไม่
- มี 2 ไฟล์หรือไม่
- naming ถูกหรือไม่
- ขนาด 1440 และความสูงตามกติกาหรือไม่

## 10.2 SVG integrity checks
- parse SVG ได้
- ไม่มี `<image>` raster
- มี `viewBox` ถูกต้อง
- เปิด render ได้

## 10.3 Visual checks
- layout ไม่ล้น
- text ไม่ชนกัน
- spacing ดูสมเหตุสมผล
- buttons, inputs, sections อยู่ครบ
- hierarchy ถูกต้อง
- wireframe ยังรักษา structure เดิมจาก prototype

## 10.4 Content checks
- ข้อความสะกดถูก
- route/query/state สะท้อนบนหน้าถูก เช่น `REG-00000086`
- label ตรงกับหน้า
- ถ้าเป็น success/pending/rejected ต้องแสดง state ถูก

---

## 11) โครงสร้างไฟล์ที่ควรสร้างต่อหน้า
ทุกหน้าควรมีไฟล์อย่างน้อย

1. `..._prototype_1440.svg`
2. `..._wireframe_1440.svg`

ไม่จำเป็นต้องส่ง preview PNG ให้ผู้ใช้ แต่ AI ควร render preview ภายในเพื่อเช็กงานเอง

---

## 12) Prompt template ที่ใช้กับ AI ตัวอื่นได้
ด้านล่างคือ prompt template ที่ถอดจากการทำงานจริง และสามารถ reuse ในทีมได้

### 12.1 Template สำหรับหน้าเดียว
ศึกษาหน้า `{route}` โดยละเอียดจาก source code และ style ที่เกี่ยวข้อง แล้วแปลงเป็นไฟล์ `.svg` ที่สามารถนำเข้า Figma และแก้ไขได้ทุกส่วน

ข้อกำหนด:
1. ความกว้าง = `1440 px`
2. ความสูง = ตามขนาดจริงของ content
3. ถ้าความสูงจริงไม่เกิน `900 px` ให้ใช้ `900 px`
4. ทำ 2 ไฟล์เสมอ
   - Prototype
   - Wireframe
5. ห้ามส่ง `.png` เป็นผลลัพธ์สุดท้าย
6. SVG ต้องเป็น vector จริง และไม่ฝัง raster image
7. ก่อนส่งต้องตรวจสอบความเรียบร้อยของงานให้ครบถ้วน

หากหน้ามีหลาย state ให้ใช้ state นี้:
`{state description}`

ตัวอย่าง:
- Step 2 สังกัดที่ปฏิบัติงาน
- หลัง submit สำเร็จ
- query id = REG-00000086
- หลังจากกดลืมรหัสผ่าน

### 12.2 Template สำหรับ flow page state
ศึกษาหน้า `{route}` โดยละเอียดจาก code แล้วสร้าง SVG สำหรับ state `{state}`

ให้สร้าง 2 ไฟล์:
- `{name}_prototype_1440.svg`
- `{name}_wireframe_1440.svg`

โดย:
- Prototype ให้ใกล้เคียง visual จริงของระบบ
- Wireframe ให้คง layout เดิม แต่ลด styling ให้เป็นเส้นและโครงสร้าง
- ความกว้าง 1440
- ความสูงตาม content ถ้าไม่เกิน 900 ให้ใช้ 900
- ต้อง import Figma ได้และแก้ได้ทุกส่วน

---

## 13) ข้อควรระวัง

### 13.1 อย่าใช้ screenshot เป็น final asset
แม้จะ render preview ภายในเพื่อเช็กงานได้ แต่ final deliverable ต้องเป็น SVG editable

### 13.2 อย่าฝังรูปใน SVG
หลีกเลี่ยง `<image>` หรือการ embed PNG/JPG ลงไปใน SVG

### 13.3 อย่าสร้างเพียงหน้าสวย แต่ state ผิด
ผู้ใช้ให้ความสำคัญกับ flow/state มาก เช่น Step 2, Step 3, หลัง submit, status tracking

### 13.4 อย่าลืมทำ 2 ไฟล์
เป็น requirement ที่ผู้ใช้กำหนดชัดเจนใน session นี้

### 13.5 อย่าส่ง `.png` เป็น final
PNG ใช้เพียง internal preview เพื่อตรวจสอบงานก่อนส่งเท่านั้น

---

## 14) Definition of Done (DoD)
งานถือว่าเสร็จเมื่อครบทุกข้อด้านล่าง

- [ ] ศึกษา route/page และ style ที่เกี่ยวข้องแล้ว
- [ ] เข้าใจ state ที่ผู้ใช้ต้องการแล้ว
- [ ] สร้างไฟล์ SVG 2 ไฟล์แล้ว
- [ ] ขนาดงานถูกต้องตามกติกา
- [ ] SVG editable ใน Figma ได้
- [ ] ไม่มี raster image ฝังใน SVG
- [ ] render preview แล้วไม่พบปัญหา layout
- [ ] naming ของไฟล์ถูกต้อง
- [ ] ข้อความ/state/query ตรงกับคำสั่งผู้ใช้
- [ ] ส่งมอบเฉพาะ `.svg`

---

## 15) สรุปหลักคิดของ Skill นี้แบบสั้นที่สุด
“อ่าน code → วิเคราะห์ state → สรุปโครงหน้าจอ → วาดใหม่เป็น editable SVG → ทำ 2 เวอร์ชัน → ตรวจทุกอย่างก่อนส่ง”

หรือเขียนเป็น pipeline ได้ว่า

`Code → Route → State → Layout Spec → SVG Prototype → SVG Wireframe → Validation → Delivery`

---

## 16) สรุปมาตรฐานที่ทีมควรจำ
1. ใช้ code เป็น source of truth
2. state สำคัญพอ ๆ กับ layout
3. width = 1440
4. height = actual content, min rule = 900
5. ต้องมี Prototype + Wireframe เสมอ
6. final output เป็น SVG editable only
7. render preview ภายในเพื่อตรวจ ก่อนส่งจริง
8. naming ต้องสื่อหน้าและ state ให้ชัด
9. ต้องถอด flow การใช้งานจาก prompt ภาษาธรรมชาติให้ได้
10. เขียนงานให้ reusable สำหรับ AI ตัวอื่นในทีม

