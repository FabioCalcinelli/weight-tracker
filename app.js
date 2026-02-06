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
    
    const list = document.getElementById('historyList');
    
    if (history.length === 0) {
        list.innerHTML = '<div class="empty-state">No weight entries yet. Start tracking!</div>';
    } else {
        list.innerHTML = history.map(entry => `
            <li>
                <span class="entry-date">${entry.date}</span>
                <span class="entry-weight">${entry.weight} kg</span>
            </li>
        `).join('');
    }
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

// Tab switching functionality
function switchTab(tabId) {
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Remove active class from all tab content panels
    document.querySelectorAll('.tab-content').forEach(panel => {
        panel.classList.remove('active');
    });

    // Add active class to clicked tab button
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Add active class to corresponding tab content panel
    document.getElementById(tabId).classList.add('active');

    // Render history when switching to history tab
    if (tabId === 'history') {
        renderHistory();
    }
}

// Add event listeners for tab buttons
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Set default date to today
    document.getElementById('dateInput').valueAsDate = new Date();
});

// Load history when app opens
renderHistory();