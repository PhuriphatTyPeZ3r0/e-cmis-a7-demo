/*
 * Shared Supabase REST helpers for this project's test scripts — used by both
 * scripts/test-persistence-integration.js (data-layer integration test) and
 * tests-e2e/*.spec.js (Playwright browser E2E test). Extracted here instead of
 * duplicated so both suites share one soft-delete cleanup implementation.
 *
 * Uses Node's native fetch() against the Supabase PostgREST API — no new
 * runtime dependency — with the same anon/publishable key already hardcoded
 * client-side in the app pages themselves (not a new secret).
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljhabbwjxnoucrcrsoii.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_2Bps-dWMZHz_7cs3BppF6A_ul1_A_xd';

let seedSeq = 0;

async function sbFetch(pathAndQuery, opts = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${pathAndQuery}`;
  const headers = Object.assign(
    {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    opts.headers || {}
  );
  const res = await fetch(url, Object.assign({}, opts, { headers }));
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (e) { data = text; }
  }
  return { ok: res.ok, status: res.status, data };
}

/* สร้าง fixture เคสทดสอบของตัวเอง — tcc_id/trr_id เป็น auto-generated
   (IDENTITY ALWAYS / nextval sequence ตามลำดับ ยืนยันจาก information_schema
   แล้วก่อนออกแบบ) จึง insert ได้โดยไม่ต้องคำนวณ id เอง.
   `tagPrefix` แยก namespace ของ fixture ระหว่าง suite ต่างๆ (เช่น
   TEST-INTEGRATION- กับ TEST-E2E-) ให้ query เพื่อตรวจ/เคลียร์ทีหลังทำแยกกันได้ง่าย.
   `extraCaseFields` ใช้เติมคอลัมน์เพิ่มเติมบน tbl_cmp_case (เช่น tcc_doc_type/
   tcc_legal_base สำหรับ fixture สาย 7.3 ที่ pickTemplate()/isCase73() ต้องใช้แยก kind) */
async function seedCase(status, label, opts = {}) {
  const tagPrefix = opts.tagPrefix || 'TEST-INTEGRATION';
  const extraCaseFields = opts.extraCaseFields || {};
  seedSeq++;
  const tccNo = `${tagPrefix}-${Date.now()}-${seedSeq}`;
  const insCase = await sbFetch('tbl_cmp_case', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(Object.assign(
      { tcc_no: tccNo, tcc_subject: `[Automated Test Fixture] ${label}` },
      extraCaseFields
    ))
  });
  if (!insCase.ok || !insCase.data || !insCase.data[0]) {
    throw new Error(`seedCase(${label}): insert tbl_cmp_case failed — ${JSON.stringify(insCase.data)}`);
  }
  const tccId = insCase.data[0].tcc_id;

  const insReq = await sbFetch('tbl_res_request', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ tcc_id: tccId, trr_status: status })
  });
  if (!insReq.ok || !insReq.data || !insReq.data[0]) {
    throw new Error(`seedCase(${label}): insert tbl_res_request failed — ${JSON.stringify(insReq.data)}`);
  }
  const trrId = insReq.data[0].trr_id;

  return { tccId, trrId, tccNo };
}

/* RLS on this project only grants the anon/publishable key INSERT/SELECT/UPDATE on these
   3 tables (verified via pg_policies — no DELETE policy for anon at all), so a hard DELETE
   here would silently no-op (PostgREST returns 200 with 0 rows affected, not an error) and
   leave every fixture orphaned. Soft-delete via is_deleted instead — the same convention
   every read query in the app already uses (.eq('is_deleted', false)), so a soft-deleted
   fixture is invisible to the app even though the row physically remains.
   tbl_res_request_event has no anon UPDATE or DELETE policy at all, so the SIGNED/RESOLVED/
   RESOLVED_72 audit rows this suite creates can't be cleaned up by design — acceptable,
   since an audit trail is meant to be append-only/immutable anyway. */
async function cleanupCase(tccId, trrId) {
  if (trrId) {
    await sbFetch(`tbl_res_request?trr_id=eq.${trrId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_deleted: true })
    });
  }
  if (tccId) {
    await sbFetch(`tbl_cmp_case?tcc_id=eq.${tccId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_deleted: true })
    });
  }
}

