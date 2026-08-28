// Default to dark theme if user has not saved a preference
if (!localStorage.getItem("dashTheme")) {
    localStorage.setItem("dashTheme", "dark");
}

window._analyticsCharts = {};

// Defined early so it's always available regardless of partial load
window.initTrendChart = function (canvasId, labels, thisYearData, lastYearData, isDark) {
    if (window._analyticsCharts[canvasId]) {
        window._analyticsCharts[canvasId].destroy();
        delete window._analyticsCharts[canvasId];
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    isDark = isDark !== false;
    const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,27,62,0.07)';
    const tickColor  = isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(13,27,62,0.5)';
    const tooltipBg  = isDark ? 'rgba(8,12,28,0.95)'     : 'rgba(255,255,255,0.97)';
    const tooltipTxt = isDark ? '#fff'                    : '#1a3575';

    // กำหนดลูกเล่นพิเศษสำหรับกราฟเปรียบเทียบในหน้า V6
    const isV6Compare = canvasId === 'chartCompareV6';
    const primaryLineColor = isV6Compare ? '#06b6d4' : '#6366f1'; // ฟ้านีออนสำหรับ V6
    const secondaryLineColor = isV6Compare ? '#a855f7' : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'); // ม่วงเรืองแสงสำหรับ V6
    const primaryBgFill = isV6Compare ? 'rgba(6, 182, 212, 0.12)' : 'rgba(99,102,241,0.08)';

    window._analyticsCharts[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: isV6Compare ? 'ข้อมูลปัจจุบัน (สะสม)' : 'ปีนี้',
                    data: thisYearData,
                    borderColor: primaryLineColor,
                    backgroundColor: primaryBgFill,
                    fill: true,
                    tension: 0.35,
                    borderWidth: isV6Compare ? 2.5 : 2,
                    pointRadius: isV6Compare ? 4 : 3,
                    pointBackgroundColor: primaryLineColor,
                    pointHoverRadius: 6,
                    shadowColor: isV6Compare ? 'rgba(6, 182, 212, 0.5)' : 'transparent',
                    shadowBlur: isV6Compare ? 10 : 0
                },
                {
                    label: isV6Compare ? 'ข้อมูลย้อนหลัง (เป้าหมาย)' : 'ปีที่แล้ว',
                    data: lastYearData,
                    borderColor: secondaryLineColor,
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.35,
                    borderWidth: isV6Compare ? 1.8 : 1.5,
                    borderDash: [5, 4],
                    pointRadius: isV6Compare ? 3 : 2,
                    pointBackgroundColor: secondaryLineColor
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: tickColor, font: { family: 'Sarabun', size: 10 }, boxWidth: 20, padding: 10 }
                },
                tooltip: {
                    backgroundColor: tooltipBg,
                    titleColor: tooltipTxt,
                    bodyColor: tooltipTxt,
                    borderColor: 'rgba(128,128,128,0.2)',
                    borderWidth: 1
                }
            },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 10 } } },
                y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 10 } }, beginAtZero: true }
            }
        }
    });
};

/** Measure widest category label (px) for horizontal bar Y-axis reserve */
function _csiMaxLabelWidth(labels, fontSizePx) {
    if (!labels || !labels.length) return 72;
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = `600 ${fontSizePx}px Sarabun, sans-serif`;
    let max = 0;
    for (const lbl of labels) {
        const w = probe.measureText(String(lbl)).width;
        if (w > max) max = w;
    }
    return Math.ceil(max) + 24;
}

window.initAnalyticsChart = function (canvasId, type, labels, data, bgColors, isDark) {
    if (window._analyticsCharts[canvasId]) {
        window._analyticsCharts[canvasId].destroy();
        delete window._analyticsCharts[canvasId];
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    isDark = isDark !== false;
    const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,27,62,0.07)';
    const tickColor  = isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(13,27,62,0.5)';
    const tooltipBg  = isDark ? 'rgba(8,12,28,0.95)'     : 'rgba(255,255,255,0.97)';
    const tooltipTxt = isDark ? '#fff'                    : '#1a3575';

    const isHorizontal = type === 'bar-h';
    const chartType = isHorizontal ? 'bar' : type;

    const defaultColors = labels.map((_, i) => `hsl(${(i * 47 + 200) % 360},55%,${isDark ? 55 : 48}%)`);

    // ลูกเล่นช่องไฟของ Doughnut ใน V6 เพื่อความล้ำสมัย
    const isV6Intake = canvasId === 'chartIntakeV6';
    // หน้า 12.2 complaint-stats: csiChannel มีตารางข้อมูลเต็มอยู่ใต้กราฟแล้ว, csiLegal/csiBehavior เป็นโดนัทจิ๋วคู่กัน (180px) ไม่มีที่พอสำหรับ legend ข้าง — ใช้ hover tooltip แทน
    const hasOwnLegendElsewhere = ['csiChannel', 'csiLegal', 'csiBehavior'].includes(canvasId);
    const borderW = isV6Intake ? 3 : 0;
    const borderC = isV6Intake ? (isDark ? '#020617' : '#f1f5f9') : 'transparent'; // สีพื้นหลังอิงตามธีม

    const config = {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors && bgColors.length ? bgColors : defaultColors,
                borderColor: borderC,
                borderWidth: borderW,
                borderRadius: (type === 'bar' || isHorizontal) ? 4 : 0,
                hoverOffset: type === 'doughnut' ? (isV6Intake ? 8 : 6) : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: isHorizontal ? 'y' : 'x',
            plugins: {
                legend: {
                    display: type === 'doughnut' && !isV6Intake && !hasOwnLegendElsewhere, // ซ่อน Legend ดั้งเดิมของ Chart.js เพื่อใช้ custom HTML legend ของเราด้านข้างแทน
                    position: 'right',
                    labels: { color: tickColor, font: { family: 'Sarabun', size: 11 }, padding: 12, boxWidth: 12 }
                },
                tooltip: {
                    backgroundColor: tooltipBg,
                    titleColor: tooltipTxt,
                    bodyColor: tickColor,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,27,62,0.12)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: type === 'doughnut' ? {} : {
                x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 }, padding: 4 } },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 }, padding: isHorizontal ? 8 : 4 },
                    beginAtZero: true,
                    afterFit: isHorizontal ? function(scale) {
                        if (scale.width < 120) scale.width = 120;
                    } : undefined
                }
            },
            cutout: type === 'doughnut' ? '65%' : undefined
        }
    };

    // complaint-stats horizontal bars: dynamic Y-axis width from real label text
    function _applyCsiHorizontalLabels(fontSize) {
        const minW = _csiMaxLabelWidth(labels, fontSize);
        config.options.plugins.legend.display = false;
        config.options.layout = { padding: { left: 4, right: 16, top: 6, bottom: 6 } };
        config.options.scales.x.ticks.font = { family: 'Sarabun', size: 10 };
        config.options.scales.y.ticks = {
            color: tickColor,
            font: { family: 'Sarabun', size: fontSize, weight: '600' },
            autoSkip: false,
            padding: 8,
            crossAlign: 'far',
            align: 'end'
        };
        config.options.scales.y.afterFit = function (scale) {
            if (scale.width < minW) scale.width = minW;
        };
    }

    if (canvasId === 'csiIssue') {
        _applyCsiHorizontalLabels(10);
    }
    if (canvasId === 'csiAgency') {
        _applyCsiHorizontalLabels(11);
    }
    if (canvasId === 'csiDivision') {
        _applyCsiHorizontalLabels(10);
    }

    window._analyticsCharts[canvasId] = new Chart(canvas.getContext('2d'), config);
};

window.initCsiTrendBar = function (canvasId, labels, data, bgColors, isDark) {
    if (window._analyticsCharts[canvasId]) {
        window._analyticsCharts[canvasId].destroy();
        delete window._analyticsCharts[canvasId];
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    isDark = isDark !== false;
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,27,62,0.07)';
    const tickColor = isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(13,27,62,0.5)';
    const tooltipBg = isDark ? 'rgba(8,12,28,0.95)'     : 'rgba(255,255,255,0.97)';
    const tooltipTxt = isDark ? '#fff'                    : '#1a3575';

    window._analyticsCharts[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: bgColors && bgColors.length ? bgColors : '#6366f1',
                borderRadius: 3,
                barPercentage: 0.72,
                categoryPercentage: 0.82
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 10, bottom: 22, left: 6, right: 10 } },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: tooltipBg,
                    titleColor: tooltipTxt,
                    bodyColor: tooltipTxt,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,27,62,0.12)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        title: function (items) {
                            return items.length ? 'ปีงบประมาณ ' + items[0].label : '';
                        },
                        label: function (ctx) {
                            return ctx.parsed.y.toLocaleString('th-TH') + ' เรื่อง';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: tickColor,
                        font: { family: 'Sarabun', size: 9 },
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: false,
                        padding: 6,
                        callback: function (_val, idx) {
                            return idx % 2 === 0 ? labels[idx] : '';
                        }
                    }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: tickColor,
                        font: { family: 'Sarabun', size: 10 },
                        padding: 8,
                        maxTicksLimit: 8,
                        callback: function (v) { return v.toLocaleString('th-TH'); }
                    },
                    beginAtZero: true
                }
            }
        }
    });
};

window.initGroupedBarChart = function (canvasId, labels, datasets, isDark) {
    if (window._analyticsCharts[canvasId]) {
        window._analyticsCharts[canvasId].destroy();
        delete window._analyticsCharts[canvasId];
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    isDark = isDark !== false;
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,27,62,0.07)';
    const tickColor = isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(13,27,62,0.5)';
    const tooltipBg = isDark ? 'rgba(8,12,28,0.95)'     : 'rgba(255,255,255,0.97)';

    window._analyticsCharts[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: datasets.map(ds => ({ ...ds, borderRadius: 4 }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: canvasId === 'csiMonthly',
                    position: 'top',
                    labels: { color: tickColor, font: { family: 'Sarabun', size: 11 }, boxWidth: 12, padding: 10 }
                },
                tooltip: {
                    backgroundColor: tooltipBg,
                    titleColor: tickColor,
                    bodyColor: tickColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: canvasId === 'csiMonthly' ? {
                        footer: function (items) {
                            const sum = items.reduce((acc, item) => acc + item.parsed.y, 0);
                            return 'รวม ' + sum.toLocaleString('th-TH') + ' เรื่อง';
                        }
                    } : undefined
                }
            },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 }, padding: 8 } },
                y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 }, padding: 8 }, beginAtZero: true }
            }
        }
    });
};

