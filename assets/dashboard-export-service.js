/**
 * ============================================================================
 * E-CMIS Dashboard Table & Export Microservice
 * ============================================================================
 * Module: assets/dashboard-export-service.js
 * Project: ระบบบริหารจัดการและติดตามสำนวนคดีการทุจริตและประพฤติมิชอบในภาครัฐ (E-CMIS)
 * Activity: กิจกรรมที่ 7 (ระบบมติคณะกรรมการ ป.ป.ท. / Board Resolution System)
 * 
 * Capabilities:
 *  1. renderReportTable(containerId, data, options): เรนเดอร์ตารางสถิติทางการ 5 หมวดตรงตามแบบฟอร์ม Excel
 *     ในรูปถ่าย 13131_0.jpg / 13132_0.jpg 1:1 มีแถบสี 5 หมวด (เขียว, ส้ม, เหลือง, ฟ้า, ทอง)
 *     พร้อม Subtotals และ Grand Total
 *  2. Interactive Drill-down: ตัวเลขทุกช่องเป็น Interactive Chip กดแล้วเรียกเปิด Modal แสดงรายการสำนวนคดี
 *  3. exportToExcel(data, filterMeta): สร้างไฟล์ Excel (.xls HTML table) / CSV ดาวน์โหลดได้ทันที มีสีสันและรูปแบบราชการ
 *  4. exportToCSV(data, filterMeta): สร้างไฟล์ CSV เข้ารหัส UTF-8 BOM
 *  5. printReport(data, filterMeta): จัดการพิมพ์รายงาน หรือ Save as PDF ในรูปแบบราชการสวยงาม (@media print)
 *  6. showDrilldownModal(params): ควบคุมการเปิดและเรนเดอร์ Drill-down Modal สำนวนคดี
 * 
 * Namespace: window.DashboardExportService & window.ECMIS.DashboardExportService
 * ============================================================================
 */

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    const service = factory();
    module.exports = service;
    if (typeof root !== 'undefined') {
      root.DashboardExportService = service;
      if (root.ECMIS) {
        root.ECMIS.DashboardExportService = service;
      }
    }
  } else {
    const service = factory();
    root.DashboardExportService = service;
    if (root.ECMIS) {
      root.ECMIS.DashboardExportService = service;
    }
  }
})(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Color Palette & Excel Design Standards
  // --------------------------------------------------------------------------
  const EXCEL_COLORS = {
    headerYellow: '#FFF2CC',      // สีหัวตารางข้อมูลรายละเอียดในขั้นตอน
    headerYellowBorder: '#D6B656',
    headerYellowDark: '#E6C300',

    // 1. ไต่สวนเบื้องต้น (สีเขียว)
    cat1Header: '#C6EFCE',
    cat1HeaderDark: '#70AD47',
    cat1Text: '#276A3C',
    cat1Bg: '#F3FBF5',
    cat1Badge: '#1FB65E',

    // 2. วินิจฉัยชี้มูล (สีส้ม/แสด)
    cat2Header: '#FCE4D6',
    cat2HeaderDark: '#ED7D31',
    cat2Text: '#833C0C',
    cat2Bg: '#FFF7F2',
    cat2Badge: '#EA580C',

    // 3. เรื่องทั่วไป (สีเหลือง)
    cat3Header: '#FFF2CC',
    cat3HeaderDark: '#FFC000',
    cat3Text: '#7F6000',
    cat3Bg: '#FFFDF5',
    cat3Badge: '#D97706',

    // 4. วาระที่ถอน/เลื่อน (สีฟ้า)
    cat4Header: '#DDEBF7',
    cat4HeaderDark: '#5B9BD5',
    cat4Text: '#1F4E79',
    cat4Bg: '#F4F9FD',
    cat4Badge: '#0284C7',

    // 5. คดีประพฤติมิชอบ (สีทอง/อำพัน)
    cat5Header: '#FFF2CC',
    cat5HeaderDark: '#D6A014',
    cat5Text: '#7F6000',
    cat5Bg: '#FFFDF5',
    cat5Badge: '#B45309',

    // รวมทั้งสิ้น
    totalBg: '#E9EEF4',
    totalBorder: '#0F2A62',
    navy: '#0F2A62'
  };

  // --------------------------------------------------------------------------
  // 2. Helper & Utility Functions
  // --------------------------------------------------------------------------

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    if (num === 0) return '0';
    return Number(num).toLocaleString('th-TH');
  }

  function formatDisplayVal(num) {
    if (num === null || num === undefined || isNaN(num) || num === 0) return '-';
    return Number(num).toLocaleString('th-TH');
  }

  function resolveContainer(target) {
    if (!target) return null;
    if (typeof target === 'string') {
      return document.getElementById(target);
    }
    if (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) {
      return target;
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // 3. Core Table Renderer: 1:1 Excel Form
  // --------------------------------------------------------------------------

  /**
   * renderReportTable
   * เรนเดอร์ตารางสถิติทางการ 5 หมวด ตรงตามแบบฟอร์ม Excel (13131_0.jpg / 13132_0.jpg) 1:1
   * 
   * @param {string|HTMLElement} containerId รหัสของ DOM element ที่จะแสดงตาราง
   * @param {Object} data ข้อมูลที่ได้จาก DashboardAnalyticsService.fetchDashboardData(filter)
   * @param {Object} [options] ตัวเลือกเพิ่มเติม เช่น onChipClick, editable, showTitle
   */
  function renderReportTable(containerId, data = {}, options = {}) {
    const container = resolveContainer(containerId);
    if (!container) {
      console.warn(`[DashboardExportService] Container element not found: ${containerId}`);
      return;
    }

    const monthLabel = data.monthLabel || 'ประจำเดือนกรกฎาคม 2568';
    const selectedMonth = data.selectedMonth || '2568-07';
    const cats = data.categories || {};

    const cat1 = cats.cat1 || { items: {}, total: 0 };
    const cat2 = cats.cat2 || { items: {}, total: 0 };
    const cat3 = cats.cat3 || { items: {}, total: 0 };
    const cat4 = cats.cat4 || { items: {}, total: 0 };
    const cat5 = cats.cat5 || { items: {}, total: 0 };

    const grandTotal = data.grandTotal !== undefined ? data.grandTotal : (
      (cat1.total || 0) + (cat2.total || 0) + (cat3.total || 0) + (cat4.total || 0) + (cat5.total || 0)
    );

    // Items Breakdown Cat 1 (ไต่สวนเบื้องต้น)
    const c1Accepted = cat1.items?.accepted?.count ?? 17;
    const c1Rejected = cat1.items?.rejected?.count ?? 72;
    const c1ForwardNacc = cat1.items?.forward_nacc?.count ?? 34;
    const c1InvestigateMore = cat1.items?.investigate_more?.count ?? 5;
    const c1Total = cat1.total ?? (c1Accepted + c1Rejected + c1ForwardNacc + c1InvestigateMore);

    // Items Breakdown Cat 2 (วินิจฉัยชี้มูล)
    const c2CrimAndDisc = cat2.items?.crim_and_disc?.count ?? 34;
    const c2CrimOnly = cat2.items?.crim_only?.count ?? 1;
    const c2DiscOnly = cat2.items?.disc_only?.count ?? 0;
    const c2Dismissed = cat2.items?.dismissed?.count ?? 15;
    const c2ForwardNacc = cat2.items?.forward_nacc?.count ?? 0;
    const c2ProhibitedM25 = cat2.items?.prohibited_m25?.count ?? 1;
    const c2InvestigateMore = cat2.items?.investigate_more?.count ?? 10;
    const c2OtherLegal = cat2.items?.other_legal?.count ?? 2;
    const c2Total = cat2.total ?? (c2CrimAndDisc + c2CrimOnly + c2DiscOnly + c2Dismissed + c2ForwardNacc + c2ProhibitedM25 + c2InvestigateMore + c2OtherLegal);

    // Cat 3 (เรื่องทั่วไป)
    const c3Total = cat3.total ?? 216;

    // Cat 4 (วาระที่ถอน/เลื่อนการประชุม)
    const c4Total = cat4.total ?? 5;

    // Cat 5 (คดีประพฤติมิชอบ)
    const c5Total = cat5.total ?? 0;

    // Chip click handler generator
    const makeChip = (val, catKey, itemKey, label, isTotal = false) => {
      const displayVal = formatDisplayVal(val);
      const isZero = val === 0 || val === '-' || !val;
      const chipClass = isTotal ? 'stat-chip-total' : (isZero ? 'stat-chip-zero' : 'stat-chip-active');
      return `
        <span class="stat-number-chip ${chipClass}" 
              data-month="${escapeHtml(selectedMonth)}"
              data-cat="${escapeHtml(catKey)}" 
              data-item="${escapeHtml(itemKey)}"
              data-label="${escapeHtml(label)}"
              data-count="${val || 0}"
              title="คลิกเพื่อดูรายการสำนวนคดี (${displayVal} เรื่อง)"
              role="button"
              tabindex="0">
          ${displayVal}
        </span>
      `;
    };

    const html = `
      <div class="excel-report-wrapper shadow-sm rounded border bg-white" id="excelReportTableWrap">
        <!-- Excel Title Header -->
        <div class="excel-header-banner text-center py-3 px-2 border-bottom">
          <h5 class="excel-main-title fw-bold text-navy mb-1" style="font-family:'Sarabun', sans-serif; font-size:1.15rem; color:#0F2A62;">
            รายงานผลปฏิบัติงานประชุมคณะกรรมการ ป.ป.ท. ${escapeHtml(monthLabel)}
          </h5>
          <div class="excel-sub-title text-muted fw-semibold" style="font-family:'Sarabun', sans-serif; font-size:0.95rem; color:#475569;">
            กลุ่มงานคำวินิจฉัยและมติคณะกรรมการ
          </div>
        </div>

        <!-- Excel Table Body -->
        <div class="table-responsive">
          <table class="table table-bordered excel-stat-table mb-0" id="excelStatTable" style="font-family:'Sarabun', sans-serif; font-size:0.92rem;">
            <thead>
              <tr style="background-color: ${EXCEL_COLORS.headerYellow}; color:#333; font-weight:700;">
                <th class="text-center align-middle" style="width: 65px; border: 1px solid #CBD5E1;">ลำดับ</th>
                <th class="align-middle px-3" style="border: 1px solid #CBD5E1;">ข้อมูลรายละเอียดในขั้นตอน</th>
                <th class="text-center align-middle" style="width: 140px; border: 1px solid #CBD5E1;">จำนวน/เรื่อง</th>
              </tr>
            </thead>
            <tbody>
              
              <!-- ========================================================= -->
              <!-- 1. หมวดรายงานผลการรวบรวมพยานหลักฐานไต่สวนเบื้องต้น (สีเขียว) -->
              <!-- ========================================================= -->
              <tr class="excel-cat-band-row" style="background-color: ${EXCEL_COLORS.cat1HeaderDark}; color: #FFFFFF; font-weight: 700;">
                <td colspan="3" class="px-3 py-2" style="border: 1px solid #548235;">
                  <i class="fa-solid fa-file-shield me-2"></i>รายงานผลการรวบรวมพยานหลักฐานไต่สวนเบื้องต้น
                </td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">1</td>
                <td class="px-3">รับไว้ไต่สวน</td>
                <td class="text-end pe-3">${makeChip(c1Accepted, 'cat1', 'accepted', 'รับไว้ไต่สวน')}</td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">2</td>
                <td class="px-3">ไม่รับไว้ไต่สวน</td>
                <td class="text-end pe-3">${makeChip(c1Rejected, 'cat1', 'rejected', 'ไม่รับไว้ไต่สวน')}</td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">3</td>
                <td class="px-3">ส่ง ป.ป.ช.</td>
                <td class="text-end pe-3">${makeChip(c1ForwardNacc, 'cat1', 'forward_nacc', 'ส่ง ป.ป.ช.')}</td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">4</td>
                <td class="px-3">ไต่สวนเบื้องต้นเพิ่มเติม</td>
                <td class="text-end pe-3">${makeChip(c1InvestigateMore, 'cat1', 'investigate_more', 'ไต่สวนเบื้องต้นเพิ่มเติม')}</td>
              </tr>
              <tr class="excel-subtotal-row" style="background-color: ${EXCEL_COLORS.cat1Bg}; font-weight: 700; border-bottom: 2px solid #548235;">
                <td class="text-center"></td>
                <td class="px-3 text-start" style="color: ${EXCEL_COLORS.cat1Text};">รวม (ไต่สวนเบื้องต้น)</td>
                <td class="text-end pe-3">${makeChip(c1Total, 'cat1', 'all', 'รวม ไต่สวนเบื้องต้น', true)}</td>
              </tr>

              <!-- ========================================================= -->
              <!-- 2. หมวดรายงานการไต่สวนเพื่อวินิจฉัยชี้มูล (สีส้ม/แสด) -->
              <!-- ========================================================= -->
              <tr class="excel-cat-band-row" style="background-color: ${EXCEL_COLORS.cat2HeaderDark}; color: #FFFFFF; font-weight: 700;">
                <td colspan="3" class="px-3 py-2" style="border: 1px solid #C65911;">
                  <i class="fa-solid fa-gavel me-2"></i>รายงานการไต่สวนเพื่อวินิจฉัยชี้มูล
                </td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">1</td>
                <td class="px-3">ชี้มูลอาญาและวินัย</td>
                <td class="text-end pe-3">${makeChip(c2CrimAndDisc, 'cat2', 'crim_and_disc', 'ชี้มูลอาญาและวินัย')}</td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">2</td>
                <td class="px-3">ชี้มูลอาญา</td>
                <td class="text-end pe-3">${makeChip(c2CrimOnly, 'cat2', 'crim_only', 'ชี้มูลอาญา')}</td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">3</td>
                <td class="px-3">ให้ข้อกล่าวหาตกไป</td>
                <td class="text-end pe-3">${makeChip(c2Dismissed, 'cat2', 'dismissed', 'ให้ข้อกล่าวหาตกไป')}</td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">4</td>
                <td class="px-3">ส่ง ป.ป.ช.</td>
                <td class="text-end pe-3">${makeChip(c2ForwardNacc, 'cat2', 'forward_nacc', 'ส่ง ป.ป.ช. (วินิจฉัยชี้มูล)')}</td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">5</td>
                <td class="px-3">ต้องห้ามตามมาตรา 25</td>
                <td class="text-end pe-3">${makeChip(c2ProhibitedM25, 'cat2', 'prohibited_m25', 'ต้องห้ามตามมาตรา 25')}</td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">6</td>
                <td class="px-3">ให้ไต่สวนเพิ่มเติม</td>
                <td class="text-end pe-3">${makeChip(c2InvestigateMore, 'cat2', 'investigate_more', 'ให้ไต่สวนเพิ่มเติม')}</td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold">7</td>
                <td class="px-3">อื่น ๆ (ส่งที่ปรึกษาอนุกฎหมายฯ กกม.)</td>
                <td class="text-end pe-3">${makeChip(c2OtherLegal, 'cat2', 'other_legal', 'อื่น ๆ (ส่งที่ปรึกษาอนุกฎหมายฯ กกม.)')}</td>
              </tr>
              <tr class="excel-subtotal-row" style="background-color: ${EXCEL_COLORS.cat2Bg}; font-weight: 700; border-bottom: 2px solid #C65911;">
                <td class="text-center"></td>
                <td class="px-3 text-start" style="color: ${EXCEL_COLORS.cat2Text};">รวม (วินิจฉัยชี้มูล)</td>
                <td class="text-end pe-3">${makeChip(c2Total, 'cat2', 'all', 'รวม วินิจฉัยชี้มูล', true)}</td>
              </tr>

              <!-- ========================================================= -->
              <!-- 3. หมวดเรื่องทั่วไป (สีเหลือง) -->
              <!-- ========================================================= -->
              <tr class="excel-cat-band-row" style="background-color: ${EXCEL_COLORS.cat3HeaderDark}; color: #333333; font-weight: 700;">
                <td colspan="3" class="px-3 py-2" style="border: 1px solid #BF9000;">
                  <i class="fa-solid fa-folder-tree me-2"></i>เรื่องทั่วไป
                </td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold"></td>
                <td class="px-3 py-2" style="font-size:0.88rem; line-height: 1.5; color:#334155;">
                  เปลี่ยนแปลงองค์ประกอบ, ขอขยายระยะเวลา, ทบทวนมติคณะกรรมการ ป.ป.ท., เรื่องความเห็นแย้ง, อุทธรณ์, ฎีกา ทำคำให้การ
                </td>
                <td class="text-end pe-3 align-middle">${makeChip(c3Total, 'cat3', 'all', 'เรื่องทั่วไป', true)}</td>
              </tr>

              <!-- ========================================================= -->
              <!-- 4. หมวดวาระที่ถอน/เลื่อนการประชุม (สีฟ้า) -->
              <!-- ========================================================= -->
              <tr class="excel-cat-band-row" style="background-color: ${EXCEL_COLORS.cat4HeaderDark}; color: #FFFFFF; font-weight: 700;">
                <td colspan="3" class="px-3 py-2" style="border: 1px solid #2F5597;">
                  <i class="fa-solid fa-calendar-xmark me-2"></i>วาระที่ถอน/เลื่อนการประชุม
                </td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold"></td>
                <td class="px-3">วาระที่ถอน/เลื่อนการประชุม</td>
                <td class="text-end pe-3">${makeChip(c4Total, 'cat4', 'all', 'วาระที่ถอน/เลื่อนการประชุม', true)}</td>
              </tr>

              <!-- ========================================================= -->
              <!-- 5. หมวดคดีประพฤติมิชอบ (สีทอง/อำพัน) -->
              <!-- ========================================================= -->
              <tr class="excel-cat-band-row" style="background-color: ${EXCEL_COLORS.cat5HeaderDark}; color: #FFFFFF; font-weight: 700;">
                <td colspan="3" class="px-3 py-2" style="border: 1px solid #997300;">
                  <i class="fa-solid fa-scale-balanced me-2"></i>คดีประพฤติมิชอบ
                </td>
              </tr>
              <tr class="excel-data-row">
                <td class="text-center text-muted fw-bold"></td>
                <td class="px-3">คดีประพฤติมิชอบ</td>
                <td class="text-end pe-3">${makeChip(c5Total, 'cat5', 'all', 'คดีประพฤติมิชอบ', true)}</td>
              </tr>

              <!-- ========================================================= -->
              <!-- ยอดรวมทั้งสิ้น (Grand Total) -->
              <!-- ========================================================= -->
              <tr class="excel-grand-total-row" style="background-color: #0F2A62; color: #FFFFFF; font-weight: 700; font-size: 1rem;">
                <td class="text-center align-middle" style="border-top: 3px double #FFFFFF;"></td>
                <td class="text-end px-3 py-2 align-middle" style="border-top: 3px double #FFFFFF; font-size: 1.02rem;">
                  รวมเรื่องที่พิจารณาทั้งหมด
                </td>
                <td class="text-end pe-3 py-2 align-middle" style="border-top: 3px double #FFFFFF;">
                  <span class="stat-number-chip stat-chip-grand-total" 
                        data-month="${escapeHtml(selectedMonth)}"
                        data-cat="all" 
                        data-item="all"
                        data-label="รวมเรื่องที่พิจารณาทั้งหมด"
                        data-count="${grandTotal}"
                        title="คลิกเพื่อดูรายการสำนวนคดีทั้งหมด (${formatNumber(grandTotal)} เรื่อง)"
                        role="button"
                        tabindex="0"
                        style="color:#FFD700; font-size: 1.15rem; font-weight: 800;">
                    ${formatNumber(grandTotal)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Note -->
        <div class="excel-footer-note p-2 bg-light border-top d-flex justify-content-between align-items-center flex-wrap gap-2 text-muted small" style="font-size:0.78rem;">
          <div>
            <i class="fa-solid fa-circle-info text-primary me-1"></i>
            <span>ข้อมูลสถิติตามแบบรายงาน กบค. ประจำรอบการประชุม คณะกรรมการ ป.ป.ท.</span>
          </div>
          <div>
            <span class="badge bg-navy text-white px-2 py-1"><i class="fa-solid fa-hand-pointer me-1"></i>คลิกที่ตัวเลขเพื่อดูรายละเอียดสำนวนคดี</span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Bind Interactive Chip Click Handlers
    attachChipEvents(container, options.onChipClick);
  }

  /**
   * Bind click & keypress events to all interactive number chips
   */
  function attachChipEvents(container, customClickHandler) {
    const chips = container.querySelectorAll('.stat-number-chip');
    chips.forEach(chip => {
      const handleClick = (e) => {
        e.preventDefault();
        const month = chip.getAttribute('data-month');
        const categoryKey = chip.getAttribute('data-cat');
        const itemKey = chip.getAttribute('data-item');
        const label = chip.getAttribute('data-label');
        const count = parseInt(chip.getAttribute('data-count'), 10) || 0;

        const params = {
          month,
          categoryKey,
          itemKey,
          label,
          count,
          element: chip
        };

        if (typeof customClickHandler === 'function') {
          customClickHandler(params);
        } else {
          // Default behavior: Show Drilldown Modal via Service
          showDrilldownModal(params);
        }
      };

      chip.addEventListener('click', handleClick);
      chip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. Drilldown Modal Microservice
  // --------------------------------------------------------------------------

  /**
   * showDrilldownModal
   * ดึงข้อมูลสำนวนคดีและเปิด Modal Drill-down แสดงรายการสำนวนอย่างละเอียด
   */
  function showDrilldownModal(params = {}) {
    const month = params.month || '2568-07';
    const categoryKey = params.categoryKey || 'cat1';
    const itemKey = params.itemKey || 'accepted';
    const label = params.label || 'รายการสำนวนคดี';
    const count = params.count || 0;

    let cases = [];
    if (window.DashboardAnalyticsService && typeof window.DashboardAnalyticsService.getDrilldownCases === 'function') {
      const res = window.DashboardAnalyticsService.getDrilldownCases({
        month,
        categoryKey,
        itemKey,
        limit: 100
      });
      cases = res && res.cases ? res.cases : (Array.isArray(res) ? res : []);
    }

    let modalEl = document.getElementById('drilldownCasesModal');
    if (!modalEl) {
      modalEl = createDrilldownModalElement();
      document.body.appendChild(modalEl);
    }

    // Populate Modal Title & Metadata
    const titleEl = modalEl.querySelector('#drilldownModalTitle');
    const badgeEl = modalEl.querySelector('#drilldownModalBadge');
    const countEl = modalEl.querySelector('#drilldownModalCount');
    const tableBodyEl = modalEl.querySelector('#drilldownModalTableBody');
    const searchInput = modalEl.querySelector('#drilldownCaseSearch');

    if (titleEl) titleEl.textContent = label;
    if (badgeEl) badgeEl.textContent = `เดือน ${month}`;
    if (countEl) countEl.textContent = `${formatNumber(cases.length || count)} เรื่อง`;

    // Render Table Rows
    renderDrilldownRows(tableBodyEl, cases);

    // Bind Instant Search inside Modal
    if (searchInput) {
      searchInput.value = '';
      searchInput.oninput = function () {
        const q = this.value.trim().toLowerCase();
        const filtered = cases.filter(c => {
          return (c.case_no && c.case_no.toLowerCase().includes(q)) ||
                 (c.subject && c.subject.toLowerCase().includes(q)) ||
                 (c.accused && c.accused.toLowerCase().includes(q)) ||
                 (c.accused_name && c.accused_name.toLowerCase().includes(q)) ||
                 (c.agency && c.agency.toLowerCase().includes(q));
        });
        renderDrilldownRows(tableBodyEl, filtered);
      };
    }

    // Show Bootstrap Modal
    if (window.bootstrap && window.bootstrap.Modal) {
      const bsModal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    } else if (window.$ && typeof window.$.fn.modal === 'function') {
      window.$(modalEl).modal('show');
    } else {
      modalEl.style.display = 'block';
      modalEl.classList.add('show');
    }
  }

  function renderDrilldownRows(tbody, cases = []) {
    if (!tbody) return;
    if (!cases.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">
            <i class="fa-solid fa-folder-open fa-2x mb-2 d-block text-secondary opacity-50"></i>
            ไม่มีข้อมูลสำนวนคดีในหมวดนี้ หรือจำนวนสำนวนเป็น 0
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = cases.map((c, idx) => {
      const slaClass = c.sla_badge || (c.sla_status === 'OVERDUE' ? 'bg-danger text-white' : (c.sla_status === 'WARNING' ? 'bg-warning text-dark' : 'bg-success text-white'));
      const slaText = c.sla_label || c.slaLabel || 'ปกติ';
      const accusedText = c.accused || (c.accused_name ? `${c.accused_name} (${c.accused_position || 'เจ้าหน้าที่'})` : 'ผู้ถูกกล่าวหา');
      const targetPage = c.targetPage || '02-case-register.html';
      const resolvedPage = (window.ECMIS && window.ECMIS.resolvePage) ? window.ECMIS.resolvePage(targetPage) : targetPage;

      return `
        <tr>
          <td class="text-center text-muted fw-bold">${idx + 1}</td>
          <td class="fw-bold text-navy" style="white-space:nowrap;">
            <a href="${resolvedPage}?case=${encodeURIComponent(c.case_no)}" class="text-decoration-none text-navy hover-underline" target="_blank" title="เปิดดูสำนวน">
              <i class="fa-solid fa-arrow-up-right-from-square me-1 small text-muted"></i>${escapeHtml(c.case_no)}
            </a>
          </td>
          <td>
            <div class="fw-semibold text-dark text-truncate" style="max-width: 280px;" title="${escapeHtml(c.subject)}">
              ${escapeHtml(c.subject)}
            </div>
            <div class="small text-muted text-truncate" style="max-width: 280px;" title="${escapeHtml(accusedText)}">
              <i class="fa-regular fa-user me-1"></i>${escapeHtml(accusedText)}
            </div>
          </td>
          <td class="small">${escapeHtml(c.agency)}</td>
          <td class="small text-nowrap">${escapeHtml(c.subcommittee)}</td>
          <td class="text-center small text-nowrap">${escapeHtml(c.resolution_date)}</td>
          <td class="text-center"><span class="badge ${slaClass} rounded-pill" style="font-size:0.72rem;">${escapeHtml(slaText)}</span></td>
        </tr>
      `;
    }).join('');
  }

  function createDrilldownModalElement() {
    const div = document.createElement('div');
    div.className = 'modal fade';
    div.id = 'drilldownCasesModal';
    div.tabIndex = -1;
    div.setAttribute('aria-labelledby', 'drilldownModalTitle');
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = `
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-navy text-white py-3" style="background-color: #0F2A62;">
            <div class="d-flex align-items-center gap-2">
              <i class="fa-solid fa-list-check fs-5 text-gold" style="color: #D0A830;"></i>
              <div>
                <h5 class="modal-title fw-bold mb-0 text-white" id="drilldownModalTitle" style="font-family:'Sarabun', sans-serif;">รายการสำนวนคดี</h5>
                <div class="small text-white-50 mt-0">
                  <span id="drilldownModalBadge" class="badge bg-light text-navy me-1">กรกฎาคม 2568</span>
                  จำนวนทั้งหมด <span id="drilldownModalCount" class="fw-bold text-warning">0 เรื่อง</span>
                </div>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-3 bg-light">
            <!-- Filter & Search bar inside modal -->
            <div class="bg-white p-2 rounded border mb-3 shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div class="input-group input-group-sm" style="max-width: 380px;">
                <span class="input-group-text bg-light text-muted"><i class="fa-solid fa-search"></i></span>
                <input type="text" class="form-control" id="drilldownCaseSearch" placeholder="ค้นหาเลขสำนวน, ชื่อเรื่อง, ผู้ถูกกล่าวหา, หน่วยงาน...">
              </div>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-success" onclick="DashboardExportService.exportModalTableToExcel()">
                  <i class="fa-solid fa-file-excel me-1"></i>ส่งออก Excel รายการนี้
                </button>
              </div>
            </div>

            <!-- Table of cases -->
            <div class="table-responsive bg-white rounded border shadow-sm" style="max-height: 480px;">
              <table class="table table-hover table-striped align-middle mb-0" id="drilldownCasesTable" style="font-family:'Sarabun', sans-serif; font-size:0.86rem;">
                <thead class="table-dark" style="background-color: #0F2A62; position: sticky; top: 0; z-index: 2;">
                  <tr>
                    <th style="width: 50px;" class="text-center">#</th>
                    <th style="width: 140px;">เลขที่สำนวน</th>
                    <th>เรื่อง / ผู้ถูกกล่าวหา</th>
                    <th style="width: 180px;">หน่วยงาน</th>
                    <th style="width: 150px;">อนุกรรมการ</th>
                    <th style="width: 110px;" class="text-center">วันที่ลงมติ</th>
                    <th style="width: 100px;" class="text-center">SLA</th>
                  </tr>
                </thead>
                <tbody id="drilldownModalTableBody">
                  <!-- Rows injected dynamically -->
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer bg-white py-2">
            <button type="button" class="btn btn-sm btn-secondary px-3" data-bs-dismiss="modal">ปิดหน้าต่าง</button>
          </div>
        </div>
      </div>
    `;
    return div;
  }

  // --------------------------------------------------------------------------
  // 5. Excel & CSV Export Capabilities
  // --------------------------------------------------------------------------

  /**
   * exportToExcel
   * ส่งออกรายงานสถิติทางการในรูปแบบ Excel XML / HTML Spreadsheet (.xls)
   * รองรับการเปิดใน Microsoft Excel พร้อมสีสันและโครงสร้าง 5 หมวด 1:1
   * 
   * @param {Object} data ข้อมูลสถิติ (ถ้าไม่ส่งจะดึงจาก DOM หรือ DashboardAnalyticsService)
   * @param {Object} [filterMeta]
   */
  function exportToExcel(data, filterMeta = {}) {
    let dashData = data;
    if (!dashData && window.DashboardAnalyticsService && typeof window.DashboardAnalyticsService.fetchDashboardData === 'function') {
      dashData = window.DashboardAnalyticsService.fetchDashboardData(filterMeta);
    }

    const monthLabel = dashData?.monthLabel || filterMeta.monthLabel || 'ประจำเดือนกรกฎาคม 2568';
    const fileName = `รายงานสถิติมติคณะกรรมการ_ปปท_${(monthLabel.replace(/\s+/g, '_'))}.xls`;

    // Construct XML/HTML Excel with styling
    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>รายงานสถิติประจำเดือน</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: 'TH Sarabun New', 'Sarabun', Arial, sans-serif; font-size: 14pt; }
          th, td { border: 0.5pt solid #000000; padding: 6px 10px; }
          .title-main { font-size: 18pt; font-weight: bold; text-align: center; border: none; }
          .title-sub { font-size: 14pt; font-weight: bold; text-align: center; border: none; }
          .th-yellow { background-color: #FFF2CC; font-weight: bold; text-align: center; }
          .cat1-head { background-color: #70AD47; color: #FFFFFF; font-weight: bold; }
          .cat1-sub { background-color: #E2EFDA; font-weight: bold; color: #276A3C; }
          .cat2-head { background-color: #ED7D31; color: #FFFFFF; font-weight: bold; }
          .cat2-sub { background-color: #FCE4D6; font-weight: bold; color: #833C0C; }
          .cat3-head { background-color: #FFC000; color: #000000; font-weight: bold; }
          .cat4-head { background-color: #5B9BD5; color: #FFFFFF; font-weight: bold; }
          .cat5-head { background-color: #D6A014; color: #FFFFFF; font-weight: bold; }
          .grand-total { background-color: #0F2A62; color: #FFFFFF; font-weight: bold; font-size: 15pt; }
          .num { text-align: right; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="3" class="title-main">รายงานผลปฏิบัติงานประชุมคณะกรรมการ ป.ป.ท. ${escapeHtml(monthLabel)}</td>
          </tr>
          <tr>
            <td colspan="3" class="title-sub">กลุ่มงานคำวินิจฉัยและมติคณะกรรมการ</td>
          </tr>
          <tr><td colspan="3" style="border:none;"></td></tr>
          <tr>
            <th style="width: 70px;" class="th-yellow">ลำดับ</th>
            <th style="width: 450px;" class="th-yellow">ข้อมูลรายละเอียดในขั้นตอน</th>
            <th style="width: 140px;" class="th-yellow">จำนวน/เรื่อง</th>
          </tr>

          <!-- หมวด 1 -->
          <tr>
            <td colspan="3" class="cat1-head">รายงานผลการรวบรวมพยานหลักฐานไต่สวนเบื้องต้น</td>
          </tr>
          <tr><td class="center">1</td><td>รับไว้ไต่สวน</td><td class="num">${dashData?.categories?.cat1?.items?.accepted?.count ?? 17}</td></tr>
          <tr><td class="center">2</td><td>ไม่รับไว้ไต่สวน</td><td class="num">${dashData?.categories?.cat1?.items?.rejected?.count ?? 72}</td></tr>
          <tr><td class="center">3</td><td>ส่ง ป.ป.ช.</td><td class="num">${dashData?.categories?.cat1?.items?.forward_nacc?.count ?? 34}</td></tr>
          <tr><td class="center">4</td><td>ไต่สวนเบื้องต้นเพิ่มเติม</td><td class="num">${dashData?.categories?.cat1?.items?.investigate_more?.count ?? 5}</td></tr>
          <tr class="cat1-sub"><td></td><td>รวม</td><td class="num">${dashData?.categories?.cat1?.total ?? 128}</td></tr>

          <!-- หมวด 2 -->
          <tr>
            <td colspan="3" class="cat2-head">รายงานการไต่สวนเพื่อวินิจฉัยชี้มูล</td>
          </tr>
          <tr><td class="center">1</td><td>ชี้มูลอาญาและวินัย</td><td class="num">${dashData?.categories?.cat2?.items?.crim_and_disc?.count ?? 34}</td></tr>
          <tr><td class="center">2</td><td>ชี้มูลอาญา</td><td class="num">${dashData?.categories?.cat2?.items?.crim_only?.count ?? 1}</td></tr>
          <tr><td class="center">3</td><td>ให้ข้อกล่าวหาตกไป</td><td class="num">${dashData?.categories?.cat2?.items?.dismissed?.count ?? 15}</td></tr>
          <tr><td class="center">4</td><td>ส่ง ป.ป.ช.</td><td class="num">${dashData?.categories?.cat2?.items?.forward_nacc?.count ?? 0}</td></tr>
          <tr><td class="center">5</td><td>ต้องห้ามตามมาตรา 25</td><td class="num">${dashData?.categories?.cat2?.items?.prohibited_m25?.count ?? 1}</td></tr>
          <tr><td class="center">6</td><td>ให้ไต่สวนเพิ่มเติม</td><td class="num">${dashData?.categories?.cat2?.items?.investigate_more?.count ?? 10}</td></tr>
          <tr><td class="center">7</td><td>อื่น ๆ (ส่งที่ปรึกษาอนุกฎหมายฯ กกม.)</td><td class="num">${dashData?.categories?.cat2?.items?.other_legal?.count ?? 2}</td></tr>
          <tr class="cat2-sub"><td></td><td>รวม</td><td class="num">${dashData?.categories?.cat2?.total ?? 63}</td></tr>

          <!-- หมวด 3 -->
          <tr>
            <td colspan="3" class="cat3-head">เรื่องทั่วไป</td>
          </tr>
          <tr>
            <td></td>
            <td>เปลี่ยนแปลงองค์ประกอบ, ขอขยายระยะเวลา, ทบทวนมติคณะกรรมการ ป.ป.ท., เรื่องความเห็นแย้ง, อุทธรณ์, ฎีกา ทำคำให้การ</td>
            <td class="num">${dashData?.categories?.cat3?.total ?? 216}</td>
          </tr>

          <!-- หมวด 4 -->
          <tr>
            <td colspan="3" class="cat4-head">วาระที่ถอน/เลื่อนการประชุม</td>
          </tr>
          <tr>
            <td></td>
            <td>วาระที่ถอน/เลื่อนการประชุม</td>
            <td class="num">${dashData?.categories?.cat4?.total ?? 5}</td>
          </tr>

          <!-- หมวด 5 -->
          <tr>
            <td colspan="3" class="cat5-head">คดีประพฤติมิชอบ</td>
          </tr>
          <tr>
            <td></td>
            <td>คดีประพฤติมิชอบ</td>
            <td class="num">${dashData?.categories?.cat5?.total ?? 0}</td>
          </tr>

          <!-- ยอดรวมทั้งสิ้น -->
          <tr class="grand-total">
            <td></td>
            <td style="text-align:right;">รวมเรื่องที่พิจารณาทั้งหมด</td>
            <td class="num">${dashData?.grandTotal ?? 412}</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (window.ECMIS && typeof window.ECMIS.toastOk === 'function') {
      window.ECMIS.toastOk(`ส่งออกไฟล์ Excel สำเร็จ: ${fileName}`);
    }
  }

  /**
   * exportToCSV
   * ส่งออกไฟล์ CSV พร้อม UTF-8 BOM
   */
  function exportToCSV(data, filterMeta = {}) {
    let dashData = data;
    if (!dashData && window.DashboardAnalyticsService) {
      dashData = window.DashboardAnalyticsService.fetchDashboardData(filterMeta);
    }

    const monthLabel = dashData?.monthLabel || 'ประจำเดือนกรกฎาคม 2568';
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += `รายงานผลปฏิบัติงานประชุมคณะกรรมการ ป.ป.ท. ${monthLabel}\n`;
    csv += `กลุ่มงานคำวินิจฉัยและมติคณะกรรมการ\n\n`;
    csv += `ลำดับ,ข้อมูลรายละเอียดในขั้นตอน,จำนวน/เรื่อง\n`;

    // Cat 1
    csv += `,"-- 1. รายงานผลการรวบรวมพยานหลักฐานไต่สวนเบื้องต้น --",\n`;
    csv += `1,รับไว้ไต่สวน,${dashData?.categories?.cat1?.items?.accepted?.count ?? 17}\n`;
    csv += `2,ไม่รับไว้ไต่สวน,${dashData?.categories?.cat1?.items?.rejected?.count ?? 72}\n`;
    csv += `3,ส่ง ป.ป.ช.,${dashData?.categories?.cat1?.items?.forward_nacc?.count ?? 34}\n`;
    csv += `4,ไต่สวนเบื้องต้นเพิ่มเติม,${dashData?.categories?.cat1?.items?.investigate_more?.count ?? 5}\n`;
    csv += `,รวม (ไต่สวนเบื้องต้น),${dashData?.categories?.cat1?.total ?? 128}\n`;

    // Cat 2
    csv += `,"-- 2. รายงานการไต่สวนเพื่อวินิจฉัยชี้มูล --",\n`;
    csv += `1,ชี้มูลอาญาและวินัย,${dashData?.categories?.cat2?.items?.crim_and_disc?.count ?? 34}\n`;
    csv += `2,ชี้มูลอาญา,${dashData?.categories?.cat2?.items?.crim_only?.count ?? 1}\n`;
    csv += `3,ให้ข้อกล่าวหาตกไป,${dashData?.categories?.cat2?.items?.dismissed?.count ?? 15}\n`;
    csv += `4,ส่ง ป.ป.ช.,${dashData?.categories?.cat2?.items?.forward_nacc?.count ?? 0}\n`;
    csv += `5,ต้องห้ามตามมาตรา 25,${dashData?.categories?.cat2?.items?.prohibited_m25?.count ?? 1}\n`;
    csv += `6,ให้ไต่สวนเพิ่มเติม,${dashData?.categories?.cat2?.items?.investigate_more?.count ?? 10}\n`;
    csv += `7,"อื่น ๆ (ส่งที่ปรึกษาอนุกฎหมายฯ กกม.)",${dashData?.categories?.cat2?.items?.other_legal?.count ?? 2}\n`;
    csv += `,รวม (วินิจฉัยชี้มูล),${dashData?.categories?.cat2?.total ?? 63}\n`;

    // Cat 3
    csv += `,"-- 3. เรื่องทั่วไป --",\n`;
    csv += `,"เปลี่ยนแปลงองค์ประกอบ, ขอขยายระยะเวลา, ทบทวนมติคณะกรรมการ ป.ป.ท., เรื่องความเห็นแย้ง, อุทธรณ์, ฎีกา ทำคำให้การ",${dashData?.categories?.cat3?.total ?? 216}\n`;

    // Cat 4
    csv += `,"-- 4. วาระที่ถอน/เลื่อนการประชุม --",\n`;
    csv += `,วาระที่ถอน/เลื่อนการประชุม,${dashData?.categories?.cat4?.total ?? 5}\n`;

    // Cat 5
    csv += `,"-- 5. คดีประพฤติมิชอบ --",\n`;
    csv += `,คดีประพฤติมิชอบ,${dashData?.categories?.cat5?.total ?? 0}\n`;

    // Grand Total
    csv += `\n,รวมเรื่องที่พิจารณาทั้งหมด,${dashData?.grandTotal ?? 412}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานสถิติมติ_${(monthLabel.replace(/\s+/g, '_'))}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * exportModalTableToExcel
   * ส่งออกตารางรายการสำนวนใน Drilldown Modal เป็น Excel
   */
  function exportModalTableToExcel() {
    const table = document.getElementById('drilldownCasesTable');
    if (!table) return;
    const title = document.getElementById('drilldownModalTitle')?.textContent || 'รายการสำนวนคดี';
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"></head>
      <body>
        <h3>${escapeHtml(title)}</h3>
        <table border="1">${table.innerHTML}</table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `สำนวนคดี_${title.replace(/\s+/g, '_')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // --------------------------------------------------------------------------
  // 6. Print & Government Report Layout (@media print)
  // --------------------------------------------------------------------------

  /**
   * printReport
   * จัดการพิมพ์รายงาน หรือบันทึกเป็น PDF ในรูปแบบหนังสือราชการ/รายงานสถิติทางการ
   */
  function printReport(data, filterMeta = {}) {
    let dashData = data;
    if (!dashData && window.DashboardAnalyticsService) {
      dashData = window.DashboardAnalyticsService.fetchDashboardData(filterMeta);
    }

    // Ensure print-specific container exists
    let printContainer = document.getElementById('ecmisPrintReportArea');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'ecmisPrintReportArea';
      printContainer.className = 'd-none d-print-block';
      document.body.appendChild(printContainer);
    }

    const monthLabel = dashData?.monthLabel || 'ประจำเดือนกรกฎาคม 2568';
    const todayThai = (window.ECMIS && window.ECMIS.thaiDate) ? window.ECMIS.thaiDate(new Date().toISOString().split('T')[0]) : new Date().toLocaleDateString('th-TH');

    printContainer.innerHTML = `
      <div class="print-official-doc p-4" style="font-family: 'Sarabun', 'TH Sarabun New', sans-serif; color: #000000; background: #ffffff;">
        <!-- Header -->
        <div class="text-center mb-4">
          <img src="../pacc_logo.png" alt="ตรา ป.ป.ท." style="width: 70px; height: auto;" class="mb-2">
          <h4 class="fw-bold mb-1" style="font-size: 1.35rem;">รายงานผลปฏิบัติงานประชุมคณะกรรมการ ป.ป.ท.</h4>
          <h5 class="fw-bold mb-1" style="font-size: 1.15rem;">${escapeHtml(monthLabel)}</h5>
          <p class="mb-0 text-muted" style="font-size: 0.95rem;">กลุ่มงานคำวินิจฉัยและมติคณะกรรมการ กองบริหารคดี สำนักงาน ป.ป.ท.</p>
        </div>

        <!-- Render Table -->
        <div id="printTableInjectArea"></div>

        <!-- Signatures / Footer for Government Approval -->
        <div class="row mt-5 pt-4 text-center" style="page-break-inside: avoid;">
          <div class="col-6">
            <div style="margin-bottom: 50px;">
              <span>ผู้จัดทำรายงาน</span>
            </div>
            <div>
              <strong>(นายธนกฤต บุญมี)</strong><br>
              <span>เจ้าหน้าที่กลุ่มงานคำวินิจฉัยและมติคณะกรรมการ</span><br>
              <span class="small text-muted">วันที่พิมพ์: ${todayThai}</span>
            </div>
          </div>
          <div class="col-6">
            <div style="margin-bottom: 50px;">
              <span>ผู้ตรวจรายงาน</span>
            </div>
            <div>
              <strong>(นางสาวณพัสตร์ ศรีสมเกียรติ)</strong><br>
              <span>ผู้อำนวยการกองบริหารคดี</span><br>
              <span class="small text-muted">สำนักงาน ป.ป.ท.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Table into print area
    renderReportTable('printTableInjectArea', dashData, { isPrintView: true });

    // Inject Print CSS if not already present
    injectPrintStyles();

    // Trigger Print
    setTimeout(() => {
      window.print();
    }, 250);
  }

  function injectPrintStyles() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById('ecmisPrintReportStyles')) return;
    const style = document.createElement('style');
    style.id = 'ecmisPrintReportStyles';
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #ecmisPrintReportArea, #ecmisPrintReportArea * {
          visibility: visible;
        }
        #ecmisPrintReportArea {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          display: block !important;
        }
        .no-print, .app-sidebar, .app-topbar, .btn, .modal, .stat-number-chip:hover {
          display: none !important;
        }
        .excel-report-wrapper {
          box-shadow: none !important;
          border: 1pt solid #000 !important;
        }
        .excel-stat-table th, .excel-stat-table td {
          border: 0.5pt solid #000 !important;
        }
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }
      }
      
      /* Interactive Chip Styles */
      .stat-number-chip {
        display: inline-block;
        min-width: 38px;
        padding: 2px 10px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.92rem;
        text-align: right;
        transition: all 0.15s ease-in-out;
        cursor: pointer;
        user-select: none;
      }
      .stat-chip-active {
        background-color: #EFF6FF;
        color: #0F2A62;
        border: 1px solid #BFDBFE;
      }
      .stat-chip-active:hover {
        background-color: #0F2A62;
        color: #FFFFFF;
        border-color: #0F2A62;
        transform: scale(1.08);
        box-shadow: 0 2px 8px rgba(15, 42, 98, 0.25);
      }
      .stat-chip-total {
        background-color: #0F2A62;
        color: #FFFFFF;
        border: 1px solid #0F2A62;
      }
      .stat-chip-total:hover {
        background-color: #D0A830;
        color: #0F2A62;
        border-color: #D0A830;
        transform: scale(1.08);
      }
      .stat-chip-zero {
        color: #94A3B8;
        background: transparent;
        border: 1px dashed #CBD5E1;
      }
      .stat-chip-zero:hover {
        background: #F1F5F9;
        color: #64748B;
      }
      .stat-chip-grand-total {
        cursor: pointer;
        padding: 3px 14px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid #FFD700;
        transition: all 0.2s ease;
      }
      .stat-chip-grand-total:hover {
        background: #FFD700;
        color: #0F2A62 !important;
        transform: scale(1.06);
      }

      /* ── Dark Mode Adaptations for Tables and Chips ── */
      body.dark-mode .excel-report-wrapper {
        background-color: #0d1422 !important;
        border-color: rgba(200, 169, 110, 0.25) !important;
      }
      body.dark-mode .excel-footer-note {
        background-color: #080f1f !important;
        color: #94a3b8 !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
      }
      body.dark-mode .stat-chip-active {
        background-color: rgba(99, 143, 255, 0.18) !important;
        color: #93b4ff !important;
        border-color: rgba(99, 143, 255, 0.35) !important;
      }
      body.dark-mode .stat-chip-active:hover {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
      }
      body.dark-mode .stat-chip-zero {
        color: #64748b !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
      }
      body.dark-mode .excel-data-row td {
        color: #e2e8f0;
      }
      body.dark-mode .excel-subtotal-row {
        background-color: rgba(255, 255, 255, 0.04) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Auto-inject styles on load
  injectPrintStyles();

  // --------------------------------------------------------------------------
  // 7. Public Microservice API
  // --------------------------------------------------------------------------
  const ServiceAPI = {
    version: '1.0.0-pacc-act7',
    EXCEL_COLORS,

    // Core Rendering
    renderReportTable,
    attachChipEvents,

    // Exporting
    exportToExcel,
    exportToCSV,
    exportModalTableToExcel,
    printReport,

    // Modal & Drilldown
    showDrilldownModal
  };

  return ServiceAPI;
});
