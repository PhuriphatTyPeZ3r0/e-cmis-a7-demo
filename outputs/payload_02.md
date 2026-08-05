# Sub-Agent 2 Output — Process & Flow Architecture Patch (Activity 7)

Generated 2026-08-05. Method: อ่านโครงสร้าง XML ของ
`กิจกรรมที่ 7-V2.0.drawio` (2,514 บรรทัด, 12 diagram pages) แบบ grep/sample
เฉพาะ swimlane/มาตราที่เกี่ยวข้อง (ไม่โหลดทั้งไฟล์) ร่วมกับผลลัพธ์ Sub-Agent 1
(`outputs/payload_01.md`) เป็นฐานกฎหมาย

**สถานะไฟล์ต้นทางที่พบ:** หน้า `TO-BE P1 Context และ Integration`
(id `tobe_p1_context`), `TO-BE P2 Core Workflow` (id `tobe_p2_core`) และ
`TO-BE P3 Exception และ Alternative Flows` (id `tobe_p3_exception`)
มีความสมบูรณ์ในระดับสูงอยู่แล้ว — มีจุดเริ่มต้นที่เลขาธิการฯ (lane `L3`),
กลไก "มติโดยปริยาย" ม.28 (EX-10 / `s10`), Auto-fill/Validation/Routing/
e-Approval/Mail-Merge/SLA Timer (`p1p1`-`p1p6`) และจุดเชื่อมภายนอกบางส่วน
(`p1x1`-`p1x6`) ครบอยู่แล้ว **จึงไม่ได้ Re-architect ผังใหม่ทั้งหมด** แต่ตรวจ
เทียบกับ Integration Matrix ใน payload_01.md แล้วพบช่องว่างที่ยังไม่ตรงตาม
ตัวบท/ยังไม่ครบตาม scope ของงานนี้ 6 จุด ซึ่งเป็นเนื้อหาของ Patch นี้:

1. โหนดจุดเริ่มต้น (`t5`) ยังไม่อ้างอิง **ม.18/4(2)** ซึ่งเป็นฐานอำนาจที่แท้จริง
   ของจุดเริ่มกิจกรรมที่ 7 ตาม payload_01.md (อ้างแต่ SLA รายงาน 213/644)
2. ไม่มี SLA Alert สำหรับ **ม.23 วรรคหนึ่ง — ต้องเริ่มไต่สวนภายใน 60 วัน**
   นับแต่ได้รับเรื่อง/ความปรากฏ (ตรวจสอบทั้งไฟล์แล้ว ไม่พบจุดนี้ในผังหลักเลย
   มีแต่บทลงโทษกรณีล่าช้าใน EX-12/`s12d`)
3. ม.28 (15 วัน) มีอยู่แล้วใน EX-10 (Page 3) แต่ยังไม่ปรากฏเป็น SLA Alert
   ในผังหลัก (Page 2) ที่จุดเริ่มต้นกิจกรรม
4. Digital Platform Services lane (`p1p`) มี 6 กล่อง ไม่ครบ **7 ฟังก์ชั่นดิจิทัล**
   ตาม scope งานนี้ — ขาด "Data Ingestion" และ "Real-time Dashboard" แยกกล่อง
   ชัดเจน (มีเพียงคำอธิบายแทรกอยู่ในกล่องอื่น)
5. จุดเชื่อมภายนอกตาม Integration Matrix (payload_01.md ข้อ 2) ยังขาด: ศาลที่มี
   เขตอำนาจ (หมายจับ ม.19/2), ศาลทหาร (ม.45), ก.พ.ค. (ม.43), นายกรัฐมนตรี
   (ม.42), คณะรัฐมนตรี (ม.46 ว.2), หน่วยงานของรัฐทั่วไป (ม.17/1(4), ม.19) —
   และ `p1x3` เขียนว่า "ศาลปกครอง" แต่ตัวบท (ม.43) ระบุ "ศาลปกครองสูงสุด"
6. กล่อง Activity 4/5/8/10 (`p1a4`, `p1a5`, `p1a8`, `p1a10`) ไม่มีป้าย
   **"สันนิษฐาน"** ทั้งที่ payload_01.md ระบุชัดว่า Activity 4/5/8/10 ไม่มีสเปก
   อ้างอิงและเป็นการอนุมานจากตำแหน่งใน pipeline เท่านั้น

หมายเหตุ: Patch นี้แก้ไข/เพิ่มเติมเฉพาะ `mxCell` ที่เกี่ยวข้องกับ 6 ช่องว่าง
ข้างต้น **ไม่แตะไฟล์ `.drawio` จริง** — ผู้ใช้ต้องคัดลอกเซลล์ไปวางในไฟล์
ต้นฉบับเอง (แนะนำ import เป็น XML ผ่าน Extras > Edit Diagram บนเพจที่ระบุ)

---

# 1. AS-IS vs TO-BE Process Mapping Table

