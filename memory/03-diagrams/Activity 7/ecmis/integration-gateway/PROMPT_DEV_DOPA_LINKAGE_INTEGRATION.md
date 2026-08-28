# Prompt สำหรับพัฒนาระบบเชื่อมโยงกรมการปกครองผ่าน Linkage Center 2

คัดลอกตั้งแต่หัวข้อ "บทบาท" เป็นต้นไปให้ทีมพัฒนาหรือ Coding Agent พร้อมแนบ Mockup, คู่มือ Linkage Management และ API Document/Swagger ที่ได้จาก Linkage Proxy Server ของสำนักงาน ป.ป.ท.

---

## บทบาท

คุณเป็น Senior Full-stack Developer, Integration Engineer และ Security Engineer ของระบบ E-CMIS สำนักงาน ป.ป.ท. ให้พัฒนาการเชื่อมโยงข้อมูลกรมการปกครองผ่าน Linkage Center 2 โดยยึด Security by Design, Least Privilege, PDPA, Auditability และ Contract-first Development

ห้ามสมมติ Base URL, Endpoint Path, `jobID` หรือสิทธิของสำนักงาน ป.ป.ท. รายการ `serviceID` และ Data Dictionary สาธารณะใช้เป็น Design Reference ได้ แต่ต้องยืนยันอีกครั้งกับ API Document บน Proxy และสิทธิจริงของกระบวนงานก่อนเปิด Real Adapter

## เอกสารอ้างอิง

1. Mockup: `index.html` ใน Repository `E-CMIS-muck-api`
2. คู่มือ: `คู่มือ Superuser ผู้ดูแล Linkage Management 2 - v4.pdf`
3. ข้อมูลหน้าจอนักพัฒนาของหน่วยงานจาก Linkage Management
4. API Document/Swagger บน Linkage Proxy Server ของสำนักงาน ป.ป.ท. ซึ่งยังต้องได้รับ Domain หรือ IP หลังติดตั้ง
5. Public Service Directory: `https://lk2management.bora.dopa.go.th/api/dashboard/service/directory/`
6. Public Data Dictionary รายบริการ: `https://lk2management.bora.dopa.go.th/api/dashboard/service/{serviceID}`

`https://lk2management.bora.dopa.go.th` เป็นระบบบริหารจัดการสิทธิ ผู้ใช้ บริการ กระบวนงาน และ Proxy Server ไม่ใช่ Data API Endpoint ที่ E-CMIS ใช้ยิงข้อมูลโดยตรง

ข้อความ `http://example.com/document` ในหน้า Developer เป็น Placeholder ของ API Document บน Proxy ไม่ใช่ URL จริง ห้ามนำไปใส่ Production Configuration

## เป้าหมาย

พัฒนา E-CMIS ให้เจ้าหน้าที่ค้นข้อมูลบุคคลเพื่อประกอบการสืบสวนและสำนวนคดี โดย Application ต้องเรียก Backend ของ E-CMIS และ Backend จึงเรียก Linkage Proxy Server ภายในหน่วยงาน ห้าม Browser เรียก Linkage Center หรือถือ Bearer Token โดยตรง

```text
E-CMIS Browser
    |
E-CMIS Backend + Authorization + Audit
    |
Linkage Client / Session Manager
    |
Linkage Proxy Server ของสำนักงาน ป.ป.ท.
    |
Linkage Center 2
    |
บริการข้อมูลกรมการปกครองที่ได้รับสิทธิ
```

## ข้อเท็จจริงจากคู่มือ

