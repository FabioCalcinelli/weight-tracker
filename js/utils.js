export function formatDate(dateInput) {
    if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateInput;
    }
    
    const dateObj = new Date(dateInput);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function parseDate(dateStr) {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-');
        return new Date(year, month - 1, day);
    }
    const [day, month, year] = dateStr.split('-');
    return new Date(year, month - 1, day);
}

export function sortHistoryByDateDesc(history) {
    return history.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA;
    });
}