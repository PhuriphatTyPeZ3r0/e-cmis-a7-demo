# ecmis-web

Web Application สำหรับโครงการ E-CMIS — SS CONSORTIUM / สำนักงาน ปปท.

.NET Blazor WebAssembly — ใช้สำหรับเจ้าหน้าที่ ปปท. ผ่าน Browser

## โครงสร้าง

```
ecmis-web/
├── src/
│   ├── Pages/          # Razor Pages แยกตาม Module
│   │   ├── Complaint/
│   │   ├── Investigation/
│   │   ├── WitnessProtect/
│   │   ├── Committee/
│   │   ├── PersonCheck/
│   │   ├── ArrestWarrant/
│   │   ├── LegalCase/
│   │   ├── Analytics/
│   │   ├── Admin/
│   │   └── Public/
│   ├── Components/     # Shared UI
│   ├── Services/       # HTTP Clients เรียก Backend
│   ├── Models/         # DTOs
│   ├── wwwroot/        # Static files
│   └── Program.cs
├── tests/
│   ├── unit/
│   └── e2e/
└── Dockerfile
```

## Getting Started

```bash
dotnet restore
dotnet run
```

## Backend API Configuration

ตั้งค่า URL ของ `ecmis-admin` ที่ไฟล์ `src/wwwroot/appsettings.json`:

```json
{
  "ApiBaseUrl": {
    "EcmisAdmin": "http://localhost:5001/"
  }
}
```
