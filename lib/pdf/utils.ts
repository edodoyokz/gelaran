export function formatVoucherDate(date: Date): string {
    // Format: 15 JUN 2025
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).toUpperCase();
}

export function formatVoucherTime(date: Date): string {
    // Format: 15:00
    return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export function formatVoucherDateTimeRange(
    scheduleDate: Date,
    startTime: Date,
    endTime?: Date
): string {
    // Format: 15 JUN 2025 15:00 – 23:00
    const dateStr = formatVoucherDate(scheduleDate);
    const timeStr = formatVoucherTime(startTime);
    const endTimeStr = endTime ? formatVoucherTime(endTime) : "23:00"; // Default or calculated

    return `${dateStr} ${timeStr} – ${endTimeStr}`;
}
