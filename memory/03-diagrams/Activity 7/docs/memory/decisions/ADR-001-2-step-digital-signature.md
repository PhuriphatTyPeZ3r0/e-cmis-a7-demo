# ⚖️ ADR-001: มาตรฐาน 2-Step Digital Signature ทุก Role ในกิจกรรมที่ 7

## 📌 Context
เดิมระบบการลงนามมีความแตกต่างกันในแต่ละหน้า โดยบางหน้าลงนามแล้วส่งต่อทันทีโดยไม่มีการ Preview บนเอกสาร ทำให้ผู้ลงนามไม่สามารถตรวจสอบความถูกต้องของภาพลายเซ็นหรือใบรับรองดิจิทัลก่อนส่งมอบงานจริงได้

## 🎯 Decision
ปรับใช้ระบบ **2-Step Digital Signature** แบบเดียวกับ Role เลขาธิการฯ (`review.html`) กับทุกหน้าจอที่มีการลงนามในกิจกรรมที่ 7:
1. **Pre-validation:** ตรวจสอบความถูกต้องครบถ้วนของข้อมูลบังคับก่อนเปิด Dialog ลงนาม
2. **Step 1 (ลงนาม):** เปิด `ECMIS.signDialog(docName, signerName, certCode)` -> เลือกระหว่าง "1. เซ็นมือ" หรือ "2. Digital Signature" -> ประทับตราและแสดงผล Signature Preview ทันที
3. **Step 2 (ตรวจสอบ & บันทึก):** ปุ่ม Action Bar ปรับเปลี่ยนเป็น:
   - `[แก้ไข / ลงนามใหม่]` (`btn-outline-warning`)
   - `[ลบลายเซ็น]` (`btn-outline-danger`)
   - `[บันทึกคำสั่งและส่งต่อ]` (`btn-success`)

## 📋 หน้าที่ได้รับผล
- `chairman.html` (ประธานกรรมการ ป.ป.ท. - `PACC-CHAIRMAN-2569-001`)
- `screening.html` (อนุกลั่นกรองฯ - `PACC-SUBCOMM-2569-001`)
- `resolution.html` (ฝ่ายเลขาฯ บอร์ด / ผอ.กบค. - `PACC-DIRCASE-2569-001`)
- `order.html` (ประธานฯ / เลขาธิการฯ - `PACC-CHAIRMAN-2569-001` / `PACC-SECGEN-2569-001`)
- `urgent-agenda.html` (ผอ.กบค. / ประธานฯ)