| ลำดับ | กระบวนงานเดิม (AS-IS) | กระบวนงานใหม่ (TO-BE Digital Flow) | ฟังก์ชั่นดิจิทัลที่ยกระดับ |
|---|---|---|---|
| 1 | เลขาธิการฯ พิจารณาสั่งการบนกระดาษ/ระบบสารบรรณทั่วไป โดยไม่ผูกกับฐานอำนาจ ม.18/4(2) อย่างชัดเจนในระบบ | เลขาธิการฯ ลงนามดิจิทัลบนรายงาน 213/644 ในระบบ E-CMIS พร้อม flag ฐานอำนาจ **ม.18/4(2)** อัตโนมัติ (เมื่อเข้าข่ายเจ้าหน้าที่รัฐประพฤติมิชอบ ไม่ใช่ทุจริตต่อหน้าที่) → เปิดเคส "อยู่ระหว่างไต่สวน" | Data Ingestion + Auto-fill/Mapping + Sequential e-Signature (`t5`, แก้ไขในผัง) |
| 2 | ไม่มีการเตือนอัตโนมัติว่าใกล้ครบกำหนด 60 วันในการ**เริ่ม**ไต่สวนตาม ม.23 — ทราบเมื่อสายแล้วจากรายงานสรุปรายเดือน | ระบบตั้งนาฬิกา SLA ทันทีที่เลขาธิการฯ สั่ง (ม.18/4(2)) และยิง Alert ล่วงหน้า 45/55/60 วัน หากยังไม่มีมติรับไว้ไต่สวน (`a1`) — ผูกกับ ม.23 วรรคหนึ่งโดยตรง | SLA Alerts + Real-time Dashboard (โหนดใหม่ `sa2_sla23`) |
| 3 | การกลั่นกรองเบื้องต้นของเลขาธิการฯ ตาม ม.28 รายงานบอร์ดด้วยเอกสารกระดาษทุก 15 วัน นับแบบ manual นับพลาดบ่อย | ระบบ Auto-compile รายงานเสนอบอร์ดทุก 15 วัน + นับนาฬิกา "มติโดยปริยาย" อัตโนมัติจากวันที่บอร์ด**ได้รับรายงาน** (ตรงตาม ม.28) — แสดง badge SLA Alert ที่หน้าจุดเริ่มต้นกิจกรรม ไม่ต้องไปเปิดหน้า Exception ถึงจะเห็น | SLA Alerts (โหนดใหม่ `sa2_sla28`, เชื่อมกับกลไกเดิมใน EX-10/`s10`) |
| 4 | รับ-โอนข้อมูลเรื่องกล่าวหาจากกิจกรรมที่ 4/5 ด้วยการคีย์ซ้ำหรือส่งแฟ้มเอกสาร | Data Ingestion อัตโนมัติจากฐานข้อมูลกลาง E-CMIS (กจ.4/5) ไม่คีย์ซ้ำ — **สันนิษฐาน**: รูปแบบ/ช่องทางเชื่อมโยงจริงยังไม่ยืนยันกับเจ้าของกิจกรรม 4/5 | Data Ingestion (โหนดใหม่ `p1p0` แยกจาก Auto-fill) |
| 5 | ผู้บริหารติดตามความคืบหน้าคดีผ่านรายงาน Excel รายสัปดาห์/รายเดือน | Real-time Dashboard แสดงสถานะคดีทุกขั้น + นับถอยหลัง SLA รายมาตรา (ม.23 = 60 วัน, ม.28 = 15 วัน, ม.38 = 60 วัน) แบบ real-time | Real-time Dashboard (โหนดใหม่ `p1p7`) |
| 6 | จุดเชื่อมกับหน่วยงานภายนอก (ศาล, อัยการ, ป.ป.ช., ต้นสังกัด) ผูกด้วยหนังสือราชการ ไม่มี boundary ในผัง Context ครบทุกหน่วยงานตามตัวบท | เพิ่ม boundary point ให้ศาลที่มีเขตอำนาจ (หมายจับ ม.19/2), ศาลทหาร (ม.45), ก.พ.ค. (ม.43), นายกรัฐมนตรี (ม.42), คณะรัฐมนตรี (ม.46 ว.2), หน่วยงานของรัฐทั่วไป — ทุกจุดยังเป็นหนังสือราชการเหมือนเดิม (กฎหมายไม่ได้เปิดช่อง API) แต่ระบบบันทึกและติดตามสถานะเป็น digital record | Auto/Manual Routing + Real-time Dashboard (โหนดใหม่ `sa2_x*` 6 จุด) |
| 7 | เอกสารอ้างอิงกิจกรรม 4/5/8/10 ในผัง Context ไม่มีป้ายระบุระดับความเชื่อมั่นของข้อมูล ผู้อ่านอาจเข้าใจว่ายืนยันแล้ว | กล่อง Activity 4/5/8/10 ระบุ "(สันนิษฐาน)" ชัดเจน พร้อมอ้างอิงมาตราที่ใช้อนุมาน — ต้องยืนยันกับเจ้าของสเปกกิจกรรมนั้นก่อนพัฒนาจริง | ไม่มีฟังก์ชั่นใหม่ — เป็นการควบคุมคุณภาพเอกสารสถาปัตยกรรม (Governance) |
| 8 | ป้ายจุดเชื่อม "ศาลปกครอง" ในผัง Context ใช้ชื่อไม่ตรงตัวบท | แก้เป็น "ศาลปกครองสูงสุด" ตรงตาม ม.43 (ฟ้องภายใน 90 วันนับแต่ทราบ/ถือว่าทราบคำวินิจฉัยอุทธรณ์ของ ก.พ.ค.) | ความถูกต้องของข้อมูลอ้างอิงทางกฎหมาย (ไม่ใช่ฟังก์ชั่นดิจิทัลใหม่) |

