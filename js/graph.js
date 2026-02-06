import { getWeightHistory } from './storage.js';

let viewState = { zoom: 1, panX: 0, panY: 0 };
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

let graphOptions = {
    showDataPoints: true,
    showDataLine: true,
    showRollingAverage: false,
    showRollingMax: false,
    showRollingMin: false
};

export function renderGraph() {
    const canvas = document.getElementById('weightGraph');
    if (!canvas) return;

    const history = getWeightHistory();
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    const { ctx, width, height, padding } = setupCanvas(canvas);
    const { weights, dates, minWeight, maxWeight, minDate, maxDate, dateRange } = extractData(sortedHistory);
    const { weightMin5, weightMax5, weightRange5 } = calculateWeightRange(minWeight, maxWeight);
    const { graphWidth, graphHeight, effectiveGraphWidth, effectiveGraphHeight } = calculateGraphDimensions(width, height, padding);
    
    clampPanValues(graphWidth, graphHeight, effectiveGraphWidth, effectiveGraphHeight);
    
    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, width, height);
    
    if (sortedHistory.length === 0) {
        drawNoDataMessage(ctx, width, height);
        return;
    }

    ctx.save();
    setClippingRegion(ctx, padding, graphWidth, graphHeight);
    drawGrid(ctx, padding, width, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    if (graphOptions.showDataLine) {
        drawDataLine(ctx, sortedHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    }
    if (graphOptions.showRollingAverage) {
        drawRollingAverageLine(ctx, sortedHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    }
    if (graphOptions.showRollingMax) {
        drawRollingMaxLine(ctx, sortedHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    }
    if (graphOptions.showRollingMin) {
        drawRollingMinLine(ctx, sortedHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    }
    if (graphOptions.showDataPoints) {
        drawDataPoints(ctx, sortedHistory, padding, height, graphWidth, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    }
    ctx.restore();
    
    drawAxes(ctx, padding, width, height);
    drawYAxisLabels(ctx, padding, height, weightMin5, weightRange5, effectiveGraphHeight);
    drawXAxisLabels(ctx, padding, height, minDate, maxDate, dateRange, effectiveGraphWidth);
}

function setupCanvas(canvas) {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 300;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 30, right: 30, bottom: 50, left: 60 };
    
    return { ctx, width, height, padding };
}

function extractData(sortedHistory) {
    const weights = sortedHistory.map(entry => parseFloat(entry.weight));
    const dates = sortedHistory.map(entry => new Date(entry.date).getTime());
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1;
    
    return { weights, dates, minWeight, maxWeight, minDate, maxDate, dateRange };
}

function calculateWeightRange(minWeight, maxWeight) {
    const weightMin5 = Math.floor(minWeight / 5) * 5;
    const weightMax5 = Math.ceil(maxWeight / 5) * 5;
    const weightRange5 = weightMax5 - weightMin5;
    
    return { weightMin5, weightMax5, weightRange5 };
}

function calculateGraphDimensions(width, height, padding) {
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;
    const effectiveGraphWidth = graphWidth * viewState.zoom;
    const effectiveGraphHeight = graphHeight * viewState.zoom;
    
    return { graphWidth, graphHeight, effectiveGraphWidth, effectiveGraphHeight };
}

function clampPanValues(graphWidth, graphHeight, effectiveGraphWidth, effectiveGraphHeight) {
    const maxPanX = Math.max(0, effectiveGraphWidth - graphWidth);
    const maxPanY = Math.max(0, effectiveGraphHeight - graphHeight);
    viewState.panX = Math.max(-maxPanX, Math.min(maxPanX, viewState.panX));
    viewState.panY = Math.max(-maxPanY, Math.min(maxPanY, viewState.panY));
}

function drawBackground(ctx, width, height) {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
}

function drawNoDataMessage(ctx, width, height) {
    ctx.fillStyle = '#999';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data to display', width / 2, height / 2);
}

function setClippingRegion(ctx, padding, graphWidth, graphHeight) {
    ctx.beginPath();
    ctx.rect(padding.left, padding.top, graphWidth, graphHeight);
    ctx.clip();
}

function drawGrid(ctx, padding, width, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    drawHorizontalGridLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight);
    drawKilogramLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight);
    drawVerticalGridLines(ctx, padding, height, minDate, dateRange, effectiveGraphWidth);
}

function drawHorizontalGridLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight) {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    const numWeightLines = Math.max(weightRange5 / 5, 1);
    for (let i = 0; i <= numWeightLines; i++) {
        const weightValue = weightMin5 + i * 5;
        const y = height - padding.bottom - ((weightValue - weightMin5) / weightRange5) * effectiveGraphHeight + viewState.panY;
        
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }
}

function drawKilogramLines(ctx, padding, width, height, weightMin5, weightRange5, effectiveGraphHeight) {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.3;
    
    const numKgLines = Math.max(weightRange5, 1);
    for (let i = 0; i <= numKgLines; i++) {
        const weightValue = weightMin5 + i;
        const y = height - padding.bottom - ((weightValue - weightMin5) / weightRange5) * effectiveGraphHeight + viewState.panY;
        
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }
}

function drawVerticalGridLines(ctx, padding, height, minDate, dateRange, effectiveGraphWidth) {
    const { startDate, endDate } = getDateRange(minDate);
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const timeValue = currentDate.getTime();
        const x = padding.left + ((timeValue - minDate) / dateRange) * effectiveGraphWidth + viewState.panX;
        const isYearBoundary = currentDate.getMonth() === 0;
        
        ctx.strokeStyle = isYearBoundary ? '#ccc' : '#e8e8e8';
        ctx.lineWidth = isYearBoundary ? 1 : 0.3;
        
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
        
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
}

function getDateRange(minDate) {
    const minDateObj = new Date(minDate);
    const maxDateObj = new Date(minDateObj);
    maxDateObj.setMonth(maxDateObj.getMonth() + 1);
    maxDateObj.setDate(0);
    
    const startDate = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
    const endDate = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth() + 1, 0);
    
    return { startDate, endDate };
}

