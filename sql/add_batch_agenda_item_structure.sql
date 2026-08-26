-- ==========================================================================
-- Batch agenda-item structure, sourced from a real board agenda order
-- ("ระเบียบวาระการประชุม.pdf", ครั้งที่ 56/2568) analyzed this session.
--
-- That document showed most 7.1 preliminary-inquiry agenda items are NOT
-- one case per item -- they're batches of 2-9 cases sharing one agenda
-- number, tagged with independent qualifiers along 3 axes (case nature /
-- screening-subcommittee stance / routing outcome), presented by a named
-- team, each with its own attached schedule table (บัญชีแนบ: ลำดับที่ /
-- เรื่องที่ / สำนัก-กอง-เขต / หมายเหตุ).
--
-- tbl_res_calendar_item_case already exists as the right many-to-many
-- shape (agenda item <-> case) and already holds some multi-case links --
-- this migration adds what was missing: the per-case remark column (the
-- บัญชีแนบ table's "หมายเหตุ" column), a presenter list, and a proper
-- FK-constrained qualifier-tag vocabulary (replacing free-text regex
-- heuristics like isBundled()/isFlagged() with real structured data).
-- ==========================================================================

-- 1. Qualifier lookup (fixed vocabulary, matches the real document's
--    exact wording) + the junction linking items to their tags.
CREATE TABLE IF NOT EXISTS public.tbl_res_agenda_qualifier (
  trqf_id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trqf_code         text NOT NULL UNIQUE,
  trqf_group        text NOT NULL CHECK (trqf_group IN ('nature','subcommittee_stance','routing')),
  trqf_label        text NOT NULL,
  trqf_sort_order   integer NOT NULL DEFAULT 0,
  is_deleted        boolean NOT NULL DEFAULT false,
  created_datetime  timestamp NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tbl_res_agenda_qualifier IS
  'คำอธิบายวงเล็บที่ติดกับแต่ละวาระ/ชุดวาระ (เช่น "(กรณีไม่รับไว้ไต่สวน) (คดีประพฤติมิชอบ)") อ้างอิงจากระเบียบวาระการประชุม.pdf จริง แบ่งเป็น 3 แกนอิสระ: nature (ลักษณะเรื่อง), subcommittee_stance (ท่าทีของคณะอนุกรรมการกลั่นกรองฯ), routing (ผลลัพธ์การส่งต่อ) — วาระหนึ่งติดได้หลายป้ายพร้อมกัน';
COMMENT ON COLUMN public.tbl_res_agenda_qualifier.trqf_group IS 'แกนของป้าย: nature=ลักษณะเรื่อง, subcommittee_stance=ท่าทีอนุกรรมการกลั่นกรอง, routing=ผลการส่งต่อ';

INSERT INTO public.tbl_res_agenda_qualifier (trqf_code, trqf_group, trqf_label, trqf_sort_order) VALUES
  ('ACCEPT_M18_4',      'nature',               'กรณีรับเรื่องตามมาตรา ๑๘/๔',                                   1),
  ('MISCONDUCT_CASE',   'nature',               'คดีประพฤติมิชอบ',                                              2),
  ('SUBCMT_AGREE',      'subcommittee_stance',  'กรณีคณะอนุกรรมการกลั่นกรองมีความเห็นสอดคล้อง',                  3),
  ('SUBCMT_DISSENT',    'subcommittee_stance',  'กรณีคณะอนุกรรมการกลั่นกรองมีความเห็นแย้ง',                      4),
  ('SUBCMT_MORE_INQUIRY','subcommittee_stance', 'กรณีคณะอนุกรรมการกลั่นกรองมีความเห็นให้ไต่สวนเบื้องต้นเพิ่มเติม', 5),
  ('NOT_ACCEPTED',      'routing',              'กรณีไม่รับไว้ไต่สวน',                                          6),
  ('FORWARD_NACC',      'routing',              'กรณีส่งเรื่องให้คณะกรรมการ ป.ป.ช.',                            7)
ON CONFLICT (trqf_code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.tbl_res_calendar_item_qualifier (
  trciq_id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trci_id           bigint NOT NULL REFERENCES public.tbl_res_calendar_item(trci_id),
  trqf_id           bigint NOT NULL REFERENCES public.tbl_res_agenda_qualifier(trqf_id),
  is_deleted        boolean NOT NULL DEFAULT false,
  created_datetime  timestamp NOT NULL DEFAULT now(),
  UNIQUE (trci_id, trqf_id)
);

COMMENT ON TABLE public.tbl_res_calendar_item_qualifier IS
  'ป้ายกำกับที่ติดอยู่กับวาระแต่ละรายการ (many-to-many กับ tbl_res_agenda_qualifier) — วาระหนึ่งติดได้หลายป้ายจากคนละแกน เช่น NOT_ACCEPTED + MISCONDUCT_CASE พร้อมกัน';

CREATE INDEX IF NOT EXISTS idx_res_calendar_item_qualifier_trqf ON public.tbl_res_calendar_item_qualifier (trqf_id);

-- 2. Presenter list on the agenda item itself (real document: "โดย [ชื่อ]
--    [ตำแหน่ง]", often several names for a batch item's presenting team).
ALTER TABLE public.tbl_res_calendar_item
  ADD COLUMN IF NOT EXISTS trci_presenters jsonb NOT NULL DEFAULT '[]'::jsonb;
COMMENT ON COLUMN public.tbl_res_calendar_item.trci_presenters IS
  'รายชื่อผู้ชี้แจงวาระนี้ (แยกจาก tcc_owner ของสำนวน) เก็บเป็น jsonb array ของ "ชื่อ ตำแหน่ง" เช่น ["นายกิตติพงษ์ ไชยยุทธ์ นักสืบสวนสอบสวนชำนาญการ กอท."] — วาระชุด (batch) มักมีทีมผู้ชี้แจงหลายคน';

-- 3. Per-case remark on the batch's attached schedule (บัญชีแนบ column
--    "หมายเหตุ") -- tbl_res_calendar_item_case had no such column.
ALTER TABLE public.tbl_res_calendar_item_case
  ADD COLUMN IF NOT EXISTS trcic_remark text NOT NULL DEFAULT '—';
COMMENT ON COLUMN public.tbl_res_calendar_item_case.trcic_remark IS
  'หมายเหตุรายเรื่องในบัญชีแนบของวาระชุด (คอลัมน์ "หมายเหตุ" ในระเบียบวาระการประชุม.pdf จริง)';

-- 4. RLS: both tables are read-only for now (anon_select only) — the current
--    UI only reads qualifiers in AgendaRegistry.load(); no screen tags/untags
--    an item's qualifiers yet. Add anon_insert/anon_delete on the junction
--    later, together with whatever UI first needs to write to it, instead of
--    granting unused write access ahead of time.
ALTER TABLE public.tbl_res_agenda_qualifier ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tbl_res_calendar_item_qualifier ENABLE ROW LEVEL SECURITY;
CREATE POLICY anon_select ON public.tbl_res_agenda_qualifier FOR SELECT TO anon USING (true);
CREATE POLICY anon_select ON public.tbl_res_calendar_item_qualifier FOR SELECT TO anon USING (true);
