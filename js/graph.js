import { getWeightHistory } from './storage.js';

export function renderGraph() {
    const canvas = document.getElementById('weightGraph');
    if (!canvas) return;
    
    const history = getWeightHistory();
    
    // Sort history by date ascending for the graph
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Set canvas size
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 300;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 30, right: 30, bottom: 50, left: 60 };
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    if (sortedHistory.length === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data to display', width / 2, height / 2);
        return;
    }
    
    // Calculate min and max weights with some padding
    const weights = sortedHistory.map(entry => parseFloat(entry.weight));
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight || 1;
    const weightPadding = weightRange * 0.1;
    const adjustedMin = minWeight - weightPadding;
    const adjustedMax = maxWeight + weightPadding;
    const adjustedRange = adjustedMax - adjustedMin;
    
    // Calculate time range
    const dates = sortedHistory.map(entry => new Date(entry.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1;
    
    // Calculate graph area
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;
    
    // Draw light grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines (5 lines)
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (i / 5) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }
    
    // Vertical grid lines (5 lines)
    for (let i = 0; i <= 5; i++) {
        const x = padding.left + (i / 5) * graphWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Draw Y-axis labels (weight)
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (i / 5) * graphHeight;
        const weightValue = adjustedMax - (i / 5) * adjustedRange;
        ctx.fillText(weightValue.toFixed(1) + ' kg', padding.left - 8, y);
    }
    
    // Draw X-axis labels (dates) - evenly spaced based on time
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    for (let i = 0; i <= 5; i++) {
        const x = padding.left + (i / 5) * graphWidth;
        const timeValue = minDate + (i / 5) * dateRange;
        const date = new Date(timeValue);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(dateStr, x, height - padding.bottom + 8);
    }
    
    // Draw data line
    if (sortedHistory.length > 1) {
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        sortedHistory.forEach((entry, index) => {
            const entryDate = new Date(entry.date).getTime();
            const x = padding.left + ((entryDate - minDate) / dateRange) * graphWidth;
            const weight = parseFloat(entry.weight);
            const y = height - padding.bottom - ((weight - adjustedMin) / adjustedRange) * graphHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }
    
    // Draw data points
    sortedHistory.forEach((entry, index) => {
        const entryDate = new Date(entry.date).getTime();
        const x = sortedHistory.length > 1 
            ? padding.left + ((entryDate - minDate) / dateRange) * graphWidth
            : padding.left + graphWidth / 2;
        const weight = parseFloat(entry.weight);
        const y = height - padding.bottom - ((weight - adjustedMin) / adjustedRange) * graphHeight;
        
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
        ctx.fill();
    });
}