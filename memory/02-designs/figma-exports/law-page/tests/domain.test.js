const { test } = require('node:test');
const assert = require('node:assert/strict');
const D = require('../wwwroot/domain.js');

// สำนวนตัวอย่าง: ชั้นต้นชนะแล้ว (มีเลขแดง) → ผู้ฟ้องอุทธรณ์ → สูงสุดยังพิจารณา (ไม่มีเลขแดง)
const splitCase = {
    id: 'AC-2568-029',
    workStatus: 'อยู่ระหว่างกลุ่มงานคดี',
    plaintiff: 'นายบุญส่ง ฯ',
    defendant: 'สำนักงาน ป.ป.ท.',
    sourceCase: 'ปปท.43/65',
    responsible: 'นายปิติคุณ อู่ตะเภา',
    courtCases: [
        { level: 'ชั้นต้น', court: 'ศาลปกครองเชียงใหม่', blackNo: 'บ 29/2568', redNo: 'บ 88/68', result: 'ชนะคดี' },
        { level: 'สูงสุด', court: 'ศาลปกครองสูงสุด', blackNo: 'อ 12/2569', redNo: null, result: null }
    ],
    history: [
        { ts: '2025-01-08', event: 'received' },
        { ts: '2025-01-12', event: 'assigned' },
        { ts: '2025-01-25', event: 'in_progress' },
        { ts: '2026-03-14', event: 'result' }
    ]
};

const pendingCase = {
    id: 'AC-2569-044',
    workStatus: 'เสนอบอร์ดมอบอำนาจ',
    plaintiff: 'นายก้องภพ ฯ',
    defendant: 'สำนักงาน ป.ป.ท.',
    sourceCase: 'ปปท.87/67',
    responsible: 'นางสาว อรวรรณ ทูลมณี',
    courtCases: [
        { level: 'ชั้นต้น', court: 'ศาลปกครองกลาง', blackNo: 'บ 44/2569', redNo: null, result: null }
    ],
    history: [
        { ts: '2026-01-08', event: 'received' },
        { ts: '2026-01-16', event: 'assigned' }
    ]
};

test('เลขไทย: แปลงไป-กลับได้ค่าเดิม และไม่แตะตัวอักษร', () => {
    assert.equal(D.toThaiDigits('ปปท. 115/2569'), 'ปปท. ๑๑๕/๒๕๖๙');
    assert.equal(D.toArabicDigits('ปปท. ๑๑๕/๒๕๖๙'), 'ปปท. 115/2569');
    assert.equal(D.toArabicDigits(D.toThaiDigits('บ 29/2568')), 'บ 29/2568');
    assert.equal(D.toThaiDigits('—'), '—');
    assert.equal(D.toThaiDigits(null), '');
});

test('ไม่มีเลขแดง = ยังพิจารณาอยู่ (ไม่ต้องมีฟิลด์สถานะแยก)', () => {
    const [first, appeal] = splitCase.courtCases;
    assert.equal(D.isPending(first), false);
    assert.equal(D.isPending(appeal), true);
    assert.equal(D.pendingCourtCases(splitCase).length, 1);
    assert.equal(D.decidedCourtCases(splitCase).length, 1);
});

test('caseResult คืนผลของคดีที่ "ตัดสินแล้ว" ล่าสุด ไม่ใช่ของใบล่าสุด', () => {
    // ใบล่าสุดคือชั้นสูงสุดซึ่งยังไม่ตัดสิน — ต้องไม่คืน null/undefined
    assert.equal(D.caseResult(splitCase), 'ชนะคดี');
    assert.equal(D.caseResult(pendingCase), D.EMPTY);
});

test('caseCourt / caseLevel อ้างอิงคดีศาลใบล่าสุด', () => {
    assert.equal(D.caseCourt(splitCase), 'ศาลปกครองสูงสุด');
    assert.equal(D.caseLevel(splitCase), 'สูงสุด');
    assert.equal(D.courtCaseCount(splitCase), 2);
});

test('คดีถึงที่สุดมาจาก workStatus ไม่ใช่จากการมีเลขแดง', () => {
    assert.equal(D.isCaseFinal(splitCase), false); // ชั้นต้นมีเลขแดงแล้ว แต่ยังอุทธรณ์อยู่
    assert.equal(D.isCaseFinal({ workStatus: 'คดีถึงที่สุด' }), true);
});

test('workStep: สถานะที่ไม่รู้จักต้องไม่ทำให้ stepper พัง', () => {
    assert.equal(D.workStep(splitCase), 4);
    assert.equal(D.workStep({ workStatus: 'สถานะที่ไม่มีอยู่จริง' }), 1);
    assert.equal(D.workStep({}), 1);
    assert.equal(D.workStep(null), 1);
});

