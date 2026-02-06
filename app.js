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
    // Attach event listener for save button
    const saveButton = document.querySelector('button.save');
    if (saveButton) {
        saveButton.addEventListener('click', saveWeight);
    }
    
    // Attach event listener for clear button
    const clearButton = document.querySelector('button.clear');
    if (clearButton) {
        clearButton.addEventListener('click', clearHistory);
    }
    
    // Attach event listener for delete buttons using event delegation
    const historyList = document.getElementById('historyList');
    if (historyList) {
        historyList.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-entry')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                deleteWeight(index);
            }
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