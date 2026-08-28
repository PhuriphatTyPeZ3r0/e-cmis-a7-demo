# Prompt สำหรับพัฒนาระบบเชื่อมโยงข้อมูลสำนักงานประกันสังคม

คัดลอกข้อความตั้งแต่หัวข้อ "บทบาท" เป็นต้นไปให้ทีม Dev หรือ Coding Agent ใช้งาน โดยแนบเอกสาร API Specification และ Mockup ใน Repository นี้ไปพร้อมกัน

---

## บทบาท

คุณเป็น Senior Full-stack Developer และ Integration Engineer ของระบบ E-CMIS สำนักงาน ป.ป.ท. ให้พัฒนาฟังก์ชันเชื่อมโยงข้อมูลสำนักงานประกันสังคมสำหรับงานสืบสวนและประกอบสำนวนคดี โดยยึดหลัก Security by Design, Least Privilege, PDPA, Auditability และไม่ทำให้ระบบต้นทางได้รับภาระเกินจำเป็น

ห้ามสมมติ API Contract เพิ่มเอง หากข้อมูลใดไม่ปรากฏใน Specification ให้ทำเป็น Configuration หรือระบุเป็น Open Question เพื่อขอคำยืนยันก่อน Production

## แหล่งอ้างอิงหลัก

1. Mockup: `index.html` ใน Repository `E-CMIS-muck-api`
2. API Specification: `SSO Core ApplicationProgramingInterface _V๓.๐_๖๗๑๑๑๗ - Version5 - 31032569(ปปท.).pdf`
3. ใช้ Contract ของ 3 Services ต่อไปนี้เท่านั้น
   - `SelectHospital`
   - `EmployerDetail`
   - `EmployeeEmployment`

Mockup เป็นข้อมูลสมมติและเป็นข้อเสนอ UX ไม่ใช่หลักฐานว่า API จริงเชื่อมต่อสำเร็จ

## เป้าหมาย

พัฒนาหน้าจอแยก 3 หน้า และ Backend Integration Adapter สำหรับเรียก SOAP Web Service ของสำนักงานประกันสังคม โดยผู้ใช้ต้องระบุเลขที่สำนวนและวัตถุประสงค์ก่อนค้นหาทุกครั้ง ผลการค้นหาต้องแสดงอย่างเป็นโครงสร้าง อ่านง่าย ตรวจสอบย้อนหลังได้ และไม่เปิดเผย Credential หรือ Raw XML ต่อผู้ใช้

## ขอบเขตหน้าจอ

### หน้า 1: ผู้ประกันตนและสถานพยาบาล

- ชื่อเมนู: `ผู้ประกันตนและสถานพยาบาล`
- Service: `SelectHospital`
- Method/Path: `POST /services/SelectHospital`
- ช่องรับข้อมูลจากผู้ใช้:
  - `ssoNum`: เลขประจำตัวประชาชน ตัวเลข 13 หลัก บังคับกรอก
  - `caseNo`: เลขที่สำนวนคดี บังคับกรอก แต่เป็นข้อมูลภายใน E-CMIS ไม่ส่งให้ SSO
  - `purposeCode` และ `purposeText`: วัตถุประสงค์การค้นหา บังคับกรอก แต่เป็นข้อมูลภายใน E-CMIS
- `username` และ `password` ต้องอ่านจาก Secret Store ฝั่ง Server ห้ามรับจาก Browser
- แสดงผลเป็น 3 กลุ่ม:
  - ข้อมูลผู้ประกันตน
  - สถานะผู้ประกันตน
  - สถานพยาบาลและสิทธิรักษาพยาบาล
