const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const resDir = path.join(rootDir, 'res');

if (!fs.existsSync(resDir)) {
  fs.mkdirSync(resDir, { recursive: true });
}

const rootFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

let synced = 0;
let upToDate = 0;

rootFiles.forEach(file => {
  const rootFilePath = path.join(rootDir, file);
  const resFilePath = path.join(resDir, file);

  const rootContent = fs.readFileSync(rootFilePath, 'utf8');

  // Convert asset paths for res/ directory
  let resContent = rootContent
    .replace(/(href=["'])assets\//g, '$1../assets/')
    .replace(/(src=["'])assets\//g, '$1../assets/')
    .replace(/(href=["'])favicon\.ico(["'])/g, '$1../favicon.ico$2')
    .replace(/(src=["'])favicon\.ico(["'])/g, '$1../favicon.ico$2');

  const existingResContent = fs.existsSync(resFilePath) ? fs.readFileSync(resFilePath, 'utf8') : null;

  if (existingResContent !== resContent) {
    fs.writeFileSync(resFilePath, resContent, 'utf8');
    synced++;
    console.log(`  🔄 Synchronized: ${file} -> res/${file}`);
  } else {
    upToDate++;
  }
});

console.log(`\n✅ Auto-sync completed! Total: ${rootFiles.length} files (Synced: ${synced}, Up-to-date: ${upToDate})\n`);
