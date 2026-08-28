/* จุดตัดสินเดียวว่าเรื่องในสำนัก store ร่วม ecmis-a4-workspace-v3 อยู่ฝั่ง
 * ก4 (ทะเบียนควบคุม/รับเรื่อง) หรือฝั่ง ก5 (ไต่สวน) — ต้องตรงกับ allA5Cases()
 * ใน activity5-workspace.js:1715 เป๊ะ ห้ามมี logic คัดกรองแบบนี้ซ้ำที่อื่น
 */
(function (root) {
  function isInquiryCase(state) {
    const stage = (state && state.workflow && state.workflow.stage) || '';
    const complete = !!(state && state.workflow && state.workflow.complete);
    const decision = state && state.caseData && state.caseData.decision;
    return stage.startsWith('a5-') || stage === 'closed' ||
      (stage === 'activity5-dispatch' && complete) ||
      decision === '58/2' || decision === '62';
  }
  root.ECMISCasePartition = Object.freeze({ isInquiryCase });
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ECMISCasePartition;
})(typeof globalThis === 'undefined' ? window : globalThis);
