import { getWeightHistory } from './storage.js';

function generateExportFilename() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `weight_measurements_${day}_${month}_${year}.csv`;
}

function formatCSVRow(entry) {
    return `"${entry.weight}","=""${entry.date}"""`;
}

function buildCSVContent(history) {
    const header = 'Weight (kg),Date (YYYY-MM-DD)\n';
    const rows = history.map(formatCSVRow).join('\n');
    return header + rows;
}

function downloadCSVFile(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToCSV() {
    const history = getWeightHistory();
    
    if (history.length === 0) {
        alert('No weight data to export.');
        return;
    }
    
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    const csvContent = buildCSVContent(sortedHistory);
    const filename = generateExportFilename();
    
    downloadCSVFile(csvContent, filename);
}

function parseExcelCSVLine(line) {
    const matches = line.match(/^"([^"]*)","=""([^"]*)"""/);
    if (matches && matches.length === 3) {
        return { weight: matches[1], date: matches[2] };
    }
    return null;
}

function parseStandardCSVLine(line) {
    const matches = line.match(/^"([^"]*)","([^"]*)"$/);
    if (matches && matches.length === 3) {
        return { weight: matches[1], date: matches[2] };
    }
    return null;
}

function isValidEntry(entry) {
    return entry.weight && entry.date && !isNaN(parseFloat(entry.weight));
}

function parseCSVLine(line) {
    let entry = parseExcelCSVLine(line);
    if (!entry) {
        entry = parseStandardCSVLine(line);
    }
    return entry && isValidEntry(entry) ? entry : null;
}

function parseCSVLines(lines) {
    const entries = [];
    let errorCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        try {
            const entry = parseCSVLine(line);
            if (entry) {
                entries.push(entry);
            } else {
                errorCount++;
            }
        } catch {
            errorCount++;
        }
    }
    
    return { entries, errorCount };
}

function isDuplicateEntry(existing, imported) {
    return existing.date === imported.date && existing.weight === imported.weight;
}

function mergeHistories(existingHistory, importedEntries) {
    const merged = [...existingHistory];
    
    importedEntries.forEach(imported => {
        const exists = merged.some(existing => isDuplicateEntry(existing, imported));
        if (!exists) {
            merged.push(imported);
        }
    });
    
    return merged;
}

function handleImportSuccess(importedEntries, errorCount, getWeightHistory, saveHistory, renderHistory) {
    const confirmMessage = `Found ${importedEntries.length} valid entries${errorCount > 0 ? ` (${errorCount} invalid entries skipped)` : ''}.\n\nDo you want to import these entries? This will merge with existing data.`;
    
    if (confirm(confirmMessage)) {
        const existingHistory = getWeightHistory();
        const mergedHistory = mergeHistories(existingHistory, importedEntries);
        
        saveHistory(mergedHistory);
        renderHistory();
        
        alert(`Successfully imported ${importedEntries.length} entries!`);
    }
}

export function importFromCSV(file, getWeightHistory, saveHistory, renderHistory) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const csvText = e.target.result;
        const lines = csvText.split('\n');
        
        if (lines.length < 2) {
            alert('CSV file is empty or invalid.');
            return;
        }
        
        const { entries, errorCount } = parseCSVLines(lines);
        
        if (entries.length === 0) {
            alert('No valid entries found in the CSV file.');
            return;
        }
        
        handleImportSuccess(entries, errorCount, getWeightHistory, saveHistory, renderHistory);
    };
    
    reader.onerror = function() {
        alert('Error reading the CSV file.');
    };
    
    reader.readAsText(file);
}