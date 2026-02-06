import { formatDate, sortHistoryByDateDesc } from './utils.js';
import { getWeightHistory, saveWeightEntry, saveHistory } from './storage.js';
import { 
    renderEmptyState, 
    renderHistoryEntries,
    showSaveButtonFeedback,
    clearWeightInput,
    validateWeightInput,
    clearWeightError
} from './ui.js';
import { initializeTabButtons } from './tabs.js';
import { exportToCSV, importFromCSV } from './csv.js';

let lastSaveTime = 0;
const SAVE_COOLDOWN = 1500;

function isSaveCooldownActive() {
    return Date.now() - lastSaveTime < SAVE_COOLDOWN;
}

function getSortedHistory() {
    const history = getWeightHistory();
    return sortHistoryByDateDesc([...history]);
}

export function renderHistory() {
    const list = document.getElementById('historyList');
    const history = getSortedHistory();
    
    if (history.length === 0) {
        renderEmptyState(list);
    } else {
        renderHistoryEntries(list, history);
    }
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

function clearHistory() {
    if (confirm('Are you sure you want to clear all weight history?')) {
        localStorage.removeItem('weightData');
        renderHistory();
    }
}

function deleteWeight(index) {
    const history = getSortedHistory();
    history.splice(index, 1);
    saveHistory(history);
    renderHistory();
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

function setupEventListeners() {
    const saveButton = document.querySelector('button.save');
    if (saveButton) {
        saveButton.addEventListener('click', saveWeight);
    }
    
    const clearButton = document.querySelector('button.clear');
    if (clearButton) {
        clearButton.addEventListener('click', clearHistory);
    }
    
    const historyList = document.getElementById('historyList');
    if (historyList) {
        historyList.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-entry')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                deleteWeight(index);
            }
        });
    }
    
    const importButton = document.getElementById('importButton');
    const importFileInput = document.getElementById('importFileInput');
    if (importButton && importFileInput) {
        importButton.addEventListener('click', function() {
            importFileInput.click();
        });
    }
    
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            exportToCSV();
        });
    }
    
    if (importFileInput) {
        importFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                importFromCSV(file, getWeightHistory, saveHistory, renderHistory);
            }
            // Reset the input so the same file can be selected again if needed
            e.target.value = '';
        });
    }
}

function initializeApp() {
    initializeTabButtons();
    setTodayAsDefaultDate();
    setupWeightInputErrorClearing();
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', initializeApp);
renderHistory();