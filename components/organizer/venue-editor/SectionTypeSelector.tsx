"use client";

import { Armchair, Users, Grid2X2, HelpCircle } from "lucide-react";

type SectionType = "SEATED" | "STANDING" | "MIXED";

interface SectionTypeSelectorProps {
    value: SectionType;
    onChange: (type: SectionType) => void;
    disabled?: boolean;
}

const SECTION_TYPES = [
    {
        type: "SEATED" as const,
        label: "Seated",
        description: "Kursi bernomor dengan posisi tetap",
        icon: Armchair,
        color: "indigo",
    },
    {
        type: "STANDING" as const,
        label: "Standing",
        description: "Area berdiri (Festival, GA)",
        icon: Users,
        color: "emerald",
    },
    {
        type: "MIXED" as const,
        label: "Mixed",
        description: "Kombinasi duduk dan berdiri",
        icon: Grid2X2,
        color: "amber",
    },
];

export function SectionTypeSelector({
    value,
    onChange,
    disabled = false,
}: SectionTypeSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Tipe Section
            </label>
            <div className="grid grid-cols-3 gap-2">
                {SECTION_TYPES.map(({ type, label, description, icon: Icon, color }) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => onChange(type)}
                        disabled={disabled}
                        className={`
                            relative p-3 rounded-lg border-2 transition-all text-left
                            ${value === type
                                ? `border-${color}-500 bg-${color}-50 ring-2 ring-${color}-200`
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }
                            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        `}
                        style={{
                            borderColor: value === type
                                ? (color === "indigo" ? "#6366f1" : color === "emerald" ? "#10b981" : "#f59e0b")
                                : undefined,
                            backgroundColor: value === type
                                ? (color === "indigo" ? "#eef2ff" : color === "emerald" ? "#ecfdf5" : "#fffbeb")
                                : undefined,
                        }}
                    >
                        <Icon
                            size={20}
                            className={value === type ? "text-gray-900" : "text-gray-400"}
                        />
                        <p className={`mt-1 text-sm font-medium ${value === type ? "text-gray-900" : "text-gray-700"}`}>
                            {label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                            {description}
                        </p>

                        {value === type && (
                            <div
                                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: color === "indigo" ? "#6366f1" : color === "emerald" ? "#10b981" : "#f59e0b"
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Help text based on selection */}
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                <HelpCircle size={14} className="mt-0.5 shrink-0" />
                {value === "SEATED" && (
                    <span>Customer akan memilih kursi spesifik saat checkout. Cocok untuk konser, teater, bioskop.</span>
                )}
                {value === "STANDING" && (
                    <span>Customer memilih jumlah tiket saja. Cocok untuk festival, club, konser standing.</span>
                )}
                {value === "MIXED" && (
                    <span>Kombinasi area duduk dan berdiri dalam satu section.</span>
                )}
            </div>
        </div>
    );
}

export default SectionTypeSelector;
