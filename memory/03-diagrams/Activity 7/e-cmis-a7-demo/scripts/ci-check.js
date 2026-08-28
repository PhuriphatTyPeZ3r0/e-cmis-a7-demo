const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'assets');
const resDir = path.join(rootDir, 'res');

let totalErrors = 0;
let totalWarnings = 0;

console.log('══════════════════════════════════════════════════════════════════════');
console.log('🚀 E-CMIS ACTIVITY 7 — ENTERPRISE CI & INTEGRITY VALIDATOR');
console.log('══════════════════════════════════════════════════════════════════════\n');

// -----------------------------------------------------------------------------
// TASK 1: JavaScript Syntax Verification (node -c)
// -----------------------------------------------------------------------------
console.log('📦 [1/5] Checking JavaScript Syntax...');
const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js')).map(f => path.join(assetsDir, f));
let jsPassed = 0;

jsFiles.forEach(jsFile => {
  const relPath = path.relative(rootDir, jsFile);
  const res = spawnSync('node', ['-c', jsFile], { encoding: 'utf8' });
  if (res.status !== 0) {
    console.error(`  ❌ Syntax Error in ${relPath}:\n${res.stderr}`);
    totalErrors++;
  } else {
    jsPassed++;
  }
});
console.log(`  ✅ JS Syntax OK (${jsPassed}/${jsFiles.length} files passed)\n`);

// -----------------------------------------------------------------------------
// TASK 2: Dual-Route Mirroring & Sync Integrity (Root ↔ /res/)
// -----------------------------------------------------------------------------
console.log('🔄 [2/5] Checking Dual-Route Mirroring (Root ↔ /res/)...');
const rootHtmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));
const resHtmlFiles = fs.existsSync(resDir) ? fs.readdirSync(resDir).filter(f => f.endsWith('.html')) : [];

let routeErrors = 0;
rootHtmlFiles.forEach(f => {
  const resPath = path.join(resDir, f);
  if (!fs.existsSync(resPath)) {
    console.error(`  ❌ Missing mirror file in /res/: res/${f}`);
    routeErrors++;
    totalErrors++;
  }
});

resHtmlFiles.forEach(f => {
  const rootPath = path.join(rootDir, f);
  if (!fs.existsSync(rootPath)) {
    console.warn(`  ⚠️ Extra mirror file in /res/ not found in root: ${f}`);
    totalWarnings++;
  }
});

if (routeErrors === 0) {
  console.log(`  ✅ Dual-Route Mirroring OK (${rootHtmlFiles.length} paired HTML routes)\n`);
} else {
  console.error(`  ❌ Dual-Route Mirroring Failed with ${routeErrors} missing files\n`);
}

// -----------------------------------------------------------------------------
// TASK 3: Zero-404 Dead Link & Route Auditor
// -----------------------------------------------------------------------------
console.log('🔗 [3/5] Auditing Internal Links (Zero-404 Route Verification)...');
let linkErrors = 0;
let totalLinksChecked = 0;

function auditLinksInDir(dir, isRes = false) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  files.forEach(f => {
    const filePath = path.join(dir, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const hrefRegex = /href=["']([^"']+)["']/g;
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
      let target = match[1].trim();
      if (!target || target.includes('${') || target.startsWith('http://') || target.startsWith('https://') || target.startsWith('#') || target.startsWith('javascript:') || target.startsWith('mailto:') || target.startsWith('data:')) {
        continue;
      }
      totalLinksChecked++;
      const cleanTarget = target.split('?')[0].split('#')[0];
      const targetFilePath = path.resolve(dir, cleanTarget);

      if (!fs.existsSync(targetFilePath)) {
        console.error(`  ❌ 404 Dead Link in ${isRes ? 'res/' : ''}${f}: href="${target}" -> ${cleanTarget} not found!`);
        linkErrors++;
        totalErrors++;
      }
    }
  });
}

auditLinksInDir(rootDir, false);
if (fs.existsSync(resDir)) auditLinksInDir(resDir, true);

if (linkErrors === 0) {
  console.log(`  ✅ Zero-404 Link Audit OK (${totalLinksChecked} links verified across all pages)\n`);
} else {
  console.error(`  ❌ Link Audit Failed with ${linkErrors} broken links\n`);
}

