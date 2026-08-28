// seam-test.mjs — ทดสอบ logic ของ cases.js + handoff.js แบบไม่ต้องมีเบราว์เซอร์
// รัน: node seam-test.mjs
import fs from 'node:fs';
import vm from 'node:vm';

const ROOT = new URL('..', import.meta.url).pathname;
let pass = 0, fail = 0;
const ok  = (m) => { console.log('  ✓ ' + m); pass++; };
const bad = (m, extra) => { console.log('  ✗ ' + m + (extra ? '  → ' + extra : '')); fail++; };
const eq  = (m, a, b) => (JSON.stringify(a) === JSON.stringify(b)) ? ok(m) : bad(m, `got ${JSON.stringify(a)} want ${JSON.stringify(b)}`);

function makeEnv(href = 'http://x/ecmis-transform/board-resolution/inbox.html') {
  const store = new Map(), sess = new Map();
  const ls = {
    getItem: k => store.has(k) ? store.get(k) : null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k),
  };
  const ss = { getItem: k => sess.has(k) ? sess.get(k) : null, setItem: (k, v) => sess.set(k, String(v)) };
  const nav = [];
  const loc = new URL(href);
  const win = {
    localStorage: ls, sessionStorage: ss, URL, console,
    location: { get href(){ return loc.href; }, set href(v){ nav.push(v); },
                pathname: loc.pathname, search: loc.search },
    document: { readyState: 'complete', addEventListener(){}, currentScript: null,
                getElementsByTagName: () => [], querySelector: () => null,
                createElement: () => ({ setAttribute(){}, style:{}, classList:{add(){}} }),
                head: { appendChild(){} }, body: { appendChild(){}, insertBefore(){}, firstChild:null } },
    setTimeout: (fn) => { try { fn(); } catch(e){} },
    Swal: undefined, alert: () => {},
  };
  win.window = win;
  const ctx = vm.createContext(win);
  const run = f => vm.runInContext(fs.readFileSync(`${ROOT}/${f}`, 'utf8'), ctx, { filename: f });
  return { win, ctx, run, nav, store };
}

console.log('\n── ข้อ 6: getCase strict (ไม่คืน seed ให้ทุก id)');
{
  const { win, run } = makeEnv();
  run('cases.js');
  const H = win.ECMISHub;
  eq('getCase("0001/2569") คืนเคสกลาง', H.getCase('0001/2569')?.id, '0001/2569');
  eq('getCase("0001-2569") normalize ได้', H.getCase('0001-2569')?.id, '0001/2569');
  eq('getCase("9999/2569") คืน null (เดิมคืน seed)', H.getCase('9999/2569'), null);
  eq('getCase("") คืน null', H.getCase(''), null);
  eq('getCase(undefined) คืน null', H.getCase(undefined), null);
  eq('hasCase("9999/2569") = false', H.hasCase('9999/2569'), false);
  eq('getCaseOrSeed ยังยอม fallback เมื่อเรียกชื่อนี้ตรง ๆ', H.getCaseOrSeed('9999/2569')?.id, '0001/2569');
}

console.log('\n── saveCase: เคสใหม่ต้องไม่ถูก clone จาก seed');
{
  const { win, run } = makeEnv();
  run('cases.js');
  const H = win.ECMISHub;
  const before = H.getAllCases().length;
  H.saveCase({ id: '0002/2569', subject: 'เรื่องใหม่ทดสอบ' });
  const n = H.getCase('0002/2569');
  eq('เคสใหม่ id ถูก', n?.id, '0002/2569');
  eq('เคสใหม่ subject ถูก', n?.subject, 'เรื่องใหม่ทดสอบ');
  eq('เคสใหม่ไม่ติดผู้ถูกกล่าวหาของเคสกลางมา', n?.accused, undefined);
  eq('เคสกลางยังอยู่ครบ', H.getCase('0001/2569')?.accused?.startsWith('นายวิชัย ยอดทอง'), true);
  eq('ทะเบียนเพิ่มเคสใหม่หนึ่งรายการ', H.getAllCases().length, before + 1);
}

console.log('\n── ห้ามเขียน sessionStorage ecmis_cases (ก10 อ่านแล้ว CASES.length=0 ทิ้งเคสตัวเอง)');
{
  const { win, run } = makeEnv();
  run('cases.js');
  win.ECMISHub.saveCase({ id: '0003/2569', subject: 'x' });
  eq('cases.js ไม่แตะ sessionStorage ecmis_cases', win.sessionStorage.getItem('ecmis_cases'), null);
  eq('cases.js ไม่แตะ ecmis_cases_version', win.sessionStorage.getItem('ecmis_cases_version'), null);
}