async function logRequestEvent(trrId, fromStatus, toStatus, opts = {}) {
  return sbFetch('tbl_res_request_event', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      trr_id: trrId,
      trre_type: opts.type || 'STATUS_CHANGE',
      trre_from_status: fromStatus,
      trre_to_status: toStatus,
      trre_actor_role: opts.actorRole || null,
      trre_note: opts.note || null,
      trre_data: opts.data || null
    })
  });
}

async function getEvents(trrId) {
  const res = await sbFetch(`tbl_res_request_event?trr_id=eq.${trrId}&order=trre_id.asc`);
  return res.data || [];
}

async function getRequest(trrId) {
  const res = await sbFetch(`tbl_res_request?trr_id=eq.${trrId}`);
  return res.data && res.data[0];
}

/* Browser E2E tests (tests-e2e/*.spec.js) CANNOT use seedCase()'s synthetic tcc_no —
   ECMIS.requireCase() (assets/ecmis-app.js) checks the local mock CASES array
   SYNCHRONOUSLY on every page load and redirects away immediately if the id isn't
   found there, before the async Supabase refresh ever gets a chance to run (this is
   the exact same gap discovered manually this session with case 2018/2569 on
   chairman.html). So E2E fixtures must borrow a real, already mock-registered case id
   and temporarily overwrite its live tbl_res_request row, then restore the exact
   snapshotted values afterward — the same "borrow and revert" pattern used manually
   via SQL throughout the session that built the persistence layer this suite tests. */
async function seedExistingCase(tccNo, status, extraTrrFields = {}) {
  const caseRes = await sbFetch(`tbl_cmp_case?tcc_no=eq.${encodeURIComponent(tccNo)}`);
  if (!caseRes.ok || !caseRes.data || !caseRes.data[0]) {
    throw new Error(`seedExistingCase(${tccNo}): case not found in Supabase — pick a tcc_no that is both mock-registered (assets/ecmis-app.js CASES) and has a real tbl_res_request row`);
  }
  const tccId = caseRes.data[0].tcc_id;

  const reqRes = await sbFetch(`tbl_res_request?tcc_id=eq.${tccId}`);
  if (!reqRes.ok || !reqRes.data || !reqRes.data[0]) {
    throw new Error(`seedExistingCase(${tccNo}): no tbl_res_request row found for this case`);
  }
  const trrId = reqRes.data[0].trr_id;
  const snapshot = {
    trr_status: reqRes.data[0].trr_status,
    trr_resolution_stage: reqRes.data[0].trr_resolution_stage,
    trr_recorded_doc_html: reqRes.data[0].trr_recorded_doc_html,
    trr_resolution_data: reqRes.data[0].trr_resolution_data
  };

  const patch = Object.assign(
    { trr_status: status, trr_resolution_stage: null, trr_recorded_doc_html: null, trr_resolution_data: null },
    extraTrrFields
  );
  const upd = await sbFetch(`tbl_res_request?trr_id=eq.${trrId}`, { method: 'PATCH', body: JSON.stringify(patch) });
  if (!upd.ok) {
    throw new Error(`seedExistingCase(${tccNo}): failed to set seed status — ${JSON.stringify(upd.data)}`);
  }

  return { tccId, trrId, tccNo, snapshot };
}

/* Restores exactly the columns seedExistingCase() snapshotted before mutating — does
   NOT touch tbl_res_request_event (no anon UPDATE/DELETE policy on that table at all,
   confirmed via pg_policies; any SIGNED/RESOLVED/RESOLVED_72 rows a UI-driven E2E run
   creates against a real case's trr_id are an unavoidable, permanent side effect of
   testing through the real app code — which itself calls ECMIS.logRequestEvent() —
   not something this suite can clean up. Acceptable: an audit trail is append-only by
   design anyway.) */
async function restoreExistingCase(trrId, snapshot) {
  const res = await sbFetch(`tbl_res_request?trr_id=eq.${trrId}`, {
    method: 'PATCH',
    body: JSON.stringify(snapshot)
  });
  if (!res.ok) {
    throw new Error(`restoreExistingCase(trr_id=${trrId}): failed to restore original values — ${JSON.stringify(res.data)}`);
  }
}

module.exports = {
  SUPABASE_URL, SUPABASE_KEY,
  sbFetch, seedCase, cleanupCase, logRequestEvent, getEvents, getRequest,
  seedExistingCase, restoreExistingCase
};
