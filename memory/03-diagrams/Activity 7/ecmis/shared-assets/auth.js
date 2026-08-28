/* ==========================================================================
   auth.js — ผู้ใช้งานระบบ E-CMIS + สิทธิ์เข้าถึงกิจกรรม
   ต้องโหลดเป็นสคริปต์แรกของทุกหน้า (ก่อน assets/ecmis-app.js ของ ก7/ก10)

   ── หลักการ (แก้ 2026-08-18 รอบที่ 3) ────────────────────────────────────
   **ผู้ใช้แยกตามกิจกรรม** — เจ้าหน้าที่หนึ่งคนสังกัดกิจกรรมเดียว
   และรายชื่อมาจาก "บทบาทจริงที่กิจกรรมนั้นนิยามไว้เอง" ไม่ใช่ยกชุดของกิจกรรมใดมาใช้ทั้งระบบ

     ก4+5  10 บทบาท จาก ROLE_LABELS ใน intake-investigation/assets/activity4-workspace.js
     ก7    6 คน ตามหน่วยงานและบทบาทจริงของกิจกรรมที่ 7
     ก10   9 คน จาก ROLES ใน legal-case/assets/ecmis-app.js
     ก14   5 คน จาก USERS ใน admin-center/index.html
     ก6 ก8 ก9 ก11 ก12 ก13 — ต้นทางไม่มีรายชื่อ จึงตั้งตามหน้าที่ของกิจกรรม

   ที่เคยทำผิด: เอา ROLES 27 คนของ ก7 ไปเป็นทะเบียนกลางทั้งระบบ
   ทำให้ประธานกรรมการ ป.ป.ท. โผล่ไปอยู่ในกิจกรรมที่ 4 ซึ่งไม่ถูกต้อง
   ========================================================================== */

