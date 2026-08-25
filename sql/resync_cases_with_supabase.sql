-- ==========================================================================
-- Resync tbl_cmp_case / tbl_res_request / tbl_cmp_case_accused to match the
-- current ECMIS.CASES mock array in assets/ecmis-app.js.
--
-- Root cause of the "16 vs 11" sidebar-badge/page-count mismatch on
-- resolution-inbox.html: ECMIS.inboxFor('board_sec') (sidebar badge) reads
-- CASES directly; resolution-inbox.html's own list reads live Supabase rows
-- via loadCasesFromSupabase(). The two had drifted apart:
--   1. 3 existing cases had a stale trr_status (0012/2565, 1119/2565, 1396/2564)
--   2. 1855/2568's tbl_cmp_case row was soft-deleted (is_deleted=true) while
--      its tbl_res_request row was not -- resolution-inbox.html's Supabase
--      query only filters tbl_res_request.is_deleted, so the case leaked
--      into the list; the sidebar badge (reading CASES) never had it,
--      making it a case of the two sources disagreeing whether it exists.
--   3. 14 cases added to CASES earlier this session were never inserted
--      into Supabase at all.
-- ==========================================================================

-- 1. Fix drifted trr_status on 3 existing cases (match CASES' current status)
UPDATE public.tbl_res_request SET trr_status = '005' WHERE trr_id = 20; -- 0012/2565 -> PENDING_SECGEN
UPDATE public.tbl_res_request SET trr_status = '015' WHERE trr_id = 3;  -- 1119/2565 -> RESOLVED
UPDATE public.tbl_res_request SET trr_status = '011' WHERE trr_id = 2;  -- 1396/2564 -> AGENDA_SET

-- 2. Restore 1855/2568 (its case record was soft-deleted while its request
--    record was not) and fix its status to match CASES (IN_MEETING_72)
UPDATE public.tbl_cmp_case SET is_deleted = false WHERE tcc_id = 20; -- 1855/2568
UPDATE public.tbl_res_request SET trr_status = '110' WHERE trr_id = 17; -- -> IN_MEETING_72

-- 3. Insert the 14 cases added to CASES earlier this session but never
--    migrated into Supabase. Each block: case -> accused -> request,
--    chained via a data-modifying CTE so the new tcc_id threads through.
--
--    Note on 1344/2566: CASES' legalBase is 'ม.19(ข)(1)' -- a citation this
--    session's own audit found to be wrong (ม.19 has no lettered
--    subsections; the real basis is ม.18/3). tcc_legal_base also has a
--    CHECK constraint allowing only 'ม.18/4'/'ม.62'. Rather than either
--    violate the constraint or write the known-wrong citation into the
--    database, this case is stored with 'ม.18/4' (its actual case-intake
--    basis, same as every other 7.2 case here) -- consistent with this
--    session's "never propagate a fabricated/wrong citation" rule.

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('0921/2569', 'กล่าวหาเจ้าหน้าที่สหกรณ์ออมทรัพย์แห่งหนึ่ง ยักยอกเงินฝากสมาชิกโดยทุจริต',
     'ยักยอกเงินฝากของสมาชิกสหกรณ์ไปใช้ประโยชน์ส่วนตัว รวมมูลค่าความเสียหายกว่า 3.6 ล้านบาท ความเห็นในสายบังคับบัญชาไม่ตรงกัน',
     'ม.18/4', 'สมาชิกสหกรณ์ออมทรัพย์ (ผู้ร้อง)', 'นายสมชาย ใจซื่อ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
     '2026-06-18', '2029-11-10', 'ปป 0020/0777 ลงวันที่ 18 มิถุนายน 2569', '213', false, true)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายเจริญ เงินดี', 'ผู้จัดการสหกรณ์ออมทรัพย์', '3-1601-0xxxx-xx-x', 'สหกรณ์ออมทรัพย์แห่งหนึ่ง' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee)
SELECT tcc_id, '006', false, true, NULL FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1203/2569', 'กล่าวหาเจ้าหน้าที่กรมที่ดินแห่งหนึ่ง เร่งรัดออกเอกสารสิทธิ์โดยมิชอบ ก่อนคดีขาดอายุความ',
     'ออกเอกสารสิทธิ์ที่ดินโดยมิชอบให้กับพวกพ้อง คดีใกล้ครบกำหนดอายุความ 2 ปี เห็นควรเสนอขอบรรจุวาระด่วน',
     'ม.18/4', 'นายสุรพล ที่ดินทอง (ผู้ร้อง)', 'นายสมชาย ใจซื่อ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
     '2026-06-25', '2026-09-15', 'ปป 0020/0801 ลงวันที่ 25 มิถุนายน 2569', '213', true, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายวิรัช เขตที่ดิน', 'เจ้าพนักงานที่ดินอาวุโส', '3-1701-0xxxx-xx-x', 'สนง.ที่ดินจังหวัด' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee)
