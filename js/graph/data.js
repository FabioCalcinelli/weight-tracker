import { getTimeRange } from './state.js';

export function extractData(sortedHistory) {
    const weights = sortedHistory.map(entry => parseFloat(entry.weight));
    const dates = sortedHistory.map(entry => new Date(entry.date).getTime());
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1;

    return { weights, dates, minWeight, maxWeight, minDate, maxDate, dateRange };
}

export function calculateFullDateRange(sortedHistory) {
    if (sortedHistory.length === 0) return 1;

    const dates = sortedHistory.map(entry => new Date(entry.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);

    return maxDate - minDate || 1;
}

export function calculateEffectiveZoom(fullDateRange, filteredDateRange, zoom) {
    let effectiveZoom = zoom;
    const zoomRatio = fullDateRange / filteredDateRange;
    effectiveZoom *= zoomRatio;

    return effectiveZoom;
}

export function filterByTimeRange(sortedHistory) {
    const timeRange = getTimeRange();
    if (timeRange === 'all') {
        return sortedHistory;
    }

    const now = new Date();
    let startDate;

    if (timeRange === 'year') {
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    } else if (timeRange === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    return sortedHistory.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= now;
    });
}

export function calculateWeightRange(minWeight, maxWeight) {
    const weightMin5 = Math.floor(minWeight / 5) * 5;
    const weightMax5 = Math.ceil(maxWeight / 5) * 5;
    const weightRange5 = weightMax5 - weightMin5;

    return { weightMin5, weightMax5, weightRange5 };
}

export function calculateGraphDimensions(width, height, padding, zoom) {
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;
    const effectiveGraphWidth = graphWidth * zoom;
    const effectiveGraphHeight = graphHeight * zoom;

    return { graphWidth, graphHeight, effectiveGraphWidth, effectiveGraphHeight };
}

export function clampPanValues(graphWidth, graphHeight, effectiveGraphWidth, effectiveGraphHeight, viewState) {
    const maxPanX = Math.max(0, effectiveGraphWidth - graphWidth);
    viewState.panX = Math.max(-maxPanX, Math.min(0, viewState.panX));

    const maxPanY = Math.max(0, effectiveGraphHeight - graphHeight);
    viewState.panY = Math.max(0, Math.min(maxPanY, viewState.panY));
}

export function calculateRollingStatistics(sortedHistory, windowDays = 10) {
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

export function getDateRange(minDate, maxDate) {
    const minDateObj = new Date(minDate);
    const maxDateObj = new Date(maxDate);

    const startDate = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
    const endDate = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth() + 1, 0);

    return { startDate, endDate };
}