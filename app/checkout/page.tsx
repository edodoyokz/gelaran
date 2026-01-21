"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ShoppingCart,
    Minus,
    Plus,
    CreditCard,
    Loader2,
    ArrowLeft,
    Calendar,
    MapPin,
    Clock
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TicketSelection {
    ticketTypeId: string;
    name: string;
    price: number;
    quantity: number;
    maxPerOrder: number;
}

interface LockedSeat {
    id: string;
    seatLabel: string;
    ticketTypeId: string;
    ticketTypeName: string;
    price: number;
}

interface EventData {
    id: string;
    title: string;
    slug: string;
    posterImage: string;
    eventType: string;
    venue?: { name: string; city: string };
    schedules?: Array<{ scheduleDate: string; startTime: string }>;
    ticketTypes: Array<{
        id: string;
        name: string;
        description?: string;
        basePrice: number;
        availableQuantity: number;
        maxPerOrder: number;
        isFree: boolean;
    }>;
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const eventSlug = searchParams.get("event");
    const ticketsParam = searchParams.get("tickets");
    const seatsParam = searchParams.get("seats");

    const [event, setEvent] = useState<EventData | null>(null);
    const [tickets, setTickets] = useState<TicketSelection[]>([]);
    const [lockedSeats, setLockedSeats] = useState<LockedSeat[]>([]);
    const [seatSessionId, setSeatSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSeatCheckout = !!seatsParam;

    const [guestEmail, setGuestEmail] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [isUserLoaded, setIsUserLoaded] = useState(false);
    const [pricingData, setPricingData] = useState<{
        subtotal: number;
        taxAmount: number;
        platformFee: number;
        totalAmount: number;
    } | null>(null);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        if (!guestName && data.data.name) {
                            setGuestName(data.data.name);
                        }
                        if (!guestEmail && data.data.email) {
                            setGuestEmail(data.data.email);
                        }
                        if (!guestPhone && data.data.phone) {
                            setGuestPhone(data.data.phone);
                        }
                    }
                }
            } catch {
                setIsUserLoaded(true);
            }
        }

        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (!eventSlug) {
            router.push("/");
            return;
        }

        async function fetchEventAndSeats() {
            try {
                const res = await fetch(`/api/events/${eventSlug}`);
                const data = await res.json();
                
                if (!data.success) throw new Error("Failed to load event");
                setEvent(data.data);

                let currentLockedSeats: LockedSeat[] = [];

                if (seatsParam) {
                    let sessionId = localStorage.getItem("bsc-seat-session");
                    if (!sessionId) {
                        sessionId = crypto.randomUUID();
                        localStorage.setItem("bsc-seat-session", sessionId);
                    }
                    setSeatSessionId(sessionId);

                    const seatIds = seatsParam.split(",");
                    const seatRes = await fetch(`/api/events/${eventSlug}/seats`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ seatIds, sessionId })
                    });
                    const seatData = await seatRes.json();
                    
                    if (seatData.success) {
                        currentLockedSeats = seatData.data.lockedSeats.map((seat: LockedSeat & { price: string }) => ({
                            ...seat,
                            price: Number(seat.price),
                        }));
                        setLockedSeats(currentLockedSeats);
                    } else {
                        setError(seatData.error?.message || "Failed to lock seats");
                    }
                }

                const preselectedTickets = new Map<string, number>();
                
                if (seatsParam && currentLockedSeats.length > 0) {
                     currentLockedSeats.forEach(seat => {
                         const count = preselectedTickets.get(seat.ticketTypeId) || 0;
                         preselectedTickets.set(seat.ticketTypeId, count + 1);
                     });
                } else if (ticketsParam) {
                    ticketsParam.split(",").forEach((pair) => {
                        const [id, qty] = pair.split(":");
                        if (id && qty) {
                            preselectedTickets.set(id, parseInt(qty, 10) || 0);
                        }
                    });
                }

                const initialTickets = data.data.ticketTypes.map((t: EventData["ticketTypes"][0]) => ({
                    ticketTypeId: t.id,
                    name: t.name,
                    price: t.isFree ? 0 : t.basePrice,
                    quantity: preselectedTickets.get(t.id) || 0,
                    maxPerOrder: t.maxPerOrder,
                }));
                setTickets(initialTickets);

            } catch (err) {
                console.error(err);
                const message = err instanceof Error ? err.message : "Failed to load data";
                if (!error) setError(message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEventAndSeats();
    }, [eventSlug, ticketsParam, seatsParam, router]);

    useEffect(() => {
        if (!event || (tickets.length === 0 && lockedSeats.length === 0)) return;

        async function fetchPricing() {
            try {
                const res = await fetch('/api/pricing/quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventId: event.id,
                        tickets: isSeatCheckout 
                            ? [] 
                            : tickets.filter(t => t.quantity > 0).map(t => ({
                                ticketTypeId: t.ticketTypeId,
                                quantity: t.quantity
                            })),
                        seatIds: isSeatCheckout ? lockedSeats.map(s => s.id) : undefined
                    })
                });

                if (res.ok) {
                    const pricing = await res.json();
                    setPricingData({
                        subtotal: pricing.subtotal,
                        taxAmount: pricing.taxAmount,
                        platformFee: pricing.platformFee,
                        totalAmount: pricing.totalAmount
                    });
                }
            } catch (err) {
                console.error('Failed to fetch pricing:', err);
            }
        }

        fetchPricing();
    }, [event, tickets, lockedSeats, isSeatCheckout]);

    const updateQuantity = (ticketTypeId: string, delta: number) => {
        if (isSeatCheckout) return;

        setTickets((prev) =>
            prev.map((t) => {
                if (t.ticketTypeId !== ticketTypeId) return t;
                const newQty = Math.max(0, Math.min(t.maxPerOrder, t.quantity + delta));
                return { ...t, quantity: newQty };
            })
        );
    };

    const subtotal = pricingData?.subtotal ?? (isSeatCheckout 
        ? lockedSeats.reduce((sum, s) => sum + s.price, 0)
        : tickets.reduce((sum, t) => sum + t.price * t.quantity, 0));
        
    const platformFee = pricingData?.platformFee ?? 0;
    const tax = pricingData?.taxAmount ?? 0;
    const total = pricingData?.totalAmount ?? (subtotal + platformFee + tax);
    const totalTickets = isSeatCheckout
        ? lockedSeats.length
        : tickets.reduce((sum, t) => sum + t.quantity, 0);

    const handleCheckout = async () => {
        if (totalTickets === 0) {
            setError("Pilih minimal 1 tiket");
            return;
        }

        if (isSeatCheckout && (!seatSessionId || lockedSeats.length === 0)) {
            setError("Kursi belum terkunci");
            return;
        }

        if (!guestEmail || !guestName) {
            setError("Isi nama dan email");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Create booking
            const bookingRes = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: event?.id,
                    tickets: tickets.filter((t) => t.quantity > 0).map((t) => ({
                        ticketTypeId: t.ticketTypeId,
                        quantity: t.quantity,
                    })),
                    guestEmail,
                    guestName,
                    guestPhone,
                    seatIds: isSeatCheckout ? lockedSeats.map(s => s.id) : undefined,
                    seatSessionId: isSeatCheckout ? seatSessionId : undefined,
                }),
            });

            const bookingData = await bookingRes.json();
            if (!bookingData.success) {
                setError(bookingData.error?.message || "Booking gagal");
                setIsProcessing(false);
                return;
            }

            // If free, redirect to success
            if (total === 0) {
                router.push(`/checkout/success?booking=${bookingData.data.bookingCode}`);
                return;
            }

            // Create payment
            const paymentRes = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: bookingData.data.id }),
            });

            const paymentData = await paymentRes.json();
            if (!paymentData.success) {
                setError(paymentData.error?.message || "Payment failed");
                setIsProcessing(false);
                return;
            }

            // Redirect to Midtrans
            window.location.href = paymentData.data.redirectUrl;
        } catch (err) {
            console.error("Checkout error:", err);
            setError("Terjadi kesalahan saat memproses pembayaran");
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Event tidak ditemukan</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href={`/events/${event.slug}`} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-lg font-semibold">Checkout</h1>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event Info */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex gap-4">
                                <img
                                    src={event.posterImage || "/placeholder.jpg"}
                                    alt={event.title}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                                <div>
                                    <h2 className="font-semibold text-lg">{event.title}</h2>
                                    {event.schedules?.[0] && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(event.schedules[0].scheduleDate)}
                                        </div>
                                    )}
                                    {event.venue && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <MapPin className="h-4 w-4" />
                                            {event.venue.name}, {event.venue.city}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Ticket Selection */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Pilih Tiket
                            </h3>
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.ticketTypeId}
                                        className="flex items-center justify-between py-3 border-b last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium">{ticket.name}</p>
                                            <p className="text-indigo-600 font-semibold">
                                                {ticket.price === 0 ? "Gratis" : formatCurrency(ticket.price)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(ticket.ticketTypeId, -1)}
                                                disabled={ticket.quantity === 0 || isSeatCheckout}
                                                className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-50"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-6 text-center font-medium">{ticket.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(ticket.ticketTypeId, 1)}
                                                disabled={ticket.quantity >= ticket.maxPerOrder || isSeatCheckout}
                                                className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-50"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold mb-4">Informasi Pembeli</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        No. WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        value={guestPhone}
                                        onChange={(e) => setGuestPhone(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="08123456789"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="font-semibold mb-4">Ringkasan Pesanan</h3>

                            {isSeatCheckout && lockedSeats.length > 0 && (
                                <div className="mb-4 pb-4 border-b">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Kursi Dipilih:</p>
                                    <div className="space-y-1">
                                        {lockedSeats.map((seat) => (
                                            <div key={seat.id} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{seat.seatLabel}</span>
                                                <span className="font-medium">{formatCurrency(seat.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 text-sm">
                                {!isSeatCheckout && tickets.filter((t) => t.quantity > 0).map((ticket) => (
                                    <div key={ticket.ticketTypeId} className="flex justify-between">
                                        <span>{ticket.name} x{ticket.quantity}</span>
                                        <span>{formatCurrency(ticket.price * ticket.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            {totalTickets > 0 && (
                                <>
                                    <div className="border-t my-4" />
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Platform fee (5%)</span>
                                            <span>{formatCurrency(platformFee)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>PPN (11%)</span>
                                            <span>{formatCurrency(tax)}</span>
                                        </div>
                                    </div>
                                    <div className="border-t my-4" />
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total</span>
                                        <span className="text-indigo-600">{formatCurrency(total)}</span>
                                    </div>
                                </>
                            )}

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={totalTickets === 0 || isProcessing}
                                className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-5 w-5" />
                                        {total === 0 ? "Pesan Gratis" : "Bayar Sekarang"}
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Dengan melanjutkan, kamu menyetujui syarat & ketentuan yang berlaku.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
