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
    
    // Calculate min and max weights
    const weights = sortedHistory.map(entry => parseFloat(entry.weight));
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    
    // Round to nearest 5kg increments
    const weightMin5 = Math.floor(minWeight / 5) * 5;
    const weightMax5 = Math.ceil(maxWeight / 5) * 5;
    const weightRange5 = weightMax5 - weightMin5;
    
    // Calculate time range
    const dates = sortedHistory.map(entry => new Date(entry.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1;
    
    // Calculate graph area
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;
    
    // Draw horizontal grid lines every 5kg
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    const numWeightLines = Math.max(weightRange5 / 5, 1);
    for (let i = 0; i <= numWeightLines; i++) {
        const weightValue = weightMin5 + i * 5;
        const y = height - padding.bottom - ((weightValue - weightMin5) / weightRange5) * graphHeight;
        
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }
    
    // Draw thin horizontal lines for each kilogram
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.3;
    
    const numKgLines = Math.max(weightRange5, 1);
    for (let i = 0; i <= numKgLines; i++) {
        const weightValue = weightMin5 + i;
        const y = height - padding.bottom - ((weightValue - weightMin5) / weightRange5) * graphHeight;
        
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }
    
    // Draw vertical grid lines for months and years
    const minDateObj = new Date(minDate);
    const maxDateObj = new Date(maxDate);
    
    // Start from the first day of the month containing minDate
    const startDate = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
    // End at the last day of the month containing maxDate
    const endDate = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth() + 1, 0);
    
    // Iterate through each month
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const timeValue = currentDate.getTime();
        const x = padding.left + ((timeValue - minDate) / dateRange) * graphWidth;
        
        // Check if this is a year boundary (January)
        const isYearBoundary = currentDate.getMonth() === 0;
        
        if (isYearBoundary) {
            // Thicker line for year boundaries
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 1;
        } else {
            // Slimmer line for month boundaries
            ctx.strokeStyle = '#e8e8e8';
            ctx.lineWidth = 0.3;
        }
        
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Draw Y-axis labels (weight) - every 5kg
    ctx.fillStyle = '#333';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= numWeightLines; i++) {
        const weightValue = weightMin5 + i * 5;
        const y = height - padding.bottom - ((weightValue - weightMin5) / weightRange5) * graphHeight;
        ctx.fillText(weightValue.toFixed(0) + ' kg', padding.left - 8, y);
    }
    
    // Draw X-axis labels (dates) - show years at year boundaries
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Show year labels at year boundaries
    currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        if (currentDate.getMonth() === 0) {
            const timeValue = currentDate.getTime();
            const x = padding.left + ((timeValue - minDate) / dateRange) * graphWidth;
            const yearStr = currentDate.getFullYear().toString();
            ctx.fillText(yearStr, x, height - padding.bottom + 8);
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Draw data line
    if (sortedHistory.length > 1) {
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        
        sortedHistory.forEach((entry, index) => {
            const entryDate = new Date(entry.date).getTime();
            const x = padding.left + ((entryDate - minDate) / dateRange) * graphWidth;
            const weight = parseFloat(entry.weight);
            const y = height - padding.bottom - ((weight - weightMin5) / weightRange5) * graphHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }
    
    // Draw data points with black border
    sortedHistory.forEach((entry, index) => {
        const entryDate = new Date(entry.date).getTime();
        const x = sortedHistory.length > 1 
            ? padding.left + ((entryDate - minDate) / dateRange) * graphWidth
            : padding.left + graphWidth / 2;
        const weight = parseFloat(entry.weight);
        const y = height - padding.bottom - ((weight - weightMin5) / weightRange5) * graphHeight;
        
        // Draw black border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw orange fill
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    });
}