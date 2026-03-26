"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Armchair, Loader2, Info, CheckCircle } from "lucide-react";

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

interface POSSeatSelectorProps {
    eventSlug: string;
    selectedSeats: string[];
    onSeatSelect: (seatId: string, seat: Seat) => void;
    onSeatDeselect: (seatId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
    AVAILABLE: "bg-emerald-500 border-emerald-600 text-white",
    LOCKED: "bg-amber-400 border-amber-500 text-white",
    BOOKED: "bg-gray-400 border-gray-500 text-white",
    BLOCKED: "bg-red-500 border-red-600 text-white",
    SELECTED: "bg-blue-600 border-blue-700 text-white",
};

const STATUS_LABELS: Record<string, string> = {
    AVAILABLE: "Tersedia",
    LOCKED: "Dikunci",
    BOOKED: "Terjual",
    BLOCKED: "Diblokir",
    SELECTED: "Dipilih",
};

export function POSSeatSelector({
    eventSlug,
    selectedSeats,
    onSeatSelect,
    onSeatDeselect,
}: POSSeatSelectorProps) {
    const [data, setData] = useState<VenueMapData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [hoveredSeat, setHoveredSeat] = useState<{ seat: Seat; section: Section; row: Row; ticketType?: TicketType } | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const fetchVenueMap = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/events/${eventSlug}/venue-map`);
            const result = await res.json();

            if (result.success) {
                setData(result.data);
                setExpandedSection((currentSection) => {
                    if (currentSection || !result.data.sections?.length) {
                        return currentSection;
                    }

                    return result.data.sections[0].id;
                });
            } else {
                setError(result.error?.message || "Gagal memuat denah");
            }
        } catch (_err) {
            setError("Gagal memuat denah venue");
        } finally {
            setIsLoading(false);
        }
    }, [eventSlug]);

     
    useEffect(() => {
        fetchVenueMap();
    }, [fetchVenueMap]);

    // Poll seat availability every 5 seconds
     
    useEffect(() => {
        const interval = setInterval(() => {
            fetchVenueMap();
        }, 5000);

        return () => clearInterval(interval);
    }, [fetchVenueMap]);

    const handleSeatClick = (seat: Seat) => {
        if (seat.status !== "AVAILABLE") return;

        if (selectedSeats.includes(seat.id)) {
            onSeatDeselect(seat.id);
        } else {
            onSeatSelect(seat.id, seat);
        }
    };

    const getSeatStatus = (seat: Seat) => {
        if (selectedSeats.includes(seat.id)) return "SELECTED";
        return seat.status;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleSeatHover = (seat: Seat, section: Section, row: Row, event: React.MouseEvent) => {
        // Find ticket type for this seat
        const ticketType = section.ticketTypes.find((t) => t.id === seat.ticketTypeId);
        setHoveredSeat({ seat, section, row, ticketType });
        setTooltipPosition({
            x: event.clientX + 10,
            y: event.clientY + 10,
        });
    };

    const handleSeatLeave = () => {
        setHoveredSeat(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                <span className="ml-2 text-gray-400">Memuat denah...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-6 text-gray-400">
                <Info className="h-6 w-6 mx-auto mb-2 opacity-50" />
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
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-emerald-500" />
                        <h3 className="font-semibold text-white">Pilih Kursi</h3>
                    </div>
                    <div className="text-sm text-gray-400">
                        {selectedSeats.length} kursi dipilih
                    </div>
                </div>
            </div>

            {/* Sections Overview */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.sections.map((section) => (
                    <button
                        type="button"
                        key={section.id}
                        onClick={() => setExpandedSection(
                            expandedSection === section.id ? null : section.id
                        )}
                        className={`relative text-left p-3 rounded-lg border-2 transition-all ${expandedSection === section.id
                            ? "border-emerald-500 bg-emerald-900/20"
                            : "border-gray-600 hover:border-gray-500 bg-gray-700"
                            }`}
                    >
                        {/* Color indicator */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                            style={{ backgroundColor: section.colorHex || "#10b981" }}
                        />

                        <h4 className="font-medium text-white mt-1">{section.name}</h4>

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
                                <div className="text-xs text-gray-400">
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
                <div className="border-t border-gray-700 bg-gray-900/50 p-4">
                    {data.sections
                        .filter((s) => s.id === expandedSection)
                        .map((section) => (
                            <div key={section.id}>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-white flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: section.colorHex || "#10b981" }}
                                        />
                                        {section.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Armchair className="h-4 w-4" />
                                        <span>
                                            {section.stats.availableSeats} dari {section.stats.totalSeats} tersedia
                                        </span>
                                    </div>
                                </div>

                                {/* Stage indicator */}
                                <div className="mb-4">
                                    <div className="h-8 bg-gray-700 rounded-b-2xl flex items-center justify-center text-gray-500 text-xs font-medium tracking-widest">
                                        PANGGUNG
                                    </div>
                                </div>

                                {/* Seat map */}
                                <div className="space-y-2 overflow-x-auto pb-4 max-h-96">
                                    {section.rows.map((row) => (
                                        <div key={row.id} className="flex items-center gap-2">
                                            <span className="w-6 text-xs font-mono font-bold text-gray-400 text-right flex-shrink-0">
                                                {row.rowLabel}
                                            </span>
                                            <div className="flex gap-1 flex-wrap">
                                                {row.seats.map((seat) => {
                                                    const status = getSeatStatus(seat);
                                                    const isSelected = selectedSeats.includes(seat.id);
                                                    const isAvailable = seat.status === "AVAILABLE";

                                                    return (
                                                        <button
                                                            key={seat.id}
                                                            type="button"
                                                            disabled={!isAvailable}
                                                            onClick={() => handleSeatClick(seat)}
                                                            onMouseEnter={(e) => handleSeatHover(seat, section, row, e)}
                                                            onMouseLeave={handleSeatLeave}
                                                            className={`
                                                                w-8 h-8 rounded text-xs font-medium flex items-center justify-center
                                                                border transition-all relative
                                                                ${STATUS_COLORS[status]}
                                                                ${seat.isAccessible ? "ring-1 ring-blue-400" : ""}
                                                                ${isAvailable ? "hover:scale-110 active:scale-95" : "cursor-not-allowed opacity-60"}
                                                            `}
                                                            title={`${seat.seatLabel} - ${STATUS_LABELS[status]}${seat.isAccessible ? " (Aksesibilitas)" : ""}`}
                                                        >
                                                            {seat.seatNumber}
                                                            {isSelected && (
                                                                <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-blue-300 bg-gray-900 rounded-full" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <span className="w-6 text-xs font-mono font-bold text-gray-400 text-left flex-shrink-0">
                                                {row.rowLabel}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="mt-4 pt-4 border-t border-gray-600">
                                    <div className="flex flex-wrap gap-3 text-xs">
                                        {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                            <div key={status} className="flex items-center gap-1.5">
                                                <div className={`w-3 h-3 rounded border ${STATUS_COLORS[status]}`} />
                                                <span className="text-gray-400">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Tooltip */}
            {hoveredSeat && (
                <div
                    className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm pointer-events-none"
                    style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
                >
                    <div className="font-bold text-base mb-1">
                        {hoveredSeat.seat.seatLabel}
                    </div>
                    <div className="space-y-0.5 text-xs text-gray-300">
                        <div>Section: {hoveredSeat.section.name}</div>
                        <div>Baris: {hoveredSeat.row.rowLabel}</div>
                        <div>Status: {STATUS_LABELS[hoveredSeat.seat.status]}</div>
                        {hoveredSeat.ticketType && (
                            <div>
                                Harga: {hoveredSeat.ticketType.isFree ? "Gratis" : formatCurrency(hoveredSeat.ticketType.basePrice)}
                            </div>
                        )}
                        {hoveredSeat.seat.isAccessible && (
                            <div className="text-blue-400 mt-1">♿ Aksesibilitas</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}