- Application ต้องเรียกผ่าน Linkage Proxy Server ของหน่วยงานเท่านั้น
- Proxy Server ต้องเป็น Linux Server ที่ติดตั้ง Docker และเชื่อม Network ถึง Linkage Center
- Proxy มีสถานะหลัก เช่น รอติดตั้ง, ติดตั้งแล้ว และลงทะเบียนแล้ว
- API Document/Swagger อยู่บน Proxy Server หลังติดตั้ง
- Sandbox Request ต้องแนบ Header `X-Use-Sandbox: 1`
- ผู้ใช้งานต้องมีสิทธิ User/Developer และถูกผูกกับกลุ่มผู้ใช้และกระบวนงาน
- ค่าโควต้าผู้ใช้เริ่มต้นในคู่มือคือ 150 ครั้ง/วัน
- Superuser แก้ไขได้ไม่เกิน 1,000 ครั้ง/วัน หากมากกว่านั้นต้องให้ Admin แก้ไข
- 1 กระบวนงานเพิ่มบริการข้อมูลได้สูงสุด 10 Services
- กระบวนงานกำหนดกลุ่มผู้ใช้และช่วงเวลาใช้งานได้
- ถ้าไม่พบบริการที่ต้องการในกระบวนงาน ต้องให้ Admin เปิดสิทธิบริการให้หน่วยงานก่อน
- Proxy Health Check มีรอบเริ่มต้น 10 นาที
- คู่มือระบุ Log ขนาด 1 MB และดูย้อนหลัง 90 วัน
- ประวัติการใช้งานใน Linkage Management ค้นหาเป็นช่วงได้ไม่เกิน 15 วัน

## ขอบเขตข้อมูลใน Mockup

Mockup อ้างอิง Service Directory และ Data Dictionary สาธารณะที่ตรวจสอบได้แล้ว:

| serviceID | บริการ | บทบาทบนหน้าจอ |
|---:|---|---|
| 1 | ข้อมูลทะเบียนราษฎร | ข้อมูลระบุตัวบุคคล |
| 10 | ข้อมูลทะเบียนบ้าน | ที่อยู่ตามทะเบียนบ้าน |
| 21 | ข้อมูลภาพใบหน้า | ภาพ Base64 และ MIME type |
| 9 | ข้อมูลการเปลี่ยนแปลงชื่อตัว-ชื่อสกุล | ประวัติชื่อเดิมและชื่อใหม่ |
| 144 | ข้อมูลสถานภาพบุคคล | สถานะ ย้ายเข้า ย้ายออก และยกเลิกรายการ |
| 27 | ข้อมูลใบมรณบัตร | รายละเอียดการเสียชีวิตเมื่อพบข้อมูล |
| 32 | ข้อมูลรายการทำบัตรประจำตัวประชาชน | รายการคำขอมีบัตร |
| 51 | ข้อมูลทะเบียนราษฎร ค้นด้วยชื่อตัว-ชื่อสกุล | ค้นชื่อปัจจุบัน |
| 41 | ข้อมูลทะเบียนราษฎร ค้นด้วยชื่อตัว-ชื่อสกุลเดิม | ค้นชื่อเดิม |

Service ID สาธารณะไม่ได้แปลว่าสำนักงาน ป.ป.ท. ได้รับสิทธิใช้งาน ต้องขอให้ลูกค้ายืนยันว่า Service ใดถูกเพิ่มในกระบวนงานจริง รวมถึงตรวจ Input/Output กับ Swagger บน Proxy ก่อนพัฒนา Production

ข้อมูลภาพใบหน้าย้อนหลังและที่อยู่ที่บันทึกไว้เมื่อทำบัตรประชาชนเป็น Requirement เพิ่มเติมจากลูกค้า แต่ยังต้องยืนยัน serviceID, สิทธิ์, Input/Output และความสัมพันธ์กับรายการคำขอมีบัตรก่อนพัฒนา Real Adapter ห้ามตีความเองว่า serviceID 32 คืนภาพหรือที่อยู่บนบัตร

ห้ามรวมทุกข้อมูลเป็น Service เดียว `adaptor-bora-pop` เพราะแต่ละชุดข้อมูลเป็นบริการแยกและอาจมีสิทธิแตกต่างกัน

## หน้าจอค้นข้อมูลบุคคล

ช่องรับข้อมูลแยกตามวิธีค้นหา:

- เลขประชาชน: `personalID` สำหรับ serviceID 1
- ชื่อปัจจุบัน: `firstName`, `lastName`, `middleName`, `limit=1`, `recordNumber` สำหรับ serviceID 51
- ชื่อเดิม: `oldFirstName`, `oldLastName`, `limit=1`, `recordNumber` สำหรับ serviceID 41
- `caseNo`: เลขที่สำนวนคดี บังคับกรอก ใช้ภายใน E-CMIS
- `purposeCode` และ `purposeText`: วัตถุประสงค์การค้นหา บังคับกรอก
- Demo Scenario มีเฉพาะ Mockup และต้องตัดออกจาก Production

