/* ==========================================================================
   case-inbox.js — ฝั่ง "ปลายทางรับเรื่อง" ของทุกกิจกรรม
   ต้องโหลดหลัง cases.js → handoff.js → case-bar.js → pipe-buttons.js

   ปัญหาที่แก้: ก่อนหน้านี้ท่อ 13 เส้นทำแค่ saveCase() + เปลี่ยนหน้า
   แต่มีเพียง 1 ใน 9 กิจกรรม (ก7 board-resolution/assets/ecmis-app.js) ที่อ่าน
   localStorage ecmis-transform-cases-v1 จริง อีก 8 กิจกรรมไม่เคยอ่าน
   ตัวอย่างที่ชัดที่สุด: ท่อ ก7→ก8 เขียน batchId B-2026-07-004 แต่ ก8 hardcode
   ไว้แค่ B-2026-07-001/002/003 → กดแล้วเคสไม่ปรากฏที่ปลายทาง

   ไฟล์นี้ทำให้ทุกกิจกรรมเป็นปลายทางที่แท้จริง:
     1. อ่านเคสจากทะเบียนกลางตาม ?case=
     2. ถ้ามี handoff ค้างที่จ่าหน้ามาถึงกิจกรรมนี้ → ประทับเลขรับ (ack) แล้วปิด pending
     3. แสดงกล่อง "เรื่องเข้าใหม่" พร้อม envelope ครบ 13 ฟิลด์ ให้เห็นว่าอะไรถูกส่งมา
     4. ถ้าเคสไม่มีในทะเบียนกลาง บอกตรง ๆ ไม่แกล้งว่ารับแล้ว
   ========================================================================== */
