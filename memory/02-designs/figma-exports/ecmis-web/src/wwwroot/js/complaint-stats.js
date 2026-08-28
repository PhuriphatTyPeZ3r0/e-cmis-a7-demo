// Region "map" — horizontal bar by ปปท. region + ส่วนกลาง
window.csZoneChart = null;
window.initRegionMap = function (canvasId, labels, data, isDark) {
    if (window.csZoneChart) { window.csZoneChart.destroy(); window.csZoneChart = null; }
    const el = document.getElementById(canvasId);
    if (!el || !window.Chart) return;
    const tick = isDark ? 'rgba(255,255,255,.55)' : '#475569';
    const grid = isDark ? 'rgba(255,255,255,.06)' : 'rgba(13,27,62,.07)';
    window.csZoneChart = new Chart(el.getContext('2d'), {
        type: 'bar',
        data: { labels, datasets: [{ data, backgroundColor: '#26408b', borderRadius: 4 }] },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: grid }, ticks: { color: tick } },
                y: { grid: { display: false }, ticks: { color: tick } }
            }
        }
    });
};

// Excel export via SheetJS — sheets: [{name, aoa:[[..],[..]]}]
window.exportStatsXlsx = function (fileName, sheets) {
    if (!window.XLSX) { alert('ไม่พบไลบรารี Excel'); return; }
    const wb = XLSX.utils.book_new();
    sheets.forEach(s => {
        const ws = XLSX.utils.aoa_to_sheet(s.aoa);
        XLSX.utils.book_append_sheet(wb, ws, s.name.substring(0, 31));
    });
    XLSX.writeFile(wb, fileName);
};
