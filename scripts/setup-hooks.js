const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const hooksDir = path.join(rootDir, '.git', 'hooks');

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

const hookPath = path.join(hooksDir, 'pre-commit');
const hookContent = '#!/bin/sh\nnode scripts/ci-check.js\n';

try {
  fs.writeFileSync(hookPath, hookContent, { encoding: 'utf8', mode: 0o755 });
  console.log('✅ Git Pre-commit Hook installed successfully in .git/hooks/pre-commit');
  console.log('   All team commits will now be automatically guarded by scripts/ci-check.js');
} catch (err) {
  console.error('❌ Failed to install Git Pre-commit Hook:', err);
  process.exit(1);
}
