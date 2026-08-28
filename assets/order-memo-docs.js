/* AUTO-GENERATED bundle — pipeline.build emits per-doc fragments
   (output-template/<doc>/order-fragment.js); pipeline.bundle combines
   the 3 here for order.html + res/order.html. Re-run build then bundle
   to regenerate. `prefill` maps a schema field id -> a key in the
   order.html prefill sources object (see pipeline/bundle.py PREFILL). */
window.ECMIS = window.ECMIS || {};
window.ECMIS.OrderMemoDocs = window.ECMIS.OrderMemoDocs || {};
window.ECMIS.OrderMemoDocOrder = ["notify_zone", "transmit_kbc", "timebar_report"];

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
