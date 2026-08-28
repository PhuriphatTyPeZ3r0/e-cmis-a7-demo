# ⚖️ ADR-003: การจัดโครงสร้างโมดูล res/ และ Clean Semantic URLs

## 📌 Context
ชื่อไฟล์เดิมมีการใช้ตัวเลขลำดับนำหน้า เช่น `01-work-inbox.html`, `02-case-register.html`, `08-board-resolution.html` ซึ่งไม่ตรงกับสถาปัตยกรรมของระบบจริงที่แบ่งตามโมดูลย่อย

## 🎯 Decision
1. จัดโครงสร้างให้อยู่ภายใต้โฟลเดอร์โมดูล `res/` (ย่อมาจาก Resolution / Board Resolution)
2. ตัดตัวเลขลำดับออกเป็น Clean Semantic Naming เช่น:
   - `res/index.html` (Work Inbox)
   - `res/register.html` (Case Register)
   - `res/review.html` (Approval Review)
   - `res/chairman.html` (Chairman Agenda & Orders)
   - `res/screening.html` (Subcommittee Screening)
   - `res/resolution.html` (Board Resolution)
   - `res/order.html` (Order M.24)
   - `res/agenda.html` (Agenda Setting)
3. รองรับ **Dual Routing / Backward Compatibility** เพื่อให้ URL เดิมที่ root ยังคงใช้งานได้โดยไม่เกิด 404