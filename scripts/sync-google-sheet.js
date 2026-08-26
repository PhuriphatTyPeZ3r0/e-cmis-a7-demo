/**
 * 📊 Google Sheets Live Sync for E-CMIS Activity 7
 * Spreadsheet: 1YHcP3a1b9Y7EWwJTf-ih6AJsnOV0jcOGydEzaGAdVfQ
 * Sheets:
 *   - gid=1207621878 : รายการแจ้งแก้ไข / Requirement Tracking Activity 7
 *   - gid=0          : กลุ่มงานและสิทธิ์ในระบบ (User Roles & Matrix)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1YHcP3a1b9Y7EWwJTf-ih6AJsnOV0jcOGydEzaGAdVfQ';
const SHEETS = [
  { gid: '1207621878', name: 'requirements', title: 'รายการแจ้งแก้ไข / Requirement Tracking Activity 7' },
  { gid: '0', name: 'roles_matrix', title: 'กลุ่มงานและสิทธิ์ในระบบ (User Roles & Matrix)' }
];

const OUTPUT_FILE = path.join(__dirname, '..', 'assets', 'google-sheet-sync.json');

function fetchSheetCsv(docId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv&gid=${gid}`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (redirectRes) => {
          let data = '';
          redirectRes.on('data', chunk => data += chunk);
          redirectRes.on('end', () => resolve(data));
        }).on('error', reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCsv(csvText) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentVal += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (char === '\r') {
        // ignore CR
      } else if (char === '\n') {
        currentRow.push(currentVal.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }
  return rows;
}

async function sync() {
  console.log('🔄 Connecting to Google Sheet...');
  console.log(`📑 Spreadsheet ID: ${SPREADSHEET_ID}\n`);

  const result = {
    syncedAt: new Date().toISOString(),
    spreadsheetId: SPREADSHEET_ID,
    sourceUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
    sheets: {}
  };

  for (const sheet of SHEETS) {
    console.log(`📥 Fetching "${sheet.title}" (gid: ${sheet.gid})...`);
    const csvContent = await fetchSheetCsv(SPREADSHEET_ID, sheet.gid);
    const parsedRows = parseCsv(csvContent);
    
    if (sheet.gid === '1207621878') {
      const headers = parsedRows[0] || [];
      const items = [];
      let extraNotes = [];

      for (let i = 1; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        if (row[0] && !isNaN(parseInt(row[0], 10))) {
          items.push({
            id: parseInt(row[0], 10),
            dateReceived: row[1] || '',
            screen: row[2] || '',
            topic: row[3] || '',
            status: row[4] || '',
            resolvedDate: row[5] || '',
            resolvedTime: row[6] || '',
            developer: row[7] || '',
            notes: row[8] || ''
          });
        } else {
          const text = row.filter(Boolean).join(' ');
          if (text) extraNotes.push(text);
        }
      }

      result.sheets[sheet.name] = {
        gid: sheet.gid,
        title: sheet.title,
        totalItems: items.length,
        items,
        extraNotes
      };
      console.log(`  ✅ Synced ${items.length} requirement items.`);
    } else if (sheet.gid === '0') {
      const roles = [];
      for (let i = 1; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        if (row[0] && !isNaN(parseInt(row[0], 10))) {
          roles.push({
            id: parseInt(row[0], 10),
            group: row[1] || '',
            roleTitle: row[2] || '',
            activities: row[3] || '',
            actions: row[4] || '',
            conditions: row[5] || ''
          });
        }
      }
      result.sheets[sheet.name] = {
        gid: sheet.gid,
        title: sheet.title,
        totalRoles: roles.length,
        roles
      };
      console.log(`  ✅ Synced ${roles.length} roles matrix rows.`);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n💾 Saved synced dataset to: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
  console.log('🎉 Google Sheets synchronization completed successfully!\n');
}

sync().catch(err => {
  console.error('❌ Error during Google Sheet sync:', err);
  process.exit(1);
});