function drawDataLine(ctx, sortedHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
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

function drawDataPoints(ctx, sortedHistory, padding, height, graphWidth, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
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

function calculateCoordinates(entry, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    const entryDate = new Date(entry.date).getTime();
    const x = padding.left + ((entryDate - minDate) / dateRange) * effectiveGraphWidth + viewState.panX;
    const weight = parseFloat(entry.weight);
    const y = height - padding.bottom - ((weight - weightMin5) / weightRange5) * effectiveGraphHeight + viewState.panY;
    
    return { x, y };
}

function calculateRollingStatistics(sortedHistory, windowDays = 10) {
    const rollingStats = [];
    
    for (let i = 0; i < sortedHistory.length; i++) {
        const currentDate = new Date(sortedHistory[i].date);
        const windowStart = new Date(currentDate);
        windowStart.setDate(windowStart.getDate() - windowDays + 1);
        
        const windowEntries = sortedHistory.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= windowStart && entryDate <= currentDate;
        });
        
        if (windowEntries.length > 0) {
            const weights = windowEntries.map(entry => parseFloat(entry.weight));
            const average = weights.reduce((sum, w) => sum + w, 0) / weights.length;
            const max = Math.max(...weights);
            const min = Math.min(...weights);
            
            rollingStats.push({
                date: sortedHistory[i].date,
                average: average,
                max: max,
                min: min
            });
        }
    }
    
    return rollingStats;
}