เงื่อนไข:

- ตรวจสอบรูปแบบเลข 13 หลักฝั่ง Browser เพื่อ UX และตรวจซ้ำฝั่ง Backend
- ตรวจ Authorization ฝั่ง Server ว่าผู้ใช้มีสิทธิ์ในคดีและมีบทบาทค้นข้อมูลได้
- การค้นด้วยชื่ออาจพบหลายรายการ API คืนครั้งละ 1 รายการ ให้เลื่อนด้วย `recordNumber` และเรียกข้อมูลละเอียดหลังผู้ใช้เลือก `pid` เท่านั้น
- ห้ามเรียกภาพ ที่อยู่ หรือข้อมูลครอบครัวของผู้สมัครทุกคนเพื่อแยกชื่อซ้ำ
- ห้ามส่ง `caseNo` หรือรายละเอียดคดีไป Linkage หาก Contract ไม่ได้กำหนด
- ผลลัพธ์ต้องแสดงสถานะแยกราย Service เพราะ Request เดียวอาจสำเร็จบาง Service และล้มเหลวบาง Service
- แสดง `responseStatus`, `responseContentType`, `responseTimeMs` และ `responseError` สำหรับการตรวจสอบ โดยไม่แสดง Raw Response หรือ Token
- ข้อมูลบุคคลใน Source Code, Seed และ Screenshot ต้องเป็นข้อมูลสมมติเท่านั้น

## หน้าผลลัพธ์และเอกสารพิมพ์

- แสดงที่อยู่ 2 แหล่งแยกกันชัดเจน:
  - ที่อยู่ตามทะเบียนบ้านจาก serviceID 10 เป็นข้อมูลหลัก
  - ที่อยู่บนบัตรประชาชนเป็นข้อมูล ณ วันที่ทำบัตร อาจไม่ใช่ที่อยู่ปัจจุบัน ต้องแสดงวันที่อ้างอิงและหมายเลขคำขอมีบัตรเมื่อ Contract มีข้อมูล
- หากที่อยู่สองแหล่งไม่ตรงกัน ต้องแจ้งเตือนและห้ามรวมเป็นค่าเดียว
- เอกสารพิมพ์ต้องใช้ที่อยู่ตามทะเบียนบ้านเท่านั้น ห้ามใช้ที่อยู่บนบัตรแทนโดยอัตโนมัติ
- เอกสารพิมพ์ต้องแสดงชื่อปัจจุบันและชื่อเดิมทั้งหมด เรียงจากปัจจุบันย้อนกลับ พร้อมวันที่และสำนักทะเบียนเมื่อมีข้อมูล
- เอกสารพิมพ์ต้องมีเบอร์โทรติดต่อ แต่เบอร์โทรเป็นข้อมูลจากสำนวน E-CMIS ไม่ใช่ข้อมูล DOPA ต้องให้เจ้าหน้าที่ตรวจสอบหรือกรอกก่อนพิมพ์
- หน้าจอต้องมีประวัติภาพใบหน้าจากปัจจุบันย้อนกลับ แต่ Real Adapter เปิดใช้ได้เมื่อยืนยัน API และสิทธิ์ภาพย้อนหลังแล้วเท่านั้น
- ทุกครั้งที่พิมพ์เอกสาร เปิดภาพย้อนหลัง หรือคัดลอกที่อยู่ ต้องบันทึก Audit Log ตามระดับความเสี่ยงที่หน่วยงานกำหนด

## Authentication Flow

### 1. ขอ Login

Smart Card (`loginType: 1`):

```json
{
  "loginType": 1,
  "personalID": "13 digits",
  "chipNo": "card chip number"
}
```

ผลสำเร็จ HTTP 200 คืน `office[]` และ `random`

Digital ID (`loginType: 2`):

```json
{
  "loginType": 2,
  "personalID": "13 digits"
}
```

ผลสำเร็จ HTTP 200 คืน `office[]`

กรณีไม่พบผู้ใช้ HTTP 404:

```json
{"errorMessage":"Not Found"}
```

