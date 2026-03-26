"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    CheckCircle2,
    CreditCard,
    Loader2,
    Mail,
    Minus,
    Phone,
    Plus,
    ShoppingCart,
    Tag,
    User,
    Wallet,
    X,
    Zap,
} from "lucide-react";
import {
    BookingCodePill,
    CheckoutCallout,
    CheckoutCard,
    CheckoutEventSummary,
    CheckoutPageShell,
} from "@/components/features/checkout/checkout-primitives";
import { formatCurrency } from "@/lib/utils";
import { canCreatePaidOrder } from "@/lib/payments/stage-guard";

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
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [demoPaymentStatus, setDemoPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
    const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
    const [pendingBookingCode, setPendingBookingCode] = useState<string | null>(null);

    const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT === "true";
    const isPaymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
    const isSeatCheckout = !!seatsParam;

    const [guestEmail, setGuestEmail] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [_isUserLoaded, setIsUserLoaded] = useState(false);
    const [pricingData, setPricingData] = useState<{
        subtotal: number;
        discountAmount: number;
        taxAmount: number;
        platformFee: number;
        totalAmount: number;
        taxLabel?: string;
        promoApplied?: boolean;
        promoMessage?: string;
    } | null>(null);
    const [promoInput, setPromoInput] = useState("");
    const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
    const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        body: JSON.stringify({ seatIds, sessionId }),
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
                    currentLockedSeats.forEach((seat) => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventSlug, ticketsParam, seatsParam, router]);

    useEffect(() => {
        if (!event || (tickets.length === 0 && lockedSeats.length === 0)) return;

        const currentEvent = event;

        async function fetchPricing() {
            try {
                const res = await fetch("/api/pricing/quote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        eventId: currentEvent.id,
                        tickets: isSeatCheckout
                            ? []
                            : tickets.filter((t) => t.quantity > 0).map((t) => ({
                                ticketTypeId: t.ticketTypeId,
                                quantity: t.quantity,
                            })),
                        seatIds: isSeatCheckout ? lockedSeats.map((s) => s.id) : undefined,
                        promoCode: appliedPromoCode || undefined,
                    }),
                });

                if (res.ok) {
                    const pricing = await res.json();
                    setPricingData({
                        subtotal: pricing.subtotal,
                        discountAmount: pricing.discountAmount || 0,
                        taxAmount: pricing.taxAmount,
                        platformFee: pricing.platformFee,
                        totalAmount: pricing.totalAmount,
                        taxLabel: pricing.taxLabel,
                        promoApplied: Boolean(appliedPromoCode && (pricing.discountAmount || 0) > 0),
                        promoMessage: appliedPromoCode
                            ? (pricing.discountAmount || 0) > 0
                                ? `Voucher ${appliedPromoCode} berhasil digunakan`
                                : `Voucher ${appliedPromoCode} tidak valid atau tidak berlaku`
                            : undefined,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch pricing:", err);
            }
        }

        fetchPricing();
    }, [event, tickets, lockedSeats, isSeatCheckout, appliedPromoCode]);

    useEffect(() => {
        return () => {
            if (eventSlug && seatSessionId && lockedSeats.length > 0) {
                fetch(`/api/events/${eventSlug}/seats?sessionId=${seatSessionId}`, {
                    method: "DELETE",
                }).catch((err) => console.error("Failed to release seats:", err));
            }
        };
    }, [eventSlug, seatSessionId, lockedSeats.length]);

    const updateQuantity = (ticketTypeId: string, delta: number) => {
        if (isSeatCheckout) return;

        setTickets((prev) =>
            prev.map((t) => {
                if (t.ticketTypeId !== ticketTypeId) return t;
                const newQty = Math.max(0, Math.min(t.maxPerOrder, t.quantity + delta));
                return { ...t, quantity: newQty };
            }),
        );
    };

    const subtotal = pricingData?.subtotal ?? (isSeatCheckout
        ? lockedSeats.reduce((sum, s) => sum + s.price, 0)
        : tickets.reduce((sum, t) => sum + t.price * t.quantity, 0));
    const platformFee = pricingData?.platformFee ?? 0;
    const tax = pricingData?.taxAmount ?? 0;
    const total = pricingData?.totalAmount ?? subtotal + platformFee + tax;
    const isPaidCheckoutBlocked = !canCreatePaidOrder(total, isPaymentsEnabled);
    const totalTickets = isSeatCheckout
        ? lockedSeats.length
        : tickets.reduce((sum, t) => sum + t.quantity, 0);

    const selectedTickets = tickets.filter((ticket) => ticket.quantity > 0);

    const applyPromoCode = () => {
        const normalized = promoInput.trim().toUpperCase();
        if (!normalized) {
            setPromoFeedback("Masukkan kode voucher terlebih dahulu");
            return;
        }
        setAppliedPromoCode(normalized);
        setPromoFeedback(null);
    };

    const removePromoCode = () => {
        setAppliedPromoCode(null);
        setPromoInput("");
        setPromoFeedback("Voucher dihapus");
    };

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
            const bookingRes = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: event?.id,
                    tickets: tickets
                        .filter((t) => t.quantity > 0)
                        .map((t) => ({
                            ticketTypeId: t.ticketTypeId,
                            quantity: t.quantity,
                        })),
                    guestEmail,
                    guestName,
                    guestPhone,
                    promoCode: appliedPromoCode || undefined,
                    seatIds: isSeatCheckout ? lockedSeats.map((s) => s.id) : undefined,
                    seatSessionId: isSeatCheckout ? seatSessionId : undefined,
                }),
            });

            const bookingData = await bookingRes.json();
            if (!bookingData.success) {
                setError(bookingData.error?.message || "Booking gagal");
                setIsProcessing(false);
                return;
            }

            if (total === 0) {
                router.push(`/checkout/success?booking=${bookingData.data.bookingCode}`);
                return;
            }

            if (!canCreatePaidOrder(total, isPaymentsEnabled)) {
                setError("Pembayaran online belum tersedia di tahap ini. Silakan pilih tiket gratis atau hubungi penyelenggara.");
                setIsProcessing(false);
                return;
            }

            if (isDemoMode) {
                setPendingBookingId(bookingData.data.id);
                setPendingBookingCode(bookingData.data.bookingCode);
                setShowDemoModal(true);
                setIsProcessing(false);
                return;
            }

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

            window.location.href = paymentData.data.redirectUrl;
        } catch (err) {
            console.error("Checkout error:", err);
            setError("Terjadi kesalahan saat memproses pembayaran");
            setIsProcessing(false);
        }
    };

    const handleDemoPayment = async () => {
        if (!pendingBookingId || !pendingBookingCode) return;

        setDemoPaymentStatus("processing");

        try {
            const res = await fetch("/api/payments/demo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: pendingBookingId }),
            });

            const data = await res.json();

            if (data.success) {
                setDemoPaymentStatus("success");
                setTimeout(() => {
                    router.push(`/checkout/success?booking=${pendingBookingCode}`);
                }, 1500);
            } else {
                setError(data.error?.message || "Demo payment failed");
                setShowDemoModal(false);
                setDemoPaymentStatus("idle");
            }
        } catch (err) {
            console.error("Demo payment error:", err);
            setError("Failed to process demo payment");
            setShowDemoModal(false);
            setDemoPaymentStatus("idle");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 text-center">
                <p className="text-base text-(--text-secondary)">Event tidak ditemukan</p>
            </div>
        );
    }

    const promoMessage = promoFeedback || pricingData?.promoMessage;
    const promoTone = pricingData?.promoApplied || promoFeedback === "Voucher dihapus" ? "success" : "warning";

    return (
        <>
            <CheckoutPageShell
                title="Review pesanan dan selesaikan pembayaran"
                description="Pastikan detail tiket, identitas pembeli, dan metode pembayaran sudah tepat sebelum kamu lanjut ke proses pembayaran Gelaran."
                backHref={`/events/${event.slug}`}
                aside={
                    <div className="flex flex-wrap gap-3 lg:justify-end">
                        <div className="rounded-full border border-(--border) bg-(--surface)/90 px-4 py-2 text-sm font-medium text-(--text-secondary) shadow-(--shadow-xs)">
                            {totalTickets} tiket dipilih
                        </div>
                        <div className="rounded-full border border-[rgba(41,179,182,0.22)] bg-(--surface-brand-soft) px-4 py-2 text-sm font-semibold text-(--accent-primary) shadow-(--shadow-xs)">
                            Total {formatCurrency(total)}
                        </div>
                    </div>
                }
            >
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.7fr)] xl:items-start">
                    <div className="space-y-6">
                        <CheckoutEventSummary
                            title={event.title}
                            posterImage={event.posterImage}
                            scheduleDate={event.schedules?.[0]?.scheduleDate}
                            venueName={event.venue?.name}
                            venueCity={event.venue?.city}
                            eventType={event.eventType}
                            badge={isSeatCheckout ? "Reserved seating" : "General admission"}
                        />

                        <CheckoutCard
                            title={isSeatCheckout ? "Kursi dan tiket terpilih" : "Pilih jumlah tiket"}
                            description={isSeatCheckout
                                ? "Kursi yang sudah kamu lock akan dipakai sebagai dasar checkout."
                                : "Atur jumlah tiket untuk tiap kategori sesuai kuota maksimal per transaksi."}
                            icon={ShoppingCart}
                        >
                            {isSeatCheckout ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {lockedSeats.map((seat) => (
                                        <div
                                            key={seat.id}
                                            className="rounded-3xl border border-(--border-light) bg-(--surface) px-4 py-4 shadow-(--shadow-xs)"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{seat.seatLabel}</p>
                                                    <p className="mt-1 text-sm text-(--text-secondary)">{seat.ticketTypeName}</p>
                                                </div>
                                                <span className="rounded-full bg-(--surface-brand-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-primary)">
                                                    Locked
                                                </span>
                                            </div>
                                            <p className="mt-4 text-sm font-semibold text-(--accent-secondary)">{formatCurrency(seat.price)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tickets.map((ticket) => (
                                        <div
                                            key={ticket.ticketTypeId}
                                            className="rounded-3xl border border-(--border-light) bg-(--surface) px-4 py-4 shadow-(--shadow-xs)"
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="space-y-1 pr-0 sm:pr-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-base font-semibold text-foreground">{ticket.name}</p>
                                                        <span className="rounded-full border border-(--border-light) bg-(--surface-muted) px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                                                            Maks {ticket.maxPerOrder}/order
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-(--accent-secondary)">
                                                        {ticket.price === 0 ? "Gratis" : formatCurrency(ticket.price)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between gap-4 sm:justify-end">
                                                    <div className="inline-flex items-center rounded-full border border-(--border) bg-(--surface-muted) p-1 shadow-(--shadow-xs)">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(ticket.ticketTypeId, -1)}
                                                            disabled={ticket.quantity === 0 || isSeatCheckout}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-(--text-secondary) transition-colors duration-200 hover:bg-white hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                                            aria-label={`Kurangi ${ticket.name}`}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="inline-flex min-w-12 items-center justify-center text-sm font-semibold text-foreground">
                                                            {ticket.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(ticket.ticketTypeId, 1)}
                                                            disabled={ticket.quantity >= ticket.maxPerOrder || isSeatCheckout}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-(--text-secondary) transition-colors duration-200 hover:bg-white hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                                            aria-label={`Tambah ${ticket.name}`}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {totalTickets === 0 ? (
                                <CheckoutCallout
                                    tone="warning"
                                    title="Belum ada tiket di pesanan"
                                    description="Pilih minimal satu tiket agar proses checkout bisa dilanjutkan."
                                />
                            ) : null}
                        </CheckoutCard>

                        <CheckoutCard
                            title="Informasi pembeli"
                            description="Data ini dipakai untuk konfirmasi booking, pengiriman instruksi pembayaran, dan e-ticket."
                            icon={User}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-2 sm:col-span-2">
                                    <span className="text-sm font-semibold text-foreground">Nama lengkap *</span>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            className="w-full rounded-2xl border border-(--border) bg-(--surface) px-12 py-3.5 text-sm text-foreground shadow-(--shadow-xs) outline-none transition-colors duration-200 placeholder:text-(--text-muted) focus:border-(--border-focus)"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm font-semibold text-foreground">Email *</span>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            className="w-full rounded-2xl border border-(--border) bg-(--surface) px-12 py-3.5 text-sm text-foreground shadow-(--shadow-xs) outline-none transition-colors duration-200 placeholder:text-(--text-muted) focus:border-(--border-focus)"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm font-semibold text-foreground">No. WhatsApp</span>
                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                                        <input
                                            type="tel"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            className="w-full rounded-2xl border border-(--border) bg-(--surface) px-12 py-3.5 text-sm text-foreground shadow-(--shadow-xs) outline-none transition-colors duration-200 placeholder:text-(--text-muted) focus:border-(--border-focus)"
                                            placeholder="08123456789"
                                        />
                                    </div>
                                </label>
                            </div>
                        </CheckoutCard>
                    </div>

                    <aside className="xl:sticky xl:top-28">
                        <CheckoutCard
                            title="Ringkasan checkout"
                            description="Semua komponen biaya dihitung ulang sebelum kamu diarahkan ke pembayaran."
                            icon={Wallet}
                            className="space-y-0"
                        >
                            <div className="space-y-5">
                                <div className="space-y-3">
                                    {(isSeatCheckout ? lockedSeats : selectedTickets).length > 0 ? (
                                        isSeatCheckout ? (
                                            lockedSeats.map((seat) => (
                                                <div key={seat.id} className="flex items-start justify-between gap-3 rounded-2xl border border-(--border-light) bg-(--surface) px-4 py-3 shadow-(--shadow-xs)">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">{seat.seatLabel}</p>
                                                        <p className="mt-1 text-sm text-(--text-secondary)">{seat.ticketTypeName}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground">{formatCurrency(seat.price)}</p>
                                                </div>
                                            ))
                                        ) : (
                                            selectedTickets.map((ticket) => (
                                                <div key={ticket.ticketTypeId} className="flex items-start justify-between gap-3 rounded-2xl border border-(--border-light) bg-(--surface) px-4 py-3 shadow-(--shadow-xs)">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">{ticket.name}</p>
                                                        <p className="mt-1 text-sm text-(--text-secondary)">{ticket.quantity} × {ticket.price === 0 ? "Gratis" : formatCurrency(ticket.price)}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground">{formatCurrency(ticket.price * ticket.quantity)}</p>
                                                </div>
                                            ))
                                        )
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-(--border-strong) bg-(--surface-muted) px-4 py-5 text-center text-sm leading-6 text-(--text-secondary)">
                                            Belum ada tiket yang masuk ke ringkasan pesanan.
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 rounded-3xl border border-(--border-light) bg-(--surface-muted) p-4 shadow-(--shadow-xs)">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <Tag className="h-4 w-4 text-(--accent-primary)" />
                                        Voucher diskon
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            type="text"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                            placeholder="Masukkan kode voucher"
                                            className="min-w-0 flex-1 rounded-full border border-(--border) bg-white px-4 py-3 text-sm text-foreground shadow-(--shadow-xs) outline-none transition-colors duration-200 placeholder:text-(--text-muted) focus:border-(--border-focus)"
                                        />
                                        {appliedPromoCode ? (
                                            <button
                                                type="button"
                                                onClick={removePromoCode}
                                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(217,79,61,0.22)] bg-white px-4 py-3 text-sm font-semibold text-(--error-text) transition-colors duration-200 hover:bg-(--error-bg)"
                                            >
                                                Hapus
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={applyPromoCode}
                                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-(--accent-primary) px-4 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-colors duration-200 hover:bg-(--accent-primary-hover)"
                                            >
                                                Pakai
                                            </button>
                                        )}
                                    </div>
                                    {promoMessage ? (
                                        <CheckoutCallout
                                            tone={promoTone}
                                            title={pricingData?.promoApplied ? "Voucher diterapkan" : "Status voucher"}
                                            description={promoMessage}
                                            className="rounded-[1.25rem]"
                                        />
                                    ) : null}
                                </div>

                                <div className="space-y-3 rounded-3xl border border-(--border-light) bg-(--surface) p-4 shadow-(--shadow-xs)">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <CreditCard className="h-4 w-4 text-(--accent-primary)" />
                                        Rincian biaya
                                    </div>
                                    <div className="space-y-2 text-sm text-(--text-secondary)">
                                        <div className="flex items-center justify-between gap-3">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                                        </div>
                                        {(pricingData?.discountAmount || 0) > 0 ? (
                                            <div className="flex items-center justify-between gap-3 text-(--success-text)">
                                                <span>Diskon voucher</span>
                                                <span className="font-medium">-{formatCurrency(pricingData?.discountAmount || 0)}</span>
                                            </div>
                                        ) : null}
                                        <div className="flex items-center justify-between gap-3">
                                            <span>Platform fee (5%)</span>
                                            <span className="font-medium text-foreground">{formatCurrency(platformFee)}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span>{pricingData?.taxLabel || "PPN (11%)"}</span>
                                            <span className="font-medium text-foreground">{formatCurrency(tax)}</span>
                                        </div>
                                        <div className="mt-3 border-t border-dashed border-(--border) pt-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-base font-semibold text-foreground">Total pembayaran</span>
                                                <span className="text-lg font-semibold text-(--accent-secondary)">{formatCurrency(total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isPaidCheckoutBlocked ? (
                                    <CheckoutCallout
                                        tone="warning"
                                        title="Pembayaran online belum tersedia"
                                        description="Tahap implementasi saat ini hanya mengizinkan order gratis atau flow pembayaran yang memang sudah diaktifkan di environment aplikasi."
                                    />
                                ) : (
                                    <CheckoutCallout
                                        tone="info"
                                        title={total === 0 ? "Pesanan gratis siap dikonfirmasi" : "Kamu akan diarahkan ke pembayaran"}
                                        description={
                                            total === 0
                                                ? "Setelah konfirmasi, booking akan langsung diproses ke halaman sukses tanpa langkah pembayaran tambahan."
                                                : "Gelaran akan membuat booking lebih dulu lalu mengarahkan kamu ke payment gateway atau mode demo yang aktif."
                                        }
                                    />
                                )}

                                {error ? (
                                    <CheckoutCallout tone="error" title="Checkout belum dapat diproses" description={error} />
                                ) : null}

                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={handleCheckout}
                                        disabled={totalTickets === 0 || isProcessing || isPaidCheckoutBlocked}
                                        className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-(--accent-secondary) px-6 py-3.5 text-sm font-semibold text-white shadow-(--shadow-md) transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--accent-secondary-hover) disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Memproses checkout...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-5 w-5" />
                                                {total === 0 ? "Konfirmasi pesanan gratis" : isPaidCheckoutBlocked ? "Pembayaran belum tersedia" : "Lanjut ke pembayaran"}
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-xs leading-6 text-(--text-muted)">
                                        Dengan melanjutkan, kamu menyetujui syarat dan ketentuan Gelaran serta kebijakan yang berlaku untuk event ini.
                                    </p>
                                </div>
                            </div>
                        </CheckoutCard>
                    </aside>
                </div>
            </CheckoutPageShell>

            {showDemoModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.55)] p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-[calc(var(--radius-3xl)+0.25rem)] border border-(--border) bg-[rgba(255,255,255,0.94)] p-6 shadow-(--shadow-2xl) backdrop-blur-xl sm:p-8">
                        {demoPaymentStatus === "success" ? (
                            <div className="space-y-5 text-center">
                                <span className="mx-auto inline-flex h-18 w-18 items-center justify-center rounded-[1.75rem] bg-(--success-bg) text-(--success) shadow-(--shadow-sm)">
                                    <CheckCircle2 className="h-9 w-9" />
                                </span>
                                <div className="space-y-2">
                                    <h3 className="font-(--font-editorial) text-3xl tracking-(--tracking-display) text-foreground">
                                        Pembayaran demo berhasil
                                    </h3>
                                    <p className="text-sm leading-6 text-(--text-secondary)">
                                        Booking sedang diarahkan ke halaman sukses checkout Gelaran.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <span className="inline-flex rounded-full border border-[rgba(251,193,23,0.3)] bg-(--warning-bg) px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-(--warning-text)">
                                            Demo payment
                                        </span>
                                        <h3 className="font-(--font-editorial) text-3xl tracking-(--tracking-display) text-foreground">
                                            Simulasikan pembayaran checkout
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDemoModal(false);
                                            setDemoPaymentStatus("idle");
                                        }}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-(--border) bg-white text-(--text-secondary) transition-colors duration-200 hover:text-foreground"
                                        disabled={demoPaymentStatus === "processing"}
                                        aria-label="Tutup demo payment"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <CheckoutCallout
                                    tone="warning"
                                    title="Mode simulasi aktif"
                                    description="Tidak ada transaksi nyata yang diproses. Alur ini hanya dipakai untuk menguji state checkout dan outcome page."
                                    icon={Zap}
                                />

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <BookingCodePill bookingCode={pendingBookingCode} label="Booking code" />
                                    <div className="rounded-2xl border border-(--border-light) bg-(--surface-muted) px-4 py-3 shadow-(--shadow-xs)">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Total simulasi</p>
                                        <p className="mt-2 text-base font-semibold text-(--accent-secondary)">{formatCurrency(total)}</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleDemoPayment}
                                    disabled={demoPaymentStatus === "processing"}
                                    className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-(--shadow-md) transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {demoPaymentStatus === "processing" ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Memproses demo...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-5 w-5" />
                                            Simulasi pembayaran berhasil
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}