(function(){
  "use strict";
  var Hub = window.ECMISHub, HO = window.ECMISHandoff;
  if (!Hub || !HO){ console.warn("[case-inbox] ต้องโหลด cases.js + handoff.js ก่อน"); return; }
  // หน้าสาธารณะ ห้ามโชว์กล่องรับเรื่องภายใน
  if (Hub.isPublicPage && Hub.isPublicPage()) return;

  var ACT_KEYS = ["intake-investigation","witness-protection","board-resolution","person-screening",
                  "arrest-warrant","legal-case","data-migration","analytics","integration-gateway","admin-center"];
  var HERE = (function(){
    var p = location.pathname;
    for (var i = 0; i < ACT_KEYS.length; i++){ if (p.indexOf("/" + ACT_KEYS[i]) !== -1) return ACT_KEYS[i]; }
    return null;
  })();
  if (!HERE) return;

  var qid = Hub.getQueryCaseId();
  if (!qid) return;                      // เปิดหน้าเปล่า ๆ ไม่ใช่การรับเรื่อง

  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function thai(iso){ try{ return new Date(iso).toLocaleString("th-TH",{dateStyle:"medium",timeStyle:"short"}); }catch(e){ return iso||""; } }

  var kase = Hub.getCase(qid);

  /* ---- 1) เคสไม่มีในทะเบียนกลาง — บอกตรง ๆ ---- */
  if (!kase){
    mount('<div class="ci-box ci-unknown">'
      + '<div class="ci-head"><i class="fa-solid fa-triangle-exclamation"></i> '
      + 'เปิดด้วยเลขสำนวน <b>' + esc(qid) + '</b> แต่ยังไม่มีเคสนี้ในทะเบียนกลาง</div>'
      + '<div class="ci-body">ทะเบียนกลาง (<code>ecmis-transform-cases-v1</code>) ยังไม่มีเลขนี้ — '
      + 'ต้องส่งผ่านท่อจากกิจกรรมต้นทางก่อน ปลายทางจึงจะเห็นข้อมูล</div></div>');
    return;
  }

  /* ---- 2) ประทับเลขรับ ถ้ามี handoff จ่าหน้ามาถึงกิจกรรมนี้ ---- */
  var pending = kase.pending && kase.pending.to === HERE ? Object.assign({}, kase.pending) : null;
  var ack = null;
  if (pending) ack = HO.receive(qid, HERE);

  /* ---- 3) หา envelope ขาเข้าล่าสุดที่ปลายทางคือกิจกรรมนี้ ---- */
  var inbound = Hub.getEvents(qid).filter(function(e){ return e.to === HERE && e.action !== "ปลายทางรับเรื่องแล้ว"; })[0] || null;
  var src = pending || inbound;
  if (!src) return;                      // มาถึงโดยไม่ได้ผ่านท่อ — ไม่ต้องขึ้นกล่องรับ

  var rows = [];
  function row(k, v){ if (v != null && v !== "" ) rows.push([k, v]); }
  row("ต้นทาง", HO.actName(src.from));
  row("ปลายทาง", HO.actName(HERE));
  row("เลขสำนวน", kase.id);
  row("เรื่อง", kase.subject || kase.title);
  row("หน่วยงาน", kase.agency);
  row("ผู้ถูกกล่าวหา", kase.accused);
  row("เหตุที่ส่ง (trigger)", src.trigger);
  row("เอกสารที่ส่งมา", (src.docs && src.docs.length) ? src.docs.map(esc).join("<br>") : "");
  row("สถานะก่อนส่ง", (inbound && inbound.statusBefore) || "");
  row("สถานะเมื่อรับ", src.statusAfter || kase.status);
  row("รอบที่ส่ง (revision)", src.revision);
  row("SLA", src.slaDue);
  row("เหตุที่ตีกลับ", src.returnReason);
  var a = ack || kase.lastAck;
  row("หลักฐานการรับ", a ? ("เลขรับ <b>" + esc(a.no) + "</b> · " + esc(thai(a.at)) + " · " + esc(a.by)) : "");
  row("หมายเหตุ", src.note);

  var isReturn = !!src.returnReason;
  mount('<div class="ci-box' + (isReturn ? ' ci-return' : '') + '">'
    + '<div class="ci-head"><i class="fa-solid ' + (isReturn ? 'fa-rotate-left' : 'fa-inbox') + '"></i> '
    + (isReturn ? 'สำนวนถูกตีกลับมาที่ ' : 'เรื่องเข้าใหม่ที่ ') + esc(HO.actName(HERE))
    + (ack ? ' <span class="ci-ack">ประทับเลขรับแล้ว ' + esc(ack.no) + '</span>'
           : (kase.lastAck ? ' <span class="ci-ack ci-ack-old">รับไว้แล้ว</span>' : ''))
    + '<button type="button" class="ci-x" aria-label="ปิด">&times;</button></div>'
    + '<table class="ci-tbl">'
    + rows.map(function(r){ return '<tr><th>' + esc(r[0]) + '</th><td>' + r[1] + '</td></tr>'; }).join("")
    + '</table></div>');

  /* ---- mount ใต้ pipe rail (หรือ case bar ถ้ายังไม่มี rail) ---- */
  function mount(html){
    function put(){
      if (document.getElementById("ecmisCaseInbox")) return true;
      var anchor = document.getElementById("ecmisPipeRail") || document.getElementById("caseContextBar");
      if (!anchor) return false;
      var box = document.createElement("div");
      box.id = "ecmisCaseInbox";
      box.innerHTML = html;
      anchor.insertAdjacentElement("afterend", box);
      box.addEventListener("click", function(e){
        if (e.target.closest(".ci-x")){
          box.remove();
          if (window.ECMISCaseBar && window.ECMISCaseBar.reflow) window.ECMISCaseBar.reflow();
        }
      });
      ensureCss();
      if (window.ECMISCaseBar && window.ECMISCaseBar.reflow) setTimeout(window.ECMISCaseBar.reflow, 60);
      return true;
    }
    if (!put()){
      var tries = 0;
      var t = setInterval(function(){ if (put() || ++tries > 20) clearInterval(t); }, 150);
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", put);
    }
  }

  function ensureCss(){
    if (document.querySelector('link[data-ecmis-inbox]')) return;
    var all = document.getElementsByTagName("script"), s = null;
    for (var i = all.length - 1; i >= 0; i--){
      if ((all[i].src || "").indexOf("case-inbox.js") !== -1){ s = all[i]; break; }
    }
    if (!s || !s.src) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = s.src.replace(/\/case-inbox\.js(\?.*)?$/, "/case-inbox.css");
    l.setAttribute("data-ecmis-inbox", "1");
    document.head.appendChild(l);
  }

  /* ==================================================================
     adapter — ยัดเคสเข้า "โครงสร้างข้อมูลจริง" ของกิจกรรมปลายทาง ไม่ใช่แค่โชว์ panel

     เหตุ: รายงานยกตัวอย่างว่าท่อ ก7→ก8 เขียน batchId B-2026-07-004 แต่ ก8 hardcode
     ไว้แค่ B-2026-07-001/002/003 → กดแล้ว "ไม่มีแถวนั้นในตาราง"
     กล่องรับเรื่องด้านบนช่วยให้เห็นว่ามีของเข้า แต่ยังไม่ทำให้แถวโผล่ในทะเบียน
     ส่วนนี้เติมแถวจริงให้ตารางของปลายทาง

     หมายเหตุเชิงเทคนิค: BOARD_BATCHES / DISC_CASES / render002 / render003 ประกาศเป็น
     const/function ระดับบนสุดของ <script> ธรรมดา จึงอยู่ใน global lexical scope
     อ่านได้จากไฟล์นี้ แต่ไม่อยู่บน window — ต้องเช็กด้วย typeof ก่อนทุกครั้ง
     ================================================================== */
  function shortId(){ return String(kase.id || qid).replace("/", "-"); }

  function adaptPersonScreening(){
    var touched = [];

    // CHK002 — รอบติดตามผลมติคณะกรรมการ
    try{
      if (typeof BOARD_BATCHES !== "undefined" && kase.batchId){
        var exists = BOARD_BATCHES.some(function(b){ return b.batchId === kase.batchId; });
        if (!exists){
          BOARD_BATCHES.unshift({
            batchId: kase.batchId,
            refNo: kase.refNo || ("ปช 0040(ติดตาม)/" + shortId()),
            meeting: (src.statusAfter ? "" : "") || new Date().toISOString().slice(0, 10),
            circularNo: kase.circularNo || "รอออกหนังสือเวียน",
            statusCode: "01",
            statusName: "รับเรื่องจาก ก7 แล้ว รอทำบันทึกแจ้งเวียน",
            sla: src.slaDue || "—",
            _fromHub: true,
            cases: [{
              caseId: kase.id,
              accused: kase.accused || "-",
              agency: kase.agency || "-",
              category: kase.resolution || "-",
              size: "—"
            }]
          });
          touched.push("CHK002 batch " + kase.batchId);
          if (typeof render002 === "function"){ try{ render002(); }catch(e){} }
        }
      }
    }catch(e){}

    // CHK003 — เรื่องวินัยตามมติ
    try{
      if (typeof DISC_CASES !== "undefined" && kase.resolution === "ชี้มูลวินัย"){
        var has = DISC_CASES.some(function(d){ return d.caseId === kase.id; });
        if (!has){
          DISC_CASES.unshift({
            caseId: kase.id,
            accused: kase.accused || "-",
            position: kase.position || "-",
            agency: kase.agency || "-",
            sanction: kase.sanction || "อยู่ระหว่างดำเนินการ",
            result: "InProgress",
            details: "รับเรื่องจากมติ ก7 — " + (src.trigger || "ชี้มูลความผิดทางวินัย"),
            _fromHub: true
          });
          touched.push("CHK003 " + kase.id);
          if (typeof render003 === "function"){ try{ render003(); }catch(e){} }
        }
      }
    }catch(e){}

    return touched;
  }

  function adapt(){
    var touched = [];
    if (HERE === "person-screening") touched = adaptPersonScreening();
    if (!touched.length) return;
    // บอกในกล่องรับว่าแถวถูกเติมเข้าทะเบียนของกิจกรรมนี้แล้วจริง
    var head = document.querySelector("#ecmisCaseInbox .ci-head");
    if (head && !head.querySelector(".ci-added")){
      var s = document.createElement("span");
      s.className = "ci-ack ci-added";
      s.textContent = "เพิ่มเข้าทะเบียนแล้ว: " + touched.join(" · ");
      head.insertBefore(s, head.querySelector(".ci-x"));
    }
  }
  // ให้ตารางของปลายทาง render รอบแรกเสร็จก่อน แล้วค่อยเติมแถว
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(adapt, 120); });
  else setTimeout(adapt, 120);

  window.ECMISInbox = { here: HERE, caseId: qid, kase: kase, ack: ack, inbound: src, adapt: adapt };
})();
