-- ==========================================================================
-- Part 2 of the CASES/Supabase resync: 4 cases that were NEVER in Supabase
-- at all -- pre-existing gaps from before this session, not part of the
-- 14 mock cases added earlier this session (fixed in
-- resync_cases_with_supabase.sql). Found via a live-browser cross-check
-- against resolution-inbox.html after applying part 1.
-- ==========================================================================

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('0807/2568', 'กล่าวหาเจ้าหน้าที่แขวงทางหลวงแห่งหนึ่ง ทุจริตงบประมาณค่าซ่อมบำรุงทางหลวงแผ่นดิน (ม.62)',
     'ร่วมกันจัดทำเอกสารเบิกจ่ายงบประมาณซ่อมแซมผิวจราจรอันเป็นเท็จ โดยมิได้มีการปฏิบัติงานจริง',
     'ม.18/4', 'ประชาชนผู้ใช้ทางหลวง (ผู้ร้องเรียน)', 'นายสมชาย ใจซื่อ', 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
     '2025-11-20', '2028-06-15', 'ปป 0020/1028 ลงวันที่ 7 พฤษภาคม 2569', '213', false, false)
  RETURNING tcc_id
), a1 AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายสมศักดิ์ ทางหลวงดี', 'นายช่างโยธาชำนาญงาน', '3-1008-0xxxx-xx-x', 'แขวงทางหลวงแห่งหนึ่ง' FROM c
), a2 AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 2, 'นายประดิษฐ์ ซ่อมบำรุง', 'นายช่างเครื่องกลปฏิบัติงาน', '3-1011-0xxxx-xx-x', 'แขวงทางหลวงแห่งหนึ่ง' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee, trr_meeting_no, trr_agenda_no, trr_meeting_date)
SELECT tcc_id, '012', false, true, 'คณะที่ 6', '37/2569', '5.6', '2026-08-20' FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('กจ.104/2569', 'บันทึกขอให้คณะกรรมการ ป.ป.ท. พิจารณาจัดให้มีมาตรการคุ้มครองพยานในคดีทุจริตจัดซื้อจัดจ้าง',
     'พยานในคดีทุจริตจัดซื้อจัดจ้างเรื่องที่ 1547/2568 ได้รับการข่มขู่จากบุคคลที่เกี่ยวข้องกับผู้ถูกกล่าวหา เห็นควรจัดให้มีมาตรการคุ้มครองตามกฎหมายว่าด้วยการคุ้มครองพยานในคดีอาญา (ตามระเบียบฯ ข้อ 14, ม.๕๔)',
     'ม.18/4', 'กองคุ้มครองพยาน (เสนอตามภารกิจ)', 'นางสาวอรวรรณ คุ้มครองสิทธิ์', 'กองคุ้มครองพยาน',
     '2026-08-10', NULL, 'ปป 0018/1122 ลงวันที่ 10 สิงหาคม 2569', '213', true, false)
  RETURNING tcc_id
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee, trr_meeting_no, trr_agenda_no, trr_meeting_date)
SELECT tcc_id, '011', true, true, NULL, '37/2569', '4.4', '2026-08-20' FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('กจ.105/2569', 'บันทึกขออนุมัติแยกเลขสำนวน กรณีผู้ถูกกล่าวหาหลายคนและหลายพฤติการณ์',
     'สำนวนเรื่องที่ 0654/2569 มีผู้ถูกกล่าวหาหลายคนและพฤติการณ์แยกจากกันชัดเจน คณะผู้ไต่สวนเห็นควรขออนุมัติแยกเลขสำนวนเพื่อความสะดวกในการดำเนินคดีแต่ละราย',
     'ม.18/4', 'กองปราบปรามการทุจริตในภาครัฐ 3 (เสนอตามภารกิจ)', 'นายกิตติ แยกสำนวนดี', 'กองปราบปรามการทุจริตในภาครัฐ 3',
     '2026-07-20', NULL, 'ปป 0009/0876 ลงวันที่ 20 กรกฎาคม 2569', '213', false, false)
  RETURNING tcc_id
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee, trr_resolution_stage, trr_meeting_no, trr_agenda_no, trr_meeting_date)
SELECT tcc_id, '015', false, true, NULL, 5, '36/2569', '4.5', '2026-08-05' FROM c;

WITH c AS (
  INSERT INTO public.tbl_cmp_case
    (tcc_no, tcc_subject, tcc_allegation, tcc_legal_base, tcc_complainant, tcc_owner, tcc_owner_org,
     tcc_received_date, tcc_prescription_date, tcc_doc_ref, tcc_doc_type, tcc_urgent, tcc_complex)
  VALUES
    ('กจ.106/2569', 'บันทึกขอให้พิจารณากรณี ก.พ.ค. ส่งคำวินิจฉัยอุทธรณ์ เพื่อทบทวนมติชี้มูลความผิดวินัยตามมาตรา ๔๓',
     'ก.พ.ค. มีคำวินิจฉัยอุทธรณ์ของผู้ถูกลงโทษทางวินัยส่งกลับมา เห็นว่าเป็นกรณีที่คณะกรรมการ ป.ป.ท. มีมติชี้มูลความผิดวินัยที่สามารถรับไว้พิจารณาทบทวนตามมาตรา ๔๓ (ใหม่) ได้ ตามบทเฉพาะกาลมาตรา ๒๐ แห่ง พ.ร.บ. มาตรการฯ (ฉบับที่ ๔) พ.ศ. ๒๕๖๘',
     'ม.18/4', 'ก.พ.ค. (ส่งคำวินิจฉัยอุทธรณ์กลับ)', 'นางสาวนภวรรณ ทบทวนคดี', 'กองบริหารคดี',
     '2026-07-28', NULL, 'ปป 0011/0940 ลงวันที่ 28 กรกฎาคม 2569', '213', false, true)
  RETURNING tcc_id
), a AS (
  INSERT INTO public.tbl_cmp_case_accused (tcc_id, tcca_no, tcca_name, tcca_position, tcca_idcard, tcca_agency)
  SELECT tcc_id, 1, 'นายประสิทธิ์ ราชการดี', 'อดีตปลัดเทศบาล', '3-1301-0xxxx-xx-x', 'เทศบาลตำบลแห่งหนึ่ง' FROM c
)
INSERT INTO public.tbl_res_request (tcc_id, trr_status, trr_urgent, trr_signed_secgen, trr_sub_committee, trr_meeting_no, trr_agenda_no, trr_meeting_date)
SELECT tcc_id, '012', false, true, NULL, '37/2569', '4.6', '2026-08-20' FROM c;
