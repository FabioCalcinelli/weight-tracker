import { getWeightHistory } from './storage.js';
import { getViewState, getGraphOptions, setGraphOptions, setTimeRange } from './graph/state.js';
import { extractData, calculateFullDateRange, calculateEffectiveZoom, filterByTimeRange, calculateWeightRange, calculateGraphDimensions, clampPanValues } from './graph/data.js';
import { setupCanvas, drawBackground, drawNoDataMessage, setClippingRegion, drawGrid, drawDataLine, drawDataPoints, drawRollingAverageLine, drawRollingMaxLine, drawRollingMinLine, drawAxes, drawYAxisLabels, drawXAxisLabels } from './graph/rendering.js';
import { setupGraphInteractions, setRenderGraph } from './graph/interactions.js';

function renderGraph() {
    const canvas = document.getElementById('weightGraph');
    if (!canvas) return;

    const history = getWeightHistory();
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    const filteredHistory = filterByTimeRange(sortedHistory);
    const { ctx, width, height, padding } = setupCanvas(canvas);
    const { weights, dates, minWeight, maxWeight, minDate, maxDate, dateRange } = extractData(filteredHistory);
    const { weightMin5, weightMax5, weightRange5 } = calculateWeightRange(minWeight, maxWeight);
    const { graphWidth, graphHeight, effectiveGraphWidth, effectiveGraphHeight } = calculateGraphDimensions(width, height, padding, getViewState().zoom);

    const fullDateRange = calculateFullDateRange(sortedHistory);
    const effectiveZoom = calculateEffectiveZoom(fullDateRange, dateRange, getViewState().zoom);

    clampPanValues(graphWidth, graphHeight, effectiveGraphWidth, effectiveGraphHeight, getViewState());

    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, width, height);

    if (filteredHistory.length === 0) {
        drawNoDataMessage(ctx, width, height);
        return;
    }

    ctx.save();
    setClippingRegion(ctx, padding, graphWidth, graphHeight);
    drawGrid(ctx, padding, width, height, weightMin5, weightRange5, minDate, maxDate, dateRange, effectiveGraphWidth, effectiveGraphHeight, effectiveZoom);
    if (getGraphOptions().showDataLine) {
        drawDataLine(ctx, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    }
    if (getGraphOptions().showRollingAverage) {
        drawRollingAverageLine(ctx, sortedHistory, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    }
    if (getGraphOptions().showRollingMax) {
        drawRollingMaxLine(ctx, sortedHistory, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    }
    if (getGraphOptions().showRollingMin) {
        drawRollingMinLine(ctx, sortedHistory, filteredHistory, padding, height, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    }
    if (getGraphOptions().showDataPoints) {
        drawDataPoints(ctx, filteredHistory, padding, height, graphWidth, weightMin5, weightRange5, minDate, dateRange, effectiveGraphWidth, effectiveGraphHeight);
    }
    ctx.restore();

    drawAxes(ctx, padding, width, height);
    drawYAxisLabels(ctx, padding, height, weightMin5, weightRange5, effectiveGraphHeight, effectiveZoom);
    drawXAxisLabels(ctx, padding, height, minDate, maxDate, dateRange, effectiveGraphWidth, effectiveZoom);
}

setRenderGraph(renderGraph);

export { renderGraph, setupGraphInteractions, setGraphOptions, setTimeRange };