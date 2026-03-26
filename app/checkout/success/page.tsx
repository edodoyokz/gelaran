"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Download, Loader2, Ticket } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
    CheckoutActionBar,
    CheckoutCallout,
    CheckoutPageShell,
    CheckoutStatusHero,
    CheckoutStatusNotes,
} from "@/components/features/checkout/checkout-primitives";

interface BookingTicket {
    id: string;
    uniqueCode: string;
}

interface BookingData {
    id: string;
    bookingCode: string;
    bookedTickets: BookingTicket[];
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const bookingCode = searchParams.get("booking");
    const [isDownloading, setIsDownloading] = useState(false);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    useEffect(() => {
        if (!bookingCode) return;

        fetch(`/api/my-bookings/${bookingCode}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setBookingData(data.data);
                }
            })
            .catch(() => { });
    }, [bookingCode]);

    const handleDownloadTickets = useCallback(async () => {
        if (!bookingData?.bookedTickets?.length) {
            setDownloadError("Tidak ada tiket untuk didownload");
            return;
        }

        setIsDownloading(true);
        setDownloadError(null);

        try {
            for (const ticket of bookingData.bookedTickets) {
                const response = await fetch(`/api/tickets/${ticket.id}/pdf`);

                if (!response.ok) {
                    throw new Error("Gagal mengunduh tiket");
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `ticket-${ticket.uniqueCode.substring(0, 8)}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch {
            setDownloadError("Gagal mengunduh tiket. Silakan coba lagi.");
        } finally {
            setIsDownloading(false);
        }
    }, [bookingData]);

    return (
        <CheckoutPageShell
            title="Checkout selesai dan tiketmu sudah diamankan"
            description="Halaman ini merangkum outcome pembayaran serta langkah berikutnya untuk mengakses booking dan e-ticket Gelaran."
            backHref="/events"
            backLabel="Kembali ke katalog event"
        >
            <div className="space-y-6">
                <CheckoutStatusHero
                    tone="success"
                    title="Pembayaran berhasil diproses"
                    description="Terima kasih. Booking kamu sudah dikonfirmasi dan Gelaran sedang menyiapkan seluruh detail akses tiket untuk event yang dipilih."
                    bookingCode={bookingCode}
                    highlight={
                        <div className="rounded-2xl border border-[rgba(19,135,108,0.22)] bg-(--success-bg) px-4 py-4 shadow-(--shadow-xs)">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--success-text)">Status akses</p>
                            <p className="mt-2 text-sm leading-6 text-(--success-text)">
                                E-ticket dikirim ke email pembeli dan bisa diunduh kembali dari halaman ini selama data booking tersedia.
                            </p>
                        </div>
                    }
                >
                    <CheckoutCallout
                        tone="success"
                        title="E-ticket sedang disiapkan"
                        description="Cek inbox atau folder spam untuk email konfirmasi. Simpan kode booking agar proses check-in dan dukungan pelanggan lebih cepat."
                        icon={Ticket}
                    />

                    {downloadError ? (
                        <CheckoutCallout tone="error" title="Unduhan tiket gagal" description={downloadError} />
                    ) : null}

                    <CheckoutActionBar
                        primary={{ href: "/events", label: "Jelajahi event lain" }}
                        secondary={{ href: bookingCode ? `/my-bookings/${bookingCode}` : "/my-bookings", label: "Lihat detail booking" }}
                        tertiary={
                            <button
                                type="button"
                                onClick={handleDownloadTickets}
                                disabled={isDownloading || !bookingData}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface)/90 px-5 py-3 text-sm font-semibold text-foreground shadow-(--shadow-xs) transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover) disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Mengunduh tiket...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Download e-ticket
                                    </>
                                )}
                            </button>
                        }
                    />
                </CheckoutStatusHero>

                <CheckoutStatusNotes />
            </div>
        </CheckoutPageShell>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
