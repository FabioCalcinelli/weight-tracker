import { getWeightHistory } from './storage.js';

// CSV Export Function
export function exportToCSV() {
    const history = getWeightHistory();
    
    if (history.length === 0) {
        alert('No weight data to export.');
        return;
    }
    
    // Sort history by date ascending for export (oldest first)
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Create CSV header
    let csvContent = 'Weight (kg),Date (YYYY-MM-DD)\n';
    
    // Add data rows
    sortedHistory.forEach(entry => {
        // Format: "weight","=""date""" (Excel-compatible format)
        csvContent += `"${entry.weight}","=""${entry.date}"""\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with current date in dd-mm-yyyy format
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}_${month}_${year}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `weight_measurements_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// CSV Import Function
export function importFromCSV(file, getWeightHistory, saveHistory, renderHistory) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const csvText = e.target.result;
        const lines = csvText.split('\n');
        
        if (lines.length < 2) {
            alert('CSV file is empty or invalid.');
            return;
        }
        
        const importedEntries = [];
        let errorCount = 0;
        
        // Skip header row (index 0), start from index 1
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            try {
                // Parse CSV line with quotes
                // Format: "weight","=""date"""
                const matches = line.match(/^"([^"]*)","=""([^"]*)"""/);
                
                if (matches && matches.length === 3) {
                    const weight = matches[1];
                    const date = matches[2];
                    
                    // Validate weight and date
                    if (weight && date && !isNaN(parseFloat(weight))) {
                        importedEntries.push({ date, weight });
                    } else {
                        errorCount++;
                    }
                } else {
                    // Try alternative format without Excel-style date formatting
                    const altMatches = line.match(/^"([^"]*)","([^"]*)"$/);
                    if (altMatches && altMatches.length === 3) {
                        const weight = altMatches[1];
                        const date = altMatches[2];
                        
                        if (weight && date && !isNaN(parseFloat(weight))) {
                            importedEntries.push({ date, weight });
                        } else {
                            errorCount++;
                        }
                    } else {
                        errorCount++;
                    }
                }
            } catch (err) {
                errorCount++;
            }
        }
        
        if (importedEntries.length === 0) {
            alert('No valid entries found in the CSV file.');
            return;
        }
        
        // Confirm import
        const confirmMessage = `Found ${importedEntries.length} valid entries${errorCount > 0 ? ` (${errorCount} invalid entries skipped)` : ''}.\n\nDo you want to import these entries? This will merge with existing data.`;
        
        if (confirm(confirmMessage)) {
            // Get existing history
            const existingHistory = getWeightHistory();
            
            // Merge entries, avoiding duplicates (same date and weight)
            const mergedHistory = [...existingHistory];
            importedEntries.forEach(imported => {
                const exists = mergedHistory.some(
                    existing => existing.date === imported.date && existing.weight === imported.weight
                );
                if (!exists) {
                    mergedHistory.push(imported);
                }
            });
            
            // Save merged history
            saveHistory(mergedHistory);
            renderHistory();
            
            alert(`Successfully imported ${importedEntries.length} entries!`);
        }
    };
    
    reader.onerror = function() {
        alert('Error reading the CSV file.');
    };
    
    reader.readAsText(file);
}