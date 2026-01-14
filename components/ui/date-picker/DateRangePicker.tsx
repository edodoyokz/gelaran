"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

export type DateRangePreset = "7d" | "30d" | "90d" | "custom";

interface DateRange {
    from: Date;
    to: Date;
}

interface DateRangePickerProps {
    value?: DateRange;
    onChange?: (range: DateRange, preset: DateRangePreset) => void;
    presets?: DateRangePreset[];
    className?: string;
}

const PRESET_LABELS: Record<DateRangePreset, string> = {
    "7d": "7 Hari",
    "30d": "30 Hari",
    "90d": "3 Bulan",
    custom: "Custom",
};

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
        default:
            from.setDate(from.getDate() - 30);
    }

    return { from, to };
}

export function DateRangePicker({
    value,
    onChange,
    presets = ["7d", "30d", "90d"],
    className = "",
}: DateRangePickerProps) {
    const [activePreset, setActivePreset] = useState<DateRangePreset>("30d");
    const [isOpen, setIsOpen] = useState(false);
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    const handlePresetClick = (preset: DateRangePreset) => {
        if (preset === "custom") {
            setIsOpen(true);
            return;
        }

        setActivePreset(preset);
        setIsOpen(false);
        const range = getPresetRange(preset);
        onChange?.(range, preset);
    };

    const handleCustomApply = () => {
        if (!customFrom || !customTo) return;

        const from = new Date(customFrom);
        from.setHours(0, 0, 0, 0);
        
        const to = new Date(customTo);
        to.setHours(23, 59, 59, 999);

        setActivePreset("custom");
        setIsOpen(false);
        onChange?.({ from, to }, "custom");
    };

    const formatDateDisplay = () => {
        if (!value) {
            return PRESET_LABELS[activePreset];
        }
        
        if (activePreset !== "custom") {
            return PRESET_LABELS[activePreset];
        }

        return `${value.from.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${value.to.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`;
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {presets.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => handlePresetClick(preset)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                activePreset === preset
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            {PRESET_LABELS[preset]}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                            activePreset === "custom"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        Custom
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="sm:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <Calendar className="w-4 h-4" />
                    {formatDateDisplay()}
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-[280px]">
                        <div className="sm:hidden grid grid-cols-3 gap-2 mb-4">
                            {presets.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => handlePresetClick(preset)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        activePreset === preset
                                            ? "bg-indigo-100 text-indigo-700"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {PRESET_LABELS[preset]}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">Custom Range</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="date-from" className="block text-xs text-gray-500 mb-1">
                                        Dari
                                    </label>
                                    <input
                                        id="date-from"
                                        type="date"
                                        value={customFrom}
                                        onChange={(e) => setCustomFrom(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="date-to" className="block text-xs text-gray-500 mb-1">
                                        Sampai
                                    </label>
                                    <input
                                        id="date-to"
                                        type="date"
                                        value={customTo}
                                        onChange={(e) => setCustomTo(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCustomApply}
                                disabled={!customFrom || !customTo}
                                className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
