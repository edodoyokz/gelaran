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
import { getPublicEnv } from "@/lib/env";

const env = getPublicEnv();

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
        script.src = env.NEXT_PUBLIC_MIDTRANS_SNAP_URL;
        script.setAttribute("data-client-key", env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
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
            <div className="flex min-h-screen items-center justify-center bg-(--background)">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-(--background)">
            <header className="sticky top-0 z-10 border-b border-(--border) bg-(--surface)">
                <div className="mx-auto max-w-2xl px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-(--accent-primary)" />
                                <h1 className="truncate text-lg font-semibold text-foreground">{event?.title}</h1>
                            </div>
                            <p className="truncate text-sm text-(--text-secondary)">Kasir: {staffName}</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => deviceToken && fetchEventData(deviceToken)}
                                className="rounded-lg p-2 text-(--text-secondary) transition-colors hover:bg-(--surface-hover) hover:text-foreground"
                                title="Refresh"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            {event && (
                                <a
                                    href={`/organizer/events/${event.id}/gate`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg p-2 text-(--text-secondary) transition-colors hover:bg-(--surface-hover) hover:text-foreground"
                                    title="Pengaturan"
                                >
                                    <Settings className="h-5 w-5" />
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg p-2 text-(--error) transition-colors hover:bg-[rgba(239,68,68,0.1)] hover:text-red-300"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6">
                {stats && (
                    <div className="mb-6 rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-sm)">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <article className="rounded-xl border border-(--border) bg-(--surface-brand-soft) p-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                                    <Ticket className="h-3.5 w-3.5" />
                                    Total tiket
                                </div>
                                <p className="mt-2 text-2xl font-semibold text-foreground">{stats.totalSold}</p>
                            </article>
                            <article className="rounded-xl border border-(--success-bg) bg-(--success-bg) p-3 text-(--success)">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    On-site sales
                                </div>
                                <p className="mt-2 text-2xl font-semibold">{stats.onSiteSales}</p>
                            </article>
                            <article className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-blue-300">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    Hari ini
                                </div>
                                <p className="mt-2 text-2xl font-semibold">{stats.todaySales}</p>
                            </article>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {sellResult ? (
                        <div className="rounded-xl border border-(--success-bg) bg-(--success-bg) p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <CheckCircle className="h-12 w-12 text-(--success)" />
                                <div>
                                    <h3 className="text-xl font-bold text-(--success)">Penjualan Berhasil!</h3>
                                    <p className="text-(--success) opacity-80">Kode: {sellResult.bookingCode}</p>
                                </div>
                            </div>

                            <div className="mb-6 space-y-3">
                                {sellResult.tickets.map((ticket) => (
                                    <div key={ticket.id} className="flex items-center gap-3 rounded-lg bg-(--surface) p-3 border border-(--border)">
                                        <Ticket className="h-5 w-5 text-(--accent-primary)" />
                                        <div className="flex-1">
                                            <p className="font-mono text-sm text-foreground">{ticket.uniqueCode}</p>
                                            <p className="text-sm text-(--text-secondary)">{ticket.ticketType}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--surface-brand-soft) py-3 font-medium text-foreground transition-colors hover:bg-(--surface-hover) border border-(--border)"
                                >
                                    <Printer className="h-5 w-5" />
                                    Cetak Tiket
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSellResult(null)}
                                    className="flex-1 rounded-xl bg-(--accent-primary) py-3 font-medium text-white transition-colors hover:bg-(--accent-primary-hover)"
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
                                <div className="overflow-hidden rounded-xl border border-(--border) bg-(--surface) shadow-(--shadow-sm)">
                                    <div className="border-b border-(--border) p-4">
                                        <h3 className="flex items-center gap-2 font-semibold text-foreground">
                                            <Ticket className="h-5 w-5 text-(--accent-primary)" />
                                            Pilih Tiket
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-(--border)">
                                        {event?.ticketTypes.map((ticketType) => (
                                            <div key={ticketType.id} className="flex items-center justify-between gap-4 p-4">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-foreground">{ticketType.name}</h4>
                                                    <p className="text-sm text-(--text-secondary)">
                                                        {ticketType.isFree ? "Gratis" : formatCurrency(ticketType.basePrice)}
                                                    </p>
                                                    <p className="text-xs text-(--text-muted)">
                                                        Tersedia: {ticketType.availableQuantity}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateTicketQuantity(ticketType.id, -1)}
                                                        disabled={!selectedTickets[ticketType.id]}
                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-brand-soft) text-foreground transition-colors hover:bg-(--surface-hover) disabled:opacity-30 border border-(--border)"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-8 shrink-0 text-center text-lg font-semibold text-foreground">
                                                        {selectedTickets[ticketType.id] || 0}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateTicketQuantity(ticketType.id, 1)}
                                                        disabled={
                                                            (selectedTickets[ticketType.id] || 0) >= ticketType.maxPerOrder ||
                                                            (selectedTickets[ticketType.id] || 0) >= ticketType.availableQuantity
                                                        }
                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent-primary) text-white transition-colors hover:bg-(--accent-primary-hover) disabled:opacity-30"
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
                                    <div className="space-y-4 rounded-xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-sm)">
                                        <h3 className="flex items-center gap-2 font-semibold text-foreground">
                                            <User className="h-5 w-5 text-(--accent-primary)" />
                                            Data Pembeli
                                        </h3>

                                        <div>
                                            <label htmlFor="buyerName" className="mb-1 block text-sm text-(--text-secondary)">
                                                Nama <span className="text-(--error)">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-(--text-muted)" />
                                                <input
                                                    id="buyerName"
                                                    type="text"
                                                    value={buyerName}
                                                    onChange={(e) => setBuyerName(e.target.value)}
                                                    placeholder="Nama pembeli"
                                                    className="w-full rounded-xl border border-(--border) bg-(--background) py-3 pl-10 pr-4 text-foreground placeholder:text-(--text-muted) outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-(--info-bg)"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="buyerPhone" className="mb-1 block text-sm text-(--text-secondary)">Telepon</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-(--text-muted)" />
                                                <input
                                                    id="buyerPhone"
                                                    type="tel"
                                                    value={buyerPhone}
                                                    onChange={(e) => setBuyerPhone(e.target.value)}
                                                    placeholder="08xxxxxxxxxx"
                                                    className="w-full rounded-xl border border-(--border) bg-(--background) py-3 pl-10 pr-4 text-foreground placeholder:text-(--text-muted) outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-(--info-bg)"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="buyerEmail" className="mb-1 block text-sm text-(--text-secondary)">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-(--text-muted)" />
                                                <input
                                                    id="buyerEmail"
                                                    type="email"
                                                    value={buyerEmail}
                                                    onChange={(e) => setBuyerEmail(e.target.value)}
                                                    placeholder="email@example.com"
                                                    className="w-full rounded-xl border border-(--border) bg-(--background) py-3 pl-10 pr-4 text-foreground placeholder:text-(--text-muted) outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-(--info-bg)"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setAutoCheckIn(!autoCheckIn)}
                                        className="flex w-full items-center justify-between rounded-xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-sm)"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-(--accent-primary)" />
                                            <span className="text-foreground">Auto Check-in setelah bayar</span>
                                        </div>
                                        {autoCheckIn ? (
                                            <ToggleRight className="h-8 w-8 text-(--accent-primary)" />
                                        ) : (
                                            <ToggleLeft className="h-8 w-8 text-(--text-muted)" />
                                        )}
                                    </button>

                                    <div className="rounded-xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-sm)">
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-(--text-secondary)">Subtotal ({getTotalTickets()} tiket)</span>
                                            <span className="text-xl font-bold text-foreground">{formatCurrency(calculateTotal())}</span>
                                        </div>
                                        <div className="mb-2 flex items-center justify-between text-sm text-(--text-muted)">
                                            <span>Platform Fee (5%)</span>
                                            <span>{formatCurrency(Math.round(calculateTotal() * 0.05))}</span>
                                        </div>
                                        <div className="mb-4 flex items-center justify-between text-sm text-(--text-muted)">
                                            <span>PPN (11%)</span>
                                            <span>{formatCurrency(Math.round(calculateTotal() * 0.11))}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-(--border) pt-4">
                                            <span className="font-semibold text-foreground">Total</span>
                                            <span className="text-2xl font-bold text-(--accent-primary)">
                                                {formatCurrency(calculateTotal() + Math.round(calculateTotal() * 0.05) + Math.round(calculateTotal() * 0.11))}
                                            </span>
                                        </div>
                                    </div>

                                    {sellError && (
                                        <div className="flex items-center gap-2 rounded-xl border border-[rgba(239,68,68,0.2)] bg-(--error-bg) px-4 py-3 text-(--error)">
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
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent-primary) py-4 font-semibold text-white transition-all hover:bg-(--accent-primary-hover) disabled:cursor-not-allowed disabled:opacity-50"
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
                                <div className="rounded-2xl border border-dashed border-(--border) bg-(--surface-brand-soft) py-10 text-center">
                                    <DollarSign className="mx-auto mb-3 h-12 w-12 text-(--text-muted)" />
                                    <p className="text-sm text-(--text-secondary)">Pilih tiket untuk memulai penjualan</p>
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
