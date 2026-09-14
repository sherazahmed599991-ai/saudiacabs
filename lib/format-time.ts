/** Formats a 'HH:mm' or 'HH:mm:ss' string as 12-hour time (e.g. '14:30' -> '2:30 PM').
 *  Used by every printable document (Quotation/Invoice/Receipt) and their
 *  email routes so the same booking always displays the same way. */
export function formatTime12h(timeStr?: string | null): string {
    if (!timeStr) return '—';
    try {
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        if (isNaN(hours)) return timeStr;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    } catch {
        return timeStr;
    }
}
