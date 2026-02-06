import { getViewState, getGraphOptions } from './state.js';
import { calculateRollingStatistics, getDateRange } from './data.js';

export function setupCanvas(canvas) {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 300;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 30, right: 30, bottom: 50, left: 60 };

    return { ctx, width, height, padding };
}

export function drawBackground(ctx, width, height) {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
}

export function drawNoDataMessage(ctx, width, height) {
    ctx.fillStyle = '#999';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data to display', width / 2, height / 2);
}

export function setClippingRegion(ctx, padding, graphWidth, graphHeight) {
    ctx.beginPath();
    ctx.rect(padding.left, padding.top, graphWidth, graphHeight);
    ctx.clip();
}

export function drawGrid(ctx, padding, width, height, weightMin5, weightRange5, minDate, maxDate, dateRange, effectiveGraphWidth, effectiveGraphHeight, effectiveZoom) {
    drawHorizontalGridLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight, effectiveZoom);
    drawVerticalGridLines(ctx, padding, height, minDate, maxDate, dateRange, effectiveGraphWidth, effectiveZoom);
}

export function drawHorizontalGridLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight, effectiveZoom) {
    draw5kgGridLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight);
    if (effectiveZoom >= 4) {
        draw1kgGridLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight);
    }
    if (effectiveZoom >= 60) {
        draw02kgGridLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight);
    }
}

function draw5kgGridLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight) {
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 2.0;

    const num5kgLines = Math.max(weightRange5 / 5, 1);
    for (let i = 0; i <= num5kgLines; i++) {
        const weightValue = weightMin5 + i * 5;
        const y = height - padding.bottom - ((weightValue - weightMin5) / weightRange5) * effectiveGraphHeight + getViewState().panY;

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }
}

function draw1kgGridLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight) {
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1.0;

    const num1kgLines = Math.max(weightRange5 / 1, 1);
    for (let i = 0; i <= num1kgLines; i++) {
        const weightValue = weightMin5 + i * 1;
        if (weightValue % 5 !== 0) {
            const y = height - padding.bottom - ((weightValue - weightMin5) / weightRange5) * effectiveGraphHeight + getViewState().panY;

            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }
    }
}

function draw02kgGridLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight) {
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 0.5;

    const num02kgLines = Math.max(weightRange5 / 0.2, 1);
    for (let i = 0; i <= num02kgLines; i++) {
        const weightValue = weightMin5 + i * 0.2;
        if (Math.abs(weightValue % 1) > 0.01) {
            const y = height - padding.bottom - ((weightValue - weightMin5) / weightRange5) * effectiveGraphHeight + getViewState().panY;

            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }
    }
}

export function drawVerticalGridLines(ctx, padding, height, minDate, maxDate, dateRange, effectiveGraphWidth, effectiveZoom) {
    const { startDate, endDate } = getDateRange(minDate, maxDate);

    drawYearGridLines(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth);
    if (effectiveZoom >= 4) {
        drawMonthGridLines(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth);
    }
    if (effectiveZoom >= 25) {
        drawMondayGridLines(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth);
    }
}