window.destroyAllAnalyticsCharts = function () {
    Object.values(window._analyticsCharts).forEach(c => { try { c.destroy(); } catch (_) {} });
    window._analyticsCharts = {};
};

window._analyticsComponent = null;

window.registerAnalyticsComponent = function (dotNetRef) {
    window._analyticsComponent = dotNetRef;
};

window._warRoomClockTimer = window._warRoomClockTimer || null;

window.startWarRoomClock = function () {
    const el = document.getElementById('wrClock');
    if (!el) return;

    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
        const now = new Date();
        el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };

    tick();
    if (window._warRoomClockTimer) clearInterval(window._warRoomClockTimer);
    window._warRoomClockTimer = setInterval(tick, 1000);
};

window.stopWarRoomClock = function () {
    if (window._warRoomClockTimer) {
        clearInterval(window._warRoomClockTimer);
        window._warRoomClockTimer = null;
    }
};

// FR-021: multi-dataset line chart สำหรับเปรียบเทียบข้ามปีงบประมาณ
window.initMultiSeriesChart = function (canvasId, type, labels, datasets, isDark) {
    if (window._analyticsCharts[canvasId]) {
        window._analyticsCharts[canvasId].destroy();
        delete window._analyticsCharts[canvasId];
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    isDark = isDark !== false;
    const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,27,62,0.07)';
    const tickColor  = isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(13,27,62,0.5)';
    const tooltipBg  = isDark ? 'rgba(8,12,28,0.95)'     : 'rgba(255,255,255,0.97)';
    const tooltipTxt = isDark ? '#fff'                    : '#1a3575';

    const isBar = type === 'bar';
    const chart = new Chart(canvas.getContext('2d'), {
        type: type,
        data: {
            labels,
            datasets: datasets.map(d => isBar ? ({
                label: d.label,
                data: d.data,
                backgroundColor: d.color + 'cc',
                borderColor: d.color,
                borderWidth: 1,
                borderRadius: 4,
            }) : ({
                label: d.label,
                data: d.data,
                borderColor: d.color,
                backgroundColor: d.color + '22',
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2.5,
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: tickColor, font: { family: 'Sarabun', size: 11 }, padding: 14, boxWidth: 12 }
                },
                tooltip: {
                    backgroundColor: tooltipBg, titleColor: tooltipTxt,
                    bodyColor: tickColor, borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,27,62,0.12)',
                    padding: 10
                }
            },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 } } },
                y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 } }, beginAtZero: true }
            }
        }
    });
    window._analyticsCharts[canvasId] = chart;
};

window.reinitAnalyticsChartsIfNeeded = function (isDark) {
    window.destroyAllAnalyticsCharts();
    if (window._analyticsComponent) {
        window._analyticsComponent.invokeMethodAsync('OnThemeChangedAsync', isDark);
    }
};

window._thailandRiskMaps = window._thailandRiskMaps || {};

window.initThailandRiskMap3D = function (canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (window._thailandRiskMaps[canvasId]) {
        window._thailandRiskMaps[canvasId].resize();
        return;
    }

    const staticMode = new URLSearchParams(window.location.search).has("mapstatic");
    const state = {
        geojson: null,
        frame: 0,
        renderer: null,
        resize() {
            if (state.renderer) state.renderer.resize();
            else if (state.geojson) drawThailandGeoMap(canvas, state.geojson, state.frame);
        },
        dispose() {
            if (state.renderer) state.renderer.dispose();
        }
    };
    window._thailandRiskMaps[canvasId] = state;

    fetch("data/th-all.topo.json")
        .then(response => response.json())
        .then(mapData => {
            state.geojson = mapData;
            state.renderer = createThailandThreeMap(canvas, mapData);
            const resizeObserver = new ResizeObserver(() => state.resize());
            resizeObserver.observe(canvas);

            const renderFrame = () => {
                if (state.renderer) state.renderer.render(state.frame);
                else drawThailandGeoMap(canvas, mapData, state.frame);
            };

            if (staticMode) {
                state.frame = 0.84;
                state.resize();
                renderFrame();
                return;
            }

            const animate = () => {
                if (!document.body.contains(canvas)) {
                    resizeObserver.disconnect();
                    state.dispose();
                    delete window._thailandRiskMaps[canvasId];
                    return;
                }
                state.frame += 0.012;
                renderFrame();
                requestAnimationFrame(animate);
            };
            animate();
        })
        .catch(() => {
            drawThailandGeoMap(canvas, null, 0);
        });

    // ── Click handler: province detection → Blazor Modal ──
    if (!canvas.dataset.clickRegistered) {
        canvas.dataset.clickRegistered = "true";
        canvas.style.cursor = "pointer";
        canvas.addEventListener("click", function (e) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            let province = "กรุงเทพมหานคร";
            if (y < 0.38) province = "เชียงใหม่";
            else if (y > 0.65) province = "สงขลา";
            else if (x > 0.54 && y < 0.54) province = "นครราชสีมา";
            else if (x > 0.50 && y >= 0.54) province = "ชลบุรี";

            if (window._analyticsComponent) {
                window._analyticsComponent.invokeMethodAsync("ClickProvince", province);
            }
        });
    }
};

function createThailandThreeMap(canvas, geojson) {
    if (!window.THREE) return null;

    try {
        const THREE = window.THREE;
        const regions = extractGeoPolygons(geojson).filter(region => polygonArea(region.rings[0]) > 0.0002);
        if (!regions.length) return null;

        const bounds = getGeoBounds(regions);
        const centerLon = (bounds.minX + bounds.maxX) / 2;
        const centerLat = (bounds.minY + bounds.maxY) / 2;
        const mapScale = 12.2 / (bounds.maxY - bounds.minY);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const scene = new THREE.Scene();
        const mapGroup = new THREE.Group();
        scene.add(mapGroup);

        const project = ([lon, lat], z = 0) => new THREE.Vector3(
            (lon - centerLon) * mapScale,
            (lat - centerLat) * mapScale,
            z
        );

        regions.forEach(region => {
            const ring = region.rings[0];
            if (ring.length < 4) return;

            const shape = new THREE.Shape(ring.map(point => project(point, 0)));
            region.rings.slice(1).forEach(holeRing => {
                if (holeRing.length < 4) return;
                const hole = new THREE.Path(holeRing.map(point => project(point, 0)));
                shape.holes.push(hole);
            });

            const center = polygonCentroid(ring);
            const topColor = riskColorForPoint(center);
            const sideColor = shadeHexColor(topColor, -32);
            const geometry = new THREE.ExtrudeGeometry(shape, {
                depth: 0.22,
                bevelEnabled: true,
                bevelSize: 0.018,
                bevelThickness: 0.035,
                bevelSegments: 1
            });

            const mesh = new THREE.Mesh(geometry, [
                new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.72, metalness: 0.04 }),
                new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.9, metalness: 0.02 })
            ]);
            mapGroup.add(mesh);

            const outlinePoints = ring.map(point => project(point, 0.255));
            const outlineGeometry = new THREE.BufferGeometry().setFromPoints(outlinePoints);
            const outline = new THREE.LineLoop(outlineGeometry, new THREE.LineBasicMaterial({
                color: 0x101827,
                transparent: true,
                opacity: 0.7
            }));
            mapGroup.add(outline);
        });

        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        const key = new THREE.DirectionalLight(0xffffff, 1.65);
        key.position.set(-4, -7, 11);
        const rim = new THREE.DirectionalLight(0x93c5fd, 0.85);
        rim.position.set(6, 3, 8);
        scene.add(ambient, key, rim);

        const camera = new THREE.OrthographicCamera(-6, 6, 7.2, -7.2, 0.1, 100);
        camera.position.set(0, -6.3, 15);
        camera.lookAt(0, 0, 0);
        mapGroup.rotation.x = -0.47;
        mapGroup.rotation.z = -0.08;
        mapGroup.rotation.y = 0.18;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(rect.width, rect.height, false);
            const aspect = rect.width / Math.max(rect.height, 1);
            const viewHeight = 7.35;
            camera.top = viewHeight;
            camera.bottom = -viewHeight;
            camera.left = -viewHeight * aspect;
            camera.right = viewHeight * aspect;
            camera.updateProjectionMatrix();
        };

        resize();

        return {
            resize,
            render(frame) {
                mapGroup.rotation.z = -0.08 + Math.sin(frame * 0.8) * 0.012;
                mapGroup.rotation.y = 0.18 + Math.sin(frame * 0.55) * 0.018;
                renderer.render(scene, camera);
            },
            dispose() {
                mapGroup.traverse(node => {
                    if (node.geometry) node.geometry.dispose();
                    if (node.material) {
                        const materials = Array.isArray(node.material) ? node.material : [node.material];
                        materials.forEach(material => material.dispose());
                    }
                });
                renderer.dispose();
            }
        };
    } catch (_) {
        return null;
    }
}

