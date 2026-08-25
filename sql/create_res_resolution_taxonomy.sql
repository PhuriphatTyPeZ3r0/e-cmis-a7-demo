-- ==========================================================================
-- SQL Migration & Seed Script: Resolution-Outcome Taxonomy (SSOT for Activity 7)
-- Replaces the hardcoded RESOLUTIONS / RESOLUTIONS_72 / RESOLUTIONS_73 /
-- FORWARD_TARGETS arrays in assets/ecmis-app.js with real, FK-constrained tables.
--
-- Every legal-basis citation below was verified against
-- "C:\6_Working\PMO1-03-08-2026\E-CMIS\diagram\Activity 7\law_pacc_68.pdf"
-- (พ.ร.บ. มาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. 2551
--  และที่แก้ไขเพิ่มเติม ถึงฉบับที่ 4 พ.ศ. 2568) during this session.
-- 3 citations that existed only in JS were found to be WRONG and are
-- corrected here (not carried over):
--   - RESOLUTIONS_73.REVIEW_PROSECUTOR_73 cited ม.33 (notice-of-allegation,
--     unrelated) -> corrected to ม.44 (prosecutor-disagreement escalation
--     to อัยการสูงสุด, the actual matching provision).
--   - RESOLUTIONS_72.FORWARD_NACC / STATUS label cited "ม.19(ข)(1)" -- ม.19
--     has no lettered subsections at all -> corrected to ม.18/3 ("ส่งเรื่อง
--     คืนเมื่อพบว่าไม่อยู่ในอำนาจ ภายใน 15 วันนับแต่วันที่ทราบ").
--   - RESOLUTIONS_72.MORE_INVESTIGATE_72 cited "ม.24 วรรคท้าย" -- the
--     "สั่งให้ไต่สวนเพิ่มเติม...ก็ได้" clause is actually the 4th paragraph,
--     not the last (6th) paragraph -> corrected note to "วรรคสี่".
-- ==========================================================================

-- ==========================================================================
-- 1. tbl_law_pacc_article -- verified reference list of PACC Act articles
--    actually cited by Activity 7's resolution/forward taxonomy.
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.tbl_law_pacc_article (
  tla_id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tla_article_no    text NOT NULL UNIQUE,
  tla_article_text  text NOT NULL,
  tla_topic         text NOT NULL,
  tla_source_doc    text NOT NULL DEFAULT 'law_pacc_68.pdf',
  tla_sort_order    integer NOT NULL DEFAULT 0,
  is_deleted        boolean NOT NULL DEFAULT false,
  created_datetime  timestamp NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tbl_law_pacc_article IS
  'ตาราง lookup มาตราของ พ.ร.บ.มาตรการฝ่ายบริหารฯ ที่ใช้อ้างอิงจริงในระบบมติกิจกรรมที่ 7 ทุกมาตราตรวจสอบตรงกับ law_pacc_68.pdf แล้วในเซสชันนี้ ห้ามเพิ่มมาตราที่ไม่ได้ตรวจสอบกับต้นฉบับ';
COMMENT ON COLUMN public.tbl_law_pacc_article.tla_article_no IS 'เลขมาตรา เช่น ม.32, ม.18/1 (unique)';
COMMENT ON COLUMN public.tbl_law_pacc_article.tla_article_text IS 'สรุปใจความสำคัญของมาตรา (ไม่ใช่คัดลอกเต็มบทบัญญัติ) อ้างอิงจาก law_pacc_68.pdf';
COMMENT ON COLUMN public.tbl_law_pacc_article.tla_topic IS 'หัวข้อ/เรื่องที่มาตรานี้ควบคุม ใช้แสดงในหน้าจอเลือกฐานกฎหมาย';
COMMENT ON COLUMN public.tbl_law_pacc_article.tla_source_doc IS 'ชื่อไฟล์ต้นฉบับกฎหมายที่ใช้ตรวจสอบ (ตรึงไว้ที่ law_pacc_68.pdf ตามข้อกำหนดห้ามสมมติมาตรา)';

INSERT INTO public.tbl_law_pacc_article
  (tla_article_no, tla_article_text, tla_topic, tla_sort_order) VALUES
  ('ม.17',   'อำนาจหน้าที่คณะกรรมการ ป.ป.ท.: (3) ไต่สวนและวินิจฉัยชี้มูล (4) พิจารณาวินิจฉัยชี้มูลตามสำนวนที่เห็นชอบแล้ว', 'อำนาจหน้าที่ไต่สวน/วินิจฉัยชี้มูล', 1),
  ('ม.18',   'อำนาจของคณะกรรมการ ป.ป.ท. ในการไต่สวน เช่น เรียกเอกสาร เรียกบุคคลให้ถ้อยคำ ขอหมายศาลตรวจค้น', 'อำนาจในการไต่สวน', 2),
  ('ม.18/1', 'ขั้นตอนเมื่อได้รับมอบหมายจาก ป.ป.ช. รวมถึง (ก)/(ข) การส่งเรื่องให้ ป.ป.ช. ภายใน 15 วัน และการคัดสำเนาสำนวนเก็บเป็นหลักฐาน', 'การดำเนินการเรื่องที่ ป.ป.ช. มอบหมาย', 3),
  ('ม.18/3', 'เมื่อพบว่าเรื่องที่ดำเนินการตาม ม.18/1 ไม่อยู่ในหน้าที่และอำนาจของคณะกรรมการ ป.ป.ท. ให้ส่งเรื่องคืนคณะกรรมการ ป.ป.ช. ภายใน 15 วันนับแต่วันที่ทราบ', 'ส่งเรื่องคืน ป.ป.ช. เมื่อพบว่านอกอำนาจ', 4),
  ('ม.18/4', 'เมื่อความปรากฏว่าเจ้าหน้าที่ของรัฐประพฤติมิชอบ ให้ดำเนินการไต่สวนเบื้องต้นหรือส่งให้ ป.ป.ช. แล้วแต่กรณี', 'จุดเริ่มต้นการไต่สวนเบื้องต้น', 5),
  ('ม.19',   'คณะกรรมการ ป.ป.ท. อาจแจ้งหน่วยงานให้จัดกรรมการ/เลขาธิการ/พนักงานเข้าถึงข้อมูลผู้ถูกกล่าวหาเพื่อประโยชน์ในการไต่สวน', 'อำนาจเข้าถึงข้อมูลเพื่อการไต่สวน', 6),
  ('ม.24',   'การไต่สวนดำเนินการเป็นองค์คณะ (วรรคหนึ่ง) หรือคณะอนุกรรมการไต่สวนกรณีสำคัญ/ซับซ้อน (วรรคสาม) และอาจสั่งไต่สวนเพิ่มเติม/ไต่สวนเองใหม่ (วรรคสี่)', 'องค์คณะไต่สวน/คณะอนุกรรมการไต่สวน', 7),
  ('ม.25',   'ห้ามมิให้คณะกรรมการ ป.ป.ท. รับหรือพิจารณาเรื่องที่เข้าเงื่อนไขต้องห้ามเด็ดขาด 5 กรณี (เช่น ป.ป.ช. รับไว้แล้ว, วินิจฉัยเสร็จเด็ดขาดแล้ว)', 'เหตุห้ามรับเรื่องไว้พิจารณาโดยเด็ดขาด', 8),
  ('ม.26',   'คณะกรรมการ ป.ป.ท. จะไม่รับหรือสั่งจำหน่ายเรื่องได้ตามดุลพินิจ เมื่อเข้าเงื่อนไข เช่น ไม่มีพยานหลักฐานเพียงพอ หรือไม่ใช่ความผิดวินัยร้ายแรง', 'เหตุไม่รับ/จำหน่ายเรื่องโดยดุลพินิจ', 9),
  ('ม.28',   'คณะกรรมการ ป.ป.ท. มอบหมายเลขาธิการฯ พิจารณารับ/ไม่รับเรื่องเบื้องต้น รายงานทุก 15 วัน ถ้าบอร์ดไม่มีมติเป็นอย่างอื่นภายใน 15 วัน ให้ถือว่าเห็นชอบ', 'มอบอำนาจเลขาธิการฯ กลั่นกรองรับเรื่องเบื้องต้น', 10),
  ('ม.32',   'เมื่อคณะกรรมการ ป.ป.ท. มีมติว่าข้อกล่าวหาใดไม่มีมูล ให้แจ้งผู้ถูกกล่าวหาทราบโดยเร็ว ไม่ช้ากว่า 15 วันนับแต่วันที่มีมติ', 'แจ้งผลข้อกล่าวหาไม่มีมูล', 11),
  ('ม.38',   'เมื่อมีมติวินิจฉัยชี้มูลว่ากระทำผิดวินัย ให้ประธานกรรมการแจ้งผู้บังคับบัญชา/ผู้มีอำนาจแต่งตั้งถอดถอนเพื่อพิจารณาโทษทางวินัย', 'ส่งเรื่องดำเนินการทางวินัย', 12),
  ('ม.43',   'ผู้ถูกลงโทษทางวินัยตาม ม.38 อุทธรณ์ต่อ ก.พ.ค. หาก ก.พ.ค. วินิจฉัยว่าอุทธรณ์ฟังขึ้น ส่งคำวินิจฉัยกลับให้คณะกรรมการ ป.ป.ท. พิจารณาทบทวน', 'ทบทวนมติวินัยเมื่อ ก.พ.ค. เห็นชอบอุทธรณ์', 13),
  ('ม.44',   'ส่งเรื่องให้พนักงานอัยการดำเนินคดีอาญาต่อไป กรณีอัยการเห็นควรสั่งไม่ฟ้องแต่บอร์ดยืนยันให้ฟ้อง ให้ส่งอัยการสูงสุดวินิจฉัยเป็นที่สุด (ใช้บังคับกับการไม่อุทธรณ์/ไม่ฎีกาโดยอนุโลมด้วย)', 'ส่งเรื่องดำเนินคดีอาญา/ทบทวนมติอัยการ', 14),
  ('ม.45',   'กรณีผู้ถูกกล่าวหาอยู่ในอำนาจศาลทหาร การดำเนินคดีอาญาตาม ม.44 ให้เป็นหน้าที่ของอัยการทหาร', 'เขตอำนาจศาลทหาร', 15),
  ('ม.54',   'คณะกรรมการ ป.ป.ท. แจ้งหน่วยงานที่เกี่ยวข้องจัดมาตรการคุ้มครองพยาน/ผู้กล่าวหา ให้ถือเป็นพยานที่มีสิทธิได้รับความคุ้มครองตามกฎหมายคุ้มครองพยานคดีอาญา', 'มาตรการคุ้มครองพยาน/ผู้กล่าวหา', 16)
ON CONFLICT (tla_article_no) DO NOTHING;

-- ==========================================================================
-- 2. tbl_res_resolution_type -- unified 7.1 / 7.2 / 7.3 resolution-outcome
--    taxonomy (replaces RESOLUTIONS / RESOLUTIONS_72 / RESOLUTIONS_73 in JS).
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.tbl_res_resolution_type (
  trrt_id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trrt_proc_type          text NOT NULL CHECK (trrt_proc_type IN ('7.1','7.2','7.3')),
  trrt_code               text NOT NULL,
  trrt_group              text NOT NULL,
  trrt_label              text NOT NULL,
  trrt_doc_name           text NOT NULL,
  trrt_signer             text NOT NULL DEFAULT '—',
  trrt_notice_days        smallint NOT NULL DEFAULT 0,
  trrt_notice_basis       text NOT NULL DEFAULT '—',
  trrt_needs_law_ref      boolean NOT NULL DEFAULT false,
  trrt_needs_destination  boolean NOT NULL DEFAULT false,
  trrt_requires_reason    boolean NOT NULL DEFAULT false,
  trrt_reason_note        text NOT NULL DEFAULT '—',
  trrt_needs_guilty_track boolean NOT NULL DEFAULT false,
  trrt_sort_order         integer NOT NULL DEFAULT 0,
  is_deleted              boolean NOT NULL DEFAULT false,
  created_datetime        timestamp NOT NULL DEFAULT now(),
  UNIQUE (trrt_proc_type, trrt_code)
);

COMMENT ON TABLE public.tbl_res_resolution_type IS
  'ตาราง lookup มติ/ผลการพิจารณาที่บอร์ดเลือกได้ ครอบคลุมทั้ง 7.1/7.2/7.3 แทนอาเรย์ RESOLUTIONS/RESOLUTIONS_72/RESOLUTIONS_73 เดิมใน assets/ecmis-app.js — ฐานกฎหมายของแต่ละมติอยู่ใน tbl_res_resolution_type_law (many-to-many) ไม่ใช่คอลัมน์ข้อความอิสระ เพื่อป้องกันการอ้างมาตราผิด';
COMMENT ON COLUMN public.tbl_res_resolution_type.trrt_proc_type IS 'สายกระบวนงาน: 7.1 ไต่สวนเบื้องต้น / 7.2 วินิจฉัยชี้มูล / 7.3 เรื่องทั่วไป';
COMMENT ON COLUMN public.tbl_res_resolution_type.trrt_code IS 'รหัสมติ เช่น GUILTY_72, NO_MERIT_72 (unique ภายใน proc_type เดียวกัน)';
COMMENT ON COLUMN public.tbl_res_resolution_type.trrt_notice_days IS 'จำนวนวันที่ต้องแจ้งผลผู้ถูกกล่าวหา (0 = ไม่มีข้อกำหนดแจ้งผลตามมาตรานี้)';
COMMENT ON COLUMN public.tbl_res_resolution_type.trrt_needs_destination IS 'มตินี้ต้องระบุปลายทางส่งเรื่องเพิ่มเติมหรือไม่ (เชื่อมกับ tbl_res_forward_target)';
COMMENT ON COLUMN public.tbl_res_resolution_type.trrt_needs_guilty_track IS 'มตินี้ต้องแยกติดตามสายอาญา/สายวินัยแยกกันหรือไม่ (ใช้ในกรณีชี้มูลความผิด)';

INSERT INTO public.tbl_res_resolution_type
  (trrt_proc_type, trrt_code, trrt_group, trrt_label, trrt_doc_name, trrt_signer,
   trrt_notice_days, trrt_notice_basis, trrt_needs_law_ref, trrt_needs_destination,
   trrt_requires_reason, trrt_reason_note, trrt_needs_guilty_track, trrt_sort_order)
VALUES
  ('7.1', 'ACCEPT_S24P1',  'รับไว้ไต่สวน', 'รับไว้ไต่สวน — ดำเนินการเป็นองค์คณะ (ม.24 วรรคหนึ่ง)', 'คำสั่งแต่งตั้งองค์คณะพนักงาน ป.ป.ท. (ปปท. ๕-๐๑)', 'เลขาธิการฯ', 0, '—', false, false, false, '—', false, 1),
  ('7.1', 'ACCEPT_S24P3',  'รับไว้ไต่สวน', 'รับไว้ไต่สวน — ดำเนินการเป็นคณะอนุกรรมการไต่สวน (ม.24 วรรคสาม)', 'คำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน (ปปท. ๕-๐๔)', 'ประธานกรรมการ ป.ป.ท.', 0, '—', false, false, false, '—', false, 2),
  ('7.1', 'NOT_ACCEPTED',  'ไม่รับเรื่องไว้พิจารณา', 'ไม่รับเรื่องไว้พิจารณา (ม.25 ห้ามเด็ดขาด / ม.26 ดุลพินิจ)', 'หนังสือแจ้งผลการพิจารณา (ระบุมาตราที่อ้าง)', '—', 0, '—', true, false, false, '—', false, 3),
  ('7.1', 'DISMISS',       'ไม่รับเรื่องไว้พิจารณา', 'สั่งจำหน่ายเรื่อง (ม.26 ประกอบ ม.28)', 'หนังสือแจ้งคำสั่งจำหน่ายเรื่อง', '—', 0, '—', true, false, false, '—', false, 4),
  ('7.1', 'NO_GROUND',     'ข้อกล่าวหาไม่มีมูล', 'ข้อกล่าวหาไม่มีมูล — ข้อกล่าวหาเป็นอันตกไป (ม.32)', 'หนังสือแจ้งผลผู้ถูกกล่าวหา (ม.32 ไม่ช้ากว่า 15 วัน)', '—', 15, 'ม.32 — แจ้งผู้ถูกกล่าวหาไม่ช้ากว่า 15 วันนับแต่วันที่บอร์ดมีมติ', false, false, false, '—', false, 5),
  ('7.1', 'MORE_INVESTIGATE', 'มติอื่น ๆ', 'ให้ผู้รับผิดชอบสำนวนไต่สวนเบื้องต้นเพิ่มเติม (ม.24 วรรคสี่)', 'บันทึกแจ้งมติให้ไต่สวนเพิ่มเติม', '—', 0, '—', false, false, true, '"ให้ระบุเหตุผลของการดำเนินการดังกล่าวไว้ด้วย" — ม.24 วรรคสี่ บังคับให้มีเหตุผลกำกับเสมอ', false, 6),
  ('7.1', 'FORWARD',       'มติอื่น ๆ', 'ส่งเรื่องให้หน่วยงาน / คณะอนุกลั่นกรองฯ พิจารณา', 'หนังสือนำส่งเรื่อง', '—', 0, '—', false, true, false, '—', false, 7),

  ('7.2', 'FORWARD_NACC',  'ส่ง ป.ป.ช. (นอกอำนาจ)', 'ส่งเรื่องให้คณะกรรมการ ป.ป.ช. เนื่องจากอยู่ในหน้าที่และอำนาจของ ป.ป.ช.', 'หนังสือนำส่งเรื่องถึงสำนักงาน ป.ป.ช.', 'ประธานกรรมการ ป.ป.ท.', 15, 'ม.18/3 — ส่งเรื่องพร้อมสำนวนคืนคณะกรรมการ ป.ป.ช. ภายใน 15 วันนับแต่วันที่ทราบว่าไม่อยู่ในอำนาจ', false, false, false, '—', false, 1),
  ('7.2', 'MORE_INVESTIGATE_72', 'ให้ไต่สวนเพิ่มเติม', 'ให้ไต่สวนเพิ่มเติม หรือไต่สวนเองใหม่ทั้งหมดหรือบางส่วน', 'บันทึกแจ้งมติให้ไต่สวนเพิ่มเติม (ระบุเหตุผล)', '—', 0, '—', false, false, true, '"ให้ระบุเหตุผลของการดำเนินการดังกล่าวไว้ด้วย" — ม.24 วรรคสี่ บังคับให้มีเหตุผลกำกับเสมอ', false, 2),
  ('7.2', 'NO_MERIT_72',   'ยุติเรื่อง', 'ข้อกล่าวหาไม่มีมูล — ข้อกล่าวหาเป็นอันตกไป', 'หนังสือแจ้งผลผู้ถูกกล่าวหา', '—', 15, 'ม.32 — แจ้งให้ผู้ถูกกล่าวหาทราบโดยเร็ว ไม่ช้ากว่า 15 วันนับแต่วันที่คณะกรรมการ ป.ป.ท. มีมติ', false, false, false, '—', false, 3),
  ('7.2', 'GUILTY_72',     'ชี้มูลความผิด', 'วินิจฉัยชี้มูลความผิด (อาญา และ/หรือ วินัย)', 'รายงานการไต่สวนและวินิจฉัยชี้มูล', 'ประธานกรรมการ ป.ป.ท.', 0, '—', false, false, false, '—', true, 4),

  ('7.3', 'APPROVE_73',    'อนุมัติ', 'อนุมัติ / เห็นชอบตามเสนอ', 'บันทึกแจ้งมติอนุมัติ', 'ประธานกรรมการ ป.ป.ท.', 0, '—', false, false, false, '—', false, 1),
  ('7.3', 'REJECT_73',     'ไม่อนุมัติ', 'ไม่อนุมัติ / ให้ยุติเรื่อง', 'บันทึกแจ้งมติไม่อนุมัติ', '—', 0, '—', false, false, false, '—', false, 2),
  ('7.3', 'REVIEW_PROSECUTOR_73', 'ทบทวนมติอัยการ', 'ขอทบทวนมติพนักงานอัยการ (ยืนยันข้อกล่าวหา / มีมติฟ้องคดีเอง)', 'หนังสือขอให้ทบทวนมติถึงพนักงานอัยการ', 'ประธานกรรมการ ป.ป.ท.', 0, '—', false, false, false, '—', false, 3),
  ('7.3', 'LEGAL_DIVISION_73', 'ส่งกองกฎหมาย', 'ส่งกองกฎหมายเพื่อตรวจสอบและให้ความเห็นทางข้อกฎหมายก่อน', 'บันทึกส่งกองกฎหมายพิจารณา', '—', 0, '—', false, false, false, '—', false, 4),
  ('7.3', 'SPECIAL_TASK_73', 'เฉพาะกิจอื่น ๆ', 'แต่งตั้งคณะทำงานเฉพาะกิจ / มอบหมายดำเนินการเฉพาะเรื่อง', 'คำสั่งแต่งตั้ง / บันทึกมอบหมายงาน', 'ประธานกรรมการ ป.ป.ท.', 0, '—', false, false, false, '—', false, 5)
ON CONFLICT (trrt_proc_type, trrt_code) DO NOTHING;

-- ==========================================================================
-- 3. tbl_res_resolution_type_law -- junction: which verified article(s)
--    back each resolution type (supports multi-citation rows like GUILTY_72).
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.tbl_res_resolution_type_law (
  trrtl_id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trrt_id           bigint NOT NULL REFERENCES public.tbl_res_resolution_type(trrt_id),
  tla_id            bigint NOT NULL REFERENCES public.tbl_law_pacc_article(tla_id),
  trrtl_note        text NOT NULL DEFAULT '—',
  is_deleted        boolean NOT NULL DEFAULT false,
  created_datetime  timestamp NOT NULL DEFAULT now(),
  UNIQUE (trrt_id, tla_id)
);

COMMENT ON TABLE public.tbl_res_resolution_type_law IS
  'เชื่อมมติ (tbl_res_resolution_type) กับมาตรากฎหมายที่ใช้อ้างอิงจริง (tbl_law_pacc_article) แบบ many-to-many — มติเดียวอ้างได้หลายมาตรา เช่น GUILTY_72 อ้างทั้ง ม.17(3)(4)/ม.38/ม.44';
COMMENT ON COLUMN public.tbl_res_resolution_type_law.trrtl_note IS 'รายละเอียดวรรค/อนุมาตราเฉพาะจุดของการอ้างอิงนี้ เช่น "(3)(4)", "วรรคสาม" — ระดับความละเอียดที่ไม่ควรใส่ในตารางมาตราหลัก';

INSERT INTO public.tbl_res_resolution_type_law (trrt_id, tla_id, trrtl_note)
SELECT rt.trrt_id, la.tla_id, v.note
FROM (VALUES
  ('7.1','ACCEPT_S24P1','ม.24','วรรคหนึ่ง — องค์คณะพนักงาน ป.ป.ท.'),
  ('7.1','ACCEPT_S24P3','ม.24','วรรคสาม — คณะอนุกรรมการไต่สวน'),
  ('7.1','NOT_ACCEPTED','ม.25','เหตุห้ามรับเรื่องไว้พิจารณาโดยเด็ดขาด (5 กรณี)'),
  ('7.1','NOT_ACCEPTED','ม.26','เหตุไม่รับเรื่องไว้พิจารณาโดยดุลพินิจ'),
  ('7.1','DISMISS','ม.26','เหตุจำหน่ายเรื่องโดยดุลพินิจ'),
  ('7.1','DISMISS','ม.28','ประกอบการรายงานเลขาธิการฯ ทุก 15 วัน'),
  ('7.1','NO_GROUND','ม.32','แจ้งผลไม่ช้ากว่า 15 วันนับแต่วันที่มีมติ'),
  ('7.1','MORE_INVESTIGATE','ม.24','วรรคสี่ — สั่งไต่สวนเพิ่มเติมหรือไต่สวนเองใหม่'),
  ('7.2','FORWARD_NACC','ม.18/3','ส่งเรื่องคืน ป.ป.ช. ภายใน 15 วันนับแต่วันที่ทราบว่านอกอำนาจ'),
  ('7.2','MORE_INVESTIGATE_72','ม.24','วรรคสี่ — สั่งไต่สวนเพิ่มเติมหรือไต่สวนเองใหม่'),
  ('7.2','NO_MERIT_72','ม.32','แจ้งผลไม่ช้ากว่า 15 วันนับแต่วันที่มีมติ'),
  ('7.2','GUILTY_72','ม.17','(3)(4) — ไต่สวนและวินิจฉัยชี้มูล'),
  ('7.2','GUILTY_72','ม.38','ส่งเรื่องดำเนินการทางวินัย'),
  ('7.2','GUILTY_72','ม.44','ส่งเรื่องดำเนินคดีอาญา'),
  ('7.3','REVIEW_PROSECUTOR_73','ม.44','กรณีอัยการเห็นควรสั่งไม่ฟ้องแต่บอร์ดยืนยันให้ฟ้อง ส่งอัยการสูงสุดวินิจฉัยเป็นที่สุด')
) AS v(proc_type, code, article_no, note)
JOIN public.tbl_res_resolution_type rt ON rt.trrt_proc_type = v.proc_type AND rt.trrt_code = v.code
JOIN public.tbl_law_pacc_article la ON la.tla_article_no = v.article_no
ON CONFLICT (trrt_id, tla_id) DO NOTHING;

-- ==========================================================================
-- 4. tbl_res_forward_target -- external/internal dispatch destinations
--    (replaces FORWARD_TARGETS array in JS).
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.tbl_res_forward_target (
  trft_id                     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trft_code                   text NOT NULL UNIQUE,
  trft_label                  text NOT NULL,
  trft_external                boolean NOT NULL DEFAULT false,
  trft_require_signed_scan    boolean NOT NULL DEFAULT false,
  trft_require_archive_copy   boolean NOT NULL DEFAULT false,
  trft_statutory_sla_days     smallint NOT NULL DEFAULT 0,
  trft_statutory_basis        text NOT NULL DEFAULT '—',
  trft_statutory_law_article_id bigint REFERENCES public.tbl_law_pacc_article(tla_id),
  trft_tracking_sla_days      smallint NOT NULL DEFAULT 0,
  trft_tracking_basis         text NOT NULL DEFAULT '—',
  trft_archive_basis          text NOT NULL DEFAULT '—',
  trft_archive_law_article_id bigint REFERENCES public.tbl_law_pacc_article(tla_id),
  trft_doc_name                text NOT NULL,
  trft_sort_order              integer NOT NULL DEFAULT 0,
  is_deleted                   boolean NOT NULL DEFAULT false,
  created_datetime             timestamp NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tbl_res_forward_target IS
  'ปลายทางการส่งเรื่องเมื่อมติเป็น FORWARD (trrt_needs_destination=true) แทนอาเรย์ FORWARD_TARGETS เดิมใน assets/ecmis-app.js';
COMMENT ON COLUMN public.tbl_res_forward_target.trft_external IS 'ปลายทางอยู่นอกสำนักงาน ป.ป.ท. หรือไม่ (true = ต้องรอไฟล์สแกนฉบับลงนามกลับ)';
COMMENT ON COLUMN public.tbl_res_forward_target.trft_statutory_sla_days IS 'เพดานวันตามกฎหมาย (ขยายไม่ได้) 0 = ไม่มีเพดานตามกฎหมาย มีแต่กรอบติดตามภายใน';
COMMENT ON COLUMN public.tbl_res_forward_target.trft_tracking_sla_days IS 'กรอบวันติดตามเชิงบริหารภายในสำนักงาน (ไม่ใช่เพดานตามกฎหมาย)';

INSERT INTO public.tbl_res_forward_target
  (trft_code, trft_label, trft_external, trft_require_signed_scan, trft_require_archive_copy,
   trft_statutory_sla_days, trft_statutory_basis, trft_statutory_law_article_id,
   trft_tracking_sla_days, trft_tracking_basis, trft_archive_basis, trft_archive_law_article_id,
   trft_doc_name, trft_sort_order)
SELECT 'NACC', 'สำนักงาน ป.ป.ช. (นอกอำนาจ ป.ป.ท.)', true, true, true,
       15, 'ม.18/1 (ก)(3) / (ข)(1) / (ข)(3) — ส่งสำนวนภายใน 15 วัน กำหนดตายตัวตามกฎหมาย ขยายไม่ได้', la1.tla_id,
       30, 'เล่ม 6 กิจกรรมที่ 8 · CHK011 — กรอบกำกับติดตาม 30 วันนับแต่วันที่ได้รับมติ (มิใช่กำหนดส่ง)',
       'ม.18/1 — ต้องคัดสำเนาสำนวนเก็บรักษาไว้เป็นหลักฐาน', la2.tla_id,
       'หนังสือนำส่งสำนวนถึงสำนักงาน ป.ป.ช.', 1
FROM public.tbl_law_pacc_article la1, public.tbl_law_pacc_article la2
WHERE la1.tla_article_no = 'ม.18/1' AND la2.tla_article_no = 'ม.18/1'
ON CONFLICT (trft_code) DO NOTHING;

INSERT INTO public.tbl_res_forward_target
  (trft_code, trft_label, trft_external, trft_require_signed_scan, trft_require_archive_copy,
   trft_statutory_sla_days, trft_statutory_basis, trft_tracking_sla_days, trft_tracking_basis,
   trft_archive_basis, trft_doc_name, trft_sort_order)
VALUES
  ('SCREENING', 'คณะอนุกรรมการกลั่นกรองเรื่องไต่สวนข้อเท็จจริง', false, false, false,
   0, '—', 15, 'กรอบกำกับติดตามเชิงบริหารภายในสำนักงาน — กฎหมายไม่ได้กำหนดเส้นตายไว้',
   '—', 'บันทึกส่งเรื่องเข้าคณะอนุกลั่นกรองฯ', 2),
  ('LEGAL', 'กองกฎหมาย (กกม.)', false, false, false,
   0, '—', 15, 'กรอบกำกับติดตามเชิงบริหารภายในสำนักงาน — กฎหมายไม่ได้กำหนดเส้นตายไว้',
   '—', 'บันทึกขอความเห็นทางกฎหมาย', 3),
  ('OTHER', 'อื่นๆ (ระบุปลายทาง)', false, false, false,
   0, '—', 15, 'กรอบกำกับติดตามเชิงบริหารภายในสำนักงาน — ปลายทางนอกรายการมาตรฐาน ผู้บันทึกกำหนดกรอบเองตามความเหมาะสม',
   '—', 'บันทึกส่งเรื่อง (ระบุปลายทางเอง)', 4)
ON CONFLICT (trft_code) DO NOTHING;

-- ==========================================================================
-- 5. Covering indexes on the FKs introduced above (naming convention: idx_)
-- ==========================================================================
CREATE INDEX IF NOT EXISTS idx_res_resolution_type_law_tla ON public.tbl_res_resolution_type_law (tla_id);
CREATE INDEX IF NOT EXISTS idx_res_forward_target_statutory_law ON public.tbl_res_forward_target (trft_statutory_law_article_id);
CREATE INDEX IF NOT EXISTS idx_res_forward_target_archive_law ON public.tbl_res_forward_target (trft_archive_law_article_id);

-- ==========================================================================
-- 6. RLS: these are read-only lookup tables (like tbl_res_offense_basis) --
--    anon_select only, no write policy for the demo's anon-key client.
-- ==========================================================================
CREATE POLICY anon_select ON public.tbl_law_pacc_article FOR SELECT TO anon USING (true);
CREATE POLICY anon_select ON public.tbl_res_resolution_type FOR SELECT TO anon USING (true);
CREATE POLICY anon_select ON public.tbl_res_resolution_type_law FOR SELECT TO anon USING (true);
CREATE POLICY anon_select ON public.tbl_res_forward_target FOR SELECT TO anon USING (true);
