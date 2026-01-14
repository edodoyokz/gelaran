"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Download,
    Share2,
    Copy,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    MapPin,
    Calendar,
    Ticket,
    User,
    Mail,
    QrCode,
    Loader2,
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

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
}

interface BookingData {
    id: string;
    bookingCode: string;
    status: string;
    totalTickets: number;
    totalAmount: string;
    event: BookingEvent;
    eventSchedule: EventSchedule | null;
    bookedTickets: BookedTicket[];
}

function TicketPageContent() {
    const params = useParams();
    const router = useRouter();
    const bookingCode = params.code as string;

    const [booking, setBooking] = useState<BookingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/my-bookings/${bookingCode}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Gagal memuat tiket");
            }

            setBooking(data.data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [bookingCode]);

    const handleDownloadTicket = async (ticketId: string) => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}/pdf`);
            if (!res.ok) {
                throw new Error("Gagal mengunduh tiket");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `tiket-${bookingCode}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Terjadi kesalahan saat mengunduh");
        }
    };

    const handleDownloadAll = async () => {
        for (const ticket of booking?.bookedTickets || []) {
            await handleDownloadTicket(ticket.id);
        }
    };

    const handleShare = async () => {
        if (navigator.share && booking) {
            await navigator.share({
                title: `Tiket ${booking.event.title}`,
                text: `Tiket untuk ${booking.event.title}`,
                url: window.location.href,
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            setCopiedCode("Link");
            setTimeout(() => setCopiedCode(null), 2000);
        }
    };

    const handleCopyTicketCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Aktif
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        <XCircle className="h-3.5 w-3.5" />
                        Dibatalkan
                    </span>
                );
            case "REFUNDED":
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        <Clock className="h-3.5 w-3.5" />
                        Di-refund
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                        {status}
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                    <p className="text-gray-600">Memuat tiket...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Tiket</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/my-bookings")}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Kembali ke Daftar Pesanan
                    </button>
                </div>
            </div>
        );
    }

    if (!booking) {
        return null;
    }

    const schedule = booking.eventSchedule;
    const eventDate = schedule ? formatDate(schedule.scheduleDate) : "Tanggal akan diumumkan";
    const eventTime = schedule
        ? `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)} WIB`
        : "Waktu akan diumumkan";

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <button
                        onClick={() => router.push("/my-bookings")}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Daftar Pesanan</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {booking.bookedTickets.map((ticket, idx) => (
                        <div key={ticket.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
                            {booking.bookedTickets.length > 1 && (
                                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-600">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white">
                                            <Ticket className="h-5 w-5" />
                                            <span className="font-bold">Tiket {idx + 1} dari {booking.bookedTickets.length}</span>
                                        </div>
                                        <span className="text-white/80 text-sm font-mono">
                                            #{booking.bookingCode}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 lg:p-8">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                                {booking.event.title}
                                            </h2>
                                            <div className="flex items-center gap-2 mb-4">
                                                {getStatusBadge(ticket.status)}
                                                <span className="text-sm text-gray-500">
                                                    Kode Tiket: {ticket.uniqueCode}
                                                </span>
                                                <button
                                                    onClick={() => handleCopyTicketCode(ticket.uniqueCode)}
                                                    className="text-indigo-600 hover:text-indigo-700"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                                {copiedCode === ticket.uniqueCode && (
                                                    <span className="text-xs text-green-600">Tersalin!</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <Ticket className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500 mb-1">Tipe Tiket</p>
                                                    <p className="font-semibold text-gray-900">{ticket.ticketType.name}</p>
                                                    {ticket.ticketType.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {ticket.ticketType.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {ticket.isCheckedIn ? (
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-500 mb-1">Check-in</p>
                                                        <p className="font-semibold text-green-600">
                                                            Sudah check-in pada {formatDate(ticket.checkedInAt || "")}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-amber-100 rounded-lg">
                                                        <Clock className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-500 mb-1">Check-in</p>
                                                        <p className="font-semibold text-amber-600">Belum check-in</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Calendar className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500 mb-1">Tanggal & Waktu</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {eventDate} | {eventTime}
                                                    </p>
                                                </div>
                                            </div>

                                            {booking.event.eventType !== "ONLINE" && (
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-pink-100 rounded-lg">
                                                        <MapPin className="h-5 w-5 text-pink-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-500 mb-1">Lokasi</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {booking.event.eventType === "ONLINE"
                                                                ? "Online Event"
                                                                : schedule?.locationOverride || "Lokasi akan diumumkan"}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-gray-100 pt-6">
                                            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Harga Tiket</span>
                                                    <span className="font-bold text-gray-900">
                                                        {formatCurrency(Number(ticket.unitPrice))}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Total</span>
                                                    <span className="font-bold text-2xl text-indigo-600">
                                                        {formatCurrency(Number(ticket.finalPrice))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full lg:w-80 flex flex-col gap-6">
                                        <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 flex flex-col items-center justify-center">
                                            {ticket.qrCodeUrl ? (
                                                <img
                                                    src={ticket.qrCodeUrl}
                                                    alt={`QR Code ${ticket.uniqueCode}`}
                                                    className="w-64 h-64"
                                                />
                                            ) : (
                                                <QrCode className="h-64 w-64 text-gray-300" />
                                            )}
                                            <p className="text-center text-sm text-gray-600 mt-4">
                                                Scan QR Code untuk check-in
                                            </p>
                                            <p className="text-center text-xs text-gray-500 mt-2 font-mono">
                                                {ticket.uniqueCode}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <button
                                                onClick={() => handleDownloadTicket(ticket.id)}
                                                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Download className="h-5 w-5" />
                                                Unduh Tiket PDF
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                className="w-full px-6 py-4 border-2 border-indigo-200 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Share2 className="h-5 w-5" />
                                                Bagikan Tiket
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {booking.bookedTickets.length > 1 && idx < booking.bookedTickets.length - 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Tiket berikutnya pada pesanan ini
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}

                    {booking.bookedTickets.length > 1 && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleDownloadAll}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2"
                            >
                                <Download className="h-5 w-5" />
                                Unduh Semua Tiket ({booking.bookedTickets.length})
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TicketPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
            </div>
        }>
            <TicketPageContent />
        </Suspense>
    );
}
