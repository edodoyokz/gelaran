"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Loader2,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    QrCode,
    Download,
    Copy,
    ExternalLink,
    CreditCard,
    Ban,
    RefreshCw,
    Share2,
    Printer,
    Building2,
    Phone,
    Mail,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Video,
    Send,
} from "lucide-react";
import {
    CustomerHero,
    CustomerInfoList,
    CustomerStatusBadge,
    DashboardSection,
} from "@/components/customer/customer-dashboard-primitives";

interface TicketType {
    id: string;
    name: string;
    description: string | null;
}

interface BookedTicket {
    id: string;
    uniqueCode: string;
    qrCodeUrl: string | null;
    unitPrice: string;
    finalPrice: string;
    isCheckedIn: boolean;
    checkedInAt: string | null;
    status: string;
    ticketType: TicketType;
}

interface EventSchedule {
    id: string;
    title: string | null;
    scheduleDate: string;
    startTime: string;
    endTime: string;
    description: string | null;
    locationOverride: string | null;
}

interface Venue {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    latitude: number | null;
    longitude: number | null;
    googlePlaceId: string | null;
}

interface OrganizerProfile {
    organizationName: string;
    organizationLogo: string | null;
}

interface Organizer {
    id: string;
    name: string;
    email: string;
    organizerProfile: OrganizerProfile | null;
}

interface BookingEvent {
    id: string;
    title: string;
    slug: string;
    posterImage: string | null;
    bannerImage: string | null;
    eventType: string;
    onlineMeetingUrl: string | null;
    onlineMeetingPassword: string | null;
    termsAndConditions: string | null;
    refundPolicy: string | null;
    organizer: Organizer;
    venue: Venue | null;
}

interface Transaction {
    id: string;
    transactionCode: string;
    paymentGateway: string;
    paymentMethod: string;
    paymentChannel: string | null;
    amount: string;
    status: string;
    paidAt: string | null;
}

interface Refund {
    id: string;
    refundType: string;
    refundAmount: string;
    reason: string | null;
    status: string;
    requestedAt: string;
    completedAt: string | null;
}

interface Booking {
    id: string;
    bookingCode: string;
    status: "PENDING" | "AWAITING_PAYMENT" | "PAID" | "CONFIRMED" | "CANCELLED" | "REFUNDED" | "EXPIRED";
    paymentStatus: string;
    totalTickets: number;
    subtotal: string;
    discountAmount: string;
    taxAmount: string;
    platformFee: string;
    paymentGatewayFee: string;
    totalAmount: string;
    cancellationReason: string | null;
    expiresAt: string | null;
    paidAt: string | null;
    confirmedAt: string | null;
    createdAt: string;
    event: BookingEvent;
    eventSchedule: EventSchedule | null;
    bookedTickets: BookedTicket[];
    transaction: Transaction | null;
    refunds: Refund[];
}

interface BookingActions {
    canCancel: boolean;
    canRefund: boolean;
    isUpcoming: boolean;
}

const STATUS_CONFIG: Record<string, { tone: "warning" | "accent" | "success" | "danger" | "neutral"; icon: typeof CheckCircle; label: string }> = {
    PENDING: { tone: "warning", icon: Clock, label: "Menunggu" },
    AWAITING_PAYMENT: { tone: "warning", icon: Clock, label: "Menunggu Pembayaran" },
    PAID: { tone: "accent", icon: CheckCircle, label: "Dibayar" },
    CONFIRMED: { tone: "success", icon: CheckCircle, label: "Dikonfirmasi" },
    CANCELLED: { tone: "danger", icon: XCircle, label: "Dibatalkan" },
    REFUNDED: { tone: "neutral", icon: RefreshCw, label: "Dikembalikan" },
    EXPIRED: { tone: "neutral", icon: XCircle, label: "Kadaluarsa" },
};

const TICKET_STATUS_CONFIG: Record<string, { tone: "success" | "accent" | "danger" | "neutral"; label: string }> = {
    ACTIVE: { tone: "success", label: "Aktif" },
    TRANSFERRED: { tone: "accent", label: "Ditransfer" },
    CANCELLED: { tone: "danger", label: "Dibatalkan" },
    REFUNDED: { tone: "neutral", label: "Dikembalikan" },
};

