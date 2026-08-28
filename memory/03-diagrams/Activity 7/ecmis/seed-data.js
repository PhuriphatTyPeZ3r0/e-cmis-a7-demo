// seed-data.js — ตัวช่วยรีเซ็ต/เติม seed ครบทุกกิจกรรม (ใช้ร่วมกับ cases.js)
// ทะเบียนหลักอยู่ที่ cases.js (ECMIS_SEED_MORE ~21 เคส) — ไฟล์นี้แค่ปุ่มรีเซ็ตสำหรับหน้า seed.html
(function(g){
  function resetAll(){
    try{
      localStorage.removeItem("ecmis-transform-cases-v1");
      localStorage.removeItem("ecmis-transform-cases-v1-seed");
      localStorage.removeItem("ecmis-transform-events-v1");
      localStorage.removeItem("ecmis-a4-workspace-v3");
      localStorage.removeItem("ecmis-a4-workspace-schema-version");
      // ให้ cases.js ทำ seed ใหม่เมื่อโหลดหน้าใหม่
      location.reload();
    }catch(e){ alert("รีเซ็ตไม่ได้: "+e.message); }
  }
  function applyRich(){ try{ localStorage.removeItem("ecmis-transform-cases-v1-seed"); location.reload(); }catch(e){} }
  g.SeedData = g.SeedData || {};
  g.SeedData.resetAll = resetAll;
  g.SeedData.apply = applyRich;
})(typeof window!=="undefined"?window:globalThis);