---

# 2. BPMN Process Breakdown Table

| Step ID | Process Name | Swimlane / Actor | Input/Output Data | System Action |
|---|---|---|---|---|
| SA2-01 | รับเรื่อง/สำนวนจากกิจกรรมที่ 4 หรือ 5 เข้าสู่กิจกรรมที่ 7 | ระบบ E-CMIS (Automation) — swimlane `L12` | In: เรื่องกล่าวหา, ข้อมูลผู้ถูกกล่าวหา, วันที่รับเรื่อง (สันนิษฐาน จาก กจ.4/5) / Out: เคส E-CMIS พร้อมวันที่เริ่มนับ SLA ม.23 | **Data Ingestion** — ดึงข้อมูลอัตโนมัติผ่าน DB Sync ไม่คีย์ซ้ำ (โหนด `p1p0` ใหม่) |
| SA2-02 (= `t5` เดิม, แก้ไข) | เลขาธิการฯ พิจารณาสั่ง "ให้ดำเนินการต่อไป" | เลขาธิการคณะกรรมการ ป.ป.ท. — swimlane `L3` | In: รายงาน 213/644 / Out: คำสั่งเลขาธิการฯ ลงนามดิจิทัล + เหตุผล (เข้าข่ายประพฤติมิชอบ ไม่ใช่ทุจริตต่อหน้าที่) | **Sequential e-Signature** — ผูกฐานอำนาจ **ม.18/4(2)** อัตโนมัติในบันทึกคำสั่ง; SLA 213: รอลงนาม 5 วัน/ลงนามเสร็จ 3 วัน — 644: เสนอ 15 วัน/ลงนาม 15 วัน |
| SA2-03 (โหนดใหม่ `sa2_sla23`) | ตรวจสอบ/แจ้งเตือน SLA เริ่มไต่สวน | ระบบ E-CMIS (Automation) — swimlane `L12` | In: วันที่เลขาธิการฯ สั่ง (SA2-02) / Out: Alert ล่วงหน้า 45/55/60 วัน ไปยัง `L3`/`L8`/`L9` | **SLA Alerts** — ม.23 วรรคหนึ่ง: ต้องมีมติรับไว้ไต่สวน (`a1`) ภายใน 60 วัน นับแต่ได้รับเรื่อง/ความปรากฏ ไม่เช่นนั้น escalate ตาม EX-05 |
| SA2-04 (โหนดใหม่ `sa2_sla28`) | ตรวจสอบ/แจ้งเตือน SLA รายงาน 15 วัน + มติโดยปริยาย | ระบบ E-CMIS (Automation) — swimlane `L12` | In: คำสั่งเบื้องต้นของเลขาธิการฯ (รับ/ไม่รับ/จำหน่าย) / Out: Auto-compile รายงานเสนอบอร์ดทุก 15 วัน + สถานะ "มติโดยปริยาย" หากบอร์ดไม่มีมติต่างภายใน 15 วันนับแต่รับรายงาน | **SLA Alerts** — ม.28; รายละเอียดเต็มอยู่ที่ Page 3 `EX-10`/`s10` (กลไกเดิม) — โหนดนี้เป็น badge สรุปที่ผังหลัก |
| SA2-05 (= `t9`-`t11` เดิม) | กระจาย/พิจารณาชั้นอนุกลั่นกรองฯ | คณะอนุกรรมการกลั่นกรองฯ 1-8 — swimlane `L8` | In: สำนวนอิเล็กทรอนิกส์ / Out: มติ + ความเห็น ⏱ 15 วัน | **Auto/Manual Routing** — Round-Robin ≤40 เรื่อง/คณะ (ของเดิม ไม่แก้ไข) |
| SA2-06 (= `a1`-`a2` เดิม) | บันทึกมติรับไว้ไต่สวน + แต่งตั้งองค์คณะ | คณะกรรมการ ป.ป.ท. / ฝ่ายเลขานุการบอร์ด — swimlane `L9`/`L10` | In: มติที่ประชุม / Out: คำสั่งแต่งตั้งผู้ไต่สวน (ม.24) — เวลาที่บันทึกมตินี้ปิดนาฬิกา SA2-03 | **Auto-fill/Mapping** + ปิด SLA Alert ม.23 อัตโนมัติเมื่อบันทึกมติสำเร็จ |
| SA2-07 (โหนดใหม่ `p1p7`) | ติดตามสถานะคดีแบบภาพรวม | ผู้บริหาร/กบต. — cross-cutting (ไม่ผูก swimlane เดียว) | In: สถานะทุกเคสจาก SA2-01 ถึง SA2-06 และขั้นถัดไป / Out: Dashboard แสดงคดีใกล้ครบ 60 วัน (ม.23), 15 วัน (ม.28), 60 วัน (ม.38) | **Real-time Dashboard** |
| SA2-08 (โหนดใหม่ `sa2_x_court`) | ยื่นคำร้องขอหมายจับ/หมายค้น | ศาลที่มีเขตอำนาจ (ภายนอก) | In: คำร้องพร้อมเหตุผลหลบหนี / Out: หมายจับ/หมายค้น | Integration Boundary — หนังสือราชการ (ม.19/2, ม.17/1(3)) — **สันนิษฐาน** ลำดับเวลาว่าเกิดหลังมติชี้มูล (ตาม EX-12/`s12a`) ต้องยืนยันซ้ำ |
| SA2-09 (โหนดใหม่ `sa2_x_kpc`) | รับคำวินิจฉัยอุทธรณ์ | ก.พ.ค. (ภายนอก) | In: คำอุทธรณ์จากผู้ถูกลงโทษ (ยื่นตรง ไม่ผ่าน กจ.7) / Out: คำวินิจฉัย — หากฟังขึ้น ส่งกลับให้บอร์ดทบทวน | Integration Boundary (ม.43) |
| SA2-10 (โหนดใหม่ `sa2_x_pm`) | รายงานกรณีต้นสังกัดไม่มีอำนาจลงโทษ | นายกรัฐมนตรี (ภายนอก) | In: รายงานจากบอร์ด / Out: คำสั่งลงโทษ/ให้พ้นตำแหน่ง | Integration Boundary (ม.42) |
| SA2-11 (โหนดใหม่ `sa2_x_cabinet`) | รายงานกรณีหน่วยงานเพิกเฉยเรียกค่าเสียหาย | คณะรัฐมนตรี (ภายนอก) | In: รายงานจากบอร์ด (ต่อจาก EX-11/`s11d`) / Out: รับทราบ + เผยแพร่สาธารณะ | Integration Boundary (ม.46 ว.2) |
| SA2-12 (โหนดใหม่ `sa2_x_military`) | คดีในอำนาจศาลทหาร | ศาลทหาร / อัยการทหาร (ภายนอก) | In: สำนวนคดีอาญาที่จำเลยอยู่ในอำนาจศาลทหาร / Out: ผลคดี | Integration Boundary (ม.45) — ผ่านกรอบเดียวกับ ม.44 |
| SA2-13 (โหนดใหม่ `sa2_x_govorg`) | ขอเข้าถึงข้อมูล/แจ้งความเสียหายเพื่อเรียกคืน | หน่วยงานของรัฐ (ทั่วไป, ภายนอก) | In-Out: คำขอข้อมูล/ความร่วมมือ ↔ ข้อมูล/เอกสาร (ม.17/1(4), ม.19); แจ้งความเสียหายที่ต้องเรียกคืน (ม.46) | Integration Boundary — **สันนิษฐาน** ช่องทาง ยังไม่มีระเบียบการเข้าถึงข้อมูลที่ยืนยันแล้ว |