/* ---- ผู้ใช้งาน แยกตามกิจกรรม · รหัสผ่านทุกบัญชี 1234 ---- */
const AUTH_USERS = [
  /* ── กิจกรรมที่ 4+5 รับเรื่องร้องเรียน + ไต่สวน ── */
  { u:"intake.officer", p:"1234", name:"นายสุพจน์ รับเรื่อง", title:"เจ้าหน้าที่รับเรื่อง",
    org:"ศูนย์รับเรื่องร้องเรียน (ศรร.)", act:"intake-investigation", roleId:"officer" },

  /* ── กิจกรรมที่ 6 คุ้มครองพยาน ── */
  { u:"wp.officer", p:"1234", name:"นางสาวธันธิตา คุ้มภัย", title:"เจ้าหน้าที่คุ้มครองพยาน",
    org:"สำนักคุ้มครองพยาน", act:"witness-protection", roleId:"officer" },

  /* ── กิจกรรมที่ 8 ตรวจสอบประวัติบุคคล ── */
  { u:"chk.officer", p:"1234", name:"นางสาวปิยะดา ตรวจสอบ", title:"เจ้าหน้าที่ตรวจสอบประวัติบุคคล",
    org:"กองบริหารคดี (กบค.)", act:"person-screening", roleId:"officer" },

  /* ── กิจกรรมที่ 9 หมายจับ ── */
  { u:"warrant.officer", p:"1234", name:"นางสาวอรุณี ใจมั่น", title:"เจ้าหน้าที่หมายจับ / เจ้าของสำนวน",
    org:"กองปราบปรามการทุจริตฯ", act:"arrest-warrant", roleId:"officer" },

  /* ── กิจกรรมที่ 10 กฎหมายในทางคดี — 9 คน ตาม ROLES ใน activity10/assets/ecmis-app.js ── */
  { u:"Kitti.P", p:"1234", name:"นายกิตติ ปรีชาญาณ", title:"คณะอนุกรรมการกลั่นกรองฯ",
    org:"ส่วนกลาง", act:"legal-case", roleId:"subcommittee_screen", group:"คณะอนุกรรมการ" },
  { u:"Sumet.N", p:"1234", name:"นายสุเมธ นิติธรรม", title:"คณะอนุกรรมการวินิจฉัยอุทธรณ์",
    org:"ส่วนกลาง", act:"legal-case", roleId:"subcommittee_appeal", group:"คณะอนุกรรมการ" },
  { u:"Surapong.W", p:"1234", name:"นายสุรพงษ์ วัฒนา", title:"รองเลขาธิการ ป.ป.ท.",
    org:"สำนักงาน ป.ป.ท.", act:"legal-case", roleId:"deputy_sg", group:"คณะผู้บริหาร" },
  { u:"Somchai.J", p:"1234", name:"นายสมชาย ใจซื่อ", title:"นิติกร/นักสืบเจ้าของเรื่อง (เจ้าของสำนวนเดิม)",
    org:"สนง. ป.ป.ท. เขต 1", act:"legal-case", roleId:"original_officer", group:"กอง/สำนักเจ้าของเรื่อง" },
  { u:"Kanda.R", p:"1234", name:"นางสาวกานดา รักษาการ", title:"เจ้าหน้าที่ธุรการกองกฎหมาย",
    org:"กองกฎหมาย (กอท.)", act:"legal-case", roleId:"admin_legal", group:"กองกฎหมาย (กอท.)" },
  { u:"Nattapol.B", p:"1234", name:"นายณัฐพล บัวทุม", title:"นิติกร (ผู้รับผิดชอบสำนวน)",
    org:"กองกฎหมาย", act:"legal-case", roleId:"legal_officer", group:"กองกฎหมาย" },
  { u:"Arnon.C", p:"1234", name:"นายอานนท์ ชนประชา", title:"ผู้อำนวยการกลุ่มงานความเห็นแย้ง",
    org:"กองกฎหมาย (กอท.)", act:"legal-case", roleId:"group_director", group:"กองกฎหมาย (กลุ่มงานความเห็นแย้ง)" },
  { u:"Napas.S", p:"1234", name:"นางสาวณพัสตร์ ศรีสมเกียรติ", title:"ผู้อำนวยการกองกฎหมาย",
    org:"กองกฎหมาย", act:"legal-case", roleId:"dir_legal", group:"กองกฎหมาย" },
  { u:"Anucha.S", p:"1234", name:"นายอนุชา สารบรรณ", title:"สารบรรณกลาง",
    org:"สำนักงานเลขาธิการ", act:"legal-case", roleId:"registry", group:"สำนักงานเลขาธิการ" },
  /* ── กิจกรรมที่ 11 นำเข้าและถ่ายโอนข้อมูล ── */
  { u:"migrate.admin", p:"1234", name:"นายธีรพงษ์ ถ่ายโอน", title:"ผู้ดูแลการนำเข้าและถ่ายโอนข้อมูล",
    org:"ศูนย์เทคโนโลยีสารสนเทศ", act:"data-migration", roleId:"admin" },

  /* ── กิจกรรมที่ 12 วิเคราะห์และรายงานผล ── */
  { u:"report.analyst", p:"1234", name:"นางสาวมนัสนันท์ วิเคราะห์", title:"นักวิเคราะห์นโยบายและแผน",
    org:"กองยุทธศาสตร์และแผนงาน", act:"analytics", roleId:"officer" },

  /* ── กิจกรรมที่ 13 เชื่อมโยงข้อมูล ── */
  { u:"gateway.officer", p:"1234", name:"นายอรรถพล เชื่อมโยง", title:"เจ้าหน้าที่ ป.ป.ท. (ดูแลการเชื่อมโยงข้อมูล)",
    org:"ศูนย์เทคโนโลยีสารสนเทศ", act:"integration-gateway", roleId:"officer" },

  /* ── กิจกรรมที่ 7 มติคณะกรรมการ ป.ป.ท. ── */
  { u:"Apichat.S", p:"1234", name:"นายอภิชาติ สุจริตกุล", title:"เลขาธิการคณะกรรมการ ป.ป.ท.",
    org:"เลขาธิการฯ/รองเลขาธิการ", act:"board-resolution", roleId:"secgen", group:"เลขาธิการฯ/รองเลขาธิการ" },
  { u:"Jiraporn.N", p:"1234", name:"นางสาวจิราพร นิติกิจ", title:"อนุกรรมการสนับสนุนเลขาธิการฯ",
    org:"คณะอนุกรรมการสนับสนุนเลขาธิการฯ", act:"board-resolution", roleId:"support_sub", group:"คณะอนุกรรมการสนับสนุนเลขาธิการฯ" },
  { u:"Wichai.Y", p:"1234", name:"นายวิชัย ยุติธรรม", title:"ประธานกรรมการ ป.ป.ท.",
    org:"ประธานกรรมการ ป.ป.ท.", act:"board-resolution", roleId:"chairman", group:"ประธานกรรมการ ป.ป.ท.", readOnly:true },
  { u:"Thanakrit.B", p:"1234", name:"นายธนกฤต บุญมี", title:"เจ้าหน้าที่กลุ่มงานคำวินิจฉัยและมติคณะกรรมการ",
    org:"กลุ่มงานวินิจฉัยและมติคณะกรรมการ", act:"board-resolution", roleId:"board_sec", group:"กลุ่มงานวินิจฉัยและมติคณะกรรมการ" },
  { u:"Somboon.T", p:"1234", name:"นายสมบูรณ์ ธรรมรัฐ", title:"กรรมการ ป.ป.ท.",
    org:"คณะกรรมการ ป.ป.ท.", act:"board-resolution", roleId:"board", group:"คณะกรรมการ ป.ป.ท.", readOnly:true },
  { u:"Siriporn.K", p:"1234", name:"นางสาวศิริพร กิจการ", title:"เจ้าหน้าที่กลุ่มงานกิจการคณะกรรมการ",
    org:"กลุ่มงานกิจการคณะกรรมการ", act:"board-resolution", roleId:"affairs", group:"กลุ่มงานกิจการคณะกรรมการ" },

  /* ── กิจกรรมที่ 14 บริหารกลางและสนับสนุน ── */
  { u:"somsak.p", p:"1234", name:"นายสมศักดิ์ ใจดี", title:"นักสืบสวน",
    org:"ส่วนกลาง", act:"admin-center", roleId:"officer" },
  /* ── บัญชีทดสอบ ── */
  { u:"demo", p:"demo", name:"Demo — เห็นทั้งหมด", title:"บัญชีทดสอบระบบ",
    org:"ไม่สังกัด", act:"*", roleId:"sysadmin" },
];