- แสดง Response summary ให้ครบทั้ง `status`, `message`, `lastIncremental` และสถานะของ `result`
- แสดงชื่อฟิลด์ทางเทคนิคกำกับค่าบน Mockup เพื่อให้ตรวจเทียบกับ Specification ได้ แต่ Production สามารถซ่อนชื่อฟิลด์ทางเทคนิคได้ตามบทบาทผู้ใช้
- แสดง `lastIncremental` เป็นวันที่ข้อมูลต้นทางปรับปรุงล่าสุด
- กรณีไม่สำเร็จต้องมี Error state ค้างอยู่ในพื้นที่ผลลัพธ์ ไม่ใช่แสดงเฉพาะ Popup โดยต้องแสดง `status=false`, `message`, `lastIncremental=null` และ `result=null`
- รองรับข้อความจากระบบต้นทางอย่างน้อย `Invalid username/password.`, `Insufficient rights for service`, `Invalid request parameter : ssoNum[13]` และ `Data not found for SSO_NUM`

ฟิลด์ Response ที่ต้องรองรับ:

```text
status, message, lastIncremental
result.empResignDate
result.hospitalCode
result.hospitalName
result.medYY
result.mselExpireDate
result.mselLastChange
result.mselStartDate
result.mselStatus
result.mselStatusDesc
result.ssoBranchCode / result.ssoBranceCode
result.ssoBranchName / result.ssoBranceName
result.person.activeStatus
result.person.activeStatusDesc
result.person.empBirthDate
result.person.expirationDate
result.person.firstName
result.person.lastName
result.person.gender
result.person.genderDesc
result.person.idType
result.person.idDesc
result.person.ssoNum
result.person.titleCode
result.person.titleCodeDesc
```

Specification มีการสะกด `ssoBrance...` ในตาราง แต่ XML ตัวอย่างใช้ `ssoBranch...` ให้ Parser รองรับ Alias ทั้งสองแบบและบันทึกประเด็นให้เจ้าของ API ยืนยัน

### หน้า 2: ข้อมูลสถานประกอบการ

- ชื่อเมนู: `ข้อมูลสถานประกอบการ`
- Service: `EmployerDetail`
- Method/Path: `POST /services/EmployerDetail`
- ช่องรับข้อมูล:
  - `accNo`: เลขบัญชีนายจ้าง ตัวเลข 10 หลัก บังคับกรอก
  - `accBran`: รหัสสาขา ตัวเลข 6 หลัก บังคับกรอก
  - `caseNo`, `purposeCode`, `purposeText`: บังคับกรอกสำหรับ Audit ภายใน
- แสดงผลเป็น 4 กลุ่ม:
  - Summary จำนวนลูกจ้างและสถานะกิจการ
  - ข้อมูลทะเบียนและกิจการ
  - ที่ตั้งและข้อมูลติดต่อ
  - สำนักงานประกันสังคมที่รับผิดชอบและรับชำระเงิน
- แสดง Response summary ให้ครบทั้ง `status`, `message`, `lastIncremental` และสถานะของ `result`
- กรณีไม่สำเร็จต้องมี Error state ค้างในพื้นที่ผลลัพธ์ พร้อม `status=false`, `message`, `lastIncremental=null` และ `result=null`
- รองรับข้อความจากระบบต้นทางอย่างน้อย `Invalid username/password.`, `Insufficient rights for service`, `Invalid request parameter : accNo[10]`, `Invalid request parameter : accBran[6]` และ `Data not found for ACC_NO, ACC_BRAN`

ฟิลด์ Response ที่ต้องรองรับ:

```text
status, message, lastIncremental
result.accBranch
result.accNo
result.branchEmplyeeNo
result.companyAddress
result.companyName
result.companyRigNo
result.companyStatus
result.companyStatusDesc
result.companyTel
result.companyType
result.companyTypeDesc
result.companyZip
result.contactAddress
result.contactFax
result.contactTel
result.contactZip
result.fdappl
result.lddate
result.newOperateDate
result.paySsoBranchCode
result.paySsoBranchName
result.ssoBranchCode
result.ssoBranchName
result.totalEmployeeNo
```

รักษาชื่อ Wire Field `branchEmplyeeNo` ตามระบบต้นทางแม้สะกดผิด แต่ Mapping เข้า Internal DTO ชื่อ `branchEmployeeCount`

