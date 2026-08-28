# 📐 มาตรฐานชื่อไฟล์และการกำหนดเส้นทาง (Naming & Routing Standards)

## 📌 URL Mapping Table (โมดูล `res/`)

| รหัสกระบวนงาน | URL เดิม | Clean URL ใหม่ใน `res/` | คำอธิบาย |
|:---:|---|---|---|
| **A7-INBOX** | `01-work-inbox.html` / `inbox.html` | `res/index.html` | รายการพิจารณา/ลงนาม (Work Inbox) |
| **A7-REG** | `02-case-register.html` / `case-register.html` | `res/register.html` | ทะเบียนสำนวนคดี |
| **A7-REVIEW** | `04-approval-review.html` / `approval-review.html` | `res/review.html` | เสนอความเห็น/กลั่นกรองสำนวน |
| **A7-CHAIR** | `06-chairman-agenda.html` / `chairman-agenda.html` | `res/chairman.html` | วาระและคำสั่งประธานฯ |
| **A7-SCREEN** | `07-subcommittee-screening.html` / `subcommittee-screening.html` | `res/screening.html` | คณะอนุกรรมการกลั่นกรองฯ |
| **A7-RES** | `08-board-resolution.html` / `board-resolution.html` | `res/resolution.html` | บันทึกมติคณะกรรมการ ป.ป.ท. |
| **A7-RES-INBOX** | `08-resolution-inbox.html` / `resolution-inbox.html` | `res/resolution-inbox.html` | รายการรอจัดทำมติ |
| **A7-ORD** | `09-order-m24.html` / `order-m24.html` | `res/order.html` | คำสั่งแต่งตั้งคณะอนุไต่สวน ม.24 |
| **A7-AGENDA** | `10-agenda-set.html` / `agenda-set.html` | `res/agenda.html` | จัดและบรรจุวาระการประชุม |
| **A7-REP** | `12-meeting-report.html` / `meeting-report.html` | `res/meeting-report.html` | จัดทำรายงานมติการประชุม |
| **A7-AG-REG** | `13-agenda-registry.html` / `agenda-registry.html` | `res/agenda-registry.html` | ทะเบียนวาระการประชุม |
| **A7-AG-DET** | `14-agenda-registry-detail.html` / `agenda-registry-detail.html` | `res/agenda-detail.html` | รายละเอียดวาระการประชุม |
| **A7-AG-DOCS** | `15-agenda-meeting-docs.html` / `agenda-meeting-docs.html` | `res/meeting-docs.html` | รวบรวมเอกสารการประชุม |
| **A7.2-SUB** | `72-04-support-subcommittee.html` | `res/support-subcommittee.html` | คณะอนุสนับสนุน 7.2 |
| **A7.2-URG** | `72-05-urgent-agenda.html` | `res/urgent-agenda.html` | หนังสือขอบรรจุวาระด่วน 7.2 |
| **A7.2-RES** | `72-08-board-resolution.html` | `res/resolution-72.html` | บันทึกมติบอร์ด 7.2 |
| **A7.2-RUL** | `72-09-ruling-report.html` | `res/ruling-report.html` | รายงานวินิจฉัยชี้มูล 7.2 |