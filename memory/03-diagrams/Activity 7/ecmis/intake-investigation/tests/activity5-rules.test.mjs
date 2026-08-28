import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const rules = require("../assets/activity5-rules.js");

assert.equal(rules.getA5Rule("extension-213-normal-rounds").status, rules.RULE_STATUSES.CONFIRMED);
assert.equal(rules.getA5Rule("extension-213-normal-rounds").value, 2);
assert.equal(rules.getA5Rule("extension-644-normal-rounds").status, rules.RULE_STATUSES.CONFIRMED);
assert.equal(rules.getA5Rule("extension-644-normal-rounds").value, 4);
assert.deepEqual(rules.getA5Rule("deadline-warning-thresholds").value, { elapsedDays: [15, 30, 45], remainingDays: 15 });
assert.equal(rules.getA5Rule("investigation-213-initial-days").value, 60);
assert.deepEqual(rules.getA5Rule("extension-approved-day-options").value, { min: 1, max: 60, integer: true });
assert.equal(rules.getA5Rule("plan-deadline-offset-days").value, 2);
assert.deepEqual(rules.getA5Rule("physical-custody-statuses").value, ["AT_SOURCE", "IN_TRANSIT", "RECEIVED_AT_DESTINATION", "RETURNED", "NOT_APPLICABLE"]);
assert.equal(rules.getA5Rule("received-date-recorded-channel").status, rules.RULE_STATUSES.CONFIRMED);
assert.equal(rules.getA5Rule("extension-after-normal-rounds").status, rules.RULE_STATUSES.CONFIRMED);
assert.equal(rules.getA5Rule("extension-authority-chain").status, rules.RULE_STATUSES.CONFIRMED);

for (const ruleId of [
  "plan-deadline-day-kind",
  "received-date-outside-office-hours",
  "split-case-board-approval"
]) {
  const rule = rules.getA5Rule(ruleId);
  assert.equal(rule.status, rules.RULE_STATUSES.PENDING_CONFIRMATION, ruleId);
  assert.equal(rule.blocking, true, ruleId);
}

assert.equal(rules.getA5Rule("missing-rule"), null);
assert.equal(Object.isFrozen(rules.A5_RULES), true);
assert.equal(Object.isFrozen(rules.A5_RULES["extension-213-normal-rounds"]), true);

console.log("PASS activity5-rules.test.mjs: confirmed extension limits and pending rules stay separate");
