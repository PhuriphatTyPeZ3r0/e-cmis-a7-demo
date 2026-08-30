/* AUTO-GENERATED bundle — pipeline.build emits per-doc fragments
   (output-template/<doc>/order-fragment.js); pipeline.bundle combines
   the 3 here for order.html + res/order.html. Re-run build then bundle
   to regenerate. `prefill` maps a schema field id -> a key in the
   order.html prefill sources object (see pipeline/bundle.py PREFILL). */
window.ECMIS = window.ECMIS || {};
window.ECMIS.OrderMemoDocs = window.ECMIS.OrderMemoDocs || {};
window.ECMIS.OrderMemoDocOrder = ["notify_zone", "transmit_kbc", "timebar_report", "notify_discipline"];

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
  "bodyHtml": "<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-title\" style=\"font-size:22px\">บันทึกข้อความ</div>\n<div class=\"doc-memo-hdr\">ส่วนราชการ  กลุ่มงานกิจการคณะกรรมการ  กบค.  โทร. 4318 (ปุระเชษฐ์ฯ)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">ที่  ปป 0004/ {doc_ref_no} วันที่ {doc_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรื่อง   ส่งรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. และเอกสารที่เกี่ยวข้อง เรื่องที่ {case_no} เรียน ผอ. ปปท. เขต {recipient_region}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">{case_owner_name} พนักงาน ป.ป.ท. เจ้าของสำนวน</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ตามที่คณะกรรมการ ป.ป.ท. ได้มีมติในคราวประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} วาระที่ {agenda_item} วินิจฉัยชี้มูลคดี เรื่องที่ 111674/2560 นั้น</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">บัดนี้ กลุ่มงานกิจการคณะกรรมการ ได้เสนอรายงานการไต่สวนเพื่อวินิจฉัยชี้มูล ของคณะกรรมการ ป.ป.ท. และหนังสือแจ้งหน่วยงานต้นสังกัด เพื่อพิจารณาโทษทางวินัยเรื่องดังกล่าว เพื่อคณะกรรมการ ป.ป.ท. พิจารณาลงนามเสร็จเรียบร้อยแล้ว จึงขอส่งต้นฉบับมติการประชุมคณะกรรมการ ป.ป.ท. ต้นฉบับรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. ต้นฉบับรายงานการไต่สวน และสำเนาหนังสือแจ้งหน่วยงานต้นสังกัดเพื่อพิจารณาโทษทางวินัย รวม {total_copies} ฉบับ มายังท่าน เพื่อพิจารณา ดำเนินการในส่วนที่เกี่ยวข้องต่อไป โดยขอให้ตรวจสอบความถูกต้องก่อนส่งสำนวนให้พนักงานอัยการ หากมีความคลาดเคลื่อนประการใด ขอได้โปรดแจ้งให้กลุ่มงานกิจการคณะกรรมการ กบค. ดำเนินการแก้ไขต่อไป ทั้งนี้ กลุ่มงานกิจการคณะกรรมการ ได้ส่งต้นฉบับหนังสือแจ้งหน่วยงานต้นสังกัดเพื่อพิจารณาโทษทางวินัย พร้อมเอกสารประกอบ ให้กลุ่มงานบริหารติดตามคดี จัดส่งไปยังหน่วยงานต้นสังกัดของผู้ถูกกล่าวหาแล้ว</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">จึงเรียนมาเพื่อโปรดพิจารณา มอบหมายเจ้าของสำนวนทราบเพื่อดำเนินการในส่วนที่เกี่ยวข้อง ต่อไป</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({signer_name})</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผู้อำนวยการกองบริหารคดี</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผอ.กบค.</div>\n<div class=\"doc-indent\">{kbc_director_sign} วันที่ {kbc_director_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ผอ.กลุ่มงาน   {group_director_sign}  วันที่  {group_director_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">พิมพ์            {typist_name}    วันที  {typist_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>"
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
  "bodyHtml": "<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-title\" style=\"font-size:22px\">บันทึกข้อความ</div>\n<div class=\"doc-memo-hdr\">ส่วนราชการ  กลุ่มงานกิจการคณะกรรมการ  กบค.  โทร. 4318 (ปุระเชษฐ์ฯ)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">ที่  ปป 0004.3/ {doc_ref_no} วันที่ {doc_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรื่อง   ขอจัดส่งเอกสารเพื่อดำเนินการตามมาตรา 38 แห่งพระราชบัญญัติมาตรการของฝ่ายบริหาร ในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม (ฉบับที่ ๔) พ.ศ. ๒๕๖๘ เรียน ผู้อำนวยการกองบริหารคดี</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ตามที่คณะกรรมการ ป.ป.ท. ได้มีมติในคราวประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ 22/256๘ เมื่อวันที่ 26 มีนาคม 256๘ ระเบียบวาระที่ 6.1 เห็นชอบแนวทางปฏิบัติเกี่ยวกับการส่งเอกสาร แจ้งต้นสังกัดดำเนินการทางวินัย นั้น</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">บัดนี้ กลุ่มงานกิจการคณะกรรมการ ได้เสนอรายงานการไต่สวนเพื่อวินิจฉัยชี้มูล ของคณะกรรมการ ป.ป.ท. และหนังสือแจ้งหน่วยงานต้นสังกัดเพื่อพิจารณาโทษทางวินัย ที่คณะกรรมการ ป.ป.ท. ได้มีมติในคราวประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} วาระที่ {agenda_item} วินิจฉัยชี้มูล เรื่องที่ {case_no} ของสำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต {pacc_region} เพื่อคณะกรรมการ ป.ป.ท. พิจารณาลงนามเสร็จเรียบร้อยแล้ว จึงขอส่งต้นฉบับหนังสือแจ้งหน่วยงานต้นสังกัด เพื่อพิจารณาโทษทางวินัย ({notice_ref_no} ลงวันที่ {notice_date}) จำนวน {pages_notice} แผ่น สำเนามติการประชุม คณะกรรมการ ป.ป.ท. จำนวน {pages_resolution} แผ่น และสำเนารายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. จำนวน {pages_report} แผ่น รวม {total_copies} ฉบับ เพื่อส่งให้กลุ่มงานบริหารติดตามคดี ดำเนินการในส่วนที่เกี่ยวข้องต่อไป ทั้งนี้ กลุ่มงานกิจการคณะกรรมการ ได้จัดส่งเอกสารที่เกี่ยวข้องให้ผู้รับผิดชอบสำนวนดำเนินการส่งเรื่องให้พนักงานอัยการ เพื่อดำเนินการคดีอาญาแก่บุคคลดังกล่าวต่อไป ตามหนังสือกลุ่มงานกิจการคณะกรรมการ กบค. ลับ ด่วนที่สุด ที่ {prosecutor_ref_no} ลงวันที่ {prosecutor_date} ทางไปรษณีย์ ตามเลขพัสดุที่ {postal_tracking_no}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">จึงเรียนมาเพื่อโปรดพิจารณา</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({signer_name})</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผู้อำนวยการกลุ่มงานกิจการคณะกรรมการ</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผอ.กบค.</div>\n<div class=\"doc-indent\">{kbc_director_sign} วันที่ {kbc_director_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ผอ.กลุ่มงาน   {group_director_sign}  วันที่  {group_director_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">พิมพ์            {typist_name}    วันที  {typist_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>"
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
  "bodyHtml": "<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-title\" style=\"font-size:22px\">บันทึกข้อความ</div>\n<div class=\"doc-memo-hdr\">ส่วนราชการ  กลุ่มงานกิจการคณะกรรมการ กบค.   โทร. 4318 (ปุระเชษฐ์ฯ)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">ที่  ปป 0004.3/ {doc_ref_no} วันที่ {doc_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรื่อง  ขอให้พิจารณาดำเนินการตามอำนาจหน้าที่</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-memo-hdr\">เรียน ผู้อำนวยการกองบริหารคดี</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ตามที่คณะกรรมการ ป.ป.ท. ได้มีมติในคราวประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ 21/2567 เมื่อวันที่ 18 เมษายน 2567 วาระที่ 6.1 มีมติมอบหมายให้ฝ่ายเลขานุการฯ ทำหนังสือแจ้งเรื่องที่ขาดอายุความ ทั้งขาดอายุความทั้งเรื่อง บางข้อหา บางกรรม บางคน ให้เลขาธิการคณะกรรมการ ป.ป.ท. ในฐานะหัวหน้าหน่วยงานทราบ และดำเนินการในส่วนที่เกี่ยวข้องตามอำนาจหน้าที่ต่อไป โดยให้เริ่มตั้งแต่เรื่องที่มีการประชุมตั้งแต่เดือน เมษายน ๒๕๖๗ เป็นต้นไป นั้น</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ในการประชุมคณะกรรมการ ป.ป.ท. ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} ได้พิจารณาวาระที่ {agenda_item} เรื่องที่ {case_no} ซึ่งเป็นสำนวนคดีของสำนักงานป้องกันและปราบปรามการทุจริต ในภาครัฐ เขต {pacc_region} จากการพิจารณาปรากฏว่า การกระทำของผู้ถูกกล่าวหา ซึ่งเป็นผู้สนับสนุนการกระทำความผิด บางกรรมและบางฐานความผิดขาดอายุความ อันเป็นเหตุให้ไม่สามารถดำเนินคดีกับผู้ถูกกล่าวหา ในฐานความผิดตาม{lapsed_offences} ดังนั้น จึงเห็นควร แจ้งเรื่องที่ขาดอายุความให้เลขาธิการคณะกรรมการ ป.ป.ท. ทราบ และดำเนินการในส่วนที่เกี่ยวข้อง ตามอำนาจหน้าที่ต่อไป</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">จึงเรียนมาเพื่อโปรดพิจารณา</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ร้อยเอก</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ลงนามแล้ว</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({preparer_name})</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">นิติกรชำนาญการ</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({kbc_director_name})</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ผู้อำนวยการกองบริหารคดี</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({group_director_name})</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ผู้อำนวยการกลุ่มงานกิจการคณะกรรมการ</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>"
};

/* block #4 appended by hand (2026-08-30): hand-authored bodyHtml from the file-4
   order-fragment (notify_discipline). DRAFT — legal wording pending review by
   fai lekhanukan kk.ppt.. A full `python -m pipeline.bundle` run (needs folders
   2, 5, 6 regenerated too) will re-emit all four docs from source. */
window.ECMIS.OrderMemoDocs["notify_discipline"] = {
  "id": "notify_discipline",
  "label": "แจ้งโทษวินัย (ร่าง)",
  "runningTitle": "หนังสือแจ้งให้พิจารณาโทษทางวินัย (ร่าง)",
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
      "hint": "เช่น อธิการบดีมหาวิทยาลัยนเรศวร",
      "placeholder": "เรียน (หัวหน้าส่วนราชการต้นสังกัด)"
    },
    {
      "id": "agency_name",
      "label": "ชื่อมหาวิทยาลัย/ส่วนราชการต้นสังกัด",
      "type": "text",
      "hint": "ใช้ต่อท้าย \"มหาวิทยาลัย\" เช่น นเรศวร",
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
      "id": "criminal_code_section",
      "label": "มาตราประมวลกฎหมายอาญาที่เกี่ยวข้อง",
      "type": "text",
      "hint": "เช่น มาตรา 147 มาตรา 157 มาตรา 161",
      "placeholder": "มาตราประมวลกฎหมายอาญาที่เกี่ยวข้อง"
    },
    {
      "id": "univ_regulation",
      "label": "ข้อบังคับ/ระเบียบบริหารงานบุคคลของต้นสังกัด",
      "type": "text",
      "hint": "เช่น ข้อบังคับมหาวิทยาลัยนเรศวร ว่าด้วยการบริหารงานบุคคลฯ พ.ศ. 2543",
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
  "bodyHtml": "<div class=\"doc-indent\" style=\"text-align:center;border:1px dashed #b91c1c;color:#b91c1c;font-weight:700;padding:4px 8px;margin-bottom:6px\">ร่าง — แม่แบบนี้ยังไม่ผ่านการตรวจถ้อยคำโดยฝ่ายเลขานุการ กก.ป.ป.ท. ห้ามใช้อ้างอิงทางราชการ</div>\n<div class=\"doc-memo-hdr\">ที่  ปป 0004/ป {doc_ref_no}</div>\n<div class=\"doc-memo-hdr\">สำนักงาน ป.ป.ท.  อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ  อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</div>\n<div class=\"doc-memo-hdr\">วันที่ {doc_date}</div>\n<div class=\"doc-memo-hdr\">เรื่อง   ขอให้พิจารณาลงโทษทางวินัย</div>\n<div class=\"doc-memo-hdr\">เรียน   {recipient_title}</div>\n<div class=\"doc-indent\">สิ่งที่ส่งมาด้วย   ๑. สำเนารายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. เรื่องที่ {case_no}</div>\n<div class=\"doc-indent\">๒. สำเนามติคณะกรรมการ ป.ป.ท. ครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ด้วยคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (คณะกรรมการ ป.ป.ท.) ได้ดำเนินการไต่สวน โดยแต่งตั้งคณะพนักงานไต่สวน กรณีกล่าวหา {accused_1_name} ขณะเกิดเหตุเป็น{accused_1_affiliation} สังกัด{agency_name} ผู้ถูกกล่าวหาที่ ๑ ว่ากระทำความผิดฐานทุจริตต่อหน้าที่ (ผู้ถูกกล่าวหารายอื่นในสำนวนเดียวกัน ถ้ามี ได้แก่ {accused_2_name} ผู้ถูกกล่าวหาที่ ๒ และ {accused_3_name} ผู้ถูกกล่าวหาที่ ๓)</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">คณะกรรมการ ป.ป.ท. ได้พิจารณาสำนวนการไต่สวน ในคราวประชุมครั้งที่ {meeting_no} เมื่อวันที่ {meeting_date} ระเบียบวาระที่ {agenda_item} แล้วมีมติเป็นเอกฉันท์วินิจฉัยชี้มูลความผิด ดังนี้</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>ความผิดทางอาญา</b></div>\n<div class=\"doc-indent\">{offense_summary}</div>\n<div class=\"doc-indent\">การกระทำของผู้ถูกกล่าวหาตามข้อกล่าวหาข้างต้น เป็นความผิดตามประมวลกฎหมายอาญา {criminal_code_section} และพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๔๒ และที่แก้ไขเพิ่มเติม มาตรา ๑๒๓/๑ ซึ่งเป็นกฎหมายที่ใช้บังคับขณะกระทำความผิด (ปัจจุบันเป็นความผิดตามพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑ มาตรา ๑๗๒) ประกอบประมวลกฎหมายอาญา มาตรา ๙๑</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\"><b>ความผิดทางวินัย</b></div>\n<div class=\"doc-indent\">การกระทำของ {accused_1_name} ผู้ถูกกล่าวหาที่ ๑ เป็นความผิดวินัยอย่างร้ายแรง ฐานปฏิบัติหรือละเว้นการปฏิบัติหน้าที่ราชการโดยมิชอบ เพื่อให้ตนเองหรือผู้อื่นได้รับประโยชน์ที่มิควรได้ อันเป็นการทุจริตต่อหน้าที่ราชการ ตาม{univ_regulation} ประกอบพระราชบัญญัติระเบียบข้าราชการพลเรือนในสถาบันอุดมศึกษา พ.ศ. ๒๕๔๗ และที่แก้ไขเพิ่มเติม มาตรา ๓๙ วรรคสาม ถือเป็นการกระทำการทุจริตในภาครัฐ ตามนัยมาตรา ๓ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">ดังนั้น เพื่อปฏิบัติตามมาตรา ๓๘ และมาตรา ๔๑ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอส่งรายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท. และเอกสารที่เกี่ยวข้องมายังท่าน เพื่อพิจารณาโทษทางวินัยแก่ {accused_1_name} ผู้ถูกกล่าวหาที่ ๑ ในฐานความผิดดังกล่าวตามกฎหมาย ระเบียบ หรือข้อบังคับว่าด้วยการบริหารงานบุคคลที่ใช้บังคับกับผู้ถูกกล่าวหา ภายใน ๖๐ วัน นับแต่วันที่ได้รับแจ้งมติคณะกรรมการ ป.ป.ท. โดยมิต้องดำเนินการสอบสวนทางวินัยอีก และเมื่อได้ดำเนินการลงโทษทางวินัยแล้ว ขอได้ส่งสำเนาคำสั่งลงโทษดังกล่าวให้คณะกรรมการ ป.ป.ท. ทราบ ภายใน ๓๐ วัน นับแต่วันที่ได้ออกคำสั่งด้วย</div>\n<div class=\"doc-indent\">อนึ่ง สำหรับความผิดทางอาญาในเรื่องนี้ ได้ส่งเรื่องให้พนักงานอัยการเพื่อดำเนินคดีอาญาแก่บุคคลดังกล่าวแล้ว</div>\n<div class=\"doc-indent\">จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการในส่วนที่เกี่ยวข้องต่อไป</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">ขอแสดงความนับถือ</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-sign\" style=\"margin-top:14px\">({signatory_name})</div>\n<div class=\"doc-sign\">{signatory_position}</div>\n<div class=\"doc-gap\">&nbsp;</div>\n<div class=\"doc-indent\">สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต {pacc_region}</div>\n<div class=\"doc-indent\">โทร {contact_phone}</div>\n<div class=\"doc-indent\">ผู้ประสานงาน / พนักงาน ป.ป.ท. เจ้าของสำนวน {case_officer}</div>\n<div class=\"doc-gap\">&nbsp;</div>"
};
