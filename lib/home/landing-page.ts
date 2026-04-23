import { formatCurrency } from "@/lib/utils";

export interface LandingEventSchedule {
    scheduleDate: string;
    startTime: string;
    endTime: string;
}

const LANDING_LOCALE = "id-ID";
const LANDING_TIME_ZONE = "Asia/Jakarta";

export function formatLandingEventDate(schedule: LandingEventSchedule | null): string {
    if (!schedule) return "Segera";

    return new Intl.DateTimeFormat(LANDING_LOCALE, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: LANDING_TIME_ZONE,
    }).format(new Date(schedule.scheduleDate));
}

export function formatLandingEventTime(schedule: LandingEventSchedule | null): string {
    if (!schedule) return "";

    return `${new Intl.DateTimeFormat(LANDING_LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: LANDING_TIME_ZONE,
    }).format(new Date(schedule.startTime))} WIB`;
}

export function formatLandingEventPrice(price: number | null): string {
    if (!price || price <= 0) return "Gratis";

    return formatCurrency(price);
}
