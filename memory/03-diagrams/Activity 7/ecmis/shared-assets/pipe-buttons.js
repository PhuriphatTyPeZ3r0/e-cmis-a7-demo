/* ==========================================================================
   pipe-buttons.js — ท่อส่งต่อข้ามกิจกรรม (Cross-Activity Interface)
   ต้องโหลดหลัง cases.js → handoff.js → case-bar.js

   แกนกลางตาม matrix ที่ยืนยันแล้ว:  4 → 5 ⇄ 7 → 8
   6 / 9 / 10 = กระบวนการเฉพาะเหตุการณ์ · 11–14 = ระบบประกอบ (ไม่ใช่โซ่ต่อเนื่อง)

   แก้ 2026-08-17
   · เดิม hard-code '0001/2569' ใน onclick 8 จุด → ใช้เคสที่ active จริงทุกเส้น
   · เดิมเช็ก path.indexOf("index.html") ทำให้เปิดเป็น directory index แล้วปุ่มไม่ขึ้น
     → เลิก gate ด้วย path ทั้งหมด ยึด #caseContextBar เป็นจุดยึดที่มีอยู่ทุกหน้า
   · เดิมส่งแค่ patch + เปลี่ยนหน้า → ตอนนี้ส่ง envelope 13 ฟิลด์ผ่าน ECMISHandoff
   · เพิ่มเส้นย้อนกลับที่ matrix ยืนยันแต่โค้ดไม่มี: 7→5, 9→5, 6→5, 10→5, 8→ต้นสังกัด
   · แยก "ส่งสำนวนให้อัยการ" ออกจาก "อัยการส่งความเห็นกลับ → ก10" (เดิมรวมเป็นเส้นเดียว
     แล้วติดป้าย action:'ส่งอัยการ' ทั้งที่ปลายทางคือ ก10 = คนละเหตุการณ์)
   · ย้าย "อัยการสั่งให้ขอหมายจับ → ก9" จาก ก7 ไป ก10 เพราะคำสั่งอัยการเข้าระบบทาง ก10
     ไม่ใช่การกระทำของคณะกรรมการ ป.ป.ท.
   · แยก ก5 หมายค้น (งานภายใน) ออกจาก ก9 หมายจับ — คงไว้ตามเดิม ถูกแล้ว
   ========================================================================== */
