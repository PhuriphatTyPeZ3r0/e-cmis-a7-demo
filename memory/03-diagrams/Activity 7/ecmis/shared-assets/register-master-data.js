// Generated from users_permission_design06052569_2.sql.
// Re-generate from the authoritative SQL when the organization or position masters change.
(function(global){
  'use strict';
  global.ECMISRegisterMasterData = {
  "source": {
    "tableSnapshot": "users_permission_design06052569_2.sql",
    "sourceLastModified": "2026-05-26T16:41:30+07:00",
    "departmentFilter": "useflag=1 AND core_is_ou=1"
  },
  "userTypes": [
    {
      "id": 1,
      "name": "ข้าราชการ"
    },
    {
      "id": 2,
      "name": "พนักงานราชการ"
    },
    {
      "id": 3,
      "name": "พนักงานจ้างเหมา"
    }
  ],
  "positionTypes": [
    {
      "id": 1,
      "name": "ประเภทสายงานบริหาร"
    },
    {
      "id": 2,
      "name": "ประเภทสายงานอำนวยการ"
    },
    {
      "id": 3,
      "name": "ประเภทสายงานวิชาการ"
    },
    {
      "id": 4,
      "name": "ประเภทสายงานทั่วไป"
    }
  ],
  "positionLevels": [
    {
      "id": 1,
      "name": "ระดับต้น"
    },
    {
      "id": 2,
      "name": "ระดับสูง"
    },
    {
      "id": 3,
      "name": "ระดับปฏิบัติการ"
    },
    {
      "id": 4,
      "name": "ระดับชำนาญการ"
    },
    {
      "id": 5,
      "name": "ระดับชำนาญการพิเศษ"
    },
    {
      "id": 6,
      "name": "ระดับเชี่ยวชาญ"
    },
    {
      "id": 7,
      "name": "ระดับทรงคุณวุฒิ"
    },
    {
      "id": 8,
      "name": "ระดับปฏิบัติงาน"
    },
    {
      "id": 9,
      "name": "ระดับชำนาญงาน"
    },
    {
      "id": 10,
      "name": "ระดับอาวุโส"
    },
    {
      "id": 11,
      "name": "ระดับทักษะพิเศษ"
    }
  ],
  "positions": [
    {
      "id": 1,
      "code": "1-9-001",
      "lineWork": "บริหาร",
      "name": "นักบริหาร",
      "occupationId": 9,
      "positionTypeId": 1,
      "positionLevelIds": [
        1,
        2
      ]
    },
    {
      "id": 2,
      "code": "1-9-002",
      "lineWork": "บริหารงานปกครอง",
      "name": "นักปกครอง",
      "occupationId": 9,
      "positionTypeId": 1,
      "positionLevelIds": [
        1,
        2
      ]
    },
    {
      "id": 3,
      "code": "1-9-003",
      "lineWork": "บริหารการทูต",
      "name": "นักบริหารการทูต",
      "occupationId": 9,
      "positionTypeId": 1,
      "positionLevelIds": [
        1,
        2
      ]
    },
    {
      "id": 4,
      "code": "1-9-004",
      "lineWork": "ตรวจราชการกระทรวง",
      "name": "ผู้ตรวจราชการกระทรวง",
      "occupationId": 9,
      "positionTypeId": 1,
      "positionLevelIds": [
        2
      ]
    },
    {
      "id": 5,
      "code": "2-9-001",
      "lineWork": "อำนวยการ",
      "name": "ผู้อำนวยการ",
      "occupationId": 9,
      "positionTypeId": 2,
      "positionLevelIds": [
        1,
        2
      ]
    },
    {
      "id": 6,
      "code": "2-9-002",
      "lineWork": "อำนวยการเฉพาะด้าน",
      "name": "ผู้อำนวยการเฉพาะด้าน",
      "occupationId": 9,
      "positionTypeId": 2,
      "positionLevelIds": [
        1,
        2
      ]
    },
    {
      "id": 7,
      "code": "2-9-003",
      "lineWork": "ตรวจราชการกรม",
      "name": "ผู้ตรวจราชการกรม",
      "occupationId": 9,
      "positionTypeId": 2,
      "positionLevelIds": [
        2
      ]
    },
    {
      "id": 8,
      "code": "3-1-001",
      "lineWork": "นักกฎหมายกฤษฎีกา",
      "name": "นักกฎหมายกฤษฎีกา",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 9,
      "code": "3-1-002",
      "lineWork": "การทูต",
      "name": "นักการทูต",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 10,
      "code": "3-1-003",
      "lineWork": "คุมประพฤติ",
      "name": "พนักงานคุมประพฤติ",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 11,
      "code": "3-1-004",
      "lineWork": "จัดการงานทั่วไป",
      "name": "นักจัดการงานทั่วไป",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 12,
      "code": "3-1-005",
      "lineWork": "เจ้าหน้าที่คดีพิเศษ",
      "name": "เจ้าหน้าที่คดีพิเศษ",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 13,
      "code": "3-1-006",
      "lineWork": "ทรัพยากรบุคคล",
      "name": "นักทรัพยากรบุคคล",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 14,
      "code": "3-1-007",
      "lineWork": "ทะเบียนวิชาชีพ",
      "name": "นักทะเบียนวิชาชีพ",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 15,
      "code": "3-1-008",
      "lineWork": "นิติการ",
      "name": "นิติการ",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 16,
      "code": "3-1-009",
      "lineWork": "ปฏิบัติการปกครอง",
      "name": "เจ้าพนักงานปฏิบัติการปกครอง",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 17,
      "code": "3-1-010",
      "lineWork": "พนักงานสอบสวนคดีพิเศษ",
      "name": "พนักงานสอบสวนคดีพิเศษ",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 18,
      "code": "3-1-011",
      "lineWork": "พัฒนาระบบราชการ",
      "name": "พัฒนาระบบราชการ",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 19,
      "code": "3-1-012",
      "lineWork": "นักวิเคราะห์นโยบายและแผน",
      "name": "นักวิเคราะห์นโยบายและแผน",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 20,
      "code": "3-1-013",
      "lineWork": "วิชาการคอมพิวเตอร์",
      "name": "นักวิชาการคอมพิวเตอร์",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 21,
      "code": "3-1-014",
      "lineWork": "วิชาการทัณฑวิทยา",
      "name": "นักวิชาการทัณฑวิทยา",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 22,
      "code": "3-1-015",
      "lineWork": "วิชาการเทคโนโลยีสารสนเทศ",
      "name": "นักวิชาการเทคโนโลยีสารสนเทศ",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 23,
      "code": "3-1-016",
      "lineWork": "วิชาการพัสดุ",
      "name": "นักวิชาการพัสดุ",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 24,
      "code": "3-1-017",
      "lineWork": "วิชาการยุติธรรม",
      "name": "นักวิชาการยุติธรรม",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 25,
      "code": "3-1-018",
      "lineWork": "วิชาการส่งเสริมการปกครองท้องถิ่น",
      "name": "นักวิชาการส่งเสริมการปกครองท้องถิ่น",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 26,
      "code": "3-1-019",
      "lineWork": "วิชาการสถิติ",
      "name": "นักวิชาการสถิติ",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 27,
      "code": "3-1-020",
      "lineWork": "วิเทศสหการ",
      "name": "นักวิเทศสหการ",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 28,
      "code": "3-1-021",
      "lineWork": "วิเทศสัมพันธ์",
      "name": "นักวิเทศสัมพันธ์",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 29,
      "code": "3-1-022",
      "lineWork": "สืบสวนสอบสวน",
      "name": "นักสืบสวนสอบสวน",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 30,
      "code": "3-1-023",
      "lineWork": "อาลักษณ์",
      "name": "อาลักษณ์",
      "occupationId": 1,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 31,
      "code": "3-2-001",
      "lineWork": "เจ้าหน้าที่จัดผลประโยชน์",
      "name": "เจ้าหน้าที่จัดผลประโยชน์",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 32,
      "code": "3-2-002",
      "lineWork": "ตรวจสอบภาษี",
      "name": "นักตรวจสอบภาษี",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 33,
      "code": "3-2-003",
      "lineWork": "วิเคราะห์งบประมาณ",
      "name": "นักวิเคราะห์งบประมาณ",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 34,
      "code": "3-2-004",
      "lineWork": "วิเคราะห์รัฐวิสาหกิจ",
      "name": "นักวิเคราะห์รัฐวิสาหกิจ",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 35,
      "code": "3-2-005",
      "lineWork": "วิชาการคลัง",
      "name": "นักวิชาการคลัง",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 36,
      "code": "3-2-006",
      "lineWork": "วิชาการเงินและบัญชี",
      "name": "นักวิชาการเงินและบัญชี",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 37,
      "code": "3-2-007",
      "lineWork": "วิชาการชั่งตวงวัด",
      "name": "นักวิชาการชั่งตวงวัด",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 38,
      "code": "3-2-008",
      "lineWork": "วิชาการตรวจสอบบัญชี",
      "name": "นักวิชาการตรวจสอบบัญชี",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 39,
      "code": "3-2-009",
      "lineWork": "วิชาการตรวจสอบภายใน",
      "name": "นักวิชาการตรวจสอบภายใน",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 40,
      "code": "3-2-010",
      "lineWork": "วิชาการตรวจสอบสิทธิบัตร",
      "name": "นักวิชาการตรวจสอบสิทธิบัตร",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 41,
      "code": "3-2-011",
      "lineWork": "วิชาการทรัพยากรธรณี",
      "name": "นักวิชาการทรัพยากรธรณี",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 42,
      "code": "3-2-012",
      "lineWork": "วิชาการบัญชี",
      "name": "นักวิชาการบัญชี",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 43,
      "code": "3-2-013",
      "lineWork": "วิชาการผลิตภัณฑ์อาหาร",
      "name": "นักวิชาการผลิตภัณฑ์อาหาร",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 44,
      "code": "3-2-014",
      "lineWork": "วิชาการพาณิชย์",
      "name": "นักวิชาการพาณิชย์",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 45,
      "code": "3-2-015",
      "lineWork": "วิชาการภาษี",
      "name": "นักวิชาการภาษี",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 46,
      "code": "3-2-016",
      "lineWork": "วิชาการมาตรฐาน",
      "name": "นักวิชาการมาตรฐาน",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 47,
      "code": "3-2-017",
      "lineWork": "วิชาการศุลกากร",
      "name": "นักวิชาการศุลกากร",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 48,
      "code": "3-2-018",
      "lineWork": "วิชาการเศรษฐกิจ",
      "name": "เศรษฐกร",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 49,
      "code": "3-2-019",
      "lineWork": "วิชาการส่งเสริมการลงทุน",
      "name": "นักวิชาการส่งเสริมการลงทุน",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 50,
      "code": "3-2-020",
      "lineWork": "วิชาการสรรพสามิต",
      "name": "นักวิชาการสรรพสามิต",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 51,
      "code": "3-2-021",
      "lineWork": "วิชาการสรรพากร",
      "name": "นักวิชาการสรรพากร",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 52,
      "code": "3-2-022",
      "lineWork": "วิชาการสหกรณ์",
      "name": "นักวิชาการสหกรณ์",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 53,
      "code": "3-2-023",
      "lineWork": "วิชาการอุตสาหกรรม",
      "name": "นักวิชาการอุตสาหกรรม",
      "occupationId": 2,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 54,
      "code": "3-3-001",
      "lineWork": "การข่าว",
      "name": "นักการข่าว",
      "occupationId": 3,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 55,
      "code": "3-3-002",
      "lineWork": "เดินเรือ",
      "name": "นักเดินเรือ",
      "occupationId": 3,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 56,
      "code": "3-3-003",
      "lineWork": "ตรวจท่า",
      "name": "เจ้าพนักงานตรวจท่า",
      "occupationId": 3,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 57,
      "code": "3-3-004",
      "lineWork": "นำร่อง",
      "name": "เจ้าพนักงานนำร่อง",
      "occupationId": 3,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 58,
      "code": "3-3-005",
      "lineWork": "ประชาสัมพันธ์",
      "name": "นักประชาสัมพันธ์",
      "occupationId": 3,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 59,
      "code": "3-3-006",
      "lineWork": "วิชาการขนส่ง",
      "name": "นักวิชาการขนส่ง",
      "occupationId": 3,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 60,
      "code": "3-3-007",
      "lineWork": "วิชาการเผยแพร่",
      "name": "นักวิชาการเผยแพร่",
      "occupationId": 3,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 61,
      "code": "3-3-008",
      "lineWork": "วิชาการโสตทัศนศึกษา",
      "name": "นักวิชาการโสตทัศนศึกษา",
      "occupationId": 3,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 62,
      "code": "3-3-009",
      "lineWork": "สื่อสารมวลชน",
      "name": "นักสื่อสารมวลชน",
      "occupationId": 3,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 63,
      "code": "3-4-001",
      "lineWork": "วิชาการเกษตร",
      "name": "นักวิชาการเกษตร",
      "occupationId": 4,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 64,
      "code": "3-4-002",
      "lineWork": "วิชาการปฏิรูปที่ดิน",
      "name": "นักวิชาการปฏิรูปที่ดิน",
      "occupationId": 4,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 65,
      "code": "3-4-003",
      "lineWork": "วิชาการประมง",
      "name": "นักวิชาการประมง",
      "occupationId": 4,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 66,
      "code": "3-4-004",
      "lineWork": "วิชาการป่าไม้",
      "name": "นักวิชาการป่าไม้",
      "occupationId": 4,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 67,
      "code": "3-4-005",
      "lineWork": "วิชาการส่งเสริมการเกษตร",
      "name": "นักวิชาการส่งเสริมการเกษตร",
      "occupationId": 4,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 68,
      "code": "3-4-006",
      "lineWork": "วิชาการสัตวบาล",
      "name": "นักวิชาการสัตวบาล",
      "occupationId": 4,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 69,
      "code": "3-4-007",
      "lineWork": "สำรวจดิน",
      "name": "นักสำรวจดิน",
      "occupationId": 4,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 70,
      "code": "3-5-001",
      "lineWork": "กีฏวิทยา",
      "name": "นักนักกีฏวิทยา",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 71,
      "code": "3-5-002",
      "lineWork": "ชีววิทยารังสี",
      "name": "นักนักชีววิทยารังสี",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 72,
      "code": "3-5-003",
      "lineWork": "ธรณีวิทยา",
      "name": "นักนักธรณีวิทยา",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 73,
      "code": "3-5-004",
      "lineWork": "นิติวิทยาศาสตร์",
      "name": "นักนักนิติวิทยาศาสตร์",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 74,
      "code": "3-5-005",
      "lineWork": "นิวเคลียร์เคมี",
      "name": "นักนักนิวเคลียร์เคมี",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 75,
      "code": "3-5-006",
      "lineWork": "นิวเคลียร์ฟิสิกส์",
      "name": "นักนักนิวเคลียร์ฟิสิกส์",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 76,
      "code": "3-5-007",
      "lineWork": "ฟิสิกส์รังสี",
      "name": "นักนักฟิสิกส์รังสี",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 77,
      "code": "3-5-008",
      "lineWork": "วิชาการโรคพืช",
      "name": "นักวิชาการโรคพืช",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 78,
      "code": "3-5-009",
      "lineWork": "วิชาการอุทกวิทยา",
      "name": "นักวิชาการอุทกวิทยา",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 79,
      "code": "3-5-010",
      "lineWork": "วิทยาศาสตร์",
      "name": "นักวิทยาศาสตร์",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 80,
      "code": "3-5-011",
      "lineWork": "วิทยาศาสตร์นิวเคลียร์",
      "name": "นักวิทยาศาสตร์นิวเคลียร์",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 81,
      "code": "3-5-012",
      "lineWork": "สัตววิทยา",
      "name": "นักสัตววิทยา",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 82,
      "code": "3-5-013",
      "lineWork": "อุตุนิยมวิทยา",
      "name": "นักอุตุนิยมวิทยา",
      "occupationId": 5,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 83,
      "code": "3-6-001",
      "lineWork": "กายภาพบำบัด",
      "name": "นักกายภาพบำบัด",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 84,
      "code": "3-6-002",
      "lineWork": "กิจกรรมบำบัด",
      "name": "นักกิจกรรมบำบัด",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 85,
      "code": "3-6-003",
      "lineWork": "จิตวิทยา",
      "name": "นักจิตวิทยา",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 86,
      "code": "3-6-004",
      "lineWork": "จิตวิทยาคลีนิก",
      "name": "นักจิตวิทยาคลีนิก",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 87,
      "code": "3-6-005",
      "lineWork": "ทันตแพทย์",
      "name": "ทันตแพทย์",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 88,
      "code": "3-6-006",
      "lineWork": "เทคนิคการแพทย์",
      "name": "นักเทคนิคการแพทย์",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 89,
      "code": "3-6-007",
      "lineWork": "นายสัตวแพทย์",
      "name": "นายสัตวแพทย์",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 90,
      "code": "3-6-008",
      "lineWork": "พยาบาลวิชาชีพ",
      "name": "พยาบาลวิชาชีพ",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 91,
      "code": "3-6-009",
      "lineWork": "แพทย์",
      "name": "แพทย์",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 92,
      "code": "3-6-010",
      "lineWork": "แพทย์แผนไทย",
      "name": "แพทย์แผนไทย",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 93,
      "code": "3-6-011",
      "lineWork": "เภสัชกรรม",
      "name": "เภสัชกรรม",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 94,
      "code": "3-6-012",
      "lineWork": "โภชนาการ",
      "name": "นักโภชนาการ",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 95,
      "code": "3-6-013",
      "lineWork": "รังสีการแพทย์",
      "name": "นักรังสีการแพทย์",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 96,
      "code": "3-6-014",
      "lineWork": "วิชาการพยาบาล",
      "name": "นักวิชาการพยาบาล",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 97,
      "code": "3-6-015",
      "lineWork": "วิชาการสาธารณสุข",
      "name": "นักวิชาการสาธารณสุข",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 98,
      "code": "3-6-016",
      "lineWork": "วิชาการอาชีวบำบัด",
      "name": "นักวิชาการสาธารณสุข",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 99,
      "code": "3-6-017",
      "lineWork": "วิชาการอาหารและยา",
      "name": "นักอาชีวบำบัด",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 100,
      "code": "3-6-018",
      "lineWork": "วิทยาศาสตร์การแพทย์",
      "name": "นักวิทยาศาสตร์การแพทย์",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 101,
      "code": "3-6-019",
      "lineWork": "เวชศาสตร์การสื่อความหมาย",
      "name": "นักเวชศาสตร์การสื่อความหมาย",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 102,
      "code": "3-6-020",
      "lineWork": "เทคโนโลยีหัวใจและทรวงอก",
      "name": "นักเทคโนโลยีหัวใจและทรวงอก",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 103,
      "code": "3-6-021",
      "lineWork": "ฟิสิกส์การแพทย์",
      "name": "นักฟิสิกส์การแพทย์",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 104,
      "code": "3-6-022",
      "lineWork": "สาธารณสุข",
      "name": "นักสาธารณสุข",
      "occupationId": 6,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 105,
      "code": "3-7-001",
      "lineWork": "กายอุปกรณ์",
      "name": "นักกายอุปกรณ์",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 106,
      "code": "3-7-002",
      "lineWork": "จิตรกรรม",
      "name": "จิตรกรรม",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 107,
      "code": "3-7-003",
      "lineWork": "ช่างกลเรือ",
      "name": "นายช่างกลเรือ",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 108,
      "code": "3-7-004",
      "lineWork": "ช่างภาพการแพทย์",
      "name": "ช่างภาพการแพทย์",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 109,
      "code": "3-7-005",
      "lineWork": "ตรวจเรือ",
      "name": "เจ้าพนักงานตรวจเรือ",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 110,
      "code": "3-7-006",
      "lineWork": "ตรวจสอบความปลอดภัยด้านการบิน",
      "name": "นักตรวจสอบความปลอดภัยด้านการบิน",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 111,
      "code": "3-7-007",
      "lineWork": "ประติมากรรม",
      "name": "ประติมากร",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 112,
      "code": "3-7-008",
      "lineWork": "ภูมิสถาปัตยกรรม",
      "name": "ภูมิสถาปนิก",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 113,
      "code": "3-7-009",
      "lineWork": "มัณฑนศิลป์",
      "name": "มัณฑนากร",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 114,
      "code": "3-7-010",
      "lineWork": "วิชาการกษาปณ์",
      "name": "นักวิชาการกษาปณ์",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 115,
      "code": "3-7-011",
      "lineWork": "วิชาการช่างศิลป์",
      "name": "นักวิชาการช่างศิลป์",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 116,
      "code": "3-7-012",
      "lineWork": "วิชาการแผนที่ภาพถ่าย",
      "name": "นักวิชาการแผนที่ภาพถ่าย",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 117,
      "code": "3-7-013",
      "lineWork": "วิชาการพลังงาน",
      "name": "นักวิชาการพลังงาน",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 118,
      "code": "3-7-014",
      "lineWork": "วิชาการออกแบบผลิตภัณฑ์",
      "name": "นักวิชาการออกแบบผลิตภัณฑ์",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 119,
      "code": "3-7-015",
      "lineWork": "วิศวกรรม",
      "name": "วิศวกร",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 120,
      "code": "3-7-016",
      "lineWork": "วิศวกรรมการเกษตร",
      "name": "วิศวกรการเกษตร",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 121,
      "code": "3-7-017",
      "lineWork": "วิศวกรรมเครื่องกล",
      "name": "วิศวกรเครื่องกล",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 122,
      "code": "3-7-018",
      "lineWork": "วิศวกรรมนิวเคลียร์",
      "name": "วิศวกรนิวเคลียร์",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 123,
      "code": "3-7-019",
      "lineWork": "วิศวกรรมปิโตรเลียม",
      "name": "วิศวกรปิโตรเลียม",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 124,
      "code": "3-7-020",
      "lineWork": "วิศวกรรมไฟฟ้า",
      "name": "วิศวกรไฟฟ้า",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 125,
      "code": "3-7-021",
      "lineWork": "วิศวกรรมไฟฟ้าสื่อสาร",
      "name": "วิศวกรไฟฟ้าสื่อสาร",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 126,
      "code": "3-7-022",
      "lineWork": "วิศวกรรมโยธา",
      "name": "วิศวกรโยธา",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 127,
      "code": "3-7-023",
      "lineWork": "วิศวกรรมรังวัด",
      "name": "วิศวกรรังวัด",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 128,
      "code": "3-7-024",
      "lineWork": "วิศวกรรมโลหการ",
      "name": "วิศวกรโลหการ",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 129,
      "code": "3-7-025",
      "lineWork": "วิศวกรรมสำรวจ",
      "name": "วิศวกรสำรวจ",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 130,
      "code": "3-7-026",
      "lineWork": "วิศวกรรมเหมืองแร่",
      "name": "วิศวกรเหมืองแร่",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 131,
      "code": "3-7-027",
      "lineWork": "วิศวกรรมชลประทาน",
      "name": "วิศวกรชลประทาน",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 132,
      "code": "3-7-028",
      "lineWork": "สถาปัตยกรรม",
      "name": "สถาปนิกกรรม",
      "occupationId": 7,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 133,
      "code": "3-8-001",
      "lineWork": "ผังเมือง",
      "name": "นักผังเมือง",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 134,
      "code": "3-8-002",
      "lineWork": "จดหมายเหตุ",
      "name": "นักจดหมายเหตุ",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 135,
      "code": "3-8-003",
      "lineWork": "บรรณารักษ์",
      "name": "บรรณารักษ์",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 136,
      "code": "3-8-004",
      "lineWork": "โบราณคดี",
      "name": "นักโบราณคดี",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 137,
      "code": "3-8-005",
      "lineWork": "ประเมินราคาทรัพย์สิน",
      "name": "นักประเมินราคาทรัพย์สิน",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 138,
      "code": "3-8-006",
      "lineWork": "พัฒนาการกีฬา",
      "name": "นักพัฒนาการกีฬา",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 139,
      "code": "3-8-007",
      "lineWork": "พัฒนาการท่องเที่ยว",
      "name": "นักพัฒนาการท่องเที่ยว",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 140,
      "code": "3-8-008",
      "lineWork": "พัฒนาสังคม",
      "name": "นักพัฒนาสังคม",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 141,
      "code": "3-8-009",
      "lineWork": "ภัณฑารักษ์",
      "name": "ภัณฑารักษ์",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 142,
      "code": "3-8-010",
      "lineWork": "ภาษาโบราณ",
      "name": "นักภาษาโบราณ",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 143,
      "code": "3-8-011",
      "lineWork": "วรรณศิลป์",
      "name": "นักวรรณศิลป์",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 144,
      "code": "3-8-012",
      "lineWork": "วิเคราะห์ผังเมือง",
      "name": "นักวิเคราะห์ผังเมือง",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 145,
      "code": "3-8-013",
      "lineWork": "วิชาการจัดหาที่ดิน",
      "name": "นักวิชาการจัดหาที่ดิน",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 146,
      "code": "3-8-014",
      "lineWork": "วิชาการที่ดิน",
      "name": "นักวิชาการที่ดิน",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 147,
      "code": "3-8-015",
      "lineWork": "วิชาการพัฒนาชุมชน",
      "name": "นักวิชาการพัฒนาชุมชน",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 148,
      "code": "3-8-016",
      "lineWork": "วิชาการพัฒนาฝีมือแรงงาน",
      "name": "นักวิชาการพัฒนาฝีมือแรงงาน",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 149,
      "code": "3-8-017",
      "lineWork": "วิชาการแรงงาน",
      "name": "นักวิชาการแรงงาน",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 150,
      "code": "3-8-018",
      "lineWork": "วิชาการละครและดนตรี",
      "name": "นักวิชาการละครและดนตรี",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 151,
      "code": "3-8-019",
      "lineWork": "วิชาการวัฒนธรรม",
      "name": "นักวิชาการวัฒนธรรม",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 152,
      "code": "3-8-020",
      "lineWork": "วิชาการศาสนา",
      "name": "นักวิชาการศาสนา",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 153,
      "code": "3-8-021",
      "lineWork": "วิชาการศึกษา",
      "name": "นักวิชาการศึกษา",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 154,
      "code": "3-8-022",
      "lineWork": "วิชาการศึกษาพิเศษ",
      "name": "นักวิชาการศึกษาพิเศษ",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 155,
      "code": "3-8-023",
      "lineWork": "วิชาการสิ่งแวดล้อม",
      "name": "นักวิชาการสิ่งแวดล้อม",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 156,
      "code": "3-8-024",
      "lineWork": "วิชาการอบรมและฝึกวิชาชีพ",
      "name": "นักวิชาการอบรมและฝึกวิชาชีพ",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 157,
      "code": "3-8-025",
      "lineWork": "วิทยาจารย์",
      "name": "วิทยาจารย์",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 158,
      "code": "3-8-026",
      "lineWork": "สังคมสงเคราะห์",
      "name": "นักสังคมสงเคราะห์",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 159,
      "code": "3-8-027",
      "lineWork": "อักษรศาสตร์",
      "name": "นักอักษรศาสตร์",
      "occupationId": 8,
      "positionTypeId": 3,
      "positionLevelIds": [
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": 160,
      "code": "4-1-001",
      "lineWork": "ปฏิบัติงานธุรการ",
      "name": "เจ้าพนักงานธรการ",
      "occupationId": 1,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 161,
      "code": "4-1-002",
      "lineWork": "ปฏิบัติงานพัสดุ",
      "name": "เจ้าพนักงานพัสดุ",
      "occupationId": 1,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 162,
      "code": "4-1-003",
      "lineWork": "ปฏิบัติงานราชทัณฑ์",
      "name": "เจ้าพนักงานราชทัณฑ์",
      "occupationId": 1,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 163,
      "code": "4-1-004",
      "lineWork": "เจ้าพนักงานเวชสถิติ",
      "name": "เจ้าพนักงานเวชสถิติ",
      "occupationId": 1,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 164,
      "code": "4-1-005",
      "lineWork": "ปฏิบัติงานสถิติ",
      "name": "เจ้าพนักงานสถิติ",
      "occupationId": 1,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 165,
      "code": "4-1-006",
      "lineWork": "ปฏิบัติงานอาลักษณ์",
      "name": "เจ้าพนักงานอาลักษณ์",
      "occupationId": 1,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 166,
      "code": "4-1-007",
      "lineWork": "ประสานงานปกครอง",
      "name": "เจ้าหน้าที่ปกครอง",
      "occupationId": 1,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 167,
      "code": "4-1-008",
      "lineWork": "ปฏิบัติงานส่งเสริมการปกครองท้องถิ่น",
      "name": "เจ้าพนักงานส่งเสริมการปกครองท้องถิ่น",
      "occupationId": 1,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 168,
      "code": "4-1-009",
      "lineWork": "ปฏิบัติงานสืบสวน",
      "name": "เจ้าพนักงานสืบสวน",
      "occupationId": 1,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 169,
      "code": "4-2-001",
      "lineWork": "ปฏิบัติงานการพาณิชย์",
      "name": "เจ้าพนักงานการพาณิชย์",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 170,
      "code": "4-2-002",
      "lineWork": "ปฏิบัติงานการเงินและบัญชี",
      "name": "เจ้าพนักงานการเงินและบัญชี",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 171,
      "code": "4-2-003",
      "lineWork": "ปฏิบัติงานคลัง",
      "name": "เจ้าพนักงานคลัง",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 172,
      "code": "4-2-004",
      "lineWork": "ปฏิบัติงานชั่งตวงวัด",
      "name": "เจ้าพนักงานชั่งตวงวัด",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 173,
      "code": "4-2-005",
      "lineWork": "ปฏิบัติงานดูเงิน",
      "name": "เจ้าพนักงานดูเงิน",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 174,
      "code": "4-2-006",
      "lineWork": "ปฏิบัติงานตรวจสอบบัญชี",
      "name": "เจ้าพนักงานตรวจสอบบัญชี",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 175,
      "code": "4-2-007",
      "lineWork": "ปฏิบัติงานทรัพยากรธรณี",
      "name": "เจ้าพนักงานทรัพยากรธรณี",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 176,
      "code": "4-2-008",
      "lineWork": "ปฏิบัติงานศุลกากร",
      "name": "เจ้าพนักงานศุลกากร",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 177,
      "code": "4-2-009",
      "lineWork": "ปฏิบัติงานส่งเสริมสหกรณ์",
      "name": "เจ้าพนักงานส่งเสริมสหกรณ์",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 178,
      "code": "4-2-010",
      "lineWork": "ปฏิบัติงานส่งเสริมอุตสาหกรรม",
      "name": "เจ้าพนักงานส่งเสริมอุตสาหกรรม",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 179,
      "code": "4-2-011",
      "lineWork": "ปฏิบัติงานสรรพสามิต",
      "name": "เจ้าพนักงานสรรพสามิต",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 180,
      "code": "4-2-012",
      "lineWork": "ปฏิบัติงานสรรพากร",
      "name": "เจ้าพนักงานสรรพากร",
      "occupationId": 2,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 181,
      "code": "4-3-001",
      "lineWork": "ปฏิบัติงานการข่าว",
      "name": "เจ้าพนักงานการข่าว",
      "occupationId": 3,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 182,
      "code": "4-3-002",
      "lineWork": "ปฏิบัติงานขนส่ง",
      "name": "เจ้าพนักงานขนส่ง",
      "occupationId": 3,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 183,
      "code": "4-3-003",
      "lineWork": "ปฏิบัติงานเดินเรือ",
      "name": "เจ้าพนักงานเดินเรือ",
      "occupationId": 3,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 184,
      "code": "4-3-004",
      "lineWork": "ปฏิบัติงานเผยแพร่ประชาสัมพันธ์",
      "name": "เจ้าพนักงานเผยแพร่ประชาสัมพันธ์",
      "occupationId": 3,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 185,
      "code": "4-3-005",
      "lineWork": "ปฏิบัติงานสื่อสาร",
      "name": "เจ้าพนักงานสื่อสาร",
      "occupationId": 3,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 186,
      "code": "4-3-006",
      "lineWork": "ปฏิบัติงานควบคุมจราจรทางอากาศ",
      "name": "เจ้าพนักงานควบคุมจราจรทางอากาศ",
      "occupationId": 3,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 187,
      "code": "4-3-007",
      "lineWork": "ปฏิบัติงานโสตทัศนศึกษา",
      "name": "เจ้าพนักงานโสตทัศนศึกษา",
      "occupationId": 3,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 188,
      "code": "4-3-008",
      "lineWork": "ประกาศและรายงานข่าว",
      "name": "ผู้ประกาศและรายงานข่าว",
      "occupationId": 3,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 189,
      "code": "4-4-001",
      "lineWork": "ปฏิบัติงานการเกษตร",
      "name": "เจ้าพนักงานการเกษตร",
      "occupationId": 4,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 190,
      "code": "4-4-002",
      "lineWork": "ปฏิบัติงานเคหกิจเกษตร",
      "name": "เจ้าพนักงานเคหกิจเกษตร",
      "occupationId": 4,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 191,
      "code": "4-4-003",
      "lineWork": "ปฏิบัติงานประมง",
      "name": "เจ้าพนักงานประมง",
      "occupationId": 4,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 192,
      "code": "4-4-004",
      "lineWork": "ปฏิบัติงานป่าไม้",
      "name": "เจ้าพนักงานป่าไม้",
      "occupationId": 4,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 193,
      "code": "4-4-005",
      "lineWork": "ปฏิบัติงานสัตวบาล",
      "name": "เจ้าพนักงานสัตวบาล",
      "occupationId": 4,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 194,
      "code": "4-5-001",
      "lineWork": "ปฏิบัติงานวิทยาศาสตร์",
      "name": "เจ้าพนักงานวิทยาศาสตร์",
      "occupationId": 5,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 195,
      "code": "4-5-002",
      "lineWork": "ปฏิบัติงานอุตุนิยมวิทยา",
      "name": "เจ้าพนักงานอุตุนิยมวิทยา",
      "occupationId": 5,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 196,
      "code": "4-5-003",
      "lineWork": "ปฏิบัติงานอุทกวิทยา",
      "name": "เจ้าพนักงานอุทกวิทยา",
      "occupationId": 5,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 197,
      "code": "4-6-001",
      "lineWork": "ปฏิบัติงานทันตสาธารณสุข",
      "name": "เจ้าพนักงานทันตสาธารณสุข",
      "occupationId": 6,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 198,
      "code": "4-6-002",
      "lineWork": "ปฏิบัติงานเภสัชกรรม",
      "name": "เจ้าพนักงานเภสัชกรรม",
      "occupationId": 6,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 199,
      "code": "4-6-003",
      "lineWork": "ปฏิบัติงานโภชนาการ",
      "name": "โภชนากร",
      "occupationId": 6,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 200,
      "code": "4-6-004",
      "lineWork": "ปฏิบัติงานรังสีการแพทย์",
      "name": "เจ้าพนักงานรังสีการแพทย์",
      "occupationId": 6,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 201,
      "code": "4-6-005",
      "lineWork": "ปฏิบัติงานวิทยาศาสตร์การแพทย์",
      "name": "เจ้าพนักงานวิทยาศาสตร์การแพทย์",
      "occupationId": 6,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 202,
      "code": "4-6-006",
      "lineWork": "ปฏิบัติงานเวชกรรมฟื้นฟู",
      "name": "เจ้าพนักงานเวชกรรมฟื้นฟู",
      "occupationId": 6,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 203,
      "code": "4-6-007",
      "lineWork": "ปฏิบัติงานสาธารณสุข",
      "name": "เจ้าพนักงานสาธารณสุข",
      "occupationId": 6,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 204,
      "code": "4-6-008",
      "lineWork": "ปฏิบัติงานอาชีวบำบัด",
      "name": "เจ้าพนักงานอาชีวบำบัด",
      "occupationId": 6,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 205,
      "code": "4-6-009",
      "lineWork": "พยาบาลเทคนิค",
      "name": "พยาบาลเทคนิค",
      "occupationId": 6,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 206,
      "code": "4-6-010",
      "lineWork": "สัตวแพทย์",
      "name": "สัตวแพทย์",
      "occupationId": 6,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 207,
      "code": "4-7-001",
      "lineWork": "ช่างอาภรณ์",
      "name": "ช่างอาภรณ์",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 208,
      "code": "4-7-002",
      "lineWork": "ปฏิบัติงานช่างพิมพ์",
      "name": "นายช่างพิมพ์",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 209,
      "code": "4-7-003",
      "lineWork": "ปฏิบัติงานช่างศิลป์",
      "name": "นายช่างศิลป์",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 210,
      "code": "4-7-004",
      "lineWork": "ปฏิบัติงานช่างศิลปกรรม",
      "name": "นายช่างศิลปกรรม",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 211,
      "code": "4-7-005",
      "lineWork": "ปฏิบัติงานช่างหล่อ",
      "name": "นายช่างหล่อ",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 212,
      "code": "4-7-006",
      "lineWork": "ปฏิบัติงานกายอุปกรณ์",
      "name": "ช่างกายอุปกรณ์",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 213,
      "code": "4-7-007",
      "lineWork": "ปฏิบัติงานเครื่องคอมพิวเตอร์",
      "name": "เจ้าพนักงานเครื่องคอมพิวเตอร์",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 214,
      "code": "4-7-008",
      "lineWork": "ปฏิบัติงานช่างขุดลอก",
      "name": "นายช่างขุดลอก",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 215,
      "code": "4-7-009",
      "lineWork": "ปฏิบัติงานช่างเขียนแบบ",
      "name": "นายช่างเขียนแบบ",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 216,
      "code": "4-7-010",
      "lineWork": "ปฏิบัติงานช่างเครื่องกล",
      "name": "นายช่างเครื่องกล",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 217,
      "code": "4-7-011",
      "lineWork": "ปฏิบัติงานช่างตรวจสภาพรถ",
      "name": "นายช่างตรวจสภาพรถ",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 218,
      "code": "4-7-012",
      "lineWork": "ปฏิบัติงานช่างทันตกรรม",
      "name": "ช่างทันตกรรม",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 219,
      "code": "4-7-013",
      "lineWork": "ปฏิบัติงานช่างเทคนิค",
      "name": "นายช่างเทคนิค",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 220,
      "code": "4-7-014",
      "lineWork": "ปฏิบัติงานช่างไฟฟ้า",
      "name": "นายช่างไฟฟ้า",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 221,
      "code": "4-7-015",
      "lineWork": "ปฏิบัติงานช่างภาพ",
      "name": "นายช่างภาพ",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 222,
      "code": "4-7-016",
      "lineWork": "ปฏิบัติงานโยธา",
      "name": "นายช่างโยธา",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 223,
      "code": "4-7-017",
      "lineWork": "ปฏิบัติงานช่างรังวัด",
      "name": "นายช่างรังวัด",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 224,
      "code": "4-7-018",
      "lineWork": "ปฏิบัติงานช่างโลหะ",
      "name": "นายช่างโลหะ",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 225,
      "code": "4-7-019",
      "lineWork": "ปฏิบัติงานช่างสำรวจ",
      "name": "นายช่างสำรวจ",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 226,
      "code": "4-7-020",
      "lineWork": "ปฏิบัติงานช่างเหมืองแร่",
      "name": "นายช่างเหมืองแร่",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 227,
      "code": "4-7-021",
      "lineWork": "ปฏิบัติงานช่างออกแบบเรือ",
      "name": "นายช่างออกแบบเรือ",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 228,
      "code": "4-7-022",
      "lineWork": "ปฏิบัติงานช่างอากาศยาน",
      "name": "นายช่างอากาศยาน",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 229,
      "code": "4-7-023",
      "lineWork": "ปฏิบัติงานตรวจโรงงาน",
      "name": "เจ้าพนักงานตรวจโรงงาน",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 230,
      "code": "4-7-024",
      "lineWork": "ปฏิบัติงานลิขิต",
      "name": "เจ้าพนักงานลิขิต",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 231,
      "code": "4-7-025",
      "lineWork": "ปฏิบัติงานออกแบบผลิตภัณฑ์",
      "name": "เจ้าพนักงานออกแบบผลิตภัณฑ์",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 232,
      "code": "4-7-026",
      "lineWork": "ปฏิบัติงานช่างชลประทาน",
      "name": "นายช่างชลประทาน",
      "occupationId": 7,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 233,
      "code": "4-8-001",
      "lineWork": "ครูการศึกษาพิเศษ",
      "name": "ครูการศึกษาพิเศษ",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 234,
      "code": "4-8-002",
      "lineWork": "คีตศิลป์",
      "name": "คีตศิลป์",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 235,
      "code": "4-8-003",
      "lineWork": "ปฏิบัติงานที่ดิน",
      "name": "เจ้าพนักงานที่ดิน",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 236,
      "code": "4-8-004",
      "lineWork": "ดุริยางคศิลป์",
      "name": "ดุริยางคศิลป์",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 237,
      "code": "4-8-005",
      "lineWork": "นาฏศิลป์",
      "name": "นาฏศิลป์",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 238,
      "code": "4-8-006",
      "lineWork": "ปฏิบัติงานการศาสนา",
      "name": "เจ้าพนักงานการศาสนา",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 239,
      "code": "4-8-007",
      "lineWork": "ปฏิบัติงานช่วยนักจดหมายเหตุ",
      "name": "เจ้าพนักงานจดหมายเหตุ",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 240,
      "code": "4-8-008",
      "lineWork": "ปฏิบัติงานประเมินราคาทรัพย์สิน",
      "name": "เจ้าพนักงานประเมินราคาทรัพย์สิน",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 241,
      "code": "4-8-009",
      "lineWork": "ปฏิบัติงานพัฒนาชุมชน",
      "name": "เจ้าพนักงานพัฒนาชุมชน",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 242,
      "code": "4-8-010",
      "lineWork": "ปฏิบัติงานพัฒาฝีมือแรงงาน",
      "name": "เจ้าพนักงานพัฒาฝีมือแรงงาน",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 243,
      "code": "4-8-011",
      "lineWork": "ปฏิบัติงานพัฒนาสังคม",
      "name": "เจ้าพนักงานพัฒนาสังคม",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 244,
      "code": "4-8-012",
      "lineWork": "ปฏิบัติงานพิพิธภัณฑ์",
      "name": "เจ้าพนักงานพิพิธภัณฑ์",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 245,
      "code": "4-8-013",
      "lineWork": "ปฏิบัติงานแรงงาน",
      "name": "เจ้าพนักงานแรงงาน",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 246,
      "code": "4-8-014",
      "lineWork": "ปฏิบัติงานวัฒนธรรม",
      "name": "เจ้าพนักงานวัฒนธรรม",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 247,
      "code": "4-8-015",
      "lineWork": "ปฏิบัติงานห้องสมุด",
      "name": "เจ้าพนักงานห้องสมุด",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 248,
      "code": "4-8-016",
      "lineWork": "ปฏิบัติงานอบรมและฝึกวิชาชีพ",
      "name": "เจ้าพนักงานอบรมและฝึกวิชาชีพ",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    },
    {
      "id": 249,
      "code": "4-8-017",
      "lineWork": "อนุศาสน์",
      "name": "อนุศาสนาจารย์",
      "occupationId": 8,
      "positionTypeId": 4,
      "positionLevelIds": [
        8,
        9,
        10,
        11
      ]
    }
  ],
  "departments": [
    {
      "id": 1,
      "code": "250170000",
      "name": "สำนักงาน ป.ป.ท.",
      "abbreviation": "ป.ป.ท. ส่วนกลาง",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 2,
      "code": "250170001",
      "name": "สำนักงานเลขาธิการ",
      "abbreviation": "สลธ.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 3,
      "code": "250170002",
      "name": "กองกฎหมาย",
      "abbreviation": "กกม.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 4,
      "code": "250170003",
      "name": "กองการต่างประเทศ",
      "abbreviation": "กตท.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 5,
      "code": "250170004",
      "name": "กองบริหารคดี",
      "abbreviation": "กบค.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 6,
      "code": "250170005",
      "name": "กองปราบปรามการทุจริตในภาครัฐ ๑",
      "abbreviation": "กปท.1",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 7,
      "code": "250170006",
      "name": "กองปราบปรามการทุจริตในภาครัฐ ๒",
      "abbreviation": "กปท.2",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 8,
      "code": "250170007",
      "name": "กองปราบปรามการทุจริตในภาครัฐ ๓",
      "abbreviation": "กปท.3",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 9,
      "code": "250170008",
      "name": "กองปราบปรามการทุจริตในภาครัฐ ๔",
      "abbreviation": "กปท.4",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 10,
      "code": "250170009",
      "name": "กองปราบปรามการทุจริตในภาครัฐ ๕",
      "abbreviation": "กปท.5",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 11,
      "code": "250170010",
      "name": "กองป้องกันการทุจริตในภาครัฐ",
      "abbreviation": "กปก.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 12,
      "code": "250170011",
      "name": "กองยุทธศาสตร์และแผนงาน",
      "abbreviation": "กยผ.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 13,
      "code": "250170012",
      "name": "กองอำนวยการต่อต้านการทุจริต",
      "abbreviation": "กอท.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 14,
      "code": "250170013",
      "name": "ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร",
      "abbreviation": "ศทส.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 15,
      "code": "250170014",
      "name": "สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต ๑",
      "abbreviation": "ปปท.เขต 1",
      "zone": 2,
      "departmentKind": "1"
    },
    {
      "id": 16,
      "code": "250170015",
      "name": "สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต ๒",
      "abbreviation": "ปปท.เขต 2",
      "zone": 2,
      "departmentKind": "1"
    },
    {
      "id": 17,
      "code": "250170016",
      "name": "สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต ๓",
      "abbreviation": "ปปท.เขต 3",
      "zone": 2,
      "departmentKind": "1"
    },
    {
      "id": 18,
      "code": "250170017",
      "name": "สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต ๔",
      "abbreviation": "ปปท.เขต 4",
      "zone": 2,
      "departmentKind": "1"
    },
    {
      "id": 19,
      "code": "250170018",
      "name": "สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต ๕",
      "abbreviation": "ปปท.เขต 5",
      "zone": 2,
      "departmentKind": "1"
    },
    {
      "id": 20,
      "code": "250170019",
      "name": "สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต ๖",
      "abbreviation": "ปปท.เขต 6",
      "zone": 2,
      "departmentKind": "1"
    },
    {
      "id": 21,
      "code": "250170020",
      "name": "สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต ๗",
      "abbreviation": "ปปท.เขต 7",
      "zone": 2,
      "departmentKind": "1"
    },
    {
      "id": 22,
      "code": "250170021",
      "name": "สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต ๘",
      "abbreviation": "ปปท.เขต 8",
      "zone": 2,
      "departmentKind": "1"
    },
    {
      "id": 23,
      "code": "250170022",
      "name": "สำนักงานป้องกันและปราบปรามการทุจริตในภาครัฐ เขต ๙",
      "abbreviation": "ปปท.เขต 9",
      "zone": 2,
      "departmentKind": "1"
    },
    {
      "id": 24,
      "code": "250170023",
      "name": "กลุ่มตรวจสอบภายใน",
      "abbreviation": "กตน.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 25,
      "code": "250170024",
      "name": "กลุ่มพัฒนาระบบบริหาร",
      "abbreviation": "กพร.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 26,
      "code": "250170025",
      "name": "ศูนย์ปฏิบัติการต่อต้านการทุจริต",
      "abbreviation": "ศปท.",
      "zone": 1,
      "departmentKind": "1"
    },
    {
      "id": 29,
      "code": "250170028",
      "name": "กองนวัตกรรมและความโปร่งใสในภาครัฐ",
      "abbreviation": "กนป.",
      "zone": 1,
      "departmentKind": "2"
    },
    {
      "id": 30,
      "code": "250170029",
      "name": "กองบริหารความเสี่ยงและสกัดกั้นการทุจริตในภาครัฐ",
      "abbreviation": "กบส.",
      "zone": 1,
      "departmentKind": "2"
    },
    {
      "id": 31,
      "code": "250170030",
      "name": "กองกำกับและขับเคลื่อนการดำเนินงานนโยบายภาครัฐ",
      "abbreviation": "กนร.",
      "zone": 1,
      "departmentKind": "2"
    },
    {
      "id": 33,
      "code": "250170032",
      "name": "กลุ่มอำนวยการผู้บริหาร",
      "abbreviation": "กอผ.",
      "zone": 1,
      "departmentKind": "2"
    }
  ],
  "segmentDepartments": [
    {
      "code": "250170000-01",
      "departmentCode": "250170000",
      "segmentId": 58,
      "name": "สำนักงาน ป.ป.ท.",
      "abbreviation": ""
    },
    {
      "code": "250170001-01",
      "departmentCode": "250170001",
      "segmentId": 40,
      "name": "กลุ่มงานสารบรรณ",
      "abbreviation": "สลธ.กสบ."
    },
    {
      "code": "250170001-02",
      "departmentCode": "250170001",
      "segmentId": 7,
      "name": "กลุ่มงานคลังและพัสดุ",
      "abbreviation": "สลธ.กงค."
    },
    {
      "code": "250170001-03",
      "departmentCode": "250170001",
      "segmentId": 10,
      "name": "กลุ่มงานช่วยอำนวยการ",
      "abbreviation": ""
    },
    {
      "code": "250170001-04",
      "departmentCode": "250170001",
      "segmentId": 41,
      "name": "กลุ่มงานสื่อสารองค์กร",
      "abbreviation": "สลธ.กสบ."
    },
    {
      "code": "250170002-01",
      "departmentCode": "250170002",
      "segmentId": 49,
      "name": "ฝ่ายบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170002-02",
      "departmentCode": "250170002",
      "segmentId": 1,
      "name": "กลุ่มงานกฎหมาย",
      "abbreviation": ""
    },
    {
      "code": "250170002-03",
      "departmentCode": "250170002",
      "segmentId": 6,
      "name": "กลุ่มงานคดี",
      "abbreviation": ""
    },
    {
      "code": "250170002-04",
      "departmentCode": "250170002",
      "segmentId": 8,
      "name": "กลุ่มงานความเห็นแย้ง",
      "abbreviation": ""
    },
    {
      "code": "250170003-01",
      "departmentCode": "250170003",
      "segmentId": 49,
      "name": "ฝ่ายบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170003-02",
      "departmentCode": "250170003",
      "segmentId": 36,
      "name": "กลุ่มงานวิชาการป้องกันและปราบปรามการทุจริตระหว่างประเทศ",
      "abbreviation": ""
    },
    {
      "code": "250170003-03",
      "departmentCode": "250170003",
      "segmentId": 46,
      "name": "กลุ่มงานอำนวยการและส่งเสริมความร่วมมือระหว่างประเทศ",
      "abbreviation": ""
    },
    {
      "code": "250170004-01",
      "departmentCode": "250170004",
      "segmentId": 13,
      "name": "กลุ่มงานบริหารคดีและบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170004-02",
      "departmentCode": "250170004",
      "segmentId": 51,
      "name": "ศูนย์รับเรื่องร้องเรียน",
      "abbreviation": ""
    },
    {
      "code": "250170004-03",
      "departmentCode": "250170004",
      "segmentId": 5,
      "name": "กลุ่มงานคณะกรรมการ",
      "abbreviation": ""
    },
    {
      "code": "250170004-04",
      "departmentCode": "250170004",
      "segmentId": 15,
      "name": "กลุ่มงานบริหารติดตามคดี",
      "abbreviation": ""
    },
    {
      "code": "250170005-01",
      "departmentCode": "250170005",
      "segmentId": 50,
      "name": "ฝ่ายบริหารทั่วไปและคดี",
      "abbreviation": ""
    },
    {
      "code": "250170005-02",
      "departmentCode": "250170005",
      "segmentId": 20,
      "name": "กลุ่มงานปราบปรามการทุจริตกระทรวงด้านความมั่นคง ๑",
      "abbreviation": ""
    },
    {
      "code": "250170005-03",
      "departmentCode": "250170005",
      "segmentId": 21,
      "name": "กลุ่มงานปราบปรามการทุจริตกระทรวงด้านความมั่นคง ๒",
      "abbreviation": ""
    },
    {
      "code": "250170006-01",
      "departmentCode": "250170006",
      "segmentId": 50,
      "name": "ฝ่ายบริหารทั่วไปและคดี",
      "abbreviation": ""
    },
    {
      "code": "250170006-02",
      "departmentCode": "250170006",
      "segmentId": 22,
      "name": "กลุ่มงานปราบปรามการทุจริตกระทรวงด้านสังคม",
      "abbreviation": ""
    },
    {
      "code": "250170006-03",
      "departmentCode": "250170006",
      "segmentId": 23,
      "name": "กลุ่มงานปราบปรามการทุจริตกระทรวงด้านเศรษฐกิจ",
      "abbreviation": ""
    },
    {
      "code": "250170007-01",
      "departmentCode": "250170007",
      "segmentId": 50,
      "name": "ฝ่ายบริหารทั่วไปและคดี",
      "abbreviation": ""
    },
    {
      "code": "250170007-02",
      "departmentCode": "250170007",
      "segmentId": 29,
      "name": "กลุ่มงานปราบปรามการทุจริตในรัฐวิสาหกิจ ๑",
      "abbreviation": ""
    },
    {
      "code": "250170007-03",
      "departmentCode": "250170007",
      "segmentId": 30,
      "name": "กลุ่มงานปราบปรามการทุจริตในรัฐวิสาหกิจ ๒",
      "abbreviation": ""
    },
    {
      "code": "250170008-01",
      "departmentCode": "250170008",
      "segmentId": 50,
      "name": "ฝ่ายบริหารทั่วไปและคดี",
      "abbreviation": ""
    },
    {
      "code": "250170008-02",
      "departmentCode": "250170008",
      "segmentId": 31,
      "name": "กลุ่มงานปราบปรามการทุจริตในองค์กรปกครองส่วนท้องถิ่น ๑",
      "abbreviation": ""
    },
    {
      "code": "250170008-03",
      "departmentCode": "250170008",
      "segmentId": 32,
      "name": "กลุ่มงานปราบปรามการทุจริตในองค์กรปกครองส่วนท้องถิ่น ๒",
      "abbreviation": ""
    },
    {
      "code": "250170009-01",
      "departmentCode": "250170009",
      "segmentId": 50,
      "name": "ฝ่ายบริหารทั่วไปและคดี",
      "abbreviation": ""
    },
    {
      "code": "250170009-02",
      "departmentCode": "250170009",
      "segmentId": 24,
      "name": "กลุ่มงานปราบปรามการทุจริตหน่วยงานในสังกัดสำนักนายกรัฐมนตรี",
      "abbreviation": ""
    },
    {
      "code": "250170009-03",
      "departmentCode": "250170009",
      "segmentId": 25,
      "name": "กลุ่มงานปราบปรามการทุจริตหน่วยงานไม่สังกัดกระทรวง ทบวง สำนักนายกรัฐมนตรี",
      "abbreviation": ""
    },
    {
      "code": "250170010-01",
      "departmentCode": "250170010",
      "segmentId": 49,
      "name": "ฝ่ายบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170010-02",
      "departmentCode": "250170010",
      "segmentId": 37,
      "name": "กลุ่มงานวิชาการและพัฒนานวัตกรรมด้านการป้องกัน",
      "abbreviation": ""
    },
    {
      "code": "250170010-03",
      "departmentCode": "250170010",
      "segmentId": 42,
      "name": "กลุ่มงานส่งเสริมธรรมาภิบาลในภาครัฐ",
      "abbreviation": ""
    },
    {
      "code": "250170010-04",
      "departmentCode": "250170010",
      "segmentId": 47,
      "name": "กลุ่มงานเครือข่ายภาคประชาสังคมป้องกันการทุจริต",
      "abbreviation": ""
    },
    {
      "code": "250170011-01",
      "departmentCode": "250170011",
      "segmentId": 49,
      "name": "ฝ่ายบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170011-02",
      "departmentCode": "250170011",
      "segmentId": 11,
      "name": "กลุ่มงานติดตามและประเมินผล",
      "abbreviation": ""
    },
    {
      "code": "250170011-03",
      "departmentCode": "250170011",
      "segmentId": 12,
      "name": "กลุ่มงานนโยบายและยุทธศาสตร์",
      "abbreviation": ""
    },
    {
      "code": "250170011-04",
      "departmentCode": "250170011",
      "segmentId": 48,
      "name": "กลุ่มงานแผนงานและงบประมาณ",
      "abbreviation": ""
    },
    {
      "code": "250170012-01",
      "departmentCode": "250170012",
      "segmentId": 50,
      "name": "ฝ่ายบริหารทั่วไปและคดี",
      "abbreviation": ""
    },
    {
      "code": "250170012-02",
      "departmentCode": "250170012",
      "segmentId": 33,
      "name": "กลุ่มงานปราบปรามด้านคดีพิเศษ",
      "abbreviation": ""
    },
    {
      "code": "250170012-03",
      "departmentCode": "250170012",
      "segmentId": 43,
      "name": "กลุ่มงานอำนวยการคุ้มครองพยาน",
      "abbreviation": ""
    },
    {
      "code": "250170012-04",
      "departmentCode": "250170012",
      "segmentId": 44,
      "name": "กลุ่มงานอำนวยการด้านการข่าว",
      "abbreviation": ""
    },
    {
      "code": "250170012-05",
      "departmentCode": "250170012",
      "segmentId": 45,
      "name": "กลุ่มงานอำนวยการและกำกับศูนย์ปฏิบัติการต่อต้านการทุจริต",
      "abbreviation": ""
    },
    {
      "code": "250170012-06",
      "departmentCode": "250170012",
      "segmentId": 53,
      "name": "ศูนย์ปฏิบัติการสนับสนุนการปรับปรุงแผนที่ฯ (ONE MAP)",
      "abbreviation": ""
    },
    {
      "code": "250170012-07",
      "departmentCode": "250170012",
      "segmentId": 19,
      "name": "กลุ่มงานประเมินความเสี่ยงทุจริตภาครัฐ",
      "abbreviation": ""
    },
    {
      "code": "250170013-01",
      "departmentCode": "250170013",
      "segmentId": 49,
      "name": "ฝ่ายบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170013-02",
      "departmentCode": "250170013",
      "segmentId": 9,
      "name": "กลุ่มงานคอมพิวเตอร์และการสื่อสาร",
      "abbreviation": ""
    },
    {
      "code": "250170013-03",
      "departmentCode": "250170013",
      "segmentId": 16,
      "name": "กลุ่มงานบริหารเทคโนโลยีและพัฒนาระบบ",
      "abbreviation": ""
    },
    {
      "code": "250170014-01",
      "departmentCode": "250170014",
      "segmentId": 13,
      "name": "กลุ่มงานบริหารคดีและบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170014-02",
      "departmentCode": "250170014",
      "segmentId": 34,
      "name": "กลุ่มงานป้องกันการทุจริตในภาครัฐ เขต ๑",
      "abbreviation": ""
    },
    {
      "code": "250170014-03",
      "departmentCode": "250170014",
      "segmentId": 26,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๑",
      "abbreviation": ""
    },
    {
      "code": "250170014-04",
      "departmentCode": "250170014",
      "segmentId": 27,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๒",
      "abbreviation": ""
    },
    {
      "code": "250170014-05",
      "departmentCode": "250170014",
      "segmentId": 28,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๓",
      "abbreviation": ""
    },
    {
      "code": "250170015-01",
      "departmentCode": "250170015",
      "segmentId": 13,
      "name": "กลุ่มงานบริหารคดีและบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170015-02",
      "departmentCode": "250170015",
      "segmentId": 34,
      "name": "กลุ่มงานป้องกันการทุจริตในภาครัฐ เขต ๒",
      "abbreviation": ""
    },
    {
      "code": "250170015-03",
      "departmentCode": "250170015",
      "segmentId": 26,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๑",
      "abbreviation": ""
    },
    {
      "code": "250170015-04",
      "departmentCode": "250170015",
      "segmentId": 27,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๒",
      "abbreviation": ""
    },
    {
      "code": "250170015-05",
      "departmentCode": "250170015",
      "segmentId": 28,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๓",
      "abbreviation": ""
    },
    {
      "code": "250170016-01",
      "departmentCode": "250170016",
      "segmentId": 13,
      "name": "กลุ่มงานบริหารคดีและบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170016-02",
      "departmentCode": "250170016",
      "segmentId": 34,
      "name": "กลุ่มงานป้องกันการทุจริตในภาครัฐ เขต ๓",
      "abbreviation": ""
    },
    {
      "code": "250170016-03",
      "departmentCode": "250170016",
      "segmentId": 26,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๑",
      "abbreviation": ""
    },
    {
      "code": "250170016-04",
      "departmentCode": "250170016",
      "segmentId": 27,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๒",
      "abbreviation": ""
    },
    {
      "code": "250170016-05",
      "departmentCode": "250170016",
      "segmentId": 28,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๓",
      "abbreviation": ""
    },
    {
      "code": "250170017-01",
      "departmentCode": "250170017",
      "segmentId": 13,
      "name": "กลุ่มงานบริหารคดีและบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170017-02",
      "departmentCode": "250170017",
      "segmentId": 34,
      "name": "กลุ่มงานป้องกันการทุจริตในภาครัฐ เขต ๔",
      "abbreviation": ""
    },
    {
      "code": "250170017-03",
      "departmentCode": "250170017",
      "segmentId": 26,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๑",
      "abbreviation": ""
    },
    {
      "code": "250170017-04",
      "departmentCode": "250170017",
      "segmentId": 27,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๒",
      "abbreviation": ""
    },
    {
      "code": "250170017-05",
      "departmentCode": "250170017",
      "segmentId": 28,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๓",
      "abbreviation": ""
    },
    {
      "code": "250170018-01",
      "departmentCode": "250170018",
      "segmentId": 13,
      "name": "กลุ่มงานบริหารคดีและบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170018-02",
      "departmentCode": "250170018",
      "segmentId": 34,
      "name": "กลุ่มงานป้องกันการทุจริตในภาครัฐ เขต ๕",
      "abbreviation": ""
    },
    {
      "code": "250170018-03",
      "departmentCode": "250170018",
      "segmentId": 26,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๑",
      "abbreviation": ""
    },
    {
      "code": "250170018-04",
      "departmentCode": "250170018",
      "segmentId": 27,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๒",
      "abbreviation": ""
    },
    {
      "code": "250170018-05",
      "departmentCode": "250170018",
      "segmentId": 28,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๓",
      "abbreviation": ""
    },
    {
      "code": "250170019-01",
      "departmentCode": "250170019",
      "segmentId": 13,
      "name": "กลุ่มงานบริหารคดีและบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170019-02",
      "departmentCode": "250170019",
      "segmentId": 34,
      "name": "กลุ่มงานป้องกันการทุจริตในภาครัฐ เขต ๖",
      "abbreviation": ""
    },
    {
      "code": "250170019-03",
      "departmentCode": "250170019",
      "segmentId": 26,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๑",
      "abbreviation": ""
    },
    {
      "code": "250170019-04",
      "departmentCode": "250170019",
      "segmentId": 27,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๒",
      "abbreviation": ""
    },
    {
      "code": "250170019-05",
      "departmentCode": "250170019",
      "segmentId": 28,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๓",
      "abbreviation": ""
    },
    {
      "code": "250170020-01",
      "departmentCode": "250170020",
      "segmentId": 13,
      "name": "กลุ่มงานบริหารคดีและบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170020-02",
      "departmentCode": "250170020",
      "segmentId": 34,
      "name": "กลุ่มงานป้องกันการทุจริตในภาครัฐ เขต ๗",
      "abbreviation": ""
    },
    {
      "code": "250170020-03",
      "departmentCode": "250170020",
      "segmentId": 26,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๑",
      "abbreviation": ""
    },
    {
      "code": "250170020-04",
      "departmentCode": "250170020",
      "segmentId": 27,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๒",
      "abbreviation": ""
    },
    {
      "code": "250170020-05",
      "departmentCode": "250170020",
      "segmentId": 28,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๓",
      "abbreviation": ""
    },
    {
      "code": "250170021-01",
      "departmentCode": "250170021",
      "segmentId": 13,
      "name": "กลุ่มงานบริหารคดีและบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170021-02",
      "departmentCode": "250170021",
      "segmentId": 34,
      "name": "กลุ่มงานป้องกันการทุจริตในภาครัฐ เขต ๘",
      "abbreviation": ""
    },
    {
      "code": "250170021-03",
      "departmentCode": "250170021",
      "segmentId": 26,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๑",
      "abbreviation": ""
    },
    {
      "code": "250170021-04",
      "departmentCode": "250170021",
      "segmentId": 27,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๒",
      "abbreviation": ""
    },
    {
      "code": "250170021-05",
      "departmentCode": "250170021",
      "segmentId": 28,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๓",
      "abbreviation": ""
    },
    {
      "code": "250170022-01",
      "departmentCode": "250170022",
      "segmentId": 13,
      "name": "กลุ่มงานบริหารคดีและบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170022-02",
      "departmentCode": "250170022",
      "segmentId": 34,
      "name": "กลุ่มงานป้องกันการทุจริตในภาครัฐ เขต ๙",
      "abbreviation": ""
    },
    {
      "code": "250170022-03",
      "departmentCode": "250170022",
      "segmentId": 26,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๑",
      "abbreviation": ""
    },
    {
      "code": "250170022-04",
      "departmentCode": "250170022",
      "segmentId": 27,
      "name": "กลุ่มงานปราบปรามการทุจริตในภาครัฐ ๒",
      "abbreviation": ""
    },
    {
      "code": "250170025-01",
      "departmentCode": "250170025",
      "segmentId": 56,
      "name": "กลุ่มงานป้องกันและปราบปรามการทุจริตและประพฤติมิชอบ",
      "abbreviation": ""
    },
    {
      "code": "250170025-02",
      "departmentCode": "250170025",
      "segmentId": 57,
      "name": "กลุ่มงานจริยธรรม",
      "abbreviation": ""
    },
    {
      "code": "250170028-01",
      "departmentCode": "250170028",
      "segmentId": 49,
      "name": "ฝ่ายบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170028-02",
      "departmentCode": "250170028",
      "segmentId": 3,
      "name": "กลุ่มงานขับเคลื่อนและประเมินผลการแก้ไขปัญหาการทุจริตและความโปร่งใสในภาครัฐ",
      "abbreviation": ""
    },
    {
      "code": "250170028-03",
      "departmentCode": "250170028",
      "segmentId": 39,
      "name": "กลุ่มงานศึกษาการประเมินดัชนีชี้วัดระดับการทุจริตและพัฒนามาตรการความโปร่งใสในภาครัฐ",
      "abbreviation": ""
    },
    {
      "code": "250170028-04",
      "departmentCode": "250170028",
      "segmentId": 52,
      "name": "ศูนย์ขับเคลื่อนการบริการภาครัฐสำหรับนักลงทุนและชาวต่างชาติ",
      "abbreviation": ""
    },
    {
      "code": "250170029-01",
      "departmentCode": "250170029",
      "segmentId": 49,
      "name": "ฝ่ายบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170029-02",
      "departmentCode": "250170029",
      "segmentId": 18,
      "name": "กลุ่มงานประเมินความเสี่ยงการทุจริตเชิงนโยบาย",
      "abbreviation": ""
    },
    {
      "code": "250170029-03",
      "departmentCode": "250170029",
      "segmentId": 19,
      "name": "กลุ่มงานประเมินความเสี่ยงการทุจริตในภาครัฐ",
      "abbreviation": ""
    },
    {
      "code": "250170030-01",
      "departmentCode": "250170030",
      "segmentId": 49,
      "name": "ฝ่ายบริหารทั่วไป",
      "abbreviation": ""
    },
    {
      "code": "250170030-02",
      "departmentCode": "250170030",
      "segmentId": 2,
      "name": "กลุ่มงานขับเคลื่อนการดำเนินงานนโยบายภาครัฐ",
      "abbreviation": ""
    },
    {
      "code": "250170030-03",
      "departmentCode": "250170030",
      "segmentId": 45,
      "name": "กลุ่มงานอำนวยการและกำกับศูนย์ปฏิบัติการต่อต้านการทุจริต",
      "abbreviation": ""
    },
    {
      "code": "250170032-01",
      "departmentCode": "250170032",
      "segmentId": 54,
      "name": "กลุ่มอำนวยการผู้บริหาร",
      "abbreviation": ""
    }
  ],
  "subsegments": [
    {
      "id": 1,
      "segmentId": 55,
      "name": "งานเลขาธิการ"
    },
    {
      "id": 2,
      "segmentId": 55,
      "name": "งานรองเลขาธิการ 1"
    },
    {
      "id": 3,
      "segmentId": 55,
      "name": "งานรองเลขาธิการ 2"
    },
    {
      "id": 4,
      "segmentId": 55,
      "name": "งานผู้ช่วยเลขาธิการ"
    },
    {
      "id": 5,
      "segmentId": 7,
      "name": "ฝ่ายการเงิน"
    },
    {
      "id": 6,
      "segmentId": 7,
      "name": "ฝ่ายบัญชีและงบประมาณ"
    },
    {
      "id": 7,
      "segmentId": 7,
      "name": "ฝ่ายพัสดุและอาคารสถานที่"
    },
    {
      "id": 8,
      "segmentId": 14,
      "name": "ฝ่ายสรรหาและบรรจุแต่งตั้ง"
    },
    {
      "id": 9,
      "segmentId": 14,
      "name": "ฝ่ายทะเบียนประวัติและบำเหน็จความชอบ"
    },
    {
      "id": 10,
      "segmentId": 14,
      "name": "ฝ่ายวิชาการและอัตรากำลัง"
    },
    {
      "id": 11,
      "segmentId": 14,
      "name": "ฝ่ายสวัสดิการและสิทธิประโยชน์"
    },
    {
      "id": 12,
      "segmentId": 41,
      "name": "ฝ่ายประชาสัมพันธ์"
    },
    {
      "id": 13,
      "segmentId": 41,
      "name": "ฝ่ายข่ายและสื่อมวลชนสัมพันธ์"
    },
    {
      "id": 14,
      "segmentId": 1,
      "name": "ฝ่ายพัฒนากฎหมาย"
    },
    {
      "id": 15,
      "segmentId": 1,
      "name": "ฝ่ายให้ความเห็นทางกฏหมาย"
    },
    {
      "id": 16,
      "segmentId": 5,
      "name": "ฝ่ายกิจกรรมคณะกรรมการ"
    },
    {
      "id": 17,
      "segmentId": 5,
      "name": "ฝ่ายการประชุมและมติคณะกรรมการ"
    },
    {
      "id": 18,
      "segmentId": 33,
      "name": "ฝ่ายปฏิบัติการพิเศษ 1"
    },
    {
      "id": 19,
      "segmentId": 33,
      "name": "ฝ่ายปฏิบัติการพิเศษ 2"
    }
  ]
};
})(window);
