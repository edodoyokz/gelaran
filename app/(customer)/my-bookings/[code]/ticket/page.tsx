"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft,
    Download,
    Share2,
    Copy,
    CheckCircle,
    Clock,
    AlertTriangle,
    MapPin,
    Calendar,
    Ticket,
    QrCode,
    Loader2,
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
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

const TICKET_STATUS_META: Record<string, { label: string; tone: "success" | "danger" | "warning" | "neutral" }> = {
    ACTIVE: { label: "Aktif", tone: "success" },
    CANCELLED: { label: "Dibatalkan", tone: "danger" },
    REFUNDED: { label: "Di-refund", tone: "warning" },
};

function TicketPageContent() {
    const params = useParams();
    const router = useRouter();
    const bookingCode = params.code as string;

    const [booking, setBooking] = useState<BookingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const fetchBooking = useCallback(async () => {
        try {
            const res = await fetch(`/api/my-bookings/${bookingCode}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Gagal memuat tiket");
            }

            setBooking(data.data);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [bookingCode]);

    useEffect(() => {
        fetchBooking();
    }, [bookingCode, fetchBooking]);

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

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-(--accent-primary)" />
                    <p className="text-(--text-muted)">Memuat tiket...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <DashboardSection>
                <div className="flex min-h-[45vh] items-center justify-center p-4">
                    <div className="max-w-md text-center">
                        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-(--error)" />
                        <h1 className="mb-2 text-2xl font-semibold text-foreground">Gagal memuat tiket</h1>
                        <p className="mb-6 text-(--text-secondary)">{error}</p>
                        <button
                            onClick={() => router.push("/my-bookings")}
                            className="inline-flex items-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke daftar pesanan
                        </button>
                    </div>
                </div>
            </DashboardSection>
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
        <div className="space-y-6 lg:space-y-8">
            <CustomerHero
                eyebrow="Ticket detail"
                title={`Tiket untuk ${booking.event.title}`}
                description={`Booking ${booking.bookingCode}. Lihat QR, kode tiket, dan file PDF untuk setiap tiket pada pesanan ini.`}
                meta={
                    <>
                        <CustomerStatusBadge label={`${booking.totalTickets} tiket`} tone="accent" icon={Ticket} />
                        <CustomerStatusBadge label={booking.status} tone="neutral" />
                    </>
                }
                actions={
                    <>
                        <Link
                            href={`/my-bookings/${bookingCode}`}
                            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Detail booking
                        </Link>
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow)"
                        >
                            <Share2 className="h-4 w-4" />
                            Bagikan tiket
                        </button>
                    </>
                }
            />

            <DashboardSection
                title="Ringkasan event"
                description="Informasi utama acara untuk membantu pengecekan tiket sebelum hari pelaksanaan."
            >
                <div className="flex flex-col gap-5 rounded-[1.75rem] border border-(--border-light) bg-(--surface-elevated) p-5 lg:flex-row">
                    <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-(--surface-brand-soft) lg:w-72 lg:shrink-0">
                        <Image
                            src={booking.event.posterImage || "/placeholder.jpg"}
                            alt={booking.event.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 288px"
                        />
                    </div>
                    <div className="min-w-0 flex-1 space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-foreground">{booking.event.title}</h2>
                            <p className="mt-1 text-sm text-(--text-secondary)">
                                Kode booking: <span className="font-mono">{booking.bookingCode}</span>
                            </p>
                        </div>

                        <CustomerInfoList
                            columns={2}
                            items={[
                                {
                                    icon: Calendar,
                                    label: "Tanggal & waktu",
                                    value: `${eventDate} • ${eventTime}`,
                                },
                                {
                                    icon: MapPin,
                                    label: "Lokasi",
                                    value:
                                        booking.event.eventType === "ONLINE"
                                            ? "Event online"
                                            : schedule?.locationOverride || "Lokasi akan diumumkan",
                                },
                            ]}
                        />
                    </div>
                </div>
            </DashboardSection>

            <DashboardSection
                title="Daftar tiket"
                description="Setiap tiket memiliki QR dan kode unik yang siap dipindai pada saat check-in."
            >
                <div className="space-y-4">
                    {booking.bookedTickets.map((ticket, idx) => {
                        const statusMeta = TICKET_STATUS_META[ticket.status] || {
                            label: ticket.status,
                            tone: "neutral" as const,
                        };

                        return (
                            <article
                                key={ticket.id}
                                className="rounded-[1.75rem] border border-(--border) bg-(--surface)/96 p-5 shadow-(--shadow-sm)"
                            >
                                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                                    <div className="space-y-5">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <CustomerStatusBadge label={`Tiket ${idx + 1} dari ${booking.bookedTickets.length}`} tone="neutral" icon={Ticket} />
                                                <CustomerStatusBadge label={statusMeta.label} tone={statusMeta.tone} />
                                                {ticket.isCheckedIn ? (
                                                    <CustomerStatusBadge label="Sudah check-in" tone="success" icon={CheckCircle} />
                                                ) : null}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-xl font-semibold text-foreground">{ticket.ticketType.name}</h3>
                                                <button
                                                    onClick={() => handleCopyTicketCode(ticket.uniqueCode)}
                                                    className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-3 py-1.5 text-xs font-semibold text-(--text-secondary) transition-colors hover:bg-(--surface-hover)"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                    {copiedCode === ticket.uniqueCode ? "Tersalin" : "Salin kode"}
                                                </button>
                                            </div>
                                            <p className="font-mono text-sm text-(--text-muted)">{ticket.uniqueCode}</p>
                                        </div>

                                        <CustomerInfoList
                                            columns={2}
                                            items={[
                                                {
                                                    icon: Ticket,
                                                    label: "Tipe tiket",
                                                    value: (
                                                        <>
                                                            <p>{ticket.ticketType.name}</p>
                                                            {ticket.ticketType.description ? (
                                                                <p className="text-(--text-secondary)">{ticket.ticketType.description}</p>
                                                            ) : null}
                                                        </>
                                                    ),
                                                },
                                                {
                                                    icon: Clock,
                                                    label: "Check-in",
                                                    value: ticket.isCheckedIn
                                                        ? `Sudah check-in pada ${formatDate(ticket.checkedInAt || "")}`
                                                        : "Belum check-in",
                                                },
                                                {
                                                    icon: Calendar,
                                                    label: "Tanggal & waktu",
                                                    value: `${eventDate} • ${eventTime}`,
                                                },
                                                {
                                                    icon: MapPin,
                                                    label: "Lokasi",
                                                    value:
                                                        booking.event.eventType === "ONLINE"
                                                            ? "Event online"
                                                            : schedule?.locationOverride || "Lokasi akan diumumkan",
                                                },
                                            ]}
                                        />

                                        <div className="rounded-2xl border border-(--border-light) bg-(--surface-elevated) p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-sm text-(--text-secondary)">Harga tiket</span>
                                                <span className="font-semibold text-foreground">
                                                    {formatCurrency(Number(ticket.unitPrice))}
                                                </span>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between gap-4 border-t border-(--border-light) pt-3">
                                                <span className="text-sm text-(--text-secondary)">Total</span>
                                                <span className="text-2xl font-semibold text-foreground">
                                                    {formatCurrency(Number(ticket.finalPrice))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <aside className="space-y-4">
                                        <div className="rounded-[1.75rem] border border-[rgba(41,179,182,0.22)] bg-(--surface-brand-soft) p-5 text-center">
                                            {ticket.qrCodeUrl ? (
                                                <Image
                                                    src={ticket.qrCodeUrl}
                                                    alt={`QR Code ${ticket.uniqueCode}`}
                                                    width={256}
                                                    height={256}
                                                    className="mx-auto h-64 w-64 rounded-2xl bg-white p-3"
                                                />
                                            ) : (
                                                <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl bg-white p-3">
                                                    <QrCode className="h-32 w-32 text-(--text-muted)" />
                                                </div>
                                            )}
                                            <p className="mt-4 text-sm text-(--text-secondary)">
                                                Scan QR Code untuk proses check-in.
                                            </p>
                                        </div>

                                        <div className="grid gap-3">
                                            <button
                                                onClick={() => handleDownloadTicket(ticket.id)}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow)"
                                            >
                                                <Download className="h-4 w-4" />
                                                Unduh tiket PDF
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                Bagikan tiket
                                            </button>
                                        </div>
                                    </aside>
                                </div>
                            </article>
                        );
                    })}

                    {booking.bookedTickets.length > 1 ? (
                        <div className="flex justify-center">
                            <button
                                onClick={handleDownloadAll}
                                className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                            >
                                <Download className="h-4 w-4" />
                                Unduh semua tiket ({booking.bookedTickets.length})
                            </button>
                        </div>
                    ) : null}
                </div>
            </DashboardSection>
        </div>
    );
}

export default function TicketPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-(--accent-primary)" />
                </div>
            }
        >
            <TicketPageContent />
        </Suspense>
    );
}