(function(){
  "use strict";
  var Hub = window.ECMISHub, HO = window.ECMISHandoff;
  if (!Hub || !HO){ console.warn("[pipe-buttons] ต้องโหลด cases.js + handoff.js ก่อน"); return; }
  // หน้าสาธารณะ ห้ามมีปุ่มส่งต่อของเจ้าหน้าที่
  if (Hub.isPublicPage && Hub.isPublicPage()) return;

  var CID = Hub.activeCaseId();

  /* ---- กิจกรรมที่หน้านี้อยู่ — อ่านจาก path ของโฟลเดอร์ ---- */
  var ACT_KEYS = ["intake-investigation","witness-protection","board-resolution","person-screening",
                  "arrest-warrant","legal-case","data-migration","analytics","integration-gateway","admin-center"];
  // Activity 7 does not display the cross-activity forwarding rail.
  var PIPE_RAIL_DISABLED_ACTIVITIES = ["board-resolution"];
  var HERE = (function(){
    var p = location.pathname;
    for (var i = 0; i < ACT_KEYS.length; i++){
      if (p.indexOf("/" + ACT_KEYS[i]) !== -1){
        return PIPE_RAIL_DISABLED_ACTIVITIES.indexOf(ACT_KEYS[i]) === -1 ? ACT_KEYS[i] : null;
      }
    }
    return null;
  })();
  if (!HERE) return;   // หน้า hub/login ไม่ต้องมีท่อ

  /* ---- CSS: อ่าน base จาก src ของ <script> ตัวเอง ไม่เดาความลึกของ URL ---- */
  (function ensureCss(){
    if (document.querySelector('link[data-ecmis-pipe]')) return;
    var s = document.currentScript;
    if (!s){
      var all = document.getElementsByTagName("script");
      for (var i = all.length - 1; i >= 0; i--){
        if ((all[i].src || "").indexOf("pipe-buttons.js") !== -1){ s = all[i]; break; }
      }
    }
    if (!s || !s.src) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = s.src.replace(/\/pipe-buttons\.js(\?.*)?$/, "/pipe-buttons.css");
    l.setAttribute("data-ecmis-pipe", "1");
    document.head.appendChild(l);
  })();

  /* งานที่ทำได้เฉพาะบางบทบาทในกิจกรรมเดียวกัน */
  var EDGE_ROLES = {
    // ไต่สวน/ทำรายงาน 213-644 — ไม่ใช่งานของธุรการรับเรื่อง
    investigate: ["officer","regional-officer","regional-director","center","division","acting"],
    // ขอคุ้มครองพยาน — เจ้าหน้าที่ระดับทำสำนวนขึ้นไป
    witness:     ["officer","regional-officer","regional-director","center","division","acting"],
  };

  var RETURN_REASONS = [
    "เอกสาร/พยานหลักฐานไม่ครบถ้วน",
    "ข้อเท็จจริงยังไม่ชัดเจน ต้องแสวงหาเพิ่มเติม",
    "ความเห็นข้อกฎหมายไม่ตรงกัน (ความเห็นแย้ง)",
    "รูปแบบรายงานไม่ถูกต้องตามแบบที่กำหนด",
    "เสนอผิดสายงาน / ผิดหน่วยงานรับผิดชอบ"
  ];
  var WARRANT_RESULTS = [
    { v:"จับกุมได้แล้ว",              status:"จับกุมได้ — ส่งตัวดำเนินคดี" },
    { v:"ยังไม่พบตัวผู้ต้องหา",        status:"หมายจับยังไม่มีผล — ติดตามต่อ" },
    { v:"ถอนหมายจับ",                status:"ถอนหมายจับแล้ว" },
    { v:"หมายจับสิ้นผล (หมดอายุความ)", status:"หมายจับสิ้นผล" }
  ];

  /* ==================== ทะเบียนเส้นทาง ====================
     kind: forward | return | external | inplace
     เส้น return/external จะถามข้อมูลเพิ่มก่อนส่ง (เหตุที่ตีกลับ / ผลคดี)          */
  var EDGES = [

    /* ---------- ก4+5 รับเรื่อง/ไต่สวน ---------- */
    { from:"intake-investigation", to:"board-resolution", kind:"forward", target:"board-resolution/inbox.html",
      cap:"investigate",
      label:"ส่งรายงาน 213 → ก7 มติ", icon:"fa-paper-plane", tone:"primary",
      trigger:"ไต่สวนเบื้องต้นแล้วเสร็จ เสนอรายงานตามข้อ 213",
      docs:["รายงานการไต่สวนเบื้องต้น (213)","สำนวนการไต่สวน","บันทึกถ้อยคำพยาน","เอกสารหลักฐานประกอบ","หนังสือนำส่ง"],
      statusAfter:"รอบรรจุวาระคณะกรรมการ ป.ป.ท. (213)", sla:"30 วันก่อนวันประชุม",
      patch:{ report213:"ส่งแล้ว", docType:"213" } },

    { from:"intake-investigation", to:"board-resolution", kind:"forward", target:"board-resolution/inbox.html",
      cap:"investigate",
      label:"ส่งรายงาน 644 → ก7 มติ", icon:"fa-file-contract", tone:"navy",
      trigger:"ไต่สวนข้อเท็จจริงแล้วเสร็จ เสนอรายงานตามข้อ 644",
      docs:["รายงานการไต่สวนข้อเท็จจริง (644)","สำนวนการไต่สวน","ความเห็นพนักงานไต่สวน","หนังสือนำส่ง"],
      statusAfter:"รอบรรจุวาระคณะกรรมการ ป.ป.ท. (644)", sla:"30 วันก่อนวันประชุม",
      patch:{ report644:"ส่งแล้ว", docType:"644" } },

    { from:"intake-investigation", to:"witness-protection", kind:"forward", cap:"witness",
      label:"ขอคุ้มครองพยาน → ก6", icon:"fa-shield-halved", tone:"green",
      trigger:"พยานหรือผู้แจ้งมีเหตุอันควรเชื่อว่าจะไม่ปลอดภัย",
      docs:["คำร้องขอคุ้มครองพยาน (คบ.1)","แบบประเมินภัย","สำเนาสำนวนเฉพาะส่วนที่จำเป็น"],
      statusAfter:"รอพิจารณาคำขอคุ้มครองพยาน", sla:"7 วัน",
      patch:{ witnessReq:"ยื่นคำขอคุ้มครอง" },
      note:"ชั้นความลับ: ปกปิด — ส่งเฉพาะข้อมูลที่จำเป็นต่อการประเมินภัย" },

    { from:"intake-investigation", to:"integration-gateway", kind:"forward",
      label:"ตรวจข้อมูลภายนอก → ก13", icon:"fa-plug", tone:"blue",
      trigger:"ต้องการข้อมูลโครงการ/คู่สัญญา/ทะเบียนราษฎร์ ประกอบการไต่สวน",
      docs:["คำขอเรียกดูข้อมูล","เลขสำนวนอ้างอิง"],
      statusAfter:"", sla:"real-time",
      patch:{} },


    /* ---------- ก6 คุ้มครองพยาน ---------- */
    { from:"witness-protection", to:"board-resolution", kind:"forward", target:"board-resolution/inbox.html",
      label:"เสนอมาตรการให้บอร์ดอนุมัติ → ก7", icon:"fa-landmark", tone:"primary",
      trigger:"ประเมินภัยแล้ว เสนอมาตรการคุ้มครองให้คณะกรรมการอนุมัติ",
      docs:["ผลประเมินภัย","มาตรการคุ้มครองที่เสนอ","คบ.2 บันทึกเสนอ"],
      statusAfter:"รอบอร์ดอนุมัติมาตรการคุ้มครอง", sla:"15 วัน",
      patch:{ witnessNo:"WP-2569-000464" } },

    { from:"witness-protection", to:"intake-investigation", kind:"return", target:"intake-investigation/staff-workflow.html",
      label:"แจ้งผลคุ้มครองกลับเจ้าของสำนวน → ก5", icon:"fa-reply", tone:"green",
      trigger:"มีคำสั่งรับ/ไม่รับคำขอคุ้มครองพยาน",
      docs:["คำสั่งผลการพิจารณาคำขอ (คบ.5)","สรุปมาตรการที่ใช้"],
      statusAfter:"ได้รับผลคุ้มครองพยานแล้ว", sla:"3 วัน",
      patch:{ witnessResult:"แจ้งผลกลับเจ้าของสำนวนแล้ว" },
      note:"matrix กำหนดให้ผลการคุ้มครองกลับสู่เจ้าของสำนวน ไม่ใช่จบที่ ก7" },

    /* ---------- ก7 มติคณะกรรมการ ป.ป.ท. ---------- */
    { from:"board-resolution", to:"intake-investigation", kind:"return", askReason:true, target:"intake-investigation/staff-workflow.html",
      label:"ตีกลับ ก5 (ไม่ครบ/ความเห็นแย้ง)", icon:"fa-rotate-left", tone:"red",
      trigger:"ตรวจสำนวนแล้วไม่สมบูรณ์ หรือมีความเห็นแย้ง",
      docs:["บันทึกเหตุที่ส่งคืน","สำนวนเดิมพร้อม revision"],
      statusAfter:"ถูกตีกลับ — รอแก้ไขเพิ่มเติม", sla:"15 วัน",
      patch:{ returned:true } },

    { from:"board-resolution", to:"person-screening", kind:"forward", hash:"#/chk003",
      label:"มติชี้มูลวินัย → ก8", icon:"fa-scale-balanced", tone:"purple",
      trigger:"คณะกรรมการมีมติชี้มูลความผิดทางวินัย",
      docs:["มติคณะกรรมการ ป.ป.ท.","สำนวนการไต่สวน","หนังสือแจ้งต้นสังกัด"],
      statusAfter:"ส่งเรื่องวินัยเข้า ก8 แล้ว", sla:"30 วัน",
      patch:{ resolution:"ชี้มูลวินัย", stage:"ส่งวินัย", sanction:"อยู่ระหว่างดำเนินการ" },
      note:"glossary: ก8 ชื่อทางการคือ ระบบตรวจสอบประวัติบุคคล — เส้นนี้คือ CHK003 มาตรา 38/41" },

    { from:"board-resolution", to:"person-screening", kind:"forward", hash:"#/chk002",
      label:"มติรับไว้ไต่สวน → ก8 ติดตาม", icon:"fa-clipboard-list", tone:"green",
      trigger:"คณะกรรมการมีมติรับเรื่องไว้ไต่สวน ต้องติดตามผลตามมติ",
      docs:["มติคณะกรรมการ","หนังสือเวียนแจ้งผลมติ"],
      statusAfter:"อยู่ในรอบติดตามผลมติ (ก8)", sla:"15 วัน",
      patch:{ resolution:"รับไว้ไต่สวน", batchId:"B-2026-07-004",
              circularNo:"ร่าง ปปท 0040/ว221", refNo:"ปช 0040(ติดตาม)/ว221" } },

    { from:"board-resolution", to:"witness-protection", kind:"forward",
      label:"สั่งคุ้มครองพยาน → ก6", icon:"fa-shield-halved", tone:"green",
      trigger:"คณะกรรมการเห็นควรให้คุ้มครองพยานในคดีนี้",
      docs:["มติให้คุ้มครองพยาน","รายชื่อพยานที่ต้องคุ้มครอง"],
      statusAfter:"รอดำเนินการคุ้มครองพยาน", sla:"7 วัน",
      patch:{ witnessReq:"บอร์ดสั่งคุ้มครอง" } },

    { from:"board-resolution", to:"external:prosecutor", kind:"external",
      label:"ส่งสำนวนให้อัยการ", icon:"fa-paper-plane", tone:"navy",
      trigger:"มติชี้มูลความผิดอาญา ส่งสำนวนให้พนักงานอัยการพิจารณา",
      docs:["มติคณะกรรมการ ป.ป.ท.","รายงานการไต่สวน 644","สำนวนการไต่สวนทั้งชุด","หนังสือนำส่งอัยการ"],
      statusAfter:"อยู่ระหว่างการพิจารณาของอัยการ", sla:"ตามระเบียบอัยการ",
      patch:{ prosecutorSent:true },
      note:"ขาออกช่วงนี้เอกสารเดิมยังไม่ยืนยัน package/ผู้ลงนาม — ต้องให้ owner ยืนยันก่อนใช้จริง" },

    { from:"board-resolution", to:"external:nacc", kind:"external",
      label:"ส่งเรื่องให้ ป.ป.ช.", icon:"fa-building-columns", tone:"navy",
      trigger:"เรื่องอยู่ในอำนาจ ป.ป.ช. ตามมติคณะกรรมการ",
      docs:["มติคณะกรรมการ","สำนวนพร้อมหลักฐาน","หนังสือนำส่ง ป.ป.ช."],
      statusAfter:"ส่ง ป.ป.ช. แล้ว", sla:"30 วัน",
      patch:{ naccSent:true } },

    { from:"board-resolution", to:"legal-case", kind:"forward", target:"legal-case/inbox.html",
      label:"อัยการส่งความเห็นกลับ → ก10", icon:"fa-scale-balanced", tone:"purple",
      trigger:"พนักงานอัยการมีความเห็นและส่งสำนวนกลับมายังธุรการคดี/กองกฎหมาย",
      docs:["ความเห็นพนักงานอัยการ","สำนวนที่ส่งคืน","หนังสือนำส่งกลับ"],
      statusAfter:"อยู่ที่กองกฎหมาย (ก10)", sla:"15 วัน",
      patch:{ legalCase:"คดีดำ อท.123/2569", prosecutorReturned:true },
      note:"เส้นนี้คือขา 'อัยการส่งกลับ' ซึ่งเป็นจุดเริ่มที่ยืนยันได้ของ ก10 — แยกจากขา 'ส่งสำนวนให้อัยการ' ข้างบน" },

    { from:"board-resolution", to:"integration-gateway", kind:"forward",
      label:"ดึงข้อมูล e-GP ประกอบสำนวน → ก13", icon:"fa-plug", tone:"blue",
      trigger:"ต้องการข้อมูลโครงการ วงเงิน ราคากลาง คู่สัญญา ประกอบการพิจารณา",
      docs:["คำขอเรียกดูข้อมูลโครงการ"], statusAfter:"", sla:"real-time", patch:{} },

    /* ---------- ก8 ตรวจสอบประวัติบุคคล ---------- */
    { from:"person-screening", to:"external:agency", kind:"external",
      label:"ส่งต้นสังกัดตามมติ", icon:"fa-building-user", tone:"navy",
      trigger:"ต้องแจ้งผลมติให้ต้นสังกัด/หน่วยงานตามมติดำเนินการทางวินัย",
      docs:["หนังสือแจ้งผลมติ","สำเนามติคณะกรรมการ","แบบตอบรับการดำเนินการ"],
      statusAfter:"แจ้งต้นสังกัดแล้ว รอผลการดำเนินการ", sla:"30 วัน",
      patch:{ agencyNotified:true },
      note:"ต้องเก็บหลักฐานการรับ (เลขรับ/วันเวลา/ผู้รับ) กลับเข้าระบบ" },

    { from:"person-screening", to:"analytics", kind:"forward", hash:"#/person",
      label:"ส่งข้อมูลวิเคราะห์ → ก12", icon:"fa-chart-line", tone:"green",
      trigger:"ปิดรอบตรวจสอบประวัติ ส่งข้อมูลเข้าคลังวิเคราะห์",
      docs:["ชุดข้อมูลผลการตรวจสอบ"], statusAfter:"", sla:"รายเดือน",
      patch:{} },

    { from:"person-screening", to:"intake-investigation", kind:"return", target:"intake-investigation/staff-workflow.html",
      label:"แจ้งผลวินัยกลับเจ้าของสำนวน → ก5", icon:"fa-reply", tone:"green",
      trigger:"ได้รับผลการดำเนินการทางวินัยจากต้นสังกัด",
      docs:["หนังสือแจ้งผลจากต้นสังกัด","สรุปผลทางวินัย"],
      statusAfter:"ได้รับผลทางวินัยแล้ว", sla:"7 วัน",
      patch:{ disciplineResult:"ได้รับผลจากต้นสังกัด" } },

    /* ---------- ก9 หมายจับ ---------- */
    { from:"arrest-warrant", to:"external:court", kind:"external",
      label:"ยื่นคำร้องขอหมายจับต่อศาล", icon:"fa-gavel", tone:"navy",
      trigger:"อัยการสั่งให้ขอหมายจับ เจ้าของสำนวนจัดทำคำร้องยื่นศาล",
      docs:["คำร้องขอออกหมายจับ (มจ.1)","สำนวนการไต่สวน","คำสั่งอัยการ","บัญชีพยานหลักฐาน"],
      statusAfter:"รอผลศาลพิจารณาออกหมายจับ", sla:"ตามนัดศาล",
      patch:{ courtFiled:true } },

    { from:"arrest-warrant", to:"external:got", kind:"external",
      label:"ส่งหมายจับให้ กอท.", icon:"fa-people-carry-box", tone:"navy",
      trigger:"ศาลออกหมายจับแล้ว ส่งชุดเอกสารให้ กอท. ดำเนินการจับกุม",
      docs:["หมายจับประทับตราศาล","สำนวนการไต่สวน","สรุปข้อเท็จจริง","หนังสือนำส่ง กอท."],
      statusAfter:"ส่ง กอท. แล้ว รอผลการจับกุม", sla:"ตามแผนปฏิบัติการ",
      patch:{ warrantNo:"ศท-2569-0012", gotSent:true } },

    { from:"arrest-warrant", to:"integration-gateway", kind:"forward",
      label:"ตรวจทะเบียนราษฎร์ → ก13", icon:"fa-plug", tone:"blue",
      trigger:"ต้องยืนยันตัวบุคคลผู้ต้องหาก่อนออกหมาย",
      docs:["คำขอตรวจทะเบียนราษฎร์ (DOPA)"], statusAfter:"", sla:"real-time",
      patch:{} },

    { from:"arrest-warrant", to:"intake-investigation", kind:"return", askWarrantResult:true, target:"intake-investigation/staff-workflow.html",
      label:"แจ้งผลหมายจับกลับเจ้าของสำนวน → ก5", icon:"fa-reply", tone:"red",
      trigger:"มีผลการดำเนินการตามหมายจับ",
      docs:["รายงานผลการจับกุม","หลักฐานการดำเนินการ"],
      sla:"3 วันนับแต่ทราบผล", patch:{},
      note:"matrix ระบุว่าเอกสารเดิมจบที่ส่ง กอท. ไม่มีเส้นคืนสถานะ — เส้นนี้เติมให้ครบ" },

    /* ---------- ก11 นำเข้าและถ่ายโอนข้อมูล ---------- */
    { from:"data-migration", to:"intake-investigation", kind:"forward",
      label:"ส่งชุดข้อมูลที่นำเข้า → ก4+5", icon:"fa-file-import", tone:"primary",
      trigger:"รอบถ่ายโอนข้อมูลจากระบบเดิมเสร็จสิ้น",
      docs:["ชุดข้อมูลที่นำเข้าสำเร็จ","รายงานผลการตรวจความถูกต้อง","รายการที่ไม่ผ่านเกณฑ์","ตารางจับคู่ฟิลด์"],
      statusAfter:"รอกลั่นกรองที่ ก4 (นำเข้าจากระบบเดิม)", sla:"7 วัน",
      patch:{ importedFrom:"ระบบเดิม", migratedAt:"MIG-69-004" },
      note:"ก11 ไม่ตัดสินเนื้อหาคดี — ส่งเข้ากระบวนการปกติของ ก4+5 ไม่ข้ามขั้นตอน" },

    /* ---------- ก13 เชื่อมโยงข้อมูล ---------- */
    { from:"integration-gateway", kind:"inplace",
      label:"ผลเรียกดูข้อมูลภายนอก", icon:"fa-plug", tone:"blue",
      onRun:function(){
        var kase = Hub.getCase(CID) || {};
        Hub.addEvent(CID, { action:"เรียกดูข้อมูลภายนอกสำเร็จ", from:"integration-gateway",
          to:(kase.pending && kase.pending.from) || "integration-gateway",
          trigger:"คำขอเรียกดูข้อมูลจากกิจกรรมเจ้าของกระบวนงาน",
          docs:["DOPA ทะเบียนราษฎร์","e-GP ข้อมูลโครงการ"], by:"ก13 Gateway",
          note:"real-time API — งานย้ายข้อมูล batch เป็นขอบเขตของ ก11 ซึ่งยังไม่ได้ทำ" });
        info("Gateway — เรียกข้อมูลสำเร็จ",
          "เคส <b>" + esc(CID) + "</b>" +
          "<br>DOPA Linkage Center 2 · ทะเบียนราษฎร์" +
          (kase.accused ? "<br>ผู้ถูกกล่าวหา: " + esc(kase.accused) : "") +
          (kase.agency  ? "<br>หน่วยงาน: " + esc(kase.agency) : "") +
          "<br><small>ขอบเขต ก13 = Operational API แบบ real-time · ก11 = Migration/Batch (ยังไม่ทำ)</small>");
      } }
  ];

  /* ==================== UI ==================== */
  var TONE = {
    primary:"#16558f", navy:"#0a2647", green:"#24714a", purple:"#7c3aed",
    orange:"#8a6111", blue:"#16558f", red:"#ad3f3d"
  };
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function info(title, html){
    if (window.Swal) Swal.fire({ icon:"info", title:title, html:html, confirmButtonColor:"#0d1b3e", customClass:{popup:"ecmis-swal"} });
    else alert(title);
  }

  /* ---- ถามข้อมูลเพิ่มก่อนส่ง (เหตุที่ตีกลับ / ผลหมายจับ) ---- */
  function askSelect(title, label, options){
    if (!window.Swal) return Promise.resolve(options[0]);
    var opts = options.map(function(o,i){ return '<option value="'+i+'">'+esc(o)+'</option>'; }).join("");
    return Swal.fire({
      title: title,
      html: '<label style="display:block;text-align:left;font-size:12px;color:#34465f;margin-bottom:6px">'+esc(label)+'</label>'
          + '<select id="pipeSel" class="swal2-select" style="width:100%;margin:0">'+opts+'</select>',
      showCancelButton:true, confirmButtonText:"ส่ง", cancelButtonText:"ยกเลิก",
      confirmButtonColor:"#0d1b3e", customClass:{popup:"ecmis-swal"},
      preConfirm:function(){ return options[Number(document.getElementById("pipeSel").value)]; }
    }).then(function(r){ return r.isConfirmed ? r.value : null; });
  }

  function run(edge){
    // ผู้ใช้ที่เป็น "ดูได้อย่างเดียว" (เช่น g12_report) ห้ามเปลี่ยนสถานะคดี
    var A = window.ECMISAuth;
    if (A && A.isReadOnly && A.isReadOnly()){
      info("บัญชีนี้ดูได้อย่างเดียว",
           "ผู้ใช้ <b>" + esc((A.getAuth()||{}).username || "") + "</b> มีสิทธิ์อ่านอย่างเดียว<br>" +
           "ไม่สามารถส่งต่อหรือเปลี่ยนสถานะคดีได้ ตามที่กำหนดไว้ใน matrix ว่า ก12 เป็นปลายทางข้อมูลแบบ read-only");
      return;
    }
    if (edge.kind === "inplace"){ edge.onRun(); return; }

    var base = {
      caseId: CID, from: edge.from, to: edge.to, trigger: edge.trigger,
      docs: edge.docs, statusAfter: edge.statusAfter, slaDue: edge.sla,
      patch: edge.patch, note: edge.note, hash: edge.hash,
      // target ต้องส่งต่อด้วย ไม่งั้น handoff จะ default เป็น <to>/index.html
      // ซึ่งของ ก7 คือ portal ของประชาชน ไม่ใช่คิวงานเจ้าหน้าที่
      target: edge.target,
      action: edge.label.replace(/^\s*/, "")
    };

    if (edge.askReason){
      askSelect("ตีกลับสำนวน " + CID, "เหตุที่ส่งคืน (Reject/Return reason)", RETURN_REASONS)
        .then(function(reason){ if (reason) HO.send(Object.assign(base, { returnReason: reason })); });
      return;
    }
    if (edge.askWarrantResult){
      askSelect("ผลการดำเนินการตามหมายจับ", "ผลคดี", WARRANT_RESULTS.map(function(w){ return w.v; }))
        .then(function(v){
          if (!v) return;
          var hit = WARRANT_RESULTS.filter(function(w){ return w.v === v; })[0];
          HO.send(Object.assign(base, {
            statusAfter: hit.status,
            patch: Object.assign({}, edge.patch, { warrantResult: v }),
            note: (edge.note || "") + " · ผล: " + v
          }));
        });
      return;
    }
    HO.send(base);
  }

  function render(){
    if (document.getElementById("ecmisPipeRail")) return;
    /* กรองตาม "ความสามารถ" ไม่ใช่ชื่อบัญชี
       ก4 (รับเรื่อง) กับ ก5 (ไต่สวน) อยู่โฟลเดอร์เดียวกัน แต่คนละงาน
       เช่น สารบรรณกลาง (Anucha.S) รับเรื่องได้ แต่ไม่ได้ทำรายงาน 213/644
       ส่วนเจ้าของสำนวน (Somchai.J) ทำได้ทั้งสองอย่าง                          */
    var A = window.ECMISAuth, me = A && A.getAuth ? A.getAuth() : null;
    var mine = EDGES.filter(function(e){
      if (e.from !== HERE) return false;
      if (!e.cap) return true;
      /* edge ที่จำกัดเฉพาะบางงานในกิจกรรมเดียวกัน (เช่น รายงาน 213/644 เป็นงานไต่สวน
         ไม่ใช่งานสารบรรณ) — เทียบกับ roleId ของผู้ใช้                                  */
      var me2 = A && A.getAuth ? A.getAuth() : null;
      if (!me2) return true;
      if (me2.act === "*") return true;
      return (EDGE_ROLES[e.cap] || []).indexOf(me2.roleId) !== -1;
    });
    if (!mine.length) return;

    var rail = document.createElement("div");
    rail.id = "ecmisPipeRail";

    var fwd = mine.filter(function(e){ return e.kind === "forward"; });
    var ext = mine.filter(function(e){ return e.kind === "external"; });
    var ret = mine.filter(function(e){ return e.kind === "return"; });
    var inp = mine.filter(function(e){ return e.kind === "inplace"; });

    function group(title, list, cls){
      if (!list.length) return "";
      return '<div class="pipe-group ' + cls + '"><span class="pipe-group-label">' + title + '</span>'
        + list.map(function(e){
            var i = EDGES.indexOf(e);
            return '<button type="button" class="pipe-btn" data-pipe="' + i + '"'
                 + ' style="background:' + (TONE[e.tone] || TONE.primary) + '"'
                 + ' title="' + esc(e.trigger || "") + '">'
                 + '<i class="fa-solid ' + e.icon + '"></i> ' + esc(e.label) + '</button>';
          }).join("")
        + '</div>';
    }

    rail.innerHTML =
        '<div class="pipe-rail-head"><i class="fa-solid fa-diagram-project"></i> '
      + 'ท่อส่งต่อของ ' + esc(HO.actName(HERE))
      + (me ? ' · <b>' + esc(me.displayName) + '</b> ' + esc(me.title || '') : '')
      + ' · เคส <b>' + esc(CID) + '</b></div>'
      + group("ส่งต่อในระบบ", fwd, "g-fwd")
      + group("นำส่งภายนอกระบบ", ext, "g-ext")
      + group("ส่งกลับ / แจ้งผล", ret, "g-ret")
      + group("งานภายในกิจกรรม", inp, "g-inp");

    rail.addEventListener("click", function(ev){
      var b = ev.target.closest("[data-pipe]");
      if (!b) return;
      ev.preventDefault();
      run(EDGES[Number(b.getAttribute("data-pipe"))]);
    });

    // ยึดกับ #caseContextBar ซึ่งมีทุกหน้า — ไม่ต้องเดา selector หรือ gate ด้วย path อีก
    var anchor = document.getElementById("caseContextBar");
    if (anchor) anchor.insertAdjacentElement("afterend", rail);
    else document.body.insertBefore(rail, document.body.firstChild);
    // ให้ case-bar คำนวณ offset ใหม่ เผื่อหน้านี้มี header แบบ fixed (ก7/ก10)
    if (window.ECMISCaseBar && window.ECMISCaseBar.reflow) window.ECMISCaseBar.reflow();
  }

  function boot(){
    render();
    if (!document.getElementById("ecmisPipeRail")) setTimeout(render, 600);   // เผื่อ case-bar มาช้า
    /* หลายกิจกรรม (ก4+5, ก8, ก9, ก12, ก14) เป็นหน้าเดียวที่ re-render ตัวเองด้วย
       innerHTML ทับทั้งบล็อก ถ้าโดนทับ แถบท่อจะหายแล้วไม่กลับมา — เฝ้าไว้แล้วสร้างใหม่ */
    if (typeof MutationObserver === "undefined") return;
    var mo = new MutationObserver(function(){
      if (!document.getElementById("ecmisPipeRail")) render();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.ECMISPipes = { here: HERE, caseId: CID, edges: EDGES, run: run };
})();
