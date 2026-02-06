let lastSaveTime = 0;
const SAVE_COOLDOWN = 1500;

function formatDate(dateInput) {
    const dateObj = new Date(dateInput);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
}

function isSaveCooldownActive() {
    return Date.now() - lastSaveTime < SAVE_COOLDOWN;
}

function validateWeightInput(weightInput, weightError) {
    const weight = weightInput.value.trim();
    
    if (weight === '' || isNaN(weight)) {
        weightError.textContent = 'Please enter a valid weight value.';
        weightInput.classList.add('error');
        return false;
    }
    
    return true;
}

function clearWeightError(weightInput, weightError) {
    weightError.textContent = '';
    weightInput.classList.remove('error');
}

function showSaveButtonFeedback() {
    const saveButton = document.querySelector('button.save');
    saveButton.classList.add('clicked');
    
    setTimeout(() => {
        saveButton.classList.remove('clicked');
    }, SAVE_COOLDOWN);
}

function getWeightHistory() {
    return JSON.parse(localStorage.getItem('weightData')) || [];
}

function saveWeightEntry(date, weight) {
    const history = getWeightHistory();
    history.push({ date, weight });
    localStorage.setItem('weightData', JSON.stringify(history));
}

function clearWeightInput(weightInput) {
    weightInput.value = '';
}

function saveWeight() {
    if (isSaveCooldownActive()) {
        return;
    }
    
    const weightInput = document.getElementById('weightInput');
    const weightError = document.getElementById('weightError');
    
    if (!validateWeightInput(weightInput, weightError)) {
        return;
    }
    
    clearWeightError(weightInput, weightError);
    lastSaveTime = Date.now();
    
    showSaveButtonFeedback();
    
    const dateInput = document.getElementById('dateInput').value;
    const date = formatDate(dateInput);
    const weight = weightInput.value.trim();
    
    saveWeightEntry(date, weight);
    renderHistory();
    clearWeightInput(weightInput);
}

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('-');
    return new Date(year, month - 1, day);
}

function sortHistoryByDateDesc(history) {
    return history.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA;
    });
}

function getSortedHistory() {
    const history = getWeightHistory();
    return sortHistoryByDateDesc([...history]);
}

function renderEmptyState(listElement) {
    listElement.innerHTML = '<div class="empty-state">No weight entries yet. Start tracking!</div>';
}

function createHistoryEntryHTML(entry, index) {
    return `
        <li>
            <span class="entry-date">${entry.date}</span>
            <span class="entry-weight">${entry.weight} kg</span>
            <button class="delete-entry" onclick="deleteWeight(${index})" title="Delete entry">×</button>
        </li>
    `;
}

function renderHistoryEntries(listElement, history) {
    listElement.innerHTML = history.map((entry, index) => createHistoryEntryHTML(entry, index)).join('');
}

function renderHistory() {
    const list = document.getElementById('historyList');
    const history = getSortedHistory();
    
    if (history.length === 0) {
        renderEmptyState(list);
    } else {
        renderHistoryEntries(list, history);
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all weight history?')) {
        localStorage.removeItem('weightData');
        renderHistory();
    }
}

function saveHistory(history) {
    localStorage.setItem('weightData', JSON.stringify(history));
}

function deleteWeight(index) {
    const history = getSortedHistory();
    history.splice(index, 1);
    saveHistory(history);
    renderHistory();
}

function deactivateAllTabs() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(panel => {
        panel.classList.remove('active');
    });
}

function activateTab(tabId) {
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function switchTab(tabId) {
    deactivateAllTabs();
    activateTab(tabId);
    
    if (tabId === 'history') {
        renderHistory();
    }
}

function initializeTabButtons() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function setTodayAsDefaultDate() {
    document.getElementById('dateInput').valueAsDate = new Date();
}

function setupWeightInputErrorClearing() {
    const weightInput = document.getElementById('weightInput');
    const weightError = document.getElementById('weightError');
    
    weightInput.addEventListener('input', function() {
        if (weightError.textContent !== '') {
            clearWeightError(weightInput, weightError);
        }
    });
}

function initializeApp() {
    initializeTabButtons();
    setTodayAsDefaultDate();
    setupWeightInputErrorClearing();
}

document.addEventListener('DOMContentLoaded', initializeApp);
renderHistory();