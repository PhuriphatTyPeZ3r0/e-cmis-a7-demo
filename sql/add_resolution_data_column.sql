-- ==========================================================================
-- เพิ่มคอลัมน์เก็บ "มติที่เลือก" แบบเต็ม สำหรับ chairman signing + board resolution
-- persistence project (session นี้) — board-resolution.html/resolution.html/
-- resolution-72.html เดิมเขียนแค่ ECMIS.Model.CaseStore (sessionStorage mock)
-- ไม่มีคอลัมน์ไหนใน tbl_res_request เก็บ "รหัสมติที่เลือก" (เช่น ACCEPT_S24P1,
-- GUILTY_72) หรือฟิลด์ความเห็น/ข้อหาของสาย 7.2 (~10 ฟิลด์: boardOpinion72,
-- investigatorRef72, guiltyCriminal72 ฯลฯ) เลย
--
-- ใช้ jsonb เดียวแทนการเพิ่มคอลัมน์ typed 10+ ตัว — board-resolution.html เขียน
-- payload เล็ก {code, label}, resolution-72.html เขียน patch object เดิมทั้งก้อน
-- ตรงๆ — อ่านกลับเข้า kase ผ่าน Object.assign ใน supabaseRowToCase()
-- (assets/ecmis-app.js) สอดคล้องกับ convention trre_data jsonb ที่มีอยู่แล้วใน
-- tbl_res_request_event
-- ==========================================================================

ALTER TABLE public.tbl_res_request ADD COLUMN IF NOT EXISTS trr_resolution_data jsonb;

COMMENT ON COLUMN public.tbl_res_request.trr_resolution_data IS
  'มติ/ผลการพิจารณาแบบเต็ม (JSON) — {code,label} สำหรับ 7.1/7.3 ผ่าน board-resolution.html, ฟิลด์ความเห็น/ข้อหาทั้งหมดสำหรับ 7.2 ผ่าน resolution-72.html (boardOpinion72, investigatorRef72, guiltyCriminal72, guiltyDiscipline72, criminalFinding72, disciplinaryFinding72, moreReason72, flightRisk72 ฯลฯ) — อ่านกลับเข้า kase ผ่าน Object.assign ใน supabaseRowToCase()';