### 2. Confirm Login

Smart Card:

```json
{
  "loginType": 1,
  "officeID": "selected office id",
  "random": "value from login",
  "envelope": "signed smart-card envelope"
}
```

Digital ID:

```json
{
  "loginType": 2,
  "officeID": "selected office id",
  "personalID": "13 digits",
  "accessToken": "Digital ID access token"
}
```

ผลสำเร็จ HTTP 201 คืน Linkage Bearer `token`

Token ต้องเก็บ Server-side ใน Encrypted Session/Secret Storage ห้ามส่งให้ Browser, Local Storage, Session Storage, URL, Analytics หรือ Log

## กระบวนงานที่มีสิทธิ

เรียกด้วย Header:

```http
Authorization: Bearer <server-side-token>
```

ผลสำเร็จ HTTP 200:

```json
{
  "job": [
    "process-uuid-1",
    "process-uuid-2"
  ]
}
```

ชื่อฟิลด์ `job` ใน Response หมายถึงรายการรหัสกระบวนงานที่ผู้ใช้มีสิทธิ์ ส่วน Request ข้อมูลใช้ชื่อ `jobID`

อย่าเลือก `jobID` ด้วยตำแหน่ง Array ให้ Map จาก Configuration ที่ยืนยันชื่อกระบวนงานและ UUID แล้ว และ Fail Closed หากไม่พบค่าที่ตรงกัน

## Request ข้อมูล

ใช้ Bearer Token และส่ง Body ตามโครงสร้างที่ API Document จริงยืนยัน ตัวอย่างจาก Sandbox:

```json
{
  "jobID": "authorized-process-uuid",
  "consent": {
    "type": 2,
    "digitalID": {
      "transactionID": "digital-id-transaction-uuid"
    }
  },
  "data": [
    {
      "serviceID": 1,
      "query": {
        "personalID": "13 digits"
      }
    }
  ]
}
```

ตัวอย่างใช้ `serviceID: 1` ตาม Public Service Directory แต่ต้องตรวจว่ากระบวนงานของสำนักงาน ป.ป.ท. มีสิทธิบริการนี้ก่อนส่งคำขอจริง

ห้ามส่ง Consent ปลอมหรือสร้าง `transactionID` เอง ต้องได้รับจากขั้นตอน Digital ID/Consent ที่ได้รับอนุมัติจริง หากฐานกฎหมายหรือรูปแบบ Consent ของงานสืบสวนแตกต่างจากตัวอย่าง Sandbox ให้เจ้าของระบบยืนยันก่อนพัฒนา

## Response ข้อมูล

ผลสำเร็จระดับ Request HTTP 200 อาจมีผลต่างกันราย Service:

```json
{
  "data": [
    {
      "serviceID": 1,
      "responseStatus": 200,
      "responseContentType": "application/json; charset=utf-8",
      "responseData": {},
      "responseError": null,
      "responseTimeMs": 500
    }
  ],
  "executeTimeMs": 500
}
```

Implementation ต้อง:

- ตรวจ HTTP Status ระดับ Request
- ตรวจ `data` ว่าเป็น Array
- ตรวจ `responseStatus` แยกราย Service
- Parse `responseData` ตาม Data Dictionary ของ Service นั้นเท่านั้น
- รองรับ `responseData` ที่เป็น Object, Array หรือ `null` ตาม Contract จริง
- ไม่ถือว่า HTTP 200 หมายถึงทุก Service สำเร็จ
- แสดงข้อมูลที่สำเร็จได้เมื่อบาง Service ล้มเหลว พร้อมเตือนผู้ใช้ว่าข้อมูลไม่ครบ
- เก็บ Technical Error ที่จำเป็นโดยไม่เก็บ Raw PII Response

## Error Mapping

รองรับอย่างน้อย:

