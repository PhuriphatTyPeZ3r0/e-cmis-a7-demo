(function initializeActivity5OutcomeDocuments(root) {
  const DOC_IDS = Object.freeze({
    NO_GROUNDS_COMPLAINANT_NOTICE: "S8_01_NO_GROUNDS_COMPLAINANT_NOTICE",
    NO_GROUNDS_ACCUSED_NOTICE: "S8_02_NO_GROUNDS_ACCUSED_NOTICE",
    NO_GROUNDS_AGENCY_NOTICE: "S8_03_NO_GROUNDS_AGENCY_NOTICE",
    NO_GROUNDS_SUSPENDED_AGENCY_NOTICE: "S8_04_NO_GROUNDS_SUSPENDED_AGENCY_NOTICE",
    DISCIPLINARY_ACTION_REQUEST: "S8_05_DISCIPLINARY_ACTION_REQUEST",
    DISCIPLINARY_CRIMINAL_ACTION_REQUEST: "S8_06_DISCIPLINARY_CRIMINAL_ACTION_REQUEST",
    CRIMINAL_PROSECUTION_REFERRAL: "S8_07_CRIMINAL_PROSECUTION_REFERRAL",
    JOINT_TEAM_REPRESENTATIVE_REQUEST: "S8_08_JOINT_TEAM_REPRESENTATIVE_REQUEST",
    JOINT_TEAM_APPOINTMENT_MEMORANDUM: "S8_09_JOINT_TEAM_APPOINTMENT_MEMORANDUM",
    JOINT_TEAM_NAMES_HANDOVER_MEMORANDUM: "S8_10_JOINT_TEAM_NAMES_HANDOVER_MEMORANDUM",
    JOINT_TEAM_MEETING_RECORD: "S8_11_JOINT_TEAM_MEETING_RECORD",
    JOINT_TEAM_RESOLUTION_NOTICE: "S8_12_JOINT_TEAM_RESOLUTION_NOTICE",
    NON_INDICTMENT_DISSENT_REFERRAL: "S8_13_NON_INDICTMENT_DISSENT_REFERRAL",
    PROSECUTOR_INCOMPLETENESS_ACTION_REPORT: "S8_40_PROSECUTOR_INCOMPLETENESS_ACTION_REPORT",
    PROSECUTOR_INCOMPLETENESS_RESULT_NOTICE: "S8_41_PROSECUTOR_INCOMPLETENESS_RESULT_NOTICE",
    DISCIPLINARY_RESOLUTION_REVIEW_MEMORANDUM: "S8_42_DISCIPLINARY_RESOLUTION_REVIEW_MEMORANDUM",
    DISCIPLINARY_RESOLUTION_REVIEW_RESULT_NOTICE: "S8_43_DISCIPLINARY_RESOLUTION_REVIEW_RESULT_NOTICE",
    ARREST_RECORD: "S8_27_ARREST_RECORD",
    CUSTODY_NOTIFICATION_RECORD: "S8_28_CUSTODY_NOTIFICATION_RECORD",
    POLICE_CUSTODY_REQUEST: "S8_29_POLICE_CUSTODY_REQUEST",
    PROSECUTOR_ARREST_TRANSFER_NOTICE: "S8_30_PROSECUTOR_ARREST_TRANSFER_NOTICE",
    ARREST_REPORT_MEMORANDUM: "S8_31_ARREST_REPORT_MEMORANDUM",
    ARREST_WARRANT_EXECUTION_REPORT: "S8_32_ARREST_WARRANT_EXECUTION_REPORT",
    DETAINEE_HOLD_REQUEST: "S8_33_DETAINEE_HOLD_REQUEST",
    IMPRISONMENT_WARRANT_REQUEST: "S8_34_IMPRISONMENT_WARRANT_REQUEST",
    PROSECUTOR_SECURE_ACCUSED_REQUEST: "S8_35_PROSECUTOR_SECURE_ACCUSED_REQUEST",
    BAIL_CONTRACT_PROPOSAL: "S8_36_BAIL_CONTRACT_PROPOSAL",
    BAIL_APPLICATION_AND_CONTRACT: "S8_37_BAIL_APPLICATION_AND_CONTRACT",
    WITNESS_SUMMONS_DELIVERY: "S8_38_WITNESS_SUMMONS_DELIVERY",
    PROSECUTOR_WITNESS_SUMMONS_REPORT: "S8_39_PROSECUTOR_WITNESS_SUMMONS_REPORT",
    SEARCH_INVESTIGATION_REPORT: "S8_44_SEARCH_INVESTIGATION_REPORT",
    SEARCH_WARRANT_PETITION: "S8_45_SEARCH_WARRANT_PETITION",
    PETITIONER_WITNESS_STATEMENT: "S8_46_PETITIONER_WITNESS_STATEMENT",
    COURT_PROCEEDING_REPORT: "S8_47_COURT_PROCEEDING_REPORT",
    COURT_SEARCH_WARRANT: "S8_48_COURT_SEARCH_WARRANT",
    SEARCH_WARRANT_ENVELOPE: "S8_49_SEARCH_WARRANT_ENVELOPE",
    SEARCH_RECORD: "S8_50_SEARCH_RECORD",
    SEARCH_WARRANT_EXECUTION_REPORT: "S8_51_SEARCH_WARRANT_EXECUTION_REPORT",
    SEIZURE_RECORD: "S8_52_SEIZURE_RECORD"
  });

  const MANIFEST = Object.freeze([
    { formId: DOC_IDS.NO_GROUNDS_COMPLAINANT_NOTICE, code: "8-01", title: "แบบหนังสือแจ้งผลกรณีคดีไม่มีมูลถึงผู้กล่าวหา", shortLabel: "แจ้งผลไม่มีมูลแก่ผู้กล่าวหา", stage: "a5-outcome", authorRole: "clerk" },
    { formId: DOC_IDS.NO_GROUNDS_ACCUSED_NOTICE, code: "8-02", title: "แบบหนังสือแจ้งผลกรณีคดีไม่มีมูลถึงผู้ถูกกล่าวหา", shortLabel: "แจ้งผลไม่มีมูลแก่ผู้ถูกกล่าวหา", stage: "a5-outcome", authorRole: "clerk" },
    { formId: DOC_IDS.NO_GROUNDS_AGENCY_NOTICE, code: "8-03", title: "แบบหนังสือแจ้งผลกรณีคดีไม่มีมูลถึงหน่วยงาน", shortLabel: "แจ้งผลไม่มีมูลแก่หน่วยงาน", stage: "a5-outcome", authorRole: "clerk" },
    { formId: DOC_IDS.NO_GROUNDS_SUSPENDED_AGENCY_NOTICE, code: "8-04", title: "แบบหนังสือแจ้งผลกรณีคดีไม่มีมูล กรณีสั่งพักราชการ", shortLabel: "แจ้งผลกรณีเคยสั่งพัก", stage: "a5-outcome", authorRole: "clerk" },
    { formId: DOC_IDS.DISCIPLINARY_ACTION_REQUEST, code: "8-05", title: "แบบหนังสือขอให้พิจารณาโทษทางวินัย", shortLabel: "ขอพิจารณาโทษทางวินัย", stage: "a5-outcome", authorRole: "clerk" },
    { formId: DOC_IDS.DISCIPLINARY_CRIMINAL_ACTION_REQUEST, code: "8-06", title: "แบบหนังสือขอให้พิจารณาโทษทางวินัยและทางอาญา", shortLabel: "ขอพิจารณาวินัยและอาญา", stage: "a5-outcome", authorRole: "clerk" },
    { formId: DOC_IDS.CRIMINAL_PROSECUTION_REFERRAL, code: "8-07", title: "แบบหนังสือขอให้ดำเนินคดีอาญา", shortLabel: "ส่งสำนวนดำเนินคดีอาญา", stage: "a5-outcome", authorRole: "clerk" },
    { formId: DOC_IDS.JOINT_TEAM_REPRESENTATIVE_REQUEST, code: "8-08", title: "แบบหนังสือแต่งตั้งคณะทำงานร่วมไต่สวนเพิ่ม", shortLabel: "ขอผู้แทนคณะทำงานร่วม", stage: "a5-prosecutor", authorRole: "clerk" },
    { formId: DOC_IDS.JOINT_TEAM_APPOINTMENT_MEMORANDUM, code: "8-09", title: "แบบบันทึกขอแต่งตั้งคณะทำงาน", shortLabel: "ขอแต่งตั้งคณะทำงาน", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.JOINT_TEAM_NAMES_HANDOVER_MEMORANDUM, code: "8-10", title: "แบบบันทึกแจ้งรายชื่อคณะทำงานร่วม", shortLabel: "แจ้งรายชื่อคณะทำงานร่วม", stage: "a5-prosecutor", authorRole: "clerk" },
    { formId: DOC_IDS.JOINT_TEAM_MEETING_RECORD, code: "8-11", title: "แบบบันทึกการประขุมคณะทำงานร่วม", shortLabel: "บันทึกการประขุมคณะทำงานร่วม", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.JOINT_TEAM_RESOLUTION_NOTICE, code: "8-12", title: "แบบหนังสือแจ้งผลการพิจารณาข้อไม่สมบูรณ์", shortLabel: "แจ้งมติคณะทำงานร่วม", stage: "a5-prosecutor", authorRole: "clerk" },
    { formId: DOC_IDS.NON_INDICTMENT_DISSENT_REFERRAL, code: "8-13", title: "แบบหนังสือส่งความเห็นแย้งให้อัยการ", shortLabel: "ส่งความเห็นแย้ง", stage: "a5-prosecutor", authorRole: "clerk" },
    { formId: DOC_IDS.PROSECUTOR_INCOMPLETENESS_ACTION_REPORT, code: "8-40", title: "แบบบันทึกรายงานตามคำสั่งอัยการแจ้งข้อไม่สมบูรณ์", shortLabel: "รายงานดำเนินการตามข้อไม่สมบูรณ์", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.PROSECUTOR_INCOMPLETENESS_RESULT_NOTICE, code: "8-41", title: "แบบหนังสือแจ้งข้อไม่สมบูรณ์", shortLabel: "แจ้งผลข้อไม่สมบูรณ์", stage: "a5-prosecutor", authorRole: "clerk" },
    { formId: DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_MEMORANDUM, code: "8-42", title: "แบบบันทึกรายงานต้นสังกัดขอทบทวนมติ", shortLabel: "รายงานขอทบทวนมติ", stage: "a5-outcome", authorRole: "investigator" },
    { formId: DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_RESULT_NOTICE, code: "8-43", title: "แบบหนังสือแจ้งขอให้ทบทวนมติ", shortLabel: "แจ้งผลทบทวนมติ", stage: "a5-outcome", authorRole: "clerk" },
    { formId: DOC_IDS.ARREST_RECORD, code: "8-27", title: "แบบบันทึกการจับกุม", shortLabel: "บันทึกการจับกุม", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.CUSTODY_NOTIFICATION_RECORD, code: "8-28", title: "แบบแจ้งการควบคุมตัวตามมาตรา 22 วรรคสอง", shortLabel: "แจ้งควบคุมตัว ม.22(2)", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.POLICE_CUSTODY_REQUEST, code: "8-29", title: "แบบหนังสือขอควบคุมตัวผู้ถูกกล่าวหาไว้จนกว่าศาลเปิดทำการ", shortLabel: "ขอควบคุมตัวที่สถานีตำรวจ", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.PROSECUTOR_ARREST_TRANSFER_NOTICE, code: "8-30", title: "แบบหนังสือแจ้งการจับกุมและส่งตัวให้พนักงานอัยการ", shortLabel: "แจ้งจับกุมและส่งตัวอัยการ", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.ARREST_REPORT_MEMORANDUM, code: "8-31", title: "แบบบันทึกรายงานการจับกุมผู้ถูกกล่าวหาตามหมายจับ", shortLabel: "รายงานการจับกุม", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.ARREST_WARRANT_EXECUTION_REPORT, code: "8-32", title: "แบบหนังสือรายงานการปฏิบัติตามหมายจับ", shortLabel: "รายงานปฏิบัติตามหมายจับ", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.DETAINEE_HOLD_REQUEST, code: "8-33", title: "แบบหนังสือขออายัดตัวผู้ต้องหา", shortLabel: "ขออายัดตัวผู้ต้องหา", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.IMPRISONMENT_WARRANT_REQUEST, code: "8-34", title: "แบบหนังสือขอหมายจำคุก/หมายขัง", shortLabel: "ขอหมายจำคุก", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.PROSECUTOR_SECURE_ACCUSED_REQUEST, code: "8-35", title: "แบบหนังสือขอให้ดำเนินการให้ได้ตัวผู้ถูกกล่าวหา", shortLabel: "ขอให้ได้ตัวผู้ถูกกล่าวหา", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.BAIL_CONTRACT_PROPOSAL, code: "8-36", title: "แบบบันทึกเสนอสัญญาประกัน", shortLabel: "เสนอสัญญาประกัน", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.BAIL_APPLICATION_AND_CONTRACT, code: "8-37", title: "แบบคำร้องและสัญญาประกัน", shortLabel: "คำร้องและสัญญาประกัน", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.WITNESS_SUMMONS_DELIVERY, code: "8-38", title: "แบบหนังสือส่งหมายเรียกพยานและบันทึกถ้อยคำยืนยันข้อเท็จจริง", shortLabel: "ส่งหมายเรียกพยาน", stage: "a5-prosecutor", authorRole: "investigator" },
    { formId: DOC_IDS.PROSECUTOR_WITNESS_SUMMONS_REPORT, code: "8-39", title: "แบบหนังสือรายงานการส่งหมายเรียกพยานและบันทึกถ้อยคำยืนยันข้อเท็จจริง", shortLabel: "รายงานส่งหมายเรียกพยาน", stage: "a5-prosecutor", authorRole: "investigator" },
    {
      formId: DOC_IDS.SEARCH_INVESTIGATION_REPORT,
      code: "8-44",
      title: "แบบบันทึกรายงานการสืบสวน",
      shortLabel: "รายงานการสืบสวนขอหมายค้น",
      stage: "a5-inquiry",
      authorRole: "investigator"
    },
    {
      formId: DOC_IDS.SEARCH_WARRANT_PETITION,
      code: "8-45",
      title: "แบบคำร้องขอหมายค้น",
      shortLabel: "คำร้องขอหมายค้น",
      stage: "a5-inquiry",
      authorRole: "investigator"
    },
    {
      formId: DOC_IDS.PETITIONER_WITNESS_STATEMENT,
      code: "8-46",
      title: "แบบคำให้การพยานผู้ร้อง",
      shortLabel: "คำให้การพยานผู้ร้อง",
      stage: "a5-inquiry",
      authorRole: "investigator"
    },
    {
      formId: DOC_IDS.COURT_PROCEEDING_REPORT,
      code: "8-47",
      title: "แบบรายงานกระบวนพิจารณา",
      shortLabel: "รายงานกระบวนพิจารณา",
      stage: "a5-inquiry",
      authorRole: "investigator"
    },
    {
      formId: DOC_IDS.COURT_SEARCH_WARRANT,
      code: "8-48",
      title: "แบบหมายค้น",
      shortLabel: "หมายค้น",
      stage: "a5-inquiry",
      authorRole: "investigator"
    },
    {
      formId: DOC_IDS.SEARCH_WARRANT_ENVELOPE,
      code: "8-49",
      title: "แบบผนึกซองขอหมายค้น",
      shortLabel: "ผนึกซองขอหมายค้น",
      stage: "a5-inquiry",
      authorRole: "investigator"
    },
    {
      formId: DOC_IDS.SEARCH_RECORD,
      code: "8-50",
      title: "แบบบันทึกการตรวจค้น",
      shortLabel: "บันทึกการตรวจค้น",
      stage: "a5-inquiry",
      authorRole: "investigator"
    },
    {
      formId: DOC_IDS.SEARCH_WARRANT_EXECUTION_REPORT,
      code: "8-51",
      title: "แบบหนังสือรายงานการปฏิบัติตามหมายค้น",
      shortLabel: "รายงานปฏิบัติตามหมายค้น",
      stage: "a5-inquiry",
      authorRole: "investigator"
    },
    {
      formId: DOC_IDS.SEIZURE_RECORD,
      code: "8-52",
      title: "แบบบันทึกการตรวจยึด-อายัด",
      shortLabel: "บันทึกตรวจยึด/อายัด",
      stage: "a5-inquiry",
      authorRole: "investigator"
    }
  ]);

  const ACTIONS = Object.freeze(
    MANIFEST.flatMap(item => [`outcome-save:${item.formId}`, `outcome-submit:${item.formId}`])
  );

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

  const text = value => typeof value === "string" ? value.trim() : "";
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const copy = value => JSON.parse(JSON.stringify(value ?? {}));

  const dot = (value, placeholder = "........................................") => {
    const filled = text(value);
    return filled ? escapeHtml(filled) : `<span class="a5-dotline">${placeholder}</span>`;
  };

  const BATCH7_FORM_IDS = new Set([
    DOC_IDS.NO_GROUNDS_COMPLAINANT_NOTICE, DOC_IDS.NO_GROUNDS_ACCUSED_NOTICE,
    DOC_IDS.NO_GROUNDS_AGENCY_NOTICE, DOC_IDS.NO_GROUNDS_SUSPENDED_AGENCY_NOTICE,
    DOC_IDS.DISCIPLINARY_ACTION_REQUEST, DOC_IDS.DISCIPLINARY_CRIMINAL_ACTION_REQUEST,
    DOC_IDS.CRIMINAL_PROSECUTION_REFERRAL, DOC_IDS.JOINT_TEAM_REPRESENTATIVE_REQUEST,
    DOC_IDS.JOINT_TEAM_APPOINTMENT_MEMORANDUM, DOC_IDS.JOINT_TEAM_NAMES_HANDOVER_MEMORANDUM,
    DOC_IDS.JOINT_TEAM_MEETING_RECORD, DOC_IDS.JOINT_TEAM_RESOLUTION_NOTICE,
    DOC_IDS.NON_INDICTMENT_DISSENT_REFERRAL, DOC_IDS.PROSECUTOR_INCOMPLETENESS_ACTION_REPORT,
    DOC_IDS.PROSECUTOR_INCOMPLETENESS_RESULT_NOTICE, DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_MEMORANDUM,
    DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_RESULT_NOTICE
  ]);

  function batch7ConfirmedDefaults(state = {}) {
    const records = Array.isArray(state.a5DocumentStore?.records) ? state.a5DocumentStore.records : [];
    const report644 = records
      .filter(record => record?.documentId === "FORM_7_REPORT_644" && record?.status === "SUBMITTED")
      .sort((left, right) => Number(right.revisionNo || 0) - Number(left.revisionNo || 0))[0];
    const report = object(report644?.submittedSnapshot || report644?.payload);
    const accusedRows = Array.isArray(report.accusedPersons) ? report.accusedPersons : [];
    const offenceRows = Array.isArray(report.offenceConclusions) ? report.offenceConclusions : [];
    const accusedSummary = accusedRows.map(row => [text(row?.name), text(row?.position), text(row?.agency)].filter(Boolean).join(" ")).filter(Boolean).join(", ");
    const canonicalRows = offenceRows.filter(row => row?.dropped !== true);
    const unique = items => [...new Set(items.filter(Boolean))];
    const criminalCharges = unique(canonicalRows.flatMap(row => Array.isArray(row?.criminalCharges) ? row.criminalCharges : []).map(item => [text(item?.lawName), text(item?.section)].filter(Boolean).join(" ")));
    const disciplinaryCharges = unique(canonicalRows.flatMap(row => Array.isArray(row?.disciplinaryCharges) ? row.disciplinaryCharges : []).map(item => text(item?.basis)));
    const otherRouting = unique(canonicalRows.map(row => [text(row?.otherRouting?.type), text(row?.otherRouting?.detail)].filter(Boolean).join(" ")));
    const legacyCharges = unique(canonicalRows.map(row => text(row?.offence || row?.charge || row?.conclusion || row?.criminalCharge)));
    const charge = unique([...criminalCharges, ...disciplinaryCharges, ...otherRouting]).join("; ") || legacyCharges.join("; ");
    const criminalOffence = criminalCharges.join("; ") || legacyCharges.join("; ");
    const disciplinaryOffence = disciplinaryCharges.join("; ") || legacyCharges.join("; ");
    const board = object(state.inquiry?.committee644);
    const prosecutor = object(state.inquiry?.prosecutor);
    return {
      caseRefNo: text(state.caseData?.trackingCode),
      caseSubject: text(state.caseData?.subject),
      ownerUnit: text(state.inquiry?.intake?.unit),
      officerName: text(state.assignment?.primaryOfficerName),
      inquiryCaseNo: text(report.reportMeta?.matterNo) || text(state.caseData?.trackingCode),
      inquiryReportCaseNo: text(report.reportMeta?.matterNo) || text(state.caseData?.trackingCode),
      accusedSummary,
      accusedName: accusedSummary,
      charge,
      criminalOffence,
      disciplinaryOffence,
      boardMeetingNo: text(board.mtiNo),
      boardMeetingDate: text(board.mtiDate),
      boardResolution: text(board.result || board.note),
      responsibleProsecutor: text(state.inquiry?.outcome?.prosecutor),
      prosecutorOffice: text(state.inquiry?.outcome?.prosecutor),
      deficiencySummary: text(prosecutor.orderDetail),
      caseFromNaccM62: state.inquiry?.intake?.m62?.flag === true,
      caseMisconduct: false
    };
  }

  function validateRequired(formId, fields = {}) {
    const required = {
      [DOC_IDS.NO_GROUNDS_COMPLAINANT_NOTICE]: ["letterNo", "issuedDate", "signerName", "complainantName", "accusedSummary", "charge", "inquiryBody", "boardMeetingNo", "boardMeetingDate", "boardResolution"],
      [DOC_IDS.NO_GROUNDS_ACCUSED_NOTICE]: ["letterNo", "issuedDate", "signerName", "accusedRecipientName", "criminalBasis", "inquiryBody", "boardMeetingNo", "boardMeetingDate", "boardResolution"],
      [DOC_IDS.NO_GROUNDS_AGENCY_NOTICE]: ["letterNo", "issuedDate", "signerName", "agencyHeadName", "accusedSummary", "charge", "inquiryBody", "boardMeetingNo", "boardMeetingDate", "boardResolution"],
      [DOC_IDS.NO_GROUNDS_SUSPENDED_AGENCY_NOTICE]: ["letterNo", "issuedDate", "signerName", "agencyHeadName", "accusedSummary", "charge", "inquiryBody", "boardMeetingNo", "boardMeetingDate", "boardResolution", "suspensionLetterNo", "suspensionLetterDate", "suspensionFormRef"],
      [DOC_IDS.DISCIPLINARY_ACTION_REQUEST]: ["letterNo", "issuedDate", "signerName", "recipientAuthority", "accusedSummary", "charge", "boardMeetingNo", "boardMeetingDate", "boardResolution", "inquiryReportCaseNo", "inquiryReportPages", "resolutionPages", "disciplinedAccused", "agencyName"],
      [DOC_IDS.DISCIPLINARY_CRIMINAL_ACTION_REQUEST]: ["letterNo", "issuedDate", "signerName", "recipientAuthority", "accusedSummary", "charge", "boardMeetingNo", "boardMeetingDate", "boardResolution", "inquiryReportCaseNo", "inquiryReportPages", "resolutionPages", "disciplinedAccused", "agencyName"],
      [DOC_IDS.CRIMINAL_PROSECUTION_REFERRAL]: ["letterNo", "issuedDate", "signerName", "recipientArea", "inquiryCaseNo", "originalVolumeDescription", "copyCount", "electronicMediaCount", "accusedSummary", "charge", "boardMeetingNo", "boardMeetingDate", "boardResolution"],
      [DOC_IDS.JOINT_TEAM_REPRESENTATIVE_REQUEST]: ["letterNo", "issuedDate", "signerName", "inquiryCaseNo", "responsibleProsecutor", "incompletenessLetterNo", "attachmentPages", "accusedSummary", "charge", "representativeCount"],
      [DOC_IDS.JOINT_TEAM_APPOINTMENT_MEMORANDUM]: ["ownerUnit", "memoNo", "memoDate", "boardMeetingNo", "boardMeetingDate", "prosecutionLetterNo", "prosecutionLetterDate", "prosecutedAccused", "criminalOffence", "deficiencyLetterNo", "deficiencyLetterDate", "deficiencySummary", "secondBoardMeetingNo", "secondBoardMeetingDate", "secondBoardResolution", "reference1", "reference2", "reference3", "reference4", "reference5", "reference6", "regulationClause", "representativeName1", "representativePosition1", "representativeName2", "representativePosition2", "representativeName3", "representativePosition3", "signerName"],
      [DOC_IDS.JOINT_TEAM_NAMES_HANDOVER_MEMORANDUM]: ["ownerUnit", "memoNo", "memoDate", "recipientDirector", "deficiencyLetterNo", "deficiencyLetterDate", "accusedName", "prosecutorRepresentativeCount", "paccRepresentativeCount", "representativeName1", "representativePosition1", "representativeName2", "representativePosition2", "representativeName3", "representativePosition3", "fileCount", "pageCount", "signerName"],
      [DOC_IDS.JOINT_TEAM_MEETING_RECORD]: ["meetingNo", "meetingYear", "meetingDate", "meetingPlace", "attendee1", "attendee2", "attendee3", "attendee4", "attendee5", "startTime", "endTime", "chairName", "secretaryName", "presenterName", "prosecutionLetterNo", "prosecutionLetterDate", "accusedName", "charge", "deficiencyIssue1", "prosecutorRepresentativeName1", "prosecutorRepresentativePosition1", "prosecutorRepresentativeName2", "prosecutorRepresentativePosition2", "prosecutorRepresentativeName3", "prosecutorRepresentativePosition3", "paccRepresentativeName1", "paccRepresentativePosition1", "paccRepresentativeName2", "paccRepresentativePosition2", "paccRepresentativeName3", "paccRepresentativePosition3", "resolution", "prosecutorSigner1", "prosecutorSigner2", "prosecutorSigner3", "paccSigner1", "paccSigner2", "paccSigner3"],
      [DOC_IDS.JOINT_TEAM_RESOLUTION_NOTICE]: ["letterNo", "issuedDate", "signerName", "prosecutorLetterNo", "prosecutorLetterDate", "accusedName", "attachmentPages", "meetingNo", "meetingDate", "resolution"],
      [DOC_IDS.NON_INDICTMENT_DISSENT_REFERRAL]: ["letterNo", "issuedDate", "signerName", "inquiryCaseNo", "accusedSummary", "charge", "prosecutorOffice", "boardMeetingNo", "boardMeetingDate", "dissentReason1"],
      [DOC_IDS.PROSECUTOR_INCOMPLETENESS_ACTION_REPORT]: ["ownerUnit", "memoNo", "memoDate", "boardMeetingNo", "boardMeetingDate", "accusedName", "criminalOffence", "prosecutionLetterNo", "prosecutionLetterDate", "deficiencyLetterNo", "deficiencyLetterDate", "resultLetterNo", "resultLetterDate", "deficiencySummary", "proposerName"],
      [DOC_IDS.PROSECUTOR_INCOMPLETENESS_RESULT_NOTICE]: ["letterNo", "issuedDate", "signerName", "recipientProsecutor", "prosecutorOffice", "referenceLetterNo", "referenceLetterDate", "attachmentDescription1", "attachmentDescription2", "deficiencyFacts", "destinationOffice", "additionalInquiryResult"],
      [DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_MEMORANDUM]: ["ownerUnit", "memoNo", "memoDate", "boardMeetingNo", "boardMeetingDate", "accusedName", "disciplinaryOffence", "disciplineLetterNo", "disciplineLetterDate", "reviewRequestLetterNo", "reviewRequestDate", "agencyName", "reviewReason", "withinThirtyDaysAssessment", "newEvidenceAssessment", "proposal", "proposerName"],
      [DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_RESULT_NOTICE]: ["letterNo", "issuedDate", "signerName", "agencyHeadName", "agencyName", "referenceLetterNo", "referenceLetterDate", "requestFacts", "boardMeetingNo", "boardMeetingDate", "boardResolution"],
      [DOC_IDS.ARREST_RECORD]: ["recordedAt", "recordedDate", "arrestDate", "arrestPlace", "arrestedName", "warrantCourt", "warrantNo", "charge", "circumstances", "arrestingOfficerName"],
      [DOC_IDS.CUSTODY_NOTIFICATION_RECORD]: ["detaineeFirstName", "detaineeLastName", "detaineeAge", "arrestDate", "arrestPlace", "arrestCircumstances", "custodyPlace", "responsibleOfficerName", "notifyingOfficerName"],
      [DOC_IDS.POLICE_CUSTODY_REQUEST]: ["letterNo", "issuedDate", "policeStation", "accusedName", "citizenId", "warrantCourt", "warrantNo", "charge", "arrestingUnit", "prosecutorOffice", "custodyRoom", "signerName"],
      [DOC_IDS.PROSECUTOR_ARREST_TRANSFER_NOTICE]: ["letterNo", "issuedDate", "prosecutorOffice", "warrantCourt", "warrantNo", "accusedName", "criminalSection", "policeStation", "arrestDate", "signerName"],
      [DOC_IDS.ARREST_REPORT_MEMORANDUM]: ["ownerUnit", "letterNo", "issuedDate", "sourceUnit", "warrantCourt", "warrantDate", "arrestingUnit", "filingDate", "signerName"],
      [DOC_IDS.ARREST_WARRANT_EXECUTION_REPORT]: ["letterNo", "issuedDate", "courtName", "warrantCourt", "warrantNo", "accusedName", "charge", "arrestDate", "prosecutorOffice", "signerName"],
      [DOC_IDS.DETAINEE_HOLD_REQUEST]: ["letterNo", "issuedDate", "prisonName", "warrantCourt", "warrantNo", "suspectName", "charge", "deliveryPlace", "blackCaseNo", "redCaseNo", "signerName"],
      [DOC_IDS.IMPRISONMENT_WARRANT_REQUEST]: ["letterNo", "issuedDate", "prisonName", "prosecutorLetterNo", "prosecutorLetterDate", "accusedName", "lawAndSection", "courtName", "filingDateTime", "citizenId", "destinationProsecutorOffice", "signerName"],
      [DOC_IDS.PROSECUTOR_SECURE_ACCUSED_REQUEST]: ["letterNo", "issuedDate", "prosecutorName", "referenceLetterNo", "referenceLetterDate", "prisonName", "accusedName", "lawAndSection", "courtName", "filingDateTime", "blackCaseNo", "redCaseNo", "signerName"],
      [DOC_IDS.BAIL_CONTRACT_PROPOSAL]: ["authorityName", "arrestDate", "dailyRecordNo", "arrestedName", "charge", "incidentDetails", "bailApplicantName", "proposerName"],
      [DOC_IDS.BAIL_APPLICATION_AND_CONTRACT]: ["applicationPlace", "applicationDate", "applicantName", "insuredName", "charge", "contractPlace", "contractDate", "guaranteeAmountNumber", "guaranteeAmountText", "collateral", "guarantorName"],
      [DOC_IDS.WITNESS_SUMMONS_DELIVERY]: ["letterNo", "issuedDate", "witnessName", "statementDate", "investigationNo", "caseFacts", "courtName", "blackCaseNo", "hearingDate", "returnOffice", "returnWithinDays", "signerName"],
      [DOC_IDS.PROSECUTOR_WITNESS_SUMMONS_REPORT]: ["letterNo", "issuedDate", "prosecutorName", "referenceLetterNo", "referenceLetterDate", "witnessName1", "prosecutorOffice", "witnessCount", "defendantName", "courtName", "blackCaseNo", "deliveryResult", "signerName"],
      [DOC_IDS.SEARCH_INVESTIGATION_REPORT]: ["ownerUnit", "letterNo", "issuedDate", "investigationNo", "receivedDate", "complainantName", "accusedName", "allegationSummary", "inquiryBody", "appointmentOrder", "investigationFacts", "competentCourt", "signerName"],
      [DOC_IDS.SEARCH_WARRANT_PETITION]: ["courtName", "petitionDate", "petitionerName", "petitionerPosition", "petitionerAge", "workplace", "searchLocation", "locationOwner", "searchCircumstances", "searchPurpose", "searchOfficer", "searchDate", "searchTime"],
      [DOC_IDS.PETITIONER_WITNESS_STATEMENT]: ["petitionNo", "courtName", "statementDate", "petitionerName", "petitionerPosition", "birthDate", "age", "agencyAddress", "investigationFacts", "searchLocation"],
      [DOC_IDS.COURT_PROCEEDING_REPORT]: ["petitionNo", "warrantNo", "courtName", "proceedingDate", "petitionerName", "petitionerPosition", "hearingTime", "witnessCount", "courtOrderReason"],
      [DOC_IDS.COURT_SEARCH_WARRANT]: ["courtName", "issuedDate", "petitionerName", "petitionerPosition", "searchLocation", "searchTarget", "leadOfficer", "searchDate", "startedAt", "endedAt"],
      [DOC_IDS.SEARCH_WARRANT_ENVELOPE]: ["courtName", "unitName", "criminalCaseNo", "charge", "limitationYears", "limitationDate", "petitionerName"],
      [DOC_IDS.SEARCH_RECORD]: ["writtenAt", "recordedDate", "startedAt", "searchOfficers", "searchLocation", "locationOwner", "searchReason", "searchResult", "endedAt"],
      [DOC_IDS.SEARCH_WARRANT_EXECUTION_REPORT]: ["letterNo", "issuedDate", "courtName", "warrantNo", "warrantDate", "houseNo", "searchDate", "startedAt", "endedAt", "searchResult"],
      [DOC_IDS.SEIZURE_RECORD]: ["writtenAt", "recordedDate", "officers", "seizedItems", "circumstances", "seizedFrom", "searchLocation", "searchPeriod"]
    };
    const missing = (required[formId] || []).filter(field => !text(fields[field]));
    if (formId === DOC_IDS.SEARCH_INVESTIGATION_REPORT && Boolean(fields.intakeBasis18_1) === Boolean(fields.intakeBasis18_4)) {
      missing.push("intakeBasis");
    }
    if (formId === DOC_IDS.ARREST_RECORD) {
      if (Boolean(fields.declinesRight4) === Boolean(fields.requestsRight4)) missing.push("right4Choice");
      if (Boolean(fields.noForceMajeure) === Boolean(fields.forceMajeure)) missing.push("forceMajeureChoice");
      if (fields.forceMajeure === true && !text(fields.forceMajeureReason)) missing.push("forceMajeureReason");
    }
    if (formId === DOC_IDS.CUSTODY_NOTIFICATION_RECORD) {
      const basisCount = [fields.custodyBasisFlagrant, fields.custodyBasisWarrant, fields.custodyBasisOrder, fields.custodyBasisOther].filter(Boolean).length;
      if (basisCount !== 1) missing.push("custodyBasis");
      if (fields.custodyBasisFlagrant === true && !text(fields.flagrantOffenceCharge)) missing.push("flagrantOffenceCharge");
      if (fields.custodyBasisWarrant === true) {
        for (const field of ["warrantNo", "warrantCourt", "warrantDate"]) if (!text(fields[field])) missing.push(field);
      }
      if (fields.custodyBasisOrder === true) {
        for (const field of ["custodyOrderText", "custodyOrderReason"]) if (!text(fields[field])) missing.push(field);
      }
      if (fields.custodyBasisOther === true && !text(fields.otherLegalAuthority)) missing.push("otherLegalAuthority");
    }
    if (formId === DOC_IDS.BAIL_CONTRACT_PROPOSAL && Boolean(fields.decisionApprove) === Boolean(fields.decisionDeny)) {
      missing.push("bailDecision");
    }
    if (formId === DOC_IDS.NO_GROUNDS_ACCUSED_NOTICE && fields.hasAllegationNotice === true) {
      for (const field of ["noticeLetterNo", "noticeDate", "noticeType"]) if (!text(fields[field])) missing.push(field);
    }
    if (formId === DOC_IDS.CRIMINAL_PROSECUTION_REFERRAL
      && Boolean(fields.recipientAttorneyDepartment) === Boolean(fields.recipientProvincialProsecutor)) missing.push("recipientType");
    if (formId === DOC_IDS.NON_INDICTMENT_DISSENT_REFERRAL
      && fields.partialNoIndict === true && !text(fields.nonIndictedCharges)) missing.push("nonIndictedCharges");
    if ([DOC_IDS.PROSECUTOR_INCOMPLETENESS_ACTION_REPORT, DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_MEMORANDUM].includes(formId)
      && Boolean(fields.caseFromNaccM62) === Boolean(fields.caseMisconduct)) missing.push("caseSource");
    return missing;
  }

  function defaultPayload(formId, state = {}) {
    const common = {
      caseRefNo: text(state.caseData?.trackingCode),
      caseSubject: text(state.caseData?.subject),
      ownerUnit: text(state.inquiry?.intake?.unit)
    };
    if (BATCH7_FORM_IDS.has(formId)) {
      return {
        ...batch7ConfirmedDefaults(state),
        phone: "", fax: "", letterNo: "", issuedDate: "", signerName: "", signerPosition: "",
        complainantName: "", complaintLetterDate: "", accusedRecipientName: "", criminalBasis: "",
        inquiryBody: "", hasAllegationNotice: false, noticeLetterNo: "", noticeDate: "", noticeType: "",
        agencyHeadName: "", suspensionLetterNo: "", suspensionLetterDate: "", suspensionFormRef: "",
        recipientAuthority: "", inquiryReportPages: "", resolutionPages: "", disciplinedAccused: "", agencyName: "",
        recipientAttorneyDepartment: false, recipientProvincialProsecutor: false, recipientArea: "",
        originalVolumeDescription: "", copyCount: "", electronicMediaCount: "", representativeCount: "",
        incompletenessLetterNo: "", attachmentPages: "", memoNo: "", memoDate: "",
        prosecutionLetterNo: "", prosecutionLetterDate: "", prosecutedAccused: "", deficiencyLetterNo: "",
        deficiencyLetterDate: "", secondBoardMeetingNo: "", secondBoardMeetingDate: "", secondBoardResolution: "",
        reference1: "", reference2: "", reference3: "", reference4: "", reference5: "", reference6: "",
        regulationClause: "", representativeName1: "", representativePosition1: "", representativeName2: "",
        representativePosition2: "", representativeName3: "", representativePosition3: "", recipientDirector: "",
        prosecutorRepresentativeCount: "", paccRepresentativeCount: "", fileCount: "", pageCount: "",
        meetingNo: "", meetingYear: "", meetingDate: "", meetingPlace: "", attendee1: "", attendee2: "",
        attendee3: "", attendee4: "", attendee5: "", absent1: "", absent2: "", startTime: "", endTime: "",
        chairName: "", secretaryName: "", presenterName: "", deficiencyIssue1: "", deficiencyIssue2: "", resolution: "",
        prosecutorRepresentativeName1: "", prosecutorRepresentativePosition1: "", prosecutorRepresentativeName2: "",
        prosecutorRepresentativePosition2: "", prosecutorRepresentativeName3: "", prosecutorRepresentativePosition3: "",
        paccRepresentativeName1: "", paccRepresentativePosition1: "", paccRepresentativeName2: "",
        paccRepresentativePosition2: "", paccRepresentativeName3: "", paccRepresentativePosition3: "",
        prosecutorSigner1: "", prosecutorSigner2: "", prosecutorSigner3: "", paccSigner1: "", paccSigner2: "", paccSigner3: "",
        partialNoIndict: false, nonIndictedCharges: "",
        dissentReason1: "", dissentReason2: "", resultLetterNo: "", resultLetterDate: "", proposerName: "",
        proposerPosition: "", recipientProsecutor: "", referenceLetterNo: "", referenceLetterDate: "",
        attachmentDescription1: "", attachmentDescription2: "", deficiencyFacts: "", destinationOffice: "",
        additionalInquiryResult: "", disciplineLetterNo: "", disciplineLetterDate: "", reviewRequestLetterNo: "",
        reviewRequestDate: "", reviewReason: "", withinThirtyDaysAssessment: "", newEvidenceAssessment: "", proposal: "",
        requestFacts: "", supervisorOpinion: "", supervisorName: "", supervisorPosition: "", directorOpinion: "",
        directorName: "", directorPosition: "", executiveOpinion: "", executiveName: "", executivePosition: "",
        secretaryOpinion: "", secretaryNameReview: "", secretaryPosition: "", forwardingSecretaryName: ""
      };
    }
    if (formId === DOC_IDS.ARREST_RECORD) {
      return {
        ...common, dailyRecordNo: "", dailyRecordTime: "", investigationNo: text(state.caseData?.trackingCode), evidenceAccountNo: "",
        recordedAt: "", recordedDate: "", recordedTime: "", arrestDate: "", arrestTime: "", arrestPlace: "",
        commandOfficerName: "", arrestingOfficers: "", policeUnit: "", policeCommandOfficerName: "", policeArrestingOfficers: "",
        arrestedName: "", citizenId: "", address: "", warrantCourt: "", warrantNo: "", warrantDate: "", charge: "",
        circumstances: "", declinesRight4: false, requestsRight4: false, warrantIdentityStatement: "", plea: "", notificationDate: "", notificationTime: "",
        noForceMajeure: false, forceMajeure: false, forceMajeureReason: "", arrestedSignerName: "", arrestingOfficerName: "",
        jointArrestingOfficerName: "", recordingOfficerName: "", policeOfficerName1: "", policeOfficerName2: ""
      };
    }
    if (formId === DOC_IDS.CUSTODY_NOTIFICATION_RECORD) {
      return {
        ...common, detaineeFirstName: "", detaineeLastName: "", detaineeAge: "", citizenId: "", detaineeAddress: "", detaineePhone: "",
        arrestDate: "", arrestTime: "", arrestPlace: "", arrestCircumstances: "", custodyPlace: "", responsibleOfficerName: "",
        responsibleOfficerPosition: "", responsibleOfficerPhone: "", forceMajeureReason: "", notifyingOfficerName: "",
        notifyingOfficerPosition: "", notifyingOfficerPhone: "", passportNo: "", otherIdentityDocument: "", visibleMarks: "",
        custodyBasisFlagrant: false, flagrantOffenceCharge: "", custodyBasisWarrant: false, warrantNo: "", warrantCourt: "", warrantDate: "",
        custodyBasisOrder: false, custodyOrderText: "", custodyOrderReason: "", custodyBasisOther: false, otherLegalAuthority: "", custodyOfficerName: "",
        custodyOfficerPosition: "", custodyOfficerPhone: "", destinationName: "", destinationAddress: "", transferOfficerName: "",
        transferOfficerPosition: "", transferOfficerPhone: "", releaseDate: "", releaseTime: "", releasePlace: "", recipientName: "",
        recipientLastName: "", recipientPhone: "", physicalMentalBefore: "", physicalMentalBeforeRelease: "", deathCause: "",
        bodyStoragePlace: "", otherInformation: "", additionalForceMajeure: "", additionalRecord: "", detaineeSignerName: "",
        officerSignerName: "", witnessSignerName: "", photoCertification: "", photoHouseNo: "", photoSubdistrict: "",
        photoDistrict: "", photoProvince: "", photoWarrantCourt: "", photoWarrantNo: "", photoWarrantDate: "", photoCharge: ""
      };
    }
    if (formId === DOC_IDS.POLICE_CUSTODY_REQUEST) {
      return { ...common, footerUnitLabel: "กอง/สำนัก", letterNo: "", issuedDate: "", policeStation: "", attachmentPages: "", accusedName: "", citizenId: "", warrantCourt: "", warrantNo: "", warrantDate: "", charge: "", arrestingUnit: "", prosecutorOffice: "", courtName: "", custodyRoom: "", signerName: "", phone: "", fax: "", officerName: text(state.assignment?.primaryOfficerName) };
    }
    if (formId === DOC_IDS.PROSECUTOR_ARREST_TRANSFER_NOTICE) {
      return { ...common, footerUnitLabel: "กอง/สำนัก", letterNo: "", issuedDate: "", prosecutorOffice: "", warrantCourt: "", warrantNo: "", warrantDate: "", attachmentDescription: "", accusedName: "", criminalSection: "", relatedSection: "", policeStation: "", arrestDate: "", signerName: "", phone: "", fax: "", officerName: text(state.assignment?.primaryOfficerName) };
    }
    if (formId === DOC_IDS.ARREST_REPORT_MEMORANDUM) {
      return { ...common, phone: "", letterNo: "", issuedDate: "", sourceUnit: "", warrantCourt: "", warrantDate: "", arrestingUnit: "", filingDate: "", signerName: "", signerUnit: "" };
    }
    if (formId === DOC_IDS.ARREST_WARRANT_EXECUTION_REPORT) {
      return { ...common, footerUnitLabel: "กอง/สำนัก", letterNo: "", issuedDate: "", courtName: "", warrantCourt: "", warrantNo: "", warrantDate: "", attachmentPages: "", accusedName: "", charge: "", arrestDate: "", prosecutorOffice: "", signerName: "", phone: "", fax: "", officerName: text(state.assignment?.primaryOfficerName) };
    }
    if (formId === DOC_IDS.DETAINEE_HOLD_REQUEST) {
      return { ...common, footerUnitLabel: "สำนัก/กอง", letterNo: "", issuedDate: "", prisonName: "", warrantCourt: "", warrantNo: "", warrantDate: "", suspectName: "", charge: "", deliveryPlace: "", judgmentCourt: "", blackCaseNo: "", redCaseNo: "", signerName: "", phone: "", fax: "", officerName: text(state.assignment?.primaryOfficerName) };
    }
    if (formId === DOC_IDS.IMPRISONMENT_WARRANT_REQUEST) {
      return { ...common, footerUnitLabel: "กอง", letterNo: "", issuedDate: "", prisonName: "", prosecutorLetterNo: "", prosecutorLetterDate: "", dxcPrisonName: "", accusedName: "", lawAndSection: "", prosecutionLawAndSection: "", courtName: "", filingDateTime: "", citizenId: "", destinationProsecutorOffice: "", signerName: "", phone: "", fax: "", officerName: text(state.assignment?.primaryOfficerName) };
    }
    if (formId === DOC_IDS.PROSECUTOR_SECURE_ACCUSED_REQUEST) {
      return { ...common, footerUnitLabel: "กอง", letterNo: "", issuedDate: "", prosecutorName: "", referenceLetterNo: "", referenceLetterDate: "", prisonLetterNo: "", prisonLetterDate: "", accusedName: "", lawAndSection: "", prosecutorOffice: "", courtName: "", filingDateTime: "", prisonName: "", imprisonmentCharge: "", blackCaseNo: "", redCaseNo: "", signerName: "", phone: "", fax: "", officerName: text(state.assignment?.primaryOfficerName) };
    }
    if (formId === DOC_IDS.BAIL_CONTRACT_PROPOSAL) {
      return { ...common, authorityName: "", arrestDate: "", arrestTime: "", dailyRecordNo: "", arrestedName: "", arrestedContact: "", charge: "", incidentDetails: "", bailApplicantName: "", bailApplicantRace: "", bailApplicantNationality: "", bailApplicantHouseNo: "", bailApplicantVillageNo: "", bailApplicantSubdistrict: "", bailApplicantDistrict: "", bailApplicantProvince: "", otherCaseStatus: "", collateralAssessment: "", flightRisk: "", dangerRisk: "", arrestedStatement: "", caseCircumstances: "", casePrejudice: "", recommendation: "", proposerName: text(state.assignment?.primaryOfficerName), proposerPosition: "", decisionApprove: false, decisionDeny: false, decisionMakerName: "", decisionMakerPosition: "" };
    }
    if (formId === DOC_IDS.BAIL_APPLICATION_AND_CONTRACT) {
      const scheduleRows = {};
      const assetRows = {};
      for (let index = 1; index <= 10; index += 1) {
        scheduleRows[`scheduleRow${index}No`] = index === 1 ? "๑." : "";
        scheduleRows[`scheduleRow${index}Date`] = "";
        scheduleRows[`scheduleRow${index}Time`] = "";
        scheduleRows[`scheduleRow${index}Place`] = "";
        scheduleRows[`scheduleRow${index}Acknowledged`] = "";
      }
      for (let index = 1; index <= 12; index += 1) {
        assetRows[`assetRow${index}No`] = index === 1 ? "๑." : "";
        assetRows[`assetRow${index}Description`] = "";
        assetRows[`assetRow${index}Quantity`] = "";
        assetRows[`assetRow${index}PriceBaht`] = "";
        assetRows[`assetRow${index}PriceSatang`] = "";
        assetRows[`assetRow${index}TotalBaht`] = "";
        assetRows[`assetRow${index}TotalSatang`] = "";
        assetRows[`assetRow${index}Note`] = "";
      }
      return {
        ...common, applicationPlace: "", applicationDate: "", applicantName: "", applicantAge: "", insuredName: "", charge: "", applicationCollateral: "",
        contractPlace: "", contractDate: "", guarantorName: "", guarantorAge: "", guarantorRace: "", guarantorNationality: "", guarantorAddress: "", receivingUnit: "",
        guaranteeAmountNumber: "", guaranteeAmountText: "", collateral: "", recipientName: "", witnessName: "", writerWitnessName: "",
        ...scheduleRows,
        ...assetRows
      };
    }
    if (formId === DOC_IDS.WITNESS_SUMMONS_DELIVERY) {
      return { ...common, footerUnitLabel: "สำนัก", footerUnitPlaceholder: "(กปท./ปปท.เขตพื้นที่ ของฝ่ายเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)", letterNo: "", issuedDate: "", witnessName: "", statementDate: "", summonsPages: "", statementPages: "", investigationNo: text(state.caseData?.trackingCode), caseFacts: text(state.caseData?.subject), incidentDate: "", incidentPlace: "", courtName: "", blackCaseNo: "", hearingDate: "", hearingTime: "", courtAddress: "", returnOffice: "", returnWithinDays: "", signerName: "", phone: "", fax: "", officerName: text(state.assignment?.primaryOfficerName) };
    }
    if (formId === DOC_IDS.PROSECUTOR_WITNESS_SUMMONS_REPORT) {
      return { ...common, footerUnitLabel: "สำนัก", footerUnitPlaceholder: "(กปท./ปปท.เขตพื้นที่ ของฝ่ายเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)", letterNo: "", issuedDate: "", prosecutorName: "", referenceLetterNo: "", referenceLetterDate: "", witnessName1: "", witnessName2: "", prosecutorOffice: "", witnessCount: "", defendantName: "", courtName: "", blackCaseNo: "", deliveryResult: "", signerName: "", phone: "", fax: "", officerName: text(state.assignment?.primaryOfficerName) };
    }
    if (formId === DOC_IDS.SEARCH_INVESTIGATION_REPORT) {
      return {
        ...common,
        phone: "",
        letterNo: "",
        issuedDate: "",
        investigationNo: text(state.caseData?.trackingCode),
        caseCategory: "",
        intakeBasis18_1: false,
        intakeBasis18_4: false,
        receivedDate: "",
        complainantName: "",
        accusedName: "",
        accusedPosition: "",
        accusedAgency: "",
        allegationSummary: text(state.caseData?.subject),
        inquiryBody: "",
        appointmentOrder: "",
        appointmentSecretNo: "",
        appointmentDate: "",
        committeeMember1Name: "",
        committeeMember2Name: "",
        committeeMember3Name: "",
        boardMeetingNo: "",
        boardMeetingDate: "",
        resolvedAccused: "",
        resolvedPosition: "",
        criminalOffence: "",
        prosecutorLetterNo: "",
        prosecutorLetterDate: "",
        prosecutorOffice: "",
        prosecutedAccused: "",
        investigationFacts: "",
        competentCourt: "",
        signerName: text(state.assignment?.primaryOfficerName),
        signerRole: "",
        supervisorOpinion: "",
        supervisorName: "",
        supervisorPosition: "",
        directorOpinion: "",
        directorName: "",
        directorUnit: "",
        deputyOpinion: "",
        deputyName: "",
        secretaryOpinion: "",
        secretaryOpinionSignerName: "",
        forwardingSecretaryName: ""
      };
    }
    if (formId === DOC_IDS.SEARCH_WARRANT_PETITION) {
      return {
        ...common,
        courtName: "", petitionDate: "", petitionerName: "", petitionerPosition: "", petitionerAge: "",
        workplace: "", workplaceSubdistrict: "", workplaceDistrict: "", workplaceProvince: "", petitionerPhone: "",
        searchLocation: "", locationOwner: "", locationOwnerAge: "", locationOwnerId: "",
        searchCircumstances: "", requestingAgency: "", wantedAccusedName: "", wantedAccusedAge: "",
        wantedAccusedId: "", wantedAccusedAddress: "", wantedAccusedHideout: "",
        evidenceDescription: "", evidenceLocation: "", searchPurpose: "",
        groundEvidence: false, groundIllegalThing: false, groundCourtOrder: false, groundAccused: false,
        groundUnlawfulDetention: false, groundOffenceEquipment: false, searchOfficer: "", searchDate: "",
        searchTime: "", priorRequestMade: "", priorCourtName: "", priorRequestBasis: "", priorCourtOrder: ""
      };
    }
    if (formId === DOC_IDS.PETITIONER_WITNESS_STATEMENT) {
      return {
        ...common,
        petitionNo: "", warrantNo: "", courtName: "", statementDate: "",
        petitionerName: "", petitionerPosition: "", birthDate: "", age: "", agencyAddress: "",
        relationPetitioner: true, relationDelegate: false, investigationFacts: "", searchLocation: "",
        locationOwner: "", locationOwnerAge: "", locationOwnerId: "", requestingAgency: "",
        wantedAccusedName: "", wantedAccusedAge: "", wantedAccusedId: "", wantedAccusedAddress: "",
        wantedAccusedHideout: "", evidenceDescription: "", evidenceLocation: "",
        groundEvidence: false, groundIllegalThing: false,
        groundCourtOrder: false, groundAccused: false, groundUnlawfulDetention: false,
        groundOffenceEquipment: false, judgeName: ""
      };
    }
    if (formId === DOC_IDS.COURT_PROCEEDING_REPORT) {
      return {
        ...common,
        petitionNo: "", warrantNo: "", courtName: "", proceedingDate: "", petitionerName: "",
        petitionerPosition: "", hearingTime: "", witnessCount: "", courtOrderReason: "",
        permittedSearchDate: "", permittedStartTime: "", permittedEndTime: "",
        reportWithinDays: "", retainedCopy: "", judgeName: ""
      };
    }
    if (formId === DOC_IDS.COURT_SEARCH_WARRANT) {
      return {
        ...common,
        warrantNo: "", courtName: "", issuedDate: "", petitionerName: "", petitionerPosition: "",
        houseNo: "", villageNo: "", subdistrict: "", district: "", province: "", searchLocation: "",
        searchTarget: "", personTarget: "", leadOfficer: "", searchDate: "",
        startedAt: "", endedAt: "", judgeName: "", executionDate: "", executingOfficer: "",
        acknowledgingPerson: "", acknowledgingRelation: ""
      };
    }
    if (formId === DOC_IDS.SEARCH_WARRANT_ENVELOPE) {
      return {
        ...common,
        courtName: "", unitName: text(state.inquiry?.intake?.unit), criminalCaseNo: "", charge: "",
        limitationYears: "", limitationDate: "", petitionerName: "", petitionerPhone: ""
      };
    }
    if (formId === DOC_IDS.SEARCH_RECORD) {
      return {
        ...common,
        writtenAt: "",
        recordedDate: "",
        startedAt: "",
        searchOfficers: "",
        houseNo: "",
        road: "",
        subdistrict: "",
        district: "",
        province: "",
        searchLocation: "",
        locationOwner: "",
        searchReason: "",
        personFound: "",
        personRole: "",
        informedPerson: "",
        preSearchWitness: "",
        searchResult: "",
        endedAt: "",
        postSearchWitness: "",
        readToPerson: "",
        locationOwnerSigner: "",
        searchOfficerSigner1: "",
        searchOfficerSigner2: "",
        recordingOfficerSigner: ""
      };
    }
    if (formId === DOC_IDS.SEARCH_WARRANT_EXECUTION_REPORT) {
      return {
        ...common,
        letterNo: "",
        issuedDate: "",
        courtName: "",
        warrantCourt: "",
        warrantNo: "",
        warrantDate: "",
        attachmentPages: "",
        houseNo: "",
        searchPurpose: "",
        searchDate: "",
        startedAt: "",
        endedAt: "",
        searchResult: "",
        followUpSubject: "",
        signerName: "",
        phone: "",
        fax: "",
        officerName: ""
      };
    }
    if (formId !== DOC_IDS.SEIZURE_RECORD) return common;
    return {
      ...common,
      writtenAt: "",
      recordedDate: "",
      officers: "",
      seizedItems: "",
      circumstances: "",
      seizedFrom: "",
      searchLocation: "",
      searchPeriod: "",
      custodianName: "",
      seizingOfficerName: "",
      jointOfficerName: "",
      witnessName: "",
      recordingOfficerName: "",
      recipientName: "",
      recipientPrintedName: "",
      recipientPosition: "",
      receivedDate: ""
    };
  }

  const B7_EXTERNAL_FIELDS = [["เลขที่หนังสือ", "letterNo"], ["วันที่", "issuedDate"], ["สำนัก/กอง", "ownerUnit"], ["โทรศัพท์", "phone"], ["โทรสาร", "fax"], ["เจ้าของสำนวน", "officerName"], ["ผู้ลงนาม", "signerName"]];
  const B7_MEMO_FIELDS = [["ส่วนราชการ", "ownerUnit"], ["โทรศัพท์", "phone"], ["เลขที่บันทึก", "memoNo"], ["วันที่", "memoDate"]];
  const B7_REPRESENTATIVE_FIELDS = [1, 2, 3].flatMap(index => [[`ชื่อผู้แทน ${index}`, `representativeName${index}`], [`ตำแหน่งผู้แทน ${index}`, `representativePosition${index}`]]);
  const B7_REVIEW_FIELDS = [
    ["ความเห็นผู้บังคับบัญชาชั้นต้น", "supervisorOpinion", "textarea"], ["ชื่อผู้บังคับบัญชาชั้นต้น", "supervisorName"], ["ตำแหน่งผู้บังคับบัญชาชั้นต้น", "supervisorPosition"],
    ["ความเห็นผู้อำนวยการ", "directorOpinion", "textarea"], ["ชื่อผู้อำนวยการ", "directorName"], ["ตำแหน่งผู้อำนวยการ", "directorPosition"],
    ["ความเห็นรองเลขาธิการ/ผู้ช่วยเลขาธิการ", "executiveOpinion", "textarea"], ["ชื่อรองเลขาธิการ/ผู้ช่วยเลขาธิการ", "executiveName"], ["ตำแหน่งรองเลขาธิการ/ผู้ช่วยเลขาธิการ", "executivePosition"],
    ["ความเห็นเลขาธิการ", "secretaryOpinion", "textarea"], ["ชื่อเลขาธิการ", "secretaryNameReview"], ["ตำแหน่งเลขาธิการ", "secretaryPosition"], ["เลขาธิการผู้เสนอประธาน", "forwardingSecretaryName"]
  ];
  const BATCH7_EDITOR_FIELDS = Object.freeze({
    [DOC_IDS.NO_GROUNDS_COMPLAINANT_NOTICE]: [...B7_EXTERNAL_FIELDS, ["ผู้กล่าวหา", "complainantName"], ["วันที่หนังสือร้องเรียน", "complaintLetterDate"], ["ผู้ถูกกล่าวหาโดยสรุป", "accusedSummary", "textarea"], ["ฐานความผิด", "charge", "textarea"], ["คณะผู้ไต่สวน", "inquiryBody"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["มติ", "boardResolution", "textarea"]],
    [DOC_IDS.NO_GROUNDS_ACCUSED_NOTICE]: [...B7_EXTERNAL_FIELDS, ["ผู้ถูกกล่าวหาผู้รับหนังสือ", "accusedRecipientName"], ["ฐานความผิดทางอาญา", "criminalBasis", "textarea"], ["คณะผู้ไต่สวน", "inquiryBody"], ["มีหนังสือแจ้งข้อกล่าวหา", "hasAllegationNotice", "checkbox"], ["เลขหนังสือแจ้ง", "noticeLetterNo"], ["วันที่หนังสือแจ้ง", "noticeDate"], ["ชนิดหนังสือแจ้ง", "noticeType"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["มติ", "boardResolution", "textarea"]],
    [DOC_IDS.NO_GROUNDS_AGENCY_NOTICE]: [...B7_EXTERNAL_FIELDS, ["หัวหน้าหน่วยงาน", "agencyHeadName"], ["ผู้ถูกกล่าวหาโดยสรุป", "accusedSummary", "textarea"], ["ฐานความผิด", "charge", "textarea"], ["คณะผู้ไต่สวน", "inquiryBody"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["มติ", "boardResolution", "textarea"]],
    [DOC_IDS.NO_GROUNDS_SUSPENDED_AGENCY_NOTICE]: [...B7_EXTERNAL_FIELDS, ["หัวหน้าหน่วยงาน", "agencyHeadName"], ["หนังสือสั่งพักเลขที่", "suspensionLetterNo"], ["วันที่หนังสือสั่งพัก", "suspensionLetterDate"], ["แบบอ้างอิงการสั่งพัก", "suspensionFormRef"], ["ผู้ถูกกล่าวหาโดยสรุป", "accusedSummary", "textarea"], ["ฐานความผิด", "charge", "textarea"], ["คณะผู้ไต่สวน", "inquiryBody"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["มติ", "boardResolution", "textarea"]],
    [DOC_IDS.DISCIPLINARY_ACTION_REQUEST]: [...B7_EXTERNAL_FIELDS, ["ผู้มีอำนาจรับหนังสือ", "recipientAuthority"], ["ผู้ถูกกล่าวหาโดยสรุป", "accusedSummary", "textarea"], ["ฐานความผิด", "charge", "textarea"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["มติ", "boardResolution", "textarea"], ["รายงานไต่สวนเรื่องที่", "inquiryReportCaseNo"], ["จำนวนแผ่นรายงาน", "inquiryReportPages"], ["จำนวนแผ่นมติ", "resolutionPages"], ["ผู้ถูกลงโทษทางวินัย", "disciplinedAccused"], ["หน่วยงาน", "agencyName"]],
    [DOC_IDS.DISCIPLINARY_CRIMINAL_ACTION_REQUEST]: [...B7_EXTERNAL_FIELDS, ["ผู้มีอำนาจรับหนังสือ", "recipientAuthority"], ["ผู้ถูกกล่าวหาโดยสรุป", "accusedSummary", "textarea"], ["ฐานความผิด", "charge", "textarea"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["มติ", "boardResolution", "textarea"], ["รายงานไต่สวนเรื่องที่", "inquiryReportCaseNo"], ["จำนวนแผ่นรายงาน", "inquiryReportPages"], ["จำนวนแผ่นมติ", "resolutionPages"], ["ผู้ถูกลงโทษทางวินัย", "disciplinedAccused"], ["หน่วยงาน", "agencyName"]],
    [DOC_IDS.CRIMINAL_PROSECUTION_REFERRAL]: [...B7_EXTERNAL_FIELDS, ["อธิบดีอัยการ", "recipientAttorneyDepartment", "checkbox"], ["อัยการจังหวัด", "recipientProvincialProsecutor", "checkbox"], ["พื้นที่รับผิดชอบ", "recipientArea"], ["สำนวนเรื่องที่", "inquiryCaseNo"], ["ต้นฉบับสำนวน", "originalVolumeDescription"], ["จำนวนชุดสำเนา", "copyCount"], ["จำนวนสื่ออิเล็กทรอนิกส์", "electronicMediaCount"], ["ผู้ถูกกล่าวหาโดยสรุป", "accusedSummary", "textarea"], ["ฐานความผิด", "charge", "textarea"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["มติ", "boardResolution", "textarea"]],
    [DOC_IDS.JOINT_TEAM_REPRESENTATIVE_REQUEST]: [...B7_EXTERNAL_FIELDS, ["สำนวนเรื่องที่", "inquiryCaseNo"], ["อัยการผู้รับผิดชอบ", "responsibleProsecutor"], ["หนังสือแจ้งข้อไม่สมบูรณ์", "incompletenessLetterNo"], ["จำนวนแผ่นแนบ", "attachmentPages"], ["ผู้ถูกกล่าวหาโดยสรุป", "accusedSummary", "textarea"], ["ฐานความผิด", "charge", "textarea"], ["จำนวนผู้แทนอัยการ", "representativeCount"]],
    [DOC_IDS.JOINT_TEAM_APPOINTMENT_MEMORANDUM]: [...B7_MEMO_FIELDS, ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["หนังสือส่งอัยการ", "prosecutionLetterNo"], ["วันที่หนังสือส่งอัยการ", "prosecutionLetterDate"], ["ผู้ถูกดำเนินคดี", "prosecutedAccused"], ["ฐานความผิดอาญา", "criminalOffence", "textarea"], ["หนังสือแจ้งข้อไม่สมบูรณ์", "deficiencyLetterNo"], ["วันที่แจ้งข้อไม่สมบูรณ์", "deficiencyLetterDate"], ["สรุปข้อไม่สมบูรณ์", "deficiencySummary", "textarea"], ["ประชุมครั้งที่ 2", "secondBoardMeetingNo"], ["วันที่ประชุมครั้งที่ 2", "secondBoardMeetingDate"], ["มติครั้งที่ 2", "secondBoardResolution", "textarea"], ...[1, 2, 3, 4, 5, 6].map(index => [`เอกสาร ${index}`, `reference${index}`]), ["ข้อระเบียบ", "regulationClause"], ...B7_REPRESENTATIVE_FIELDS, ["ผู้ลงนาม", "signerName"]],
    [DOC_IDS.JOINT_TEAM_NAMES_HANDOVER_MEMORANDUM]: [...B7_MEMO_FIELDS, ["ผู้อำนวยการผู้รับ", "recipientDirector"], ["หนังสือแจ้งข้อไม่สมบูรณ์", "deficiencyLetterNo"], ["วันที่หนังสือ", "deficiencyLetterDate"], ["ผู้ถูกกล่าวหา", "accusedName"], ["จำนวนผู้แทนอัยการ", "prosecutorRepresentativeCount"], ["จำนวนผู้แทน ป.ป.ท.", "paccRepresentativeCount"], ...B7_REPRESENTATIVE_FIELDS, ["จำนวนแฟ้ม", "fileCount"], ["จำนวนแผ่น", "pageCount"], ["ผู้ลงนาม", "signerName"]],
    [DOC_IDS.JOINT_TEAM_MEETING_RECORD]: [["ครั้งที่", "meetingNo"], ["ปี", "meetingYear"], ["วันที่", "meetingDate"], ["สถานที่", "meetingPlace"], ...[1, 2, 3, 4, 5].map(index => [`ผู้เข้าร่วมประชุม ${index}`, `attendee${index}`]), ["ผู้ไม่มาประชุม 1", "absent1"], ["ผู้ไม่มาประชุม 2", "absent2"], ["เริ่มประชุม", "startTime"], ["ปิดประชุม", "endTime"], ["ประธาน", "chairName"], ["เลขานุการ", "secretaryName"], ["ผู้นำเสนอ", "presenterName"], ["หนังสือส่งดำเนินคดี", "prosecutionLetterNo"], ["วันที่หนังสือ", "prosecutionLetterDate"], ["ผู้ถูกกล่าวหา", "accusedName"], ["ฐานความผิด", "charge", "textarea"], ["ข้อไม่สมบูรณ์ 1", "deficiencyIssue1", "textarea"], ["ข้อไม่สมบูรณ์ 2", "deficiencyIssue2", "textarea"], ...[1, 2, 3].flatMap(index => [[`ผู้แทนอัยการ ${index}`, `prosecutorRepresentativeName${index}`], [`ตำแหน่งผู้แทนอัยการ ${index}`, `prosecutorRepresentativePosition${index}`]]), ...[1, 2, 3].flatMap(index => [[`ผู้แทน ป.ป.ท. ${index}`, `paccRepresentativeName${index}`], [`ตำแหน่งผู้แทน ป.ป.ท. ${index}`, `paccRepresentativePosition${index}`]]), ["มติ", "resolution", "textarea"], ...[1, 2, 3].map(index => [`ผู้ลงนามฝ่ายอัยการ ${index}`, `prosecutorSigner${index}`]), ...[1, 2, 3].map(index => [`ผู้ลงนามฝ่าย ป.ป.ท. ${index}`, `paccSigner${index}`])],
    [DOC_IDS.JOINT_TEAM_RESOLUTION_NOTICE]: [...B7_EXTERNAL_FIELDS, ["หนังสืออัยการ", "prosecutorLetterNo"], ["วันที่หนังสืออัยการ", "prosecutorLetterDate"], ["ผู้ถูกกล่าวหา", "accusedName"], ["จำนวนแผ่นแนบ", "attachmentPages"], ["ประชุมครั้งที่", "meetingNo"], ["วันที่ประชุม", "meetingDate"], ["มติ", "resolution", "textarea"]],
    [DOC_IDS.NON_INDICTMENT_DISSENT_REFERRAL]: [...B7_EXTERNAL_FIELDS, ["สำนวนเรื่องที่", "inquiryCaseNo"], ["ผู้ถูกกล่าวหาโดยสรุป", "accusedSummary", "textarea"], ["ฐานความผิด", "charge", "textarea"], ["สำนักงานอัยการ", "prosecutorOffice"], ["สั่งไม่ฟ้องบางข้อหา", "partialNoIndict", "checkbox"], ["ข้อหาที่สั่งไม่ฟ้อง", "nonIndictedCharges", "textarea"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["เหตุผลแย้ง 1", "dissentReason1", "textarea"], ["เหตุผลแย้ง 2", "dissentReason2", "textarea"]],
    [DOC_IDS.PROSECUTOR_INCOMPLETENESS_ACTION_REPORT]: [...B7_MEMO_FIELDS, ["คดีรับจาก ป.ป.ช. มาตรา 62", "caseFromNaccM62", "checkbox"], ["คดีประพฤติมิชอบ", "caseMisconduct", "checkbox"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["ผู้ถูกกล่าวหา", "accusedName"], ["ฐานความผิดอาญา", "criminalOffence", "textarea"], ["หนังสือส่งอัยการ", "prosecutionLetterNo"], ["วันที่", "prosecutionLetterDate"], ["หนังสือแจ้งข้อไม่สมบูรณ์", "deficiencyLetterNo"], ["วันที่", "deficiencyLetterDate"], ["หนังสือแจ้งผลดำเนินการ", "resultLetterNo"], ["วันที่", "resultLetterDate"], ["สรุปข้อไม่สมบูรณ์", "deficiencySummary", "textarea"], ["ผู้เสนอ", "proposerName"], ["ตำแหน่งผู้เสนอ", "proposerPosition"], ...B7_REVIEW_FIELDS],
    [DOC_IDS.PROSECUTOR_INCOMPLETENESS_RESULT_NOTICE]: [...B7_EXTERNAL_FIELDS, ["พนักงานอัยการผู้รับ", "recipientProsecutor"], ["สำนักงานอัยการ", "prosecutorOffice"], ["หนังสืออ้างถึง", "referenceLetterNo"], ["วันที่หนังสือ", "referenceLetterDate"], ["สิ่งที่ส่งมาด้วย 1", "attachmentDescription1"], ["สิ่งที่ส่งมาด้วย 2", "attachmentDescription2"], ["ข้อเท็จจริงที่อัยการแจ้ง", "deficiencyFacts", "textarea"], ["สำนักงานอัยการปลายทาง", "destinationOffice"], ["ผลการไต่สวนเพิ่มเติม", "additionalInquiryResult", "textarea"]],
    [DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_MEMORANDUM]: [...B7_MEMO_FIELDS, ["คดีรับจาก ป.ป.ช. มาตรา 62", "caseFromNaccM62", "checkbox"], ["คดีประพฤติมิชอบ", "caseMisconduct", "checkbox"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["ผู้ถูกกล่าวหา", "accusedName"], ["ฐานความผิดวินัย", "disciplinaryOffence", "textarea"], ["หนังสือขอให้ดำเนินการวินัย", "disciplineLetterNo"], ["วันที่", "disciplineLetterDate"], ["หนังสือขอทบทวน", "reviewRequestLetterNo"], ["วันที่", "reviewRequestDate"], ["ต้นสังกัด", "agencyName"], ["เหตุขอทบทวน", "reviewReason", "textarea"], ["ผลประเมิน 30 วัน", "withinThirtyDaysAssessment", "textarea"], ["ผลประเมินพยานหลักฐานใหม่", "newEvidenceAssessment", "textarea"], ["ข้อเสนอ", "proposal", "textarea"], ["ผู้เสนอ", "proposerName"], ["ตำแหน่งผู้เสนอ", "proposerPosition"], ...B7_REVIEW_FIELDS],
    [DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_RESULT_NOTICE]: [...B7_EXTERNAL_FIELDS, ["หัวหน้าหน่วยงาน", "agencyHeadName"], ["หน่วยงาน", "agencyName"], ["หนังสืออ้างถึง", "referenceLetterNo"], ["วันที่หนังสือ", "referenceLetterDate"], ["ข้อเท็จจริงที่ขอทบทวน", "requestFacts", "textarea"], ["ประชุมครั้งที่", "boardMeetingNo"], ["วันที่ประชุม", "boardMeetingDate"], ["มติ", "boardResolution", "textarea"]]
  });

  const BATCH8_EDITOR_FIELDS = Object.freeze({
    [DOC_IDS.ARREST_RECORD]: [
      ["ปจว. ข้อ", "dailyRecordNo"], ["เวลา ปจว.", "dailyRecordTime"], ["เรื่องที่", "investigationNo"], ["บัญชีของกลางลำดับที่", "evidenceAccountNo"],
      ["สถานที่บันทึก", "recordedAt"], ["วันที่บันทึก", "recordedDate"], ["เวลาบันทึก", "recordedTime"], ["วันที่จับกุม", "arrestDate"], ["เวลาจับกุม", "arrestTime"], ["สถานที่จับกุม", "arrestPlace", "textarea"],
      ["ผู้สั่งการ สำนักงาน ป.ป.ท.", "commandOfficerName"], ["รายชื่อเจ้าหน้าที่ผู้จับกุม", "arrestingOfficers", "textarea"], ["หน่วยงานตำรวจ", "policeUnit"], ["ผู้สั่งการฝ่ายตำรวจ", "policeCommandOfficerName"], ["รายชื่อตำรวจผู้จับกุม", "policeArrestingOfficers", "textarea"],
      ["ผู้ถูกจับ", "arrestedName"], ["หมายเลขบัตร", "citizenId"], ["ที่อยู่", "address", "textarea"], ["ศาลที่ออกหมายจับ", "warrantCourt"], ["หมายจับที่", "warrantNo"], ["วันที่หมายจับ", "warrantDate"], ["ข้อกล่าวหา", "charge", "textarea"],
      ["พฤติการณ์และการกระทำ", "circumstances", "textarea"], ["ไม่ขอดำเนินการตามข้อ ๔", "declinesRight4", "checkbox"], ["ขอดำเนินการตามข้อ ๔", "requestsRight4", "checkbox"], ["คำรับรองบุคคลตามหมายจับ", "warrantIdentityStatement", "textarea"], ["คำให้การ รับสารภาพ/ปฏิเสธ", "plea"], ["วันที่แจ้ง ม.22", "notificationDate"], ["เวลาแจ้ง ม.22", "notificationTime"],
      ["ไม่มีเหตุสุดวิสัย", "noForceMajeure", "checkbox"], ["มีเหตุสุดวิสัย", "forceMajeure", "checkbox"], ["เหตุสุดวิสัย", "forceMajeureReason", "textarea"], ["ผู้ถูกจับลงชื่อ", "arrestedSignerName"], ["ผู้จับกุม", "arrestingOfficerName"], ["ผู้ร่วมจับกุม", "jointArrestingOfficerName"], ["ผู้จับกุม/บันทึก/อ่าน", "recordingOfficerName"], ["ตำรวจผู้จับกุม 1", "policeOfficerName1"], ["ตำรวจผู้จับกุม 2", "policeOfficerName2"]
    ],
    [DOC_IDS.CUSTODY_NOTIFICATION_RECORD]: [
      ["ชื่อผู้ถูกจับและควบคุม", "detaineeFirstName"], ["นามสกุล", "detaineeLastName"], ["อายุ", "detaineeAge"], ["หมายเลขบัตรประชาชน", "citizenId"], ["ที่อยู่", "detaineeAddress", "textarea"], ["โทรศัพท์", "detaineePhone"],
      ["วันที่จับและควบคุม", "arrestDate"], ["เวลา", "arrestTime"], ["สถานที่จับและควบคุม", "arrestPlace", "textarea"], ["พฤติการณ์ในการจับและควบคุม", "arrestCircumstances", "textarea"], ["สถานที่ควบคุมตัว", "custodyPlace"],
      ["เจ้าหน้าที่ผู้รับผิดชอบ", "responsibleOfficerName"], ["ตำแหน่ง", "responsibleOfficerPosition"], ["โทรศัพท์", "responsibleOfficerPhone"], ["เหตุสุดวิสัย", "forceMajeureReason", "textarea"], ["เจ้าหน้าที่ผู้แจ้ง", "notifyingOfficerName"], ["ตำแหน่งผู้แจ้ง", "notifyingOfficerPosition"], ["โทรศัพท์ผู้แจ้ง", "notifyingOfficerPhone"],
      ["หนังสือเดินทาง", "passportNo"], ["เอกสารอื่นที่ใช้ระบุตัวตน", "otherIdentityDocument"], ["ตำหนิรูปพรรณ", "visibleMarks", "textarea"],
      ["ความผิดซึ่งหน้า", "custodyBasisFlagrant", "checkbox"], ["ฐานความผิดซึ่งหน้า", "flagrantOffenceCharge", "textarea"],
      ["ตามหมายจับ", "custodyBasisWarrant", "checkbox"], ["หมายจับเลขที่", "warrantNo"], ["ศาลผู้ออกหมาย", "warrantCourt"], ["วันที่หมายจับ", "warrantDate"],
      ["ตามคำสั่ง", "custodyBasisOrder", "checkbox"], ["คำสั่งที่ให้ควบคุม", "custodyOrderText", "textarea"], ["เหตุแห่งการออกคำสั่ง", "custodyOrderReason", "textarea"],
      ["กรณีอื่นที่กฎหมายให้อำนาจ", "custodyBasisOther", "checkbox"], ["กฎหมายที่ให้อำนาจ", "otherLegalAuthority", "textarea"],
      ["เจ้าหน้าที่ผู้ควบคุม", "custodyOfficerName"], ["ตำแหน่งเจ้าหน้าที่ผู้ควบคุม", "custodyOfficerPosition"], ["โทรศัพท์เจ้าหน้าที่ผู้ควบคุม", "custodyOfficerPhone"], ["สถานที่ปลายทาง", "destinationName"], ["ที่อยู่สถานที่ปลายทาง", "destinationAddress", "textarea"], ["เจ้าหน้าที่ผู้รับผิดชอบการย้ายตัว", "transferOfficerName"], ["ตำแหน่งผู้ย้ายตัว", "transferOfficerPosition"], ["โทรศัพท์ผู้ย้ายตัว", "transferOfficerPhone"],
      ["วันที่ปล่อย/ส่งมอบ", "releaseDate"], ["เวลา", "releaseTime"], ["สถานที่ปล่อย/ส่งมอบ", "releasePlace"], ["ชื่อผู้รับมอบ", "recipientName"], ["นามสกุกลผู้รับมอบ", "recipientLastName"], ["โทรศัพท์ผู้รับมอบ", "recipientPhone"], ["สภาพร่างกายและจิตใจก่อนควบคุม", "physicalMentalBefore", "textarea"], ["สภาพก่อนปล่อย/ส่งมอบ", "physicalMentalBeforeRelease", "textarea"], ["สาเหตุแห่งการตาย", "deathCause", "textarea"], ["สถานที่เก็บศพ", "bodyStoragePlace"], ["ข้อมูลอื่น", "otherInformation", "textarea"], ["เหตุสุดวิสัยแนบท้าย", "additionalForceMajeure", "textarea"], ["บันทึกอื่นเพิ่มเติม", "additionalRecord", "textarea"],
      ["ผู้ถูกควบคุมลงชื่อ", "detaineeSignerName"], ["เจ้าหน้าที่ลงชื่อ", "officerSignerName"], ["พยานลงชื่อ", "witnessSignerName"], ["คำรับรองภาพถ่าย", "photoCertification", "textarea"],
      ["บ้านเลขที่ในหน้าภาพ", "photoHouseNo"], ["ตำบลในหน้าภาพ", "photoSubdistrict"], ["อำเภอในหน้าภาพ", "photoDistrict"], ["จังหวัดในหน้าภาพ", "photoProvince"], ["ศาลที่ออกหมายในหน้าภาพ", "photoWarrantCourt"], ["หมายจับที่ในหน้าภาพ", "photoWarrantNo"], ["วันที่หมายจับในหน้าภาพ", "photoWarrantDate"], ["ข้อหาในหน้าภาพ", "photoCharge", "textarea"]
    ],
    [DOC_IDS.POLICE_CUSTODY_REQUEST]: [["เลขที่หนังสือ", "letterNo"], ["วันที่", "issuedDate"], ["สถานีตำรวจ", "policeStation"], ["จำนวนแผ่นแนบ", "attachmentPages"], ["ผู้ถูกกล่าวหา", "accusedName"], ["เลขบัตรประชาชน", "citizenId"], ["ศาลที่ออกหมาย", "warrantCourt"], ["หมายจับที่", "warrantNo"], ["วันที่หมายจับ", "warrantDate"], ["ข้อหา", "charge", "textarea"], ["หน่วยผู้จับ", "arrestingUnit"], ["สำนักงานอัยการ", "prosecutorOffice"], ["ศาลที่จะฟ้อง", "courtName"], ["ห้องควบคุมสถานีตำรวจ", "custodyRoom"], ["ผู้ลงนาม", "signerName"], ["โทรศัพท์", "phone"], ["โทรสาร", "fax"], ["เจ้าของสำนวน", "officerName"]],
    [DOC_IDS.PROSECUTOR_ARREST_TRANSFER_NOTICE]: [["เลขที่หนังสือ", "letterNo"], ["วันที่", "issuedDate"], ["พนักงานอัยการ", "prosecutorOffice"], ["ศาลที่ออกหมาย", "warrantCourt"], ["หมายจับที่", "warrantNo"], ["วันที่หมายจับ", "warrantDate"], ["สิ่งที่ส่งมาด้วย", "attachmentDescription"], ["ผู้ถูกกล่าวหา", "accusedName"], ["มาตรา", "criminalSection"], ["ประกอบมาตรา", "relatedSection"], ["สถานีตำรวจ", "policeStation"], ["วันที่จับ", "arrestDate"], ["ผู้ลงนาม", "signerName"], ["โทรศัพท์", "phone"], ["โทรสาร", "fax"], ["เจ้าของสำนวน", "officerName"]],
    [DOC_IDS.ARREST_REPORT_MEMORANDUM]: [["ส่วนราชการ", "ownerUnit"], ["โทรศัพท์", "phone"], ["เลขที่", "letterNo"], ["วันที่", "issuedDate"], ["กอง/สำนักต้นเรื่อง", "sourceUnit"], ["ศาลที่ออกหมายจับ", "warrantCourt"], ["วันที่หมายจับ", "warrantDate"], ["หน่วยผู้จับ", "arrestingUnit"], ["วันที่ยื่นฟ้อง", "filingDate"], ["ผู้ลงนาม ผอ.", "signerName"], ["หน่วยงานผู้ลงนาม", "signerUnit"]],
    [DOC_IDS.ARREST_WARRANT_EXECUTION_REPORT]: [["เลขที่หนังสือ", "letterNo"], ["วันที่", "issuedDate"], ["ศาลผู้รับรายงาน", "courtName"], ["ศาลที่ออกหมาย", "warrantCourt"], ["หมายจับที่", "warrantNo"], ["วันที่หมายจับ", "warrantDate"], ["จำนวนแผ่นแนบ", "attachmentPages"], ["ผู้ถูกกล่าวหา", "accusedName"], ["ฐานความผิด", "charge", "textarea"], ["วันที่จับ", "arrestDate"], ["สำนักงานอัยการ", "prosecutorOffice"], ["ผู้ลงนาม", "signerName"], ["โทรศัพท์", "phone"], ["โทรสาร", "fax"], ["เจ้าของสำนวน", "officerName"]],
    [DOC_IDS.DETAINEE_HOLD_REQUEST]: [["เลขที่หนังสือ", "letterNo"], ["วันที่", "issuedDate"], ["เรือนจำ/ทันฑสถาน", "prisonName"], ["ศาลที่ออกหมาย", "warrantCourt"], ["หมายจับที่", "warrantNo"], ["วันที่หมายจับ", "warrantDate"], ["ผู้ต้องหา", "suspectName"], ["ฐานความผิด", "charge", "textarea"], ["สถานที่ส่งตัว", "deliveryPlace"], ["ศาลตามคำพิพากษา", "judgmentCourt"], ["คดีหมายเลขดำ", "blackCaseNo"], ["คดีหมายเลขแดง", "redCaseNo"], ["ผู้ลงนาม", "signerName"], ["โทรศัพท์", "phone"], ["โทรสาร", "fax"], ["เจ้าของสำนวน", "officerName"]],
    [DOC_IDS.IMPRISONMENT_WARRANT_REQUEST]: [["เลขที่หนังสือ", "letterNo"], ["วันที่", "issuedDate"], ["เรือนจำ/ทันฑสถาน", "prisonName"], ["หนังสืออัยการที่", "prosecutorLetterNo"], ["วันที่หนังสืออัยการ", "prosecutorLetterDate"], ["เรือนจำตาม DXC", "dxcPrisonName"], ["ผู้ถูกกล่าวหา", "accusedName"], ["กฎหมายและมาตราตามมติ", "lawAndSection", "textarea"], ["กฎหมายและมาตราตามคำสั่งฟ้อง", "prosecutionLawAndSection", "textarea"], ["ศาล", "courtName"], ["วันเวลายื่นฟ้อง", "filingDateTime"], ["เลขประจำตัวประชาชน", "citizenId"], ["สำนักงานอัยการปลายทาง", "destinationProsecutorOffice"], ["ผู้ลงนาม", "signerName"], ["โทรศัพท์", "phone"], ["โทรสาร", "fax"], ["เจ้าของสำนวน", "officerName"]],
    [DOC_IDS.PROSECUTOR_SECURE_ACCUSED_REQUEST]: [["เลขที่หนังสือ", "letterNo"], ["วันที่", "issuedDate"], ["พนักงานอัยการเจ้าของสำนวน", "prosecutorName"], ["หนังสืออ้างถึงที่", "referenceLetterNo"], ["วันที่หนังสืออ้างถึง", "referenceLetterDate"], ["หนังสือเรือนจำที่", "prisonLetterNo"], ["วันที่หนังสือเรือนจำ", "prisonLetterDate"], ["ผู้ถูกกล่าวหา", "accusedName"], ["ฐานกฎหมาย", "lawAndSection", "textarea"], ["สำนักงานอัยการ", "prosecutorOffice"], ["ศาล", "courtName"], ["วันเวลายื่นฟ้อง", "filingDateTime"], ["เรือนจำ", "prisonName"], ["ฐานความผิดตามหมายจำคุก", "imprisonmentCharge"], ["คดีหมายเลขดำ", "blackCaseNo"], ["คดีหมายเลขแดง", "redCaseNo"], ["ผู้ลงนาม", "signerName"], ["โทรศัพท์", "phone"], ["โทรสาร", "fax"], ["เจ้าของสำนวน", "officerName"]],
    [DOC_IDS.BAIL_CONTRACT_PROPOSAL]: [["ผู้มีอำนาจปล่อยตัวชั่วคราว", "authorityName"], ["วันที่จับ", "arrestDate"], ["เวลาจับ", "arrestTime"], ["ปจว. ข้อ", "dailyRecordNo"], ["ผู้ถูกจับ", "arrestedName"], ["ที่อยู่/โทรศัพท์ผู้ถูกจับ", "arrestedContact", "textarea"], ["ข้อหา", "charge", "textarea"], ["วันเวลาและสถานที่เกิดเหตุ", "incidentDetails", "textarea"], ["ผู้ขอประกัน", "bailApplicantName"], ["เชื้อชาติ", "bailApplicantRace"], ["สัญชาติ", "bailApplicantNationality"], ["บ้านเลขที่", "bailApplicantHouseNo"], ["หมู่", "bailApplicantVillageNo"], ["แขวง/ตำบล", "bailApplicantSubdistrict"], ["เขต/อำเภอ", "bailApplicantDistrict"], ["จังหวัด", "bailApplicantProvince"], ["คดีอื่น/อายัดตัว", "otherCaseStatus", "textarea"], ["หลักทรัพย์และการประเมิน", "collateralAssessment", "textarea"], ["ความเสี่ยงหลบหนี", "flightRisk", "textarea"], ["ภัยอันตรายหรือความเสียหาย", "dangerRisk", "textarea"], ["คำให้การผู้ถูกจับ", "arrestedStatement", "textarea"], ["พฤติการณ์แห่งคดี", "caseCircumstances", "textarea"], ["ผลต่อรูปคดี", "casePrejudice", "textarea"], ["ความเห็น", "recommendation", "textarea"], ["ผู้เสนอ", "proposerName"], ["ตำแหน่งผู้เสนอ", "proposerPosition"], ["อนุญาต", "decisionApprove", "checkbox"], ["ไม่อนุญาต", "decisionDeny", "checkbox"], ["ผู้มีคำสั่ง", "decisionMakerName"], ["ตำแหน่งผู้มีคำสั่ง", "decisionMakerPosition"]],
    [DOC_IDS.BAIL_APPLICATION_AND_CONTRACT]: [
      ["สถานที่ทำคำร้อง", "applicationPlace"], ["วันที่คำร้อง", "applicationDate"], ["ผู้ขอประกัน", "applicantName"], ["อายุผู้ขอประกัน", "applicantAge"], ["ผู้ถูกขอประกัน", "insuredName"], ["ข้อหา", "charge", "textarea"], ["หลักทรัพย์ตามคำร้อง", "applicationCollateral", "textarea"],
      ["สถานที่ทำสัญญา", "contractPlace"], ["วันที่ทำสัญญา", "contractDate"], ["ผู้ประกัน", "guarantorName"], ["อายุผู้ประกัน", "guarantorAge"], ["เชื้อชาติ", "guarantorRace"], ["สัญชาติ", "guarantorNationality"], ["ที่อยู่ผู้ประกัน", "guarantorAddress", "textarea"], ["หน่วยงานผู้รับสัญญา", "receivingUnit"], ["จำนวนเงินตัวเลข", "guaranteeAmountNumber"], ["จำนวนเงินตัวหนังสือ", "guaranteeAmountText"], ["หลักประกัน", "collateral", "textarea"], ["ผู้รับสัญญา", "recipientName"], ["พยาน", "witnessName"], ["พยานผู้เขียน", "writerWitnessName"],
      ...Array.from({ length: 10 }, (_, offset) => offset + 1).flatMap(index => [[`ครั้งที่ ${index}`, `scheduleRow${index}No`], [`วันนัด ${index}`, `scheduleRow${index}Date`], [`เวลานัด ${index}`, `scheduleRow${index}Time`], [`สถานที่ส่งตัว ${index}`, `scheduleRow${index}Place`], [`ผู้ประกันรับทราบ ${index}`, `scheduleRow${index}Acknowledged`]]),
      ...Array.from({ length: 12 }, (_, offset) => offset + 1).flatMap(index => [[`ลำดับทรัพย์สิน ${index}`, `assetRow${index}No`], [`ทรัพย์สิน ${index}`, `assetRow${index}Description`], [`จำนวน ${index}`, `assetRow${index}Quantity`], [`ราคา (บาท) ${index}`, `assetRow${index}PriceBaht`], [`ราคา (สต.) ${index}`, `assetRow${index}PriceSatang`], [`รวมราคา (บาท) ${index}`, `assetRow${index}TotalBaht`], [`รวมราคา (สต.) ${index}`, `assetRow${index}TotalSatang`], [`หมายเหตุ ${index}`, `assetRow${index}Note`]])
    ],
    [DOC_IDS.WITNESS_SUMMONS_DELIVERY]: [["เลขที่หนังสือ", "letterNo"], ["วันที่", "issuedDate"], ["พยาน", "witnessName"], ["วันที่บันทึกคำให้การ", "statementDate"], ["จำนวนแผ่นหมายเรียก", "summonsPages"], ["จำนวนแผ่นบันทึก", "statementPages"], ["เรื่องไต่สวนที่", "investigationNo"], ["ข้อเท็จจริงโดยย่อ", "caseFacts", "textarea"], ["วันที่เกิดเหตุ", "incidentDate"], ["สถานที่เกิดเหตุ", "incidentPlace"], ["ศาล", "courtName"], ["คดีหมายเลขดำ", "blackCaseNo"], ["วันนัด", "hearingDate"], ["เวลานัด", "hearingTime"], ["สถานที่ตั้งศาล", "courtAddress"], ["กอง/สำนักที่ส่งคืน", "returnOffice"], ["ส่งคืนภายใน (วัน)", "returnWithinDays"], ["หัวหน้าพนักงาน ป.ป.ท.", "signerName"], ["โทรศัพท์", "phone"], ["โทรสาร", "fax"], ["เจ้าของสำนวน", "officerName"]],
    [DOC_IDS.PROSECUTOR_WITNESS_SUMMONS_REPORT]: [["เลขที่หนังสือ", "letterNo"], ["วันที่", "issuedDate"], ["พนักงานอัยการ", "prosecutorName"], ["หนังสืออ้างถึงที่", "referenceLetterNo"], ["วันที่หนังสืออ้างถึง", "referenceLetterDate"], ["พยานรายที่ 1", "witnessName1"], ["พยานรายที่ 2", "witnessName2"], ["สำนักงานอัยการ", "prosecutorOffice"], ["จำนวนพยาน", "witnessCount"], ["จำเลย", "defendantName"], ["ศาล", "courtName"], ["คดีหมายเลขดำ", "blackCaseNo"], ["ผลการส่ง/เหตุส่งไม่ได้", "deliveryResult", "textarea"], ["หัวหน้าพนักงาน ป.ป.ท.", "signerName"], ["โทรศัพท์", "phone"], ["โทรสาร", "fax"], ["เจ้าของสำนวน", "officerName"]]
  });

  const SEARCH_INVESTIGATION_EDITOR_FIELDS = Object.freeze([
    ["ส่วนราชการ", "ownerUnit"],
    ["โทรศัพท์", "phone"],
    ["เลขที่หนังสือ", "letterNo"],
    ["วันที่", "issuedDate"],
    ["เรื่องที่สืบสวน", "investigationNo"],
    ["ประเภทคดี", "caseCategory"],
    ["รับมอบตามมาตรา 18/1", "intakeBasis18_1", "checkbox"],
    ["คดีประพฤติมิชอบตามมาตรา 18/4", "intakeBasis18_4", "checkbox"],
    ["วันที่รับเรื่อง", "receivedDate"],
    ["ผู้กล่าวหา", "complainantName"],
    ["ผู้ถูกกล่าวหา", "accusedName"],
    ["ตำแหน่งผู้ถูกกล่าวหา", "accusedPosition"],
    ["สังกัดผู้ถูกกล่าวหา", "accusedAgency"],
    ["พฤติการณ์การกระทำผิดโดยสังเขป", "allegationSummary", "textarea"],
    ["ผู้ดำเนินการไต่สวน", "inquiryBody"],
    ["คำสั่งแต่งตั้ง", "appointmentOrder"],
    ["เลขที่คำสั่งลับ", "appointmentSecretNo"],
    ["วันที่คำสั่ง", "appointmentDate"],
    ["ชื่อสมาชิกคนที่ 1", "committeeMember1Name"],
    ["ชื่อสมาชิกคนที่ 2", "committeeMember2Name"],
    ["ชื่อสมาชิกคนที่ 3", "committeeMember3Name"],
    ["การประชุมคณะกรรมการ ป.ป.ท. ครั้งที่", "boardMeetingNo"],
    ["วันที่ประชุม", "boardMeetingDate"],
    ["ชื่อผู้ถูกกล่าวหาตามมติ", "resolvedAccused"],
    ["ตำแหน่งผู้ถูกกล่าวหาตามมติ", "resolvedPosition"],
    ["ฐานความผิดทางอาญา", "criminalOffence", "textarea"],
    ["หนังสือถึงอัยการเลขที่", "prosecutorLetterNo"],
    ["วันที่หนังสือถึงอัยการ", "prosecutorLetterDate"],
    ["อัยการผู้ฟ้องคดี", "prosecutorOffice"],
    ["ผู้ถูกกล่าวหาที่ขอให้ดำเนินคดี", "prosecutedAccused"],
    ["ข้อเท็จจริงและความจำเป็นเร่งด่วน", "investigationFacts", "textarea"],
    ["ศาลที่มีเขตอำนาจออกหมาย", "competentCourt"],
    ["ผู้จัดทำรายงาน", "signerName"],
    ["ตำแหน่งผู้จัดทำ", "signerRole"],
    ["ความเห็นผู้บังคับบัญชาชั้นต้น", "supervisorOpinion", "textarea"],
    ["ชื่อผู้บังคับบัญชาชั้นต้น", "supervisorName"],
    ["ตำแหน่งผู้บังคับบัญชาชั้นต้น", "supervisorPosition"],
    ["ความเห็นผู้อำนวยการ", "directorOpinion", "textarea"],
    ["ชื่อผู้อำนวยการ", "directorName"],
    ["สำนัก/กองของผู้อำนวยการ", "directorUnit"],
    ["ความเห็นรองเลขาธิการ/ผู้ช่วยเลขาธิการ", "deputOpinion", "textarea"],
    ["ชื่อรองเลขาธิการ/ผู้ช่วยเลขาธิการ", "deputName"],
    ["ความเห็นเลขาธิการ", "secretaryOpinion", "textarea"],
    ["ชื่อผู้ลงนามความเห็นเลขาธิการ", "secretaryOpinionSignerName"],
    ["ชื่อเลขาธิการผู้เสนอประธานกรรมการ ป.ป.ท.", "forwardingSecretaryName"]
  ]);

  const SEIZURE_EDITOR_FIELDS = Object.freeze([
    ["เขียนที่", "writtenAt"],
    ["วัน เดือน ปี", "recordedDate"],
    ["เจ้าหน้าที่ผู้ตรวจยึด/อายัด", "officers", "textarea"],
    ["สิ่งที่ตรวจยึด/อายัด", "seizedItems", "textarea"],
    ["พฤติการณ์ในการตรวจยึด/อายัด", "circumstances", "textarea"],
    ["ตรวจยึด/อายัดได้จาก", "seizedFrom", "textarea"],
    ["สถานที่ตรวจยึด/อายัด", "searchLocation", "textarea"],
    ["วัน/เวลาเริ่มและสิ้นสุด", "searchPeriod"],
    ["ผู้ครอบครองของกลาง", "custodianName"],
    ["เจ้าหน้าที่ผู้ตรวจยึด/อายัด", "seizingOfficerName"],
    ["เจ้าหน้าที่ผู้ร่วมตรวจยึด/อายัด", "jointOfficerName"],
    ["พยานที่ร่วมตรวจยึด/อายัด", "witnessName"],
    ["เจ้าหน้าที่ผู้บันทึก/อ่าน", "recordingOfficerName"],
    ["ผู้รับของกลาง", "recipientName"],
    ["ชื่อผู้รับในวงเล็บ", "recipientPrintedName"],
    ["ตำแหน่งผู้รับ", "recipientPosition"],
    ["วันที่รับ", "receivedDate"]
  ]);

  const SEARCH_REPORT_EDITOR_FIELDS = Object.freeze([
    ["เลขที่หนังสือ", "letterNo"],
    ["วัน เดือน ปี", "issuedDate"],
    ["ศาลผู้รับหนังสือ", "courtName"],
    ["ศาลที่ออกหมายค้น", "warrantCourt"],
    ["หมายค้นเลขที่", "warrantNo"],
    ["วันที่ออกหมายค้น", "warrantDate"],
    ["จำนวนแผ่นสิ่งที่ส่งมาด้วย", "attachmentPages"],
    ["บ้านเลขที่ตรวจค้น", "houseNo"],
    ["วัตถุประสงค์การค้น", "searchPurpose", "textarea"],
    ["วันที่ตรวจค้น", "searchDate"],
    ["เวลาเริ่มตรวจค้น", "startedAt"],
    ["เวลาสิ้นสุด", "endedAt"],
    ["ผลการตรวจค้น", "searchResult", "textarea"],
    ["ผู้ถูกตรวจยึด/จับกุม", "followUpSubject", "textarea"],
    ["ผู้ลงนาม", "signerName"],
    ["สำนัก/หน่วยงาน", "ownerUnit"],
    ["โทรศัพท์", "phone"],
    ["โทรสาร", "fax"],
    ["เจ้าของสำนวน", "officerName"]
  ]);

  const SEARCH_RECORD_EDITOR_FIELDS = Object.freeze([
    ["เขียนที่", "writtenAt"],
    ["วัน เดือน ปี", "recordedDate"],
    ["เวลาเริ่มตรวจค้น", "startedAt"],
    ["เจ้าหน้าที่ผู้ตรวจค้น", "searchOfficers", "textarea"],
    ["สถานที่ตรวจค้น", "searchLocation", "textarea"],
    ["บ้านเลขที่", "houseNo"],
    ["ถนน", "road"],
    ["ตำบล/แขวง", "subdistrict"],
    ["อำเภอ/เขต", "district"],
    ["จังหวัด", "province"],
    ["เจ้าของหรือผู้ดูแลสถานที่", "locationOwner"],
    ["เหตุในการตรวจค้น", "searchReason", "textarea"],
    ["บุคคลที่พบ", "personFound"],
    ["ความเกี่ยวข้องของบุคคลที่พบ", "personRole"],
    ["บุคคลที่รับทราบวัตถุประสงค์", "informedPerson"],
    ["ผู้ที่ดูการแสดงความบริสุทธิ์ก่อนค้น", "preSearchWitness"],
    ["ผลการตรวจค้น", "searchResult", "textarea"],
    ["เวลาสิ้นสุด", "endedAt"],
    ["ผู้ที่ดูการแสดงความบริสุทธิ์หลังค้น", "postSearchWitness"],
    ["ผู้รับฟังการอ่านบันทึก", "readToPerson"],
    ["ผู้ลงนามเจ้าของสถานที่", "locationOwnerSigner"],
    ["เจ้าหน้าที่ผู้ตรวจค้น 1", "searchOfficerSigner1"],
    ["เจ้าหน้าที่ผู้ตรวจค้น 2", "searchOfficerSigner2"],
    ["เจ้าหน้าที่ผู้บันทึก/อ่าน", "recordingOfficerSigner"]
  ]);

  const SEARCH_ENVELOPE_EDITOR_FIELDS = Object.freeze([
    ["ศาล", "courtName"],
    ["สำนัก/กอง", "unitName"],
    ["คดีอาญาเรื่องที่", "criminalCaseNo"],
    ["ข้อหา", "charge", "textarea"],
    ["อายุความ (ปี)", "limitationYears"],
    ["วันขาดอายุความ", "limitationDate"],
    ["ชื่อผู้ร้อง", "petitionerName"],
    ["โทรศัพท์ผู้ร้อง", "petitionerPhone"]
  ]);

  const COURT_SEARCH_WARRANT_EDITOR_FIELDS = Object.freeze([
    ["หมายค้นเลขที่", "warrantNo"],
    ["ศาล", "courtName"],
    ["วันที่ออกหมาย", "issuedDate"],
    ["ชื่อผู้ร้อง", "petitionerName"],
    ["ตำแหน่งผู้ร้อง", "petitionerPosition"],
    ["สถานที่ค้น", "searchLocation", "textarea"],
    ["บ้านเลขที่", "houseNo"],
    ["หมู่", "villageNo"],
    ["ตำบล", "subdistrict"],
    ["อำเภอ", "district"],
    ["จังหวัด", "province"],
    ["สิ่งของที่ต้องการค้น", "searchTarget", "textarea"],
    ["บุคคลที่ต้องการค้น", "personTarget"],
    ["หัวหน้าชุดตรวจค้น", "leadOfficer"],
    ["วันที่ค้น", "searchDate"],
    ["เวลาเริ่ม", "startedAt"],
    ["เวลาสิ้นสุด", "endedAt"],
    ["ผู้พิพากษา", "judgeName"],
    ["วันที่จัดการตามหมาย", "executionDate"],
    ["เจ้าพนักงานผู้จัดการตามหมาย", "executingOfficer"],
    ["ผู้รับทราบ", "acknowledgingPerson"],
    ["ความเกี่ยวข้อง", "acknowledgingRelation"]
  ]);

  const COURT_PROCEEDING_EDITOR_FIELDS = Object.freeze([
    ["คำร้องเลขที่", "petitionNo"],
    ["หมายค้นเลขที่", "warrantNo"],
    ["ศาล", "courtName"],
    ["วันที่พิจารณา", "proceedingDate"],
    ["ชื่อผู้ร้อง", "petitionerName"],
    ["ตำแหน่งผู้ร้อง", "petitionerPosition"],
    ["เวลาออกนั่งพิจารณา", "hearingTime"],
    ["จำนวนพยานผู้ร้อง", "witnessCount"],
    ["เหตุผลและคำสั่งศาล", "courtOrderReason", "textarea"],
    ["วันที่อนุญาตให้ค้น", "permittedSearchDate"],
    ["เวลาเริ่มค้น", "permittedStartTime"],
    ["เวลาสิ้นสุด", "permittedEndTime"],
    ["กำหนดส่งบันทึกภายใน (วัน)", "reportWithinDays"],
    ["สำเนาที่ให้ถ่ายเก็บ", "retainedCopy"],
    ["ผู้พิพากษา", "judgeName"]
  ]);

  const PETITIONER_WITNESS_EDITOR_FIELDS = Object.freeze([
    ["คำร้องเลขที่", "petitionNo"], ["หมายค้นเลขที่", "warrantNo"], ["ศาล", "courtName"],
    ["วันที่ให้การ", "statementDate"], ["ชื่อผู้ร้อง", "petitionerName"], ["ตำแหน่งผู้ร้อง", "petitionerPosition"],
    ["วันเกิด", "birthDate"], ["อายุ", "age"], ["สังกัดและที่ตั้ง", "agencyAddress", "textarea"],
    ["เป็นผู้ร้อง", "relationPetitioner", "checkbox"], ["เป็นผู้รับมอบหมาย", "relationDelegate", "checkbox"],
    ["ข้อเท็จจริงจากการสืบสวน", "investigationFacts", "textarea"], ["สถานที่ที่จะค้น", "searchLocation", "textarea"],
    ["เจ้าบ้าน/ผู้ครอบครอง", "locationOwner"], ["อายุเจ้าบ้าน", "locationOwnerAge"],
    ["เลขประจำตัวประชาชนเจ้าบ้าน", "locationOwnerId"],
    ["หน่วยงานผู้ร้อง", "requestingAgency"],
    ["ผู้ถูกกล่าวหาที่มีหมายจับ", "wantedAccusedName"], ["อายุผู้ถูกกล่าวหา", "wantedAccusedAge"],
    ["เลขประจำตัวประชาชนผู้ถูกกล่าวหา", "wantedAccusedId"], ["ภูมิลำเนาผู้ถูกกล่าวหา", "wantedAccusedAddress", "textarea"],
    ["สถานที่หลบหนี", "wantedAccusedHideout", "textarea"], ["พยานหลักฐาน", "evidenceDescription", "textarea"],
    ["สถานที่เก็บพยานหลักฐาน", "evidenceLocation", "textarea"],
    ["เพื่อพบและยึดสิ่งของเป็นพยานหลักฐาน", "groundEvidence", "checkbox"],
    ["สิ่งของมีไว้หรือได้มาโดยผิดกฎหมาย", "groundIllegalThing", "checkbox"],
    ["ตามคำพิพากษาหรือคำสั่งศาล", "groundCourtOrder", "checkbox"],
    ["เพื่อพบผู้ถูกกล่าวหาตามหมายจับ", "groundAccused", "checkbox"],
    ["บุคคลถูกหน่วงเหนี่ยวโดยมิชอบ", "groundUnlawfulDetention", "checkbox"],
    ["สิ่งของหรืออุปกรณ์เกี่ยวกับความผิด", "groundOffenceEquipment", "checkbox"],
    ["ผู้พิพากษา", "judgeName"]
  ]);

  const SEARCH_WARRANT_PETITION_EDITOR_FIELDS = Object.freeze([
    ["ศาล", "courtName"], ["วันที่ยื่นคำร้อง", "petitionDate"], ["ชื่อผู้ร้อง", "petitionerName"],
    ["ตำแหน่งผู้ร้อง", "petitionerPosition"], ["อายุผู้ร้อง", "petitionerAge"], ["สถานที่ทำงาน", "workplace", "textarea"],
    ["ตำบลสถานที่ทำงาน", "workplaceSubdistrict"], ["อำเภอสถานที่ทำงาน", "workplaceDistrict"],
    ["จังหวัดสถานที่ทำงาน", "workplaceProvince"], ["โทรศัพท์", "petitionerPhone"],
    ["สถานที่ที่จะค้น", "searchLocation", "textarea"], ["เจ้าบ้าน/ผู้ครอบครอง", "locationOwner"],
    ["อายุเจ้าบ้าน", "locationOwnerAge"], ["เลขประจำตัวประชาชนเจ้าบ้าน", "locationOwnerId"],
    ["พฤติการณ์เหตุออกหมายค้น", "searchCircumstances", "textarea"],
    ["หน่วยงานผู้ร้อง", "requestingAgency"],
    ["ผู้ถูกกล่าวหาที่มีหมายจับ", "wantedAccusedName"], ["อายุผู้ถูกกล่าวหา", "wantedAccusedAge"],
    ["เลขประจำตัวประชาชนผู้ถูกกล่าวหา", "wantedAccusedId"], ["ที่อยู่ผู้ถูกกล่าวหา", "wantedAccusedAddress", "textarea"],
    ["สถานที่หลบหนี", "wantedAccusedHideout", "textarea"], ["พยานหลักฐาน", "evidenceDescription", "textarea"],
    ["สถานที่เก็บพยานหลักฐาน", "evidenceLocation", "textarea"],
    ["วัตถุประสงค์การค้น", "searchPurpose", "textarea"],
    ["เพื่อพบและยึดสิ่งของเป็นพยานหลักฐาน", "groundEvidence", "checkbox"],
    ["สิ่งของมีไว้หรือได้มาโดยผิดกฎหมาย", "groundIllegalThing", "checkbox"],
    ["ตามคำพิพากษาหรือคำสั่งศาล", "groundCourtOrder", "checkbox"],
    ["เพื่อพบผู้ถูกกล่าวหาตามหมายจับ", "groundAccused", "checkbox"],
    ["บุคคลถูกหน่วงเหนี่ยวโดยมิชอบ", "groundUnlawfulDetention", "checkbox"],
    ["สิ่งของหรืออุปกรณ์เกี่ยวกับความผิด", "groundOffenceEquipment", "checkbox"],
    ["ชื่อผู้เข้าตรวจค้น", "searchOfficer"], ["วันที่ค้น", "searchDate"], ["เวลาค้น", "searchTime"],
    ["เคย/ไม่เคยยื่นคำร้อง", "priorRequestMade"], ["ศาลที่เคยยื่น", "priorCourtName"],
    ["เหตุแห่งคำร้องเดิม", "priorRequestBasis", "textarea"], ["คำสั่งศาลเดิม", "priorCourtOrder", "textarea"]
  ]);

  function editorField(label, path, value, kind, editable) {
    const disabled = editable ? "" : " disabled";
    const control = kind === "checkbox"
      ? `<input type="checkbox" data-a5-outcome-path="${path}"${value === true ? " checked" : ""}${disabled}>`
      : kind === "textarea"
      ? `<textarea class="a5-textarea" data-a5-outcome-path="${path}" rows="3"${disabled}>${escapeHtml(value)}</textarea>`
      : `<input type="text" class="a5-input" data-a5-outcome-path="${path}" value="${escapeHtml(value)}"${disabled}>`;
    return `<label class="a5-field-block${kind === "textarea" ? " a5-span-2" : ""}"><span>${escapeHtml(label)}</span>${control}</label>`;
  }

  function renderOutcomeEditorA5(state = {}, formId, options = {}) {
    const meta = MANIFEST.find(item => item.formId === formId);
    if (!meta) return `<div class="a5-alert-error">ไม่พบแบบเอกสาร</div>`;
    const editable = options.editable !== false;
    const stored = object(state.outcomeDocuments?.[formId]);
    const fields = { ...defaultPayload(formId, state), ...object(stored.fields) };
    const schema = BATCH7_EDITOR_FIELDS[formId] || BATCH8_EDITOR_FIELDS[formId]
      || (formId === DOC_IDS.SEARCH_INVESTIGATION_REPORT
      ? SEARCH_INVESTIGATION_EDITOR_FIELDS
      : formId === DOC_IDS.SEARCH_WARRANT_PETITION
      ? SEARCH_WARRANT_PETITION_EDITOR_FIELDS
      : formId === DOC_IDS.PETITIONER_WITNESS_STATEMENT
      ? PETITIONER_WITNESS_EDITOR_FIELDS
      : formId === DOC_IDS.COURT_PROCEEDING_REPORT
      ? COURT_PROCEEDING_EDITOR_FIELDS
      : formId === DOC_IDS.COURT_SEARCH_WARRANT
      ? COURT_SEARCH_WARRANT_EDITOR_FIELDS
      : formId === DOC_IDS.SEARCH_WARRANT_ENVELOPE
      ? SEARCH_ENVELOPE_EDITOR_FIELDS
      : formId === DOC_IDS.SEARCH_RECORD
      ? SEARCH_RECORD_EDITOR_FIELDS
      : formId === DOC_IDS.SEARCH_WARRANT_EXECUTION_REPORT
      ? SEARCH_REPORT_EDITOR_FIELDS
      : formId === DOC_IDS.SEIZURE_RECORD
        ? SEIZURE_EDITOR_FIELDS
        : []);
    const controls = schema.map(([label, path, kind]) => editorField(label, path, fields[path], kind, editable)).join("");
    return `<div class="a5-outcome-editor" data-doc-id="${escapeHtml(formId)}">
<div class="a5-form-grid">${controls}</div>
<div class="ws-actions">
  <button type="button" class="ws-button secondary" data-a5-outcome-action="save" data-doc-id="${escapeHtml(formId)}"${editable ? "" : " disabled"}>บันทึกร่าง</button>
  <button type="button" class="ws-button primary" data-a5-outcome-action="submit" data-doc-id="${escapeHtml(formId)}"${editable ? "" : " disabled"}>ส่งเอกสาร</button>
</div>
</div>`;
  }

  function captureOutcomeEditorA5(container, basePayload = {}) {
    const payload = copy(basePayload);
    container?.querySelectorAll?.("[data-a5-outcome-path]").forEach(control => {
      const path = control.dataset?.a5OutcomePath;
      if (path) payload[path] = control.type === "checkbox" ? Boolean(control.checked) : control.value;
    });
    return payload;
  }

  function executeOutcomeDocumentAction(sourceState, actor = {}, command = {}) {
    const state = copy(sourceState);
    const formId = text(command.formId);
    const meta = MANIFEST.find(item => item.formId === formId);
    if (!meta) return { ok: false, error: "FORM_NOT_FOUND", messageTh: "ไม่พบแบบเอกสาร", state };
    if (!text(actor.id) || text(actor.role) !== meta.authorRole) {
      return { ok: false, error: "FORBIDDEN_ACTOR", messageTh: "ผู้รับผิดชอบสำนวนเท่านั้นที่จัดทำเอกสารนี้ได้", state };
    }
    const workflowStage = text(state.workflow?.stage);
    if (workflowStage !== meta.stage) {
      const messageTh = meta.stage === "a5-prosecutor"
        ? "เอกสารนี้จัดทำได้เฉพาะขั้นดำเนินการชั้นอัยการ"
        : "เอกสารนี้จัดทำได้เฉพาะขั้นไต่สวน";
      return { ok: false, error: "WRONG_STAGE", messageTh, state };
    }
    const ownerId = text(state.assignment?.primaryOfficerId || state.assignment?.legalOwner || state.assignment?.approvedOfficer || state.inquiry?.inquiry644?.investigator || state.inquiry?.intake?.investigator);
    if (meta.authorRole === "investigator" && !ownerId) {
      return { ok: false, error: "OWNER_NOT_ASSIGNED", messageTh: "ยังไม่พบผู้รับผิดชอบสำนวนที่ยืนยันแล้ว", state };
    }
    if (meta.authorRole === "investigator" && text(actor.id) !== ownerId) {
      return { ok: false, error: "FORBIDDEN_ACTOR", messageTh: "ผู้รับผิดชอบสำนวนเท่านั้นที่จัดทำเอกสารนี้ได้", state };
    }
    const action = text(command.action);
    if (action !== "save" && action !== "submit") {
      return { ok: false, error: "UNSUPPORTED_ACTION", messageTh: "ไม่รองรับคำสั่งเอกสารนี้", state };
    }
    state.outcomeDocuments = object(state.outcomeDocuments);
    const current = object(state.outcomeDocuments[formId]);
    const payload = copy(command.payload || current.fields || {});
    const at = text(command.at) || new Date().toISOString();

    if (!state.outcomeDocuments[formId]) {
      if (action === "submit") {
        const missing = validateRequired(formId, payload);
        if (missing.length) return { ok: false, error: "MISSING_REQUIRED_FIELD", missing, messageTh: `ข้อมูลไม่ครบ: ${missing.join(", ")}`, state };
        state.outcomeDocuments[formId] = {
          formId,
          status: "SUBMITTED",
          fields: payload,
          createdAt: at,
          submittedAt: at,
          submittedBy: text(actor.id)
        };
        return { ok: true, code: "OUTCOME_DOC_SUBMITTED", state };
      }
      state.outcomeDocuments[formId] = {
        formId,
        status: "DRAFT",
        fields: payload,
        createdAt: at,
        updatedAt: at
      };
      return { ok: true, code: "OUTCOME_DOC_DRAFT_CREATED", state };
    }
    if (action === "submit") {
      if (current.status !== "DRAFT") return { ok: false, error: "INVALID_TRANSITION", messageTh: "เอกสารถูกส่งแล้ว", state };
      const missing = validateRequired(formId, payload);
      if (missing.length) return { ok: false, error: "MISSING_REQUIRED_FIELD", missing, messageTh: `ข้อมูลไม่ครบ: ${missing.join(", ")}`, state };
      state.outcomeDocuments[formId] = {
        ...current,
        status: "SUBMITTED",
        fields: payload,
        submittedAt: at,
        submittedBy: text(actor.id)
      };
      return { ok: true, code: "OUTCOME_DOC_SUBMITTED", state };
    }
    if (current.status !== "DRAFT") return { ok: false, error: "SNAPSHOT_IMMUTABLE", messageTh: "เอกสารส่งแล้ว แก้ไขไม่ได้", state };
    state.outcomeDocuments[formId] = {
      ...current,
      fields: payload,
      updatedAt: at,
      updatedBy: text(actor.id)
    };
    return { ok: true, code: "OUTCOME_DOC_DRAFT_SAVED", state };
  }

  function renderBatch8LetterHead(fields = {}) {
    return `<div class="a5-letter-head-row"><p>ที่ ปป ${dot(fields.letterNo, "00..../....")}</p><p>สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div><p class="a5-paper-right">${dot(fields.issuedDate, "(วัน เดือน ปี)")}</p>`;
  }

  function renderBatch8LetterFooter(fields = {}, signerTitle = "เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ<br>หรือผู้ที่ได้รับมอบหมาย", unitLabel = "สำนัก/กอง", unitPlaceholder = "........................................") {
    const sourceUnitLabel = escapeHtml(text(fields.footerUnitLabel) || unitLabel);
    const sourceUnitPlaceholder = escapeHtml(text(fields.footerUnitPlaceholder) || unitPlaceholder);
    return `<div class="a5-signature-block"><p>ขอแสดงความนับถือ</p><p>(${dot(fields.signerName)})</p><p>${signerTitle}</p></div><div class="a5-letter-footer"><p>${sourceUnitLabel} ${dot(fields.ownerUnit, sourceUnitPlaceholder)}</p><p>โทร. ${dot(fields.phone)}</p><p>โทรสาร ${dot(fields.fax)}</p><p>(${dot(fields.officerName, "ระบุชื่อ-สกุลเจ้าของสำนวน")})</p></div>`;
  }

  function renderCustodyBasis(fields = {}) {
    const choices = [
      fields.custodyBasisFlagrant === true ? `<p>ความผิดซึ่งหน้าฐาน ${dot(fields.flagrantOffenceCharge)}</p>` : "",
      fields.custodyBasisWarrant === true ? `<p>ตามหมายจับเลขที่ ${dot(fields.warrantNo)} ศาลผู้ออกหมาย ศาลอาญาทุจริตและประพฤติมิชอบ ${dot(fields.warrantCourt)} ลงวันที่ ${dot(fields.warrantDate)}</p>` : "",
      fields.custodyBasisOrder === true ? `<p>ตามคำสั่ง ${dot(fields.custodyOrderText)} เหตุแห่งการออกคำสั่ง ${dot(fields.custodyOrderReason)}</p>` : "",
      fields.custodyBasisOther === true ? `<p>กรณีอื่น ๆ ที่มีกฎหมายกำหนดให้อำนาจ ${dot(fields.otherLegalAuthority)}</p>` : ""
    ].filter(Boolean);
    if (choices.length === 1) return choices[0];
    return `<p>${mark(fields.custodyBasisFlagrant)} ความผิดซึ่งหน้าฐาน ${dot(fields.flagrantOffenceCharge)}</p><p>${mark(fields.custodyBasisWarrant)} ตามหมายจับเลขที่ ${dot(fields.warrantNo)} ศาลผู้ออกหมาย ศาลอาญาทุจริตและประพฤติมิชอบ ${dot(fields.warrantCourt)} ลงวันที่ ${dot(fields.warrantDate)}</p><p>${mark(fields.custodyBasisOrder)} ตามคำสั่ง ${dot(fields.custodyOrderText)} เหตุแห่งการออกคำสั่ง ${dot(fields.custodyOrderReason)}</p><p>${mark(fields.custodyBasisOther)} กรณีอื่น ๆ ที่มีกฎหมายกำหนดให้อำนาจ ${dot(fields.otherLegalAuthority)}</p>`;
  }

  function renderCustodyArrestNarrative(fields = {}) {
    if (fields.custodyBasisWarrant === true) {
      return `<p>ก่อนจับกุม เจ้าหน้าที่ชุดจับกุมได้ร่วมกันสืบสวนหาข่าวว่าทราบว่า ${dot(fields.detaineeFirstName)} ${dot(fields.detaineeLastName)} อายุ ${dot(fields.detaineeAge)} ปี ผู้ถูกกล่าวหาตามหมายจับของศาลอาญาทุจริตและประพฤติมิชอบ ${dot(fields.warrantCourt)} ที่ ${dot(fields.warrantNo)} ลงวันที่ ${dot(fields.warrantDate)} ได้หลบหนีและมาปรากฏตัวอยู่ที่บริเวณ ${dot(fields.arrestPlace)} ต่อมาเมื่อวันที่ ${dot(fields.arrestDate)} เวลาประมาณ ${dot(fields.arrestTime)} น. เจ้าหน้าที่ชุดจับกุมจึงได้ไปตรวจสอบและสืบสวนหาข่าวเพิ่มเติมบริเวณสถานที่ดังกล่าวจนกระทั่งพบ ${dot(fields.detaineeFirstName)} ${dot(fields.detaineeLastName)} ยืนอยู่บริเวณ ${dot(fields.arrestPlace)} เจ้าหน้าที่ชุดจับกุมจึงได้เข้าไปแสดงตัวเป็นเจ้าพนักงาน ป.ป.ท.และสอบถามเบื้องต้นจึงทราบว่าคือผู้ถูกกล่าวหาตามหมายจับดังกล่าว และได้อ่านดูหมายจับแล้วยอมรับว่าเป็นบุคคลตามหมายจับนี้จริงและไม่เคยถูกจับกุมตามหมายจับนี้มาก่อน จึงได้แจ้งสิทธิและรายละเอียดเกี่ยวกับเหตุแห่งการจับกุมให้ผู้ถูกกล่าวหาทราบว่าต้องถูกจับตามหมายจับดังกล่าว พร้อมทั้งแจ้งสิทธิของผู้ถูกจับกุมตามกฎหมายให้ทราบแล้ว จึงได้ควบคุมตัวละดำเนินการตามกฎหมายต่อไป ${dot(fields.arrestCircumstances, "รายละเอียดเพิ่มเติม")}</p>`;
    }
    return `<p>${dot(fields.arrestCircumstances)}</p>${renderCustodyBasis(fields)}`;
  }

  function renderCustodySignatureBlocks(fields = {}) {
    return `<div class="a5-signature-block"><p>ลงชื่อ ${dot(fields.detaineeSignerName)} ผู้ถูกควบคุมตัว</p><p>ลงชื่อ ${dot(fields.detaineeSignerName)} ผู้ถูกควบคุมตัว</p><p>ลงชื่อ ${dot(fields.officerSignerName)} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.<br>ตำแหน่ง/ผู้ทำบันทึกควบคุมตัว</p><p>ลงชื่อ ${dot(fields.officerSignerName)} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.<br>ตำแหน่ง/ผู้ทำบันทึกควบคุมตัว</p><p>ลงชื่อ ${dot(fields.witnessSignerName)} พยาน(ถ้ามี)</p><p>ลงชื่อ ${dot(fields.witnessSignerName)} พยาน(ถ้ามี)</p></div>`;
  }

  function renderArrestRecord(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper">
<section class="a5-paper-page">
<h2 class="a5-paper-title">ตัวอย่างบันทึกการจับกุม</h2>
<p>ปจว. ข้อ ${dot(fields.dailyRecordNo)} เวลา ${dot(fields.dailyRecordTime)} น. เรื่องที่ ${dot(fields.investigationNo)} บัญชีของกลางลำดับที่ ${dot(fields.evidenceAccountNo)}</p>
<p class="a5-paper-right">สถานที่บันทึก ${dot(fields.recordedAt)}<br>วัน/เดือน/ปี ที่บันทึก ${dot(fields.recordedDate)} เวลาประมาณ ${dot(fields.recordedTime)} น.</p>
<p>วัน/เดือน/ปี ที่จับกุม ${dot(fields.arrestDate)} เวลาประมาณ ${dot(fields.arrestTime)} น.</p><p>สถานที่จับกุม ${dot(fields.arrestPlace)}</p>
<p>สำนักงาน ป.ป.ท. ภายใต้การอำนวยการของ (เลขาธิการ/รองเลขาธิการ/ผู้ช่วยเลขาธิการ/หัวหน้าพนักงาน ป.ป.ท.) ${dot(fields.commandOfficerName)} ได้สั่งการให้ ${dot(fields.arrestingOfficers, "รายชื่อเจ้าหน้าที่ผู้จับกุม")}</p>
<p>เจ้าพนักงานตำรวจกองบังคับการ ${dot(fields.policeUnit, "ชื่อหน่วยงาน")} ภายใต้การอำนวยการของ ${dot(fields.policeCommandOfficerName)} ได้สั่งการให้ ${dot(fields.policeArrestingOfficers, "รายชื่อเจ้าหน้าที่ผู้จับกุม")}</p>
<p>ได้ร่วมกันจับกุมตัว ${dot(fields.arrestedName)} หมายเลขบัตร ${dot(fields.citizenId)} ที่อยู่ ${dot(fields.address)} ตามหมายจับของศาล ${dot(fields.warrantCourt)} ที่ ${dot(fields.warrantNo)} ลงวันที่ ${dot(fields.warrantDate)}</p>
<p>เจ้าหน้าที่ผู้จับได้แจ้งข้อกล่าวหาให้ผู้ถูกจับทราบว่า “${dot(fields.charge, "ระบุฐานความผิด")}”</p>
<p>ได้แจ้งแก่ผู้ถูกจับทราบถึงสิทธิว่า</p><ul><li>ผู้ถูกจับมีสิทธิที่จะไม่ให้การหรือให้การก็ได้</li><li>ถ้อยคำของผู้ถูกจับนั้นอาจใช้เป็นพยานหลักฐานในการพิจารณาคดีได้</li><li>ผู้ถูกจับมีสิทธิที่จะพบและปรึกษาทนายหรือผู้ซึ่งจะเป็นทนายความ</li><li>ถ้าผู้ถูกจับประสงค์จะแจ้งให้ญาติ หรือผู้ซึ่งตนไว้วางใจทราบถึงการจับกุมที่สามารถดำเนินการได้ โดยสะดวกและไม่เป็นการขัดขวางการจับหรือการควบคุมผู้ถูกจับ หรือทำให้เกิดความไม่ปลอดภัยแก่บุคคลหนึ่งบุคคลใด เจ้าพนักงานสามารถอนุญาตให้ผู้ถูกจับดำเนินการได้ตามสมควรแก่กรณี</li></ul>
<p>พฤติการณ์และการกระทำของผู้ถูกจับ ${dot(fields.circumstances)}</p><p>(ลงชื่อ) ${dot(fields.arrestedSignerName)} ผู้ถูกจับกุม/รับบันทึกการจับ</p>
</section>
<section class="a5-paper-page">
<p>ผู้ถูกจับทราบสิทธิแล้ว</p><p>${mark(fields.declinesRight4)} ไม่ขอดำเนินการตามข้อ ๔ ${mark(fields.requestsRight4)} ขอดำเนินการตามข้อ ๔ และได้ดำเนินการเรียบร้อย</p>
<p>ขอให้การรับว่าเป็นบุคคลตามหมายจับ และยังไม่เคยถูกดำเนินคดีนี้มาก่อน ${dot(fields.warrantIdentityStatement)}</p>
<p>ในการจับกุมผู้ต้องหาครั้งนี้ เจ้าหน้าที่ชุดจับกุมได้กระทำไปตามอำนาจหน้าที่ โดยมีหมายจับศาล ${dot(fields.warrantCourt)} ที่ ${dot(fields.warrantNo)} ลงวันที่ ${dot(fields.warrantDate)}</p>
<p>ผู้ถูกจับรับทราบข้อกล่าวหาแล้วให้การ ${dot(fields.plea, "รับสารภาพ/ปฏิเสธ")}</p>
<p>ในการควบคุมตัวผู้ถูกจับ เจ้าหน้าที่ผู้จับกุมได้ทำการบันทึกภาพและเสียงอย่างต่อเนื่องในขณะจับกุมและควบคุมตัวผู้ถูกจับในชั้นจับกุมจนกระทั่งส่งตัวให้พนักงานสอบสวน ตามมาตรา ๒๒ วรรคหนึ่ง แห่งพระราชบัญญัติป้องกันและปราบปรามการทรมานและการกระทำให้บุคคลสูญหาย พ.ศ. ๒๕๖๕</p>
<p>ผู้จับกุมไม่ได้กระทำการใดๆ อันเป็นการทรมาน การกระทำที่โหดร้าย ไร้มนุษยธรรม หรือย่ำยีศักดิ์ศรีความเป็นมนุษย์ หรือกระทำให้บุคคลสูญหายแต่อย่างใด</p>
<p>เจ้าหน้าที่ผู้จับกุม ได้แจ้งข้อมูลเกี่ยวกับผู้ถูกควบคุมตัว ตามมาตรา ๒๒ วรรคสอง แห่งพระราชบัญญัติป้องกันและปราบปรามการทรมานและการกระทำให้บุคคลสูญหาย พ.ศ. ๒๕๖๕ ไปยัง นายอำเภอท้องที่ และพนักงานอัยการที่มีการควบคุมตัวโดยทันที https://arrest.dopa.go.th/ เมื่อวันที่ ${dot(fields.notificationDate)} เวลา ${dot(fields.notificationTime)} น. เรียบร้อยแล้ว</p>
<p>${mark(fields.noForceMajeure)} ไม่มีเหตุสุดวิสัยที่ไม่สามารถบันทึกภาพและเสียง ตามมาตรา ๒๒ วรรคหนึ่ง แห่งพระราชบัญญัติป้องกันและปราบปรามการทรมานและการกระทำให้บุคคลสูญหาย พ.ศ. ๒๕๖๕</p><p>${mark(fields.forceMajeure)} มีเหตุสุดวิสัยที่ไม่สามารถบันทึกภาพและเสียง เนื่องจาก ${dot(fields.forceMajeureReason)}</p>
<p>อนึ่ง ในการจับกุมครั้งนี้ เจ้าหน้าที่ผู้จับกุมทุกนายได้ปฏิบัติตามอำนาจหน้าที่ภายในขอบเขตของกฎหมาย มิได้ทำ หรือจัดให้ทำการใดๆ ซึ่งเป็นการให้คำมั่น สัญญา ขู่เข็ญ หลอกลวง ทรมาน ใช้กำลังบังคับ มิได้ทำให้ผู้ใดได้รับอันตรายแก่กายหรือจิตใจแต่อย่างใด มิได้ทำให้ทรัพย์สินของผู้ใดเสียหาย สูญหาย เสื่อมค่าหรือไร้ค่าแต่ประการใด และมิได้เบียดบังเอาทรัพย์สินของผู้ใด หรือเรียกเอาทรัพย์สินหรือประโยชน์อื่นใด มาเป็นประโยชน์ส่วนตัวหรือบุคคลอื่นแต่อย่างใด หรือกระทำการโดยมิชอบด้วยประการใดๆ ทั้งนี้เจ้าหน้าที่ผู้จับกุม ได้จัดทำบันทึกการจับกุมเรียบร้อยแล้ว เจ้าหน้าที่ผู้จับกุมได้อ่านบันทึกให้ผู้ถูกจับฟัง และผู้ถูกจับได้อ่านด้วยตนเองแล้วรับว่าถูกต้อง มีการดำเนินการตาม พ.ร.บ.ป้องกันและปราบปรามการทรมานและการกระทำให้บุคคลสูญหาย พ.ศ. ๒๕๖๕ มาตรา ๒๒ และได้มอบสำเนาบันทึกจับกุม ให้แก่ผู้ถูกจับเรียบร้อย</p><p>จึงให้ลงลายมือชื่อไว้เป็นหลักฐาน</p>
<p>(ลงชื่อ) ${dot(fields.arrestedSignerName)} ผู้ถูกจับกุม/รับบันทึกการจับ</p><p><strong>เจ้าหน้าที่/พนักงาน สำนักงาน ป.ป.ท. (ให้ใส่ชื่อ-สกุล ผู้จับกุมทั้งหมด)</strong></p><p>(ลงชื่อ) ${dot(fields.arrestingOfficerName)} ผู้จับกุม</p><p>(ลงชื่อ) ${dot(fields.jointArrestingOfficerName)} ผู้จับกุม</p><p>(ลงชื่อ) ${dot(fields.recordingOfficerName)} ผู้จับกุม/บันทึก/อ่าน</p><p><strong>เจ้าหน้าที่ตำรวจกองบังคับการ</strong></p><p>(ลงชื่อ) ${dot(fields.policeOfficerName1)} ผู้จับกุม (ลงชื่อ) ${dot(fields.policeOfficerName2)} ผู้จับกุม</p>
</section></article>`;
  }

  function renderCustodyNotificationRecord(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper">
<section class="a5-paper-page"><h2 class="a5-paper-title">ตัวอย่างแจ้งการควบคุมตัวตามมาตรา 22 วรรคสอง</h2><p class="a5-paper-center">(พ.ร.บ.ป้องกันและปราบปรามการทรมานและการกระทำให้บุคคลสูญหาย พ.ศ.2565)</p>
<p>รายการข้อมูลในการแจ้งการจับและควบคุมไปยังพนักงานอัยการ และนายอำเภอท้องที่ที่มีการควบคุมตัว และสำหรับในกรุงเทพมหานครให้แจ้งพนักงานอัยการ และผู้อำนวยการสำนักการสอบสวนและนิติการ กรมการปกครอง ผ่านทางศูนย์รับแจ้งโดยทันทีที่มีข้อมูลครบถ้วน ดังต่อไปนี้</p>
<p>(๑) ข้อมูลของผู้ถูกจับและควบคุม (หากไม่ทราบให้ระบุว่าไม่ทราบ) ชื่อ ${dot(fields.detaineeFirstName)} นามสกุล ${dot(fields.detaineeLastName)} อายุ ${dot(fields.detaineeAge)} ปี หมายเลขบัตรประชาชน ${dot(fields.citizenId)} ที่อยู่ ${dot(fields.detaineeAddress)} โทรศัพท์ ${dot(fields.detaineePhone)}</p>
<p>(๒) วัน เวลา และสถานที่ที่ทำการจับและควบคุม วันที่ ${dot(fields.arrestDate)} เวลา ${dot(fields.arrestTime)} น. ที่ ${dot(fields.arrestPlace)}</p>
<p>(๓) พฤติการณ์ในการจับและควบคุมบุคคลดังกล่าวโดยย่อ</p>${renderCustodyArrestNarrative(fields)}
<p>(๔) สถานที่ที่ควบคุมตัวบุคคลดังกล่าวไว้ ${dot(fields.custodyPlace)}</p><p>(๕) ภาพถ่ายผู้ถูกจับและควบคุม ตามข้อ (๑) (เป็นภาพแนบท้าย)</p>
<p>(๖) ชื่อเจ้าหน้าที่ของรัฐผู้รับผิดชอบ ${dot(fields.responsibleOfficerName)} ตำแหน่ง ${dot(fields.responsibleOfficerPosition)} โทรศัพท์ ${dot(fields.responsibleOfficerPhone)}</p><p>(๗) เหตุสุดวิสัยในกรณีที่ไม่สามารถบันทึกภาพและเสียงได้ในขณะจับและควบคุม (ถ้ามี) ${dot(fields.forceMajeureReason, "-")}</p><p>(๘) ชื่อเจ้าหน้าที่ของรัฐผู้แจ้ง ${dot(fields.notifyingOfficerName)} ตำแหน่ง ${dot(fields.notifyingOfficerPosition)} โทรศัพท์ ${dot(fields.notifyingOfficerPhone)}</p><p>ภาพแนบท้าย ตาม ข้อที่ ๕</p><p>ลงชื่อ ${dot(fields.officerSignerName)} พนักงาน ป.ป.ท/เจ้าหน้าที่ ป.ป.ท.<br>ตำแหน่ง/ผู้ทำบันทึกควบคุม</p><p>ลงชื่อ ${dot(fields.detaineeSignerName)} ผู้ถูกควบคุม</p><p>ลงชื่อ ${dot(fields.witnessSignerName)} พยาน (ถ้ามี)</p></section>
<section class="a5-paper-page"><h2 class="a5-paper-title">แบบบันทึกข้อมูลเกี่ยวกับผู้ถูกควบคุมตัวตามมาตรา ๒๓ แห่งพระราชบัญญัติป้องกัน<br>และปราบปรามการทรมานและการกระทำให้สูญหาย พ.ศ. ๒๕๖๕</h2><h3>๑ ข้อมูลอัตลักษณ์เกี่ยวกับผู้ถูกควบคุมตัว</h3><p>ชื่อ ${dot(fields.detaineeFirstName)} นามสกุล ${dot(fields.detaineeLastName)} อายุ ${dot(fields.detaineeAge)} ปี เลขบัตรประชาชน ${dot(fields.citizenId)} หนังสือเดินทาง ${dot(fields.passportNo)} หมายเลขเอกสารอื่นที่ใช้ระบุตัวตน ${dot(fields.otherIdentityDocument)} ที่อยู่ ${dot(fields.detaineeAddress)} เบอร์โทรศัพท์ ${dot(fields.detaineePhone)}</p><p>ตำหนิรูปพรรณที่เห็นเด่นชัด(สามารถเห็นได้ด้วยตาเปล่า) ${dot(fields.visibleMarks)}</p><p>รูปถ่ายของผู้ถูกควบคุม(ปรากฏตามที่แนบท้ายบันทึก)</p>
<h3>๒ ข้อมูลเกี่ยวกับวัน/เวลา/สถานที่ควบคุมตัว และเจ้าหน้าที่ของรัฐผู้ทำการควบคุมตัว</h3><p>วันที่ ${dot(fields.arrestDate)} เวลา ${dot(fields.arrestTime)} สถานที่ ${dot(fields.custodyPlace)} เจ้าหน้าที่ ${dot(fields.custodyOfficerName)} ตำแหน่ง ${dot(fields.custodyOfficerPosition)} โทรศัพท์ ${dot(fields.custodyOfficerPhone)}</p>
<h3>๓ คำสั่งที่ให้มีการควบคุมตัวและเหตุแห่งการออกคำสั่งนั้น</h3>${renderCustodyBasis(fields)}
<h3>๔ เจ้าหน้าที่ของรัฐผู้ออกคำสั่งให้ควบคุมตัว</h3><p>ชื่อ ${dot(fields.responsibleOfficerName)} ตำแหน่ง ${dot(fields.responsibleOfficerPosition)} สำนักงาน ป.ป.ท.</p><p>สถานที่ปลายทางที่รับตัว (กรณีที่มีการย้ายสถานที่) ชื่อสถานที่ปลายทาง ${dot(fields.destinationName)} ${dot(fields.destinationAddress)} เจ้าหน้าที่ของรัฐผู้รับผิดชอบการย้ายตัว ชื่อ ${dot(fields.transferOfficerName)} ตำแหน่ง ${dot(fields.transferOfficerPosition)} สำนักงาน ป.ป.ท. เบอร์โทรศัพท์ ${dot(fields.transferOfficerPhone)}</p>${renderCustodySignatureBlocks(fields)}</section>
<section class="a5-paper-page"><h3>๕ วัน/เวลา/สถานที่ของการปล่อยตัวผู้ถูกควบคุมตัว และผู้มารับตัวผู้ถูกควบคุมตัว/หรือส่งมอบตัว</h3><p>วันที่ ${dot(fields.releaseDate)} เวลา ${dot(fields.releaseTime)} สถานที่ปล่อยตัว/หรือมอบตัว ${dot(fields.releasePlace)} ผู้มารับตัว/รับมอบตัว(มี/ไม่มี) ชื่อ ${dot(fields.recipientName)} นามสกุกล ${dot(fields.recipientLastName)} เบอร์โทรศัพท์ ${dot(fields.recipientPhone)}</p>
<h3>๖ ข้อมูลเกี่ยวกับสภาพร่างกายและจิตใจของผู้ถูกควบคุมตัว (สามารถเห็นได้ด้วยตาเปล่า)</h3><p>ก่อนถูกควบคุมตัว ${dot(fields.physicalMentalBefore)} ก่อนการปล่อยตัวหรือส่งตัวให้พนักงานสอบสวน ${dot(fields.physicalMentalBeforeRelease)}</p><p>ในกรณีที่ผู้ถูกควบคุมตัวถึงแก่ความตายระหว่างการควบคุมตัว สาเหตุแห่งการตาย(เท่าที่ทราบเบื้องต้น) ${dot(fields.deathCause)} สถานที่เก็บศพ ${dot(fields.bodyStoragePlace)}</p><h3>๗ ข้อมูลอื่น ๆ ที่คณะกรรมการกำหนด</h3><p>${dot(fields.otherInformation)}</p>${renderCustodySignatureBlocks(fields)}</section>
<section class="a5-paper-page"><h2 class="a5-paper-title">บันทึกแนบท้ายเพิ่มเติม</h2><p>๘. เหตุสุดวิสัยที่ไม่สามารถบันทึกภาพและเสียงตามมาตรา ๒๒ วรรคหนึ่งได้ ${dot(fields.additionalForceMajeure)}</p><p>๙. บันทึกอื่น ๆ เพิ่มเติม (ถ้ามี) ${dot(fields.additionalRecord)}</p>${renderCustodySignatureBlocks(fields)}
<p><strong>หมายเหตุ :</strong> ๑. ในกรณีข้อมูลตามรายการ ๑ – ๗ มีจำนวนมากให้ทำเป็นบันทึกแนบท้ายเพิ่มเติมในข้อ ๙</p><p>๒. ให้เจ้าหน้าที่ของรัฐซึ่งทำการจับและควบคุม ส่งตัวผู้ถูกควบคุมให้กับผู้รับมอบตัว พร้อมสำเนาบันทึกการควบคุมและเอกสารประกอบ(ถ้ามี) สำหรับบันทึกฉบับจริงให้เก็บรักษาเป็นหลักฐานตามที่แต่ละหน่วยงานกำหนดและเอกสารประกอบ(ถ้ามี) สำหรับบันทึกฉบับจริงให้เก็บรักษาเป็นหลักฐานตามที่แต่ละหน่วยงานกำหนด</p><p>๓. ให้ผู้รับมอบตัวจัดทำบันทึกการควบคุมในส่วนของตน โดยมีสำเนาบันทึกการควบคุมของผู้ควบคุมคนก่อน เป็นเอกสารแนบท้าย</p><p>๔. ภาพถ่ายของผู้ถูกควบคุมตัวตามข้อ ๑ ให้ทำเป็นเอกสารภาพถ่ายแนบท้ายบันทึกการควบคุมอย่างน้อยต้องเห็นเนื้อตัวร่างกายตามสภาพภายนอกขณะถูกควบคุมหรือขณะรับมอบตัว โดยไม่ต้องถอดเสื้อผ้า</p></section>
<section class="a5-paper-page"><h2 class="a5-paper-title">ภาพถ่ายของผู้ถูกควบคุม</h2><div class="a5-envelope-space"></div><p>ข้าพเจ้า ${dot(fields.detaineeFirstName)} ${dot(fields.detaineeLastName)} หมายเลขบัตร ${dot(fields.citizenId)} บ้านเลขที่ ${dot(fields.photoHouseNo)} ตำบล ${dot(fields.photoSubdistrict)} อำเภอ ${dot(fields.photoDistrict)} จังหวัด ${dot(fields.photoProvince)} ตามหมายจับของศาลอาญาทุจริตและประพฤติมิชอบ ${dot(fields.photoWarrantCourt)} ที่ ${dot(fields.photoWarrantNo)} ลงวันที่ ${dot(fields.photoWarrantDate)} ซึ่งต้องหาว่ากระทำความผิดฐาน “${dot(fields.photoCharge)}”</p><p>ขอรับรองว่าเป็นภาพถ่ายของข้าฯ ซึ่งไม่มีร่องรอยบาดแผลจากการถูกทำร้ายแต่อย่างใด บุคคลตามภาพเป็นตัวข้าฯ จริง จึงได้ลงชื่อไว้เป็นหลักฐาน ${dot(fields.photoCertification)}</p><p>ลงชื่อ ${dot(fields.officerSignerName)} พนักงาน ป.ป.ท/เจ้าหน้าที่ ป.ป.ท.<br>ตำแหน่ง/ผู้ทำบันทึกควบคุม</p><p>ลงชื่อ ${dot(fields.detaineeSignerName)} ผู้ถูกควบคุม</p><p>ลงชื่อ ${dot(fields.witnessSignerName)} พยาน (ถ้ามี)</p></section></article>`;
  }

  function renderPoliceCustodyRequest(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch8LetterHead(fields)}<p><strong>เรื่อง</strong> ขอความอนุเคราะห์ควบคุมตัวผู้ถูกกล่าวหาตามหมายจับไว้จนกว่าศาลเปิดทำการ</p><p><strong>เรียน</strong> ผู้กำกับการสถานีตำรวจ${dot(fields.policeStation)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> สำเนาบันทึกจับกุมและสำเนาเอกสารที่เกี่ยวข้อง จำนวน ${dot(fields.attachmentPages)} แผ่น</p><p>ด้วยศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(fields.warrantCourt)} ได้ออกหมายจับ ${dot(fields.accusedName)} บัตรประจำตัวประชาชนเลขที่ ${dot(fields.citizenId)} ตามหมายจับที่ ${dot(fields.warrantNo)} ลงวันที่ ${dot(fields.warrantDate)} ซึ่งต้องหาว่ากระทำความผิดฐาน ${dot(fields.charge)}</p><p>ต่อมา ${dot(fields.arrestingUnit, "เจ้าหน้าที่ตำรวจ/พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.")} ได้ร่วมกันจับกุม ${dot(fields.accusedName)} เพื่อนำส่งพนักงานอัยการ ${dot(fields.prosecutorOffice)} นำตัวผู้ถูกกล่าวหาฟ้องคดีศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(fields.courtName)} แต่เนื่องจากเป็นเวลาที่ศาลปิดทำการ จึงขอความอนุเคราะห์มายังท่านเพื่อควบคุมตัวผู้ถูกกล่าวหาไว้ที่ห้องควบคุมสถานีตำรวจ ${dot(fields.custodyRoom)} และเจ้าหน้าที่ตำรวจ/พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. จะได้มารับตัวผู้ถูกกล่าวหาไปส่งพนักงานอัยการ ${dot(fields.prosecutorOffice)} เพื่อฟ้องต่อศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(fields.courtName)} ในเวลาที่ศาลเปิดทำการต่อไป</p><p>จึงเรียนมาเพื่อโปรดพิจารณา</p>${renderBatch8LetterFooter(fields, "เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ<br>ผู้ที่ได้รับมอบหมาย")}<p class="a5-form-corner">ปปท. 8-29</p></article>`;
  }

  function renderProsecutorArrestTransferNotice(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch8LetterHead(fields)}<p><strong>เรื่อง</strong> แจ้งการจับกุมบุคคลตามหมายจับเพื่อฟ้องคดี</p><p><strong>เรียน</strong> อัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(fields.prosecutorOffice)}</p><p><strong>อ้างถึง</strong> หมายจับศาล ${dot(fields.warrantCourt)} ที่ ${dot(fields.warrantNo)} ลงวันที่ ${dot(fields.warrantDate)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> ${dot(fields.attachmentDescription, "สำเนาบันทึกจับกุม")}</p><p>ตามหมายจับที่อ้างถึง ศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(fields.warrantCourt)} ได้ออกหมายจับ ${dot(fields.accusedName)} ซึ่งต้องหาว่ากระทำความผิด ตามประมวลกฎหมายอาญา มาตรา ${dot(fields.criminalSection)} ประกอบมาตรา ${dot(fields.relatedSection)} ตามหมายจับที่ ${dot(fields.warrantNo)} ลงวันที่ ${dot(fields.warrantDate)} ความละเอียดแจ้งแล้ว นั้น</p><p>สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้ทำการจับกุม/ประสานขอความร่วมมือไปยังเจ้าหน้าที่ตำรวจสถานีตำรวจ ${dot(fields.policeStation)} เพื่อติดตามจับกุมตัวบุคคลตามหมายจับ และได้ทำการจับกุม ${dot(fields.accusedName)} เมื่อวันที่ ${dot(fields.arrestDate)} จึงขอแจ้งการจับกุม และนำส่งตัวผู้ถูกกล่าวหา มายังพนักงานอัยการ ${dot(fields.prosecutorOffice)} เพื่อดำเนินการตามหน้าที่และอำนาจต่อไป รายละเอียดปรากฎตามสิ่งที่ส่งมาด้วย</p><p>จึงเรียนมาเพื่อโปรดทราบ</p>${renderBatch8LetterFooter(fields, "เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ<br>หรือผู้ที่ได้มอบหมาย")}<p class="a5-form-corner">ปปท. 8-30</p></article>`;
  }

  function renderArrestReportMemorandum(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page"><h2 class="a5-paper-title">บันทึกข้อความ</h2><p><strong>ส่วนราชการ</strong> ${dot(fields.ownerUnit)} <strong>โทร.</strong> ${dot(fields.phone)}</p><p><strong>ที่</strong> ปป ${dot(fields.letterNo)} <strong>วันที่</strong> ${dot(fields.issuedDate)}</p><p><strong>เรื่อง</strong> รายงานการจับกุมผู้ถูกกล่าวหาตามหมายจับ</p><p><strong>เรียน</strong> ผอ. กอท.</p><p>ตามที่ กอง/สำนัก ${dot(fields.sourceUnit)} ได้ส่งสำเนาหมายจับศาล ${dot(fields.warrantCourt)} ลงวันที่ ${dot(fields.warrantDate)} และเอกสารหลักฐานที่เกี่ยวข้องให้กองอำนวยการต่อต้านการทุจริต ดำเนินการในส่วนที่เกี่ยวข้อง ความละเอียดทราบแล้วนั้น</p><p>บัดนี้ เจ้าหน้าที่ตำรวจ สังกัด/พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. ${dot(fields.arrestingUnit)} ได้ทำการจับกุมผู้ถูกกล่าวหา และได้นำตัวผู้ถูกกล่าวหายื่นฟ้องต่อศาลแล้ว เมื่อวันที่ ${dot(fields.filingDate)} จึงขอส่งสำเนาหมายจับและสำเนาเอกสารหลักฐานที่เกี่ยวข้อง พร้อมรับรองสำเนาถูกต้อง ดังนี้</p><p>๑. สำเนาบันทึกการจับกุมและสำเนาหมายจับ</p><p>๒. สำเนาหนังสือรายงานการปฏิบัติการตามหมาย (ศาล)</p><p>๓. สำเนาหนังสือแจ้งการจับกุมผู้ถูกกล่าวหาเพื่อฟ้องคดี (อัยการ)</p><p>๔. สำเนาตำหนิรูปพรรณผู้ถูกกล่าวหา</p><p>๖. สำเนาบัตรประจำตัวประชาชน/รายการข้อมูลทะเบียนราษฎรของผู้ถูกกล่าวหา</p><p>๗. เอกสารที่เกี่ยวข้องอย่างอื่น ๆ (ถ้ามี) มายังท่าน เพื่อดำเนินการในส่วนที่เกี่ยวข้องต่อไป รายละเอียดปรากฏตามเอกสารที่แนบมาพร้อมนี้</p><p>จึงเรียนมาเพื่อพิจารณา</p><div class="a5-signature-block"><p>(${dot(fields.signerName)})</p><p>ผอ. ${dot(fields.signerUnit)}</p></div><p class="a5-form-corner">ปปท. 8-31</p></article>`;
  }

  function renderArrestWarrantExecutionReport(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch8LetterHead(fields)}<p><strong>เรื่อง</strong> รายงานการปฏิบัติตามหมายจับ</p><p><strong>เรียน</strong> อธิบดีผู้พิพากษาศาล ${dot(fields.courtName)}</p><p><strong>อ้างถึง</strong> หมายจับศาล ${dot(fields.warrantCourt)} ที่ ${dot(fields.warrantNo)} ลงวันที่ ${dot(fields.warrantDate)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> สำเนาบันทึกจับกุมโดยมีหมายจับของศาล ${dot(fields.warrantCourt)} จำนวน ${dot(fields.attachmentPages)} แผ่น</p><p>ตามหมายจับที่อ้างถึง ศาล ${dot(fields.warrantCourt)} ได้ออกหมายจับ ${dot(fields.accusedName)} ซึ่งต้องหาว่ากระทำความผิดฐาน ${dot(fields.charge)} ความละเอียดแจ้งแล้ว นั้น</p><p>สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ขอเรียนว่า ${dot(fields.accusedName)} ได้ถูกจับกุมตัว เมื่อวันที่ ${dot(fields.arrestDate)} และนำส่งตัวพนักงานอัยการ สำนักงานอัยการ ${dot(fields.prosecutorOffice)} เพื่อดำเนินการตามหน้าที่และอำนาจต่อไปแล้ว รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย</p><p>จึงเรียนมาเพื่อโปรดทราบ</p>${renderBatch8LetterFooter(fields)}<p class="a5-form-corner">ปปท. 8-32</p></article>`;
  }

  function renderDetaineeHoldRequest(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch8LetterHead(fields)}<p><strong>เรื่อง</strong> ขออายัดตัวผู้ต้องหา</p><p><strong>เรียน</strong> ผู้บัญชาการเรือนจำ/ทันฑสถาน ${dot(fields.prisonName)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> สำเนาหมายจับศาล ${dot(fields.warrantCourt)} ที่ ${dot(fields.warrantNo)} ลงวันที่ ${dot(fields.warrantDate)} พร้อมตำหนิรูปพรรณ จำนวน ๑ ชุด</p><p>ด้วยศาล ${dot(fields.warrantCourt)} ได้อนุมัติออกหมายจับถึงผู้บัญชาการตำรวจแห่งชาติ และคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ให้จับตัว ${dot(fields.suspectName)} ซึ่งต้องหาว่ากระทำความผิดฐาน ${dot(fields.charge)} โดยระบุให้จับตัวส่งไปที่ ${dot(fields.deliveryPlace)} (ภายในอายุความ) รายละเอียดปรากฏตามสำเนาหมายจับศาล ตามสิ่งที่ส่งมาด้วย</p><p>สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้ดำเนินการตรวจสอบพบว่า ปัจจุบัน ${dot(fields.suspectName)} บุคคลตามหมายจับของศาล ${dot(fields.warrantCourt)} ที่ ${dot(fields.warrantNo)} ลงวันที่ ${dot(fields.warrantDate)} ปัจจุบันถูกจำคุกตามคำพิพากษาศาล ${dot(fields.judgmentCourt)} ในคดีหมายเลขดำที่ ${dot(fields.blackCaseNo)} หมายเลขแดงที่ ${dot(fields.redCaseNo)} อยู่ที่เรือนจำ/ทันฑสถาน ${dot(fields.prisonName)} สำนักงาน ป.ป.ท. จึงขอแจ้งการอายัดตัวผู้ต้องหา เพื่อนำตัวผู้ต้องหาไปดำเนินคดีตามกฎหมายต่อไป ผลเป็นประการใด ขอได้โปรดแจ้งให้สำนักงาน ป.ป.ท. ทราบด้วย</p><p>จึงเรียนมาเพื่อโปรดพิจารณา</p>${renderBatch8LetterFooter(fields)}<p class="a5-form-corner">ปปท. 8-33</p></article>`;
  }

  function renderImprisonmentWarrantRequest(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch8LetterHead(fields)}<p><strong>เรื่อง</strong> ขอหมายจำคุก</p><p><strong>เรียน</strong> ผู้บัญชาการเรือนจำ/ทันฑสถาน ${dot(fields.prisonName)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> ๑. สำเนาหนังสืออัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ที่ ${dot(fields.prosecutorLetterNo)} ลงวันที่ ${dot(fields.prosecutorLetterDate)}<br>๒. รูปพรรณและข้อมูลทะเบียนราษฎร์ของผู้ถูกกล่าวหา<br>๓. เอกสารแสดงว่าผู้ถูกกล่าวหาต้องขังอยู่ที่เรือนจำ/ทันฑสถาน ${dot(fields.dxcPrisonName)} (DXC Report)</p><p>ด้วยพนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ได้พิจารณาสำนวนการไต่สวนของคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ กรณีชี้มูลความผิดทางอาญา ${dot(fields.accusedName)} ผู้ถูกกล่าวหา ตาม ${dot(fields.lawAndSection, "ให้ระบุกฎหมายและมาตราที่คณะกรรมการ ป.ป.ท. มีมติชี้มูล")} และมีคำสั่งฟ้อง ${dot(fields.accusedName)} ผู้ถูกกล่าวหา ตาม ${dot(fields.prosecutionLawAndSection, "ให้ระบุกฎหมายและมาตราตามคำสั่งฟ้องของพนักงานอัยการ")} ดังกล่าว ต่อศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(fields.courtName)} ในวันที่ ${dot(fields.filingDateTime, "ให้ระบุวัน เวลา ตามหนังสือแจ้งของพนักงานอัยการ")} แต่จากการตรวจสอบเบื้องต้นพบว่าปัจจุบันผู้ถูกกล่าวหาอยู่ระหว่างต้องโทษจำคุกและถูกคุมขังอยู่ที่เรือนจำ/ทันฑสถาน ${dot(fields.prisonName)} รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย</p><p>ฉะนั้น เพื่อประโยชน์ในการไต่สวน อาศัยอำนาจตามาตรา 18 พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงเรียนมายังท่านเพื่อขอหมายจำคุก ${dot(fields.accusedName)} ผู้ถูกกล่าวหาเลขประจำตัวประชาชน ${dot(fields.citizenId)} เพื่อส่งให้พนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(fields.destinationProsecutorOffice)} ดำเนินการยื่นฟ้องคดีตามกฎหมายต่อไป</p><p>จึงเรียนมาเพื่อโปรดพิจารณา</p>${renderBatch8LetterFooter(fields)}<p><strong>คำเตือน</strong> พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา ๖๒ “ผู้ใดไม่มาให้ถ้อยคำหรือไม่ส่งเอกสารหรือหลักฐานหรือไม่ดำเนินการใด ๆ ตามมาตรา ๑๘ (๑) และ (๒) โดยไม่มีเหตุอันสมควร ต้องระวางโทษจำคุกไม่เกินหกเดือน หรือปรับไม่เกินหนึ่งหมื่นบาทหรือ ทั้งจำทั้งปรับ”</p></article>`;
  }

  function renderProsecutorSecureAccusedRequest(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch8LetterHead(fields)}<p><strong>เรื่อง</strong> ขอให้ดำเนินการให้ได้ตัวผู้ถูกกล่าวหา</p><p><strong>เรียน</strong> อัยการ ${dot(fields.prosecutorName, "อัยการเจ้าของสำนวน")}</p><p><strong>อ้างถึง</strong> หนังสือสำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ที่ ${dot(fields.referenceLetterNo)} ลงวันที่ ${dot(fields.referenceLetterDate)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> หนังสือเรือนจำ ลับ ที่ ${dot(fields.prisonLetterNo)} ลงวันที่ ${dot(fields.prisonLetterDate)} และสำเนาหมายจำคุกของจำเลย</p><p>ตามที่สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริตแจ้งให้ทราบว่า พนักงานอัยการได้มีคำสั่งฟ้อง ${dot(fields.accusedName)} ผู้ถูกกล่าวหา ในฐานความผิดตาม ${dot(fields.lawAndSection, "ให้ระบุมาตราและกฎหมายที่ผู้ถูกกล่าวหากระทำความผิดตามคำสั่งฟ้องของพนักงานอัยการ")} และขอให้สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ดำเนินการให้ได้ตัวผู้ถูกกล่าวหา แล้วส่งไปยัง สำนักงานคดีปราบปรามการทุจริต ${dot(fields.prosecutorOffice)} เพื่อดำเนินการฟ้องผู้ถูกกล่าวหา ต่อศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(fields.courtName)} ในวันที่ ${dot(fields.filingDateTime, "ให้ระบุวัน เวลา ตามหนังสือแจ้งของพนักงานอัยการ")} ความละเอียดแจ้งแล้ว นั้น</p><p>สำนักงาน ป.ป.ท. ขอเรียนว่า ปัจจุบันผู้ถูกกล่าวหาอยู่ระหว่างต้องโทษจำคุก และถูกคุมขังอยู่ที่เรือนจำ ${dot(fields.prisonName)} ในความผิดฐาน ${dot(fields.imprisonmentCharge, "ระบุฐานความผิดตามหมายจำคุก")} ตามคดีหมายเลขดำที่ ${dot(fields.blackCaseNo)} คดีหมายเลขแดงที่ ${dot(fields.redCaseNo)} รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย จึงขอส่งสำเนาหมายจำคุกผู้ถูกกล่าวหามายังท่านเพื่อดำเนินการในส่วนที่เกี่ยวข้องต่อไป</p><p>จึงเรียนมาเพื่อโปรดทราบ</p>${renderBatch8LetterFooter(fields)}<p class="a5-form-corner">ปปท. 8-35</p></article>`;
  }

  function renderBailContractProposal(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page"><h2 class="a5-paper-title">บันทึกเสนอสัญญาประกัน</h2><p><strong>เรียน</strong> ผอ.กอง/สำนัก ${dot(fields.authorityName, "ที่มีอำนาจปล่อยตัวชั่วคราว")}</p><p>เมื่อวันที่ ${dot(fields.arrestDate)} เวลา ${dot(fields.arrestTime)} นาฬิกา ตามบันทึกประจำวัน ข้อ ${dot(fields.dailyRecordNo)} พนักงาน ป.ป.ท. ได้ควบคุมตัวผู้ถูกจับไว้เพื่อทำรอส่งตัวให้พนักงานอัยการ คือ ${dot(fields.arrestedName, "ชื่อ สกุล ที่อยู่ เบอร์โทร ผู้ถูกจับกุม")} ${dot(fields.arrestedContact)} โดยกล่าวหาว่า ${dot(fields.charge)} เหตุเกิด ${dot(fields.incidentDetails, "ระบุ วันเดือนปี เวลา สถานที่ เกิดเหตุ")}</p><p>บัดนี้ ${dot(fields.bailApplicantName)} เชื้อชาติ ${dot(fields.bailApplicantRace)} สัญชาติ ${dot(fields.bailApplicantNationality)} อยู่บ้านเลขที่ ${dot(fields.bailApplicantHouseNo)} หมู่ ${dot(fields.bailApplicantVillageNo)} แขวง/ตำบล ${dot(fields.bailApplicantSubdistrict)} เขต/อำเภอ ${dot(fields.bailApplicantDistrict)} จังหวัด ${dot(fields.bailApplicantProvince)} ยื่นคำร้องขอประกันผู้ต้องหาดังกล่าวข้างต้น</p><p>มีข้อพิจารณาคือ</p><p>๑. ความผิดที่ถูกกล่าวหาเป็นความผิดตาม ${dot(fields.charge, "เป็นความผิดตามกฎหมายใด มาตราใด")}</p><p>2. นอกจากคดีนี้แล้วผู้ถูกจับถูกอายัดตัวหรือต้องหาในคดีอื่นหรือไม่ ${dot(fields.otherCaseStatus)}</p><p>3. ผู้ขอประกันวางหลักทรัพย์ประกัน ${dot(fields.collateralAssessment, "เชื่อถือผู้ร้องขอประกันและหลักทรัพย์ที่อ้างได้ ผู้ขอประกันตีราคาหลักทรัพย์พอสมควรหรือไม่ อสังหาริมทรัพย์เจ้าหน้าที่ประเมินราคาอย่างไร")}</p><p>4. เมื่อประกันแแล้วผู้ถูกจับน่าจะหลบหนีหรือไม่ ${dot(fields.flightRisk)}</p><p>5. ภัยอันตรายหรือความเสียหายที่อาจจะเกิดจากการปล่อยตัวชั่วคราวมีเพียงใดหรือไม่ ${dot(fields.dangerRisk)}</p><p>6. สอบสวนแล้วผู้ถูกจับให้การ ${dot(fields.arrestedStatement)}</p><p>7. พฤติการณ์แห่งคดี ${dot(fields.caseCircumstances, "พฤติการณ์การกระทำความผิดโดยย่อ")} การให้ประกันจะทำให้เสียรูปคดีหรือไม่ ถ้าจะเสียรูปคดีเพราะเหตุใด ${dot(fields.casePrejudice)}</p><p>๘. ความเห็น ${dot(fields.recommendation, "ในชั้นนี้เห็นควรให้ประกันหรือไม่")}</p><p>จึงเรียนมาเพื่อโปรดพิจารณา</p><p>ลงชื่อ ${dot(fields.proposerName)} ตำแหน่ง ${dot(fields.proposerPosition)}</p><p>${mark(fields.decisionApprove)} อนุญาต ${mark(fields.decisionDeny)} ไม่อนุญาต</p><p>ลงชื่อ ${dot(fields.decisionMakerName)} ตำแหน่ง ${dot(fields.decisionMakerPosition)}</p><p class="a5-form-corner">ปปท. 8-36</p></article>`;
  }

  function renderBailScheduleRows(fields = {}) {
    return Array.from({ length: 10 }, (_, offset) => offset + 1).map(index => `<tr data-bail-schedule-row="${index}"><td>${dot(fields[`scheduleRow${index}No`])}</td><td>${dot(fields[`scheduleRow${index}Date`])}</td><td>${dot(fields[`scheduleRow${index}Time`])}</td><td>${dot(fields[`scheduleRow${index}Place`])}</td><td>${dot(fields[`scheduleRow${index}Acknowledged`])}</td></tr>`).join("");
  }

  function renderBailAssetRows(fields = {}) {
    return Array.from({ length: 12 }, (_, offset) => offset + 1).map(index => `<tr data-bail-asset-row="${index}"><td>${dot(fields[`assetRow${index}No`])}</td><td>${dot(fields[`assetRow${index}Description`])}</td><td>${dot(fields[`assetRow${index}Quantity`])}</td><td>${dot(fields[`assetRow${index}PriceBaht`])}</td><td>${dot(fields[`assetRow${index}PriceSatang`])}</td><td>${dot(fields[`assetRow${index}TotalBaht`])}</td><td>${dot(fields[`assetRow${index}TotalSatang`])}</td><td>${dot(fields[`assetRow${index}Note`])}</td></tr>`).join("");
  }

  function renderBailApplicationAndContract(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper"><section class="a5-paper-page"><h2 class="a5-paper-title">คำร้องขอประกัน</h2><p>สถานที่ทำคำร้องขอประกัน ${dot(fields.applicationPlace)} วันที่ ${dot(fields.applicationDate)}</p><p>ข้าพเจ้า ${dot(fields.applicantName, "ระบุชื่อ สกุล เบอร์โทร ผู้ขอประกันตัว")} อายุ ${dot(fields.applicantAge)} ปี ขอประกันตัว ${dot(fields.insuredName)} ซึ่งต้องหาว่า ${dot(fields.charge)} โดยข้าพเจ้ามีหลักทรัพย์ตามบัญชีท้ายนี้ ${dot(fields.applicationCollateral)}</p><p class="a5-paper-right">(ลงชื่อ) ${dot(fields.applicantName)} ผู้ยื่นคำร้อง</p><h2 class="a5-paper-title">สัญญาประกัน</h2><p>เขียนที่ ${dot(fields.contractPlace)} วันที่ ${dot(fields.contractDate)}</p><p>ข้าพเจ้า ${dot(fields.guarantorName)} อายุ ${dot(fields.guarantorAge)} ปี เชื้อชาติ ${dot(fields.guarantorRace)} สัญชาติ ${dot(fields.guarantorNationality)} อยู่บ้านเลขที่ ${dot(fields.guarantorAddress)} ทำสัญญาประกันให้ไว้แก่ พนักงาน ป.ป.ท. ${dot(fields.receivingUnit)} มีข้อความดังต่อไปนี้</p><p>ข้อ ๑. ข้าพเจ้าได้รับประกันตัว ${dot(fields.insuredName)} ต้องหาว่า ${dot(fields.charge)} ไปจากความควบคุมของพนักงาน ป.ป.ท. และสัญญาว่าจะส่งตัวผู้ต้องหาให้ตามกำหนดนัดของพนักงาน ป.ป.ท.</p><p>ข้อ ๒. ถ้าข้าพเจ้าผิดสัญญาตามข้อ ๑. ข้าพเจ้ายินยอมใช้เงิน (ตัวเลข) ${dot(fields.guaranteeAmountNumber)} จำนวน........................ บาท (ตัวหนังสือ) ${dot(fields.guaranteeAmountText)}</p><p>ข้อ ๓. เพื่อเป็นหลักฐานประกันข้าพเจ้าได้ ${dot(fields.collateral)} ให้พนักงานไว้เป็นหลักฐานและรับรองว่าทรัพย์สินเหล่านี้เป็นกรรมสิทธิ์ของข้าพเจ้าแต่เพียงผู้เดียว และไม่ได้อยู่ในภาระติดพันใด ๆ</p><p>ข้าพเจ้าเข้าใจข้อความในสัญญานี้ดีตลอดแล้ว</p><p>(ลงชื่อ) ${dot(fields.guarantorName)} ผู้ประกัน (ลงชื่อ) ${dot(fields.recipientName)} ผู้รับสัญญา (ลงชื่อ) ${dot(fields.witnessName)} พยาน (ลงชื่อ) ${dot(fields.writerWitnessName)} พยานผู้เขียน</p></section><section class="a5-paper-page"><h3>กำหนดวันเวลาให้ผู้ประกันส่งผู้ต้องหาต่อผู้ให้ประกัน</h3><table class="a5-table"><thead><tr><th>ครั้งที่</th><th>วัน เดือน ปี</th><th>เวลา</th><th>สถานที่ส่งตัว</th><th>ลายมือชื่อผู้ประกันทราบวันนัด</th></tr></thead><tbody>${renderBailScheduleRows(fields)}</tbody></table><h3>บัญชีทรัพย์สินของผู้ประกันซึ่งผู้ประกันรับรองว่าเป็นกรรมสิทธิ์ของผู้ประกันแต่เพียงผู้เดียว และไม่อยู่ในภาระติดพันใด ๆ</h3><table class="a5-table"><thead><tr><th>ลำดับที่</th><th>รายการทรัพย์สิน</th><th>จำนวน</th><th>ราคา บาท</th><th>ราคา สต.</th><th>รวมราคา บาท</th><th>รวมราคา สต.</th><th>หมายเหตุ</th></tr></thead><tbody>${renderBailAssetRows(fields)}</tbody></table><p>(ลงชื่อ) ${dot(fields.guarantorName)} ผู้ประกัน</p><p class="a5-form-corner">ปปท. 8-37</p></section></article>`;
  }

  function renderWitnessSummonsDelivery(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch8LetterHead(fields)}<p><strong>เรื่อง</strong> ส่งหมายเรียกเพื่อไปเป็นพยานศาล และบันทึกถ้อยคำยืนยันข้อเท็จจริง</p><p><strong>เรียน</strong> ${dot(fields.witnessName, "ชื่อ-สกุล พยาน")}</p><p><strong>อ้างถึง</strong> บันทึกคำให้การของท่าน ฉบับลงวันที่ ${dot(fields.statementDate)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> 1. หมายเรียกพยานบุคคล จำนวน ${dot(fields.summonsPages)} แผ่น<br>2. บันทึกถ้อยคำยืนยันข้อเท็จจริง จำนวน ${dot(fields.statementPages)} แผ่น</p><p>ตามบันทึกคำให้การที่อ้างถึง ท่านได้ให้ถ้อยคำต่อคณะอนุกรรมการไต่สวน/คณะพนักงาน ป.ป.ท. ไต่สวน เรื่องที่ ${dot(fields.investigationNo)} กรณีเจ้าหน้าที่ของรัฐถูกกล่าวหาว่ากระทำการทุจริตในภาครัฐ ${dot(fields.caseFacts, "ให้ระบุข้อเท็จจริงโดยย่อ")} เหตุเกิดเมื่อวันที่ ${dot(fields.incidentDate)} สถานที่เกิดเหตุ ${dot(fields.incidentPlace)} ความละเอียดแจ้งแล้ว นั้น</p><p>บัดนี้ พนักงานอัยการได้ยื่นฟ้องผู้ถูกกล่าวหาเป็นจำเลยต่อศาล ${dot(fields.courtName)} ตามคดีหมายเลขดำที่ ${dot(fields.blackCaseNo)} ซึ่งศาลได้หมายเรียกท่านไปเป็นพยานและกำหนดนัดสืบพยานโจทก์ ในวันที่ ${dot(fields.hearingDate)} เวลา ${dot(fields.hearingTime)} นาฬิกา ณ ${dot(fields.courtAddress, "สถานที่ตั้งของศาล")}</p><p>สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) จึงขอส่งหมายเรียกพยานบุคคลและบันทึกยืนยันข้อเท็จจริง ให้แก่ท่าน เมื่อท่านได้รับแล้วขอให้ลงลายมือชื่อ ในใบรับหมายและบันทึกยืนยันข้อเท็จจริงทุกแผ่น แล้วส่งใบรับหมาย (หางหมาย) และบันทึกยืนยันข้อเท็จจริงไปยัง ${dot(fields.returnOffice, "กอง/สำนัก สถานที่ตั้ง")} ภายใน ${dot(fields.returnWithinDays)} วัน นับแต่วันที่ได้รับหนังสือ และขอให้ท่านไปเป็นพยานศาลตามกำหนดนัด</p><p>จึงเรียนมาเพื่อทราบ</p>${renderBatch8LetterFooter(fields, "หัวหน้าพนักงาน ป.ป.ท.")}<p><strong>หมายเหตุ</strong> พยานมีสิทธิที่จะเพิ่มเติม ตัดทอน แก้ไข เปลี่ยนแปลงข้อความอย่างใด ๆ ในบันทึกถ้อยคำยืนยันข้อเท็จจริงฯ เท่าที่พยานทราบหรือรู้เห็นได้ตามความเป็นจริงที่ประสงค์จะยืนยันข้อเท็จจริงต่อศาล หากมีการแก้ไขในส่วนใด ก็ให้พยานลงชื่อกำกับไว้ การจัดทำบันทึกยืนยันข้อเท็จจริงฯ นี้เป็นเพียงการอำนวยความสะดวกให้แก่พยานเท่านั้น โดยมีข้อความในสาระสำคัญปรากฏตามที่พยานได้เคยให้การไว้ในสำนวนคดี</p><p class="a5-form-corner">ปปท. 8-38</p></article>`;
  }

  function renderProsecutorWitnessSummonsReport(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch8LetterHead(fields)}<p><strong>เรื่อง</strong> รายงานการส่งหมายเรียกพยานบุคคลและบันทึกยืนยันข้อเท็จจริงพยาน</p><p><strong>เรียน</strong> ${dot(fields.prosecutorName, "พนักงานอัยการ")}</p><p><strong>อ้างถึง</strong> หนังสือสำนักงานอัยการ ${dot(fields.prosecutorOffice)} ที่ ${dot(fields.referenceLetterNo)} ลงวันที่ ${dot(fields.referenceLetterDate)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> 1. ใบรับหมายเรียกพยานบุคคลและบันทึกถ้อยคำยืนยันข้อเท็จจริง ของ ${dot(fields.witnessName1)}<br>2. ใบรับหมายเรียกพยานบุคคลและบันทึกถ้อยคำยืนยันข้อเท็จจริง ของ ${dot(fields.witnessName2)}</p><p>ตามหนังสือที่อ้างถึง พนักงานอัยการ สำนักงานอัยการ ${dot(fields.prosecutorOffice)} ขอให้สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ส่งหมายเรียกพยานบุคคลและบันทึกยืนยันข้อเท็จจริงของพยาน จำนวน ${dot(fields.witnessCount)} ปาก ซึ่งเป็นพยานโจทก์ในคดีที่พนักงานอัยการ สำนักงาน ${dot(fields.prosecutorOffice)} ยื่นฟ้อง ${dot(fields.defendantName)} เป็นจำเลยต่อศาลอาญา ${dot(fields.courtName)} คดีหมายเลขดำที่ ${dot(fields.blackCaseNo)} ความละเอียดแจ้งแล้ว นั้น</p><p>ในการนี้ สำนักงาน ป.ป.ท. ได้ดำเนินส่งหมายเรียกพยานและให้พยานลงชื่อในบันทึกยืนยันข้อเท็จจริงเรียบร้อยแล้ว ปรากฏตามสิ่งที่ส่งมาด้วย ${dot(fields.deliveryResult, "กรณีที่ไม่สามารถส่งได้ ให้ระบุข้อเท็จจริงไว้ด้วย")}</p><p>จึงเรียนมาเพื่อโปรดพิจารณา</p>${renderBatch8LetterFooter(fields, "หัวหน้าพนักงาน ป.ป.ท.")}<p class="a5-form-corner">ปปท. 8-39</p></article>`;
  }

  function renderSearchInvestigationReport(fields = {}) {
    const intakeBasis = fields.intakeBasis18_1 && !fields.intakeBasis18_4
      ? "<p>ตามมาตรา 18/1 (รับมอบจากคณะกรรมการ ป.ป.ช.)</p>"
      : fields.intakeBasis18_4 && !fields.intakeBasis18_1
      ? "<p>ตามมาตรา 18/4 (คดีประพฤติมิชอบ)</p>"
      : "<p>ตามมาตรา 18/1 (รับมอบจากคณะกรรมการ ป.ป.ช.)</p><p>ตามมาตรา 18/4 (คดีประพฤติมิชอบ)</p>";
    const secretaryOpinionSignerName = fields.secretaryOpinionSignerName || fields.secretaryName;
    const forwardingSecretaryName = fields.forwardingSecretaryName || fields.secretaryName;
    return `<article class="a5-report-paper a5-outcome-paper">
<section class="a5-paper-page">
<h2 class="a5-paper-title">บันทึกข้อความ</h2>
<p><strong>ส่วนราชการ</strong> ${dot(fields.ownerUnit, "สำนัก/กอง ................................................")} <strong>โทร.</strong> ${dot(fields.phone, "........................")}</p>
<p><strong>ที่</strong> ${dot(fields.letterNo, "ปป 00.../...")} <span class="a5-paper-right"><strong>วันที่</strong> ${dot(fields.issuedDate)}</span></p>
<p><strong>เรื่อง</strong> รายงานการสืบสวน เรื่องที่ ${dot(fields.investigationNo)} (${dot(fields.caseCategory, "คดีรับจาก ป.ป.ช. ตามมาตรา 62/คดีประพฤติมิชอบ")})</p>
<p><strong>เรียน</strong> ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
<h3>๑. เรื่องเดิม</h3>
<p><strong>๑.๑</strong> สำนักงาน ป.ป.ท. ได้รับเรื่องกล่าวหาจาก (เลือกใส่ตามข้อเท็จจริง)</p>
${intakeBasis}
<p>เมื่อวันที่ ${dot(fields.receivedDate)} คดีระหว่าง ${dot(fields.complainantName)} (ผู้กล่าวหา) กับ ${dot(fields.accusedName)} (ผู้ถูกกล่าวหา) ตำแหน่ง ${dot(fields.accusedPosition)} สังกัด ${dot(fields.accusedAgency)} กรณี ${dot(fields.allegationSummary, "ระบุพฤติการณ์การกระทำผิดพอสังเขป")}</p>
<p><strong>๑.2</strong> สำนวนคดีนี้เป็นการไต่สวนโดย ${dot(fields.inquiryBody, "คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน")} ตามคำสั่ง ${dot(fields.appointmentOrder)} ลับ ที่ ${dot(fields.appointmentSecretNo)} ลงวันที่ ${dot(fields.appointmentDate)} โดยมีองค์ประกอบดังนี้ (1) นาย ${dot(fields.committeeMember1Name)} เป็น (ประธานอนุกรรมการ/หัวหน้าพนักงาน ป.ป.ท.) (2) นาย ${dot(fields.committeeMember2Name)} เป็น (อนุกรรมการ/พนักงาน ป.ป.ท.) (3) นาย ${dot(fields.committeeMember3Name)} เป็น (อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท. เจ้าของสำนวนคดี)</p>
<p><strong>๑.3</strong> คณะกรรมการ ป.ป.ท. ได้มีการประชุม ครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} มีมติว่า การกระทำของ ${dot(fields.resolvedAccused)} ตำแหน่ง ${dot(fields.resolvedPosition)} เป็นความผิดทางอาญาฐานเป็น ${dot(fields.criminalOffence)}</p>
<p><strong>๑.4</strong> สำนักงาน ป.ป.ท. มีหนังสือ ${dot(fields.prosecutorLetterNo)} ลงวันที่ ${dot(fields.prosecutorLetterDate)} ถึง ${dot(fields.prosecutorOffice, "อัยการผู้ฟ้องคดี")} ขอให้ดำเนินคดีอาญาแก่ ${dot(fields.prosecutedAccused, "ชื่อผู้ถูกกล่าวหา")} ตามฐานความผิดที่คณะกรรมการ ป.ป.ท. มีมติชี้มูลความผิด</p>
<h3>2. ข้อเท็จจริง</h3>
<p>คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ได้ดำเนินการไต่สวนแล้ว ปรากฏว่า ${dot(fields.investigationFacts)}</p>
<p>จึงมีความจำเป็นเร่งด่วน ต้องขอให้ ${dot(fields.competentCourt, "ศาลที่มีเขตอำนาจออกหมาย")} เพื่อเข้าไปในเคหสถาน สถานที่ทำการ หรือสถานที่อื่นใด รวมทั้งยานพาหนะของบุคคลใด ๆ เพื่อตรวจสอบ ค้นยึด หรืออายัด เอกสาร ทรัพย์สิน หรือพยานหลักฐานอื่นใด ซึ่งเกี่ยวข้องกับเรื่องที่ไต่สวน</p>
<h3>3. ข้อกฎหมาย และระเบียบที่เกี่ยวข้อง</h3>
<p><strong>๓.๑</strong> พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา 18 (3)</p>
<p><strong>๓.๒</strong> ระเบียบว่าด้วยหลักเกณฑ์และวิธีการเกี่ยวกับการไต่สวน พ.ศ. ๒๕๖๘ ข้อ 125 และข้อ 126</p>
<p><strong>3.3</strong> ระเบียบคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ว่าด้วยหลักเกณฑ์ วิธีการ และเงื่อนไขการมอบหมาย 5 อนุกรรมการไต่สวน เลขาธิการ รองเลขาธิการ ผู้ช่วยเลขาธิการ หรือหัวหน้าพนักงาน ป.ป.ท. ตามมาตรา ๑๘ วรรคสอง แห่งกฎหมายว่าด้วยมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๘ ข้อ 5 (3) ข้อ 11</p>
<h3>4. ข้อเสนอ/ความเห็น</h3>
<p>เห็นควรเสนอคณะกรรมการ ป.ป.ท. เพื่อโปรดพิจารณาสั่งการ</p>
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
<div class="a5-signature-block"><p>(${dot(fields.signerName)})</p><p>${dot(fields.signerRole, "อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.เจ้าของสำนวน")}</p></div>
</section>
<section class="a5-paper-page">
<h3>5. ความเห็นผู้บังคับบัญชาชั้นต้น (หัวหน้าพนักงาน ป.ป.ท.)</h3>
<p>${dot(fields.supervisorOpinion)}</p>
<div class="a5-signature-block"><p>(${dot(fields.supervisorName)})</p><p>ตำแหน่ง ${dot(fields.supervisorPosition)}</p><p>หัวหน้าพนักงาน ป.ป.ท.</p></div>
<h3>6. ความเห็นผู้อำนวยการ (หัวหน้าพนักงาน ป.ป.ท.)</h3>
<p>${dot(fields.directorOpinion)}</p>
<div class="a5-signature-block"><p>(${dot(fields.directorName)})</p><p>ผู้อำนวยการ (${dot(fields.directorUnit, "สำนัก/กอง")})</p></div>
<h3>7. ความเห็นรองเลขาธิการ/ผู้ช่วยเลขาธิการ</h3>
<p>${dot(fields.deputOpinion)}</p>
<div class="a5-signature-block"><p>(${dot(fields.deputName)})</p></div>
<h3>8. ความเห็นเลขาธิการ</h3>
<p>${dot(fields.secretaryOpinion)}</p>
<div class="a5-signature-block"><p>(${dot(secretaryOpinionSignerName)})</p></div>
<p><strong>เรียน ประธานกรรมการ ป.ป.ท.</strong></p>
<p>เพื่อโปรดพิจารณานำเข้าที่ประชุมคณะกรรมการ ป.ป.ท. ต่อไป</p>
<div class="a5-signature-block"><p>(${dot(forwardingSecretaryName)})</p><p>เลขาธิการคณะกรรมการ ป.ป.ท.</p></div>
<p class="a5-form-corner">ปปท. 8-44</p>
<p class="a5-paper-center">“ตัวอย่างบันทึกรายงานการสืบสวน”</p>
</section>
</article>`;
  }

  function renderSeizureRecord(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">
<h2 class="a5-paper-title">บันทึกการตรวจยึด/อายัด</h2>
<p class="a5-paper-right">เขียนที่ ${dot(fields.writtenAt)}</p>
<p class="a5-paper-right">${dot(fields.recordedDate, "………………………………………………………………….")}<br><small>(วัน เดือน ปี)</small></p>
<h3>ส่วนที่ 1 การตรวจยึด/อายัด</h3>
<p>คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน/พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท./เจ้าหน้าที่ตำรวจ/เจ้าหน้าที่อื่น ๆ ที่ทำการตรวจยึด/อายัด ${dot(fields.officers)}</p>
<p>ได้ร่วมกันทำการตรวจยึด/อายัด ${dot(fields.seizedItems)}</p>
<p>พฤติการณ์ในการตรวจยึด/อายัด กล่าวคือ ${dot(fields.circumstances)}</p>
<p>และได้ส่งมอบให้คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน/พนักงาน ป.ป.ท. ดำเนินการตามอำนาจหน้าที่ต่อไป</p>
<p>ตรวจยึด/อายัดได้จาก ${dot(fields.seizedFrom)}</p>
<p>สถานที่ตรวจยึด/อายัด ${dot(fields.searchLocation)}</p>
<p>วัน/เวลา เริ่ม/สิ้นสุด การตรวจยึด/อายัด ${dot(fields.searchPeriod)}</p>
<p>อนึ่ง ในการตรวจยึด/อายัดครั้งนี้ เจ้าพนักงานผู้ทำการตรวจยึด/อายัด ทุกนายได้กระทำไปตามอำนาจและหน้าที่ ไม่ได้บังคับขู่เข็ญ ทำร้ายร่างกายผู้หนึ่งผู้ใดและไม่ได้ทำให้ทรัพย์สินเสียหาย สูญหายหรือเสื่อมค่าแต่อย่างใด ตลอดจนไม่ได้เรียกหรือรับเอาทรัพย์สินเงินทองของมีค่ามาเป็นประโยชน์ส่วนตนหรือผู้อื่นแต่อย่างใด และไม่ได้ใช้กลอุบายหลอกล่อให้หลงเชื่อแต่อย่างใด</p>
<p>ได้อ่านบันทึกให้ฟังและให้อ่านเองแล้วรับว่าถูกต้อง จึงลงลายมือชื่อไว้เป็นหลักฐาน</p>
<p>(ลงชื่อ) ${dot(fields.custodianName)} ผู้ครอบครองของกลาง/ยินยอมให้ตรวจยึด/อายัด</p>
<p>(ลงชื่อ) ${dot(fields.seizingOfficerName)} เจ้าหน้าที่ผู้ตรวจยึด/อายัด</p>
<p>(ลงชื่อ) ${dot(fields.jointOfficerName)} เจ้าหน้าที่ผู้ร่วมตรวจยึด/อายัด</p>
<p>(ลงชื่อ) ${dot(fields.witnessName)} พยานที่ร่วมตรวจยึด/อายัด</p>
<p>(ลงชื่อ) ${dot(fields.recordingOfficerName)} เจ้าหน้าที่ผู้ร่วมตรวจยึด/อายัด/บันทึก/อ่าน</p>
<h3>ส่วนที่ 2 การส่งมอบสิ่งของที่ตรวจยึด/อายัด</h3>
<p>ได้รับของกลางไว้เรียบร้อย ถูกต้องและครบถ้วนแล้ว</p>
<div class="a5-signature-block">
<p>ลงชื่อ ${dot(fields.recipientName)} ผู้รับ</p>
<p>(${dot(fields.recipientPrintedName)})</p>
<p>ตำแหน่ง ${dot(fields.recipientPosition)}</p>
<p>วันที่ ${dot(fields.receivedDate)}</p>
</div>
<p class="a5-form-corner">ปปท. 8-52</p>
</article>`;
  }

  function renderSearchRecord(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">
<h2 class="a5-paper-title">บันทึกการตรวจค้น</h2>
<p class="a5-paper-right">เขียนที่ ${dot(fields.writtenAt)}</p>
<p class="a5-paper-right">${dot(fields.recordedDate, "………………………………………………………………….")}<br><small>(วัน เดือน ปี)</small></p>
<p class="a5-p-indent">บันทึกนี้แสดงว่า วันนี้ (${dot(fields.recordedDate)}) เวลา ${dot(fields.startedAt)} นาฬิกา เจ้าหน้าที่ผู้ตรวจค้น (คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน/พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท./ตำรวจ) ${dot(fields.searchOfficers)}</p>
<p>ได้มาขอทำการตรวจค้น (สถานที่ตรวจค้น) ${dot(fields.searchLocation)} เลขที่ ${dot(fields.houseNo)} ถนน ${dot(fields.road)} ตำบล/แขวง ${dot(fields.subdistrict)} อำเภอ/เขต ${dot(fields.district)} จังหวัด ${dot(fields.province)} โดยมี (นาย/นาง/นางสาว) ${dot(fields.locationOwner)} เป็นเจ้าของสถานที่ตรวจค้นหรือผู้ดูแลแทนเจ้าของสถานที่ตรวจค้น เนื่องจาก ${dot(fields.searchReason)}</p>
<p>พนักงานเจ้าหน้าที่ชุดดังกล่าวได้พบ (นาย/นาง/นางสาว) ${dot(fields.personFound)} ซึ่งเป็น ${dot(fields.personRole)}</p>
<p>เจ้าหน้าที่ชุดตรวจค้นได้แสดงตัว และชี้แจงวัตถุประสงค์ต่อ (นาย/นาง/นางสาว) ${dot(fields.informedPerson)} เข้าใจในวัตถุประสงค์ของเจ้าหน้าที่ชุดตรวจค้นแล้ว แสดงความบริสุทธิ์ใจ ด้วยการยินยอมให้เจ้าหน้าที่ชุดตรวจค้นตรวจค้นภายใน (สถานที่ตรวจค้น) จึงเป็นผู้นำทำการตรวจค้น ซึ่งก่อนลงมือทำการตรวจค้นเจ้าหน้าที่ชุดตรวจค้นทุกคนได้แสดงความบริสุทธิ์ให้ (นาย/นาง/นางสาว) ${dot(fields.preSearchWitness)} ดูเป็นที่พอใจแล้ว จึงเริ่มทำการตรวจค้น</p>
<p>ผลการตรวจค้นปรากฏว่า ${dot(fields.searchResult)}</p>
<p>เสร็จสิ้นการตรวจค้นเวลา ${dot(fields.endedAt)} นาฬิกา หลังการตรวจค้นเจ้าหน้าที่ชุดตรวจค้นได้แสดงความบริสุทธิ์ให้ (นาย/นาง/นางสาว) ${dot(fields.postSearchWitness)} ดูจนเป็นที่น่าพอใจอีกครั้งหนึ่ง</p>
<p>อนึ่ง ในการตรวจค้นครั้งนี้ เจ้าหน้าที่ชุดตรวจค้นได้ปฏิบัติอย่างสุภาพ มิได้ทำการขู่เข็ญ บังคับ หรือกระทำประการหนึ่งประการใดอันเป็นการประทุษร้ายแก่กายหรือจิตใจต่อผู้หนึ่งผู้ใด อีกทั้งมิได้ทำให้ทรัพย์สินอื่นใดเสียหาย สูญหาย เสื่อมค่า หรือไร้ประโยชน์แต่ประการใด</p>
<p>ได้อ่านบันทึกนี้ให้ (นาย/นาง/นางสาว) ${dot(fields.readToPerson)} ฟังแล้วรับว่าเข้าใจข้อความในบันทึกนี้ดีและถูกต้องเป็นความจริงทุกประการ จึงลงลายมือชื่อไว้เป็นหลักฐาน</p>
<table class="a5-table"><tbody>
<tr><td>(ลงชื่อ) ${dot(fields.locationOwnerSigner)} เจ้าของสถานที่หรือผู้ดูแลแทน</td><td>(ลงชื่อ) ${dot(fields.searchOfficerSigner1)} เจ้าหน้าที่ผู้ตรวจค้น</td></tr>
<tr><td>(ลงชื่อ) ${dot(fields.searchOfficerSigner2)} เจ้าหน้าที่ผู้ตรวจค้น</td><td>(ลงชื่อ) ${dot(fields.recordingOfficerSigner)} เจ้าหน้าที่ผู้ตรวจค้น/บันทึก/อ่าน</td></tr>
</tbody></table>
<p class="a5-form-corner">ปปท. 8-50</p>
</article>`;
  }

  function renderSearchWarrantEnvelope(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">
<h2 class="a5-paper-title">เรื่อง ขอหมายค้น</h2>
<p><strong>เรียน</strong> ผู้พิพากษาหัวหน้าศาล${dot(fields.courtName, ".............")} / อธิบดีผู้พิพากษาศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(fields.courtName, "......")}</p>
<div class="a5-envelope-space"></div>
<p>สำนัก/กอง ${dot(fields.unitName, "......")}</p>
<p>สำนักงาน ป.ป.ท.</p>
<p>คดีอาญา เรื่องที่ ${dot(fields.criminalCaseNo, "........................")}</p>
<p>ข้อหา “ฐาน${dot(fields.charge)}”</p>
<p>จำนวน ๑ หมาย</p>
<p>อายุความ ${dot(fields.limitationYears, "......")} ปี (วันขาดอายุความ วันที่ ${dot(fields.limitationDate)})</p>
<p>นาย/นาง/นางสาว ${dot(fields.petitionerName)} ผู้ร้อง</p>
<p>โทร. ${dot(fields.petitionerPhone)}</p>
</article>`;
  }

  function renderCourtSearchWarrant(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">
<div class="a5-paper-code">(๔๘ ทวิ) <span>สำหรับศาลใช้</span></div>
<h2 class="a5-paper-title">หมายค้น</h2>
<p class="a5-paper-right">ที่ ${dot(fields.warrantNo, "…..................")}</p>
<h3 class="a5-paper-title">ในพระปรมาภิไธยพระมหากษัตริย์</h3>
<p>ศาล ${dot(fields.courtName)}</p>
<p>วันที่ ${dot(fields.issuedDate, "........เดือน......................พุทธศักราช……….")}</p>
<p>ความอาญา</p>
<p>ระบุชื่อ ${dot(fields.petitionerName)} ตำแหน่ง ${dot(fields.petitionerPosition)} ผู้ร้อง</p>
<p>หมายถึง คณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
<p>ด้วยศาลเห็นมีเหตุสมควรให้ค้นสถานที่ ${dot(fields.searchLocation)} บ้านเลขที่ ${dot(fields.houseNo)} หมู่ ${dot(fields.villageNo)} ตำบล ${dot(fields.subdistrict)} อำเภอ ${dot(fields.district)} จังหวัด ${dot(fields.province)}</p>
<p>เพื่อพบและยึดสิ่งของ ${dot(fields.searchTarget)} ซึ่งจะเป็นพยานหลักฐานประกอบการสอบสวน ไต่สวนมูลฟ้องหรือพิจารณา ซึ่งมีไว้เป็นความผิดหรือได้มาโดยผิดกฎหมาย หรือได้ใช้ หรือตั้งใจจะใช้ในการกระทำความผิด ตามคำพิพากษาหรือคำสั่งของศาล</p>
<p>เพื่อพบ ${dot(fields.personTarget, "ชื่อ-สกุล ผู้ถูกกล่าวหาและรายละเอียดหมายจับ")} บุคคลที่ถูกหน่วงเหนี่ยวหรือกักขังโดยมิชอบด้วยกฎหมาย บุคคลที่ถูกออกหมายจับของศาลอาญา</p>
<p>จึงออกหมายค้นนี้ให้ ${dot(fields.leadOfficer, "ระบุชื่อ-สกุล ตำแหน่ง ผู้เข้าตรวจค้น ซึ่งเป็นหัวหน้าชุดในการตรวจค้น พร้อมพวก")} มีอำนาจค้นสถานที่/บ้านข้างต้นได้ ในวันที่ ${dot(fields.searchDate)} ตั้งแต่เวลา ${dot(fields.startedAt)} นาฬิกา ถึงเวลา ${dot(fields.endedAt)} นาฬิกา ติดต่อกันไปจนกว่าจะเสร็จสิ้นการตรวจค้น</p>
<p>เมื่อค้นได้ตามหมายนี้แล้วให้ส่ง ของกลางและสิ่งของที่เกี่ยวข้อง พร้อมบันทึกการตรวจค้นและบัญชีสิ่งของ (ถ้ามี) ไปยัง กองบังคับการปราบปราม เพื่อจัดการตามกฎหมายต่อไป</p>
<p class="a5-paper-right">${dot(fields.judgeName)} ผู้พิพากษา</p>
<p><strong>หมายเหตุ :</strong> * ให้ระบุชื่อหรือรูปพรรณบุคคลหรือลักษณะสิ่งของที่ต้องการค้น</p>
<h3>บันทึก</h3>
<p>วันที่ ${dot(fields.executionDate)}</p>
<p>เจ้าพนักงานผู้จัดการตามหมายได้แจ้งข้อความในหมายให้แก่ผู้เกี่ยวข้องทราบและได้ส่งหมายให้ตรวจดูแล้ว</p>
<p>${dot(fields.executingOfficer)} เจ้าพนักงานผู้จัดการตามหมาย</p>
<p>ข้าพเจ้าผู้มีชื่อข้างท้ายนี้ ได้รับทราบข้อความในหมาย และได้ตรวจดูหมายแล้ว</p>
<p>${dot(fields.acknowledgingPerson)} ผู้รับทราบ (ระบุความเกี่ยวข้อง) ${dot(fields.acknowledgingRelation)}</p>
<h3>คำเตือน</h3>
<p>เจ้าพนักงานผู้จัดการตามหมายพึงปฏิบัติตามกฎหมาย อย่างน้อยให้คำนึงถึง</p>
<ul><li>การค้นต้องกระทำตามวัน เวลาที่ระบุไว้ในหมาย</li><li>การค้นต้องกระทำเพื่อหาตัวคนหรือสิ่งของเฉพาะตามที่ระบุไว้ในหมาย</li><li>การค้นต้องพยายามไม่ให้เกิดความเสียหายแก่ผู้ถูกค้น</li><li>ผู้ค้นต้องเป็นเจ้าพนักงานตามหมาย</li></ul>
<p>* ระบุความเกี่ยวข้องกับเจ้าของสถานที่ที่ถูกตรวจค้น เช่น เป็นญาติหรือลูกจ้าง ฯลฯ</p>
</article>`;
  }

  function renderCourtProceedingReport(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">
<p class="a5-paper-right">สำหรับศาลใช้</p>
<h2 class="a5-paper-title">รายงานกระบวน<br>การพิจารณา</h2>
<p class="a5-paper-right">คำร้องเลขที่ ${dot(fields.petitionNo)}<br>หมายค้นเลขที่ ${dot(fields.warrantNo)}</p>
<p>ศาล ${dot(fields.courtName)}</p>
<p>วันที่ ${dot(fields.proceedingDate, "........เดือน......................พุทธศักราช……….")}</p>
<p>ความอาญา</p>
<p>ระบุชื่อ ${dot(fields.petitionerName)} ตำแหน่ง ${dot(fields.petitionerPosition)} ผู้ร้อง</p>
<p>ผู้พิพากษาออกนั่งพิจารณาคดีนี้เวลา ${dot(fields.hearingTime)} นาฬิกา</p>
<p>วันนี้ ${dot(fields.petitionerName, "ชื่อ-สกุล ตำแหน่งผู้ร้อง")} ได้ยื่นคำร้องขอให้ศาลออกหมายค้น</p>
<p>สอบพยานผู้ร้องซึ่งเบิกความประกอบพยานหลักฐานที่แนบมาพร้อมคำร้อง จำนวน ${dot(fields.witnessCount)} ปาก คดีเสร็จสิ้นการไต่สวน ให้รอฟังคำสั่ง/อ่านแล้ว</p>
<p class="a5-paper-right">${dot(fields.judgeName)} ผู้พิพากษา บันทึก/อ่าน<br>${dot(fields.petitionerName)} ผู้ร้อง</p>
<h3>คำสั่ง</h3>
<p>พิเคราะห์พยานหลักฐานของผู้ร้องแล้ว เห็นว่า ${dot(fields.courtOrderReason)}</p>
<p>กรณีมีเหตุอันสมควรที่จะออกหมายค้น ตามประมวลกฎหมายวิธีพิจารณาความอาญามาตรา ๖๙ (๒)</p>
<p>อนุญาตให้ออกหมายค้นตามขอ โดยให้ค้นวันที่ ${dot(fields.permittedSearchDate)} ตั้งแต่เวลา ${dot(fields.permittedStartTime)} นาฬิกา ถึง ${dot(fields.permittedEndTime)} นาฬิกา ติดต่อกันไปจนกว่าจะเสร็จสิ้นการตรวจค้น และให้ส่งบันทึกการตรวจค้นต่อศาลภายใน ${dot(fields.reportWithinDays)} วัน</p>
<p>ให้ถ่ายสำเนา ${dot(fields.retainedCopy)} เพื่อเก็บไว้กับคำร้องและสำเนาหมาย ได้อ่านคำสั่งให้ผู้ร้องฟังโดยชอบแล้ว/อ่านแล้ว</p>
<p class="a5-paper-right">${dot(fields.judgeName)} ผู้พิพากษา บันทึก/อ่าน<br>${dot(fields.petitionerName)} ผู้ร้อง</p>
</article>`;
  }

  const mark = checked => checked === true ? "☒" : "☐";

  function renderPetitionerWitnessStatement(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">
<h2 class="a5-paper-title">คำให้การพยาน<br><small>(ชั้นขอออกหมายค้น)</small></h2>
<p class="a5-paper-right">คำร้องเลขที่ ${dot(fields.petitionNo)}<br>หมายค้นเลขที่ ${dot(fields.warrantNo)}</p>
<p>ศาล ${dot(fields.courtName)}</p><p>วันที่ ${dot(fields.statementDate, "...........เดือน..............................พุทธศักราช.............")}</p>
<p>ความอาญา</p><p>ระบุชื่อ ${dot(fields.petitionerName)} ตำแหน่ง ${dot(fields.petitionerPosition)} ผู้ร้อง</p>
<p>ข้าพเจ้าได้ปฏิญาณหรือสาบานตนแล้วขอให้การว่า</p>
<p>๑. ข้าพเจ้า ${dot(fields.petitionerName, "ชื่อ-สกุลผู้ร้อง")}</p>
<p>๒. เกิดวันที่ ${dot(fields.birthDate)} อายุ ${dot(fields.age)} ปี</p>
<p>๓. ตำแหน่งหรืออาชีพ/รับราชการ ตำแหน่ง ${dot(fields.petitionerPosition)}</p>
<p>๔. ตั้งบ้านเรือนอยู่ ${dot(fields.agencyAddress, "ระบุสังกัด ที่ตั้ง")}</p>
<p>๕. เกี่ยวพันกับคู่ความ เป็น ${mark(fields.relationPetitioner)} ผู้ร้อง ${mark(fields.relationDelegate)} ผู้รับมอบหมาย</p>
<p>และขอให้การต่อศาลว่า / ตอบศาล</p>
<p>ข้อ ๑. ด้วยปรากฏจากการสืบสวนของเจ้าหน้าที่ ${dot(fields.investigationFacts)} ทราบว่า ${dot(fields.searchLocation)} มี ${dot(fields.locationOwner)} อายุ ${dot(fields.locationOwnerAge)} ปี เลขประจำตัวประชาชน ${dot(fields.locationOwnerId)} เป็นเจ้าบ้าน และผู้ครอบครองสถานที่</p>
<p>มีพฤติการณ์ที่เป็นเหตุแห่งการออกหมายค้น คือ ${dot(fields.investigationFacts)}</p>
<p>${dot(fields.requestingAgency, "ระบุชื่อหน่วยงานผู้ร้อง")} จึงได้ดำเนินการสืบสวนติดตาม เพื่อจับกุมตัวผู้ถูกกล่าวหามาโดยตลอด โดยได้สืบสวนทราบว่า ${dot(fields.wantedAccusedName, "ชื่อ-สกุล ผู้ถูกกล่าวหาที่มีหมายจับ")} อายุ ${dot(fields.wantedAccusedAge)} ปี เลขประจำตัวประชาชน ${dot(fields.wantedAccusedId)} ที่อยู่ ${dot(fields.wantedAccusedAddress, "ระบุภูมิลำเนาผู้ถูกกล่าวหาที่มีหมายจับ")} ผู้ถูกกล่าวหาได้หลบหนีมาอยู่ที่ ${dot(fields.wantedAccusedHideout, "สถานที่ที่จะค้น")} ซึ่งผู้ร้องได้มีคำร้องขอหมายค้นนี้ เพื่อจับกุมผู้ถูกกล่าวหามาดำเนินคดีตามกฎหมาย (กรณีค้นเพื่อจับกุมตัวผู้ถูกกล่าวหา)</p>
<p>${dot(fields.requestingAgency, "ระบุชื่อหน่วยงานผู้ร้อง")} ได้ดำเนินการสืบสวน เพื่อตรวจสอบ ค้นยึด หรืออายัด เอกสาร ทรัพย์สิน หรือพยานหลักฐานอื่นใด ซึ่งเกี่ยวข้องกับเรื่องที่ไต่สวนมาโดยตลอด โดยได้สืบสวนทราบว่า ${dot(fields.evidenceDescription, "พยานหลักฐาน")} อยู่ที่ ${dot(fields.evidenceLocation, "ระบุสถานที่")} ซึ่งผู้ร้องได้มีคำร้องขอหมายค้นนี้ เพื่อยึด หรืออายัด เอกสาร ทรัพย์สิน หรือพยานหลักฐานอื่นใด มาดำเนินคดีตามกฎหมาย (กรณีค้นเพื่อหาพยานหลักฐานตามมาตรา 18 (3))</p>
<p>จึงมีเหตุที่จะต้องเข้าทำการตรวจค้นอันเนื่องจาก</p>
<ul><li>${mark(fields.groundEvidence)} เพื่อพบและยึดสิ่งของ ซึ่งจะใช้เป็นพยานหลักฐานประกอบการสอบสวน ไต่สวนมูลฟ้อง หรือพิจารณา</li><li>${mark(fields.groundIllegalThing)} ซึ่งมีไว้เป็นความผิด หรือได้มาโดยผิดกฎหมาย หรือได้ใช้ หรือตั้งใจจะใช้ในการกระทำความผิด</li><li>${mark(fields.groundCourtOrder)} ตามคำพิพากษาหรือคำสั่งของศาล</li><li>${mark(fields.groundAccused)} เพื่อพบชื่อ-สกุล ผู้ถูกกล่าวหาและรายละเอียดหมายจับ</li><li>${mark(fields.groundUnlawfulDetention)} บุคคลที่ถูกหน่วงเหนี่ยวหรือกักขังโดยมิชอบด้วยกฎหมาย</li><li>${mark(fields.groundOffenceEquipment)} พบสิ่งของหรืออุปกรณ์ที่เกี่ยวข้องกับการกระทำความผิด มาจากสถานที่ดังกล่าว</li></ul>
<p>จึงขอศาลได้ออกหมายค้นตามคำร้องนี้ด้วย</p>
<p class="a5-paper-right">(ลงชื่อ) ${dot(fields.judgeName)} ผู้พิพากษา/บันทึก/อ่าน<br>(ลงชื่อ) ${dot(fields.petitionerName)} ผู้ร้อง</p>
</article>`;
  }

  function renderSearchWarrantPetition(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">
<p class="a5-paper-right">สำหรับศาลใช้</p><h2 class="a5-paper-title">(คำร้อง)<br>ขอหมายค้น</h2>
<p>รับคำร้อง / เรียกสอบ ${dot(fields.judgeName)} ผู้พิพากษา</p>
<p>ศาล ${dot(fields.courtName)}</p><p>วันที่ ${dot(fields.petitionDate, "........เดือน......................พุทธศักราช……….")}</p>
<p>ความอาญา</p><p>ระบุชื่อ ${dot(fields.petitionerName)} ตำแหน่ง ${dot(fields.petitionerPosition)} ผู้ร้อง</p>
<p>ข้าพเจ้า ${dot(fields.petitionerName, "ชื่อ-สกุล ตำแหน่ง")} อายุ ${dot(fields.petitionerAge)} ปี อาชีพ รับราชการ สถานที่ทำงาน ${dot(fields.workplace)} ตำบล ${dot(fields.workplaceSubdistrict)} อำเภอ ${dot(fields.workplaceDistrict)} จังหวัด ${dot(fields.workplaceProvince)} โทรศัพท์ ${dot(fields.petitionerPhone)} ขอยื่นคำร้องขอออกหมายค้นต่อศาล ดังมีข้อความที่จะกล่าวต่อไปนี้</p>
<p>ข้อ ๑. ด้วยปรากฏจากการสืบสวนของเจ้าหน้าที่ ทราบว่า ${dot(fields.searchLocation)} มี ${dot(fields.locationOwner)} อายุ ${dot(fields.locationOwnerAge)} ปี เลขประจำตัวประชาชน ${dot(fields.locationOwnerId)} เป็นเจ้าบ้าน และผู้ครอบครองสถานที่</p>
<p>มีพฤติการณ์ที่เป็นเหตุแห่งการออกหมายค้น คือ ${dot(fields.searchCircumstances)}</p>
<p>${dot(fields.requestingAgency, "ระบุชื่อหน่วยงานผู้ร้อง")} จึงได้ดำเนินการสืบสวนติดตาม เพื่อจับกุมตัวผู้ถูกกล่าวหามาโดยตลอด โดยได้สืบสวนทราบว่า ${dot(fields.wantedAccusedName, "ชื่อผู้ถูกกล่าวหาที่มีหมายจับ")} อายุ ${dot(fields.wantedAccusedAge)} ปี เลขประจำตัวประชาชน ${dot(fields.wantedAccusedId)} ที่อยู่ ${dot(fields.wantedAccusedAddress, "ระบุที่อยู่")} ผู้ถูกกล่าวหาได้หลบหนีมาอยู่ที่ ${dot(fields.wantedAccusedHideout, "ระบุสถานที่ที่ผู้ถูกกล่าวหาหลบหนี")} ซึ่งผู้ร้องได้มีคำร้องขอหมายค้นนี้ เพื่อจับกุมผู้ถูกกล่าวหามาดำเนินคดีตามกฎหมาย (กรณีค้นเพื่อจับกุมตัวผู้ถูกกล่าวหา)</p>
<p>${dot(fields.requestingAgency, "ระบุชื่อหน่วยงานผู้ร้อง")} ได้ดำเนินการสืบสวน เพื่อตรวจสอบ ค้นยึด หรืออายัด เอกสาร ทรัพย์สิน หรือพยานหลักฐานอื่นใด ซึ่งเกี่ยวข้องกับเรื่องที่ไต่สวนมาโดยตลอด โดยได้สืบสวนทราบว่า ${dot(fields.evidenceDescription, "พยานหลักฐาน")} อยู่ที่ ${dot(fields.evidenceLocation, "ระบุสถานที่")} ซึ่งผู้ร้องได้มีคำร้องขอหมายค้นนี้ เพื่อยึด หรืออายัด เอกสาร ทรัพย์สิน หรือพยานหลักฐานอื่นใด มาดำเนินคดีตามกฎหมาย (กรณีค้นเพื่อหาพยานหลักฐานตามมาตรา 18 (3))</p>
<p>รายละเอียดในการสืบสวนปรากฏตามพยานเอกสาร รายงานการสืบสวนที่ผู้ร้องได้แนบมาด้วยนี้</p>
<p>ข้อ ๒. ผู้ร้องประสงค์จะทำการตรวจค้นบ้านหรือสถานที่ดังกล่าวตามข้อ ๑. รวมทั้งสิ้น จำนวน ๑ สถานที่ เพื่อ</p>
<ul><li>${mark(fields.groundEvidence)} เพื่อพบและยึดสิ่งของ ซึ่งจะใช้เป็นพยานหลักฐานประกอบการสอบสวน ไต่สวนมูลฟ้อง หรือพิจารณา</li><li>${mark(fields.groundIllegalThing)} ซึ่งมีไว้เป็นความผิด หรือได้มาโดยผิดกฎหมาย หรือได้ใช้ หรือตั้งใจจะใช้ในการกระทำความผิด</li><li>${mark(fields.groundCourtOrder)} ตามคำพิพากษาหรือคำสั่งของศาล</li><li>${mark(fields.groundAccused)} เพื่อพบชื่อ-สกุล และรายละเอียดหมายจับ</li><li>${mark(fields.groundUnlawfulDetention)} บุคคลที่ถูกหน่วงเหนี่ยวหรือกักขังโดยมิชอบด้วยกฎหมาย</li><li>${mark(fields.groundOffenceEquipment)} พบสิ่งของหรืออุปกรณ์ที่เกี่ยวข้องกับการกระทำความผิด มาจากสถานที่ดังกล่าว</li></ul>
<p>ด้วยเหตุผล และความจำเป็นดังกล่าวข้างต้น จึงขอประทานกราบเรียนต่อศาล ได้โปรดอนุญาตออกหมายค้นให้แก่ ${dot(fields.searchOfficer)} เพื่อเข้าตรวจค้นสถานที่ดังกล่าวรวมทั้งสิ้น จำนวน ๑ สถานที่ ${dot(fields.searchPurpose)} ในวันที่ ${dot(fields.searchDate)} ตั้งแต่เวลา ${dot(fields.searchTime)} ติดต่อกันไปจนกว่าจะเสร็จสิ้นการตรวจค้น</p>
<p>ในการยื่นคำร้องครั้งนี้ ผู้ร้อง เป็นผู้นำคำร้องมายื่นต่อศาล และหากศาลเรียกสอบถามเมื่อใด ผู้ร้องพร้อมจะมาให้ศาลสอบในทันที</p>
<p>ผู้ร้อง ${dot(fields.priorRequestMade, "เคย / ไม่เคย")} ร้องขอให้ศาล ${dot(fields.priorCourtName)} ออกหมายค้นบ้านหรือสถานที่ข้างต้นโดยอาศัยเหตุแห่งการร้องขอเดียวกันนี้ หรือเหตุอื่น ${dot(fields.priorRequestBasis)} และศาลมีคำสั่ง ${dot(fields.priorCourtOrder)}</p>
<p class="a5-paper-right">ควรมิควรแล้วแต่จะโปรด<br>ลงชื่อ ${dot(fields.petitionerName)} ผู้ร้อง<br>ตำแหน่ง ${dot(fields.petitionerPosition)}</p>
</article>`;
  }

  function renderSearchWarrantExecutionReport(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">
<div class="a5-letter-head-row">
  <p>ที่ ปป ${dot(fields.letterNo, ".................")}</p>
  <p>สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p>
</div>
<p class="a5-paper-right">${dot(fields.issuedDate, "...........................")}<br><small>(วัน เดือน ปี)</small></p>
<p><strong>เรื่อง</strong> รายงานการปฏิบัติตามหมายค้น</p>
<p><strong>เรียน</strong> อธิบดีผู้พิพากษาศาล${dot(fields.courtName)}</p>
<p><strong>อ้างถึง</strong> หมายค้นศาล${dot(fields.warrantCourt)} ที่ ${dot(fields.warrantNo, "...........")} ลงวันที่ ${dot(fields.warrantDate, "...............")}</p>
<p><strong>สิ่งที่ส่งมาด้วย</strong> สำเนาบันทึกการตรวจค้นและบัญชีสิ่งของ (สำเนาบันทึกจับกุม) จำนวน ${dot(fields.attachmentPages, ".....................")} แผ่น</p>
<p class="a5-p-indent">ตามหมายค้นที่อ้างถึง ศาล${dot(fields.warrantCourt)}ได้ออกหมายค้น บ้านเลขที่${dot(fields.houseNo)}เพื่อ${dot(fields.searchPurpose)}ความละเอียดแจ้งแล้ว นั้น</p>
<p class="a5-p-indent">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ขอเรียนว่า เมื่อวันที่${dot(fields.searchDate)}เจ้าหน้าที่ได้ทำการตรวจค้นบ้านเลขที่${dot(fields.houseNo)}ตั้งแต่เวลา${dot(fields.startedAt)}ถึงเวลา${dot(fields.endedAt)}ผลการตรวจค้นปรากฎว่า${dot(fields.searchResult, "(พบเอกสารพยานหลักฐาน/ไม่พบเอกสารหลักฐาน/บุคคลหรือสิ่งของที่ขอในหมาย)")} และได้ทำการตรวจยึด/ได้ทำการจับกุม${dot(fields.followUpSubject)}ส่งคณะพนักงานไต่สวนเจ้าของสำนวน/ส่งพนักงานอัยการ เพื่อดำเนินการตามหน้าที่และอำนาจต่อไปแล้ว รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย</p>
<p>จึงเรียนมาเพื่อโปรดทราบ</p>
<div class="a5-signature-block">
  <p>ขอแสดงความนับถือ</p>
  <p>(${dot(fields.signerName)})</p>
  <p>เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ<br>หรือผู้ที่ได้รับมอบหมาย</p>
</div>
<div class="a5-letter-footer">
  <p>สำนัก ${dot(fields.ownerUnit, "(กปท./ปปท.เขตพื้นที่ ของฝ่ายเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)")}</p>
  <p>โทร. ${dot(fields.phone)}</p>
  <p>โทรสาร ${dot(fields.fax)}</p>
  <p>(${dot(fields.officerName, "ระบุชื่อ-สกุลของอนุกรรมการและเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน")})</p>
</div>
<p class="a5-form-corner">ปปท.8-51</p>
</article>`;
  }

  function renderBatch7ExternalHead(fields = {}, subject = "", recipientLabel = "เรียน", recipient = "") {
    return `<div class="a5-letter-head-row"><p>ที่ ปป ${dot(fields.letterNo, "๐๐.../...")}</p><p>สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div>
<p class="a5-paper-right">${dot(fields.issuedDate, "(วัน เดือน ปี)")}</p><p><strong>เรื่อง</strong> ${escapeHtml(subject)}</p><p><strong>${escapeHtml(recipientLabel)}</strong> ${dot(recipient)}</p>`;
  }

  function renderBatch7ExternalFooter(fields = {}, signerTitle = "หัวหน้าพนักงาน ป.ป.ท.", options = {}) {
    const salutation = options.salutation || "ขอแสดงความนับถือ";
    const unitPlaceholder = options.unitPlaceholder || "(กปท./ปปท.เขตพื้นที่ ของฝ่ายเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)";
    return `<div class="a5-signature-block"><p>${escapeHtml(salutation)}</p><p>(${dot(fields.signerName)})</p><p>${escapeHtml(signerTitle)}</p></div>
<div class="a5-letter-footer"><p>สำนัก ${dot(fields.ownerUnit, unitPlaceholder)}</p><p>โทร. ${dot(fields.phone)}</p><p>โทรสาร ${dot(fields.fax)}</p><p>(${dot(fields.officerName, "ระบุชื่อ-สกุลของอนุกรรมการและเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน")})</p></div>`;
  }

  function renderNoGroundsNotice(fields = {}, variant = "complainant") {
    const isAccused = variant === "accused";
    const isAgency = variant === "agency" || variant === "suspended";
    const recipient = isAccused ? fields.accusedRecipientName : isAgency ? fields.agencyHeadName : fields.complainantName;
    const reference = isAccused && fields.hasAllegationNotice === true
      ? `<p><strong>อ้างถึง</strong> หนังสือสำนักงาน ป.ป.ท. ลับ ที่ ปป ${dot(fields.noticeLetterNo)} ลงวันที่ ${dot(fields.noticeDate)} (${dot(fields.noticeType)})</p>`
      : variant === "suspended"
      ? `<p><strong>อ้างถึง</strong> หนังสือสำนักงาน ป.ป.ท. ลับ ที่ ปป ${dot(fields.suspensionLetterNo)} ลงวันที่ ${dot(fields.suspensionLetterDate)} ตามแบบ ${dot(fields.suspensionFormRef)}</p>`
      : variant === "complainant"
      ? `<p><strong>อ้างถึง</strong> หนังสือร้องเรียนกล่าวหาของท่าน ฉบับลงวันที่ ${dot(fields.complaintLetterDate)} (ถ้ามี)</p>` : "";
    const body = variant === "complainant"
      ? `<p class="a5-p-indent">ตามหนังสือที่อ้างถึง ท่านได้กล่าวหา/ร้องเรียน กรณี ${dot(fields.accusedSummary)} ว่า ${dot(fields.charge)} ความละเอียดแจ้งแล้ว นั้น</p><p class="a5-p-indent">คณะกรรมการ ป.ป.ท. ได้รับไว้พิจารณาโดย ${dot(fields.inquiryBody, "แต่งตั้งคณะอนุกรรมการไต่สวน/คณะพนักงาน ป.ป.ท. ไต่สวน แล้วแต่ว่าเป็นกรณีใด")} พร้อมทั้งจัดทำสำนวนการไต่สวนเสนอต่อคณะกรรมการ ป.ป.ท. เพื่อพิจารณา ซึ่งคณะกรรมการ ป.ป.ท. ในคราวประชุม ครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} พิจารณาแล้วมีมติว่า ${dot(fields.boardResolution)}</p>`
      : variant === "accused"
      ? `${fields.hasAllegationNotice === true ? `<p class="a5-p-indent">ตามหนังสือที่อ้างถึง สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้แจ้ง${dot(fields.noticeType, "คำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน/คณะพนักงาน ป.ป.ท. ไต่สวน")} ในเรื่องที่ท่านเป็นผู้ถูกกล่าวหาว่ากระทำความผิดฐาน ${dot(fields.criminalBasis)} ความละเอียดแจ้งแล้ว นั้น</p>` : ""}<p class="a5-p-indent">ในการไต่สวนเรื่องนี้ ${dot(fields.inquiryBody, "คณะอนุกรรมการไต่สวน/คณะพนักงาน ป.ป.ท. ไต่สวน")} ได้ดำเนินการเสร็จสิ้นแล้ว เสนอต่อคณะกรรมการ ป.ป.ท. พิจารณาในคราวประชุม ครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} ซึ่งคณะกรรมการ ป.ป.ท. พิจารณาแล้วมีมติว่า ${dot(fields.boardResolution)}</p>`
      : variant === "suspended"
      ? `<p class="a5-p-indent">ตามที่คณะกรรมการ ป.ป.ท. ได้ดำเนินการไต่สวนโดยการแต่งตั้งคณะอนุกรรมการไต่สวน/คณะพนักงาน ป.ป.ท. ไต่สวน กรณี ${dot(fields.accusedSummary)} ว่ากระทำความผิดฐาน ${dot(fields.charge)} และได้ขอให้ดำเนินการสั่งพักราชการ/พักงาน/ให้พ้นจากตำแหน่งหน้าที่ ความละเอียดแจ้งแล้ว นั้น</p><p class="a5-p-indent">ในการไต่สวนเรื่องนี้ ${dot(fields.inquiryBody, "คณะอนุกรรมการไต่สวน/คณะพนักงาน ป.ป.ท. ไต่สวน")} ได้ดำเนินการเสร็จสิ้นแล้ว เสนอต่อคณะกรรมการ ป.ป.ท. พิจารณาในคราวประชุม ครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} ซึ่งคณะกรรมการ ป.ป.ท. พิจารณาแล้วมีมติว่า ${dot(fields.boardResolution)}</p>`
      : `<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้ดำเนินการไต่สวนโดยการแต่งตั้งคณะอนุกรรมการไต่สวน/คณะพนักงาน ป.ป.ท. ไต่สวน กรณี ${dot(fields.accusedSummary)} ว่ากระทำความผิดฐาน ${dot(fields.charge)}</p><p class="a5-p-indent">ในการไต่สวนเรื่องนี้ ${dot(fields.inquiryBody, "คณะอนุกรรมการไต่สวน/ คณะพนักงาน ป.ป.ท. ไต่สวน")} ได้ดำเนินการเสร็จสิ้นแล้ว เสนอต่อคณะกรรมการ ป.ป.ท. พิจารณาในคราวประชุม ครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} ซึ่งคณะกรรมการ ป.ป.ท. พิจารณาแล้วมีมติว่า ${dot(fields.boardResolution)}</p>`;
    const ending = variant === "suspended" ? "จึงเรียนมาเพื่อโปรดทราบและดำเนินการในส่วนที่เกี่ยวข้องต่อไป" : isAgency ? "จึงเรียนมาเพื่อโปรดทราบ" : "จึงเรียนมาเพื่อทราบ";
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch7ExternalHead(fields, "แจ้งผลการพิจารณาของคณะกรรมการ ป.ป.ท.", "เรียน", recipient)}${reference}
${body}<p>${ending}</p>
${renderBatch7ExternalFooter(fields)}${variant === "suspended" ? "<p><strong>หมายเหตุ:</strong> ในการที่มีการสั่งพักราชการ/พักงาน/ให้พ้นจากตำแหน่ง ให้คณะอนุกรรมการไต่สวน/คณะพนักงาน ป.ป.ท. ไต่สวน รีบดำเนินการแจ้งโดยเร็ว</p>" : ""}<p class="a5-form-corner">ปปท. 8-0${variant === "complainant" ? "1" : variant === "accused" ? "2" : variant === "agency" ? "3" : "4"}</p></article>`;
  }

  function renderDisciplinaryRequest(fields = {}, includesCriminal = false) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch7ExternalHead(fields, "ขอให้พิจารณาลงโทษทางวินัย", "เรียน", fields.recipientAuthority)}
<p><strong>สิ่งที่ส่งมาด้วย</strong> 1. สำเนารายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. เรื่องที่ ${dot(fields.inquiryReportCaseNo)} จำนวน ${dot(fields.inquiryReportPages)} แผ่น<br>2. สำเนามติคณะกรรมการ ป.ป.ท. ครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} จำนวน ${dot(fields.resolutionPages)} แผ่น</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้ดำเนินการไต่สวนโดยการแต่งตั้งคณะอนุกรรมการไต่สวน/คณะพนักงาน ป.ป.ท. ไต่สวน กรณี ${dot(fields.accusedSummary)} ว่ากระทำความผิดฐาน ${dot(fields.charge)}</p><p class="a5-p-indent">คณะกรรมการ ป.ป.ท. ได้พิจารณาสำนวนการไต่สวนในคราวประชุม ครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} แล้วมีมติว่า ${dot(fields.boardResolution)}</p>
<p class="a5-p-indent">ดังนั้น เพื่อปฏิบัติตามมาตรา ๓๘${includesCriminal ? " และ ๔๔" : ""} แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอส่งรายงานการไต่สวนและเอกสารที่เกี่ยวข้องมายังท่านเพื่อพิจารณาโทษทางวินัยแก่ ${dot(fields.disciplinedAccused)} ตามกฎหมาย ระเบียบ หรือข้อบังคับว่าด้วยการบริหารงานบุคคลของ ${dot(fields.agencyName)} ภายใน 6๐ วันนับแต่วันที่ได้รับหนังสือฉบับนี้ โดยมิต้องดำเนินการสอบสวนทางวินัยอีก และเมื่อได้ดำเนินการลงโทษทางวินัยแล้ว ขอได้ส่งสำเนาคำสั่งลงโทษดังกล่าวไปให้คณะกรรมการ ป.ป.ท. ทราบภายใน ๑๕ วัน นับแต่วันที่ได้ออกคำสั่งด้วย</p>${includesCriminal ? "<p>อนึ่ง สำหรับความผิดทางอาญาในเรื่องนี้ ได้ส่งเรื่องให้พนักงานอัยการเพื่อดำเนินคดีอาญาแก่บุคคลดังกล่าวแล้ว</p>" : ""}<p>จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการในส่วนที่เกี่ยวข้องต่อไป</p>
${renderBatch7ExternalFooter(fields, "ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ", includesCriminal ? {} : { unitPlaceholder: "(กปท./ปปท.เขต ของฝ่ายเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)" })}<p class="a5-form-corner">ปปท. 8-0${includesCriminal ? "6" : "5"}</p></article>`;
  }

  function renderCriminalReferral(fields = {}) {
    const recipient = fields.recipientAttorneyDepartment === true ? `อธิบดีอัยการ ${text(fields.recipientArea)}` : fields.recipientProvincialProsecutor === true ? `อัยการจังหวัด ${text(fields.recipientArea)}` : "";
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch7ExternalHead(fields, "ขอส่งสำนวนให้ดำเนินคดีอาญา", "เรียน", recipient)}
<p><strong>สิ่งที่ส่งมาด้วย</strong> 1. ต้นฉบับสำนวนการไต่สวน เรื่องที่ ${dot(fields.inquiryCaseNo)} ${dot(fields.originalVolumeDescription)}<br>2. สำเนาสำนวนไต่สวน จำนวน ${dot(fields.copyCount)} ชุด<br>3. แผ่นบันทึกข้อมูล สำเนาอิเล็กทรอนิกส์ จำนวน ${dot(fields.electronicMediaCount)} แผ่น</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้ดำเนินการไต่สวน กรณี ${dot(fields.accusedSummary)} ว่ากระทำความผิดฐาน ${dot(fields.charge)}</p><p>คณะกรรมการ ป.ป.ท. ได้พิจารณาสำนวนการไต่สวนแล้ว ในคราวประชุมครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} มีมติว่า ${dot(fields.boardResolution)} จึงขอส่งสำนวนการไต่สวนในเรื่องนี้มาเพื่อดำเนินคดีอาญา ตามนัยมาตรา ๔๔ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติมต่อไป เมื่อดำเนินการได้ผลเป็นประการใด โปรดแจ้งให้ทราบด้วย จักขอบคุณมาก</p><p>จึงเรียนมาเพื่อโปรดพิจารณา</p>${renderBatch7ExternalFooter(fields)}<p class="a5-form-corner">ปปท. 8-07</p></article>`;
  }

  function renderJointTeamRequest(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch7ExternalHead(fields, "ขอให้แต่งตั้งคณะทำงานร่วมเพื่อไต่สวนเพิ่มเติม", "กราบเรียน", "อัยการสูงสุด")}
<p><strong>อ้างถึง</strong> สำนวนการไต่สวนเรื่องที่ ${dot(fields.inquiryCaseNo)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> สำเนาหนังสือแจ้งข้อไม่สมบูรณ์ของพนักงานอัยการ ${dot(fields.responsibleProsecutor)} ที่ ${dot(fields.incompletenessLetterNo)} จำนวน ${dot(fields.attachmentPages)} แผ่น</p><p class="a5-p-indent">ตามที่อ้างถึง คณะกรรมการ ป.ป.ท. ได้ส่งสำนวนการไต่สวน กรณี ${dot(fields.accusedSummary)} ว่ากระทำความผิดฐาน ${dot(fields.charge)} ให้พนักงานอัยการ ${dot(fields.responsibleProsecutor)} พิจารณาฟ้องคดี นั้น ต่อมาได้รับแจ้งว่าสำนวนการไต่สวนดังกล่าวมีข้อไม่สมบูรณ์พอที่จะดำเนินคดีได้ รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย</p><p class="a5-p-indent">เพื่อให้ได้ข้อเท็จจริงและพยานหลักฐานเพียงพอที่จะทราบรายละเอียดและพิสูจน์เกี่ยวกับการทุจริตในภาครัฐของผู้ถูกกล่าวหา คณะกรรมการ ป.ป.ท. พิจารณาแล้วเห็นว่า มีความจำเป็นที่จะต้องตั้งคณะทำงานร่วมกันเพื่อไต่สวนเพิ่มเติม ตามนัยมาตรา ๔๔ วรรคสอง แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม</p><p class="a5-p-indent">จึงกราบเรียนมาเพื่อโปรดพิจารณามอบหมายพนักงานอัยการเป็นผู้แทนคณะทำงานร่วมฯ จำนวน ${dot(fields.representativeCount)} ท่าน และแจ้งรายชื่อให้สำนักงาน ป.ป.ท. ทราบเพื่อดำเนินการต่อไป จักขอบคุณมาก</p><div class="a5-signature-block"><p>ขอแสดงความนับถืออย่างยิ่ง</p><p>(${dot(fields.signerName)})</p><p>ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p></div><div class="a5-letter-footer"><p>สำนัก ${dot(fields.ownerUnit, "(กปท./ปปท.เขต ของฝ่ายเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)")}</p><p>โทร. ${dot(fields.phone)}</p><p>โทรสาร ${dot(fields.fax)}</p><p>(${dot(fields.officerName, "ระบุชื่อ-สกุลของอนุกรรมการและเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน")})</p></div><p class="a5-form-corner">ปปท. 8-08</p></article>`;
  }

  function renderMemoHead(fields = {}, subject = "") {
    return `<h2 class="a5-paper-title">บันทึกข้อความ</h2><p><strong>ส่วนราชการ</strong> ${dot(fields.ownerUnit)} โทร. ${dot(fields.phone)}</p><p><strong>ที่</strong> ปป ${dot(fields.memoNo)} <strong>วันที่</strong> ${dot(fields.memoDate)}</p><p><strong>เรื่อง</strong> ${escapeHtml(subject)}</p>`;
  }

  function renderRepresentatives(fields = {}, prefix = "representative", options = {}) {
    const thaiNumbers = ["๑", "๒", "๓"];
    const roles = [
      "เป็นหัวหน้าคณะทำงานผู้แทนคณะกรรมการ ป.ป.ท.",
      "เป็นคณะทำงานผู้แทนคณะกรรมการ ป.ป.ท.",
      "เป็นคณะทำงานและเลขานุการคณะทำงานผู้แทนคณะกรรมการ ป.ป.ท."
    ];
    return [1, 2, 3].map(index => {
      const number = options.numbering === "thai-paren" ? `${thaiNumbers[index - 1]})` : options.numbering === "thai-dot" ? `${thaiNumbers[index - 1]}.` : `${index}.`;
      const role = options.includeRoles ? ` ${roles[index - 1]}` : "";
      return `<p>${number} ${dot(fields[`${prefix}Name${index}`])} ตำแหน่ง ${dot(fields[`${prefix}Position${index}`])}${role}</p>`;
    }).join("");
  }

  function renderJointTeamAppointmentMemo(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">${renderMemoHead(fields, "ขอแต่งตั้งคณะทำงานผู้แทนร่วมระหว่างสำนักงาน ป.ป.ท. กับ สำนักงานอัยการสูงสุด")}<p><strong>เรียน</strong> ประธานกรรมการ ป.ป.ท.</p><h3>๑. เรื่องเดิม</h3><p>๑.๑ คณะกรรมการ ป.ป.ท. ได้มีการประชุม ครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} มีมติว่า การกระทำของ ${dot(fields.prosecutedAccused)} เป็นความผิดทางอาญาฐานเป็น ${dot(fields.criminalOffence)} (เอกสาร ๑)</p><p>๑.๒ สำนักงาน ป.ป.ท. มีหนังสือ ${dot(fields.prosecutionLetterNo)} ลงวันที่ ${dot(fields.prosecutionLetterDate)} ถึงอัยการผู้ฟ้องคดี ขอให้ดำเนินคดีอาญาแก่ ${dot(fields.prosecutedAccused)} ตามฐานความผิด ที่คณะกรรมการ มีมติชี้มูลความผิด (เอกสาร ๒)</p><h3>๒. ข้อเท็จจริง</h3><p>๒.๑ สำนักงานอัยการผู้ฟ้องคดี ได้มีหนังสือที่ ${dot(fields.deficiencyLetterNo)} ลงวันที่ ${dot(fields.deficiencyLetterDate)} แจ้งข้อไม่สมบูรณ์พอที่จะดำเนินคดีอาญาแก่ ${dot(fields.prosecutedAccused)} กล่าวคือ ${dot(fields.deficiencySummary)} (เอกสาร ๓)</p><p>๒.๒ คณะกรรมการ ป.ป.ท. ได้มีการประชุม ครั้งที่ ${dot(fields.secondBoardMeetingNo)} เมื่อวันที่ ${dot(fields.secondBoardMeetingDate)} มีมติว่า ${dot(fields.secondBoardResolution)} (เอกสาร ๔)</p><p>๒.๓ สำนักงาน ป.ป.ท. ได้มีหนังสือขอให้อัยการสูงสุดแต่งตั้งคณะทำงานร่วมฯ กับคณะกรรมการ ป.ป.ท. และอัยการสูงสุดได้มีหนังสือแจ้งรายชื่อคณะทำงานร่วมฯ (${dot(fields.reference5, "เอกสาร ๕")} - ${dot(fields.reference6, "เอกสาร ๖")})</p><p class="a5-form-corner">ปปท. 8-09</p></article>
<article class="a5-report-paper a5-outcome-paper a5-paper-page"><h3>๓. ข้อกฎหมาย</h3><p>๓.๑ พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา ๔๔ วรรคสอง บัญญัติว่า “ในกรณีที่พนักงานอัยการมีความเห็นว่าข้อเท็จจริง รายงาน เอกสาร หรือความเห็นของคณะกรรมการ ป.ป.ท.ที่ได้รับยังไม่สมบูรณ์พอที่จะดำเนินคดีได้ ให้พนักงานอัยการแจ้งให้คณะกรรมการ ป.ป.ท. ทราบเพื่อไต่สวนเพิ่มเติม โดยให้ ระบุข้อที่ไม่สมบูรณ์นั้นให้ครบถ้วนในคราวเดียวกัน ในกรณีจะเป็นคณะกรรมการ ป.ป.ท. จะร่วมกับอัยการสูงสุดตั้งคณะทำงานร่วมกันเพื่อไต่สวนข้อเท็จจริงเพิ่มเติมก็ได้”</p><p>๓.๒ ระเบียบว่าด้วยหลักเกณฑ์และวิธีการเกี่ยวกับการไต่สวน พ.ศ. ๒๕๖๘ ข้อ ${dot(fields.regulationClause)}</p><p>ในกรณีที่คณะกรรมการ ป.ป.ท. มีมติว่าข้อกล่าวหาใดมีมูลแลเป็นความผิดทางอาญาให้ส่งเรื่องพร้อมทั้งสำนวนการไต่สวน รายงาน เอกสาร และความเห็นของคณะกรรมการ ป.ป.ท. ให้พนักงานอัยการดำเนินคดีต่อไป หากพนักงานอัยการเห็นว่าสำนวนการไต่สวนที่ได้รับยังไม่สมบูรณ์พอที่จะดำเนินคดีได้ และแจ้งให้คณะกรรมการ ป.ป.ท. ทราบเพื่อไต่สวนเพิ่มเติม ในกรณีจำเป็นคณะกรรมการ ป.ป.ท. จะร่วมกับอัยการสูงสุดตั้งคณะทำงานร่วมกันเพื่อไต่สวนเพิ่มเติมก็ได้</p><p>เอกสาร ๑–๖: ${dot(fields.reference1)}, ${dot(fields.reference2)}, ${dot(fields.reference3)}, ${dot(fields.reference4)}, ${dot(fields.reference5)}, ${dot(fields.reference6)}</p><h3>๔. ข้อพิจารณา</h3><p>การแต่งตั้งคณะทำงานร่วมผู้แทนคณะกรรมการ ป.ป.ท. ตามมาตรา ๔๔ วรรค ๒พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ประกอบระเบียบว่าด้วยหลักเกณฑ์และวิธีการเกี่ยวกับการไต่สวน พ.ศ. ๒๕68 ข้อ ${dot(fields.regulationClause)} พิจารณาและเห็นควรเสนอให้แต่งตั้งบุคคลดังต่อไปนี้ ประกอบด้วย</p>${renderRepresentatives(fields, "representative", { numbering: "thai-paren", includeRoles: true })}<h3>๕. ข้อเสนอ</h3><p>พิจารณาแล้วเห็นควรเสนอให้แต่งตั้งบุคคลดังกล่าวตามข้อ ๔ เป็นคณะทำงานร่วมกับอัยการสูงสุด</p><p>จึงเรียนมาเพื่อโปรดพิจารณา</p><p class="a5-paper-right">(${dot(fields.signerName)})<br>ผู้ช่วยเลขานุการคณะกรรมการ ป.ป.ท.</p><p class="a5-form-corner">ปปท. 8-09</p></article>`;
  }

  function renderJointTeamNamesMemo(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">${renderMemoHead(fields, "แจ้งรายชื่อคณะทำงานร่วม")}<p><strong>เรียน</strong> ${dot(fields.recipientDirector, "ผอ.สำนัก/กอง")}</p><p>ด้วย พนักงานอัยการเจ้าของคดีได้มีหนังสือที่ ${dot(fields.deficiencyLetterNo)} ลงวันที่ ${dot(fields.deficiencyLetterDate)} แจ้งข้อไม่สมบูรณ์พอที่จะดำเนินคดีแก่ ${dot(fields.accusedName)} ผู้ถูกกล่าวหาได้ และอัยการสูงสุดได้แจ้งรายชื่อคณะทำงานผู้แทนอัยการผู้ฟ้องคดีมาให้ทราบ รวม ${dot(fields.prosecutorRepresentativeCount)} คน รายละเอียดตามหนังสือที่แนบมาพร้อมนี้</p><p>กบค. ได้เสนอรายชื่อบุคคลที่สมควรได้รับการแต่งตั้งเป็นคณะทำงานผู้แทนคณะกรรมการ ป.ป.ท. รวม ${dot(fields.paccRepresentativeCount)} คน ตามมาตรา ๔๔ วรรคสอง แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ต่อคณะกรรมการ ป.ป.ท. ซึ่งคณะกรรมการ ป.ป.ท. ได้มีมติให้ความเห็นชอบแล้ว ประกอบด้วย</p>${renderRepresentatives(fields, "representative", { numbering: "thai-dot", includeRoles: true })}<p>ดังนั้น กบค. จึงขอส่งสำนวนการไต่สวน พร้อมเอกสารในเรื่องดังกล่าว มาเพื่อโปรดดำเนินการตามอำนาจหน้าที่ จำนวน ${dot(fields.fileCount)} แฟ้ม รวม ${dot(fields.pageCount)} แผ่น</p><p class="a5-paper-right">(${dot(fields.signerName)})<br>ผู้ช่วยเลขานุการคณะกรรมการ ป.ป.ท.</p><p class="a5-form-corner">ปปป. 8-10</p></article>`;
  }

  function renderMeetingRecord(fields = {}) {
    const thaiNumbers = ["๑", "๒", "๓", "๔", "๕"];
    const attendeeAffiliations = ["คณะทำงานผู้แทนจากคณะกรรมการ ป.ป.ท.", "คณะทำงานผู้แทนจากสำนักงานอัยการสูงสุด", "คณะทำงานผู้แทนจากสำนักงานอัยการสูงสูด", "คณะทำงานผู้แทนจากสำนักงานอัยการสูงสุด", "คณะทำงานผู้แทนจากคณะกรรมการ ป.ป.ท."];
    const attendees = attendeeAffiliations.map((affiliation, index) => `<p>${thaiNumbers[index]}. ${dot(fields[`attendee${index + 1}`])} ${affiliation}</p>`).join("");
    const prosecutorReps = renderRepresentatives(fields, "prosecutorRepresentative", { numbering: "thai-dot" });
    const paccReps = renderRepresentatives(fields, "paccRepresentative", { numbering: "thai-dot", includeRoles: true });
    const signatures = [1, 2, 3].map(index => `<p>ลงชื่อ ${dot(fields[`prosecutorSigner${index}`])} คณะทำงานผู้แทนอัยการสูงสุด</p>`).join("") + [1, 2, 3].map(index => `<p>ลงชื่อ ${dot(fields[`paccSigner${index}`])} คณะทำงานผู้แทนคณะกรรมการ ป.ป.ท.</p>`).join("");
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page"><h2 class="a5-paper-title">บันทึกการประขุม<br>คณะทำงานผู้แทนร่วมระหว่างคณะกรรมการ ป.ป.ท. และสำนักงานอัยการสูงสุด</h2><p>ตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา ๔๔ วรรคสอง ครั้งที่ ${dot(fields.meetingNo)}/${dot(fields.meetingYear)} เมื่อวันที่ ${dot(fields.meetingDate)} ณ ${dot(fields.meetingPlace)}</p><h3>ผู้เข้าร่วมประชุม</h3>${attendees}<h3>ผู้ไม่มาประชุม</h3><p>${dot(fields.absent1)} คณะทำงานผู้แทนจากคณะกรรมการ ป.ป.ท.</p><p>${dot(fields.absent2)} คณะทำงานผู้แทนจากสำนักงานอัยการสูงสุด</p><p>เริ่มประชุมเวลา ${dot(fields.startTime)} น.</p><p>ที่ประชุมได้เชิญ ${dot(fields.chairName)} ปฏิบัติหน้าที่ประธานในที่ประชุม ประธานกล่าวเปิดประชุม และมอบให้ ${dot(fields.secretaryName)} เลขานุการคณะทำงาน ดำเนินการเสนอข้อมูลต่อที่ประชุม</p><p>${dot(fields.presenterName)} ผู้แทนจากคณะกรรมการ ป.ป.ท. เสนอต่อที่ประชุมว่าด้วย สำนักงาน ป.ป.ท. ลับ ที่ ปป ${dot(fields.prosecutionLetterNo)} ลงวันที่ ${dot(fields.prosecutionLetterDate)} ส่งเรื่องไปยังอัยการผู้ฟ้องคดีเพื่อดำเนินคดีอาญาแก่ ${dot(fields.accusedName)} ในความผิดฐาน ${dot(fields.charge)} นั้น</p><p class="a5-form-corner">ปปท. 8-11</p></article>
<article class="a5-report-paper a5-outcome-paper a5-paper-page"><p>อัยการผู้ฟ้องคดี ได้พิจารณารายงาน เอกสาร และความเห็นที่สำนักงาน ป.ป.ท. ส่งมาให้แล้วเห็นว่า ยังไม่สมบูรณ์พอที่จะดำเนินคดีอาญากับผู้ถูกกล่าวหาได้ในประเด็นต่อไปนี้</p><p>๑. ${dot(fields.deficiencyIssue1)}</p><p>๒. ${dot(fields.deficiencyIssue2)}</p><p>และสำนักงาน ป.ป.ท. ได้มีหนังสือแจ้งให้สำนักงานอัยการสูงสุดแจ้งรายชื่อคณะทำงานร่วม ซึ่งอัยการสูงสุดได้แต่งตั้ง บุคคลดังต่อไปนี้</p><h3>ผู้แทนอัยการสูงสุด</h3>${prosecutorReps}<p>เป็นคณะทำงานผู้แทนอัยการสูงสุด เพื่อดำเนินการรวบรวมพยานหลักฐานดังกล่าวให้สมบูรณ์ตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา ๔๔ วรรคสอง</p><p>คณะกรรมการ ป.ป.ท. ได้พิจารณาแต่งตั้งคณะทำงานผู้แทนคณะกรรมการ ป.ป.ท. ประกอบด้วย</p><h3>ผู้แทนคณะกรรมการ ป.ป.ท.</h3>${paccReps}<p>คณะทำงานของผู้แทนทั้ง ๒ ฝ่าย ได้ประชุมร่วมกันมีมติ ดังนี้ ${dot(fields.resolution)}</p><p>ปิดประชุมเวลา ${dot(fields.endTime)} น.</p>${signatures}<p class="a5-form-corner">ปปท. 8-11</p></article>`;
  }

  function renderJointTeamResolutionNotice(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch7ExternalHead(fields, "แจ้งมติแต่งตั้งคณะทำงานร่วม", "เรียน", "อัยการผู้ฟ้องคดี")}<p><strong>อ้างถึง</strong> หนังสือสำนักงานอัยการผู้ฟ้องคดี ที่ ${dot(fields.prosecutorLetterNo)} ลงวันที่ ${dot(fields.prosecutorLetterDate)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> สำเนาบันทึกการประชุมคณะทำงานร่วมระหว่างคณะกรรมการ ป.ป.ท. และสำนักงานอัยการสูงสุด และเอกสารที่เกี่ยวข้อง จำนวน ${dot(fields.attachmentPages)} แผ่น</p><p class="a5-p-indent">ตามหนังสือที่อ้างถึง สำนักงานอัยการผู้ฟ้องคดีได้แจ้งข้อไม่สมบูรณ์พอที่จะดำเนินคดีแก่ ${dot(fields.accusedName)} ผู้ถูกกล่าวหา พอที่จะดำเนินคดีได้ โดยได้ดำเนินการแต่งตั้งคณะทำงานร่วมกับสำนักงานอัยการสูงสุด ตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา ๔๔ ความละเอียดแจ้งแล้ว นั้น</p><p class="a5-p-indent">คณะทำงานร่วมได้ทำการร่วมประชุมเพื่อพิจารณาข้อไม่สมบูรณ์ตามที่อัยการผู้รับผิดชอบแจ้งให้ทราบ โดยเป็นการประชุมครั้งที่ ${dot(fields.meetingNo)} เมื่อวันที่ ${dot(fields.meetingDate)} มีมติว่า ${dot(fields.resolution)} รายละเอียดปรากฏตามสิ่งที่มาด้วย</p><p>จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการในส่วนที่เกี่ยวข้องต่อไป</p>${renderBatch7ExternalFooter(fields)}<p class="a5-form-corner">ปปท. 8-12</p></article>`;
  }

  function renderDissentReferral(fields = {}) {
    const partial = fields.partialNoIndict === true ? ` ในข้อหา ${dot(fields.nonIndictedCharges)}` : "";
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch7ExternalHead(fields, "ส่งความเห็นแย้ง", "กราบเรียน", "อัยการสูงสุด")}<p><strong>สิ่งที่ส่งมาด้วย</strong> สำนวนการไต่สวนเรื่องที่ ${dot(fields.inquiryCaseNo)}</p><p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้ดำเนินการไต่สวน กรณี ${dot(fields.accusedSummary)} ว่ากระทำความผิดฐาน ${dot(fields.charge)} และสำนักงาน ป.ป.ท. ได้ส่งเรื่องให้พนักงานอัยการ ${dot(fields.prosecutorOffice)} ดำเนินคดีอาญาแก่ผู้ถูกกล่าวหาในความผิดฐานดังกล่าว ตามมาตรา 44 พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ซึ่งพนักงานอัยการ ${dot(fields.prosecutorOffice)} มีความเห็นควรสั่งไม่ฟ้องผู้ถูกกล่าวหา${partial}</p><p class="a5-p-indent">คณะกรรมการ ป.ป.ท. ในคราวประชุมครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} พิจารณาแล้วมีความเห็นแย้ง ดังนี้</p><p>๑. ${dot(fields.dissentReason1)}</p><p>๒. ${dot(fields.dissentReason2)}</p><p class="a5-p-indent">จึงเรียนมาเพื่อโปรดทราบ และขอส่งสำนวนการไต่สวนพร้อมความเห็นแย้งมาเพื่อชี้ขาด ตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา 44 วรรคสาม</p>${renderBatch7ExternalFooter(fields, "ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ", { salutation: "ขอแสดงความนับถืออย่างยิ่ง" })}<p class="a5-form-corner">ปปท. 8-13</p></article>`;
  }

  function renderReviewScaffold(fields = {}) {
    return `<h3>5. ความเห็นผู้บังคับบัญชาชั้นต้น (หัวหน้าพนักงาน ป.ป.ท.)</h3><p>${dot(fields.supervisorOpinion)}</p><p>(${dot(fields.supervisorName)}) ${dot(fields.supervisorPosition)}</p><h3>6. ความเห็นผู้อำนวยการ (หัวหน้าพนักงาน ป.ป.ท.)</h3><p>${dot(fields.directorOpinion)}</p><p>(${dot(fields.directorName)}) ${dot(fields.directorPosition)}</p><h3>7. ความเห็นรองเลขาธิการ/ผู้ช่วยเลขาธิการ</h3><p>${dot(fields.executiveOpinion)}</p><p>(${dot(fields.executiveName)}) ${dot(fields.executivePosition)}</p><h3>8. ความเห็นเลขาธิการ</h3><p>${dot(fields.secretaryOpinion)}</p><p>(${dot(fields.secretaryNameReview)}) ${dot(fields.secretaryPosition)}</p><p><strong>เรียน ประธานกรรมการ ป.ป.ท.</strong> เพื่อโปรดพิจารณานำเข้าที่ประชุมคณะกรรมการ ป.ป.ท. ต่อไป</p><p class="a5-paper-right">(${dot(fields.forwardingSecretaryName)})<br>เลขาธิการคณะกรรมการ ป.ป.ท.</p>`;
  }

  function renderIncompletenessActionReport(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">${renderMemoHead(fields, "รายงานผลการดำเนินการตามการแจ้งข้อไม่สมบูรณ์ของพนักงานอัยการ")}<p><strong>เรื่องที่</strong> ${dot(fields.caseRefNo)}</p><p>${mark(fields.caseFromNaccM62)} คดีรับจาก ป.ป.ช. ตามมาตรา 62 ${mark(fields.caseMisconduct)} คดีประพฤติมิชอบ</p><p><strong>เรียน</strong> ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p><h3>๑. เรื่องเดิม</h3><p>๑.๑ คณะกรรมการ ป.ป.ท. ได้มีการประชุม ครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} มีมติว่า การกระทำของ ${dot(fields.accusedName)} เป็นความผิดทางอาญาฐานเป็น ${dot(fields.criminalOffence)}</p><p>๑.๒ สำนักงาน ป.ป.ท. มีหนังสือ ${dot(fields.prosecutionLetterNo)} ลงวันที่ ${dot(fields.prosecutionLetterDate)} ถึงอัยการผู้ฟ้องคดี ขอให้ดำเนินคดีอาญาแก่ ${dot(fields.accusedName)} ตามฐานความผิดที่คณะกรรมการ มีมติชี้มูลความผิด</p><h3>2. ข้อเท็จจริง</h3><p>๒.๑ สำนักงานอัยการผู้ฟ้องคดี ได้มีหนังสือที่ ${dot(fields.deficiencyLetterNo)} ลงวันที่ ${dot(fields.deficiencyLetterDate)} แจ้งข้อไม่สมบูรณ์พอที่จะดำเนินคดีอาญาแก่ ${dot(fields.accusedName)} กล่าวคือ ${dot(fields.deficiencySummary)}</p><p>๒.๒ คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ได้ดำเนินการตามแจ้งข้อไม่สมบูรณ์ของพนักงานอัยการแล้ว และแจ้งผลดำเนินการให้พนักงานอัยการทราบแล้วตามหนังสือ ${dot(fields.resultLetterNo)} ลงวันที่ ${dot(fields.resultLetterDate)}</p><h3>๓. ข้อกฎหมาย และระเบียบที่เกี่ยวข้อง</h3><p>๓.๑ พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา ๔๔ วรรคสอง</p><p>๓.๒ ระเบียบว่าด้วยหลักเกณฑ์และวิธีการเกี่ยวกับการไต่สวน พ.ศ. ๒๕๖๘ ข้อ 120</p><h3>๔. ข้อเสนอ/ความเห็น</h3><p>เห็นควรเสนอคณะกรรมการ ป.ป.ท. เพื่อโปรดทราบ</p><p>จึงเรียนมาเพื่อโปรดพิจารณา</p><p>(${dot(fields.proposerName)}) ${dot(fields.proposerPosition, "อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.เจ้าของสำนวน")}</p><p class="a5-form-corner">ปปท. 8-40</p></article><article class="a5-report-paper a5-outcome-paper a5-paper-page">${renderReviewScaffold(fields)}<p class="a5-form-corner">ปปท. 8-40</p></article>`;
  }

  function renderIncompletenessResultNotice(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch7ExternalHead(fields, "รายงานผลดำเนินการตามการแจ้งข้อไม่สมบูรณ์", "เรียน", fields.recipientProsecutor)}<p><strong>อ้างถึง</strong> หนังสือสำนักงานอัยการ ${dot(fields.prosecutorOffice)} ที่ ${dot(fields.referenceLetterNo)} ลงวันที่ ${dot(fields.referenceLetterDate)}</p><p><strong>สิ่งที่ส่งมาด้วย</strong> 1. ${dot(fields.attachmentDescription1)}<br>2. ${dot(fields.attachmentDescription2)}</p><p class="a5-p-indent">ตามหนังสือที่อ้างถึง พนักงานอัยการ สำนักงานอัยการ ${dot(fields.prosecutorOffice)} ขอให้สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ดำเนินการไต่สวนเพิ่มเติม กรณี ${dot(fields.deficiencyFacts)} และให้จัดส่งข้อเท็จจริงดังกล่าวให้สำนักงานอัยการ ${dot(fields.destinationOffice)} ความละเอียดแจ้งแล้ว นั้น</p><p>ในการนี้ คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ได้ไต่สวน ได้ดำเนินไต่สวนเพิ่มเติมเสร็จสิ้นเรียบร้อยแล้ว โดยมีรายละเอียดดังต่อไปนี้ ${dot(fields.additionalInquiryResult)} ปรากฏตามสิ่งที่ส่งมาด้วย</p><p>จึงเรียนมาเพื่อโปรดพิจารณา</p>${renderBatch7ExternalFooter(fields)}<p class="a5-form-corner">ปปท. 8-41</p></article>`;
  }

  function renderReviewMemorandum(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-paper-page">${renderMemoHead(fields, "รายงานผู้บังคับบัญชาขอทบทวนมติการชี้มูลความผิดวินัย")}<p><strong>เรื่องที่</strong> ${dot(fields.caseRefNo)}</p><p>${mark(fields.caseFromNaccM62)} คดีรับจาก ป.ป.ช. ตามมาตรา 62 ${mark(fields.caseMisconduct)} คดีประพฤติมิชอบ</p><p><strong>เรียน</strong> ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p><h3>๑. เรื่องเดิม</h3><p>๑.๑ คณะกรรมการ ป.ป.ท. ได้มีการประชุม ครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} มีมติว่า การกระทำของ ${dot(fields.accusedName)} เป็นความผิดทางวินัย ฐานเป็น ${dot(fields.disciplinaryOffence)}</p><p>๑.๒ สำนักงาน ป.ป.ท. มีหนังสือ ${dot(fields.disciplineLetterNo)} ลงวันที่ ${dot(fields.disciplineLetterDate)} ถึง ${dot(fields.agencyName)} ขอให้ดำเนินการทางวินัยแก่ ${dot(fields.accusedName)} ตามฐานความผิดที่คณะกรรมการ มีมติชี้มูลความผิด</p><h3>2. ข้อเท็จจริง</h3><p>${dot(fields.agencyName)} ได้มีหนังสือที่ ${dot(fields.reviewRequestLetterNo)} ลงวันที่ ${dot(fields.reviewRequestDate)} แจ้งขอให้ทบทวนมติเรื่องดังกล่าว เนื่องจาก ${dot(fields.reviewReason)}</p><h3>๓. ข้อกฎหมาย และระเบียบที่เกี่ยวข้อง</h3><p>๓.๑ พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา ๔0</p><p>๓.๒ ระเบียบว่าด้วยหลักเกณฑ์และวิธีการเกี่ยวกับการไต่สวน พ.ศ. ๒๕๖๘ ข้อ 130 ข้อ 131 ข้อ 132</p><h3>๔. ข้อเสนอ/ความเห็น</h3><p>ผู้บังคับบัญชาหรือผู้มีอำนาจแต่งตั้งถอดถอนได้ขอให้ทบทวนมติภายใน 30 วัน หรือไม่: ${dot(fields.withinThirtyDaysAssessment)}</p><p>และมีพยานหลักฐานใหม่ อันแสดงได้ว่าผู้ถูกกล่าวหามิได้มีการกระทำความผิดตามที่กล่าวหาหรือกระทำความผิดในฐานความผิดที่แตกต่างจากที่ถูกกล้าวหาหรือไม่: ${dot(fields.newEvidenceAssessment)}</p><p>${dot(fields.proposal)}</p><p>จึงเรียนมาเพื่อโปรดพิจารณา</p><p>(${dot(fields.proposerName)}) ${dot(fields.proposerPosition, "อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.เจ้าของสำนวน")}</p><p class="a5-form-corner">ปปท. 8-42</p></article><article class="a5-report-paper a5-outcome-paper a5-paper-page">${renderReviewScaffold(fields)}<p class="a5-form-corner">ปปท. 8-42</p></article>`;
  }

  function renderReviewResultNotice(fields = {}) {
    return `<article class="a5-report-paper a5-outcome-paper a5-letter-paper a5-paper-page">${renderBatch7ExternalHead(fields, "แจ้งผลการทบทวนมติ", "เรียน", fields.agencyHeadName)}<p><strong>อ้างถึง</strong> หนังสือ ${dot(fields.agencyName)} ที่ ${dot(fields.referenceLetterNo)} ลงวันที่ ${dot(fields.referenceLetterDate)}</p><p class="a5-p-indent">ตามหนังสือที่อ้างถึง ${dot(fields.agencyName)} ขอให้คณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (คณะกรรมการ ป.ป.ท.) ดำเนินการทบทวนมติ กรณี ${dot(fields.requestFacts)} และให้แจ้งผลการพิจารณาเรื่องดังกล่าวให้ ${dot(fields.agencyName)} ความละเอียดแจ้งแล้ว นั้น</p><p>ในการนี้ คณะกรรมการ ป.ป.ท. ได้พิจารณาแล้ว ในคราวการประชุมครั้งที่ ${dot(fields.boardMeetingNo)} เมื่อวันที่ ${dot(fields.boardMeetingDate)} มีมติว่า ${dot(fields.boardResolution)}</p><p>จึงเรียนมาเพื่อโปรดทราบ</p>${renderBatch7ExternalFooter(fields)}<p class="a5-form-corner">ปปท. 8-43</p></article>`;
  }

  function renderOutcomePaperRawByDocId(formId, fields = {}) {
    if (BATCH7_FORM_IDS.has(formId)) fields = { ...defaultPayload(formId), ...object(fields) };
    if (formId === DOC_IDS.NO_GROUNDS_COMPLAINANT_NOTICE) return renderNoGroundsNotice(fields, "complainant");
    if (formId === DOC_IDS.NO_GROUNDS_ACCUSED_NOTICE) return renderNoGroundsNotice(fields, "accused");
    if (formId === DOC_IDS.NO_GROUNDS_AGENCY_NOTICE) return renderNoGroundsNotice(fields, "agency");
    if (formId === DOC_IDS.NO_GROUNDS_SUSPENDED_AGENCY_NOTICE) return renderNoGroundsNotice(fields, "suspended");
    if (formId === DOC_IDS.DISCIPLINARY_ACTION_REQUEST) return renderDisciplinaryRequest(fields, false);
    if (formId === DOC_IDS.DISCIPLINARY_CRIMINAL_ACTION_REQUEST) return renderDisciplinaryRequest(fields, true);
    if (formId === DOC_IDS.CRIMINAL_PROSECUTION_REFERRAL) return renderCriminalReferral(fields);
    if (formId === DOC_IDS.JOINT_TEAM_REPRESENTATIVE_REQUEST) return renderJointTeamRequest(fields);
    if (formId === DOC_IDS.JOINT_TEAM_APPOINTMENT_MEMORANDUM) return renderJointTeamAppointmentMemo(fields);
    if (formId === DOC_IDS.JOINT_TEAM_NAMES_HANDOVER_MEMORANDUM) return renderJointTeamNamesMemo(fields);
    if (formId === DOC_IDS.JOINT_TEAM_MEETING_RECORD) return renderMeetingRecord(fields);
    if (formId === DOC_IDS.JOINT_TEAM_RESOLUTION_NOTICE) return renderJointTeamResolutionNotice(fields);
    if (formId === DOC_IDS.NON_INDICTMENT_DISSENT_REFERRAL) return renderDissentReferral(fields);
    if (formId === DOC_IDS.PROSECUTOR_INCOMPLETENESS_ACTION_REPORT) return renderIncompletenessActionReport(fields);
    if (formId === DOC_IDS.PROSECUTOR_INCOMPLETENESS_RESULT_NOTICE) return renderIncompletenessResultNotice(fields);
    if (formId === DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_MEMORANDUM) return renderReviewMemorandum(fields);
    if (formId === DOC_IDS.DISCIPLINARY_RESOLUTION_REVIEW_RESULT_NOTICE) return renderReviewResultNotice(fields);
    if (BATCH8_EDITOR_FIELDS[formId]) fields = { ...defaultPayload(formId), ...object(fields) };
    if (formId === DOC_IDS.ARREST_RECORD) return renderArrestRecord(fields);
    if (formId === DOC_IDS.CUSTODY_NOTIFICATION_RECORD) return renderCustodyNotificationRecord(fields);
    if (formId === DOC_IDS.POLICE_CUSTODY_REQUEST) return renderPoliceCustodyRequest(fields);
    if (formId === DOC_IDS.PROSECUTOR_ARREST_TRANSFER_NOTICE) return renderProsecutorArrestTransferNotice(fields);
    if (formId === DOC_IDS.ARREST_REPORT_MEMORANDUM) return renderArrestReportMemorandum(fields);
    if (formId === DOC_IDS.ARREST_WARRANT_EXECUTION_REPORT) return renderArrestWarrantExecutionReport(fields);
    if (formId === DOC_IDS.DETAINEE_HOLD_REQUEST) return renderDetaineeHoldRequest(fields);
    if (formId === DOC_IDS.IMPRISONMENT_WARRANT_REQUEST) return renderImprisonmentWarrantRequest(fields);
    if (formId === DOC_IDS.PROSECUTOR_SECURE_ACCUSED_REQUEST) return renderProsecutorSecureAccusedRequest(fields);
    if (formId === DOC_IDS.BAIL_CONTRACT_PROPOSAL) return renderBailContractProposal(fields);
    if (formId === DOC_IDS.BAIL_APPLICATION_AND_CONTRACT) return renderBailApplicationAndContract(fields);
    if (formId === DOC_IDS.WITNESS_SUMMONS_DELIVERY) return renderWitnessSummonsDelivery(fields);
    if (formId === DOC_IDS.PROSECUTOR_WITNESS_SUMMONS_REPORT) return renderProsecutorWitnessSummonsReport(fields);
    if (formId === DOC_IDS.SEARCH_INVESTIGATION_REPORT) return renderSearchInvestigationReport(fields);
    if (formId === DOC_IDS.SEARCH_WARRANT_PETITION) return renderSearchWarrantPetition(fields);
    if (formId === DOC_IDS.PETITIONER_WITNESS_STATEMENT) return renderPetitionerWitnessStatement(fields);
    if (formId === DOC_IDS.COURT_PROCEEDING_REPORT) return renderCourtProceedingReport(fields);
    if (formId === DOC_IDS.COURT_SEARCH_WARRANT) return renderCourtSearchWarrant(fields);
    if (formId === DOC_IDS.SEARCH_WARRANT_ENVELOPE) return renderSearchWarrantEnvelope(fields);
    if (formId === DOC_IDS.SEARCH_RECORD) return renderSearchRecord(fields);
    if (formId === DOC_IDS.SEARCH_WARRANT_EXECUTION_REPORT) return renderSearchWarrantExecutionReport(fields);
    if (formId === DOC_IDS.SEIZURE_RECORD) return renderSeizureRecord(fields);
    return "";
  }

  const SOURCE_CAPTIONS = Object.freeze({
    "8-34": "“ตัวอย่างหนังสือขอหมายจำคุก/หมายขัง”",
    "8-35": "“ตัวอย่างหนังสือแจ้งพนักงานอัยการ   กรณีผู้ถูกกล่าวหาถูกคุมขังอยู่ในเรือนจำ”",
    "8-36": "“ตัวอย่างบันทึกเสนอสัญญาประกัน”",
    "8-37": "“ตัวอย่างคำร้องขอประกัน”",
    "8-40": "“ตัวอย่างบันทึกรายงานผลการดำเนินการตามการแจ้งข้อไม่สมบูรณ์ของพนักงานอัยการ”",
    "8-42": "“ตัวอย่างบันทึกรายงานต้นสังกัดขอทบทวนมติ”",
    "8-44": "“ตัวอย่างบันทึกรายงานการสืบสวน”",
    "8-45": "“ตัวอย่างคำร้องขอหมายค้น”",
    "8-46": "“ตัวอย่างคำให้การพยาน”",
    "8-47": "“ตัวอย่างรายงานกระบวนการพิจารณา”",
    "8-48": "“ตัวอย่างหมายค้น”",
    "8-49": "“ตัวอย่างผนึกซองขอหมายค้น”",
    "8-50": "“ตัวอย่างบันทึกการตรวจค้น”",
    "8-52": "“ตัวอย่างบันทึกการตรวจยึด/อายัด”"
  });

  function renderOutcomePaperByDocId(formId, fields = {}) {
    const html = renderOutcomePaperRawByDocId(formId, fields);
    if (!html || /“ตัวอย่าง[^”]+”/.test(html)) return html;
    const meta = MANIFEST.find(item => item.formId === formId);
    if (!meta) return html;
    const caption = SOURCE_CAPTIONS[meta.code] || `“ตัวอย่าง${meta.title.replace(/^แบบ/, "")}”`;
    return html.replace(/(<article\b[^>]*>)/, `$1\n<p class="a5-source-caption">${caption}</p>`);
  }

  const moduleInterface = Object.freeze({
    DOC_IDS,
    MANIFEST,
    ACTIONS,
    defaultPayload,
    validateRequired,
    executeOutcomeDocumentAction,
    renderOutcomeEditorA5,
    captureOutcomeEditorA5,
    renderOutcomePaperByDocId
  });

  root.ECMISActivity5OutcomeDocuments = moduleInterface;
  if (typeof module !== "undefined" && module.exports) module.exports = moduleInterface;
})(typeof globalThis !== "undefined" ? globalThis : window);