เอกสารบรรยายว่า EmployerDetail แสดง “จำนวนเงินสมทบที่ส่ง สปส.” แต่ Contract `Rgw008` และ Response XML ตัวอย่างไม่มีฟิลด์จำนวนเงินสมทบ ห้ามคำนวณหรือสมมติค่านี้เอง ให้บันทึกเป็น Open Question และขอเจ้าของ API ยืนยันว่าต้องใช้ Service อื่นหรือมี Specification ฉบับเพิ่มเติม

### หน้า 3: ประวัติการจ้างและเงินสมทบ

- ชื่อเมนู: `ประวัติการจ้างและเงินสมทบ`
- Service: `EmployeeEmployment`
- Method/Path: `POST /services/EmployeeEmployment`
- ช่องรับข้อมูล:
  - `ssoNum`: เลขประจำตัวประชาชน ตัวเลข 13 หลัก บังคับกรอก
  - `resignDate`: วันที่ลาออก รูปแบบที่ส่งต้นทางต้องเป็น `ddMMyyyy`
  - `caseNo`, `purposeCode`, `purposeText`: บังคับกรอกสำหรับ Audit ภายใน
- Frontend ใช้ Date Picker และให้ Backend แปลงปี ค.ศ. เป็นปี พ.ศ. ก่อนเรียก SSO เช่น `2024-03-03` เป็น `03032567`
- ต้องขอเจ้าของ API ยืนยันว่า `resignDate` บังคับกรอกจริงหรือเว้นว่างเพื่อดึงประวัติทั้งหมดได้
- ผลลัพธ์แบ่ง 3 Tabs:
  - ข้อมูลผู้ประกันตน
  - ประวัติการจ้างงานจาก `detail1`
  - ประวัติเงินสมทบจาก `detail2`
- แสดง Response summary ให้ครบทั้ง `status`, `message`, `lastIncremental` และสถานะของ `result`
- แสดง `resignDate` รูปแบบ `ddMMyyyy` ที่ Backend ส่งไปยังระบบต้นทาง เพื่อให้ผู้ทดสอบตรวจสอบ Request Mapping ได้
- กรณีไม่สำเร็จต้องมี Error state ค้างในพื้นที่ผลลัพธ์ พร้อม `status=false`, `message`, `lastIncremental=null` และ `result=null`
- รองรับข้อความจากระบบต้นทางอย่างน้อย `Invalid username/password.`, `Insufficient rights for service`, `Invalid request parameter : ssoNum[13]`, `Invalid request parameter : resignDate(ddMMyyyy)` และ `Data not found for SSO_NUM`
- จำนวนประวัติการจ้าง จำนวนงวด และยอดค่าจ้างรวมเป็น Derived Values ที่ E-CMIS คำนวณ ต้องติดป้ายให้ชัดว่าไม่ใช่ฟิลด์จาก SSO

ฟิลด์ `detail1`:

```text
accBran, accNo, companyName, empResignDate,
employStatus, employStatusDesc, expStartDate
```

ฟิลด์ `detail2`:

```text
accBran, accNo, companyName,
cchdPayDate, cchdPayPeriod,
cempCntrAmount, cempCntrOldage,
cempCntrSick, cempCntrUnem, cempTotalWages
```

ต้องรองรับ SOAP Array ที่มี 0, 1 หรือหลาย `<i>` โดย Normalize เป็น Array เสมอ ห้ามให้กรณีมีรายการเดียวกลายเป็น Object แล้วทำให้ Frontend พัง

ตัวอย่าง XML ที่คัดลอกจากเอกสารอาจมีแท็ก `<i>` ของ `detail2` ปะปนหลังรายการ `detail1` เนื่องจากการตัดหน้า/คัดลอก ห้ามใช้ลำดับข้อความที่คัดลอกเป็น Contract ให้ Parser แยกข้อมูลจาก container `<detail1>` และ `<detail2>` ของ XML จริง และเพิ่ม Contract Test จาก Response จริงใน UAT

## Backend Architecture

สร้าง Integration Layer แยกจาก Controller และ Business Module ตามโครงสร้างนี้ หรือปรับชื่อให้ตรงกับมาตรฐานใน Codebase:

```text
UI / E-CMIS Module
        |
E-CMIS REST Controller
        |
Application Service + Authorization + Audit
        |
SSO Integration Adapter
        |
SOAP Client / XML Parser
        |
SSO UAT or Production Endpoint
```

ข้อกำหนด:

1. Browser เรียกเฉพาะ API ภายในของ E-CMIS ห้ามเรียก SSO โดยตรง
2. เก็บ Base URL, Timeout, Username และ Password เป็น Environment/Secret Configuration
3. ห้าม Commit Credential ลง Git และห้ามส่ง Credential กลับ Frontend
4. ใช้ Structured XML Parser ที่ป้องกัน XXE ห้าม Parse XML ด้วย Regex
5. SOAP Namespace อาจเปลี่ยน Prefix ได้ ห้ามผูก Logic กับ Prefix เช่น `n1` หรือ `xsd` ให้ผูกกับ Local Name/Namespace URI
6. กำหนด Connect Timeout และ Read Timeout แยกกัน
7. Retry เฉพาะ Network Error/Timeout ที่ปลอดภัยและมีจำนวนครั้งจำกัด ห้าม Retry กรณี Authentication, Permission, Invalid Parameter หรือ Data Not Found
8. ใส่ Correlation ID ทุก Request และส่งต่อเข้า Log โดยไม่ใส่ข้อมูลส่วนบุคคลเต็ม
9. หาก SSO ตอบ HTTP 200 แต่ `status=false` ต้องถือเป็น Business/API Failure และอ่านสาเหตุจาก `message`
10. หาก SOAP Fault ต้อง Map เป็น Standard Error ของ E-CMIS

ตัวอย่าง Internal Endpoints:

```http
POST /api/integrations/sso/select-hospital
POST /api/integrations/sso/employer-detail
POST /api/integrations/sso/employee-employment
```

ตัวอย่าง Request ภายใน E-CMIS:

```json
{
  "caseNo": "ปปท.บ.12/2569",
  "purposeCode": "CASE_INVESTIGATION",
  "purposeText": "ประกอบการสืบสวนข้อเท็จจริง",
  "citizenId": "1101700999991"
}
```

Controller ต้องดึง `userId`, `displayName`, `role`, `organizationUnit` จาก Session/Identity Provider ห้ามรับจาก Request Body

## Response DTO ภายใน

ห้ามส่ง SOAP XML ตรงให้ Frontend ให้แปลงเป็น DTO ที่มีรูปแบบสม่ำเสมอ:

```json
{
  "success": true,
  "correlationId": "uuid",
  "source": "SSO",
  "service": "SelectHospital",
  "sourceLastUpdatedAt": "31/03/2569",
  "data": {},
  "error": null
}
```

กรณีผิดพลาด:

```json
{
  "success": false,
  "correlationId": "uuid",
  "source": "SSO",
  "service": "SelectHospital",
  "data": null,
  "error": {
    "code": "SSO_DATA_NOT_FOUND",
    "message": "ไม่พบข้อมูลตามเงื่อนไขที่ระบุ",
    "retryable": false
  }
}
```

## Error Mapping

Map ข้อความต้นทางเป็นรหัสภายใน โดยไม่เปิด Raw Error ต่อผู้ใช้:

