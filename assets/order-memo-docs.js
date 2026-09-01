/* AUTO-GENERATED bundle — enriched with structured form groups
   Loaded by order.html + res/order.html. */
window.ECMIS = window.ECMIS || {};
window.ECMIS.OrderMemoDocs = window.ECMIS.OrderMemoDocs || {};
window.ECMIS.OrderMemoDocOrder = ["notify_zone","transmit_kbc","timebar_report","notify_discipline","submit_inquiry","ruling_report","timebar_secgen"];

window.ECMIS.OrderMemoDocs["notify_zone"] = {
  "id": "notify_zone",
  "label": "แจ้งเขต",
  "runningTitle": "บันทึกแจ้งรายงานการไต่สวนและวินิจฉัยชี้มูล",
  "docxTemplate": "assets/templates/memo-7x-notify-zone.docx",
  "fields": [
    {
      "id": "doc_ref_no",
      "label": "เลขที่หนังสือ (ปป 0004/)",
      "type": "text",
      "hint": "กรอกเฉพาะเลขที่ท้ายเครื่องหมาย /",
      "placeholder": "เลขที่หนังสือ (ปป 0004/)"
    },
    {
      "id": "doc_date",
      "label": "วันที่หนังสือ",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "case_no",
      "label": "เรื่องที่ (เลขสำนวน)",
      "type": "text",
      "hint": "เช่น 111674/2560",
      "placeholder": "เรื่องที่ (เลขสำนวน)"
    },
    {
      "id": "recipient_region",
      "label": "เรียน ผอ. ปปท. เขต",
      "type": "text",
      "hint": "เลขเขต",
      "placeholder": "เรียน ผอ. ปปท. เขต"
    },
    {
      "id": "case_owner_name",
      "label": "ชื่อเจ้าของสำนวน (พนักงาน ป.ป.ท.)",
      "type": "text",
      "hint": "",
      "placeholder": "ชื่อเจ้าของสำนวน (พนักงาน ป.ป.ท.)"
    },
    {
      "id": "meeting_no",
      "label": "ครั้งที่ประชุม",
      "type": "text",
      "hint": "เช่น 61/2569",
      "placeholder": "ครั้งที่ประชุม"
    },
    {
      "id": "meeting_date",
      "label": "วันที่ประชุม",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "agenda_item",
      "label": "ระเบียบวาระที่",
      "type": "text",
      "hint": "เช่น 5.5",
      "placeholder": "ระเบียบวาระที่"
    },
    {
      "id": "total_copies",
      "label": "รวม (ฉบับ)",
      "type": "number",
      "hint": "กรอกเลขอารบิก ระบบแสดงเป็นเลขไทย",
      "placeholder": "…"
    },
    {
      "id": "signer_name",
      "label": "ชื่อผู้ลงนาม",
      "type": "text",
      "hint": "คำนำหน้า + ชื่อ-สกุล ในวงเล็บ",
      "placeholder": "ชื่อผู้ลงนาม"
    },
    {
      "id": "kbc_director_date",
      "label": "ผอ.กบค. — วันที่ตรวจ",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "kbc_director_sign",
      "label": "ผอ.กบค. — ผู้ตรวจ",
      "type": "text",
      "hint": "",
      "placeholder": "ผอ.กบค. — ผู้ตรวจ"
    },
    {
      "id": "group_director_sign",
      "label": "ผอ.กลุ่มงาน — ผู้ตรวจ",
      "type": "text",
      "hint": "",
      "placeholder": "ผอ.กลุ่มงาน — ผู้ตรวจ"
    },
    {
      "id": "group_director_date",
      "label": "ผอ.กลุ่มงาน — วันที่ตรวจ",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "typist_name",
      "label": "ผู้พิมพ์",
      "type": "text",
      "hint": "",
      "placeholder": "ผู้พิมพ์"
    },
    {
      "id": "typist_date",
      "label": "ผู้พิมพ์ — วันที่",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    }
  ],
  "prefill": {
    "case_no": "caseId",
    "recipient_region": "paccRegion",
    "meeting_no": "meetingNo",
    "meeting_date": "meetingDateISO",
    "agenda_item": "agendaNo",
    "case_owner_name": "ownerName"
  },
  "bodyHtml": "<div style=\"position:relative;min-height:52px\"><img src=\"assets/doc_logo.jpg\" alt=\"ตราครุฑ\" style=\"position:absolute;top:0;left:0;height:52px\"><div class=\"doc-title\" style=\"font-size:22px;margin-top:0\">บันทึกข้อความ</div></div>\n<div class=\"doc-memo-hdr\">ส่วนราชการ  กลุ่มงานกิจการคณะกรรมการ  กบค.  โทร. 4318 (ปุระเชษฐ์ฯ)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">ที่  ปป 0004/ {doc_ref_no} วันที่ {doc_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรื่อง   ส่งรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. และเอกสารที่เกี่ยวข้อง เรื่องที่ {case_no}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรียน   ผอ. ปปท. เขต {recipient_region}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">{case_owner_name} พนักงาน ป.ป.ท. เจ้าของสำนวน</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ตามที่คณะกรรมการ ป.ป.ท. ได้มีมติในคราวประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} วาระที่ {agenda_item} วินิจฉัยชี้มูลคดี เรื่องที่ {case_no} นั้น</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">บัดนี้ กลุ่มงานกิจการคณะกรรมการ ได้เสนอรายงานการไต่สวนเพื่อวินิจฉัยชี้มูล ของคณะกรรมการ ป.ป.ท. และหนังสือแจ้งหน่วยงานต้นสังกัด เพื่อพิจารณาโทษทางวินัยเรื่องดังกล่าว เพื่อคณะกรรมการ ป.ป.ท. พิจารณาลงนามเสร็จเรียบร้อยแล้ว จึงขอส่งต้นฉบับมติการประชุมคณะกรรมการ ป.ป.ท. ต้นฉบับรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. ต้นฉบับรายงานการไต่สวน และสำเนาหนังสือแจ้งหน่วยงานต้นสังกัดเพื่อพิจารณาโทษทางวินัย รวม {total_copies} ฉบับ มายังท่าน เพื่อพิจารณา ดำเนินการในส่วนที่เกี่ยวข้องต่อไป โดยขอให้ตรวจสอบความถูกต้องก่อนส่งสำนวนให้พนักงานอัยการ หากมีความคลาดเคลื่อนประการใด ขอได้โปรดแจ้งให้กลุ่มงานกิจการคณะกรรมการ กบค. ดำเนินการแก้ไขต่อไป ทั้งนี้ กลุ่มงานกิจการคณะกรรมการ ได้ส่งต้นฉบับหนังสือแจ้งหน่วยงานต้นสังกัดเพื่อพิจารณาโทษทางวินัย พร้อมเอกสารประกอบ ให้กลุ่มงานบริหารติดตามคดี จัดส่งไปยังหน่วยงานต้นสังกัดของผู้ถูกกล่าวหาแล้ว</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">จึงเรียนมาเพื่อโปรดพิจารณา มอบหมายเจ้าของสำนวนทราบเพื่อดำเนินการในส่วนที่เกี่ยวข้องต่อไป</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({signer_name})</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผู้อำนวยการกองบริหารคดี</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผอ.กบค.</div>\n<div class=\"doc-indent\">{kbc_director_sign} วันที่ {kbc_director_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ผอ.กลุ่มงาน   {group_director_sign}  วันที่  {group_director_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">พิมพ์            {typist_name}    วันที  {typist_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>",
  "groups": [
    {
      "title": "๑. ข้อมูลและเลขที่หนังสือ",
      "icon": "fa-hashtag",
      "fieldIds": [
        "doc_ref_no",
        "doc_date",
        "recipient_region",
        "case_owner_name"
      ]
    },
    {
      "title": "๒. ข้อมูลการประชุมและสำนวน",
      "icon": "fa-scale-balanced",
      "fieldIds": [
        "meeting_no",
        "meeting_date",
        "agenda_item",
        "case_no",
        "total_copies"
      ]
    },
    {
      "title": "๓. ผู้จัดทำ ตรวจ และลงนาม",
      "icon": "fa-signature",
      "fieldIds": [
        "signer_name",
        "kbc_director_sign",
        "kbc_director_date",
        "group_director_sign",
        "group_director_date",
        "typist_name",
        "typist_date"
      ]
    }
  ]
};

window.ECMIS.OrderMemoDocs["transmit_kbc"] = {
  "id": "transmit_kbc",
  "label": "ส่ง กบค.",
  "runningTitle": "บันทึกส่งเอกสารให้กลุ่มงานบริหารติดตามคดี",
  "docxTemplate": "assets/templates/memo-7x-transmit-kbc.docx",
  "fields": [
    {
      "id": "doc_ref_no",
      "label": "เลขที่หนังสือ (ปป 0004.3/)",
      "type": "text",
      "hint": "กรอกเฉพาะเลขที่ท้ายเครื่องหมาย /",
      "placeholder": "เลขที่หนังสือ (ปป 0004.3/)"
    },
    {
      "id": "doc_date",
      "label": "วันที่หนังสือ",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "meeting_no",
      "label": "ครั้งที่ประชุม",
      "type": "text",
      "hint": "เช่น 61/2569",
      "placeholder": "ครั้งที่ประชุม"
    },
    {
      "id": "meeting_date",
      "label": "วันที่ประชุม",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "agenda_item",
      "label": "ระเบียบวาระที่",
      "type": "text",
      "hint": "เช่น 5.5",
      "placeholder": "ระเบียบวาระที่"
    },
    {
      "id": "case_no",
      "label": "เรื่องที่ (เลขสำนวน)",
      "type": "text",
      "hint": "เช่น 111674/2560",
      "placeholder": "เรื่องที่ (เลขสำนวน)"
    },
    {
      "id": "pacc_region",
      "label": "สำนักงาน ปปท. เขต",
      "type": "text",
      "hint": "เลขเขต เช่น 6 (เว้นว่างถ้าเป็นส่วนกลาง)",
      "placeholder": "สำนักงาน ปปท. เขต"
    },
    {
      "id": "notice_ref_no",
      "label": "เลขที่หนังสือแจ้งต้นสังกัด",
      "type": "text",
      "hint": "เช่น ปป 0004/ป278",
      "placeholder": "เลขที่หนังสือแจ้งต้นสังกัด"
    },
    {
      "id": "notice_date",
      "label": "ลงวันที่ (หนังสือแจ้งต้นสังกัด)",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "pages_notice",
      "label": "จำนวนแผ่น — หนังสือแจ้งต้นสังกัด",
      "type": "number",
      "hint": "",
      "placeholder": "…"
    },
    {
      "id": "pages_resolution",
      "label": "จำนวนแผ่น — สำเนามติการประชุม",
      "type": "number",
      "hint": "",
      "placeholder": "…"
    },
    {
      "id": "pages_report",
      "label": "จำนวนแผ่น — สำเนารายงานการไต่สวน",
      "type": "number",
      "hint": "",
      "placeholder": "…"
    },
    {
      "id": "total_copies",
      "label": "รวม (ฉบับ)",
      "type": "number",
      "hint": "",
      "placeholder": "…"
    },
    {
      "id": "prosecutor_ref_no",
      "label": "เลขที่หนังสือส่งพนักงานอัยการ",
      "type": "text",
      "hint": "เช่น ปป 0004/9410",
      "placeholder": "เลขที่หนังสือส่งพนักงานอัยการ"
    },
    {
      "id": "prosecutor_date",
      "label": "ลงวันที่ (หนังสือส่งพนักงานอัยการ)",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "postal_tracking_no",
      "label": "เลขพัสดุไปรษณีย์",
      "type": "text",
      "hint": "",
      "placeholder": "เลขพัสดุไปรษณีย์"
    },
    {
      "id": "signer_name",
      "label": "ชื่อผู้ลงนาม",
      "type": "text",
      "hint": "ใส่คำนำหน้า + ชื่อ-สกุล ในวงเล็บ",
      "placeholder": "ชื่อผู้ลงนาม"
    },
    {
      "id": "kbc_director_sign",
      "label": "ผอ.กบค. — ผู้ตรวจ",
      "type": "text",
      "hint": "",
      "placeholder": "ผอ.กบค. — ผู้ตรวจ"
    },
    {
      "id": "kbc_director_date",
      "label": "ผอ.กบค. — วันที่ตรวจ",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "group_director_sign",
      "label": "ผอ.กลุ่มงาน — ผู้ตรวจ",
      "type": "text",
      "hint": "",
      "placeholder": "ผอ.กลุ่มงาน — ผู้ตรวจ"
    },
    {
      "id": "group_director_date",
      "label": "ผอ.กลุ่มงาน — วันที่ตรวจ",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "typist_name",
      "label": "ผู้พิมพ์",
      "type": "text",
      "hint": "",
      "placeholder": "ผู้พิมพ์"
    },
    {
      "id": "typist_date",
      "label": "ผู้พิมพ์ — วันที่",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    }
  ],
  "prefill": {
    "case_no": "caseId",
    "pacc_region": "paccRegion",
    "meeting_no": "meetingNo",
    "meeting_date": "meetingDateISO",
    "agenda_item": "agendaNo"
  },
  "bodyHtml": "<div style=\"position:relative;min-height:52px\"><img src=\"assets/doc_logo.jpg\" alt=\"ตราครุฑ\" style=\"position:absolute;top:0;left:0;height:52px\"><div class=\"doc-title\" style=\"font-size:22px;margin-top:0\">บันทึกข้อความ</div></div>\n<div class=\"doc-memo-hdr\">ส่วนราชการ  กลุ่มงานกิจการคณะกรรมการ  กบค.  โทร. 4318 (ปุระเชษฐ์ฯ)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">ที่  ปป 0004.3/ {doc_ref_no} วันที่ {doc_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรื่อง   ขอจัดส่งเอกสารเพื่อดำเนินการตามมาตรา 38 แห่งพระราชบัญญัติมาตรการของฝ่ายบริหาร ในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม (ฉบับที่ ๔) พ.ศ. ๒๕๖๘</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรียน   ผู้อำนวยการกองบริหารคดี</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ตามที่คณะกรรมการ ป.ป.ท. ได้มีมติในคราวประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ 22/256๘ เมื่อวันที่ 26 มีนาคม 256๘ ระเบียบวาระที่ 6.1 เห็นชอบแนวทางปฏิบัติเกี่ยวกับการส่งเอกสาร แจ้งต้นสังกัดดำเนินการทางวินัย นั้น</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">บัดนี้ กลุ่มงานกิจการคณะกรรมการ ได้เสนอรายงานการไต่สวนเพื่อวินิจฉัยชี้มูล ของคณะกรรมการ ป.ป.ท. และหนังสือแจ้งหน่วยงานต้นสังกัดเพื่อพิจารณาโทษทางวินัย ที่คณะกรรมการ ป.ป.ท. ได้มีมติในคราวประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} วาระที่ {agenda_item} วินิจฉัยชี้มูล เรื่องที่ {case_no} ของสำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต {pacc_region} เพื่อคณะกรรมการ ป.ป.ท. พิจารณาลงนามเสร็จเรียบร้อยแล้ว จึงขอส่งต้นฉบับหนังสือแจ้งหน่วยงานต้นสังกัด เพื่อพิจารณาโทษทางวินัย ({notice_ref_no} ลงวันที่ {notice_date}) จำนวน {pages_notice} แผ่น สำเนามติการประชุม คณะกรรมการ ป.ป.ท. จำนวน {pages_resolution} แผ่น และสำเนารายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. จำนวน {pages_report} แผ่น รวม {total_copies} ฉบับ เพื่อส่งให้กลุ่มงานบริหารติดตามคดี ดำเนินการในส่วนที่เกี่ยวข้องต่อไป ทั้งนี้ กลุ่มงานกิจการคณะกรรมการ ได้จัดส่งเอกสารที่เกี่ยวข้องให้ผู้รับผิดชอบสำนวนดำเนินการส่งเรื่องให้พนักงานอัยการ เพื่อดำเนินการคดีอาญาแก่บุคคลดังกล่าวต่อไป ตามหนังสือกลุ่มงานกิจการคณะกรรมการ กบค. ลับ ด่วนที่สุด ที่ {prosecutor_ref_no} ลงวันที่ {prosecutor_date} ทางไปรษณีย์ ตามเลขพัสดุที่ {postal_tracking_no}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">จึงเรียนมาเพื่อโปรดพิจารณา</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({signer_name})</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผู้อำนวยการกลุ่มงานกิจการคณะกรรมการ</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผอ.กบค.</div>\n<div class=\"doc-indent\">{kbc_director_sign} วันที่ {kbc_director_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ผอ.กลุ่มงาน   {group_director_sign}  วันที่  {group_director_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">พิมพ์            {typist_name}    วันที  {typist_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>",
  "groups": [
    {
      "title": "๑. ข้อมูลและเลขที่หนังสือ",
      "icon": "fa-hashtag",
      "fieldIds": [
        "doc_ref_no",
        "doc_date",
        "case_no",
        "pacc_region"
      ]
    },
    {
      "title": "๒. ข้อมูลการประชุม",
      "icon": "fa-scale-balanced",
      "fieldIds": [
        "meeting_no",
        "meeting_date",
        "agenda_item"
      ]
    },
    {
      "title": "๓. รายละเอียดเอกสารส่งต่อและพัสดุ",
      "icon": "fa-file-lines",
      "fieldIds": [
        "notice_ref_no",
        "notice_date",
        "pages_notice",
        "pages_resolution",
        "pages_report",
        "total_copies",
        "prosecutor_ref_no",
        "prosecutor_date",
        "postal_tracking_no"
      ]
    },
    {
      "title": "๔. ผู้จัดทำ ตรวจ และลงนาม",
      "icon": "fa-signature",
      "fieldIds": [
        "signer_name",
        "kbc_director_sign",
        "kbc_director_date",
        "group_director_sign",
        "group_director_date",
        "typist_name",
        "typist_date"
      ]
    }
  ]
};

window.ECMIS.OrderMemoDocs["timebar_report"] = {
  "id": "timebar_report",
  "label": "ขาดอายุความ",
  "runningTitle": "รายงานคดีขาดอายุความ",
  "docxTemplate": "assets/templates/memo-7x-timebar.docx",
  "fields": [
    {
      "id": "doc_ref_no",
      "label": "เลขที่หนังสือ (ปป 0004.3/)",
      "type": "text",
      "hint": "กรอกเฉพาะเลขที่ท้ายเครื่องหมาย /",
      "placeholder": "เลขที่หนังสือ (ปป 0004.3/)"
    },
    {
      "id": "doc_date",
      "label": "วันที่หนังสือ",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "meeting_no",
      "label": "ครั้งที่ประชุม",
      "type": "text",
      "hint": "เช่น 61/2569",
      "placeholder": "ครั้งที่ประชุม"
    },
    {
      "id": "meeting_date",
      "label": "วันที่ประชุม",
      "type": "date",
      "hint": "",
      "placeholder": "……………………"
    },
    {
      "id": "agenda_item",
      "label": "ระเบียบวาระที่",
      "type": "text",
      "hint": "เช่น 5.5",
      "placeholder": "ระเบียบวาระที่"
    },
    {
      "id": "case_no",
      "label": "เรื่องที่ (เลขสำนวน)",
      "type": "text",
      "hint": "เช่น 111674/2560",
      "placeholder": "เรื่องที่ (เลขสำนวน)"
    },
    {
      "id": "pacc_region",
      "label": "สำนักงาน ปปท. เขต",
      "type": "text",
      "hint": "เลขเขต",
      "placeholder": "สำนักงาน ปปท. เขต"
    },
    {
      "id": "lapsed_offences",
      "label": "ฐานความผิดที่ขาดอายุความ",
      "type": "textarea",
      "hint": "ระบุมาตรา/กฎหมายที่ขาดอายุความ",
      "placeholder": "ฐานความผิดที่ขาดอายุความ"
    },
    {
      "id": "preparer_name",
      "label": "ชื่อผู้จัดทำ",
      "type": "text",
      "hint": "คำนำหน้า/ยศ + ชื่อ-สกุล ในวงเล็บ",
      "placeholder": "ชื่อผู้จัดทำ"
    },
    {
      "id": "group_director_name",
      "label": "ชื่อ ผอ.กลุ่มงานกิจการคณะกรรมการ",
      "type": "text",
      "hint": "",
      "placeholder": "ชื่อ ผอ.กลุ่มงานกิจการคณะกรรมการ"
    },
    {
      "id": "kbc_director_name",
      "label": "ชื่อ ผอ.กองบริหารคดี",
      "type": "text",
      "hint": "",
      "placeholder": "ชื่อ ผอ.กองบริหารคดี"
    }
  ],
  "prefill": {
    "case_no": "caseId",
    "pacc_region": "paccRegion",
    "meeting_no": "meetingNo",
    "meeting_date": "meetingDateISO",
    "agenda_item": "agendaNo"
  },
  "bodyHtml": "<div style=\"position:relative;min-height:52px\"><img src=\"assets/doc_logo.jpg\" alt=\"ตราครุฑ\" style=\"position:absolute;top:0;left:0;height:52px\"><div class=\"doc-title\" style=\"font-size:22px;margin-top:0\">บันทึกข้อความ</div></div>\n<div class=\"doc-memo-hdr\">ส่วนราชการ  กลุ่มงานกิจการคณะกรรมการ กบค.   โทร. 4318 (ปุระเชษฐ์ฯ)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">ที่  ปป 0004.3/ {doc_ref_no} วันที่ {doc_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรื่อง  ขอให้พิจารณาดำเนินการตามอำนาจหน้าที่</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรียน ผู้อำนวยการกองบริหารคดี</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ตามที่คณะกรรมการ ป.ป.ท. ได้มีมติในคราวประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ 21/2567 เมื่อวันที่ 18 เมษายน 2567 วาระที่ 6.1 มีมติมอบหมายให้ฝ่ายเลขานุการฯ ทำหนังสือแจ้งเรื่องที่ขาดอายุความ ทั้งขาดอายุความทั้งเรื่อง บางข้อหา บางกรรม บางคน ให้เลขาธิการคณะกรรมการ ป.ป.ท. ในฐานะหัวหน้าหน่วยงานทราบ และดำเนินการในส่วนที่เกี่ยวข้องตามอำนาจหน้าที่ต่อไป โดยให้เริ่มตั้งแต่เรื่องที่มีการประชุมตั้งแต่เดือน เมษายน ๒๕๖๗ เป็นต้นไป นั้น</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ในการประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} ได้พิจารณาวาระที่ {agenda_item} เรื่องที่ {case_no} ซึ่งเป็นสำนวนคดีของสำนักงานป้องกันและปราบปรามการทุจริต ในภาครัฐ เขต {pacc_region} จากการพิจารณาปรากฏว่า การกระทำของผู้ถูกกล่าวหา ซึ่งเป็นผู้สนับสนุนการกระทำความผิด บางกรรมและบางฐานความผิดขาดอายุความ อันเป็นเหตุให้ไม่สามารถดำเนินคดีกับผู้ถูกกล่าวหา ในฐานความผิดตาม{lapsed_offences} ดังนั้น จึงเห็นควร แจ้งเรื่องที่ขาดอายุความให้เลขาธิการคณะกรรมการ ป.ป.ท. ทราบ และดำเนินการในส่วนที่เกี่ยวข้อง ตามอำนาจหน้าที่ต่อไป</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">จึงเรียนมาเพื่อโปรดพิจารณา</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ร้อยเอก</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ลงนามแล้ว</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({preparer_name})</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">นิติกรชำนาญการ</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({kbc_director_name})</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ผู้อำนวยการกองบริหารคดี</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({group_director_name})</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผู้อำนวยการกลุ่มงานกิจการคณะกรรมการ</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>",
  "groups": [
    {
      "title": "๑. ข้อมูลและเลขที่หนังสือ",
      "icon": "fa-hashtag",
      "fieldIds": [
        "doc_ref_no",
        "doc_date",
        "case_no",
        "pacc_region"
      ]
    },
    {
      "title": "๒. ข้อมูลการประชุม",
      "icon": "fa-scale-balanced",
      "fieldIds": [
        "meeting_no",
        "meeting_date",
        "agenda_item"
      ]
    },
    {
      "title": "๓. ฐานความผิดที่ขาดอายุความ",
      "icon": "fa-clock-rotate-left",
      "fieldIds": [
        "lapsed_offences"
      ]
    },
    {
      "title": "๔. ผู้จัดทำและผู้ตรวจกลั่นกรอง",
      "icon": "fa-signature",
      "fieldIds": [
        "preparer_name",
        "group_director_name",
        "kbc_director_name"
      ]
    }
  ]
};

window.ECMIS.OrderMemoDocs["notify_discipline"] = {
  "id": "notify_discipline",
  "label": "แจ้งโทษวินัย",
  "runningTitle": "หนังสือแจ้งให้พิจารณาโทษทางวินัย",
  "docxTemplate": "assets/templates/memo-7x-notify-discipline.docx",
  "fields": [
    {
      "id": "doc_ref_no",
      "label": "เลขที่หนังสือ (ที่ ปป 0004/ป)",
      "type": "text",
      "hint": "กรอกเฉพาะเลขที่ท้ายเครื่องหมาย /",
      "placeholder": "เลขที่หนังสือ (ที่ ปป 0004/ป)"
    },
    {
      "id": "doc_date",
      "label": "วันที่หนังสือ",
      "type": "date",
      "hint": "",
      "placeholder": "วันที่หนังสือ"
    },
    {
      "id": "case_no",
      "label": "เรื่องที่ (เลขสำนวน)",
      "type": "text",
      "hint": "เช่น 111674/2560",
      "placeholder": "เรื่องที่ (เลขสำนวน)"
    },
    {
      "id": "meeting_no",
      "label": "ครั้งที่ประชุม",
      "type": "text",
      "hint": "เช่น 61/2569",
      "placeholder": "ครั้งที่ประชุม"
    },
    {
      "id": "meeting_date",
      "label": "วันที่ประชุม",
      "type": "date",
      "hint": "",
      "placeholder": "วันที่ประชุม"
    },
    {
      "id": "agenda_item",
      "label": "ระเบียบวาระที่",
      "type": "text",
      "hint": "เช่น 5.4",
      "placeholder": "ระเบียบวาระที่"
    },
    {
      "id": "recipient_title",
      "label": "เรียน (หัวหน้าส่วนราชการต้นสังกัด)",
      "type": "text",
      "hint": "เช่น อธิการบดีมหาวิทยาลัย… (หัวหน้าส่วนราชการต้นสังกัด)",
      "placeholder": "เรียน (หัวหน้าส่วนราชการต้นสังกัด)"
    },
    {
      "id": "agency_name",
      "label": "ชื่อมหาวิทยาลัย/ส่วนราชการต้นสังกัด",
      "type": "text",
      "hint": "ชื่อสถาบัน/ส่วนราชการ ใช้ต่อท้าย \"มหาวิทยาลัย\"",
      "placeholder": "ชื่อมหาวิทยาลัย/ส่วนราชการต้นสังกัด"
    },
    {
      "id": "accused_1_name",
      "label": "ผู้ถูกกล่าวหาที่ 1 (ชื่อ-สกุล)",
      "type": "text",
      "hint": "",
      "placeholder": "ผู้ถูกกล่าวหาที่ 1 (ชื่อ-สกุล)"
    },
    {
      "id": "accused_1_affiliation",
      "label": "ตำแหน่ง/สังกัด ผู้ถูกกล่าวหาที่ 1",
      "type": "text",
      "hint": "เช่น นักวิชาการพัสดุชำนาญการ สังกัดคณะมนุษยศาสตร์",
      "placeholder": "ตำแหน่ง/สังกัด ผู้ถูกกล่าวหาที่ 1"
    },
    {
      "id": "accused_2_name",
      "label": "ผู้ถูกกล่าวหาที่ 2 (ถ้ามี)",
      "type": "text",
      "hint": "เว้นว่างถ้าไม่มี",
      "placeholder": "ผู้ถูกกล่าวหาที่ 2 (ถ้ามี)"
    },
    {
      "id": "accused_3_name",
      "label": "ผู้ถูกกล่าวหาที่ 3 (ถ้ามี)",
      "type": "text",
      "hint": "เว้นว่างถ้าไม่มี",
      "placeholder": "ผู้ถูกกล่าวหาที่ 3 (ถ้ามี)"
    },
    {
      "id": "offense_summary",
      "label": "สรุปการกระทำ/ฐานความผิดที่ชี้มูล (รายข้อ)",
      "type": "textarea",
      "hint": "สรุปเป็นความ ระบุข้อ/ฎีกา/จำนวนเงิน และฐานความผิดแต่ละกรรม",
      "placeholder": "สรุปการกระทำ/ฐานความผิดที่ชี้มูล (รายข้อ)"
    },
    {
      "id": "attach1_pages",
      "label": "สิ่งที่ส่งมาด้วย ๑ — จำนวนแผ่น",
      "type": "text",
      "hint": "จำนวนแผ่นของสำเนารายงานการไต่สวนฯ ที่แนบ",
      "placeholder": "จำนวนแผ่น"
    },
    {
      "id": "attach2_pages",
      "label": "สิ่งที่ส่งมาด้วย ๒ — จำนวนแผ่น",
      "type": "text",
      "hint": "จำนวนแผ่นของสำเนามติคณะกรรมการ ป.ป.ท. ที่แนบ",
      "placeholder": "จำนวนแผ่น"
    },
    {
      "id": "univ_regulation",
      "label": "ข้อบังคับ/ระเบียบบริหารงานบุคคลของต้นสังกัด",
      "type": "text",
      "hint": "เช่น ข้อบังคับมหาวิทยาลัย… ว่าด้วยการบริหารงานบุคคลของสถาบันต้นสังกัด",
      "placeholder": "ข้อบังคับ/ระเบียบบริหารงานบุคคลของต้นสังกัด"
    },
    {
      "id": "pacc_region",
      "label": "สำนักงาน ปปท. เขต (เลข)",
      "type": "text",
      "hint": "เลขเขต เช่น 6 (เว้นว่างถ้าเป็นส่วนกลาง)",
      "placeholder": "สำนักงาน ปปท. เขต (เลข)"
    },
    {
      "id": "signatory_name",
      "label": "ชื่อผู้ลงนาม",
      "type": "text",
      "hint": "คำนำหน้า + ชื่อ-สกุล ในวงเล็บ",
      "placeholder": "ชื่อผู้ลงนาม"
    },
    {
      "id": "signatory_position",
      "label": "ตำแหน่งผู้ลงนาม",
      "type": "text",
      "hint": "เช่น ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ",
      "placeholder": "ตำแหน่งผู้ลงนาม"
    },
    {
      "id": "contact_phone",
      "label": "โทรศัพท์ผู้ประสานงาน",
      "type": "text",
      "hint": "",
      "placeholder": "โทรศัพท์ผู้ประสานงาน"
    },
    {
      "id": "contact_fax",
      "label": "โทรสาร",
      "type": "text",
      "hint": "",
      "placeholder": "โทรสาร"
    },
    {
      "id": "case_officer",
      "label": "พนักงาน ป.ป.ท. เจ้าของสำนวน",
      "type": "text",
      "hint": "คำนำหน้า + ชื่อ-สกุล ในวงเล็บ",
      "placeholder": "พนักงาน ป.ป.ท. เจ้าของสำนวน"
    }
  ],
  "prefill": {
    "case_no": "caseId",
    "meeting_no": "meetingNo",
    "meeting_date": "meetingDateISO",
    "agenda_item": "agendaNo",
    "pacc_region": "paccRegion",
    "case_officer": "ownerName"
  },
  "bodyHtml": "<div class=\"doc-memo-hdr\"><div style=\"text-align:center;margin-bottom:8px\"><img src=\"assets/doc_logo.jpg\" alt=\"ตราครุฑ\" style=\"height:60px\"></div>\nที่  ปป 0004/ป {doc_ref_no}</div>\n<div class=\"doc-memo-hdr\">สำนักงาน ป.ป.ท.  อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ  อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</div>\n<div class=\"doc-memo-hdr\">วันที่ {doc_date}</div>\n<div class=\"doc-memo-hdr\">เรื่อง   ขอให้พิจารณาลงโทษทางวินัย</div>\n<div class=\"doc-memo-hdr\">เรียน   {recipient_title}</div>\n<div class=\"doc-indent\">สิ่งที่ส่งมาด้วย   ๑. สำเนารายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. เรื่องที่ {case_no} จำนวน {attach1_pages} แผ่น</div>\n<div class=\"doc-indent\">๒. สำเนามติคณะกรรมการ ป.ป.ท. ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} จำนวน {attach2_pages} แผ่น</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ด้วยคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (คณะกรรมการ ป.ป.ท.) ได้ดำเนินการไต่สวน โดยแต่งตั้งคณะพนักงานไต่สวน กรณีกล่าวหา {accused_1_name} ขณะเกิดเหตุเป็น{accused_1_affiliation} สังกัด{agency_name} ผู้ถูกกล่าวหาที่ ๑ ว่ากระทำความผิดฐานทุจริตต่อหน้าที่ (ผู้ถูกกล่าวหารายอื่นในสำนวนเดียวกัน ถ้ามี ได้แก่ {accused_2_name} ผู้ถูกกล่าวหาที่ ๒ และ {accused_3_name} ผู้ถูกกล่าวหาที่ ๓)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">คณะกรรมการ ป.ป.ท. ได้พิจารณาสำนวนการไต่สวน ในคราวประชุมครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} ระเบียบวาระที่ {agenda_item} แล้วมีมติเป็นเอกฉันท์วินิจฉัยชี้มูลความผิด ดังนี้</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>ความผิดทางอาญา</b></div>\n<div class=\"doc-indent\">{offense_summary}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>ความผิดทางวินัย</b></div>\n<div class=\"doc-indent\">การกระทำของ {accused_1_name} ผู้ถูกกล่าวหาที่ ๑ เป็นความผิดวินัยอย่างร้ายแรง ฐานปฏิบัติหรือละเว้นการปฏิบัติหน้าที่ราชการโดยมิชอบ เพื่อให้ตนเองหรือผู้อื่นได้รับประโยชน์ที่มิควรได้ อันเป็นการทุจริตต่อหน้าที่ราชการ ตาม{univ_regulation} ประกอบพระราชบัญญัติระเบียบข้าราชการพลเรือนในสถาบันอุดมศึกษา พ.ศ. ๒๕๔๗ และที่แก้ไขเพิ่มเติม มาตรา ๓๙ วรรคสาม ถือเป็นการกระทำการทุจริตในภาครัฐ ตามนัยมาตรา ๓ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ดังนั้น เพื่อปฏิบัติตามมาตรา ๓๘ และมาตรา ๔๑ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอส่งรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. และเอกสารที่เกี่ยวข้องมายังท่าน เพื่อพิจารณาโทษทางวินัยแก่ {accused_1_name} ผู้ถูกกล่าวหาที่ ๑ ในฐานความผิดดังกล่าวตามกฎหมาย ระเบียบ หรือข้อบังคับว่าด้วยการบริหารงานบุคคลที่ใช้บังคับกับผู้ถูกกล่าวหา ภายใน ๖๐ วัน นับแต่วันที่ได้รับแจ้งมติคณะกรรมการ ป.ป.ท. โดยมิต้องดำเนินการสอบสวนทางวินัยอีก และเมื่อได้ดำเนินการลงโทษทางวินัยแล้ว ขอได้ส่งสำเนาคำสั่งลงโทษดังกล่าวให้คณะกรรมการ ป.ป.ท. ทราบ ภายใน ๓๐ วัน นับแต่วันที่ได้ออกคำสั่งด้วย</div>\n<div class=\"doc-indent\">อนึ่ง สำหรับความผิดทางอาญาในเรื่องนี้ ได้ส่งเรื่องให้พนักงานอัยการเพื่อดำเนินคดีอาญาแก่บุคคลดังกล่าวแล้ว</div>\n<div class=\"doc-indent\">จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการในส่วนที่เกี่ยวข้องต่อไป</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ขอแสดงความนับถือ</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({signatory_name})</div>\n<div class=\"doc-sign\">{signatory_position}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต {pacc_region}</div>\n<div class=\"doc-indent\">โทร {contact_phone} โทรสาร {contact_fax}</div>\n<div class=\"doc-indent\">ผู้ประสานงาน / พนักงาน ป.ป.ท. เจ้าของสำนวน {case_officer}</div>\n<div class=\"doc-gap\">&nbsp;</div>",
  "groups": [
    {
      "title": "๑. ข้อมูลและเลขที่หนังสือ",
      "icon": "fa-hashtag",
      "fieldIds": [
        "doc_ref_no",
        "doc_date",
        "case_no",
        "pacc_region",
        "recipient_title",
        "agency_name",
        "attach1_pages",
        "attach2_pages"
      ]
    },
    {
      "title": "๒. ข้อมูลการประชุม",
      "icon": "fa-scale-balanced",
      "fieldIds": [
        "meeting_no",
        "meeting_date",
        "agenda_item"
      ]
    },
    {
      "title": "๓. รายชื่อผู้ถูกกล่าวหา",
      "icon": "fa-user-tag",
      "fieldIds": [
        "accused_1_name",
        "accused_1_affiliation",
        "accused_2_name",
        "accused_3_name"
      ]
    },
    {
      "title": "๔. พฤติการณ์และฐานความผิดที่ชี้มูล",
      "icon": "fa-file-lines",
      "fieldIds": [
        "offense_summary",
        "univ_regulation"
      ]
    },
    {
      "title": "๕. ผู้ลงนามและผู้ประสานงาน",
      "icon": "fa-signature",
      "fieldIds": [
        "signatory_name",
        "signatory_position",
        "case_officer",
        "contact_phone",
        "contact_fax"
      ]
    }
  ]
};

window.ECMIS.OrderMemoDocs["submit_inquiry"] = {
  "id": "submit_inquiry",
  "label": "เสนอไต่สวน",
  "runningTitle": "บันทึกเสนอรายงานการไต่สวนเบื้องต้น",
  "docxTemplate": "assets/templates/memo-7x-submit-inquiry.docx",
  "fields": [
    {
      "id": "doc_ref_no",
      "label": "เลขที่หนังสือ (ปป 0004/)",
      "type": "text",
      "hint": "กรอกเฉพาะเลขท้าย /",
      "placeholder": "เลขที่หนังสือ (ปป 0004/)"
    },
    {
      "id": "doc_date",
      "label": "วันที่หนังสือ",
      "type": "date",
      "hint": "",
      "placeholder": "วันที่หนังสือ"
    },
    {
      "id": "case_no",
      "label": "เรื่องที่ (เลขสำนวน)",
      "type": "text",
      "hint": "เช่น 111674/2560",
      "placeholder": "เรื่องที่ (เลขสำนวน)"
    },
    {
      "id": "meeting_no",
      "label": "ครั้งที่ประชุม",
      "type": "text",
      "hint": "เช่น 61/2569",
      "placeholder": "ครั้งที่ประชุม"
    },
    {
      "id": "meeting_date",
      "label": "วันที่ประชุม",
      "type": "date",
      "hint": "",
      "placeholder": "วันที่ประชุม"
    },
    {
      "id": "agenda_item",
      "label": "ระเบียบวาระที่",
      "type": "text",
      "hint": "เช่น 5.5",
      "placeholder": "ระเบียบวาระที่"
    },
    {
      "id": "pacc_region",
      "label": "สำนักงาน ปปท. เขต (เลข)",
      "type": "text",
      "hint": "เลขเขต เช่น 6",
      "placeholder": "สำนักงาน ปปท. เขต (เลข)"
    },
    {
      "id": "inquiry_orders",
      "label": "คำสั่งแต่งตั้งคณะพนักงานไต่สวน (ที่/ลงวันที่)",
      "type": "textarea",
      "hint": "ระบุคำสั่งสำนักงาน ป.ป.ท. ลับ ที่ .../ลงวันที่ ... ทุกฉบับ",
      "placeholder": "คำสั่งแต่งตั้งคณะพนักงานไต่สวน (ที่/ลงวันที่)"
    },
    {
      "id": "board_opinion",
      "label": "ความเห็นที่ประชุม (ใส่เฉพาะกรณีที่ประชุมมีความเห็น)",
      "type": "textarea",
      "hint": "ดึงจากมติการประชุม ส่วน 'ความเห็นที่ประชุม' — เว้นว่างได้ถ้าไม่มี",
      "placeholder": "ความเห็นที่ประชุม (ใส่เฉพาะกรณีที่ประชุมมีความเห็น)"
    },
    {
      "id": "resolution_summary",
      "label": "มติชี้มูลความผิดทางอาญา (รายข้อ/ฎีกา)",
      "type": "textarea",
      "hint": "สรุปมติชี้มูล/ข้อกล่าวหาที่ตกไป แยกเป็นข้อ",
      "placeholder": "มติชี้มูลความผิดทางอาญา (รายข้อ/ฎีกา)"
    },
    {
      "id": "discipline_finding",
      "label": "ความผิดทางวินัย",
      "type": "textarea",
      "hint": "สรุปฐานความผิดวินัยและบทกฎหมาย/ข้อบังคับที่เกี่ยวข้อง",
      "placeholder": "ความผิดทางวินัย"
    },
    {
      "id": "assign_facts",
      "label": "ข้อเท็จจริง (การรับมติ / มอบหมาย / กำหนดเวลา)",
      "type": "textarea",
      "hint": "วันรับมติฉบับสมบูรณ์ ผู้มอบหมาย วันจัดทำแล้วเสร็จ กรอบเวลา",
      "placeholder": "ข้อเท็จจริง (การรับมติ / มอบหมาย / กำหนดเวลา)"
    },
    {
      "id": "prepared_by_name",
      "label": "ผู้จัดทำ (ชื่อ-สกุล / ยศ)",
      "type": "text",
      "hint": "ยศ/คำนำหน้า + ชื่อ-สกุล ในวงเล็บ เช่น ร้อยเอก (ชื่อ-สกุล)",
      "placeholder": "ผู้จัดทำ (ชื่อ-สกุล / ยศ)"
    },
    {
      "id": "prepared_by_position",
      "label": "ตำแหน่งผู้จัดทำ",
      "type": "text",
      "hint": "เช่น นิติกรชำนาญการ",
      "placeholder": "ตำแหน่งผู้จัดทำ"
    },
    {
      "id": "group_director_name",
      "label": "ชื่อ ผอ.กลุ่มงานกิจการคณะกรรมการ (ผู้กลั่นกรอง)",
      "type": "text",
      "hint": "คำนำหน้า + ชื่อ-สกุล ในวงเล็บ",
      "placeholder": "ชื่อ ผอ.กลุ่มงานกิจการคณะกรรมการ (ผู้กลั่นกรอง)"
    },
    {
      "id": "kbc_director_name",
      "label": "ชื่อ ผอ.กองบริหารคดี",
      "type": "text",
      "hint": "คำนำหน้า + ชื่อ-สกุล ในวงเล็บ",
      "placeholder": "ชื่อ ผอ.กองบริหารคดี"
    }
  ],
  "prefill": {
    "case_no": "caseId",
    "meeting_no": "meetingNo",
    "meeting_date": "meetingDateISO",
    "agenda_item": "agendaNo",
    "pacc_region": "paccRegion",
    "prepared_by_name": "ownerName"
  },
  "bodyHtml": "<div style=\"position:relative;min-height:52px\"><img src=\"assets/doc_logo.jpg\" alt=\"ตราครุฑ\" style=\"position:absolute;top:0;left:0;height:52px\"><div class=\"doc-title\" style=\"font-size:22px;margin-top:0\">บันทึกข้อความ</div></div>\n<div class=\"doc-memo-hdr\">ส่วนราชการ  กองบริหารคดี กลุ่มงานกิจการคณะกรรมการ  โทร. 4318 (เจ้าหน้าที่ผู้ประสานงาน)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">ที่  ปป 0004/ {doc_ref_no} วันที่ {doc_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรื่อง   เสนอลงนามในรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. และหนังสือแจ้งหน่วยงานต้นสังกัดเพื่อพิจารณาโทษทางวินัย เรื่องที่ {case_no}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรียน   คณะกรรมการ ป.ป.ท. (ผ่านผู้อำนวยการกองบริหารคดี)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>1. เรื่องเดิม</b></div>\n<div class=\"doc-indent\">คณะกรรมการ ป.ป.ท. ได้มีมติในคราวประชุม ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} วาระที่ {agenda_item} รายงานการไต่สวนเพื่อวินิจฉัยชี้มูล เรื่องที่ {case_no} ของคณะพนักงานไต่สวน ตาม{inquiry_orders} ซึ่งเป็นสำนวนคดีของสำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต {pacc_region} โดยคณะกรรมการ ป.ป.ท. ได้มีความเห็นและมติเป็นเอกฉันท์วินิจฉัยชี้มูลความผิด ดังนี้</div>\n<div class=\"doc-indent\" data-cond-field=\"board_opinion\">คณะกรรมการ ป.ป.ท. พิจารณาแล้วเห็นว่า {board_opinion} คณะกรรมการ ป.ป.ท. มีมติเป็นเอกฉันท์วินิจฉัยชี้มูลความผิด ดังนี้</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>ความผิดทางอาญา</b></div>\n<div class=\"doc-indent\">{resolution_summary}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>ความผิดทางวินัย</b></div>\n<div class=\"doc-indent\">{discipline_finding}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>2. ข้อเท็จจริง</b></div>\n<div class=\"doc-indent\">{assign_facts}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>3. ข้อพิจารณา</b></div>\n<div class=\"doc-indent\">ผู้รับมอบหมายได้จัดทำรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. และหนังสือแจ้งหน่วยงานต้นสังกัดเพื่อพิจารณาโทษทางวินัย เรื่องที่ {case_no} ให้เป็นไปตามมติคณะกรรมการ ป.ป.ท. เรียบร้อยแล้ว โดยได้ศึกษาและทำความเข้าใจพฤติการณ์การกระทำความผิดทั้งหมด เพื่อบรรยายการกระทำความผิดในแต่ละพฤติการณ์ให้ครบถ้วนทั้งข้อเท็จจริงและข้อกฎหมาย รายละเอียดปรากฏตามเอกสารที่แนบมาพร้อมนี้</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">จึงเรียนมาเพื่อโปรดพิจารณา หากเห็นชอบขอได้โปรดลงนามในหนังสือถึงกรรมการ ป.ป.ท. เพื่อพิจารณาลงนามในรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. ที่เสนอมาพร้อมนี้</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({prepared_by_name})</div>\n<div class=\"doc-sign\">{prepared_by_position}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ได้ตรวจสอบ กลั่นกรอง รายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. แล้วเห็นว่ามีความถูกต้อง ครบถ้วน ทั้งข้อเท็จจริงและข้อกฎหมาย เป็นไปตามมติของคณะกรรมการ ป.ป.ท. จึงเรียนมาเพื่อโปรดพิจารณาลงนาม</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({group_director_name})</div>\n<div class=\"doc-sign\">ผู้อำนวยการกลุ่มงานกิจการคณะกรรมการ</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ได้ตรวจสอบแล้ว ถูกต้องตามมติของคณะกรรมการ ป.ป.ท. จึงเรียนมาเพื่อโปรดพิจารณาลงนาม</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({kbc_director_name})</div>\n<div class=\"doc-sign\">ผู้อำนวยการกองบริหารคดี</div>\n<div class=\"doc-gap\">&nbsp;</div>",
  "groups": [
    {
      "title": "๑. ข้อมูลและเลขที่หนังสือ",
      "icon": "fa-hashtag",
      "fieldIds": [
        "doc_ref_no",
        "doc_date",
        "case_no",
        "pacc_region"
      ]
    },
    {
      "title": "๒. ข้อมูลการประชุมและคำสั่งแต่งตั้ง",
      "icon": "fa-scale-balanced",
      "fieldIds": [
        "meeting_no",
        "meeting_date",
        "agenda_item",
        "inquiry_orders"
      ]
    },
    {
      "title": "๓. ข้อเท็จจริงและมติที่ประชุม",
      "icon": "fa-file-lines",
      "fieldIds": [
        "assign_facts",
        "resolution_summary",
        "discipline_finding",
        "board_opinion"
      ]
    },
    {
      "title": "๔. ผู้จัดทำและผู้ตรวจกลั่นกรอง",
      "icon": "fa-signature",
      "fieldIds": [
        "prepared_by_name",
        "prepared_by_position",
        "group_director_name",
        "kbc_director_name"
      ]
    }
  ]
};

window.ECMIS.OrderMemoDocs["ruling_report"] = {
  "id": "ruling_report",
  "label": "รายงานวินิจฉัยชี้มูล",
  "runningTitle": "รายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท.",
  "docxTemplate": "assets/templates/memo-7x-ruling-report.docx",
  "fields": [
    {
      "id": "case_no",
      "label": "เรื่องที่ (เลขสำนวน)",
      "type": "text",
      "hint": "เช่น 111674/2560",
      "placeholder": "เรื่องที่ (เลขสำนวน)"
    },
    {
      "id": "ruling_date",
      "label": "วันที่รายงาน (วันวินิจฉัยชี้มูล)",
      "type": "date",
      "hint": "",
      "placeholder": "วันที่รายงาน (วันวินิจฉัยชี้มูล)"
    },
    {
      "id": "meeting_no",
      "label": "ครั้งที่ประชุม",
      "type": "text",
      "hint": "เช่น 61/2569",
      "placeholder": "ครั้งที่ประชุม"
    },
    {
      "id": "meeting_date",
      "label": "วันที่ประชุม",
      "type": "date",
      "hint": "",
      "placeholder": "วันที่ประชุม"
    },
    {
      "id": "agenda_item",
      "label": "ระเบียบวาระที่",
      "type": "text",
      "hint": "เช่น 5.5",
      "placeholder": "ระเบียบวาระที่"
    },
    {
      "id": "pacc_region",
      "label": "สำนักงาน ปปท. เขต (เลข)",
      "type": "text",
      "hint": "เลขเขต เช่น 6",
      "placeholder": "สำนักงาน ปปท. เขต (เลข)"
    },
    {
      "id": "inquiry_orders",
      "label": "คำสั่งแต่งตั้งคณะพนักงานไต่สวน (ที่/ลงวันที่)",
      "type": "textarea",
      "hint": "ระบุคำสั่งสำนักงาน ป.ป.ท. ลับ ที่ .../ลงวันที่ ... ทุกฉบับ",
      "placeholder": "คำสั่งแต่งตั้งคณะพนักงานไต่สวน (ที่/ลงวันที่)"
    },
    {
      "id": "accused_summary",
      "label": "ผู้ถูกกล่าวหา (ชื่อ/เลขบัตร/สถานะขณะเกิดเหตุ รายคน)",
      "type": "textarea",
      "hint": "สรุปรายคน: ชื่อ-สกุล เลขบัตร ตำแหน่ง/สถานะ ผู้ถูกกล่าวหาที่ 1/2/3",
      "placeholder": "ผู้ถูกกล่าวหา (ชื่อ/เลขบัตร/สถานะขณะเกิดเหตุ รายคน)"
    },
    {
      "id": "board_present",
      "label": "กรรมการ ป.ป.ท. ที่มาประชุม",
      "type": "textarea",
      "hint": "รายชื่อ + ตำแหน่ง (ประธาน/กรรมการ) และจำนวนคน",
      "placeholder": "กรรมการ ป.ป.ท. ที่มาประชุม"
    },
    {
      "id": "board_absent",
      "label": "กรรมการ ป.ป.ท. ที่ไม่มาประชุม",
      "type": "textarea",
      "hint": "รายชื่อ + เหตุ (เช่น ติดราชการ) — เว้นว่างถ้ามาครบ",
      "placeholder": "กรรมการ ป.ป.ท. ที่ไม่มาประชุม"
    },
    {
      "id": "issue_procedure",
      "label": "ประเด็นการดำเนินการไต่สวนของคณะพนักงานไต่สวน",
      "type": "textarea",
      "hint": "",
      "placeholder": "ประเด็นการดำเนินการไต่สวนของคณะพนักงานไต่สวน"
    },
    {
      "id": "issue_status",
      "label": "ประเด็นสถานะของผู้ถูกกล่าวหา (ขณะกระทำ / ปัจจุบัน)",
      "type": "textarea",
      "hint": "",
      "placeholder": "ประเด็นสถานะของผู้ถูกกล่าวหา (ขณะกระทำ / ปัจจุบัน)"
    },
    {
      "id": "issue_authority",
      "label": "ประเด็นอำนาจหน้าที่ของผู้ถูกกล่าวหา",
      "type": "textarea",
      "hint": "",
      "placeholder": "ประเด็นอำนาจหน้าที่ของผู้ถูกกล่าวหา"
    },
    {
      "id": "issue_conduct",
      "label": "ประเด็นการกระทำความผิดของผู้ถูกกล่าวหา (พฤติการณ์)",
      "type": "textarea",
      "hint": "",
      "placeholder": "ประเด็นการกระทำความผิดของผู้ถูกกล่าวหา (พฤติการณ์)"
    },
    {
      "id": "issue_damage",
      "label": "ประเด็นเกี่ยวกับความเสียหาย",
      "type": "textarea",
      "hint": "จำนวนความเสียหาย/ค่าสินไหมทดแทนที่ต้องชดใช้ (ถ้ามี)",
      "placeholder": "ประเด็นเกี่ยวกับความเสียหาย"
    },
    {
      "id": "incident_datetime",
      "label": "วัน เวลา สถานที่เกิดเหตุ",
      "type": "textarea",
      "hint": "แยกตามรายข้อ/ฎีกา ถ้ามีหลายกรรม",
      "placeholder": "วัน เวลา สถานที่เกิดเหตุ"
    },
    {
      "id": "limitation_period",
      "label": "อายุความ",
      "type": "textarea",
      "hint": "แยกตามฐานความผิด/มาตรา ระบุช่วงวันที่ขาดอายุความของตัวการและผู้สนับสนุน",
      "placeholder": "อายุความ"
    },
    {
      "id": "board_opinion",
      "label": "ความเห็นที่ประชุม (ใส่เฉพาะกรณีที่ประชุมมีความเห็น)",
      "type": "textarea",
      "hint": "ดึงจากมติการประชุม ส่วน 'ความเห็นที่ประชุม' — เว้นว่างได้ถ้าไม่มี",
      "placeholder": "ความเห็นที่ประชุม (ใส่เฉพาะกรณีที่ประชุมมีความเห็น)"
    },
    {
      "id": "resolution_criminal",
      "label": "มติที่ประชุม — ความผิดทางอาญา (รายข้อ/ฎีกา)",
      "type": "textarea",
      "hint": "",
      "placeholder": "มติที่ประชุม — ความผิดทางอาญา (รายข้อ/ฎีกา)"
    },
    {
      "id": "resolution_discipline",
      "label": "มติที่ประชุม — ความผิดทางวินัย",
      "type": "textarea",
      "hint": "",
      "placeholder": "มติที่ประชุม — ความผิดทางวินัย"
    },
    {
      "id": "chair_name",
      "label": "ประธานในที่ประชุม (ชื่อ-สกุล)",
      "type": "text",
      "hint": "คำนำหน้า + ชื่อ-สกุล ในวงเล็บ",
      "placeholder": "ประธานในที่ประชุม (ชื่อ-สกุล)"
    },
    {
      "id": "recorder_note",
      "label": "ฝ่ายเลขานุการการประชุม / ผู้จดรายงาน",
      "type": "text",
      "hint": "",
      "placeholder": "ฝ่ายเลขานุการการประชุม / ผู้จดรายงาน"
    }
  ],
  "prefill": {
    "case_no": "caseId",
    "meeting_no": "meetingNo",
    "meeting_date": "meetingDateISO",
    "agenda_item": "agendaNo",
    "pacc_region": "paccRegion"
  },
  "bodyHtml": "<div class=\"doc-title\" style=\"font-size:22px\"><div style=\"text-align:center;margin-bottom:4px\"><img src=\"assets/doc_logo.jpg\" alt=\"ตราครุฑ\" style=\"height:52px\"></div>\nรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท.</div>\n<div class=\"doc-title\">เรื่องที่ {case_no}</div>\n<div class=\"doc-title\">วันที่ {ruling_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ในคราวการประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} วาระที่ {agenda_item} เพื่อพิจารณาและวินิจฉัยชี้มูลความผิด เรื่องที่ {case_no} ของคณะพนักงานไต่สวน ตาม{inquiry_orders} กรณีกล่าวหา {accused_summary}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\">กรรมการ ป.ป.ท. ที่มาประชุม</div>\n<div class=\"doc-indent\">{board_present}</div>\n<div class=\"doc-h\" style=\"font-weight:700\">กรรมการ ป.ป.ท. ที่ไม่มาประชุม</div>\n<div class=\"doc-indent\">{board_absent}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">คณะกรรมการ ป.ป.ท. ได้พิจารณาข้อเท็จจริงและพยานหลักฐานตามรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะพนักงานไต่สวนแล้วฟังได้ว่า</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\">ประเด็นเกี่ยวกับการดำเนินการไต่สวนของคณะพนักงานไต่สวน</div>\n<div class=\"doc-indent\">{issue_procedure}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\">ประเด็นเกี่ยวกับสถานะของผู้ถูกกล่าวหา</div>\n<div class=\"doc-indent\">{issue_status}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\">ประเด็นเกี่ยวกับอำนาจหน้าที่ของผู้ถูกกล่าวหา</div>\n<div class=\"doc-indent\">{issue_authority}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\">ประเด็นเกี่ยวกับการกระทำความผิดของผู้ถูกกล่าวหา</div>\n<div class=\"doc-indent\">{issue_conduct}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\" data-cond-field=\"issue_damage\">ประเด็นเกี่ยวกับความเสียหาย</div>\n<div class=\"doc-indent\" data-cond-field=\"issue_damage\">{issue_damage}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\">วัน เวลา สถานที่เกิดเหตุ</div>\n<div class=\"doc-indent\">{incident_datetime}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\">อายุความ</div>\n<div class=\"doc-indent\">{limitation_period}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\">ความเห็นที่ประชุม</div>\n<div class=\"doc-indent\" data-cond-field=\"board_opinion\">คณะกรรมการ ป.ป.ท. พิจารณาแล้วเห็นว่า {board_opinion}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">คณะกรรมการ ป.ป.ท. มีมติเป็นเอกฉันท์วินิจฉัยชี้มูลความผิด ดังนี้</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\">ความผิดทางอาญา</div>\n<div class=\"doc-indent\">{resolution_criminal}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-h\" style=\"font-weight:700\">ความผิดทางวินัย</div>\n<div class=\"doc-indent\">{resolution_discipline}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({chair_name})</div>\n<div class=\"doc-sign\">ประธานในที่ประชุมคณะกรรมการ ป.ป.ท.</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">{recorder_note}</div>\n<div class=\"doc-gap\">&nbsp;</div>",
  "groups": [
    {
      "title": "๑. ข้อมูลสำนวนและการประชุม",
      "icon": "fa-scale-balanced",
      "fieldIds": [
        "case_no",
        "ruling_date",
        "pacc_region",
        "meeting_no",
        "meeting_date",
        "agenda_item",
        "inquiry_orders"
      ]
    },
    {
      "title": "๒. ผู้ถูกกล่าวหาและองค์ประชุม",
      "icon": "fa-users",
      "fieldIds": [
        "accused_summary",
        "board_present",
        "board_absent"
      ]
    },
    {
      "title": "๓. ประเด็นการวินิจฉัยและพฤติการณ์",
      "icon": "fa-file-lines",
      "fieldIds": [
        "issue_procedure",
        "issue_status",
        "issue_authority",
        "issue_conduct",
        "issue_damage",
        "incident_datetime",
        "limitation_period",
        "board_opinion"
      ]
    },
    {
      "title": "๔. มติที่ประชุมคณะกรรมการ ป.ป.ท.",
      "icon": "fa-list-check",
      "fieldIds": [
        "resolution_criminal",
        "resolution_discipline"
      ]
    },
    {
      "title": "๕. ประธานและฝ่ายเลขานุการการประชุม",
      "icon": "fa-signature",
      "fieldIds": [
        "chair_name",
        "recorder_note"
      ]
    }
  ]
};

window.ECMIS.OrderMemoDocs["timebar_secgen"] = {
  "id": "timebar_secgen",
  "label": "ขาดอายุความ (เลขาฯ)",
  "runningTitle": "รายงานคดีขาดอายุความ (ถึงเลขาธิการ)",
  "docxTemplate": "assets/templates/memo-7x-timebar-secgen.docx",
  "fields": [
    {
      "id": "doc_ref_no",
      "label": "เลขที่หนังสือ (ปป 0004/)",
      "type": "text",
      "hint": "กรอกเฉพาะเลขท้าย /",
      "placeholder": "เลขที่หนังสือ (ปป 0004/)"
    },
    {
      "id": "doc_date",
      "label": "วันที่หนังสือ",
      "type": "date",
      "hint": "",
      "placeholder": "วันที่หนังสือ"
    },
    {
      "id": "prior_meeting_no",
      "label": "ครั้งที่ประชุม (มติมอบหมายแนวทาง)",
      "type": "text",
      "hint": "เช่น 21/2567",
      "placeholder": "ครั้งที่ประชุม (มติมอบหมายแนวทาง)"
    },
    {
      "id": "prior_meeting_date",
      "label": "วันที่ประชุม (มติมอบหมายแนวทาง)",
      "type": "date",
      "hint": "",
      "placeholder": "วันที่ประชุม (มติมอบหมายแนวทาง)"
    },
    {
      "id": "meeting_no",
      "label": "ครั้งที่ประชุม (ที่ชี้มูลเรื่องนี้)",
      "type": "text",
      "hint": "เช่น 61/2569",
      "placeholder": "ครั้งที่ประชุม (ที่ชี้มูลเรื่องนี้)"
    },
    {
      "id": "meeting_date",
      "label": "วันที่ประชุม (ที่ชี้มูลเรื่องนี้)",
      "type": "date",
      "hint": "",
      "placeholder": "วันที่ประชุม (ที่ชี้มูลเรื่องนี้)"
    },
    {
      "id": "agenda_item",
      "label": "ระเบียบวาระที่",
      "type": "text",
      "hint": "เช่น 5.5",
      "placeholder": "ระเบียบวาระที่"
    },
    {
      "id": "case_no",
      "label": "เรื่องที่ (เลขสำนวน)",
      "type": "text",
      "hint": "เช่น 111674/2569",
      "placeholder": "เรื่องที่ (เลขสำนวน)"
    },
    {
      "id": "pacc_region",
      "label": "สำนักงาน ปปท. เขต (เลข)",
      "type": "text",
      "hint": "เลขเขต เช่น 6",
      "placeholder": "สำนักงาน ปปท. เขต (เลข)"
    },
    {
      "id": "accused_summary",
      "label": "ผู้ถูกกล่าวหา (ชื่อ/เลขบัตร/สถานะ รายคน)",
      "type": "textarea",
      "hint": "สรุปรายคน: ชื่อ-สกุล เลขบัตร ตำแหน่ง/สังกัดขณะเกิดเหตุ และสถานะปัจจุบัน",
      "placeholder": "ผู้ถูกกล่าวหา (ชื่อ/เลขบัตร/สถานะ รายคน)"
    },
    {
      "id": "case_facts",
      "label": "พฤติการณ์ในคดี (โดยย่อ)",
      "type": "textarea",
      "hint": "สรุปพฤติการณ์ วันเวลา การกระทำ มูลค่าความเสียหาย",
      "placeholder": "พฤติการณ์ในคดี (โดยย่อ)"
    },
    {
      "id": "resolution_summary",
      "label": "มติคณะกรรมการ ป.ป.ท. (ชี้มูล/ตกไป รายข้อ)",
      "type": "textarea",
      "hint": "สรุปมติชี้มูล/ข้อกล่าวหาที่ตกไป แยกเป็นข้อ/ฎีกา",
      "placeholder": "มติคณะกรรมการ ป.ป.ท. (ชี้มูล/ตกไป รายข้อ)"
    },
    {
      "id": "lapsed_offences",
      "label": "ฐานความผิด/มาตราที่ขาดอายุความ",
      "type": "textarea",
      "hint": "ระบุมาตรา/กฎหมายและกรรมที่ขาดอายุความ",
      "placeholder": "ฐานความผิด/มาตราที่ขาดอายุความ"
    },
    {
      "id": "case_officer_name",
      "label": "เจ้าของสำนวน (ชื่อ-สกุล)",
      "type": "text",
      "hint": "",
      "placeholder": "เจ้าของสำนวน (ชื่อ-สกุล)"
    },
    {
      "id": "case_officer_position",
      "label": "ตำแหน่งเจ้าของสำนวน",
      "type": "text",
      "hint": "เช่น นักสืบสวนสอบสวนชำนาญการ",
      "placeholder": "ตำแหน่งเจ้าของสำนวน"
    },
    {
      "id": "signatory_name",
      "label": "ชื่อผู้ลงนาม",
      "type": "text",
      "hint": "คำนำหน้า + ชื่อ-สกุล ในวงเล็บ",
      "placeholder": "ชื่อผู้ลงนาม"
    },
    {
      "id": "signatory_position",
      "label": "ตำแหน่งผู้ลงนาม",
      "type": "text",
      "hint": "เช่น ผู้อำนวยการกองบริหารคดี ปฏิบัติหน้าที่เลขานุการคณะกรรมการ ป.ป.ท.",
      "placeholder": "ตำแหน่งผู้ลงนาม"
    },
    {
      "id": "kbc_director_sign",
      "label": "ผอ.กบค. — ผู้ตรวจ",
      "type": "text",
      "hint": "",
      "placeholder": "ผอ.กบค. — ผู้ตรวจ"
    },
    {
      "id": "kbc_director_date",
      "label": "ผอ.กบค. — วันที่ตรวจ",
      "type": "date",
      "hint": "",
      "placeholder": "ผอ.กบค. — วันที่ตรวจ"
    },
    {
      "id": "group_director_sign",
      "label": "ผอ.กลุ่มงาน — ผู้ตรวจ",
      "type": "text",
      "hint": "",
      "placeholder": "ผอ.กลุ่มงาน — ผู้ตรวจ"
    },
    {
      "id": "group_director_date",
      "label": "ผอ.กลุ่มงาน — วันที่ตรวจ",
      "type": "date",
      "hint": "",
      "placeholder": "ผอ.กลุ่มงาน — วันที่ตรวจ"
    },
    {
      "id": "typist_name",
      "label": "ผู้จัดทำ/ผู้พิมพ์",
      "type": "text",
      "hint": "",
      "placeholder": "ผู้จัดทำ/ผู้พิมพ์"
    },
    {
      "id": "typist_date",
      "label": "ผู้จัดทำ — วันที่",
      "type": "date",
      "hint": "",
      "placeholder": "ผู้จัดทำ — วันที่"
    }
  ],
  "prefill": {
    "case_no": "caseId",
    "meeting_no": "meetingNo",
    "meeting_date": "meetingDateISO",
    "agenda_item": "agendaNo",
    "pacc_region": "paccRegion",
    "case_officer_name": "ownerName"
  },
  "bodyHtml": "<div style=\"position:relative;min-height:52px\"><img src=\"assets/doc_logo.jpg\" alt=\"ตราครุฑ\" style=\"position:absolute;top:0;left:0;height:52px\"><div class=\"doc-title\" style=\"font-size:22px;margin-top:0\">บันทึกข้อความ</div></div>\n<div class=\"doc-memo-hdr\">ส่วนราชการ  กองบริหารคดี   โทร. 4318 (เจ้าหน้าที่ผู้ประสานงาน)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">ที่  ปป 0004/ {doc_ref_no} วันที่ {doc_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรื่อง   ขอให้พิจารณาดำเนินการตามอำนาจหน้าที่</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรียน   เลขาธิการคณะกรรมการ ป.ป.ท.</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ตามที่คณะกรรมการ ป.ป.ท. ได้มีมติในคราวประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ {prior_meeting_no} เมื่อวันที่ {prior_meeting_date} วาระที่ 6.1 มีมติมอบหมายให้ฝ่ายเลขานุการฯ ทำหนังสือแจ้งเรื่องที่ขาดอายุความ ทั้งขาดอายุความทั้งเรื่อง บางข้อหา บางกรรม บางคน ให้เลขาธิการคณะกรรมการ ป.ป.ท. ในฐานะหัวหน้าหน่วยงานทราบ และดำเนินการในส่วนที่เกี่ยวข้องตามอำนาจหน้าที่ต่อไป โดยให้เริ่มตั้งแต่เรื่องที่มีการประชุมตั้งแต่เดือนเมษายน ๒๕๖๗ เป็นต้นไป นั้น</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ในการประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} ได้พิจารณาวาระที่ {agenda_item} เรื่องที่ {case_no} ซึ่งเป็นสำนวนคดีของสำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต {pacc_region} มีรายละเอียดโดยย่อ ดังนี้</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>ผู้ถูกกล่าวหาหรือร้องเรียน</b></div>\n<div class=\"doc-indent\">{accused_summary}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>พฤติการณ์ในคดี</b></div>\n<div class=\"doc-indent\">{case_facts}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>มติคณะกรรมการ ป.ป.ท.</b></div>\n<div class=\"doc-indent\">{resolution_summary}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">จากการพิจารณาปรากฏว่า การกระทำของผู้ถูกกล่าวหาบางกรรมและบางฐานความผิดขาดอายุความ อันเป็นเหตุให้ไม่สามารถดำเนินคดีกับผู้ถูกกล่าวหาในฐานความผิดตาม{lapsed_offences} รายละเอียดปรากฏตามมติคณะกรรมการ ป.ป.ท. ที่แนบ</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ซึ่งกรณีดังกล่าว เป็นสำนวนที่อยู่ในความรับผิดชอบของ {case_officer_name} {case_officer_position} สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต {pacc_region} ดังนั้น เพื่อให้เป็นไปตามมติการประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ {prior_meeting_no} เมื่อวันที่ {prior_meeting_date} วาระที่ 6.1 ฝ่ายเลขานุการการประชุมคณะกรรมการ ป.ป.ท. จึงขออนุญาตส่งเรื่องดังกล่าวให้สำนักงานฯ ดำเนินการต่อไป</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">จึงเรียนมาเพื่อโปรดพิจารณา</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({signatory_name})</div>\n<div class=\"doc-sign\">{signatory_position}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผอ.กบค.</div>\n<div class=\"doc-indent\">{kbc_director_sign}  วันที่ {kbc_director_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ผอ.กลุ่มงาน   {group_director_sign}  วันที่  {group_director_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ผู้จัดทำ   {typist_name}   วันที่  {typist_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>",
  "groups": [
    {
      "title": "๑. ข้อมูลและเลขที่หนังสือ",
      "icon": "fa-hashtag",
      "fieldIds": [
        "doc_ref_no",
        "doc_date",
        "case_no",
        "pacc_region"
      ]
    },
    {
      "title": "๒. ข้อมูลการประชุม",
      "icon": "fa-scale-balanced",
      "fieldIds": [
        "prior_meeting_no",
        "prior_meeting_date",
        "meeting_no",
        "meeting_date",
        "agenda_item"
      ]
    },
    {
      "title": "๓. ผู้ถูกกล่าวหา พฤติการณ์ และมติชี้มูล",
      "icon": "fa-file-lines",
      "fieldIds": [
        "accused_summary",
        "case_facts",
        "resolution_summary",
        "lapsed_offences"
      ]
    },
    {
      "title": "๔. เจ้าของสำนวนและผู้ลงนาม",
      "icon": "fa-user-pen",
      "fieldIds": [
        "case_officer_name",
        "case_officer_position",
        "signatory_name",
        "signatory_position"
      ]
    },
    {
      "title": "๕. ผู้จัดทำและผู้ตรวจบันทึก",
      "icon": "fa-signature",
      "fieldIds": [
        "kbc_director_sign",
        "kbc_director_date",
        "group_director_sign",
        "group_director_date",
        "typist_name",
        "typist_date"
      ]
    }
  ]
};