function drawThailandGeoMap(canvas, geojson, frame) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const polygons = geojson ? extractGeoPolygons(geojson) : [];
    if (!polygons.length) return;

    const bounds = getGeoBounds(polygons);
    const padding = Math.min(rect.width, rect.height) * 0.09;
    const mapWidth = rect.width - padding * 2;
    const mapHeight = rect.height - padding * 2;
    const scale = Math.min(mapWidth / (bounds.maxX - bounds.minX), mapHeight / (bounds.maxY - bounds.minY));
    const offsetX = (rect.width - (bounds.maxX - bounds.minX) * scale) / 2;
    const offsetY = (rect.height - (bounds.maxY - bounds.minY) * scale) / 2;
    const tilt = Math.sin(frame) * 0.012;

    const project = ([lon, lat]) => [
        offsetX + (lon - bounds.minX) * scale + (lat - bounds.minY) * scale * tilt,
        offsetY + (bounds.maxY - lat) * scale
    ];

    ctx.save();
    ctx.translate(0, 2 + Math.sin(frame * 0.8) * 1.5);

    for (let layer = 10; layer >= 1; layer--) {
        ctx.save();
        ctx.translate(layer * 1.6, layer * 1.7);
        ctx.fillStyle = layer > 6 ? "rgba(15,23,42,.34)" : "rgba(30,41,59,.52)";
        ctx.strokeStyle = "rgba(96,165,250,.05)";
        drawGeoPolygons(ctx, polygons, project, () => ctx.fill(), () => ctx.stroke());
        ctx.restore();
    }

    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 16;
    drawGeoPolygons(ctx, polygons, project, (polygon) => {
        const center = polygonCentroid(polygon.rings[0]);
        ctx.fillStyle = riskColorForPoint(center);
        ctx.fill();
    }, null);

    ctx.shadowColor = "transparent";
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "rgba(8,13,26,.82)";
    drawGeoPolygons(ctx, polygons, project, null, () => ctx.stroke());

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(203,213,225,.22)";
    drawGeoPolygons(ctx, polygons.filter(p => polygonArea(p.rings[0]) > 0.02), project, null, () => ctx.stroke());

    [
        [100.5, 13.75, "81%"],
        [98.98, 18.79, "72%"],
        [101.2, 12.68, "76%"],
        [99.85, 7.01, "83%"]
    ].forEach(([lon, lat, label]) => drawCanvasHotspot(ctx, project([lon, lat]), label));

    ctx.restore();
}

function extractGeoPolygons(geojson) {
    if (geojson.type === "Topology") {
        return extractTopoPolygons(geojson);
    }

    const features = geojson.type === "FeatureCollection"
        ? geojson.features
        : [{ geometry: geojson.geometry || geojson, properties: geojson.properties || {} }];
    const regions = [];

    features.forEach(feature => {
        const geometry = feature.geometry;
        if (!geometry) return;
        if (geometry.type === "Polygon") {
            regions.push({ rings: geometry.coordinates, properties: feature.properties || {} });
        }
        if (geometry.type === "MultiPolygon") {
            geometry.coordinates.forEach(rings => regions.push({ rings, properties: feature.properties || {} }));
        }
    });

    return regions;
}

function extractTopoPolygons(topology) {
    const object = topology.objects?.default || Object.values(topology.objects || {})[0];
    const geometries = object?.type === "GeometryCollection" ? object.geometries : [object].filter(Boolean);
    const regions = [];

    geometries.forEach(geometry => {
        if (geometry.type === "Polygon") {
            regions.push({ rings: topoPolygonToRings(topology, geometry.arcs), properties: geometry.properties || {} });
        }
        if (geometry.type === "MultiPolygon") {
            geometry.arcs.forEach(polygonArcs => {
                regions.push({ rings: topoPolygonToRings(topology, polygonArcs), properties: geometry.properties || {} });
            });
        }
    });

    return regions.filter(region => region.rings.length && region.rings[0].length > 3);
}

function topoPolygonToRings(topology, polygonArcs) {
    return polygonArcs.map(ringArcs => {
        const ring = [];
        ringArcs.forEach((arcIndex, arcPosition) => {
            const points = decodeTopoArc(topology, arcIndex);
            points.forEach((point, pointIndex) => {
                if (arcPosition > 0 && pointIndex === 0) return;
                ring.push(point);
            });
        });
        return ring;
    });
}

function decodeTopoArc(topology, arcIndex) {
    const shouldReverse = arcIndex < 0;
    const sourceArc = topology.arcs[shouldReverse ? ~arcIndex : arcIndex] || [];
    const transform = topology.transform || { scale: [1, 1], translate: [0, 0] };
    let x = 0;
    let y = 0;
    const points = sourceArc.map(([dx, dy]) => {
        x += dx;
        y += dy;
        return [
            x * transform.scale[0] + transform.translate[0],
            y * transform.scale[1] + transform.translate[1]
        ];
    });
    return shouldReverse ? points.reverse() : points;
}

