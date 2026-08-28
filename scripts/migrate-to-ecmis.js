const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.resolve(__dirname, '..');
const candidateRoots = [
  path.resolve(srcDir, '..', '..', 'ecmis'),
  path.resolve(srcDir, '..', 'ecmis'),
  'D:\\Samart-W\\กจ.7\\ecmis'
];
const ecmisRoot = candidateRoots.find(p => fs.existsSync(path.join(p, 'board-resolution')) && fs.existsSync(path.join(p, 'shared-assets'))) || candidateRoots[0];
const destDir = path.resolve(ecmisRoot, 'board-resolution');

console.log('====================================================');
console.log(' 🚀 E-CMIS ACTIVITY 7 -> ECMIS MONOREPO MIGRATION');
console.log('====================================================\n');
console.log('Source:     ', srcDir);
console.log('Destination:', destDir);

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 1. Copy Assets
console.log('\n[1/4] Copying Assets & Stylesheets...');
const srcAssets = path.join(srcDir, 'assets');
const destAssets = path.join(destDir, 'assets');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(srcAssets, destAssets);
console.log('  ✅ Assets copied successfully.');

// 2. HTML Files Migration & Tag Injection
console.log('\n[2/4] Migrating HTML Pages & Injecting Hub Shared Tags...');

const headTags = '<script src="../shared-assets/auth.js"></script>\n<script src="../cases.js"></script>';
const bodyTags = '<script src="../shared-assets/handoff.js"></script>\n<script src="../shared-assets/case-bar.js"></script>\n<script src="../shared-assets/pipe-buttons.js"></script>\n<script src="../shared-assets/case-inbox.js"></script>';

const htmlFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.html') && fs.statSync(path.join(srcDir, f)).isFile());
let migratedCount = 0;

const names = ['auth.js', 'cases.js', 'handoff.js', 'case-bar.js', 'pipe-buttons.js', 'case-inbox.js'];
const pat = new RegExp('[ \t]*<script[^>]*src="[^"]*(?:' + names.map(n => n.replace(/\./g, '\\.')).join('|') + ')(?:\\?[^"]*)?"[^>]*>\\s*</script>[ \t]*\\n?', 'gi');

htmlFiles.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);

  let s = fs.readFileSync(srcPath, 'utf8');

  // 1) Strip existing shared tags
  s = s.replace(pat, '');

  // 2) HEAD block - before first local script
  let ins = null;
  const scriptTagRegex = /<script[^>]*\ssrc="([^"]+)"/gi;
  let match;
  while ((match = scriptTagRegex.exec(s)) !== null) {
    if (!/^https?:|^\/\//i.test(match[1])) {
      ins = match.index;
      break;
    }
  }
  if (ins === null) {
    const headEnd = s.search(/<\/head>/i);
    ins = headEnd !== -1 ? headEnd : 0;
  }

  const lineStart = s.lastIndexOf('\n', ins) + 1;
  s = s.slice(0, lineStart) + headTags + '\n' + s.slice(lineStart);

  // 3) BODY block - before last </body>
  const bodyEnd = s.toLowerCase().lastIndexOf('</body>');
  if (bodyEnd === -1) {
    s = s + '\n' + bodyTags + '\n';
  } else {
    s = s.slice(0, bodyEnd) + bodyTags + '\n' + s.slice(bodyEnd);
  }

  fs.writeFileSync(destPath, s, 'utf8');
  migratedCount++;
  console.log(`  📄 Migrated: ${file}`);
});

// 3. Create Aliases for Backward Compatibility
console.log('\n[3/4] Creating Legacy Route Aliases...');
const aliases = {
  'board-resolution-72.html': 'resolution-72.html',
  'report-213.html': 'approval-review.html',
  'agenda.html': 'agenda-set.html',
  'review.html': 'approval-review.html',
  'chairman.html': 'chairman-agenda.html',
  'screening.html': 'subcommittee-screening.html',
  'resolution.html': 'board-resolution.html',
  'order.html': 'order-m24.html'
};

for (const [aliasName, targetName] of Object.entries(aliases)) {
  const targetPath = path.join(destDir, targetName);
  const aliasPath = path.join(destDir, aliasName);
  if (fs.existsSync(targetPath)) {
    fs.copyFileSync(targetPath, aliasPath);
    console.log(`  🔗 Alias: ${aliasName} -> ${targetName}`);
  }
}

// 4. Clean up temporary files
console.log('\n[4/4] Verifying Target System Integrity in ecmis...');
try {
  const testOutput = execSync('node scripts/test-system.js', { cwd: ecmisRoot, encoding: 'utf8' });
  console.log(testOutput);
  console.log('✅ ALL MIGRATION INTEGRITY CHECKS PASSED!');
} catch (err) {
  console.error('❌ ecmis test-system.js failed:', err.stdout || err.message);
  process.exit(1);
}
