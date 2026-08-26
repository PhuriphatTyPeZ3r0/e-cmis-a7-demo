-- ==========================================================================
-- Add 2 new trr_status codes for the ม.24 order-signing hand-off in
-- order.html, requested this session: affairs drafts the ม.24 appointment
-- order (RESOLVED / 015) then needs to hand it to whoever the real document
-- says must sign it -- ประธานฯ for สาย "sub" (คณะอนุกรรมการไต่สวน, ปปท.5-02/
-- 5-08) or เลขาธิการฯ for สาย "base" (องค์คณะพนักงาน ป.ป.ท., ปปท.5-05/5-17).
--
-- The main-line status family (000-017) had no analog to the 7.2 track's
-- PENDING_SIGN_RULING_72 (111) -- a case that's "drafted, sent, waiting on a
-- named person's signature" that actually shows up in that person's own
-- queue. This was the root gap that made order.html's signature UI only
-- usable if the drafter happened to already be logged in as the signer.
--
-- 018 = PENDING_SIGN_ORDER_CHAIRMAN ("รอประธานฯ ลงนามคำสั่ง ม.24")
-- 019 = PENDING_SIGN_ORDER_SECGEN   ("รอเลขาธิการฯ ลงนามคำสั่ง ม.24")
-- ==========================================================================

ALTER TABLE public.tbl_res_request DROP CONSTRAINT tbl_res_request_trr_status_check;

ALTER TABLE public.tbl_res_request ADD CONSTRAINT tbl_res_request_trr_status_check
  CHECK (trr_status IS NULL OR trr_status = ANY (ARRAY[
    '000','001','002','003','004','005','006','007','008','009','010','011','012','013','014','015','016','017',
    '018','019',
    '100','101','102','103','104','105','106','107','108','109','110','111','112','113','114','115','116'
  ]::bpchar[]));

COMMENT ON COLUMN public.tbl_res_request.trr_status IS
  'สถานะ CHAR(3), 000-017=สายงานหลัก (000=DRAFT,001=RETURNED,002=PENDING_SECTION,003=PENDING_DIRECTOR,004=PENDING_DEPUTY,005=PENDING_SECGEN,006=IN_SUPPORT_SUB,007=PENDING_URGENT,008=PENDING_CHAIR_OF [เลิกใช้แล้วตาม ADR-004],009=PENDING_CHAIRMAN,010=IN_SCREENING,011=AGENDA_SET,012=IN_MEETING,013=DEFERRED,014=RESOLVED_PENDING,015=RESOLVED,016=DISPATCHING,017=CLOSED,018=PENDING_SIGN_ORDER_CHAIRMAN,019=PENDING_SIGN_ORDER_SECGEN), 100-116=สายรายงานวินิจฉัยชี้มูล _72 (100=PENDING_SECTION_72...116=CLOSED_72) — mapping ตรงกับ ECMIS.STATUS_CODE/CODE_STATUS ใน assets/ecmis-app.js';