| ข้อความ/เหตุการณ์ต้นทาง | Internal Code | ข้อความผู้ใช้ | Retry |
|---|---|---|---|
| `Invalid username/password.` | `SSO_AUTHENTICATION_FAILED` | ไม่สามารถเชื่อมต่อบริการได้ กรุณาติดต่อผู้ดูแลระบบ | ไม่ Retry |
| `Insufficient rights for service` | `SSO_INSUFFICIENT_RIGHTS` | ระบบยังไม่ได้รับสิทธิ์เรียกใช้บริการนี้ | ไม่ Retry |
| `Invalid request parameter` | `SSO_INVALID_PARAMETER` | ข้อมูลที่ใช้ค้นหาไม่ถูกต้อง | ไม่ Retry |
| `Data not found` | `SSO_DATA_NOT_FOUND` | ไม่พบข้อมูลตามเงื่อนไขที่ระบุ | ไม่ Retry |
| SOAP Fault | `SSO_SOAP_FAULT` | ระบบต้นทางไม่สามารถประมวลผลได้ | ตาม Fault |
| Connect/Read Timeout | `SSO_TIMEOUT` | ระบบประกันสังคมไม่ตอบสนอง กรุณาลองใหม่ภายหลัง | Retry จำกัด |
| TLS/Network/Whitelist | `SSO_NETWORK_ERROR` | ไม่สามารถเชื่อมต่อระบบประกันสังคมได้ | Retry จำกัด |
| XML Parse Error | `SSO_INVALID_RESPONSE` | รูปแบบข้อมูลตอบกลับไม่ถูกต้อง | ไม่ Retryอัตโนมัติ |

เก็บ Raw Error ได้เฉพาะ Secure Technical Log ที่จำกัดสิทธิ์และต้องไม่มี Username, Password หรือข้อมูลบุคคลเกินจำเป็น

## Security และ PDPA

1. ใช้ Role/Permission เฉพาะเจ้าหน้าที่ที่ได้รับมอบหมายในคดี
2. ตรวจ Case Assignment ฝั่ง Server ห้ามเชื่อเพียงการซ่อนปุ่ม Frontend
3. บังคับระบุวัตถุประสงค์ก่อนค้นหา
4. Mask เลขประจำตัวประชาชนใน UI, Audit Log และ Application Log
5. ห้าม Log SOAP Request/Response เต็ม เพราะมี Credential และข้อมูลส่วนบุคคล
6. ห้าม Cache ข้อมูลผู้ประกันตนใน Browser Storage
7. กำหนด Retention ของผลค้นหาและ Audit Log ตามนโยบาย ป.ป.ท.
8. ห้ามมีปุ่ม Export/Download ข้อมูลส่วนบุคคลจนกว่าลูกค้ายืนยันสิทธิ์และวัตถุประสงค์
9. ทุกการเปิดดูรายละเอียดซ้ำจากข้อมูลที่บันทึกไว้ต้องมี View Audit หากนโยบายกำหนด
10. Production ต้องใช้ TLS ที่ตรวจสอบ Certificate จริง ห้ามปิด SSL Verification

## Audit Log

บันทึกอย่างน้อย:

```text
auditId
timestamp
userId
displayName
role
organizationUnit
caseNo
purposeCode
purposeText
serviceName
maskedSearchKey
resultCode
success
durationMs
correlationId
sourceLastUpdatedAt
```

ห้ามบันทึก Password, Raw SOAP XML, ชื่อบุคคลเต็ม, ที่อยู่เต็ม และจำนวนเงินสมทบลง Audit Log

## UX Requirements

1. แยก 3 หน้า ไม่รวมทุก Service ในฟอร์มเดียว
2. ใช้ Layout, Sidebar, Header, Card, Button และ Typography ตาม `index.html`
3. แสดง Empty, Loading, Success, Not Found, No Permission และ System Error ครบ
4. Validation ต้องเกิดทั้ง Client และ Server
5. ช่องเลขต้องรับเฉพาะตัวเลขและแสดงจำนวนหลัก
6. ห้ามแสดง Username/Password ในหน้าจอ
7. ตารางต้อง Responsive และรองรับข้อมูลหลายรายการ
8. แสดง `lastIncremental` ทุกหน้าที่มีผลลัพธ์
9. Derived Values ต้องระบุว่า E-CMIS คำนวณ
10. UI ต้องไม่สรุปว่าบุคคลหรือสถานประกอบการกระทำผิด ข้อมูลใช้ประกอบการตรวจสอบเท่านั้น
11. Dropdown `ผลจำลองสำหรับการนำเสนอ` มีได้เฉพาะ Mock/UAT Demo Build และต้องถูกตัดออกจาก Production Build

## Test Data สำหรับ Mock/UAT