function drawYearGridLines(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth) {
    let currentDate = new Date(startDate);
    currentDate.setMonth(0, 1);

    while (currentDate <= endDate) {
        const timeValue = currentDate.getTime();
        const x = padding.left + ((timeValue - minDate) / dateRange) * effectiveGraphWidth + getViewState().panX;

        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 2.0;

        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();

        currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
}

function drawMonthGridLines(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth) {
    let currentDate = new Date(startDate);
    currentDate.setDate(1);

    while (currentDate <= endDate) {
        const timeValue = currentDate.getTime();
        const x = padding.left + ((timeValue - minDate) / dateRange) * effectiveGraphWidth + getViewState().panX;
        const isYearBoundary = currentDate.getMonth() === 0;

        if (!isYearBoundary) {
            ctx.strokeStyle = '#d0d0d0';
            ctx.lineWidth = 1.0;

            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();
        }

        currentDate.setMonth(currentDate.getMonth() + 1);
    }
}

function drawMondayGridLines(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth) {
    let currentDate = new Date(startDate);

    while (currentDate.getDay() !== 1) {
        currentDate.setDate(currentDate.getDate() + 1);
    }

    while (currentDate <= endDate) {
        const timeValue = currentDate.getTime();
        const x = padding.left + ((timeValue - minDate) / dateRange) * effectiveGraphWidth + getViewState().panX;
        const isMonthBoundary = currentDate.getDate() === 1;

        if (!isMonthBoundary) {
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 0.5;

            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();
        }

        currentDate.setDate(currentDate.getDate() + 7);
    }
}

export function drawDataLine(ctx, sortedHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    if (sortedHistory.length <= 1) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    sortedHistory.forEach((entry, index) => {
        const { x, y } = calculateCoordinates(entry, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}

export function drawDataPoints(ctx, sortedHistory, padding, height, graphWidth, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    sortedHistory.forEach(entry => {
        const { x, y } = calculateCoordinates(entry, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
        ctx.fill();
    });
}

export function calculateCoordinates(entry, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    const entryDate = new Date(entry.date).getTime();
    const x = padding.left + ((entryDate - minDate) / dateRange) * effectiveGraphWidth + getViewState().panX;
    const weight = parseFloat(entry.weight);
    const y = height - padding.bottom - ((weight - weightMin5) / weightRange5) * effectiveGraphHeight + getViewState().panY;

    return { x, y };
}

export function drawRollingAverageLine(ctx, fullHistory, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    drawRollingLine(ctx, fullHistory, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight, 'average', '#2196F3');
}

export function drawRollingMaxLine(ctx, fullHistory, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    drawRollingLine(ctx, fullHistory, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight, 'max', '#F44336');
}

export function drawRollingMinLine(ctx, fullHistory, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    drawRollingLine(ctx, fullHistory, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight, 'min', '#4CAF50');
}

function drawRollingLine(ctx, fullHistory, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight, statKey, color) {
    const rollingStats = calculateRollingStatistics(fullHistory, 10);
    if (rollingStats.length <= 1) return;

    const filteredDates = new Set(filteredHistory.map(entry => entry.date));
    const filteredRollingStats = rollingStats.filter(stat => filteredDates.has(stat.date));

    if (filteredRollingStats.length <= 1) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    filteredRollingStats.forEach((stat, index) => {
        const entry = { date: stat.date, weight: stat[statKey] };
        const { x, y } = calculateCoordinates(entry, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}

export function drawAxes(ctx, padding, width, height) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
}

export function drawYAxisLabels(ctx, padding, height, weightMin5, weightRange5, effectiveGraphHeight, effectiveZoom) {
    ctx.fillStyle = '#333';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const { gridInterval, decimalPlaces } = getGridInterval(effectiveZoom);
    const numWeightLines = Math.max(weightRange5 / gridInterval, 1);

    for (let i = 0; i <= numWeightLines; i++) {
        const weightValue = weightMin5 + i * gridInterval;
        const y = height - padding.bottom - ((weightValue - weightMin5) / weightRange5) * effectiveGraphHeight + getViewState().panY;

        if (y >= padding.top && y <= height - padding.bottom) {
            ctx.fillText(weightValue.toFixed(decimalPlaces) + ' kg', padding.left - 8, y);
        }
    }
}

function getGridInterval(effectiveZoom) {
    if (effectiveZoom >= 60) {
        return { gridInterval: 0.2, decimalPlaces: 1 };
    }
    if (effectiveZoom >= 4) {
        return { gridInterval: 1, decimalPlaces: 0 };
    }
    return { gridInterval: 5, decimalPlaces: 0 };
}

export function drawXAxisLabels(ctx, padding, height, minDate, maxDate, dateRange, effectiveGraphWidth, effectiveZoom) {
    const { startDate, endDate } = getDateRange(minDate, maxDate);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';

    if (effectiveZoom >= 25) {
        drawMondayLabels(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth);
    } else if (effectiveZoom >= 4) {
        drawMonthLabels(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth);
    } else {
        drawYearLabels(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth);
    }
}

function drawYearLabels(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth) {
    let currentDate = new Date(startDate);
    currentDate.setMonth(0, 1);

    while (currentDate <= endDate) {
        const timeValue = currentDate.getTime();
        const x = padding.left + ((timeValue - minDate) / dateRange) * effectiveGraphWidth + getViewState().panX;

        if (x >= padding.left) {
            ctx.fillText(currentDate.getFullYear().toString(), x, height - padding.bottom + 8);
        }
        currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
}

function drawMonthLabels(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth) {
    let currentDate = new Date(startDate);
    currentDate.setDate(1);

    while (currentDate <= endDate) {
        const timeValue = currentDate.getTime();
        const x = padding.left + ((timeValue - minDate) / dateRange) * effectiveGraphWidth + getViewState().panX;

        if (x >= padding.left) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const label = currentDate.getMonth() === 0
                ? currentDate.getFullYear().toString()
                : monthNames[currentDate.getMonth()];

            ctx.fillText(label, x, height - padding.bottom + 8);
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
}

function drawMondayLabels(ctx, padding, height, startDate, endDate, minDate, dateRange, effectiveGraphWidth) {
    let currentDate = new Date(startDate);

    while (currentDate.getDay() !== 1) {
        currentDate.setDate(currentDate.getDate() + 1);
    }

    while (currentDate <= endDate) {
        const timeValue = currentDate.getTime();
        const x = padding.left + ((timeValue - minDate) / dateRange) * effectiveGraphWidth + getViewState().panX;

        if (x >= padding.left) {
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const label = `${day}/${month}`;

            ctx.fillText(label, x, height - padding.bottom + 8);
        }
        currentDate.setDate(currentDate.getDate() + 7);
    }
}