export default function BookingDetailPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const router = useRouter();
    const [bookingCode, setBookingCode] = useState<string>("");
    const [booking, setBooking] = useState<Booking | null>(null);
    const [actions, setActions] = useState<BookingActions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [showTerms, setShowTerms] = useState(false);
    const [showRefundPolicy, setShowRefundPolicy] = useState(false);
    const [downloadingTicket, setDownloadingTicket] = useState<string | null>(null);
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferringTicket, setTransferringTicket] = useState<BookedTicket | null>(null);
    const [transferEmail, setTransferEmail] = useState("");
    const [transferName, setTransferName] = useState("");
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferError, setTransferError] = useState<string | null>(null);
    const [transferSuccess, setTransferSuccess] = useState(false);

    useEffect(() => {
        params.then((p) => setBookingCode(p.code));
    }, [params]);

    const fetchBooking = useCallback(async () => {
        if (!bookingCode) return;

        try {
            setIsLoading(true);
            const res = await fetch(`/api/my-bookings/${bookingCode}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push(`/login?returnUrl=/my-bookings/${bookingCode}`);
                    return;
                }
                setError(data.error?.message || "Gagal memuat pesanan");
                return;
            }

            if (data.success) {
                setBooking(data.data.booking);
                setActions(data.data.actions);
                setError(null);
            }
        } catch {
            setError("Gagal memuat pesanan");
        } finally {
            setIsLoading(false);
        }
    }, [bookingCode, router]);

    useEffect(() => {
        fetchBooking();
    }, [fetchBooking]);

    const handleCancel = async () => {
        if (!booking) return;

        try {
            setIsCancelling(true);
            const res = await fetch(`/api/my-bookings/${bookingCode}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: cancelReason || "Dibatalkan oleh pelanggan" }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error?.message || "Gagal membatalkan pesanan");
                return;
            }

            setShowCancelModal(false);
            fetchBooking();
        } catch {
            alert("Gagal membatalkan pesanan");
        } finally {
            setIsCancelling(false);
        }
    };

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCode(id);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch {
            console.error("Failed to copy");
        }
    };

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string): string => {
        const date = new Date(timeStr);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDateTime = (dateStr: string): string => {
        return new Date(dateStr).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: string | number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const downloadTicketPdf = async (ticketId: string, ticketCode: string) => {
        try {
            setDownloadingTicket(ticketId);
            const response = await fetch(`/api/tickets/${ticketId}/pdf`);

            if (!response.ok) {
                const data = await response.json();
                alert(data.error?.message || "Gagal mengunduh tiket");
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ticket-${ticketCode.substring(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            alert("Gagal mengunduh tiket");
        } finally {
            setDownloadingTicket(null);
        }
    };

    const downloadAllTickets = async () => {
        if (!booking) return;

        const activeTickets = booking.bookedTickets.filter((t) => t.status === "ACTIVE" && !t.isCheckedIn);
        if (activeTickets.length === 0) return;

        setDownloadingAll(true);
        for (const ticket of activeTickets) {
            await downloadTicketPdf(ticket.id, ticket.uniqueCode);
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        setDownloadingAll(false);
    };

    const openTransferModal = (ticket: BookedTicket) => {
        setTransferringTicket(ticket);
        setTransferEmail("");
        setTransferName("");
        setTransferError(null);
        setTransferSuccess(false);
        setShowTransferModal(true);
    };

    const handleTransfer = async () => {
        if (!transferringTicket || !transferEmail) return;

        setIsTransferring(true);
        setTransferError(null);

        try {
            const res = await fetch(`/api/tickets/${transferringTicket.id}/transfer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientEmail: transferEmail,
                    recipientName: transferName || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setTransferError(data.error?.message || "Gagal mengirim transfer");
                return;
            }

            setTransferSuccess(true);
        } catch {
            setTransferError("Gagal mengirim transfer. Coba lagi.");
        } finally {
            setIsTransferring(false);
        }
    };

    const closeTransferModal = () => {
        setShowTransferModal(false);
        setTransferringTicket(null);
        if (transferSuccess) {
            fetchBooking();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-(--accent-primary)" />
                    <p className="text-(--text-muted)">Memuat detail pesanan...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <DashboardSection>
                <div className="flex min-h-[45vh] items-center justify-center">
                    <div className="max-w-md text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-(--error)" />
                        <h2 className="mb-2 text-xl font-semibold text-foreground">Pesanan tidak ditemukan</h2>
                        <p className="mb-6 text-(--text-secondary)">{error || "Pesanan yang kamu cari tidak tersedia atau aksesnya dibatasi."}</p>
                        <Link href="/my-bookings" className="inline-flex items-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke pesanan saya
                        </Link>
                    </div>
                </div>
            </DashboardSection>
        );
    }

    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
    const hasValidTickets = booking.bookedTickets.some((t) => t.status === "ACTIVE" && !t.isCheckedIn);
    const organizerName = booking.event.organizer.organizerProfile?.organizationName || booking.event.organizer.name;

    return (
        <div className="space-y-6 lg:space-y-8">
            <CustomerHero
                eyebrow="Booking detail"
                title={booking.event.title}
                description={`Kode booking ${booking.bookingCode}. Kelola tiket, pantau pembayaran, dan tinjau informasi penting dari satu halaman detail.`}
                meta={
                    <>
                        <CustomerStatusBadge label={statusConfig.label} tone={statusConfig.tone} icon={statusConfig.icon} />
                        <CustomerStatusBadge label={`${booking.totalTickets} tiket`} tone="accent" icon={QrCode} />
                    </>
                }
                actions={
                    <>
                        <Link href="/my-bookings" className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                        <button type="button" onClick={() => copyToClipboard(booking.bookingCode, "booking")} className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)">
                            <Copy className="h-4 w-4" />
                            {copiedCode === "booking" ? "Tersalin" : "Salin kode"}
                        </button>
                    </>
                }
            />

            <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                <div className="space-y-6">
                    <DashboardSection title="Ringkasan event" description="Informasi utama tentang event, jadwal, lokasi, dan penyelenggara untuk pesanan ini.">
                        <div className="overflow-hidden rounded-[1.75rem] border border-(--border-light) bg-(--surface-elevated)">
                            <div className="relative h-56 overflow-hidden bg-(--surface-brand-soft)">
                                {booking.event.bannerImage ? (
                                    <Image src={booking.event.bannerImage} alt={booking.event.title} fill className="object-cover" />
                                ) : null}
                                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                                    <div className="flex flex-wrap gap-2">
                                        <CustomerStatusBadge label={booking.event.eventType} tone="neutral" className="border-white/10 bg-white/15 text-white backdrop-blur" />
                                        {actions?.isUpcoming ? <CustomerStatusBadge label="Akan datang" tone="success" className="border-white/10 bg-white/15 text-white backdrop-blur" /> : null}
                                    </div>
                                    <h2 className="mt-3 text-2xl font-semibold text-white">{booking.event.title}</h2>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">
                                <CustomerInfoList
                                    columns={2}
                                    items={[
                                        booking.eventSchedule ? {
                                            icon: Calendar,
                                            label: "Jadwal",
                                            value: (
                                                <>
                                                    <p>{formatDate(booking.eventSchedule.scheduleDate)}</p>
                                                    <p className="text-(--text-secondary)">{formatTime(booking.eventSchedule.startTime)} - {formatTime(booking.eventSchedule.endTime)}</p>
                                                </>
                                            ),
                                        } : {
                                            icon: Calendar,
                                            label: "Jadwal",
                                            value: "Akan diumumkan",
                                        },
                                        booking.event.eventType === "ONLINE"
                                            ? {
                                                icon: Video,
                                                label: "Akses event",
                                                value: (
                                                    <div className="space-y-1">
                                                        <p>Event online</p>
                                                        {(booking.status === "CONFIRMED" || booking.status === "PAID") && booking.event.onlineMeetingUrl ? (
                                                            <a href={booking.event.onlineMeetingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-(--accent-primary)">
                                                                Gabung meeting
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        ) : (
                                                            <p className="text-(--text-secondary)">Tautan meeting muncul setelah booking aktif.</p>
                                                        )}
                                                    </div>
                                                ),
                                            }
                                            : {
                                                icon: MapPin,
                                                label: "Lokasi",
                                                value: booking.event.venue ? (
                                                    <div className="space-y-1">
                                                        <p>{booking.event.venue.name}</p>
                                                        <p className="text-(--text-secondary)">{booking.event.venue.address}, {booking.event.venue.city}</p>
                                                        {booking.event.venue.googlePlaceId ? (
                                                            <a href={`https://www.google.com/maps/place/?q=place_id:${booking.event.venue.googlePlaceId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-(--accent-primary)">
                                                                Buka peta
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                ) : "Lokasi akan diumumkan",
                                            },
                                    ]}
                                />

                                <div className="mt-4 rounded-2xl border border-(--border-light) bg-(--surface) p-4">
                                    <div className="flex items-center gap-3">
                                        {booking.event.organizer.organizerProfile?.organizationLogo ? (
                                            <Image src={booking.event.organizer.organizerProfile.organizationLogo} alt={organizerName} width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                                        ) : (
                                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-(--surface-brand-soft) text-(--accent-primary)">
                                                <Building2 className="h-5 w-5" />
                                            </span>
                                        )}
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--text-muted)">Diselenggarakan oleh</p>
                                            <p className="font-semibold text-foreground">{organizerName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DashboardSection>

                    <DashboardSection title={`Tiket kamu (${booking.bookedTickets.length})`} description="Buka QR, unduh PDF, atau transfer tiket yang masih aktif ke penerima lain.">
                        <div className="space-y-4">
                            {hasValidTickets ? (
                                <div className="flex justify-end">
                                    <button type="button" onClick={downloadAllTickets} disabled={downloadingAll} className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover) disabled:opacity-60">
                                        {downloadingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        Unduh semua
                                    </button>
                                </div>
                            ) : null}

                            {booking.bookedTickets.map((ticket, index) => {
                                const ticketStatus = TICKET_STATUS_CONFIG[ticket.status] || TICKET_STATUS_CONFIG.ACTIVE;
                                const isExpanded = expandedTicket === ticket.id;
                                return (
                                    <article key={ticket.id} className="rounded-3xl border border-(--border-light) bg-(--surface-elevated) p-4 sm:p-5">
                                        <button type="button" onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)} className="flex w-full items-center justify-between gap-4 text-left">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) font-semibold text-(--accent-primary)">{index + 1}</span>
                                                <div className="min-w-0 space-y-1">
                                                    <p className="font-semibold text-foreground">{ticket.ticketType.name}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <CustomerStatusBadge label={ticketStatus.label} tone={ticketStatus.tone} />
                                                        {ticket.isCheckedIn ? <CustomerStatusBadge label="Sudah check-in" tone="success" icon={CheckCircle} /> : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-semibold text-foreground">{formatCurrency(ticket.finalPrice)}</p>
                                                {isExpanded ? <ChevronUp className="h-5 w-5 text-(--text-muted)" /> : <ChevronDown className="h-5 w-5 text-(--text-muted)" />}
                                            </div>
                                        </button>

                                        <div className={`${isExpanded ? "block" : "hidden"} pt-4`}>
                                            <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
                                                <div className="rounded-3xl border border-(--border-light) bg-(--surface) p-4 text-center">
                                                    <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-2xl bg-white p-3 shadow-(--shadow-xs)">
                                                        {ticket.status === "ACTIVE" ? (
                                                            <QRCodeSVG value={ticket.uniqueCode} size={196} level="H" includeMargin={false} />
                                                        ) : (
                                                            <QrCode className="h-28 w-28 text-(--text-muted)" />
                                                        )}
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-center gap-2">
                                                        <code className="rounded-full bg-(--bg-secondary) px-3 py-1 text-sm text-(--text-secondary)">{ticket.uniqueCode}</code>
                                                        <button type="button" onClick={() => copyToClipboard(ticket.uniqueCode, ticket.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface-elevated) text-(--text-secondary) hover:bg-(--surface-hover)">
                                                            {copiedCode === ticket.id ? <CheckCircle className="h-4 w-4 text-(--success)" /> : <Copy className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    {ticket.isCheckedIn && ticket.checkedInAt ? (
                                                        <p className="mt-3 text-sm text-(--text-secondary)">Check-in pada {formatDateTime(ticket.checkedInAt)}</p>
                                                    ) : null}
                                                </div>

                                                <div className="space-y-4">
                                                    <CustomerInfoList
                                                        columns={2}
                                                        items={[
                                                            {
                                                                icon: QrCode,
                                                                label: "Tipe tiket",
                                                                value: (
                                                                    <>
                                                                        <p>{ticket.ticketType.name}</p>
                                                                        {ticket.ticketType.description ? <p className="text-(--text-secondary)">{ticket.ticketType.description}</p> : null}
                                                                    </>
                                                                ),
                                                            },
                                                            {
                                                                icon: CreditCard,
                                                                label: "Harga",
                                                                value: (
                                                                    <>
                                                                        <p>{formatCurrency(ticket.unitPrice)}</p>
                                                                        <p className="text-(--text-secondary)">Final {formatCurrency(ticket.finalPrice)}</p>
                                                                    </>
                                                                ),
                                                            },
                                                        ]}
                                                    />

                                                    {ticket.status === "ACTIVE" && !ticket.isCheckedIn ? (
                                                        <div className="flex flex-col gap-3 sm:flex-row">
                                                            <button type="button" onClick={() => downloadTicketPdf(ticket.id, ticket.uniqueCode)} disabled={downloadingTicket === ticket.id} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-3 text-sm font-semibold text-white shadow-(--shadow-glow) disabled:opacity-60">
                                                                {downloadingTicket === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                                                Unduh PDF
                                                            </button>
                                                            <button type="button" onClick={() => openTransferModal(ticket)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)">
                                                                <Send className="h-4 w-4" />
                                                                Transfer tiket
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </DashboardSection>

                    {(booking.event.termsAndConditions || booking.event.refundPolicy) ? (
                        <DashboardSection title="Informasi penting" description="Syarat event dan kebijakan refund yang perlu dibaca sebelum hari acara.">
                            <div className="space-y-3">
                                {booking.event.termsAndConditions ? (
                                    <div className="rounded-2xl border border-(--border-light) bg-(--surface-elevated)">
                                        <button type="button" onClick={() => setShowTerms(!showTerms)} className="flex w-full items-center justify-between p-4 text-left font-semibold text-foreground">
                                            Syarat & ketentuan
                                            {showTerms ? <ChevronUp className="h-5 w-5 text-(--text-muted)" /> : <ChevronDown className="h-5 w-5 text-(--text-muted)" />}
                                        </button>
                                        {showTerms ? <div className="px-4 pb-4 text-sm leading-7 text-(--text-secondary) whitespace-pre-wrap">{booking.event.termsAndConditions}</div> : null}
                                    </div>
                                ) : null}
                                {booking.event.refundPolicy ? (
                                    <div className="rounded-2xl border border-(--border-light) bg-(--surface-elevated)">
                                        <button type="button" onClick={() => setShowRefundPolicy(!showRefundPolicy)} className="flex w-full items-center justify-between p-4 text-left font-semibold text-foreground">
                                            Kebijakan pengembalian
                                            {showRefundPolicy ? <ChevronUp className="h-5 w-5 text-(--text-muted)" /> : <ChevronDown className="h-5 w-5 text-(--text-muted)" />}
                                        </button>
                                        {showRefundPolicy ? <div className="px-4 pb-4 text-sm leading-7 text-(--text-secondary) whitespace-pre-wrap">{booking.event.refundPolicy}</div> : null}
                                    </div>
                                ) : null}
                            </div>
                        </DashboardSection>
                    ) : null}
                </div>

                <div className="space-y-6">
                    <DashboardSection title="Ringkasan pesanan" description="Komponen biaya, total akhir, dan status pembayaran booking.">
                        <div className="space-y-3 text-sm">
                            <Row label={`Subtotal (${booking.totalTickets} tiket)`} value={formatCurrency(booking.subtotal)} />
                            {Number(booking.discountAmount) > 0 ? <Row label="Diskon" value={`-${formatCurrency(booking.discountAmount)}`} valueClassName="text-(--success-text)" /> : null}
                            {Number(booking.taxAmount) > 0 ? <Row label="Pajak" value={formatCurrency(booking.taxAmount)} /> : null}
                            {Number(booking.platformFee) > 0 ? <Row label="Biaya layanan" value={formatCurrency(booking.platformFee)} /> : null}
                            {Number(booking.paymentGatewayFee) > 0 ? <Row label="Biaya payment gateway" value={formatCurrency(booking.paymentGatewayFee)} /> : null}
                            <div className="border-t border-(--border-light) pt-3">
                                <Row label="Total" value={formatCurrency(booking.totalAmount)} valueClassName="text-lg font-semibold text-foreground" />
                            </div>
                        </div>
                    </DashboardSection>

                    {booking.transaction ? (
                        <DashboardSection title="Info pembayaran" description="Detail transaksi yang terkait langsung dengan booking ini.">
                            <div className="space-y-3 text-sm">
                                <Row label="ID transaksi" value={booking.transaction.transactionCode} valueClassName="font-mono text-xs text-foreground" />
                                <Row label="Metode pembayaran" value={booking.transaction.paymentMethod.replace(/_/g, " ")} />
                                {booking.transaction.paymentChannel ? <Row label="Kanal" value={booking.transaction.paymentChannel} /> : null}
                                <Row label="Status" value={booking.transaction.status} valueClassName="font-semibold text-foreground" />
                                {booking.transaction.paidAt ? <Row label="Dibayar pada" value={formatDateTime(booking.transaction.paidAt)} /> : null}
                            </div>
                        </DashboardSection>
                    ) : null}

                    {booking.refunds.length > 0 ? (
                        <DashboardSection title="Riwayat refund" description="Riwayat pengembalian dana yang pernah diajukan untuk booking ini.">
                            <div className="space-y-3">
                                {booking.refunds.map((refund) => (
                                    <div key={refund.id} className="rounded-2xl border border-(--border-light) bg-(--surface-elevated) p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <CustomerStatusBadge label={refund.status} tone={refund.status === "COMPLETED" ? "success" : refund.status === "REJECTED" ? "danger" : "warning"} />
                                                <p className="mt-2 text-sm text-(--text-secondary)">Pengembalian {refund.refundType}</p>
                                            </div>
                                            <p className="font-semibold text-foreground">{formatCurrency(refund.refundAmount)}</p>
                                        </div>
                                        {refund.reason ? <p className="mt-3 text-sm text-(--text-secondary)">{refund.reason}</p> : null}
                                        <p className="mt-3 text-xs text-(--text-muted)">Diminta {formatDateTime(refund.requestedAt)}</p>
                                    </div>
                                ))}
                            </div>
                        </DashboardSection>
                    ) : null}

                    <DashboardSection title="Butuh bantuan?" description="Akses cepat ke penyelenggara atau tim dukungan Gelaran.">
                        <div className="space-y-3">
                            <a href={`mailto:${booking.event.organizer.email}`} className="flex items-center gap-3 rounded-2xl border border-(--border-light) bg-(--surface-elevated) p-4 text-sm font-medium text-foreground transition-colors hover:bg-(--surface-hover)">
                                <Mail className="h-4 w-4 text-(--text-muted)" />
                                Hubungi penyelenggara
                            </a>
                            <Link href="/contact" className="flex items-center gap-3 rounded-2xl border border-(--border-light) bg-(--surface-elevated) p-4 text-sm font-medium text-foreground transition-colors hover:bg-(--surface-hover)">
                                <Phone className="h-4 w-4 text-(--text-muted)" />
                                Hubungi dukungan
                            </Link>
                        </div>
                    </DashboardSection>

                    <div className="space-y-3">
                        {booking.status === "AWAITING_PAYMENT" ? (
                            <Link href={`/checkout/payment/${booking.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow)">
                                <Clock className="h-4 w-4" />
                                Bayar sekarang
                            </Link>
                        ) : null}
                        {actions?.canRefund ? (
                            <Link href={`/my-bookings/${booking.bookingCode}/refund`} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)">
                                <RefreshCw className="h-4 w-4" />
                                Ajukan refund
                            </Link>
                        ) : null}
                        {actions?.canCancel ? (
                            <button type="button" onClick={() => setShowCancelModal(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(198,40,40,0.16)] bg-(--error-bg) px-5 py-3 text-sm font-semibold text-(--error-text) transition-colors hover:opacity-90">
                                <Ban className="h-4 w-4" />
                                Batalkan pesanan
                            </button>
                        ) : null}
                        <button type="button" onClick={() => window.print()} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)">
                            <Printer className="h-4 w-4" />
                            Cetak ringkasan
                        </button>
                        <button type="button" onClick={() => navigator.share?.({ title: booking.event.title, text: `Booking ${booking.bookingCode}`, url: window.location.href }).catch(() => { })} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)">
                            <Share2 className="h-4 w-4" />
                            Bagikan detail
                        </button>
                    </div>
                </div>
            </div>

            {showCancelModal ? (
                <ModalCard>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-(--error-bg) text-(--error-text)">
                            <AlertTriangle className="h-6 w-6" />
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Batalkan pesanan?</h3>
                            <p className="text-sm text-(--text-muted)">Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    </div>
                    <p className="mb-4 text-sm leading-7 text-(--text-secondary)">Apakah kamu yakin ingin membatalkan pesanan ini? Jika berubah pikiran, kamu perlu membuat booking baru.</p>
                    <label htmlFor="cancelReason" className="mb-2 block text-sm font-medium text-(--text-secondary)">Alasan pembatalan (opsional)</label>
                    <textarea id="cancelReason" rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Beritahu kami alasan pembatalanmu..." className="input mb-6 resize-none" />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setShowCancelModal(false)} disabled={isCancelling} className="inline-flex flex-1 items-center justify-center rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm font-semibold text-foreground disabled:opacity-60">Pertahankan</button>
                        <button type="button" onClick={handleCancel} disabled={isCancelling} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#c62828,#ef5350)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                            {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isCancelling ? "Membatalkan..." : "Ya, batalkan"}
                        </button>
                    </div>
                </ModalCard>
            ) : null}

            {showTransferModal && transferringTicket ? (
                <ModalCard>
                    {transferSuccess ? (
                        <div className="text-center">
                            <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-(--success-bg) text-(--success-text)">
                                <CheckCircle className="h-8 w-8" />
                            </span>
                            <h3 className="mb-2 text-xl font-semibold text-foreground">Transfer dikirim</h3>
                            <p className="mb-6 text-sm leading-7 text-(--text-secondary)">Undangan transfer telah dikirim ke <strong>{transferEmail}</strong>. Mereka punya waktu 48 jam untuk menerima tiket.</p>
                            <button type="button" onClick={closeTransferModal} className="inline-flex w-full items-center justify-center rounded-full bg-(--accent-gradient) px-4 py-3 text-sm font-semibold text-white">Tutup</button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-(--surface-brand-soft) text-(--accent-primary)">
                                    <Send className="h-6 w-6" />
                                </span>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Transfer tiket</h3>
                                    <p className="text-sm text-(--text-muted)">{transferringTicket.ticketType.name}</p>
                                </div>
                            </div>
                            {transferError ? <div className="mb-4 rounded-2xl border border-[rgba(198,40,40,0.16)] bg-(--error-bg) p-3 text-sm text-(--error-text)">{transferError}</div> : null}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label htmlFor="transferEmail" className="mb-2 block text-sm font-medium text-(--text-secondary)">Email penerima *</label>
                                    <input id="transferEmail" type="email" value={transferEmail} onChange={(e) => setTransferEmail(e.target.value)} placeholder="email@contoh.com" className="input" />
                                </div>
                                <div>
                                    <label htmlFor="transferName" className="mb-2 block text-sm font-medium text-(--text-secondary)">Nama penerima (opsional)</label>
                                    <input id="transferName" type="text" value={transferName} onChange={(e) => setTransferName(e.target.value)} placeholder="Nama lengkap penerima" className="input" />
                                </div>
                            </div>
                            <div className="mb-6 rounded-2xl border border-[rgba(251,193,23,0.28)] bg-(--warning-bg) p-4 text-sm leading-7 text-(--warning-text)">
                                Setelah penerima menerima transfer, tiket lama akan dinonaktifkan dan tiket baru diterbitkan atas nama mereka.
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={closeTransferModal} disabled={isTransferring} className="inline-flex flex-1 items-center justify-center rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm font-semibold text-foreground disabled:opacity-60">Batal</button>
                                <button type="button" onClick={handleTransfer} disabled={isTransferring || !transferEmail} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                                    {isTransferring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    {isTransferring ? "Mengirim..." : "Kirim transfer"}
                                </button>
                            </div>
                        </>
                    )}
                </ModalCard>
            ) : null}
        </div>
    );
}

function Row({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-(--text-secondary)">{label}</span>
            <span className={valueClassName || "font-medium text-foreground"}>{value}</span>
        </div>
    );
}

function ModalCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-4xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-xl)">
                {children}
            </div>
        </div>
    );
}

