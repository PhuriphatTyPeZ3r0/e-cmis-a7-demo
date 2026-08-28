(() => {
  const MEMBER_STORE_KEY = 'ecmis-members-v1';
  const MEMBER_SESSION_KEY = 'ecmis-member-session';
  function readMembers(){ try{ const v=JSON.parse(localStorage.getItem(MEMBER_STORE_KEY)||'[]'); return Array.isArray(v)?v:[]; }catch{ return []; } }
  function formatCitizenInput(input){
    const digits = input.value.replace(/\D/g,'').slice(0,13);
    const groups=[1,4,5,2,1]; let idx=0; const parts=[];
    for(const len of groups){ if(idx>=digits.length) break; parts.push(digits.slice(idx, idx+len)); idx+=len; }
    input.value = parts.join('-');
  }
  const citInput = document.getElementById('loginCitizenId');
  if(citInput) citInput.addEventListener('input', e=> formatCitizenInput(e.target));

  window.switchMemberTab = function(tab){
    const isCit = tab==='citizen';
    document.getElementById('tabBtn-citizen').classList.toggle('active', isCit);
    document.getElementById('tabBtn-email').classList.toggle('active', !isCit);
    document.getElementById('memberCitizenForm').classList.toggle('d-none', !isCit);
    document.getElementById('memberEmailForm').classList.toggle('d-none', isCit);
  };
  window.togglePwd = function(inputId, btn){
    const input=document.getElementById(inputId);
    const icon=btn.querySelector('i');
    const show=input.type==='password';
    input.type = show ? 'text' : 'password';
    if(icon) icon.className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  };
  window.handleMemberLogin = function(event, mode){
    event.preventDefault();
    const needKey = mode==='citizen' ? 'member-login-citizen' : 'member-login-email';
    if(window.PACCHumanVerification && !window.PACCHumanVerification.require(needKey)) return;
    const members = readMembers();
    let member=null, pwd='';
    if(mode==='citizen'){
      const digits=(document.getElementById('loginCitizenId').value||'').replace(/\D/g,'');
      pwd=(document.getElementById('loginCitizenPassword').value||'').trim();
      if(!digits || !pwd){ Swal.fire({icon:'warning', title:'กรอกข้อมูลให้ครบ', confirmButtonColor:'#0a2647'}); return; }
      member = members.find(m=>m.citizenId===digits);
    } else {
      const email=(document.getElementById('loginEmail').value||'').trim().toLowerCase();
      pwd=(document.getElementById('loginEmailPassword').value||'').trim();
      if(!email || !pwd){ Swal.fire({icon:'warning', title:'กรอกข้อมูลให้ครบ', confirmButtonColor:'#0a2647'}); return; }
      member = members.find(m=>String(m.email||'').toLowerCase()===email);
    }
    if(!member){
      Swal.fire({icon:'error', title:'ไม่พบบัญชีนี้', text:'กรุณาตรวจสอบเลขบัตร/อีเมล หรือสมัครสมาชิกก่อน', confirmButtonColor:'#0a2647'});
      return;
    }
    if(String(member.password||'') !== pwd){
      Swal.fire({icon:'error', title:'รหัสผ่านไม่ถูกต้อง', confirmButtonColor:'#0a2647'});
      return;
    }
    const session={
      citizenId: member.citizenId,
      email: member.email,
      phone: member.phone,
      name: `${member.titlePrefix||''}${member.firstName||''} ${member.lastName||''}`.trim(),
      firstName: member.firstName||'',
      lastName: member.lastName||'',
      titlePrefix: member.titlePrefix||'',
      privacyPreference: member.privacyPreference||'',
      signedInAt: new Date().toISOString()
    };
    try{ localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session)); }catch(e){}
    Swal.fire({icon:'success', title:'เข้าสู่ระบบสำเร็จ', timer:700, showConfirmButton:false}).then(()=>{ window.location.href='member-dashboard.html'; });
    setTimeout(()=>{ window.location.href='member-dashboard.html'; }, 800);
  };
})();
