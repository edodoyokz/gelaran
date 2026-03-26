"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingCart,
    CheckCircle,

    AlertCircle,
    LogOut,
    RefreshCw,
    Loader2,
    Plus,
    Minus,
    CreditCard,
    Printer,
    ToggleLeft,
    ToggleRight,
    DollarSign,
    User,
    Phone,
    Mail,
    Ticket,
    TrendingUp,
    Settings,
} from "lucide-react";
import { POSSeatSelector } from "@/components/pos/POSSeatSelector";

// Error codes from backend
enum SeatError {
    ALREADY_BOOKED = 'ALREADY_BOOKED',
    LOCKED_BY_OTHER = 'LOCKED_BY_OTHER',
    NOT_AVAILABLE = 'NOT_AVAILABLE',
    INVALID_SEAT = 'INVALID_SEAT',
    CONFLICT = 'CONFLICT',
    NOT_FOUND = 'NOT_FOUND',
    INVALID_EVENT = 'INVALID_EVENT',
    MISSING_TICKET_TYPE = 'MISSING_TICKET_TYPE',
}

interface SeatErrorResponse {
    error: SeatError;
    message: string;
    seatId?: string;
    seatLabel?: string;
    details?: unknown;
}

// Helper function untuk mendapatkan user-friendly error message
function getUserFriendlyErrorMessage(errorResponse: SeatErrorResponse): string {
    switch (errorResponse.error) {
        case SeatError.ALREADY_BOOKED:
            return `Seat ${errorResponse.seatLabel || errorResponse.seatId} sudah terbooking. Silakan pilih seat lain.`;

        case SeatError.LOCKED_BY_OTHER:
            return `Seat ${errorResponse.seatLabel || errorResponse.seatId} sedang dipilih kasir lain. Silakan pilih seat lain.`;

        case SeatError.NOT_AVAILABLE:
            return `Seat ${errorResponse.seatLabel || errorResponse.seatId} tidak tersedia. Silakan pilih seat lain.`;

        case SeatError.NOT_FOUND:
            return `Seat tidak ditemukan. Silakan refresh halaman dan coba lagi.`;

        case SeatError.INVALID_SEAT:
            return `Seat tidak valid. Silakan pilih seat yang tersedia.`;

        case SeatError.CONFLICT:
            return `Terjadi konflik pada seat. Silakan pilih seat lain dan coba lagi.`;

        case SeatError.INVALID_EVENT:
            return `Seat tidak milik event ini. Silakan pilih seat yang benar.`;

        case SeatError.MISSING_TICKET_TYPE:
            return `Seat ${errorResponse.seatLabel || errorResponse.seatId} tidak memiliki tipe tiket. Silakan hubungi admin.`;

        default:
            return errorResponse.message || "Gagal membuat pesanan";
    }
}

