export function getWeightHistory() {
    const history = JSON.parse(localStorage.getItem('weightData')) || [];
    // Normalize all weights to one decimal place when loading
    return history.map(entry => ({
        date: entry.date,
        weight: parseFloat(entry.weight).toFixed(1)
    }));
}

export function saveWeightEntry(date, weight) {
    const history = getWeightHistory();
    // Ensure weight is always stored with one decimal place
    const normalizedWeight = parseFloat(weight).toFixed(1);
    history.push({ date, weight: normalizedWeight });
    localStorage.setItem('weightData', JSON.stringify(history));
}

export function saveHistory(history) {
    // Normalize all weights to one decimal place before saving
    const normalizedHistory = history.map(entry => ({
        date: entry.date,
        weight: parseFloat(entry.weight).toFixed(1)
    }));
    localStorage.setItem('weightData', JSON.stringify(normalizedHistory));
}