/* ---- ข้อมูลกิจกรรม ---- */
const ACT_INFO = {
  "intake-investigation": {th:"กิจกรรมที่ 4+5 รับเรื่องร้องเรียน + ไต่สวน", short:"ก4+5 รับเรื่อง/ไต่สวน", icon:"fa-inbox"},
  "witness-protection": {th:"กิจกรรมที่ 6 คุ้มครองพยาน", short:"ก6 คุ้มครองพยาน", icon:"fa-shield-halved"},
  "board-resolution": {th:"กิจกรรมที่ 7 มติคณะกรรมการ ป.ป.ท.", short:"ก7 มติคณะกรรมการ", icon:"fa-landmark"},
  "person-screening": {th:"กิจกรรมที่ 8 ตรวจสอบประวัติบุคคล", short:"ก8 ตรวจสอบประวัติ", icon:"fa-id-card"},
  "arrest-warrant": {th:"กิจกรรมที่ 9 หมายจับ", short:"ก9 หมายจับ", icon:"fa-file-circle-exclamation"},
  "legal-case": {th:"กิจกรรมที่ 10 กฎหมายในทางคดี", short:"ก10 กฎหมายในทางคดี", icon:"fa-scale-balanced"},
  "data-migration": {th:"กิจกรรมที่ 11 นำเข้าและถ่ายโอนข้อมูล", short:"ก11 นำเข้าข้อมูล", icon:"fa-file-import"},
  "analytics": {th:"กิจกรรมที่ 12 วิเคราะห์และรายงานผล", short:"ก12 วิเคราะห์/รายงาน", icon:"fa-chart-line"},
  "integration-gateway": {th:"กิจกรรมที่ 13 เชื่อมโยงข้อมูล", short:"ก13 เชื่อมโยงข้อมูล", icon:"fa-link"},
  "admin-center": {th:"กิจกรรมที่ 14 บริหารกลางและสนับสนุน", short:"ก14 บริหารกลาง", icon:"fa-gears"},
};
const ACT_KEYS = Object.keys(ACT_INFO);