| สถานการณ์ | HTTP/ค่า | การทำงานของระบบ |
|---|---|---|
| ไม่มี Bearer Token หรือ Header ผิดรูปแบบ | 401 / `Header Authorization only support type "Bearer Token"` | ไม่ Retry, แจ้ง Session Error |
| Token หมดอายุหรือ Revoke | 401 / `token is expired` | Renew 1 ครั้ง แล้ว Login ใหม่หากยังไม่สำเร็จ |
| jobID ผิดหรือไม่มีสิทธิ์ | 403 / `jobID not found or user has no permission` | ไม่ Retry, แจ้งผู้ดูแลสิทธิ |
| ไม่พบผู้ใช้ตอน Login | 404 / `Not Found` | แจ้งให้ Superuser ตรวจผู้ใช้/กลุ่ม/หน่วยงาน |
| Service รายตัวไม่พบข้อมูล | `data[].responseStatus` ตาม Contract | แสดงไม่พบข้อมูลเฉพาะ Service |
| Service รายตัวล้มเหลว | `responseStatus >= 400` | แสดงผลที่สำเร็จและแจ้ง Partial Result |
| Proxy ไม่พร้อม/Network ขาด | Local 502/503/Timeout | Retry แบบจำกัดและแจ้ง Incident ID |
| เกินโควต้า | Status ตาม Swagger จริง | ไม่ Retry จนกว่าจะถึงเวลาที่กำหนด |

ห้าม Retry Error 401/403 แบบวนซ้ำ และห้าม Login ใหม่พร้อมกันหลาย Request ให้ใช้ Single-flight Session Refresh

## Renew และ Logout

- Renew ใช้ Bearer Token เดิมและรับ Token ใหม่ตาม API Document จริง
- เปลี่ยน Token แบบ Atomic เพื่อไม่ให้ Request อื่นใช้ Token เก่าหลัง Refresh
- Logout ต้อง Revoke/ยุติ Session ฝั่ง Linkage และล้าง Token Server-side
- เมื่อผู้ใช้ Logout E-CMIS, Session หมดอายุ, ถูกระงับสิทธิ์ หรือเปลี่ยนหน่วยงาน ให้ยุติ Linkage Session ด้วย

## Internal API ของ E-CMIS

ตัวอย่าง Contract ภายใน ปรับชื่อให้ตรงกับ Codebase:

```http
POST /api/integrations/dopa/person-search
Content-Type: application/json
```

```json
{
  "personalId": "1234567890123",
  "caseNo": "internal-case-reference",
  "purposeCode": "INVESTIGATION",
  "purposeText": "ประกอบการสืบสวนข้อเท็จจริง"
}
```

Response ภายในควร Normalize:

```json
{
  "requestId": "internal-correlation-id",
  "partial": false,
  "process": {
    "status": 200,
    "executeTimeMs": 900
  },
  "services": [
    {
      "serviceKey": "configured-service-key",
      "serviceId": "configured-service-id",
      "status": 200,
      "contentType": "application/json",
      "responseTimeMs": 320,
      "errorCode": null
    }
  ],
  "person": {},
  "nameHistory": [],
  "deathCertificate": null,
  "faceImage": null
}
```

ห้ามนำ DTO ตัวอย่างนี้ไปใช้เป็น Data Contract ของ DOPA จนกว่าจะ Mapping กับ Data Dictionary จริงครบทุกฟิลด์

## Configuration

ใช้ Environment/Secret Configuration เช่น:

```text
DOPA_LINKAGE_ENABLED
DOPA_LINKAGE_PROXY_BASE_URL
DOPA_LINKAGE_API_DOC_URL
DOPA_LINKAGE_SANDBOX
DOPA_LINKAGE_LOGIN_TYPE
DOPA_LINKAGE_OFFICE_ID
DOPA_LINKAGE_PROCESS_ID
DOPA_LINKAGE_SERVICE_PERSON_ID
DOPA_LINKAGE_SERVICE_FACE_ID
DOPA_LINKAGE_SERVICE_NAME_HISTORY_ID
DOPA_LINKAGE_SERVICE_DEATH_ID
DOPA_LINKAGE_CONNECT_TIMEOUT_MS
DOPA_LINKAGE_READ_TIMEOUT_MS
```

ห้าม Commit Domain ภายใน, Token, Digital ID Access Token, Personal ID ของผู้ใช้จริง, Smart Card Data, Authorize Key หรือ Credential ลง Git

## Authorization และ Audit

ก่อนค้นทุกครั้ง Backend ต้องตรวจ:

