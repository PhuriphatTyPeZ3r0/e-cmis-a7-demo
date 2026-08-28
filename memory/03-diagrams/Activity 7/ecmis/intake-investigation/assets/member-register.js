(() => {
  const province = document.getElementById('province');
  const district = document.getElementById('district');
  const subdistrict = document.getElementById('subdistrict');
  const provinceOptions = document.getElementById('provinceOptions');
  const districtOptions = document.getElementById('districtOptions');
  const subdistrictOptions = document.getElementById('subdistrictOptions');
  const districtHint = document.getElementById('districtHint');
  const form = document.getElementById('memberRegisterForm');
  const locationUrl = 'https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province_with_district_and_sub_district.json';
  const fallback = [
    {name_th:'กรุงเทพมหานคร',districts:['เขตพระนคร','เขตดุสิต','เขตหนองจอก','เขตบางรัก','เขตบางเขน','เขตบางกะปิ','เขตปทุมวัน','เขตป้อมปราบศัตรูพ่าย','เขตพระโขนง','เขตมีนบุรี','เขตลาดกระบัง','เขตยานนาวา','เขตสัมพันธวงศ์','เขตพญาไท','เขตธนบุรี','เขตบางกอกใหญ่','เขตห้วยขวาง','เขตคลองสาน','เขตตลิ่งชัน','เขตบางกอกน้อย']},
    {name_th:'นนทบุรี',districts:['เมืองนนทบุรี','บางกรวย','บางใหญ่','บางบัวทอง','ไทรน้อย','ปากเกร็ด']},
    {name_th:'ชลบุรี',districts:['เมืองชลบุรี','บ้านบึง','หนองใหญ่','บางละมุง','พานทอง','พนัสนิคม','ศรีราชา','เกาะสีชัง','สัตหีบ','บ่อทอง','เกาะจันทร์']},
    {name_th:'เชียงใหม่',districts:['เมืองเชียงใหม่','จอมทอง','แม่แจ่ม','เชียงดาว','ดอยสะเก็ด','แม่แตง','แม่ริม','สะเมิง','ฝาง','แม่อาย','พร้าว','สันป่าตอง','สันกำแพง','สันทราย','หางดง','ฮอด','ดอยเต่า','อมก๋อย','สารภี','เวียงแหง','ไชยปราการ','แม่วาง','แม่ออน','ดอยหล่อ','กัลยาณิวัฒนา']},
    {name_th:'ขอนแก่น',districts:['เมืองขอนแก่น','บ้านฝาง','พระยืน','หนองเรือ','ชุมแพ','สีชมพู','น้ำพอง','อุบลรัตน์','กระนวน','บ้านไผ่','เปือยน้อย','พล','แวงใหญ่','แวงน้อย','หนองสองห้อง','ภูเวียง','มัญจาคีรี','ชนบท','เขาสวนกวาง','ภูผาม่าน','ซำสูง','โคกโพธิ์ไชย','หนองนาคำ','บ้านแฮด','โนนศิลา','เวียงเก่า']},
    {name_th:'สงขลา',districts:['เมืองสงขลา','สทิงพระ','จะนะ','นาทวี','เทพา','สะบ้าย้อย','ระโนด','กระแสสินธุ์','รัตภูมิ','สะเดา','หาดใหญ่','นาหม่อม','ควนเนียง','บางกล่ำ','สิงหนคร','คลองหอยโข่ง']}
  ];
  let locationRows = [];
  function isValidCitizenId(value){
    const digits=String(value).replace(/\D/g,'');
    if(digits.length!==13)return false;
    const sum=[...digits.slice(0,12)].reduce((total,digit,index)=>total+(Number(digit)*(13-index)),0);
    return (11-(sum%11))%10===Number(digits[12]);
  }
  const flattenLocations = records => records.flatMap(provinceItem =>
    (provinceItem.districts || provinceItem.amphure || []).flatMap(districtItem => {
      const districtName=typeof districtItem==='string'?districtItem:districtItem.name_th;
      const subdistricts=typeof districtItem==='string'?[]:(districtItem.sub_districts || districtItem.tambon || []);
      if(!subdistricts.length)return [{province:provinceItem.name_th,district:districtName,subdistrict:''}];
      return subdistricts.map(subdistrictItem=>({
        province:provinceItem.name_th,
        district:districtName,
        subdistrict:typeof subdistrictItem==='string'?subdistrictItem:subdistrictItem.name_th
      }));
    })
  );
  function validateCitizenIdInput(input){
    const digits=input.value.replace(/\D/g,'');
    const feedback=document.getElementById('citizenIdFeedback');
    input.classList.remove('is-valid','is-invalid');
    feedback.className='member-id-feedback';
    feedback.textContent='';
    if(!digits.length){input.setCustomValidity('');return}
    if(digits.length<13){input.setCustomValidity('กรอกเลขประจำตัวประชาชนให้ครบ 13 หลัก');feedback.classList.add('show','info');feedback.innerHTML=`<i class="fa-solid fa-circle-info"></i> กรอกให้ครบ 13 หลัก (ขณะนี้ ${digits.length}/13)`;return}
    if(isValidCitizenId(digits)){input.setCustomValidity('');input.classList.add('is-valid');feedback.classList.add('show','valid');feedback.innerHTML='<i class="fa-solid fa-circle-check"></i> เลขประจำตัวประชาชนถูกต้อง';return}
    input.setCustomValidity('เลขประจำตัวประชาชนไม่ถูกต้อง');input.classList.add('is-invalid');feedback.classList.add('show','invalid');feedback.innerHTML='<i class="fa-solid fa-circle-exclamation"></i> เลขประจำตัวประชาชนไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
  }
  function formatCitizenIdInput(input){
    const digits=input.value.replace(/\D/g,'').slice(0,13);
    const groups=[1,4,5,2,1];let index=0;const parts=[];
    for(const length of groups){if(index>=digits.length)break;parts.push(digits.slice(index,index+length));index+=length}
    input.value=parts.join('-');
    validateCitizenIdInput(input);
  }
  function renderLocationOptions(){
    const provinceValue=province.value.trim();
    const districtValue=district.value.trim();
    const provinces=[...new Set(locationRows.map(item=>item.province))].sort((a,b)=>a.localeCompare(b,'th'));
    provinceOptions.replaceChildren(...provinces.map(name=>{const option=document.createElement('option');option.value=name;return option}));
    const districts=new Map();
    locationRows.filter(item=>!provinceValue||item.province===provinceValue).forEach(item=>districts.set(`${item.province}|${item.district}`,item));
    districtOptions.replaceChildren(...[...districts.values()].sort((a,b)=>a.district.localeCompare(b.district,'th')).map(item=>{const option=document.createElement('option');option.value=provinceValue?item.district:`${item.district} — ${item.province}`;return option}));
    const subdistricts=locationRows.filter(item=>item.subdistrict&&(!provinceValue||item.province===provinceValue)&&(!districtValue||item.district===districtValue));
    subdistrictOptions.replaceChildren(...subdistricts.sort((a,b)=>a.subdistrict.localeCompare(b.subdistrict,'th')).map(item=>{const option=document.createElement('option');option.value=provinceValue&&districtValue?item.subdistrict:`${item.subdistrict} — ${item.district} — ${item.province}`;return option}));
    const districtCount=new Set(locationRows.filter(item=>!provinceValue||item.province===provinceValue).map(item=>item.district)).size;
    districtHint.textContent=provinceValue&&districtCount?`พบ ${districtCount} อำเภอ/เขตในจังหวัดที่ระบุ`:'ค้นหาได้โดยไม่จำเป็นต้องเลือกจังหวัดก่อน';
  }
  function findLocation(type,entered){
    const provinceValue=province.value.trim();
    const districtValue=district.value.trim();
    if(type==='district'){
      const decorated=locationRows.find(item=>`${item.district} — ${item.province}`===entered);
      if(decorated)return decorated;
      const matches=locationRows.filter(item=>item.district===entered&&(!provinceValue||item.province===provinceValue));
      return matches.length===1?matches[0]:null;
    }
    const decorated=locationRows.find(item=>`${item.subdistrict} — ${item.district} — ${item.province}`===entered);
    if(decorated)return decorated;
    const matches=locationRows.filter(item=>item.subdistrict===entered&&(!provinceValue||item.province===provinceValue)&&(!districtValue||item.district===districtValue));
    return matches.length===1?matches[0]:null;
  }
  fetch(locationUrl).then(response=>{if(!response.ok)throw new Error('location data unavailable');return response.json()}).then(data=>{locationRows=flattenLocations(data);renderLocationOptions()}).catch(()=>{locationRows=flattenLocations(fallback);renderLocationOptions();districtHint.textContent='ค้นหาได้จากรายการพื้นที่ที่มีอยู่'});
  province.addEventListener('change',()=>{const valid=locationRows.some(item=>item.province===province.value&&item.district===district.value&&(!subdistrict.value||item.subdistrict===subdistrict.value));if(!valid){district.value='';subdistrict.value=''}renderLocationOptions()});
  district.addEventListener('change',()=>{const match=findLocation('district',district.value.trim());subdistrict.value='';if(match){province.value=match.province;district.value=match.district}renderLocationOptions()});
  subdistrict.addEventListener('change',()=>{const match=findLocation('subdistrict',subdistrict.value.trim());if(match){province.value=match.province;district.value=match.district;subdistrict.value=match.subdistrict}renderLocationOptions()});
  document.getElementById('citizenId').addEventListener('input',event=>formatCitizenIdInput(event.target));
  document.getElementById('phone').addEventListener('input',event=>{event.target.value=event.target.value.replace(/\D/g,'').slice(0,10)});
  document.querySelectorAll('[data-font]').forEach(button=>button.addEventListener('click',()=>{const step=Number(button.dataset.font);document.documentElement.style.fontSize=step===0?'16px':`${16+(step*2)}px`}));
  document.getElementById('contrastButton').addEventListener('click',()=>document.body.classList.toggle('high-contrast'));
  document.getElementById('languageButton').addEventListener('click',()=>Swal.fire({icon:'info',title:'หน้าจอต้นแบบภาษาไทย',text:'ยังไม่ได้จัดทำข้อความภาษาอังกฤษในขอบเขตนี้',confirmButtonColor:'#0a2647'}));
  const pwd=document.getElementById('memberPassword');
  const pwd2=document.getElementById('memberPasswordConfirm');
  function validatePasswords(){
    const a=(pwd.value||'').trim(), b=(pwd2.value||'').trim();
    if(a && a.length<6){ pwd.setCustomValidity('รหัสผ่านอย่างน้อย 6 ตัวอักษร'); return; }
    pwd.setCustomValidity('');
    if(a && b && a!==b){ pwd2.setCustomValidity('รหัสผ่านไม่ตรงกัน'); } else { pwd2.setCustomValidity(''); }
  }
  pwd.addEventListener('input', validatePasswords);
  pwd2.addEventListener('input', validatePasswords);
  const MEMBER_STORE_KEY='ecmis-members-v1';
  function readMembers(){ try{ const v=JSON.parse(localStorage.getItem(MEMBER_STORE_KEY)||'[]'); return Array.isArray(v)?v:[]; }catch{ return []; } }
  function writeMembers(list){ localStorage.setItem(MEMBER_STORE_KEY, JSON.stringify(list)); }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const citizen=document.getElementById('citizenId');
    const phoneDigits=document.getElementById('phone').value.replace(/\D/g,'');
    validateCitizenIdInput(citizen);
    validatePasswords();
    document.getElementById('phone').setCustomValidity(phoneDigits.length===10?'':'invalid');
    if(!form.checkValidity()){ form.classList.add('was-validated'); form.querySelector(':invalid')?.focus(); return; }
    const citizenDigits=citizen.value.replace(/\D/g,'');
    const emailVal=document.getElementById('email').value.trim().toLowerCase();
    const phoneVal=phoneDigits;
    const members=readMembers();
    if(members.some(m=>m.citizenId===citizenDigits)){ Swal.fire({icon:'warning',title:'เลขประจำตัวประชาชนนี้สมัครแล้ว',text:'กรุณาเข้าสู่ระบบด้วยบัญชีเดิม หรือติดต่อ 1206',confirmButtonColor:'#0a2647'}); return; }
    if(members.some(m=>String(m.email||'').toLowerCase()===emailVal)){ Swal.fire({icon:'warning',title:'อีเมลนี้ถูกใช้งานแล้ว',text:'กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ',confirmButtonColor:'#0a2647'}); return; }
    const privacy=document.querySelector('input[name=\"privacyPreference\"]:checked')?.value||'';
    const payload={
      citizenId: citizenDigits,
      titlePrefix: document.getElementById('titlePrefix').value.trim(),
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      phone: phoneVal,
      email: emailVal,
      address: document.getElementById('address').value.trim(),
      moo: document.getElementById('moo').value.trim(),
      soi: document.getElementById('soi').value.trim(),
      road: document.getElementById('road').value.trim(),
      province: document.getElementById('province').value.trim(),
      district: document.getElementById('district').value.trim(),
      subdistrict: document.getElementById('subdistrict').value.trim(),
      occupation: document.getElementById('occupation').value.trim(),
      privacyPreference: privacy,
      password: (pwd.value||'').trim(),
      createdAt: new Date().toISOString()
    };
    members.push(payload);
    writeMembers(members);
    Swal.fire({icon:'success',title:'ลงทะเบียนสมาชิกเรียบร้อยแล้ว',text:'เข้าสู่ระบบด้วยบัตรประชาชนหรืออีเมลและรหัสผ่านที่ตั้งไว้',confirmButtonText:'ไปหน้าเข้าสู่ระบบ',confirmButtonColor:'#0a2647'}).then(()=>{ window.location.href='member-login.html'; });
  });
})();
