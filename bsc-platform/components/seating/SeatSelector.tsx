"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Check, X, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface VenueSection {
    id: string;
    name: string;
    colorHex: string | null;
    rows: VenueRow[];
}

interface VenueRow {
    id: string;
    rowLabel: string;
    seats: Seat[];
}

interface Seat {
    id: string;
    seatLabel: string;
    seatNumber: number;
    status: "AVAILABLE" | "LOCKED" | "BOOKED" | "BLOCKED";
    isAccessible: boolean;
    priceOverride: string | null;
    ticketTypeId: string | null;
}

interface TicketType {
    id: string;
    name: string;
    basePrice: number;
}

interface SeatSelectorProps {
    eventSlug: string;
    ticketTypes: TicketType[];
    maxSeats: number;
    onSeatsSelected: (seats: SelectedSeat[]) => void;
    onError?: (message: string) => void;
}

export interface SelectedSeat {
    id: string;
    seatLabel: string;
    ticketTypeId: string | null;
    ticketTypeName: string | undefined;
    price: number;
}

const STATUS_COLORS = {
    AVAILABLE: "bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200 hover:scale-110 cursor-pointer",
    LOCKED: "bg-amber-100 border-amber-300 text-amber-700 cursor-not-allowed",
    BOOKED: "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed",
    BLOCKED: "bg-red-100 border-red-300 text-red-400 cursor-not-allowed",
    SELECTED: "bg-indigo-500 border-indigo-600 text-white hover:bg-indigo-600 cursor-pointer scale-110 ring-2 ring-indigo-300",
};

const LEGEND_ITEMS = [
    { label: "Tersedia", color: "bg-emerald-100 border-emerald-300" },
    { label: "Dipilih", color: "bg-indigo-500 border-indigo-600" },
    { label: "Terjual", color: "bg-gray-200 border-gray-300" },
    { label: "Terkunci", color: "bg-amber-100 border-amber-300" },
];

export default function SeatSelector({
    eventSlug,
    ticketTypes,
    maxSeats,
    onSeatsSelected,
    onError,
}: SeatSelectorProps) {
    const [sections, setSections] = useState<VenueSection[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<Map<string, Seat>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasSeatingChart, setHasSeatingChart] = useState(false);

    const fetchSeats = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const res = await fetch(`/api/events/${eventSlug}/seats`);
            const data = await res.json();
            
            if (!data.success) {
                throw new Error(data.error?.message || "Gagal memuat denah kursi");
            }
            
            setHasSeatingChart(data.data.hasSeatingChart);
            setSections(data.data.sections || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
            onError?.(message);
        } finally {
            setIsLoading(false);
        }
    }, [eventSlug, onError]);

    useEffect(() => {
        fetchSeats();
    }, [fetchSeats]);

    useEffect(() => {
        const selected: SelectedSeat[] = Array.from(selectedSeats.values()).map((seat) => {
            const ticketType = ticketTypes.find(t => t.id === seat.ticketTypeId);
            const price = seat.priceOverride 
                ? parseFloat(seat.priceOverride) 
                : (ticketType?.basePrice || 0);
            
            return {
                id: seat.id,
                seatLabel: seat.seatLabel,
                ticketTypeId: seat.ticketTypeId,
                ticketTypeName: ticketType?.name,
                price,
            };
        });
        onSeatsSelected(selected);
    }, [selectedSeats, ticketTypes, onSeatsSelected]);

    const handleSeatClick = (seat: Seat) => {
        if (seat.status !== "AVAILABLE") return;

        setSelectedSeats((prev) => {
            const newMap = new Map(prev);
            
            if (newMap.has(seat.id)) {
                newMap.delete(seat.id);
            } else {
                if (newMap.size >= maxSeats) {
                    onError?.(`Maksimal ${maxSeats} kursi per pesanan`);
                    return prev;
                }
                newMap.set(seat.id, seat);
            }
            
            return newMap;
        });
    };

    const getSeatClassName = (seat: Seat): string => {
        if (selectedSeats.has(seat.id)) {
            return STATUS_COLORS.SELECTED;
        }
        return STATUS_COLORS[seat.status];
    };

    const getTicketPrice = (seat: Seat): number => {
        if (seat.priceOverride) {
            return parseFloat(seat.priceOverride);
        }
        const ticketType = ticketTypes.find(t => t.id === seat.ticketTypeId);
        return ticketType?.basePrice || 0;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-900 font-medium mb-2">Gagal Memuat Denah Kursi</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button 
                    onClick={fetchSeats}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    if (!hasSeatingChart || sections.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Event ini tidak menggunakan sistem kursi bernomor.</p>
            </div>
        );
    }

    const totalSelected = selectedSeats.size;
    const totalPrice = Array.from(selectedSeats.values()).reduce(
        (sum, seat) => sum + getTicketPrice(seat),
        0
    );

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 text-white/60 text-center py-3 rounded-lg text-sm font-medium tracking-wider">
                PANGGUNG / LAYAR
            </div>

            <div className="space-y-6">
                {sections.map((section) => (
                    <div 
                        key={section.id} 
                        className="bg-white rounded-xl border p-4 relative"
                    >
                        <div 
                            className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                            style={{ backgroundColor: section.colorHex || "#4F46E5" }}
                        />
                        
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: section.colorHex || "#4F46E5" }}
                            />
                            {section.name}
                        </h3>

                        <div className="space-y-2">
                            {section.rows.map((row) => (
                                <div key={row.id} className="flex items-center gap-3">
                                    <div className="w-6 text-right font-mono font-bold text-gray-400 text-xs">
                                        {row.rowLabel}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1.5 flex-1 justify-center">
                                        {row.seats.map((seat) => (
                                            <button
                                                key={seat.id}
                                                onClick={() => handleSeatClick(seat)}
                                                disabled={seat.status !== "AVAILABLE" && !selectedSeats.has(seat.id)}
                                                className={`
                                                    w-7 h-7 rounded text-[9px] font-medium
                                                    flex items-center justify-center
                                                    transition-all duration-150 border
                                                    ${getSeatClassName(seat)}
                                                    ${seat.isAccessible ? 'ring-1 ring-blue-400' : ''}
                                                `}
                                                title={`${seat.seatLabel} - ${formatCurrency(getTicketPrice(seat))}`}
                                            >
                                                {selectedSeats.has(seat.id) ? (
                                                    <Check className="h-3.5 w-3.5" />
                                                ) : (
                                                    seat.seatNumber
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="w-6 text-left font-mono font-bold text-gray-400 text-xs">
                                        {row.rowLabel}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex flex-wrap gap-4">
                    {LEGEND_ITEMS.map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border ${item.color}`} />
                            <span className="text-xs text-gray-600">{item.label}</span>
                        </div>
                    ))}
                </div>

                {totalSelected > 0 && (
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <span className="text-gray-500">Dipilih:</span>
                            <span className="font-bold text-gray-900 ml-1">{totalSelected} kursi</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-bold text-indigo-600 ml-1">{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>
                )}
            </div>

            {totalSelected > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <h4 className="font-medium text-indigo-900 mb-2">Kursi Terpilih:</h4>
                    <div className="flex flex-wrap gap-2">
                        {Array.from(selectedSeats.values()).map((seat) => (
                            <div 
                                key={seat.id}
                                className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-indigo-200"
                            >
                                <span className="font-medium text-gray-900">{seat.seatLabel}</span>
                                <span className="text-xs text-gray-500">{formatCurrency(getTicketPrice(seat))}</span>
                                <button
                                    onClick={() => handleSeatClick(seat)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
