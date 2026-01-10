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

    const [event, setEvent] = useState<EventData | null>(null);
    const [tickets, setTickets] = useState<TicketSelection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Guest checkout fields
    const [guestEmail, setGuestEmail] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");

    useEffect(() => {
        if (!eventSlug) {
            router.push("/");
            return;
        }

        async function fetchEvent() {
            try {
                const res = await fetch(`/api/events/${eventSlug}`);
                const data = await res.json();
                if (data.success) {
                    setEvent(data.data);
                    // Initialize ticket selections
                    const initialTickets = data.data.ticketTypes.map((t: EventData["ticketTypes"][0]) => ({
                        ticketTypeId: t.id,
                        name: t.name,
                        price: t.isFree ? 0 : t.basePrice,
                        quantity: 0,
                        maxPerOrder: t.maxPerOrder,
                    }));
                    setTickets(initialTickets);
                }
            } catch {
                setError("Failed to load event");
            } finally {
                setIsLoading(false);
            }
        }

        fetchEvent();
    }, [eventSlug, router]);

    const updateQuantity = (ticketTypeId: string, delta: number) => {
        setTickets((prev) =>
            prev.map((t) => {
                if (t.ticketTypeId !== ticketTypeId) return t;
                const newQty = Math.max(0, Math.min(t.maxPerOrder, t.quantity + delta));
                return { ...t, quantity: newQty };
            })
        );
    };

    const subtotal = tickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
    const platformFee = Math.round(subtotal * 0.05);
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + platformFee + tax;
    const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);

    const handleCheckout = async () => {
        if (totalTickets === 0) {
            setError("Pilih minimal 1 tiket");
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
        } catch {
            setError("Terjadi kesalahan");
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
                                                onClick={() => updateQuantity(ticket.ticketTypeId, -1)}
                                                disabled={ticket.quantity === 0}
                                                className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-50"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-6 text-center font-medium">{ticket.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(ticket.ticketTypeId, 1)}
                                                disabled={ticket.quantity >= ticket.maxPerOrder}
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

                            <div className="space-y-2 text-sm">
                                {tickets.filter((t) => t.quantity > 0).map((ticket) => (
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
