-- ==========================================================================
-- Fix two tbl_res_request rows whose trr_status used a main-line (7.1) status
-- code even though the case is on the 7.2 (วินิจฉัยชี้มูล) track (tracked by
-- assets/ecmis-app.js's mock CASES entries having procType:'7.2'/docType:'RULING').
--
-- Found while chasing a real user-reported bug: clicking "ดำเนินการ" for
-- 1119/2565 in inbox.html redirected to case-register.html instead of
-- ruling-report.html. Root cause: ECMIS.pageForCase72()/PAGE_FOR_72 only
-- recognizes _72-suffixed status codes; a 7.2 case stuck with a main-line
-- code (015 = RESOLVED, 011 = AGENDA_SET) falls through PAGE_FOR_72's lookup
-- and hits its 'case-register.html' fallback instead of the real page.
--
-- 1119/2565: trr_status 015 (RESOLVED)    -> 111 (RESOLVED_PENDING_72)
--   ("มีมติชี้มูลความผิดแล้ว รอจัดทำรายงานวินิจฉัยชี้มูล" - matches the case's
--   resolution72:'GUILTY_72' in the mock data)
-- 1396/2564: trr_status 011 (AGENDA_SET)  -> 109 (PENDING_INVITE_72)
--   ("รอจัดทำหนังสือเชิญประชุม" - the 7.2-track analog of AGENDA_SET)
--
-- assets/ecmis-app.js's mock CASES array had the identical bug for these two
-- ids (status:'RESOLVED'/'AGENDA_SET' instead of the _72 codes) and has been
-- corrected in the same session -- but that mock array only supplies fields
-- Supabase doesn't have (procType, docType, resolution72, ...) on top of a
-- real Supabase row; it never overrides `status` itself, so the JS-only fix
-- alone did not change what inbox.html actually renders for a case that has
-- a live Supabase row. Both sides needed fixing.
-- ==========================================================================

UPDATE public.tbl_res_request SET trr_status = '111'
WHERE trr_id IN (SELECT r.trr_id FROM public.tbl_res_request r JOIN public.tbl_cmp_case c ON c.tcc_id = r.tcc_id WHERE c.tcc_no = '1119/2565');

UPDATE public.tbl_res_request SET trr_status = '109'
WHERE trr_id IN (SELECT r.trr_id FROM public.tbl_res_request r JOIN public.tbl_cmp_case c ON c.tcc_id = r.tcc_id WHERE c.tcc_no = '1396/2564');
