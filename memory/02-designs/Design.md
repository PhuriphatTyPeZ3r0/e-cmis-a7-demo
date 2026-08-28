# E-CMIS Design System & UI Documentation

เอกสารนี้รวบรวม **Design System** ของโครงการ E-CMIS (Electronic Case Management Intelligence System) สำหรับใช้เป็นแหล่งอ้างอิงร่วมกันระหว่าง **Developer** และ **Designer** ภายในทีม โดยถอดรหัสจาก Design จริงในไฟล์ `ecmis.css` และหน้า Wireframe ต้นแบบ

---

## 1. Overview & Brand Personality
E-CMIS คือแพลตฟอร์มหลักของ **สำนักงาน ป.ป.ท.** สำหรับจัดการเรื่องร้องเรียนและคดีทุจริตในภาครัฐ 

**Brand Personality:**
- Authoritative, precise, trustworthy (เป็นทางการ น่าเชื่อถือ แม่นยำ)
- โทนสีและหน้าตาของระบบต้องสื่อถึงความเป็น "ทางการของรัฐ" แต่ดูทันสมัย (Institutional weight without bureaucratic rot)

## 2. Design Principles
1. **Institutional weight without bureaucratic rot:** เป็นทางการแต่น่าใช้ ไม่ล้าสมัย
2. **Density earns trust:** ข้อมูลแน่นและครบถ้วนเป็นสิ่งจำเป็น เพราะเจ้าหน้าที่ต้องดูเคสที่ซับซ้อน (ไม่ต้องกลัวข้อมูลเยอะ)
3. **Every state is visible:** ทุกสถานะคดีและ Deadline ต้องมองเห็นได้ชัดเจน
4. **Thai language first:** UI และ Layout ต้องรองรับการแสดงผลภาษาไทยเป็นหลัก
5. **Predictable over surprising:** เน้นความสม่ำเสมอ (Consistency) เพื่อลดภาระการเรียนรู้ของเจ้าหน้าที่

## 3. Design Tokens

### 3.1 Color Palette
ค่าสีหลักที่ใช้ในโปรเจกต์ (CSS Variables ที่กำหนดไว้ใน `:root`)

| Name | Variable | Hex / RGB | Usage / Notes |
|:---|:---|:---|:---|
| **Navy Deep** | `--navy-deep` | `#0D1B3E` | พื้นหลัง Sidebar, หัวข้อหลัก (Text Dark) |
| **Navy** | `--navy` | `#1A2F6B` | สีหลักของ Brand |
| **Navy Mid** | `--navy-mid` | `#2A4A8F` | สีรองลงมา สำหรับ UI State |
| **Blue Light** | `--blue-light` | `#3B6CC7` | แอคชัน / ลิงก์ / Hover |
| **Gold** | `--gold` | `#C9A84C` | สีเน้น, ปุ่มสำคัญ, เหรียญตรา |
| **Gold Light** | `--gold-light` | `#E8C96A` | Hover / Background อ่อนของสีทอง |
| **Silver** | `--silver` | `#B8C4D8` | เส้นขอบ, Text สำรอง |
| **Off White** | `--off-white` | `#F0F4FA` | พื้นหลังของเว็บ (Background) |
| **Card BG** | `--card-bg` | `#FFFFFF` | พื้นหลัง Card |
| **Text Dark** | `--text-dark` | `#0D1B3E` | ข้อความหลัก |
| **Text Muted**| `--text-muted`| `#6B7A99` | ข้อความรอง, รายละเอียดเล็กๆ |

**Status Colors:**
- `--green`: `#1B7A4A` (Success / Completed)
- `--orange`: `#D4630A` (Warning / In Progress)
- `--teal`: `#0E7C7B` (Info)
- `--red`: `#C0392B` (Error / Urgent)

### 3.2 Typography
- **Font Family:** `Sarabun`, sans-serif (Google Fonts)
- รองรับน้ำหนัก (Weights): 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)

### 3.3 Layout Variables
- `--sidebar-w`: `260px` (กว้างตอนกางออก)
- `--sidebar-mini-w`: `68px` (กว้างตอนหดเข้า)
- `--header-h`: `64px` (ความสูง Topbar)

---

## 4. UI Components (HTML Snippets)

