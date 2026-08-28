/**
 * ============================================================================
 * E-CMIS Dashboard Chart & Visualization Microservice
 * ============================================================================
 * Module: assets/dashboard-chart-service.js
 * Project: ระบบบริหารจัดการและติดตามสำนวนคดีการทุจริตและประพฤติมิชอบในภาครัฐ (E-CMIS)
 * Activity: กิจกรรมที่ 7 (ระบบมติคณะกรรมการ ป.ป.ท. / Board Resolution System)
 * 
 * Capabilities:
 *  1. renderPreliminaryDonut: สัดส่วนมติไต่สวนเบื้องต้น (รับไว้ไต่สวน, ไม่รับ, ส่ง ป.ป.ช., ไต่สวนเพิ่ม) โทนสีเขียว, เทา, แดง, เหลือง
 *  2. renderRulingDonut: สัดส่วนมติวินิจฉัยชี้มูล (ชี้มูลอาญา+วินัย, ชี้มูลอาญา, ชี้มูลวินัย, ตกไป, ส่ง ปปช., ม.25, ไต่สวนเพิ่ม, อื่นๆ) โทนสีทอง/ส้ม/แดง
 *  3. renderMonthlyTrendBar: กราฟแท่งเปรียบเทียบผลการพิจารณารายเดือน (Stacked / Grouped Bar)
 *  4. renderSubcommitteePerformance: สถิติมติแยกรายคณะอนุกรรมการกลั่นกรองที่ 1–8
 *  5. renderCategoryBreakdownRadar: เรดาร์ชาร์ตวิเคราะห์ประเภทมูลคดี / มิติเปรียบเทียบ
 *  6. Memory Management: Auto-destroy chart instances before re-render, prevention of canvas reuse error
 *  7. Custom Tooltip: แสดงจำนวนสำนวนคดี (เรื่อง) และคำนวณ % สัดส่วนอัตโนมัติ
 *  8. Center Text Donut Plugin: แสดงยอดรวมใจกลาง Donut Chart
 * 
 * Namespace: window.DashboardChartService & window.ECMIS.DashboardChartService
 * ============================================================================
 */

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['chart.js'], factory);
  } else if (typeof module === 'object' && module.exports) {
    let chartModule = null;
    try {
      chartModule = require('chart.js');
    } catch (e) {
      chartModule = root.Chart || (typeof global !== 'undefined' ? global.Chart : undefined);
    }
    const service = factory(chartModule);
    module.exports = service;
    if (typeof root !== 'undefined') {
      root.DashboardChartService = service;
      if (root.ECMIS) {
        root.ECMIS.DashboardChartService = service;
      }
    }
  } else {
    const service = factory(root.Chart);
    root.DashboardChartService = service;
    if (root.ECMIS) {
      root.ECMIS.DashboardChartService = service;
    }
  }
})(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : this), function (Chart) {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Color Palette & Design Tokens (E-CMIS Theme Standards)
  // --------------------------------------------------------------------------
  const PALETTE = {
    navy: '#0F2A62',
    navyDark: '#0A2647',
    navyLight: '#1E3A8A',
    brandBlue: '#0E91BC',
    skyBlue: '#16B6E6',
    gold: '#D0A830',
    goldLight: '#E6C765',
    goldDark: '#B38E22',
    emerald: '#1FB65E',
    greenDark: '#166434',
    greenLight: '#86EFAC',
    crimson: '#DB2626',
    crimsonDark: '#991A1A',
    crimsonLight: '#FCA5A5',
    amber: '#DD8C0A',
    amberDark: '#B45309',
    amberLight: '#FCD34D',
    slate: '#64748B',
    slateLight: '#94A3B8',
    slateDark: '#334155',
    purple: '#7C3AED',
    purpleLight: '#A78BFA',
    indigo: '#4F46E5',
    surface: '#FFFFFF',
    backgroundSubtle: '#EDF2FB',
    border: '#D4DDEB',
    textPrimary: '#0F2A62',
    textMuted: '#64748B'
  };

  // Font family priority matching E-CMIS Design System
  const FONT_FAMILY = "'Sarabun', 'Prompt', 'Noto Sans Thai', sans-serif";

  // Internal registry for tracking chart instances by canvas ID / element
  const chartRegistry = new Map();

  // --------------------------------------------------------------------------
  // 2. Helper & Utility Functions
  // --------------------------------------------------------------------------

  /**
   * Resolve Canvas Element safely from ID or Element
   * @param {string|HTMLCanvasElement} canvasTarget 
   * @returns {HTMLCanvasElement|null}
   */
  function resolveCanvas(canvasTarget) {
    if (!canvasTarget) return null;
    if (typeof canvasTarget === 'string') {
      return document.getElementById(canvasTarget);
    }
    if (typeof HTMLCanvasElement !== 'undefined' && canvasTarget instanceof HTMLCanvasElement) {
      return canvasTarget;
    }
    if (typeof canvasTarget === 'object' && canvasTarget.getContext) {
      return canvasTarget;
    }
    return null;
  }

  /**
   * Format number with Thai comma separators
   * @param {number} num 
   * @returns {string}
   */
  function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('th-TH');
  }

  /**
   * Calculate percentage formatted string
   * @param {number} val 
   * @param {number} total 
   * @returns {string}
   */
  function formatPercentage(val, total) {
    if (!total || total <= 0) return '0.0%';
    const pct = (val / total) * 100;
    return pct % 1 === 0 ? pct.toFixed(0) + '%' : pct.toFixed(1) + '%';
  }

  /**
   * Safely destroy previous chart on canvas to prevent memory leak & canvas reuse error
   * @param {string|HTMLCanvasElement} canvasTarget 
   */
  function destroyChart(canvasTarget) {
    const canvas = resolveCanvas(canvasTarget);
    if (!canvas) return;

    // 1. Check native Chart.js instance registry (Chart.js v3/v4)
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
      const existing = Chart.getChart(canvas);
      if (existing) {
        existing.destroy();
      }
    }

    // 2. Check internal Map registry
    if (chartRegistry.has(canvas)) {
      const internalChart = chartRegistry.get(canvas);
      if (internalChart && typeof internalChart.destroy === 'function') {
        try { internalChart.destroy(); } catch (e) { /* ignore */ }
      }
      chartRegistry.delete(canvas);
    }
  }

  /**
   * Destroy all active chart instances managed by this service
   */
  function destroyAllCharts() {
    chartRegistry.forEach((chart) => {
      if (chart && typeof chart.destroy === 'function') {
        try { chart.destroy(); } catch (e) { /* ignore */ }
      }
    });
    chartRegistry.clear();
  }

  /**
   * Verify if Chart.js library is loaded
   * @returns {boolean}
   */
  function isChartJsAvailable() {
    if (typeof Chart === 'undefined' || !Chart) {
      console.error(
        '[DashboardChartService] Chart.js library is not loaded. Please include Chart.js (v3/v4) before using this service.'
      );
      return false;
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // 3. Custom Donut Center Text Plugin
  // --------------------------------------------------------------------------
  const centerTextPlugin = {
    id: 'ecmisCenterText',
    beforeDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const opts = chart.config.options?.plugins?.centerText;
      if (!opts || opts.display === false) return;

      const total = chart.data.datasets[0]?.data.reduce((a, b) => a + (Number(b) || 0), 0) || 0;
      const title = opts.title || 'รวมทั้งหมด';
      const unit = opts.unit || 'เรื่อง';
      const customValue = opts.value !== undefined ? opts.value : formatNumber(total);

      ctx.save();
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      // Label (Top small text)
      ctx.font = `500 ${opts.titleFontSize || 12}px ${FONT_FAMILY}`;
      ctx.fillStyle = opts.titleColor || PALETTE.textMuted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, centerX, centerY - 14);

      // Value (Big bold number)
      ctx.font = `700 ${opts.valueFontSize || 22}px ${FONT_FAMILY}`;
      ctx.fillStyle = opts.valueColor || PALETTE.textPrimary;
      ctx.fillText(customValue, centerX, centerY + 8);

      // Unit (Bottom text)
      ctx.font = `400 ${opts.unitFontSize || 11}px ${FONT_FAMILY}`;
      ctx.fillStyle = opts.unitColor || PALETTE.textMuted;
      ctx.fillText(unit, centerX, centerY + 26);

      ctx.restore();
    }
  };

  // --------------------------------------------------------------------------
  // 4. Default Tooltip Configuration
  // --------------------------------------------------------------------------
  function createDonutTooltipConfig() {
    return {
      enabled: true,
      backgroundColor: 'rgba(15, 42, 98, 0.94)',
      titleFont: { family: 'Sarabun', size: 13, weight: '600' },
      bodyFont: { family: 'Sarabun', size: 12, weight: '400' },
      padding: 10,
      cornerRadius: 6,
      boxPadding: 4,
      displayColors: true,
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = Number(context.raw) || 0;
          const dataset = context.dataset;
          const total = dataset.data.reduce((a, b) => a + (Number(b) || 0), 0);
          const pct = formatPercentage(value, total);
          return ` ${label}: ${formatNumber(value)} เรื่อง (${pct})`;
        }
      }
    };
  }

  function createBarTooltipConfig(unit = 'เรื่อง') {
    return {
      enabled: true,
      backgroundColor: 'rgba(15, 42, 98, 0.94)',
      titleFont: { family: 'Sarabun', size: 13, weight: '600' },
      bodyFont: { family: 'Sarabun', size: 12, weight: '400' },
      padding: 10,
      cornerRadius: 6,
      boxPadding: 4,
      displayColors: true,
      callbacks: {
        label: function (context) {
          const datasetLabel = context.dataset.label || '';
          const value = Number(context.raw) || 0;
          return ` ${datasetLabel}: ${formatNumber(value)} ${unit}`;
        },
        footer: function (tooltipItems) {
          if (!tooltipItems || tooltipItems.length <= 1) return '';
          let sum = 0;
          tooltipItems.forEach(item => {
            sum += Number(item.raw) || 0;
          });
          return `รวมทั้งหมด: ${formatNumber(sum)} ${unit}`;
        }
      }
    };
  }

  // --------------------------------------------------------------------------
  // 5. Core Chart Rendering Methods
  // --------------------------------------------------------------------------

  /**
   * 5.1 renderPreliminaryDonut
   * เรนเดอร์ Donut chart สัดส่วนมติไต่สวนเบื้องต้น
   * หมวดหมู่: รับไว้ไต่สวน (เขียว), ไม่รับไว้พิจารณา (เทา), ส่ง ป.ป.ช. (แดง), ไต่สวนเพิ่มเติม (เหลือง/ทอง)
   * 
   * @param {string|HTMLCanvasElement} canvasId 
   * @param {Object} [data] ข้อมูลมติไต่สวนเบื้องต้น
   * @param {Array<string>} [data.labels]
   * @param {Array<number>} [data.data]
   * @param {Array<string>} [data.colors]
   * @param {Object} [options] ตัวเลือกปรับแต่งเพิ่มเติม
   * @returns {Chart|null}
   */
  function renderPreliminaryDonut(canvasId, data = {}, options = {}) {
    if (!isChartJsAvailable()) return null;
    const canvas = resolveCanvas(canvasId);
    if (!canvas) {
      console.warn(`[DashboardChartService] Canvas not found: ${canvasId}`);
      return null;
    }

    destroyChart(canvas);

    // Default sample data matching Activity 7 AS-IS & TO-BE resolutions
    const defaultLabels = [
      'รับไว้ไต่สวนข้อเท็จจริง',
      'ไม่รับไว้พิจารณา (ยุติเรื่อง)',
      'ส่ง ป.ป.ช. ดำเนินการ',
      'แสวงหาข้อเท็จจริง/ไต่สวนเพิ่ม'
    ];
    const defaultValues = [142, 65, 28, 19];
    const defaultColors = [
      PALETTE.emerald,   // เขียว - รับไว้ไต่สวน
      PALETTE.slate,     // เทา - ไม่รับ
      PALETTE.crimson,   // แดง - ส่ง ป.ป.ช.
      PALETTE.amber      // เหลือง/ส้ม - ไต่สวนเพิ่ม
    ];

    const labels = data.labels && data.labels.length ? data.labels : defaultLabels;
    const values = data.data && data.data.length ? data.data : (data.values || defaultValues);
    const colors = data.colors && data.colors.length ? data.colors : defaultColors;

    const chartConfig = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: options.maintainAspectRatio !== undefined ? options.maintainAspectRatio : false,
        cutout: options.cutout || '68%',
        plugins: {
          legend: {
            display: options.showLegend !== undefined ? options.showLegend : true,
            position: options.legendPosition || 'bottom',
            labels: {
              font: { family: 'Sarabun', size: 12 },
              color: PALETTE.textPrimary,
              padding: 14,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: createDonutTooltipConfig(),
          centerText: {
            display: options.showCenterText !== undefined ? options.showCenterText : true,
            title: options.centerTitle || 'ไต่สวนเบื้องต้น',
            unit: options.centerUnit || 'เรื่อง'
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: options.animationDuration || 800
        },
        ...options.chartOptions
      },
      plugins: [centerTextPlugin]
    };

    const instance = new Chart(canvas, chartConfig);
    chartRegistry.set(canvas, instance);
    return instance;
  }

  /**
   * 5.2 renderRulingDonut
   * เรนเดอร์ Donut chart สัดส่วนมติวินิจฉัยชี้มูล
   * หมวดหมู่: ชี้มูลอาญา+วินัย, ชี้มูลอาญา, ชี้มูลวินัย, ตกไป/ไม่มีมูล, ส่ง ปปช. (ม.19(ข)(1)), ม.25 ส่งคืน, ไต่สวนเพิ่ม (ม.24 วรรคท้าย), อื่นๆ
   * โทนสี: ทอง / ส้ม / แดง / กรมท่า
   * 
   * @param {string|HTMLCanvasElement} canvasId 
   * @param {Object} [data]
   * @param {Object} [options]
   * @returns {Chart|null}
   */
  function renderRulingDonut(canvasId, data = {}, options = {}) {
    if (!isChartJsAvailable()) return null;
    const canvas = resolveCanvas(canvasId);
    if (!canvas) {
      console.warn(`[DashboardChartService] Canvas not found: ${canvasId}`);
      return null;
    }

    destroyChart(canvas);

    const defaultLabels = [
      'ชี้มูลอาญาและวินัย',
      'ชี้มูลอาญาอย่างเดียว',
      'ชี้มูลวินัยอย่างเดียว',
      'ข้อกล่าวหาตกไป (ไม่มีมูล)',
      'ส่ง ป.ป.ช. (ม.19 (ข)(1))',
      'ป.ป.ช. ส่งคืน (ม.25)',
      'ส่งไต่สวนเพิ่ม (ม.24 วรรคท้าย)',
      'ยุติเรื่อง / อื่นๆ'
    ];
    const defaultValues = [45, 32, 28, 54, 18, 12, 9, 7];
    const defaultColors = [
      PALETTE.crimsonDark, // แดงเข้ม - ชี้มูลอาญา+วินัย
      PALETTE.crimson,     // แดงสด - ชี้มูลอาญา
      PALETTE.gold,        // ทอง - ชี้มูลวินัย
      PALETTE.slate,       // เทา - ข้อกล่าวหาตกไป
      PALETTE.purple,      // ม่วง - ส่ง ปปช. ม.19
      PALETTE.brandBlue,   // ฟ้าเข้ม - ม.25 ปปช. ส่งคืน
      PALETTE.amber,       // ส้ม/เหลือง - ไต่สวนเพิ่ม ม.24
      PALETTE.slateLight   // เทาอ่อน - อื่นๆ
    ];

    const labels = data.labels && data.labels.length ? data.labels : defaultLabels;
    const values = data.data && data.data.length ? data.data : (data.values || defaultValues);
    const colors = data.colors && data.colors.length ? data.colors : defaultColors;

    const chartConfig = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: options.maintainAspectRatio !== undefined ? options.maintainAspectRatio : false,
        cutout: options.cutout || '68%',
        plugins: {
          legend: {
            display: options.showLegend !== undefined ? options.showLegend : true,
            position: options.legendPosition || 'bottom',
            labels: {
              font: { family: 'Sarabun', size: 11.5 },
              color: PALETTE.textPrimary,
              padding: 12,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: createDonutTooltipConfig(),
          centerText: {
            display: options.showCenterText !== undefined ? options.showCenterText : true,
            title: options.centerTitle || 'วินิจฉัยชี้มูล',
            unit: options.centerUnit || 'เรื่อง'
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: options.animationDuration || 800
        },
        ...options.chartOptions
      },
      plugins: [centerTextPlugin]
    };

    const instance = new Chart(canvas, chartConfig);
    chartRegistry.set(canvas, instance);
    return instance;
  }

  /**
   * 5.3 renderMonthlyTrendBar
   * เรนเดอร์ Stacked / Grouped Bar chart เปรียบเทียบผลการพิจารณารายเดือน
   * (ไต่สวนเบื้องต้น vs วินิจฉัยชี้มูล vs เรื่องทั่วไป/ติดตามผล)
   * 
   * @param {string|HTMLCanvasElement} canvasId 
   * @param {Object} [monthlyTrendData]
   * @param {Array<string>} [monthlyTrendData.months]
   * @param {Array<Object>} [monthlyTrendData.datasets]
   * @param {Object} [options]
   * @returns {Chart|null}
   */
  function renderMonthlyTrendBar(canvasId, monthlyTrendData = {}, options = {}) {
    if (!isChartJsAvailable()) return null;
    const canvas = resolveCanvas(canvasId);
    if (!canvas) {
      console.warn(`[DashboardChartService] Canvas not found: ${canvasId}`);
      return null;
    }

    destroyChart(canvas);

    // Default 12 Fiscal Months (ต.ค. - ก.ย. ปีงบประมาณ)
    const defaultMonths = [
      'ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.',
      'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'
    ];

    const months = monthlyTrendData.months || monthlyTrendData.labels || defaultMonths;
    const isStacked = options.stacked !== undefined ? options.stacked : true;

    // Default series datasets
    const defaultDatasets = [
      {
        label: 'มติไต่สวนเบื้องต้น',
        data: [24, 28, 30, 35, 42, 38, 29, 31, 36, 40, 45, 33],
        backgroundColor: PALETTE.navy,
        borderRadius: isStacked ? 0 : 4,
        stack: isStacked ? 'resolutionStack' : undefined
      },
      {
        label: 'มติวินิจฉัยชี้มูล',
        data: [15, 18, 22, 20, 25, 27, 21, 24, 26, 30, 28, 25],
        backgroundColor: PALETTE.gold,
        borderRadius: isStacked ? 0 : 4,
        stack: isStacked ? 'resolutionStack' : undefined
      },
      {
        label: 'ยุติเรื่อง / ส่งต่อ ป.ป.ช.',
        data: [8, 10, 7, 12, 11, 9, 14, 8, 10, 13, 12, 11],
        backgroundColor: PALETTE.slate,
        borderRadius: isStacked ? 4 : 4, // Top cap on stack
        stack: isStacked ? 'resolutionStack' : undefined
      }
    ];

    const datasets = (monthlyTrendData.datasets && monthlyTrendData.datasets.length)
      ? monthlyTrendData.datasets.map(ds => ({
          ...ds,
          stack: isStacked ? (ds.stack || 'resolutionStack') : undefined,
          borderRadius: ds.borderRadius !== undefined ? ds.borderRadius : 4
        }))
      : defaultDatasets;

    const chartConfig = {
      type: 'bar',
      data: {
        labels: months,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: options.maintainAspectRatio !== undefined ? options.maintainAspectRatio : false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: options.showLegend !== undefined ? options.showLegend : true,
            position: options.legendPosition || 'top',
            align: 'end',
            labels: {
              font: { family: 'Sarabun', size: 12 },
              color: PALETTE.textPrimary,
              usePointStyle: true,
              pointStyle: 'rectRounded',
              padding: 16
            }
          },
          tooltip: createBarTooltipConfig(options.unit || 'เรื่อง')
        },
        scales: {
          x: {
            stacked: isStacked,
            grid: {
              display: false
            },
            ticks: {
              font: { family: 'Sarabun', size: 12 },
              color: PALETTE.textPrimary
            }
          },
          y: {
            stacked: isStacked,
            beginAtZero: true,
            grid: {
              color: 'rgba(212, 221, 235, 0.6)',
              drawBorder: false
            },
            ticks: {
              font: { family: 'Sarabun', size: 12 },
              color: PALETTE.textMuted,
              callback: function (val) {
                return formatNumber(val);
              }
            },
            title: {
              display: !!options.yTitle,
              text: options.yTitle || 'จำนวนเรื่อง',
              font: { family: 'Sarabun', size: 12, weight: '500' },
              color: PALETTE.textMuted
            }
          }
        },
        animation: {
          duration: options.animationDuration || 800
        },
        ...options.chartOptions
      }
    };

    const instance = new Chart(canvas, chartConfig);
    chartRegistry.set(canvas, instance);
    return instance;
  }

  /**
   * 5.4 renderSubcommitteePerformance
   * เรนเดอร์สถิติมติแยกรายคณะอนุกรรมการกลั่นกรองที่ 1–8
   * (พิจารณาแล้วเสร็จ vs อยู่ระหว่างพิจารณา vs ส่งกลับแก้ไข)
   * 
   * @param {string|HTMLCanvasElement} canvasId 
   * @param {Object} [data]
   * @param {Object} [options]
   * @returns {Chart|null}
   */
  function renderSubcommitteePerformance(canvasId, data = {}, options = {}) {
    if (!isChartJsAvailable()) return null;
    const canvas = resolveCanvas(canvasId);
    if (!canvas) {
      console.warn(`[DashboardChartService] Canvas not found: ${canvasId}`);
      return null;
    }

    destroyChart(canvas);

    const defaultSubcommittees = [
      'อนุกรรมการ 1 (ส่วนกลาง/กทม.)',
      'อนุกรรมการ 2 (ภาค 1)',
      'อนุกรรมการ 3 (ภาค 2)',
      'อนุกรรมการ 4 (ภาค 3)',
      'อนุกรรมการ 5 (ภาค 4)',
      'อนุกรรมการ 6 (ภาค 5)',
      'อนุกรรมการ 7 (ภาค 6-7)',
      'อนุกรรมการ 8 (ภาค 8-9)'
    ];

    const labels = data.labels || data.subcommittees || defaultSubcommittees;
    const isHorizontal = options.horizontal !== undefined ? options.horizontal : true;

    const defaultDatasets = [
      {
        label: 'พิจารณาแล้วเสร็จ (ส่ง กก.)',
        data: [42, 38, 35, 31, 29, 34, 27, 30],
        backgroundColor: PALETTE.emerald,
        borderRadius: 4
      },
      {
        label: 'อยู่ระหว่างกลั่นกรอง',
        data: [12, 15, 9, 14, 11, 8, 13, 10],
        backgroundColor: PALETTE.brandBlue,
        borderRadius: 4
      },
      {
        label: 'ส่งกลับแสวงหา/ไต่สวนเพิ่ม',
        data: [4, 6, 3, 5, 2, 4, 5, 3],
        backgroundColor: PALETTE.amber,
        borderRadius: 4
      }
    ];

    const datasets = data.datasets || defaultDatasets;

    const chartConfig = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        indexAxis: isHorizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: options.maintainAspectRatio !== undefined ? options.maintainAspectRatio : false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: options.showLegend !== undefined ? options.showLegend : true,
            position: options.legendPosition || 'top',
            align: 'end',
            labels: {
              font: { family: 'Sarabun', size: 12 },
              color: PALETTE.textPrimary,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 14
            }
          },
          tooltip: createBarTooltipConfig('เรื่อง')
        },
        scales: {
          x: {
            stacked: options.stacked || false,
            grid: {
              color: 'rgba(212, 221, 235, 0.5)',
              drawBorder: false
            },
            ticks: {
              font: { family: 'Sarabun', size: 12 },
              color: PALETTE.textPrimary,
              callback: function (val) {
                return formatNumber(val);
              }
            }
          },
          y: {
            stacked: options.stacked || false,
            grid: {
              display: !isHorizontal
            },
            ticks: {
              font: { family: 'Sarabun', size: 11.5 },
              color: PALETTE.textPrimary
            }
          }
        },
        animation: {
          duration: options.animationDuration || 800
        },
        ...options.chartOptions
      }
    };

    const instance = new Chart(canvas, chartConfig);
    chartRegistry.set(canvas, instance);
    return instance;
  }

  /**
   * 5.5 renderCategoryBreakdownRadar
   * เรนเดอร์ Radar chart สัดส่วนประเภทมูลคดี / ประสิทธิภาพการพิจารณา
   * (จัดซื้อจัดจ้าง, ประพฤติมิชอบ, เรียกรับทรัพย์สิน, ปฏิบัติหน้าที่โดยมิชอบ, ทรัพยากรธรรมชาติ, การเงินและบัญชี)
   * 
   * @param {string|HTMLCanvasElement} canvasId 
   * @param {Object} [data]
   * @param {Object} [options]
   * @returns {Chart|null}
   */
  function renderCategoryBreakdownRadar(canvasId, data = {}, options = {}) {
    if (!isChartJsAvailable()) return null;
    const canvas = resolveCanvas(canvasId);
    if (!canvas) {
      console.warn(`[DashboardChartService] Canvas not found: ${canvasId}`);
      return null;
    }

    destroyChart(canvas);

    const defaultCategories = [
      'จัดซื้อจัดจ้าง',
      'เรียกรับทรัพย์สิน/สินบน',
      'ปฏิบัติหน้าที่โดยมิชอบ',
      'การเงิน งบประมาณ และพัสดุ',
      'ทรัพยากรธรรมชาติ/ที่ดิน',
      'การบริหารงานบุคคล'
    ];

    const labels = data.labels || data.categories || defaultCategories;

    const defaultDatasets = [
      {
        label: 'ปีงบประมาณ 2569 (ปัจจุบัน)',
        data: [78, 45, 62, 54, 38, 29],
        backgroundColor: 'rgba(15, 42, 98, 0.2)',
        borderColor: PALETTE.navy,
        pointBackgroundColor: PALETTE.navy,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: PALETTE.navy,
        borderWidth: 2
      },
      {
        label: 'ปีงบประมาณ 2568 (ปีก่อน)',
        data: [65, 52, 50, 48, 30, 25],
        backgroundColor: 'rgba(208, 168, 48, 0.2)',
        borderColor: PALETTE.gold,
        pointBackgroundColor: PALETTE.gold,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: PALETTE.gold,
        borderWidth: 2
      }
    ];

    const datasets = data.datasets || defaultDatasets;

    const chartConfig = {
      type: 'radar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: options.maintainAspectRatio !== undefined ? options.maintainAspectRatio : false,
        plugins: {
          legend: {
            display: options.showLegend !== undefined ? options.showLegend : true,
            position: options.legendPosition || 'top',
            labels: {
              font: { family: 'Sarabun', size: 12 },
              color: PALETTE.textPrimary,
              usePointStyle: true,
              padding: 12
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(15, 42, 98, 0.94)',
            titleFont: { family: 'Sarabun', size: 13, weight: '600' },
            bodyFont: { family: 'Sarabun', size: 12 },
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: function (ctx) {
                return ` ${ctx.dataset.label}: ${formatNumber(ctx.raw)} เรื่อง`;
              }
            }
          }
        },
        scales: {
          r: {
            angleLines: {
              color: 'rgba(212, 221, 235, 0.8)'
            },
            grid: {
              color: 'rgba(212, 221, 235, 0.6)'
            },
            pointLabels: {
              font: { family: 'Sarabun', size: 12, weight: '500' },
              color: PALETTE.textPrimary
            },
            ticks: {
              font: { family: 'Sarabun', size: 10 },
              color: PALETTE.textMuted,
              backdropColor: 'transparent'
            }
          }
        },
        animation: {
          duration: options.animationDuration || 800
        },
        ...options.chartOptions
      }
    };

    const instance = new Chart(canvas, chartConfig);
    chartRegistry.set(canvas, instance);
    return instance;
  }

  // --------------------------------------------------------------------------
  // 6. Utility Functions for Lifecycle & Export
  // --------------------------------------------------------------------------

  /**
   * Get Chart.js instance by canvas ID or element
   * @param {string|HTMLCanvasElement} canvasTarget 
   * @returns {Chart|null}
   */
  function getChart(canvasTarget) {
    const canvas = resolveCanvas(canvasTarget);
    if (!canvas) return null;
    if (chartRegistry.has(canvas)) {
      return chartRegistry.get(canvas);
    }
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
      return Chart.getChart(canvas);
    }
    return null;
  }

  /**
   * Update data of an existing chart seamlessly
   * @param {string|HTMLCanvasElement} canvasTarget 
   * @param {Object} newData 
   * @param {string} [animationMode='default']
   */
  function updateChartData(canvasTarget, newData = {}, animationMode = 'default') {
    const chart = getChart(canvasTarget);
    if (!chart) {
      console.warn(`[DashboardChartService] Chart not found to update: ${canvasTarget}`);
      return false;
    }

    if (newData.labels) {
      chart.data.labels = newData.labels;
    }
    if (newData.data && chart.data.datasets[0]) {
      chart.data.datasets[0].data = newData.data;
    }
    if (newData.datasets) {
      chart.data.datasets = newData.datasets;
    }

    chart.update(animationMode);
    return true;
  }

  /**
   * Export chart canvas as PNG image data URL or download
   * @param {string|HTMLCanvasElement} canvasTarget 
   * @param {string} [fileName] ถ้าใส่จะดาวน์โหลดไฟล์อัตโนมัติ
   * @returns {string|null} Data URL
   */
  function exportChartImage(canvasTarget, fileName) {
    const canvas = resolveCanvas(canvasTarget);
    if (!canvas) return null;
    const dataUrl = canvas.toDataURL('image/png');
    if (fileName) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    return dataUrl;
  }

  // --------------------------------------------------------------------------
  // 7. Public Service API & Global Export
  // --------------------------------------------------------------------------
  const ServiceAPI = {
    // Version & Metadata
    version: '1.0.0-act7',
    PALETTE: Object.freeze(PALETTE),

    // Core Visualizations
    renderPreliminaryDonut,
    renderRulingDonut,
    renderMonthlyTrendBar,
    renderSubcommitteePerformance,
    renderCategoryBreakdownRadar,

    // Lifecycle & Instance Management
    destroy: destroyChart,
    destroyChart: destroyChart,
    destroyAll: destroyAllCharts,
    destroyAllCharts: destroyAllCharts,
    getChart,
    updateChartData,
    exportChartImage,

    // Utilities
    formatNumber,
    formatPercentage,
    isChartJsAvailable
  };

  return ServiceAPI;
});
