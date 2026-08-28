/*
 * E-CMIS — domain logic (pure functions, no DOM).
 *
 * โหลดก่อน app.js ในเบราว์เซอร์ (window.EcmisDomain) และ require() ได้จาก node --test
 * เหตุผลที่แยกไฟล์: บั๊กที่อันตรายที่สุดในระบบนี้ล้วน "พังเงียบ" — เรียงผิด, สถิติ
 * hardcode, แถวหายจาก filter — ไม่มีอันไหน throw ฟังก์ชันบริสุทธิ์เท่านั้นที่เทสต์จับได้
 */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.EcmisDomain = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const EMPTY = '—';
    const THAI = '๐๑๒๓๔๕๖๗๘๙';

    // เลขอ้างอิงทางการแสดงเป็นเลขไทย แต่เก็บเป็นอารบิกเสมอ (เป็น primary key)
    function toThaiDigits(v) {
        if (v === null || v === undefined) return '';
        return String(v).replace(/[0-9]/g, d => THAI[Number(d)]);
    }
    function toArabicDigits(v) {
        if (v === null || v === undefined) return '';
        return String(v).replace(/[๐-๙]/g, d => String(THAI.indexOf(d)));
    }

    /*
     * TOR 10.3.3 ระบุสถานะงานไว้ 3 แบบ (ลำดับ 3–5 ด้านล่าง)
     * เพิ่ม 'รับหมายเรียก' + 'มอบหมายนิติกร' เพราะ TOR 10.3.5 สั่งให้รายงาน
     * ระยะเวลาช่วง "รับเรื่อง → มอบหมาย" ซึ่งคำนวณไม่ได้ถ้าไม่บันทึกสองขั้นนี้
     */
    const WORK_STATUSES = [
        { key: 'รับหมายเรียก',          step: 1, event: 'received' },
        { key: 'มอบหมายนิติกร',         step: 2, event: 'assigned' },
        { key: 'เสนอบอร์ดมอบอำนาจ',     step: 3, event: 'board_authorise' },
        { key: 'อยู่ระหว่างกลุ่มงานคดี', step: 4, event: 'in_progress' },
        { key: 'ส่งสำนวนให้อัยการ',      step: 5, event: 'sent_prosecutor' },
        { key: 'คดีถึงที่สุด',           step: 6, event: 'final' }
    ];
    const COURT_LEVELS = ['ชั้นต้น', 'สูงสุด'];
    const RESULTS = ['ชนะคดี', 'แพ้คดี', 'จำหน่ายคดี'];

    function workStatusMeta(key) { return WORK_STATUSES.find(s => s.key === key) || null; }
    function workStep(c) { const m = workStatusMeta(c && c.workStatus); return m ? m.step : 1; }

    function courtCases(c) { return (c && Array.isArray(c.courtCases)) ? c.courtCases : []; }
    function latestCourtCase(c) { const l = courtCases(c); return l.length ? l[l.length - 1] : null; }
    function decidedCourtCases(c) { return courtCases(c).filter(cc => !!cc.redNo); }
    function pendingCourtCases(c) { return courtCases(c).filter(cc => !cc.redNo); }
    function courtCaseCount(c) { return courtCases(c).length; }

    // กฎ domain: เลขคดีแดงออกโดยคำพิพากษา ⇒ ไม่มีเลขแดง = ศาลยังพิจารณาอยู่
    // จึงไม่ต้องมีฟิลด์สถานะแยก และไม่มีทาง desync
    function isPending(cc) { return !cc || !cc.redNo; }

    function caseResult(c) {
        const decided = decidedCourtCases(c);
        if (!decided.length) return EMPTY;
        return decided[decided.length - 1].result || EMPTY;
    }
    function caseCourt(c) { const l = latestCourtCase(c); return l ? l.court : EMPTY; }
    function caseLevel(c) { const l = latestCourtCase(c); return l ? l.level : EMPTY; }
    function isCaseFinal(c) { return !!c && c.workStatus === 'คดีถึงที่สุด'; }

    function daysBetween(a, b) {
        if (!a || !b) return null;
        const d1 = new Date(a), d2 = new Date(b);
        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
        return Math.round((d2 - d1) / 86400000);
    }

    function eventTs(c, event) {
        const h = (c && Array.isArray(c.history)) ? c.history : [];
        const hit = h.find(e => e.event === event);
        return hit ? hit.ts : null;
    }

    function average(nums) {
        const v = nums.filter(n => typeof n === 'number' && isFinite(n));
        if (!v.length) return null;
        return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
    }

    // TOR 10.3.5 — ระยะเวลาเฉลี่ยแต่ละขั้นตอน คำนวณจาก history[] จริง
    // (เดิมเป็นค่าคงที่ t1=4, t2=13, t3=182 เขียนตายไว้ในโค้ด)
    function stageDurations(cases) {
        const list = Array.isArray(cases) ? cases : [];
        const t1 = average(list.map(c => daysBetween(eventTs(c, 'received'), eventTs(c, 'assigned'))));
        const t2 = average(list.map(c => daysBetween(eventTs(c, 'assigned'), eventTs(c, 'in_progress'))));
        const t3 = average(list.map(c => daysBetween(eventTs(c, 'in_progress'), eventTs(c, 'result'))));
        const total = [t1, t2, t3].every(n => n !== null) ? t1 + t2 + t3 : null;
        return { t1, t2, t3, total };
    }

    // TOR 10.3.5 — ผลแพ้/ชนะแยกตามชั้นศาล
    // นับจาก "คดีศาล" ไม่ใช่ "สำนวน" เพราะ 1 สำนวนแตกเป็นหลายคดีได้
    function winLossByLevel(cases) {
        const out = {};
        COURT_LEVELS.forEach(lv => { out[lv] = { total: 0, win: 0, lose: 0, dismiss: 0, pending: 0, decided: 0 }; });
        (Array.isArray(cases) ? cases : []).forEach(c => {
            courtCases(c).forEach(cc => {
                const b = out[cc.level];
                if (!b) return;
                b.total++;
                if (isPending(cc)) { b.pending++; return; }
                b.decided++;
                if (cc.result === 'ชนะคดี') b.win++;
                else if (cc.result === 'แพ้คดี') b.lose++;
                else if (cc.result === 'จำหน่ายคดี') b.dismiss++;
            });
        });
        return out;
    }

    // ค้นได้ทั้งเลขไทยและอารบิก และค้นเจอเลขคดีของ "ทุกชั้นศาล" ไม่ใช่แค่ใบล่าสุด
    function matchesSearch(c, term) {
        if (!term) return true;
        const t = toArabicDigits(term).toLowerCase().trim();
        if (!t) return true;
        const hay = [c.plaintiff, c.defendant, c.sourceCase, c.responsible]
            .concat(courtCases(c).reduce((acc, cc) => acc.concat([cc.blackNo, cc.redNo]), []))
            .filter(Boolean)
            .map(s => String(s).toLowerCase());
        return hay.some(s => s.includes(t));
    }

    function matchesCourt(c, court) { return !court || courtCases(c).some(cc => cc.court === court); }
    function matchesLevel(c, level) { return !level || courtCases(c).some(cc => cc.level === level); }
    function matchesResult(c, result) {
        if (!result) return true;
        if (RESULTS.indexOf(result) !== -1) return caseResult(c) === result;
        return caseResult(c) === EMPTY; // 'ระหว่างพิจารณา'
    }

    return {
        EMPTY, WORK_STATUSES, COURT_LEVELS, RESULTS,
        toThaiDigits, toArabicDigits,
        workStatusMeta, workStep,
        courtCases, latestCourtCase, decidedCourtCases, pendingCourtCases, courtCaseCount,
        isPending, caseResult, caseCourt, caseLevel, isCaseFinal,
        daysBetween, eventTs, average, stageDurations, winLossByLevel,
        matchesSearch, matchesCourt, matchesLevel, matchesResult
    };
});
