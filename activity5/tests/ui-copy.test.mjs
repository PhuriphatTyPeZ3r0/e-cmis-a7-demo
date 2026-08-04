import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const directory = dirname(fileURLToPath(import.meta.url));
const root = resolve(directory, "..");
const files = [
  "index.html",
  "assets/app.js",
  "assets/mock-data.js",
  "assets/state.js"
];
const forbidden = [
  /กิจกรรมที่/,
  /Use Case/i,
  /ACC\d+/i,
  /สาธิต/,
  /ทดลอง/,
  /RULE_NOT_CONFIGURED/,
  /Version snapshots/i,
  /\bOutbox\b/i,
  /\bInbox\b/i,
  /รับเข้าสู่กิจกรรม/,
  /ส่งคืนกิจกรรม/,
  /รุ่นข้อมูล/,
  /#\/activity7/,
  /#\/factcheck/,
  /UPDATE_FACTCHECK/,
  /ARTICLE_58_2_CHECK_UPDATED/,
  /ตามลำดับชั้น/
];

for (const file of files) {
  const source = readFileSync(resolve(root, file), "utf8");
  for (const pattern of forbidden) {
    assert.equal(pattern.test(source), false, `${file} contains forbidden UI copy ${pattern}`);
  }
}

const appSource = readFileSync(resolve(root, "assets/app.js"), "utf8");
const stateSource = readFileSync(resolve(root, "assets/state.js"), "utf8");
const indexSource = readFileSync(resolve(root, "index.html"), "utf8");
assert.equal(/exposeDebugApi|A5Demo/.test(appSource), false, "application must not publish a browser debug API");
assert.match(appSource, /if \(current\.parts\[0\] === "login"\) \{\s*location\.hash = "#\/dashboard";\s*return;/, "authenticated /login must normalize to dashboard");
assert.ok(appSource.indexOf('current.parts[0] === "login"') < appSource.indexOf("renderSidebar(current.path)"), "login normalization must happen before authenticated route rendering");
assert.match(stateSource, /activity5-mockup-state-v4/);
assert.match(stateSource, /parsed\.schemaVersion !== 4/);
assert.match(indexSource + appSource, /aria-label="ออกจากระบบ"/);
const stateActions = [...stateSource.matchAll(/action:\s*"([A-Z0-9_]+)"/g)].map((match) => match[1]);
for (const action of new Set(stateActions)) {
  assert.ok(appSource.includes(`${action}:`) || appSource.includes(`"${action}":`), `audit label missing for ${action}`);
}
assert.match(appSource, /CONFLICT:\s*"ข้อมูลเปลี่ยนแปลงระหว่างทำงาน"/);
assert.doesNotMatch(stateSource, /commandName\.replaceAll\("_", " "\)/);
assert.match(stateSource, /definition\.scope === "SPECIAL"/);
assert.match(appSource, /#\/special-matters/);
assert.match(appSource, /function hasSpecialMatterAccess\(\)[\s\S]*can\("audit\.read"\)/, "audit account must see and open special matters");
assert.match(appSource, /function allAuditEvents\(state\)[\s\S]*state\.specialMatters[\s\S]*flatMap\(\(matter\) => matter\.audit \|\| \[\]\)/, "system audit must include special-matter events");
assert.match(appSource, /if \(role === "AUDIT"\) return renderAuditDashboard\(state, user\)/);
assert.match(appSource, /href="#\/audit">เปิดประวัติการใช้งาน<\/a>/);
assert.match(appSource, /function renderAuditDashboard/);
assert.match(appSource, /ข้อมูลขัดกัน/);
assert.match(appSource, /รายการถูกปฏิเสธ/);
assert.match(appSource, /function renderRoleSpecialMatterQueue/);
assert.match(appSource, /งานตรวจสอบข้อเท็จจริง/);
assert.match(appSource, /PENDING_CLERK_REVIEW: "ตรวจข้อมูลและเสนอผู้อำนวยการ"/);
assert.match(appSource, /เลยวันนัดหมาย — รอบันทึกผล/);
assert.match(appSource, /getState\(\)\.demoDate > notice\.appointmentDate/);
assert.match(appSource, /function missingPlanSubmissionRequirements/);
assert.match(appSource, /function missingReport213SubmissionRequirements/);
assert.match(appSource, /function missingReport644SubmissionRequirements/);
assert.match(appSource, /ยังเสนอผู้ตรวจไม่ได้/);
assert.match(stateSource, /notice\.service\.status === "SERVED_POSTAL" \? notice\.service\.resultDate : notice\.service\.date/);
assert.match(appSource, /inputField\("noticeDate", "วันที่หนังสือแจ้ง", \{ type: "date", value: getState\(\)\.demoDate, max: getState\(\)\.demoDate \}\)/);
assert.equal([...appSource.matchAll(/inputField\("serviceDate",[^\n]+max: getState\(\)\.demoDate/g)].length, 3, "all allegation service-date inputs must cap at the current working date");
assert.match(appSource, /inputField\("resultDate", "วันที่ทราบผล", \{ type: "date", value: getState\(\)\.demoDate, max: getState\(\)\.demoDate \}\)/);
assert.match(appSource, /inputField\("responseDate", "วันที่บันทึกผล", \{ type: "date", value: getState\(\)\.demoDate, max: getState\(\)\.demoDate \}\)/);
assert.match(appSource, /inputField\("appointmentDate", "วันนัดหมาย", \{ type: "date" \}\)/, "appointment date may remain in the future");
assert.match(stateSource, /requireState\(item\.phase === "PRELIMINARY", "เสนอแผนได้เฉพาะสำนวน/);
assert.match(stateSource, /requireState\(item\.phase === "PRELIMINARY", "เสนอรายงาน 213 ได้เฉพาะสำนวน/);
assert.match(stateSource, /requireState\(item\.phase === "INQUIRY", "เสนอรายงาน 644 ได้เฉพาะสำนวน/);

console.log("PASS ui-copy.test.mjs: operational copy ban list");