// -----------------------------------------------------------------------------
// TASK 4: Anti-Regression Rules & Architectural Governance
// -----------------------------------------------------------------------------
console.log('🛡️ [4/5] Enforcing Anti-Regression Rules & Architectural Guards...');
let ruleErrors = 0;

// Rule 1: Singleton Supabase client usage
const allHtmlPaths = [
  ...rootHtmlFiles.map(f => path.join(rootDir, f)),
  ...resHtmlFiles.map(f => path.join(resDir, f))
];

allHtmlPaths.forEach(hp => {
  const rel = path.relative(rootDir, hp);
  const content = fs.readFileSync(hp, 'utf8');
  if (content.includes('supabase.createClient(') && !content.includes('ECMIS.getSupabaseClient')) {
    console.error(`  ❌ Anti-Regression Violation in ${rel}: Direct supabase.createClient() found instead of ECMIS.getSupabaseClient()`);
    ruleErrors++;
    totalErrors++;
  }
});

// Rule 2: Table 'ประเภทเรื่อง' column presence
['inbox.html', 'res/inbox.html', 'resolution-inbox.html'].forEach(f => {
  const p = path.join(rootDir, f);
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    if (!c.includes('ประเภทเรื่อง')) {
      console.error(`  ❌ Anti-Regression Violation in ${f}: Missing 'ประเภทเรื่อง' table column header!`);
      ruleErrors++;
      totalErrors++;
    }
  }
});

// Rule 3: Chairman role isolation from agenda-registry
const appJsPath = path.join(assetsDir, 'ecmis-app.js');
if (fs.existsSync(appJsPath)) {
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  if (appJsContent.includes("'agenda-registry.html': ['board_sec', 'affairs', 'chairman'")) {
    console.error(`  ❌ Anti-Regression Violation in ecmis-app.js: Chairman has unauthorized access to agenda-registry.html!`);
    ruleErrors++;
    totalErrors++;
  }
}

if (ruleErrors === 0) {
  console.log(`  ✅ Anti-Regression Governance OK (All architectural rules passed)\n`);
} else {
  console.error(`  ❌ Anti-Regression Governance Failed with ${ruleErrors} violations\n`);
}

// -----------------------------------------------------------------------------
// TASK 5: Document Workspace & Print Layout Integrity
// -----------------------------------------------------------------------------
console.log('📑 [5/5] Checking A4 Document Workspace & Print Layout Integrity...');
let layoutErrors = 0;

const cssPath = path.join(assetsDir, 'ecmis-app.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  if (!css.includes('padding: 15mm 15mm 18mm 20mm') && !css.includes('padding:15mm 15mm 18mm 20mm')) {
    console.error(`  ❌ CSS Layout Mismatch: .doc-paper padding is not 15mm 15mm 18mm 20mm in ecmis-app.css`);
    layoutErrors++;
    totalErrors++;
  }
  if (!css.includes('bottom: 8mm') && !css.includes('bottom:8mm')) {
    console.error(`  ❌ CSS Layout Mismatch: .doc-secret-foot bottom is not 8mm in ecmis-app.css`);
    layoutErrors++;
    totalErrors++;
  }
}

if (layoutErrors === 0) {
  console.log(`  ✅ Document Layout & Print Specs OK (15mm 15mm 18mm 20mm unified)\n`);
} else {
  console.error(`  ❌ Layout Integrity Failed with ${layoutErrors} discrepancies\n`);
}

// -----------------------------------------------------------------------------
// SUMMARY & EXIT CODE
// -----------------------------------------------------------------------------
console.log('══════════════════════════════════════════════════════════════════════');
if (totalErrors === 0) {
  console.log(`🎉 ALL CHECKS PASSED SUCCESSFULLY! (Errors: 0, Warnings: ${totalWarnings})`);
  console.log('   Ready for 1000% safe git commit & deployment.');
  console.log('══════════════════════════════════════════════════════════════════════\n');
  process.exit(0);
} else {
  console.error(`🛑 CI VALIDATION FAILED WITH ${totalErrors} ERROR(S) AND ${totalWarnings} WARNING(S).`);
  console.error('   Please fix all errors before committing code.');
  console.log('══════════════════════════════════════════════════════════════════════\n');
  process.exit(1);
}