เพื่อความสม่ำเสมอในการเขียนโค้ด (Blazor/HTML) โปรดใช้โครงสร้าง Class ตามตัวอย่างด้านล่างนี้

### 4.1 Layout & Navigation

#### Sidebar (เมนูด้านข้าง)
```html
<aside class="sidebar"> <!-- เติม class 'collapsed' เมื่อต้องการย่อเมนู -->
  <div class="sidebar-header">
    <div class="brand">
      <img src="img/logo.png" alt="PACC" />
      <span class="brand-text">E-CMIS</span>
    </div>
  </div>
  <div class="nav-group-items">
    <a href="/cases" class="nav-link-custom active">
      <i class="fa fa-folder-open"></i>
      <span>จัดการคดี</span>
    </a>
  </div>
</aside>
```

#### Topbar (แถบด้านบน)
```html
<header class="header">
  <div class="header-left">
    <button class="hamburger-toggle">
      <i class="fa fa-bars"></i>
    </button>
    <div class="page-title">รายการคดีทั้งหมด</div>
  </div>
  <div class="header-right">
    <!-- User Dropdown / Notification -->
  </div>
</header>
```

---

### 4.2 Data Display

#### Cards (กล่องข้อมูล)
กล่องมาตรฐานสำหรับแสดงเนื้อหา มี Header และ Body ชัดเจน
```html
<div class="ecmis-card">
  <div class="ecmis-card-header">
    <div class="ecmis-card-title">
      <span class="badge-dot"></span> ข้อมูลรายละเอียด
    </div>
    <div class="ecmis-card-actions">
      <!-- ใส่ปุ่มมุมขวาบนของ Card -->
    </div>
  </div>
  <div class="ecmis-card-body">
    <!-- เนื้อหาด้านใน -->
    <p>รายละเอียด...</p>
  </div>
</div>
```

#### Table (ตารางข้อมูล)
ตารางสำหรับแสดงรายการข้อมูล كثيفة (High Density)
```html
<div style="overflow-x:auto;">
  <table class="ecmis-table">
    <thead>
      <tr>
        <th>รหัสคดี</th>
        <th>เรื่องร้องเรียน</th>
        <th>สถานะ</th>
        <th>จัดการ</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>PACC-67-001</strong></td>
        <td>ทุจริตจัดซื้อจัดจ้าง...</td>
        <td><span class="status-badge orange">อยู่ระหว่างตรวจสอบ</span></td>
        <td>
          <button class="btn-outline-navy btn-sm">ดูรายละเอียด</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 4.3 Actions & Feedback

#### Buttons (ปุ่มกด)
ใช้ปุ่มที่มีการไล่สี (Gradient) และมี hover shadow เพื่อความมีมิติ
```html
<!-- Primary Button (Navy) -->
<button class="btn-navy">บันทึกข้อมูล</button>

<!-- Highlight Button (Gold) -->
<button class="btn-gold">ส่งเรื่องต่อ <i class="fa fa-arrow-right"></i></button>

<!-- Outline Button -->
<button class="btn-outline-navy">ยกเลิก</button>

<!-- Small Button (เพิ่ม padding เล็กน้อย) -->
<button class="btn-navy" style="padding: 5px 12px; font-size: 12px;">ดู</button>
```

#### Status Badges (ป้ายสถานะ)
```html
<!-- สีเขียว (เสร็จสิ้น) -->
<span class="status-badge green">เสร็จสิ้น</span>

<!-- สีส้ม (กำลังดำเนินการ) -->
<span class="status-badge orange">กำลังตรวจสอบ</span>

<!-- สีแดง (ด่วน/เตือน) -->
<span class="status-badge red">เกินกำหนด 3 วัน</span>

<!-- สีเทา/ข้อมูล -->
<span class="status-badge teal">รอเอกสาร</span>
```

---

*หมายเหตุ: โปรเจกต์นี้เขียน CSS ขึ้นมาใหม่ทั้งหมดแบบ Custom (ไม่พึ่งพา Framework ใหญ่เช่น Bootstrap/Tailwind โดยตรงในการแสดงผลหลัก) หากต้องการดูโครงสร้าง Component อื่นๆ ที่ซับซ้อน เช่น Modal, Timeline หรือ Chart ให้ดูตัวอย่างจริงจากไฟล์ `ux-wireframe.html` และอ้างอิง Class จาก `css/ecmis.css`*
