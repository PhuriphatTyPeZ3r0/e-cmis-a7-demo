(function initializeActivity5RoleModel(root) {
  const UNIT_SCOPE = Object.freeze({ OPERATIONAL: "OPERATIONAL", CENTRAL: "CENTRAL" });
  const role = (code, label, permissionRole, unitScope, recordSteps) => Object.freeze({
    code,
    label,
    permissionRole,
    unitScope,
    recordSteps: Object.freeze([...recordSteps])
  });
  const ROLE_DEFINITIONS = Object.freeze([
    role("case-clerk", "เจ้าหน้าที่ธุรการคดีประจำเขต/กองปราบ", "clerk", UNIT_SCOPE.OPERATIONAL, [1, 7]),
    role("gbk-clerk", "เจ้าหน้าที่ กบค. ผู้รับคืนและจัดเส้นทางสำนวน", "clerk", UNIT_SCOPE.CENTRAL, [1, 2, 6]),
    role("investigator", "ผู้รับผิดชอบสำนวน", "investigator", UNIT_SCOPE.OPERATIONAL, [1, 2, 3, 4, 5, 6, 7, 8]),
    role("group-director", "ผู้บังคับบัญชาชั้นต้น/ผอ.กลุ่มงาน (เมื่ออยู่ในสาย)", "group-director", UNIT_SCOPE.OPERATIONAL, [2, 5, 6]),
    role("unit-director", "ผอ.หน่วยงานเจ้าของสำนวน (เขต 1–9/กองปราบ 1–5)", "director", UNIT_SCOPE.OPERATIONAL, [1, 2, 4, 5, 6]),
    role("assistant-secretary", "ผู้ช่วยเลขาธิการที่กำกับ", "executive", UNIT_SCOPE.CENTRAL, [4, 5, 6]),
    role("deputy-secretary", "รองเลขาธิการที่กำกับ", "executive", UNIT_SCOPE.CENTRAL, [4, 5, 6]),
    role("secretary", "เลขาธิการคณะกรรมการ ป.ป.ท.", "secretary", UNIT_SCOPE.CENTRAL, [4, 5, 6, 7]),
    role("inquiry-panel", "คณะพนักงานไต่สวน (ตามคำสั่งแต่งตั้ง)", "investigator", UNIT_SCOPE.OPERATIONAL, [7, 8]),
    role("inquiry-subcommittee", "คณะอนุกรรมการไต่สวน (ตามคำสั่งแต่งตั้ง)", "investigator", UNIT_SCOPE.OPERATIONAL, [7, 8]),
    role("central-registry", "สารบรรณกลาง สลธ. (รับ–ส่ง/ลงทะเบียน)", "clerk", UNIT_SCOPE.CENTRAL, [6, 7])
  ]);

  const ROLE_BY_CODE = new Map(ROLE_DEFINITIONS.map(role => [role.code, role]));
  const LEGACY_ROLES = new Set(["clerk", "director", "executive", "committee", "anonymous"]);
  const GBK_ACTIONS = new Set([
    "gbk-receive",
    "gbk-reroute",
    "nacc-referral-gbk-receive",
    "report-213-gbk-receive"
  ]);
  const CENTRAL_REGISTRY_ACTIONS = new Set([
    "custody-dispatch",
    "custody-receive",
    "custody-return",
    "return-dispatch",
    "report-213-send-a7",
    "report-213-record-receipt",
    "report-644-send-a7",
    "report-644-record-receipt"
  ]);

  function listSelectableA5Roles() {
    return ROLE_DEFINITIONS.map(role => Object.freeze({ ...role }));
  }

  function getA5Role(code) {
    return ROLE_BY_CODE.get(String(code || "")) || null;
  }

  function getA5RoleLabel(code) {
    const role = getA5Role(code);
    if (role) return role.label;
    return Object.freeze({
      clerk: "ธุรการคดี (Legacy)",
      director: "ผอ.หน่วยงาน (Legacy)",
      executive: "ผู้ช่วย/รองเลขาธิการ (Legacy)",
      committee: "ผู้บันทึกผลจากกิจกรรมที่ 7 (Legacy)",
      anonymous: "กล่องบัตรสนเท่ห์ (Legacy)"
    })[String(code || "")] || String(code || "");
  }

  function getA5PermissionRole(code) {
    const normalized = String(code || "");
    return getA5Role(normalized)?.permissionRole || (LEGACY_ROLES.has(normalized) ? normalized : normalized);
  }

  function isInquiryBodyRole(code) {
    return ["inquiry-panel", "inquiry-subcommittee"].includes(String(code || ""));
  }

  function requiresOperationalUnit(code) {
    return getA5Role(code)?.unitScope === UNIT_SCOPE.OPERATIONAL;
  }

  function canA5RolePerform(code, actionId, context = {}) {
    const roleCode = String(code || "");
    const action = String(actionId || "");
    if (!action) return false;
    if (action === "report-213-record-result" && roleCode !== "case-clerk") return false;
    if (LEGACY_ROLES.has(roleCode) || ["investigator", "group-director", "secretary"].includes(roleCode)) return true;
    if (roleCode === "case-clerk") return !GBK_ACTIONS.has(action);
    if (roleCode === "gbk-clerk") return GBK_ACTIONS.has(action);
    if (roleCode === "central-registry") return CENTRAL_REGISTRY_ACTIONS.has(action);
    if (["unit-director", "assistant-secretary", "deputy-secretary"].includes(roleCode)) return true;
    if (isInquiryBodyRole(roleCode)) {
      const expectedOrderType = roleCode === "inquiry-panel" ? "24v1" : "24v3";
      if (String(context.orderType || "") !== expectedOrderType) return false;
      if (action.includes("213")) return false;
      if (action.includes("644")) return true;
      if (["search-warrant-mock-request", "search-warrant-create", "search-warrant-send-a9", "search-warrant-record-a9-receipt", "search-warrant-record-court-result", "search-warrant-record-search"].includes(action)) {
        return String(context.reportType || "") === "644";
      }
      return false;
    }
    return false;
  }

  const api = Object.freeze({
    UNIT_SCOPE,
    ROLE_DEFINITIONS,
    listSelectableA5Roles,
    getA5Role,
    getA5RoleLabel,
    getA5PermissionRole,
    isInquiryBodyRole,
    requiresOperationalUnit,
    canA5RolePerform
  });

  root.ECMISActivity5RoleModel = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis === "undefined" ? window : globalThis);
