let viewState = { zoom: 1, panX: 0, panY: 0 };
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let lastTouchDistance = 0;
let lastTouchCenterX = 0;
let lastTouchCenterY = 0;

let graphOptions = {
    showDataPoints: true,
    showDataLine: true,
    showRollingAverage: false,
    showRollingMax: false,
    showRollingMin: false
};

let timeRange = 'all';

export function getViewState() {
    return viewState;
}

export function setViewState(newState) {
    viewState = newState;
}

export function getGraphOptions() {
    return graphOptions;
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
}

export function getTimeRange() {
    return timeRange;
}

export function setTimeRange(range) {
    timeRange = range;
    viewState = { zoom: 1, panX: 0, panY: 0 };
}

export function getIsDragging() {
    return isDragging;
}

export function setIsDragging(value) {
    isDragging = value;
}

export function getLastMouseX() {
    return lastMouseX;
}

export function setLastMouseX(value) {
    lastMouseX = value;
}

export function getLastMouseY() {
    return lastMouseY;
}

export function setLastMouseY(value) {
    lastMouseY = value;
}

export function getLastTouchDistance() {
    return lastTouchDistance;
}

export function setLastTouchDistance(value) {
    lastTouchDistance = value;
}

export function getLastTouchCenterX() {
    return lastTouchCenterX;
}

export function setLastTouchCenterX(value) {
    lastTouchCenterX = value;
}

export function getLastTouchCenterY() {
    return lastTouchCenterY;
}

export function setLastTouchCenterY(value) {
    lastTouchCenterY = value;
}