/* หน้า "ที่ทำงาน" ของแต่ละกิจกรรม — ไม่ใช่ index.html เสมอไป
   ก4+5: index.html คือ landing สาธารณะ เจ้าหน้าที่ต้องเข้า staff-workflow.html
   ก7/ก10: index.html เป็นภาพรวม คิวงานจริงอยู่ที่ 01-work-inbox.html            */
const ACT_ENTRY = {
  "intake-investigation": "staff-workflow.html",
  "board-resolution":     "inbox.html",
  "legal-case":           "01-work-inbox.html",
};
function actEntry(k){ return k + "/" + (ACT_ENTRY[k] || "index.html"); }
function actTh(k){ return (ACT_INFO[k] && ACT_INFO[k].th) || k; }
function actShort(k){ return (ACT_INFO[k] && ACT_INFO[k].short) || k; }
function actIcon(k){ return (ACT_INFO[k] && ACT_INFO[k].icon) || "fa-folder"; }

/* ---- กิจกรรมที่ผู้ใช้คนนี้เข้าได้ = กิจกรรมที่ตัวเองสังกัด ---- */
function actsOf(user){
  if(!user) return [];
  if(user.act === "*") return ACT_KEYS.slice();
  return [user.act];
}
/* ---- ใครอยู่ในกิจกรรมนี้บ้าง ---- */
function usersOfAct(key){ return AUTH_USERS.filter(u => u.act === key); }
function ownersOf(key){ return usersOfAct(key); }
/* ---- จัดกลุ่มบัญชีตามกิจกรรม (ใช้ที่หน้า login) ---- */
function usersByAct(){
  return ACT_KEYS.map(k => ({ act:k, th:actTh(k), short:actShort(k), icon:actIcon(k),
                              users: usersOfAct(k) }))
                 .filter(g => g.users.length);
}

const AUTH_KEY = "ecmis-transform-auth-v1";
function findUser(u,p){ u=String(u||"").trim(); p=String(p||"").trim();
  return AUTH_USERS.find(x => x.u.toLowerCase()===u.toLowerCase() && x.p===p) || null; }
function getAuth(){
  try{
    const a = JSON.parse(localStorage.getItem(AUTH_KEY)||"null");
    // auth รูปแบบเก่า (ก่อนแยกผู้ใช้ตามกิจกรรม) ไม่มี act → ถือว่าหมดอายุ ให้ล็อกอินใหม่
    if(a && !a.act) return null;
    return a;
  }catch(e){ return null; }
}
function setAuth(a){ try{ localStorage.setItem(AUTH_KEY, JSON.stringify(a)); }catch(e){} }
function clearAuth(){ try{ localStorage.removeItem(AUTH_KEY); }catch(e){} }

function login(u,p){
  const f = findUser(u,p); if(!f) return null;
  const a = { username:f.u, displayName:f.name, title:f.title, org:f.org, act:f.act,
              roleId:f.roleId, visible:actsOf(f),
              readOnly:!!f.readOnly, manageUsers:!!f.manageUsers, at:new Date().toISOString() };
  setAuth(a); ssoBridge(); return a;
}
function logout(){
  clearAuth();
  try{
    sessionStorage.removeItem("ecmis_authed");
    sessionStorage.removeItem("ecmis_role");
    sessionStorage.removeItem("ecmis_username");
    sessionStorage.removeItem("ecmis_sso_for");
  }catch(e){}
}
function isAuthed(){ return !!getAuth(); }
function canSee(key){
  const a = getAuth(); if(!a) return false;
  if(a.act === "*") return true;
  return a.act === key;
}
function isReadOnly(){ const a=getAuth(); return !!(a && a.readOnly); }

/* ---- ROOT ของโปรเจกต์ — คำนวณจาก src ของ <script> ตัวเอง ---- */
const AUTH_ROOT = (function(){
  try{
    const all = document.getElementsByTagName("script");
    for(let i=all.length-1;i>=0;i--){
      const s = all[i].src || "";
      if(s.indexOf("shared-assets/auth.js") !== -1) return s.replace(/shared-assets\/auth\.js(\?.*)?$/, "");
    }
  }catch(e){}
  return "../";
})();

function currentActivity(){
  const p = location.pathname;
  for(const k of ACT_KEYS){ if(p.indexOf("/"+k) !== -1) return k; }
  return null;
}