console.log('\n── bridge ของ ก7/ก10: ต้องอยู่หลัง restore + sync กลับแบบ scoped');
{
  const src7  = fs.readFileSync(`${ROOT}/board-resolution/assets/ecmis-app.js`, 'utf8');
  const src10 = fs.readFileSync(`${ROOT}/legal-case/assets/ecmis-app.js`, 'utf8');

  const defAt  = src7.indexOf('function __hubBridgeCases');
  const restore= src7.indexOf('CASES.length = 0');
  const callAt = src7.indexOf('__hubBridgeCases();');
  eq('ก7: bridge ถูกเรียกหลัง CASES.length=0', callAt > restore, true);
  eq('ก7: นิยาม bridge ก่อนเรียก', defAt < callAt, true);
  eq('ก7: ไม่ดัมป์ CASES ทั้งชุดลงทะเบียนกลางแล้ว',
     /setItem\('ecmis-transform-cases-v1',\s*JSON\.stringify\(CASES\)\)/.test(src7), false);

  const r10 = src10.indexOf('CASES.length = 0');
  const b10 = src10.indexOf('bridgeFromHub');
  eq('ก10: มี bridge อ่านทะเบียนกลางแล้ว (เดิมไม่มีเลย)', b10 > -1, true);
  eq('ก10: bridge อยู่หลัง restore', b10 > r10, true);
  eq('ก10: sync กลับแบบ scoped ไม่ดัมป์ทั้งชุด',
     /setItem\('ecmis-transform-cases-v1',\s*JSON\.stringify\(CASES\)\)/.test(src10), false);
}

console.log('\n── ข้อ 9: ก7/ก10 สั่ง global.ECMIS = {…} ทับ แล้ว API ของ hub ต้องรอด');
{
  const { win, run } = makeEnv();
  run('cases.js');
  // จำลอง assets/ecmis-app.js ของ ก7 ที่ทับ ECMIS ทั้งก้อน + ประกาศ getCase ของตัวเอง
  const CASES = [{ id: '681610', subject: 'เคสของ ก7' }];
  win.ECMIS = { CASES, getCase: id => CASES.find(c => c.id === id) || CASES[0] };
  win.getCase = id => CASES.find(c => c.id === id) || CASES[0];
  win.ECMISHub.attachToECMIS();

  eq('ECMIS.saveCase กลับมาแล้ว', typeof win.ECMIS.saveCase, 'function');
  eq('ECMIS.addEvent กลับมาแล้ว', typeof win.ECMIS.addEvent, 'function');
  eq('ECMIS.getEvents กลับมาแล้ว', typeof win.ECMIS.getEvents, 'function');
  eq('ECMIS.getCase ของเจ้าบ้านยังทำงาน', win.ECMIS.getCase('681610')?.subject, 'เคสของ ก7');
  eq('ECMIS.getCase fallback ไปทะเบียนกลางได้', win.ECMIS.getCase('0001/2569')?.id, '0001/2569');
  eq('ECMISHub ไม่ถูกแตะ', win.ECMISHub.getCase('9999/2569'), null);
  eq('global getCase ของ ก7 ยังทับได้ตามเดิม (โค้ดกลางไม่พึ่งตัวนี้)', win.getCase('zzz')?.id, '681610');
}

console.log('\n── ข้อ 13: envelope ครบ 13 ฟิลด์ + ข้อ 7: ใช้เคสที่ active ไม่ hard-code');
{
  const { win, run, nav } = makeEnv('http://x/ecmis-transform/intake-investigation/staff-workflow.html?case=0007/2569');
  run('cases.js'); run('shared-assets/handoff.js');
  const H = win.ECMISHub, HO = win.ECMISHandoff;
  H.saveCase({ id: '0007/2569', subject: 'เคสทดสอบท่อ', status: 'อยู่ระหว่างไต่สวน' });

  const env = HO.send({
    caseId: H.activeCaseId(), from: 'intake-investigation', to: 'board-resolution',
    trigger: 'ไต่สวนเสร็จ ส่ง 213', docs: ['รายงาน 213', 'สำนวน'],
    statusAfter: 'รอบรรจุวาระ', slaDue: '30 วัน', patch: { report213: 'ส่งแล้ว' },
    action: 'ส่งรายงาน 213 → ก7',
  });

  eq('activeCaseId อ่านจาก ?case= ไม่ใช่ 0001/2569', H.activeCaseId(), '0007/2569');
  eq('envelope.caseId ตรงกับเคสที่เปิด', env.caseId, '0007/2569');
  const need = ['from','to','trigger','caseId','docs','statusBefore','statusAfter','ack','returnReason','revision','slaDue','action','by'];
  const miss = need.filter(k => !(k in env));
  eq('ฟิลด์ contract ครบ 13', miss, []);
  eq('statusBefore ถูกดึงจากสถานะเดิมอัตโนมัติ', env.statusBefore, 'อยู่ระหว่างไต่สวน');
  eq('revision เริ่มที่ 1', env.revision, 1);
  eq('navigate ไปปลายทางพร้อม ?case= ที่ถูก', nav[0], '../board-resolution/inbox.html?case=0007%2F2569');
  eq('เคสถูกตั้ง pending จ่าหน้าถึง ก7', H.getCase('0007/2569')?.pending?.to, 'board-resolution');
  eq('สถานะถูกอัปเดตเป็น statusAfter', H.getCase('0007/2569')?.status, 'รอบรรจุวาระ');
  eq('ack ยังว่าง (ปลายทางยังไม่รับ)', env.ack, null);

  // ปลายทางรับ
  const ack = HO.receive('0007/2569', 'board-resolution', 'ฝ่ายเลขา ก7');
  ok('receive() คืน ack: ' + JSON.stringify({ no: ack?.no, by: ack?.by }));
  eq('ack มีเลขรับ', /^ปปท-\d\d-\d+$/.test(ack.no), true);
  eq('pending ถูกปิดหลังรับ', H.getCase('0007/2569')?.pending, null);
  eq('บันทึก receivedBy', H.getCase('0007/2569')?.receivedBy, 'board-resolution');
  eq('รับซ้ำไม่ออก ack ใหม่', HO.receive('0007/2569', 'board-resolution'), null);
  eq('audit trail มี 2 เหตุการณ์ (ส่ง + รับ)', H.getEvents('0007/2569').length, 2);
}