ห้ามใช้ข้อมูลบุคคลตัวอย่างจาก Specification เป็นข้อมูลเดโม ให้เจ้าของ API ส่ง Test Data ที่ได้รับอนุญาตอย่างเป็นทางการ

สำหรับ Static Mockup ใน Repository ใช้ข้อมูลสมมติ:

```text
SelectHospital
  ssoNum: 1101700999991

EmployerDetail
  accNo: 1000000176
  accBran: 000000

EmployeeEmployment
  ssoNum: 1101700999991
  resignDate บนหน้าจอ: 2024-03-03
  resignDate ที่ Backend ส่ง: 03032567
```

ข้อมูลชุดนี้ใช้ทดสอบ UI เท่านั้น ไม่รับรองว่าจะมีอยู่ใน UAT ของสำนักงานประกันสังคม

## Test Cases ขั้นต่ำ

### Validation

- เลขประชาชนว่าง ไม่ครบ 13 หลัก มีตัวอักษร
- เลขบัญชีนายจ้างว่าง ไม่ครบ 10 หลัก
- รหัสสาขาว่าง ไม่ครบ 6 หลัก
- วันที่ลาออกว่างหรือแปลงรูปแบบไม่ได้
- ไม่ระบุเลขที่สำนวน
- ไม่ระบุวัตถุประสงค์
- ผู้ใช้ไม่มีสิทธิ์ในคดี

### Integration

- SOAP Response สำเร็จและมีข้อมูลครบ
- `status=false` พร้อม Data Not Found
- Invalid Credential
- Insufficient Rights
- Invalid Parameter
- SOAP Fault
- HTTP 200 แต่ XML ไม่ครบ
- Timeout และ Network Error
- Array `detail1/detail2` เป็น 0, 1 และหลายรายการ
- XML Element เป็น `xsi:nil="1"`
- Namespace Prefix แตกต่างจาก XML ตัวอย่าง
- ชื่อ Branch Field ใช้ทั้ง `ssoBranch...` และ `ssoBrance...`

### Security

- ตรวจว่า Frontend Network Response ไม่มี SSO Credential
- ตรวจว่า Application Log ไม่มี Password และ Raw XML
- ตรวจว่าเลขประชาชนใน Log ถูก Mask
- เปลี่ยน `caseNo` ใน Request เพื่อเข้าถึงคดีที่ไม่ได้รับมอบหมาย ต้องได้ 403
- เรียก Internal Endpoint โดยไม่มี Session ต้องได้ 401
- ตรวจ Rate Limit และการป้องกันการค้นหาจำนวนมากผิดปกติ

### UI/E2E

- ค้นหาสำเร็จครบทั้ง 3 หน้า
- ไม่พบข้อมูลแล้ว Result เดิมต้องไม่ค้างบนหน้าจอ
- Error แล้วสามารถลองใหม่ได้
- เปลี่ยน Tab ประวัติการจ้าง/เงินสมทบได้
- Desktop, Tablet และ Mobile ไม่มีข้อความล้นหรือองค์ประกอบทับกัน
- Keyboard Navigation และ Focus State ใช้งานได้
- Refresh แล้วไม่เก็บข้อมูลบุคคลไว้ใน Local Storage

## Acceptance Criteria

1. ทั้ง 3 หน้าทำงานตาม Request/Response Contract ที่ระบุ
2. Credential อยู่ Server-side Secret Store เท่านั้น
3. SOAP/XML ถูก Parse ด้วย Library ที่ปลอดภัยและทดสอบ Namespace/Array/nil แล้ว
4. Error Mapping และข้อความผู้ใช้ตรงตามข้อกำหนด
5. มี Authorization ระดับ Role และ Case Assignment ฝั่ง Server
6. Audit Log ครบและไม่มีข้อมูลต้องห้าม
7. ไม่มีข้อมูลบุคคลจริงอยู่ใน Source Code, Seed หรือ Screenshot
8. Unit Test, Integration Test และ Browser E2E ผ่าน
9. Mock Adapter และ Real SSO Adapter สลับด้วย Configuration ได้ โดย Production ห้ามเปิด Demo Scenario
10. มีเอกสาร Environment Variable, Deployment, Whitelist IP, Troubleshooting และ Rollback

