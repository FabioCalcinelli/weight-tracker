export function getWeightHistory() {
    return JSON.parse(localStorage.getItem('weightData')) || [];
}

export function saveWeightEntry(date, weight) {
    const history = getWeightHistory();
    history.push({ date, weight });
    localStorage.setItem('weightData', JSON.stringify(history));
}

export function saveHistory(history) {
    localStorage.setItem('weightData', JSON.stringify(history));
}