function drawRollingAverageLine(ctx, sortedHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    const rollingStats = calculateRollingStatistics(sortedHistory, 10);
    if (rollingStats.length <= 1) return;
    
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    rollingStats.forEach((stat, index) => {
        const entry = { date: stat.date, weight: stat.average };
        const { x, y } = calculateCoordinates(entry, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

function drawRollingMaxLine(ctx, sortedHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    const rollingStats = calculateRollingStatistics(sortedHistory, 10);
    if (rollingStats.length <= 1) return;
    
    ctx.strokeStyle = '#F44336';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    rollingStats.forEach((stat, index) => {
        const entry = { date: stat.date, weight: stat.max };
        const { x, y } = calculateCoordinates(entry, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

function drawRollingMinLine(ctx, sortedHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight) {
    const rollingStats = calculateRollingStatistics(sortedHistory, 10);
    if (rollingStats.length <= 1) return;
    
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    rollingStats.forEach((stat, index) => {
        const entry = { date: stat.date, weight: stat.min };
        const { x, y } = calculateCoordinates(entry, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

function drawAxes(ctx, padding, width, height) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
}

function drawYAxisLabels(ctx, padding, height, weightMin5, weightRange5, effectiveGraphHeight) {
    ctx.fillStyle = '#333';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const numWeightLines = Math.max(weightRange5 / 5, 1);
    for (let i = 0; i <= numWeightLines; i++) {
        const weightValue = weightMin5 + i * 5;
        const y = height - padding.bottom - ((weightValue - weightMin5) / weightRange5) * effectiveGraphHeight + viewState.panY;
        ctx.fillText(weightValue.toFixed(0) + ' kg', padding.left - 8, y);
    }
}

function drawXAxisLabels(ctx, padding, height, minDate, maxDate, dateRange, effectiveGraphWidth) {
    const { startDate, endDate } = getDateRange(minDate);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        if (currentDate.getMonth() === 0) {
            const timeValue = currentDate.getTime();
            const x = padding.left + ((timeValue - minDate) / dateRange) * effectiveGraphWidth + viewState.panX;
            ctx.fillText(currentDate.getFullYear().toString(), x, height - padding.bottom + 8);
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
}

export function setupGraphInteractions() {
    const canvas = document.getElementById('weightGraph');
    if (!canvas) return;
    
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    canvas.style.cursor = 'grab';
    
    setupGraphOptions();
}

function setupGraphOptions() {
    const showDataPointsCheckbox = document.getElementById('showDataPoints');
    const showDataLineCheckbox = document.getElementById('showDataLine');
    const showRollingAverageCheckbox = document.getElementById('showRollingAverage');
    const showRollingMaxCheckbox = document.getElementById('showRollingMax');
    const showRollingMinCheckbox = document.getElementById('showRollingMin');
    
    if (showDataPointsCheckbox) {
        showDataPointsCheckbox.addEventListener('change', function() {
            setGraphOptions({ showDataPoints: this.checked });
        });
    }
    
    if (showDataLineCheckbox) {
        showDataLineCheckbox.addEventListener('change', function() {
            setGraphOptions({ showDataLine: this.checked });
        });
    }
    
    if (showRollingAverageCheckbox) {
        showRollingAverageCheckbox.addEventListener('change', function() {
            setGraphOptions({ showRollingAverage: this.checked });
        });
    }
    
    if (showRollingMaxCheckbox) {
        showRollingMaxCheckbox.addEventListener('change', function() {
            setGraphOptions({ showRollingMax: this.checked });
        });
    }
    
    if (showRollingMinCheckbox) {
        showRollingMinCheckbox.addEventListener('change', function() {
            setGraphOptions({ showRollingMin: this.checked });
        });
    }
}

function handleWheel(e) {
    e.preventDefault();
    
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(1, Math.min(10, viewState.zoom * zoomFactor));
    
    const zoomRatio = newZoom / viewState.zoom;
    viewState.panX = mouseX - (mouseX - viewState.panX) * zoomRatio;
    viewState.panY = mouseY - (mouseY - viewState.panY) * zoomRatio;
    viewState.zoom = newZoom;
    
    renderGraph();
}

function handleMouseDown(e) {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    e.target.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    
    viewState.panX += deltaX;
    viewState.panY += deltaY;
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    renderGraph();
}

function handleMouseUp(e) {
    isDragging = false;
    e.target.style.cursor = 'grab';
}

function handleMouseLeave(e) {
    isDragging = false;
    e.target.style.cursor = 'grab';
}

let lastTouchDistance = 0;
let lastTouchCenterX = 0;
let lastTouchCenterY = 0;

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        isDragging = false;
        const { distance, centerX, centerY } = calculateTouchMetrics(e.touches[0], e.touches[1]);
        lastTouchDistance = distance;
        lastTouchCenterX = centerX;
        lastTouchCenterY = centerY;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
        handleSingleTouchMove(e);
    } else if (e.touches.length === 2) {
        handlePinchZoom(e);
    }
}

function handleSingleTouchMove(e) {
    const deltaX = e.touches[0].clientX - lastMouseX;
    const deltaY = e.touches[0].clientY - lastMouseY;
    
    viewState.panX += deltaX;
    viewState.panY += deltaY;
    
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
    
    renderGraph();
}

function handlePinchZoom(e) {
    const { distance, centerX, centerY } = calculateTouchMetrics(e.touches[0], e.touches[1]);
    
    const zoomFactor = distance / lastTouchDistance;
    const newZoom = Math.max(1, Math.min(10, viewState.zoom * zoomFactor));
    
    const zoomRatio = newZoom / viewState.zoom;
    viewState.panX = centerX - (centerX - viewState.panX) * zoomRatio;
    viewState.panY = centerY - (centerY - viewState.panY) * zoomRatio;
    viewState.zoom = newZoom;
    
    lastTouchDistance = distance;
    lastTouchCenterX = centerX;
    lastTouchCenterY = centerY;
    
    renderGraph();
}

function calculateTouchMetrics(touch1, touch2) {
    const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    
    return { distance, centerX, centerY };
}

function handleTouchEnd() {
    isDragging = false;
}

export function setGraphOptions(options) {
    if (options.showDataPoints !== undefined) {
        graphOptions.showDataPoints = options.showDataPoints;
    }
    if (options.showDataLine !== undefined) {
        graphOptions.showDataLine = options.showDataLine;
    }
    if (options.showRollingAverage !== undefined) {
        graphOptions.showRollingAverage = options.showRollingAverage;
    }
    if (options.showRollingMax !== undefined) {
        graphOptions.showRollingMax = options.showRollingMax;
    }
    if (options.showRollingMin !== undefined) {
        graphOptions.showRollingMin = options.showRollingMin;
    }
    renderGraph();
}