1. ผู้ใช้ E-CMIS Login อยู่
2. Role มีสิทธิ์ใช้ข้อมูล DOPA
3. ผู้ใช้ได้รับมอบหมายในสำนวนคดี
4. มี `caseNo` และวัตถุประสงค์ที่อนุญาต
5. Linkage User อยู่ในกลุ่มและกระบวนงานที่ยังอยู่ในช่วงเวลาใช้งาน
6. โควต้ายังไม่หมด

Audit Log ภายในควรมี:

```text
auditId, timestamp, userId, linkageOfficeId,
caseNo, purposeCode, processId,
serviceIds, maskedPersonalId,
httpStatus, perServiceStatus,
partialResult, durationMs, correlationId
```

ห้าม Log:

- Bearer Token หรือ Digital ID Access Token
- `random`, `envelope`, Smart Card Chip Data
- เลขประจำตัวประชาชนเต็ม
- ภาพใบหน้า Base64/Binary
- Raw Request/Response ที่มีข้อมูลส่วนบุคคล

## การเก็บข้อมูลและ PDPA

- ขอเจ้าของข้อมูลยืนยันว่าผลค้นหาแสดงชั่วคราวหรือบันทึกเข้าสำนวนได้
- หากบันทึก ต้องแยก Snapshot, แหล่งข้อมูล, วันเวลาค้นหา และผู้ค้นหา
- เข้ารหัสข้อมูลและภาพทั้งขณะส่งและขณะเก็บ
- จำกัด Export/Copy ตามบทบาท
- ไม่ Cache ข้อมูลบุคคลข้ามคดีหรือข้ามผู้ใช้
- กำหนด Retention และกระบวนการลบตามกฎหมาย/ระเบียบที่ได้รับอนุมัติ

## Mock Adapter และ Real Adapter

สร้าง Interface เดียวและมี Adapter อย่างน้อย:

```text
DopaLinkageClient
  - MockDopaLinkageClient
  - RealDopaLinkageClient
```

- Local/Automated Test ใช้ Mock
- UAT ใช้ Sandbox ผ่าน Proxy จริง
- Production ใช้ Real Adapter เท่านั้น
- Production Build ต้องไม่แสดง Demo Scenario และต้อง Fail Startup หาก Configuration สำคัญหาย

## Test Cases

### Validation

- เลขประชาชนว่าง/ไม่ครบ/มีอักขระ
- caseNo ว่าง
- purpose ว่าง
- ผู้ใช้ไม่มีสิทธิ์ในคดี

### Authentication

- Login Smart Card/Digital ID สำเร็จ
- ไม่พบผู้ใช้ 404
- Confirm Login สำเร็จ 201
- Confirm Login Input ผิด 404
- Token หมดอายุแล้ว Renew สำเร็จ
- Renew ไม่สำเร็จแล้ว Login ใหม่
- Logout และล้าง Token สำเร็จ

### Process/Permission

- พบ process ที่กำหนด
- ไม่พบ process
- jobID ไม่มีสิทธิ์ 403
- Service ไม่อยู่ใน process
- กระบวนงานหมดช่วงเวลา
- โควต้าเต็ม

### Data Request

- ทุก Service สำเร็จ
- บาง Service สำเร็จ บาง Service ล้มเหลว
- ไม่พบข้อมูลบุคคล
- `responseData` เป็น null
- responseContentType ไม่ตรง
- response schema เปลี่ยน
- response ช้า/timeout
- Proxy/Network ใช้งานไม่ได้

### Security

- Browser ไม่เห็น Token
- Log ไม่มี Token/เลขประชาชนเต็ม/ภาพ
- ผู้ใช้ข้ามคดีไม่ได้
- Replay Request/Consent ไม่ได้
- SSRF Protection อนุญาตเฉพาะ Proxy Base URL ที่กำหนด
- XML/JSON Parser และ HTTP Client จำกัดขนาด Response

### UI

- Desktop/Mobile ไม่ล้นทั้งหน้า
- ตารางบริการเลื่อนภายในบนจอเล็ก
- Error State ค้างอยู่และอ่านได้ ไม่พึ่ง Popup อย่างเดียว
- Partial Result แสดงคำเตือนชัด
- Audit ใช้เลขประชาชน Masked

