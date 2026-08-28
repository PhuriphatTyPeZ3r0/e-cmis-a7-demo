/*
 * E-CMIS กิจกรรมที่ 5 — ระบบนับแต้มเงินเพิ่ม (Merit Points)
 * กฎตาม xlsx กระบวนงาน REC6/REC10:
 *   - 213: นับแต้มเมื่อ "เลขาธิการลงนาม" (report-213-sign) → +1 count213 ให้ผู้รับผิดชอบสำนวน
 *   - 644: นับแต้มเมื่อ "ผอ.เขต/กองลงนาม" (report-644-sign) → +1 count644 ให้ผู้ทำ 644 (คนไหนทำคนนั้นได้)
 *   - เกณฑ์ขั้นต่ำ (config แก้ได้): เจ้าหน้า/ชั้น1 = count213 >= 12 · ชั้น 1 = count644 >= 2 · ชั้น 2 = count644 >= 3
 *   - งานไม่ผ่าน (board return) → markFailed(caseId) ไม่นับเรื่องซ้ำ
 */
(function (root, factory) {
  const api = factory(root);
  root.ECMISActivity5MeritPoints = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {

  const THRESHOLDS = Object.freeze({
    OPERATIONAL_213: 12,   // เจ้าหน้าที่: 12 ตรวจ 213
    LEVEL1_644: 2,         // ชั้น 1: 2 ไต่สวนชี้มูล
    LEVEL2_644: 3          // ชั้น 2: 3 ไต่สวนชี้มูล
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value === undefined ? null : value));
  }

  function normalize(state) {
    if (!state.meritPoints || typeof state.meritPoints !== "object" || Array.isArray(state.meritPoints)) {
      state.meritPoints = { officers: {}, failedCases: [] };
    }
    const mp = state.meritPoints;
    if (!mp.officers || typeof mp.officers !== "object") mp.officers = {};
    if (!Array.isArray(mp.failedCases)) mp.failedCases = [];
    return state;
  }

  function officerEntry(state, officerId) {
    normalize(state);
    const id = String(officerId || "").trim();
    if (!id) return null;
    const mp = state.meritPoints;
    if (!mp.officers[id]) {
      mp.officers[id] = { officerId: id, name: "", count213: 0, count644: 0, entries: [] };
    }
    return mp.officers[id];
  }

  /** บันทึกแต้ม — เรียกจาก workflow hook เมื่อลงนามครบขั้น */
  function accrue(state, { officerId, officerName, reportType, caseId, signedAt, signedBy }) {
    if (reportType !== "213" && reportType !== "644") {
      return { ok: false, code: "INVALID_REPORT_TYPE", errors: [{ field: "reportType", message: "นับแต้มได้เฉพาะสำนวน 213/644" }] };
    }
    const entry = officerEntry(state, officerId);
    if (!entry) return { ok: false, code: "MISSING_REQUIRED_FIELD", errors: [{ field: "officerId", message: "ต้องระบุผู้ได้รับแต้ม" }] };
    if (officerName && !entry.name) entry.name = String(officerName);

    const key = reportType === "213" ? "count213" : "count644";
    const dedupeKey = `${caseId}:${reportType}`;
    if ((state.meritPoints.awardedKeys || []).includes(dedupeKey)) {
      return { ok: false, code: "ALREADY_AWARDED", errors: [{ field: "caseId", message: "สำนวนนี้ถูกนับแต้มแล้ว" }] };
    }
    if (!Array.isArray(state.meritPoints.awardedKeys)) state.meritPoints.awardedKeys = [];
    state.meritPoints.awardedKeys.push(dedupeKey);

    entry[key] += 1;
    entry.entries.push({
      caseId: String(caseId || ""), reportType, signedAt: String(signedAt || ""),
      signedBy: String(signedBy || "")
    });
    return { ok: true, code: "MERIT_ACCRUED", state, entry: clone(entry), key };
  }

  /** งานไม่ผ่าน — ไม่นับเรื่องซ้ำ (xlsx REC10) */
  function markFailed(state, { caseId, reportType, reason, decidedAt }) {
    normalize(state);
    const record = { caseId: String(caseId || ""), reportType: String(reportType || ""), reason: String(reason || ""), decidedAt: String(decidedAt || "") };
    const dup = state.meritPoints.failedCases.find(item => item.caseId === record.caseId && item.reportType === record.reportType);
    if (dup) return { ok: false, code: "ALREADY_RECORDED", errors: [{ field: "caseId", message: "บันทึกผลงานไม่ผ่านของสำนวนนี้แล้ว" }] };
    state.meritPoints.failedCases.push(record);
    return { ok: true, code: "MERIT_FAILED_RECORDED", state, record };
  }

  /** ตรวจเกณฑ์ขั้นต่ำของเจ้าหน้าที่แต่ละระดับ */
  function evaluate(officerIdOrState, maybeOfficerId) {
    let state = officerIdOrState, officerId = maybeOfficerId;
    if (typeof officerIdOrState === "string") { officerId = officerIdOrState; state = arguments[1]; }
    if (!state || !officerId) throw new Error("evaluate(state, officerId)");
    normalize(state);
    const entry = state.meritPoints.officers[String(officerId)];
    if (!entry) return { officerId: String(officerId), count213: 0, count644: 0,
      criteria: { operational213: false, level1_644: false, level2_644: false },
      thresholds: THRESHOLDS };
    return {
      officerId: entry.officerId,
      name: entry.name,
      count213: entry.count213,
      count644: entry.count644,
      criteria: {
        operational213: entry.count213 >= THRESHOLDS.OPERATIONAL_213,
        level1_644: entry.count644 >= THRESHOLDS.LEVEL1_644,
        level2_644: entry.count644 >= THRESHOLDS.LEVEL2_644
      },
      thresholds: THRESHOLDS
    };
  }

  const api = Object.freeze({ THRESHOLDS, accrue, markFailed, evaluate });
  return api;
});
