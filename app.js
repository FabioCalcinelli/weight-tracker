function saveWeight() {
    const weight = document.getElementById('weightInput').value;
    const date = new Date().toLocaleDateString();

    // Get existing data or start an empty array
    let history = JSON.parse(localStorage.getItem('weightData')) || [];

    // Add new entry
    history.push({ date, weight });

    // Save back to phone's memory
    localStorage.setItem('weightData', JSON.stringify(history));

    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('weightData')) || [];
    const list = document.getElementById('history');
    list.innerHTML = history.map(entry => `<li>${entry.date}: ${entry.weight}kg</li>`).join('');
}

// Load history when app opens
renderHistory();