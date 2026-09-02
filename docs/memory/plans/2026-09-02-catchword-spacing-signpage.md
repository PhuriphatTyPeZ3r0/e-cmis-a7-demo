# 2026-09-02 — ปรับคำเชื่อมระหว่างแผ่น: ระยะห่าง footer + ข้ามหน้าลงนามล้วน

## โจทย์ (ต่อจาก 2026-09-02-order-page-catchword.md)
1. footer คำเชื่อมชิดบรรทัดสุดท้ายของเนื้อหาเกินไป — ขอเว้นระยะ ~8mm (≈ 1 บรรทัด)
2. ถ้าหน้าถัดไปเป็นส่วนลงนาม/ลายเซ็นล้วน ไม่ต้องแสดงคำเชื่อมในหน้าก่อนหน้า

## การแก้ (ไฟล์กลาง กระทบ order.html + order-m24.html + /res/ ที่ opt-in pageCatchword)

### 1. `assets/ecmis-app.css` — `.doc-paper .doc-catchword`
`bottom: 8mm` → `bottom: 4mm` (CSS อย่างเดียว, ไม่แตะ pagination/PAGE_BUDGET/font-size)
- เนื้อหาจบราว 22mm จากขอบล่าง (budget = A4 − 16px); คำเชื่อมสูง ~6mm
- ที่ 4mm → ช่องว่างจากบรรทัดสุดท้าย ~8mm ≈ 1 บรรทัด
- ไม่แตะ `.doc-secret-foot` (คง 8mm ตามกฎเหล็ก #5)
- caveat: html2pdf/PDF ไม่กระทบ; `window.print()` เครื่องพิมพ์จริงขอบ ~4–5mm อาจตัดหางอักษรนิดหน่อย

### 2. `assets/ecmis-app.js` — `paginateDoc()`
- ใน branch `pageBlocks = [signBlock]; pushPage()` (หน้าลงนามล้วน) → ติด flag `signPage.signOnly = true`
- ตอน render: `nextIsSignOnly = hasNextPage && pages[i+1].signOnly === true` →
  `catchwordText = (opts.pageCatchword && hasNextPage && !nextIsSignOnly) ? catchwordFromNextPage(...) : ''`
- เช็คแม่นยำ: เฉพาะหน้าที่ `blocks` = `[signBlock]` ตัวเดียว (หน้าที่มีเนื้อหา + signBlock ต่อท้าย ยังมีคำเชื่อมปกติ)

## ทดสอบ
- `npm test` 5/5 ผ่าน (รวม anti-regression + A4 layout `15mm 15mm 18mm 20mm`)
- manual Chrome (login affairs/Siriporn.K):
  - `order.html?case=3027/2569` appoint (2 หน้า): p1 catchword `"รับผิดชอบดำเนิน..."` ยังอยู่ (p2 = เนื้อหา+ลงนาม ไม่ใช่ลงนามล้วน), `.doc-catchword` computed `bottom = 15.1181px` = 4mm ✓
  - memo (2 หน้า): p1 catchword `"ความเห็นผู้ตรวจ..."` ยังอยู่ (p2 มีเนื้อหาจริง), bottom 4mm ✓
  - **direct test `ECMIS.paginateDoc` — flow 6 บล็อกยาว + signBlock → 4 หน้า, หน้า 4 = ลงนามล้วน, หน้า 3 catchword = `null` ✓** (ก่อนแก้จะได้ `"สั่ง ณ วันที่ ๕ มกราคม..."`)
  - ไม่มี console error