---

# 3. Draw.io XML Patch

```xml
<!--
  Sub-Agent 2 Patch — Activity 7 TO-BE Process Flow
  เป้าไฟล์: "กิจกรรมที่ 7-V2.0.drawio" (ไม่แก้ไฟล์จริง — คัดลอกไปวางเอง)
  แบ่งเป็น 3 กลุ่มตาม diagram page ปลายทาง:
    A) page id="tobe_p2_core"    (name="TO-BE P2 Core Workflow (Swimlane)")
    B) page id="tobe_p1_context" (name="TO-BE P1 Context และ Integration")
  หมายเหตุ pageHeight: หลัง merge กลุ่ม B แนะนำขยาย pageHeight ของ
  tobe_p1_context จาก 1100 เป็นอย่างน้อย 1400 เพื่อรองรับ frame ใหม่
  (mxGraphModel เดิมบรรทัด 1811) — ไม่รวมไว้ในนี้เพราะ patch นี้ให้เฉพาะ
  mxCell ตามข้อกำหนด
-->

<!-- ======================================================================
     A) page: tobe_p2_core — จุดเริ่มต้น เลขาธิการฯ + SLA Alerts (ม.18/4(2), ม.23, ม.28)
     ====================================================================== -->

<!-- A.1 แก้ไขเซลล์เดิม t5 (S1) — เพิ่มฐานอำนาจ ม.18/4(2) -->
<mxCell id="t5" value="&#9733; &lt;b&gt;S1 &#8212; จุดเริ่มต้นกิจกรรมที่ 7&lt;/b&gt;&lt;br&gt;เลขาธิการฯ พิจารณาและ&lt;b&gt;ลงนามดิจิทัล&lt;/b&gt; บนรายงาน 213 / 644&lt;br&gt;&#9201; SLA 213: รอลงนาม 5 วัน / ลงนามเสร็จ 3 วัน — 644: เสนอ 15 วัน / ลงนาม 15 วัน&lt;br&gt;&lt;font color=&quot;#b85450&quot;&gt;ฐานอำนาจ: &lt;b&gt;ม.18/4(2)&lt;/b&gt; — เมื่อความปรากฏว่ามีเจ้าหน้าที่รัฐประพฤติมิชอบ (ไม่เข้าข่ายทุจริตต่อหน้าที่) และเลขาธิการฯ สั่งให้ดำเนินการต่อไป พนักงาน ป.ป.ท. มีอำนาจไต่สวนภายใต้การกำกับของคณะกรรมการ ป.ป.ท. ทันที&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=3;fontSize=11;align=left;spacingLeft=6;" vertex="1" parent="L3">
  <mxGeometry x="20" y="630" width="220" height="150" as="geometry" />
</mxCell>

<!-- A.2 โหนดใหม่ — SLA Alert ม.23 วรรคหนึ่ง (60 วัน เริ่มไต่สวน) -->
<mxCell id="sa2_sla23" value="&lt;b&gt;[SLA Alert — ม.23 ว.1]&lt;/b&gt;&lt;br&gt;ต้อง&lt;b&gt;เริ่ม&lt;/b&gt;ไต่สวนภายใน &lt;b&gt;60 วัน&lt;/b&gt; นับแต่วันได้รับเรื่องหรือความปรากฏ (จุดเริ่มนับจาก กจ.4 — สันนิษฐาน)&lt;br&gt;ยิง Alert ล่วงหน้า 45 / 55 / 60 วัน หากยังไม่มีมติรับไว้ไต่สวน (a1)&lt;br&gt;&lt;font color=&quot;#b85450&quot;&gt;เกินกำหนด → ต้องสอบหาผู้รับผิด (ม.23 ว.3) ดู EX-12/s12d&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=10;align=left;spacingLeft=6;" vertex="1" parent="L12">
  <mxGeometry x="15" y="650" width="230" height="120" as="geometry" />
</mxCell>

<!-- A.3 โหนดใหม่ — SLA Alert ม.28 (15 วัน รายงาน + มติโดยปริยาย) -->
<mxCell id="sa2_sla28" value="&lt;b&gt;[SLA Alert — ม.28]&lt;/b&gt;&lt;br&gt;เลขาธิการฯ รายงานผลกลั่นกรองเบื้องต้นให้บอร์ดทราบ&lt;b&gt;ทุก 15 วัน&lt;/b&gt;&lt;br&gt;หากบอร์ดไม่มีมติเป็นอย่างอื่นภายใน &lt;b&gt;15 วัน&lt;/b&gt; นับแต่รับรายงาน → ถือเป็นมติบอร์ดตามคำสั่งเบื้องต้นของเลขาธิการฯ&lt;br&gt;&lt;font color=&quot;#b85450&quot;&gt;รายละเอียดกลไกเต็ม: Page 3 &#8594; EX-10 (s10)&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=10;align=left;spacingLeft=6;" vertex="1" parent="L12">
  <mxGeometry x="15" y="780" width="230" height="120" as="geometry" />
</mxCell>

<!-- A.4 เส้นเชื่อม (dashed, informational — ไม่ใช่ control flow หลัก) -->
<mxCell id="sa2_e1" style="edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;dashed=1;endArrow=open;" edge="1" parent="p2-1" source="sa2_sla23" target="t5">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
<mxCell id="sa2_e2" value="ปิด Alert เมื่อบันทึกมติสำเร็จ" style="edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;dashed=1;endArrow=open;fontSize=9;" edge="1" parent="p2-1" source="sa2_sla23" target="a1">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
<mxCell id="sa2_e3" style="edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;dashed=1;endArrow=open;" edge="1" parent="p2-1" source="sa2_sla28" target="t5">
  <mxGeometry relative="1" as="geometry" />
</mxCell>

<!-- ======================================================================
     B) page: tobe_p1_context — 7 Digital Capabilities + Integration Boundaries + สันนิษฐาน caveat
     ====================================================================== -->

<!-- B.1 แก้ไข lane p1p ให้สูงขึ้นรองรับแถวที่ 2 (Data Ingestion / Real-time Dashboard) -->
<mxCell id="p1p" value="&lt;b&gt;Digital Platform Services (ใช้ร่วมทุกโมดูลของกิจกรรมที่ 7) — 7 ฟังก์ชั่นดิจิทัลหลัก&lt;/b&gt;" style="swimlane;html=1;startSize=34;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=13;" vertex="1" parent="p1-1">
  <mxGeometry x="120" y="760" width="1500" height="220" as="geometry" />
</mxCell>

<!-- B.2 แก้ไขป้าย p1p4 — เน้น Sequential e-Signature ให้ตรงชื่อ capability -->
<mxCell id="p1p4" value="&lt;b&gt;Sequential e-Signature&lt;/b&gt;&lt;br&gt;e-Approval แบบลำดับชั้น + Multi-signer Digital Signature (ปปท. ๗-๐๒)" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffffff;strokeColor=#82b366;fontSize=10;" vertex="1" parent="p1p">
  <mxGeometry x="750" y="44" width="235" height="70" as="geometry" />
</mxCell>

<!-- B.3 แก้ไขป้าย p1p6 — เน้น SLA Alerts ให้ตรงชื่อ capability -->
<mxCell id="p1p6" value="&lt;b&gt;SLA Alerts Engine&lt;/b&gt;&lt;br&gt;ผูกกรอบเวลาตามมาตรา (ม.23=60วัน / ม.28=15วัน / ม.38=60วัน) + Notification/RBAC/Audit Log" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffffff;strokeColor=#82b366;fontSize=10;" vertex="1" parent="p1p">
  <mxGeometry x="1240" y="44" width="245" height="70" as="geometry" />
</mxCell>

<!-- B.4 โหนดใหม่ — Data Ingestion (แถว 2) -->
<mxCell id="p1p0" value="&lt;b&gt;Data Ingestion&lt;/b&gt;&lt;br&gt;รับ-นำเข้าเรื่อง/สำนวนจากกิจกรรมที่ 4 และ 5 อัตโนมัติผ่าน API/DB Sync&lt;br&gt;&lt;font color=&quot;#b85450&quot;&gt;สันนิษฐาน — รอยืนยันรูปแบบเชื่อมโยงจริงกับเจ้าของ กจ.4/5&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffffff;strokeColor=#82b366;fontSize=10;" vertex="1" parent="p1p">
  <mxGeometry x="15" y="124" width="235" height="80" as="geometry" />
</mxCell>

<!-- B.5 โหนดใหม่ — Real-time Dashboard (แถว 2) -->
<mxCell id="p1p7" value="&lt;b&gt;Real-time Dashboard&lt;/b&gt;&lt;br&gt;Executive Dashboard ติดตามสถานะคดี/SLA ทุกขั้นแบบ real-time — เตือนคดีใกล้ครบ 60 วัน (ม.23) / 15 วัน (ม.28) / 60 วัน (ม.38)" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffffff;strokeColor=#82b366;fontSize=10;" vertex="1" parent="p1p">
  <mxGeometry x="260" y="124" width="235" height="80" as="geometry" />
</mxCell>

<!-- B.6 แก้ไข p1x3 — แก้ชื่อให้ตรงตัวบท ม.43 -->
<mxCell id="p1x3" value="&lt;b&gt;ศาลปกครองสูงสุด&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 10px;&quot;&gt;ม.43 — ฟ้องภายใน 90 วันนับแต่ทราบ/ถือว่าทราบคำวินิจฉัยอุทธรณ์ของ ก.พ.ค.&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffe6cc;strokeColor=#d79b00;fontSize=11;" vertex="1" parent="p1-1">
  <mxGeometry x="1320" y="440" width="300" height="55" as="geometry" />
</mxCell>

<!-- B.7 แก้ไข p1a4/p1a5/p1a8/p1a10 — เติมป้ายสันนิษฐานตาม Integration Matrix -->
<mxCell id="p1a4" value="&lt;b&gt;กิจกรรมที่ 4&lt;/b&gt; รับเรื่องร้องเรียน&lt;br&gt;&lt;font style=&quot;font-size: 9px;color:#b85450&quot;&gt;(สันนิษฐาน — ตาม ม.29, ไม่มีสเปกอ้างอิงในงานนี้)&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=11;" vertex="1" parent="p1-1">
  <mxGeometry x="120" y="150" width="300" height="60" as="geometry" />
</mxCell>
<mxCell id="p1a5" value="&lt;b&gt;กิจกรรมที่ 5&lt;/b&gt; ไต่สวนข้อเท็จจริง&lt;br&gt;&lt;font style=&quot;font-size: 10px;&quot;&gt;(จุดเชื่อมสำคัญที่สุด — สองทาง)&lt;/font&gt;&lt;br&gt;&lt;font style=&quot;font-size: 9px;color:#b85450&quot;&gt;(สันนิษฐาน — ตาม ม.25-28, ไม่มีสเปกอ้างอิงในงานนี้)&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=11;strokeWidth=2;" vertex="1" parent="p1-1">
  <mxGeometry x="120" y="240" width="300" height="80" as="geometry" />
</mxCell>
<mxCell id="p1a8" value="&lt;b&gt;กิจกรรมที่ 8&lt;/b&gt; ตรวจสอบประวัติและกระบวนงานภายหลังมติ&lt;br&gt;&lt;font style=&quot;font-size: 9px;color:#b85450&quot;&gt;(สันนิษฐาน — ตาม ม.24, ม.29-37, ไม่มีสเปกอ้างอิงในงานนี้)&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=11;" vertex="1" parent="p1-1">
  <mxGeometry x="120" y="430" width="300" height="70" as="geometry" />
</mxCell>
<mxCell id="p1a10" value="&lt;b&gt;กิจกรรมที่ 10&lt;/b&gt; กฎหมายในทางคดี (ผ่านกองกฎหมาย กกม.)&lt;br&gt;&lt;font style=&quot;font-size: 9px;color:#b85450&quot;&gt;(สันนิษฐาน — ตาม ม.38, ม.44, ไม่มีสเปกอ้างอิงในงานนี้)&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=11;" vertex="1" parent="p1-1">
  <mxGeometry x="120" y="520" width="300" height="70" as="geometry" />
</mxCell>

<!-- B.8 โหนดใหม่ — Frame รวมจุดเชื่อมภายนอกที่ยังขาดตาม Integration Matrix -->
<mxCell id="sa2_ext" value="&lt;b&gt;หน่วยงาน/ระบบภายนอกเพิ่มเติม (Sub-Agent 2 Patch — ตาม Integration Matrix payload_01.md)&lt;/b&gt;" style="swimlane;html=1;startSize=34;fillColor=#ffe6cc;strokeColor=#d79b00;fontSize=13;" vertex="1" parent="p1-1">
  <mxGeometry x="120" y="1000" width="1500" height="180" as="geometry" />
</mxCell>
<mxCell id="sa2_x_court" value="&lt;b&gt;ศาลที่มีเขตอำนาจ&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size:9px&quot;&gt;คำร้องขอหมายจับ/หมายค้น (ม.19/2, ม.17/1(3))&lt;br&gt;&lt;span style=&quot;color:#b85450&quot;&gt;สันนิษฐาน: หลังมติชี้มูล ม.38 — ต้องยืนยันกับ กจ.9 (ดู EX-12/s12a)&lt;/span&gt;&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffffff;strokeColor=#d79b00;fontSize=10;" vertex="1" parent="sa2_ext">
  <mxGeometry x="15" y="44" width="235" height="100" as="geometry" />
</mxCell>
<mxCell id="sa2_x_military" value="&lt;b&gt;ศาลทหาร&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size:9px&quot;&gt;กรณีผู้ถูกกล่าวหาอยู่ในอำนาจศาลทหาร (ม.45) — ผ่านอัยการทหาร&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffffff;strokeColor=#d79b00;fontSize=10;" vertex="1" parent="sa2_ext">
  <mxGeometry x="260" y="44" width="235" height="100" as="geometry" />
</mxCell>
<mxCell id="sa2_x_kpc" value="&lt;b&gt;ก.พ.ค.&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size:9px&quot;&gt;รับคำอุทธรณ์จากผู้ถูกลงโทษโดยตรง — คำวินิจฉัยฟังขึ้น ส่งกลับบอร์ดทบทวน (ม.43)&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffffff;strokeColor=#d79b00;fontSize=10;" vertex="1" parent="sa2_ext">
  <mxGeometry x="505" y="44" width="235" height="100" as="geometry" />
</mxCell>
<mxCell id="sa2_x_pm" value="&lt;b&gt;นายกรัฐมนตรี&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size:9px&quot;&gt;รายงานกรณีต้นสังกัดไม่มีอำนาจลงโทษ (ม.42) — สั่งลงโทษ/ให้พ้นตำแหน่งได้โดยไม่ต้องสอบซ้ำ&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffffff;strokeColor=#d79b00;fontSize=10;" vertex="1" parent="sa2_ext">
  <mxGeometry x="750" y="44" width="235" height="100" as="geometry" />
</mxCell>
<mxCell id="sa2_x_cabinet" value="&lt;b&gt;คณะรัฐมนตรี&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size:9px&quot;&gt;รายงานกรณีหน่วยงานไม่เรียกค่าเสียหาย/เพิกถอนเอกสารสิทธิ (ม.46 ว.2) — ดู EX-11/s11d&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffffff;strokeColor=#d79b00;fontSize=10;" vertex="1" parent="sa2_ext">
  <mxGeometry x="995" y="44" width="235" height="100" as="geometry" />
</mxCell>
<mxCell id="sa2_x_govorg" value="&lt;b&gt;หน่วยงานของรัฐ (ทั่วไป)&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size:9px&quot;&gt;ขอเข้าถึงข้อมูล/ความร่วมมือ (ม.17/1(4), ม.19); แจ้งความเสียหายที่ต้องเรียกคืน (ม.46)&lt;br&gt;&lt;span style=&quot;color:#b85450&quot;&gt;สันนิษฐาน — ยังไม่มีระเบียบการเข้าถึงข้อมูลที่ยืนยันแล้ว&lt;/span&gt;&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;fillColor=#ffffff;strokeColor=#d79b00;fontSize=10;" vertex="1" parent="sa2_ext">
  <mxGeometry x="1240" y="44" width="245" height="100" as="geometry" />
</mxCell>

<!-- B.9 เส้นเชื่อม p1core -> จุดเชื่อมภายนอกใหม่ทั้ง 6 -->
<mxCell id="sa2_e10" value="คำร้องขอหมายจับ/หมายค้น" style="edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;fontSize=9;dashed=1;" edge="1" parent="p1-1" source="p1core" target="sa2_x_court">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
<mxCell id="sa2_e11" value="สำนวนคดีในอำนาจศาลทหาร" style="edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;fontSize=9;dashed=1;" edge="1" parent="p1-1" source="p1core" target="sa2_x_military">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
<mxCell id="sa2_e12" value="คำวินิจฉัยอุทธรณ์กลับมาทบทวน" style="edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;fontSize=9;dashed=1;startArrow=classic;startFill=1;" edge="1" parent="p1-1" source="p1core" target="sa2_x_kpc">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
<mxCell id="sa2_e13" value="รายงานกรณีต้นสังกัดไม่มีอำนาจ" style="edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;fontSize=9;dashed=1;" edge="1" parent="p1-1" source="p1core" target="sa2_x_pm">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
<mxCell id="sa2_e14" value="รายงานกรณีหน่วยงานเพิกเฉย (ม.46 ว.2)" style="edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;fontSize=9;dashed=1;" edge="1" parent="p1-1" source="p1core" target="sa2_x_cabinet">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
<mxCell id="sa2_e15" value="ขอข้อมูล/ความร่วมมือ ↔ แจ้งเรียกคืนความเสียหาย" style="edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;fontSize=9;dashed=1;startArrow=classic;startFill=1;" edge="1" parent="p1-1" source="p1core" target="sa2_x_govorg">
  <mxGeometry relative="1" as="geometry" />
</mxCell>

<!-- B.10 แก้ไข p1n — เลื่อนตำแหน่งลงให้พ้น frame ใหม่ sa2_ext (เนื้อหาเดิมไม่เปลี่ยน) -->
<mxCell id="p1n" value="&lt;b&gt;หมายเหตุขอบเขต (Scope Note)&lt;/b&gt;&lt;br&gt;• &lt;b&gt;จุดเริ่มต้นของกิจกรรมที่ 7 คือเลขาธิการคณะกรรมการ ป.ป.ท.&lt;/b&gt; — การจัดทำรายงาน 213 และการเสนอตามลำดับชั้น (เจ้าของสำนวน → หัวหน้ากลุ่มงาน → ผอ.กอง/เขต → ผู้ช่วย/รองเลขาธิการฯ) เป็นกระบวนงานภายในกอง/สำนักงาน ป.ป.ท. เขต ซึ่งอยู่ในกิจกรรมที่ 5&lt;br&gt;• e-Meeting / ลงมติ Real-time แบบออนไลน์ ไม่ได้กำหนดใน TOR 7.1-7.4 → ขอบเขตปัจจุบันคือ &quot;บันทึกมติเข้าระบบ&quot; หากต้องการต้องออก Change Request&lt;br&gt;• เรื่อง ก.ก.ม. และผังภายในคณะอนุกลั่นกรองฯ ยังไม่มีคำนิยาม/กระบวนงาน → รอยืนยันก่อนออกแบบ&lt;br&gt;• กิจกรรมที่ 9 (ขอออกหมายจับ) ยืนยันว่าไม่เข้าสู่การพิจารณาของบอร์ด จึงไม่มีเส้นเชื่อมกับกิจกรรมที่ 7&lt;br&gt;&lt;font color=&quot;#b85450&quot;&gt;• [Sub-Agent 2] Activity 4/5/8/10 และจุดเชื่อมภายนอกที่เพิ่มใน frame ด้านล่างเป็นการ&lt;b&gt;สันนิษฐาน&lt;/b&gt;ตาม Integration Matrix (payload_01.md) ทั้งหมด ต้องยืนยันกับเจ้าของสเปกแต่ละกิจกรรมก่อนพัฒนาจริง&lt;/font&gt;" style="rounded=1;html=1;whiteSpace=wrap;align=left;spacingLeft=10;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;verticalAlign=middle;" vertex="1" parent="p1-1">
  <mxGeometry x="120" y="1200" width="1500" height="120" as="geometry" />
</mxCell>
```

