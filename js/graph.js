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
    const padding = 40;
    
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
    const weightRange = maxWeight - minWeight || 1;
    
    // Calculate graph area
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw data points and line
    if (sortedHistory.length > 1) {
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        sortedHistory.forEach((entry, index) => {
            const x = padding + (index / (sortedHistory.length - 1)) * graphWidth;
            const weight = parseFloat(entry.weight);
            const y = height - padding - ((weight - minWeight) / weightRange) * graphHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }
    
    // Draw points
    sortedHistory.forEach((entry, index) => {
        const x = sortedHistory.length > 1 
            ? padding + (index / (sortedHistory.length - 1)) * graphWidth
            : width / 2;
        const weight = parseFloat(entry.weight);
        const y = height - padding - ((weight - minWeight) / weightRange) * graphHeight;
        
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}