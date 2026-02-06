export function renderEmptyState(listElement) {
    listElement.innerHTML = '<div class="empty-state">No weight entries yet. Start tracking!</div>';
}

export function createHistoryEntryHTML(entry, index) {
    return `
        <li>
            <span class="entry-date">${entry.date}</span>
            <span class="entry-weight">${entry.weight} kg</span>
            <button class="delete-entry" data-index="${index}" title="Delete entry">×</button>
        </li>
    `;
}

export function renderHistoryEntries(listElement, history) {
    listElement.innerHTML = history.map((entry, index) => createHistoryEntryHTML(entry, index)).join('');
}

export function showSaveButtonFeedback() {
    const saveButton = document.querySelector('button.save');
    saveButton.classList.add('clicked');
    
    setTimeout(() => {
        saveButton.classList.remove('clicked');
    }, 1500);
}

export function clearWeightInput(weightInput) {
    weightInput.value = '';
}

export function validateWeightInput(weightInput, weightError) {
    const weight = weightInput.value.trim();
    
    if (weight === '' || isNaN(weight)) {
        weightError.textContent = 'Please enter a valid weight value.';
        weightInput.classList.add('error');
        return false;
    }
    
    return true;
}

export function clearWeightError(weightInput, weightError) {
    weightError.textContent = '';
    weightInput.classList.remove('error');
}