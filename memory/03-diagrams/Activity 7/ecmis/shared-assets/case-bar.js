/* ==========================================================================
   case-bar.js — แถบบริบทเคสกลาง + timeline การส่งต่อข้ามกิจกรรม
   ต้องโหลดหลัง cases.js (ใช้ window.ECMISHub)

   แก้ 2026-08-17
   · เดิมเรียก global getCase/getSeedCase ตรง ๆ ซึ่งถูก ก7/ก10 ทับ → ใช้ ECMISHub แทน
   · เดิม hard-code ข้อความ "เคสกลาง 0001/2569" ไม่ว่า ?case= จะเป็นอะไร → แสดงเคสที่ active จริง
   · เดิมเดา path ของ case-bar.css จาก location.pathname.split("/").length>3
     ซึ่งพังทันทีถ้า deploy ใต้ subpath อื่น → คำนวณจาก src ของ <script> ตัวเอง
   · เพิ่ม timeline: getEvents() ถูกเก็บมาตลอดแต่ไม่มีใครอ่าน ตอนนี้กดดูได้จากแถบ
   ========================================================================== */
(function(){
  "use strict";
  var Hub = window.ECMISHub;
  if (!Hub){ console.warn("[case-bar] ไม่พบ ECMISHub — ต้องโหลด cases.js ก่อน case-bar.js"); return; }
  // หน้าสาธารณะ (ฟอร์มร้องเรียน/ติดตามเรื่อง) ห้ามโชว์บริบทสำนวนภายใน
  if (Hub.isPublicPage && Hub.isPublicPage()) return;

  /* ---- base path: อ่านจาก src ของ <script> ตัวเอง ไม่เดาจากความลึกของ URL ---- */
  // Activity 7 does not display the shared case-context bar.
  if (/\/board-resolution(?:\/|$)/.test(location.pathname)) return;

  function selfBase(){
    var s = document.currentScript;
    if (!s){
      var all = document.getElementsByTagName("script");
      for (var i = all.length - 1; i >= 0; i--){
        if ((all[i].src || "").indexOf("case-bar.js") !== -1){ s = all[i]; break; }
      }
    }
    if (!s || !s.src) return "";
    return s.src.replace(/\/case-bar\.js(\?.*)?$/, "/");   // …/shared-assets/
  }
  var BASE = selfBase();
  var ROOT = BASE.replace(/shared-assets\/$/, "");          // โฟลเดอร์ราก ecmis-transform

  function esc(s){
    return String(s == null ? "" : s)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }
  function clip(s, n){ s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) + "…" : s; }

  /* ---- เคสที่หน้านี้กำลังพูดถึง ---- */
  var cid = Hub.activeCaseId();
  var c   = Hub.getCase(cid);
  var isSeed  = Hub.normId(cid) === Hub.normId(Hub.CASE_SEED.id);
  var unknown = !c;
  if (unknown) c = { id: cid };   // เคสที่ยังไม่มีในทะเบียน — บอกตรง ๆ ไม่แกล้งเป็นเคสกลาง

  /* ---- CSS ---- */
  (function ensureCss(){
    if (document.querySelector('link[data-ecmis-case-bar]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = BASE + "case-bar.css";
    l.setAttribute("data-ecmis-case-bar", "1");
    document.head.appendChild(l);
  })();

  /* ---- แถบ ---- */
  function barHtml(){
    var label = isSeed ? "เคสกลาง" : "เคส";
    var bits  = [];
    if (c.subject || c.title) bits.push('<span class="cc-badge">' + esc(clip(c.subject || c.title, 48)) + '</span>');
    if (c.agency)             bits.push('<span class="cc-badge">' + esc(clip(c.agency, 34)) + '</span>');
    if (c.accused)            bits.push('<span class="cc-badge">ผู้ถูกกล่าวหา ' + esc(clip(c.accused, 28)) + '</span>');
    if (c.status)             bits.push('<span class="cc-badge">' + esc(clip(c.status, 30)) + '</span>');
    if (unknown)              bits.push('<span class="cc-badge cc-warn">ยังไม่มีในทะเบียนกลาง</span>');

    var n = Hub.getEvents(cid).length;
    return '<span class="cc-dot"></span> <strong>' + esc(label) + ' ' + esc(cid) + '</strong> '
         + bits.join(" ")
         + ' <button type="button" class="cc-link" data-cc-timeline>เส้นทาง'
         + (n ? ' <b>' + n + '</b>' : '') + '</button>'
         + ' <a class="cc-link" href="' + esc(ROOT) + 'my-work.html">← คิวงานของฉัน</a>';
  }

  var bar = document.createElement("div");
  bar.id = "caseContextBar";
  if (!isSeed) bar.setAttribute("data-other-case", "1");
  bar.innerHTML = barHtml();

  // ผูก listener ครั้งเดียวกับตัว element ไม่ใช่ทุกครั้งที่ inject (กัน handler ซ้อนตอน re-mount)
  bar.addEventListener("click", function(e){
    if (e.target.closest("[data-cc-timeline]")){ e.preventDefault(); showTimeline(); }
  });

  function inject(){
    if (document.getElementById("caseContextBar")) return;
    // hub overlay: ใส่ใน container ของ hub เท่านั้น ไม่แทรกใน workspace ของกิจกรรมต้นฉบับ
    // - ถ้ามี #workspaceHost (ก4+5) ให้ใส่หลัง header ของหน้า ถ้าไม่มีค่อย fallback
    var host = document.getElementById("workspaceHost");
    if (host){
      // ก4+5 มี sidebar + workspace ของตัวเอง — ใส่แถบไว้เหนือ host แบบ flow (ไม่ fixed)
      // ไม่ดัน body, ไม่ทับ sidebar
      host.parentNode.insertBefore(bar, host);
      bar.style.position = "relative";
      bar.style.top = "auto"; bar.style.left = "auto"; bar.style.right = "auto";
      bar.style.zIndex = "2";
      return;
    }
    var top = document.querySelector(".top");
    if (top) top.insertAdjacentElement("afterend", bar);
    else if (document.body.firstChild) document.body.insertBefore(bar, document.body.firstChild);
    else document.body.appendChild(bar);
  }

  /* ---- timeline การส่งต่อข้ามกิจกรรม (อ่าน addEvent ที่เก็บไว้) ---- */
  var ACT_TH = {
    "intake-investigation":"ก4+5 รับเรื่อง/ไต่สวน", "witness-protection":"ก6 คุ้มครองพยาน",
    "board-resolution":"ก7 มติคณะกรรมการ", "person-screening":"ก8 ตรวจสอบประวัติ",
    "arrest-warrant":"ก9 หมายจับ", "legal-case":"ก10 กฎหมายในทางคดี",
    "data-migration":"ก11 นำเข้า/ถ่ายโอนข้อมูล",
    "analytics":"ก12 วิเคราะห์/รายงาน", "integration-gateway":"ก13 เชื่อมโยงข้อมูล",
    "admin-center":"ก14 บริหารกลาง"
  };
  function actName(k){ return ACT_TH[k] || k || "-"; }

  function showTimeline(){
    var evts = Hub.getEvents(cid);
    var rows = evts.length ? evts.map(function(e){
      var when = "";
      try{ when = new Date(e.at).toLocaleString("th-TH", {dateStyle:"medium", timeStyle:"short"}); }catch(x){ when = e.at || ""; }
      var route = (e.from || e.to)
        ? actName(e.from) + " → " + actName(e.to)
        : esc(e.by || "-");
      var extra = [];
      if (e.trigger)      extra.push("trigger: " + e.trigger);
      if (e.statusAfter)  extra.push("สถานะปลายทาง: " + e.statusAfter);
      if (e.ack && e.ack.no) extra.push("เลขรับ " + e.ack.no + (e.ack.by ? " · " + e.ack.by : ""));
      if (e.returnReason) extra.push("เหตุที่ตีกลับ: " + e.returnReason);
      if (e.revision != null) extra.push("revision " + e.revision);
      if (e.slaDue)       extra.push("SLA " + e.slaDue);
      if (e.docs && e.docs.length) extra.push("เอกสาร: " + e.docs.join(", "));
      if (e.note)         extra.push(e.note);
      return '<li class="cc-tl-item">'
           + '<div class="cc-tl-head"><strong>' + esc(e.action || "-") + '</strong>'
           + '<small>' + esc(when) + '</small></div>'
           + '<div class="cc-tl-route">' + esc(route) + '</div>'
           + (extra.length ? '<div class="cc-tl-extra">' + esc(extra.join(" · ")) + '</div>' : '')
           + '</li>';
    }).join("") : '<li class="cc-tl-item"><em>ยังไม่มีการส่งต่อสำหรับเคสนี้</em></li>';

    var html = '<ol class="cc-tl">' + rows + '</ol>';
    if (window.Swal){
      Swal.fire({
        title: "เส้นทางเคส " + cid,
        html: '<div style="text-align:left;max-height:60vh;overflow:auto">' + html + '</div>',
        width: 680, confirmButtonColor: "#0d1b3e", confirmButtonText: "ปิด",
        customClass: { popup: "ecmis-swal" }
      });
    } else {
      var box = document.getElementById("ccTimelineFallback");
      if (!box){
        box = document.createElement("div");
        box.id = "ccTimelineFallback";
        box.className = "cc-tl-panel";
        document.body.appendChild(box);
      }
      box.innerHTML = '<div class="cc-tl-panel-head"><strong>เส้นทางเคส ' + esc(cid)
                    + '</strong><button type="button" onclick="this.closest(\'.cc-tl-panel\').remove()">ปิด</button></div>' + html;
    }
  }

  /* ---- reflow เมื่อหน้าเจ้าบ้านมี header แบบ position:fixed ----
     พบ 2026-08-17 ว่า ก7/ก10 มี <header class="app-topbar"> เป็น position:fixed; z-index:1040
     แถบเคสที่แทรกเป็น body.firstChild จึงถูกทับสนิท ผู้ใช้กดปุ่ม "เส้นทาง" ไม่ได้จริง
     (ยืนยันด้วย elementFromPoint: ปุ่มที่ตำแหน่งนั้นคือ BUTTON.btn ของ topbar)
     ทางแก้: ทำแถบของเราเป็น fixed ซ้อนบนสุด แล้ว "ดัน" header ของแอปกับ body ลงมาเท่าความสูงรวม
     กิจกรรมที่ header เป็น sticky อยู่ในโฟลว์ (ก6/ก9/ก8/ก12/ก14) ไม่เข้าเงื่อนไขนี้ ปล่อยตามเดิม */
  var OFF_ATTR = "data-ecmis-offset";
  /* เฉพาะ "chrome" ที่ต้องลอยอยู่บนสุด — กล่องรับเรื่อง (#ecmisCaseInbox) เป็นเนื้อหา
     สูงได้ถึง ~590px ถ้าเอามาทำ fixed ด้วย จะดัน header ของแอปลงไป ~755px
     ที่จอ 1366×768 ผู้ใช้จะเห็นแต่แถบของเรา และเพราะเป็น fixed เลื่อนก็ไม่เจอหน้าเจ้าบ้าน */
  function myBars(){
    return [document.getElementById("caseContextBar"),
            document.getElementById("ecmisPipeRail")].filter(Boolean);
  }
  function myBlocks(){   // ทุกอย่างที่เราแทรก (ใช้ตอนคัดออกจากการค้นหา fixed header)
    return [document.getElementById("caseContextBar"),
            document.getElementById("ecmisPipeRail"),
            document.getElementById("ecmisCaseInbox")].filter(Boolean);
  }
  function fixedHeaders(){
    var mine = myBlocks();
    var out = [];
    try{
      var all = document.body.getElementsByTagName("*");
      for (var i = 0; i < all.length; i++){
        var e = all[i];
        if (mine.indexOf(e) !== -1) continue;
        var cs = getComputedStyle(e);
        if (cs.position !== "fixed") continue;
        var r = e.getBoundingClientRect();
        if (r.height > 20 && r.width > window.innerWidth * 0.5 && r.top <= 8 + curOffset()) out.push(e);
      }
    }catch(e){}
    return out;
  }
  function curOffset(){ return parseFloat(document.body.getAttribute(OFF_ATTR) || "0") || 0; }

  function reflow(){
    // ก4+5 (#workspaceHost) ใช้ flow แล้ว ไม่ต้องทำ fixed overlay — ข้ามเลย
    if (document.getElementById("workspaceHost")) return;
    var heads = fixedHeaders();
    if (!heads.length && !curOffset()) return;      // ไม่มี fixed header → ไม่ต้องทำอะไร

    var bars = myBars();
    var h = 0;
    bars.forEach(function(el){
      el.style.position = "fixed";
      el.style.left = "0"; el.style.right = "0";
      el.style.zIndex = "1050";
      el.style.top = h + "px";
      h += el.getBoundingClientRect().height;
    });

    var prev = curOffset();
    if (Math.abs(prev - h) < 1) return;             // เท่าเดิม ไม่ต้องขยับซ้ำ
    var delta = h - prev;

    heads.forEach(function(el){
      var t = parseFloat(el.getAttribute(OFF_ATTR + "-base"));
      if (isNaN(t)){ t = parseFloat(getComputedStyle(el).top) || 0; el.setAttribute(OFF_ATTR + "-base", t); }
      el.style.top = (t + h) + "px";
    });

    var basePad = parseFloat(document.body.getAttribute(OFF_ATTR + "-pad"));
    if (isNaN(basePad)){ basePad = parseFloat(getComputedStyle(document.body).paddingTop) || 0; document.body.setAttribute(OFF_ATTR + "-pad", basePad); }
    document.body.style.paddingTop = (basePad + h) + "px";
    document.body.setAttribute(OFF_ATTR, h);
    void delta;
  }

  function boot(){
    inject();
    reflow();
    /* กันหน้าที่ re-render ตัวเองด้วย innerHTML ทับแถบหาย (ก4+5, ก8, ก9, ก12, ก14 เป็นหน้าเดียว) */
    if (typeof MutationObserver === "undefined") return;
    new MutationObserver(function(){
      if (!document.getElementById("caseContextBar")) inject();
      reflow();
    }).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", reflow);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /* ---- ไฮไลท์แถวของเคสนี้ในตาราง/การ์ด ---- */
  function highlight(){
    try{
      var want = String(cid);
      var alt  = want.replace("/", "-");
      var sel  = "tr, .ec-card, .card, .act-card";
      document.querySelectorAll(sel).forEach(function(el){
        var t = el.textContent || "";
        if (t.indexOf(want) !== -1 || t.indexOf(alt) !== -1){
          el.classList.add("cc-hit");
        }
      });
    }catch(e){}
  }
  setTimeout(highlight, 800);

  /* ---- อัปเดตแถบเมื่อแท็บอื่นแก้เคสเดียวกัน ---- */
  try{
    if (typeof BroadcastChannel !== "undefined"){
      new BroadcastChannel("ecmis-transform").onmessage = function(m){
        if (!m || !m.data) return;
        if (m.data.id && Hub.normId(m.data.id) !== Hub.normId(cid)) return;
        var fresh = Hub.getCase(cid);
        if (fresh){ c = fresh; unknown = false; }
        bar.innerHTML = barHtml();
      };
    }
  }catch(e){}

  window.ECMISCaseBar = { caseId: cid, showTimeline: showTimeline, reflow: reflow,
    refresh: function(){ bar.innerHTML = barHtml(); reflow(); } };
})();
