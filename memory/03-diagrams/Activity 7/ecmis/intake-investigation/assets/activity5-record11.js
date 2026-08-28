(function initializeActivity5Record11(root) {
  const RESULT_CODES = Object.freeze({
    CRIMINAL_DISCIPLINARY: "ชี้มูลอาญาและวินัย",
    SECTION_18_4: "ชี้มูลคดีประพฤติมิชอบตามมาตรา 18/4",
    DISCIPLINARY_ONLY: "ชี้มูลวินัยอย่างเดียว",
    NO_GROUNDS: "ข้อกล่าวหาไม่มีมูล",
    PROSECUTION_EXTINGUISHED: "สิทธิฟ้องระงับ",
    SEND_NACC: "ส่งสำนักงาน ป.ป.ช.",
    SEND_POLICE: "ส่งพนักงานสอบสวน",
    ADDITIONAL_644: "ไต่สวนชี้มูลเพิ่มเติม"
  });
  const SECTION_18_4_ROUTES = Object.freeze(["CRIMINAL", "DISCIPLINARY", "BOTH"]);

  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const text = value => typeof value === "string" ? value.trim() : "";
  const copy = value => JSON.parse(JSON.stringify(value));
  const fail = (state, code, field, message) => Object.freeze({
    ok: false,
    code,
    state: copy(state),
    errors: Object.freeze(field ? [{ field, message }] : [])
  });

  function normalizeRecord11A5(sourceState) {
    const state = copy(sourceState);
    state.workflow = object(state.workflow);
    const current = object(state.a5Record11);
    state.a5Record11 = {
      version: Number.isInteger(current.version) && current.version > 0 ? current.version : 1,
      status: text(current.status) || "WAITING_RESOLUTION",
      resolution: current.resolution ? copy(current.resolution) : null,
      tasks: Array.isArray(current.tasks) ? copy(current.tasks) : [],
      events: Array.isArray(current.events) ? copy(current.events) : []
    };
    return Object.freeze({ ok: true, code: "NORMALIZED", state, errors: Object.freeze([]) });
  }

  function availableVersion(state, versionId) {
    return [state.a5EvidenceRepository, state.evidenceRepository, state.documentRepository]
      .flatMap(rows => Array.isArray(rows) ? rows : [])
      .some(row => text(row.versionId || row.documentVersionId) === text(versionId) && row.availability !== "MISSING");
  }

  function prosecutorTask(at) {
    return {
        id: `R11-PROSECUTOR-${Date.parse(at) || 0}`,
        type: "PREPARE_PROSECUTOR_PACKAGE",
        status: "PENDING",
        ownerRole: "investigator",
        destination: "PROSECUTOR",
        nextActivity: "ACTIVITY_10",
        handoffContractStatus: "PENDING_CONFIRMATION",
        createdAt: at
      };
  }

  function disciplinaryTask(at) {
    return {
        id: `R11-DISCIPLINE-${Date.parse(at) || 0}`,
        type: "TRACK_DISCIPLINARY_DISPATCH",
        status: "WAITING_EXTERNAL",
        ownerRole: "activity8",
        initiatedBy: "ACTIVITY_7",
        nextActivity: "ACTIVITY_8",
        createdAt: at
      };
  }

  function addDaysISO(date, days) {
    const parsed = new Date(`${text(date)}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return "";
    parsed.setUTCDate(parsed.getUTCDate() + days);
    return parsed.toISOString().slice(0, 10);
  }

  function chargeWasNotified(state) {
    if (text(state.inquiry?.inquiry644?.chargeNotice?.notifiedAt)) return true;
    return (state.a5Report644Lifecycle?.chargeServices || []).some(item => text(item.servedAt || item.receivedAt));
  }

  function noGroundsTasks(state, command) {
    if (!chargeWasNotified(state)) return [];
    const dueAt = addDaysISO(command.decidedAt, 15);
    return [
      { id: `R11-NOTIFY-ACCUSED-${Date.parse(command.at) || 0}`, type: "NOTIFY_ACCUSED", status: "PENDING", ownerRole: "investigator", dueAt, requiredDocumentIds: ["S8_02_NO_GROUNDS_ACCUSED_NOTICE"], createdAt: command.at },
      { id: `R11-NOTIFY-AGENCY-${Date.parse(command.at) || 0}`, type: "NOTIFY_HOME_AGENCY", status: "PENDING", ownerRole: "investigator", dueAt, requiredDocumentIds: ["S8_03_NO_GROUNDS_AGENCY_NOTICE"], createdAt: command.at }
    ];
  }

  function tasksForResolution(resultCode, command) {
    if (resultCode === "CRIMINAL_DISCIPLINARY") return [prosecutorTask(command.at), disciplinaryTask(command.at)];
    if (resultCode === "SECTION_18_4") {
      if (command.section184Route === "CRIMINAL") return [prosecutorTask(command.at)];
      if (command.section184Route === "DISCIPLINARY") return [disciplinaryTask(command.at)];
      return [prosecutorTask(command.at), disciplinaryTask(command.at)];
    }
    if (resultCode === "DISCIPLINARY_ONLY") return [disciplinaryTask(command.at)];
    if (["NO_GROUNDS", "PROSECUTION_EXTINGUISHED"].includes(resultCode)) return noGroundsTasks(command.state, command);
    if (resultCode === "ADDITIONAL_644") return [{
      id: `R11-ADDITIONAL-644-${Date.parse(command.at) || 0}`,
      type: "ADDITIONAL_644",
      status: "PENDING",
      ownerRole: "investigator",
      deadlineDays: 30,
      extensionLimit: 1,
      extensionMaxDays: 30,
      deadlineRuleStatus: "PENDING_CONFIRMATION",
      deadlineAt: "",
      createdAt: command.at
    }];
    if (resultCode === "SEND_NACC") return [{
      id: `R11-NACC-${Date.parse(command.at) || 0}`,
      type: "PREPARE_NACC_PACKAGE",
      status: "PENDING",
      ownerRole: "investigator",
      destination: "สำนักงาน ป.ป.ช.",
      signerAuthorityStatus: "PENDING_CONFIRMATION",
      requiredDocumentTypes: ["SIGNED_RESOLUTION", "REPORT_644", "NACC_TRANSMITTAL", "HANDOVER_EVIDENCE"],
      createdAt: command.at
    }];
    if (resultCode === "SEND_POLICE") return [{
      id: `R11-POLICE-${Date.parse(command.at) || 0}`,
      type: "PREPARE_POLICE_PACKAGE",
      status: "PENDING",
      ownerRole: "investigator",
      destination: "พนักงานสอบสวน",
      signerAuthorityStatus: "PENDING_CONFIRMATION",
      requiredDocumentTypes: ["SIGNED_RESOLUTION", "REPORT_644", "POLICE_TRANSMITTAL", "HANDOVER_EVIDENCE"],
      createdAt: command.at
    }];
    return [];
  }

  function resolveRecord11DocumentAutoPickA5(state) {
    const resolution = object(state?.a5Record11?.resolution);
    const resultCode = text(resolution.resultCode);
    if (resultCode === "CRIMINAL_DISCIPLINARY") return ["S8_06_DISCIPLINARY_CRIMINAL_ACTION_REQUEST", "S8_07_CRIMINAL_PROSECUTION_REFERRAL"];
    if (resultCode === "DISCIPLINARY_ONLY") return ["S8_05_DISCIPLINARY_ACTION_REQUEST"];
    if (resultCode === "SECTION_18_4") {
      if (resolution.section184Route === "CRIMINAL") return ["S8_07_CRIMINAL_PROSECUTION_REFERRAL"];
      if (resolution.section184Route === "DISCIPLINARY") return ["S8_05_DISCIPLINARY_ACTION_REQUEST"];
      if (resolution.section184Route === "BOTH") return ["S8_06_DISCIPLINARY_CRIMINAL_ACTION_REQUEST", "S8_07_CRIMINAL_PROSECUTION_REFERRAL"];
    }
    if (["NO_GROUNDS", "PROSECUTION_EXTINGUISHED"].includes(resultCode) && chargeWasNotified(state)) {
      const picks = ["S8_02_NO_GROUNDS_ACCUSED_NOTICE", "S8_03_NO_GROUNDS_AGENCY_NOTICE"];
      if (text(state.inquiry?.inquiry644?.suspensionOrderDocumentVersionId)) picks.push("S8_04_NO_GROUNDS_SUSPENDED_AGENCY_NOTICE");
      return picks;
    }
    return [];
  }

  function executeRecord11ActionA5(sourceState, actor, action, command = {}) {
    const normalized = normalizeRecord11A5(sourceState);
    const state = normalized.state;
    const process = state.a5Record11;
    const actions = ["record-resolution", "dispatch-package", "record-package-receipt", "record-external-status", "complete-notification", "evaluate-closure"];
    if (!actions.includes(action)) return fail(sourceState, "INVALID_TRANSITION", "action", "ไม่รู้จักขั้นตอน Record 11");
    if (text(command.caseId) !== text(state.caseData?.id)) return fail(sourceState, "CASE_MISMATCH", "caseId", "สำนวนไม่ตรงกับคำสั่ง");
    if (Number(command.expectedVersion) !== process.version) return fail(sourceState, "VERSION_CONFLICT", "expectedVersion", "ข้อมูล Record 11 เปลี่ยนแปลงแล้ว");
    const replay = process.events.find(event => event.idempotencyKey === text(command.idempotencyKey));
    if (replay) return Object.freeze({ ok: true, code: "IDEMPOTENT_REPLAY", state, errors: Object.freeze([]) });
    if (!text(command.idempotencyKey) || !text(command.at)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "command", "ต้องระบุ idempotency key และเวลาทำรายการ");
    const role = text(actor?.role);
    if (action === "record-resolution" && role !== "case-clerk") return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ธุรการคดีเป็นผู้บันทึกรับมติฉบับลงนามจากกิจกรรมที่ 7");
    if (["record-package-receipt", "record-external-status", "evaluate-closure"].includes(action) && role !== "case-clerk") return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ธุรการคดีเป็นผู้บันทึกหลักฐานรับและสถานะปลายทาง");
    if (["dispatch-package", "complete-notification"].includes(action) && (role !== "investigator" || text(actor.id) !== text(state.assignment?.primaryOfficerId))) return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ผู้รับผิดชอบสำนวนเป็นผู้จัดทำและนำส่งเอกสาร");

    const finish = code => {
      process.version += 1;
      process.events.push({ action, idempotencyKey: text(command.idempotencyKey), actorId: text(actor.id), at: text(command.at) });
      return Object.freeze({ ok: true, code, state, errors: Object.freeze([]) });
    };

    if (action !== "record-resolution") {
      if (!process.resolution) return fail(sourceState, "RESOLUTION_REQUIRED", "resolution", "ยังไม่มีมติ Record 11 ฉบับลงนาม");
      const task = process.tasks.find(item => item.id === text(command.taskId));
      if (action !== "evaluate-closure" && !task) return fail(sourceState, "TASK_NOT_FOUND", "taskId", "ไม่พบงานตามมติ");

      if (action === "dispatch-package") {
        if (!["PREPARE_PROSECUTOR_PACKAGE", "PREPARE_NACC_PACKAGE", "PREPARE_POLICE_PACKAGE"].includes(task.type) || task.status !== "PENDING") return fail(sourceState, "INVALID_TRANSITION", "taskId", "งานนี้ไม่อยู่ในสถานะเตรียมนำส่ง package");
        if (task.signerAuthorityStatus === "PENDING_CONFIRMATION") return fail(sourceState, "PENDING_CONFIRMATION", "signerAuthorityRef", "ตำแหน่งผู้ลงนามหนังสือส่ง ป.ป.ช./พนักงานสอบสวนยังไม่มี source ยืนยัน");
        const required = ["packageRef", "dispatchDocumentVersionId", "destination", "deliveryMethod", "sentAt"];
        const missing = required.filter(field => !text(command[field]));
        if (missing.length) return fail(sourceState, "MISSING_REQUIRED_FIELD", missing[0], "ข้อมูลนำส่ง package ไม่ครบถ้วน");
        if (!availableVersion(state, command.dispatchDocumentVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "dispatchDocumentVersionId", "ไม่พบหนังสือนำส่งฉบับลงนาม");
        const authority = object(command.signerAuthorityRef);
        if (authority.status !== "CONFIRMED" || !text(authority.referenceNo)) return fail(sourceState, "PENDING_CONFIRMATION", "signerAuthorityRef", "ยังไม่ยืนยัน authority ผู้ลงนามหนังสือนำส่ง");
        task.status = "AWAITING_RECEIPT";
        task.dispatch = {
          packageRef: text(command.packageRef),
          dispatchDocumentVersionId: text(command.dispatchDocumentVersionId),
          destination: text(command.destination),
          deliveryMethod: text(command.deliveryMethod),
          sentAt: text(command.sentAt),
          signerAuthorityRef: copy(authority),
          dispatchedBy: text(actor.id),
          recordedAt: text(command.at)
        };
        process.status = "TASKS_IN_PROGRESS";
        return finish("RECORD_11_PACKAGE_DISPATCHED");
      }

      if (action === "record-package-receipt") {
        if (task.status !== "AWAITING_RECEIPT") return fail(sourceState, "INVALID_TRANSITION", "taskId", "package ยังไม่ได้ส่งหรือบันทึกรับแล้ว");
        if (!text(command.receivedAt) || !text(command.receiptEvidenceVersionId)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "receipt", "ข้อมูลหลักฐานรับ package ไม่ครบถ้วน");
        if (!availableVersion(state, command.receiptEvidenceVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "receiptEvidenceVersionId", "ไม่พบหลักฐานปลายทางรับ package");
        task.status = "COMPLETED";
        task.receipt = { receivedAt: text(command.receivedAt), evidenceVersionId: text(command.receiptEvidenceVersionId), recordedBy: text(actor.id), recordedAt: text(command.at) };
        process.status = process.tasks.every(item => item.status === "COMPLETED") ? "READY_FOR_CLOSURE" : "TASKS_IN_PROGRESS";
        return finish("RECORD_11_PACKAGE_RECEIPT_RECORDED");
      }

      if (action === "record-external-status") {
        if (task.type !== "TRACK_DISCIPLINARY_DISPATCH" || task.status !== "WAITING_EXTERNAL") return fail(sourceState, "INVALID_TRANSITION", "taskId", "งานนี้ไม่ได้รอสถานะจากกิจกรรมที่ 8");
        if (text(command.sourceSystem) !== "ACTIVITY_8" || text(command.externalStatus) !== "DISPATCH_CONFIRMED") return fail(sourceState, "INVALID_EXTERNAL_STATUS", "externalStatus", "รับเฉพาะหลักฐานยืนยันการส่งจากกิจกรรมที่ 8");
        if (!availableVersion(state, command.evidenceVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "evidenceVersionId", "ไม่พบหลักฐานสถานะจากกิจกรรมที่ 8");
        task.status = "COMPLETED";
        task.externalUpdate = { sourceSystem: "ACTIVITY_8", status: "DISPATCH_CONFIRMED", evidenceVersionId: text(command.evidenceVersionId), recordedBy: text(actor.id), recordedAt: text(command.at) };
        process.status = process.tasks.every(item => item.status === "COMPLETED") ? "READY_FOR_CLOSURE" : "TASKS_IN_PROGRESS";
        return finish("RECORD_11_EXTERNAL_STATUS_RECORDED");
      }

      if (action === "complete-notification") {
        if (!["NOTIFY_ACCUSED", "NOTIFY_HOME_AGENCY"].includes(task.type) || task.status !== "PENDING") return fail(sourceState, "INVALID_TRANSITION", "taskId", "งานนี้ไม่ใช่งานแจ้งผลที่รอดำเนินการ");
        const required = ["dispatchDocumentVersionId", "sentAt", "deliveryMethod", "receiptEvidenceVersionId"];
        const missing = required.filter(field => !text(command[field]));
        if (missing.length) return fail(sourceState, "MISSING_REQUIRED_FIELD", missing[0], "ข้อมูลการแจ้งผลไม่ครบถ้วน");
        if (!availableVersion(state, command.dispatchDocumentVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "dispatchDocumentVersionId", "ไม่พบหนังสือแจ้งผลฉบับที่ส่ง");
        if (!availableVersion(state, command.receiptEvidenceVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "receiptEvidenceVersionId", "ไม่พบหลักฐานผู้รับได้รับหนังสือแจ้งผล");
        task.status = "COMPLETED";
        task.notification = {
          dispatchDocumentVersionId: text(command.dispatchDocumentVersionId),
          sentAt: text(command.sentAt),
          deliveryMethod: text(command.deliveryMethod),
          receiptEvidenceVersionId: text(command.receiptEvidenceVersionId),
          completedBy: text(actor.id),
          completedAt: text(command.at),
          overdue: Boolean(task.dueAt && text(command.sentAt) > task.dueAt)
        };
        process.status = process.tasks.every(item => item.status === "COMPLETED") ? "READY_FOR_CLOSURE" : "TASKS_IN_PROGRESS";
        return finish("RECORD_11_NOTIFICATION_COMPLETED");
      }

      const incomplete = process.tasks.filter(item => item.status !== "COMPLETED");
      if (incomplete.length) return fail(sourceState, "CLOSURE_BLOCKED", "tasks", `ยังมีงานตามมติค้าง ${incomplete.length} รายการ`);
      process.status = "READY_FOR_CLOSURE";
      state.workflow.downstreamStatus = "RECORD_11_READY_FOR_CLOSURE";
      return finish("RECORD_11_CLOSURE_READY");
    }

    if (process.resolution) return fail(sourceState, "RESULT_ALREADY_RECORDED", "result", "บันทึกมติ Record 11 แล้ว");
    if (state.a5Report644Lifecycle?.status !== "REPORT_644_RESULT_RECEIVED") return fail(sourceState, "RECORD_10_RESULT_REQUIRED", "a5Report644Lifecycle.status", "Record 10 ยังไม่ถึงผลตรวจเสนอที่พร้อมรับมติ Record 11");
    const required = ["idempotencyKey", "at", "resultCode", "resultReference", "decidedAt", "resolutionDocumentVersionId", "report644DocumentVersionId"];
    const missing = required.filter(field => !text(command[field]));
    if (missing.length) return fail(sourceState, "MISSING_REQUIRED_FIELD", missing[0], "ข้อมูลมติไม่ครบถ้วน");
    if (!RESULT_CODES[text(command.resultCode)]) return fail(sourceState, "INVALID_RESULT_CODE", "resultCode", "ผลมติไม่อยู่ใน Record 11");
    if (text(command.resultCode) === "SECTION_18_4" && !SECTION_18_4_ROUTES.includes(text(command.section184Route))) {
      return fail(sourceState, "PENDING_CONFIRMATION", "section184Route", "มติ ม.18/4 ต้องระบุเส้นอาญา วินัย หรือทั้งสองจากมติฉบับลงนาม");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text(command.decidedAt))) return fail(sourceState, "INVALID_DATE", "decidedAt", "วันที่มีมติไม่ถูกต้อง");
    const authority = object(command.authorityRef);
    if (authority.status !== "CONFIRMED" || !text(authority.referenceNo)) return fail(sourceState, "PENDING_CONFIRMATION", "authorityRef", "ต้องใช้มติฉบับลงนามที่ยืนยัน authority แล้ว");
    if (!availableVersion(state, command.resolutionDocumentVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "resolutionDocumentVersionId", "ไม่พบมติฉบับลงนามในคลังหลักฐาน");
    if (!availableVersion(state, command.report644DocumentVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "report644DocumentVersionId", "ไม่พบรายงาน 644 ที่อ้างในมติ");

    process.resolution = {
      resultCode: text(command.resultCode),
      resultLabel: RESULT_CODES[text(command.resultCode)],
      resultReference: text(command.resultReference),
      decidedAt: text(command.decidedAt),
      resolutionDocumentVersionId: text(command.resolutionDocumentVersionId),
      report644DocumentVersionId: text(command.report644DocumentVersionId),
      section184Route: text(command.section184Route),
      authorityRef: copy(authority),
      recordedBy: text(actor.id),
      recordedByName: text(actor.name),
      recordedAt: text(command.at)
    };
    process.tasks = tasksForResolution(text(command.resultCode), { ...command, state });
    process.status = process.tasks.length ? "TASKS_PENDING" : "READY_FOR_CLOSURE";
    state.workflow.stage = "a5-outcome";
    state.workflow.owner = "investigator";
    state.workflow.downstreamStatus = "RECORD_11_TASKS_PENDING";
    return finish("RECORD_11_RESOLUTION_RECORDED");
  }

  const api = Object.freeze({ RESULT_CODES, SECTION_18_4_ROUTES, normalizeRecord11A5, executeRecord11ActionA5, resolveRecord11DocumentAutoPickA5 });
  root.ECMISActivity5Record11 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
