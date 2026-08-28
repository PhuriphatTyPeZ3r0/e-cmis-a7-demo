# 📋 Knowledge Transfer — E-CMIS Activity 14 TO-BE Diagram

> **Project**: E-CMIS (Electronic Case Management Information System)  
> **File**: `TOBE_Activity_14_v1_9.drawio`  
> **Last Updated**: 2026-06-01  
> **Status**: Tab 14.1.1 – 14.1.6 เสร็จสมบูรณ์ (22 Session Tabs), Tab 14.2 – 14.6 รอดำเนินการ

---

## 1. ภาพรวมโปรเจค

Activity 14 คือ **ระบบจัดการบัญชีผู้ใช้งาน E-CMIS** ของสำนักงาน ป.ป.ท. โดย TO-BE Diagram แสดง Flow การทำงานแบบ Horizontal Swimlane ทั้งหมดใน Draw.io

### สิ่งที่ทำเสร็จแล้ว
- แปลง Tab 14.1.1 – 14.1.6 (เดิม 6 Tabs) → **22 Session Tabs** ย่อย
- แต่ละ Tab ออกแบบให้พอดี **A4 Portrait** เพื่อ Export ใส่เอกสาร
- เลข SYS ต่อเนื่อง **SYS001 – SYS134** ข้าม Tab ไม่ซ้ำไม่ขาด
- ใส่ **Off-Page Connector** เชื่อมระหว่าง Session

### สิ่งที่ต้องทำต่อ
- Tab **14.2, 14.3, 14.4 (14.4.1–14.4.6), 14.5, 14.6** → ยังเป็น Flow ยาวแบบเดิม ต้อง Split เป็น Session ย่อยเช่นเดียวกัน

---

## 2. โครงสร้างไฟล์

### ไฟล์หลัก

| ไฟล์ | คำอธิบาย |
|---|---|
| `TOBE_Activity_14_v1_9.drawio` | **ไฟล์ Diagram หลัก** ที่ใช้งานจริง (33 Tabs ปัจจุบัน) |
| `TOBE_Activity_14_v1_9.drawio.bak_refactor_tobe` | **Backup ก่อน Split** — ใช้เป็น Source สำหรับ Script อ่านข้อมูลต้นฉบับ |
| `TOBE_Activity_14_v1_9.drawio.bak_antigravity` | Backup เก่า (ก่อน Refactor ครั้งแรก) |

### Scripts

| ไฟล์ | ตำแหน่ง | คำอธิบาย |
|---|---|---|
| `execute_refactor_split_tabs.py` | `scratch/` | **Script หลัก** — อ่าน backup → สร้าง 22 Session Tabs → เขียนกลับไฟล์หลัก |
| `verify_refactored_tabs.py` | `scratch/` | **Script ตรวจสอบ** — เช็ค XML, SYS numbering, duplicate IDs, floating edges |

> [!IMPORTANT]
> Script จะ **อ่านจาก `.bak_refactor_tobe`** เสมอ (ไม่ใช่ไฟล์หลัก) เพื่อให้ได้ข้อมูลต้นฉบับที่สมบูรณ์

---

## 3. Convention & Design Rules

### 3.1 SYS Process Numbering

- ทุก Process (สี่เหลี่ยมมน `rounded=1`) จะมีรหัส **SYS{NNN}** นำหน้า
- เลขต่อเนื่อง **ข้าม Tab** ไม่ขึ้นใหม่แต่ละ Tab
- ปัจจุบัน 14.1.1–14.1.6 ใช้ `SYS001` – `SYS134`
- **Tab ถัดไป (14.2 เป็นต้นไป) ต้องเริ่มที่ `SYS135`**

```
Format: <b>SYS{NNN}</b><br>ชื่อ Process ภาษาไทย
ตัวอย่าง: <b>SYS001</b><br>เข้าสู่ระบบ E-CMIS
```

### 3.2 Off-Page Connector

ใช้เชื่อม Session ที่แยก Tab:

| ประเภท | Label | ตำแหน่ง | Style |
|---|---|---|---|
| **ออก** (ไป Session ถัดไป) | `ต่อ Session Y` | ท้าย Flow (ขวาสุด) | `shape=offPageConnector;fillColor=#e1d5e7;strokeColor=#9673a6;...` |
| **เข้า** (จาก Session ก่อนหน้า) | `จาก Session X` | หัว Flow (ซ้ายสุด) | เหมือนกัน |

```
ขนาด: width=65, height=65
วางใน Lane ของ Role ที่เป็นจุดเชื่อมต่อ
```

### 3.3 Lane Configuration (Swimlane Roles)

มี 5 บทบาทที่ใช้ในระบบ — แต่ละ Session **แสดงเฉพาะ Lane ที่มี Node อยู่จริง** เท่านั้น:

| Role Key | ชื่อ Lane (Thai) | Fill Color | Border | Font |
|---|---|---|---|---|
| `user` | บุคลากรสำนักงาน ป.ป.ท. | `#f5eedb` | `#b8a571` | `#6d5a3f` |
| `admin` | เจ้าหน้าที่ธุรการกองหน่วยงาน | `#efe6f7` | `#6d5a95` | `#4a3b68` |
| `admin_origin` | เจ้าหน้าที่ธุรการกองหน่วยงาน (ต้นทาง) | `#efe6f7` | `#6d5a95` | `#4a3b68` |
| `admin_dest` | เจ้าหน้าที่ธุรการกองหน่วยงาน (ปลายทาง) | `#EAF2F8` | `#6C8EBF` | `#2A4D7C` |
| `center` | เจ้าหน้าที่ศูนย์เทคโนโลยีสารสนเทศฯ | `#E9F7F8` | `#0e8088` | `#095458` |

**ลำดับ Priority**: `user` → `admin_origin` → `admin_dest` → `admin` → `center`

### 3.4 Node Styles

| ประเภท | เงื่อนไข | Style |
|---|---|---|
| **Process** (SYS) | `rounded=1` + ไม่ใช่ เริ่ม/จบ | `rounded=1;fillColor=#ffffff;strokeColor={lane_border};strokeWidth=1.5;fontSize=13;` |
| **Start** (เริ่ม) | value = "เริ่มต้น" หรือ "เริ่ม" | `ellipse;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=2;fontStyle=1;` |
| **End** (จบ) | value = "จบ" หรือ "จบการทำงาน" | `ellipse;fillColor=#f8cecc;strokeColor=#b85450;strokeWidth=2;fontStyle=1;` |
| **Decision** (เงื่อนไข) | `rhombus` in style | `rhombus;fillColor=#ff8000;strokeColor=#ff8000;fontColor=#ffffff;fontStyle=1;` |
| **Fork/Join** (จุดแยก/รวม) | w=40, h=40, วงกลมดำ | `ellipse;fillColor=#000000;strokeColor=#000000;` |

### 3.5 Edge Styles

| ประเภท | เงื่อนไข | Style |
|---|---|---|
| **ปกติ** (Yes / ผ่าน) | ไม่มี label ปฏิเสธ | `edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#1976d2;strokeWidth=2;` |
| **ปฏิเสธ** (No / ไม่ผ่าน) | label = ไม่ / ไม่อนุมัติ / ไม่ผ่าน / ผลไม่ผ่าน / ไม่ใช่ | `edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#ff8000;strokeWidth=2;dashed=1;` |

### 3.6 Page Size

ทุก Tab ใช้ **A4 Portrait**:
```
pageWidth = 827
pageHeight = 1169
```

---

## 4. Tab Structure สรุปทั้ง 22 Tabs

### 14.1.1 — ระบบลงทะเบียนผู้ใช้งาน (Registration)

| Tab Name | Session | SYS Range | Roles | Off-Page |
|---|---|---|---|---|
| `A4 TOBE_14.1.1 S1` | ขอลงทะเบียนเข้าใช้งาน | SYS001–SYS004 | user | → ต่อ S2 |
| `A4 TOBE_14.1.1 S2` | ตรวจสอบและอนุมัติการลงทะเบียน | SYS005–SYS008 | user, admin, center | ← จาก S1, → ต่อ S3 |
| `A4 TOBE_14.1.1 S3` | เข้าใช้งานระบบครั้งแรกและตั้งรหัสผ่านใหม่ | SYS009–SYS014 | user | ← จาก S2 |