## Acceptance Criteria

1. Application เรียก Linkage ผ่าน Proxy ของหน่วยงานเท่านั้น
2. ได้ Base URL/Swagger จริงและไม่ใช้ Placeholder
3. User/Group/Process/Service/ช่วงเวลา/โควต้าถูกตั้งค่าครบ
4. Mapping Input/Output ผ่าน Data Dictionary ที่เจ้าของ API ยืนยัน
5. Token และ Consent Data อยู่ Server-side
6. Success, Partial, Not Found, 401, 403, Timeout และ Quota Error ผ่าน UAT
7. Audit ครบและไม่มีข้อมูลต้องห้าม
8. มี Health Check, Monitoring, Alert และ Troubleshooting Runbook
9. มีผล UAT ร่วมกับสำนักงาน ป.ป.ท. และผู้ดูแล Linkage
10. Production ปิด Mock/Demo Scenario

## Open Questions สำหรับประชุมลูกค้า

1. เครื่อง Linkage Proxy Server ของสำนักงาน ป.ป.ท. จัดเตรียมแล้วหรือยัง
2. เครื่องเป็น Linux, ติดตั้ง Docker และเชื่อม Network ถึง Linkage Center แล้วหรือยัง
3. Proxy อยู่สถานะรอติดตั้ง, ติดตั้งแล้ว หรือ ลงทะเบียนแล้ว
4. Domain/IP และ Port ของ Proxy ที่ E-CMIS ต้องเรียกคืออะไร
5. URL API Document/Swagger จริงบน Proxy คืออะไร
6. E-CMIS Server ใดได้รับอนุญาตให้เรียก Proxy ต้อง Whitelist IP หรือ Certificate หรือไม่
7. ผู้ใช้งานที่จะทดสอบถูกเพิ่มเป็น User/Developer แล้วหรือยัง
8. ผู้ใช้ถูกเพิ่มในกลุ่มใด และโควต้าจริงเท่าใด
9. ชื่อกระบวนงานและ `jobID` ที่ใช้กับกิจกรรมสืบสวนคืออะไร
10. กระบวนงานเปิดใช้ช่วงวันเวลาใด
11. กระบวนงานของสำนักงาน ป.ป.ท. ได้รับสิทธิ serviceID 1, 10, 21, 9, 144, 27, 32, 41 และ 51 ตัวใดบ้าง
12. Input/Output ใน Swagger บน Proxy ตรงกับ Public Data Dictionary หรือมี Version/ข้อจำกัดเพิ่มเติมหรือไม่ และขอ Sandbox Test Data ของทุก Service ที่ได้รับสิทธิ
13. อนุญาตให้ค้นด้วยชื่อปัจจุบันและชื่อเดิมหรือไม่ และการเลื่อน `recordNumber` นับโควต้าทุกครั้งหรือไม่
14. ใช้ Smart Card หรือ Digital ID เป็น Login Flow ของระบบ E-CMIS
15. Consent `type` และ `digitalID.transactionID` สำหรับงานสืบสวนต้องได้มาจากขั้นตอนใด
16. Token อายุเท่าใด Renew ได้ก่อนหมดอายุกี่นาที และ Renew ซ้ำได้หรือไม่
17. Error/Rate Limit/Timeout/SLA จริงเป็นอย่างไร
18. อนุญาตให้บันทึกข้อมูลหรือภาพเข้าสำนวน หรือแสดงชั่วคราวเท่านั้น
19. ข้อห้ามในการ Log, Cache, Export และ Retention เป็นอย่างไร
20. เกณฑ์ UAT และผู้มีอำนาจยืนยันผลทดสอบคือใคร

## Deliverables

1. Frontend ตาม Mockup ที่ยืนยันแล้ว
2. Backend DOPA Integration Module
3. Linkage Session Manager
4. Mock และ Real Adapter
5. Configuration/Secret Template
6. Data Mapping Document ราย Service
7. Unit, Integration, Contract, Security และ Browser E2E Tests
8. Deployment/Proxy/Whitelist Checklist
9. Monitoring, Alert และ Troubleshooting Runbook
10. UAT Script และหลักฐานผลทดสอบ
