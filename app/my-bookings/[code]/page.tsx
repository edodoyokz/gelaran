"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
    ArrowLeft,
    Ticket,
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
    User,
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

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; icon: typeof CheckCircle; label: string }> = {
    PENDING: { color: "text-yellow-700", bgColor: "bg-yellow-100", icon: Clock, label: "Menunggu" },
    AWAITING_PAYMENT: { color: "text-orange-700", bgColor: "bg-orange-100", icon: Clock, label: "Menunggu Pembayaran" },
    PAID: { color: "text-blue-700", bgColor: "bg-blue-100", icon: CheckCircle, label: "Dibayar" },
    CONFIRMED: { color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle, label: "Dikonfirmasi" },
    CANCELLED: { color: "text-red-700", bgColor: "bg-red-100", icon: XCircle, label: "Dibatalkan" },
    REFUNDED: { color: "text-purple-700", bgColor: "bg-purple-100", icon: XCircle, label: "Dikembalikan" },
    EXPIRED: { color: "text-gray-700", bgColor: "bg-gray-100", icon: XCircle, label: "Kadaluarsa" },
};

const TICKET_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    ACTIVE: { color: "text-green-700 bg-green-100", label: "Aktif" },
    TRANSFERRED: { color: "text-blue-700 bg-blue-100", label: "Ditransfer" },
    CANCELLED: { color: "text-red-700 bg-red-100", label: "Dibatalkan" },
    REFUNDED: { color: "text-purple-700 bg-purple-100", label: "Dikembalikan" },
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
        
        const activeTickets = booking.bookedTickets.filter(t => t.status === "ACTIVE" && !t.isCheckedIn);
        if (activeTickets.length === 0) return;

        setDownloadingAll(true);
        for (const ticket of activeTickets) {
            await downloadTicketPdf(ticket.id, ticket.uniqueCode);
            await new Promise(resolve => setTimeout(resolve, 500));
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat detail pesanan...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h2>
                    <p className="text-gray-500 mb-6">{error || "Pesanan yang kamu cari tidak ada atau kamu tidak memiliki akses."}</p>
                    <Link
                        href="/my-bookings"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Pesanan Saya
                    </Link>
                </div>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
    const StatusIcon = statusConfig.icon;
    const hasValidTickets = booking.bookedTickets.some((t) => t.status === "ACTIVE" && !t.isCheckedIn);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/my-bookings" className="text-gray-500 hover:text-gray-700">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Detail Pesanan</h1>
                                <p className="text-sm text-gray-500 font-mono">{booking.bookingCode}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => copyToClipboard(booking.bookingCode, "booking")}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Salin kode pesanan"
                            >
                                {copiedCode === "booking" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Cetak"
                            >
                                <Printer className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Bagikan"
                            >
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className={`${statusConfig.bgColor} rounded-xl p-4 flex items-center gap-4`}>
                            <div className={`p-3 rounded-full bg-white/50`}>
                                <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold text-lg ${statusConfig.color}`}>{statusConfig.label}</p>
                                {booking.status === "AWAITING_PAYMENT" && booking.expiresAt && (
                                    <p className="text-sm text-orange-600">
                                        Pembayaran berakhir pada {formatDateTime(booking.expiresAt)}
                                    </p>
                                )}
                                {booking.status === "CANCELLED" && booking.cancellationReason && (
                                    <p className="text-sm text-red-600">
                                        Alasan: {booking.cancellationReason}
                                    </p>
                                )}
                                {booking.status === "CONFIRMED" && booking.confirmedAt && (
                                    <p className="text-sm text-green-600">
                                        Dikonfirmasi pada {formatDateTime(booking.confirmedAt)}
                                    </p>
                                )}
                            </div>
                            {booking.status === "AWAITING_PAYMENT" && (
                                <Link
                                    href={`/checkout/payment/${booking.id}`}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                                >
                                    Bayar Sekarang
                                </Link>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                                {booking.event.bannerImage && (
                                    <img
                                        src={booking.event.bannerImage}
                                        alt={booking.event.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full mb-2">
                                        {booking.event.eventType}
                                    </span>
                                    <h2 className="text-2xl font-bold text-white">{booking.event.title}</h2>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {booking.eventSchedule && (
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                            <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {formatDate(booking.eventSchedule.scheduleDate)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatTime(booking.eventSchedule.startTime)} - {formatTime(booking.eventSchedule.endTime)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {booking.event.eventType === "ONLINE" ? (
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                            <Video className="h-5 w-5 text-indigo-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Event Online</p>
                                                {(booking.status === "CONFIRMED" || booking.status === "PAID") && booking.event.onlineMeetingUrl && (
                                                    <a
                                                        href={booking.event.onlineMeetingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                                    >
                                                        Gabung Meeting <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ) : booking.event.venue ? (
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                            <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">{booking.event.venue.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {booking.event.venue.address}, {booking.event.venue.city}
                                                </p>
                                                {booking.event.venue.googlePlaceId && (
                                                    <a
                                                        href={`https://www.google.com/maps/place/?q=place_id:${booking.event.venue.googlePlaceId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1"
                                                    >
                                                        Lihat di Maps <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    {booking.event.organizer.organizerProfile?.organizationLogo ? (
                                        <img
                                            src={booking.event.organizer.organizerProfile.organizationLogo}
                                            alt={booking.event.organizer.organizerProfile.organizationName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-indigo-600" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-500">Diselenggarakan oleh</p>
                                        <p className="font-medium text-gray-900">
                                            {booking.event.organizer.organizerProfile?.organizationName || booking.event.organizer.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <QrCode className="h-5 w-5 text-indigo-600" />
                                    Tiket Kamu ({booking.bookedTickets.length})
                                </h3>
                                {hasValidTickets && (
                                    <button
                                        type="button"
                                        onClick={downloadAllTickets}
                                        disabled={downloadingAll}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {downloadingAll ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Mengunduh...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4" />
                                                Unduh Semua
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="divide-y">
                                {booking.bookedTickets.map((ticket, index) => {
                                    const ticketStatusConfig = TICKET_STATUS_CONFIG[ticket.status] || TICKET_STATUS_CONFIG.ACTIVE;
                                    const isExpanded = expandedTicket === ticket.id;

                                    return (
                                        <div key={ticket.id} className="p-4">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                                                className="w-full text-left"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{ticket.ticketType.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ticketStatusConfig.color}`}>
                                                                    {ticketStatusConfig.label}
                                                                </span>
                                                                {ticket.isCheckedIn && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Sudah Check-In
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <p className="text-sm font-medium text-gray-900">{formatCurrency(ticket.finalPrice)}</p>
                                                        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                                    </div>
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                                                            <div className="w-48 h-48 bg-white rounded-lg p-3 shadow-inner mb-3 flex items-center justify-center">
                                                                {ticket.status === "ACTIVE" ? (
                                                                    <QRCodeSVG
                                                                        value={ticket.uniqueCode}
                                                                        size={168}
                                                                        level="H"
                                                                        includeMargin={false}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                                                                        <QrCode className="h-24 w-24 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <code className="text-sm font-mono text-gray-700 bg-white px-3 py-1 rounded border">
                                                                    {ticket.uniqueCode}
                                                                </code>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => copyToClipboard(ticket.uniqueCode, ticket.id)}
                                                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                >
                                                                    {copiedCode === ticket.id ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                                </button>
                                                            </div>
                                                            {ticket.isCheckedIn && ticket.checkedInAt && (
                                                                <p className="text-sm text-gray-500 mt-3">
                                                                    Check-in pada {formatDateTime(ticket.checkedInAt)}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <p className="text-sm text-gray-500 mb-1">Tipe Tiket</p>
                                                                <p className="font-medium text-gray-900">{ticket.ticketType.name}</p>
                                                                {ticket.ticketType.description && (
                                                                    <p className="text-sm text-gray-600 mt-1">{ticket.ticketType.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-500 mb-1">Harga Satuan</p>
                                                                    <p className="font-medium text-gray-900">{formatCurrency(ticket.unitPrice)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-500 mb-1">Harga Akhir</p>
                                                                    <p className="font-medium text-gray-900">{formatCurrency(ticket.finalPrice)}</p>
                                                                </div>
                                                            </div>
                                                            {ticket.status === "ACTIVE" && !ticket.isCheckedIn && (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => downloadTicketPdf(ticket.id, ticket.uniqueCode)}
                                                                        disabled={downloadingTicket === ticket.id}
                                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                                                    >
                                                                        {downloadingTicket === ticket.id ? (
                                                                            <>
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                                Mengunduh...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Download className="h-4 w-4" />
                                                                                Unduh
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openTransferModal(ticket)}
                                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
                                                                    >
                                                                        <Send className="h-4 w-4" />
                                                                        Transfer
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {(booking.event.termsAndConditions || booking.event.refundPolicy) && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4 border-b">
                                    <h3 className="text-lg font-bold text-gray-900">Informasi Penting</h3>
                                </div>
                                <div className="divide-y">
                                    {booking.event.termsAndConditions && (
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setShowTerms(!showTerms)}
                                                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900">Syarat & Ketentuan</span>
                                                {showTerms ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                            </button>
                                            {showTerms && (
                                                <div className="px-4 pb-4">
                                                    <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                                                        {booking.event.termsAndConditions}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {booking.event.refundPolicy && (
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setShowRefundPolicy(!showRefundPolicy)}
                                                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900">Kebijakan Pengembalian</span>
                                                {showRefundPolicy ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                            </button>
                                            {showRefundPolicy && (
                                                <div className="px-4 pb-4">
                                                    <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                                                        {booking.event.refundPolicy}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b">
                                <h3 className="text-lg font-bold text-gray-900">Ringkasan Pesanan</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal ({booking.totalTickets} tiket)</span>
                                    <span className="font-medium">{formatCurrency(booking.subtotal)}</span>
                                </div>
                                {Number(booking.discountAmount) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Diskon</span>
                                        <span className="font-medium text-green-600">-{formatCurrency(booking.discountAmount)}</span>
                                    </div>
                                )}
                                {Number(booking.taxAmount) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Pajak</span>
                                        <span className="font-medium">{formatCurrency(booking.taxAmount)}</span>
                                    </div>
                                )}
                                {Number(booking.platformFee) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Biaya Layanan</span>
                                        <span className="font-medium">{formatCurrency(booking.platformFee)}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t flex justify-between">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-lg text-indigo-600">{formatCurrency(booking.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {booking.transaction && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4 border-b">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-indigo-600" />
                                        Info Pembayaran
                                    </h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">ID Transaksi</span>
                                        <span className="font-mono text-xs">{booking.transaction.transactionCode}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Metode Pembayaran</span>
                                        <span className="font-medium capitalize">{booking.transaction.paymentMethod.replace(/_/g, " ")}</span>
                                    </div>
                                    {booking.transaction.paymentChannel && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Kanal</span>
                                            <span className="font-medium">{booking.transaction.paymentChannel}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Status</span>
                                        <span className={`font-medium ${booking.transaction.status === "SUCCESS" ? "text-green-600" : "text-yellow-600"}`}>
                                            {booking.transaction.status}
                                        </span>
                                    </div>
                                    {booking.transaction.paidAt && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Dibayar Pada</span>
                                            <span className="font-medium">{formatDateTime(booking.transaction.paidAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {booking.refunds.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4 border-b">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <RefreshCw className="h-5 w-5 text-purple-600" />
                                        Riwayat Pengembalian
                                    </h3>
                                </div>
                                <div className="divide-y">
                                    {booking.refunds.map((refund) => (
                                        <div key={refund.id} className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    refund.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                                    refund.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                    {refund.status}
                                                </span>
                                                <span className="font-bold text-gray-900">{formatCurrency(refund.refundAmount)}</span>
                                            </div>
                                            <p className="text-sm text-gray-500">Pengembalian {refund.refundType}</p>
                                            {refund.reason && (
                                                <p className="text-sm text-gray-600 mt-1">{refund.reason}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">
                                                Diminta {formatDateTime(refund.requestedAt)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b">
                                <h3 className="text-lg font-bold text-gray-900">Butuh Bantuan?</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <a
                                    href={`mailto:${booking.event.organizer.email}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-700">Hubungi Penyelenggara</span>
                                </a>
                                <Link
                                    href="/contact"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-700">Hubungi Dukungan</span>
                                </Link>
                            </div>
                        </div>

                        {actions?.canCancel && (
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                            >
                                <Ban className="h-5 w-5" />
                                Batalkan Pesanan
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Batalkan Pesanan?</h3>
                                <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Apakah kamu yakin ingin membatalkan pesanan ini? Kamu perlu memesan lagi jika berubah pikiran.
                        </p>

                        <div className="mb-6">
                            <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                                Alasan pembatalan (opsional)
                            </label>
                            <textarea
                                id="cancelReason"
                                rows={3}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Beritahu kami mengapa kamu membatalkan..."
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                disabled={isCancelling}
                                className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Pertahankan Pesanan
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Membatalkan...
                                    </>
                                ) : (
                                    "Ya, Batalkan"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTransferModal && transferringTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        {transferSuccess ? (
                            <>
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Transfer Dikirim!</h3>
                                    <p className="text-gray-600 mb-6">
                                        Undangan transfer telah dikirim ke <strong>{transferEmail}</strong>. 
                                        Mereka akan menerima email untuk menerima tiket dalam 48 jam.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={closeTransferModal}
                                        className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <Send className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Transfer Tiket</h3>
                                        <p className="text-sm text-gray-500">{transferringTicket.ticketType.name}</p>
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-4">
                                    Kirim tiket ini ke orang lain. Mereka akan menerima email untuk menerima transfer.
                                </p>

                                {transferError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg mb-4">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <span className="text-sm">{transferError}</span>
                                    </div>
                                )}

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label htmlFor="transferEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Penerima <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="transferEmail"
                                            type="email"
                                            value={transferEmail}
                                            onChange={(e) => setTransferEmail(e.target.value)}
                                            placeholder="email@contoh.com"
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="transferName" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Penerima (opsional)
                                        </label>
                                        <input
                                            id="transferName"
                                            type="text"
                                            value={transferName}
                                            onChange={(e) => setTransferName(e.target.value)}
                                            placeholder="Nama lengkap penerima"
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                                    <p className="text-sm text-amber-800">
                                        <strong>Penting:</strong> Setelah penerima menerima transfer, tiket lama akan dinonaktifkan dan tiket baru akan diterbitkan atas nama mereka.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeTransferModal}
                                        disabled={isTransferring}
                                        className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleTransfer}
                                        disabled={isTransferring || !transferEmail}
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isTransferring ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Kirim Transfer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