console.log('\n── ข้อ 12: เส้นตีกลับ 7→5 มี returnReason + revision เดินขึ้น');
{
  const { win, run } = makeEnv('http://x/ecmis-transform/board-resolution/inbox.html?case=0007/2569');
  run('cases.js'); run('shared-assets/handoff.js');
  const H = win.ECMISHub, HO = win.ECMISHandoff;
  H.saveCase({ id: '0007/2569', subject: 'เคสทดสอบ', status: 'รอบรรจุวาระ' });

  const r1 = HO.send({ caseId:'0007/2569', from:'board-resolution', to:'intake-investigation',
    trigger:'สำนวนไม่ครบ', docs:['บันทึกเหตุที่ส่งคืน'], statusAfter:'ถูกตีกลับ',
    returnReason:'เอกสาร/พยานหลักฐานไม่ครบถ้วน', slaDue:'15 วัน', action:'ตีกลับ ก5' });
  eq('returnReason ถูกบันทึก', r1.returnReason, 'เอกสาร/พยานหลักฐานไม่ครบถ้วน');
  eq('revision รอบแรก = 1', r1.revision, 1);

  const r2 = HO.send({ caseId:'0007/2569', from:'board-resolution', to:'intake-investigation',
    trigger:'ยังไม่ครบอีก', returnReason:'ข้อเท็จจริงยังไม่ชัดเจน', action:'ตีกลับ ก5 ครั้งที่ 2' });
  eq('revision รอบสองเดินขึ้นเป็น 2', r2.revision, 2);
  eq('เส้นทางเคสเก็บครบ 2 ครั้ง', H.getEvents('0007/2569').filter(e=>e.returnReason).length, 2);
}

console.log('\n── external: นำส่งนอกระบบต้องไม่ navigate แต่ต้องลง audit');
{
  const { win, run, nav } = makeEnv('http://x/ecmis-transform/board-resolution/inbox.html?case=0001/2569');
  run('cases.js'); run('shared-assets/handoff.js');
  const H = win.ECMISHub, HO = win.ECMISHandoff;
  const env = HO.send({ caseId:'0001/2569', from:'board-resolution', to:'external:prosecutor',
    trigger:'มติชี้มูลอาญา', docs:['มติ','รายงาน 644','หนังสือนำส่งอัยการ'],
    statusAfter:'อยู่ระหว่างการพิจารณาของอัยการ', action:'ส่งสำนวนให้อัยการ' });
  eq('ไม่ navigate ออกจากหน้า', nav.length, 0);
  eq('ลง audit ว่าส่งอัยการ', H.getEvents('0001/2569')[0].to, 'external:prosecutor');
  eq('isExternal ตรวจถูก', HO.isExternal('external:prosecutor'), true);
  eq('actName แปลชื่อไทยได้', HO.actName('external:prosecutor'), 'พนักงานอัยการ (ภายนอกระบบ)');
  eq('statusAfter ถูกเขียนลงเคส', H.getCase('0001/2569').status, 'อยู่ระหว่างการพิจารณาของอัยการ');
}

console.log('\n── ข้อ 11: ปลายทางที่ไม่มีเคสในทะเบียน ต้องไม่แกล้งว่ามี');
{
  const { win, run } = makeEnv('http://x/ecmis-transform/person-screening/index.html?case=8888/2569');
  run('cases.js');
  eq('getCase คืน null สำหรับเคสที่ไม่เคยส่งมา', win.ECMISHub.getCase('8888/2569'), null);
  eq('activeCaseId ยังคืนเลขที่ขอมา (ไม่สลับเป็นเคสกลาง)', win.ECMISHub.activeCaseId(), '8888/2569');
}

console.log(`\n═══ ผล: ผ่าน ${pass} · ไม่ผ่าน ${fail} ═══\n`);
process.exit(fail ? 1 : 0);