### 14.1.2 — ระบบเข้าสู่ระบบและจัดการข้อมูลส่วนตัว (Login / Personal Info)

| Tab Name | Session | SYS Range | Roles | Off-Page |
|---|---|---|---|---|
| `A4 TOBE_14.1.2 S1` | กรณีลืมรหัสผ่าน (Forgot Password) | SYS015–SYS024 | user, admin, center | — |
| `A4 TOBE_14.1.2 S2` | การจัดการข้อมูลส่วนตัว (Edit Personal Info) | SYS025–SYS031 | user, admin, center | — |
| `A4 TOBE_14.1.2 S3` | การขอเปลี่ยนสังกัดหน่วยงาน (Change Department) | SYS032–SYS042 | user, admin_origin, admin_dest, center | — |

### 14.1.3 — ระบบจัดการผู้ใช้งาน (Admin Actions)

| Tab Name | Session | SYS Range | Roles | Off-Page |
|---|---|---|---|---|
| `A4 TOBE_14.1.3 S1` | พิจารณาและอนุมัติการลงทะเบียน | SYS043–SYS048 | user, admin | → ต่อ S2 |
| `A4 TOBE_14.1.3 S2` | จัดการสถานะผู้ใช้งานระบบ | SYS049–SYS055 | user, admin | ← จาก S1 |
| `A4 TOBE_14.1.3 S3` | การจัดการรหัสผ่านผู้ใช้งานระบบ | SYS056–SYS060 | user, admin | — |
| `A4 TOBE_14.1.3 S4` | อนุมัติย้ายหน่วยงาน (ขั้นตอนต้นทาง) | SYS061–SYS066 | user, admin_origin | → ต่อ S5 |
| `A4 TOBE_14.1.3 S5` | อนุมัติย้ายหน่วยงาน (ขั้นตอนปลายทาง) | SYS067–SYS073 | user, admin_dest | ← จาก S4 |
| `A4 TOBE_14.1.3 S6` | อนุมัติแก้ไขสิทธิ์การเข้าใช้งานระบบ | SYS074–SYS079 | user, admin | — |

### 14.1.4 — ระบบจัดการผู้ใช้งาน (Super Admin / ศูนย์เทคโนโลยีฯ)

| Tab Name | Session | SYS Range | Roles | Off-Page |
|---|---|---|---|---|
| `A4 TOBE_14.1.4 S1` | จัดการแก้ไขหน่วยงาน (ขั้นตอนต้นทาง) | SYS080–SYS085 | user, admin_origin | → ต่อ S2 |
| `A4 TOBE_14.1.4 S2` | จัดการแก้ไขหน่วยงาน (ขั้นตอนปลายทาง) | SYS086–SYS092 | user, admin_dest | ← จาก S1 |
| `A4 TOBE_14.1.4 S3` | บริหารจัดการฐานข้อมูลกลาง (Master Data) | SYS093–SYS099 | user, center | — |
| `A4 TOBE_14.1.4 S4` | พิจารณาและอนุมัติ (ระบบกลาง) | SYS100–SYS105 | user, center | → ต่อ S5 |
| `A4 TOBE_14.1.4 S5` | จัดการข้อมูลและสถานะผู้ใช้ (ระบบกลาง) | SYS106–SYS112 | user, center | ← จาก S4 |
| `A4 TOBE_14.1.4 S6` | การจัดการรหัสผ่าน (ระบบกลาง) | SYS113–SYS117 | user, center | — |
| `A4 TOBE_14.1.4 S7` | มอบหมายบทบาทและสิทธิ์ (Delegation) | SYS118–SYS123 | user, center | — |
| `A4 TOBE_14.1.4 S8` | บริหารจัดการสิทธิ์ (ระบบกลาง) | SYS124–SYS128 | user, center | — |

### 14.1.5 — การกำหนดสิทธิ์ (Role Assignment)

| Tab Name | Session | SYS Range | Roles | Off-Page |
|---|---|---|---|---|
| `A4 TOBE_14.1.5 S1` | การกำหนดสิทธิ์เข้าใช้งานตามระดับผู้ใช้งาน | SYS129–SYS132 | user, center | — |

