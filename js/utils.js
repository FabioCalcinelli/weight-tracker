export function formatDate(dateInput) {
    const dateObj = new Date(dateInput);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
}

export function parseDate(dateStr) {
    // Check if date is in YYYY-MM-DD format (from CSV import)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-');
        return new Date(year, month - 1, day);
    }
    // Otherwise, assume DD-MM-YYYY format (from manual entry)
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