test('stageDurations คำนวณจาก history จริง (เดิม hardcode t1=4,t2=13,t3=182)', () => {
    const s = D.stageDurations([splitCase]);
    assert.equal(s.t1, 4);    // 8 ม.ค. → 12 ม.ค.
    assert.equal(s.t2, 13);   // 12 ม.ค. → 25 ม.ค.
    assert.equal(s.t3, 413);  // 25 ม.ค. 2568 → 14 มี.ค. 2569
    assert.equal(s.total, 430);
});

test('stageDurations: คดีที่ยังไม่มีผล ต้องไม่ถูกนับเป็น 0 วัน', () => {
    const s = D.stageDurations([splitCase, pendingCase]);
    assert.equal(s.t1, 6);      // avg(4, 8)
    assert.equal(s.t2, 13);     // pendingCase ไม่มี in_progress → ถูกข้าม ไม่ใช่ 0
    assert.equal(s.t3, 413);
});

test('stageDurations: ไม่มีข้อมูลเลย ต้องคืน null ไม่ใช่ 0 หรือ NaN', () => {
    const s = D.stageDurations([]);
    assert.equal(s.t1, null);
    assert.equal(s.total, null);
    assert.equal(Number.isNaN(s.t1), false);
});

test('winLossByLevel นับ "คดีศาล" ไม่ใช่ "สำนวน"', () => {
    const stats = D.winLossByLevel([splitCase, pendingCase]);
    // ชั้นต้น: splitCase(ชนะ) + pendingCase(ยังไม่ตัดสิน) = 2 ใบ
    assert.deepEqual(stats['ชั้นต้น'], { total: 2, win: 1, lose: 0, dismiss: 0, pending: 1, decided: 1 });
    // สูงสุด: อุทธรณ์ของ splitCase 1 ใบ ยังไม่ตัดสิน
    assert.deepEqual(stats['สูงสุด'], { total: 1, win: 0, lose: 0, dismiss: 0, pending: 1, decided: 0 });
});

test('ค้นหา: เจอเลขคดีของทุกชั้นศาล และรับทั้งเลขไทย/อารบิก', () => {
    assert.equal(D.matchesSearch(splitCase, 'บ 29/2568'), true);   // เลขดำชั้นต้น
    assert.equal(D.matchesSearch(splitCase, 'อ 12/2569'), true);   // เลขดำชั้นสูงสุด (ไม่ใช่ใบแรก)
    assert.equal(D.matchesSearch(splitCase, 'บ ๘๘/๖๘'), true);     // เลขแดง พิมพ์เป็นเลขไทย
    assert.equal(D.matchesSearch(splitCase, 'ปปท.43/65'), true);   // เลขสำนวนต้นเรื่อง
    assert.equal(D.matchesSearch(splitCase, 'ไม่มีอยู่จริง'), false);
    assert.equal(D.matchesSearch(splitCase, ''), true);
});

test('filter ตามศาล/ชั้น ต้องดูทุกใบ ไม่ใช่แค่ใบล่าสุด', () => {
    // ใบล่าสุดคือศาลปกครองสูงสุด แต่ต้องยังหาเจอด้วยศาลชั้นต้นเดิม
    assert.equal(D.matchesCourt(splitCase, 'ศาลปกครองเชียงใหม่'), true);
    assert.equal(D.matchesCourt(splitCase, 'ศาลปกครองสูงสุด'), true);
    assert.equal(D.matchesCourt(splitCase, 'ศาลปกครองขอนแก่น'), false);
    assert.equal(D.matchesLevel(splitCase, 'ชั้นต้น'), true);
    assert.equal(D.matchesLevel(splitCase, 'สูงสุด'), true);
});

test('filter ผลคดี: "ระหว่างพิจารณา" ต้องจับคดีที่ยังไม่มีผล (เดิมไม่เคยตรงเลย)', () => {
    assert.equal(D.matchesResult(pendingCase, 'ระหว่างพิจารณา'), true);
    assert.equal(D.matchesResult(splitCase, 'ระหว่างพิจารณา'), false);
    assert.equal(D.matchesResult(splitCase, 'ชนะคดี'), true);
    assert.equal(D.matchesResult(splitCase, 'แพ้คดี'), false);
    assert.equal(D.matchesResult(splitCase, ''), true);
});

test('ฟังก์ชันทุกตัวต้องทนข้อมูลพัง (สำนวนไม่มี courtCases)', () => {
    const broken = { id: 'X' };
    assert.equal(D.courtCaseCount(broken), 0);
    assert.equal(D.latestCourtCase(broken), null);
    assert.equal(D.caseResult(broken), D.EMPTY);
    assert.equal(D.caseCourt(broken), D.EMPTY);
    assert.equal(D.matchesSearch(broken, 'อะไรก็ตาม'), false);
});