SELECT tcc_id, '007', true, true, NULL FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1277/2569', 'กล่าวหาเจ้าหน้าที่เทศบาลนครแห่งหนึ่ง ทุจริตการจัดเก็บภาษีป้าย',
     'ละเว้นการจัดเก็บภาษีป้ายจากผู้ประกอบการรายใหญ่หลายราย เป็นเหตุให้ทางราชการเสียหาย',
     'ม.18/4', 'ความปรากฏต่อสำนักงาน', 'นายสมชาย ใจซื่อ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
     '2026-07-01', '2029-06-20', 'ปป 0020/0842 ลงวันที่ 1 กรกฎาคม 2569', '213', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นางสาวพิมพ์ใจ จัดเก็บดี', 'นักวิชาการจัดเก็บรายได้ชำนาญการ', '3-1801-0xxxx-xx-x', 'เทศบาลนครแห่งหนึ่ง' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee)
SELECT tcc_id, '009', false, true, NULL FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1330/2569', 'กล่าวหาเจ้าหน้าที่การประปาส่วนภูมิภาคแห่งหนึ่ง ทุจริตการจัดซื้อวัสดุประปา',
     'ร่วมกำหนดสเปควัสดุประปาเพื่อเอื้อประโยชน์ผู้เสนอราคารายหนึ่ง ความเสียหายรวม 1.8 ล้านบาท',
     'ม.18/4', 'พนักงานการประปาฯ (ผู้แจ้งเบาะแส)', 'นายสมชาย ใจซื่อ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
     '2026-07-08', '2029-05-02', 'ปป 0020/0868 ลงวันที่ 8 กรกฎาคม 2569', '213', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายอนุสรณ์ วัสดุดี', 'หัวหน้างานพัสดุ', '3-1901-0xxxx-xx-x', 'การประปาส่วนภูมิภาคแห่งหนึ่ง' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee)
SELECT tcc_id, '010', false, true, 'คณะที่ 4' FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1088/2566', 'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีเจ้าหน้าที่กรมชลประทานแห่งหนึ่ง ทุจริตโครงการขุดลอกคลอง',
     'ร่วมกับผู้รับเหมาเบิกจ่ายค่าขุดลอกคลองเกินปริมาณงานจริง ความเห็นในสายบังคับบัญชาไม่ตรงกัน จึงเสนอคณะอนุกรรมการสนับสนุนเลขาธิการฯ พิจารณา',
     'ม.18/4', 'ประชาชนในพื้นที่ (ผู้ร้องเรียน)', 'นายฉัตรชัย ตรวจการ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 2',
     '2026-06-05', '2029-08-14', 'ปป 0021/0742 ลงวันที่ 5 มิถุนายน 2569', 'RULING', false, true)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายไพศาล ขุดลอกดี', 'นายช่างชลประทานชำนาญงาน', '3-2001-0xxxx-xx-x', 'โครงการชลประทานแห่งหนึ่ง' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee)
SELECT tcc_id, '105', false, true, NULL FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1177/2566', 'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีเจ้าหน้าที่กรมสรรพากรแห่งหนึ่ง เรียกรับสินบนก่อนคดีขาดอายุความ',
     'เรียกรับเงินจากผู้ประกอบการเพื่อแลกกับการลดยอดประเมินภาษี คดีใกล้ครบกำหนดอายุความ เห็นควรเสนอขอวาระด่วน',
     'ม.18/4', 'ผู้ประกอบการ (ผู้ร้อง)', 'นายฉัตรชัย ตรวจการ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 2',
     '2026-06-12', '2026-09-20', 'ปป 0021/0760 ลงวันที่ 12 มิถุนายน 2569', 'RULING', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายสมพงษ์ สรรพากรดี', 'นักตรวจสอบภาษีชำนาญการ', '3-2101-0xxxx-xx-x', 'สนง.สรรพากรพื้นที่' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee)
SELECT tcc_id, '106', true, true, NULL FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1210/2566', 'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีเจ้าหน้าที่กรมทางหลวงชนบทแห่งหนึ่ง ทุจริตงานก่อสร้างสะพาน',
     'กำหนดคุณสมบัติผู้เสนอราคางานก่อสร้างสะพานเพื่อเอื้อประโยชน์ผู้รับเหมารายหนึ่ง คดีใกล้ครบกำหนดอายุความ ผอ.กบค. รับรองเหตุผลเร่งด่วนแล้ว',
     'ม.18/4', 'ผู้รับเหมารายอื่น (ผู้ร้อง)', 'นายฉัตรชัย ตรวจการ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 2',
     '2026-06-15', '2026-09-25', 'ปป 0021/0771 ลงวันที่ 15 มิถุนายน 2569', 'RULING', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายบุญเลิศ สะพานดี', 'ผู้อำนวยการแขวงทางหลวงชนบท', '3-2201-0xxxx-xx-x', 'แขวงทางหลวงชนบทแห่งหนึ่ง' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee)
