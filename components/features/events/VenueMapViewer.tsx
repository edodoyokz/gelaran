"use client";

import { useState, useEffect } from "react";
import { MapPin, Users, Armchair, Info, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Seat {
    id: string;
    seatLabel: string;
    seatNumber: number;
    status: string;
    isAccessible: boolean;
    ticketTypeId: string | null;
}

interface Row {
    id: string;
    rowLabel: string;
    sortOrder: number;
    seats: Seat[];
}

interface TicketType {
    id: string;
    name: string;
    basePrice: number;
    isFree: boolean;
}

interface Section {
    id: string;
    name: string;
    colorHex: string | null;
    capacity: number | null;
    sortOrder: number;
    ticketTypes: TicketType[];
    stats: {
        totalSeats: number;
        availableSeats: number;
        bookedSeats: number;
    };
    rows: Row[];
}

interface VenueMapData {
    hasSeatingChart: boolean;
    eventTitle?: string;
    sections: Section[];
    ticketTypes?: TicketType[];
}

interface VenueMapViewerProps {
    eventSlug: string;
    mode?: "view" | "select";
    selectedTicketTypeId?: string | null;
    onSeatSelect?: (seatId: string, seat: Seat) => void;
}

function getSeatAriaLabel(seat: Seat) {
    const accessibility = seat.isAccessible ? ", kursi aksesibel" : "";
    return `${seat.seatLabel}, nomor ${seat.seatNumber}, status ${STATUS_LABELS[seat.status]}${accessibility}`;
}

const STATUS_COLORS: Record<string, string> = {
    AVAILABLE: "bg-emerald-100 border-emerald-300 text-emerald-700",
    LOCKED: "bg-amber-100 border-amber-300 text-amber-600",
    BOOKED: "bg-gray-200 border-gray-300 text-gray-400",
    BLOCKED: "bg-red-100 border-red-300 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
    AVAILABLE: "Tersedia",
    LOCKED: "Dikunci",
    BOOKED: "Terjual",
    BLOCKED: "Diblokir",
};

export function VenueMapViewer({
    eventSlug,
    mode = "view",
    selectedTicketTypeId,
    onSeatSelect,
}: VenueMapViewerProps) {
    const [data, setData] = useState<VenueMapData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [zoomLevel, _setZoomLevel] = useState(1);

    useEffect(() => {
        const fetchVenueMap = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/events/${eventSlug}/venue-map`);
                const result = await res.json();

                if (result.success) {
                    setData(result.data);
                    // Auto-expand first section
                    if (result.data.sections?.length > 0) {
                        setExpandedSection(result.data.sections[0].id);
                    }
                } else {
                    setError(result.error?.message || "Gagal memuat denah");
                }
            } catch (_err) {
                setError("Gagal memuat denah venue");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVenueMap();
    }, [eventSlug]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{error}</p>
            </div>
        );
    }

    if (!data || !data.hasSeatingChart || data.sections.length === 0) {
        return null;
    }

    const getAvailabilityColor = (available: number, total: number) => {
        const ratio = available / total;
        if (ratio > 0.5) return "text-emerald-600";
        if (ratio > 0.2) return "text-amber-600";
        return "text-red-600";
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-linear-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-bold text-gray-900">Denah Venue</h3>
                    </div>
                    {/* Legend */}
                    <div className="hidden md:flex items-center gap-4 text-xs">
                        {Object.entries(STATUS_LABELS).slice(0, 3).map(([status, label]) => (
                            <div key={status} className="flex items-center gap-1.5">
                                <div className={`w-3 h-3 rounded border ${STATUS_COLORS[status]}`} />
                                <span className="text-gray-600">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sections Overview */}
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.sections.map((section) => (
                    <button
                        type="button"
                        key={section.id}
                        onClick={() => setExpandedSection(
                            expandedSection === section.id ? null : section.id
                        )}
                        className={`relative text-left p-4 rounded-xl border-2 transition-all ${expandedSection === section.id
                                ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                    >
                        {/* Color indicator */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1.5 rounded-t-lg"
                            style={{ backgroundColor: section.colorHex || "#6366f1" }}
                        />

                        <h4 className="font-bold text-gray-900 mt-1">{section.name}</h4>

                        {/* Stats */}
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1.5 text-sm">
                                <Armchair className="h-3.5 w-3.5 text-gray-400" />
                                <span className={getAvailabilityColor(
                                    section.stats.availableSeats,
                                    section.stats.totalSeats
                                )}>
                                    {section.stats.availableSeats} tersedia
                                </span>
                                <span className="text-gray-400">
                                    / {section.stats.totalSeats}
                                </span>
                            </div>

                            {/* Ticket types in this section */}
                            {section.ticketTypes.length > 0 && (
                                <div className="text-xs text-gray-500">
                                    {section.ticketTypes.map((t) => (
                                        <span key={t.id} className="mr-2">
                                            {t.name}: {t.isFree ? "Gratis" : formatCurrency(t.basePrice)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Expanded Section Detail */}
            {expandedSection && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                    {data.sections
                        .filter((s) => s.id === expandedSection)
                        .map((section) => (
                            <div key={section.id}>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: section.colorHex || "#6366f1" }}
                                        />
                                        {section.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Users className="h-4 w-4" />
                                        <span>
                                            {section.stats.availableSeats} dari {section.stats.totalSeats} tersedia
                                        </span>
                                    </div>
                                </div>

                                {/* Stage indicator */}
                                <div className="mb-6">
                                    <div className="h-10 bg-gray-800 rounded-b-3xl flex items-center justify-center text-white/50 text-xs font-medium tracking-widest">
                                        PANGGUNG
                                    </div>
                                </div>

                                {/* Seat map */}
                                <div
                                    className="space-y-2 overflow-x-auto pb-4"
                                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
                                >
                                    {section.rows.map((row) => (
                                        <div key={row.id} className="flex items-center gap-3">
                                            <span className="w-6 text-xs font-mono font-bold text-gray-400 text-right shrink-0">
                                                {row.rowLabel}
                                            </span>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {row.seats.map((seat) => {
                                                    const isSelectable =
                                                        mode === "select" &&
                                                        seat.status === "AVAILABLE" &&
                                                        (!selectedTicketTypeId || seat.ticketTypeId === selectedTicketTypeId);

                                                    return (
                                                        <button
                                                            key={seat.id}
                                                            type="button"
                                                            disabled={mode === "view" || seat.status !== "AVAILABLE"}
                                                            onClick={() => isSelectable && onSeatSelect?.(seat.id, seat)}
                                                            aria-label={getSeatAriaLabel(seat)}
                                                            aria-disabled={mode === "view" || seat.status !== "AVAILABLE"}
                                                            className={`
                                                                w-7 h-7 rounded text-[10px] font-medium flex items-center justify-center
                                                                border transition-all
                                                                ${STATUS_COLORS[seat.status]}
                                                                ${seat.isAccessible ? "ring-2 ring-blue-400 ring-offset-1" : ""}
                                                                ${isSelectable ? "cursor-pointer hover:scale-110 hover:shadow-md" : ""}
                                                                ${mode === "view" ? "cursor-default" : ""}
                                                            `}
                                                            title={`${seat.seatLabel} - ${STATUS_LABELS[seat.status]}`}
                                                        >
                                                            {seat.seatNumber}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <span className="w-6 text-xs font-mono font-bold text-gray-400 text-left shrink-0">
                                                {row.rowLabel}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Mobile Legend */}
                                <div className="mt-4 pt-4 border-t border-gray-200 md:hidden">
                                    <div className="flex flex-wrap gap-3 text-xs">
                                        {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                            <div key={status} className="flex items-center gap-1.5">
                                                <div className={`w-3 h-3 rounded border ${STATUS_COLORS[status]}`} />
                                                <span className="text-gray-600">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
