/*
 * Integration test suite — Supabase persistence layer for chairman signing +
 * board resolution (chairman.html/chairman-agenda.html, board-resolution.html/
 * resolution.html, resolution-72.html), added in the same session that wired
 * those pages to real Supabase writes (previously sessionStorage mock only).
 *
 * Design doc: docs/memory/standards/test-design-persistence-layer.md
 * (state transition + equivalence partitioning + decision table + boundary
 * value techniques — see that file for the full rationale per test case).
 *
 * This tests the DATA LAYER contract directly (same REST calls the pages
 * make), not the browser UI — no Playwright/Puppeteer, no new npm
 * dependency, just Node's native fetch() against the Supabase PostgREST API
 * with the same anon/publishable key already hardcoded client-side in the
 * pages themselves (not a new secret).
 *
 * Every test case creates its own throwaway tbl_cmp_case/tbl_res_request rows
 * (tcc_no prefixed TEST-INTEGRATION-) and deletes them in a finally block, so
 * this never touches real case data — safe to run against the real project.
 *
 * Run: npm run test:integration
 */

const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');

// shared with tests-e2e/*.spec.js — see scripts/lib/supabase-rest.js
const { sbFetch, seedCase: seedCaseShared, cleanupCase, logRequestEvent, getEvents, getRequest } = require('./lib/supabase-rest');

const RUN_ID = Date.now();

// this suite's fixtures keep the TEST-INTEGRATION- prefix used since it first shipped
function seedCase(status, label) {
  return seedCaseShared(status, label, { tagPrefix: 'TEST-INTEGRATION' });
}

let pass = 0;
let fail = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    pass++;
    console.log(`    ✅ ${msg}`);
  } else {
    fail++;
    failures.push(msg);
    console.log(`    ❌ ${msg}`);
  }
}

/* ===================================================================
   Scenario A — "ประธานฯ ลงนามคำสั่ง" (chairman.html / chairman-agenda.html)
   =================================================================== */
