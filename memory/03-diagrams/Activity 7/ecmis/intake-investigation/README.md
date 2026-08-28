# E-CMIS Activity 4 — Static Prototype

## รัน
```bash
cd E-CMIS-A4
python3 -m http.server 8080 หรือ python -m http.server 8080
```
เปิด http://localhost:8080/staff-workflow.html

## ทดสอบ (demo)
```
staff-workflow.html?demo=1&role=officer&case=ECMIS-2569-000184
role: officer | center | division
```
ข้อมูลอยู่ใน localStorage (key `ecmis-a4-workspace-v3`) — ลบ key เพื่อ reset

## ไฟล์หลัก
- `staff-workflow.html` — หน้าหลัก (workflow + เอกสาร)
- `complaint-form.html` — ฟอร์มรับเรื่อง
- `staff-intake.html` — หน้าลงรับ
- `assets/activity4-workspace.js` — logic หลัก
- `assets/ecmis-workspace.css` — สไตล์

## หมายเหตุ
- หลังแก้โค้ดต้อง **hard refresh (Cmd+Shift+R)** — server ไม่มี cache-control
- แก้เอกสารในเบราว์เซอร์ได้: กดปุ่ม "✏️ แก้ไขเอกสาร" → คลิกข้อความ → พิมพ์ (B/I/U + หน้าไหลอัตโนมัติ)
- Activity 4 และ Activity 5 ใช้ `staff-workflow.html` ร่วมกัน โดยสลับระบบงานจากเมนูด้านข้าง
