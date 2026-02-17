import { getViewState, setViewState, getIsDragging, setIsDragging, getLastMouseX, setLastMouseX, getLastMouseY, setLastMouseY, getLastTouchDistance, setLastTouchDistance, getLastTouchCenterX, setLastTouchCenterX, getLastTouchCenterY, setLastTouchCenterY, setGraphOptions, setTimeRange } from './state.js';

let renderGraph;

export function setRenderGraph(fn) {
    renderGraph = fn;
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
            renderGraph();
        });
    }

    if (showDataLineCheckbox) {
        showDataLineCheckbox.addEventListener('change', function() {
            setGraphOptions({ showDataLine: this.checked });
            renderGraph();
        });
    }

    if (showRollingAverageCheckbox) {
        showRollingAverageCheckbox.addEventListener('change', function() {
            setGraphOptions({ showRollingAverage: this.checked });
            renderGraph();
        });
    }

    if (showRollingMaxCheckbox) {
        showRollingMaxCheckbox.addEventListener('change', function() {
            setGraphOptions({ showRollingMax: this.checked });
            renderGraph();
        });
    }

    if (showRollingMinCheckbox) {
        showRollingMinCheckbox.addEventListener('change', function() {
            setGraphOptions({ showRollingMin: this.checked });
            renderGraph();
        });
    }

    const timeRangeButtons = document.querySelectorAll('.time-range-button');
    timeRangeButtons.forEach(button => {
        button.addEventListener('click', function() {
            timeRangeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            setTimeRange(this.dataset.range);
            renderGraph();
        });
    });
}

function getCanvasScale(canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: canvas.width / rect.width,
        y: canvas.height / rect.height,
        rect
    };
}

function handleWheel(e) {
    e.preventDefault();

    const canvas = e.target;
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const viewState = getViewState();
    const oldZoom = viewState.zoom;
    const newZoom = Math.max(1, Math.min(10, oldZoom * zoomFactor));
    const ratio = newZoom / oldZoom;

    const graphWidth = canvas.width - 60 - 30;
    const graphHeight = canvas.height - 30 - 50;

    viewState.panX = viewState.panX * ratio - graphWidth / 2 * (ratio - 1);
    viewState.panY = viewState.panY * ratio + graphHeight / 2 * (ratio - 1);
    viewState.zoom = newZoom;
    setViewState(viewState);

    renderGraph();
}

function handleMouseDown(e) {
    setIsDragging(true);
    setLastMouseX(e.clientX);
    setLastMouseY(e.clientY);
    e.target.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    if (!getIsDragging()) return;

    const canvas = e.target;
    const { x: scaleX, y: scaleY } = getCanvasScale(canvas);

    const deltaX = (e.clientX - getLastMouseX()) * scaleX;
    const deltaY = (e.clientY - getLastMouseY()) * scaleY;

    const viewState = getViewState();
    viewState.panX += deltaX;
    viewState.panY += deltaY;
    setViewState(viewState);

    setLastMouseX(e.clientX);
    setLastMouseY(e.clientY);

    renderGraph();
}

function handleMouseUp(e) {
    setIsDragging(false);
    e.target.style.cursor = 'grab';
}

function handleMouseLeave(e) {
    setIsDragging(false);
    e.target.style.cursor = 'grab';
}

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        setIsDragging(true);
        setLastMouseX(e.touches[0].clientX);
        setLastMouseY(e.touches[0].clientY);
    } else if (e.touches.length === 2) {
        setIsDragging(false);
        const { distance, centerX, centerY } = calculateTouchMetrics(e.touches[0], e.touches[1]);
        setLastTouchDistance(distance);
        setLastTouchCenterX(centerX);
        setLastTouchCenterY(centerY);
    }
}

function handleTouchMove(e) {
    e.preventDefault();

    if (e.touches.length === 1 && getIsDragging()) {
        handleSingleTouchMove(e);
    } else if (e.touches.length === 2) {
        handlePinchZoom(e);
    }
}

function handleSingleTouchMove(e) {
    const canvas = e.target;
    const { x: scaleX, y: scaleY } = getCanvasScale(canvas);

    const deltaX = (e.touches[0].clientX - getLastMouseX()) * scaleX;
    const deltaY = (e.touches[0].clientY - getLastMouseY()) * scaleY;

    const viewState = getViewState();
    viewState.panX += deltaX;
    viewState.panY += deltaY;
    setViewState(viewState);

    setLastMouseX(e.touches[0].clientX);
    setLastMouseY(e.touches[0].clientY);

    renderGraph();
}

function handlePinchZoom(e) {
    const { distance, centerX, centerY } = calculateTouchMetrics(e.touches[0], e.touches[1]);

    const canvas = e.target;
    const oldZoom = getViewState().zoom;
    const zoomFactor = distance / getLastTouchDistance();
    const newZoom = Math.max(1, Math.min(10, oldZoom * zoomFactor));
    const ratio = newZoom / oldZoom;

    const graphWidth = canvas.width - 60 - 30;
    const graphHeight = canvas.height - 30 - 50;

    const viewState = getViewState();
    viewState.panX = viewState.panX * ratio - graphWidth / 2 * (ratio - 1);
    viewState.panY = viewState.panY * ratio + graphHeight / 2 * (ratio - 1);
    viewState.zoom = newZoom;
    setViewState(viewState);

    setLastTouchDistance(distance);
    setLastTouchCenterX(centerX);
    setLastTouchCenterY(centerY);

    renderGraph();
}

function calculateTouchMetrics(touch1, touch2) {
    const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;

    return { distance, centerX, centerY };
}

function handleTouchEnd() {
    setIsDragging(false);
}