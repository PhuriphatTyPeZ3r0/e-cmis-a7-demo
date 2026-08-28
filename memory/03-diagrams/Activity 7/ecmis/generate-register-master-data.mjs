import fs from 'node:fs';

const [, , sqlPath, outputPath] = process.argv;

if (!sqlPath || !outputPath) {
  throw new Error('Usage: node generate-register-master-data.mjs <sql-path> <output-path>');
}

const sql = fs.readFileSync(sqlPath, 'utf8');

function parseValue(raw, wasQuoted) {
  const value = raw.trim();
  if (wasQuoted) return value;
  if (value === 'NULL') return null;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (/^0x[0-9a-f]+$/i.test(value)) return value.toLowerCase();
  return value;
}

function parseTuple(line) {
  const body = line.trim().replace(/^\(/, '').replace(/\)[,;]$/, '');
  const values = [];
  let current = '';
  let quoted = false;
  let wasQuoted = false;

  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];
    if (character === "'") {
      if (!quoted) wasQuoted = true;
      if (quoted && body[index + 1] === "'") {
        current += "'";
        index += 1;
        continue;
      }
      quoted = !quoted;
      continue;
    }
    if (character === ',' && !quoted) {
      values.push(parseValue(current, wasQuoted));
      current = '';
      wasQuoted = false;
      continue;
    }
    current += character;
  }
  values.push(parseValue(current, wasQuoted));
  return values;
}

function tableRows(tableName) {
  const marker = `INSERT INTO \`${tableName}\` VALUES`;
  const start = sql.indexOf(marker);
  if (start < 0) throw new Error(`Missing INSERT block for ${tableName}`);
  const end = sql.indexOf('/*!40000 ALTER TABLE', start);
  return sql
    .slice(start + marker.length, end)
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('('))
    .map(parseTuple);
}

const isActive = (value) => value === '0x01';

const userTypes = tableRows('m_user_types')
  .filter((row) => isActive(row[9]))
  .map((row) => ({ id: row[0], name: row[3] || row[2] }));

const positionTypes = tableRows('m_position_type')
  .filter((row) => isActive(row[2]))
  .map((row) => ({ id: row[0], name: row[1] }));

const positionLevels = tableRows('m_position_level')
  .filter((row) => isActive(row[2]))
  .map((row) => ({ id: row[0], name: row[1] }));

const typeLevelByMapId = new Map(
  tableRows('m_position_type_map_level')
    .filter((row) => isActive(row[4]))
    .map((row) => [row[0], { positionTypeId: row[1], positionLevelId: row[2] }])
);

const levelsByPositionId = new Map();
for (const row of tableRows('m_position_map_index')) {
  if (!isActive(row[3])) continue;
  const typeLevel = typeLevelByMapId.get(row[1]);
  if (!typeLevel) continue;
  const levels = levelsByPositionId.get(row[0]) || [];
  levels.push(typeLevel.positionLevelId);
  levelsByPositionId.set(row[0], levels);
}

const positions = tableRows('m_positions')
  .filter((row) => isActive(row[7]))
  .map((row) => ({
    id: row[0],
    code: row[1],
    lineWork: row[2],
    name: row[3],
    occupationId: row[4],
    positionTypeId: row[5],
    positionLevelIds: [...new Set(levelsByPositionId.get(row[0]) || [])].sort((a, b) => a - b)
  }));

const departments = tableRows('m_department')
  .filter((row) => isActive(row[12]) && isActive(row[24]))
  .map((row) => ({
    id: row[0],
    code: row[1],
    name: row[3],
    abbreviation: row[4] || '',
    zone: row[6],
    departmentKind: row[25]
  }));

const allowedDepartmentCodes = new Set(departments.map((department) => department.code));

const segmentDepartments = tableRows('m_segment_department')
  .filter((row) => isActive(row[22]) && allowedDepartmentCodes.has(row[1]))
  .map((row) => ({
    code: row[0],
    departmentCode: row[1],
    segmentId: row[2],
    name: row[4],
    abbreviation: row[5] || ''
  }));

const subsegments = tableRows('m_subsegment')
  .filter((row) => isActive(row[6]))
  .map((row) => ({ id: row[0], segmentId: row[1], name: row[2] }));

const masterData = {
  source: {
    tableSnapshot: 'users_permission_design06052569_2.sql',
    sourceLastModified: '2026-05-26T16:41:30+07:00',
    departmentFilter: 'useflag=1 AND core_is_ou=1'
  },
  userTypes,
  positionTypes,
  positionLevels,
  positions,
  departments,
  segmentDepartments,
  subsegments
};

const output = `// Generated from users_permission_design06052569_2.sql.\n` +
  `// Re-generate from the authoritative SQL when the organization or position masters change.\n` +
  `(function(global){\n  'use strict';\n  global.ECMISRegisterMasterData = ${JSON.stringify(masterData, null, 2)};\n})(window);\n`;

fs.writeFileSync(outputPath, output, 'utf8');

console.log(JSON.stringify({
  outputPath,
  userTypes: userTypes.length,
  positionTypes: positionTypes.length,
  positionLevels: positionLevels.length,
  positions: positions.length,
  departments: departments.length,
  segmentDepartments: segmentDepartments.length,
  subsegments: subsegments.length
}, null, 2));
