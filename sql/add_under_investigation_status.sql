-- ==========================================================================
-- เพิ่มรหัสสถานะ 020 = UNDER_INVESTIGATION — ปลายทางจริงของ order.html หลัง
-- ลงนามคำสั่ง ม.24 เสร็จสมบูรณ์ (act==='save_order') โค้ดเดิมเขียนคำว่า
-- 'UNDER_INVESTIGATION' ตรงๆ ลง ECMIS.Model.CaseStore (mock) โดยไม่เคยมีอยู่ใน
-- ECMIS.STATUS_CODE เลยด้วยซ้ำ (ยืนยันด้วย grep ทั้ง assets/ecmis-app.js) —
-- จึงไม่มีทาง persist ค่านี้ลง trr_status ได้มาก่อนหน้านี้เลย
-- ==========================================================================

ALTER TABLE public.tbl_res_request DROP CONSTRAINT tbl_res_request_trr_status_check;

ALTER TABLE public.tbl_res_request ADD CONSTRAINT tbl_res_request_trr_status_check
  CHECK (trr_status IS NULL OR trr_status = ANY (ARRAY[
    '000','001','002','003','004','005','006','007','008','009','010','011','012','013','014','015','016','017',
    '018','019','020',
    '100','101','102','103','104','105','106','107','108','109','110','111','112','113','114','115','116'
  ]::bpchar[]));

COMMENT ON COLUMN public.tbl_res_request.trr_status IS
  'สถานะ CHAR(3), 000-020=สายงานหลัก (...,018=PENDING_SIGN_ORDER_CHAIRMAN,019=PENDING_SIGN_ORDER_SECGEN,020=UNDER_INVESTIGATION), 100-116=สายรายงานวินิจฉัยชี้มูล _72 — mapping ตรงกับ ECMIS.STATUS_CODE/CODE_STATUS ใน assets/ecmis-app.js';