function getGeoBounds(polygons) {
    const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    polygons.forEach(polygon => polygon.rings.forEach(ring => ring.forEach(([x, y]) => {
        bounds.minX = Math.min(bounds.minX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.maxY = Math.max(bounds.maxY, y);
    })));
    return bounds;
}

function drawGeoPolygons(ctx, polygons, project, fill, stroke) {
    polygons.forEach(polygon => {
        ctx.beginPath();
        polygon.rings.forEach(ring => {
            ring.forEach((point, index) => {
                const [x, y] = project(point);
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
        });
        if (fill) fill(polygon);
        if (stroke) stroke(polygon);
    });
}

function polygonCentroid(ring) {
    let x = 0;
    let y = 0;
    ring.forEach(point => {
        x += point[0];
        y += point[1];
    });
    return [x / ring.length, y / ring.length];
}

function polygonArea(ring) {
    let area = 0;
    for (let i = 0; i < ring.length; i++) {
        const current = ring[i];
        const next = ring[(i + 1) % ring.length];
        area += current[0] * next[1] - next[0] * current[1];
    }
    return Math.abs(area / 2);
}

function riskColorForPoint([lon, lat]) {
    if (lat > 18.6) return "#84cc16";
    if (lat > 16.4 && lon < 100.5) return "#eab308";
    if (lon > 101.05 && lat > 11.3) return "#f97316";
    if (lat < 8.9) return "#f97316";
    if (lon < 99.4 && lat < 15.7) return "#dc2626";
    if (lat > 13.2 && lat < 16.9) return "#facc15";
    return "#ef4444";
}

function shadeHexColor(hex, amount) {
    const value = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (value >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (value & 255) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function drawCanvasHotspot(ctx, [x, y], label) {
    ctx.save();
    ctx.font = "800 12px Sarabun, sans-serif";
    const width = ctx.measureText(label).width + 28;
    ctx.fillStyle = "rgba(15,23,42,.88)";
    ctx.strokeStyle = label === "81%" || label === "83%" ? "rgba(248,113,113,.72)" : "rgba(251,191,36,.72)";
    ctx.lineWidth = 1;
    roundRect(ctx, x - width / 2, y - 13, width, 26, 13);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(x - width / 2 + 12, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = label === "81%" || label === "83%" ? "#fca5a5" : "#fde68a";
    ctx.fillText(label, x - width / 2 + 21, y + 4);
    ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

window._v6WarningType = "all";

window.initV6WarningMap = function (canvasId, warningType) {
    window._v6WarningType = warningType || "all";
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    if (!window._thailandRiskMaps) window._thailandRiskMaps = {};
    
    // เคลียร์แอนิเมชันลูปเดิมเพื่อป้องกันการซ้อนทับกัน
    if (canvas._v6AnimId) {
        cancelAnimationFrame(canvas._v6AnimId);
        canvas._v6AnimId = null;
    }
    
    const state = {
        geojson: null,
        resize() {
            // จะถูกวาดใหม่ในเรนเดอร์ลูปโดยอัตโนมัติ
        }
    };
    window._thailandRiskMaps[canvasId] = state;
    
    fetch("data/th-all.topo.json")
        .then(response => response.json())
        .then(mapData => {
            state.geojson = mapData;
            
            // เริ่มต้นระบบเรนเดอร์ลูปของ V6 แบบ Dynamic
            const renderLoop = () => {
                const currentCanvas = document.getElementById(canvasId);
                // หากหน้าจอเปลี่ยนไปและไม่มี Canvas นี้ใน DOM แล้ว ให้ยกเลิกลูปทันที
                if (!currentCanvas) {
                    if (canvas._v6AnimId) cancelAnimationFrame(canvas._v6AnimId);
                    return;
                }
                
                if (state.geojson) {
                    drawThailandV6GeoMap(currentCanvas, state.geojson, Date.now() / 1000);
                }
                
                canvas._v6AnimId = requestAnimationFrame(renderLoop);
            };
            
            renderLoop();
        })
        .catch(() => {
            // fallback
        });
        
    if (!canvas.dataset.clickRegistered) {
        canvas.dataset.clickRegistered = "true";
        canvas.style.cursor = "pointer";
        canvas.addEventListener("click", function (e) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            let province = "กรุงเทพมหานคร";
            if (y < 0.38) province = "เชียงใหม่";
            else if (y > 0.65) province = "สงขลา";
            else if (x > 0.54 && y < 0.54) province = "นครราชสีมา";
            else if (x > 0.50 && y >= 0.54) province = "ชลบุรี";
            
            if (window._analyticsComponent) {
                window._analyticsComponent.invokeMethodAsync("ClickProvince", province);
            }
        });
    }
};

// ──────────────────────────────────────────────────────────────
//  CHOROPLETH HEATMAP — Province-level risk scores
//  columns: [lon, lat, all, road, procure, duty, license]
// ──────────────────────────────────────────────────────────────
const PROVINCE_HEAT_DATA = [
    [100.50, 13.75, 88, 72, 89, 90, 72], // กรุงเทพมหานคร
    [100.52, 13.86, 83, 66, 85, 83, 68], // นนทบุรี
    [100.60, 13.59, 80, 62, 79, 76, 66], // สมุทรปราการ
    [100.54, 14.01, 76, 58, 76, 72, 60], // ปทุมธานี
    [100.45, 13.40, 72, 55, 70, 68, 58], // สมุทรสาคร
    [100.56, 14.35, 77, 70, 75, 74, 63], // พระนครศรีอยุธยา
    [100.61, 14.80, 73, 65, 72, 70, 60], // สระบุรี
    [100.65, 14.80, 71, 62, 68, 65, 58], // ลพบุรี
    [100.91, 14.53, 73, 64, 70, 68, 61], // นครนายก
    [100.08, 14.35, 70, 60, 68, 66, 55], // สุพรรณบุรี
    [99.94, 13.11, 66, 55, 62, 62, 57], // เพชรบุรี
    [99.82, 12.56, 64, 52, 60, 60, 54], // ประจวบคีรีขันธ์
    [100.10, 15.70, 74, 68, 72, 70, 60], // นครสวรรค์
    [100.90, 15.70, 72, 70, 70, 72, 60], // เพชรบูรณ์
    [100.40, 16.82, 70, 68, 68, 68, 58], // พิษณุโลก
    [100.20, 17.30, 67, 60, 65, 64, 55], // อุตรดิตถ์
    [99.65, 17.52, 65, 45, 66, 60, 50], // ลำปาง
    [98.98, 18.79, 70, 45, 80, 60, 50], // เชียงใหม่
    [99.83, 19.91, 65, 42, 75, 57, 45], // เชียงราย
    [100.55, 19.28, 63, 40, 70, 56, 44], // พะเยา
    [101.10, 19.65, 61, 38, 68, 54, 42], // น่าน
    [99.90, 17.00, 66, 52, 64, 62, 54], // แพร่
    [98.57, 18.30, 60, 38, 62, 55, 44], // แม่ฮ่องสอน
    [99.50, 16.48, 68, 60, 65, 64, 55], // กำแพงเพชร
    [99.80, 16.80, 67, 58, 64, 62, 54], // สุโขทัย
    [100.25, 16.30, 70, 64, 68, 67, 58], // พิจิตร
    [102.10, 14.97, 85, 90, 80, 78, 70], // นครราชสีมา
    [102.83, 16.43, 80, 85, 72, 76, 65], // ขอนแก่น
    [103.50, 16.50, 73, 76, 68, 71, 58], // ร้อยเอ็ด
    [103.10, 17.50, 70, 76, 65, 68, 55], // สกลนคร
    [104.85, 15.24, 68, 72, 62, 65, 52], // อุบลราชธานี
    [102.10, 16.80, 72, 78, 68, 70, 58], // กาฬสินธุ์
    [103.75, 18.12, 68, 70, 63, 65, 52], // นครพนม
    [102.10, 17.90, 70, 74, 65, 67, 54], // อุดรธานี
    [102.79, 17.41, 72, 78, 65, 68, 57], // หนองคาย
    [100.20, 15.20, 71, 65, 68, 68, 57], // ชัยนาท
    [101.15, 16.00, 74, 72, 70, 72, 60], // ชัยภูมิ
    [103.10, 14.87, 70, 68, 65, 66, 56], // บุรีรัมย์
    [103.50, 14.88, 69, 66, 64, 65, 54], // สุรินทร์
    [104.00, 15.10, 67, 64, 62, 63, 52], // ศรีสะเกษ
    [100.98, 13.36, 92, 68, 88, 82, 95], // ชลบุรี
    [101.52, 12.68, 78, 60, 75, 70, 88], // ระยอง
    [101.80, 12.60, 74, 56, 70, 66, 82], // จันทบุรี
    [102.50, 12.28, 70, 52, 66, 62, 76], // ตราด
    [101.00, 13.20, 75, 60, 72, 70, 80], // ฉะเชิงเทรา
    [101.30, 13.70, 73, 58, 70, 68, 76], // ปราจีนบุรี
    [101.50, 14.20, 69, 55, 66, 64, 70], // สระแก้ว
    [100.59, 7.19, 76, 62, 68, 72, 65], // สงขลา
    [99.33, 9.14, 68, 55, 62, 65, 60], // สุราษฎร์ธานี
    [98.40, 7.89, 72, 50, 65, 68, 82], // ภูเก็ต
    [100.00, 8.43, 70, 58, 65, 70, 62], // นครศรีธรรมราช
    [99.52, 8.10, 65, 50, 60, 62, 58], // กระบี่
    [99.60, 7.60, 62, 46, 56, 58, 55], // ตรัง
    [99.90, 6.62, 60, 44, 54, 56, 52], // พัทลุง
    [101.30, 6.43, 63, 48, 58, 60, 54], // ปัตตานี
    [101.82, 6.13, 62, 46, 56, 58, 52], // ยะลา
    [101.98, 6.42, 61, 44, 54, 56, 50], // นราธิวาส
    [98.30, 9.20, 63, 48, 58, 60, 55], // ชุมพร
    [98.55, 10.45, 61, 45, 56, 58, 52], // ระนอง
    [99.15, 9.58, 64, 50, 60, 62, 56], // พังงา
    [100.05, 7.53, 62, 46, 57, 58, 54], // สตูล
    [100.62, 6.97, 65, 52, 60, 62, 58], // สงขลา ใต้
];

function scoreToHeatColor(score, alpha) {
    alpha = alpha || 0.82;
    const s = Math.max(0, Math.min(100, score));
    let r, g, b;
    if (s < 50) {
        // เขียว → เหลือง: #10b981 → #facc15
        const t = s / 50;
        r = Math.round(16  + (250 - 16)  * t);
        g = Math.round(185 + (204 - 185) * t);
        b = Math.round(129 + (21  - 129) * t);
    } else if (s < 72) {
        // เหลือง → ส้ม: #facc15 → #f97316
        const t = (s - 50) / 22;
        r = Math.round(250 + (249 - 250) * t);
        g = Math.round(204 + (115 - 204) * t);
        b = Math.round(21  + (22  - 21)  * t);
    } else {
        // ส้ม → แดง: #f97316 → #ef4444
        const t = Math.min((s - 72) / 28, 1);
        r = Math.round(249 + (239 - 249) * t);
        g = Math.round(115 + (68  - 115) * t);
        b = Math.round(22  + (68  - 22)  * t);
    }
    return `rgba(${r},${g},${b},${alpha})`;
}

function getProvinceHeatColor([lon, lat], type) {
    const typeIdx = { all: 2, road: 3, procure: 4, duty: 5, license: 6 }[type] || 2;
    let bestDist = Infinity, bestScore = 62;
    PROVINCE_HEAT_DATA.forEach(entry => {
        const dist = Math.hypot(lon - entry[0], lat - entry[1]);
        if (dist < bestDist) { bestDist = dist; bestScore = entry[typeIdx]; }
    });
    const isLight = document.querySelector('.cs-shell')?.classList.contains('app-light') || document.querySelector('.app-light');
    return scoreToHeatColor(bestScore, isLight ? 0.72 : 0.85);
}

function drawCanvasHotspotV6(ctx, [x, y], label, time) {
    ctx.save();
    
    // ตรวจจับคลาสธีมสว่าง
    const isLight = document.querySelector('.cs-shell')?.classList.contains('app-light') || document.querySelector('.app-light');
    
    // สีของจุดตามธีม (กรมท่า สลับทองพรีเมียม)
    const mainColor = isLight ? "#0f2d5e" : "#c8a96e"; // โหมดสว่างใช้สีกรมท่า โหมดมืดใช้สีทองพรีเมียม
    
    // วาดรัศมีคลื่นแผ่เรืองแสงแบบเรียบหรู (Subtle Elegant Wave)
    const progress = ((time || 0) * 0.4) % 1;
    const radius = 5 + progress * 16;
    const opacity = (1 - progress) * 0.45;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 1;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.stroke();
    ctx.restore();
    
    // จุดแกนกลาง 2D คมกริบ
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = mainColor;
    ctx.fill();
    
    // ป้ายบอกสถิติแบบ 2D Classic
    ctx.font = "bold 9.5px Sarabun, sans-serif";
    const textWidth = ctx.measureText(label).width;
    const paddingX = 6;
    const paddingY = 3.5;
    const boxW = textWidth + paddingX * 2;
    const boxH = 15;
    const boxX = x - boxW / 2;
    const boxY = y - 21;
    
    // พื้นหลังกล่องตามธีมราชการสุภาพ
    ctx.fillStyle = isLight ? "#ffffff" : "#12183c";
    ctx.strokeStyle = isLight ? "#c2d0e8" : "rgba(200, 169, 110, 0.4)";
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    roundRect(ctx, boxX, boxY, boxW, boxH, 3);
    ctx.fill();
    ctx.stroke();
    
    // ลูกศรชี้ตำแหน่ง
    ctx.beginPath();
    ctx.moveTo(x - 2.5, boxY + boxH);
    ctx.lineTo(x + 2.5, boxY + boxH);
    ctx.lineTo(x, boxY + boxH + 2.5);
    ctx.closePath();
    ctx.fillStyle = isLight ? "#c2d0e8" : "rgba(200, 169, 110, 0.4)";
    ctx.fill();
    
    // ตัวหนังสือสถิติ
    ctx.fillStyle = isLight ? "#0f2d5e" : "#f8fafc";
    ctx.fillText(label, boxX + paddingX, boxY + 10.5);
    
    ctx.restore();
}

function drawThailandV6GeoMap(canvas, geojson, frame) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ตรวจจับคลาสธีมสว่าง
    const isLight = document.querySelector('.cs-shell')?.classList.contains('app-light') || document.querySelector('.app-light');

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const polygons = geojson ? extractGeoPolygons(geojson) : [];
    if (!polygons.length) return;

    const bounds = getGeoBounds(polygons);
    const padding = Math.min(rect.width, rect.height) * 0.08;
    const mapWidth = rect.width - padding * 2;
    const mapHeight = rect.height - padding * 2;
    const scale = Math.min(mapWidth / (bounds.maxX - bounds.minX), mapHeight / (bounds.maxY - bounds.minY));
    const offsetX = (rect.width - (bounds.maxX - bounds.minX) * scale) / 2;
    const offsetY = (rect.height - (bounds.maxY - bounds.minY) * scale) / 2;

    const project = ([lon, lat]) => [
        offsetX + (lon - bounds.minX) * scale,
        offsetY + (bounds.maxY - lat) * scale
    ];

    // วาดเงาเรียบหรูของแผนที่ (ลบภาพแนวเรดาร์เรืองแสงจัดจ้านออก)
    ctx.save();
    ctx.shadowColor = isLight ? "rgba(15, 45, 94, 0.06)" : "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    
    const wType = window._v6WarningType || "all";
    drawGeoPolygons(ctx, polygons, project, (polygon) => {
        const center = polygonCentroid(polygon.rings[0]);
        ctx.fillStyle = getProvinceHeatColor(center, wType);
        ctx.fill();
    }, null);

    ctx.restore();

    // ขอบจังหวัดบางๆ แยกรายจังหวัด
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = isLight ? "rgba(15, 45, 94, 0.20)" : "rgba(255,255,255,0.12)";
    drawGeoPolygons(ctx, polygons, project, null, () => ctx.stroke());

    // สถิติคดีจริงรายเขตภูมิภาค ตามเล่ม พย. 68
    const type = window._v6WarningType || "all";
    let scores = { north: "84 เรื่อง", northeast: "162 เรื่อง", central: "298 เรื่อง", east: "41 เรื่อง", south: "54 เรื่อง" };
    if (type === "road") {
        scores = { north: "48 เรื่อง", northeast: "115 เรื่อง", central: "62 เรื่อง", east: "32 เรื่อง", south: "26 เรื่อง" };
    } else if (type === "procure") {
        scores = { north: "65 เรื่อง", northeast: "82 เรื่อง", central: "184 เรื่อง", east: "29 เรื่อง", south: "22 เรื่อง" };
    } else if (type === "duty") {
        scores = { north: "72 เรื่อง", northeast: "124 เรื่อง", central: "245 เรื่อง", east: "38 เรื่อง", south: "45 เรื่อง" };
    } else if (type === "license") {
        scores = { north: "32 เรื่อง", northeast: "45 เรื่อง", central: "112 เรื่อง", east: "58 เรื่อง", south: "16 เรื่อง" };
    }

    // วาดจุด Hotspot 2D ราชการ
    [
        [100.5, 13.75, scores.central],
        [98.98, 18.79, scores.north],
        [101.2, 12.68, scores.east],
        [99.85, 7.01, scores.south],
        [102.8, 15.4, scores.northeast]
    ].forEach(([lon, lat, label]) => drawCanvasHotspotV6(ctx, project([lon, lat]), label, frame));
}

// ── Analytics Export ──

window.exportAnalyticsCsv = function (data) {
    const BOM = '﻿';
    const rows = [];

    rows.push(['รายงานสรุปสถิติ ศอ.สท.']);
    rows.push(['วันที่ออกรายงาน', data.reportDate]);
    rows.push(['ช่วงข้อมูล', data.yearMode]);
    rows.push([]);

    rows.push(['มาตราของกฎหมาย', 'จำนวน (เรื่อง)', 'ร้อยละ']);
    for (const s of data.lawSections) {
        rows.push([s.label, s.value, s.pct]);
    }
    rows.push(['รวมทั้งสิ้น', data.totalCases, '100']);
    rows.push([]);

    rows.push(['ช่องทางรับเรื่อง', 'จำนวน (เรื่อง)']);
    for (const c of data.intakeChannels) {
        rows.push([c.label, c.value]);
    }
    rows.push([]);

    rows.push(['ภูมิภาค/เขต', 'รับใหม่ (เรื่อง)', 'สะสม (เรื่อง)']);
    for (const r of data.m62Rows) {
        rows.push([r.region, r.received, r.accum]);
    }

    const csv = rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-' + (data.reportDate || 'export') + '.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
};

window.exportAnalyticsPdf = function (data) {
    // Capture chart image before opening the window
    const chartCanvas = document.getElementById('chartCompareV6');
    const chartImgSrc = chartCanvas ? chartCanvas.toDataURL('image/png') : null;

    const intakeTotal = data.intakeChannels.reduce((s, c) => s + (Number(c.value) || 0), 0);

    const lawRowsHtml = data.lawSections.map(s => `
        <tr>
            <td>${s.label}</td>
            <td class="num">${Number(s.value).toLocaleString('th-TH')}</td>
            <td class="num">${Number(s.pct).toFixed(2)}</td>
        </tr>`).join('');

    const intakeRowsHtml = data.intakeChannels.map(c => `
        <tr>
            <td>${c.label}</td>
            <td class="num">${Number(c.value).toLocaleString('th-TH')}</td>
            <td class="num">${intakeTotal > 0 ? (Number(c.value) / intakeTotal * 100).toFixed(2) : '0.00'}</td>
        </tr>`).join('');

    const m62RowsHtml = data.m62Rows.map((r, i) => `
        <tr>
            <td class="num">${i + 1}</td>
            <td>${r.region}</td>
            <td class="num">${Number(r.received).toLocaleString('th-TH')}</td>
            <td class="num">${Number(r.accum).toLocaleString('th-TH')}</td>
        </tr>`).join('');

    const chartSection = chartImgSrc ? `
        <h3 class="section-title">กราฟเปรียบเทียบคดีสะสมย้อนหลังรายปี</h3>
        <div class="chart-box">
            <img src="${chartImgSrc}" style="width:100%;height:auto;" />
        </div>` : '';

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8"/>
<title>รายงานสรุปสถิติ ศอ.สท.</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sarabun', sans-serif; font-size: 14px; color: #111; background: #fff; padding: 32px 40px; }
  .header { text-align: center; margin-bottom: 24px; }
  .header .org { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .header .title { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .header .sub { font-size: 13px; color: #555; }
  .section-title { font-size: 14px; font-weight: 700; margin: 20px 0 8px; border-left: 4px solid #1a3575; padding-left: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
  th { background: #1a3575; color: #fff; padding: 7px 10px; text-align: center; }
  td { border: 1px solid #ccc; padding: 6px 10px; vertical-align: middle; }
  th { border: 1px solid #1a3575; }
  .num { text-align: right; }
  .total-row td { font-weight: 700; background: #f0f4ff; }
  .chart-box { border: 1px solid #ccc; border-radius: 4px; padding: 12px; margin-bottom: 16px; }
  .note { font-size: 11px; color: #666; margin-top: 8px; }
  @media print {
    body { padding: 16px 24px; }
    @page { margin: 1cm; }
  }
</style>
</head>
<body>
<div class="header">
  <div class="org">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</div>
  <div class="title">รายงานสรุปสถิติการรับเรื่องและดำเนินคดี</div>
  <div class="sub">ช่วงข้อมูล: ${data.yearMode} &nbsp;|&nbsp; วันที่ออกรายงาน: ${data.reportDate}</div>
</div>

<h3 class="section-title">สรุปคดีจำแนกตามมาตราของกฎหมาย</h3>
<table>
  <thead><tr><th>มาตรา</th><th>จำนวน (เรื่อง)</th><th>ร้อยละ</th></tr></thead>
  <tbody>
    ${lawRowsHtml}
    <tr class="total-row"><td>รวมทั้งสิ้น</td><td class="num">${Number(data.totalCases).toLocaleString('th-TH')}</td><td class="num">100.00</td></tr>
  </tbody>
</table>

<h3 class="section-title">สรุปช่องทางการรับเรื่อง</h3>
<table>
  <thead><tr><th>ช่องทาง</th><th>จำนวน (เรื่อง)</th><th>ร้อยละ</th></tr></thead>
  <tbody>
    ${intakeRowsHtml}
    <tr class="total-row"><td>รวม</td><td class="num">${intakeTotal.toLocaleString('th-TH')}</td><td class="num">100.00</td></tr>
  </tbody>
</table>

<h3 class="section-title">สรุปคดีตามมาตรา 62 จำแนกรายเขต</h3>
<table>
  <thead><tr><th>#</th><th>เขต</th><th>รับใหม่ (เรื่อง)</th><th>สะสม (เรื่อง)</th></tr></thead>
  <tbody>${m62RowsHtml}</tbody>
</table>

${chartSection}

<p class="note">หมายเหตุ: ข้อมูล ณ วันที่ ${data.reportDate}</p>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 800);
};

/* ══════════════════════════════════════════════════════════════
   OFFICIAL REPORT CENTER — generateOfficialReport
   สร้างรายงานทางการแบบ เล่ม พย68 พร้อม print
   ══════════════════════════════════════════════════════════════ */
window.generateOfficialReport = function (config) {
    const types = config.types || [];
    const yearMode = config.yearMode || 'ปีงบประมาณ 2569';
    const reportMonth    = config.reportMonth    || 'พฤศจิกายน';
    const reportYear     = config.reportYear     || 2568;
    const REPORT_DATE    = config.reportDate     || '30 พฤศจิกายน 2568';
    const reportMonthIdx = config.reportMonthIdx !== undefined ? config.reportMonthIdx : 1;

    // ── Mock Data ─────────────────────────────────────────────
    const ANNUAL_ROWS = [
        { year: 2551, range: '1 มกราคม 2551 – 30 กันยายน 2551',   count: 342   },
        { year: 2552, range: '1 ตุลาคม 2551 – 30 กันยายน 2552',   count: 1066  },
        { year: 2553, range: '1 ตุลาคม 2552 – 30 กันยายน 2553',   count: 1141  },
        { year: 2554, range: '1 ตุลาคม 2553 – 30 กันยายน 2554',   count: 2094  },
        { year: 2555, range: '1 ตุลาคม 2554 – 30 กันยายน 2555',   count: 4114  },
        { year: 2556, range: '1 ตุลาคม 2555 – 30 กันยายน 2556',   count: 4004  },
        { year: 2557, range: '1 ตุลาคม 2556 – 30 กันยายน 2557',   count: 3460  },
        { year: 2558, range: '1 ตุลาคม 2557 – 30 กันยายน 2558',   count: 4310  },
        { year: 2559, range: '1 ตุลาคม 2558 – 30 กันยายน 2559',   count: 6634  },
        { year: 2560, range: '1 ตุลาคม 2559 – 30 กันยายน 2560',   count: 4606  },
        { year: 2561, range: '1 ตุลาคม 2560 – 30 กันยายน 2561',   count: 3196  },
        { year: 2562, range: '1 ตุลาคม 2561 – 30 กันยายน 2562',   count: 2045  },
        { year: 2563, range: '1 ตุลาคม 2562 – 30 กันยายน 2563',   count: 1374  },
        { year: 2564, range: '1 ตุลาคม 2563 – 30 กันยายน 2564',   count: 659   },
        { year: 2565, range: '1 ตุลาคม 2564 – 30 กันยายน 2565',   count: 264   },
        { year: 2566, range: '1 ตุลาคม 2565 – 30 กันยายน 2566',   count: 433   },
        { year: 2567, range: '1 ตุลาคม 2566 – 30 กันยายน 2567',   count: 697   },
        { year: 2568, range: '1 ตุลาคม 2567 – 30 กันยายน 2568',   count: 1511  },
        { year: 2569, range: '1 ตุลาคม 2568 – 30 พฤศจิกายน 2568', count: 560   },
    ];
    const ANNUAL_TOTAL = 42510;

    const MONTHLY_ROWS = [
        { month: 'ตุลาคม',    year: 2568, count: 250 },
        { month: 'พฤศจิกายน', year: 2568, count: 310 },
        { month: 'ธันวาคม',   year: 2568, count: null },
        { month: 'มกราคม',    year: 2569, count: null },
        { month: 'กุมภาพันธ์', year: 2569, count: null },
        { month: 'มีนาคม',    year: 2569, count: null },
        { month: 'เมษายน',    year: 2569, count: null },
        { month: 'พฤษภาคม',   year: 2569, count: null },
        { month: 'มิถุนายน',  year: 2569, count: null },
        { month: 'กรกฎาคม',   year: 2569, count: null },
        { month: 'สิงหาคม',   year: 2569, count: null },
        { month: 'กันยายน',   year: 2569, count: null },
    ];
    const MONTHLY_TOTAL = 560;

    // Matrix: 2 months × (ปปท.1-5 เขต แต่ละเขตมี ม.62+18/4+รวม) + ปปท.6-9 + กปท.1-5 + ส่วนกลาง + รวม
    const MATRIX_ROWS = [
        {
            month: 'ตุลาคม', year: 2568,
            ppkt: [
                [10,5,15], [8,11,19], [3,5,8], [2,10,12], [12,14,16],  // ปปท.1-5
                [1,11,13], [15,23,36], [4,8,12], [0,22,22], [0,27,27], // ปปท.6-10 (placeholder row)
            ],
            kpkt: [[0,5,5],[1,11,11],[1,16,26],[6,8,8],[0,8,14]],       // กปท.1-5
            central: [25,3,4],
            m18: 4,
            total: 250,
        },
        {
            month: 'พฤศจิกายน', year: 2568,
            ppkt: [
                [8,4,12],[9,13,19],[5,2,10],[8,22,36],[5,26,41],
                [6,8,16],[11,16,27],[6,8,27],[0,12,18],[0,18,50],
            ],
            kpkt: [[0,6,6],[1,13,13],[0,12,12],[1,25,25],[0,12,10]],
            central: [25,10,23],
            m18: 1,
            total: 310,
        },
    ];

    // Monthly chart data
    const CHART_MONTHLY_DATA = [
        { label: 'ตุลาคม\n2568',    m62: 65,  m18: 185, total: 250 },
        { label: 'พฤศจิกายน\n2568', m62: 101, m18: 208, total: 310 },
        { label: 'ธันวาคม\n2568',   m62: 0,   m18: 0,   total: 0   },
        { label: 'มกราคม\n2569',    m62: 0,   m18: 0,   total: 0   },
        { label: 'กุมภาพันธ์\n2569',m62: 0,   m18: 0,   total: 0   },
        { label: 'มีนาคม\n2569',    m62: 0,   m18: 0,   total: 0   },
        { label: 'เมษายน\n2569',    m62: 0,   m18: 0,   total: 0   },
        { label: 'พฤษภาคม\n2569',   m62: 0,   m18: 0,   total: 0   },
        { label: 'มิถุนายน\n2569',  m62: 0,   m18: 0,   total: 0   },
        { label: 'กรกฎาคม\n2569',   m62: 0,   m18: 0,   total: 0   },
        { label: 'สิงหาคม\n2569',   m62: 0,   m18: 0,   total: 0   },
        { label: 'กันยายน\n2569',   m62: 0,   m18: 0,   total: 0   },
        { label: 'รวม',              m62: 166, m18: 393, total: 560 },
    ];

    // ── Shared CSS ─────────────────────────────────────────────
    const BASE_CSS = `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sarabun', sans-serif; font-size: 14px; color: #111; background: #fff; padding: 24px 36px; }
        .page-break { page-break-after: always; }
        .rpt-header { text-align: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #1a3575; }
        .rpt-header .org1 { font-size: 15px; font-weight: 700; margin-bottom: 2px; color: #1a3575; }
        .rpt-header .org2 { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
        .rpt-header .org3 { font-size: 12px; color: #444; }
        .section-box { margin-bottom: 28px; }
        .section-title { font-size: 13px; font-weight: 800; margin: 0 0 8px; border-left: 4px solid #1a3575; padding-left: 10px; color: #1a3575; }
        table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        th { background: #1a3575; color: #fff; padding: 7px 10px; text-align: center; border: 1px solid #1a3575; font-weight: 700; }
        td { border: 1px solid #ccc; padding: 6px 10px; text-align: center; vertical-align: middle; }
        td.left { text-align: left; }
        tr.total-row td { font-weight: 800; background: #e8f0fe; color: #1a3575; }
        .note { font-size: 11px; color: #555; margin-top: 8px; font-style: italic; }
        /* ── Annual CSS Bar Chart ── */
        .bar-chart-wrap { margin: 0; overflow-x: auto; }
        .bar-chart { display: flex; align-items: flex-end; gap: 4px; height: 220px; padding: 0 4px; border-bottom: 2px solid #333; }
        .bar-group { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 28px; }
        .bar-label-top { font-size: 8px; font-weight: 700; color: #111; text-align: center; margin-bottom: 2px; line-height: 1.2; }
        .bar-rect { width: 100%; border-radius: 2px 2px 0 0; min-height: 2px; }
        .bar-year { font-size: 8px; color: #444; margin-top: 4px; text-align: center; transform: rotate(-35deg); white-space: nowrap; }
        .bar-chart-note { font-size: 9px; color: #666; margin-top: 6px; }
        /* ── Monthly Grouped Bar Chart ── */
        .mbar-chart { display: flex; align-items: flex-end; gap: 2px; height: 200px; border-bottom: 2px solid #333; padding: 0 2px; }
        .mbar-group { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 24px; }
        .mbar-bars { display: flex; align-items: flex-end; gap: 1px; width: 100%; }
        .mbar { flex: 1; border-radius: 1px 1px 0 0; min-height: 1px; }
        .mbar-label-top { font-size: 6.5px; font-weight: 700; text-align: center; margin-bottom: 1px; }
        .mbar-month { font-size: 6.5px; color: #555; text-align: center; margin-top: 3px; transform: rotate(-30deg); white-space: nowrap; }
        .mbar-legend { display: flex; gap: 14px; font-size: 10px; margin-top: 8px; justify-content: center; }
        .mbar-legend-item { display: flex; align-items: center; gap: 4px; }
        .mbar-legend-dot { width: 10px; height: 10px; border-radius: 2px; }
        @media print {
            body { padding: 10px 20px; }
            @page { margin: 1cm; size: A4 landscape; }
            .page-break { page-break-after: always; }
        }
    `;

    const SHARED_HTML_HEAD = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8"/>
<title>รายงานสถิติ ป.ป.ท. — ${yearMode}</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<style>${BASE_CSS}</style>
</head>
<body>`;

    // ── Official Header Template ────────────────────────────────
    function officialHeader(subtitle1, subtitle2) {
        return `<div class="rpt-header">
            <div class="org1">${subtitle1}</div>
            <div class="org2">${subtitle2}</div>
            <div class="org3">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</div>
        </div>`;
    }

    // ── Report 1: Annual Table ──────────────────────────────────
    function buildAnnualTable() {
        // ปีงบ 2569 = แถวสุดท้าย — อัปเดต range และ count ตามเดือนที่เลือก
        const visibleAnnual = ANNUAL_ROWS.map(r => {
            if (r.year === 2569) {
                const cumulative = MONTHLY_ROWS.slice(0, reportMonthIdx + 1).reduce((s, m) => s + (m.count || 0), 0);
                const lastMonth = MONTHLY_ROWS[reportMonthIdx];
                return { ...r, range: `1 ตุลาคม 2568 – ${REPORT_DATE}`, count: cumulative };
            }
            return r;
        });
        const grandTotal = ANNUAL_ROWS.slice(0, -1).reduce((s, r) => s + r.count, 0)
            + MONTHLY_ROWS.slice(0, reportMonthIdx + 1).reduce((s, m) => s + (m.count || 0), 0);
        const rows = visibleAnnual.map(r => `
            <tr>
                <td>${r.year}</td>
                <td class="left">${r.range}</td>
                <td><strong>${r.count.toLocaleString('th-TH')}</strong></td>
            </tr>`).join('');
        return `<div class="section-box">
            ${officialHeader(
                `เรื่องร้องเรียนรับเข้ามายังสำนักงาน ป.ป.ท. ประจำปีงบประมาณ 2569`,
                `ศูนย์รับเรื่องร้องเรียน กองบริหารคดี · ประจำเดือน${reportMonth} ${reportYear}`
            )}
            <table>
                <thead><tr><th style="width:18%">ปีงบประมาณ</th><th>เดือน</th><th style="width:22%">จำนวนเรื่องร้องเรียน</th></tr></thead>
                <tbody>
                    ${rows}
                    <tr class="total-row"><td colspan="2">รวม</td><td>${grandTotal.toLocaleString('th-TH')}</td></tr>
                </tbody>
            </table>
            <p class="note">หมายเหตุ : - ข้อมูล ณ วันที่ ${REPORT_DATE}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- นับสถิติเฉพาะเรื่องที่ออกเลขเรื่องกล่าวหา (เลขสำนวนคดี)</p>
        </div>`;
    }

    // ── Report 2: Monthly Table ─────────────────────────────────
    function buildMonthlyTable() {
        // แสดงเฉพาะเดือนที่ผ่านมาแล้ว (≤ reportMonthIdx) ที่เหลือแสดง '-'
        const rows = MONTHLY_ROWS.map((r, i) => `
            <tr${i === reportMonthIdx ? ' style="background:#fffbeb;"' : ''}>
                <td>${r.month}</td>
                <td>${r.year}</td>
                <td>${i <= reportMonthIdx && r.count !== null ? r.count.toLocaleString('th-TH') : '-'}</td>
            </tr>`).join('');
        const cumTotal = MONTHLY_ROWS.slice(0, reportMonthIdx + 1).reduce((s, m) => s + (m.count || 0), 0);
        return `<div class="section-box">
            ${officialHeader(
                `เรื่องร้องเรียนรับเข้ามายังสำนักงาน ป.ป.ท. ประจำปีงบประมาณ 2569`,
                `ศูนย์รับเรื่องร้องเรียน กองบริหารคดี · ประจำเดือน${reportMonth} ${reportYear}`
            )}
            <table>
                <thead><tr><th style="width:28%">เดือน</th><th style="width:22%">ปี</th><th>จำนวน</th></tr></thead>
                <tbody>
                    ${rows}
                    <tr class="total-row"><td colspan="2">รวมสะสม (ถึงเดือน${reportMonth})</td><td>${cumTotal.toLocaleString('th-TH')}</td></tr>
                </tbody>
            </table>
            <p class="note">หมายเหตุ : - ข้อมูล ณ วันที่ ${REPORT_DATE} · แถวสีเหลือง = เดือนที่รายงาน</p>
        </div>`;
    }

    // ── Report 3: Matrix Table ──────────────────────────────────
    function buildMatrixTable() {
        const regionHeaders = ['ปปท.1','ปปท.2','ปปท.3','ปปท.4','ปปท.5','ปปท.6','ปปท.7','ปปท.8','ปปท.9','กปท.1','กปท.2','กปท.3','กปท.4','กปท.5'];
        const colHeaders = regionHeaders.map(r =>
            `<th colspan="3" style="min-width:72px;font-size:10px;">${r}</th>`).join('');
        const subHeaders = regionHeaders.map(() =>
            `<th style="font-size:9px;padding:4px 2px;">ม.62</th><th style="font-size:9px;padding:4px 2px;">18/4</th><th style="font-size:9px;padding:4px 2px;">รวม</th>`).join('');

        const dataRows = MATRIX_ROWS.map(row => {
            const allRegions = [...row.ppkt, ...row.kpkt];
            const cells = allRegions.map(([m62, m18, tot]) =>
                `<td style="font-size:10px;padding:4px;">${m62||'-'}</td><td style="font-size:10px;padding:4px;">${m18||'-'}</td><td style="font-size:10px;padding:4px;font-weight:700;">${tot||'-'}</td>`
            ).join('');
            return `<tr>
                <td style="font-size:10px;padding:4px;">${row.month}</td>
                <td style="font-size:10px;padding:4px;">${row.year}</td>
                ${cells}
                <td style="font-size:10px;padding:4px;font-weight:800;color:#1a3575;">${row.total}</td>
            </tr>`;
        }).join('');

        return `<div class="section-box">
            ${officialHeader('เส้นทางการจัดองค์กร ประจำปีงบประมาณ 2569', 'ศูนย์รับเรื่องร้องเรียน กองบริหารคดี')}
            <div style="overflow-x:auto;font-size:10px;">
            <table style="min-width:1400px;">
                <thead>
                    <tr>
                        <th rowspan="2" style="min-width:70px;">เดือน</th>
                        <th rowspan="2" style="min-width:40px;">ปี</th>
                        ${colHeaders}
                        <th rowspan="2" style="min-width:50px;">รวมทั้งสิ้น</th>
                    </tr>
                    <tr>${subHeaders}</tr>
                </thead>
                <tbody>
                    ${dataRows}
                    <tr class="total-row">
                        <td colspan="2">รวม</td>
                        ${MATRIX_ROWS[0].ppkt.concat(MATRIX_ROWS[0].kpkt).map((_,i) => {
                            const sums = [0,1,2].map(j => MATRIX_ROWS.reduce((s,r) => s + (([...r.ppkt,...r.kpkt][i]||[0,0,0])[j]||0), 0));
                            return `<td style="font-size:10px;">${sums[0]}</td><td style="font-size:10px;">${sums[1]}</td><td style="font-size:10px;font-weight:800;">${sums[2]}</td>`;
                        }).join('')}
                        <td style="font-weight:800;color:#1a3575;">${MONTHLY_TOTAL}</td>
                    </tr>
                </tbody>
            </table>
            </div>
            <p class="note">หมายเหตุ : - ข้อมูล ณ วันที่ ${REPORT_DATE}</p>
        </div>`;
    }

    // ── Report 4: Annual CSS Bar Chart ─────────────────────────
    function buildAnnualChart() {
        const maxVal = Math.max(...ANNUAL_ROWS.map(r => r.count));
        const BAR_COLORS = [
            '#4472c4','#ed7d31','#a9d18e','#ff0000','#ffc000',
            '#5a86c5','#7030a0','#70ad47','#00b0f0','#c00000',
            '#0070c0','#ff6600','#92d050','#002060','#833c00',
            '#375623','#595959','#1f3864','#d62728'
        ];
        const bars = ANNUAL_ROWS.map((r, i) => {
            const pct = ((r.count / maxVal) * 195).toFixed(1);
            return `<div class="bar-group">
                <div class="bar-label-top">${r.count.toLocaleString('th-TH')}</div>
                <div class="bar-rect" style="height:${pct}px;background:${BAR_COLORS[i % BAR_COLORS.length]};"></div>
                <div class="bar-year">${r.year}</div>
            </div>`;
        }).join('');

        return `<div class="section-box">
            ${officialHeader(
                'เรื่องร้องเรียนที่ออกเลขสำนวน สำนักงาน ป.ป.ท.',
                'ตาม ม.18/4(ข), ม.18/4(2) และออกเลขแยกสำนวน ประจำปีงบประมาณ 2551–2569'
            )}
            <p style="text-align:center;font-size:12px;font-weight:700;margin-bottom:12px;">รวม ${ANNUAL_TOTAL.toLocaleString('th-TH')} เรื่อง &nbsp;|&nbsp; ข้อมูล ณ วันที่ ${REPORT_DATE}</p>
            <div class="bar-chart-wrap">
                <div class="bar-chart">${bars}</div>
            </div>
            <p class="bar-chart-note">หมายเหตุ: สำนวน ม.62 ปม.2561: 60 เรื่อง / ปม.2562: 1,881 เรื่อง / ปม.2563: 1,356 เรื่อง / ปม.2564: 570 เรื่อง / ปม.2565: 236 เรื่อง / ปม.2566: 404 เรื่อง / ปม.2567: 677 เรื่อง / ปม.2568: 673 เรื่อง / ปม.2569: 163 เรื่อง</p>
        </div>`;
    }

    // ── Report 5: Monthly Grouped Bar Chart ────────────────────
    function buildMonthlyChart() {
        const maxVal = Math.max(...CHART_MONTHLY_DATA.map(d => d.total), 1);
        const bars = CHART_MONTHLY_DATA.map(d => {
            const hM62   = d.m62   > 0 ? ((d.m62   / maxVal) * 170).toFixed(1) : 0;
            const hM18   = d.m18   > 0 ? ((d.m18   / maxVal) * 170).toFixed(1) : 0;
            const hTotal = d.total > 0 ? ((d.total  / maxVal) * 170).toFixed(1) : 0;
            const labelM62   = d.m62   > 0 ? `<div class="mbar-label-top" style="color:#4472c4;">${d.m62}</div>`   : '<div class="mbar-label-top">&nbsp;</div>';
            const labelM18   = d.m18   > 0 ? `<div class="mbar-label-top" style="color:#ed7d31;">${d.m18}</div>`   : '<div class="mbar-label-top">&nbsp;</div>';
            const labelTotal = d.total > 0 ? `<div class="mbar-label-top" style="color:#70ad47;">${d.total}</div>` : '<div class="mbar-label-top">&nbsp;</div>';
            const monthLines = d.label.split('\n');
            const monthLabel = monthLines.map(l => `<span style="display:block;">${l}</span>`).join('');
            return `<div class="mbar-group">
                <div class="mbar-bars">
                    <div style="display:flex;flex-direction:column;align-items:center;flex:1;">
                        ${labelM62}
                        <div class="mbar" style="height:${hM62}px;background:#4472c4;"></div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;flex:1;">
                        ${labelM18}
                        <div class="mbar" style="height:${hM18}px;background:#ed7d31;"></div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;flex:1;">
                        ${labelTotal}
                        <div class="mbar" style="height:${hTotal}px;background:#70ad47;"></div>
                    </div>
                </div>
                <div class="mbar-month">${monthLabel}</div>
            </div>`;
        }).join('');

        return `<div class="section-box">
            ${officialHeader(
                'การรับเรื่องร้องเรียนกล่าวหา ของสำนักงาน ป.ป.ท.',
                'ประจำปีงบประมาณ 2569'
            )}
            <div class="mbar-chart">${bars}</div>
            <div class="mbar-legend">
                <div class="mbar-legend-item"><div class="mbar-legend-dot" style="background:#4472c4;"></div> พรบ./ม.62</div>
                <div class="mbar-legend-item"><div class="mbar-legend-dot" style="background:#ed7d31;"></div> ม.18/4</div>
                <div class="mbar-legend-item"><div class="mbar-legend-dot" style="background:#70ad47;"></div> รวม</div>
            </div>
            <p class="note" style="margin-top:8px;">หมายเหตุ : - ข้อมูล ณ วันที่ ${REPORT_DATE}</p>
        </div>`;
    }

    // ── Report P: Province Top 10 + Full List ──────────────────
    const PROVINCE_ALL = [
        {rank:1,name:'กรุงเทพมหานคร',count:143},{rank:2,name:'อุดรธานี',count:22},
        {rank:3,name:'ชลบุรี',count:18},{rank:4,name:'อุบลราชธานี',count:18},
        {rank:5,name:'นนทบุรี',count:18},{rank:6,name:'เพชรบุรี',count:17},
        {rank:7,name:'นครราชสีมา',count:15},{rank:8,name:'ขอนแก่น',count:14},
        {rank:9,name:'เชียงใหม่',count:13},{rank:10,name:'นครสวรรค์',count:12},
        {rank:11,name:'นครศรีธรรมราช',count:12},{rank:12,name:'ราชบุรี',count:10},
        {rank:13,name:'ศรีสะเกษ',count:10},{rank:14,name:'ระยอง',count:9},
        {rank:15,name:'กาญจนบุรี',count:9},{rank:16,name:'ประจวบคีรีขันธ์',count:9},
        {rank:17,name:'เลย',count:9},{rank:18,name:'สมุทรปราการ',count:8},
        {rank:19,name:'ชุมพร',count:8},{rank:20,name:'สุราษฎร์ธานี',count:7},
        {rank:21,name:'เชียงราย',count:7},{rank:22,name:'สกลนคร',count:6},
        {rank:23,name:'สระบุรี',count:6},{rank:24,name:'มหาสารคาม',count:6},
        {rank:25,name:'บุรีรัมย์',count:6},{rank:26,name:'พิจิตร',count:6},
        {rank:27,name:'นครปฐม',count:6},{rank:28,name:'สงขลา',count:5},
        {rank:29,name:'ปทุมธานี',count:5},{rank:30,name:'น่าน',count:5},
        {rank:31,name:'นราธิวาส',count:5},{rank:32,name:'เพชรบูรณ์',count:5},
        {rank:33,name:'พะเยา',count:5},{rank:34,name:'สุโขทัย',count:5},
        {rank:35,name:'สุพรรณบุรี',count:4},{rank:36,name:'กาฬสินธุ์',count:4},
        {rank:37,name:'ปราจีนบุรี',count:4},{rank:38,name:'ตาก',count:4},
        {rank:39,name:'ฉะเชิงเทรา',count:4},{rank:40,name:'แม่ฮ่องสอน',count:4},
        {rank:41,name:'กระบี่',count:4},{rank:42,name:'ร้อยเอ็ด',count:4},
        {rank:43,name:'ชัยภูมิ',count:4},{rank:44,name:'ลพบุรี',count:4},
        {rank:45,name:'พังงา',count:4},{rank:46,name:'อุตรดิตถ์',count:4},
        {rank:47,name:'พระนครศรีอยุธยา',count:4},{rank:48,name:'หนองคาย',count:3},
        {rank:49,name:'พิษณุโลก',count:3},{rank:50,name:'ยะลา',count:3},
        {rank:51,name:'สิงห์บุรี',count:3},{rank:52,name:'กำแพงเพชร',count:3},
        {rank:53,name:'ระนอง',count:3},{rank:54,name:'สุรินทร์',count:3},
        {rank:55,name:'อำนาจเจริญ',count:2},{rank:56,name:'นครนายก',count:2},
        {rank:57,name:'ลำปาง',count:2},{rank:58,name:'ปัตตานี',count:2},
        {rank:59,name:'ตรัง',count:2},{rank:60,name:'สมุทรสงคราม',count:2},
        {rank:61,name:'ลำพูน',count:2},{rank:62,name:'หนองบัวลำภู',count:2},
        {rank:63,name:'จันทบุรี',count:2},{rank:64,name:'นครพนม',count:1},
        {rank:65,name:'อ่างทอง',count:1},{rank:66,name:'ตราด',count:1},
        {rank:67,name:'อุทัยธานี',count:1},{rank:68,name:'สตูล',count:1},
        {rank:69,name:'ภูเก็ต',count:1},{rank:70,name:'สมุทรสาคร',count:1},
        {rank:71,name:'ยโสธร',count:1},{rank:72,name:'แพร่',count:1},
        {rank:75,name:'พัทลุง',count:1},{rank:73,name:'สระแก้ว',count:0},
        {rank:74,name:'มุกดาหาร',count:0},{rank:76,name:'ชัยนาท',count:0},
        {rank:77,name:'บึงกาฬ',count:0},
    ];

    function buildProvinceReport() {
        const top10 = PROVINCE_ALL.slice(0, 10);
        const top10Rows = top10.map(p => `<tr>
            <td>${p.rank}</td><td class="left">${p.name}</td><td><strong>${p.count}</strong></td>
        </tr>`).join('');
        const allRows = PROVINCE_ALL.map(p => `<tr>
            <td>${p.rank}</td><td class="left">${p.name}</td><td>${p.count > 0 ? p.count : '-'}</td>
        </tr>`).join('');
        const header1 = officialHeader(
            `เรื่องร้องเรียนในเขตจังหวัดรับผิดชอบ สำนักงาน ป.ป.ท. เรียงลำดับมาก-น้อย 10 ลำดับ ปีงบประมาณ 2569`,
            `ประจำเดือน${reportMonth} ${reportYear}`
        );
        const header2 = officialHeader(
            `เรื่องร้องเรียนจำแนกตามจังหวัดที่เกิดเหตุ ปีงบประมาณ 2569`,
            `ศูนย์รับเรื่องร้องเรียน กองบริหารคดี · ประจำเดือน${reportMonth} ${reportYear}`
        );
        return `<div class="section-box">
            ${header1}
            <table style="max-width:480px;margin:0 auto;">
                <thead><tr><th style="width:15%">ลำดับที่</th><th>จังหวัด</th><th style="width:30%">จำนวนเรื่องร้องเรียน</th></tr></thead>
                <tbody>${top10Rows}</tbody>
            </table>
            <p class="note" style="margin-top:8px;">หมายเหตุ ข้อมูล ณ วันที่ 30 พฤศจิกายน 2568</p>
        </div>
        <div class="page-break"></div>
        <div class="section-box">
            ${header2}
            <table style="max-width:520px;margin:0 auto;">
                <thead><tr><th style="width:15%">ลำดับ</th><th>จังหวัด</th><th style="width:30%">จำนวนเรื่องร้องเรียน</th></tr></thead>
                <tbody>
                    ${allRows}
                    <tr class="total-row"><td colspan="2">รวม</td><td>310</td></tr>
                </tbody>
            </table>
            <p class="note" style="margin-top:8px;">หมายเหตุ ข้อมูล ณ วันที่ 30 พฤศจิกายน 2568</p>
        </div>`;
    }

    // ── Assemble Sections ───────────────────────────────────────
    // lm_py68 = เล่ม พย68 ครบ 5 ชิ้น
    const effectiveTypes = types.includes('lm_py68')
        ? [...types.filter(t => t !== 'lm_py68'), 'annual','monthly','matrix','chart_annual','chart_monthly']
        : types;

    const BUILDERS = {
        annual:        buildAnnualTable,
        monthly:       buildMonthlyTable,
        matrix:        buildMatrixTable,
        chart_annual:  buildAnnualChart,
        chart_monthly: buildMonthlyChart,
        province:      buildProvinceReport,
    };

    const ORDER = ['province','annual','monthly','matrix','chart_annual','chart_monthly'];
    const sections = ORDER
        .filter(k => effectiveTypes.includes(k))
        .map((k, idx, arr) => {
            const content = BUILDERS[k]();
            return idx < arr.length - 1 ? content + '<div class="page-break"></div>' : content;
        }).join('\n');

    const html = `${SHARED_HTML_HEAD}${sections}</body></html>`;

    const w = window.open('', '_blank', 'width=1100,height=800');
    if (!w) { alert('กรุณาอนุญาต Pop-up เพื่อสร้างรายงาน'); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 1000);
};


// ── ปุ่มดูเต็มจอของ War Room — Fullscreen API; กฎ CSS :fullscreen ใน war-room-fullscreen.css จัดการหน้าตาให้แล้ว ──
window.toggleWarRoomFullscreen = function () {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    const shell = document.querySelector('.cs-shell.an-fullscreen');
    if (shell && shell.requestFullscreen) shell.requestFullscreen();
};

// ── QR code สำหรับลิงก์แชร์ war room (ใช้ qrcodejs จาก CDN) ──
window.renderShareQr = function (elId, text) {
    const el = document.getElementById(elId);
    if (!el || !window.QRCode) return;
    el.innerHTML = '';
    new QRCode(el, { text: text, width: 148, height: 148, correctLevel: QRCode.CorrectLevel.M });
};

// ── หน้าแชร์บนมือถือแนวตั้ง: หมุนแดชบอร์ดเป็นแนวนอน + ย่อให้พอดีจอ ──
window.initShareRotate = function () {
    const apply = () => {
        const shell = document.querySelector('.cs-shell.v6-share');
        if (!shell) return;
        const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 900;
        shell.classList.toggle('share-rotated', portrait);
        if (portrait) {
            const W = 1180;                                   // ความกว้างเสมือน (เท่าจอคอมย่อม)
            const scale = window.innerHeight / W;
            shell.style.setProperty('--shr-w', W + 'px');
            shell.style.setProperty('--shr-h', Math.round(window.innerWidth / scale) + 'px');
            shell.style.setProperty('--shr-scale', scale);
        }
    };
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', () => setTimeout(apply, 120));
    apply();
};
