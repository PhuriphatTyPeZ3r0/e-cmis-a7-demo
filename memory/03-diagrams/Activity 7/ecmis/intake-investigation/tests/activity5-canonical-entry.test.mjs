import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const staffHtml = readFileSync(new URL("../staff-workflow.html", import.meta.url), "utf8");
const sidebar = readFileSync(new URL("../assets/ecmis-sidebar.js", import.meta.url), "utf8");

assert.match(staffHtml, /id="a5App"/);
assert.match(staffHtml, /src="assets\/activity5-workspace\.js/);
assert.doesNotMatch(staffHtml, /activity5\/index\.html/);

const rulesIndex = staffHtml.indexOf("assets/activity5-rules.js");
const recommendationIndex = staffHtml.indexOf("assets/activity5-assignment-recommendation.js");
const workflowIndex = staffHtml.indexOf("assets/activity5-workflow.js");
const workspaceIndex = staffHtml.indexOf("assets/activity5-workspace.js");
assert.ok(rulesIndex >= 0 && rulesIndex < workflowIndex, "rules must load before workflow");
assert.ok(recommendationIndex >= 0 && recommendationIndex < workflowIndex, "recommendation must load before workflow");
assert.ok(workflowIndex < workspaceIndex, "workflow must load before workspace");

assert.match(sidebar, /roleUrl\('staff-workflow\.html', role, \{ view: 'a5', a5q: q \}\)/);
assert.doesNotMatch(sidebar, /activity5\/index\.html/);
assert.match(sidebar, /view: 'a5'/);

const canonical = new URL("staff-workflow.html?view=a5", "http://localhost/");
assert.equal(canonical.pathname, "/staff-workflow.html");
assert.equal(canonical.searchParams.get("view"), "a5");

console.log("PASS activity5-canonical-entry.test.mjs: embedded staff-workflow route and module order");
