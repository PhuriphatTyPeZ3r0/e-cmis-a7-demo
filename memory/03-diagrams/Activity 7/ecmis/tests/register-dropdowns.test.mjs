import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../register.html', import.meta.url), 'utf8');
const masterCode = fs.readFileSync(new URL('../shared-assets/register-master-data.js', import.meta.url), 'utf8');
const registerCode = fs.readFileSync(new URL('../shared-assets/register.js', import.meta.url), 'utf8');

assert.ok(
  html.indexOf('./shared-assets/register-master-data.js') < html.indexOf('./shared-assets/register.js'),
  'หน้า register ต้องโหลด master data ก่อน logic ของแบบฟอร์ม'
);
for (const id of ['officerType','positionType','jobTitle','positionLevel','bureau','division','subDivision']) {
  assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `ต้องมี #${id} เพียงจุดเดียว`);
}
assert.match(html, /เจ้าหน้าที่ทุกท่านต้องยืนยันตัวตนด้วย ThaiD ก่อนกรอกข้อมูลลงทะเบียน/);
assert.doesNotMatch(html, /ตัวเลือกเสริม: ใช้ ThaiD/);

class FakeClassList {
  constructor(classNames = '') { this.values = new Set(classNames.split(/\s+/).filter(Boolean)); }
  add(...names) { names.forEach((name) => this.values.add(name)); }
  remove(...names) { names.forEach((name) => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const next = force === undefined ? !this.values.has(name) : Boolean(force);
    if (next) this.values.add(name); else this.values.delete(name);
    return next;
  }
}

class FakeElement {
  constructor(id = '', classNames = '') {
    this.id = id;
    this._value = '';
    this.textContent = '';
    this.innerHTML = '';
    this.disabled = false;
    this.checked = false;
    this.options = [];
    this.selectedIndex = 0;
    this.dataset = {};
    this.style = {};
    this.classList = new FakeClassList(classNames);
    this.listeners = new Map();
    this.attributes = new Map();
  }
  get value() { return this._value; }
  set value(nextValue) {
    this._value = String(nextValue ?? '');
    if (this.options.length) {
      const optionIndex = this.options.findIndex((option) => option.value === this._value);
      this.selectedIndex = optionIndex >= 0 ? optionIndex : 0;
    }
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  dispatch(type) {
    const listener = this.listeners.get(type);
    if (listener) listener.call(this, { target: this, preventDefault() {} });
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  replaceChildren(...children) { this.options = [...children]; this._value = ''; this.selectedIndex = 0; }
  appendChild(child) { this.options.push(child); return child; }
  querySelector() { return new FakeElement(); }
  querySelectorAll() { return []; }
  focus() {}
  scrollIntoView() {}
  removeAttributeNode() {}
}

const elements = new Map();
for (const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
  const tag = match[0];
  const classMatch = tag.match(/\bclass="([^"]*)"/);
  elements.set(match[1], new FakeElement(match[1], classMatch ? classMatch[1] : ''));
}

const stepPanels = [1, 2, 3, 4].map((step) => {
  const panel = new FakeElement();
  panel.dataset.stepPanel = String(step);
  return panel;
});
const selectorElements = new Map();
function selectorElement(selector) {
  if (!selectorElements.has(selector)) selectorElements.set(selector, new FakeElement());
  return selectorElements.get(selector);
}

const document = {
  body: { style: {} },
  getElementById(id) { return elements.get(id) || null; },
  createElement() { return new FakeElement(); },
  querySelectorAll(selector) {
    if (selector === '[data-step-panel]') return stepPanels;
    return [];
  },
  querySelector(selector) { return selectorElement(selector); },
  addEventListener() {}
};

const storage = () => ({
  values: new Map(),
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; },
  setItem(key, value) { this.values.set(key, String(value)); },
  removeItem(key) { this.values.delete(key); }
});

const window = {
  addEventListener() {},
  scrollTo() {},
  location: { origin: 'http://127.0.0.1:8899', href: '' },
  alert() {}
};
const localStore = storage();
const sessionStore = storage();

const context = vm.createContext({
  window,
  document,
  localStorage: localStore,
  sessionStorage: sessionStore,
  location: window.location,
  console,
  URLSearchParams,
  Date,
  Math,
  Set,
  Number,
  String,
  Boolean,
  JSON,
  setTimeout(callback) { callback(); return 0; },
  clearTimeout() {},
  setInterval() { return 0; },
  clearInterval() {}
});

vm.runInContext(masterCode, context, { filename: 'register-master-data.js' });
vm.runInContext(registerCode, context, { filename: 'register.js' });

const field = (id) => elements.get(id);

assert.equal(field('officerType').options.length, 4, 'ประเภทเจ้าหน้าที่ต้องมี 3 รายการและ placeholder');
assert.equal(field('positionType').options.length, 5, 'ประเภทสายงานต้องมี 4 รายการและ placeholder');
assert.equal(field('bureau').options.length, 31, 'หน่วยงานหลักต้องมี 30 รายการและ placeholder');
assert.equal(field('jobTitle').disabled, true, 'ตำแหน่งต้องปิดไว้ก่อนเลือกประเภทสายงาน');
assert.equal(field('registrationDetails').classList.contains('hidden'), true, 'ต้องซ่อนแบบฟอร์มไว้ก่อนยืนยัน ThaiD');
assert.equal(field('step1Next').disabled, true, 'ต้องปิดปุ่มถัดไปไว้ก่อนยืนยัน ThaiD');

field('registrationForm').dispatch('submit');
assert.equal(localStore.getItem('ecmis-registration-requests'), null, 'ห้ามบันทึกคำขอเมื่อยังไม่ยืนยัน ThaiD');
assert.equal(field('thaidRequiredError').classList.contains('hidden'), false, 'ต้องแจ้งให้ยืนยัน ThaiD เมื่อพยายามข้ามขั้นตอน');

field('thaidDemoFill').dispatch('click');
assert.equal(field('registrationDetails').classList.contains('hidden'), false, 'ต้องเปิดแบบฟอร์มหลังยืนยัน ThaiD สำเร็จ');
assert.equal(field('step1Next').disabled, false, 'ต้องเปิดปุ่มถัดไปหลังยืนยัน ThaiD สำเร็จ');

field('officerType').value = '1';
field('officerType').dispatch('change');
assert.equal(field('positionType').attributes.get('aria-required'), 'true');

field('positionType').value = '3';
field('positionType').dispatch('change');
assert.equal(field('jobTitle').disabled, false);
assert.equal(field('jobTitle').options.length, 153, 'สายวิชาการต้องมี 152 ตำแหน่งและ placeholder');

field('jobTitle').value = '11';
field('jobTitle').dispatch('change');
assert.equal(field('positionLevel').disabled, false);
assert.equal(field('positionLevel').options.length, 6, 'ตำแหน่งวิชาการต้องมีระดับที่เลือกได้ 5 ระดับและ placeholder');
field('positionLevel').value = '3';
field('positionLevel').dispatch('change');

field('bureau').value = '250170004';
field('bureau').dispatch('change');
assert.equal(field('division').disabled, false);
assert.equal(field('division').options.length, 5, 'กองบริหารคดีต้องมีหน่วยระดับรอง 4 รายการและ placeholder');

field('division').value = '250170004-02';
field('division').dispatch('change');
assert.equal(field('subDivision').disabled, true, 'ศูนย์รับเรื่องร้องเรียนไม่มีหน่วยย่อยใน SQL');

field('bureau').value = '250170001';
field('bureau').dispatch('change');
field('division').value = '250170001-02';
field('division').dispatch('change');
assert.equal(field('subDivision').disabled, false);
assert.equal(field('subDivision').options.length, 4, 'กลุ่มงานคลังและพัสดุต้องมีหน่วยย่อย 3 รายการและ placeholder');
field('step2Next').dispatch('click');
assert.equal(field('subDivision').attributes.get('aria-invalid'), 'true', 'ต้องบังคับเลือกหน่วยย่อยเมื่อมีรายการลูก');

field('subDivision').value = '5';
field('subDivision').dispatch('change');
field('step2Next').dispatch('click');
assert.equal(stepPanels[2].classList.contains('hidden'), false, 'ข้อมูลครบต้องไป Step 3 ได้');

field('bureau').value = '250170023';
field('bureau').dispatch('change');
assert.equal(field('division').disabled, true, 'กลุ่มตรวจสอบภายในไม่มีหน่วยระดับรองใน SQL');

field('bureau').value = '250170004';
field('bureau').dispatch('change');
field('division').value = '250170004-02';
field('division').dispatch('change');

field('nationalId').value = '1101700230700';
field('firstNameEn').value = 'Somchai';
field('lastNameEn').value = 'Jaidee';
field('username').value = 'somchai.j';
field('titleTh').value = 'นาย';
field('firstName').value = 'สมชาย';
field('lastName').value = 'ใจดี';
field('mobile').value = '0812345678';
field('email').value = 'somchai.jaidee@gmail.com';
field('registrationForm').dispatch('submit');

const storedRequests = JSON.parse(localStore.getItem('ecmis-registration-requests'));
assert.equal(storedRequests.length, 1);
assert.equal(storedRequests[0].thaiDVerified, true, 'คำขอที่บันทึกต้องยืนยัน ThaiD แล้ว');
assert.equal(storedRequests[0].thaiDMode, 'demo', 'ชุดทดสอบต้องระบุชัดว่าเป็น ThaiD จำลอง');
assert.ok(storedRequests[0].thaiDReference, 'ต้องบันทึกเลขอ้างอิงการยืนยัน ThaiD');
assert.ok(storedRequests[0].thaiDVerifiedAt, 'ต้องบันทึกเวลาที่ยืนยัน ThaiD สำเร็จ');
assert.deepEqual(
  {
    officerTypeId: storedRequests[0].officerTypeId,
    officerType: storedRequests[0].officerType,
    positionTypeId: storedRequests[0].positionTypeId,
    positionId: storedRequests[0].positionId,
    positionLevelId: storedRequests[0].positionLevelId,
    bureauCode: storedRequests[0].bureauCode,
    bureau: storedRequests[0].bureau,
    segmentDepartmentCode: storedRequests[0].segmentDepartmentCode,
    division: storedRequests[0].division,
    subSegmentId: storedRequests[0].subSegmentId
  },
  {
    officerTypeId: 1,
    officerType: 'ข้าราชการ',
    positionTypeId: 3,
    positionId: 11,
    positionLevelId: 3,
    bureauCode: '250170004',
    bureau: 'กองบริหารคดี',
    segmentDepartmentCode: '250170004-02',
    division: 'ศูนย์รับเรื่องร้องเรียน',
    subSegmentId: null
  },
  'ข้อมูลที่บันทึกต้องมีทั้งรหัสอ้างอิงและชื่อแสดงผล'
);

console.log('register dropdown assertions passed');