SELECT tcc_id, '107', true, true, NULL FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1233/2566', 'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีเจ้าหน้าที่องค์การบริหารส่วนจังหวัดแห่งหนึ่ง ทุจริตจัดซื้อรถบรรทุกขยะ',
     'จัดซื้อรถบรรทุกขยะราคาสูงกว่าราคากลางอย่างมีนัยสำคัญ อยู่ระหว่างการพิจารณาของคณะอนุกรรมการกลั่นกรองฯ',
     'ม.18/4', 'สมาชิกสภาองค์การบริหารส่วนจังหวัด (ผู้ร้อง)', 'นางสาวปรียา ตั้งมั่น', 'กองปราบปรามการทุจริตในภาครัฐ 2',
     '2026-06-20', '2029-09-01', 'ปป 0021/0790 ลงวันที่ 20 มิถุนายน 2569', 'RULING', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายวิเชียร ขยะดี', 'หัวหน้าฝ่ายพัสดุ', '3-2301-0xxxx-xx-x', 'องค์การบริหารส่วนจังหวัดแห่งหนึ่ง' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee)
SELECT tcc_id, '108', false, true, 'คณะที่ 5' FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1366/2566', 'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีเจ้าหน้าที่กรมประมงแห่งหนึ่ง ออกใบอนุญาตประมงโดยมิชอบ',
     'ออกใบอนุญาตทำการประมงในเขตอนุรักษ์โดยมิชอบให้กับพวกพ้อง กลั่นกรองแล้วเสร็จ รอจัดทำหนังสือเชิญประชุม',
     'ม.18/4', 'สมาคมประมงพื้นบ้าน (ผู้ร้อง)', 'นางสาวปรียา ตั้งมั่น', 'กองปราบปรามการทุจริตในภาครัฐ 2',
     '2026-06-28', '2029-10-11', 'ปป 0021/0815 ลงวันที่ 28 มิถุนายน 2569', 'RULING', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายประมวล ประมงดี', 'ประมงอำเภอ', '3-2401-0xxxx-xx-x', 'สนง.ประมงจังหวัด' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee)
SELECT tcc_id, '109', false, true, 'คณะที่ 6' FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1299/2566', 'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีเจ้าหน้าที่การไฟฟ้าส่วนภูมิภาคแห่งหนึ่ง ทุจริตค่าติดตั้งมิเตอร์ไฟฟ้า',
     'เรียกรับเงินค่าติดตั้งมิเตอร์ไฟฟ้านอกเหนือจากค่าธรรมเนียมทางราชการ ที่ประชุมมีมติแล้ว อยู่ระหว่างจัดทำรายงานวินิจฉัยชี้มูล',
     'ม.18/4', 'ผู้ใช้ไฟฟ้า (ผู้ร้อง)', 'นายฉัตรชัย ตรวจการ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 2',
     '2026-05-20', '2029-07-30', 'ปป 0021/0688 ลงวันที่ 20 พฤษภาคม 2569', 'RULING', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายจตุพร มิเตอร์ดี', 'ช่างไฟฟ้าอาวุโส', '3-2501-0xxxx-xx-x', 'การไฟฟ้าส่วนภูมิภาคแห่งหนึ่ง' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee, trr_meeting_no, trr_agenda_no, trr_meeting_date)
SELECT tcc_id, '111', false, true, 'คณะที่ 2', '36/2569', '5.2', '2026-08-05' FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1311/2566', 'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีเจ้าหน้าที่กรมพัฒนาที่ดินแห่งหนึ่ง ทุจริตแจกจ่ายปุ๋ยอินทรีย์',
     'แจกจ่ายปุ๋ยอินทรีย์ไม่ครบตามจำนวนที่ได้รับงบประมาณ และนำส่วนที่เหลือไปจำหน่ายเป็นประโยชน์ส่วนตัว ร่างรายงานวินิจฉัยชี้มูลเสร็จแล้ว รอประธานฯ ลงนาม',
     'ม.18/4', 'เกษตรกรในพื้นที่ (ผู้ร้อง)', 'นายฉัตรชัย ตรวจการ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 2',
     '2026-05-10', '2029-06-18', 'ปป 0021/0655 ลงวันที่ 10 พฤษภาคม 2569', 'RULING', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นางสาวรัตนา ปุ๋ยดี', 'นักวิชาการเกษตรชำนาญการ', '3-2601-0xxxx-xx-x', 'สนง.พัฒนาที่ดินจังหวัด' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee, trr_meeting_no, trr_agenda_no, trr_meeting_date)