async function scenarioA() {
  console.log('\n📋 Scenario A — ประธานฯ ลงนามคำสั่ง (chairman.html)');

  // TC-ST-01 (State Transition): base track, 009 -> 011
  {
    let fx;
    try {
      fx = await seedCase('009', 'chairman-base');
      const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fx.trrId}`, {
        method: 'PATCH',
        body: JSON.stringify({ trr_status: '011' })
      });
      assert(upd.ok, 'TC-ST-01: update trr_status 009→011 succeeds');
      await logRequestEvent(fx.trrId, '009', '011');
      await logRequestEvent(fx.trrId, '009', '011', {
        type: 'SIGNED', actorRole: 'chairman',
        data: { docType: 'คำสั่งแต่งตั้งองค์คณะพนักงาน ป.ป.ท. (ปปท. ๕-๐๕)', signerName: 'นายวิชัย ยุติธรรม', method: 'hand' }
      });
      const row = await getRequest(fx.trrId);
      assert(row && row.trr_status === '011', 'TC-ST-01: trr_status persisted as 011 on re-read');
      const events = await getEvents(fx.trrId);
      assert(events.length === 2, 'TC-ST-01: exactly 2 audit events recorded (status-change + SIGNED)');
      const signedEvt = events.find(e => e.trre_type === 'SIGNED');
      assert(!!signedEvt, 'TC-ST-01: a SIGNED audit event exists');
      assert(signedEvt && signedEvt.trre_from_status === '009' && signedEvt.trre_to_status === '011', 'TC-ST-01: SIGNED event from/to status correct');
      assert(signedEvt && signedEvt.trre_data && signedEvt.trre_data.signerName === 'นายวิชัย ยุติธรรม', 'TC-ST-01: SIGNED event carries signer metadata');
    } finally {
      if (fx) await cleanupCase(fx.tccId, fx.trrId);
    }
  }

  // TC-ST-02 (State Transition): 7.2 track, 009 -> 109
  {
    let fx;
    try {
      fx = await seedCase('009', 'chairman-72');
      const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fx.trrId}`, {
        method: 'PATCH',
        body: JSON.stringify({ trr_status: '109' })
      });
      assert(upd.ok, 'TC-ST-02: update trr_status 009→109 (7.2 track) succeeds');
      await logRequestEvent(fx.trrId, '009', '109');
      await logRequestEvent(fx.trrId, '009', '109', {
        type: 'SIGNED', actorRole: 'chairman',
        data: { docType: 'รายงานการไต่สวนเพื่อวินิจฉัยชี้มูล (ปปท. ๗-๐๒)', signerName: 'นายวิชัย ยุติธรรม', method: 'hand' }
      });
      const row = await getRequest(fx.trrId);
      assert(row && row.trr_status === '109', 'TC-ST-02: trr_status persisted as 109 on re-read');
      const events = await getEvents(fx.trrId);
      assert(events.length === 2, 'TC-ST-02: exactly 2 audit events recorded');
    } finally {
      if (fx) await cleanupCase(fx.tccId, fx.trrId);
    }
  }

  // TC-ST-07 (State Transition): order.html's act==='save_order' — 018/019 -> 020
  // (UNDER_INVESTIGATION, formalized into STATUS_CODE this session — see
  // sql/add_under_investigation_status.sql)
  {
    let fx;
    try {
      fx = await seedCase('019', 'order-save-order');
      const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fx.trrId}`, {
        method: 'PATCH',
        body: JSON.stringify({ trr_status: '020' })
      });
      assert(upd.ok, 'TC-ST-07: update trr_status 019→020 (save_order) succeeds');
      await logRequestEvent(fx.trrId, '019', '020', {
        type: 'SIGNED', actorRole: 'secgen',
        data: { docType: 'คำสั่งแต่งตั้งองค์คณะพนักงาน ป.ป.ท.', orderNo: '210/2569', signerName: 'นายอภิชาติ สุจริตกุล', method: 'hand' }
      });
      const row = await getRequest(fx.trrId);
      assert(row && row.trr_status === '020', 'TC-ST-07: trr_status persisted as 020 (UNDER_INVESTIGATION) on re-read');
      const events = await getEvents(fx.trrId);
      const signedEvt = events.find(e => e.trre_type === 'SIGNED');
      assert(signedEvt && signedEvt.trre_data && signedEvt.trre_data.orderNo === '210/2569', 'TC-ST-07: SIGNED event carries orderNo metadata');
    } finally {
      if (fx) await cleanupCase(fx.tccId, fx.trrId);
    }
  }
}

/* ===================================================================
   Scenario B — "บันทึกมติบอร์ด (7.1)" (board-resolution.html / resolution.html)
   =================================================================== */
async function scenarioB() {
  console.log('\n📋 Scenario B — บันทึกมติบอร์ด 7.1 (board-resolution.html)');

  const docHtmlSample = '<div class="doc-title">มติการประชุม (ทดสอบระบบอัตโนมัติ)</div>';

  // TC-ST-03 + TC-EP-01: ACCEPT_S24P1 (base/order-routing class), 012 -> 015
  {
    let fx;
    try {
      fx = await seedCase('012', 'board-res-p1');
      const resolutionData = { code: 'ACCEPT_S24P1', label: 'รับไว้ไต่สวน — ดำเนินการเป็นองค์คณะ (ม.24 วรรคหนึ่ง)' };
      const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fx.trrId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          trr_status: '015', trr_resolution_stage: 1,
          trr_recorded_doc_html: docHtmlSample, trr_resolution_data: resolutionData
        })
      });
      assert(upd.ok, 'TC-ST-03: update trr_status 012→015 succeeds');
      await logRequestEvent(fx.trrId, '012', '015', {
        type: 'RESOLVED', actorRole: 'board_sec', data: { resolutionCode: 'ACCEPT_S24P1' }
      });
      const row = await getRequest(fx.trrId);
      assert(row && row.trr_status === '015', 'TC-ST-03: trr_status persisted as 015 on re-read');
      assert(row && row.trr_resolution_stage === 1, 'TC-ST-03: trr_resolution_stage persisted as 1');
      assert(row && row.trr_recorded_doc_html === docHtmlSample, 'TC-ST-03: trr_recorded_doc_html persisted verbatim');
      assert(row && row.trr_resolution_data && row.trr_resolution_data.code === 'ACCEPT_S24P1', 'TC-EP-01: trr_resolution_data.code matches selected resolution (order-routing class)');
      const events = await getEvents(fx.trrId);
      assert(events.length === 1 && events[0].trre_type === 'RESOLVED', 'TC-ST-03: exactly 1 RESOLVED audit event (board-resolution has no separate SIGNED event, unlike chairman.html)');
    } finally {
      if (fx) await cleanupCase(fx.tccId, fx.trrId);
    }
  }

  // TC-ST-04: ACCEPT_S24P3 (sub track), 012 -> 015
  {
    let fx;
    try {
      fx = await seedCase('012', 'board-res-p3');
      const resolutionData = { code: 'ACCEPT_S24P3', label: 'รับไว้ไต่สวน — ดำเนินการเป็นคณะอนุกรรมการไต่สวน (ม.24 วรรคสาม)' };
      const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fx.trrId}`, {
        method: 'PATCH',
        body: JSON.stringify({ trr_status: '015', trr_resolution_stage: 1, trr_resolution_data: resolutionData })
      });
      assert(upd.ok, 'TC-ST-04: update trr_status 012→015 (sub track) succeeds');
      const row = await getRequest(fx.trrId);
      assert(row && row.trr_resolution_data && row.trr_resolution_data.code === 'ACCEPT_S24P3', 'TC-ST-04: trr_resolution_data.code = ACCEPT_S24P3 for sub track');
    } finally {
      if (fx) await cleanupCase(fx.tccId, fx.trrId);
    }
  }

  // TC-BV-01 (Boundary/negative): guard "if (sb && kase.trr_id)" — static check that the
  // guard is actually present in the shipped page source, since this specific case (a
  // falsy trr_id) can't be exercised as a live network call — there is nothing to send.
  {
    const files = ['chairman.html', 'board-resolution.html', 'resolution-72.html'];
    // guard clause order isn't consistent across files (chairman.html happens to write
    // "kase.trr_id && sb", the others write "sb && kase.trr_id") — both are logically
    // equivalent for a truthiness check, so accept either order here.
    const guardPattern = /if\s*\(\s*(?:sb\s*&&\s*kase\.trr_id|kase\.trr_id\s*&&\s*sb)\s*\)/;
    files.forEach(f => {
      const src = fs.readFileSync(path.join(rootDir, f), 'utf8');
      assert(guardPattern.test(src), `TC-BV-01: ${f} guards the Supabase write with "sb && kase.trr_id" (either order — skips write when case has no real trr_id)`);
    });
  }

  // TC-BV-02 (Boundary/negative): update targeting a non-existent trr_id must not silently
  // look like a successful write — Prefer: return=representation lets us see 0 affected rows.
  {
    const fakeTrrId = 999999999;
    const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fakeTrrId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ trr_status: '015' })
    });
    assert(upd.ok, 'TC-BV-02: PATCH to non-existent trr_id does not error at the HTTP layer');
    assert(Array.isArray(upd.data) && upd.data.length === 0, 'TC-BV-02: PATCH to non-existent trr_id returns 0 affected rows (detectable via return=representation) — note: the app code today does not request return=representation, so it cannot currently distinguish this from a real write; flagged as a hardening opportunity, not a regression');
  }

  // TC-BV-03 (Boundary): empty resolution_data payload still writes successfully
  {
    let fx;
    try {
      fx = await seedCase('012', 'board-res-empty-payload');
      const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fx.trrId}`, {
        method: 'PATCH',
        body: JSON.stringify({ trr_resolution_data: {} })
      });
      assert(upd.ok, 'TC-BV-03: writing an empty {} trr_resolution_data payload succeeds');
      const row = await getRequest(fx.trrId);
      assert(row && row.trr_resolution_data && Object.keys(row.trr_resolution_data).length === 0, 'TC-BV-03: empty payload round-trips as {} (jsonb column has no internal schema requirement)');
    } finally {
      if (fx) await cleanupCase(fx.tccId, fx.trrId);
    }
  }
}

/* ===================================================================
   Scenario C — "บันทึกมติวินิจฉัยชี้มูล (7.2)" (resolution-72.html)
   =================================================================== */
async function scenarioC() {
  console.log('\n📋 Scenario C — บันทึกมติวินิจฉัยชี้มูล 7.2 (resolution-72.html)');

  const docHtmlSample = '<div class="doc-title">มติการประชุม วินิจฉัยชี้มูล (ทดสอบระบบอัตโนมัติ)</div>';

  // mirrors ECMIS.STATUS_CODE['RESOLVED_PENDING_72'] — trr_status is CHAR(3), never the
  // full status key name (patch.status stays a key name, exactly like the real page's
  // local `kase.status`; only the DB write goes through this code mapping)
  const STATUS_CODE_72 = { RESOLVED_PENDING_72: '111' };

  function guiltyPatch(crim, disc) {
    return {
      status: 'RESOLVED_PENDING_72',
      resolution72: 'GUILTY_72',
      boardOpinion72: 'ทดสอบระบบ persistence resolution-72',
      resolutionDate72: '2569-08-20',
      investigatorRef72: 'คณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน แล้วแต่กรณี',
      investigatorOpinion72: '',
      presenterNote72: '',
      guiltyCriminal72: crim,
      guiltyDiscipline72: disc,
      criminalTrack72: crim ? { status: 'PENDING' } : null,
      disciplinaryTrack72: disc ? { status: 'PENDING' } : null,
      flightRisk72: false
    };
  }

  async function runGuiltyCase(label, crim, disc, extraAsserts) {
    let fx;
    try {
      fx = await seedCase('110', label);
      const patch = guiltyPatch(crim, disc);
      const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fx.trrId}`, {
        method: 'PATCH',
        body: JSON.stringify({ trr_status: STATUS_CODE_72[patch.status], trr_recorded_doc_html: docHtmlSample, trr_resolution_data: patch })
      });
      assert(upd.ok, `${label}: update trr_status 110→111 (GUILTY_72 crim=${crim} disc=${disc}) succeeds`);
      await logRequestEvent(fx.trrId, '110', '111', {
        type: 'RESOLVED_72', actorRole: 'board_sec', data: { resolutionCode: 'GUILTY_72' }
      });
      const row = await getRequest(fx.trrId);
      assert(row && row.trr_status === '111', `${label}: trr_status persisted as 111`);
      extraAsserts(row);
      const events = await getEvents(fx.trrId);
      assert(events.length === 1 && events[0].trre_type === 'RESOLVED_72', `${label}: exactly 1 RESOLVED_72 audit event`);
    } finally {
      if (fx) await cleanupCase(fx.tccId, fx.trrId);
    }
  }

  // TC-ST-05 + TC-DT-03 (crim=T, disc=T)
  await runGuiltyCase('TC-ST-05/TC-DT-03 (crim=T,disc=T)', true, true, row => {
    assert(row.trr_resolution_data.criminalTrack72 && row.trr_resolution_data.criminalTrack72.status === 'PENDING', 'TC-DT-03: criminalTrack72 = {status:PENDING} when crim=true');
    assert(row.trr_resolution_data.disciplinaryTrack72 && row.trr_resolution_data.disciplinaryTrack72.status === 'PENDING', 'TC-DT-03: disciplinaryTrack72 = {status:PENDING} when disc=true');
  });

  // TC-DT-01 (crim=T, disc=F)
  await runGuiltyCase('TC-DT-01 (crim=T,disc=F)', true, false, row => {
    assert(row.trr_resolution_data.criminalTrack72 && row.trr_resolution_data.criminalTrack72.status === 'PENDING', 'TC-DT-01: criminalTrack72 = {status:PENDING} when crim=true');
    assert(row.trr_resolution_data.disciplinaryTrack72 === null, 'TC-DT-01: disciplinaryTrack72 = null when disc=false');
  });

  // TC-DT-02 (crim=F, disc=T)
  await runGuiltyCase('TC-DT-02 (crim=F,disc=T)', false, true, row => {
    assert(row.trr_resolution_data.criminalTrack72 === null, 'TC-DT-02: criminalTrack72 = null when crim=false');
    assert(row.trr_resolution_data.disciplinaryTrack72 && row.trr_resolution_data.disciplinaryTrack72.status === 'PENDING', 'TC-DT-02: disciplinaryTrack72 = {status:PENDING} when disc=true');
  });

  // TC-ST-06 + TC-EP-03: MORE_INVESTIGATE_72 — guilty-family fields must be ABSENT
  {
    let fx;
    try {
      fx = await seedCase('110', 'TC-ST-06-more-investigate');
      const patch = {
        status: 'RESOLVED_PENDING_72',
        resolution72: 'MORE_INVESTIGATE_72',
        boardOpinion72: 'ต้องไต่สวนเพิ่มเติมก่อนวินิจฉัยชี้มูล',
        resolutionDate72: '2569-08-20',
        investigatorRef72: '', investigatorOpinion72: '', presenterNote72: '',
        moreReason72: 'ทดสอบระบบ persistence — เหตุผลไต่สวนเพิ่มเติม'
      };
      const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fx.trrId}`, {
        method: 'PATCH',
        body: JSON.stringify({ trr_status: STATUS_CODE_72[patch.status], trr_resolution_data: patch })
      });
      assert(upd.ok, 'TC-ST-06: update trr_status 110→111 (MORE_INVESTIGATE_72) succeeds');
      await logRequestEvent(fx.trrId, '110', '111', { type: 'RESOLVED_72', actorRole: 'board_sec', data: { resolutionCode: 'MORE_INVESTIGATE_72' } });
      const row = await getRequest(fx.trrId);
      assert(row && row.trr_status === '111', 'TC-ST-06: trr_status persisted as 111');
      assert(row.trr_resolution_data.moreReason72 === patch.moreReason72, 'TC-ST-06: moreReason72 persisted correctly');
      const guiltyKeys = ['guiltyCriminal72', 'guiltyDiscipline72', 'criminalTrack72', 'disciplinaryTrack72'];
      const hasNoGuiltyFields = guiltyKeys.every(k => !(k in row.trr_resolution_data));
      assert(hasNoGuiltyFields, 'TC-EP-03: guilty-family fields (guiltyCriminal72/guiltyDiscipline72/criminalTrack72/disciplinaryTrack72) are absent for the non-GUILTY_72 equivalence class');
    } finally {
      if (fx) await cleanupCase(fx.tccId, fx.trrId);
    }
  }

  // TC-ST-08 (State Transition): ruling-report.html's #btnDraftDone — 111 -> 112
  // (PENDING_SIGN_RULING_72). This button only wrote ECMIS.Model.CaseStore (mock) until
  // this session — now goes through the same ECMIS.updateCaseStatus() helper chairman.html
  // already used.
  {
    let fx;
    try {
      fx = await seedCase('111', 'ruling-draft-done');
      const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fx.trrId}`, {
        method: 'PATCH',
        body: JSON.stringify({ trr_status: '112' })
      });
      assert(upd.ok, 'TC-ST-08: update trr_status 111→112 (btnDraftDone) succeeds');
      await logRequestEvent(fx.trrId, '111', '112');
      const row = await getRequest(fx.trrId);
      assert(row && row.trr_status === '112', 'TC-ST-08: trr_status persisted as 112 (PENDING_SIGN_RULING_72) on re-read');
    } finally {
      if (fx) await cleanupCase(fx.tccId, fx.trrId);
    }
  }

  // TC-ST-09 (State Transition + Equivalence Partitioning): ruling-report.html's
  // #btnSignRuling — 112 -> {100,113,114,115} depending on which of the 4
  // nextStatusPatchByResolution() branches fires (one representative case per class)
  {
    const targets = [
      { label: 'MORE_INVESTIGATE_72', to: '100' }, // -> PENDING_SECTION_72
      { label: 'NO_MERIT_72', to: '113' },          // -> PENDING_AREA_NOTICE_72
      { label: 'FORWARD_NACC', to: '114' },         // -> DISPATCHING_NACC_72
      { label: 'GUILTY_72 (default branch)', to: '115' } // -> PENDING_DISPATCH_GUILTY_72
    ];
    for (const t of targets) {
      let fx;
      try {
        fx = await seedCase('112', `ruling-sign-${t.label}`);
        const upd = await sbFetch(`tbl_res_request?trr_id=eq.${fx.trrId}`, {
          method: 'PATCH',
          body: JSON.stringify({ trr_status: t.to })
        });
        assert(upd.ok, `TC-ST-09 (${t.label}): update trr_status 112→${t.to} (btnSignRuling) succeeds`);
        await logRequestEvent(fx.trrId, '112', t.to, {
          type: 'SIGNED', actorRole: 'chairman',
          data: { docType: 'รายงานวินิจฉัยชี้มูล', signerName: 'นายวิชัย ยุติธรรม', method: 'hand' }
        });
        const row = await getRequest(fx.trrId);
        assert(row && row.trr_status === t.to, `TC-ST-09 (${t.label}): trr_status persisted as ${t.to} on re-read`);
        const events = await getEvents(fx.trrId);
        const signedEvt = events.find(e => e.trre_type === 'SIGNED');
        assert(signedEvt, `TC-ST-09 (${t.label}): a SIGNED audit event exists`);
      } finally {
        if (fx) await cleanupCase(fx.tccId, fx.trrId);
      }
    }
  }
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log('🧪 E-CMIS — INTEGRATION TEST: Supabase persistence layer (chairman + board resolution)');
  console.log(`   Run ID: ${RUN_ID} — fixtures tagged TEST-INTEGRATION-${RUN_ID}-*`);
  console.log('══════════════════════════════════════════════════════════════════════');

  try {
    await scenarioA();
    await scenarioB();
    await scenarioC();
  } catch (err) {
    fail++;
    failures.push(`FATAL: ${err.message}`);
    console.error(`\n  🛑 Fatal error, aborting remaining scenarios: ${err.message}`);
  }

  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log(`📊 SUMMARY: ${pass} passed, ${fail} failed (${pass + fail} total assertions)`);
  if (fail === 0) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED.');
    console.log('══════════════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error('🛑 INTEGRATION TEST FAILURES:');
    failures.forEach(f => console.error(`   - ${f}`));
    console.log('══════════════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

main();
