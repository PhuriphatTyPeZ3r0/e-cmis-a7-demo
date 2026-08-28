---
status: draft   # draft → approved → in-progress → done
owner: <ชื่อคน หรือ "Claude Code" / "Antigravity (Gemini)">
created: <YYYY-MM-DD>
---

# <ชื่องาน สั้นๆ อธิบายว่าทำอะไร>

## Context (ทำไมต้องทำ)
<ปัญหา/ความต้องการที่ทำให้ต้องทำงานนี้ อ้างอิง LATEST_HANDOVER.md หรือ issue ที่เกี่ยวข้องถ้ามี>

## Scope decisions (คำถามที่เคลียร์แล้ว + คำตอบที่เลือก)
<รายการคำถามที่เคลียร์ scope ก่อนเริ่ม พร้อมคำตอบที่เลือกและเหตุผลสั้นๆ — ถ้าใช้ /grill-me ให้สรุปผล
การ grill ที่นี่ ถ้าเป็นคนเขียนเอง ให้ระบุว่าใครช่วย review และตกลงอะไรบ้าง>

## Implementation steps (ไฟล์ที่จะแก้ + สิ่งที่จะทำ)
<รายการไฟล์ที่จะสร้าง/แก้ พร้อมคำอธิบายสั้นๆ ว่าจะทำอะไรกับแต่ละไฟล์ — อ้าง path จริงในโปรเจกต์เสมอ>

## Test plan (อ้างอิงตาราง test layer ใน dev-workflow.md — ระบุว่าจะรันอะไรบ้าง)
<เลือก test layer ตามชนิดของการเปลี่ยนแปลง (ดูตารางใน
docs/memory/standards/dev-workflow.md#phase-3-test) — ระบุให้ชัดว่างานนี้ต้องรันอะไรบ้าง เช่น:
- [ ] `npm run check` (บังคับทุกงาน)
- [ ] manual browser verification (ถ้าแก้ UI)
- [ ] `scripts/test-*-integration.js` ใหม่/อัปเดต (ถ้าแตะ Supabase)
- [ ] `tests-e2e/*.spec.js` ใหม่/อัปเดต (ถ้าแก้ flow ข้ามหลายหน้า)
- [ ] test-design doc ใหม่ (เฉพาะ feature ที่มี state machine/business rule ซับซ้อน)>

## Verification checklist (รันจริงแล้ว ผลเป็นอย่างไร)
<กรอกหลัง implement เสร็จ — ผลการรันจริงของแต่ละอย่างใน Test plan ด้านบน ห้ามเขียนว่า "tested"/"ผ่าน"
โดยไม่ได้รันจริง (ดูกฎ "verify ก่อน claim" ใน dev-workflow.md)>