### 14.1.6 — รายงาน (Reports)

| Tab Name | Session | SYS Range | Roles | Off-Page |
|---|---|---|---|---|
| `A4 TOBE_14.1.6 S1` | ระบบรายงานข้อมูลผู้ใช้งานระบบกลาง | SYS133–SYS134 | center | — |

---

## 5. Tab ที่ยังไม่ได้ Split (ต้องดำเนินการต่อ)

| Tab เดิม | เนื้อหา | หมายเหตุ |
|---|---|---|
| `TOBE_14.2` | ระบบจัดการข้อมูลเรื่องร้องเรียน | ต้องวิเคราะห์จำนวน Session แล้ว Split |
| `TOBE_14.3` | ระบบติดตามผลและรายงาน | เหมือนกัน |
| `TOBE_14.4` | ระบบจัดการคดี (Overview) | อาจเป็น Session เดียว |
| `TOBE_14.4.1` – `TOBE_14.4.6` | Sub-flow ของ 14.4 | แต่ละข้อต้อง Split เป็น Session |
| `TOBE_14.5` | ระบบจัดการเอกสาร | ต้อง Split |
| `TOBE_14.6` | ระบบบริหารจัดการภายใน | ต้อง Split |

> [!IMPORTANT]
> **SYS Numbering ต่อจากเลข 134** — Tab แรกของ 14.2 เริ่มที่ **SYS135** เป็นต้นไป

---

## 6. วิธีใช้ Script

### 6.1 การ Run Script สร้าง Tab

```bash
# สร้าง Tab ใหม่จาก backup
python execute_refactor_split_tabs.py
```

**Script flow:**
1. อ่านจาก `.bak_refactor_tobe` (ไฟล์ต้นฉบับ)
2. วนลูป 6 Tab (14.1.1–14.1.6)
3. แต่ละ Tab แยกเป็น Session ตาม `session` definition
4. สร้าง XML `<diagram>` ใหม่สำหรับแต่ละ Session
5. เขียนทับไฟล์หลัก `.drawio`

### 6.2 การเพิ่ม Tab ใหม่ (สำหรับ 14.2 เป็นต้นไป)

ขั้นตอนที่ต้องทำ:

1. **สำรองไฟล์ก่อน** — copy `.drawio` → `.drawio.bak_before_14_2` (หรือชื่อที่เหมาะสม)

2. **วิเคราะห์ Flow** — เปิดไฟล์ backup ใน Draw.io → ดู Tab ที่ต้อง Split → จดรหัส Node IDs ทุกตัว

3. **กำหนด Session** — แบ่ง Node เป็นกลุ่ม Session โดยดูจาก:
   - ตำแหน่ง Y coordinate (Session แยกกันทางแนวตั้ง)
   - จุดที่ Flow หยุดรอ หรือส่งต่อระหว่าง Role

4. **เขียน Session Definition** — ใน Script ให้กำหนด:

```python
s_sessions = [
    {
        'name': 'Session 1: ชื่อ Session ภาษาไทย',
        'node_ids': ['node-id-1', 'node-id-2', ...],  # รหัส mxCell id
        'roles': ['user', 'admin'],                     # Lane ที่จะแสดง
        'extra_nodes': [
            # (id, label, type, role, column_position)
            ('offpage_xxx', 'ต่อ Session 2', 'offpage', 'admin', 5),
        ],
        'extra_edges': [
            # (id, label, source_id, target_id, is_negative)
            ('edge_xxx', '', 'last_node_id', 'offpage_xxx', False),
        ]
    },
    # ... Session 2, 3, ...
]
```

5. **เขียน Role Mapping Function** — ฟังก์ชันรับ `(x, y, node_id)` → return role key

```python
def role_map_14_2(x, y, nid):
    if x < 1200: return 'user'
    elif x < 2000: return 'admin'
    else: return 'center'
```

6. **เพิ่มเข้า `tab_tasks`** — ใน `main()`:

```python
tab_tasks.append(
    (diag_14_2, "A4 TOBE_14.2", "diag_14_2", s_sessions, v, e, l, n, role_map_14_2)
)
```