/* ==========================================================================
   SSO — ล็อกอินครั้งเดียว เข้ากิจกรรมของตัวเองได้เลย
   ก7 เช็ก sessionStorage.ecmis_authed แล้ว redirect ไป login ของตัวเองถ้าไม่มี
   ========================================================================== */
function ssoBridge(){
  const a = getAuth(); if(!a) return;
  try{
    if(typeof sessionStorage === "undefined") return;
    sessionStorage.setItem("ecmis_authed", "1");
    sessionStorage.setItem("ecmis_username", a.username || "demo");
    /* บทบาทภายใน ก7/ก10 ตั้งครั้งเดียวต่อการล็อกอิน — ก7/ก10 มีตัวสลับบทบาทของตัวเอง
       ถ้าเขียนทับทุกครั้งที่โหลดหน้า ตัวสลับจะเด้งกลับแบบเงียบ ๆ */
    const g7 = (a.act === "board-resolution" || a.act === "legal-case" || a.act === "*") ? (a.roleId || "owner") : "owner";
    const stamp = "ecmis_sso_for";
    if(sessionStorage.getItem(stamp) !== a.username || !sessionStorage.getItem("ecmis_role")){
      sessionStorage.setItem("ecmis_role", g7);
      sessionStorage.setItem(stamp, a.username);
    }
  }catch(e){}
}
ssoBridge();

/* ==========================================================================
   ฉากกั้น — เข้ากิจกรรมที่ไม่ใช่ของตัวเอง
   ========================================================================== */
function denyScreen(key){
  if(document.getElementById("ecmisDeny")) return;
  const a = getAuth();
  const who = usersOfAct(key).slice(0,6)
    .map(o => `<div class="deny-who"><code>${o.u}</code> <span>${o.name}</span><small>${o.title}</small></div>`)
    .join("") || "<div class='deny-who'>ผู้ดูแลระบบเท่านั้น</div>";

  const el = document.createElement("div");
  el.id = "ecmisDeny";
  el.innerHTML =
      '<div class="deny-card">'
    + '<div class="deny-ico"><i class="fa-solid fa-lock"></i></div>'
    + '<h1>ไม่มีสิทธิ์เข้าถึงกิจกรรมนี้</h1>'
    + '<p class="deny-act">' + actTh(key) + '</p>'
    + '<table class="deny-tbl">'
    + '<tr><th>คุณเข้าสู่ระบบเป็น</th><td><strong>' + (a ? a.displayName : "-") + '</strong>'
    + (a && a.title ? '<br><small>' + a.title + '</small>' : '')
    + (a && a.org ? '<br><small>' + a.org + '</small>' : '') + '</td></tr>'
    + '<tr><th>คุณสังกัด</th><td>' + (a ? (a.act === "*" ? "ทุกกิจกรรม" : actTh(a.act)) : "-") + '</td></tr>'
    + '<tr><th>ผู้ใช้งานของกิจกรรมนี้</th><td>' + who + '</td></tr>'
    + '</table>'
    + '<div class="deny-act-row">'
    + '<a class="deny-btn primary" href="' + AUTH_ROOT + 'my-work.html"><i class="fa-solid fa-arrow-left"></i> กลับคิวงานของฉัน</a>'
    + '<a class="deny-btn" href="' + AUTH_ROOT + 'login.html"><i class="fa-solid fa-right-to-bracket"></i> เข้าด้วยบัญชีอื่น</a>'
    + '</div>'
    + '<p class="deny-hint">ต้องการเดินดูทั้งระบบ ใช้บัญชีทดสอบ <code>demo / demo</code></p>'
    + '</div>';
  document.documentElement.appendChild(el);
  ensureAuthCss();
  try{ document.body.style.overflow = "hidden"; }catch(e){}
}

function ensureAuthCss(){
  if(document.querySelector('link[data-ecmis-auth]')) return;
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.href = AUTH_ROOT + "shared-assets/auth.css";
  l.setAttribute("data-ecmis-auth", "1");
  document.head.appendChild(l);
}

function guardActivity(){
  const key = currentActivity();
  if(!key) return;
  if(typeof ECMISHub !== "undefined" && ECMISHub.isPublicPage && ECMISHub.isPublicPage()) return;
  const a = getAuth();
  if(!a){
    location.replace(AUTH_ROOT + "login.html?next=" + encodeURIComponent(location.pathname + location.search));
    return;
  }
  if(!canSee(key)) denyScreen(key);
}

