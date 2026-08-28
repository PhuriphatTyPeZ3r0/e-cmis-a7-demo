(() => {
  const SCREEN_NAMES = ["home", "identity", "identity-review", "complaint", "review", "success", "dashboard", "search"];
  const LEGACY_SCREENS = { service: "identity", form: "complaint" };
  const FAVORITE_KEY = "ecmis-tangrat-favorite-v1";
  const DEMO_OWNER_ACCOUNT_ID = "TANGRAT-DEMO-ACCOUNT-0001";
  const DEMO_IDENTITY = Object.freeze({
    name: "นางสาวตัวอย่าง ทดสอบระบบ",
    citizenId: "DEMO-IDENTITY-MASKED-1234",
    citizenIdDisplay: "•••••••••1234",
    phone: "DEMO-PHONE-1234",
    phoneDisplay: "08X-XXX-1234",
    email: "demo.user@example.test",
    identityLast4: "1234",
  });
  const identityForm = document.getElementById("identityForm");
  const complaintForm = document.getElementById("complaintForm");
  const backButton = document.querySelector("[data-back]");
  const confirmButton = document.querySelector("[data-confirm]");
  const favoriteButton = document.querySelector("[data-favorite]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const appMenu = document.getElementById("appMenu");
  const aboutDialog = document.getElementById("aboutDialog");
  const navigationHistory = [];
  let currentScreen = "home";
  let submitting = false;
  let receipt = null;
  let selectedFiles = [];
  let pendingSubmissionId = null;
  let lastCaseTrigger = null;
  const progression = { identityValid: false, identityConsented: false, complaintValid: false };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function thaiDateTime(date = new Date()) {
    return new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeStyle: "short" }).format(date);
  }

  function getValue(form, name) {
    return String(form.elements[name]?.value || "").trim();
  }

  function checkedValue(form, name) {
    return String(form.querySelector(`[name="${name}"]:checked`)?.value || "");
  }

  function screenTitle(name) {
    return ({ home: "แจ้งเรื่องร้องเรียน ป.ป.ท.", identity: "ข้อมูลผู้แจ้ง", "identity-review": "ยืนยันข้อมูล", complaint: "รายละเอียดเรื่อง", review: "ตรวจสอบข้อมูล", success: "ส่งเรื่องสำเร็จ", dashboard: "รายการเรื่องของฉัน", search: "ค้นหารายการ" })[name] || "แจ้งเรื่องร้องเรียน ป.ป.ท.";
  }

  function showScreen(requestedName, { push = true } = {}) {
    const mappedName = LEGACY_SCREENS[requestedName] || requestedName;
    let name = SCREEN_NAMES.includes(mappedName) ? mappedName : "home";
    if (name === "identity-review" && !progression.identityValid) name = "identity";
    if (name === "complaint" && (!progression.identityValid || !progression.identityConsented)) name = "identity";
    if (name === "review" && (!progression.identityValid || !progression.identityConsented || !progression.complaintValid)) name = "identity";
    if (name === "success" && !receipt) return showScreen("home", { push: false });
    if (push && currentScreen !== name) navigationHistory.push(currentScreen);
    currentScreen = name;
    document.querySelectorAll("[data-screen]").forEach((screen) => {
      const active = screen.dataset.screen === name;
      screen.hidden = !active;
      screen.classList.toggle("is-active", active);
    });
    backButton.hidden = name === "home" || name === "success";
    document.querySelector("[data-header-title]").textContent = screenTitle(name);
    appMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    if (name === "dashboard") renderDashboard();
    if (name === "search") {
      closeCaseDetail({ restoreFocus: false });
      renderSearch(document.querySelector("[data-case-search]").value);
    }
    window.history.replaceState({}, "", `#${name}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function validateForm(form, errorTarget, message, { focus = true } = {}) {
    const controls = [...form.querySelectorAll("[required]")];
    let firstInvalid = null;
    controls.forEach((control) => {
      const invalid = control.type === "checkbox" || control.type === "radio" ? !form.querySelector(`[name="${control.name}"]:checked`) : !String(control.value).trim();
      control.setAttribute("aria-invalid", String(invalid));
      if (invalid && !firstInvalid) firstInvalid = control;
    });
    errorTarget.textContent = firstInvalid ? message : "";
    if (focus) firstInvalid?.focus();
    return !firstInvalid;
  }

  function identityRows() {
    return [
      ["ชื่อ-นามสกุล", DEMO_IDENTITY.name],
      ["เลขประจำตัวประชาชน", DEMO_IDENTITY.citizenIdDisplay],
      ["ช่องทางจากบัญชี", `${DEMO_IDENTITY.phoneDisplay} · ${DEMO_IDENTITY.email}`],
      ["โทรศัพท์สำรอง", getValue(identityForm, "alternativePhone") || "ไม่ระบุ"],
      ["ที่อยู่", getValue(identityForm, "address")],
      ["จังหวัด / อำเภอ / ตำบล", `${getValue(identityForm, "province")} / ${getValue(identityForm, "district")} / ${getValue(identityForm, "subdistrict")}`],
      ["เป็นเจ้าหน้าที่ของรัฐ", checkedValue(identityForm, "isOfficial")],
      ["เกี่ยวข้องหรือเป็นเครือข่าย", checkedValue(identityForm, "hasNetwork")],
    ];
  }

  function renderDefinitionList(target, rows) {
    target.innerHTML = rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "ไม่ระบุ")}</dd></div>`).join("");
  }

  function accusedValues() {
    return [...complaintForm.querySelectorAll('[name="accused"]')].map((input) => input.value.trim()).filter(Boolean);
  }

  function complaintRows() {
    const fileNames = selectedFiles.map((file) => file.name);
    return [
      ["ชื่อเรื่องร้องเรียน", getValue(complaintForm, "subject")],
      ["หน่วยงานที่ถูกร้อง", getValue(complaintForm, "agency")],
      ["บุคคลที่ถูกร้อง", accusedValues().join(", ") || "ไม่ระบุ"],
      ["รายละเอียด", getValue(complaintForm, "detail")],
      ["วันและเวลาเกิดเหตุ", `${getValue(complaintForm, "incidentDate")} ${getValue(complaintForm, "incidentTime")}`],
      ["สถานที่ / จังหวัด", `${getValue(complaintForm, "location")} / ${getValue(complaintForm, "incidentProvince")}`],
      ["ความประสงค์ให้ดำเนินการ", getValue(complaintForm, "requestedAction")],
      ["เอกสารประกอบ", fileNames.join(", ") || "ไม่แนบเอกสาร"],
      ["การติดต่อกลับ", complaintForm.elements.contactAllowed.checked ? "ยินยอมให้ติดต่อกลับ" : "ไม่ยินยอมให้ติดต่อกลับ"],
      ["การเปิดเผยข้อมูล", complaintForm.elements.confidential.checked ? "ขอปกปิดข้อมูลผู้ร้อง" : "ไม่ขอปกปิดข้อมูลผู้ร้อง"],
    ];
  }

  function fillReview() {
    document.querySelector("[data-review-confidential]").textContent = complaintForm.elements.confidential.checked ? "ขอปกปิดข้อมูลผู้ร้อง" : "ไม่ขอปกปิดข้อมูลผู้ร้อง";
    renderDefinitionList(document.querySelector("[data-review-identity]"), identityRows());
    renderDefinitionList(document.querySelector("[data-review-details]"), complaintRows());
  }

  function renderFileList() {
    const list = document.querySelector("[data-file-list]");
    document.querySelector("[data-file-name]").textContent = selectedFiles[0]?.name || "ยังไม่ได้เลือกไฟล์";
    list.innerHTML = selectedFiles.length
      ? selectedFiles.map((file) => `<li>${escapeHtml(file.name)} · ${(file.size / 1024 / 1024).toFixed(2)} MiB</li>`).join("")
      : "<li>ยังไม่ได้เลือกไฟล์</li>";
  }

  function createReference() {
    return `TR-${new Date().getFullYear() + 543}-${Date.now().toString().slice(-6)}`;
  }

  function ensureDemoSequenceFloor() {
    const buddhistYear = new Date().getFullYear() + 543;
    const key = sequenceStorageKey();
    const current = Number.parseInt(localStorage.getItem(key) || "0", 10);
    if (!Number.isFinite(current) || current < 5) localStorage.setItem(key, "5");
  }

  function sequenceStorageKey() {
    return `ecmis-public-sequence-${String(new Date().getFullYear() + 543).slice(-2)}`;
  }

  function createSubmissionId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `TANGRAT-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function sourcePayload(submissionId) {
    return {
      channel: "ทางรัฐ",
      ownerAccountId: DEMO_OWNER_ACCOUNT_ID,
      submissionId,
      tangrat: {
        address: getValue(identityForm, "address"),
        province: getValue(identityForm, "province"),
        district: getValue(identityForm, "district"),
        subdistrict: getValue(identityForm, "subdistrict"),
        isOfficial: checkedValue(identityForm, "isOfficial") === "ใช่",
        isPaccNetwork: checkedValue(identityForm, "hasNetwork") === "ใช่",
      },
    };
  }

  function restoreStorage(key, rawValue) {
    if (rawValue === null) localStorage.removeItem(key);
    else localStorage.setItem(key, rawValue);
  }

  function persistEcmisCase(pair, reference, submissionId) {
    const serviceNumber = pair.yearSequence;
    const buddhistYear = new Date().getFullYear() + 543;
    const sequence = serviceNumber.slice(-4).padStart(6, "0");
    const caseId = `ECMIS-${buddhistYear}-${sequence}`;
    const submittedAt = new Date().toISOString();
    const attachments = selectedFiles.map((file) => ({ name: file.name, size: file.size, type: file.type || "application/octet-stream" }));
    const payload = sourcePayload(submissionId);
    const recordsRaw = localStorage.getItem("ecmis-demo-cases");
    const workspaceRaw = localStorage.getItem("ecmis-a4-workspace-v3");
    const records = readJson("ecmis-demo-cases", []);
    const workspace = readJson("ecmis-a4-workspace-v3", {});
    const existingRecord = (Array.isArray(records) ? records : []).find((record) => record?.sourcePayload?.submissionId === submissionId && record?.sourcePayload?.ownerAccountId === DEMO_OWNER_ACCOUNT_ID);
    const existingWorkspace = Object.entries(workspace && typeof workspace === "object" ? workspace : {}).find(([, state]) => state?.sourcePayload?.submissionId === submissionId && state?.sourcePayload?.ownerAccountId === DEMO_OWNER_ACCOUNT_ID);
    if (existingRecord && existingWorkspace) {
      return { serviceNumber: String(existingRecord.trackingNumber || existingRecord.yearSequence), caseId: existingWorkspace[0], pin: String(existingRecord.pin || "") };
    }
    const metadata = {
      yearSequence: serviceNumber,
      pin: pair.pin,
      identityLast4: DEMO_IDENTITY.identityLast4,
      id4: DEMO_IDENTITY.identityLast4,
      phone: getValue(identityForm, "alternativePhone") || DEMO_IDENTITY.phone,
      pendingReference: "",
      allocationStatus: "allocated",
      trackingNumber: serviceNumber,
      subject: getValue(complaintForm, "subject"),
      attachmentCount: attachments.length,
      attachmentMetadata: attachments,
      anonymousDetected: false,
      confidentialityRequested: complaintForm.elements.confidential.checked,
      identityFieldsProvided: 4,
      channel: "ทางรัฐ",
      ownerAccountId: DEMO_OWNER_ACCOUNT_ID,
      submissionId,
      sourcePayload: payload,
      sourceReference: reference,
      submittedAt,
      internalStatus: "รอตรวจสอบความซ้ำซ้อน",
      publicStatus: "รับข้อมูลแล้ว",
    };
    const nextRecords = (Array.isArray(records) ? records : []).filter((record) => record.trackingNumber !== serviceNumber).slice(-19);
    nextRecords.push(metadata);

    const caseData = {
      id: caseId,
      trackingYear: serviceNumber,
      trackingCode: pair.pin,
      citizenId: DEMO_IDENTITY.citizenId,
      identityLast4: DEMO_IDENTITY.identityLast4,
      id4: DEMO_IDENTITY.identityLast4,
      phone: getValue(identityForm, "alternativePhone") || DEMO_IDENTITY.phone,
      anonymousDetected: false,
      confidentialityRequested: complaintForm.elements.confidential.checked,
      complainant: DEMO_IDENTITY.name,
      subject: getValue(complaintForm, "subject"),
      agency: getValue(complaintForm, "agency"),
      accused: accusedValues(),
      channel: "ทางรัฐ",
      province: getValue(complaintForm, "incidentProvince"),
      region: "ส่วนกลาง",
      received: thaiDateTime(),
      type: "ร้องเรียนและแจ้งเบาะแสการทุจริต",
      place: getValue(complaintForm, "location"),
      incidentDate: getValue(complaintForm, "incidentDate"),
      incidentTime: getValue(complaintForm, "incidentTime"),
      detail: getValue(complaintForm, "detail"),
      damage: "เอกสารไม่ระบุ",
      request: getValue(complaintForm, "requestedAction"),
      attachments: attachments.map((file) => file.name),
      attachmentMetadata: attachments,
      contactAllowed: complaintForm.elements.contactAllowed.checked,
      sourceReference: reference,
      registry: {},
    };
    workspace[caseId] = {
      caseData,
      sourcePayload: payload,
      documentData: {
        decision: "18/1ก", reasons: [], naccOtherChecked: false, naccOtherReason: "", anonymous: false,
        documentSubject: caseData.subject, officerOpinion: "", proposedRegion: "ส่วนกลาง", reviewRoute: "center",
        centerDecision: "", centerOpinion: "", centerAdditionalDetail: "", divisionOpinion: "", divisionAdditionalDetail: "",
        internalLetterNo: "", internalLetterDate: "", caseNumber: "", publicStatus: "", approvedAt: "", approvedBy: "",
        actingOfficer: "", actingOrder: "", assignedOfficer: "", backupOfficer: "", previousOfficer: "", previousBackupOfficer: "",
        adminNote: "", absenceReasonType: "", absenceNote: "", notAcceptReason: "", notAcceptOtherChecked: false,
        notAcceptOtherReason: "", naccLetterNo: "", naccLetterDate: "", naccSendMethod: "EMS", naccEms: "",
        naccSentDate: "", naccBoardNo: "", naccBoardDate: "", naccBoardNote: "", naccProofName: "", naccNotified: true,
      },
      workflow: { owner: "admin", stage: "admin-registry", status: "รอธุรการ ศรร. ออกเลขรับ ศรร. และมอบหมาย", complete: false },
      assignmentHistory: [], decisionHistory: [], anonymousHistory: [], documentVersions: [],
    };
    try {
      localStorage.setItem("ecmis-demo-cases", JSON.stringify(nextRecords));
      localStorage.setItem("ecmis-a4-workspace-v3", JSON.stringify(workspace));
    } catch (error) {
      try {
        restoreStorage("ecmis-demo-cases", recordsRaw);
        restoreStorage("ecmis-a4-workspace-v3", workspaceRaw);
      } catch {
        throw new Error("บันทึกข้อมูลไม่สำเร็จและไม่สามารถคืนสถานะเดิมได้ กรุณาหยุดส่งซ้ำและติดต่อผู้ดูแลระบบ");
      }
      throw error;
    }
    return { serviceNumber, caseId, pin: pair.pin };
  }

  function readTangratCases() {
    const records = readJson("ecmis-demo-cases", []);
    const workspace = readJson("ecmis-a4-workspace-v3", {});
    const byTracking = new Map();
    (Array.isArray(records) ? records : []).filter((record) => record?.channel === "ทางรัฐ" && record?.sourcePayload?.ownerAccountId === DEMO_OWNER_ACCOUNT_ID).forEach((record) => {
      const trackingNumber = String(record.trackingNumber || record.yearSequence || "");
      if (!trackingNumber) return;
      byTracking.set(trackingNumber, { trackingNumber, subject: record.subject || "เรื่องร้องเรียน", date: record.submittedAt || "", status: record.publicStatus || "รับข้อมูลแล้ว" });
    });
    Object.values(workspace && typeof workspace === "object" ? workspace : {}).filter((state) => state?.caseData?.channel === "ทางรัฐ" && state?.sourcePayload?.ownerAccountId === DEMO_OWNER_ACCOUNT_ID).forEach((state) => {
      const trackingNumber = String(state.caseData.trackingYear || "");
      if (!trackingNumber) return;
      const previous = byTracking.get(trackingNumber) || {};
      byTracking.set(trackingNumber, {
        trackingNumber,
        subject: state.caseData.subject || previous.subject || "เรื่องร้องเรียน",
        date: previous.date || state.caseData.received || "",
        status: state.documentData?.publicStatus || previous.status || "รับข้อมูลแล้ว",
      });
    });
    return [...byTracking.values()].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  function statusBucket(item) {
    const status = String(item.status || "");
    if (/เสร็จ|ยุติ|รับไว้ดำเนินการแล้ว/.test(status)) return "completed";
    if (/ส่ง.*(หน่วยงาน|ป\.ป\.ช\.)/.test(status)) return "forwarded";
    if (/พิจารณา|ตรวจสอบ|กลั่นกรอง/.test(status)) return "reviewing";
    if (/รับข้อมูลแล้ว/.test(status)) return "received";
    return "other";
  }

  function caseMarkup(item) {
    return `<button class="case-item" type="button" data-open-case="${escapeHtml(item.trackingNumber)}"><div class="case-item__top"><h2>${escapeHtml(item.subject)}</h2><span class="case-status" title="${escapeHtml(item.status)}">${escapeHtml(item.status)}</span></div><p>เลขรับบริการ ${escapeHtml(item.trackingNumber)}${item.date ? ` · ${escapeHtml(item.date)}` : ""}</p></button>`;
  }

  function renderDashboard() {
    const items = readTangratCases();
    const counts = { all: items.length, received: 0, reviewing: 0, forwarded: 0, completed: 0 };
    items.forEach((item) => { const bucket = statusBucket(item); if (Object.hasOwn(counts, bucket)) counts[bucket] += 1; });
    Object.entries(counts).forEach(([name, count]) => { document.querySelector(`[data-count="${name}"]`).textContent = count; });
    document.querySelector("[data-dashboard-list]").innerHTML = items.length ? items.map(caseMarkup).join("") : '<div class="empty-state">ยังไม่มีเรื่องร้องเรียนที่ยื่นผ่านทางรัฐในเครื่องนี้</div>';
  }

  function renderSearch(rawQuery = "") {
    const query = String(rawQuery).trim().toLocaleLowerCase("th-TH");
    const items = readTangratCases().filter((item) => !query || [item.trackingNumber, item.subject, item.date].join(" ").toLocaleLowerCase("th-TH").includes(query));
    document.querySelector("[data-search-results]").innerHTML = items.length ? items.map(caseMarkup).join("") : '<div class="empty-state">ไม่พบเรื่องที่ตรงกับคำค้น</div>';
  }

  function publicTimeline(item) {
    const steps = [{ label: "รับข้อมูลแล้ว", date: item.date || "", description: "สำนักงาน ป.ป.ท. ได้รับข้อมูลจากช่องทางทางรัฐแล้ว" }];
    if (item.status && item.status !== "รับข้อมูลแล้ว") steps.push({ label: item.status, date: "สถานะล่าสุด", description: "แสดงเฉพาะความคืบหน้าที่เปิดเผยต่อผู้ร้องได้" });
    return steps.map((step) => `<li><strong>${escapeHtml(step.label)}</strong>${step.date ? `<time>${escapeHtml(step.date)}</time>` : ""}<span>${escapeHtml(step.description)}</span></li>`).join("");
  }

  function openCaseDetail(trackingNumber, trigger = null) {
    const item = readTangratCases().find((candidate) => candidate.trackingNumber === String(trackingNumber));
    if (!item) return;
    if (currentScreen !== "search") showScreen("search");
    lastCaseTrigger = [...document.querySelectorAll("[data-search-results] [data-open-case]")].find((button) => button.dataset.openCase === item.trackingNumber) || trigger;
    const resultsView = document.querySelector("[data-search-results-view]");
    const detailView = document.querySelector("[data-search-detail]");
    resultsView.hidden = true;
    detailView.hidden = false;
    document.querySelector("[data-header-title]").textContent = "ติดตามเรื่องร้องเรียน";
    detailView.innerHTML = `<header class="tracking-detail__head"><button class="tracking-detail__back" type="button" data-detail-back><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>กลับผลการค้นหา</button><small>เลขรับบริการ</small><strong>${escapeHtml(item.trackingNumber)}</strong></header><div class="tracking-detail__body"><h2>${escapeHtml(item.subject)}</h2><span class="tracking-detail__status">${escapeHtml(item.status)}</span><p class="tracking-detail__notice">หน้านี้แสดงเฉพาะข้อมูลสถานะที่เปิดเผยต่อผู้ร้องได้ ไม่แสดงข้อมูลผู้ร้อง รหัสติดตาม หรือขั้นตอนภายในสำนักงาน</p><ol class="public-timeline">${publicTimeline(item)}</ol></div>`;
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function closeCaseDetail({ restoreFocus = true } = {}) {
    const resultsView = document.querySelector("[data-search-results-view]");
    const detailView = document.querySelector("[data-search-detail]");
    detailView.hidden = true;
    detailView.innerHTML = "";
    resultsView.hidden = false;
    document.querySelector("[data-header-title]").textContent = screenTitle("search");
    if (restoreFocus && lastCaseTrigger?.isConnected) lastCaseTrigger.focus();
    lastCaseTrigger = null;
  }

  identityForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm(identityForm, document.querySelector("[data-identity-error]"), "กรอกข้อมูลที่มีเครื่องหมาย * ให้ครบ")) return;
    progression.identityValid = true;
    progression.identityConsented = false;
    progression.complaintValid = false;
    renderDefinitionList(document.querySelector("[data-identity-review]"), identityRows());
    showScreen("identity-review");
  });

  function invalidateIdentity(event) {
    event.target.removeAttribute("aria-invalid");
    progression.identityValid = false;
    progression.identityConsented = false;
    progression.complaintValid = false;
  }
  identityForm.addEventListener("input", invalidateIdentity);
  identityForm.addEventListener("change", invalidateIdentity);

  document.querySelector("[data-identity-confirm]").addEventListener("click", () => {
    const consent = document.querySelector("[data-identity-consent]");
    const error = document.querySelector("[data-identity-review-error]");
    if (!validateForm(identityForm, document.querySelector("[data-identity-error]"), "กรอกข้อมูลที่มีเครื่องหมาย * ให้ครบ", { focus: false })) {
      progression.identityValid = false;
      showScreen("identity");
      validateForm(identityForm, document.querySelector("[data-identity-error]"), "กรอกข้อมูลที่มีเครื่องหมาย * ให้ครบ");
      return;
    }
    if (!consent.checked) { error.textContent = "ยืนยันความยินยอมก่อนดำเนินการต่อ"; consent.focus(); return; }
    error.textContent = "";
    progression.identityValid = true;
    progression.identityConsented = true;
    showScreen("complaint");
  });

  document.querySelector("[data-identity-consent]").addEventListener("change", (event) => {
    progression.identityConsented = progression.identityValid && event.target.checked;
    progression.complaintValid = false;
    document.querySelector("[data-identity-review-error]").textContent = "";
  });

  document.querySelector("[data-add-accused]").addEventListener("click", () => {
    const list = document.querySelector("[data-accused-list]");
    const count = list.querySelectorAll('[name="accused"]').length;
    if (count >= 5) return;
    list.insertAdjacentHTML("beforeend", `<label class="field"><span class="sr-only">บุคคลที่ถูกร้องคนที่ ${count + 1}</span><input name="accused" placeholder="ชื่อ ตำแหน่ง หรือข้อมูลที่ทราบ"></label>`);
  });

  complaintForm.elements.attachment.addEventListener("change", () => {
    const files = [...complaintForm.elements.attachment.files];
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    const error = document.querySelector("[data-form-error]");
    if (files.length > 10 || totalBytes > 50 * 1024 * 1024) {
      complaintForm.elements.attachment.value = "";
      selectedFiles = [];
      error.textContent = files.length > 10 ? "แนบเอกสารได้ไม่เกิน 10 ไฟล์" : "ขนาดเอกสารรวมต้องไม่เกิน 50 MiB";
    } else {
      selectedFiles = files.map((file) => ({ name: file.name, size: file.size, type: file.type }));
      error.textContent = "";
    }
    renderFileList();
  });

  complaintForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!progression.identityValid || !progression.identityConsented) { showScreen("identity"); return; }
    if (!validateForm(complaintForm, document.querySelector("[data-form-error]"), "กรอกข้อมูลที่มีเครื่องหมาย * และยืนยันเงื่อนไขให้ครบ")) return;
    progression.complaintValid = true;
    fillReview();
    showScreen("review");
  });

  function invalidateComplaint(event) {
    event.target.removeAttribute("aria-invalid");
    progression.complaintValid = false;
  }
  complaintForm.addEventListener("input", invalidateComplaint);
  complaintForm.addEventListener("change", invalidateComplaint);

  confirmButton.addEventListener("click", () => {
    if (submitting || receipt) return;
    const identityIsValid = validateForm(identityForm, document.querySelector("[data-identity-error]"), "กรอกข้อมูลที่มีเครื่องหมาย * ให้ครบ", { focus: false });
    if (!identityIsValid) {
      progression.identityValid = false;
      progression.identityConsented = false;
      progression.complaintValid = false;
      showScreen("identity");
      validateForm(identityForm, document.querySelector("[data-identity-error]"), "กรอกข้อมูลที่มีเครื่องหมาย * ให้ครบ");
      return;
    }
    if (!document.querySelector("[data-identity-consent]").checked) {
      progression.identityValid = true;
      progression.identityConsented = false;
      progression.complaintValid = false;
      renderDefinitionList(document.querySelector("[data-identity-review]"), identityRows());
      showScreen("identity-review");
      document.querySelector("[data-identity-review-error]").textContent = "ยืนยันความยินยอมก่อนดำเนินการต่อ";
      return;
    }
    const complaintIsValid = validateForm(complaintForm, document.querySelector("[data-form-error]"), "กรอกข้อมูลที่มีเครื่องหมาย * และยืนยันเงื่อนไขให้ครบ", { focus: false });
    if (!complaintIsValid) {
      progression.identityValid = true;
      progression.identityConsented = true;
      progression.complaintValid = false;
      showScreen("complaint");
      validateForm(complaintForm, document.querySelector("[data-form-error]"), "กรอกข้อมูลที่มีเครื่องหมาย * และยืนยันเงื่อนไขให้ครบ");
      return;
    }
    progression.identityValid = true;
    progression.identityConsented = true;
    progression.complaintValid = true;
    submitting = true;
    confirmButton.disabled = true;
    confirmButton.textContent = "กำลังส่งข้อมูล...";
    document.querySelector("[data-submit-error]").textContent = "";
    const sequenceKey = sequenceStorageKey();
    const sequenceRaw = localStorage.getItem(sequenceKey);
    try {
      pendingSubmissionId ||= createSubmissionId();
      ensureDemoSequenceFloor();
      const pair = window.ECMIS?.createTrackingNumber?.();
      if (!pair || pair.allocationStatus !== "allocated" || !pair.yearSequence || !pair.pin) throw new Error(pair?.capacityMessage || "ไม่สามารถออกเลขรับบริการได้");
      const reference = createReference();
      const persisted = persistEcmisCase(pair, reference, pendingSubmissionId);
      receipt = { ...persisted, pin: persisted.pin || pair.pin, reference };
      document.querySelector("[data-service-number]").textContent = receipt.serviceNumber;
      document.querySelector("[data-tangrat-reference]").textContent = receipt.reference;
      showScreen("success");
    } catch (error) {
      let failureMessage = error.message || "ส่งข้อมูลไม่สำเร็จ โปรดลองอีกครั้ง";
      try {
        restoreStorage(sequenceKey, sequenceRaw);
      } catch {
        failureMessage = "ส่งข้อมูลไม่สำเร็จและไม่สามารถคืนเลขลำดับเดิมได้ กรุณาหยุดส่งซ้ำและติดต่อผู้ดูแลระบบ";
      }
      document.querySelector("[data-submit-error]").textContent = failureMessage;
      confirmButton.disabled = false;
      confirmButton.textContent = "ยืนยันและส่งเรื่อง";
    } finally {
      submitting = false;
    }
  });

  document.addEventListener("click", (event) => {
    const caseTarget = event.target.closest("[data-open-case]");
    if (caseTarget) openCaseDetail(caseTarget.dataset.openCase, caseTarget);
    const detailBack = event.target.closest("[data-detail-back]");
    if (detailBack) closeCaseDetail();
    const receiptTarget = event.target.closest("[data-open-receipt]");
    if (receiptTarget && receipt?.serviceNumber) openCaseDetail(receipt.serviceNumber, receiptTarget);
    const navigationTarget = event.target.closest("[data-go]");
    if (navigationTarget) {
      if (navigationTarget.dataset.go === "identity" && ["home", "dashboard"].includes(currentScreen)) {
        receipt = null;
        pendingSubmissionId = null;
        progression.identityValid = false;
        progression.identityConsented = false;
        progression.complaintValid = false;
        document.querySelector("[data-identity-consent]").checked = false;
        confirmButton.disabled = false;
        confirmButton.textContent = "ยืนยันและส่งเรื่อง";
      }
      showScreen(navigationTarget.dataset.go);
    }
    if (!event.target.closest("[data-menu-toggle],.app-menu")) {
      appMenu.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
    }
  });

  backButton.addEventListener("click", () => {
    if (currentScreen === "search") {
      if (!document.querySelector("[data-search-detail]").hidden) closeCaseDetail();
      else {
        while (navigationHistory.at(-1) === "dashboard") navigationHistory.pop();
        showScreen("dashboard", { push: false });
      }
      return;
    }
    showScreen(navigationHistory.pop() || "home", { push: false });
  });
  menuButton.addEventListener("click", () => { const willOpen = appMenu.hidden; appMenu.hidden = !willOpen; menuButton.setAttribute("aria-expanded", String(willOpen)); });
  document.querySelector("[data-open-about]").addEventListener("click", () => { appMenu.hidden = true; menuButton.setAttribute("aria-expanded", "false"); aboutDialog.showModal(); });
  document.querySelectorAll("[data-close-about]").forEach((button) => button.addEventListener("click", () => aboutDialog.close()));
  aboutDialog.addEventListener("click", (event) => { if (event.target === aboutDialog) aboutDialog.close(); });
  document.querySelector("[data-case-search]").addEventListener("input", (event) => renderSearch(event.target.value));

  function readFavorite() {
    try { return localStorage.getItem(FAVORITE_KEY) === "true"; } catch { return false; }
  }
  function renderFavorite(active) {
    favoriteButton.setAttribute("aria-pressed", String(active));
    favoriteButton.setAttribute("aria-label", active ? "นำบริการออกจากรายการโปรด" : "เพิ่มบริการโปรด");
  }
  favoriteButton.addEventListener("click", () => {
    const next = favoriteButton.getAttribute("aria-pressed") !== "true";
    try { localStorage.setItem(FAVORITE_KEY, String(next)); } catch {}
    renderFavorite(next);
  });

  renderFavorite(readFavorite());
  renderFileList();
  const initialHash = location.hash.slice(1);
  const initial = LEGACY_SCREENS[initialHash] || initialHash;
  showScreen(SCREEN_NAMES.includes(initial) && initial !== "success" ? initial : "home", { push: false });
})();