7. **Run Script** → **Run Verify** → **เปิด Draw.io ตรวจสอบ**

### 6.3 การ Run Verification

```bash
python verify_refactored_tabs.py
```

ตรวจสอบ:
- ✅ XML well-formed
- ✅ SYS numbering ต่อเนื่อง ไม่ซ้ำ ไม่ขาด
- ✅ ไม่มี Duplicate IDs ในแต่ละ Tab
- ✅ ไม่มี Floating Edges (edge ที่ source/target ไม่มีอยู่ใน Tab)

---

## 7. Data Model — Session Definition

```python
session = {
    'name': str,          # ชื่อ Session แสดงเป็น Header ใน Tab
    'node_ids': [str],    # รหัส mxCell id ของ Node ทั้งหมดใน Session
    'roles': [str],       # Lane ที่ต้องวาด เช่น ['user', 'admin']
    'extra_nodes': [      # Off-page connector หรือ End oval เพิ่มเติม
        (
            str,   # id — ต้องไม่ซ้ำกับ node_ids
            str,   # value/label — เช่น "ต่อ Session 2"
            str,   # type — 'offpage' หรือ 'end'
            str,   # role — วางใน Lane ไหน
            int    # col — ตำแหน่งคอลัมน์ (0-based)
        )
    ],
    'extra_edges': [      # Edge เชื่อมไปยัง extra_nodes
        (
            str,   # id — ต้องไม่ซ้ำ
            str,   # value/label — ปกติเป็น ""
            str,   # source id — จาก Node ใด
            str,   # target id — ไปยัง Node ใด
            bool   # is_negative — True = เส้นประสีส้ม (Reject)
        )
    ]
}
```

---

## 8. สรุปสถิติปัจจุบัน

| Metric | Value |
|---|---|
| Total Tabs | 33 (22 Session + 11 Original) |
| SYS Codes | SYS001 – SYS134 (134 codes) |
| Duplicate IDs | ❌ ไม่มี |
| Floating Edges | ❌ ไม่มี |
| XML Status | ✅ Well-formed |
| Next SYS Number | **SYS135** |

---

## 9. Checklist สำหรับ Tab ถัดไป

- [ ] สำรองไฟล์ `.drawio` ก่อนทำทุกครั้ง
- [ ] วิเคราะห์ Node IDs ใน Tab เดิม (ใช้ Python + `xml.etree.ElementTree`)
- [ ] กำหนด Session Definition + Role Mapping
- [ ] เพิ่มเข้า Script
- [ ] Run Script → Run Verify
- [ ] เปิด Draw.io ตรวจสอบ visual ว่า Flow ถูกต้อง
- [ ] ตรวจสอบ SYS ต่อเนื่องจาก 135 เป็นต้นไป
- [ ] ตรวจสอบ Off-Page Connector label ตรงกัน (ต่อ/จาก)

---

## 10. Tips & Known Issues

> [!TIP]
> **หา Node IDs ได้จาก XML** — เปิดไฟล์ `.drawio` ด้วย Text Editor → ค้นหา `<mxCell id="..."` ใน `<diagram>` ที่ต้องการ

> [!TIP]
> **ใช้ Python ช่วย** — Script `extract_tab_elements()` จะ parse ให้อัตโนมัติ แยก vertices, edges, edge_labels, TOR notes

> [!WARNING]
> **ห้ามเปลี่ยน backup file** — ไฟล์ `.bak_refactor_tobe` คือ Source of Truth สำหรับ Tab 14.1.x ห้ามแก้ไขหรือลบ

> [!WARNING]
> **Off-Page Connector ต้อง match กัน** — ถ้า Session 1 มี "ต่อ Session 2" → Session 2 ต้องมี "จาก Session 1" เสมอ

> [!CAUTION]
> **Duplicate ID จะทำให้ Draw.io Error** — ทุกครั้งที่สร้าง `extra_nodes` ต้องใช้ ID ที่ไม่ซ้ำกับ Node เดิมในไฟล์ทั้งหมด แนะนำ pattern: `offpage_{tab}_{session_from}_to_{session_to}`
