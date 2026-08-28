(function(){
  'use strict';

  var STORAGE_KEY = 'ecmis-registration-requests';
  var currentStep = 1;
  var thaidVerified = false;
  var latestRegistration = null;
  var thaidTimer = null;
  var thaidPollTimer = null;
  var thaidReference = '';
  var thaidDemoUsed = false;
  var thaidVerifiedAt = '';
  var $ = function(id){ return document.getElementById(id); };
  var form = $('registrationForm');
  var masterData = window.ECMISRegisterMasterData || {
    userTypes:[],positionTypes:[],positionLevels:[],positions:[],departments:[],segmentDepartments:[],subsegments:[]
  };

  function value(id){ return ($(id).value || '').trim(); }
  function digits(text){ return String(text || '').replace(/\D/g, ''); }
  function normalizeEnglishName(text){ return String(text || '').trim().toLowerCase().replace(/[^a-z]/g, ''); }
  function isEmail(text){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text); }
  function populateOfficialEmail(username){ $('emailBackup').value = username ? username + '@pacc.go.th' : ''; }

  function selectedText(id){
    var select = $(id);
    if(!select || !select.value || select.selectedIndex < 0) return '';
    return select.options[select.selectedIndex].textContent.trim();
  }

  function setSelectOptions(id,items,placeholder,valueOf,labelOf,disabled){
    var select = $(id);
    var placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = placeholder;
    select.replaceChildren(placeholderOption);
    items.forEach(function(item){
      var option = document.createElement('option');
      option.value = String(valueOf(item));
      option.textContent = labelOf(item);
      select.appendChild(option);
    });
    select.disabled = Boolean(disabled);
  }

  function setRequiredState(fieldId,markerId,required){
    var field = $(fieldId);
    var marker = $(markerId);
    if(required) field.setAttribute('aria-required','true');
    else field.removeAttribute('aria-required');
    if(marker) marker.classList.toggle('hidden',!required);
  }

  function positionLabel(position){
    if(position.lineWork && position.lineWork !== position.name){
      return position.lineWork + ' — ' + position.name;
    }
    return position.name;
  }

  function positionData(){
    var id = Number(value('jobTitle'));
    return masterData.positions.find(function(position){ return position.id === id; }) || null;
  }

  function segmentDepartmentData(){
    var code = value('division');
    return masterData.segmentDepartments.find(function(segment){ return segment.code === code; }) || null;
  }

  function updatePositionRequiredState(){
    var hasAnyPositionValue = Boolean(value('positionType') || value('jobTitle') || value('positionLevel'));
    var required = value('officerType') === '1' || hasAnyPositionValue;
    setRequiredState('positionType','positionTypeRequired',required);
    setRequiredState('jobTitle','jobTitleRequired',required);
    setRequiredState('positionLevel','positionLevelRequired',required);
    return required;
  }

  function updatePositionLevelOptions(){
    var position = positionData();
    var allowedIds = position ? position.positionLevelIds : [];
    var levels = masterData.positionLevels.filter(function(level){ return allowedIds.includes(level.id); });
    setSelectOptions(
      'positionLevel',levels,
      position ? '— เลือกระดับตำแหน่ง —' : '— เลือกสายงาน/ตำแหน่งก่อน —',
      function(level){ return level.id; },
      function(level){ return level.name; },
      !position
    );
    updatePositionRequiredState();
  }

  function updatePositionOptions(){
    var positionTypeId = Number(value('positionType'));
    var positions = masterData.positions.filter(function(position){ return position.positionTypeId === positionTypeId; });
    setSelectOptions(
      'jobTitle',positions,
      positionTypeId ? '— เลือกสายงาน/ตำแหน่ง —' : '— เลือกประเภทสายงานก่อน —',
      function(position){ return position.id; },
      positionLabel,
      !positionTypeId
    );
    updatePositionLevelOptions();
  }

  function updateSubDivisionOptions(){
    var segment = segmentDepartmentData();
    var subsegments = segment
      ? masterData.subsegments.filter(function(subsegment){ return subsegment.segmentId === segment.segmentId; })
      : [];
    var hasChildren = subsegments.length > 0;
    var placeholder = !segment
      ? '— เลือกส่วน/กลุ่ม/ฝ่ายก่อน —'
      : (hasChildren ? '— เลือกหน่วยงานย่อย —' : '— ไม่มีหน่วยงานย่อย —');
    setSelectOptions(
      'subDivision',subsegments,placeholder,
      function(subsegment){ return subsegment.id; },
      function(subsegment){ return subsegment.name; },
      !hasChildren
    );
    setRequiredState('subDivision','subDivisionRequired',hasChildren);
  }

  function updateDivisionOptions(){
    var departmentCode = value('bureau');
    var segments = masterData.segmentDepartments.filter(function(segment){ return segment.departmentCode === departmentCode; });
    var hasChildren = segments.length > 0;
    var placeholder = !departmentCode
      ? '— เลือกหน่วยงานหลักก่อน —'
      : (hasChildren ? '— เลือกส่วน/กลุ่ม/ฝ่าย —' : '— ไม่มีหน่วยงานระดับรอง —');
    setSelectOptions(
      'division',segments,placeholder,
      function(segment){ return segment.code; },
      function(segment){ return segment.name; },
      !hasChildren
    );
    setRequiredState('division','divisionRequired',hasChildren);
    updateSubDivisionOptions();
  }

  function initializeMasterDropdowns(){
    setSelectOptions(
      'officerType',masterData.userTypes,'— เลือกประเภทเจ้าหน้าที่ —',
      function(userType){ return userType.id; },
      function(userType){ return userType.name; },
      false
    );
    setSelectOptions(
      'positionType',masterData.positionTypes,'— เลือกประเภทสายงาน —',
      function(positionType){ return positionType.id; },
      function(positionType){ return positionType.name; },
      false
    );
    setSelectOptions(
      'bureau',masterData.departments,'— เลือกหน่วยงานหลัก —',
      function(department){ return department.code; },
      function(department){ return department.name; },
      false
    );
    updatePositionOptions();
    updateDivisionOptions();
    updatePositionRequiredState();
  }

  function readRegistrations(){
    try{
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    }catch(error){
      console.warn('อ่านคำขอลงทะเบียนเดิมไม่สำเร็จ', error);
      return [];
    }
  }

  function usedUsernames(){
    var names = new Set(readRegistrations().map(function(item){ return String(item.username || '').toLowerCase(); }));
    try{
      if(window.ECMISAuth && Array.isArray(window.ECMISAuth.USERS)){
        window.ECMISAuth.USERS.forEach(function(user){
          if(user && user.u) names.add(String(user.u).toLowerCase());
        });
      }
    }catch(error){
      console.warn('อ่านรายชื่อบัญชีเดิมไม่สำเร็จ', error);
    }
    return names;
  }

  function updateUsername(){
    var firstName = normalizeEnglishName(value('firstNameEn'));
    var lastName = normalizeEnglishName(value('lastNameEn'));
    var field = $('username');
    var status = $('usernameStatus');
    var statusIcon = status.querySelector('i');
    var statusText = status.querySelector('span');

    status.classList.remove('ok','warn');
    statusIcon.className = 'fa-solid fa-circle-info';
    if(!firstName || !lastName){
      field.value = '';
      populateOfficialEmail('');
      statusText.textContent = 'กรอกชื่อและนามสกุล (Latin) เพื่อสร้าง Username';
      return;
    }

    var existing = usedUsernames();
    var original = firstName + '.' + lastName.charAt(0);
    var candidate = original;
    var adjusted = false;
    for(var length = 1; length <= lastName.length; length += 1){
      candidate = firstName + '.' + lastName.slice(0,length);
      if(!existing.has(candidate)) break;
      adjusted = true;
    }
    if(existing.has(candidate)){
      var suffix = 2;
      do{
        candidate = firstName + '.' + lastName + suffix;
        suffix += 1;
      }while(existing.has(candidate));
      adjusted = true;
    }

    field.value = candidate;
    populateOfficialEmail(candidate);
    if(adjusted){
      status.classList.add('warn');
      statusIcon.className = 'fa-solid fa-triangle-exclamation';
      statusText.textContent = 'Username ' + original + ' ถูกใช้งานแล้ว ระบบปรับเป็น ' + candidate;
    }else{
      status.classList.add('ok');
      statusIcon.className = 'fa-solid fa-circle-check';
      statusText.textContent = 'Username ' + candidate + ' สามารถใช้งานได้';
    }
  }

  function setError(fieldId,errorId,message){
    var field = $(fieldId);
    var error = $(errorId);
    if(field){
      field.classList.toggle('err',Boolean(message));
      field.setAttribute('aria-invalid',message ? 'true' : 'false');
    }
    if(error){
      error.classList.toggle('hidden',!message);
      var text = error.querySelector('span');
      if(text) text.textContent = message || '';
    }
    return !message;
  }

  function clearStepErrors(step){
    var panel = document.querySelector('[data-step-panel="' + step + '"]');
    if(!panel) return;
    panel.querySelectorAll('.pub-inp.err,.pub-sel.err').forEach(function(field){
      field.classList.remove('err');
      field.setAttribute('aria-invalid','false');
    });
    panel.querySelectorAll('.pub-err-msg').forEach(function(error){ error.classList.add('hidden'); });
  }

  function firstInvalidField(step){
    var panel = document.querySelector('[data-step-panel="' + step + '"]');
    var invalid = panel && panel.querySelector('[aria-invalid="true"]');
    if(invalid){
      invalid.focus();
      invalid.scrollIntoView({behavior:'smooth',block:'center'});
    }
  }

  function validateBirthDate(showError){
    var dayText = value('birthDay');
    var monthText = value('birthMonth');
    var yearText = value('birthYear');
    var hasAny = Boolean(dayText || monthText || yearText);
    var message = '';
    if(!hasAny){
      setError('birthDay','birthDateError','');
      return true;
    }
    if(!dayText || !monthText || !yearText){
      message = 'กรุณากรอกวัน เดือนและปี พ.ศ. ให้ครบ';
    }else{
      var day = Number(dayText);
      var month = Number(monthText);
      var gregorianYear = Number(yearText) - 543;
      var date = new Date(gregorianYear,month - 1,day);
      var validDate = date.getFullYear() === gregorianYear && date.getMonth() === month - 1 && date.getDate() === day;
      var today = new Date();
      today.setHours(0,0,0,0);
      var oldest = new Date(today.getFullYear() - 120,today.getMonth(),today.getDate());
      if(!validDate) message = 'วันเดือนปีเกิดไม่ถูกต้อง';
      else if(date > today) message = 'วันเดือนปีเกิดต้องไม่เป็นวันที่ในอนาคต';
      else if(date < oldest) message = 'อายุต้องไม่เกิน 120 ปี';
    }
    setError('birthDay','birthDateError',showError ? message : '');
    return !message;
  }

  function validateStep1(){
    clearStepErrors(1);
    if(!thaidVerified){
      $('thaidRequiredError').classList.remove('hidden');
      $('thaidPanel').classList.add('pub-thaid-attention');
      $('openTermsButton').focus();
      $('openTermsButton').scrollIntoView({behavior:'smooth',block:'center'});
      return false;
    }
    $('thaidRequiredError').classList.add('hidden');
    $('thaidPanel').classList.remove('pub-thaid-attention');
    updateUsername();
    var valid = true;
    valid = setError('nationalId','nationalIdError',digits(value('nationalId')).length === 13 ? '' : 'เลขบัตรประชาชนต้องมี 13 หลัก') && valid;
    valid = setError('firstNameEn','firstNameEnError',normalizeEnglishName(value('firstNameEn')) ? '' : 'กรุณากรอกชื่อ (สำหรับ Username)') && valid;
    valid = setError('lastNameEn','lastNameEnError',normalizeEnglishName(value('lastNameEn')) ? '' : 'กรุณากรอกนามสกุล (สำหรับ Username)') && valid;
    valid = setError('username','usernameError',value('username') ? '' : 'กรุณากรอกชื่อ-นามสกุล (Latin) เพื่อสร้างชื่อผู้ใช้งาน') && valid;
    valid = setError('titleTh','titleThError',value('titleTh') ? '' : 'กรุณาเลือกคำนำหน้า') && valid;
    valid = setError('firstName','firstNameError',value('firstName') ? '' : 'กรุณากรอกชื่อ') && valid;
    valid = setError('lastName','lastNameError',value('lastName') ? '' : 'กรุณากรอกนามสกุล') && valid;
    valid = setError('mobile','mobileError',value('mobile') ? '' : 'กรุณากรอกเบอร์มือถือ') && valid;
    valid = setError('email','emailError',isEmail(value('email')) ? '' : 'กรุณากรอกอีเมลให้ถูกต้อง') && valid;
    valid = validateBirthDate(true) && valid;
    if(!valid) firstInvalidField(1);
    return valid;
  }

  function validateStep2(){
    clearStepErrors(2);
    var valid = true;
    valid = setError('officerType','officerTypeError',value('officerType') ? '' : 'กรุณาเลือกประเภทเจ้าหน้าที่') && valid;
    var positionRequired = updatePositionRequiredState();
    valid = setError('positionType','positionTypeError',positionRequired && !value('positionType') ? 'กรุณาเลือกประเภทสายงาน' : '') && valid;
    valid = setError('jobTitle','jobTitleError',positionRequired && !value('jobTitle') ? 'กรุณาเลือกสายงาน/ตำแหน่ง' : '') && valid;
    valid = setError('positionLevel','positionLevelError',positionRequired && !value('positionLevel') ? 'กรุณาเลือกระดับตำแหน่ง' : '') && valid;
    valid = setError('bureau','bureauError',value('bureau') ? '' : 'กรุณาเลือกหน่วยงานหลัก') && valid;
    valid = setError('division','divisionError',!$('division').disabled && !value('division') ? 'กรุณาเลือกส่วน/กลุ่ม/ฝ่าย' : '') && valid;
    valid = setError('subDivision','subDivisionError',!$('subDivision').disabled && !value('subDivision') ? 'กรุณาเลือกหน่วยงานย่อย' : '') && valid;
    if(!valid) firstInvalidField(2);
    return valid;
  }

  function showStep(step){
    currentStep = step;
    document.querySelectorAll('[data-step-panel]').forEach(function(panel){
      panel.classList.toggle('hidden',Number(panel.dataset.stepPanel) !== step);
    });
    $('registrationStepper').classList.toggle('hidden',step === 4);
    [1,2,3].forEach(function(number){
      var dot = document.querySelector('[data-step-dot="' + number + '"]');
      var label = document.querySelector('[data-step-label="' + number + '"]');
      var done = number < step;
      var active = number === step;
      dot.classList.toggle('done',done);
      dot.classList.toggle('active',active);
      label.classList.toggle('done',done);
      label.classList.toggle('active',active);
      if(active) dot.setAttribute('aria-current','step'); else dot.removeAttribute('aria-current');
      dot.innerHTML = done ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : '<span>' + number + '</span>';
    });
    [1,2].forEach(function(number){
      document.querySelector('[data-step-line="' + number + '"]').classList.toggle('done',number < step);
    });
    window.scrollTo({top:0,behavior:'smooth'});
    var title = document.querySelector('[data-step-panel="' + step + '"] .pub-card-title,[data-step-panel="' + step + '"] .pub-s4-title');
    if(title){ title.setAttribute('tabindex','-1'); setTimeout(function(){ title.focus({preventScroll:true}); },250); }
  }

  function maskId(id){
    var raw = digits(id);
    if(raw.length < 4) return raw;
    return raw.slice(0,1) + '*'.repeat(raw.length - 4) + raw.slice(-3);
  }

  function formatBirthDate(){
    if(!value('birthDay') && !value('birthMonth') && !value('birthYear')) return '';
    var month = $('birthMonth').options[$('birthMonth').selectedIndex];
    return value('birthDay') + ' ' + (month ? month.textContent : '') + ' ' + value('birthYear');
  }

  function summaryRow(label,text,className){
    var row = document.createElement('div');
    row.className = 'pub-sum-row';
    var key = document.createElement('span');
    key.className = 'pub-sum-k';
    key.textContent = label;
    var item = document.createElement('span');
    item.className = 'pub-sum-v' + (className ? ' ' + className : '');
    item.textContent = text;
    row.appendChild(key);
    row.appendChild(item);
    return row;
  }

  function renderSummary(){
    var summary = $('registrationSummary');
    summary.replaceChildren();
    var rows = [
      ['ชื่อผู้ใช้งาน',value('username'),'pub-c-gold'],
      ['ชื่อ-นามสกุล',value('titleTh') + ' ' + value('firstName') + ' ' + value('lastName')],
      ['ชื่อ-นามสกุล (สำหรับ Username)',value('firstNameEn') + ' ' + value('lastNameEn')],
      ['ชื่อเล่น',value('nickname')],
      ['เลขบัตรประชาชน',maskId(value('nationalId'))],
      ['วันเดือนปีเกิด',formatBirthDate()],
      ['โทรศัพท์มือถือ',value('mobile')],
      ['มือถือสำรอง',value('mobileBackup')],
      ['โทรศัพท์ภายใน',value('phoneInternal') + (value('phoneExtension') ? ' ต่อ ' + value('phoneExtension') : '')],
      ['Gmail',value('email')],
      ['อีเมลราชการ',value('emailBackup')],
      ['ประเภทเจ้าหน้าที่',selectedText('officerType')],
      ['ประเภทสายงาน',selectedText('positionType')],
      ['สายงาน / ตำแหน่ง',selectedText('jobTitle')],
      ['ระดับตำแหน่ง',selectedText('positionLevel')],
      ['หน่วยงานหลัก',selectedText('bureau')],
      ['ส่วน/กลุ่ม/ฝ่าย',selectedText('division')],
      ['หน่วยงานย่อย',selectedText('subDivision')],
      ['ยืนยัน ThaiD',thaidDemoUsed ? 'ข้อมูลทดสอบ (ThaiD จำลอง)' : 'ยืนยันแล้ว',thaidDemoUsed ? 'pub-c-warn' : 'pub-c-ok']
    ];
    rows.forEach(function(row){
      if(row[1]) summary.appendChild(summaryRow(row[0],row[1],row[2]));
    });
  }

  function openModal(id,focusId){
    var modal = $(id);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ var target = $(focusId); if(target) target.focus(); },0);
  }

  function closeModal(id,returnFocusId){
    $(id).classList.add('hidden');
    if($('termsModal').classList.contains('hidden') && $('statusModal').classList.contains('hidden')) document.body.style.overflow = '';
    var target = $(returnFocusId);
    if(target) target.focus();
  }

  function identityValue(identity,key){
    return String(identity[key] || identity[key.charAt(0).toLowerCase() + key.slice(1)] || '').trim();
  }

  function setBirthDateFromThaiD(raw){
    var digitsOnly = digits(raw);
    if(digitsOnly.length !== 8) return;
    var year = Number(digitsOnly.slice(0,4));
    var month = Number(digitsOnly.slice(4,6));
    var day = Number(digitsOnly.slice(6,8));
    if(year > 2400) year -= 543;
    var date = new Date(year,month - 1,day);
    if(date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return;
    $('birthDay').value = String(day).padStart(2,'0');
    $('birthMonth').value = String(month);
    $('birthYear').value = String(year + 543);
  }

  function applyThaiDIdentity(identity,isDemo){
    if(!identity || !identityValue(identity,'Pid')) return false;
    var pid = identityValue(identity,'Pid');
    var pidDigits = digits(pid);
    var firstName = identityValue(identity,'FirstNameTh');
    var lastName = identityValue(identity,'LastNameTh');
    if(pidDigits.length !== 13 || !firstName || !lastName) return false;

    thaidVerified = true;
    thaidDemoUsed = Boolean(isDemo);
    thaidVerifiedAt = new Date().toISOString();
    if(!thaidReference) thaidReference = thaidDemoUsed ? 'THAID-DEMO-' + Date.now() : 'THAID-VERIFIED-' + Date.now();
    $('nationalId').value = pidDigits;
    $('titleTh').value = identityValue(identity,'TitleTh');
    $('firstName').value = firstName;
    $('lastName').value = lastName;
    $('firstNameEn').value = identityValue(identity,'FirstNameEn');
    $('lastNameEn').value = identityValue(identity,'LastNameEn');
    setBirthDateFromThaiD(identityValue(identity,'Birthdate'));

    ['firstName','lastName'].forEach(function(id){ $(id).readOnly = true; });
    ['firstNameEn','lastNameEn','birthDay','birthYear'].forEach(function(id){ $(id).readOnly = Boolean(value(id)); });
    $('birthMonth').disabled = Boolean(value('birthMonth'));
    $('titleTh').disabled = Boolean(value('titleTh'));
    $('nationalId').readOnly = true;
    $('nationalIdSection').classList.add('hidden');
    $('registrationDetails').classList.remove('hidden');
    $('registrationDetails').setAttribute('aria-hidden','false');
    $('step1Next').disabled = false;
    $('thaidGateGuidance').classList.add('hidden');
    $('thaidRequiredError').classList.add('hidden');
    $('thaidPanel').classList.add('verified');
    $('thaidPanel').classList.remove('pub-thaid-required','pub-thaid-attention');
    $('thaidIcon').className = 'fa-solid fa-check';
    $('thaidName').className = 'pub-thaid-ok-name';
    $('thaidName').textContent = firstName + ' ' + lastName;
    $('thaidDescription').className = 'pub-thaid-ok-id';
    $('thaidDescription').innerHTML = '<i class="fa-solid fa-circle-check" style="color:#4ade80;margin-right:4px"></i>' + (thaidDemoUsed ? 'ข้อมูลทดสอบ · เลขบัตร ' : 'ยืนยันแล้ว · เลขบัตร ') + maskId(value('nationalId'));
    $('thaidState').innerHTML = '<i class="fa-solid fa-unlock-keyhole" aria-hidden="true"></i>ยืนยันสำเร็จ — เปิดแบบฟอร์มแล้ว';
    $('openTermsButton').classList.add('hidden');
    updateUsername();
    stopThaiDWaiting();
    if(!$('thaidQrModal').classList.contains('hidden')) closeModal('thaidQrModal','openTermsButton');
    $('liveRegion').textContent = thaidDemoUsed ? 'เติมข้อมูล ThaiD จำลองแล้ว' : 'ยืนยันตัวตน ThaiD สำเร็จ และแสดงข้อมูลที่ได้รับจาก ThaiD แล้ว';
    setTimeout(function(){
      var nextField = ['firstNameEn','lastNameEn','nickname','mobile','email'].map($).find(function(field){ return field && !field.readOnly && !field.disabled; });
      if(nextField) nextField.focus();
    },0);
    return true;
  }

  function applyThaiDDemoIdentity(){
    // Test-only identity for the hidden hit area beside the cancel button.
    applyThaiDIdentity({
      Pid:'1101700230700',
      TitleTh:'นาย',
      FirstNameTh:'สมชาย',
      LastNameTh:'ใจดี',
      FirstNameEn:'Somchai',
      LastNameEn:'Jaidee',
      Birthdate:'1990-05-15'
    },true);
    $('email').value = 'somchai.jaidee@gmail.com';
    $('officerType').value = '1';
    $('positionType').value = '3';
    updatePositionOptions();
    $('jobTitle').value = '11';
    updatePositionLevelOptions();
    $('positionLevel').value = '3';
    $('bureau').value = '250170004';
    updateDivisionOptions();
    $('division').value = '250170004-02';
    updateSubDivisionOptions();
    updatePositionRequiredState();
  }

  function showNotPaccOfficerNotice(){
    var message = 'คุณไม่ใช่เจ้าหน้าที่ ป.ป.ท.<br>หรือติดต่อ Admin หน่วยงานของท่าน';
    // Close the ThaiD QR dialog first, so the warning is never layered over it.
    stopThaiDWaiting();
    closeModal('thaidQrModal','openTermsButton');

    window.setTimeout(function(){
    if(window.Swal){
      window.Swal.fire({
        icon:'warning',
        title:'ไม่สามารถดำเนินการต่อได้',
        html:'<div style="line-height:1.7;color:#475569">' + message + '</div>',
        confirmButtonText:'รับทราบ',
        confirmButtonColor:'#1a3575'
      });
      return;
    }
    window.alert('คุณไม่ใช่เจ้าหน้าที่ ป.ป.ท.\nหรือติดต่อ Admin หน่วยงานของท่าน');
    },0);
  }

  function readStoredThaiDIdentity(){
    try{
      var raw = sessionStorage.getItem('thaid_identity');
      if(!raw) return null;
      sessionStorage.removeItem('thaid_identity');
      return JSON.parse(raw);
    }catch(error){
      console.warn('อ่านข้อมูล ThaiD ไม่สำเร็จ',error);
      return null;
    }
  }

  function stopThaiDWaiting(){
    if(thaidTimer){ clearInterval(thaidTimer); thaidTimer = null; }
    if(thaidPollTimer){ clearInterval(thaidPollTimer); thaidPollTimer = null; }
  }

  function renderThaiDQr(payload){
    var image = $('thaidQrImage');
    try{
      if(typeof window.qrcode !== 'function') throw new Error('ไม่พบ QR generator');
      var qr = window.qrcode(0,'M');
      qr.addData(payload);
      qr.make();
      image.src = qr.createDataURL(6,12);
      $('thaidQrNotice').textContent = 'เมื่อยืนยันสำเร็จ ระบบจะแสดงข้อมูลที่ได้รับจาก ThaiD ในแบบฟอร์มนี้โดยอัตโนมัติ';
    }catch(error){
      image.removeAttribute('src');
      $('thaidQrNotice').textContent = 'ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่';
      console.warn('สร้าง QR ThaiD ไม่สำเร็จ',error);
    }
  }

  function beginThaiDCountdown(seconds){
    stopThaiDWaiting();
    var remaining = seconds || 120;
    $('thaidQrExpired').classList.add('hidden');
    $('thaidQrCountdown').textContent = remaining;
    thaidTimer = setInterval(function(){
      remaining -= 1;
      $('thaidQrCountdown').textContent = Math.max(remaining,0);
      if(remaining <= 0){
        stopThaiDWaiting();
        $('thaidQrExpired').classList.remove('hidden');
        $('thaidQrWait').classList.add('hidden');
      }
    },1000);
  }

  async function startThaiDQrFlow(){
    closeModal('termsModal','openTermsButton');
    openModal('thaidQrModal','thaidQrCancel');
    $('thaidQrWait').classList.remove('hidden');
    thaidReference = 'THAID-REGISTER-' + Math.random().toString(36).slice(2,12).toUpperCase();
    renderThaiDQr(thaidReference);
    beginThaiDCountdown(120);

    // Production connector contract:
    // window.ECMISThaiD.startRegistration() -> { reference, qrData, expiresIn }
    // window.ECMISThaiD.getIdentity(reference) -> ThaiD identity or null
    var connector = window.ECMISThaiD;
    if(connector && typeof connector.startRegistration === 'function'){
      try{
        var session = await connector.startRegistration();
        if(session && session.reference) thaidReference = String(session.reference);
        if(session && session.qrData) renderThaiDQr(String(session.qrData));
        if(session && session.expiresIn) beginThaiDCountdown(Number(session.expiresIn));
      }catch(error){
        $('thaidQrNotice').textContent = 'ไม่สามารถเริ่มการเชื่อมต่อ ThaiD ได้ กรุณาลองใหม่';
        console.warn('เริ่ม ThaiD ไม่สำเร็จ',error);
      }
    }else{
      $('thaidQrNotice').textContent = 'QR นี้ใช้แสดง workflow บนหน้า static เท่านั้น การรับข้อมูลจริงต้องเชื่อม callback ThaiD ผ่าน backend ก่อนใช้งานจริง';
    }

    thaidPollTimer = setInterval(async function(){
      var identity = readStoredThaiDIdentity();
      if(identity && applyThaiDIdentity(identity)) return;
      if(connector && typeof connector.getIdentity === 'function' && thaidReference){
        try{
          var resolved = await connector.getIdentity(thaidReference);
          if(resolved) applyThaiDIdentity(resolved);
        }catch(error){ /* keep polling until QR expires */ }
      }
    },2000);
  }

  function buildRegistration(){
    return {
      trackingId:'REG-' + Math.random().toString(36).slice(2,10).toUpperCase(),
      username:value('username'),
      titleTh:value('titleTh'),
      firstName:value('firstName'),
      lastName:value('lastName'),
      nickname:value('nickname'),
      firstNameEn:value('firstNameEn'),
      lastNameEn:value('lastNameEn'),
      nationalIdMasked:maskId(value('nationalId')),
      birthDateText:formatBirthDate(),
      phoneInternal:value('phoneInternal'),
      phoneExtension:value('phoneExtension'),
      mobile:value('mobile'),
      mobileBackup:value('mobileBackup'),
      gmail:value('email'),
      officialEmail:value('emailBackup'),
      officerTypeId:Number(value('officerType')) || null,
      officerType:selectedText('officerType'),
      positionTypeId:Number(value('positionType')) || null,
      positionType:selectedText('positionType'),
      positionId:Number(value('jobTitle')) || null,
      positionCode:positionData() ? positionData().code : '',
      positionLineWork:positionData() ? positionData().lineWork : '',
      jobTitle:positionData() ? positionData().name : '',
      positionLevelId:Number(value('positionLevel')) || null,
      positionLevel:selectedText('positionLevel'),
      bureauCode:value('bureau'),
      bureau:selectedText('bureau'),
      segmentDepartmentCode:value('division'),
      segmentId:segmentDepartmentData() ? segmentDepartmentData().segmentId : null,
      division:selectedText('division'),
      subSegmentId:Number(value('subDivision')) || null,
      subDivision:selectedText('subDivision'),
      thaiDVerified:thaidVerified,
      thaiDMode:thaidDemoUsed ? 'demo' : 'verified',
      thaiDReference:thaidReference,
      thaiDVerifiedAt:thaidVerifiedAt,
      privacyConsent:$('privacyConsent').checked,
      status:'pending',
      submittedAt:new Date().toISOString()
    };
  }

  function submitRegistration(event){
    event.preventDefault();
    if(!validateStep1()){ showStep(1); return; }
    if(!validateStep2()){ showStep(2); return; }
    var button = $('submitRegistration');
    var errorBox = $('submitError');
    errorBox.classList.add('hidden');
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>กำลังส่งคำขอ...</span>';

    setTimeout(function(){
      try{
        var registrations = readRegistrations();
        latestRegistration = buildRegistration();
        registrations.push(latestRegistration);
        localStorage.setItem(STORAGE_KEY,JSON.stringify(registrations));
        $('successUsername').textContent = latestRegistration.username;
        showStep(4);
      }catch(error){
        console.error('บันทึกคำขอลงทะเบียนไม่สำเร็จ',error);
        errorBox.querySelector('span').textContent = 'ไม่สามารถส่งคำขอลงทะเบียนได้ กรุณาตรวจสอบการอนุญาตจัดเก็บข้อมูลของเบราว์เซอร์แล้วลองใหม่';
        errorBox.classList.remove('hidden');
        button.disabled = false;
        button.innerHTML = '<i class="fa-solid fa-paper-plane"></i><span>ส่งคำขอลงทะเบียน</span>';
      }
    },650);
  }

  function goToThaiDLogin(){
    if(!latestRegistration) return;
    window.location.href = './login.html?auth=thaid&registration=' + encodeURIComponent(latestRegistration.trackingId);
  }

  function toggleTheme(){
    var app = $('registrationApp');
    var isLight = app.classList.toggle('pub-light');
    var button = $('themeToggle');
    button.querySelector('i').className = 'fa-solid ' + (isLight ? 'fa-moon' : 'fa-sun');
    button.title = isLight ? 'เปลี่ยนเป็นธีมมืด' : 'เปลี่ยนเป็นธีมสว่าง';
    button.setAttribute('aria-label',button.title);
    try{ localStorage.setItem('ecmis-register-theme',isLight ? 'light' : 'dark'); }catch(error){}
  }

  function restoreTheme(){
    try{
      if(localStorage.getItem('ecmis-register-theme') === 'dark'){
        $('registrationApp').classList.remove('pub-light');
        $('themeToggle').querySelector('i').className = 'fa-solid fa-sun';
        $('themeToggle').title = 'เปลี่ยนเป็นธีมสว่าง';
        $('themeToggle').setAttribute('aria-label','เปลี่ยนเป็นธีมสว่าง');
      }
    }catch(error){}
  }

  ['nationalId','birthDay','birthYear','phoneExtension'].forEach(function(id){
    $(id).addEventListener('input',function(event){
      var max = Number(event.target.maxLength) || 20;
      event.target.value = digits(event.target.value).slice(0,max);
    });
  });
  $('nationalId').addEventListener('blur',function(){
    setError('nationalId','nationalIdError',digits(value('nationalId')).length === 13 ? '' : 'เลขบัตรประชาชนต้องมี 13 หลัก');
  });
  ['firstNameEn','lastNameEn'].forEach(function(id){ $(id).addEventListener('input',updateUsername); });
  ['birthDay','birthMonth','birthYear'].forEach(function(id){ $(id).addEventListener('change',function(){ validateBirthDate(false); }); });
  $('officerType').addEventListener('change',function(){
    updatePositionRequiredState();
    setError('officerType','officerTypeError','');
  });
  $('positionType').addEventListener('change',function(){
    updatePositionOptions();
    setError('positionType','positionTypeError','');
    setError('jobTitle','jobTitleError','');
    setError('positionLevel','positionLevelError','');
  });
  $('jobTitle').addEventListener('change',function(){
    updatePositionLevelOptions();
    setError('jobTitle','jobTitleError','');
    setError('positionLevel','positionLevelError','');
  });
  $('positionLevel').addEventListener('change',function(){ setError('positionLevel','positionLevelError',''); });
  $('bureau').addEventListener('change',function(){
    updateDivisionOptions();
    setError('bureau','bureauError','');
    setError('division','divisionError','');
    setError('subDivision','subDivisionError','');
  });
  $('division').addEventListener('change',function(){
    updateSubDivisionOptions();
    setError('division','divisionError','');
    setError('subDivision','subDivisionError','');
  });
  $('subDivision').addEventListener('change',function(){ setError('subDivision','subDivisionError',''); });

  $('step1Next').addEventListener('click',function(){ if(validateStep1()) showStep(2); });
  $('step2Back').addEventListener('click',function(){ clearStepErrors(2); showStep(1); });
  $('step2Next').addEventListener('click',function(){
    if(!thaidVerified){ showStep(1); validateStep1(); return; }
    if(validateStep2()){ renderSummary(); showStep(3); }
  });
  $('step3Back').addEventListener('click',function(){ showStep(2); });
  form.addEventListener('submit',submitRegistration);
  $('privacyConsent').addEventListener('change',function(){ $('privacyConsentLabel').textContent = this.checked ? 'เปิดใช้งาน' : 'ไม่เปิดใช้งาน'; });
  $('themeToggle').addEventListener('click',toggleTheme);

  $('openTermsButton').addEventListener('click',function(){ openModal('termsModal','termsBody'); });
  $('termsCancel').addEventListener('click',function(){ closeModal('termsModal','openTermsButton'); });
  $('termsCloseX').addEventListener('click',function(){ closeModal('termsModal','openTermsButton'); });
  $('termsAccept').addEventListener('click',startThaiDQrFlow);
  $('refreshThaiDQr').addEventListener('click',startThaiDQrFlow);
  $('thaidNotOfficerHit').addEventListener('click',showNotPaccOfficerNotice);
  $('thaidDemoFill').addEventListener('click',applyThaiDDemoIdentity);
  $('thaidQrCancel').addEventListener('click',function(){ stopThaiDWaiting(); closeModal('thaidQrModal','openTermsButton'); });
  $('thaidQrCloseX').addEventListener('click',function(){ stopThaiDWaiting(); closeModal('thaidQrModal','openTermsButton'); });
  $('checkStatusButton').addEventListener('click',goToThaiDLogin);
  $('statusClose').addEventListener('click',function(){ closeModal('statusModal','checkStatusButton'); });
  $('statusCloseX').addEventListener('click',function(){ closeModal('statusModal','checkStatusButton'); });

  ['termsModal','thaidQrModal','statusModal'].forEach(function(id){
    $(id).addEventListener('click',function(event){
      if(event.target !== this) return;
      if(id === 'thaidQrModal') stopThaiDWaiting();
      closeModal(id,id === 'statusModal' ? 'checkStatusButton' : 'openTermsButton');
    });
  });
  document.addEventListener('keydown',function(event){
    if(event.key !== 'Escape') return;
    if(!$('statusModal').classList.contains('hidden')) closeModal('statusModal','checkStatusButton');
    else if(!$('thaidQrModal').classList.contains('hidden')){ stopThaiDWaiting(); closeModal('thaidQrModal','openTermsButton'); }
    else if(!$('termsModal').classList.contains('hidden')) closeModal('termsModal','openTermsButton');
  });
  window.addEventListener('message',function(event){
    if(event.origin !== window.location.origin) return;
    var payload = event && event.data;
    if(payload && payload.type === 'ecmis-thaid-identity') applyThaiDIdentity(payload.identity);
  });

  initializeMasterDropdowns();
  restoreTheme();
  updateUsername();
  $('registrationDetails').classList.add('hidden');
  $('registrationDetails').setAttribute('aria-hidden','true');
  $('step1Next').disabled = true;
  var returningIdentity = readStoredThaiDIdentity();
  if(returningIdentity) applyThaiDIdentity(returningIdentity);
  showStep(1);
})();
