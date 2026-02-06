function getDate(dateInput) {
    const dateObj = new Date(dateInput);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
}

function saveWeight() {
    const weight = document.getElementById('weightInput').value;
    const dateInput = document.getElementById('dateInput').value;
    const date = getDate(dateInput);

    let history = JSON.parse(localStorage.getItem('weightData')) || [];

    history.push({ date, weight });

    localStorage.setItem('weightData', JSON.stringify(history));

    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('weightData')) || [];
    
    history.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA;
    });
    
    const list = document.getElementById('history');
    list.innerHTML = history.map(entry => `<li>${entry.date}: ${entry.weight}kg</li>`).join('');
}

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('-');
    return new Date(year, month - 1, day);
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all weight history?')) {
        localStorage.removeItem('weightData');
        renderHistory();
    }
}

// Load history when app opens
renderHistory();