SELECT tcc_id, '112', false, true, 'คณะที่ 1', '35/2569', '5.3', '2026-07-22' FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1322/2566', 'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีเจ้าหน้าที่สำนักงานสาธารณสุขจังหวัดแห่งหนึ่ง (ข้อกล่าวหาไม่มีมูล)',
     'ถูกกล่าวหาเบิกจ่ายค่าตอบแทนโดยมิชอบ ไต่สวนแล้วพยานหลักฐานไม่พอรับฟัง คณะกรรมการ ป.ป.ท. มีมติว่าข้อกล่าวหาไม่มีมูล รอพื้นที่บันทึกรับมติและแจ้งผลผู้ถูกกล่าวหา',
     'ม.18/4', 'บัตรสนเท่ห์ (ความปรากฏต่อสำนักงาน)', 'นายสมชาย ใจซื่อ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
     '2026-04-18', '2029-05-02', 'ปป 0020/0590 ลงวันที่ 18 เมษายน 2569', 'RULING', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายเกรียงศักดิ์ สาธารณสุขดี', 'นักวิชาการสาธารณสุขชำนาญการ', '3-2701-0xxxx-xx-x', 'สนง.สาธารณสุขจังหวัด' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee, trr_meeting_no, trr_agenda_no, trr_meeting_date)
SELECT tcc_id, '113', false, true, 'คณะที่ 3', '34/2569', '5.5', '2026-07-08' FROM c;

-- 1344/2566: legalBase in CASES is the known-wrong "ม.19(ข)(1)" citation this
-- session's audit already corrected in the resolution-taxonomy tables; the
-- tcc_legal_base CHECK constraint also only allows ม.18/4/ม.62, so this is
-- stored as ม.18/4 (its real case-intake basis) rather than propagate the
-- wrong citation or violate the constraint.
WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1344/2566', 'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีเจ้าหน้าที่กรมบัญชีกลางแห่งหนึ่ง (นอกอำนาจหน้าที่ ป.ป.ท.)',
     'ถูกกล่าวหาทุจริตเบิกจ่ายงบประมาณระดับกรม คณะกรรมการ ป.ป.ท. พิจารณาแล้วเห็นว่าอยู่นอกอำนาจหน้าที่ตาม ม.18/3 มีมติส่งเรื่องให้ ป.ป.ช. รอส่งมอบสำนวน',
     'ม.18/4', 'สำนักงาน ป.ป.ช. (ส่งเรื่องมอบหมาย)', 'นายฉัตรชัย ตรวจการ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 2',
     '2026-04-25', '2029-08-19', 'ปป 0021/0602 ลงวันที่ 25 เมษายน 2569', 'RULING', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายอมร บัญชีดี', 'ผู้อำนวยการกองการเงิน', '3-2801-0xxxx-xx-x', 'กรมบัญชีกลาง' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee, trr_meeting_no, trr_agenda_no, trr_meeting_date)
SELECT tcc_id, '114', false, true, 'คณะที่ 4', '34/2569', '5.6', '2026-07-08' FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('1355/2566', 'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีเจ้าหน้าที่กรมทรัพยากรน้ำแห่งหนึ่ง ทุจริตโครงการขุดเจาะบ่อบาดาล',
     'ร่วมกับผู้รับเหมาเบิกจ่ายค่าขุดเจาะบ่อบาดาลเกินจำนวนบ่อที่ขุดจริง คณะกรรมการ ป.ป.ท. มีมติชี้มูลความผิดแล้ว รอส่งเรื่องดำเนินคดีทั้งสายอาญาและสายวินัย',
     'ม.18/4', 'ประชาชนในพื้นที่ (ผู้ร้อง)', 'นางสาวปรียา ตั้งมั่น', 'กองปราบปรามการทุจริตในภาครัฐ 2',
     '2026-04-05', '2029-04-22', 'ปป 0021/0570 ลงวันที่ 5 เมษายน 2569', 'RULING', false, false)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายสุเทพ บาดาลดี', 'วิศวกรทรัพยากรน้ำชำนาญการ', '3-2901-0xxxx-xx-x', 'สนง.ทรัพยากรน้ำภาค' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee, trr_meeting_no, trr_agenda_no, trr_meeting_date)
SELECT tcc_id, '115', false, true, 'คณะที่ 7', '33/2569', '5.4', '2026-06-24' FROM c;
