(function initializeActivity5Rules(root) {
  const RULE_STATUSES = Object.freeze({
    CONFIRMED: "CONFIRMED",
    PENDING_CONFIRMATION: "PENDING_CONFIRMATION"
  });

  const confirmed = (id, label, value) => Object.freeze({
    id,
    label,
    status: RULE_STATUSES.CONFIRMED,
    blocking: false,
    value
  });

  const pending = (id, label) => Object.freeze({
    id,
    label,
    status: RULE_STATUSES.PENDING_CONFIRMATION,
    blocking: true,
    value: null
  });

  const A5_RULES = Object.freeze({
    "intake-assignment-sequence": confirmed("intake-assignment-sequence", "ลำดับตรวจรับและมอบหมาย 6 ขั้น", 6),
    "plan-lifecycle": confirmed("plan-lifecycle", "วงจรร่าง เสนอ อนุมัติ และส่งกลับแผนคดี", true),
    "extension-213-normal-rounds": confirmed("extension-213-normal-rounds", "จำนวนรอบขยายปกติของ 213", 2),
    "extension-644-normal-rounds": confirmed("extension-644-normal-rounds", "จำนวนรอบขยายปกติของ 644", 4),
    "extension-request-max-days": confirmed("extension-request-max-days", "จำนวนวันที่ขอขยายต่อรอบสูงสุดใน Mock up", 60),
    "extension-approved-day-options": confirmed("extension-approved-day-options", "ตัวเลือกจำนวนวันที่อนุมัติขยาย", Object.freeze([15, 30, 60])),
    "extension-requested-approved-separate": confirmed("extension-requested-approved-separate", "เก็บจำนวนวันที่ขอและวันที่อนุมัติแยกกัน", true),
    "deadline-warning-thresholds": confirmed("deadline-warning-thresholds", "เตือนวันที่ 45 และเมื่อเหลือไม่เกิน 15 วัน", Object.freeze({ elapsedDay: 45, remainingDays: 15 })),
    "investigation-213-initial-days": confirmed("investigation-213-initial-days", "กรอบไต่สวนเบื้องต้น 213 เริ่มต้น", 60),
    "plan-deadline-offset-days": confirmed("plan-deadline-offset-days", "กำหนดจัดทำแผนหลังรับมอบ", 2),
    "received-date-recorded-channel": confirmed("received-date-recorded-channel", "บันทึกวันรับตามข้อมูลช่องทางต้นทาง", true),
    "physical-custody-statuses": confirmed("physical-custody-statuses", "สถานะการครอบครองต้นฉบับและ EMS", Object.freeze(["AT_SOURCE", "IN_TRANSIT", "RECEIVED_AT_DESTINATION", "RETURNED", "NOT_APPLICABLE"])),
    "extension-after-normal-rounds": pending("extension-after-normal-rounds", "ขั้นตอนหลังใช้รอบขยายปกติครบ"),
    "extension-644-deadline-basis": pending("extension-644-deadline-basis", "กรอบ 644 และเหตุเริ่มนับ"),
    "extension-authority-chain": pending("extension-authority-chain", "ผู้มีอำนาจอนุมัติขยายแต่ละรอบ"),
    "panel-change-authority": pending("panel-change-authority", "ผู้มีอำนาจอนุมัติการปรับองค์คณะ"),
    "nacc-report-task-owner": pending("nacc-report-task-owner", "เจ้าของงานรายงาน ป.ป.ช. ทุก 15 วัน"),
    "public-status-wording": pending("public-status-wording", "ข้อความสถานะสำหรับผู้ร้อง"),
    "xl-case-route": pending("xl-case-route", "เกณฑ์และเส้นทางคดีขนาด XL"),
    "received-date-outside-office-hours": pending("received-date-outside-office-hours", "วันรับนอกเวลาราชการและวันหยุด"),
    "split-case-numbering": pending("split-case-numbering", "วิธีออกเลขสำนวนแยก"),
    "split-case-board-approval": pending("split-case-board-approval", "กรณีแยกสำนวนที่ต้องเสนอคณะกรรมการเห็นชอบ"),
    "document-actor-catalog": pending("document-actor-catalog", "บัญชีเอกสารและผู้ดำเนินการฉบับสุดท้าย"),
    "plan-deadline-day-kind": pending("plan-deadline-day-kind", "กำหนดแผน 2 วันเป็นวันปฏิทินหรือวันทำการ"),
    "late-report-downstream": pending("late-report-downstream", "งานต่อหลังคณะกรรมการรับทราบรายงานเหตุล่าช้า"),
    "prosecutor-order-add-accused-mechanism": pending("prosecutor-order-add-accused-mechanism", "กลไกเพิ่มผู้ถูกกล่าวหาเมื่ออัยการสั่งให้เพิ่ม"),
    "prosecutor-order-additional-notice-mechanism": pending("prosecutor-order-additional-notice-mechanism", "กลไกแจ้งข้อกล่าวหาเพิ่มเติมเมื่ออัยการสั่ง"),
    "prosecutor-order-split-case-mechanism": pending("prosecutor-order-split-case-mechanism", "กลไกแยกสำนวนเมื่ออัยการสั่งให้แยก"),
    "prosecutor-order-additional-inquiry-mechanism": pending("prosecutor-order-additional-inquiry-mechanism", "กลไกไต่สวนข้อเท็จจริงเพิ่มเติมเมื่ออัยการสั่งให้ไต่สวนเพิ่ม")
  });

  function getA5Rule(ruleId) {
    return A5_RULES[String(ruleId || "")] || null;
  }

  const api = Object.freeze({ RULE_STATUSES, A5_RULES, getA5Rule });
  root.ECMISActivity5Rules = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis === "undefined" ? window : globalThis);
