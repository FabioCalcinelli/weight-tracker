export function deactivateAllTabs() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(panel => {
        panel.classList.remove('active');
    });
}

export function activateTab(tabId) {
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

export function switchTab(tabId) {
    deactivateAllTabs();
    activateTab(tabId);
    
    if (tabId === 'history') {
        // Import and call renderHistory from app.js
        import('./app.js').then(module => {
            module.renderHistory();
        });
    }
    
    if (tabId === 'graph') {
        // Import and call renderGraph from graph.js
        import('./graph.js').then(module => {
            module.renderGraph();
        });
    }
}

export function initializeTabButtons() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}