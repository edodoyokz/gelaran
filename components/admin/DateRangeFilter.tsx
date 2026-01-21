"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

export type DateRangePreset = "7d" | "30d" | "90d" | "this_month" | "last_month" | "custom";

interface DateRange {
    from: Date;
    to: Date;
    preset?: DateRangePreset;
}

interface DateRangeFilterProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

const PRESET_LABELS: Record<DateRangePreset, string> = {
    "7d": "7 Hari Terakhir",
    "30d": "30 Hari Terakhir",
    "90d": "90 Hari Terakhir",
    "this_month": "Bulan Ini",
    "last_month": "Bulan Lalu",
    custom: "Custom",
};

function getFirstDayOfCurrentMonth(): Date {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
}

function getLastMonthRange(): { from: Date; to: Date } {
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
    
    const to = new Date();
    to.setDate(0);
    to.setHours(23, 59, 59, 999);
    
    return { from, to };
}

function getPresetRange(preset: DateRangePreset): DateRange {
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    
    const from = new Date();
    from.setHours(0, 0, 0, 0);

    switch (preset) {
        case "7d":
            from.setDate(from.getDate() - 7);
            break;
        case "30d":
            from.setDate(from.getDate() - 30);
            break;
        case "90d":
            from.setDate(from.getDate() - 90);
            break;
        case "this_month":
            return { from: getFirstDayOfCurrentMonth(), to, preset };
        case "last_month": {
            const lastMonth = getLastMonthRange();
            return { from: lastMonth.from, to: lastMonth.to, preset };
        }
        default:
            from.setDate(from.getDate() - 30);
    }

    return { from, to, preset };
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    const presets: DateRangePreset[] = ["7d", "30d", "90d", "this_month", "last_month"];

    const handlePresetClick = (preset: DateRangePreset) => {
        if (preset === "custom") {
            setIsOpen(true);
            return;
        }

        setIsOpen(false);
        const range = getPresetRange(preset);
        onChange(range);
    };

    const handleCustomApply = () => {
        if (!customFrom || !customTo) return;

        const from = new Date(customFrom);
        from.setHours(0, 0, 0, 0);
        
        const to = new Date(customTo);
        to.setHours(23, 59, 59, 999);

        setIsOpen(false);
        onChange({ from, to, preset: "custom" });
    };

    const formatDateDisplay = () => {
        if (value.preset && value.preset !== "custom") {
            return PRESET_LABELS[value.preset];
        }

        if (value.preset === "custom" || !value.preset) {
            return `${value.from.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${value.to.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`;
        }

        return PRESET_LABELS["30d"];
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-gray-200 rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-gray-50 transition-colors"
            >
                <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                <span>{formatDateDisplay()}</span>
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            </button>

            {isOpen && (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close date filter"
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--surface)] rounded-xl shadow-lg border border-gray-200 p-4 min-w-[280px]">
                        <div className="space-y-2 mb-4">
                            <p className="text-sm font-medium text-[var(--text-primary)]">Pilih Periode</p>
                            <div className="space-y-1">
                                {presets.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => handlePresetClick(preset)}
                                        className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            value.preset === preset
                                                ? "bg-[var(--accent-primary)] bg-opacity-10 text-[var(--accent-primary)]"
                                                : "text-[var(--text-primary)] hover:bg-gray-100"
                                        }`}
                                    >
                                        {PRESET_LABELS[preset]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-gray-200">
                            <p className="text-sm font-medium text-[var(--text-primary)]">Custom Range</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="date-from" className="block text-xs text-[var(--text-muted)] mb-1">
                                        Dari
                                    </label>
                                    <input
                                        id="date-from"
                                        type="date"
                                        value={customFrom}
                                        onChange={(e) => setCustomFrom(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="date-to" className="block text-xs text-[var(--text-muted)] mb-1">
                                        Sampai
                                    </label>
                                    <input
                                        id="date-to"
                                        type="date"
                                        value={customTo}
                                        onChange={(e) => setCustomTo(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCustomApply}
                                disabled={!customFrom || !customTo}
                                className="w-full py-2 bg-[var(--accent-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