---

# 4. หมายเหตุ/ข้อจำกัดของงานนี้ (Sub-Agent 2)

- **ขอบเขตของ Patch:** จงใจไม่แตะ Page 2 ส่วน "มติ 2-5" (`b1`-`e2`) และ Page 3
  EX-01 ถึง EX-12 อื่นนอกเหนือจาก EX-10 เพราะครอบคลุมประเด็นเหล่านั้นครบถ้วน
  ตรงตามตัวบทอยู่แล้วเมื่อตรวจเทียบกับ payload_01.md — การแก้ไขเพิ่มจะเป็น
  การสร้างความซ้ำซ้อนโดยไม่จำเป็น
- **ตัวเลข "7 ฟังก์ชั่นดิจิทัล" ตาม task:** Data Ingestion (`p1p0` ใหม่),
  Auto-fill/Mapping (`p1p1` เดิม), Validation Rules (`p1p2` เดิม),
  Auto/Manual Routing (`p1p3` เดิม), Sequential e-Signature (`p1p4` แก้ไข),
  Real-time Dashboard (`p1p7` ใหม่), SLA Alerts (`p1p6` แก้ไข) — ครบ 7 ตาม
  scope; กล่อง Mail-Merge Template Engine (`p1p5`) เดิมคงไว้เป็นฟังก์ชั่น
  สนับสนุนที่ 8 ไม่ถูกนับใน 7 หลัก