## Open Questions ที่ต้องยืนยันก่อน Production

1. Base URL และ WSDL ปัจจุบันของ UAT/Production คืออะไร
2. เอกสารชื่อไฟล์ระบุ Version 3/Version 5 แต่หน้าปกระบุ Version 1.0 ฉบับใดเป็น Contract ล่าสุด
3. Public IP ใดต้องส่งให้สำนักงานประกันสังคม Whitelist
4. Username/Password ใช้ร่วมกันทั้ง 3 Services หรือแยก Service
5. Account ที่ได้รับมีสิทธิ์เรียก Service ใดบ้าง
6. `resignDate` บังคับกรอกหรือเว้นว่างเพื่อค้นประวัติทั้งหมดได้
7. รูปแบบวันที่ทุกฟิลด์เป็น พ.ศ. เสมอหรือไม่ และ Timezone ใด
8. Rate Limit, Timeout, SLA และช่วงเวลาบริการเป็นเท่าใด
9. มี Test Data ที่ได้รับอนุญาตสำหรับ Success/Not Found หรือไม่
10. Response สูงสุดของประวัติการจ้างและเงินสมทบมีกี่รายการ มี Pagination หรือไม่
11. อนุญาตให้บันทึกผลค้นหาไว้ในฐานข้อมูลคดีหรือให้แสดงชั่วคราวเท่านั้น
12. Retention และข้อห้ามในการ Log/Export ข้อมูลเป็นอย่างไร
13. ต้องแสดงหรือเก็บวันที่ปรับปรุงล่าสุด `lastIncremental` อย่างไร
14. ยืนยันการสะกด `ssoBranch`/`ssoBrance` และ `branchEmplyeeNo`
15. เกณฑ์ UAT และผู้มีอำนาจลงนามยืนยันผลทดสอบคือใคร
16. ยืนยันหมายเลขบริการปัจจุบัน/หมายเลขเดิม: SelectHospital เดิม 1, EmployerDetail ปัจจุบัน 7 เดิม 8 และ EmployeeEmployment ปัจจุบัน 13 เดิม 14
17. EmployerDetail ระบุในคำบรรยายว่ามีจำนวนเงินสมทบ แต่ `Rgw008` ไม่มีฟิลด์นี้ ต้องเรียก Service ใดเพิ่มเติม
18. XML จริงใน UAT แยก `<detail1>` และ `<detail2>` ถูกต้องหรือไม่ และกรณีงวด/รายการซ้ำต้องแสดงทุกแถวหรือต้องมีกฎ Deduplicate
19. `resignDate` ที่รับจากผู้ใช้เป็นวันที่ ค.ศ. แล้วให้ Backend บวก 543 ก่อนส่งเสมอหรือไม่ และตัวอย่าง `31012558` หมายถึงวันที่ใดในปฏิทินธุรกิจ

## Deliverables

1. Source Code Frontend และ Backend Adapter
2. Configuration Template โดยไม่มี Secret จริง
3. Mock Server/Fixture สำหรับทั้ง Success และ Error Cases
4. API Mapping Document ระหว่าง SOAP Field กับ Internal DTO
5. Unit, Integration และ E2E Tests
6. Postman/Bruno Collection สำหรับ Internal E-CMIS API โดยไม่ใส่ Credential จริง
7. Deployment และ Whitelist Checklist
8. UAT Script พร้อม Expected Result และหลักฐาน Screenshot/Log ที่ Mask แล้ว
9. Technical Runbook สำหรับ 401/403, Timeout, TLS, Whitelist และ XML Parse Error

ก่อนเริ่มเขียนโค้ด ให้สำรวจ Codebase และใช้ Framework, Authentication, Authorization, Logging, Secret Management และ Test Pattern ที่มีอยู่แล้ว ห้ามสร้างระบบคู่ขนานโดยไม่จำเป็น
