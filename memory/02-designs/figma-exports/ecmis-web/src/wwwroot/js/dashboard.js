window._dashChart = null;
window._lastChartParams = null;

window.getDashTheme = function () {
    return localStorage.getItem('dashTheme') || 'light';
};
window.setDashTheme = function (theme) {
    localStorage.setItem('dashTheme', theme);
};
window.applyDashTheme = function (isDark) {
    const el = document.querySelector('.layout-container');
    if (el) {
        if (isDark) { el.classList.remove('app-light'); }
        else        { el.classList.add('app-light');    }
    }
};
window.reinitDashChartIfNeeded = function (isDark) {
    if (window._lastChartParams && document.getElementById('dashChart')) {
        window.initDashChart(window._lastChartParams.labels, window._lastChartParams.data, isDark);
    }
};

window.initDashChart = function (labels, data, isDark) {
    window._lastChartParams = { labels, data };
    isDark = isDark !== false;
    const canvas = document.getElementById('dashChart');
    if (!canvas) return;
    if (window._dashChart) { window._dashChart.destroy(); window._dashChart = null; }
    const ctx = canvas.getContext('2d');

    const lineColor = isDark ? '#c8a96e' : '#1a3575';
    const grad = ctx.createLinearGradient(0, 0, 0, 240);
    grad.addColorStop(0, isDark ? 'rgba(200,169,110,0.22)' : 'rgba(184,146,42,0.15)');
    grad.addColorStop(1, isDark ? 'rgba(200,169,110,0)' : 'rgba(184,146,42,0)');
    const pointBorder = isDark ? '#0b0f1e' : '#ffffff';
    const gridColor   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(13,27,62,0.07)';
    const tickColor   = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(13,27,62,0.45)';
    const tooltipBg   = isDark ? 'rgba(8,12,28,0.95)' : 'rgba(255,255,255,0.97)';
    const tooltipTitle = isDark ? '#c8a96e' : '#1a3575';
    const tooltipBody  = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(13,27,62,0.75)';
    const tooltipBorder = isDark ? 'rgba(200,169,110,0.3)' : 'rgba(26,47,107,0.15)';

    window._dashChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: lineColor,
                backgroundColor: grad,
                borderWidth: 2,
                pointBackgroundColor: lineColor,
                pointBorderColor: pointBorder,
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7,
                tension: 0.45,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderWidth: 1,
                    titleColor: tooltipTitle,
                    bodyColor: tooltipBody,
                    padding: 10,
                    callbacks: { label: function (c) { return ' ' + c.parsed.y + ' เรื่อง'; } }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: tickColor, font: { family: 'Sarabun', size: 11 } },
                    beginAtZero: true
                }
            }
        }
    });
};

window.destroyDashChart = function () {
    if (window._dashChart) { window._dashChart.destroy(); window._dashChart = null; }
};

window.ecmis = window.ecmis || {};

window.ecmis.downloadTextFile = function (fileName, contentType, content, withBom) {
    const payload = withBom ? ['\uFEFF', content] : [content];
    const blob = new Blob(payload, { type: contentType || 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
};

window.ecmis.downloadBase64File = function (fileName, contentType, base64) {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: contentType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
};

window.ecmis.printReport = function (title, htmlTable) {
    const popup = window.open('', '_blank', 'width=1200,height=900');
    if (!popup) return;
    popup.document.write(`
        <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Sarabun, Tahoma, sans-serif; padding: 16px; }
                    h2 { margin: 0 0 12px; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    th, td { border: 1px solid #d4d8e2; padding: 6px; text-align: left; vertical-align: top; }
                    th { background: #f3f5fb; }
                </style>
            </head>
            <body>${htmlTable}</body>
        </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
};