function createSellRequestId() {
    return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `pos-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface TicketType {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    availableQuantity: number;
    maxPerOrder: number;
    isFree: boolean;
}

interface EventData {
    id: string;
    slug: string;
    title: string;
    posterImage: string | null;
    venue: { name: string; city: string } | null;
    schedule: { scheduleDate: string } | null;
    ticketTypes: TicketType[];
    hasSeatingChart: boolean;
}

interface Stats {
    totalSold: number;
    onSiteSales: number;
    todaySales: number;
}

interface SellResult {
    bookingCode: string;
    status: string;
    totalAmount: number;
    paymentToken?: string;
    paymentUrl?: string;
    tickets: Array<{
        id: string;
        uniqueCode: string;
        ticketType: string;
        unitPrice: number;
    }>;
}

declare global {
    interface Window {
        snap?: {
            pay: (token: string, options: {
                onSuccess?: (result: unknown) => void;
                onPending?: (result: unknown) => void;
                onError?: (result: unknown) => void;
                onClose?: () => void;
            }) => void;
        };
    }
}

export default function POSPage() {
    const router = useRouter();
    const [deviceToken, setDeviceToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [staffName, setStaffName] = useState<string>("");
    const [event, setEvent] = useState<EventData | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);

    const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [, setSeatMode] = useState(false);
    const [buyerName, setBuyerName] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [buyerEmail, setBuyerEmail] = useState("");
    const [autoCheckIn, setAutoCheckIn] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sellResult, setSellResult] = useState<SellResult | null>(null);
    const [sellError, setSellError] = useState<string | null>(null);
    const [sellRequestId, setSellRequestId] = useState(() => createSellRequestId());

    const fetchEventData = useCallback(async (token: string) => {
        try {
            const res = await fetch("/api/pos/event", {
                headers: { "x-device-token": token },
            });
            const data = await res.json();

            if (!data.success) {
                localStorage.removeItem("pos_device_token");
                router.push("/pos/access");
                return;
            }

            setStaffName(data.data.staffName);
            setEvent(data.data.event);
            setStats(data.data.stats);
        } catch {
            router.push("/pos/access");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem("pos_device_token");
        if (!token) {
            router.push("/pos/access");
            return;
        }
        setDeviceToken(token);
        fetchEventData(token);
    }, [router, fetchEventData]);

    useEffect(() => {
        if (!deviceToken) return;
        const interval = setInterval(() => {
            fetchEventData(deviceToken);
        }, 30000);
        return () => clearInterval(interval);
    }, [deviceToken, fetchEventData]);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("pos_device_token");
        localStorage.removeItem("pos_staff_name");
        localStorage.removeItem("pos_event_id");
        localStorage.removeItem("pos_event_title");
        router.push("/pos/access");
    };

    const updateTicketQuantity = (ticketTypeId: string, delta: number) => {
        setSelectedTickets((prev) => {
            const current = prev[ticketTypeId] || 0;
            const ticketType = event?.ticketTypes.find((t) => t.id === ticketTypeId);
            const max = Math.min(ticketType?.maxPerOrder || 10, ticketType?.availableQuantity || 0);
            const newValue = Math.max(0, Math.min(max, current + delta));

            if (newValue === 0) {
                const { [ticketTypeId]: _removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [ticketTypeId]: newValue };
        });
    };

    const handleSeatSelect = (seatId: string, seat: { ticketTypeId?: string | null }) => {
        setSelectedSeats((prev) => [...prev, seatId]);
        // Auto-select ticket type based on seat's ticket type
        if (seat.ticketTypeId) {
            const ttId = seat.ticketTypeId;
            setSelectedTickets((prev) => ({
                ...prev,
                [ttId]: (prev[ttId] || 0) + 1,
            }));
        }
    };

    const handleSeatDeselect = (seatId: string) => {
        setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
        // Note: We don't auto-deselect ticket types here to allow mixed mode
    };

    const calculateTotal = () => {
        if (!event) return 0;

        if (event.hasSeatingChart) {
            // For seat-based events, calculate based on selected seats
            // Note: This is a simplified calculation. In reality, we'd need seat data with ticket types
            return Object.entries(selectedTickets).reduce((total, [id, qty]) => {
                const ticketType = event.ticketTypes.find((t) => t.id === id);
                return total + (ticketType?.basePrice || 0) * qty;
            }, 0);
        }

        return Object.entries(selectedTickets).reduce((total, [id, qty]) => {
            const ticketType = event.ticketTypes.find((t) => t.id === id);
            return total + (ticketType?.basePrice || 0) * qty;
        }, 0);
    };

    const getTotalTickets = () => {
        if (event?.hasSeatingChart) {
            return selectedSeats.length;
        }
        return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    };

    const handleSell = async () => {
        if (!deviceToken || getTotalTickets() === 0 || buyerName.trim().length < 2) return;

        // Additional validation for seat-based events
        if (event?.hasSeatingChart && selectedSeats.length === 0) return;

        setIsProcessing(true);
        setSellError(null);
        setSellResult(null);

        try {
            const tickets = Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => ({
                ticketTypeId,
                quantity,
            }));

            const res = await fetch("/api/pos/sell", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-token": deviceToken,
                    "x-request-id": sellRequestId,
                },
                body: JSON.stringify({
                    tickets,
                    seatIds: selectedSeats.length > 0 ? selectedSeats : undefined,
                    buyerName: buyerName.trim(),
                    buyerPhone: buyerPhone.trim() || undefined,
                    buyerEmail: buyerEmail.trim() || undefined,
                    autoCheckIn,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                // Check if response has specific error structure
                if (data.error && typeof data.error === 'object' && 'error' in data.error) {
                    const errorResponse = data.error as SeatErrorResponse;
                    setSellError(getUserFriendlyErrorMessage(errorResponse));

                    // If it's a seat-specific error, deselect the problematic seat
                    if (errorResponse.seatId) {
                        setSelectedSeats(prev => prev.filter(id => id !== errorResponse.seatId));
                    }
                } else {
                    setSellError(data.error?.message || "Gagal membuat pesanan");
                }
                return;
            }

            if (data.data.paymentToken && window.snap) {
                window.snap.pay(data.data.paymentToken, {
                    onSuccess: () => {
                        setSellResult(data.data);
                        resetSellForm();
                        fetchEventData(deviceToken);
                    },
                    onPending: () => {
                        setSellResult(data.data);
                    },
                    onError: () => {
                        setSellError("Pembayaran gagal");
                    },
                    onClose: () => {
                        setSellError("Pembayaran dibatalkan");
                    },
                });
            } else if (data.data.status === "CONFIRMED") {
                setSellResult(data.data);
                resetSellForm();
                fetchEventData(deviceToken);
            }
        } catch {
            setSellError("Terjadi kesalahan");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetSellForm = () => {
        setSelectedTickets({});
        setSelectedSeats([]);
        setSeatMode(false);
        setBuyerName("");
        setBuyerPhone("");
        setBuyerEmail("");
        setSellRequestId(createSellRequestId());
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-emerald-500" />
                                <h1 className="text-lg font-semibold text-white truncate">{event?.title}</h1>
                            </div>
                            <p className="text-sm text-gray-400 truncate">Kasir: {staffName}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                type="button"
                                onClick={() => deviceToken && fetchEventData(deviceToken)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            {event && (
                                <a
                                    href={`/organizer/events/${event.id}/gate`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                    title="Pengaturan"
                                >
                                    <Settings className="h-5 w-5" />
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                {stats && (
                    <div className="mb-6 rounded-2xl border border-gray-700 bg-gray-800 p-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <article className="rounded-xl border border-gray-700 bg-gray-900/60 p-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                                    <Ticket className="h-3.5 w-3.5" />
                                    Total tiket
                                </div>
                                <p className="mt-2 text-2xl font-semibold text-white">{stats.totalSold}</p>
                            </article>
                            <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    On-site sales
                                </div>
                                <p className="mt-2 text-2xl font-semibold text-emerald-300">{stats.onSiteSales}</p>
                            </article>
                            <article className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    Hari ini
                                </div>
                                <p className="mt-2 text-2xl font-semibold text-blue-300">{stats.todaySales}</p>
                            </article>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {sellResult ? (
                        <div className="bg-emerald-900/50 border border-emerald-700 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="h-12 w-12 text-emerald-500" />
                                <div>
                                    <h3 className="text-xl font-bold text-emerald-400">Penjualan Berhasil!</h3>
                                    <p className="text-gray-400">Kode: {sellResult.bookingCode}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {sellResult.tickets.map((ticket) => (
                                    <div key={ticket.id} className="bg-gray-800 rounded-lg p-3 flex items-center gap-3">
                                        <Ticket className="h-5 w-5 text-emerald-400" />
                                        <div className="flex-1">
                                            <p className="text-white font-mono text-sm">{ticket.uniqueCode}</p>
                                            <p className="text-gray-400 text-sm">{ticket.ticketType}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
                                >
                                    <Printer className="h-5 w-5" />
                                    Cetak Tiket
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSellResult(null)}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                                >
                                    Penjualan Baru
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {event?.hasSeatingChart ? (
                                <POSSeatSelector
                                    eventSlug={event.slug}
                                    selectedSeats={selectedSeats}
                                    onSeatSelect={handleSeatSelect}
                                    onSeatDeselect={handleSeatDeselect}
                                />
                            ) : (
                                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                    <div className="p-4 border-b border-gray-700">
                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                            <Ticket className="h-5 w-5 text-emerald-400" />
                                            Pilih Tiket
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-700">
                                        {event?.ticketTypes.map((ticketType) => (
                                            <div key={ticketType.id} className="p-4 flex items-center justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-white">{ticketType.name}</h4>
                                                    <p className="text-sm text-gray-400">
                                                        {ticketType.isFree ? "Gratis" : formatCurrency(ticketType.basePrice)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Tersedia: {ticketType.availableQuantity}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateTicketQuantity(ticketType.id, -1)}
                                                        disabled={!selectedTickets[ticketType.id]}
                                                        className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center disabled:opacity-30 hover:bg-gray-600 transition-colors"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-8 text-center text-lg font-semibold text-white">
                                                        {selectedTickets[ticketType.id] || 0}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateTicketQuantity(ticketType.id, 1)}
                                                        disabled={
                                                            (selectedTickets[ticketType.id] || 0) >= ticketType.maxPerOrder ||
                                                            (selectedTickets[ticketType.id] || 0) >= ticketType.availableQuantity
                                                        }
                                                        className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center disabled:opacity-30 hover:bg-emerald-700 transition-colors"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {getTotalTickets() > 0 && (
                                <>
                                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-4">
                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                            <User className="h-5 w-5 text-emerald-400" />
                                            Data Pembeli
                                        </h3>

                                        <div>
                                            <label htmlFor="buyerName" className="block text-sm text-gray-400 mb-1">
                                                Nama <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <input
                                                    id="buyerName"
                                                    type="text"
                                                    value={buyerName}
                                                    onChange={(e) => setBuyerName(e.target.value)}
                                                    placeholder="Nama pembeli"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="buyerPhone" className="block text-sm text-gray-400 mb-1">Telepon</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <input
                                                    id="buyerPhone"
                                                    type="tel"
                                                    value={buyerPhone}
                                                    onChange={(e) => setBuyerPhone(e.target.value)}
                                                    placeholder="08xxxxxxxxxx"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="buyerEmail" className="block text-sm text-gray-400 mb-1">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <input
                                                    id="buyerEmail"
                                                    type="email"
                                                    value={buyerEmail}
                                                    onChange={(e) => setBuyerEmail(e.target.value)}
                                                    placeholder="email@example.com"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setAutoCheckIn(!autoCheckIn)}
                                        className="w-full bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                                            <span className="text-white">Auto Check-in setelah bayar</span>
                                        </div>
                                        {autoCheckIn ? (
                                            <ToggleRight className="h-8 w-8 text-emerald-500" />
                                        ) : (
                                            <ToggleLeft className="h-8 w-8 text-gray-500" />
                                        )}
                                    </button>

                                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-400">Subtotal ({getTotalTickets()} tiket)</span>
                                            <span className="text-xl font-bold text-white">{formatCurrency(calculateTotal())}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                            <span>Platform Fee (5%)</span>
                                            <span>{formatCurrency(Math.round(calculateTotal() * 0.05))}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                            <span>PPN (11%)</span>
                                            <span>{formatCurrency(Math.round(calculateTotal() * 0.11))}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                                            <span className="text-white font-semibold">Total</span>
                                            <span className="text-2xl font-bold text-emerald-400">
                                                {formatCurrency(calculateTotal() + Math.round(calculateTotal() * 0.05) + Math.round(calculateTotal() * 0.11))}
                                            </span>
                                        </div>
                                    </div>

                                    {sellError && (
                                        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                            <span>{sellError}</span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleSell}
                                        disabled={
                                            isProcessing ||
                                            buyerName.trim().length < 2 ||
                                            (event?.hasSeatingChart && selectedSeats.length === 0) ||
                                            (!event?.hasSeatingChart && getTotalTickets() === 0)
                                        }
                                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : calculateTotal() === 0 ? (
                                            <>
                                                <CheckCircle className="h-5 w-5" />
                                                Buat Tiket Gratis
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-5 w-5" />
                                                Proses Pembayaran
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {getTotalTickets() === 0 && (
                                <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 py-10 text-center">
                                    <DollarSign className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                                    <p className="text-sm text-gray-400">Pilih tiket untuk memulai penjualan</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                }
            `}</style>
        </div>
    );
}
