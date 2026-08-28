(function initializeActivity5Workflow(root) {
  const PROCESS_STATES = Object.freeze({
    PENDING_INTAKE_CHECK: "PENDING_INTAKE_CHECK",
    PENDING_DIRECTOR_ASSIGNMENT: "PENDING_DIRECTOR_ASSIGNMENT",
    INTAKE_CHECKED: "INTAKE_CHECKED",
    ASSIGNMENT_PROPOSED: "ASSIGNMENT_PROPOSED",
    ASSIGNMENT_APPROVED: "ASSIGNMENT_APPROVED",
    OFFICER_ACCEPTED: "OFFICER_ACCEPTED",
    CLERK_ACKNOWLEDGED: "CLERK_ACKNOWLEDGED",
    PLAN_DRAFT: "PLAN_DRAFT",
    PLAN_SUBMITTED: "PLAN_SUBMITTED",
    PLAN_APPROVED: "PLAN_APPROVED",
    PLAN_RETURNED: "PLAN_RETURNED",
    AMENDMENT_DRAFT: "AMENDMENT_DRAFT",
    AMENDMENT_SUBMITTED: "AMENDMENT_SUBMITTED",
    AMENDMENT_APPROVED: "AMENDMENT_APPROVED",
    AMENDMENT_RETURNED: "AMENDMENT_RETURNED",
    COMPLETED: "COMPLETED",
    LEGACY_ACTIVE: "LEGACY_ACTIVE"
  });

  const ACTIONS = Object.freeze({
    "intake-review-submit": Object.freeze({ id: "intake-review-submit", label: "ส่งผลตรวจให้ ผอ.เขต", role: "clerk", from: PROCESS_STATES.PENDING_INTAKE_CHECK, to: PROCESS_STATES.PENDING_DIRECTOR_ASSIGNMENT }),
    "assignment-confirm": Object.freeze({ id: "assignment-confirm", label: "ยืนยันมอบหมายสำนวน", role: "director", from: PROCESS_STATES.PENDING_DIRECTOR_ASSIGNMENT, to: PROCESS_STATES.ASSIGNMENT_APPROVED }),
    "officer-accept": Object.freeze({ id: "officer-accept", label: "รับมอบและลงนามรับสำนวน", role: "investigator", from: PROCESS_STATES.ASSIGNMENT_APPROVED, to: PROCESS_STATES.OFFICER_ACCEPTED }),
    "plan-start": Object.freeze({ id: "plan-start", label: "เริ่มจัดทำแผน", role: "investigator", from: PROCESS_STATES.OFFICER_ACCEPTED, to: PROCESS_STATES.PLAN_DRAFT }),
    "plan-submit": Object.freeze({ id: "plan-submit", label: "เสนอแผนคดี", role: "investigator", from: [PROCESS_STATES.PLAN_DRAFT, PROCESS_STATES.PLAN_RETURNED], to: PROCESS_STATES.PLAN_SUBMITTED }),
    "plan-approve": Object.freeze({ id: "plan-approve", label: "อนุมัติแผนคดี", role: "director", from: PROCESS_STATES.PLAN_SUBMITTED, to: PROCESS_STATES.PLAN_APPROVED }),
    "plan-return": Object.freeze({ id: "plan-return", label: "ส่งแผนคดีกลับแก้ไข", role: "director", from: PROCESS_STATES.PLAN_SUBMITTED, to: PROCESS_STATES.PLAN_RETURNED, primary: false }),
    "plan-amend": Object.freeze({ id: "plan-amend", label: "จัดทำแผนคดีฉบับแก้ไข", role: "investigator", from: [PROCESS_STATES.PLAN_APPROVED, PROCESS_STATES.AMENDMENT_APPROVED], to: PROCESS_STATES.AMENDMENT_DRAFT }),
    "amendment-submit": Object.freeze({ id: "amendment-submit", label: "เสนอแผนคดีฉบับแก้ไข", role: "investigator", from: [PROCESS_STATES.AMENDMENT_DRAFT, PROCESS_STATES.AMENDMENT_RETURNED], to: PROCESS_STATES.AMENDMENT_SUBMITTED }),
    "amendment-approve": Object.freeze({ id: "amendment-approve", label: "อนุมัติแผนคดีฉบับแก้ไข", role: "director", from: PROCESS_STATES.AMENDMENT_SUBMITTED, to: PROCESS_STATES.AMENDMENT_APPROVED }),
    "amendment-return": Object.freeze({ id: "amendment-return", label: "ส่งแผนคดีฉบับแก้ไขกลับ", role: "director", from: PROCESS_STATES.AMENDMENT_SUBMITTED, to: PROCESS_STATES.AMENDMENT_RETURNED, primary: false })
  });

  const CUSTODY_ACTIONS = Object.freeze({
    "custody-dispatch": Object.freeze({ id: "custody-dispatch", label: "ส่งต้นฉบับ/EMS", role: "clerk", primary: false }),
    "custody-receive": Object.freeze({ id: "custody-receive", label: "ยืนยันรับต้นฉบับ", role: "clerk", primary: false }),
    "custody-return": Object.freeze({ id: "custody-return", label: "บันทึกส่งคืนต้นฉบับ", role: "clerk", primary: false })
  });
  const ADMIN_ACTIONS = Object.freeze({
    "return-request": Object.freeze({ id: "return-request", label: "ขอส่งคืนสำนวนผ่าน กบค. (ส่งผิดเขต)", role: "investigator", primary: false }),
    "return-approve": Object.freeze({ id: "return-approve", label: "อนุมัติส่งคืน กบค.", role: "director", primary: false }),
    "return-dispatch": Object.freeze({ id: "return-dispatch", label: "ส่งคืนสำนวนและต้นฉบับ", role: "clerk", primary: false }),
    "gbk-receive": Object.freeze({ id: "gbk-receive", label: "กบค. รับสำนวนคืน", role: "clerk", primary: false }),
    "gbk-reroute": Object.freeze({ id: "gbk-reroute", label: "กบค. จัดเส้นทางใหม่", role: "clerk", primary: false }),
    "destination-receive": Object.freeze({ id: "destination-receive", label: "ปลายทางรับสำนวน", role: "clerk", primary: false }),
    "team-update": Object.freeze({ id: "team-update", label: "ปรับผู้ช่วยผู้รับผิดชอบ", role: "director", primary: false }),
    // Reassignment ceremony (Phase 10, item 4): request (clerk or any investigator on the
    // case — primary or assistant) → clerk logs → primary-reassign (ผอ.) → handoff (outgoing
    // officer) → officer-accept (incoming officer, existing mechanism). "role" below is the
    // declared default; reassignment-request also allows role "clerk" — see the explicit
    // exception in executeAdminActionCore, mirroring the existing xl-approve pattern.
    "reassignment-request": Object.freeze({ id: "reassignment-request", label: "ยื่นคำขอเปลี่ยนผู้รับผิดชอบหลัก", role: "investigator", primary: false }),
    "reassignment-request-log": Object.freeze({ id: "reassignment-request-log", label: "รับคำขอเปลี่ยนผู้รับผิดชอบหลัก", role: "clerk", primary: false }),
    "primary-reassign": Object.freeze({ id: "primary-reassign", label: "เปลี่ยนผู้รับผิดชอบหลัก", role: "director", primary: false }),
    "reassignment-handoff": Object.freeze({ id: "reassignment-handoff", label: "ส่งมอบงานให้ผู้รับผิดชอบหลักคนใหม่", role: "investigator", primary: false }),
    "panel-change-draft": Object.freeze({ id: "panel-change-draft", label: "จัดทำคำขอปรับองค์คณะ", role: "investigator", primary: false }),
    "panel-change-submit": Object.freeze({ id: "panel-change-submit", label: "เสนอคำขอปรับองค์คณะ", role: "investigator", primary: false }),
    "case-size-set": Object.freeze({ id: "case-size-set", label: "กำหนดขนาดคดี", role: "investigator", primary: false }),
    "xl-approve": Object.freeze({ id: "xl-approve", label: "อนุมัติขั้นต่อไป (XL)", role: "director", primary: false }),
    "xl-board-confirm": Object.freeze({ id: "xl-board-confirm", label: "บันทึกมติบอร์ด (กิจกรรมที่ 7) ยืนยันขนาดคดี XL", role: "committee", primary: false })
  });
  const DOWNSTREAM_STATUSES = Object.freeze([
    "REPORT_213_DRAFT", "REPORT_213_REVIEW_PENDING", "REPORT_213_RETURNED", "REPORT_213_BOARD_READY", "REPORT_213_SENT_TO_A7", "REPORT_213_WAIT_RESULT", "REPORT_213_RESULT_RECEIVED",
    "REPORT_644_DRAFT", "REPORT_644_REVIEW_PENDING", "REPORT_644_RETURNED", "REPORT_644_BOARD_READY", "REPORT_644_SENT_TO_A7", "REPORT_644_WAIT_RESULT", "REPORT_644_RESULT_RECEIVED",
    "OUTCOME_TASKS_PENDING", "OUTCOME_TASKS_IN_PROGRESS",
    "PROSECUTOR_PACKAGE_PREPARING", "PROSECUTOR_PACKAGE_READY", "PROSECUTOR_PACKAGE_SENT", "PROSECUTOR_RECEIPT_PENDING", "PROSECUTOR_ORDER_PENDING", "PROSECUTOR_ORDER_RECEIVED", "PROSECUTOR_EXECUTING", "PROSECUTOR_RESULT_READY", "PROSECUTOR_RESULT_SENT", "PROSECUTOR_RESULT_RECEIVED",
    "CLOSURE_REVIEW", "CLOSED"
  ]);
  const DOWNSTREAM_STATUS_SET = new Set(DOWNSTREAM_STATUSES);
  // Typed categories for the order recorded at prosecutor-record-order. ADD_ACCUSED/ADDITIONAL_NOTICE/
  // SPLIT_CASE/ADDITIONAL_INQUIRY are candidate labels only (not source-confirmed) — their downstream
  // mechanism is registered as PENDING_CONFIRMATION in activity5-rules.js and blocked at prosecutor-complete-order.
  const PROSECUTOR_ORDER_TYPES = Object.freeze({
    INDICT: "สั่งฟ้อง",
    NO_INDICT: "สั่งไม่ฟ้อง",
    ADD_ACCUSED: "สั่งให้เพิ่มผู้ถูกกล่าวหา",
    ADDITIONAL_NOTICE: "สั่งให้แจ้งข้อกล่าวหาเพิ่มเติม",
    SPLIT_CASE: "สั่งให้แยกสำนวน",
    ADDITIONAL_INQUIRY: "สั่งให้ไต่สวนข้อเท็จจริงเพิ่มเติม",
    OTHER: "อื่น ๆ"
  });
  const PROSECUTOR_ORDER_PENDING_RULE = Object.freeze({
    ADD_ACCUSED: "prosecutor-order-add-accused-mechanism",
    ADDITIONAL_NOTICE: "prosecutor-order-additional-notice-mechanism",
    SPLIT_CASE: "prosecutor-order-split-case-mechanism",
    ADDITIONAL_INQUIRY: "prosecutor-order-additional-inquiry-mechanism"
  });
  const NACC_REPORT_ACTION = Object.freeze({ id: "nacc-report-add", label: "เพิ่มรายงานผลต่อ ป.ป.ช.", role: "investigator", primary: true });
  const DOWNSTREAM_ACTIONS = Object.freeze({
    "report-213-submit": { id: "report-213-submit", label: "เสนอรายงาน 213", role: "investigator", from: ["REPORT_213_DRAFT", "REPORT_213_RETURNED"] },
    "report-213-review-return": { id: "report-213-review-return", label: "ส่งรายงาน 213 กลับแก้ไข", role: "director", from: ["REPORT_213_REVIEW_PENDING"], primary: false },
    "report-213-review-approve": { id: "report-213-review-approve", label: "เห็นชอบรายงาน 213", role: "director", from: ["REPORT_213_REVIEW_PENDING"] },
    "report-213-send-a7": { id: "report-213-send-a7", label: "ส่งรายงาน 213 ไปกิจกรรมที่ 7", role: "clerk", from: ["REPORT_213_BOARD_READY"] },
    "report-213-record-receipt": { id: "report-213-record-receipt", label: "บันทึกหลักฐานรับรายงาน 213", role: "clerk", from: ["REPORT_213_SENT_TO_A7"] },
    "report-213-record-result": { id: "report-213-record-result", label: "บันทึกผลพิจารณา 213", role: "committee", from: ["REPORT_213_WAIT_RESULT"] },
    "report-644-submit": { id: "report-644-submit", label: "เสนอรายงาน 644", role: "investigator", from: ["REPORT_644_DRAFT", "REPORT_644_RETURNED"] },
    "report-644-review-return": { id: "report-644-review-return", label: "ส่งรายงาน 644 กลับแก้ไข", role: "director", from: ["REPORT_644_REVIEW_PENDING"], primary: false },
    "report-644-review-approve": { id: "report-644-review-approve", label: "เห็นชอบรายงาน 644", role: "director", from: ["REPORT_644_REVIEW_PENDING"] },
    "report-644-send-a7": { id: "report-644-send-a7", label: "ส่งรายงาน 644 ไปกิจกรรมที่ 7", role: "clerk", from: ["REPORT_644_BOARD_READY"] },
    "report-644-record-receipt": { id: "report-644-record-receipt", label: "บันทึกหลักฐานรับรายงาน 644", role: "clerk", from: ["REPORT_644_SENT_TO_A7"] },
    "report-644-record-result": { id: "report-644-record-result", label: "บันทึกผลพิจารณา 644", role: "committee", from: ["REPORT_644_WAIT_RESULT"] },
    "outcome-task-start": { id: "outcome-task-start", label: "เริ่มดำเนินการตามมติ", role: "clerk", from: ["REPORT_213_RESULT_RECEIVED", "REPORT_644_RESULT_RECEIVED", "OUTCOME_TASKS_PENDING", "OUTCOME_TASKS_IN_PROGRESS"] },
    "outcome-task-complete": { id: "outcome-task-complete", label: "ยืนยันผลการดำเนินงาน", role: "clerk", from: ["OUTCOME_TASKS_IN_PROGRESS"] },
    "outcome-task-send": { id: "outcome-task-send", label: "ยืนยันส่งหนังสือไปปลายทาง", role: "clerk", from: ["OUTCOME_TASKS_IN_PROGRESS"] },
    "outcome-task-record-receipt": { id: "outcome-task-record-receipt", label: "บันทึกหลักฐานปลายทางรับ", role: "clerk", from: ["OUTCOME_TASKS_IN_PROGRESS"] },
    "prosecutor-package-ready": { id: "prosecutor-package-ready", label: "ยืนยันชุดสำนวนพร้อมส่งอัยการ", role: "clerk", from: ["PROSECUTOR_PACKAGE_PREPARING"] },
    "prosecutor-send": { id: "prosecutor-send", label: "ส่งชุดสำนวนให้อัยการ", role: "clerk", from: ["PROSECUTOR_PACKAGE_READY"] },
    "prosecutor-record-receipt": { id: "prosecutor-record-receipt", label: "บันทึกหลักฐานอัยการรับสำนวน", role: "clerk", from: ["PROSECUTOR_RECEIPT_PENDING"] },
    "prosecutor-record-order": { id: "prosecutor-record-order", label: "บันทึกคำสั่งอัยการ", role: "clerk", from: ["PROSECUTOR_ORDER_PENDING"] },
    "prosecutor-start-execution": { id: "prosecutor-start-execution", label: "เริ่มดำเนินการตามคำสั่งอัยการ", role: "clerk", from: ["PROSECUTOR_ORDER_RECEIVED"] },
    "prosecutor-complete-order": { id: "prosecutor-complete-order", label: "ยืนยันดำเนินการตามคำสั่งแล้ว", role: "clerk", from: ["PROSECUTOR_EXECUTING"] },
    "prosecutor-result-send": { id: "prosecutor-result-send", label: "ส่งผลดำเนินการกลับอัยการ", role: "clerk", from: ["PROSECUTOR_RESULT_READY"] },
    "prosecutor-result-receipt": { id: "prosecutor-result-receipt", label: "บันทึกหลักฐานรับผล", role: "clerk", from: ["PROSECUTOR_RESULT_SENT"] },
    "closure-evaluate": { id: "closure-evaluate", label: "ตรวจความพร้อมปิดสำนวน", role: "clerk", from: ["REPORT_213_RESULT_RECEIVED", "REPORT_644_DRAFT", "REPORT_644_REVIEW_PENDING", "REPORT_644_RETURNED", "REPORT_644_BOARD_READY", "REPORT_644_SENT_TO_A7", "REPORT_644_WAIT_RESULT", "REPORT_644_RESULT_RECEIVED", "OUTCOME_TASKS_PENDING", "OUTCOME_TASKS_IN_PROGRESS", "PROSECUTOR_RESULT_RECEIVED"] },
    "case-close": { id: "case-close", label: "อนุมัติปิดสำนวน", role: "director", from: ["CLOSURE_REVIEW"] }
  });

  const PROCESS_STATE_SET = new Set(Object.values(PROCESS_STATES));

  function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(asObject(value)));
  }

  function normalizeDocumentStore(state) {
    const documentDomain = root.ECMISActivity5DocumentDomain
      || (typeof require === "function" ? require("./activity5-document-domain.js") : null);
    const result = documentDomain?.normalizeA5DocumentStore?.(state);
    return result?.ok ? result.state : state;
  }

  function normalizePlanWorklog(state) {
    const planWorklog = root.ECMISActivity5PlanWorklog
      || (typeof require === "function" ? require("./activity5-plan-worklog.js") : null);
    const result = planWorklog?.normalizeCasePlanA5?.(state);
    return result?.ok ? result.state : state;
  }

  function normalizeReport644(state) {
    if (!["a5-inquiry", "a5-inquiry-review", "a7-644", "a5-outcome", "a5-prosecutor", "closed"].includes(String(state.workflow?.stage || ""))) return state;
    const report644 = root.ECMISActivity5Report644
      || (typeof require === "function" ? require("./activity5-report-644.js") : null);
    const result = report644?.normalizeReport644A5?.(state);
    return result?.ok ? result.state : state;
  }

  function isoDate(value) {
    return String(value || "").slice(0, 10);
  }

  function addCalendarDays(value, days) {
    const parts = isoDate(value).split("-").map(Number);
    if (parts.length !== 3 || parts.some(part => !Number.isFinite(part))) return "";
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + days));
    return date.toISOString().slice(0, 10);
  }

  function planScopeKey(state) {
    const stage = String(state.workflow?.stage || "");
    return ["a5-inquiry", "a5-inquiry-review", "a7-644", "a5-outcome", "a5-prosecutor", "closed"].includes(stage)
      ? "inquiry644"
      : "prelim";
  }

  function legacyPlanOf(state) {
    return asObject(asObject(state.inquiry)[planScopeKey(state)]);
  }

  function legacyOwnerOf(state) {
    const inquiry = asObject(state.inquiry);
    const intakeOwner = String(asObject(inquiry.intake).investigator || "").trim();
    if (planScopeKey(state) === "inquiry644") {
      return String(asObject(inquiry.inquiry644).investigator || "").trim() || intakeOwner;
    }
    return intakeOwner;
  }

  function processStateForPlanStatus(value) {
    const status = String(value || "").trim().toLowerCase();
    if (["approved", "อนุมัติแล้ว"].includes(status)) return PROCESS_STATES.PLAN_APPROVED;
    if (["submitted", "รออนุมัติ", "รออนุมัติจากหัวหน้าพนักงาน"].includes(status)) return PROCESS_STATES.PLAN_SUBMITTED;
    if (["returned", "ส่งกลับแก้ไข"].includes(status)) return PROCESS_STATES.PLAN_RETURNED;
    return null;
  }

  function initialProcessState(state) {
    const stage = String(state.workflow?.stage || "");
    if (stage === "activity5-dispatch") return PROCESS_STATES.PENDING_INTAKE_CHECK;
    if (stage === "closed" || state.workflow?.complete === true) return PROCESS_STATES.COMPLETED;
    if (stage === "a5-intake") return PROCESS_STATES.PENDING_INTAKE_CHECK;
    const legacyPlanState = processStateForPlanStatus(legacyPlanOf(state).planStatus);
    if (legacyPlanState) return legacyPlanState;
    if (["a5-prelim", "a5-prelim-review", "a5-inquiry", "a5-inquiry-review"].includes(stage)) return PROCESS_STATES.PLAN_DRAFT;
    if (stage.startsWith("a5-") || stage.startsWith("a7-")) return PROCESS_STATES.LEGACY_ACTIVE;
    return PROCESS_STATES.LEGACY_ACTIVE;
  }

  function normalizeA5State(sourceState) {
    const state = clone(sourceState);
    state.workflow = asObject(state.workflow);
    state.intake = asObject(state.intake);
    const workflowStatus = String(state.workflow.a5Status || "");
    const intakeStatus = String(state.intake.status || "");
    const derivedStatus = initialProcessState(state);
    const terminal = state.workflow.stage === "closed" || (state.workflow.complete === true && state.workflow.stage !== "activity5-dispatch");
    const staleDraft = workflowStatus === PROCESS_STATES.PLAN_DRAFT
      && [PROCESS_STATES.PLAN_SUBMITTED, PROCESS_STATES.PLAN_APPROVED, PROCESS_STATES.PLAN_RETURNED].includes(derivedStatus);
    state.workflow.a5Status = terminal
      ? PROCESS_STATES.COMPLETED
      : staleDraft
        ? derivedStatus
        : PROCESS_STATE_SET.has(workflowStatus)
          ? workflowStatus
          : PROCESS_STATE_SET.has(intakeStatus)
            ? intakeStatus
            : derivedStatus;
    if ([PROCESS_STATES.INTAKE_CHECKED, PROCESS_STATES.ASSIGNMENT_PROPOSED].includes(state.workflow.a5Status)) {
      state.workflow.a5Status = PROCESS_STATES.PENDING_DIRECTOR_ASSIGNMENT;
    }
    if (state.workflow.a5Status === PROCESS_STATES.CLERK_ACKNOWLEDGED) state.workflow.a5Status = PROCESS_STATES.OFFICER_ACCEPTED;
    state.intake.status = state.workflow.a5Status;
    state.intake.receivedDate = asObject(state.intake.receivedDate);
    const legacyIntake = asObject(asObject(state.inquiry).intake);
    if (!state.intake.receivedDate.channel && state.caseData?.channel) state.intake.receivedDate.channel = String(state.caseData.channel);
    if (!state.intake.receivedDate.recordedAt && legacyIntake.receivedFirstAt) state.intake.receivedDate.recordedAt = String(legacyIntake.receivedFirstAt);
    if (!state.intake.receivedDate.effectiveDate && legacyIntake.receivedFirstAt) state.intake.receivedDate.effectiveDate = String(legacyIntake.receivedFirstAt);
    state.custody = asObject(state.custody);
    const legacyCustody = asObject(legacyIntake.physicalCustody);
    state.custody.hasOriginal = state.custody.hasOriginal === true || legacyCustody.hasOriginal === true;
    state.custody.status = String(state.custody.status || legacyCustody.status || (state.custody.hasOriginal ? "AT_SOURCE" : "NOT_APPLICABLE"));
    state.custody.history = Array.isArray(state.custody.history) ? state.custody.history : [];
    state.returnRoute = asObject(state.returnRoute);
    state.returnRoute.status = String(state.returnRoute.status || "");
    state.returnRoute.history = Array.isArray(state.returnRoute.history) ? state.returnRoute.history : [];
    state.assignment = asObject(state.assignment);
    state.migrationAudit = Array.isArray(state.migrationAudit) ? state.migrationAudit : [];
    const hadCanonicalPrimary = Boolean(String(state.assignment.primaryOfficerId || "").trim());
    const legacyOwner = legacyOwnerOf(state);
    const intakeFoundation = state.workflow.stage === "a5-intake" && ![PROCESS_STATES.LEGACY_ACTIVE, PROCESS_STATES.COMPLETED].includes(state.workflow.a5Status);
    const legacyProposalStatus = [PROCESS_STATES.INTAKE_CHECKED, PROCESS_STATES.ASSIGNMENT_PROPOSED].includes(workflowStatus)
      || [PROCESS_STATES.INTAKE_CHECKED, PROCESS_STATES.ASSIGNMENT_PROPOSED].includes(intakeStatus);
    const quarantinedProposal = Boolean(state.assignment.legacyProposalDraft);
    const isLegacyProposal = legacyProposalStatus || quarantinedProposal;
    if (legacyProposalStatus) {
      state.assignment.legacyProposalDraft = {
        proposedOfficer: String(state.assignment.proposedOfficer || state.assignment.approvedOfficer || state.assignment.legalOwner || legacyOwner || ""),
        proposedAssistantOfficerIds: [...new Set((Array.isArray(state.assignment.proposedTeamMembers) ? state.assignment.proposedTeamMembers : Array.isArray(state.assignment.teamMembers) ? state.assignment.teamMembers : Array.isArray(legacyIntake.team) ? legacyIntake.team : []).map(String).map(value => value.trim()).filter(Boolean))],
        proposedBy: String(state.assignment.proposedBy || ""),
        proposedAt: String(state.assignment.proposedAt || "")
      };
      delete state.assignment.approvedOfficer;
      delete state.assignment.legalOwner;
      delete state.assignment.leadOfficer;
      delete state.assignment.teamMembers;
      delete legacyIntake.investigator;
      delete legacyIntake.team;
    }
    const legacyPrimaryValues = [state.assignment.primaryOfficerId, state.assignment.approvedOfficer, state.assignment.legalOwner, intakeFoundation ? "" : legacyOwner]
      .map(value => String(value || "").trim()).filter(Boolean);
    const distinctLegacyPrimaries = [...new Set(legacyPrimaryValues)];
    state.migrationBlocked = state.migrationBlocked === true || distinctLegacyPrimaries.length > 1;
    const resolvedPrimary = state.migrationBlocked || isLegacyProposal ? "" : (distinctLegacyPrimaries[0] || "");
    state.assignment.primaryOfficerId = resolvedPrimary;
    const legacyTeam = Array.isArray(state.assignment.assistantOfficerIds)
      ? state.assignment.assistantOfficerIds
      : Array.isArray(state.assignment.teamMembers) ? state.assignment.teamMembers : [];
    state.assignment.assistantOfficerIds = [...new Set(legacyTeam.map(value => String(value).trim()).filter(value => value && value !== resolvedPrimary))];
    if (Array.isArray(state.assignment.performanceOwners) && !Array.isArray(state.assignment.legacyPerformanceOwners)) {
      state.assignment.legacyPerformanceOwners = [...state.assignment.performanceOwners];
    }
    if (Object.prototype.hasOwnProperty.call(state.assignment, "performanceOwners")) delete state.assignment.performanceOwners;
    state.assignment.assignmentVersion = Math.max(0, Number(state.assignment.assignmentVersion) || (resolvedPrimary ? 1 : 0));
    state.assignment.acceptedBy = String(state.assignment.acceptedBy || "");
    state.assignment.acceptedAt = String(state.assignment.acceptedAt || "");
    const explicitLegacyAcceptance = [workflowStatus, intakeStatus].includes(PROCESS_STATES.CLERK_ACKNOWLEDGED)
      || Boolean(state.assignment.acceptedBy.trim() || state.assignment.acceptedAt.trim());
    const explicitAcceptedVersion = resolvedPrimary && explicitLegacyAcceptance;
    const legacyAcceptedByStage = resolvedPrimary && state.workflow.stage !== "a5-intake";
    const hasAcceptedVersion = Object.prototype.hasOwnProperty.call(state.assignment, "acceptedAssignmentVersion");
    state.assignment.acceptedAssignmentVersion = Math.max(0, explicitAcceptedVersion
      ? state.assignment.assignmentVersion
      : hasAcceptedVersion
        ? Number(state.assignment.acceptedAssignmentVersion) || 0
        : legacyAcceptedByStage ? state.assignment.assignmentVersion : 0);
    const migratedLegacyAssignment = isLegacyProposal || workflowStatus === PROCESS_STATES.CLERK_ACKNOWLEDGED || (!hadCanonicalPrimary && (distinctLegacyPrimaries.length > 0 || legacyTeam.length > 0 || Array.isArray(state.assignment.legacyPerformanceOwners)));
    if (migratedLegacyAssignment && !state.migrationAudit.some(event => event.id === "assignment-contract-v1")) {
      state.migrationAudit.push({ id: "assignment-contract-v1", action: "legacy-assignment-normalized" });
    }
    if (!isLegacyProposal && !intakeFoundation && !String(state.assignment.approvedOfficer || "").trim() && legacyOwner) {
      state.assignment.approvedOfficer = legacyOwner;
    }
    if (resolvedPrimary) {
      state.assignment.approvedOfficer = resolvedPrimary;
      state.assignment.legalOwner = resolvedPrimary;
      state.assignment.leadOfficer = resolvedPrimary;
    }
    if (!String(state.assignment.leadOfficer || "").trim() && String(state.assignment.legalOwner || "").trim()) state.assignment.leadOfficer = String(state.assignment.legalOwner);
    if (!isLegacyProposal) state.assignment.teamMembers = Array.isArray(state.assignment.teamMembers) ? state.assignment.teamMembers : Array.isArray(legacyIntake.team) ? [...legacyIntake.team] : [];
    state.reassignmentHistory = Array.isArray(state.reassignmentHistory) ? state.reassignmentHistory : [];
    state.pendingReassignment = asObject(state.pendingReassignment);
    state.pendingReassignment.status = ["", "REQUESTED", "LOGGED", "ASSIGNED", "HANDED_OFF"].includes(state.pendingReassignment.status) ? state.pendingReassignment.status : "";
    state.panelChangeRequests = Array.isArray(state.panelChangeRequests) ? state.panelChangeRequests : [];
    state.caseAdministration = asObject(state.caseAdministration);
    state.caseAdministration.caseSize = ["UNDETERMINED", "S", "M", "L", "XL"].includes(state.caseAdministration.caseSize) ? state.caseAdministration.caseSize : "UNDETERMINED";
    state.caseAdministration.caseSizeComponents = asObject(state.caseAdministration.caseSizeComponents);
    state.caseAdministration.xlRequest = asObject(state.caseAdministration.xlRequest);
    state.caseAdministration.xlRequest.status = ["", "PENDING", "PENDING_BOARD", "APPROVED", "REJECTED"].includes(state.caseAdministration.xlRequest.status) ? state.caseAdministration.xlRequest.status : "";
    state.caseAdministration.xlRequest.approvals = Array.isArray(state.caseAdministration.xlRequest.approvals) ? state.caseAdministration.xlRequest.approvals : [];
    state.caseAdministration.primaryCaseId = String(state.caseAdministration.primaryCaseId || "");
    state.caseAdministration.mergedCaseIds = Array.isArray(state.caseAdministration.mergedCaseIds) ? state.caseAdministration.mergedCaseIds : [];
    state.caseAdministration.splitCases = Array.isArray(state.caseAdministration.splitCases) ? state.caseAdministration.splitCases : [];
    state.caseAdministration.sourceCaseId = String(state.caseAdministration.sourceCaseId || "");
    state.caseAdministration.lockedByMerge = state.caseAdministration.lockedByMerge === true;
    state.assignmentHistory = Array.isArray(state.assignmentHistory) ? state.assignmentHistory : [];
    state.planLifecycle = asObject(state.planLifecycle);
    state.planLifecycle.history = Array.isArray(state.planLifecycle.history) ? state.planLifecycle.history : [];
    const legacyPlan = legacyPlanOf(state);
    if (!String(state.planLifecycle.plan || "").trim() && String(legacyPlan.plan || "").trim()) state.planLifecycle.plan = String(legacyPlan.plan);
    if (!state.planLifecycle.status || state.planLifecycle.status === PROCESS_STATES.PLAN_DRAFT) {
      state.planLifecycle.status = processStateForPlanStatus(legacyPlan.planStatus) || state.workflow.a5Status;
    }
    if (!state.planLifecycle.submittedBy && legacyPlan.planSubmittedBy) state.planLifecycle.submittedBy = legacyPlan.planSubmittedBy;
    if (!state.planLifecycle.submittedAt && legacyPlan.planSubmittedAt) state.planLifecycle.submittedAt = legacyPlan.planSubmittedAt;
    if (!state.planLifecycle.approvedBy && legacyPlan.planApprovedBy) state.planLifecycle.approvedBy = legacyPlan.planApprovedBy;
    if (!state.planLifecycle.approvedAt && legacyPlan.planApprovedAt) state.planLifecycle.approvedAt = legacyPlan.planApprovedAt;
    const legacyVersion = Math.max(0, Number(legacyPlan.planVersion || legacyPlan.version) || 0);
    const approvedVersion = [PROCESS_STATES.PLAN_APPROVED, PROCESS_STATES.AMENDMENT_APPROVED].includes(state.planLifecycle.status) ? 1 : 0;
    state.planLifecycle.version = Math.max(0, Number(state.planLifecycle.version) || 0, legacyVersion, approvedVersion);
    state.planLifecycle.amendment = asObject(state.planLifecycle.amendment);
    state.decisionHistory = Array.isArray(state.decisionHistory) ? state.decisionHistory : [];
    state.downstreamTasks = Array.isArray(state.downstreamTasks) ? state.downstreamTasks : [];
    state.externalExchanges = Array.isArray(state.externalExchanges) ? state.externalExchanges : [];
    state.publicStatusEvents = Array.isArray(state.publicStatusEvents) ? state.publicStatusEvents : [];
    state.naccReportCycles = Array.isArray(state.naccReportCycles) ? state.naccReportCycles : [];
    state.requiredMilestones = Array.isArray(state.requiredMilestones) ? state.requiredMilestones : [];
    const downstreamStatus = String(state.workflow.downstreamStatus || "");
    if (DOWNSTREAM_STATUS_SET.has(downstreamStatus)) state.workflow.downstreamStatus = downstreamStatus;
    else if (state.workflow.stage === "a5-prelim-review") state.workflow.downstreamStatus = "REPORT_213_REVIEW_PENDING";
    else if (state.workflow.stage === "a7-213") state.workflow.downstreamStatus = "REPORT_213_WAIT_RESULT";
    else if (state.workflow.stage === "a5-inquiry" && String(asObject(asObject(state.inquiry).inquiry644).report || "").trim()) state.workflow.downstreamStatus = "REPORT_644_DRAFT";
    else if (state.workflow.stage === "a5-inquiry-review") state.workflow.downstreamStatus = "REPORT_644_REVIEW_PENDING";
    else if (state.workflow.stage === "a7-644") state.workflow.downstreamStatus = "REPORT_644_WAIT_RESULT";
    else if (state.workflow.stage === "a5-outcome") {
      state.workflow.downstreamStatus = "OUTCOME_TASKS_PENDING";
      if (!state.downstreamTasks.length && !state.requiredMilestones.includes("LEGACY_OUTCOME_RECONCILIATION")) state.requiredMilestones.push("LEGACY_OUTCOME_RECONCILIATION");
    }
    else if (state.workflow.stage === "a5-prosecutor") state.workflow.downstreamStatus = "PROSECUTOR_PACKAGE_PREPARING";
    else if (state.workflow.stage === "closed") state.workflow.downstreamStatus = "CLOSED";
    else if (state.workflow.stage === "a5-prelim" && String(asObject(asObject(state.inquiry).prelim).report || "").trim() && [PROCESS_STATES.PLAN_APPROVED, PROCESS_STATES.AMENDMENT_APPROVED, PROCESS_STATES.LEGACY_ACTIVE].includes(state.workflow.a5Status)) state.workflow.downstreamStatus = "REPORT_213_DRAFT";
    return normalizeReport644(normalizePlanWorklog(normalizeDocumentStore(state)));
  }

  function downstreamActionsFor(state, role) {
    const status = String(state.workflow.downstreamStatus || "");
    if (role === "clerk" && ["REPORT_213_RESULT_RECEIVED", "REPORT_644_RESULT_RECEIVED", "OUTCOME_TASKS_PENDING", "OUTCOME_TASKS_IN_PROGRESS"].includes(status)) {
      const task = state.downstreamTasks.find(item => item.status !== "COMPLETED");
      if (!task) return status === "OUTCOME_TASKS_PENDING" || status === "OUTCOME_TASKS_IN_PROGRESS"
        ? [Object.freeze({ ...DOWNSTREAM_ACTIONS["closure-evaluate"], enabled: true })]
        : [];
      const actionId = task.status === "PENDING" ? "outcome-task-start"
        : task.status === "AWAITING_RECEIPT" ? "outcome-task-record-receipt"
          : ["SEND_NACC", "SEND_POLICE", "SEND_DISCIPLINE_AGENCY"].includes(task.type) ? "outcome-task-send" : "outcome-task-complete";
      return [Object.freeze({ ...DOWNSTREAM_ACTIONS[actionId], enabled: true })];
    }
    return Object.values(DOWNSTREAM_ACTIONS)
      .filter(action => action.role === role && action.from.includes(status))
      .map(action => Object.freeze({ id: action.id, label: action.label, primary: action.primary !== false, enabled: true }));
  }

  function getA5AvailableActions(sourceState, role) {
    const state = normalizeA5State(sourceState);
    if (state.migrationBlocked || state.caseAdministration.lockedByMerge || state.workflow.a5Status === PROCESS_STATES.COMPLETED) return [];
    if (role === "investigator" && state.assignment.primaryOfficerId && state.assignment.acceptedAssignmentVersion !== state.assignment.assignmentVersion) {
      return state.workflow.a5Status === PROCESS_STATES.ASSIGNMENT_APPROVED
        ? [Object.freeze({ ...ACTIONS["officer-accept"], primary: true, enabled: true })]
        : [];
    }
    if ((state.caseData?.decision === "62" || asObject(asObject(state.inquiry).intake).m62?.flag === true) && role === NACC_REPORT_ACTION.role) {
      return [Object.freeze({ ...NACC_REPORT_ACTION, enabled: true })];
    }
    const downstreamActions = downstreamActionsFor(state, role);
    if (downstreamActions.length) {
      const amendmentAction = role === "investigator" && [PROCESS_STATES.PLAN_APPROVED, PROCESS_STATES.AMENDMENT_APPROVED].includes(state.workflow.a5Status)
        ? Object.freeze({ id: "plan-amend", label: ACTIONS["plan-amend"].label, primary: false, enabled: true })
        : null;
      return amendmentAction ? [...downstreamActions, amendmentAction] : downstreamActions;
    }
    const actions = Object.values(ACTIONS)
      .filter(action => (Array.isArray(action.from) ? action.from.includes(state.workflow.a5Status) : action.from === state.workflow.a5Status) && action.role === role)
      .map(action => Object.freeze({ id: action.id, label: action.label, primary: action.primary !== false, enabled: true }));
    if (role === "clerk" && state.custody.hasOriginal && state.custody.status === "AT_SOURCE") actions.push(Object.freeze({ ...CUSTODY_ACTIONS["custody-dispatch"], enabled: true }));
    if (role === "clerk" && state.custody.status === "IN_TRANSIT") actions.push(Object.freeze({ ...CUSTODY_ACTIONS["custody-receive"], enabled: true }));
    if (role === "clerk" && state.custody.status === "RECEIVED_AT_DESTINATION") actions.push(Object.freeze({ ...CUSTODY_ACTIONS["custody-return"], enabled: true }));
    return actions;
  }

  function getA5AdminActions(sourceState, role) {
    const state = normalizeA5State(sourceState);
    const actions = [];
    // Handoff (item 4 ceremony) is the one investigator-role admin action that must stay
    // reachable even while acceptedAssignmentVersion lags assignmentVersion — that mismatch
    // is exactly the state primary-reassign leaves behind for the outgoing officer to resolve.
    // It is returned in isolation (not merged into the general body below) so every other
    // admin action stays blocked during the pending-acceptance window, same as before item 4.
    if (role === "investigator" && state.pendingReassignment.status === "ASSIGNED" && state.assignment.acceptedAssignmentVersion !== state.assignment.assignmentVersion) {
      return [Object.freeze({ ...ADMIN_ACTIONS["reassignment-handoff"], enabled: true })];
    }
    if (role === "investigator" && state.assignment.primaryOfficerId && state.assignment.acceptedAssignmentVersion !== state.assignment.assignmentVersion) return actions;
    if (!state.caseAdministration.lockedByMerge && state.workflow.a5Status !== PROCESS_STATES.COMPLETED) {
      if (role === "investigator" && state.assignment.primaryOfficerId && Number(state.assignment.acceptedAssignmentVersion || 0) === Number(state.assignment.assignmentVersion || 0) && !state.returnRoute.status) actions.push(Object.freeze({ ...ADMIN_ACTIONS["return-request"], enabled: true }));
      if (role === "investigator" && state.assignment.primaryOfficerId && Number(state.assignment.acceptedAssignmentVersion || 0) === Number(state.assignment.assignmentVersion || 0)) actions.push(Object.freeze({ ...ADMIN_ACTIONS["case-size-set"], enabled: true }));
      if (["director", "secretary"].includes(role) && state.caseAdministration.xlRequest.status === "PENDING" && xlNextStepFor(state.caseAdministration.xlRequest, role)) actions.push(Object.freeze({ ...ADMIN_ACTIONS["xl-approve"], label: `อนุมัติขั้น ${xlNextStepFor(state.caseAdministration.xlRequest, role)} (XL)`, enabled: true }));
      if (role === "committee" && state.caseAdministration.xlRequest.status === "PENDING_BOARD") actions.push(Object.freeze({ ...ADMIN_ACTIONS["xl-board-confirm"], enabled: true }));
      if (role === "director" && state.returnRoute.status === "RETURN_REQUESTED") actions.push(Object.freeze({ ...ADMIN_ACTIONS["return-approve"], enabled: true }));
      if (role === "clerk" && state.returnRoute.status === "RETURN_APPROVED") actions.push(Object.freeze({ ...ADMIN_ACTIONS["return-dispatch"], enabled: true }));
      if (role === "clerk" && state.returnRoute.status === "RETURN_DISPATCHED") actions.push(Object.freeze({ ...ADMIN_ACTIONS["gbk-receive"], enabled: true }));
      if (role === "clerk" && state.returnRoute.status === "RETURNED_TO_GBK") actions.push(Object.freeze({ ...ADMIN_ACTIONS["gbk-reroute"], enabled: true }));
      if (role === "clerk" && state.returnRoute.status === "REROUTED") actions.push(Object.freeze({ ...ADMIN_ACTIONS["destination-receive"], enabled: true }));
      if (role === "director" && state.assignment.primaryOfficerId) actions.push(Object.freeze({ ...ADMIN_ACTIONS["team-update"], enabled: true }));
      // primary-reassign ceremony (item 4): request (investigator or clerk) → clerk logs →
      // ผอ. reassigns here → handoff → officer-accept. ผอ. only sees the button once a
      // request has been logged; before that, the request/log steps below carry the flow.
      if ((role === "investigator" || role === "clerk") && !state.pendingReassignment.status && state.assignment.primaryOfficerId) actions.push(Object.freeze({ ...ADMIN_ACTIONS["reassignment-request"], enabled: true }));
      if (role === "clerk" && state.pendingReassignment.status === "REQUESTED") actions.push(Object.freeze({ ...ADMIN_ACTIONS["reassignment-request-log"], enabled: true }));
      if (role === "director" && state.assignment.primaryOfficerId && state.pendingReassignment.status === "LOGGED") actions.push(Object.freeze({ ...ADMIN_ACTIONS["primary-reassign"], enabled: true }));
      if (role === "investigator") actions.push(Object.freeze({ ...ADMIN_ACTIONS[state.panelChangeRequests.at(-1)?.status === "DRAFT" ? "panel-change-submit" : "panel-change-draft"], enabled: true }));
    }
    return actions;
  }

  function getA5PrimaryAction(sourceState, role) {
    return getA5AvailableActions(sourceState, role).find(action => action.primary) || null;
  }

  function failure(code, sourceState, errors = []) {
    return Object.freeze({ ok: false, code, state: clone(sourceState), errors: Object.freeze([...errors]) });
  }

  function eventFor(action, actorName, at) {
    return { actionId: action.id, text: `${actorName} ${action.label}`, by: actorName, time: at };
  }

  // Phase 0 Task 4 — hard-block entry for every executor that a
  // deny-listed action can reach. หลักการ: primary check (ชั้น 1) returns
  // the guard's Section 4.5 blockedResult envelope (ok:false, Thai
  // messageTh, `state` passed through by reference — never mutated) BEFORE
  // any normalization/mutation, so a blocked action cannot be reached by
  // calling the executor directly, not just by clicking the button.
  // ชั้น 2 (defense in depth): the body runs under Guard.withAction so any
  // persistence write attempted while the blocked ID is ambient throws
  // Phase0GuardBlockedError at the Task 3 chokepoints. With no guard
  // loaded (older test harnesses), both layers are no-ops and behaviour is
  // bit-for-bit unchanged.
  function executeA5Action(sourceState, role, actionId, sourcePayload) {
    const phase0Guard = root.ECMISActivity5Phase0Guard;
    if (phase0Guard?.isBlocked(actionId)) return phase0Guard.blockedResult(actionId, sourceState);
    if (phase0Guard) return phase0Guard.withAction(actionId, () => executeA5ActionCore(sourceState, role, actionId, sourcePayload));
    return executeA5ActionCore(sourceState, role, actionId, sourcePayload);
  }
  function executeA5ActionCore(sourceState, role, actionId, sourcePayload) {
    const state = normalizeA5State(sourceState);
    const payload = asObject(sourcePayload);
    const report213 = root.ECMISActivity5Report213 || (typeof require === "function" ? require("./activity5-report-213.js") : null);
    const report644 = root.ECMISActivity5Report644 || (typeof require === "function" ? require("./activity5-report-644.js") : null);
    const postResolution = root.ECMISActivity5PostResolution || (typeof require === "function" ? require("./activity5-post-resolution-documents.js") : null);
    const actor = { id: String(payload.actorId || payload.actorOfficerId || payload.actorName || "").trim(), name: String(payload.actorName || "").trim(), role: String(payload.actorRoleCode || role || "").trim() };
    if (report213?.REPORT_213_ACTIONS?.includes(actionId)) return report213.executeReport213Action(state, actor, actionId, payload);
    if (report644?.ACTIONS?.includes(actionId)) return report644.executeReport644Action(state, actor, actionId, payload);
    if (postResolution?.ACTIONS?.includes(actionId)) return postResolution.executePostDocumentAction(state, actor, actionId, payload);
    if (state.migrationBlocked) return failure("MIGRATION_BLOCKED", sourceState);
    const actorOfficerId = String(payload.actorOfficerId || "").trim();
    const assignedOfficer = String(state.assignment.primaryOfficerId || "").trim();
    // reassignment-request/-handoff are the two ceremony steps any investigator on the case
    // (not just the primary) may act on — see the master-plan clarification for item 4: a
    // case can have several investigators (primary + assistants), and any of them, or the
    // case clerk, may originate the request. reassignment-handoff still narrows to the exact
    // outgoing officer inside its own handler below.
    const caseInvestigatorIds = new Set([assignedOfficer, ...(Array.isArray(state.assignment.assistantOfficerIds) ? state.assignment.assistantOfficerIds.map(String) : [])].filter(Boolean));
    // reassignment-handoff is checked against the outgoing officer recorded on the pending
    // ceremony (pendingReassignment.fromOfficerId), not the current team list — by the time
    // handoff runs, primary-reassign has already moved the outgoing officer out of
    // primaryOfficerId, and the director may not have kept them on assistantOfficerIds.
    const isCaseInvestigatorAction = actionId === "reassignment-request";
    const isHandoffAction = actionId === "reassignment-handoff";
    if (role === "investigator") {
      if (!actorOfficerId) return failure("MISSING_REQUIRED_FIELD", sourceState, ["actorOfficerId"]);
      if (isHandoffAction ? actorOfficerId !== String(state.pendingReassignment.fromOfficerId || "") : isCaseInvestigatorAction ? !caseInvestigatorIds.has(actorOfficerId) : (!assignedOfficer || actorOfficerId !== assignedOfficer)) return failure("ACTOR_MISMATCH", sourceState);
      if (!isCaseInvestigatorAction && !isHandoffAction && actionId !== "officer-accept" && state.assignment.acceptedAssignmentVersion !== state.assignment.assignmentVersion) {
        return failure("ASSIGNMENT_ACCEPTANCE_REQUIRED", sourceState);
      }
    }
    if (actionId === NACC_REPORT_ACTION.id) return executeNaccReportAction(state, role, payload);
    if (DOWNSTREAM_ACTIONS[actionId]) return executeDownstreamAction(state, role, actionId, payload, sourceState);
    if (actionId === "plan-deadline-confirm") {
      const ruleApi = root.ECMISActivity5Rules || (typeof require === "function" ? require("./activity5-rules.js") : null);
      const rule = ruleApi?.getA5Rule("plan-deadline-day-kind") || null;
      return Object.freeze({ ok: false, code: "PENDING_CONFIRMATION", state: clone(sourceState), errors: Object.freeze([]), rule });
    }
    if (CUSTODY_ACTIONS[actionId]) return executeCustodyAction(state, role, actionId, payload);
    if (ADMIN_ACTIONS[actionId]) return executeAdminAction(state, role, actionId, payload);
    if (actionId === "panel-change-approve") {
      const ruleApi = root.ECMISActivity5Rules || (typeof require === "function" ? require("./activity5-rules.js") : null);
      return Object.freeze({ ok: false, code: "PENDING_CONFIRMATION", state: clone(sourceState), errors: Object.freeze([]), rule: ruleApi?.getA5Rule("panel-change-authority") || null });
    }
    // plan-approve / amendment-approve: owner ยืนยันผู้มีอำนาจแล้ว (17 ส.ค. 2569) = ผู้อำนวยการสำนักงาน ป.ป.ท. เขต
    // จึงถอด placeholder PENDING_CONFIRMATION ออก — การ์ดมาจากทางปกติที่บรรทัดล่าง
    // (`ACTIONS["plan-approve"].role === "director"` + `action.role !== role → ACTOR_MISMATCH`)
    const action = ACTIONS[actionId];
    const acceptsState = action && (Array.isArray(action.from) ? action.from.includes(state.workflow.a5Status) : action.from === state.workflow.a5Status);
    if (!acceptsState) return failure("INVALID_TRANSITION", sourceState);
    if (action.role !== role) return failure("ACTOR_MISMATCH", sourceState);

    const actorName = String(payload.actorName || "").trim();
    if (!actorName) return failure("MISSING_REQUIRED_FIELD", sourceState, ["actorName"]);

    if (actionId === "intake-review-submit") {
      const review = asObject(payload.intakeReview);
      const missingReview = ["jurisdictionResult", "complaintTypeResult", "completenessResult", "clerkOpinion"].filter(field => !String(review[field] || "").trim());
      if (!Array.isArray(review.documentResults) || !review.documentResults.length) missingReview.unshift("documentResults");
      if (missingReview.length) return failure("MISSING_REQUIRED_FIELD", sourceState, missingReview.map(field => `intakeReview.${field}`));
    }
    if (actionId === "assignment-confirm") {
      const primaryOfficerId = String(payload.primaryOfficerId || "").trim();
      const assistants = Array.isArray(payload.assistantOfficerIds) ? [...new Set(payload.assistantOfficerIds.map(String).map(value => value.trim()).filter(Boolean))] : [];
      if (!primaryOfficerId) return failure("MISSING_REQUIRED_FIELD", sourceState, ["primaryOfficerId"]);
      if (assistants.includes(primaryOfficerId)) return failure("INVALID_ASSIGNMENT_TEAM", sourceState);
      const snapshot = asObject(payload.recommendationSnapshot);
      const candidates = Array.isArray(snapshot.candidates) ? snapshot.candidates : [];
      const candidateIds = candidates.map(candidate => String(candidate?.officerId || "").trim());
      const recommendationApi = root.ECMISActivity5AssignmentRecommendation || (typeof require === "function" ? require("./activity5-assignment-recommendation.js") : null);
      const validSnapshot = recommendationApi?.validateRecommendationSnapshot(snapshot) === true;
      if (!validSnapshot) return failure("INVALID_RECOMMENDATION_SNAPSHOT", sourceState, ["recommendationSnapshot"]);
      const topOfficerId = candidateIds[0];
      if ((topOfficerId !== primaryOfficerId || !candidateIds.includes(primaryOfficerId)) && !String(payload.decisionNote || "").trim()) return failure("OVERRIDE_REASON_REQUIRED", sourceState, ["decisionNote"]);
    }

    const at = String(payload.at || new Date().toISOString());
    state.workflow.a5Status = action.to;
    state.intake.status = action.to;

    if (actionId === "intake-review-submit") {
      const received = asObject(payload.receivedDate);
      if (!Object.keys(received).length) return failure("MISSING_REQUIRED_FIELD", sourceState, ["receivedDate"]);
      if (Object.keys(received).length) {
        const missingReceived = ["channel", "recordedAt", "effectiveDate"].filter(field => !String(received[field] || "").trim());
        if (missingReceived.length) return failure("MISSING_REQUIRED_FIELD", sourceState, missingReceived.map(field => `receivedDate.${field}`));
      }
      if (received.outsideHoursOrHoliday === true && !isoDate(received.effectiveDate)) {
        return failure("MISSING_REQUIRED_FIELD", sourceState, ["receivedDate.effectiveDate"]);
      }
      if (Object.keys(received).length) {
        state.intake.receivedDate = {
          channel: String(received.channel || state.intake.receivedDate.channel || ""),
          recordedAt: isoDate(received.recordedAt),
          effectiveDate: isoDate(received.effectiveDate || received.recordedAt),
          outsideHoursOrHoliday: received.outsideHoursOrHoliday === true,
          enteredBy: actorName,
          enteredAt: at,
          ruleId: received.outsideHoursOrHoliday === true ? "received-date-outside-office-hours" : "received-date-recorded-channel"
        };
      }
      if (Object.prototype.hasOwnProperty.call(payload, "hasOriginal")) {
        state.custody.hasOriginal = payload.hasOriginal === true;
        state.custody.status = state.custody.hasOriginal ? "AT_SOURCE" : "NOT_APPLICABLE";
        state.custody.holder = String(payload.custodyHolder || "");
        state.inquiry = asObject(state.inquiry);
        state.inquiry.intake = asObject(state.inquiry.intake);
        state.inquiry.intake.receivedFirstAt = state.intake.receivedDate.effectiveDate || state.inquiry.intake.receivedFirstAt || "";
        state.inquiry.intake.physicalCustody = { ...state.custody, history: [...state.custody.history] };
      }
      state.intake.checkedBy = actorName;
      state.intake.checkedAt = at;
      state.intake.checkNote = String(payload.intakeReview.clerkOpinion || "");
      state.intakeReview = { ...clone(payload.intakeReview), reviewedBy: actorName, reviewedAt: at };
    }
    if (actionId === "assignment-confirm") {
      const primary = String(payload.primaryOfficerId).trim();
      const assistants = [...new Set((payload.assistantOfficerIds || []).map(String).map(value => value.trim()).filter(Boolean))];
      state.assignment.primaryOfficerId = primary;
      state.assignment.assistantOfficerIds = assistants;
      state.assignment.approvedOfficer = primary;
      state.assignment.legalOwner = primary;
      state.assignment.leadOfficer = primary;
      state.assignment.teamMembers = [...assistants];
      state.assignment.assignedBy = actorName;
      state.assignment.assignedAt = at;
      state.assignment.approvedBy = actorName;
      state.assignment.approvedAt = at;
      state.assignment.decisionNote = String(payload.decisionNote || "");
      state.assignment.assignmentVersion = 1;
      state.assignment.acceptedAssignmentVersion = 0;
      state.assignment.recommendationSnapshotId = String(payload.recommendationSnapshot?.id || "") || null;
      state.assignment.recommendationSnapshot = payload.recommendationSnapshot ? clone(payload.recommendationSnapshot) : null;
      state.assignmentHistory.push({ action: "assign", primaryOfficerId: primary, assistantOfficerIds: [...assistants], version: 1, by: actorName, at, reason: state.assignment.decisionNote });
      state.inquiry = asObject(state.inquiry);
      state.inquiry.intake = asObject(state.inquiry.intake);
      state.inquiry.intake.investigator = state.assignment.approvedOfficer;
      state.inquiry.intake.team = [...state.assignment.teamMembers];
    }
    if (actionId === "officer-accept") {
      if (!String(payload.signature || "").trim()) return failure("MISSING_REQUIRED_FIELD", sourceState, ["signature"]);
      // If this acceptance cycle was produced by primary-reassign (item 4 ceremony), the
      // outgoing officer must record handoff first — see reassignment-handoff above.
      const reassignedThisVersion = state.pendingReassignment.status && state.pendingReassignment.assignmentVersion === state.assignment.assignmentVersion;
      if (reassignedThisVersion && state.pendingReassignment.status !== "HANDED_OFF") return failure("REASSIGNMENT_HANDOFF_REQUIRED", sourceState);
      state.assignment.acceptedBy = actorName;
      state.assignment.acceptedAt = at;
      state.assignment.acceptedAssignmentVersion = state.assignment.assignmentVersion;
      state.assignment.acceptanceSignature = String(payload.signature);
      if (reassignedThisVersion) {
        state.reassignmentHistory.push({ action: "accept", officer: actorName, officerId: actorOfficerId, at });
        state.pendingReassignment = { status: "" };
      }
      state.assignmentHistory.push({ action: "accept", officer: actorName, officerId: actorOfficerId, version: state.assignment.assignmentVersion, by: actorName, at });
      const receivedDate = state.intake.receivedDate.effectiveDate || state.intake.receivedDate.recordedAt || isoDate(at);
      state.planLifecycle.dueAt = state.planLifecycle.dueAt || addCalendarDays(isoDate(at), 2);
      state.planLifecycle.dueRuleId = "plan-deadline-day-kind";
      state.inquiry = asObject(state.inquiry);
      state.inquiry.prelim = asObject(state.inquiry.prelim);
      state.inquiry.prelim.startedAt = state.inquiry.prelim.startedAt || receivedDate;
      state.inquiry.prelim.deadlineAt = state.inquiry.prelim.deadlineAt || addCalendarDays(receivedDate, 60);
    }
    if (actionId === "plan-start") {
      state.workflow.stage = "a5-prelim";
      state.planLifecycle.status = PROCESS_STATES.PLAN_DRAFT;
      state.planLifecycle.startedBy = actorName;
      state.planLifecycle.startedAt = at;
    }
    if (actionId === "plan-submit") {
      const plan = String(payload.plan || state.planLifecycle.plan || "").trim();
      if (!plan) return failure("MISSING_REQUIRED_FIELD", sourceState, ["plan"]);
      state.planLifecycle.plan = plan;
      state.planLifecycle.status = PROCESS_STATES.PLAN_SUBMITTED;
      state.planLifecycle.submittedBy = actorName;
      state.planLifecycle.submittedAt = at;
      syncLegacyPlan(state, PROCESS_STATES.PLAN_SUBMITTED, plan, actorName, at);
    }
    if (actionId === "plan-approve") {
      state.planLifecycle.status = PROCESS_STATES.PLAN_APPROVED;
      state.planLifecycle.approvedBy = actorName;
      state.planLifecycle.approvedAt = at;
      state.planLifecycle.version = Math.max(1, state.planLifecycle.version + 1);
      syncLegacyPlan(state, PROCESS_STATES.PLAN_APPROVED, state.planLifecycle.plan, actorName, at);
    }
    if (actionId === "plan-return") {
      const reason = String(payload.reason || "").trim();
      if (!reason) return failure("MISSING_REQUIRED_FIELD", sourceState, ["reason"]);
      state.planLifecycle.status = PROCESS_STATES.PLAN_RETURNED;
      state.planLifecycle.returnedBy = actorName;
      state.planLifecycle.returnedAt = at;
      state.planLifecycle.returnReason = reason;
      syncLegacyPlan(state, PROCESS_STATES.PLAN_RETURNED, state.planLifecycle.plan, actorName, at, reason);
    }
    if (actionId === "plan-amend") {
      const reason = String(payload.reason || "").trim();
      if (!reason) return failure("MISSING_REQUIRED_FIELD", sourceState, ["reason"]);
      const hasTeamMembers = Object.prototype.hasOwnProperty.call(payload, "teamMembers");
      const currentTeam = Array.isArray(asObject(asObject(state.inquiry).intake).team)
        ? asObject(asObject(state.inquiry).intake).team
        : Array.isArray(legacyPlanRecord(state).team)
          ? legacyPlanRecord(state).team
          : [];
      const teamMembers = hasTeamMembers && Array.isArray(payload.teamMembers)
        ? payload.teamMembers.map(String).map(value => value.trim()).filter(Boolean)
        : [...currentTeam];
      state.planLifecycle.amendment = { reason, teamMembers, plan: String(payload.plan || state.planLifecycle.plan || ""), draftedBy: actorName, draftedAt: at, baseVersion: state.planLifecycle.version };
    }
    if (actionId === "amendment-submit") {
      const amendment = state.planLifecycle.amendment;
      if (!String(amendment.reason || "").trim()) return failure("MISSING_REQUIRED_FIELD", sourceState, ["reason"]);
      amendment.plan = String(payload.plan || amendment.plan || "").trim();
      if (!amendment.plan) return failure("MISSING_REQUIRED_FIELD", sourceState, ["plan"]);
      amendment.submittedBy = actorName;
      amendment.submittedAt = at;
    }
    if (actionId === "amendment-return") {
      const reason = String(payload.reason || "").trim();
      if (!reason) return failure("MISSING_REQUIRED_FIELD", sourceState, ["reason"]);
      state.planLifecycle.amendment.returnReason = reason;
      state.planLifecycle.amendment.returnedBy = actorName;
      state.planLifecycle.amendment.returnedAt = at;
    }
    if (actionId === "amendment-approve") {
      const amendment = state.planLifecycle.amendment;
      if (!String(amendment.plan || "").trim()) return failure("MISSING_REQUIRED_FIELD", sourceState, ["plan"]);
      state.planLifecycle.version += 1;
      state.planLifecycle.plan = amendment.plan;
      amendment.version = state.planLifecycle.version;
      amendment.approvedBy = actorName;
      amendment.approvedAt = at;
      const legacyPlan = legacyPlanRecord(state);
      legacyPlan.team = [...(amendment.teamMembers || [])];
      state.inquiry.intake = asObject(state.inquiry.intake);
      state.inquiry.intake.team = [...(amendment.teamMembers || [])];
      syncLegacyPlan(state, PROCESS_STATES.PLAN_APPROVED, amendment.plan, actorName, at);
    }

    state.planLifecycle.status = action.to;
    if (actionId.startsWith("plan-") || actionId.startsWith("amendment-")) state.planLifecycle.history.push(eventFor(action, actorName, at));
    state.decisionHistory.push(eventFor(action, actorName, at));
    return Object.freeze({ ok: true, code: "TRANSITIONED", state, errors: Object.freeze([]) });
  }

  function executeNaccReportAction(state, role, payload) {
    if (role !== NACC_REPORT_ACTION.role) return failure("ACTOR_MISMATCH", state);
    if (!(state.caseData?.decision === "62" || asObject(asObject(state.inquiry).intake).m62?.flag === true)) return failure("INVALID_TRANSITION", state);
    const actorName = String(payload.actorName || "").trim();
    if (!actorName) return failure("MISSING_REQUIRED_FIELD", state, ["actorName"]);
    const required = ["letterNo", "reportDate", "summary"];
    const missing = required.filter(field => !String(payload[field] || "").trim());
    if (missing.length) return failure("MISSING_REQUIRED_FIELD", state, missing);
    const at = String(payload.at || new Date().toISOString());
    const cycle = { sequence: state.naccReportCycles.length + 1, letterNo: String(payload.letterNo), reportDate: isoDate(payload.reportDate), summary: String(payload.summary), addedBy: actorName, addedAt: at };
    state.naccReportCycles.push(cycle);
    state.decisionHistory.push({ actionId: NACC_REPORT_ACTION.id, text: `${actorName} เพิ่มรายงานผลต่อ ป.ป.ช. งวดที่ ${cycle.sequence}`, by: actorName, time: at });
    return Object.freeze({ ok: true, code: "TRANSITIONED", state, errors: Object.freeze([]) });
  }

  function executeDownstreamAction(state, role, actionId, payload, sourceState = state) {
    const phase0Guard = root.ECMISActivity5Phase0Guard;
    if (phase0Guard?.isBlocked(actionId)) return phase0Guard.blockedResult(actionId, sourceState);
    if (phase0Guard) return phase0Guard.withAction(actionId, () => executeDownstreamActionCore(state, role, actionId, payload, sourceState));
    return executeDownstreamActionCore(state, role, actionId, payload, sourceState);
  }
  function executeDownstreamActionCore(state, role, actionId, payload, sourceState = state) {
    const action = DOWNSTREAM_ACTIONS[actionId];
    if (action.role !== role) return failure("ACTOR_MISMATCH", state);
    if (!action.from.includes(String(state.workflow.downstreamStatus || ""))) return failure("INVALID_TRANSITION", state);
    const actorName = String(payload.actorName || "").trim();
    if (!actorName) return failure("MISSING_REQUIRED_FIELD", state, ["actorName"]);
    const at = String(payload.at || new Date().toISOString());
    if (!actionId.startsWith("report-")) return executeDownstreamOperation(state, action, role, actionId, payload, actorName, at);
    const reportType = actionId.includes("213") ? "213" : "644";
    if (actionId === "report-644-record-result" && String(payload.result || "") === "SECTION_18_4") {
      return Object.freeze({ ok: false, code: "PENDING_CONFIRMATION", state: clone(sourceState), errors: Object.freeze([]), rule: Object.freeze({ id: "section-18-4-route", status: "PENDING_CONFIRMATION" }) });
    }
    const record = reportType === "213" ? asObject(asObject(state.inquiry).prelim) : asObject(asObject(state.inquiry).inquiry644);
    state.inquiry = asObject(state.inquiry);
    state.inquiry[reportType === "213" ? "prelim" : "inquiry644"] = record;
    const requiredByAction = {
      [`report-${reportType}-submit`]: ["report"],
      [`report-${reportType}-review-return`]: ["reason"],
      [`report-${reportType}-review-approve`]: ["opinion"],
      [`report-${reportType}-send-a7`]: ["letterNo", "sentAt"],
      [`report-${reportType}-record-receipt`]: ["receivedAt", "evidence"],
      [`report-${reportType}-record-result`]: ["result", "decidedAt"]
    };
    const missing = (requiredByAction[actionId] || []).filter(field => !String(payload[field] || "").trim());
    if (missing.length) return failure("MISSING_REQUIRED_FIELD", state, missing);
    const prefix = `REPORT_${reportType}`;
    if (actionId.endsWith("submit")) {
      record.report = String(payload.report); record.reportSubmittedAt = at;
      state.workflow.downstreamStatus = `${prefix}_REVIEW_PENDING`;
    } else if (actionId.endsWith("review-return")) {
      record.reviewReturnReason = String(payload.reason); record.reviewedAt = at;
      state.workflow.downstreamStatus = `${prefix}_RETURNED`;
    } else if (actionId.endsWith("review-approve")) {
      record.reviewOpinion = String(payload.opinion); record.reviewedAt = at;
      state.workflow.downstreamStatus = `${prefix}_BOARD_READY`;
    } else if (actionId.endsWith("send-a7")) {
      state.externalExchanges.push({ type: `REPORT_${reportType}`, direction: "OUT", status: "SENT", letterNo: String(payload.letterNo), sentAt: String(payload.sentAt), by: actorName });
      state.workflow.downstreamStatus = `${prefix}_SENT_TO_A7`;
    } else if (actionId.endsWith("record-receipt")) {
      const exchange = [...state.externalExchanges].reverse().find(item => item.type === `REPORT_${reportType}` && item.direction === "OUT" && item.status === "SENT");
      if (!exchange) return failure("MISSING_EXTERNAL_SEND", state);
      exchange.status = "RECEIVED"; exchange.receivedAt = String(payload.receivedAt); exchange.receiptEvidence = String(payload.evidence);
      state.workflow.downstreamStatus = `${prefix}_WAIT_RESULT`;
    } else if (actionId.endsWith("record-result")) {
      record.boardResult = String(payload.result); record.boardDecidedAt = String(payload.decidedAt);
      state.externalExchanges.push({ type: `REPORT_${reportType}_RESULT`, direction: "IN", status: "RECEIVED", receivedAt: String(payload.decidedAt), result: String(payload.result), by: actorName });
      state.workflow.downstreamStatus = `${prefix}_RESULT_RECEIVED`;
      createTasksForBoardResult(state, reportType, String(payload.result), at);
      state.publicStatusEvents.push({ code: `A5_${reportType}_RESULT_RECEIVED`, queuedAt: at, status: "PENDING_WORDING" });
    }
    state.decisionHistory.push(eventFor(action, actorName, at));
    return Object.freeze({ ok: true, code: "TRANSITIONED", state, errors: Object.freeze([]) });
  }

  function executeDownstreamOperation(state, action, role, actionId, payload, actorName, at) {
    const requiredByAction = {
      "outcome-task-start": ["taskId"], "outcome-task-complete": ["taskId", "evidence"],
      "outcome-task-send": ["taskId", "letterNo", "sentAt"], "outcome-task-record-receipt": ["taskId", "receivedAt", "evidence"],
      "prosecutor-package-ready": ["packageRef"], "prosecutor-send": ["letterNo", "sentAt"],
      "prosecutor-record-receipt": ["receivedAt", "evidence"], "prosecutor-record-order": ["orderType", "order", "receivedAt"],
      "prosecutor-complete-order": ["result"], "prosecutor-result-send": ["letterNo", "sentAt"],
      "prosecutor-result-receipt": ["receivedAt", "evidence"], "case-close": ["opinion"]
    };
    const missing = (requiredByAction[actionId] || []).filter(field => !String(payload[field] || "").trim());
    if (missing.length) return failure("MISSING_REQUIRED_FIELD", state, missing);
    state.prosecutorProcess = asObject(state.prosecutorProcess);
    if (["outcome-task-start", "outcome-task-complete", "outcome-task-send", "outcome-task-record-receipt"].includes(actionId)) {
      const task = state.downstreamTasks.find(item => item.id === String(payload.taskId));
      if (!task) return failure("TASK_NOT_FOUND", state);
      if (actionId === "outcome-task-start") {
        if (task.status !== "PENDING") return failure("INVALID_TRANSITION", state);
        task.status = "IN_PROGRESS"; task.startedAt = at; task.startedBy = actorName;
        state.workflow.downstreamStatus = "OUTCOME_TASKS_IN_PROGRESS";
      } else if (actionId === "outcome-task-complete") {
        if (task.status !== "IN_PROGRESS") return failure("INVALID_TRANSITION", state);
        if (["SEND_NACC", "SEND_POLICE", "SEND_DISCIPLINE_AGENCY"].includes(task.type)) return failure("EXTERNAL_RECEIPT_REQUIRED", state);
        task.status = "COMPLETED"; task.completedAt = at; task.completedBy = actorName; task.evidence = String(payload.evidence);
        if (task.type === "PREPARE_644_START") {
          state.workflow.stage = "a5-inquiry";
          state.workflow.owner = "investigator";
          state.workflow.downstreamStatus = "REPORT_644_DRAFT";
        }
        const incomplete = state.downstreamTasks.some(item => item.status !== "COMPLETED");
        if (task.type === "PREPARE_644_START") {
          // The 644 milestone remains open until its board result is recorded.
        } else if (!incomplete && state.downstreamTasks.some(item => item.type === "PREPARE_PROSECUTOR_PACKAGE")) {
          state.workflow.downstreamStatus = "PROSECUTOR_PACKAGE_PREPARING";
          state.workflow.stage = "a5-prosecutor";
        } else state.workflow.downstreamStatus = incomplete ? "OUTCOME_TASKS_IN_PROGRESS" : "OUTCOME_TASKS_PENDING";
      } else if (actionId === "outcome-task-send") {
        if (task.status !== "IN_PROGRESS" || !["SEND_NACC", "SEND_POLICE", "SEND_DISCIPLINE_AGENCY"].includes(task.type)) return failure("INVALID_TRANSITION", state);
        state.externalExchanges.push({ type: task.type, taskId: task.id, direction: "OUT", status: "SENT", letterNo: String(payload.letterNo), sentAt: String(payload.sentAt), by: actorName });
        task.status = "AWAITING_RECEIPT"; task.sentAt = String(payload.sentAt); task.letterNo = String(payload.letterNo);
        state.workflow.downstreamStatus = "OUTCOME_TASKS_IN_PROGRESS";
      } else {
        if (task.status !== "AWAITING_RECEIPT" || !["SEND_NACC", "SEND_POLICE", "SEND_DISCIPLINE_AGENCY"].includes(task.type)) return failure("INVALID_TRANSITION", state);
        const exchange = [...state.externalExchanges].reverse().find(item => item.taskId === task.id && item.status === "SENT");
        if (!exchange) return failure("MISSING_EXTERNAL_SEND", state);
        exchange.status = "RECEIVED"; exchange.receivedAt = String(payload.receivedAt); exchange.receiptEvidence = String(payload.evidence);
        task.status = "COMPLETED"; task.completedAt = at; task.completedBy = actorName; task.evidence = String(payload.evidence);
        state.workflow.downstreamStatus = state.downstreamTasks.some(item => item.status !== "COMPLETED") ? "OUTCOME_TASKS_IN_PROGRESS" : "OUTCOME_TASKS_PENDING";
      }
    }
    if (actionId === "prosecutor-package-ready") {
      state.prosecutorProcess.packageRef = String(payload.packageRef); state.prosecutorProcess.packageReadyAt = at;
      state.workflow.downstreamStatus = "PROSECUTOR_PACKAGE_READY";
    }
    if (actionId === "prosecutor-send") {
      state.externalExchanges.push({ type: "PROSECUTOR_PACKAGE", direction: "OUT", status: "SENT", letterNo: String(payload.letterNo), sentAt: String(payload.sentAt), by: actorName });
      state.prosecutorProcess.packageSentAt = String(payload.sentAt);
      state.workflow.downstreamStatus = "PROSECUTOR_RECEIPT_PENDING";
    }
    if (actionId === "prosecutor-record-receipt") {
      const exchange = [...state.externalExchanges].reverse().find(item => item.type === "PROSECUTOR_PACKAGE" && item.status === "SENT");
      if (!exchange) return failure("MISSING_EXTERNAL_SEND", state);
      exchange.status = "RECEIVED"; exchange.receivedAt = String(payload.receivedAt); exchange.receiptEvidence = String(payload.evidence);
      state.workflow.downstreamStatus = "PROSECUTOR_ORDER_PENDING";
    }
    if (actionId === "prosecutor-record-order") {
      const orderType = String(payload.orderType || "");
      if (!PROSECUTOR_ORDER_TYPES[orderType]) return failure("MISSING_REQUIRED_FIELD", state, ["orderType"]);
      state.prosecutorProcess.orderType = orderType;
      state.prosecutorProcess.order = String(payload.order); state.prosecutorProcess.orderReceivedAt = String(payload.receivedAt);
      state.externalExchanges.push({ type: "PROSECUTOR_ORDER", direction: "IN", status: "RECEIVED", receivedAt: String(payload.receivedAt), evidence: String(payload.evidence || ""), by: actorName });
      state.workflow.downstreamStatus = "PROSECUTOR_ORDER_RECEIVED";
    }
    if (actionId === "prosecutor-start-execution") {
      state.prosecutorProcess.executionStartedAt = at; state.workflow.downstreamStatus = "PROSECUTOR_EXECUTING";
    }
    if (actionId === "prosecutor-complete-order") {
      const pendingRuleId = PROSECUTOR_ORDER_PENDING_RULE[state.prosecutorProcess.orderType];
      if (pendingRuleId) {
        const ruleApi = root.ECMISActivity5Rules || (typeof require === "function" ? require("./activity5-rules.js") : null);
        return Object.freeze({ ok: false, code: "PENDING_CONFIRMATION", state: clone(state), errors: Object.freeze([]), rule: ruleApi?.getA5Rule(pendingRuleId) || null });
      }
      state.prosecutorProcess.executionResult = String(payload.result); state.prosecutorProcess.executionCompletedAt = at;
      state.workflow.downstreamStatus = "PROSECUTOR_RESULT_READY";
    }
    if (actionId === "prosecutor-result-send") {
      state.externalExchanges.push({ type: "PROSECUTOR_RESULT", direction: "OUT", status: "SENT", letterNo: String(payload.letterNo), sentAt: String(payload.sentAt), by: actorName });
      state.workflow.downstreamStatus = "PROSECUTOR_RESULT_SENT";
    }
    if (actionId === "prosecutor-result-receipt") {
      const exchange = [...state.externalExchanges].reverse().find(item => item.type === "PROSECUTOR_RESULT" && item.status === "SENT");
      if (!exchange) return failure("MISSING_EXTERNAL_SEND", state);
      exchange.status = "RECEIVED"; exchange.receivedAt = String(payload.receivedAt); exchange.receiptEvidence = String(payload.evidence);
      state.workflow.downstreamStatus = "PROSECUTOR_RESULT_RECEIVED";
      state.publicStatusEvents.push({ code: "A5_PROSECUTOR_RESULT_RECEIVED", queuedAt: at, status: "PENDING_WORDING" });
    }
    if (actionId === "closure-evaluate") {
      const incompleteTasks = state.downstreamTasks.some(task => task.status !== "COMPLETED");
      const pendingExchange = state.externalExchanges.some(exchange => exchange.direction === "OUT" && exchange.status !== "RECEIVED");
      const openAdditional = state.downstreamTasks.some(task => ["ADDITIONAL_213", "ADDITIONAL_644"].includes(task.type) && task.status !== "COMPLETED");
      const prosecutorIncomplete = state.prosecutorProcess.packageRef && state.workflow.downstreamStatus !== "PROSECUTOR_RESULT_RECEIVED";
      // Phase 11: the two closure gates (L982-991) not yet covered above — reuses the shared
      // submittedSnapshot/snapshotFingerprint immutability mechanism from activity5-document-domain.js
      // (records go DRAFT -> SUBMITTED only via submitA5DocumentRevision, which sets both atomically —
      // see activity5-extension-documents.js:644-655 for the same fingerprint-recheck pattern). Forms
      // 8-20 (post-resolution-documents.js) never leave status "DRAFT" and track their own lifecycle via
      // signatures/dispatches/receipts arrays, so they never trip either check here (verified by reading).
      const documentDomain = root.ECMISActivity5DocumentDomain || (typeof require === "function" ? require("./activity5-document-domain.js") : null);
      const records = Array.isArray(state.a5DocumentStore?.records) ? state.a5DocumentStore.records : [];
      const lostArtifacts = records.filter(record => record.status !== "DRAFT" && !record.submittedSnapshot);
      const tamperedArtifacts = documentDomain
        ? records.filter(record => record.submittedSnapshot && documentDomain.fingerprintA5SubmittedSnapshot(record.submittedSnapshot) !== record.submittedSnapshot.snapshotFingerprint)
        : [];
      const custodyUndetermined = !String(state.custody.holder || "").trim();
      const reasons = [];
      if (incompleteTasks) reasons.push({ field: "closure.downstreamTasks", message: "ยังมีงานตามมติที่ยังไม่เสร็จสิ้น" });
      if (pendingExchange) reasons.push({ field: "closure.externalExchanges", message: "ยังมีเอกสารที่ส่งออกแล้วแต่ยังไม่ได้รับหลักฐานการรับ" });
      if (openAdditional) reasons.push({ field: "closure.downstreamTasks", message: "ยังมีงานไต่สวนเพิ่มเติมที่ยังไม่เสร็จสิ้น" });
      if (prosecutorIncomplete) reasons.push({ field: "closure.prosecutorProcess", message: "กระบวนการอัยการยังไม่ถึงผลสุดท้าย" });
      if (state.requiredMilestones.length) reasons.push({ field: "closure.requiredMilestones", message: "ยังมี milestone ที่จำเป็นค้างอยู่" });
      if (lostArtifacts.length) reasons.push({ field: "closure.documentRegister", message: `พบเอกสารในทะเบียนที่ควรมีฉบับยื่นแล้วแต่ไม่มีข้อมูลฉบับยื่น (${lostArtifacts.map(item => item.documentId).join(", ")})` });
      if (tamperedArtifacts.length) reasons.push({ field: "closure.documentRegister", message: `พบเอกสารที่ข้อมูลฉบับยื่นไม่ตรงกับตอนลงนาม (${tamperedArtifacts.map(item => item.documentId).join(", ")})` });
      if (custodyUndetermined) reasons.push({ field: "closure.custody", message: "ยังไม่สามารถระบุผู้ครอบครองสำนวนปัจจุบันได้" });
      if (reasons.length) return failure("CLOSURE_BLOCKED", state, reasons);
      state.workflow.downstreamStatus = "CLOSURE_REVIEW";
    }
    if (actionId === "case-close") {
      state.workflow.downstreamStatus = "CLOSED"; state.workflow.stage = "closed"; state.workflow.complete = true; state.workflow.a5Status = PROCESS_STATES.COMPLETED; state.intake.status = PROCESS_STATES.COMPLETED;
      state.closure = { opinion: String(payload.opinion), approvedBy: actorName, approvedAt: at };
      state.publicStatusEvents.push({ code: "A5_CASE_CLOSED", queuedAt: at, status: "PENDING_WORDING" });
    }
    state.decisionHistory.push(eventFor(action, actorName, at));
    return Object.freeze({ ok: true, code: "TRANSITIONED", state, errors: Object.freeze([]) });
  }

  function createTasksForBoardResult(state, reportType, result, at) {
    const branches213 = { ACCEPT: ["PREPARE_644_START"], NOT_ACCEPT: ["NOTIFY_DECISION"], ADDITIONAL: ["ADDITIONAL_213"], NACC: ["SEND_NACC"] };
    const branches644 = {
      CRIMINAL_DISCIPLINARY: ["PREPARE_PROSECUTOR_PACKAGE", "SEND_DISCIPLINE_AGENCY"],
      DISCIPLINARY_ONLY: ["SEND_DISCIPLINE_AGENCY"], NO_GROUNDS: ["NOTIFY_DECISION"], NACC: ["SEND_NACC"], POLICE: ["SEND_POLICE"], ADDITIONAL: ["ADDITIONAL_644"]
    };
    const types = (reportType === "213" ? branches213 : branches644)[result] || [];
    state.requiredMilestones = Array.isArray(state.requiredMilestones) ? state.requiredMilestones : [];
    if (reportType === "213" && result === "ACCEPT" && !state.requiredMilestones.includes("REPORT_644_RESULT_RECEIVED")) state.requiredMilestones.push("REPORT_644_RESULT_RECEIVED");
    if (reportType === "644") state.requiredMilestones = state.requiredMilestones.filter(item => item !== "REPORT_644_RESULT_RECEIVED");
    state.downstreamTasks.push(...types.map((type, index) => ({ id: `${reportType}-${Date.parse(at) || 0}-${index + 1}`, type, status: "PENDING", createdAt: at })));
    state.workflow.stage = "a5-outcome";
    state.workflow.owner = "clerk";
  }

  function executeCustodyAction(state, role, actionId, payload) {
    const action = CUSTODY_ACTIONS[actionId];
    if (action.role !== role) return failure("ACTOR_MISMATCH", state);
    const actorName = String(payload.actorName || "").trim();
    if (!actorName) return failure("MISSING_REQUIRED_FIELD", state, ["actorName"]);
    const at = String(payload.at || new Date().toISOString());
    const required = actionId === "custody-dispatch" ? ["destination", "letterNo", "emsNumber", "dispatchedAt"]
      : actionId === "custody-receive" ? ["receivedAt", "holder"]
        : ["returnedAt", "reason", "holder"];
    const missing = required.filter(field => !String(payload[field] || "").trim());
    if (missing.length) return failure("MISSING_REQUIRED_FIELD", state, missing);
    if (actionId === "custody-dispatch" && (!state.custody.hasOriginal || state.custody.status !== "AT_SOURCE")) return failure("INVALID_TRANSITION", state);
    if (actionId === "custody-receive" && state.custody.status !== "IN_TRANSIT") return failure("INVALID_TRANSITION", state);
    if (actionId === "custody-return" && state.custody.status !== "RECEIVED_AT_DESTINATION") return failure("INVALID_TRANSITION", state);
    if (actionId === "custody-dispatch") Object.assign(state.custody, { status: "IN_TRANSIT", destination: String(payload.destination), letterNo: String(payload.letterNo), emsNumber: String(payload.emsNumber), dispatchedAt: String(payload.dispatchedAt), holder: "ไปรษณีย์/EMS" });
    if (actionId === "custody-receive") Object.assign(state.custody, { status: "RECEIVED_AT_DESTINATION", receivedAt: String(payload.receivedAt), holder: String(payload.holder) });
    if (actionId === "custody-return") Object.assign(state.custody, { status: "RETURNED", returnedAt: String(payload.returnedAt), returnReason: String(payload.reason), holder: String(payload.holder) });
    const event = eventFor(action, actorName, at);
    state.custody.history.push({ ...event, status: state.custody.status, emsNumber: state.custody.emsNumber || "" });
    state.decisionHistory.push(event);
    state.inquiry = asObject(state.inquiry);
    state.inquiry.intake = asObject(state.inquiry.intake);
    state.inquiry.intake.physicalCustody = { ...state.custody, history: [...state.custody.history] };
    return Object.freeze({ ok: true, code: "TRANSITIONED", state, errors: Object.freeze([]) });
  }

  function executeAdminAction(state, role, actionId, payload) {
    const phase0Guard = root.ECMISActivity5Phase0Guard;
    if (phase0Guard?.isBlocked(actionId)) return phase0Guard.blockedResult(actionId, state);
    if (phase0Guard) return phase0Guard.withAction(actionId, () => executeAdminActionCore(state, role, actionId, payload));
    return executeAdminActionCore(state, role, actionId, payload);
  }
  function executeAdminActionCore(state, role, actionId, payload) {
    const action = ADMIN_ACTIONS[actionId];
    if (action.role !== role && !(actionId === "xl-approve" && ["director", "secretary"].includes(role)) && !(actionId === "reassignment-request" && role === "clerk")) return failure("ACTOR_MISMATCH", state);
    if (state.caseAdministration.lockedByMerge) return failure("CASE_LOCKED_BY_MERGE", state);
    const actorName = String(payload.actorName || "").trim();
    if (!actorName) return failure("MISSING_REQUIRED_FIELD", state, ["actorName"]);
    const at = String(payload.at || new Date().toISOString());
    const requiredByAction = {
      "return-request": ["reason", "opinion", "destination"], "return-approve": ["opinion"], "return-dispatch": ["letterNo", "emsNumber", "dispatchedAt"],
      "gbk-receive": ["receivedAt", "holder"], "gbk-reroute": ["opinion"], "destination-receive": ["receivedAt", "holder"],
      "panel-change-draft": ["reason", "proposedMembers"],
      "team-update": ["reason", "expectedVersion"], "primary-reassign": ["primaryOfficerId", "reason", "expectedVersion"],
      "reassignment-request": ["reason"], "reassignment-handoff": ["note"],
      "case-size-set": ["caseSize"], "xl-approve": ["opinion"]
    };
    const missing = (requiredByAction[actionId] || []).filter(field => actionId === "panel-change-draft" && field === "proposedMembers" ? !Array.isArray(payload[field]) || !payload[field].length : !String(payload[field] || "").trim());
    if (missing.length) return failure("MISSING_REQUIRED_FIELD", state, missing);
    if (actionId === "reassignment-request") {
      if (state.pendingReassignment.status) return failure("INVALID_TRANSITION", state);
      state.pendingReassignment = { status: "REQUESTED", requestedBy: actorName, requestedByRole: role, requestedAt: at, reason: String(payload.reason) };
      state.reassignmentHistory.push({ action: "request", by: actorName, role, reason: String(payload.reason), at });
      return Object.freeze({ ok: true, code: "REASSIGNMENT_REQUESTED", state, errors: Object.freeze([]) });
    }
    if (actionId === "reassignment-request-log") {
      if (state.pendingReassignment.status !== "REQUESTED") return failure("INVALID_TRANSITION", state);
      state.pendingReassignment.status = "LOGGED";
      state.pendingReassignment.loggedBy = actorName;
      state.pendingReassignment.loggedAt = at;
      state.reassignmentHistory.push({ action: "log", by: actorName, at });
      return Object.freeze({ ok: true, code: "REASSIGNMENT_REQUEST_LOGGED", state, errors: Object.freeze([]) });
    }
    if (actionId === "reassignment-handoff") {
      if (state.pendingReassignment.status !== "ASSIGNED") return failure("INVALID_TRANSITION", state);
      const actorOfficerId = String(payload.actorOfficerId || "").trim();
      if (!actorOfficerId || actorOfficerId !== state.pendingReassignment.fromOfficerId) return failure("ACTOR_MISMATCH", state);
      state.pendingReassignment.status = "HANDED_OFF";
      state.pendingReassignment.handoffNote = String(payload.note);
      state.pendingReassignment.handoffBy = actorName;
      state.pendingReassignment.handoffAt = at;
      state.reassignmentHistory.push({ action: "handoff", by: actorName, note: String(payload.note), at });
      return Object.freeze({ ok: true, code: "REASSIGNMENT_HANDED_OFF", state, errors: Object.freeze([]) });
    }
    const fromUnit = String(asObject(asObject(state.inquiry).intake).unit || state.caseData?.region || "");
    if (["team-update", "primary-reassign"].includes(actionId)) {
      if (actionId === "primary-reassign" && state.pendingReassignment.status !== "LOGGED") return failure("REASSIGNMENT_REQUEST_REQUIRED", state);
      const expectedVersion = Number(payload.expectedVersion);
      if (!Number.isInteger(expectedVersion) || expectedVersion !== state.assignment.assignmentVersion) return failure("VERSION_CONFLICT", state);
      const primary = actionId === "primary-reassign" ? String(payload.primaryOfficerId).trim() : state.assignment.primaryOfficerId;
      const assistants = [...new Set((Array.isArray(payload.assistantOfficerIds) ? payload.assistantOfficerIds : state.assignment.assistantOfficerIds).map(String).map(value => value.trim()).filter(Boolean))];
      if (!primary || assistants.includes(primary)) return failure("INVALID_ASSIGNMENT_TEAM", state);
      if (actionId === "primary-reassign" && primary === state.assignment.primaryOfficerId) return failure("INVALID_TRANSITION", state);
      const previousPrimary = state.assignment.primaryOfficerId;
      state.assignment.primaryOfficerId = primary;
      state.assignment.assistantOfficerIds = assistants;
      state.assignment.approvedOfficer = primary;
      state.assignment.legalOwner = primary;
      state.assignment.leadOfficer = primary;
      state.assignment.teamMembers = [...assistants];
      state.assignment.assignmentVersion += 1;
      if (actionId === "team-update" && state.assignment.acceptedAssignmentVersion === expectedVersion) state.assignment.acceptedAssignmentVersion = state.assignment.assignmentVersion;
      if (actionId === "primary-reassign") {
        state.workflow.a5Status = PROCESS_STATES.ASSIGNMENT_APPROVED;
        state.intake.status = PROCESS_STATES.ASSIGNMENT_APPROVED;
        state.assignment.acceptedBy = "";
        state.assignment.acceptedAt = "";
        state.assignment.acceptanceSignature = "";
        state.assignment.acceptedAssignmentVersion = 0;
        state.pendingReassignment.status = "ASSIGNED";
        state.pendingReassignment.fromOfficerId = previousPrimary;
        state.pendingReassignment.toOfficerId = primary;
        state.pendingReassignment.assignedBy = actorName;
        state.pendingReassignment.assignedAt = at;
        state.pendingReassignment.assignmentVersion = state.assignment.assignmentVersion;
      }
      state.assignmentHistory.push({ action: actionId === "team-update" ? "team-update" : "primary-reassign", fromPrimaryOfficerId: previousPrimary, primaryOfficerId: primary, assistantOfficerIds: [...assistants], version: state.assignment.assignmentVersion, reason: String(payload.reason), by: actorName, at });
      state.inquiry = asObject(state.inquiry);
      state.inquiry.intake = asObject(state.inquiry.intake);
      state.inquiry.intake.investigator = primary;
      state.inquiry.intake.team = [...assistants];
      if (["a5-inquiry", "a5-inquiry-review", "a7-644", "a5-outcome", "a5-prosecutor", "closed"].includes(String(state.workflow.stage || ""))) {
        state.inquiry.inquiry644 = asObject(state.inquiry.inquiry644);
        state.inquiry.inquiry644.investigator = primary;
      }
    }
    const routeStates = { "return-request": ["", "RETURN_REQUESTED"], "return-approve": ["RETURN_REQUESTED", "RETURN_APPROVED"], "return-dispatch": ["RETURN_APPROVED", "RETURN_DISPATCHED"], "gbk-receive": ["RETURN_DISPATCHED", "RETURNED_TO_GBK"], "gbk-reroute": ["RETURNED_TO_GBK", "REROUTED"], "destination-receive": ["REROUTED", "DESTINATION_RECEIVED"] };
    if (routeStates[actionId]) {
      const [from, to] = routeStates[actionId];
      if (state.returnRoute.status !== from) return failure("INVALID_TRANSITION", state);
      state.returnRoute.status = to;
      if (actionId === "return-request") Object.assign(state.returnRoute, { sourceUnit: fromUnit, reason: String(payload.reason), requestOpinion: String(payload.opinion), destination: String(payload.destination), requestedBy: actorName, requestedAt: at });
      if (actionId === "return-approve") Object.assign(state.returnRoute, { approvalOpinion: String(payload.opinion), approvedBy: actorName, approvedAt: at });
      if (actionId === "return-dispatch") {
        Object.assign(state.returnRoute, { letterNo: String(payload.letterNo), emsNumber: String(payload.emsNumber), dispatchedAt: String(payload.dispatchedAt), dispatchedBy: actorName });
        Object.assign(state.custody, { hasOriginal: true, status: "IN_TRANSIT", destination: "กบค.", letterNo: String(payload.letterNo), emsNumber: String(payload.emsNumber), dispatchedAt: String(payload.dispatchedAt), holder: "ไปรษณีย์/EMS" });
      }
      if (actionId === "gbk-receive") Object.assign(state.custody, { status: "RECEIVED_AT_DESTINATION", receivedAt: String(payload.receivedAt), holder: String(payload.holder), destination: "กบค." });
      if (actionId === "gbk-reroute") {
        const fixedDestination = String(state.returnRoute.destination || payload.destination || "");
        Object.assign(state.returnRoute, { destination: fixedDestination, rerouteOpinion: String(payload.opinion), reroutedBy: actorName, reroutedAt: at, physicalHolder: String(payload.physicalHolder || ""), physicalSentAt: String(payload.physicalSentAt || ""), physicalEmsNumber: String(payload.physicalEmsNumber || "") });
        Object.assign(state.custody, { status: "IN_TRANSIT", destination: fixedDestination, holder: String(payload.physicalHolder || "อยู่ระหว่างส่งจาก กบค."), emsNumber: String(payload.physicalEmsNumber || state.custody.emsNumber || ""), physicalSentAt: String(payload.physicalSentAt || "") });
      }
      if (actionId === "destination-receive") {
        state.inquiry = asObject(state.inquiry); state.inquiry.intake = asObject(state.inquiry.intake); state.inquiry.intake.unit = state.returnRoute.destination;
        Object.assign(state.custody, { status: "RECEIVED_AT_DESTINATION", destination: state.returnRoute.destination, receivedAt: String(payload.receivedAt), holder: String(payload.holder) });
      }
      state.returnRoute.history.push({ actionId, status: to, by: actorName, at });
      if (["return-dispatch", "gbk-receive", "gbk-reroute", "destination-receive"].includes(actionId)) {
        state.custody.history.push({ actionId, status: state.custody.status, destination: state.custody.destination || "", holder: state.custody.holder || "", emsNumber: state.custody.emsNumber || "", by: actorName, at });
        state.inquiry = asObject(state.inquiry); state.inquiry.intake = asObject(state.inquiry.intake);
        state.inquiry.intake.physicalCustody = { ...state.custody, history: [...state.custody.history] };
      }
    }
    if (actionId === "panel-change-draft") state.panelChangeRequests.push({ status: "DRAFT", reason: String(payload.reason), proposedMembers: payload.proposedMembers.map(String), draftedBy: actorName, draftedAt: at });
    if (actionId === "panel-change-submit") {
      const request = state.panelChangeRequests.at(-1);
      if (!request || request.status !== "DRAFT") return failure("INVALID_TRANSITION", state);
      request.status = "SUBMITTED"; request.submittedBy = actorName; request.submittedAt = at;
    }
    if (actionId === "case-size-set") {
      const size = String(payload.caseSize);
      if (!["UNDETERMINED", "S", "M", "L", "XL"].includes(size)) return failure("MISSING_REQUIRED_FIELD", state, ["caseSize"]);
      const components = asObject(payload.caseSizeComponents);
      const scored = computeCaseSizeA5(components);
      state.caseAdministration.caseSizeComponents = scored.components;
      state.caseAdministration.caseSizeScore = scored.score;
      state.caseAdministration.caseSizeSuggestion = scored.suggestion;
      state.caseAdministration.caseSizeSetBy = actorName;
      state.caseAdministration.caseSizeSetAt = at;
      if (size === "XL") {
        const reason = String(payload.reason || "").trim();
        if (!reason) return failure("MISSING_REQUIRED_FIELD", state, ["reason"]);
        if (state.caseAdministration.xlRequest.status !== "PENDING") {
          state.caseAdministration.xlRequest = { status: "PENDING", reason, requestedBy: actorName, requestedAt: at, approvals: [] };
        }
        state.caseAdministration.caseSize = "L";
        state.caseAdministration.caseSizeRuleId = "xl-pending-route";
      } else {
        state.caseAdministration.caseSize = size;
        state.caseAdministration.caseSizeRuleId = size === "XL" ? "xl-case-route" : "";
        if (size !== "XL") state.caseAdministration.xlRequest = asObject({});
      }
    }
    if (actionId === "xl-approve") {
      const xl = state.caseAdministration.xlRequest;
      if (xl.status !== "PENDING") return failure("INVALID_TRANSITION", state);
      const next = xlNextStepFor(xl, role);
      if (!next) return failure("ACTOR_MISMATCH", state);
      xl.approvals.push({ step: next, by: actorName, at, opinion: String(payload.opinion || "") });
      xl.lastStep = next;
      // สาย XL ภายใน (4 ขั้น) เป็นการอนุมัติเบื้องต้นเท่านั้น — owner ยืนยันว่ามติบอร์ด (กิจกรรมที่ 7)
      // เป็นตัวรับรอง XL จริง จึงค้างเป็น PENDING_BOARD จนกว่าจะมี xl-board-confirm
      if (next === "เลขาธิการ") xl.status = "PENDING_BOARD";
    }
    if (actionId === "xl-board-confirm") {
      const xl = state.caseAdministration.xlRequest;
      if (xl.status !== "PENDING_BOARD") return failure("INVALID_TRANSITION", state);
      const mtiNo = String(payload.mtiNo || "").trim();
      if (!mtiNo) return failure("MISSING_REQUIRED_FIELD", state, ["mtiNo"]);
      // ชี้แจงต่อบอร์ด (ถ้ามี) — วันที่ชี้แจง / ผู้ชี้แจง / สรุปผล (ไม่บังคับ แต่ถ้ากรอกต้องครบ)
      const presentationDate = String(payload.presentationDate || "").trim();
      const presenter = String(payload.presenter || "").trim();
      const presentationSummary = String(payload.presentationSummary || "").trim();
      if ((presentationDate || presenter || presentationSummary) && (!presentationDate || !presenter)) return failure("MISSING_REQUIRED_FIELD", state, ["presentationDate", "presenter"]);
      xl.status = "APPROVED";
      xl.boardConfirmation = { mtiNo, mtiDate: String(payload.mtiDate || ""), confirmedBy: actorName, confirmedAt: at, presentationDate, presenter, presentationSummary };
      state.caseAdministration.caseSize = "XL";
      state.caseAdministration.caseSizeRuleId = "xl-case-route";
    }
    const event = eventFor(action, actorName, at);
    state.decisionHistory.push(event);
    return Object.freeze({ ok: true, code: "TRANSITIONED", state, errors: Object.freeze([]) });
  }

  const CASE_SIZE_WEIGHTS = Object.freeze({ position: 5, personsOrAllegations: 30, budgetOrDamage: 25, evidenceDifficulty: 40 });
  const XL_CHAIN = Object.freeze([{ step: "ผอ.กอง", role: "director" }, { step: "ผอ.เขต", role: "director" }, { step: "ผู้ช่วย/รองเลขาธิการ", role: "secretary" }, { step: "เลขาธิการ", role: "secretary" }]);
  function computeCaseSizeA5(rawComponents) {
    const clamp = value => Math.max(1, Math.min(4, Math.round(Number(value)) || 1));
    const components = {
      position: clamp(asObject(rawComponents).position),
      personsOrAllegations: clamp(asObject(rawComponents).personsOrAllegations),
      budgetOrDamage: clamp(asObject(rawComponents).budgetOrDamage),
      evidenceDifficulty: clamp(asObject(rawComponents).evidenceDifficulty)
    };
    const score = Math.round(((components.position * CASE_SIZE_WEIGHTS.position + components.personsOrAllegations * CASE_SIZE_WEIGHTS.personsOrAllegations + components.budgetOrDamage * CASE_SIZE_WEIGHTS.budgetOrDamage + components.evidenceDifficulty * CASE_SIZE_WEIGHTS.evidenceDifficulty) / 100) * 100) / 100;
    const suggestion = score >= 3.51 ? "L" : score >= 2.76 ? "M" : "S";
    return { components, score, suggestion };
  }
  function xlNextStepFor(xl, role) {
    if (!xl || xl.status !== "PENDING") return "";
    const approvedSteps = new Set((xl.approvals || []).map(item => item.step));
    return (XL_CHAIN.find(item => !approvedSteps.has(item.step) && item.role === role) || {}).step || "";
  }

  function getA5DeadlineAlert(sourceState, todayValue) {
    const state = normalizeA5State(sourceState);
    const report = legacyPlanOf(state);
    const startedAt = isoDate(report.startedAt);
    const deadlineAt = isoDate(report.deadlineAt);
    const today = isoDate(todayValue || new Date().toISOString());
    if (!startedAt || !deadlineAt || !today) return null;
    const dayMs = 86400000;
    const elapsedDays = Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${startedAt}T00:00:00Z`)) / dayMs);
    const remainingDays = Math.ceil((Date.parse(`${deadlineAt}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / dayMs);
    if (remainingDays < 0) return Object.freeze({ level: "overdue", elapsedDays, remainingDays, label: `เกินกำหนด ${Math.abs(remainingDays)} วัน` });
    if (elapsedDays >= 45 || remainingDays <= 15) return Object.freeze({ level: "warning", elapsedDays, remainingDays, label: `เหลือ ${remainingDays} วัน` });
    return Object.freeze({ level: "normal", elapsedDays, remainingDays, label: `เหลือ ${remainingDays} วัน` });
  }

  function legacyPlanRecord(state) {
    state.inquiry = asObject(state.inquiry);
    const key = planScopeKey(state);
    state.inquiry[key] = asObject(state.inquiry[key]);
    return state.inquiry[key];
  }

  function syncLegacyPlan(state, processState, plan, actorName, at, reason = "") {
    const legacyPlan = legacyPlanRecord(state);
    const status = {
      [PROCESS_STATES.PLAN_SUBMITTED]: "รออนุมัติจากหัวหน้าพนักงาน",
      [PROCESS_STATES.PLAN_APPROVED]: "approved",
      [PROCESS_STATES.PLAN_RETURNED]: "ส่งกลับแก้ไข"
    }[processState] || String(processState);
    legacyPlan.plan = String(plan || legacyPlan.plan || "");
    legacyPlan.planStatus = status;
    if (processState === PROCESS_STATES.PLAN_SUBMITTED) {
      legacyPlan.planSubmittedBy = actorName;
      legacyPlan.planSubmittedAt = at;
    }
    if (processState === PROCESS_STATES.PLAN_APPROVED) {
      legacyPlan.planApprovedBy = actorName;
      legacyPlan.planApprovedAt = at;
    }
    if (processState === PROCESS_STATES.PLAN_RETURNED) {
      legacyPlan.planReturnedBy = actorName;
      legacyPlan.planReturnedAt = at;
      legacyPlan.planReturnReason = reason;
    }
  }

  function buildA5ViewModel(sourceState, role, activeTab) {
    const state = normalizeA5State(sourceState);
    return Object.freeze({
      activeTab: String(activeTab || "overview"),
      processState: state.workflow.a5Status,
      actions: Object.freeze(getA5AvailableActions(state, role)),
      primaryAction: getA5PrimaryAction(state, role)
    });
  }

  function getA5DocumentActionModel(sourceState, actor) {
    const state = normalizeA5State(sourceState);
    const report213 = root.ECMISActivity5Report213 || (typeof require === "function" ? require("./activity5-report-213.js") : null);
    const postResolution = root.ECMISActivity5PostResolution || (typeof require === "function" ? require("./activity5-post-resolution-documents.js") : null);
    return Object.freeze({
      report213: Object.freeze(report213?.getReport213ActionModelA5?.(state, actor) || []),
      postResolution: Object.freeze(postResolution?.getPostDocumentActionModel?.(state, actor) || [])
    });
  }

  const api = Object.freeze({
    PROCESS_STATES,
    DOWNSTREAM_STATUSES,
    PROSECUTOR_ORDER_TYPES,
    ACTIONS,
    normalizeA5State,
    getA5AvailableActions,
    getA5AdminActions,
    getA5PrimaryAction,
    executeA5Action,
    getA5DocumentActionModel,
    buildA5ViewModel,
    getA5DeadlineAlert
  });
  root.ECMISActivity5Workflow = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis === "undefined" ? window : globalThis);
