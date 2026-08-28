(function() {
  "use strict";

  const STORAGE_KEY = "ecmis-a4-workspace-v3";
  const THEME_KEY = "ecmis-dashboard-theme";
  const LANG_KEY = "ecmis-dashboard-locale";
  const FONT_STEP_KEY = "ecmis-dashboard-font-step";

  const app = document.getElementById("dashboardApp");
  const isA5Mode = document.body.dataset.analyticsDashboard === "a5" || location.pathname.includes("dashboard-g5");
  const mode = isA5Mode ? "a5" : "a4";
  const qs = new URLSearchParams(location.search);

  // Scale map
  const SCALE_STEPS = {
    "-1": 0.90,
    "0": 1.00,
    "1": 1.15,
    "2": 1.30,
    "3": 1.45
  };

  // States
  let currentLang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "th";
  let currentTheme = localStorage.getItem(THEME_KEY) || "light";
  let fontStep = parseInt(localStorage.getItem(FONT_STEP_KEY) || "1", 10);
  let isFullScreen = !!document.fullscreenElement;

  let allRecords = [];
  let leafletMap = null;
  let mapMarkers = [];
  let mapHeatCircles = [];
  let isDrawerOpen = false;
  let selectedRegion = null;

  // Year & Cycle State
  let yearCycle = qs.get("cycle") || "fiscal";
  let selectedYear = qs.get("year") || "";
  let selectedChannel = qs.get("channel") || "";
  let selectedStage = qs.get("stage") || "";

  // Interactive Drilldown State
  let activeDrill = {
    type: qs.get("drillType") || null,
    val: qs.get("drillVal") || null,
    label: qs.get("drillLbl") || null
  };

  // Section Display Preferences
  const sectionViews = {
    agingMode: "count",
    tribookMode: "summary",
    agencyLimit: 5,
    donutMode: "donut",
    trendMode: "line",
    matrixMode: "heat"
  };

  // Toast Notification
  function showToast(msg) {
    const existing = document.querySelector(".sheet-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "sheet-toast";
    toast.innerHTML = `<span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = "opacity 0.3s ease";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Apply Font Scaling
  function applyFontScaling(step) {
    fontStep = Math.max(-1, Math.min(3, step));
    localStorage.setItem(FONT_STEP_KEY, String(fontStep));
    const scale = SCALE_STEPS[fontStep] || 1.15;
    document.documentElement.style.setProperty("--font-scale", String(scale));
    document.documentElement.style.setProperty("--dash-scale", String(scale));
    document.documentElement.style.fontSize = `${16 * scale}px`;
  }
  applyFontScaling(fontStep);

  // Fullscreen Handler
  function toggleFullScreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  document.addEventListener("fullscreenchange", () => {
    isFullScreen = !!document.fullscreenElement;
    app.querySelectorAll(".btn-fullscreen-toggle").forEach(btn => {
      btn.innerHTML = isFullScreen ? "🗗" : "⛶";
      btn.title = isFullScreen ? "ออกจากโหมดเต็มจอ" : "โหมดเต็มจอ (Full Screen)";
    });
  });

  // PACC Jurisdiction Coordinates & Province Lists
  const PACC_REGIONS = [
    { key: "ส่วนกลาง", name: "ส่วนกลาง (ศรร. กรุงเทพฯ)", lat: 13.7563, lng: 100.5018, provinces: ["กรุงเทพมหานคร", "หน่วยงานราชการส่วนกลาง"] },
    { key: "เขต 1", name: "ป.ป.ท. ภาค 1 (พระนครศรีอยุธยา)", lat: 14.3532, lng: 100.5684, provinces: ["พระนครศรีอยุธยา", "นนทบุรี", "ปทุมธานี", "สระบุรี", "ลพบุรี", "อ่างทอง", "สิงห์บุรี", "ชัยนาท"] },
    { key: "เขต 2", name: "ป.ป.ท. ภาค 2 (ชลบุรี)", lat: 13.3611, lng: 100.9847, provinces: ["ชลบุรี", "ระยอง", "จันทบุรี", "ตราด", "นครนายก", "ปราจีนบุรี", "สระแก้ว", "ฉะเชิงเทรา"] },
    { key: "เขต 3", name: "ป.ป.ท. ภาค 3 (นครราชสีมา)", lat: 14.9799, lng: 102.0978, provinces: ["นครราชสีมา", "ชัยภูมิ", "บุรีรัมย์", "สุรินทร์", "ศรีสะเกษ", "อุบลราชธานี", "ยโสธร", "อำนาจเจริญ"] },
    { key: "เขต 4", name: "ป.ป.ท. ภาค 4 (ขอนแก่น)", lat: 16.4322, lng: 102.8236, provinces: ["ขอนแก่น", "กาฬสินธุ์", "นครพนม", "มหาสารคาม", "มุกดาหาร", "ร้อยเอ็ด", "เลย", "สกลนคร", "หนองคาย", "หนองบัวลำภู", "อุดรธานี", "บึงกาฬ"] },
    { key: "เขต 5", name: "ป.ป.ท. ภาค 5 (เชียงใหม่)", lat: 18.7883, lng: 98.9853, provinces: ["เชียงใหม่", "เชียงราย", "น่าน", "พะเยา", "แพร่", "แม่ฮ่องสอน", "ลำปาง", "ลำพูน"] },
    { key: "เขต 6", name: "ป.ป.ท. ภาค 6 (พิษณุโลก)", lat: 16.8211, lng: 100.2659, provinces: ["พิษณุโลก", "พิจิตร", "นครสวรรค์", "กำแพงเพชร", "เพชรบูรณ์", "สุโขทัย", "ตาก", "อุตรดิตถ์", "อุทัยธานี"] },
    { key: "เขต 7", name: "ป.ป.ท. ภาค 7 (นครปฐม)", lat: 13.8196, lng: 100.0601, provinces: ["นครปฐม", "กาญจนบุรี", "สุพรรณบุรี", "สมุทรสาคร", "สมุทรสงคราม", "เพชรบุรี", "ประจวบคีรีขันธ์", "ราชบุรี"] },
    { key: "เขต 8", name: "ป.ป.ท. ภาค 8 (สุราษฎร์ธานี)", lat: 9.1382, lng: 99.3217, provinces: ["สุราษฎร์ธานี", "นครศรีธรรมราช", "ชุมพร", "กระบี่", "พังงา", "ภูเก็ต", "ระนอง"] },
    { key: "เขต 9", name: "ป.ป.ท. ภาค 9 (สงขลา)", lat: 7.1756, lng: 100.6143, provinces: ["สงขลา", "สตูล", "ตรัง", "พัทลุง", "ปัตตานี", "ยะลา", "นราธิวาส"] }
  ];

  // Stage Translation Maps
  const STAGE_MAP = {
    th: {
      intake: "รับเรื่อง / มอบหมาย",
      review: "รอตรวจพิจารณา",
      correction: "ส่งกลับแก้ไข",
      dispatch: "รอดำเนินการ / จ่ายงาน",
      duplicate: "รวมเรื่องซ้ำ",
      complete: "เสร็จสิ้น",
      plan: "จัดทำแผนคดี",
      p213: "ไต่สวนเบื้องต้น (213)",
      c213: "พิจารณา 213",
      p644: "ไต่สวนชี้มูล (644)",
      c644: "พิจารณา 644",
      follow: "ติดตามมติ / ส่งต่อ",
      closed: "ปิดสำนวน"
    },
    en: {
      intake: "Intake / Assigned",
      review: "Under Review",
      correction: "Returned for Correction",
      dispatch: "Pending Dispatch",
      duplicate: "Merged Duplicate",
      complete: "Completed",
      plan: "Case Planning",
      p213: "Preliminary (213)",
      c213: "213 Consideration",
      p644: "Substantiation (644)",
      c644: "644 Consideration",
      follow: "Resolution Follow-up",
      closed: "Closed"
    }
  };

  const getStageDisplay = (k) => (STAGE_MAP[currentLang] && STAGE_MAP[currentLang][k]) || k;

  // Bilingual Dictionary
  const I18N = {
    th: {
      brand: "E-CMIS",
      a4Title: "ศูนย์วิเคราะห์และทะเบียนควบคุมเรื่องร้องเรียน",
      a5Title: "ศูนย์เฝ้าระวังและวิเคราะห์สำนวนไต่สวนคดี",
      a4Subtitle: "ติดตามการรับเรื่อง เรื่องซ้ำ สัดส่วนช่องทาง และการจ่ายงานสารบรรณ",
      a5Subtitle: "เฝ้าระวังกรอบเวลา SLA สำนวน ม.213 / ม.644 และความเสี่ยงขาดอายุความ",
      searchPlaceholder: "ค้นหาเลขสำนวน, ชื่อเรื่อง, ผู้ถูกกล่าวหา, หรือหน่วยงาน...",
      all: "ทั้งหมด",
      openDrawerBtn: "📊 รายงานสรุปข้อมูลเชิงวิเคราะห์",
      filterRegion: "เขตพื้นที่ / ภาค",
      totalIntakes: "เรื่องรับเข้าทั้งหมด",
      totalIntakesSub: "นับตามทะเบียนในระบบ",
      uniqueComplaints: "เรื่องไม่ซ้ำ (ดำเนินการ)",
      uniqueComplaintsSub: "หักเรื่องซ้ำที่รวมแล้ว",
      mergedDuplicates: "รวมเรื่องซ้ำ",
      mergedDuplicatesSub: "เรื่องที่ยุติรวมสำนวน",
      inProgress: "อยู่ระหว่างดำเนินการ",
      inProgressSub: "เรื่องที่ยังไม่ปิดสำนวน",
      activeCases: "สำนวนที่เปิดอยู่ทั้งหมด",
      activeCasesSub: "สำนวนในความรับผิดชอบ",
      stage213: "ไต่สวนเบื้องต้น (ม.213)",
      stage213Sub: "กรอบระยะเวลา 180 วัน",
      stage644: "ไต่สวนชี้มูล (ม.644)",
      stage644Sub: "กรอบระยะเวลา 1 ปี",
      overdueRisk: "เกินกำหนดเวลา SLA",
      overdueRiskSub: "ต้องเร่งรัดหรือขอขยายเวลา",
      donutTitleA4: "สัดส่วนช่องทางรับเรื่อง",
      donutTitleA5: "สัดส่วนประเภทสำนวน",
      matrixTitleA4: "เมทริกซ์ พื้นที่ × ช่องทางรับเรื่อง",
      matrixTitleA5: "เมทริกซ์ พื้นที่ × ความเสี่ยง SLA",
      trendTitleA4: "แนวโน้มการรับเรื่องรายเดือน",
      trendTitleA5: "แนวโน้มสำนวนเข้ารายเดือน",
      channelBreakdown: "แจกแจงสัดส่วนช่องทางรับเรื่อง",
      registerTitleA4: "ทะเบียนควบคุมเรื่องร้องเรียน (Complaint Register)",
      registerTitleA5: "ทะเบียนสำนวนคดีไต่สวน (Investigation Register)",
      colCaseNo: "เลขสำนวน / เลขเรื่อง",
      colReceived: "วันที่รับเรื่อง",
      colSubject: "เรื่อง / รายละเอียด",
      colAgency: "หน่วยงาน / พื้นที่",
      colOwner: "ผู้รับผิดชอบ",
      colStatus: "สถานะ / สเตจ",
      colDeadline: "วันครบกำหนด SLA",
      colRisk: "ระดับความเสี่ยง",
      riskOverdue: "เกินกำหนด",
      riskDue7: "≤ 7 วัน",
      riskDue30: "≤ 30 วัน",
      riskNormal: "ปกติ",
      riskUnknown: "ไม่ระบุ",
      emptyData: "ไม่พบข้อมูลตามเงื่อนไขที่เลือก",
      prevPage: "ก่อนหน้า",
      nextPage: "ถัดไป",
      pageOf: "หน้า {current} จาก {total}",
      recordsCount: "{count} รายการ",
      btnExportCSV: "📥 ส่งออก CSV",
      btnExportPDF: "🖨️ พิมพ์ / PDF",
      targetAgenciesTitle: "5 อันดับประเภทหน่วยงานที่ถูกยื่นเรื่องสูงสุด",
      pipelineTitle: "ความเร็วการขับเคลื่อนสำนวน (Case Pipeline Velocity)",
      jurisdictionProvinces: "จังหวัดในเขตอำนาจการกำกับดูแล",
      agingTitle: "การกระจายอายุสำนวนค้างสะสม (Case Aging)",
      triBookTitle: "ความสมบูรณ์การออกเลขคุมสารบรรณ 3 เล่ม",
      optFiscalYear: "🏛️ ปีงบประมาณ",
      optCalendarYear: "📅 ปีปฏิทิน",
      fiscalHint: "รอบปีงบประมาณ (1 ต.ค. – 30 ก.ย.)",
      calendarHint: "รอบปีปฏิทิน (1 ม.ค. – 31 ธ.ค.)",
      filterAllYears: "ทุกปี พ.ศ.",
      filterAllChannels: "ทุกช่องทาง",
      filterAllStages: "ทุกสถานะ",
      btnResetFilter: "ล้างตัวกรอง"
    },
    en: {
      brand: "E-CMIS",
      a4Title: "Complaint Registry & Analytics Center",
      a5Title: "Investigation & SLA Surveillance Center",
      a4Subtitle: "Intake volume, duplicate merging, channels & dispatch",
      a5Subtitle: "SLA deadline surveillance, 213/644 stages, and statute risks",
      searchPlaceholder: "Search case number, subject, accused, or agency...",
      all: "All",
      openDrawerBtn: "📊 Comprehensive Analytics Overview",
      filterRegion: "Region / Zone",
      totalIntakes: "Total Intakes",
      totalIntakesSub: "Registered in system",
      uniqueComplaints: "Unique Complaints",
      uniqueComplaintsSub: "Excluding duplicates",
      mergedDuplicates: "Merged Duplicates",
      mergedDuplicatesSub: "Combined into primary",
      inProgress: "In Progress",
      inProgressSub: "Active open records",
      activeCases: "Active Open Cases",
      activeCasesSub: "Under active investigation",
      stage213: "Preliminary (213)",
      stage213Sub: "180-day timeframe",
      stage644: "Substantiation (644)",
      stage644Sub: "1-year timeframe",
      overdueRisk: "Overdue SLA",
      overdueRiskSub: "Urgent extension required",
      donutTitleA4: "Intake Channel Share",
      donutTitleA5: "Case Category Share",
      matrixTitleA4: "Matrix: Region × Channel",
      matrixTitleA5: "Matrix: Region × SLA Risk",
      trendTitleA4: "Monthly Intake Trend",
      trendTitleA5: "Monthly Case Inflow Trend",
      channelBreakdown: "Intake Channel Breakdown",
      registerTitleA4: "Complaint Control Register",
      registerTitleA5: "Investigation Case Register",
      colCaseNo: "Case / Record No.",
      colReceived: "Date Received",
      colSubject: "Subject / Details",
      colAgency: "Agency / Region",
      colOwner: "Assigned Owner",
      colStatus: "Status / Stage",
      colDeadline: "SLA Deadline",
      colRisk: "Risk Level",
      riskOverdue: "Overdue",
      riskDue7: "≤ 7 Days",
      riskDue30: "≤ 30 Days",
      riskNormal: "Normal",
      riskUnknown: "Unspecified",
      emptyData: "No records found matching filters",
      prevPage: "Previous",
      nextPage: "Next",
      pageOf: "Page {current} of {total}",
      recordsCount: "{count} records",
      btnExportCSV: "📥 Export CSV",
      btnExportPDF: "🖨️ Print / PDF",
      targetAgenciesTitle: "Top 5 Target Agencies",
      pipelineTitle: "Case Pipeline Stage Velocity",
      jurisdictionProvinces: "Jurisdiction Covered Provinces",
      agingTitle: "Case Aging & Processing Velocity",
      triBookTitle: "Tri-Book Registry Completeness",
      optFiscalYear: "🏛️ Fiscal",
      optCalendarYear: "📅 Calendar",
      fiscalHint: "Fiscal Cycle: Oct 1 – Sep 30",
      calendarHint: "Calendar Cycle: Jan 1 – Dec 31",
      filterAllYears: "All Years",
      filterAllChannels: "All Channels",
      filterAllStages: "All Stages",
      btnResetFilter: "Reset Filters"
    }
  };

  const t = (k, params = {}) => {
    let str = I18N[currentLang][k] || k;
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  };

  const esc = (s) => String(s ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);
  const num = (v) => new Intl.NumberFormat(currentLang === "th" ? "th-TH" : "en-US").format(v || 0);

  function parseDate(v) {
    if (!v) return null;
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
    const m = String(v).trim().match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
    if (!m) return null;
    let y = +m[3];
    if (y > 2400) y -= 543;
    const p = new Date(y, +m[2] - 1, +m[1]);
    return Number.isNaN(p.getTime()) ? null : p;
  }

  function formatDate(v) {
    const d = parseDate(v);
    if (!d) return "—";
    return new Intl.DateTimeFormat(currentLang === "th" ? "th-TH" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(d);
  }

  function getRecordYear(d, cycle) {
    if (!d) return 2569;
    const gregorianYear = d.getFullYear();
    const thaiYear = gregorianYear + 543;
    if (cycle === "fiscal") {
      return d.getMonth() >= 9 ? thaiYear + 1 : thaiYear;
    }
    return thaiYear;
  }

  function isA5Record(r) {
    const s = String(r.workflow?.stage || "");
    const d = String(r.workflow?.downstreamStatus || r.inquiry?.workflowStatus || "");
    return s.startsWith("a5-") || s.startsWith("a7-") || s === "closed" || /^(REPORT_|OUTCOME_|PROSECUTOR_|CLOSURE_)/.test(d) || !!r.inquiry;
  }

  function getReceivedDate(r) {
    return parseDate(r.caseData?.receivedAt || r.caseData?.received || r.createdAt || r.updatedAt);
  }

  function getDeadlineDate(r) {
    const inq = r.inquiry || {};
    const p = inq.prelim || {};
    const q = inq.inquiry644 || {};
    return q.deadlineAt || q.additionalDeadlineAt || p.deadlineAt || p.additionalDeadlineAt || "";
  }

  function getRiskLevel(r) {
    if (getStageA5(r) === "closed") return "normal";
    const d = parseDate(getDeadlineDate(r));
    if (!d) return "unknown";
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((d - now) / 864e5);
    if (diffDays < 0) return "overdue";
    if (diffDays <= 7) return "due7";
    if (diffDays <= 30) return "due30";
    return "normal";
  }

  function getStageA5(r) {
    const s = String(r.workflow?.stage || "").toLowerCase();
    const d = String(r.workflow?.downstreamStatus || r.inquiry?.workflowStatus || "").toUpperCase();
    if (s === "closed" || d === "CLOSED" || r.workflow?.complete === true) return "closed";
    if (/^(OUTCOME_|PROSECUTOR_|CLOSURE_)/.test(d) || ["a5-outcome", "a5-prosecutor"].includes(s)) return "follow";
    if (/REPORT_644_(SENT|WAIT|RESULT)/.test(d) || s === "a7-644") return "c644";
    if (/^REPORT_644_/.test(d) || ["a5-inquiry", "a5-inquiry-review"].includes(s)) return "p644";
    if (/REPORT_213_(SENT|WAIT|RESULT)/.test(d) || s === "a7-213") return "c213";
    if (/^REPORT_213_/.test(d) || ["a5-prelim", "a5-prelim-review"].includes(s)) return "p213";
    if (/PLAN_|AMENDMENT_/.test(d) || s.includes("plan")) return "plan";
    return "intake";
  }

  function isDuplicate(r) {
    return !!String(r.documentData?.duplicateMergedAt || "");
  }

  function getStageA4(r) {
    const w = r.workflow || {};
    const p = String(w.phase || "").toUpperCase();
    if (w.complete === true) return "complete";
    if (isDuplicate(r)) return "duplicate";
    if (p.includes("CORRECTION")) return "correction";
    if (p.includes("REVIEW") || ["center", "division", "regional-director"].includes(String(w.stage || ""))) return "review";
    if (p.includes("APPROVED") || String(w.stage || "").includes("dispatch")) return "dispatch";
    return "intake";
  }

  function getRegion(r) {
    return String(r.caseData?.region || r.caseData?.intakeRegion || r.inquiry?.intake?.unit || (currentLang === "th" ? "ส่วนกลาง" : "Central"));
  }

  function getProvince(r) {
    return String(r.caseData?.province || r.caseData?.location || getRegion(r));
  }

  function getChannel(r) {
    return String(r.caseData?.channel || r.source?.channel || r.channel || (currentLang === "th" ? "Walk-in" : "Walk-in"));
  }

  function getAllChannels() {
    const baseList = [
      "Website",
      "Walk-in",
      "สายด่วน 1206",
      "หนังสือราชการ",
      "จดหมาย",
      "ม.62 (ป.ป.ช.)",
      "ทางรัฐ",
      "ศูนย์ดำรงธรรม 1111",
      "อีเมล (E-mail)",
      "รัฐสภา",
      "สื่อมวลชน / โซเชียล"
    ];
    const fromRecords = allRecords.map(getChannel).filter(Boolean);
    const combined = Array.from(new Set([...fromRecords, ...baseList])).filter(Boolean);
    return combined.sort((a, b) => a.localeCompare(b, "th"));
  }

  function getFilteredRecords() {
    const q = String(qs.get("q") || "").toLowerCase().trim();
    const region = qs.get("region");
    const yearFilter = qs.get("year");
    const channelFilter = qs.get("channel");
    const stageFilter = qs.get("stage");
    const now = Date.now();

    return allRecords.filter(r => {
      const isTargetMode = mode === "a5" ? isA5Record(r) : !isA5Record(r);
      if (!isTargetMode) return false;

      if (yearFilter) {
        const d = getReceivedDate(r);
        const y = String(getRecordYear(d, yearCycle));
        if (y !== yearFilter) return false;
      }

      if (channelFilter) {
        const ch = getChannel(r);
        if (ch !== channelFilter && !ch.includes(channelFilter) && !channelFilter.includes(ch)) return false;
      }

      if (stageFilter) {
        const st = mode === "a4" ? getStageA4(r) : getStageA5(r);
        if (st !== stageFilter) return false;
      }

      if (q) {
        const c = r.caseData || {};
        const hay = [c.id, c.caseNumber, c.trackingCode, c.subject, c.detail, c.agency, c.region, c.province, r.inquiry?.intake?.investigator].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (region && !getRegion(r).includes(region) && !region.includes(getRegion(r))) return false;

      // Deep Drill-down
      if (activeDrill.type && activeDrill.val) {
        if (activeDrill.type === "aging") {
          const d = getReceivedDate(r);
          const diffDays = d ? Math.floor((now - d.getTime()) / 864e5) : 0;
          if (activeDrill.val === "7" && diffDays > 7) return false;
          if (activeDrill.val === "15" && (diffDays <= 7 || diffDays > 15)) return false;
          if (activeDrill.val === "30" && (diffDays <= 15 || diffDays > 30)) return false;
          if (activeDrill.val === "over" && diffDays <= 30) return false;
        } else if (activeDrill.type === "tribook") {
          const reg = r.registry || r.documentData?.registry || {};
          if (activeDrill.val === "srr" && !(reg.srr || r.caseData?.registry?.srr)) return false;
          if (activeDrill.val === "central" && !(reg.central || reg.office || r.caseData?.registry?.central)) return false;
          if (activeDrill.val === "kbk" && !(reg.kbk || r.caseData?.registry?.kbk)) return false;
        } else if (activeDrill.type === "agency") {
          const hay = String(r.caseData?.agency || "").toLowerCase();
          if (!hay.includes(activeDrill.val.toLowerCase())) return false;
        } else if (activeDrill.type === "kpi") {
          if (activeDrill.val === "unique" && isDuplicate(r)) return false;
          if (activeDrill.val === "dup" && !isDuplicate(r)) return false;
          if (activeDrill.val === "inprog" && r.workflow?.complete === true) return false;
          if (activeDrill.val === "overdue" && getRiskLevel(r) !== "overdue") return false;
        } else if (activeDrill.type === "prov") {
          const hay = (getProvince(r) + " " + getRegion(r)).toLowerCase();
          if (!hay.includes(activeDrill.val.toLowerCase())) return false;
        } else if (activeDrill.type === "month") {
          const d = getReceivedDate(r);
          if (!d) return false;
          const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (ym !== activeDrill.val) return false;
        }
      }

      return true;
    });
  }

  function setDrillDown(type, val, label) {
    if (activeDrill.type === type && activeDrill.val === val) {
      activeDrill = { type: null, val: null, label: null };
      qs.delete("drillType");
      qs.delete("drillVal");
      qs.delete("drillLbl");
    } else {
      activeDrill = { type, val, label };
      qs.set("drillType", type);
      qs.set("drillVal", val);
      qs.set("drillLbl", label);
    }
    history.pushState({}, "", location.pathname + (qs.size ? `?${qs}` : ""));
    isDrawerOpen = true;
    render();
    setTimeout(() => {
      document.getElementById("sheetRegisterSection")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function generateSparklineSVG(color, trendType = "up") {
    const pts = trendType === "up"
      ? "2,22 16,16 32,20 48,10 64,14 78,4"
      : trendType === "down"
      ? "2,5 16,11 32,10 48,18 64,14 78,24"
      : "2,14 16,10 32,18 48,7 64,12 78,8";

    return `
      <svg class="sheet-kpi-spark" viewBox="0 0 80 26">
        <polyline fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${pts}" />
      </svg>
    `;
  }

  /* ================= REAL EXECUTIVE EXPORT ENGINES ================= */
  function exportCSV(rows) {
    if (!rows || !rows.length) {
      showToast("⚠️ ไม่พบข้อมูลสำนวนตามตัวกรองเพื่อส่งออก");
      return;
    }
    const region = qs.get("region") || "ภาพรวม";
    const headers = [
      "ลำดับ",
      "เลขที่รับเรื่อง/เลขสำนวน",
      "วันที่รับเรื่อง",
      "รอบปีงบประมาณ",
      "รอบปีปฏิทิน",
      "เรื่อง/ข้อกล่าวหา",
      "หน่วยงาน/พื้นที่เป้าหมาย",
      "จังหวัด",
      "เขต ป.ป.ท.",
      "ช่องทางการรับเรื่อง",
      "สถานะ/ขั้นตอน",
      "ผู้รับผิดชอบ",
      "สมุด ศรร.",
      "สมุด สารบรรณกลาง",
      "สมุด กบค.",
      "วันครบกำหนด SLA",
      "ระดับความเสี่ยง SLA",
      "สถานะการรวมเรื่องซ้ำ"
    ];

    const lines = rows.map((r, idx) => {
      const c = r.caseData || {};
      const reg = r.registry || r.documentData?.registry || {};
      const id = c.caseNumber || c.id || c.trackingCode || "—";
      const d = getReceivedDate(r);
      const dateStr = formatDate(d);
      const fy = getRecordYear(d, "fiscal");
      const cy = getRecordYear(d, "calendar");
      const subj = (c.subject || c.detail || "").replace(/"/g, '""');
      const agency = (c.agency || "").replace(/"/g, '""');
      const prov = getProvince(r).replace(/"/g, '""');
      const regionStr = getRegion(r).replace(/"/g, '""');
      const channel = getChannel(r).replace(/"/g, '""');
      const stage = mode === "a4" ? getStageDisplay(getStageA4(r)) : getStageDisplay(getStageA5(r));
      const owner = (r.workflow?.intakeOwner?.officer || c.assignedOfficer || "—").replace(/"/g, '""');
      const srr = (reg.srr || c.registry?.srr || "—").replace(/"/g, '""');
      const central = (reg.central || reg.office || c.registry?.central || "—").replace(/"/g, '""');
      const kbk = (reg.kbk || c.registry?.kbk || "—").replace(/"/g, '""');
      const deadline = formatDate(getDeadlineDate(r));
      const risk = getRiskLevel(r);
      const dup = isDuplicate(r) ? "รวมเรื่องซ้ำแล้ว" : "ปกติ (ไม่ซ้ำ)";

      return [
        idx + 1,
        `"${id}"`,
        `"${dateStr}"`,
        `"พ.ศ. ${fy}"`,
        `"พ.ศ. ${cy}"`,
        `"${subj}"`,
        `"${agency}"`,
        `"${prov}"`,
        `"${regionStr}"`,
        `"${channel}"`,
        `"${stage}"`,
        `"${owner}"`,
        `"${srr}"`,
        `"${central}"`,
        `"${kbk}"`,
        `"${deadline}"`,
        `"${risk}"`,
        `"${dup}"`
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...lines].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ECMIS_${mode.toUpperCase()}_Report_${encodeURIComponent(region)}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✅ ส่งออกไฟล์ CSV เรียบร้อยแล้ว (${rows.length} รายการ)`);
  }

  function exportPDF(rows) {
    if (!rows || !rows.length) {
      showToast("⚠️ ไม่พบข้อมูลสำนวนตามตัวกรองเพื่อพิมพ์");
      return;
    }
    const regionName = qs.get("region") || (currentLang === "th" ? "ภาพรวมทั่วประเทศ" : "National Overview");
    const title = mode === "a4" ? t("a4Title") : t("a5Title");
    const nowStr = formatDate(new Date());

    const printWin = window.open("", "_blank");
    if (!printWin) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>${title} - ${regionName}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap">
        <style>
          @page { size: A4 landscape; margin: 12mm 10mm; }
          * { box-sizing: border-box; }
          body {
            font-family: "Sarabun", sans-serif;
            font-size: 12px;
            color: #0f172a;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .rpt-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .rpt-title { font-size: 18px; font-weight: 800; color: #0b2f4f; margin: 0; }
          .rpt-sub { font-size: 12px; color: #475569; margin: 3px 0 0; }
          .rpt-meta { text-align: right; font-size: 11px; color: #64748b; font-weight: 600; }

          .kpi-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 16px;
          }
          .kpi-box {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 12px;
          }
          .kpi-box span { font-size: 11px; color: #475569; font-weight: 700; }
          .kpi-box strong { display: block; font-size: 20px; color: #0284c7; font-family: "Plus Jakarta Sans", sans-serif; margin-top: 4px; font-weight: 800; }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            page-break-inside: auto;
          }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th {
            background: #f1f5f9;
            color: #1e293b;
            font-weight: 800;
            text-align: left;
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            white-space: nowrap;
          }
          td {
            padding: 7px 10px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 10px;
            background: #e2e8f0;
            color: #334155;
          }
          .footer {
            margin-top: 16px;
            font-size: 10px;
            color: #94a3b8;
            text-align: right;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
          }
        </style>
      </head>
      <body>
        <div class="rpt-header">
          <div>
            <h1 class="rpt-title">สำนักงาน ป.ป.ท. · ${title}</h1>
            <p class="rpt-sub">พื้นที่: <strong>${regionName}</strong> · รอบการประมวลผล: <strong>${yearCycle === "fiscal" ? "ปีงบประมาณ" : "ปีปฏิทิน"}</strong></p>
          </div>
          <div class="rpt-meta">
            <div>พิมพ์เมื่อ: ${nowStr}</div>
            <div>จำนวนรายการ: <strong>${rows.length} รายการ</strong></div>
            <div>ระบบ: E-CMIS Command Center</div>
          </div>
        </div>

        <div class="kpi-row">
          <div class="kpi-box">
            <span>📦 รับเรื่องทั้งหมด</span>
            <strong>${rows.length}</strong>
          </div>
          <div class="kpi-box">
            <span>✨ เรื่องไม่ซ้ำ</span>
            <strong>${rows.filter(r => !isDuplicate(r)).length}</strong>
          </div>
          <div class="kpi-box">
            <span>🔗 รวมเรื่องซ้ำ</span>
            <strong>${rows.filter(isDuplicate).length}</strong>
          </div>
          <div class="kpi-box">
            <span>🚨 อยู่ระหว่างดำเนินการ</span>
            <strong>${rows.filter(r => r.workflow?.complete !== true).length}</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:40px; text-align:center;">ลำดับ</th>
              <th>เลขสำนวน / เลขเรื่อง</th>
              <th>วันที่รับเรื่อง</th>
              <th>เรื่อง / ข้อกล่าวหา</th>
              <th>หน่วยงาน / พื้นที่</th>
              <th>ผู้รับผิดชอบ</th>
              <th>สถานะ / สเตจ</th>
              <th>${mode === "a4" ? "ช่องทาง" : "ครบกำหนด SLA"}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => {
              const c = r.caseData || {};
              const id = c.caseNumber || c.id || c.trackingCode || "—";
              const dStr = formatDate(getReceivedDate(r));
              const subj = c.subject || c.detail || "—";
              const agency = c.agency || getRegion(r);
              const owner = r.workflow?.intakeOwner?.officer || c.assignedOfficer || "—";
              const stage = mode === "a4" ? getStageDisplay(getStageA4(r)) : getStageDisplay(getStageA5(r));
              const extra = mode === "a4" ? getChannel(r) : formatDate(getDeadlineDate(r));

              return `
                <tr>
                  <td style="text-align:center; font-weight:700;">${i + 1}</td>
                  <td style="font-weight:700; color:#0284c7;">${esc(id)}</td>
                  <td style="white-space:nowrap;">${dStr}</td>
                  <td>${esc(subj)}</td>
                  <td>${esc(agency)}</td>
                  <td>${esc(owner)}</td>
                  <td><span class="badge">${esc(stage)}</span></td>
                  <td style="white-space:nowrap;">${esc(extra)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <div class="footer">
          เอกสารรายงานราชการสร้างอัตโนมัติจากระบบฐานข้อมูลทะเบียนควบคุม E-CMIS (สำนักงาน ป.ป.ท.)
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        <\/script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    showToast(`🖨️ เตรียมเอกสารสำหรับพิมพ์ / PDF สำเร็จ (${rows.length} รายการ)`);
  }

  function renderFontControls() {
    const scale = SCALE_STEPS[fontStep] || 1.15;
    const pct = Math.round(scale * 100);
    return `
      <div class="sheet-font-controls" role="group" aria-label="ปรับขนาดตัวอักษร">
        <button type="button" class="sheet-font-btn" data-action-font="dec" title="ลดขนาดตัวอักษร">A−</button>
        <button type="button" class="sheet-font-btn ${fontStep === 0 ? "active" : ""}" data-action-font="reset" title="ขนาดมาตรฐาน (100%)">A</button>
        <button type="button" class="sheet-font-btn" data-action-font="inc" title="เพิ่มขนาดตัวอักษร">A+</button>
        <span class="sheet-font-val">${pct}%</span>
      </div>
    `;
  }

  function renderFloatingHeader() {
    const currentRegionFilter = qs.get("region") || "";

    return `
      <header class="gmaps-top-header">
        <div class="gmaps-search-card">
          <div class="gmaps-badge">${mode === "a4" ? "04" : "05"}</div>
          <input type="search" id="gmapsSearchInput" class="gmaps-search-input" placeholder="${t("searchPlaceholder")}" value="${esc(qs.get("q") || "")}">
          <button type="button" id="gmapsSearchClear" class="gmaps-search-clear" style="${qs.get("q") ? "" : "display:none;"}">✕</button>
        </div>

        <div class="gmaps-pills-scroller">
          <button type="button" class="gmaps-filter-pill ${!currentRegionFilter ? "active" : ""}" data-pill-region="">
            📍 ${t("all")}
          </button>
          ${PACC_REGIONS.map(reg => `
            <button type="button" class="gmaps-filter-pill ${currentRegionFilter === reg.name || currentRegionFilter === reg.key ? "active" : ""}" data-pill-region="${reg.key}" data-lat="${reg.lat}" data-lng="${reg.lng}">
              ${reg.key === "ส่วนกลาง" ? "🏢 " + reg.key : "📍 " + reg.key}
            </button>
          `).join("")}
        </div>

        <div class="gmaps-top-actions">
          ${renderFontControls()}
          <button type="button" class="gmaps-icon-btn btn-fullscreen-toggle" title="โหมดเต็มจอ (Full Screen)">
            ${isFullScreen ? "🗗" : "⛶"}
          </button>
          <button type="button" id="gmapsLangBtn" class="gmaps-icon-btn" title="Toggle Language">
            <strong>${currentLang.toUpperCase()}</strong>
          </button>
          <button type="button" id="gmapsThemeBtn" class="gmaps-icon-btn" title="Toggle Theme">
            ${currentTheme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div class="gmaps-heat-legend">
        <span style="font-weight:800; color:var(--text-main);">🌡️ ระดับความหนาแน่น:</span>
        <div class="gmaps-heat-item"><span class="gmaps-heat-dot lvl-green"></span> 1-2</div>
        <div class="gmaps-heat-item"><span class="gmaps-heat-dot lvl-amber"></span> 3-4</div>
        <div class="gmaps-heat-item"><span class="gmaps-heat-dot lvl-red"></span> 5+ (สูง)</div>
        <div class="gmaps-heat-item"><span class="gmaps-heat-dot lvl-0"></span> 0</div>
      </div>
    `;
  }

  function renderAgingDistribution(rows) {
    const now = Date.now();
    let c7 = 0, c15 = 0, c30 = 0, cOver = 0;

    rows.forEach(r => {
      const d = getReceivedDate(r);
      if (!d) { c7++; return; }
      const diffDays = Math.floor((now - d.getTime()) / 864e5);
      if (diffDays <= 7) c7++;
      else if (diffDays <= 15) c15++;
      else if (diffDays <= 30) c30++;
      else cOver++;
    });

    const total = rows.length || 1;
    const maxVal = Math.max(c7, c15, c30, cOver, 1);
    const isPct = sectionViews.agingMode === "pct";

    const v7 = isPct ? `${Math.round(c7/total*100)}%` : c7;
    const v15 = isPct ? `${Math.round(c15/total*100)}%` : c15;
    const v30 = isPct ? `${Math.round(c30/total*100)}%` : c30;
    const vOver = isPct ? `${Math.round(cOver/total*100)}%` : cOver;

    return `
      <div class="sheet-panel-box">
        <div class="sheet-panel-head">
          <div>
            <h3>${t("agingTitle")}</h3>
            <p>${currentLang === "th" ? "จำแนกตามจำนวนวันที่รับเรื่องจนถึงปัจจุบัน" : "Processing aging breakdown"}</p>
          </div>
          <div class="sheet-panel-tools">
            <button type="button" class="sheet-tool-btn ${!isPct ? "active" : ""}" data-tool-aging="count">🔢 จำนวน</button>
            <button type="button" class="sheet-tool-btn ${isPct ? "active" : ""}" data-tool-aging="pct">％ สัดส่วน</button>
          </div>
        </div>
        <div class="sheet-panel-body">
          <div class="sheet-aging-bars">
            <div class="sheet-aging-col drillable-aging" data-drill-type="aging" data-drill-val="7" data-drill-lbl="อายุสำนวน ≤ 7 วัน" title="คลิกเพื่อเจาะลึกดูรายการ ≤ 7 วัน">
              <div class="sheet-aging-bar-track">
                <div class="sheet-aging-bar-val green" style="height:${Math.max(16, (c7/maxVal)*100)}%;">
                  ${v7}
                </div>
              </div>
              <span class="sheet-aging-lbl">≤ 7 วัน 🔍</span>
            </div>

            <div class="sheet-aging-col drillable-aging" data-drill-type="aging" data-drill-val="15" data-drill-lbl="อายุสำนวน 8–15 วัน" title="คลิกเพื่อเจาะลึกดูรายการ 8–15 วัน">
              <div class="sheet-aging-bar-track">
                <div class="sheet-aging-bar-val amber" style="height:${Math.max(16, (c15/maxVal)*100)}%;">
                  ${v15}
                </div>
              </div>
              <span class="sheet-aging-lbl">8–15 วัน 🔍</span>
            </div>

            <div class="sheet-aging-col drillable-aging" data-drill-type="aging" data-drill-val="30" data-drill-lbl="อายุสำนวน 16–30 วัน" title="คลิกเพื่อเจาะลึกดูรายการ 16–30 วัน">
              <div class="sheet-aging-bar-track">
                <div class="sheet-aging-bar-val orange" style="height:${Math.max(16, (c30/maxVal)*100)}%;">
                  ${v30}
                </div>
              </div>
              <span class="sheet-aging-lbl">16–30 วัน 🔍</span>
            </div>

            <div class="sheet-aging-col drillable-aging" data-drill-type="aging" data-drill-val="over" data-drill-lbl="อายุสำนวน > 30 วัน" title="คลิกเพื่อเจาะลึกดูรายการ > 30 วัน">
              <div class="sheet-aging-bar-track">
                <div class="sheet-aging-bar-val red" style="height:${Math.max(16, (cOver/maxVal)*100)}%;">
                  ${vOver}
                </div>
              </div>
              <span class="sheet-aging-lbl">> 30 วัน 🔍</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTriBookRegistry(rows) {
    const total = rows.length || 1;
    let srrCount = 0, centralCount = 0, kbkCount = 0;

    rows.forEach(r => {
      const reg = r.registry || r.documentData?.registry || {};
      if (reg.srr || r.caseData?.registry?.srr) srrCount++;
      if (reg.central || reg.office || r.caseData?.registry?.central) centralCount++;
      if (reg.kbk || r.caseData?.registry?.kbk) kbkCount++;
    });

    const srrPct = Math.round((srrCount / total) * 100);
    const centralPct = Math.round((centralCount / total) * 100);
    const kbkPct = Math.round((kbkCount / total) * 100);

    return `
      <div class="sheet-panel-box">
        <div class="sheet-panel-head">
          <div>
            <h3>${t("triBookTitle")}</h3>
            <p>${currentLang === "th" ? "อัตราการออกเลขคุมตามระเบียบงานสารบรรณ" : "3 Official register books tracking"}</p>
          </div>
          <div class="sheet-panel-tools">
            <span style="font-size:11.5px; color:var(--text-muted);">คลิกแถวเพื่อเจาะลึก 🔍</span>
          </div>
        </div>
        <div class="sheet-panel-body">
          <div class="sheet-tribook-list">
            <div class="sheet-tribook-row drillable-row" data-drill-type="tribook" data-drill-val="srr" data-drill-lbl="มีเลขคุมสมุดรับ ศรร." title="คลิกเพื่อกรองเฉพาะเรื่องที่ออกเลข ศรร.">
              <div class="sheet-tribook-meta">
                <span>📘 สมุดรับเรื่อง ศรร. (ศูนย์รับเรื่องฯ) 🔍</span>
                <strong style="color:#0284c7;">${num(srrCount)} เรื่อง (${srrPct}%)</strong>
              </div>
              <div class="sheet-tribook-track">
                <div class="sheet-tribook-fill srr" style="width:${srrPct}%;"></div>
              </div>
            </div>

            <div class="sheet-tribook-row drillable-row" data-drill-type="tribook" data-drill-val="central" data-drill-lbl="มีเลขคุมสมุดรับ สารบรรณกลาง" title="คลิกเพื่อกรองเฉพาะเรื่องที่ออกเลข สารบรรณกลาง">
              <div class="sheet-tribook-meta">
                <span>📗 สมุดรับ สารบรรณกลาง ป.ป.ท. 🔍</span>
                <strong style="color:#7c3aed;">${num(centralCount)} เรื่อง (${centralPct}%)</strong>
              </div>
              <div class="sheet-tribook-track">
                <div class="sheet-tribook-fill central" style="width:${centralPct}%;"></div>
              </div>
            </div>

            <div class="sheet-tribook-row drillable-row" data-drill-type="tribook" data-drill-val="kbk" data-drill-lbl="มีเลขคุมสมุดรับ กบค." title="คลิกเพื่อกรองเฉพาะเรื่องที่ออกเลข กบค.">
              <div class="sheet-tribook-meta">
                <span>📙 สมุดรับ กองบริหารคดี (กบค.) 🔍</span>
                <strong style="color:#059669;">${num(kbkCount)} เรื่อง (${kbkPct}%)</strong>
              </div>
              <div class="sheet-tribook-track">
                <div class="sheet-tribook-fill kbk" style="width:${kbkPct}%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTopAgencies(rows) {
    const mockAgencies = [
      { name: "องค์กรปกครองส่วนท้องถิ่น (อบต./เทศบาล)", count: Math.max(1, Math.round(rows.length * 0.45)) },
      { name: "ส่วนราชการภูมิภาค (ที่ดิน/เกษตร)", count: Math.max(1, Math.round(rows.length * 0.25)) },
      { name: "สถานีตำรวจภูธร (สภ.)", count: Math.max(0, Math.round(rows.length * 0.15)) },
      { name: "หน่วยงานสาธารณสุขและ รพ.", count: Math.max(0, Math.round(rows.length * 0.10)) },
      { name: "แขวงทางหลวง / คมนาคม", count: Math.max(0, Math.round(rows.length * 0.05)) }
    ];

    const maxCount = Math.max(...mockAgencies.map(a => a.count), 1);

    return `
      <div class="sheet-panel-box">
        <div class="sheet-panel-head">
          <div>
            <h3>${t("targetAgenciesTitle")}</h3>
            <p>${currentLang === "th" ? "หน่วยงานที่ถูกยื่นเรื่องในพื้นที่" : "High-density complaint targets"}</p>
          </div>
          <div class="sheet-panel-tools">
            <span style="font-size:11.5px; color:var(--text-muted);">คลิกแถวเพื่อเจาะลึก 🔍</span>
          </div>
        </div>
        <div class="sheet-panel-body">
          <div class="sheet-agency-list">
            ${mockAgencies.map(ag => {
              const pct = Math.round((ag.count / maxCount) * 100);
              return `
                <div class="sheet-agency-row drillable-row" data-drill-type="agency" data-drill-val="${esc(ag.name)}" data-drill-lbl="หน่วยงาน: ${esc(ag.name)}" title="คลิกเพื่อกรองสำนวนของ ${esc(ag.name)}">
                  <div class="sheet-agency-meta">
                    <span style="color:var(--text-sub);">${esc(ag.name)} 🔍</span>
                    <strong style="color:var(--p-blue);">${num(ag.count)} เรื่อง</strong>
                  </div>
                  <div class="sheet-agency-bar-bg">
                    <div class="sheet-agency-bar-fill" style="width:${pct}%;"></div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderPipelineVelocity(rows) {
    const total = rows.length || 1;
    const p1 = rows.length;
    const p2 = rows.filter(r => ["review", "correction", "p213", "p644", "dispatch", "complete", "follow", "closed"].includes(mode === "a4" ? getStageA4(r) : getStageA5(r))).length;
    const p3 = rows.filter(r => ["p213", "c213", "p644", "c644", "complete", "follow", "closed"].includes(mode === "a4" ? getStageA4(r) : getStageA5(r))).length;
    const p4 = rows.filter(r => ["p644", "c644", "complete", "follow", "closed"].includes(mode === "a4" ? getStageA4(r) : getStageA5(r))).length;
    const p5 = rows.filter(r => ["complete", "follow", "closed"].includes(mode === "a4" ? getStageA4(r) : getStageA5(r))).length;

    const steps = mode === "a4" ? [
      { step: "1", stageKey: "intake", title: "รับเรื่อง/มอบหมาย", count: p1, sub: "100%" },
      { step: "2", stageKey: "review", title: "ตรวจพิจารณา", count: p2, sub: `${Math.round(p2/total*100)}%` },
      { step: "3", stageKey: "correction", title: "ส่งกลับแก้ไข", count: rows.filter(r => getStageA4(r) === 'correction').length, sub: "ตรวจทาน" },
      { step: "4", stageKey: "dispatch", title: "จ่ายงานสารบรรณ", count: rows.filter(r => getStageA4(r) === 'dispatch').length, sub: "ส่งต่อ" },
      { step: "5", stageKey: "complete", title: "เสร็จสิ้นสมบูรณ์", count: p5, sub: `${Math.round(p5/total*100)}%` }
    ] : [
      { step: "1", stageKey: "intake", title: "รับสำนวน", count: p1, sub: "100%" },
      { step: "2", stageKey: "plan", title: "จัดทำแผนคดี", count: p2, sub: "ตั้งคณะ" },
      { step: "3", stageKey: "p213", title: "ไต่สวน 213", count: p3, sub: "180 วัน" },
      { step: "4", stageKey: "p644", title: "ไต่สวน 644", count: p4, sub: "1 ปี" },
      { step: "5", stageKey: "closed", title: "มติ/ส่งอัยการ", count: p5, sub: "สรุปผล" }
    ];

    return `
      <div class="sheet-panel-box" style="min-height:auto;">
        <div class="sheet-panel-head">
          <div>
            <h3>${t("pipelineTitle")}</h3>
            <p>${currentLang === "th" ? "อัตราการไหลเวียนของสำนวนคดีในกระบวนการ" : "Stage velocity flow"}</p>
          </div>
          <div class="sheet-panel-tools">
            <span style="font-size:11.5px; color:var(--text-muted);">คลิกสเตจเพื่อเจาะลึก 🔍</span>
          </div>
        </div>
        <div class="sheet-panel-body">
          <div class="sheet-pipeline-flow">
            ${steps.map((st) => `
              <div class="sheet-pipe-step active drillable-pipe" data-drill-stage="${st.stageKey}" data-drill-lbl="สถานะ: ${esc(st.title)}" title="คลิกเพื่อกรองสำนวนที่อยู่ในสเตจ ${esc(st.title)}">
                <div class="sheet-pipe-circle">${st.step}</div>
                <span class="sheet-pipe-title">${esc(st.title)} 🔍</span>
                <span class="sheet-pipe-sub">${num(st.count)} (${st.sub})</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderProvincesBox() {
    const reg = selectedRegion || PACC_REGIONS.find(r => r.key === qs.get("region"));
    if (!reg) return "";

    return `
      <div class="sheet-provinces-box">
        <div class="sheet-provinces-head">
          <span>🏛️ ${t("jurisdictionProvinces")} (${reg.provinces.length} จังหวัด)</span>
          <span style="font-size:12px; color:var(--text-muted);">พิกัด: ${reg.lat}, ${reg.lng} · คลิกชื่อจังหวัดเพื่อเจาะลึก 🔍</span>
        </div>
        <div class="sheet-provinces-tags">
          ${reg.provinces.map(p => `
            <span class="sheet-prov-tag drillable-prov" data-drill-type="prov" data-drill-val="${esc(p)}" data-drill-lbl="จังหวัด: ${esc(p)}" title="คลิกเพื่อกรองคดีใน ${esc(p)}">
              📍 ${esc(p)} 🔍
            </span>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderSheetKPIs(rows) {
    if (mode === "a4") {
      const dup = rows.filter(isDuplicate).length;
      const unique = rows.length - dup;
      const inProg = rows.filter(r => r.workflow?.complete !== true).length;
      const rate = rows.length ? Math.round((unique / rows.length) * 100) : 0;

      return `
        <div class="sheet-kpi-grid">
          <div class="sheet-kpi-card blue drillable-card" data-drill-type="kpi" data-drill-val="total" data-drill-lbl="รายการรับเข้าทั้งหมด" title="คลิกเพื่อดูรายการรับเข้าทั้งหมด">
            <div class="sheet-kpi-header">
              <span>📦 ${t("totalIntakes")} 🔍</span>
              <span class="sheet-kpi-pill">100%</span>
            </div>
            <div class="sheet-kpi-mid">
              <span class="sheet-kpi-num">${num(rows.length)}</span>
              ${generateSparklineSVG("#0284c7", "up")}
            </div>
            <span class="sheet-kpi-sub">✦ ${t("totalIntakesSub")}</span>
          </div>

          <div class="sheet-kpi-card purple drillable-card" data-drill-type="kpi" data-drill-val="unique" data-drill-lbl="เรื่องไม่ซ้ำ (ดำเนินการ)" title="คลิกเพื่อกรองเฉพาะเรื่องไม่ซ้ำ">
            <div class="sheet-kpi-header">
              <span>✨ ${t("uniqueComplaints")} 🔍</span>
              <span class="sheet-kpi-pill">${rate}%</span>
            </div>
            <div class="sheet-kpi-mid">
              <span class="sheet-kpi-num">${num(unique)}</span>
              ${generateSparklineSVG("#7c3aed", "up")}
            </div>
            <span class="sheet-kpi-sub">✦ ${t("uniqueComplaintsSub")}</span>
          </div>

          <div class="sheet-kpi-card amber drillable-card" data-drill-type="kpi" data-drill-val="dup" data-drill-lbl="เรื่องที่รวมเป็นเรื่องซ้ำ" title="คลิกเพื่อกรองเฉพาะเรื่องที่รวมเรื่องซ้ำ">
            <div class="sheet-kpi-header">
              <span>🔗 ${t("mergedDuplicates")} 🔍</span>
              <span class="sheet-kpi-pill">${rows.length ? Math.round((dup / rows.length) * 100) : 0}%</span>
            </div>
            <div class="sheet-kpi-mid">
              <span class="sheet-kpi-num">${num(dup)}</span>
              ${generateSparklineSVG("#d97706", "flat")}
            </div>
            <span class="sheet-kpi-sub">✦ ${t("mergedDuplicatesSub")}</span>
          </div>

          <div class="sheet-kpi-card emerald drillable-card" data-drill-type="kpi" data-drill-val="inprog" data-drill-lbl="เรื่องที่อยู่ระหว่างดำเนินการ" title="คลิกเพื่อกรองเฉพาะเรื่องที่ยังไม่ปิด">
            <div class="sheet-kpi-header">
              <span>🚨 ${t("inProgress")} 🔍</span>
              <span class="sheet-kpi-pill">${rows.length ? Math.round((inProg / rows.length) * 100) : 0}%</span>
            </div>
            <div class="sheet-kpi-mid">
              <span class="sheet-kpi-num">${num(inProg)}</span>
              ${generateSparklineSVG("#059669", "up")}
            </div>
            <span class="sheet-kpi-sub">✦ ${t("inProgressSub")}</span>
          </div>
        </div>
      `;
    } else {
      const active = rows.filter(r => getStageA5(r) !== "closed");
      const p213 = rows.filter(r => ["p213", "c213"].includes(getStageA5(r))).length;
      const p644 = rows.filter(r => ["p644", "c644"].includes(getStageA5(r))).length;
      const overdue = rows.filter(r => getRiskLevel(r) === "overdue").length;

      return `
        <div class="sheet-kpi-grid">
          <div class="sheet-kpi-card blue drillable-card" data-drill-stage="intake" data-drill-lbl="สำนวนที่เปิดอยู่ทั้งหมด" title="คลิกเพื่อดูสำนวนทั้งหมด">
            <div class="sheet-kpi-header">
              <span>⚖️ ${t("activeCases")} 🔍</span>
              <span class="sheet-kpi-pill">${num(active.length)}</span>
            </div>
            <div class="sheet-kpi-mid">
              <span class="sheet-kpi-num">${num(active.length)}</span>
              ${generateSparklineSVG("#0284c7", "up")}
            </div>
            <span class="sheet-kpi-sub">✦ ${t("activeCasesSub")}</span>
          </div>

          <div class="sheet-kpi-card purple drillable-card" data-drill-stage="p213" data-drill-lbl="สำนวนไต่สวนเบื้องต้น (ม.213)" title="คลิกเพื่อกรองสำนวน 213">
            <div class="sheet-kpi-header">
              <span>🔍 ${t("stage213")} 🔍</span>
              <span class="sheet-kpi-pill">${active.length ? Math.round((p213 / active.length) * 100) : 0}%</span>
            </div>
            <div class="sheet-kpi-mid">
              <span class="sheet-kpi-num">${num(p213)}</span>
              ${generateSparklineSVG("#7c3aed", "up")}
            </div>
            <span class="sheet-kpi-sub">✦ ${t("stage213Sub")}</span>
          </div>

          <div class="sheet-kpi-card emerald drillable-card" data-drill-stage="p644" data-drill-lbl="สำนวนไต่สวนชี้มูล (ม.644)" title="คลิกเพื่อกรองสำนวน 644">
            <div class="sheet-kpi-header">
              <span>📑 ${t("stage644")} 🔍</span>
              <span class="sheet-kpi-pill">${active.length ? Math.round((p644 / active.length) * 100) : 0}%</span>
            </div>
            <div class="sheet-kpi-mid">
              <span class="sheet-kpi-num">${num(p644)}</span>
              ${generateSparklineSVG("#059669", "flat")}
            </div>
            <span class="sheet-kpi-sub">✦ ${t("stage644Sub")}</span>
          </div>

          <div class="sheet-kpi-card rose drillable-card" data-drill-type="kpi" data-drill-val="overdue" data-drill-lbl="สำนวนเกินกำหนดเวลา SLA" title="คลิกเพื่อกรองสำนวนเกินกำหนด">
            <div class="sheet-kpi-header">
              <span>🚨 ${t("overdueRisk")} 🔍</span>
              <span class="sheet-kpi-pill">${active.length ? Math.round((overdue / active.length) * 100) : 0}%</span>
            </div>
            <div class="sheet-kpi-mid">
              <span class="sheet-kpi-num">${num(overdue)}</span>
              ${generateSparklineSVG("#e11d48", "down")}
            </div>
            <span class="sheet-kpi-sub">✦ ${t("overdueRiskSub")}</span>
          </div>
        </div>
      `;
    }
  }

  function renderSheetDonut(rows) {
    const title = mode === "a4" ? t("donutTitleA4") : t("donutTitleA5");
    const colors = ["#0284c7", "#7c3aed", "#059669", "#d97706", "#e11d48", "#06b6d4", "#84cc16", "#ec4899", "#14b8a6", "#f97316"];

    let groups = [];
    if (mode === "a4") {
      const m = new Map();
      rows.forEach(r => {
        const c = getChannel(r);
        m.set(c, (m.get(c) || 0) + 1);
      });
      groups = Array.from(m.entries()).map(([label, val]) => ({ label, val, type: 'channel' })).sort((a, b) => b.val - a.val);
    } else {
      const p213 = rows.filter(r => ["p213", "c213"].includes(getStageA5(r))).length;
      const p644 = rows.filter(r => ["p644", "c644"].includes(getStageA5(r))).length;
      const follow = rows.filter(r => getStageA5(r) === "follow").length;
      const closed = rows.filter(r => getStageA5(r) === "closed").length;
      groups = [
        { label: "ไต่สวน 213", val: p213, type: 'stage', stageKey: 'p213' },
        { label: "ไต่สวน 644", val: p644, type: 'stage', stageKey: 'p644' },
        { label: "ติดตามมติ", val: follow, type: 'stage', stageKey: 'follow' },
        { label: "ปิดสำนวน", val: closed, type: 'stage', stageKey: 'closed' }
      ].filter(x => x.val > 0);
    }

    const total = groups.reduce((acc, g) => acc + g.val, 0) || 1;
    let accumulatedAngle = 0;
    const paths = groups.map((g, idx) => {
      const angle = (g.val / total) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;
      const endAngle = accumulatedAngle;

      const r = 60, cx = 65, cy = 65;
      const x1 = cx + r * Math.cos(Math.PI * (startAngle - 90) / 180);
      const y1 = cy + r * Math.sin(Math.PI * (startAngle - 90) / 180);
      const x2 = cx + r * Math.cos(Math.PI * (endAngle - 90) / 180);
      const y2 = cy + r * Math.sin(Math.PI * (endAngle - 90) / 180);
      const largeArc = angle > 180 ? 1 : 0;

      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      return `<path d="${d}" fill="${colors[idx % colors.length]}" stroke="var(--bg-card)" stroke-width="2" class="drillable-donut-slice" data-drill-type="${g.type}" data-drill-val="${esc(g.stageKey || g.label)}" data-drill-lbl="${esc(g.label)}" style="cursor:pointer;"><title>${esc(g.label)}: ${num(g.val)} (คลิกเพื่อเจาะลึก)</title></path>`;
    }).join("");

    return `
      <div class="sheet-panel-box">
        <div class="sheet-panel-head">
          <div>
            <h3>${title}</h3>
            <p>${currentLang === "th" ? "สัดส่วนปริมาณตามประเภท" : "Proportional share"}</p>
          </div>
          <div class="sheet-panel-tools">
            <span style="font-size:11.5px; color:var(--text-muted);">คลิกเพื่อเจาะลึก 🔍</span>
          </div>
        </div>
        <div class="sheet-panel-body">
          <div class="sheet-donut-layout">
            <div class="sheet-donut-svg">
              <svg viewBox="0 0 130 130" style="width:100%;height:100%;">
                ${paths}
                <circle cx="65" cy="65" r="36" fill="var(--bg-card)" />
              </svg>
              <div class="sheet-donut-label">
                <strong>${num(total)}</strong>
                <span>TOTAL</span>
              </div>
            </div>
            <div class="sheet-donut-legends">
              ${groups.slice(0, 5).map((g, idx) => `
                <div class="sheet-legend-row drillable-row" data-drill-type="${g.type}" data-drill-val="${esc(g.stageKey || g.label)}" data-drill-lbl="${esc(g.label)}" title="คลิกเพื่อกรอง ${esc(g.label)}">
                  <span class="sheet-legend-dot" style="background:${colors[idx % colors.length]};"></span>
                  <span class="sheet-legend-text" title="${esc(g.label)}">${esc(g.label)} 🔍</span>
                  <span class="sheet-legend-count">${num(g.val)} (${Math.round(g.val / total * 100)}%)</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSheetTrend(rows) {
    const title = mode === "a4" ? t("trendTitleA4") : t("trendTitleA5");

    const monthsMap = new Map();
    rows.forEach(r => {
      const d = getReceivedDate(r);
      if (d) {
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthsMap.set(ym, (monthsMap.get(ym) || 0) + 1);
      }
    });

    const months = Array.from(monthsMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    if (!months.length) {
      months.push(["2026-03", 2], ["2026-04", 5], ["2026-05", 8], ["2026-06", 6], ["2026-07", 10], ["2026-08", rows.length || 10]);
    }

    const maxVal = Math.max(...months.map(m => m[1]), 1);
    const W = 340, H = 140, padL = 28, padR = 18, padT = 16, padB = 24;

    const points = months.map((m, i) => {
      const x = padL + (i * (W - padL - padR) / (months.length - 1 || 1));
      const y = padT + (maxVal - m[1]) * (H - padT - padB) / maxVal;
      return { x, y, month: m[0], val: m[1] };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - padB} L ${points[0].x} ${H - padB} Z`;

    return `
      <div class="sheet-panel-box">
        <div class="sheet-panel-head">
          <div>
            <h3>${title}</h3>
            <p>${currentLang === "th" ? "ปริมาณรายเดือนย้อนหลัง" : "Monthly historical volume"}</p>
          </div>
          <div class="sheet-panel-tools">
            <span style="font-size:11.5px; color:var(--text-muted);">คลิกจุดเพื่อเจาะลึก 🔍</span>
          </div>
        </div>
        <div class="sheet-panel-body">
          <div style="width:100%; height:140px;">
            <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:100%;">
              <defs>
                <linearGradient id="trendAreaFillSheet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--p-blue)" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="var(--p-blue)" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="var(--border-card)" stroke-width="1.5"/>
              <path d="${areaPath}" fill="url(#trendAreaFillSheet)"/>
              <path d="${linePath}" fill="none" stroke="var(--p-blue)" stroke-width="2.5" stroke-linecap="round"/>
              ${points.map(p => `
                <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--bg-card)" stroke="var(--p-blue)" stroke-width="3" class="drillable-aging" data-drill-type="month" data-drill-val="${esc(p.month)}" data-drill-lbl="ประจำเดือน ${esc(p.month)}" style="cursor:pointer;">
                  <title>${p.month}: ${p.val} เรื่อง (คลิกเพื่อเจาะลึก)</title>
                </circle>
                <text x="${p.x}" y="${H - 6}" fill="var(--text-muted)" font-size="10" font-weight="700" text-anchor="middle">${p.month.slice(5)}</text>
                <text x="${p.x}" y="${p.y - 8}" fill="var(--text-main)" font-size="10.5" font-weight="800" text-anchor="middle">${p.val}</text>
              `).join("")}
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  function renderSheetMatrix(rows) {
    const title = mode === "a4" ? t("matrixTitleA4") : t("matrixTitleA5");

    const baseRows = allRecords.filter(r => mode === "a5" ? isA5Record(r) : !isA5Record(r));
    const allUniqueRegions = Array.from(new Set(baseRows.map(getRegion))).filter(Boolean);
    const regions = allUniqueRegions.slice(0, 6);

    let cols = [];
    let colLabels = [];

    if (mode === "a4") {
      const allUniqueChannels = Array.from(new Set(baseRows.map(getChannel))).filter(Boolean);
      cols = allUniqueChannels.slice(0, 4);
      if (!cols.length) cols = ["Walk-in", "จดหมาย", "Website", "ม.62 (ป.ป.ช.)"];
      colLabels = cols;
    } else {
      cols = ["overdue", "due7", "due30", "normal"];
      colLabels = [t("riskOverdue"), t("riskDue7"), t("riskDue30"), t("riskNormal")];
    }

    return `
      <div class="sheet-panel-box" style="min-height:auto;">
        <div class="sheet-panel-head">
          <div>
            <h3>${title}</h3>
            <p>${currentLang === "th" ? "เลือกจุดความหนาแน่นเพื่อเจาะลึกข้อมูล" : "Cross-tab matrix"}</p>
          </div>
          <div class="sheet-panel-tools">
            <span style="font-size:11.5px; color:var(--text-muted);">คลิก Cell เพื่อเจาะลึก 🔍</span>
          </div>
        </div>
        <div style="overflow-x:auto;">
          <table class="sheet-matrix-table-el">
            <thead>
              <tr>
                <th>${t("filterRegion")}</th>
                ${colLabels.map(cl => `<th>${esc(cl)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${regions.map(reg => `
                <tr>
                  <td>${esc(reg)}</td>
                  ${cols.map(c => {
                    const count = rows.filter(r => {
                      if (getRegion(r) !== reg) return false;
                      if (mode === "a4") return getChannel(r) === c || getChannel(r).includes(c);
                      return getRiskLevel(r) === c;
                    }).length;

                    let lvl = "lvl-0";
                    if (count >= 3) lvl = "lvl-red";
                    else if (count === 2) lvl = "lvl-amber";
                    else if (count === 1) lvl = "lvl-green";

                    return `
                      <td>
                        <span class="sheet-bubble-indicator ${lvl} drillable-aging" data-matrix-region="${esc(reg)}" data-matrix-col="${esc(c)}" title="${esc(reg)} × ${esc(c)}: ${count} (คลิกเพื่อเจาะลึก)">
                          ${count || 0}
                        </span>
                      </td>
                    `;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSheetTable(rows) {
    const page = Math.max(1, parseInt(qs.get("page") || "1", 10));
    const pageSize = 8;
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize);

    return `
      <div class="sheet-table-card" id="sheetRegisterSection">
        ${activeDrill.type ? `
          <div class="sheet-drilldown-banner" style="margin-bottom: 14px;">
            <span>🔍 <strong>กำลังเจาะลึกข้อมูล:</strong> ${esc(activeDrill.label || activeDrill.val)} (${num(rows.length)} รายการ)</span>
            <button type="button" class="sheet-drilldown-clear-btn" id="btnClearDrill">✕ ล้างการเจาะลึก</button>
          </div>
        ` : ""}

        <div class="sheet-table-card-head">
          <div>
            <h3 style="margin:0; font-weight:800; color:var(--text-main);">
              ${mode === "a4" ? t("registerTitleA4") : t("registerTitleA5")}
            </h3>
            <p style="margin:2px 0 0; color:var(--text-muted);">
              ${t("recordsCount", { count: num(rows.length) })}
            </p>
          </div>
          <div class="sheet-pager">
            <button type="button" class="sheet-pager-btn" data-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>${t("prevPage")}</button>
            <span style="font-weight:800;">${t("pageOf", { current: page, total: totalPages })}</span>
            <button type="button" class="sheet-pager-btn" data-page="${page + 1}" ${page >= totalPages ? "disabled" : ""}>${t("nextPage")}</button>
          </div>
        </div>

        <div class="sheet-table-container">
          <table class="sheet-data-table">
            <thead>
              <tr>
                <th>${t("colCaseNo")}</th>
                <th>${t("colReceived")}</th>
                <th>${t("colSubject")}</th>
                <th>${t("colAgency")}</th>
                <th>${mode === "a4" ? t("colOwner") : t("colStatus")}</th>
                ${mode === "a5" ? `<th>${t("colDeadline")}</th><th>${t("colRisk")}</th>` : `<th>${t("colStatus")}</th>`}
              </tr>
            </thead>
            <tbody>
              ${pagedRows.length ? pagedRows.map(r => {
                const c = r.caseData || {};
                const id = esc(c.caseNumber || c.id || c.trackingCode || "—");
                const href = `staff-workflow.html?${mode === "a5" ? "view=a5&" : ""}case=${encodeURIComponent(c.id || c.caseNumber)}`;
                const subject = esc(c.subject || c.detail || "—");
                const agency = esc(c.agency || getRegion(r));
                const receivedStr = formatDate(getReceivedDate(r));

                if (mode === "a4") {
                  const stageKey = getStageA4(r);
                  const stageDisplay = getStageDisplay(stageKey);
                  const owner = esc(r.workflow?.intakeOwner?.officer || c.assignedOfficer || "—");
                  let badgeClass = "neutral";
                  if (stageKey === "complete") badgeClass = "normal";
                  else if (stageKey === "review") badgeClass = "warning";
                  else if (stageKey === "correction") badgeClass = "risk";
                  else if (stageKey === "dispatch") badgeClass = "info";

                  return `
                    <tr>
                      <td><a href="${href}" class="sheet-link-case">${id}</a></td>
                      <td style="white-space:nowrap; font-weight:700;">${receivedStr}</td>
                      <td style="max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:600;" title="${subject}">${subject}</td>
                      <td>${agency}</td>
                      <td style="font-weight:600;">${owner}</td>
                      <td><span class="dash-pill-badge ${badgeClass}">${esc(stageDisplay)}</span></td>
                    </tr>
                  `;
                } else {
                  const stageKey = getStageA5(r);
                  const stageDisplay = getStageDisplay(stageKey);
                  const deadlineStr = formatDate(getDeadlineDate(r));
                  const risk = getRiskLevel(r);
                  let badgeClass = "neutral";
                  let riskLabel = t("riskNormal");
                  if (risk === "overdue") { badgeClass = "risk"; riskLabel = t("riskOverdue"); }
                  else if (risk === "due7") { badgeClass = "warning"; riskLabel = t("riskDue7"); }
                  else if (risk === "due30") { badgeClass = "warning"; riskLabel = t("riskDue30"); }

                  return `
                    <tr>
                      <td><a href="${href}" class="sheet-link-case">${id}</a></td>
                      <td style="white-space:nowrap; font-weight:700;">${receivedStr}</td>
                      <td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:600;" title="${subject}">${subject}</td>
                      <td>${agency}</td>
                      <td><span class="dash-pill-badge neutral">${esc(stageDisplay)}</span></td>
                      <td style="white-space:nowrap; font-weight:700;">${deadlineStr}</td>
                      <td><span class="dash-pill-badge ${badgeClass}">${esc(riskLabel)}</span></td>
                    </tr>
                  `;
                }
              }).join("") : `
                <tr>
                  <td colspan="7" style="text-align:center; padding:28px; color:var(--text-muted); font-size:14px; font-weight:600;">
                    ${t("emptyData")}
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderBottomSheet(rows) {
    const regionName = qs.get("region") || (currentLang === "th" ? "ภาพรวมทั่วประเทศ" : "National Overview");
    const activeYear = qs.get("year") || "";
    const activeChannel = qs.get("channel") || "";
    const activeStage = qs.get("stage") || "";

    const availableChannels = getAllChannels();
    const availableStages = mode === "a4"
      ? [
          { k: "intake", l: "รับเรื่อง / มอบหมาย" },
          { k: "review", l: "รอตรวจพิจารณา" },
          { k: "correction", l: "ส่งกลับแก้ไข" },
          { k: "dispatch", l: "จ่ายงานสารบรรณ" },
          { k: "duplicate", l: "รวมเรื่องซ้ำ" },
          { k: "complete", l: "เสร็จสิ้น" }
        ]
      : [
          { k: "plan", l: "จัดทำแผนคดี" },
          { k: "p213", l: "ไต่สวนเบื้องต้น (213)" },
          { k: "c213", l: "พิจารณา 213" },
          { k: "p644", l: "ไต่สวนชี้มูล (644)" },
          { k: "c644", l: "พิจารณา 644" },
          { k: "follow", l: "ติดตามมติ" },
          { k: "closed", l: "ปิดสำนวน" }
        ];

    return `
      <div class="gmaps-bottom-sheet-backdrop ${isDrawerOpen ? "active" : ""}" id="bottomSheetBackdrop">
        <div class="gmaps-bottom-sheet" id="bottomSheet">
          <div class="gmaps-sheet-handle-bar">
            <div class="gmaps-sheet-handle"></div>
          </div>

          <!-- Tier 1 Header: Title + Tools + Export & Close -->
          <div class="gmaps-sheet-header">
            <div class="gmaps-sheet-header-left">
              <div class="gmaps-sheet-emblem">${mode === "a4" ? "04" : "05"}</div>
              <div>
                <h2>
                  <span>${mode === "a4" ? t("a4Title") : t("a5Title")}</span>
                  <span style="font-size:13.5px; font-weight:700; color:var(--p-blue); background:var(--p-blue-light); padding:2px 8px; border-radius:8px;">📍 ${esc(regionName)}</span>
                </h2>
                <p>${mode === "a4" ? t("a4Subtitle") : t("a5Subtitle")}</p>
              </div>
            </div>

            <div class="sheet-header-actions">
              ${renderFontControls()}
              <button type="button" class="sheet-action-btn btn-fullscreen-toggle" title="โหมดเต็มจอ">
                ${isFullScreen ? "🗗" : "⛶"}
              </button>
              <button type="button" class="sheet-action-btn" id="btnExportCSV">
                ${t("btnExportCSV")}
              </button>
              <button type="button" class="sheet-action-btn" id="btnExportPDF">
                ${t("btnExportPDF")}
              </button>
              <button type="button" class="gmaps-sheet-close-btn" id="bottomSheetCloseBtn" title="Close">✕</button>
            </div>
          </div>

          <!-- Tier 2 Dedicated Horizontal Filter Toolbar -->
          <div class="sheet-filter-toolbar">
            <div class="sheet-toolbar-left">
              <div class="sheet-cycle-switch">
                <button type="button" class="sheet-cycle-btn ${yearCycle === "fiscal" ? "active" : ""}" data-cycle="fiscal" title="นับรอบ 1 ต.ค. - 30 ก.ย.">
                  ${t("optFiscalYear")}
                </button>
                <button type="button" class="sheet-cycle-btn ${yearCycle === "calendar" ? "active" : ""}" data-cycle="calendar" title="นับรอบ 1 ม.ค. - 31 ธ.ค.">
                  ${t("optCalendarYear")}
                </button>
              </div>

              <div class="sheet-toolbar-divider"></div>

              <div class="sheet-select-wrapper">
                <span class="sheet-select-icon">📅</span>
                <select id="hdrSelYear" class="sheet-toolbar-select">
                  <option value="">${t("filterAllYears")}</option>
                  <option value="2569" ${activeYear === "2569" ? "selected" : ""}>พ.ศ. 2569</option>
                  <option value="2568" ${activeYear === "2568" ? "selected" : ""}>พ.ศ. 2568</option>
                  <option value="2567" ${activeYear === "2567" ? "selected" : ""}>พ.ศ. 2567</option>
                  <option value="2566" ${activeYear === "2566" ? "selected" : ""}>พ.ศ. 2566</option>
                </select>
              </div>

              <div class="sheet-select-wrapper">
                <span class="sheet-select-icon">🌐</span>
                <select id="hdrSelChannel" class="sheet-toolbar-select">
                  <option value="">${t("filterAllChannels")} (${availableChannels.length})</option>
                  ${availableChannels.map(ch => `<option value="${esc(ch)}" ${activeChannel === ch ? "selected" : ""}>${esc(ch)}</option>`).join("")}
                </select>
              </div>

              <div class="sheet-select-wrapper">
                <span class="sheet-select-icon">⚡</span>
                <select id="hdrSelStage" class="sheet-toolbar-select">
                  <option value="">${t("filterAllStages")}</option>
                  ${availableStages.map(st => `<option value="${esc(st.k)}" ${activeStage === st.k ? "selected" : ""}>${esc(st.l)}</option>`).join("")}
                </select>
              </div>

              ${(activeYear || activeChannel || activeStage || activeDrill.type) ? `
                <button type="button" id="hdrBtnReset" class="sheet-reset-btn" title="ล้างตัวกรองทั้งหมด">
                  ✕ ${t("btnResetFilter")}
                </button>
              ` : ""}
            </div>

            <div class="sheet-cycle-badge">
              ℹ️ ${yearCycle === "fiscal" ? t("fiscalHint") : t("calendarHint")}
            </div>
          </div>

          <!-- Body Content -->
          <div class="gmaps-sheet-body">
            ${renderProvincesBox()}
            ${renderSheetKPIs(rows)}

            <!-- Row 1: Case Aging & Tri-Book Registry Tracker -->
            <div class="sheet-grid-duo">
              ${renderAgingDistribution(rows)}
              ${renderTriBookRegistry(rows)}
            </div>

            <!-- Row 2: Target Agencies & Donut Share -->
            <div class="sheet-grid-duo">
              ${renderTopAgencies(rows)}
              ${renderSheetDonut(rows)}
            </div>

            <!-- Row 3: Pipeline Velocity & Monthly Trend -->
            <div class="sheet-grid-duo">
              ${renderPipelineVelocity(rows)}
              ${renderSheetTrend(rows)}
            </div>

            <!-- Row 4: Cross-tab Matrix -->
            ${renderSheetMatrix(rows)}

            <!-- Row 5: Full Case Control Register Table -->
            ${renderSheetTable(rows)}
          </div>
        </div>
      </div>
    `;
  }

  function renderFloatingLaunchBar() {
    return `
      <div class="gmaps-bottom-launch-bar">
        <button type="button" class="gmaps-launch-drawer-btn" id="btnOpenDrawer">
          ${t("openDrawerBtn")}
        </button>
      </div>

      <div class="gmaps-bottom-tools">
        <button type="button" class="gmaps-tool-btn" id="toolZoomIn" title="Zoom In">＋</button>
        <button type="button" class="gmaps-tool-btn" id="toolZoomOut" title="Zoom Out">－</button>
        <button type="button" class="gmaps-tool-btn" id="toolRecenter" title="Recenter Thailand">🎯</button>
      </div>
    `;
  }

  function initMap(rows) {
    const mapContainer = document.getElementById("gmapsLeafletCanvas");
    if (!mapContainer || typeof L === "undefined") return;

    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
    }

    leafletMap = L.map("gmapsLeafletCanvas", {
      zoomControl: false,
      scrollWheelZoom: true,
      minZoom: 5,
      maxZoom: 16
    }).setView([13.8, 100.9], 6);

    const tileUrl = currentTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 18
    }).addTo(leafletMap);

    mapMarkers = [];
    mapHeatCircles = [];

    PACC_REGIONS.forEach(reg => {
      const regionRows = allRecords.filter(r => (mode === "a5" ? isA5Record(r) : !isA5Record(r)) && (getRegion(r).includes(reg.key) || (reg.key === "ส่วนกลาง" && getRegion(r).includes("ศรร"))));
      const count = regionRows.length;
      const overdueCount = regionRows.filter(r => getRiskLevel(r) === "overdue").length;

      let heatClass = "heat-zero";
      let haloColor = null;
      let haloRadius = 25000;

      if (count >= 5 || (mode === "a5" && overdueCount > 0)) {
        heatClass = "heat-red";
        haloColor = "#ef4444";
        haloRadius = 55000;
      } else if (count >= 3) {
        heatClass = "heat-amber";
        haloColor = "#f59e0b";
        haloRadius = 40000;
      } else if (count >= 1) {
        heatClass = "heat-green";
        haloColor = "#10b981";
        haloRadius = 28000;
      }

      if (haloColor) {
        const circle = L.circle([reg.lat, reg.lng], {
          radius: haloRadius,
          color: haloColor,
          fillColor: haloColor,
          fillOpacity: 0.18,
          weight: 1.5,
          interactive: false
        }).addTo(leafletMap);
        mapHeatCircles.push(circle);
      }

      const icon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="gmaps-pulsing-marker ${heatClass}"><span>${count}</span></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([reg.lat, reg.lng], { icon }).addTo(leafletMap);

      marker.bindTooltip(`<strong>${reg.name}</strong><br>${count} ${currentLang === "th" ? "สำนวน" : "cases"}`, {
        direction: "top",
        offset: [0, -18]
      });

      marker.on("click", () => {
        selectedRegion = reg;
        setFilter("region", reg.key);
        leafletMap.flyTo([reg.lat, reg.lng], 8, { duration: 1.0 });
        setTimeout(() => {
          isDrawerOpen = true;
          document.getElementById("bottomSheetBackdrop")?.classList.add("active");
        }, 300);
      });

      mapMarkers.push(marker);
    });

    setTimeout(() => {
      try { leafletMap.invalidateSize(); } catch (_e) {}
    }, 250);
  }

  function render() {
    document.documentElement.dataset.theme = currentTheme;
    document.documentElement.lang = currentLang;

    const rows = getFilteredRecords();

    app.innerHTML = `
      <div class="gmaps-dashboard-root">
        <div id="gmapsLeafletCanvas"></div>

        ${renderFloatingHeader()}
        ${renderFloatingLaunchBar()}

        ${renderBottomSheet(rows)}
      </div>
    `;

    bindEvents(rows);
    initMap(rows);
  }

  function setFilter(key, val, keepDrawer = false) {
    if (val) qs.set(key, val);
    else qs.delete(key);
    if (key !== "page") qs.delete("page");
    history.pushState({}, "", location.pathname + (qs.size ? `?${qs}` : ""));
    if (keepDrawer) isDrawerOpen = true;
    render();
  }

  function bindEvents(rows) {
    // Search
    const searchInput = document.getElementById("gmapsSearchInput");
    searchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        setFilter("q", searchInput.value.trim(), isDrawerOpen);
      }
    });
    document.getElementById("gmapsSearchClear")?.addEventListener("click", () => {
      setFilter("q", "", isDrawerOpen);
    });

    // Font Size Controls [ A- | A | A+ ]
    app.querySelectorAll("[data-action-font]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.actionFont;
        if (action === "dec") applyFontScaling(fontStep - 1);
        else if (action === "inc") applyFontScaling(fontStep + 1);
        else applyFontScaling(0);
        render();
      });
    });

    // Full Screen Toggle
    app.querySelectorAll(".btn-fullscreen-toggle").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFullScreen();
      });
    });

    // Fiscal / Calendar Toggle
    app.querySelectorAll("[data-cycle]").forEach(btn => {
      btn.addEventListener("click", () => {
        yearCycle = btn.dataset.cycle;
        setFilter("cycle", yearCycle, isDrawerOpen);
      });
    });

    // In-Toolbar Select Filters
    document.getElementById("hdrSelYear")?.addEventListener("change", (e) => {
      setFilter("year", e.target.value, true);
    });
    document.getElementById("hdrSelChannel")?.addEventListener("change", (e) => {
      setFilter("channel", e.target.value, true);
    });
    document.getElementById("hdrSelStage")?.addEventListener("change", (e) => {
      setFilter("stage", e.target.value, true);
    });

    // Reset Filters Button
    document.getElementById("hdrBtnReset")?.addEventListener("click", () => {
      qs.delete("year");
      qs.delete("channel");
      qs.delete("stage");
      qs.delete("drillType");
      qs.delete("drillVal");
      qs.delete("drillLbl");
      activeDrill = { type: null, val: null, label: null };
      isDrawerOpen = true;
      history.pushState({}, "", location.pathname + (qs.size ? `?${qs}` : ""));
      render();
    });

    // Clear Drilldown Banner
    document.getElementById("btnClearDrill")?.addEventListener("click", () => {
      activeDrill = { type: null, val: null, label: null };
      qs.delete("drillType");
      qs.delete("drillVal");
      qs.delete("drillLbl");
      history.pushState({}, "", location.pathname + (qs.size ? `?${qs}` : ""));
      isDrawerOpen = true;
      render();
    });

    // Aging Unit Toggle Button (Count vs %)
    app.querySelectorAll("[data-tool-aging]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        sectionViews.agingMode = btn.dataset.toolAging;
        isDrawerOpen = true;
        render();
      });
    });

    // === UNIVERSAL DRILL-DOWN LISTENERS ===
    app.querySelectorAll("[data-drill-type]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const type = el.dataset.drillType;
        const val = el.dataset.drillVal;
        const lbl = el.dataset.drillLbl || val;
        setDrillDown(type, val, lbl);
      });
    });

    app.querySelectorAll("[data-drill-stage]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const stage = el.dataset.drillStage;
        setFilter("stage", stage, true);
        setTimeout(() => {
          document.getElementById("sheetRegisterSection")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });
    });

    app.querySelectorAll("[data-matrix-region]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const reg = el.dataset.matrixRegion;
        const col = el.dataset.matrixCol;
        setFilter("region", reg, true);
        if (mode === "a4") {
          setFilter("channel", col, true);
        } else {
          setDrillDown("kpi", col, `ความเสี่ยง: ${col}`);
        }
      });
    });

    // Region Pills
    app.querySelectorAll("[data-pill-region]").forEach(pill => {
      pill.addEventListener("click", () => {
        const regKey = pill.dataset.pillRegion;
        if (!regKey) {
          selectedRegion = null;
          setFilter("region", "", isDrawerOpen);
          leafletMap?.flyTo([13.8, 100.9], 6, { duration: 1.0 });
        } else {
          const found = PACC_REGIONS.find(r => r.key === regKey);
          if (found) {
            selectedRegion = found;
            setFilter("region", found.key, isDrawerOpen);
            leafletMap?.flyTo([found.lat, found.lng], 8, { duration: 1.0 });
            setTimeout(() => {
              isDrawerOpen = true;
              document.getElementById("bottomSheetBackdrop")?.classList.add("active");
            }, 300);
          }
        }
      });
    });

    // Open Drawer button
    document.getElementById("btnOpenDrawer")?.addEventListener("click", () => {
      isDrawerOpen = true;
      document.getElementById("bottomSheetBackdrop")?.classList.add("active");
    });

    // Close Drawer button & Backdrop click
    document.getElementById("bottomSheetCloseBtn")?.addEventListener("click", () => {
      isDrawerOpen = false;
      document.getElementById("bottomSheetBackdrop")?.classList.remove("active");
    });
    document.getElementById("bottomSheetBackdrop")?.addEventListener("click", (e) => {
      if (e.target.id === "bottomSheetBackdrop") {
        isDrawerOpen = false;
        document.getElementById("bottomSheetBackdrop")?.classList.remove("active");
      }
    });

    // Real Executive Exports
    document.getElementById("btnExportCSV")?.addEventListener("click", () => exportCSV(rows));
    document.getElementById("btnExportPDF")?.addEventListener("click", () => exportPDF(rows));

    // Theme & Lang
    document.getElementById("gmapsThemeBtn")?.addEventListener("click", () => {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, currentTheme);
      render();
    });
    document.getElementById("gmapsLangBtn")?.addEventListener("click", () => {
      currentLang = currentLang === "th" ? "en" : "th";
      localStorage.setItem(LANG_KEY, currentLang);
      render();
    });

    // Bottom Tools
    document.getElementById("toolZoomIn")?.addEventListener("click", () => leafletMap?.zoomIn());
    document.getElementById("toolZoomOut")?.addEventListener("click", () => leafletMap?.zoomOut());
    document.getElementById("toolRecenter")?.addEventListener("click", () => {
      selectedRegion = null;
      setFilter("region", "");
      leafletMap?.flyTo([13.8, 100.9], 6, { duration: 1.0 });
    });

    // Table Pagination inside sheet
    app.querySelectorAll("[data-page]").forEach(btn => {
      btn.addEventListener("click", () => {
        setFilter("page", btn.dataset.page, true);
      });
    });
  }

  function init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      allRecords = (Array.isArray(parsed) ? parsed : Object.values(parsed || {})).filter(r => {
        const id = String(r.caseData?.id || r.caseData?.caseNumber || "");
        const subject = String(r.caseData?.subject || r.caseData?.detail || "");
        return !(/^ECMIS-2569-9\d{3}$/.test(id) || /ตัวอย่างคดีสำหรับการไต่สวน|example case/i.test(subject));
      });
    } catch (e) {
      console.warn("Failed to load workspace data:", e);
      allRecords = [];
    }

    render();
  }

  window.addEventListener("popstate", () => {
    const current = new URLSearchParams(location.search);
    Array.from(qs.keys()).forEach(k => qs.delete(k));
    current.forEach((v, k) => qs.set(k, v));
    yearCycle = qs.get("cycle") || "fiscal";
    activeDrill = {
      type: qs.get("drillType") || null,
      val: qs.get("drillVal") || null,
      label: qs.get("drillLbl") || null
    };
    render();
  });

  init();
})();
