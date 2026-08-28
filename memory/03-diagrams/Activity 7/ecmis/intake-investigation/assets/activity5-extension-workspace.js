(function initializeActivity5ExtensionWorkspace(root) {
  const rules = root.ECMISActivity5ExtensionRules
    || (typeof require === "function" ? require("./activity5-extension-rules.js") : null);
  const workflow = root.ECMISActivity5ExtensionWorkflow
    || (typeof require === "function" ? require("./activity5-extension-workflow.js") : null);
  const documents = root.ECMISActivity5ExtensionDocuments
    || (typeof require === "function" ? require("./activity5-extension-documents.js") : null);

  const STEPS = Object.freeze([
    Object.freeze({ id: "request", label: "ข้อมูลคำขอ" }),
    Object.freeze({ id: "documents", label: "เอกสารประกอบ" }),
    Object.freeze({ id: "readiness", label: "ตรวจความพร้อม" }),
    Object.freeze({ id: "confirm", label: "ยืนยันและยื่น" })
  ]);
  const REQUIREMENT_LABELS = Object.freeze({
    PROGRESS_REPORT: "รายงานความคืบหน้า",
    CASE_PLAN: "แผนงานคดี",
    WORK_LOG: "บันทึกการปฏิบัติงาน",
    RECEIVED_DATE_EVIDENCE: "หลักฐานวันรับสำนวน",
    INQUIRY_APPOINTMENT_ORDER: "คำสั่งแต่งตั้งคณะไต่สวน"
  });
  const FIELD_PRESENTATIONS = Object.freeze({
    progress: Object.freeze({ label: "ความคืบหน้าปัจจุบัน", controlId: "a5Extension-progress" }),
    workDone: Object.freeze({ label: "งานที่ดำเนินการแล้ว", controlId: "a5Extension-workDone" }),
    workRemaining: Object.freeze({ label: "งานที่ยังเหลือ", controlId: "a5Extension-workRemaining" }),
    obstacles: Object.freeze({ label: "ปัญหาและอุปสรรค", controlId: "a5Extension-obstacles" }),
    reason: Object.freeze({ label: "เหตุผลและความจำเป็น", controlId: "a5Extension-reason" }),
    requestedDays: Object.freeze({ label: "จำนวนวันที่ขอ", controlId: "a5Extension-requestedDays" })
  });
  const FORM_LABELS = Object.freeze({ FORM_2: "แบบ ปปท. 2", FORM_3: "แบบ ปปท. 3" });
  const SOURCE_LABELS = Object.freeze({
    SYSTEM: "ระบบสำนวน",
    A5_DOCUMENT_STORE: "ระบบสำนวน",
    A4_HANDOFF: "ส่งมาจากกิจกรรมที่ 4",
    A4_SIGNED_HANDOFF: "ฉบับลงนามจากกิจกรรมที่ 4",
    SIGNED_EXTERNAL: "เอกสารลงนามจากภายนอก",
    UPLOAD: "อัปโหลดในคำขอนี้"
  });
  const AVAILABILITY_LABELS = Object.freeze({
    AVAILABLE: "พร้อมใช้",
    REFERENCE_ONLY: "ข้อมูลอ้างอิงเท่านั้น",
    UPLOAD_PENDING: "รอจัดเก็บไฟล์",
    WITHDRAWN: "ถอนแล้ว"
  });

  function mappedLabel(value, labels, fallback) {
    const text = asText(value);
    if (labels[text]) return labels[text];
    return /^[A-Z][A-Z0-9_]*$/.test(text) ? fallback : (text || fallback);
  }

  function formLabel(value) {
    return mappedLabel(value, FORM_LABELS, "แบบคำขอขยายเวลา");
  }

  function documentTypeLabel(value) {
    return mappedLabel(value, REQUIREMENT_LABELS, "เอกสารประเภทอื่น");
  }

  function sourceLabel(value) {
    return mappedLabel(value, SOURCE_LABELS, "แหล่งเอกสารอื่น");
  }

  function availabilityLabel(value) {
    return mappedLabel(value, AVAILABILITY_LABELS, "ยังไม่พร้อมใช้");
  }

  function asText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
    }
    return value;
  }

  function envelope(ok, code, result = null, errors = []) {
    return { ok, code, result, errors };
  }

  function accessDenied(model, field, message) {
    return envelope(false, "REQUESTER_ACCESS_DENIED", model, [{ field, message }]);
  }

  function verifyRequesterAccess(sourceModel, sourceAccess) {
    if (!sourceModel || typeof sourceModel !== "object" || Array.isArray(sourceModel)) {
      return accessDenied(sourceModel, "workspace", "ไม่พบข้อมูลคำขอขยายเวลาที่ต้องตรวจสอบสิทธิ์");
    }
    const access = sourceAccess && typeof sourceAccess === "object" && !Array.isArray(sourceAccess) ? sourceAccess : {};
    const context = sourceModel.context && typeof sourceModel.context === "object" ? sourceModel.context : {};
    const requestState = sourceModel.requestState && typeof sourceModel.requestState === "object" ? sourceModel.requestState : {};
    const actorId = asText(access.actorId);
    const primaryOfficerId = asText(access.primaryOfficerId);
    const assignmentVersion = Number(access.assignmentVersion);
    const acceptedAssignmentVersion = Number(access.acceptedAssignmentVersion);
    if (!actorId) return accessDenied(sourceModel, "actorId", "ไม่พบบัญชีผู้ใช้งานปัจจุบัน กรุณาเข้าสู่ระบบใหม่");
    if (!primaryOfficerId) return accessDenied(sourceModel, "assignment.primaryOfficerId", "ไม่พบผู้รับผิดชอบหลักของสำนวน");
    if (actorId !== primaryOfficerId) return accessDenied(sourceModel, "actorId", "บัญชีปัจจุบันไม่ใช่ผู้รับผิดชอบหลักของสำนวน");
    if (!Number.isInteger(assignmentVersion) || assignmentVersion < 1
      || acceptedAssignmentVersion !== assignmentVersion) {
      return accessDenied(sourceModel, "assignment.acceptedAssignmentVersion", "ผู้รับผิดชอบหลักยังไม่ได้รับมอบหมายเวอร์ชันปัจจุบัน");
    }
    if (asText(context.ownerId) !== primaryOfficerId || asText(requestState.ownerId) !== primaryOfficerId) {
      return accessDenied(sourceModel, "requestState.ownerId", "เจ้าของคำขอไม่ตรงกับผู้รับผิดชอบหลักของสำนวน");
    }
    if (Number(context.assignmentVersion) !== assignmentVersion
      || Number(context.acceptedAssignmentVersion) !== acceptedAssignmentVersion) {
      return accessDenied(sourceModel, "assignment.assignmentVersion", "ข้อมูลมอบหมายเปลี่ยนแปลง กรุณาปิดคำขอและเปิดใหม่");
    }
    const scopePairs = [
      ["caseId", context.caseId, requestState.caseId],
      ["extensionType", context.extensionType, requestState.extensionType],
      ["formId", context.formId, requestState.formId],
      ["roundNo", Number(context.roundNo), Number(requestState.roundNo)],
      ["requestId", requestState.id, requestState.id],
      ["revisionNo", Number(requestState.activeRevisionNo), Number(requestState.activeRevisionNo)]
    ];
    for (const [field, contextValue, stateValue] of scopePairs) {
      const liveValue = field === "revisionNo" || field === "roundNo" ? Number(access[field]) : asText(access[field]);
      const expectedValue = field === "revisionNo" || field === "roundNo" ? Number(contextValue) : asText(contextValue);
      const requestValue = field === "revisionNo" || field === "roundNo" ? Number(stateValue) : asText(stateValue);
      if (!liveValue || liveValue !== expectedValue || requestValue !== expectedValue) {
        return accessDenied(sourceModel, field, "ขอบเขตคำขอที่เปิดอยู่ไม่ตรงกับสำนวนหรือฉบับร่างปัจจุบัน");
      }
    }
    const revisions = Array.isArray(requestState.revisions) ? requestState.revisions : [];
    if (revisions.filter(item => item?.revisionNo === requestState.activeRevisionNo).length !== 1) {
      return accessDenied(sourceModel, "revisionNo", "ไม่พบฉบับร่างปัจจุบันของคำขอ");
    }
    return envelope(true, "REQUESTER_ACCESS_VERIFIED", sourceModel);
  }

  function deriveActiveAssignmentLinks(model) {
    const requestId = asText(model?.requestState?.id);
    const revisionNo = Number(model?.requestState?.activeRevisionNo);
    const links = [];
    if (!requestId || !Number.isInteger(revisionNo) || revisionNo < 1) return links;
    Object.entries(model?.assignments || {}).forEach(([requirementCode, sourceLinks]) => {
      (Array.isArray(sourceLinks) ? sourceLinks : []).forEach(sourceLink => {
        const documentVersionId = asText(typeof sourceLink === "string" ? sourceLink : sourceLink?.versionId);
        if (documentVersionId) links.push({ requestId, revisionNo, requirementCode, documentVersionId });
      });
    });
    return links;
  }

  function withCanonicalAssignmentLinks(sourceModel) {
    const model = sourceModel && typeof sourceModel === "object" && !Array.isArray(sourceModel) ? clone(sourceModel) : {};
    model.assignmentLinks = deriveActiveAssignmentLinks(model);
    return model;
  }

  function hasOpenableSystemPreview(item) {
    if (!item || item.availability !== "AVAILABLE" || !["CASE_PLAN", "WORK_LOG"].includes(item.documentType)) return false;
    if (item.source === "A5_DOCUMENT_STORE") {
      const snapshot = item.previewSnapshot && typeof item.previewSnapshot === "object" && !Array.isArray(item.previewSnapshot)
        ? item.previewSnapshot
        : null;
      return ["213", "644"].includes(asText(item.reportType))
        && snapshot?.reportType === item.reportType
        && snapshot?.documentType === item.documentType
        && snapshot?.payload && typeof snapshot.payload === "object" && !Array.isArray(snapshot.payload);
    }
    if (item.source !== "SYSTEM") return false;
    const reportType = asText(item.previewReportType);
    const sourceField = asText(item.previewSourceField);
    const snapshot = item.previewSnapshot && typeof item.previewSnapshot === "object" && !Array.isArray(item.previewSnapshot)
      ? item.previewSnapshot
      : null;
    return ["213", "644"].includes(reportType)
      && ["plan", "workLog"].includes(sourceField)
      && asText(snapshot?.reportType) === reportType
      && Boolean(asText(snapshot?.[sourceField]));
  }

  function recoverPreviewRepository(persistedRepository, freshRepository) {
    const freshByVersionId = new Map((freshRepository || []).map(item => [item.versionId, item]));
    return (persistedRepository || []).map(sourceItem => {
      const item = clone(sourceItem);
      const requiresSystemPreview = item.availability === "AVAILABLE"
        && ["SYSTEM", "A5_DOCUMENT_STORE"].includes(item.source)
        && ["CASE_PLAN", "WORK_LOG"].includes(item.documentType)
        && (item.source === "A5_DOCUMENT_STORE" || item.previewDocument === "plan" || Boolean(item.previewReportType) || Boolean(item.previewSourceField) || Boolean(item.previewSnapshot));
      if (!requiresSystemPreview || hasOpenableSystemPreview(item)) return item;
      const fresh = freshByVersionId.get(item.versionId);
      if (hasOpenableSystemPreview(fresh)) {
        item.previewDocument = fresh.previewDocument;
        item.previewReportType = fresh.previewReportType;
        item.previewSourceField = fresh.previewSourceField;
        item.previewSnapshot = clone(fresh.previewSnapshot);
        return item;
      }
      item.availability = "REFERENCE_ONLY";
      delete item.previewSnapshot;
      return item;
    });
  }

  function createRequesterWorkspace(sourceInput) {
    const source = sourceInput && typeof sourceInput === "object" && !Array.isArray(sourceInput) ? sourceInput : {};
    const rule = rules?.getExtensionRule(asText(source.extensionType));
    if (!rule) return envelope(false, "INVALID_EXTENSION_TYPE", null, [{ field: "extensionType" }]);
    const assignment = source.assignment && typeof source.assignment === "object" && !Array.isArray(source.assignment) ? source.assignment : {};
    const ownerId = asText(assignment.primaryOfficerId);
    const actorId = asText(source.actorId);
    const assignmentVersion = Number(assignment.assignmentVersion);
    const acceptedAssignmentVersion = Number(assignment.acceptedAssignmentVersion);
    if (!actorId) return accessDenied(null, "actorId", "ไม่พบบัญชีผู้ใช้งานปัจจุบัน กรุณาเข้าสู่ระบบใหม่");
    if (!ownerId) return accessDenied(null, "assignment.primaryOfficerId", "ไม่พบผู้รับผิดชอบหลักของสำนวน");
    if (actorId !== ownerId) return accessDenied(null, "actorId", "บัญชีปัจจุบันไม่ใช่ผู้รับผิดชอบหลักของสำนวน");
    if (!Number.isInteger(assignmentVersion) || assignmentVersion < 1
      || acceptedAssignmentVersion !== assignmentVersion) {
      return accessDenied(null, "assignment.acceptedAssignmentVersion", "ผู้รับผิดชอบหลักยังไม่ได้รับมอบหมายเวอร์ชันปัจจุบัน");
    }
    if (source.persisted && typeof source.persisted === "object" && !Array.isArray(source.persisted)) {
      const persisted = clone(source.persisted);
      if (persisted.schemaVersion !== 1 || !persisted.requestState?.id) {
        return envelope(false, "INVALID_RECOVERY_STATE", null, [{ field: "persisted" }]);
      }
      const verified = verifyRequesterAccess(persisted, {
        actorId,
        primaryOfficerId: ownerId,
        assignmentVersion,
        acceptedAssignmentVersion,
        caseId: source.caseId,
        extensionType: source.extensionType,
        formId: rule.formId,
        roundNo: source.roundNo,
        requestId: source.requestId,
        revisionNo: persisted.requestState.activeRevisionNo
      });
      if (!verified.ok) return verified;
      const recoveredRepository = documents?.normalizeExtensionRepository(persisted.repository || []);
      if (!recoveredRepository?.ok) return recoveredRepository;
      const freshRepository = documents?.normalizeExtensionRepository(source.repository || []);
      persisted.repository = recoverPreviewRepository(
        recoveredRepository.result,
        freshRepository?.ok ? freshRepository.result : []
      );
      persisted.assignmentLinks = deriveActiveAssignmentLinks(persisted);
      persisted.active = true;
      persisted.steps = STEPS.map(clone);
      persisted.ui = {
        ...(persisted.ui || {}),
        pendingPatch: {},
        dirty: false,
        saveState: "SAVED",
        recovered: true
      };
      return envelope(true, "REQUESTER_WORKSPACE_RECOVERED", persisted);
    }
    const request = workflow?.createDraft(null, {
      requestId: source.requestId,
      caseId: source.caseId,
      extensionType: source.extensionType,
      roundNo: source.roundNo,
      ownerId,
      actorId,
      at: source.at,
      currentDeadline: source.currentDeadline,
      submissionCutoff: source.submissionCutoff,
      deadlineBasis: source.deadlineBasis,
      deadlineVersion: source.deadlineVersion,
      reviewerContract: source.reviewerContract,
      draftPayload: source.draftPayload
    });
    if (!request?.ok) return envelope(false, request?.code || "DRAFT_CREATE_FAILED", null, request?.result?.errors || []);
    const repository = documents?.normalizeExtensionRepository(source.repository || []);
    if (!repository?.ok) return repository;
    return envelope(true, "REQUESTER_WORKSPACE_CREATED", {
      schemaVersion: 1,
      active: true,
      steps: STEPS.map(clone),
      context: {
        caseId: asText(source.caseId),
        caseNumber: asText(source.caseNumber) || asText(source.caseId),
        reportType: asText(source.reportType),
        extensionType: asText(source.extensionType),
        formId: rule.formId,
        roundNo: Number(source.roundNo),
        ownerId,
        ownerName: asText(source.ownerName),
        assignmentVersion,
        acceptedAssignmentVersion,
        currentDeadline: asText(source.currentDeadline),
        submissionCutoff: asText(source.submissionCutoff),
        deadlineBasis: clone(source.deadlineBasis),
        deadlineVersion: Number(source.deadlineVersion),
        unitKey: asText(source.unitKey),
        appointmentContext: clone(source.appointmentContext || null),
        policy: {
          authorityChain: asText(source.policy?.authorityChain),
          approvalDayPolicy: asText(source.policy?.approvalDayPolicy),
          roundLimitPolicy: asText(source.policy?.roundLimitPolicy)
        }
      },
      requestState: request.state,
      repository: repository.result,
      selectedVersionIds: [],
      assignments: {},
      assignmentLinks: [],
      ui: {
        step: 1,
        sourceMode: "EXISTING",
        repositoryFilters: {
          search: "",
          documentType: "",
          source: "",
          availability: "",
          latestMode: "ALL",
          requirementCode: "",
          sortBy: "name",
          sortDirection: "asc"
        },
        repositoryPage: 1,
        repositoryPageSize: 20,
        pendingPatch: {},
        dirty: true,
        saveState: "UNSAVED"
      },
      updatedAt: asText(source.at)
    });
  }

  function getRepositoryPage(sourceModel) {
    const model = sourceModel && typeof sourceModel === "object" ? withCanonicalAssignmentLinks(sourceModel) : {};
    const ui = model.ui && typeof model.ui === "object" ? model.ui : {};
    const filters = ui.repositoryFilters && typeof ui.repositoryFilters === "object" ? ui.repositoryFilters : {};
    const pageSize = Number.isInteger(ui.repositoryPageSize) && ui.repositoryPageSize > 0 ? ui.repositoryPageSize : 20;
    const requestedPage = Number.isInteger(ui.repositoryPage) && ui.repositoryPage > 0 ? ui.repositoryPage : 1;
    const filterOptions = {
      latestMode: asText(filters.latestMode) || "ALL",
      sortBy: asText(filters.sortBy) || "name",
      sortDirection: asText(filters.sortDirection) || "asc",
      offset: 0,
      limit: Array.isArray(model.repository) ? model.repository.length : 0
    };
    for (const key of ["search", "documentType", "source", "availability"]) {
      if (asText(filters[key])) filterOptions[key] = asText(filters[key]);
    }
    if (asText(filters.requirementCode)) {
      filterOptions.requirementCode = asText(filters.requirementCode);
      filterOptions.requestId = asText(model.requestState?.id);
      filterOptions.revisionNo = Number(model.requestState?.activeRevisionNo);
    }
    const filtered = documents?.filterExtensionDocuments(model.repository || [], filterOptions, model.assignmentLinks || []);
    if (!filtered?.ok) return filtered || envelope(false, "DOCUMENT_QUERY_FAILED");
    const total = filtered.result.total;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, pageCount);
    const offset = (page - 1) * pageSize;
    return envelope(true, "REPOSITORY_PAGE_READY", {
      items: filtered.result.items.slice(offset, offset + pageSize),
      total,
      page,
      pageCount,
      pageSize,
      offset,
      query: {
        requestId: filterOptions.requestId || "",
        revisionNo: filterOptions.revisionNo || null,
        requirementCode: filterOptions.requirementCode || "",
        sortBy: filterOptions.sortBy,
        sortDirection: filterOptions.sortDirection
      }
    });
  }

  function markDocumentMutation(model) {
    delete model.readiness;
    model.ui.documentMutationPending = true;
    model.ui.validationMessages = [];
    model.ui.prepared = false;
    model.ui.dirty = true;
    model.ui.saveState = "UNSAVED";
    return model;
  }

  function previewSequence(model, scope) {
    const selected = new Set(model.selectedVersionIds || []);
    return (model.repository || []).filter(item => item.availability === "AVAILABLE"
      && (scope === "PACKAGE" ? selected.has(item.versionId) : true));
  }

  function reduceRequesterWorkspace(sourceModel, sourceAction) {
    if (!sourceModel || typeof sourceModel !== "object" || Array.isArray(sourceModel)) {
      return envelope(false, "INVALID_WORKSPACE", null, [{ field: "workspace" }]);
    }
    const action = sourceAction && typeof sourceAction === "object" && !Array.isArray(sourceAction) ? sourceAction : {};
    const model = clone(sourceModel);
    let selection;
    if (action.type === "SET_FIELDS") {
      if (!action.patch || typeof action.patch !== "object" || Array.isArray(action.patch) || Object.keys(action.patch).length === 0) {
        return envelope(false, "INVALID_FIELD_PATCH", sourceModel, [{ field: "patch" }]);
      }
      const allowedFields = new Set(workflow?.REQUIRED_DRAFT_FIELDS || []);
      const invalidFields = Object.keys(action.patch).filter(field => !allowedFields.has(field));
      const invalidValues = Object.entries(action.patch).filter(([field, value]) => {
        if (field !== "requestedDays") return typeof value !== "string";
        const explicitBlank = value === "" || (typeof value === "string" && value.trim() === "");
        return !explicitBlank && (!Number.isFinite(Number(value)) || Number(value) <= 0);
      });
      if (invalidFields.length || invalidValues.length) {
        return envelope(false, "INVALID_FIELD_PATCH", sourceModel, [
          ...invalidFields.map(field => ({ field: `patch.${field}` })),
          ...invalidValues.map(([field]) => ({ field: `patch.${field}` }))
        ]);
      }
      model.ui.pendingPatch = { ...(model.ui.pendingPatch || {}), ...clone(action.patch) };
      model.ui.dirty = true;
      model.ui.saveState = "UNSAVED";
      return envelope(true, "WORKSPACE_UPDATED", model);
    }
    if (action.type === "SET_STEP") {
      const step = Number(action.step);
      if (!Number.isInteger(step) || step < 1 || step > 4) {
        return envelope(false, "INVALID_STEP", sourceModel, [{ field: "step" }]);
      }
      model.ui.step = step;
      model.ui.dirty = true;
      model.ui.saveState = "UNSAVED";
      return envelope(true, "WORKSPACE_UPDATED", model);
    }
    if (action.type === "SET_SOURCE_MODE") {
      if (!["EXISTING", "UPLOAD"].includes(action.sourceMode)) {
        return envelope(false, "INVALID_SOURCE_MODE", sourceModel, [{ field: "sourceMode" }]);
      }
      model.ui.sourceMode = action.sourceMode;
      model.ui.dirty = true;
      model.ui.saveState = "UNSAVED";
      return envelope(true, "WORKSPACE_UPDATED", model);
    }
    if (action.type === "SET_ACTIVE_REQUIREMENT") {
      const rule = rules?.getExtensionRule(model.context?.extensionType);
      if (!rule?.requiredDocumentCodes?.includes(action.requirementCode)) {
        return envelope(false, "INVALID_REQUIREMENT", sourceModel, [{ field: "requirementCode" }]);
      }
      model.ui.activeRequirement = action.requirementCode;
      return envelope(true, "WORKSPACE_UPDATED", model);
    }
    if (action.type === "SET_REPOSITORY_FILTERS") {
      if (!action.patch || typeof action.patch !== "object" || Array.isArray(action.patch)) {
        return envelope(false, "INVALID_FILTERS", sourceModel, [{ field: "patch" }]);
      }
      const allowed = new Set(["search", "documentType", "source", "availability", "latestMode", "requirementCode", "sortBy", "sortDirection"]);
      if (Object.keys(action.patch).some(key => !allowed.has(key))) {
        return envelope(false, "INVALID_FILTERS", sourceModel, [{ field: "patch" }]);
      }
      model.ui.repositoryFilters = { ...(model.ui.repositoryFilters || {}), ...clone(action.patch) };
      model.ui.repositoryPage = 1;
      model.ui.dirty = true;
      model.ui.saveState = "UNSAVED";
      return envelope(true, "WORKSPACE_UPDATED", model);
    }
    if (action.type === "SET_REPOSITORY_PAGE") {
      if (!Number.isInteger(action.page) || action.page < 1) {
        return envelope(false, "INVALID_PAGE", sourceModel, [{ field: "page" }]);
      }
      model.ui.repositoryPage = action.page;
      model.ui.dirty = true;
      model.ui.saveState = "UNSAVED";
      return envelope(true, "WORKSPACE_UPDATED", model);
    }
    if (action.type === "SET_PACKAGE_MODE") {
      model.ui.showAllDocuments = action.showAll === true;
      return envelope(true, "WORKSPACE_UPDATED", model);
    }
    if (action.type === "OPEN_DOCUMENT") {
      const item = (model.repository || []).find(candidate => candidate.versionId === asText(action.versionId));
      if (!item) return envelope(false, "DOCUMENT_NOT_FOUND", sourceModel, [{ field: "versionId", message: "ไม่พบเอกสารเวอร์ชันที่เลือก" }]);
      if (item.availability !== "AVAILABLE") {
        return envelope(false, "DOCUMENT_NOT_OPENABLE", sourceModel, [{ field: "versionId", message: "เอกสารเวอร์ชันนี้ยังไม่พร้อมเปิดดู" }]);
      }
      model.ui.previewVersionId = item.versionId;
      model.ui.previewScope = action.scope === "PACKAGE" ? "PACKAGE" : "REPOSITORY";
      return envelope(true, "DOCUMENT_OPENED", model);
    }
    if (action.type === "PREVIEW_NEXT" || action.type === "PREVIEW_PREVIOUS") {
      const scope = action.scope === "PACKAGE" ? "PACKAGE" : (model.ui?.previewScope || "REPOSITORY");
      const items = previewSequence(model, scope);
      const currentIndex = items.findIndex(item => item.versionId === model.ui?.previewVersionId);
      const nextIndex = currentIndex + (action.type === "PREVIEW_NEXT" ? 1 : -1);
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) {
        const direction = action.type === "PREVIEW_NEXT" ? "ถัดไป" : "ก่อนหน้า";
        return envelope(false, "PREVIEW_BOUNDARY", sourceModel, [{ field: "previewVersionId", message: `ไม่มีเอกสาร${direction}ที่พร้อมเปิดดู` }]);
      }
      model.ui.previewVersionId = items[nextIndex].versionId;
      model.ui.previewScope = scope;
      return envelope(true, "DOCUMENT_OPENED", model);
    }
    if (action.type === "ADD_UPLOAD_METADATA") {
      if (!Array.isArray(action.uploads) || action.uploads.length === 0) {
        return envelope(false, "INVALID_UPLOADS", sourceModel, [{ field: "uploads" }]);
      }
      const uploaded = [];
      const errors = [];
      action.uploads.forEach((item, index) => {
        const created = documents?.createUploadedDocumentVersion(item?.metadata, item?.injection);
        if (!created?.ok) {
          (created?.errors || []).forEach(error => errors.push({ ...error, field: `uploads[${index}].${error.field || "metadata"}` }));
        } else uploaded.push(created.result);
      });
      if (errors.length) return envelope(false, "INVALID_UPLOADS", sourceModel, errors);
      const normalized = documents?.normalizeExtensionRepository([...(model.repository || []), ...uploaded]);
      if (!normalized?.ok) return normalized;
      model.repository = normalized.result;
      model.selectedVersionIds = [...new Set([...(model.selectedVersionIds || []), ...uploaded.map(item => item.versionId)])];
      model.ui.saveMessage = "เพิ่มเฉพาะข้อมูลไฟล์แล้ว ยังไม่ได้จัดเก็บไฟล์จริงในระบบ";
      return envelope(true, "UPLOAD_METADATA_ADDED", markDocumentMutation(model));
    }
    if (action.type === "ASSIGN_REQUIREMENT") {
      const assigned = documents?.assignRequirement(
        model.assignments || {},
        action.requirementCode,
        action.versionLinks,
        model.repository || []
      );
      if (!assigned?.ok) return assigned || envelope(false, "REQUIREMENT_ASSIGNMENT_FAILED", sourceModel);
      model.assignments = assigned.result;
      const selectedIds = (Array.isArray(action.versionLinks) ? action.versionLinks : [])
        .map(link => asText(typeof link === "string" ? link : link?.versionId))
        .filter(Boolean);
      model.selectedVersionIds = [...new Set([...(model.selectedVersionIds || []), ...selectedIds])];
      model.assignmentLinks = deriveActiveAssignmentLinks(model);
      return envelope(true, "REQUIREMENT_ASSIGNED", markDocumentMutation(model));
    }
    if (action.type === "SET_OLD_VERSION_POLICY") {
      const rule = rules?.getExtensionRule(model.context?.extensionType);
      const requirementCode = asText(action.requirementCode);
      const links = Array.isArray(model.assignments?.[requirementCode]) ? model.assignments[requirementCode] : [];
      if (!rule?.requiredDocumentCodes?.includes(requirementCode)) {
        return envelope(false, "INVALID_OLD_VERSION_POLICY", sourceModel, [{ field: "requirementCode" }]);
      }
      const versionLinks = links.map(link => ({
        versionId: asText(typeof link === "string" ? link : link?.versionId),
        oldVersionConfirmed: action.oldVersionConfirmed === true,
        oldVersionReason: asText(action.oldVersionReason)
      }));
      if (versionLinks.length) {
        const assigned = documents?.assignRequirement(model.assignments || {}, requirementCode, versionLinks, model.repository || []);
        if (!assigned?.ok) return assigned || envelope(false, "INVALID_OLD_VERSION_POLICY", sourceModel);
        model.assignments = assigned.result;
      }
      model.ui.oldVersionPolicy = {
        ...(model.ui.oldVersionPolicy || {}),
        [requirementCode]: {
          oldVersionConfirmed: action.oldVersionConfirmed === true,
          oldVersionReason: asText(action.oldVersionReason)
        }
      };
      return envelope(true, "OLD_VERSION_POLICY_UPDATED", markDocumentMutation(model));
    }
    if (action.type === "SET_SELECTED_VERSIONS") {
      selection = documents?.updateVisibleSelection([], action.versionIds, "SELECT");
    } else if (action.type === "SELECT_VISIBLE") {
      selection = documents?.updateVisibleSelection(model.selectedVersionIds || [], action.visibleVersionIds, action.action);
    } else {
      return envelope(false, "UNKNOWN_WORKSPACE_ACTION", sourceModel, [{ field: "action.type" }]);
    }
    if (!selection?.ok) return selection || envelope(false, "SELECTION_UPDATE_FAILED", sourceModel);
    model.selectedVersionIds = selection.result;
    return envelope(true, "WORKSPACE_UPDATED", markDocumentMutation(model));
  }

  function shouldBlockWorkspaceExit(model) {
    return Boolean(model?.ui?.dirty || model?.ui?.saveState === "SAVING" || model?.ui?.saveState === "ERROR");
  }

  function saveRequesterWorkspace(sourceModel, sourceCommand) {
    if (!sourceModel || typeof sourceModel !== "object" || Array.isArray(sourceModel)) {
      return envelope(false, "INVALID_WORKSPACE", sourceModel, [{ field: "workspace" }]);
    }
    const model = withCanonicalAssignmentLinks(sourceModel);
    const command = sourceCommand && typeof sourceCommand === "object" ? sourceCommand : {};
    const pendingPatch = model.ui?.pendingPatch && typeof model.ui.pendingPatch === "object" ? model.ui.pendingPatch : {};
    const patch = clone(pendingPatch);
    if (model.ui?.documentMutationPending) {
      patch.extensionDocuments = {
        selectedVersionIds: clone(model.selectedVersionIds || []),
        assignments: clone(model.assignments || {}),
        assignmentLinks: clone(model.assignmentLinks || [])
      };
    }
    if (Object.keys(patch).length > 0) {
      const saved = workflow?.saveDraft(model.requestState, {
        actorId: command.actorId,
        at: command.at,
        expectedVersion: model.requestState?.version,
        patch
      });
      if (!saved?.ok) return envelope(false, saved?.code || "DRAFT_SAVE_FAILED", sourceModel, saved?.result?.errors || []);
      model.requestState = saved.state;
    }
    model.ui.pendingPatch = {};
    model.ui.documentMutationPending = false;
    model.ui.dirty = false;
    model.ui.saveState = "SAVED";
    model.updatedAt = asText(command.at) || model.updatedAt;
    return envelope(true, "REQUESTER_WORKSPACE_SAVED", model);
  }

  function readinessMessage(requirement) {
    const label = REQUIREMENT_LABELS[requirement.requirementCode] || "เอกสารประกอบ";
    if (requirement.complete) return `${label}: พร้อมใช้งาน`;
    const failure = requirement.failures?.[0] || {};
    const messages = {
      NO_VERSION_ASSIGNED: `${label}: ยังไม่ได้เลือกเอกสาร`,
      VERSION_NOT_FOUND: `${label}: ไม่พบเอกสารเวอร์ชันที่เลือก`,
      REFERENCE_ONLY: `${label}: มีเฉพาะข้อมูลอ้างอิง ยังใช้ยื่นไม่ได้`,
      UPLOAD_PENDING: `${label}: รอจัดเก็บไฟล์จริง จึงยังใช้ยื่นไม่ได้`,
      WITHDRAWN: `${label}: เอกสารเวอร์ชันนี้ถูกถอนแล้ว`,
      OLD_VERSION_CONFIRMATION_REQUIRED: `${label}: ต้องยืนยันเหตุผลการใช้เวอร์ชันเก่า`
    };
    return messages[failure.code] || `${label}: เอกสารยังไม่พร้อมใช้ยื่น`;
  }

  function evaluateRequesterReadiness(sourceModel) {
    const model = withCanonicalAssignmentLinks(sourceModel);
    const checked = documents?.evaluateExtensionDocumentChecklist(
      model?.context?.extensionType,
      model?.repository || [],
      model?.assignments || {},
      { caseId: model?.context?.caseId, reportType: model?.context?.reportType, deadlineBasis: model?.context?.deadlineBasis, appointmentContext: model?.context?.appointmentContext }
    );
    if (!checked?.ok) {
      return envelope(false, "READINESS_CHECK_FAILED", null, [{ field: "documents", message: "ตรวจเอกสารประกอบไม่สำเร็จ กรุณาตรวจข้อมูลแล้วลองอีกครั้ง" }]);
    }
    return envelope(true, "READINESS_EVALUATED", {
      ...checked.result,
      messages: checked.result.requirements.map(readinessMessage)
    });
  }

  function validateRequesterWorkspace(sourceModel, sourceCommand) {
    if (!sourceModel || typeof sourceModel !== "object" || Array.isArray(sourceModel)) {
      return envelope(false, "INVALID_WORKSPACE", sourceModel, [{ field: "workspace" }]);
    }
    const command = sourceCommand && typeof sourceCommand === "object" ? sourceCommand : {};
    let model = withCanonicalAssignmentLinks(sourceModel);
    const hasPendingChanges = Object.keys(model.ui?.pendingPatch || {}).length > 0 || model.ui?.documentMutationPending === true;
    if (hasPendingChanges) {
      const saved = saveRequesterWorkspace(model, command);
      if (!saved.ok) return saved;
      model = saved.result;
    }
    const readiness = evaluateRequesterReadiness(model);
    if (!readiness.ok) return readiness;
    model.readiness = readiness.result;
    model.ui.validationMessages = [...readiness.result.messages];
    if (!readiness.result.complete) {
      const missingRequirement = readiness.result.requirements.find(requirement => !requirement.complete);
      model.ui.step = 2;
      model.ui.focusTarget = "a5ExtensionRequirement";
      model.ui.checklistTarget = missingRequirement?.requirementCode || "";
      return envelope(false, "WORKSPACE_NOT_READY", model, [{ field: "documents", message: "เอกสารประกอบยังไม่ครบหรือยังไม่พร้อมใช้ยื่น" }]);
    }
    if (model.requestState?.status === workflow?.STATUSES?.READY) {
      model.ui.step = 4;
      return envelope(true, "REQUESTER_WORKSPACE_READY", model);
    }
    const validated = workflow?.validateDraft(model.requestState, {
      actorId: command.actorId,
      at: command.at,
      expectedVersion: model.requestState?.version,
      documentCheck: {
        complete: readiness.result.complete,
        missingDocumentCodes: readiness.result.missingDocumentCodes
      }
    });
    if (!validated?.ok) {
      const missingFields = validated?.result?.errors?.map(error => error.field).filter(Boolean) || [];
      const fieldErrors = {};
      missingFields.forEach(fieldName => {
        const presentation = FIELD_PRESENTATIONS[fieldName];
        if (presentation) fieldErrors[fieldName] = `กรุณากรอก${presentation.label}ให้ครบถ้วน`;
      });
      const firstField = missingFields.find(fieldName => FIELD_PRESENTATIONS[fieldName]);
      model.ui.step = firstField ? 1 : 3;
      model.ui.focusTarget = firstField ? FIELD_PRESENTATIONS[firstField].controlId : "";
      model.ui.fieldErrors = fieldErrors;
      model.ui.validationMessages = firstField
        ? [fieldErrors[firstField]]
        : ["ยังตรวจความพร้อมไม่ได้ กรุณาตรวจข้อมูลแล้วลองอีกครั้ง"];
      const localizedErrors = (validated?.result?.errors || []).map(error => FIELD_PRESENTATIONS[error.field]
        ? { ...error, message: fieldErrors[error.field] }
        : error);
      return envelope(false, validated?.code || "DRAFT_VALIDATE_FAILED", model, localizedErrors);
    }
    model.requestState = validated.state;
    model.ui.step = 4;
    model.ui.dirty = true;
    model.ui.saveState = "UNSAVED";
    model.ui.validationMessages = [...readiness.result.messages];
    return envelope(true, "REQUESTER_WORKSPACE_READY", model);
  }

  function currentDocumentFailure(sourceModel) {
    const readiness = evaluateRequesterReadiness(sourceModel);
    if (!readiness.ok) return "ตรวจเอกสารประกอบปัจจุบันไม่สำเร็จ กรุณากลับไปตรวจรายการเอกสาร";
    if (!readiness.result.complete) {
      const firstIncomplete = readiness.result.requirements.find(requirement => !requirement.complete);
      return firstIncomplete ? readinessMessage(firstIncomplete) : "เอกสารประกอบยังไม่พร้อมใช้ยื่นคำขอ";
    }
    const repositoryById = new Map((sourceModel.repository || []).map(item => [item.versionId, item]));
    const selected = new Set(sourceModel.selectedVersionIds || []);
    const availabilityMessages = {
      REFERENCE_ONLY: "มีเอกสารที่เป็นข้อมูลอ้างอิงเท่านั้น จึงยังใช้ยื่นไม่ได้",
      UPLOAD_PENDING: "มีเอกสารรอจัดเก็บไฟล์จริง จึงยังใช้ยื่นไม่ได้",
      WITHDRAWN: "มีเอกสารที่ถูกถอนแล้ว จึงยังใช้ยื่นไม่ได้"
    };
    for (const versionId of selected) {
      const item = repositoryById.get(versionId);
      if (!item) return "ไม่พบเอกสารเวอร์ชันที่เลือก กรุณาเลือกรายการใหม่";
      if (item.availability !== "AVAILABLE") {
        return availabilityMessages[item.availability] || "มีเอกสารที่ยังไม่พร้อมใช้ยื่นคำขอ";
      }
    }
    const rule = rules?.getExtensionRule(sourceModel.context?.extensionType);
    for (const requirementCode of rule?.requiredDocumentCodes || []) {
      const links = Array.isArray(sourceModel.assignments?.[requirementCode]) ? sourceModel.assignments[requirementCode] : [];
      for (const sourceLink of links) {
        const link = typeof sourceLink === "string" ? { versionId: sourceLink } : sourceLink || {};
        const versionId = asText(link.versionId);
        const item = repositoryById.get(versionId);
        if (!selected.has(versionId)) return `${REQUIREMENT_LABELS[requirementCode]}: เอกสารที่ผูกไว้ไม่ได้เลือกอยู่ในชุดยื่น`;
        if (!item || item.availability !== "AVAILABLE") {
          return `${REQUIREMENT_LABELS[requirementCode]}: เอกสารที่ผูกไว้ยังไม่พร้อมใช้ยื่น`;
        }
        if (!item.isLatest && (link.oldVersionConfirmed !== true || !asText(link.oldVersionReason))) {
          return `${REQUIREMENT_LABELS[requirementCode]}: ต้องยืนยันและระบุเหตุผลการใช้เวอร์ชันเก่า`;
        }
      }
    }
    return "";
  }

  function prepareRequesterSubmission(sourceModel, sourceCommand = {}) {
    const model = withCanonicalAssignmentLinks(sourceModel);
    const payload = activeDraftPayload(model);
    const firstInvalidField = (workflow?.REQUIRED_DRAFT_FIELDS || []).find(field => {
      if (field === "requestedDays") return payload[field] === ""
        || (typeof payload[field] === "string" && payload[field].trim() === "")
        || !Number.isFinite(Number(payload[field]))
        || Number(payload[field]) <= 0;
      return !asText(payload[field]);
    });
    if (firstInvalidField) {
      const presentation = FIELD_PRESENTATIONS[firstInvalidField] || { label: "ข้อมูลคำขอ", controlId: "" };
      const message = `กรุณากรอก${presentation.label}ให้ครบถ้วน`;
      model.ui.step = 1;
      model.ui.focusTarget = presentation.controlId;
      model.ui.fieldErrors = { ...(model.ui.fieldErrors || {}), [firstInvalidField]: message };
      model.ui.validationMessages = [message];
      return envelope(false, "WORKSPACE_FIELDS_NOT_READY", model, [{ field: firstInvalidField, message }]);
    }
    const documentFailure = currentDocumentFailure(model);
    if (documentFailure) {
      return envelope(false, "CURRENT_DOCUMENTS_NOT_READY", model, [{ field: "documents", message: documentFailure }]);
    }
    if (model?.requestState?.status !== workflow?.STATUSES?.READY) {
      return envelope(false, "WORKSPACE_NOT_READY", model, [{ field: "requestState.status", message: "คำขอยังไม่ผ่านการตรวจความพร้อม" }]);
    }
    const snapshot = documents?.snapshotSelectedDocuments(
      model.repository || [],
      model.selectedVersionIds || [],
      model.assignments || {}
    );
    if (!snapshot?.ok) {
      return envelope(false, "DOCUMENT_SNAPSHOT_FAILED", model, [{ field: "documents", message: "เตรียมชุดเอกสารไม่สำเร็จ กรุณาตรวจรายการเอกสาร" }]);
    }
    const requestState = model.requestState;
    const submissionPayload = {
      requestId: requestState.id,
      revisionNo: requestState.activeRevisionNo,
      expectedVersion: requestState.version,
      actorId: asText(sourceCommand.actorId),
      at: asText(sourceCommand.at),
      snapshotPayload: {
        formId: requestState.formId,
        extensionType: requestState.extensionType,
        roundNo: requestState.roundNo,
        documents: snapshot.result
      }
    };
    return envelope(true, "SUBMISSION_PREPARED", {
      eventName: "ecmis:a5-extension-submit-prepared",
      payload: submissionPayload
    });
  }

  function activeDraftPayload(model) {
    const revision = Array.isArray(model?.requestState?.revisions)
      ? model.requestState.revisions.find(item => item?.revisionNo === model.requestState.activeRevisionNo)
      : null;
    return { ...(revision?.draftPayload || {}), ...(model?.ui?.pendingPatch || {}) };
  }

  function renderContext(model) {
    const context = model.context || {};
    const hasPendingPolicy = [context.policy?.authorityChain, context.policy?.approvalDayPolicy, context.policy?.roundLimitPolicy]
      .some(status => status === rules?.RULE_STATUSES?.PENDING_CONFIRMATION);
    return `<dl class="a5-extension-context" aria-label="บริบทคำขอขยายเวลา">
      <div><dt>เลขสำนวน</dt><dd>${escapeHtml(context.caseNumber || context.caseId)}</dd></div>
      <div><dt>กำหนดปัจจุบัน</dt><dd>${escapeHtml(context.currentDeadline || "ยังไม่ระบุ")}</dd></div>
      <div><dt>แบบคำขอ</dt><dd>${escapeHtml(formLabel(context.formId || model.requestState?.formId))}</dd></div>
      <div><dt>รอบคำขอ</dt><dd>ครั้งที่ ${escapeHtml(context.roundNo || "ยังไม่ระบุ")}</dd></div>
    </dl>${hasPendingPolicy ? '<p class="a5-extension-policy-pending"><span class="ws-status">รอยืนยันกติกา</span> รอยืนยันกติกาผู้พิจารณาและจำนวนวันที่อนุมัติ ขั้นตอนนี้บันทึกเพียงลำดับคำขอตามประวัติจริง</p>' : ""}`;
  }

  function renderStepper(model) {
    const current = Number(model.ui?.step) || 1;
    return `<ol class="a5-extension-stepper" aria-label="ขั้นตอนยื่นคำขอขยายเวลา">${STEPS.map((step, index) => {
      const number = index + 1;
      const state = number === current ? "current" : number < current ? "complete" : "upcoming";
      return `<li data-step-state="${state}"${number === current ? ' aria-current="step"' : ""}><span>${number}</span><strong>${escapeHtml(step.label)}</strong></li>`;
    }).join("")}</ol>`;
  }

  function renderRequestStep(model) {
    const payload = activeDraftPayload(model);
    const field = (name, label, placeholder) => {
      const error = asText(model.ui?.fieldErrors?.[name]);
      return `<div class="ws-field${error ? " has-error" : ""}"><label for="a5Extension-${name}">${label}</label><textarea id="a5Extension-${name}" name="${name}" data-a5-extension-field="${name}" placeholder="${escapeHtml(placeholder)}"${error ? ` aria-invalid="true" aria-describedby="a5Extension-${name}-error"` : ""}>${escapeHtml(payload[name] || "")}</textarea>${error ? `<p class="a5-extension-field-error" id="a5Extension-${name}-error">${escapeHtml(error)}</p>` : ""}</div>`;
    };
    return `<section class="a5-extension-step" data-extension-step="1">
      <header><p class="ws-kicker">ขั้นที่ 1</p><h3>ข้อมูลคำขอ</h3><p>บันทึกข้อเท็จจริงของคำขอ ระบบจะเก็บเป็นร่างและยังไม่ยื่นคำขอ</p></header>
      ${field("progress", "ความคืบหน้าปัจจุบัน", "สรุปสถานะล่าสุดของการดำเนินงาน")}
      ${field("workDone", "งานที่ดำเนินการแล้ว", "ระบุงานและพยานหลักฐานที่ดำเนินการแล้ว")}
      ${field("workRemaining", "งานที่ยังเหลือ", "ระบุงานที่ต้องดำเนินการต่อ")}
      ${field("obstacles", "ปัญหาและอุปสรรค", "หากไม่มีให้ระบุว่า ไม่มี")}
      ${field("reason", "เหตุผลและความจำเป็น", "ระบุเหตุผลที่ต้องขอขยายเวลา")}
      <div class="ws-field${model.ui?.fieldErrors?.requestedDays ? " has-error" : ""}"><label for="a5Extension-requestedDays">จำนวนวันที่ขอ</label><input id="a5Extension-requestedDays" name="requestedDays" data-a5-extension-field="requestedDays" type="number" min="1" max="60" inputmode="numeric" value="${escapeHtml(payload.requestedDays ?? "")}"${model.ui?.fieldErrors?.requestedDays ? ' aria-invalid="true" aria-describedby="a5Extension-requestedDays-error"' : ""}><small>ขอได้ 1–60 วัน ผู้มีอำนาจอนุมัติได้ไม่เกินจำนวนวันที่ขอ</small>${model.ui?.fieldErrors?.requestedDays ? `<p class="a5-extension-field-error" id="a5Extension-requestedDays-error">${escapeHtml(model.ui.fieldErrors.requestedDays)}</p>` : ""}</div>
    </section>`;
  }

  function renderRequirementChecklist(model, compact = false) {
    const readiness = evaluateRequesterReadiness(model);
    const rule = rules?.getExtensionRule(model.context?.extensionType);
    const requirements = readiness.ok ? readiness.result.requirements : (rule?.requiredDocumentCodes || []).map(requirementCode => ({ requirementCode, complete: false, assignedVersionIds: [], failures: [] }));
    return `<section class="a5-extension-checklist${compact ? " compact" : ""}" aria-label="รายการเอกสารประกอบ">
      <header><h3>${requirements.length ? `รายการเอกสารบังคับ ${requirements.length} รายการ` : "เอกสารประกอบเพิ่มเติม"}</h3><span class="ws-status${readiness.ok && readiness.result.complete ? " success" : ""}">${readiness.ok && readiness.result.complete ? "พร้อม" : "ยังไม่ครบ"}</span></header>
      ${requirements.length ? `<ol>${requirements.map(requirement => `<li data-requirement-state="${requirement.complete ? "ready" : "missing"}"><span aria-hidden="true"></span><div><strong>${escapeHtml(REQUIREMENT_LABELS[requirement.requirementCode] || requirement.requirementCode)}</strong><small>${escapeHtml(readiness.ok ? readinessMessage(requirement) : "ตรวจรายการไม่ได้ กรุณาตรวจข้อมูลเอกสาร")}</small></div></li>`).join("")}</ol>` : '<p class="ws-policy-note">ไม่มีเอกสารบังคับสำหรับแบบ ปปท. 2</p>'}
    </section>`;
  }

  function renderDocumentsStep(model) {
    const rule = rules?.getExtensionRule(model.context?.extensionType);
    const hasRequiredDocuments = Boolean(rule?.requiredDocumentCodes?.length);
    const activeRequirement = asText(model.ui?.activeRequirement) || rule?.requiredDocumentCodes?.[0] || "";
    const oldVersionPolicy = model.ui?.oldVersionPolicy?.[activeRequirement] || {};
    const olderSelected = (model.selectedVersionIds || []).map(versionId => model.repository.find(item => item.versionId === versionId)).filter(item => item && !item.isLatest);
    return `<section class="a5-extension-step" data-extension-step="2">
      <header><p class="ws-kicker">ขั้นที่ 2</p><h3>เอกสารประกอบ</h3><p>${hasRequiredDocuments ? "เลือกเวอร์ชันที่ใช้จริงและผูกกับรายการบังคับของคำขอนี้" : "เลือกหลักฐานประกอบเพิ่มเติมได้ถ้าจำเป็น"}</p></header>
      <fieldset class="a5-extension-source-choice"><legend>แหล่งเอกสาร</legend>
        <label><input type="radio" name="a5ExtensionSourceMode" value="EXISTING"${model.ui?.sourceMode !== "UPLOAD" ? " checked" : ""}> <span><strong>ใช้เอกสารเดิม</strong><small>เลือกจากคลังเอกสารของสำนวน</small></span></label>
        <label><input type="radio" name="a5ExtensionSourceMode" value="UPLOAD"${model.ui?.sourceMode === "UPLOAD" ? " checked" : ""}> <span><strong>อัปโหลดเอกสารใหม่</strong><small>ขั้นนี้เก็บเฉพาะข้อมูลไฟล์เป็นรอจัดเก็บ</small></span></label>
      </fieldset>
      <div class="a5-extension-upload${model.ui?.sourceMode === "UPLOAD" ? "" : " is-hidden"}"><label for="a5ExtensionFiles">เลือกไฟล์ได้หลายรายการ</label><input id="a5ExtensionFiles" type="file" multiple><p>ไฟล์ที่เลือกจะมีสถานะ “รอจัดเก็บไฟล์” และยังใช้ยื่นคำขอไม่ได้</p></div>
      ${hasRequiredDocuments ? `<div class="ws-field"><label for="a5ExtensionRequirement">นำเอกสารที่เลือกไปใช้กับ</label><select id="a5ExtensionRequirement">${rule.requiredDocumentCodes.map(code => `<option value="${escapeHtml(code)}"${code === activeRequirement ? " selected" : ""}>${escapeHtml(REQUIREMENT_LABELS[code] || code)}</option>`).join("")}</select></div>` : '<p class="ws-policy-note">แบบ ปปท. 2 เก็บความคืบหน้า เหตุผล และความจำเป็นในตัวแบบแล้ว เอกสารในคลังส่วนนี้เป็นหลักฐานประกอบเพิ่มเติม ไม่ใช่รายการบังคับ</p>'}
      ${olderSelected.length ? `<div class="a5-extension-old-version"><label><input id="a5ExtensionOldVersionConfirmed" type="checkbox"${oldVersionPolicy.oldVersionConfirmed ? " checked" : ""}> ยืนยันการใช้เวอร์ชันเก่า</label><label for="a5ExtensionOldVersionReason">เหตุผลที่ใช้เวอร์ชันเก่า</label><textarea id="a5ExtensionOldVersionReason" placeholder="ระบุเหตุผลที่ต้องใช้เวอร์ชันนี้แทนเวอร์ชันล่าสุด">${escapeHtml(oldVersionPolicy.oldVersionReason || "")}</textarea></div>` : ""}
      ${hasRequiredDocuments ? '<button type="button" class="ws-button secondary" data-a5-extension-action="assign-requirement">ใช้เอกสารที่เลือกกับรายการนี้</button>' : ''}
      ${renderRequirementChecklist(model, true)}
    </section>`;
  }

  function renderReadinessStep(model) {
    const messages = model.ui?.validationMessages || evaluateRequesterReadiness(model).result?.messages || [];
    return `<section class="a5-extension-step" data-extension-step="3"><header><p class="ws-kicker">ขั้นที่ 3</p><h3>ตรวจความพร้อม</h3><p>ตรวจข้อมูลคำขอและเอกสารเวอร์ชันที่เลือกก่อนยืนยัน</p></header>${renderRequirementChecklist(model)}<div class="a5-extension-validation" role="status" aria-live="polite">${messages.length ? `<ul>${messages.map(message => `<li>${escapeHtml(message)}</li>`).join("")}</ul>` : "<p>กดตรวจความพร้อมเพื่อดำเนินการต่อ</p>"}</div></section>`;
  }

  function renderPackageList(model) {
    const selected = new Set(model.selectedVersionIds || []);
    const items = (model.repository || []).filter(item => selected.has(item.versionId));
    const visibleItems = model.ui?.showAllDocuments ? items : items.slice(0, 1);
    return `<ol class="a5-extension-package-list">${visibleItems.length ? visibleItems.map(item => `<li><div><strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong><small>${escapeHtml(documentTypeLabel(item.documentType))} · ${escapeHtml(sourceLabel(item.source))}</small></div><span class="a5-extension-version-badge">เวอร์ชัน ${escapeHtml(item.version)}</span>${item.availability === "AVAILABLE" ? `<button type="button" class="ws-button ghost" data-a5-extension-action="open-document" data-version-id="${escapeHtml(item.versionId)}" data-preview-scope="PACKAGE">เปิดดู</button>` : `<span class="a5-extension-not-openable">${escapeHtml(availabilityLabel(item.availability))} · ยังไม่พร้อมเปิดดู</span>`}</li>`).join("") : "<li class=\"is-empty\">ยังไม่ได้เลือกเอกสารสำหรับชุดยื่น</li>"}</ol>${items.length > 1 && !model.ui?.showAllDocuments ? `<p class="a5-extension-package-more">มีเอกสารอีก ${items.length - 1} รายการ</p>` : ""}`;
  }

  function renderConfirmStep(model) {
    const requestStatus = model.requestState?.status;
    const submitted = [workflow?.STATUSES?.SUBMITTED, workflow?.STATUSES?.IN_REVIEW, workflow?.STATUSES?.RETURNED,
      workflow?.STATUSES?.REJECTED, workflow?.STATUSES?.APPROVED].includes(requestStatus);
    const submission = model.submission || {};
    const statusLabels = {
      SUBMITTED: "ยื่นคำขอแล้ว — รอรับตรวจ",
      IN_REVIEW: "อยู่ระหว่างพิจารณา",
      RETURNED: "ส่งกลับแก้ไข",
      REJECTED: "ไม่อนุมัติ",
      APPROVED: "อนุมัติแล้ว"
    };
    const status = submitted
      ? `<p class="ws-callout">สถานะปัจจุบัน: ${escapeHtml(statusLabels[requestStatus] || "ยื่นคำขอแล้ว")} · เมื่อ ${escapeHtml(submission.submittedAt || "ไม่ระบุเวลา")} · ฉบับที่ ${escapeHtml(submission.revisionNo || model.requestState?.activeRevisionNo || "ไม่ระบุ")}</p>`
      : '<p class="ws-callout">สถานะปัจจุบัน: ยังไม่ได้ยื่นคำขอ</p>';
    const outcome = model.requestState?.reviewOutcome || {};
    const affected = Array.isArray(outcome.affectedLinks) ? outcome.affectedLinks : [];
    const outcomeHtml = asText(outcome.reason)
      ? `<section class="a5-extension-review-outcome"><h4>${requestStatus === workflow?.STATUSES?.RETURNED ? "เหตุผลและรายการที่ต้องแก้ไข" : "เหตุผลผลพิจารณา"}</h4><p>${escapeHtml(outcome.reason)}</p>${affected.length ? `<ul>${affected.map(item => `<li>${item.field ? `ข้อมูล: ${escapeHtml(FIELD_PRESENTATIONS[item.field]?.label || "ข้อมูลคำขอ")}` : `เอกสาร: ${escapeHtml(REQUIREMENT_LABELS[item.requirementCode] || "เอกสารประกอบ")} · เวอร์ชัน ${escapeHtml(item.documentVersionId || "ไม่ระบุ")}`}</li>`).join("")}</ul>` : ""}</section>`
      : "";
    const submittedDescription = requestStatus === workflow?.STATUSES?.SUBMITTED
      ? "คำขอและเอกสารฉบับที่ยื่นถูกตรึงแล้ว และอยู่ระหว่างรอยืนยันเส้นทางผู้พิจารณา"
      : "คำขอและเอกสารฉบับที่ยื่นถูกตรึงแล้ว และแสดงผลพิจารณาจากฉบับนี้เท่านั้น";
    const signatureNote = submitted
      ? `<p class="ws-policy-note">ลงนาม Digital Signature โดย ${escapeHtml(submission.submittedBy || model.submittedSnapshot?.payload?.submission?.signature?.signerId || "ผู้รับผิดชอบสำนวน")} เมื่อ ${escapeHtml(submission.submittedAt || "ไม่ระบุเวลา")}</p>`
      : '<p class="ws-policy-note">เมื่อยื่น ระบบจะลงนาม Digital Signature ของผู้รับผิดชอบสำนวนและตรึงฉบับคำขอ</p>';
    return `<section class="a5-extension-step" data-extension-step="4"><header><p class="ws-kicker">ขั้นที่ 4</p><h3>${submitted ? "ผลการยื่นคำขอ" : "ยืนยันและยื่น"}</h3><p>${submitted ? submittedDescription : "ตรวจชุดข้อมูลสุดท้ายก่อนยื่นคำขอแบบอะตอมมิก"}</p></header>${status}${signatureNote}${outcomeHtml}${renderRequirementChecklist(model, true)}<section class="a5-extension-package-summary"><header><h4>ชุดเอกสาร${submitted ? "ที่ยื่นแล้ว" : "ที่จะยื่น"}</h4><button type="button" class="ws-button ghost" data-a5-extension-action="show-all-documents">ดูเอกสารทั้งหมด</button></header>${renderPackageList(model)}</section></section>`;
  }

  function optionList(values, current, emptyLabel, labeler = value => value) {
    return `<option value="">${emptyLabel}</option>${[...new Set(values.filter(Boolean))].sort().map(value => `<option value="${escapeHtml(value)}"${value === current ? " selected" : ""}>${escapeHtml(labeler(value))}</option>`).join("")}`;
  }

  function requirementLabelsForVersion(model, versionId) {
    const requestId = asText(model.requestState?.id);
    const revisionNo = Number(model.requestState?.activeRevisionNo);
    return [...new Set(deriveActiveAssignmentLinks(model)
      .filter(link => asText(link?.requestId) === requestId
        && Number(link?.revisionNo) === revisionNo
        && asText(link?.documentVersionId || link?.versionId) === versionId)
      .map(link => documentTypeLabel(link.requirementCode)))];
  }

  function renderRepository(model) {
    const page = getRepositoryPage(model);
    if (!page.ok) return '<div class="a5-extension-error" role="alert">แสดงคลังเอกสารไม่สำเร็จ กรุณาตรวจข้อมูลแล้วลองอีกครั้ง</div>';
    const filters = model.ui?.repositoryFilters || {};
    const rule = rules?.getExtensionRule(model.context?.extensionType);
    const visibleIds = page.result.items.map(item => item.versionId);
    const selected = new Set(model.selectedVersionIds || []);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(versionId => selected.has(versionId));
    return `<section class="a5-extension-repository" aria-label="คลังเอกสารสำนวน">
      <header><div><p class="ws-kicker">คลังเอกสาร</p><h3>เลือกเอกสารเวอร์ชันที่ต้องการ</h3></div><span>${page.result.total} รายการ</span></header>
      <div class="a5-extension-repository-filters">
        <label class="search"><span>ค้นหา</span><input type="search" id="a5ExtensionSearch" data-a5-extension-focus-key="repository-search" value="${escapeHtml(filters.search || "")}" placeholder="ชื่อ/เลขที่/เลขอ้างอิง"></label>
        <label><span>ประเภท</span><select id="a5ExtensionTypeFilter">${optionList(model.repository.map(item => item.documentType), filters.documentType, "ทุกประเภท", documentTypeLabel)}</select></label>
        <label><span>แหล่งที่มา</span><select id="a5ExtensionSourceFilter">${optionList(model.repository.map(item => item.source), filters.source, "ทุกแหล่งที่มา", sourceLabel)}</select></label>
        <label><span>สถานะ</span><select id="a5ExtensionAvailabilityFilter"><option value="">ทุกสถานะ</option>${Object.entries(AVAILABILITY_LABELS).map(([value, label]) => `<option value="${value}"${filters.availability === value ? " selected" : ""}>${label}</option>`).join("")}</select></label>
        <label><span>รายการบังคับ</span><select id="a5ExtensionRequirementFilter"><option value="">ทุกรายการบังคับ</option>${(rule?.requiredDocumentCodes || []).map(value => `<option value="${escapeHtml(value)}"${filters.requirementCode === value ? " selected" : ""}>${escapeHtml(documentTypeLabel(value))}</option>`).join("")}</select></label>
        <label><span>เรียงตาม</span><select id="a5ExtensionSortBy"><option value="name"${filters.sortBy === "name" ? " selected" : ""}>ชื่อเอกสาร</option><option value="createdAt"${filters.sortBy === "createdAt" ? " selected" : ""}>วันที่สร้าง</option><option value="documentType"${filters.sortBy === "documentType" ? " selected" : ""}>ประเภทเอกสาร</option><option value="version"${filters.sortBy === "version" ? " selected" : ""}>เวอร์ชัน</option></select></label>
        <label><span>ทิศทาง</span><select id="a5ExtensionSortDirection"><option value="asc"${filters.sortDirection !== "desc" ? " selected" : ""}>น้อยไปมาก</option><option value="desc"${filters.sortDirection === "desc" ? " selected" : ""}>มากไปน้อย</option></select></label>
        <label><span>เวอร์ชัน</span><select id="a5ExtensionLatestMode"><option value="LATEST"${filters.latestMode === "LATEST" ? " selected" : ""}>เฉพาะเวอร์ชันล่าสุด</option><option value="ALL"${filters.latestMode !== "LATEST" ? " selected" : ""}>แสดงทุกเวอร์ชัน</option></select></label>
      </div>
      <div class="a5-extension-repository-bulk"><label><input type="checkbox" data-a5-extension-select-visible data-a5-extension-focus-key="select-visible"${allVisibleSelected ? " checked" : ""}${visibleIds.length ? "" : " disabled"}> เลือกเฉพาะรายการที่มองเห็นในหน้านี้</label><span>เลือกแล้ว ${selected.size} เวอร์ชัน</span></div>
      <div class="a5-extension-repository-table"><table><thead><tr><th>เลือก</th><th>ชื่อเอกสาร</th><th>ประเภท/แหล่งที่มา</th><th>รายการบังคับ</th><th>สถานะ</th><th>เวอร์ชัน</th><th>เปิดดู</th></tr></thead><tbody>${page.result.items.length ? page.result.items.map(item => { const latest = model.repository.find(candidate => candidate.versionId === item.latestVersionId); const requirementLabels = requirementLabelsForVersion(model, item.versionId); const checkboxLabel = `เลือก ${item.name} เวอร์ชัน ${item.version}`; return `<tr data-version-id="${escapeHtml(item.versionId)}"><td><label class="a5-extension-row-checkbox"><input type="checkbox" data-a5-extension-version="${escapeHtml(item.versionId)}" data-a5-extension-focus-key="version:${escapeHtml(item.versionId)}"${selected.has(item.versionId) ? " checked" : ""}><span class="a5-extension-visually-hidden">${escapeHtml(checkboxLabel)}</span></label></td><td><strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong><small>${escapeHtml(item.documentNumber || item.reference || "ไม่ระบุเลขอ้างอิง")}</small></td><td><span>${escapeHtml(documentTypeLabel(item.documentType))}</span><small>${escapeHtml(sourceLabel(item.source))}</small></td><td data-requirement-links="${requirementLabels.length}">${requirementLabels.length ? requirementLabels.map(label => `<span class="a5-extension-requirement-tag">${escapeHtml(label)}</span>`).join("") : '<span class="a5-extension-not-assigned">ยังไม่ผูก</span>'}</td><td><span class="a5-extension-availability" data-availability="${escapeHtml(item.availability)}">${escapeHtml(availabilityLabel(item.availability))}</span></td><td><span class="a5-extension-version-badge">เวอร์ชัน ${escapeHtml(item.version)}</span>${item.isLatest ? "<small>ล่าสุด</small>" : `<small>ล่าสุดคือเวอร์ชัน ${escapeHtml(latest?.version || "ไม่ระบุ")}</small>`}</td><td>${item.availability === "AVAILABLE" ? `<button type="button" class="ws-button ghost" data-a5-extension-action="open-document" data-version-id="${escapeHtml(item.versionId)}" data-preview-scope="REPOSITORY">เปิดดู</button>` : '<span class="a5-extension-not-openable">ยังไม่พร้อมเปิดดู</span>'}</td></tr>`; }).join("") : '<tr><td colspan="7" class="is-empty">ไม่พบเอกสารตามเงื่อนไข</td></tr>'}</tbody></table></div>
      <nav class="a5-extension-pager" aria-label="เปลี่ยนหน้าคลังเอกสาร"><button type="button" class="ws-button ghost" data-a5-extension-page="${page.result.page - 1}"${page.result.page <= 1 ? " disabled" : ""}>หน้าก่อน</button><span>หน้าที่ ${page.result.page} จาก ${page.result.pageCount}</span><button type="button" class="ws-button ghost" data-a5-extension-page="${page.result.page + 1}"${page.result.page >= page.result.pageCount ? " disabled" : ""}>หน้าถัดไป</button></nav>
    </section>`;
  }

  function renderPreview(model, adapters) {
    const previewItem = (model.repository || []).find(item => item.versionId === model.ui?.previewVersionId && item.availability === "AVAILABLE");
    if (previewItem) {
      let documentHtml = '<div class="a5-extension-error" role="alert">ไม่สามารถแสดงตัวอย่างเอกสารได้</div>';
      if (typeof adapters?.renderDocument === "function") {
        try {
          documentHtml = String(adapters.renderDocument(clone(previewItem), clone(model)) || documentHtml);
        } catch {
          documentHtml = '<div class="a5-extension-error" role="alert">แสดงตัวอย่างเอกสารไม่สำเร็จ กรุณาลองอีกครั้ง</div>';
        }
      }
      return `<section class="a5-extension-preview" data-a5-extension-document-preview="${escapeHtml(previewItem.versionId)}"><header><div><p class="ws-kicker">ตัวอย่างเอกสาร</p><h3>${escapeHtml(previewItem.name)}</h3></div><nav aria-label="เลื่อนดูเอกสาร"><button type="button" class="ws-button ghost" data-a5-extension-action="preview-previous">เอกสารก่อนหน้า</button><button type="button" class="ws-button ghost" data-a5-extension-action="preview-next">เอกสารถัดไป</button></nav></header><div class="ws-paper-stage"><div class="a5-extension-document-preview">${documentHtml}</div></div></section>`;
    }
    let formHtml = '<div class="a5-extension-error" role="alert">ไม่สามารถแสดงตัวอย่างแบบคำขอได้</div>';
    if (typeof adapters?.renderForm === "function") {
      try {
        formHtml = String(adapters.renderForm(clone(model)) || formHtml);
      } catch {
        formHtml = '<div class="a5-extension-error" role="alert">แสดงตัวอย่างแบบคำขอไม่สำเร็จ กรุณาลองอีกครั้ง</div>';
      }
    }
    return `<section class="a5-extension-preview"><header><h3>ตัวอย่าง ${escapeHtml(formLabel(model.requestState?.formId))}</h3><span class="ws-status">ปรับจากข้อมูลร่าง</span></header><div class="ws-paper-stage"><div class="a5-extension-form-preview">${formHtml}</div></div></section>`;
  }

  function renderRequesterWorkspace(sourceModel, adapters = {}) {
    const model = sourceModel && typeof sourceModel === "object" ? sourceModel : {};
    const step = Math.max(1, Math.min(4, Number(model.ui?.step) || 1));
    const left = step === 1 ? renderRequestStep(model) : step === 2 ? renderDocumentsStep(model) : step === 3 ? renderReadinessStep(model) : renderConfirmStep(model);
    const requestStatus = model.requestState?.status;
    const primary = requestStatus === workflow?.STATUSES?.RETURNED
      ? '<button type="button" class="ws-button primary" data-a5-extension-action="begin-correction">สร้างฉบับแก้ไข</button>'
      : step === 1
      ? '<button type="button" class="ws-button primary" data-a5-extension-action="next-documents">บันทึกและไปเอกสารประกอบ</button>'
      : step === 2
        ? '<button type="button" class="ws-button primary" data-a5-extension-action="next-readiness">บันทึกเอกสารและตรวจความพร้อม</button>'
        : step === 3
          ? '<button type="button" class="ws-button primary" data-a5-extension-action="validate">ตรวจความพร้อมและดำเนินการต่อ</button>'
          : [workflow?.STATUSES?.SUBMITTED, workflow?.STATUSES?.IN_REVIEW, workflow?.STATUSES?.REJECTED, workflow?.STATUSES?.APPROVED].includes(requestStatus)
            ? '<button type="button" class="ws-button primary" disabled>ยื่นคำขอแล้ว</button>'
            : `<button type="button" class="ws-button primary" data-a5-extension-action="prepare-submit"${model.requestState?.status === workflow?.STATUSES?.READY ? "" : " disabled"}>ยืนยันและยื่นคำขอ</button>`;
    const right = step === 2 ? `${renderRepository(model)}${renderPreview(model, adapters)}` : step === 4 ? `<section class="a5-extension-package-viewer"><header><h3>ชุดคำขอ</h3><button type="button" class="ws-button ghost" data-a5-extension-action="show-all-documents">ดูเอกสารทั้งหมด</button></header>${renderPackageList(model)}${renderPreview(model, adapters)}</section>` : renderPreview(model, adapters);
    const saveLabels = { UNSAVED: "ยังไม่บันทึก", SAVING: "กำลังบันทึกร่าง", SAVED: model.ui?.recovered ? "กู้คืนร่างที่บันทึกแล้ว" : "บันทึกร่างแล้ว", ERROR: "บันทึกร่างไม่สำเร็จ" };
    return `<section class="a5-extension-request-workspace" data-a5-extension-workspace="true">
      <header class="a5-extension-workspace-head"><div><p class="ws-kicker">คำขอขยายเวลา</p><h2>จัดทำ ${escapeHtml(formLabel(model.requestState?.formId))}</h2></div><button type="button" class="ws-button ghost" data-a5-extension-action="close">กลับสู่งานปัจจุบัน</button></header>
      ${renderContext(model)}${renderStepper(model)}
      <div class="document-workspace a5-extension-document-workspace"><section class="ws-card ws-editor a5-extension-task-pane"><div class="ws-editor-body">${left}</div><footer class="a5-extension-sticky-actions"><span data-a5-extension-save-status="${escapeHtml(model.ui?.saveState || "UNSAVED")}" role="status" aria-live="polite">${escapeHtml(model.ui?.saveMessage || saveLabels[model.ui?.saveState] || "ยังไม่บันทึก")}</span><div>${step > 1 ? '<button type="button" class="ws-button secondary" data-a5-extension-action="previous">ย้อนกลับ</button>' : ""}${primary}</div></footer></section><aside class="ws-doc-pane a5-extension-document-pane">${right}</aside></div>
    </section>`;
  }

  function createRequesterController(sourceOptions) {
    const options = sourceOptions && typeof sourceOptions === "object" ? sourceOptions : {};
    let model = clone(options.model);
    const actorId = asText(options.actorId);
    const now = typeof options.now === "function" ? options.now : () => "";
    const persist = typeof options.persist === "function" ? options.persist : null;
    const onPrepared = typeof options.onPrepared === "function" ? options.onPrepared : null;
    const getAccessContext = typeof options.getAccessContext === "function"
      ? options.getAccessContext
      : () => ({
          actorId,
          primaryOfficerId: model.context?.ownerId,
          assignmentVersion: model.context?.assignmentVersion,
          acceptedAssignmentVersion: model.context?.acceptedAssignmentVersion,
          caseId: model.context?.caseId,
          extensionType: model.context?.extensionType,
          formId: model.context?.formId,
          roundNo: model.context?.roundNo,
          requestId: model.requestState?.id,
          revisionNo: model.requestState?.activeRevisionNo
        });
    const authorize = () => {
      let access;
      try {
        access = getAccessContext();
      } catch {
        return accessDenied(clone(model), "actorId", "ตรวจสอบบัญชีผู้ใช้งานปัจจุบันไม่สำเร็จ กรุณาโหลดหน้าใหม่");
      }
      return verifyRequesterAccess(model, access);
    };
    const persistCurrent = (candidate, persistenceContext) => {
      if (!persist) return envelope(false, "PERSISTENCE_UNAVAILABLE", clone(model), [{ field: "persist" }]);
      try {
        persist(clone(candidate), clone(persistenceContext || {}));
        return envelope(true, "REQUESTER_WORKSPACE_PERSISTED", clone(candidate));
      } catch (error) {
        const failed = clone(model);
        failed.ui.dirty = true;
        failed.ui.saveState = "ERROR";
        failed.ui.saveMessage = "บันทึกร่างไม่สำเร็จ กรุณาลองอีกครั้ง";
        return envelope(false, "PERSIST_FAILED", failed, [{ field: "persist", message: asText(error?.message) || "บันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง" }]);
      }
    };
    return Object.freeze({
      getModel() {
        return clone(model);
      },
      authorize,
      dispatch(action) {
        const authorized = authorize();
        if (!authorized.ok) return authorized;
        const updated = reduceRequesterWorkspace(model, action);
        if (updated.ok) model = updated.result;
        return updated.ok ? envelope(true, updated.code, clone(model)) : updated;
      },
      autosave() {
        const authorized = authorize();
        if (!authorized.ok) return authorized;
        const expectedRequestVersion = Number(model.requestState?.version);
        const saved = saveRequesterWorkspace(model, { actorId, at: asText(now()), access: getAccessContext() });
        if (!saved.ok) return saved;
        const persisted = persistCurrent(saved.result, {
          operation: "AUTOSAVE",
          expectedRequestVersion,
          finalRequestVersion: Number(saved.result.requestState?.version)
        });
        if (!persisted.ok) return persisted;
        model = saved.result;
        return envelope(true, "REQUESTER_WORKSPACE_AUTOSAVED", clone(model));
      },
      validate() {
        const authorized = authorize();
        if (!authorized.ok) return authorized;
        const expectedRequestVersion = Number(model.requestState?.version);
        const validated = validateRequesterWorkspace(model, { actorId, at: asText(now()), access: getAccessContext() });
        const candidate = validated.result && typeof validated.result === "object" ? clone(validated.result) : clone(model);
        candidate.ui.dirty = false;
        candidate.ui.saveState = "SAVED";
        const persisted = persistCurrent(candidate, {
          operation: "VALIDATE",
          expectedRequestVersion,
          finalRequestVersion: Number(candidate.requestState?.version)
        });
        if (!persisted.ok) return persisted;
        model = candidate;
        return validated.ok ? envelope(true, validated.code, clone(model)) : envelope(false, validated.code, clone(model), validated.errors);
      },
      prepareSubmission() {
        const authorized = authorize();
        if (!authorized.ok) return authorized;
        const prepared = prepareRequesterSubmission(model, { actorId, at: asText(now()), access: getAccessContext() });
        if (!prepared.ok) {
          if (prepared.result?.requestState) model = clone(prepared.result);
          return envelope(false, prepared.code, clone(model), prepared.errors);
        }
        const submitted = onPrepared ? onPrepared(clone(prepared.result.payload)) : null;
        if (submitted && typeof submitted === "object" && typeof submitted.ok === "boolean") {
          if (!submitted.ok) {
            const failed = submitted.result && typeof submitted.result === "object" ? submitted.result : model;
            model = clone(failed);
            model.ui.saveState = "ERROR";
            model.ui.saveMessage = submitted.errors?.[0]?.message || "ยื่นคำขอไม่สำเร็จ กรุณาตรวจข้อมูลแล้วลองอีกครั้ง";
            return envelope(false, submitted.code || "SUBMIT_FAILED", clone(model), submitted.errors || []);
          }
          if (submitted.result?.requestState) model = clone(submitted.result);
          return envelope(true, submitted.code || "REQUEST_SUBMITTED", {
            eventName: "ecmis:a5-extension-submitted",
            payload: clone(prepared.result.payload),
            model: clone(model)
          });
        }
        model.ui.prepared = true;
        model.ui.saveMessage = "เตรียมข้อมูลพร้อมแล้ว รอขั้นตอนยื่นคำขอแบบอะตอมมิก";
        return envelope(true, prepared.code, {
          eventName: prepared.result.eventName,
          payload: clone(prepared.result.payload),
          model: clone(model)
        });
      },
      beginCorrection() {
        const authorized = authorize();
        if (!authorized.ok) return authorized;
        const expectedRequestVersion = Number(model.requestState?.version);
        const corrected = workflow?.beginCorrection(model.requestState, {
          actorId,
          at: asText(now()),
          expectedVersion: expectedRequestVersion
        });
        if (!corrected?.ok) return envelope(false, corrected?.code || "CORRECTION_START_FAILED", clone(model), corrected?.result?.errors || []);
        const candidate = clone(model);
        candidate.requestState = corrected.state;
        candidate.assignmentLinks = deriveActiveAssignmentLinks(candidate);
        candidate.ui = {
          ...(candidate.ui || {}),
          step: 1,
          dirty: false,
          saveState: "SAVED",
          saveMessage: "สร้างฉบับแก้ไขแล้ว"
        };
        const persisted = persistCurrent(candidate, {
          operation: "CORRECTION",
          expectedRequestVersion,
          finalRequestVersion: Number(candidate.requestState?.version)
        });
        if (!persisted.ok) return persisted;
        model = candidate;
        return envelope(true, "CORRECTION_STARTED", clone(model));
      },
      close() {
        const authorized = authorize();
        if (!authorized.ok) return authorized;
        const expectedRequestVersion = Number(model.requestState?.version);
        let candidate = clone(model);
        if (shouldBlockWorkspaceExit(candidate)) {
          const saved = saveRequesterWorkspace(candidate, { actorId, at: asText(now()), access: getAccessContext() });
          if (!saved.ok) return saved;
          candidate = saved.result;
        }
        let liveAccess;
        try {
          liveAccess = getAccessContext();
        } catch {
          return accessDenied(clone(model), "actorId", "ตรวจสอบบัญชีผู้ใช้งานปัจจุบันไม่สำเร็จ กรุณาโหลดหน้าใหม่");
        }
        const closeAuthorized = verifyRequesterAccess(candidate, liveAccess);
        if (!closeAuthorized.ok) return accessDenied(clone(model), closeAuthorized.errors?.[0]?.field || "actorId", closeAuthorized.errors?.[0]?.message || "สิทธิ์ผู้รับผิดชอบสำนวนเปลี่ยนแปลง");
        candidate.active = false;
        candidate.ui.dirty = false;
        candidate.ui.saveState = "SAVED";
        const persisted = persistCurrent(candidate, {
          operation: "CLOSE",
          expectedRequestVersion,
          finalRequestVersion: Number(candidate.requestState?.version)
        });
        if (!persisted.ok) return persisted;
        model = candidate;
        return envelope(true, "REQUESTER_WORKSPACE_CLOSED", clone(model));
      }
    });
  }

  const mountedControllers = new WeakMap();

  function mountRequesterWorkspace(host, sourceOptions) {
    if (!host || typeof host.addEventListener !== "function") {
      return envelope(false, "INVALID_HOST", null, [{ field: "host" }]);
    }
    const options = sourceOptions && typeof sourceOptions === "object" ? sourceOptions : {};
    const controller = createRequesterController(options);
    const renderForm = typeof options.renderForm === "function" ? options.renderForm : null;
    const renderDocument = typeof options.renderDocument === "function" ? options.renderDocument : null;
    const onClose = typeof options.onClose === "function" ? options.onClose : null;
    const now = typeof options.now === "function" ? options.now : () => "";
    let autosaveTimer = null;
    let searchRenderTimer = null;
    let disposed = false;

    const updateSaveStatus = (text, state) => {
      const status = host.querySelector?.("[data-a5-extension-save-status]");
      if (!status) return;
      status.textContent = text;
      status.dataset.a5ExtensionSaveStatus = state;
    };

    const autosave = () => {
      if (disposed) return envelope(false, "WORKSPACE_DISPOSED");
      const saved = controller.autosave();
      if (saved.ok) updateSaveStatus("บันทึกร่างแล้ว", "SAVED");
      else updateSaveStatus("บันทึกร่างไม่สำเร็จ กรุณาลองอีกครั้ง", "ERROR");
      return saved;
    };

    const scheduleAutosave = () => {
      if (autosaveTimer) clearTimeout(autosaveTimer);
      updateSaveStatus("ยังไม่บันทึก", "UNSAVED");
      autosaveTimer = setTimeout(() => {
        autosaveTimer = null;
        autosave();
      }, 450);
    };

    const captureFocusState = () => {
      const active = host.ownerDocument?.activeElement || root.document?.activeElement;
      if (!active || (typeof host.contains === "function" && !host.contains(active))) return null;
      const key = asText(active.dataset?.a5ExtensionFocusKey) || asText(active.id);
      if (!key) return null;
      const state = { key };
      if (active.id === "a5ExtensionSearch" && Number.isInteger(active.selectionStart) && Number.isInteger(active.selectionEnd)) {
        state.selectionStart = active.selectionStart;
        state.selectionEnd = active.selectionEnd;
        state.selectionDirection = active.selectionDirection || "none";
      }
      return state;
    };

    const restoreFocusState = state => {
      if (!state?.key) return false;
      const candidates = host.querySelectorAll?.("[data-a5-extension-focus-key], [id]") || [];
      const control = [...candidates].find(item => asText(item.dataset?.a5ExtensionFocusKey) === state.key || asText(item.id) === state.key);
      if (!control || typeof control.focus !== "function") return false;
      control.focus();
      if (Number.isInteger(state.selectionStart) && typeof control.setSelectionRange === "function") {
        control.setSelectionRange(state.selectionStart, state.selectionEnd, state.selectionDirection);
      }
      return true;
    };

    const render = (preserveFocus = true) => {
      if (disposed) return;
      const focusState = preserveFocus ? captureFocusState() : null;
      host.innerHTML = renderRequesterWorkspace(controller.getModel(), { renderForm, renderDocument });
      if (focusState) restoreFocusState(focusState);
    };

    const focusValidationTarget = () => {
      const targetId = asText(controller.getModel().ui?.focusTarget);
      if (!targetId || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(targetId)) return false;
      const control = host.querySelector?.(`#${targetId}`);
      if (!control || typeof control.focus !== "function") return false;
      control.focus();
      control.scrollIntoView?.({ block: "center", behavior: "smooth" });
      return true;
    };

    const dispatchAndRender = action => {
      const updated = controller.dispatch(action);
      if (updated.ok) {
        render();
        scheduleAutosave();
      }
      return updated;
    };

    const commitVisibleFields = () => {
      const patch = {};
      host.querySelectorAll?.("[data-a5-extension-field]").forEach(control => {
        const name = control.dataset.a5ExtensionField;
        const rawValue = String(control.value ?? "").trim();
        patch[name] = name === "requestedDays" ? (rawValue === "" ? "" : Number(rawValue)) : rawValue;
      });
      if (!Object.keys(patch).length) return envelope(true, "NO_VISIBLE_FIELDS", controller.getModel());
      const updated = controller.dispatch({ type: "SET_FIELDS", patch });
      if (!updated.ok) updateSaveStatus(updated.errors?.[0]?.field === "patch.requestedDays"
        ? "กรุณากรอกจำนวนวันที่ขอเป็นตัวเลขมากกว่า 0"
        : "บันทึกข้อมูลคำขอไม่สำเร็จ กรุณาตรวจข้อมูล", "ERROR");
      return updated;
    };

    const beforeUnload = event => {
      if (!shouldBlockWorkspaceExit(controller.getModel())) return;
      event.preventDefault();
      event.returnValue = "";
    };
    root.addEventListener?.("beforeunload", beforeUnload);

    host.addEventListener("input", event => {
      const field = event.target.closest?.("[data-a5-extension-field]");
      if (field) {
        const rawValue = String(field.value ?? "");
        const value = field.dataset.a5ExtensionField === "requestedDays"
          ? (rawValue.trim() === "" ? "" : Number(rawValue))
          : rawValue;
        const updated = controller.dispatch({ type: "SET_FIELDS", patch: { [field.dataset.a5ExtensionField]: value } });
        if (!updated.ok) {
          const message = field.dataset.a5ExtensionField === "requestedDays"
            ? "กรุณากรอกจำนวนวันที่ขอเป็นตัวเลขมากกว่า 0"
            : "บันทึกข้อมูลคำขอไม่สำเร็จ กรุณาตรวจข้อมูล";
          field.setCustomValidity?.(message);
          field.reportValidity?.();
          updateSaveStatus(message, "ERROR");
          return;
        }
        field.setCustomValidity?.("");
        scheduleAutosave();
        return;
      }
      if (event.target.id === "a5ExtensionSearch") {
        controller.dispatch({ type: "SET_REPOSITORY_FILTERS", patch: { search: event.target.value } });
        scheduleAutosave();
        if (searchRenderTimer) clearTimeout(searchRenderTimer);
        searchRenderTimer = setTimeout(() => {
          searchRenderTimer = null;
          render();
        }, 180);
        return;
      }
      if (event.target.id === "a5ExtensionOldVersionReason") {
        const model = controller.getModel();
        const requirementCode = asText(model.ui?.activeRequirement)
          || rules?.getExtensionRule(model.context?.extensionType)?.requiredDocumentCodes?.[0]
          || "";
        controller.dispatch({
          type: "SET_OLD_VERSION_POLICY",
          requirementCode,
          oldVersionConfirmed: Boolean(host.querySelector?.("#a5ExtensionOldVersionConfirmed")?.checked),
          oldVersionReason: event.target.value
        });
        scheduleAutosave();
      }
    });

    host.addEventListener("change", event => {
      const target = event.target;
      if (target.matches?.('input[name="a5ExtensionSourceMode"]')) {
        dispatchAndRender({ type: "SET_SOURCE_MODE", sourceMode: target.value });
        return;
      }
      if (target.id === "a5ExtensionOldVersionConfirmed") {
        const model = controller.getModel();
        const requirementCode = asText(model.ui?.activeRequirement)
          || rules?.getExtensionRule(model.context?.extensionType)?.requiredDocumentCodes?.[0]
          || "";
        controller.dispatch({
          type: "SET_OLD_VERSION_POLICY",
          requirementCode,
          oldVersionConfirmed: target.checked,
          oldVersionReason: host.querySelector?.("#a5ExtensionOldVersionReason")?.value || ""
        });
        scheduleAutosave();
        return;
      }
      if (target.id === "a5ExtensionRequirement") {
        controller.dispatch({ type: "SET_ACTIVE_REQUIREMENT", requirementCode: target.value });
        return;
      }
      const filterKeys = {
        a5ExtensionTypeFilter: "documentType",
        a5ExtensionSourceFilter: "source",
        a5ExtensionAvailabilityFilter: "availability",
        a5ExtensionLatestMode: "latestMode",
        a5ExtensionRequirementFilter: "requirementCode",
        a5ExtensionSortBy: "sortBy",
        a5ExtensionSortDirection: "sortDirection"
      };
      if (filterKeys[target.id]) {
        dispatchAndRender({ type: "SET_REPOSITORY_FILTERS", patch: { [filterKeys[target.id]]: target.value } });
        return;
      }
      if (target.matches?.("[data-a5-extension-version]")) {
        controller.dispatch({
          type: "SELECT_VISIBLE",
          visibleVersionIds: [target.dataset.a5ExtensionVersion],
          action: target.checked ? "SELECT" : "UNSELECT"
        });
        render();
        scheduleAutosave();
        return;
      }
      if (target.matches?.("[data-a5-extension-select-visible]")) {
        const visibleVersionIds = [...host.querySelectorAll("[data-a5-extension-version]")].map(control => control.dataset.a5ExtensionVersion);
        dispatchAndRender({ type: "SELECT_VISIBLE", visibleVersionIds, action: target.checked ? "SELECT" : "UNSELECT" });
        return;
      }
      if (target.id === "a5ExtensionFiles") {
        const files = [...(target.files || [])];
        if (!files.length) return;
        const model = controller.getModel();
        const at = asText(now());
        const requirementCode = asText(model.ui?.activeRequirement) || rules?.getExtensionRule(model.context?.extensionType)?.requiredDocumentCodes?.[0] || "ATTACHMENT";
        const timePart = at.replace(/[^0-9]/g, "") || "pending";
        const uploads = files.map((file, index) => {
          const safeName = String(file.name || `document-${index + 1}`).replace(/[^a-zA-Z0-9ก-๙]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || `document-${index + 1}`;
          const artifactId = `${model.context.caseId}-upload-${timePart}-${index + 1}-${safeName}`;
          return {
            metadata: {
              artifactId,
              version: 1,
              name: file.name || `เอกสารอัปโหลด ${index + 1}`,
              documentType: requirementCode,
              mimeType: file.type || "ไม่ระบุ",
              size: Number(file.size) || 0,
              lastModified: Number(file.lastModified) || 0
            },
            injection: {
              versionId: `${artifactId}-v1`,
              actorId: asText(options.actorId),
              at
            }
          };
        });
        dispatchAndRender({ type: "ADD_UPLOAD_METADATA", uploads });
      }
    });

    host.addEventListener("click", event => {
      const pageButton = event.target.closest?.("[data-a5-extension-page]");
      if (pageButton && !pageButton.disabled) {
        dispatchAndRender({ type: "SET_REPOSITORY_PAGE", page: Number(pageButton.dataset.a5ExtensionPage) });
        return;
      }
      const button = event.target.closest?.("[data-a5-extension-action]");
      if (!button) return;
      const action = button.dataset.a5ExtensionAction;
      if (action === "open-document") {
        controller.dispatch({ type: "OPEN_DOCUMENT", versionId: button.dataset.versionId, scope: button.dataset.previewScope });
        render();
        return;
      }
      if (action === "preview-next" || action === "preview-previous") {
        controller.dispatch({
          type: action === "preview-next" ? "PREVIEW_NEXT" : "PREVIEW_PREVIOUS",
          scope: controller.getModel().ui?.previewScope
        });
        render();
        return;
      }
      if (action === "close") {
        const closed = controller.close();
        if (!closed.ok) {
          updateSaveStatus(closed.errors?.[0]?.message || "สิทธิ์ผู้รับผิดชอบสำนวนเปลี่ยนแปลง จึงปิดคำขอไม่ได้", "ERROR");
          return;
        }
        onClose?.(closed.result);
        return;
      }
      if (action === "previous") {
        const step = Math.max(1, Number(controller.getModel().ui?.step || 1) - 1);
        dispatchAndRender({ type: "SET_STEP", step });
        return;
      }
      if (action === "next-documents") {
        if (!commitVisibleFields().ok) return;
        if (!autosave().ok) return;
        dispatchAndRender({ type: "SET_STEP", step: 2 });
        return;
      }
      if (action === "assign-requirement") {
        const model = controller.getModel();
        const selected = model.selectedVersionIds || [];
        if (!selected.length) {
          updateSaveStatus("กรุณาเลือกเอกสารอย่างน้อยหนึ่งเวอร์ชัน", "ERROR");
          return;
        }
        const confirmOld = Boolean(host.querySelector?.("#a5ExtensionOldVersionConfirmed")?.checked);
        const oldReason = asText(host.querySelector?.("#a5ExtensionOldVersionReason")?.value);
        const versionLinks = selected.map(versionId => {
          const item = model.repository.find(documentVersion => documentVersion.versionId === versionId);
          return item && !item.isLatest
            ? { versionId, oldVersionConfirmed: confirmOld, oldVersionReason: oldReason }
            : { versionId, oldVersionConfirmed: false, oldVersionReason: "" };
        });
        const assigned = controller.dispatch({
          type: "ASSIGN_REQUIREMENT",
          requirementCode: host.querySelector?.("#a5ExtensionRequirement")?.value,
          versionLinks
        });
        if (!assigned.ok) {
          updateSaveStatus("ผูกเอกสารกับรายการบังคับไม่สำเร็จ กรุณาตรวจข้อมูล", "ERROR");
          return;
        }
        render();
        scheduleAutosave();
        return;
      }
      if (action === "next-readiness") {
        if (!autosave().ok) return;
        dispatchAndRender({ type: "SET_STEP", step: 3 });
        return;
      }
      if (action === "validate") {
        if (!commitVisibleFields().ok) return;
        if (!autosave().ok) return;
        controller.validate();
        render();
        focusValidationTarget();
        return;
      }
      if (action === "show-all-documents") {
        controller.dispatch({ type: "SET_PACKAGE_MODE", showAll: true });
        render();
        return;
      }
      if (action === "prepare-submit") {
        const prepared = controller.prepareSubmission();
        if (!prepared.ok) {
          render();
          updateSaveStatus(prepared.errors?.[0]?.message || "คำขอยังไม่พร้อม กรุณาตรวจข้อมูลและเอกสาร", "ERROR");
          focusValidationTarget();
          return;
        }
        render();
        return;
      }
      if (action === "begin-correction") {
        const corrected = controller.beginCorrection();
        if (!corrected.ok) {
          updateSaveStatus(corrected.errors?.[0]?.message || "สร้างฉบับแก้ไขไม่สำเร็จ กรุณาโหลดข้อมูลล่าสุด", "ERROR");
          return;
        }
        render();
      }
    });

    const dispose = () => {
      disposed = true;
      if (autosaveTimer) clearTimeout(autosaveTimer);
      if (searchRenderTimer) clearTimeout(searchRenderTimer);
      root.removeEventListener?.("beforeunload", beforeUnload);
      mountedControllers.delete(host);
    };

    mountedControllers.set(host, { controller, dispose });
    render(false);
    return envelope(true, "REQUESTER_WORKSPACE_MOUNTED", { controller, render, autosave, dispose });
  }

  function getMountedRequesterController(host) {
    return mountedControllers.get(host)?.controller || null;
  }

  function disposeMountedRequesterWorkspace(host) {
    const mounted = mountedControllers.get(host);
    if (!mounted) return false;
    mounted.dispose();
    return true;
  }

  const api = Object.freeze({
    STEPS,
    verifyRequesterAccess,
    createRequesterWorkspace,
    getRepositoryPage,
    reduceRequesterWorkspace,
    saveRequesterWorkspace,
    shouldBlockWorkspaceExit,
    createRequesterController,
    evaluateRequesterReadiness,
    validateRequesterWorkspace,
    prepareRequesterSubmission,
    renderRequesterWorkspace,
    mountRequesterWorkspace,
    getMountedRequesterController,
    disposeMountedRequesterWorkspace
  });
  root.ECMISActivity5ExtensionWorkspace = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