- **จุดที่ยังต้องยืนยัน (สันนิษฐาน, carry-forward จาก payload_01.md):**
  ความสัมพันธ์กับ Activity 4/5/8/10 ทั้งหมด, รูปแบบ Data Ingestion จริง
  (API หรือ manual sync), ช่องทางเชื่อมกับหน่วยงานของรัฐทั่วไป, และลำดับ
  เวลาการขอหมายจับ (ม.19/2) เทียบกับมติชี้มูล — ไม่มีข้อใดถูกยืนยันเป็น
  ข้อเท็จจริงในเอกสารนี้
- **Blocker ที่พบระหว่างทำงาน:** ไม่มี — ไฟล์ .drawio อ่าน/ค้นด้วย grep ได้
  ปกติ (UTF-8, 358 KB, 2,514 บรรทัด, 12 diagram pages) Google Sheet
  ต้นทางที่ระบุใน task เดิม (`01-legal-ba.md`/`02-flow-architect.md`) ไม่ได้
  เปิดตรวจเพิ่มเติมในรอบนี้ เพราะ payload_01.md ระบุว่า MCP เชื่อมต่อ Google
  Drive ที่มีอยู่ไม่รองรับการแก้ไขเซลล์อยู่แล้ว และงานนี้ใช้ payload_01.md
  เป็นแหล่งข้อมูลกฎหมายหลักตามที่ pipeline กำหนด
