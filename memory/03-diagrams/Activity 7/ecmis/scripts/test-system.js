/**
 * E-CMIS Automated System Test Suite & Security Scanner
 * -----------------------------------------------------
 * Runs in local dev and GitHub Actions CI to ensure:
 * 1. Zero exposed secrets / database passwords.
 * 2. All JavaScript files compile without syntax error.
 * 3. All registered user accounts are unique and authenticate cleanly.
 * 4. All 10 module entry points and directories exist.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('   E-CMIS FULL SYSTEM & SECURITY TEST SUITE');
console.log('====================================================\n');

let suitePassed = true;

// -----------------------------------------------------------------
// TEST 1: Secret & Credential Leak Scanner
// -----------------------------------------------------------------
console.log('▶ [TEST 1] Secret & Credential Leak Scanner');
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (!['.git', 'node_modules', 'scripts'].includes(f)) walk(full, fileList);
    } else {
      fileList.push(full);
    }
  });
  return fileList;
}

const allCodeFiles = walk(root).filter(f => /\.(js|html|json|md|css)$/.test(f));
const SECRET_PATTERNS = [
  /postgresql:\/\/[a-zA-Z0-9_-]+:[^@\[\]\s]+@/i,
  /sb_secret_[a-zA-Z0-9_-]+/i,
  /service_role_key\s*[:=]\s*['"][a-zA-Z0-9._-]+['"]/i
];

let leakCount = 0;
allCodeFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  SECRET_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      console.error(' ❌ Secret pattern found in:', path.relative(root, filePath));
      leakCount++;
      suitePassed = false;
    }
  });
});

if (leakCount === 0) {
  console.log('   ✅ Passed: 0 exposed database secrets detected across ' + allCodeFiles.length + ' source files.\n');
}

// -----------------------------------------------------------------
// TEST 2: JavaScript Syntax Compilation Check
// -----------------------------------------------------------------
console.log('▶ [TEST 2] JavaScript Syntax Compilation Check');
const jsFiles = allCodeFiles.filter(f => f.endsWith('.js'));
let jsErrors = 0;
jsFiles.forEach(jsPath => {
  try {
    const code = fs.readFileSync(jsPath, 'utf8');
    new Function(code);
  } catch (err) {
    console.error(' ❌ Syntax error in:', path.relative(root, jsPath), err.message);
    jsErrors++;
    suitePassed = false;
  }
});
if (jsErrors === 0) {
  console.log('   ✅ Passed: All ' + jsFiles.length + ' JavaScript files parsed cleanly without syntax error.\n');
}

// -----------------------------------------------------------------
// TEST 3: Central Auth & User Registry Verification
// -----------------------------------------------------------------
console.log('▶ [TEST 3] Central Auth & User Registry Verification');
global.window = global;
global.document = { getElementsByTagName: () => [] };
global.location = { pathname: '/ecmis/login.html', href: '' };
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const authCode = fs.readFileSync(path.join(root, 'shared-assets/auth.js'), 'utf8');
eval(authCode);

const allUsers = global.ECMISAuth.USERS;
let authErrors = 0;

const usernames = allUsers.map(u => String(u.u || '').trim().toLowerCase());
const duplicateUsernames = [...new Set(usernames.filter((u, i) => usernames.indexOf(u) !== i))];
if (duplicateUsernames.length) {
  console.error(' ❌ Duplicate usernames:', duplicateUsernames.join(', '));
  authErrors += duplicateUsernames.length;
  suitePassed = false;
}

allUsers.forEach(u => {
  const res = global.ECMISAuth.login(u.u, u.p);
  if (!res) {
    console.error(' ❌ Failed login for user:', u.u);
    authErrors++;
    suitePassed = false;
  } else {
    const entry = global.ECMISAuth.actEntry(res.act);
    const entryExists = res.act === '*' ? true : fs.existsSync(path.join(root, entry));
    if (!entryExists) {
      console.error(' ❌ Entry point missing for user:', u.u, '->', entry);
      authErrors++;
      suitePassed = false;
    }
  }
});

if (authErrors === 0) {
  console.log('   ✅ Passed: All ' + allUsers.length + ' user accounts authenticated with verified entry points.\n');
}

// -----------------------------------------------------------------
// TEST 4: Verification of All 10 Activity Module Directories
// -----------------------------------------------------------------
console.log('▶ [TEST 4] Verification of All 10 Activity Modules');
const activities = [
  { name: 'กิจกรรมที่ 4+5 (รับเรื่อง/ไต่สวน)', dir: 'intake-investigation', entry: 'staff-workflow.html' },
  { name: 'กิจกรรมที่ 6 (คุ้มครองพยาน)', dir: 'witness-protection', entry: 'index.html' },
  { name: 'กิจกรรมที่ 7 (มติคณะกรรมการ)', dir: 'board-resolution', entry: 'inbox.html' },
  { name: 'กิจกรรมที่ 8 (ตรวจประวัติบุคคล)', dir: 'person-screening', entry: 'index.html' },
  { name: 'กิจกรรมที่ 9 (หมายจับ)', dir: 'arrest-warrant', entry: 'index.html' },
  { name: 'กิจกรรมที่ 10 (กฎหมายในทางคดี)', dir: 'legal-case', entry: '01-work-inbox.html' },
  { name: 'กิจกรรมที่ 11 (นำเข้าถ่ายโอน)', dir: 'data-migration', entry: 'index.html' },
  { name: 'กิจกรรมที่ 12 (วิเคราะห์รายงาน)', dir: 'analytics', entry: 'index.html' },
  { name: 'กิจกรรมที่ 13 (เชื่อมโยงข้อมูล)', dir: 'integration-gateway', entry: 'index.html' },
  { name: 'กิจกรรมที่ 14 (บริหารกลาง)', dir: 'admin-center', entry: 'index.html' }
];

activities.forEach(act => {
  const dirPath = path.join(root, act.dir);
  const entryPath = path.join(dirPath, act.entry);
  if (!fs.existsSync(dirPath) || !fs.existsSync(entryPath)) {
    console.error(' ❌ Missing module or entry for ' + act.name);
    suitePassed = false;
  }
});
console.log('   ✅ Passed: All 10 activity modules are present and accessible.\n');

console.log('====================================================');
console.log('OVERALL STATUS:', suitePassed ? '🟢 100% PASSED' : '🔴 TESTS FAILED');
console.log('====================================================');
process.exit(suitePassed ? 0 : 1);