/* ---- แถบผู้ใช้ — วางในโฟลว์ ไม่ลอยทับ layout ของหน้า ---- */
function injectUserBar(){
  const setting = document.querySelector('meta[name="ecmis-auth-user-bar"]')?.content;
  if(setting === "off") return;
  const a = getAuth(); if(!a) return;
  if(document.getElementById("authUserBar")) return;
  const el = document.createElement("div");
  el.id = "authUserBar";
  el.innerHTML =
      '<span class="ub-who"><i class="fa-solid fa-user-shield"></i> <strong>' + a.displayName + '</strong>'
    + (a.title ? ' <span class="ub-meta">' + a.title + '</span>' : '')
    + (a.org ? ' <span class="ub-org">' + a.org + '</span>' : '')
    + (a.readOnly ? ' <span class="ub-tag ub-ro">ดูได้อย่างเดียว</span>' : '')
    + (a.act === "*" ? ' <span class="ub-tag ub-all">บัญชีทดสอบ เห็นทุกกิจกรรม</span>' : '')
    + '</span>'
    + '<span class="ub-right">'
    + '<a href="' + AUTH_ROOT + 'my-work.html">คิวงานของฉัน</a>'
    + '<button type="button" data-logout><i class="fa-solid fa-right-from-bracket"></i> ออกจากระบบ</button>'
    + '</span>';
  el.addEventListener("click", function(e){
    if(e.target.closest("[data-logout]")){ logout(); location.href = "/index.html"; }
  });
  // hub overlay: ถ้าเป็น workspace ของ ก4+5 อย่า insertBefore body (จะทับ sidebar) — ใส่หลัง workspaceHost แบบ flow
  var host = document.getElementById("workspaceHost");
  if (host && host.parentNode) { host.parentNode.insertBefore(el, host); }
  else document.body.insertBefore(el, document.body.firstChild);
  ensureAuthCss();
}

function filterShellCards(){
  const a = getAuth(); if(!a) return;
  document.querySelectorAll("[data-act]").forEach(function(card){
    const key = card.getAttribute("data-act");
    if(!key || canSee(key)) return;
    card.classList.add("act-locked");
    card.setAttribute("aria-disabled", "true");
    const owners = usersOfAct(key);
    card.title = "ไม่มีสิทธิ์ — เป็นงานของ " + (owners.length ? owners[0].title : "ผู้ดูแลระบบ");
    if(!card.querySelector(".act-lock-badge")){
      const b = document.createElement("span");
      b.className = "act-lock-badge";
      b.innerHTML = '<i class="fa-solid fa-lock"></i> ไม่มีสิทธิ์';
      card.appendChild(b);
    }
    card.addEventListener("click", function(ev){
      ev.preventDefault();
      const list = owners.slice(0,5).map(o => o.name + " — " + o.title).join("<br>");
      if(window.Swal) Swal.fire({icon:"info", title:"ไม่มีสิทธิ์เข้าถึง",
        html:"<b>" + actTh(key) + "</b><br><br>ผู้ใช้งานของกิจกรรมนี้:<br>" + (list || "ผู้ดูแลระบบ"),
        confirmButtonColor:"#0d1b3e", customClass:{popup:"ecmis-swal"}});
      else alert("ไม่มีสิทธิ์เข้าถึง — " + actTh(key));
    });
  });
  ensureAuthCss();
}

(function(){
  if(location.pathname.endsWith("/login.html")) return;
  function boot(){ guardActivity(); injectUserBar(); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

window.ECMISAuth = {
  USERS: AUTH_USERS, ACT_INFO: ACT_INFO, ACT_KEYS: ACT_KEYS,
  actTh: actTh, actShort: actShort, actIcon: actIcon, actEntry: actEntry,
  actsOf: actsOf, usersOfAct: usersOfAct, usersByAct: usersByAct, ownersOf: ownersOf,
  getAuth: getAuth, login: login, logout: logout, isAuthed: isAuthed,
  canSee: canSee, isReadOnly: isReadOnly, currentActivity: currentActivity,
  filterShellCards: filterShellCards, injectUserBar: injectUserBar, root: AUTH_ROOT,
};
