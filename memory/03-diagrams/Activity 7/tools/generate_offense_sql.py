import json

offenses = [
  # ๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ
  {"trob_id": 101, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๔๗", "trob_article_label": "เจ้าพนักงานยักยอกทรัพย์", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 1},
  {"trob_id": 102, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๔๘", "trob_article_label": "เจ้าพนักงานกรรโชกทรัพย์", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 2},
  {"trob_id": 103, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๔๙", "trob_article_label": "เจ้าพนักงานเรียก รับ หรือยอมจะรับสินบน", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 3},
  {"trob_id": 104, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๕๐", "trob_article_label": "เจ้าพนักงานกระทำการหรือไม่กระทำการอย่างใดโดยเห็นแก่ทรัพย์สินซึ่งเรียกหรือรับไว้ก่อนได้รับแต่งตั้งในตำแหน่งนั้น", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 4},
  {"trob_id": 105, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๕๑", "trob_article_label": "เจ้าพนักงานใช้อำนาจในตำแหน่งโดยทุจริต จัดการทรัพย์ อันเป็นการเสียหาย", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 5},
  {"trob_id": 106, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๕๒", "trob_article_label": "เจ้าพนักงานมีส่วนได้เสียเนื่องด้วยกิจการที่ตนมีหน้าที่จัดการหรือดูแล", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 6},
  {"trob_id": 107, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๕๓", "trob_article_label": "เจ้าพนักงานจ่ายทรัพย์เกินกว่าที่ควรจ่าย", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 7},
  {"trob_id": 108, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๕๔", "trob_article_label": "เจ้าพนักงานเรียกเก็บหรือไม่เรียกเก็บภาษี/ค่าธรรมเนียม/เงินอื่นใดโดยทุจริต หรือโดยทุจริตกระทำหรือไม่กระทำการอย่างใดเพื่อให้ผู้มีหน้าที่ไม่ต้องเสียหรือเสียน้อย", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 8},
  {"trob_id": 109, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๕๕", "trob_article_label": "เจ้าพนักงานโดยทุจริตกำหนดราคาทรัพย์สินหรือสินค้าเพื่อให้ผู้ต้องเสียภาษี หรือค่าธรรมเนียมไม่ต้องเสียหรือเสียน้อย", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 9},
  {"trob_id": 110, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๕๖", "trob_article_label": "เจ้าพนักงานโดยทุจริตแนะนำเกี่ยวกับการลงบัญชี ทำให้มิต้องเสียภาษีหรือค่าธรรมเนียม หรือเสียน้อย", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 10},
  {"trob_id": 111, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๕๗", "trob_article_label": "เจ้าพนักงานปฏิบัติหรือละเว้นการปฏิบัติหน้าที่โดยมิชอบเพื่อให้เกิดความเสียหายแก่ผู้หนึ่งผู้ใดหรือปฏิบัติหรือละเว้นการปฏิบัติหน้าที่โดยทุจริต", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 11},
  {"trob_id": 112, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๕๘", "trob_article_label": "เจ้าพนักงานทำให้เสียหาย ซ่อนเร้น เอาไปเสียซึ่งทรัพย์หรือเอกสาร ซึ่งตนมีหน้าที่ปกครองหรือรักษา", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 12},
  {"trob_id": 113, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๕๙", "trob_article_label": "เจ้าพนักงานถอน ทำให้เสียหาย ซึ่งตราหรือเครื่องหมาย อันเจ้าพนักงานได้ประทับไว้ที่ทรัพย์หรือเอกสารเพื่อเป็นหลักฐานในการยึดหรือรักษาสิ่งนั้น", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 13},
  {"trob_id": 114, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๖๐", "trob_article_label": "เจ้าพนักงานใช้ดวงตราหรือรอยตราอันมิชอบด้วยหน้าที่ซึ่งทำให้ผู้อื่นเสียหาย", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 14},
  {"trob_id": 115, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๖๑", "trob_article_label": "เจ้าพนักงานปลอมเอกสาร", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 15},
  {"trob_id": 116, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๖๒", "trob_article_label": "เจ้าพนักงานทำเอกสารเท็จ", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 16},
  {"trob_id": 117, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๖๓", "trob_article_label": "เจ้าพนักงานทำให้เสียหายซึ่งจดหมายหรือสิ่งอื่นที่ส่งทางไปรษณีย์ หรือโทรเลข", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 17},
  {"trob_id": 118, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๖๔", "trob_article_label": "เจ้าพนักงานเปิดเผยความลับ", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 18},
  {"trob_id": 119, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๖๕", "trob_article_label": "เจ้าพนักงานป้องกันหรือขัดขวางมิให้การเป็นไปตามกฎหมายหรือคำสั่ง", "p_principal": 5, "p_accessory": 5, "trob_sort_order": 19},
  {"trob_id": 120, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๖๖ ว.๑", "trob_article_label": "เจ้าพนักงานละทิ้งงาน หรือกระทำการใด ๆ เพื่อให้งานเสียหาย", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 20},
  {"trob_id": 121, "trob_group": "๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๑๖๖ ว.๒", "trob_article_label": "เพื่อให้เกิดการเปลี่ยนแปลงกฎหมาย บังคับรัฐบาล ข่มขู่ประชาชน", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 21},

  # หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม
  {"trob_id": 201, "trob_group": "หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม (ป.อาญา)", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๒๐๐ ว.๑", "trob_article_label": "เจ้าพนักงานในการยุติธรรมกระทำหรือไม่กระทำการในตำแหน่งเพื่อจะช่วยบุคคลใดมิให้ต้องโทษ หรือได้รับโทษน้อยลง", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 22},
  {"trob_id": 202, "trob_group": "หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม (ป.อาญา)", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๒๐๐ ว.๒", "trob_article_label": "เพื่อจะแกล้งบุคคลใดให้ต้องรับโทษหรือรับโทษหนักขึ้น", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 23},
  {"trob_id": 203, "trob_group": "หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม (ป.อาญา)", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๒๐๑", "trob_article_label": "เจ้าพนักงานในการยุติธรรมรับสินบน", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 24},
  {"trob_id": 204, "trob_group": "หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม (ป.อาญา)", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๒๐๒", "trob_article_label": "เจ้าพนักงานในการยุติธรรมกระทำหรือไม่กระทำการอย่างใดโดยเห็นแก่ทรัพย์สินซึ่งได้เรียก/รับไว้ก่อนได้รับแต่งตั้งในตำแหน่งนั้น", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 25},
  {"trob_id": 205, "trob_group": "หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม (ป.อาญา)", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๒๐๓", "trob_article_label": "เจ้าพนักงานป้องกันหรือขัดขวางมิให้การเป็นไปตามคำพิพากษาหรือคำสั่งของศาล", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 26},
  {"trob_id": 206, "trob_group": "หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม (ป.อาญา)", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๒๐๔ ว.๑", "trob_article_label": "เจ้าพนักงานผู้ควบคุมผู้ต้องขัง ทำให้ผู้ต้องขังหลุดพ้นจากการคุมขัง", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 27},
  {"trob_id": 207, "trob_group": "หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม (ป.อาญา)", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๒๐๔ ว.๒", "trob_article_label": "ผู้หลุดพ้นจากการคุมขังโทษหนัก หรือ ๓ คน ขึ้นไป", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 28},
  {"trob_id": 208, "trob_group": "หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม (ป.อาญา)", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๒๐๕ ว.๑", "trob_article_label": "เจ้าพนักงานทำให้ผู้ต้องขังหลุดพ้นจากการคุมขังโดยประมาท", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 29},
  {"trob_id": 209, "trob_group": "หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม (ป.อาญา)", "trob_law_name": "ประมวลกฎหมายอาญา", "trob_article_no": "มาตรา ๒๐๕ ว.๒", "trob_article_label": "ผู้หลุดพ้นจากการคุมขังโทษหนัก หรือ ๓ คน ขึ้นไป (โดยประมาท)", "p_principal": 10, "p_accessory": 10, "trob_sort_order": 30},

  # ๒. พระราชบัญญัติว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒
  {"trob_id": 301, "trob_group": "๒. พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_law_name": "พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_article_no": "มาตรา ๔", "trob_article_label": "พนักงานยักยอกทรัพย์", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 31},
  {"trob_id": 302, "trob_group": "๒. พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_law_name": "พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_article_no": "มาตรา ๕", "trob_article_label": "พนักงานใช้อำนาจหน้าที่โดยมิชอบ ข่มขืนใจผู้อื่นให้มอบทรัพย์สิน หรือประโยชน์อื่นใดแก่ตนหรือผู้อื่น", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 32},
  {"trob_id": 303, "trob_group": "๒. พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_law_name": "พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_article_no": "มาตรา ๖", "trob_article_label": "พนักงานเรียกรับหรือรับสินบน", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 33},
  {"trob_id": 304, "trob_group": "๒. พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_law_name": "พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_article_no": "มาตรา ๗", "trob_article_label": "พนักงานกระทำการหรือไม่กระทำการอย่างใดโดยเห็นแก่ทรัพย์สินซึ่งได้เรียกหรือรับไว้ก่อนได้รับแต่งตั้งเป็นพนักงานในหน้าที่นั้น", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 34},
  {"trob_id": 305, "trob_group": "๒. พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_law_name": "พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_article_no": "มาตรา ๘", "trob_article_label": "พนักงานใช้อำนาจในหน้าที่โดยทุจริต จัดการทรัพย์อันเป็นการเสียหาย", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 35},
  {"trob_id": 306, "trob_group": "๒. พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_law_name": "พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_article_no": "มาตรา ๙", "trob_article_label": "พนักงานมีส่วนได้เสียเนื่องด้วยกิจการที่ตนมีหน้าที่จัดการ หรือดูแล", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 36},
  {"trob_id": 307, "trob_group": "๒. พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_law_name": "พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_article_no": "มาตรา ๑๐", "trob_article_label": "พนักงานจ่ายทรัพย์เกิน เพื่อประโยชน์ของตนเองหรือผู้อื่น", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 37},
  {"trob_id": 308, "trob_group": "๒. พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_law_name": "พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒", "trob_article_no": "มาตรา ๑๑", "trob_article_label": "พนักงานปฏิบัติหรือละเว้นการปฏิบัติหน้าที่โดยมิชอบเพื่อให้เกิดความเสียหายแก่ผู้หนึ่งผู้ใดหรือปฏิบัติหรือละเว้นการปฏิบัติหน้าที่โดยทุจริต", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 38},

  # ๓. พระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๔๒ และที่แก้ไขเพิ่มเติม
  {"trob_id": 401, "trob_group": "๓. พ.ร.ป. ป.ป.ช. พ.ศ. ๒๕๔๒ (และแก้ไขเพิ่มเติม ฉบับ ๒, ๓)", "trob_law_name": "พ.ร.บ. ประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๔๒", "trob_article_no": "มาตรา ๑๒๓ (๔๒)", "trob_article_label": "เจ้าหน้าที่ของรัฐปฏิบัติหรือละเว้นการปฏิบัติอย่างใด เพื่อให้ผู้อื่นเชื่อว่ามีตำแหน่งหน้าที่ เพื่อแสวงหาประโยชน์ที่มิควรได้ (ใช้บังคับ ๑๘ พ.ย. ๒๕๔๒ ถึง ๒๑ ก.ค. ๒๕๖๑)", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 39},
  {"trob_id": 402, "trob_group": "๓. พ.ร.ป. ป.ป.ช. พ.ศ. ๒๕๔๒ (และแก้ไขเพิ่มเติม ฉบับ ๒, ๓)", "trob_law_name": "พ.ร.บ. ประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๔๒", "trob_article_no": "มาตรา ๑๒๓/๑ (๔๒)", "trob_article_label": "เจ้าหน้าที่ของรัฐปฏิบัติหรือละเว้นการปฏิบัติหน้าที่หรือใช้อำนาจในตำแหน่งหน้าที่โดยมิชอบเพื่อให้เกิดความเสียหายแก่ผู้หนึ่งผู้ใดหรือปฏิบัติหรือละเว้นการปฏิบัติหน้าที่โดยทุจริต (ใช้บังคับ ๑๙ เม.ย. ๒๕๕๔ ถึง ๒๑ ก.ค. ๒๕๖๑)", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 40},
  {"trob_id": 403, "trob_group": "๓. พ.ร.ป. ป.ป.ช. พ.ศ. ๒๕๔๒ (และแก้ไขเพิ่มเติม ฉบับ ๒, ๓)", "trob_law_name": "พ.ร.บ. ประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๔๒", "trob_article_no": "มาตรา ๑๒๓/๒ (๔๒)", "trob_article_label": "เจ้าหน้าที่ของรัฐเรียกรับสินบน (ใช้บังคับ ๑๐ ก.ค. ๒๕๕๘ ถึง ๒๑ ก.ค. ๒๕๖๑)", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 41},
  {"trob_id": 404, "trob_group": "๓. พ.ร.ป. ป.ป.ช. พ.ศ. ๒๕๔๒ (และแก้ไขเพิ่มเติม ฉบับ ๒, ๓)", "trob_law_name": "พ.ร.บ. ประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๔๒", "trob_article_no": "มาตรา ๑๒๓/๓ (๔๒)", "trob_article_label": "เจ้าหน้าที่ของรัฐปฏิบัติหน้าที่ไม่ชอบโดยเห็นแก่รับสินบนที่เรียกรับ ก่อนรับตำแหน่ง (ใช้บังคับ ๑๐ ก.ค. ๒๕๕๘ ถึง ๒๑ ก.ค. ๒๕๖๑)", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 42},

  # ๔. พระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑
  {"trob_id": 405, "trob_group": "๔. พ.ร.ป. ป.ป.ช. พ.ศ. ๒๕๖๑ (บังคับใช้ ๒๒ ก.ค. ๒๕๖๑ เป็นต้นไป)", "trob_law_name": "พ.ร.บ. ประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑", "trob_article_no": "มาตรา ๑๗๑ (๖๑)", "trob_article_label": "เจ้าพนักงานของรัฐปฏิบัติหรือละเว้นการปฏิบัติอย่างใด เพื่อให้ผู้อื่นเชื่อว่ามีตำแหน่งหน้าที่ เพื่อแสวงหาประโยชน์ที่มิควรได้", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 43},
  {"trob_id": 406, "trob_group": "๔. พ.ร.ป. ป.ป.ช. พ.ศ. ๒๕๖๑ (บังคับใช้ ๒๒ ก.ค. ๒๕๖๑ เป็นต้นไป)", "trob_law_name": "พ.ร.บ. ประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑", "trob_article_no": "มาตรา ๑๗๒ (๖๑)", "trob_article_label": "เจ้าพนักงานของรัฐปฏิบัติหรือละเว้นการปฏิบัติหน้าที่หรือใช้อำนาจในตำแหน่งหน้าที่โดยมิชอบเพื่อให้เกิดความเสียหายแก่ผู้หนึ่งผู้ใดหรือปฏิบัติหรือละเว้นการปฏิบัติหน้าที่โดยทุจริต", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 44},
  {"trob_id": 407, "trob_group": "๔. พ.ร.ป. ป.ป.ช. พ.ศ. ๒๕๖๑ (บังคับใช้ ๒๒ ก.ค. ๒๕๖๑ เป็นต้นไป)", "trob_law_name": "พ.ร.บ. ประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑", "trob_article_no": "มาตรา ๑๗๓ (๖๑)", "trob_article_label": "เจ้าพนักงานของรัฐเรียกรับสินบน", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 45},
  {"trob_id": 408, "trob_group": "๔. พ.ร.ป. ป.ป.ช. พ.ศ. ๒๕๖๑ (บังคับใช้ ๒๒ ก.ค. ๒๕๖๑ เป็นต้นไป)", "trob_law_name": "พ.ร.บ. ประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑", "trob_article_no": "มาตรา ๑๗๔ (๖๑)", "trob_article_label": "เจ้าพนักงานของรัฐปฏิบัติหน้าที่ไม่ชอบโดยเห็นแก่รับสินบนที่เรียกรับ ก่อนรับตำแหน่ง", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 46},

  # ๕. พระราชบัญญัติการจัดซื้อจัดจ้างฯ ๒๕๖๐ และ พ.ร.บ. ฮั้วประมูล ๒๕๔๒
  {"trob_id": 501, "trob_group": "๕. พ.ร.บ. จัดซื้อจัดจ้างฯ ๒๕๖๐ และ ฮั้วประมูล ๒๕๔๒", "trob_law_name": "พ.ร.บ. การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐", "trob_article_no": "มาตรา ๑๒๐", "trob_article_label": "ผู้มีหน้าที่ปฏิบัติการจัดซื้อจัดจ้างปฏิบัติหรือละเว้นการปฏิบัติโดยมิชอบ", "p_principal": 15, "p_accessory": 10, "trob_sort_order": 47},
  {"trob_id": 502, "trob_group": "๕. พ.ร.บ. จัดซื้อจัดจ้างฯ ๒๕๖๐ และ ฮั้วประมูล ๒๕๔๒", "trob_law_name": "พ.ร.บ. ว่าด้วยความผิดเกี่ยวกับการเสนอราคาต่อหน่วยงานของรัฐ พ.ศ. ๒๕๔๒", "trob_article_no": "มาตรา ๑๐", "trob_article_label": "เจ้าหน้าที่ใช้อำนาจเอื้อประโยชน์ในการเสนอราคา", "p_principal": 20, "p_accessory": 20, "trob_sort_order": 48},
  {"trob_id": 503, "trob_group": "๕. พ.ร.บ. จัดซื้อจัดจ้างฯ ๒๕๖๐ และ ฮั้วประมูล ๒๕๔๒", "trob_law_name": "พ.ร.บ. ว่าด้วยความผิดเกี่ยวกับการเสนอราคาต่อหน่วยงานของรัฐ พ.ศ. ๒๕๔๒", "trob_article_no": "มาตรา ๑๒", "trob_article_label": "เจ้าหน้าที่ละเว้นมิให้มีการแข่งขันราคาอย่างเป็นธรรม", "p_principal": 20, "p_accessory": 15, "trob_sort_order": 49}
]

sql_lines = []
sql_lines.append("-- ==========================================================================")
sql_lines.append("-- SQL Migration & Seed Script for tbl_res_offense_basis")
sql_lines.append("-- ฐานข้อมูลมาตราและความผิด 49 รายการ พร้อมตารางอายุความ (ตัวการ vs ผู้สนับสนุน)")
sql_lines.append("-- อ้างอิงเอกสารการประชุม 20 ส.ค. 2569 (Adobe Scan 20 ส.ค. 2026 / Adobe Scan 20 ส.ค. 2026 (1))")
sql_lines.append("-- ==========================================================================\n")

sql_lines.append("-- 1. Ensure Columns for Prescription (อายุความตัวการ / อายุความผู้สนับสนุน) exist")
sql_lines.append("ALTER TABLE IF EXISTS public.tbl_res_offense_basis")
sql_lines.append("  ADD COLUMN IF NOT EXISTS trob_prescription_years_principal integer DEFAULT 20,")
sql_lines.append("  ADD COLUMN IF NOT EXISTS trob_prescription_years_accessory integer DEFAULT 20,")
sql_lines.append("  ADD COLUMN IF NOT EXISTS p_principal integer DEFAULT 20,")
sql_lines.append("  ADD COLUMN IF NOT EXISTS p_accessory integer DEFAULT 20;\n")

sql_lines.append("-- 2. Clean old rows or insert full 49 items")
sql_lines.append("TRUNCATE TABLE public.tbl_res_offense_basis RESTART IDENTITY CASCADE;\n")

sql_lines.append("INSERT INTO public.tbl_res_offense_basis (")
sql_lines.append("  trob_group, trob_law_name, trob_article_no, trob_article_label,")
sql_lines.append("  trob_prescription_years_principal, trob_prescription_years_accessory,")
sql_lines.append("  p_principal, p_accessory, trob_sort_order, is_deleted")
sql_lines.append(") VALUES")

value_rows = []
for item in offenses:
    grp = item["trob_group"].replace("'", "''")
    law = item["trob_law_name"].replace("'", "''")
    art = item["trob_article_no"].replace("'", "''")
    lbl = item["trob_article_label"].replace("'", "''")
    pp = item["p_principal"]
    pa = item["p_accessory"]
    so = item["trob_sort_order"]
    value_rows.append(f"  ('{grp}', '{law}', '{art}', '{lbl}', {pp}, {pa}, {pp}, {pa}, {so}, false)")

sql_lines.append(",\n".join(value_rows) + ";\n")

sql_content = "\n".join(sql_lines)

import os
os.makedirs("sql", exist_ok=True)
with open("sql/seed_tbl_res_offense_basis.sql", "w", encoding="utf-8") as f:
    f.write(sql_content)

print(f"Generated sql/seed_tbl_res_offense_basis.sql with {len(offenses)} items.")