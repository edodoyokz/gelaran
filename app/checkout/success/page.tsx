"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Download, Loader2, Ticket } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
    CheckoutActionBar,
    CheckoutPageShell,
} from "@/components/features/checkout/checkout-primitives";
import {
    CheckoutCallout,
    CheckoutStatusHero,
    CheckoutStatusKeyValue,
    CheckoutStatusNotes,
    CheckoutStatusSupport,
    CheckoutSuccessSummaryCard,
} from "@/components/features/checkout/checkout-result-primitives";

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
    const [isBookingLoading, setIsBookingLoading] = useState(false);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    useEffect(() => {
        if (!bookingCode) {
            setBookingData(null);
            setBookingError("Kode booking tidak ditemukan di URL. Gunakan halaman riwayat booking untuk membuka detail pesanan.");
            setIsBookingLoading(false);
            return;
        }

        const controller = new AbortController();
        let isActive = true;

        const loadBooking = async () => {
            setIsBookingLoading(true);
            setBookingError(null);
            setBookingData(null);

            try {
                const response = await fetch(`/api/my-bookings/${bookingCode}`, { signal: controller.signal });

                if (!response.ok) {
                    throw new Error("BOOKING_FETCH_FAILED");
                }

                let payload: unknown;

                try {
                    payload = await response.json();
                } catch {
                    throw new Error("BOOKING_PARSE_FAILED");
                }

                if (!isActive) {
                    return;
                }

                const data = payload as { success?: boolean; data?: BookingData };

                if (data.success && data.data) {
                    setBookingData(data.data);
                    return;
                }

                setBookingError("Detail booking belum bisa dimuat saat ini. Gunakan halaman detail booking atau coba beberapa saat lagi.");
            } catch (error) {
                if (!isActive || (error instanceof DOMException && error.name === "AbortError")) {
                    return;
                }

                setBookingError("Detail booking belum bisa dimuat saat ini. Gunakan halaman detail booking atau coba beberapa saat lagi.");
            } finally {
                if (isActive) {
                    setIsBookingLoading(false);
                }
            }
        };

        void loadBooking();

        return () => {
            isActive = false;
            controller.abort();
        };
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
                    title="Booking confirmed dan tiketmu sudah aman"
                    description="Pembayaran telah tervalidasi. Simpan referensi booking ini, buka detail pesanan, atau unduh ulang e-ticket dari halaman yang sama tanpa mengubah alur booking yang sudah ada."
                    bookingCode={bookingCode}
                    highlight={
                        <div className="rounded-[1.4rem] border border-[rgba(19,135,108,0.22)] bg-(--success-bg) px-4 py-4 shadow-(--shadow-xs)">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--success-text)">Status akses</p>
                            <p className="mt-2 text-sm leading-6 text-(--success-text)">
                                E-ticket dikirim ke email pembeli dan tetap bisa diunduh kembali dari halaman ini selama data booking tersedia.
                            </p>
                        </div>
                    }
                    detailCard={<CheckoutSuccessSummaryCard />}
                    supportNote={
                        <CheckoutStatusSupport>
                            Tunjukkan QR atau PDF tiket saat check-in. Gunakan kode booking ketika menghubungi penyelenggara atau support agar penelusuran transaksi lebih cepat.
                        </CheckoutStatusSupport>
                    }
                >
                    <CheckoutCallout
                        tone="success"
                        title="Salinan digital sudah disiapkan"
                        description="Cek inbox atau folder spam untuk email konfirmasi. Jika booking tidak langsung termuat, tombol unduh akan tetap aman dan nonaktif sampai data tersedia."
                        icon={Ticket}
                    />

                    <div className="rounded-[1.5rem] border border-(--border-light) bg-white/80 px-5 py-5 shadow-(--shadow-xs)">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Ringkasan tindakan</p>
                        <div className="mt-4 space-y-1">
                            <CheckoutStatusKeyValue label="Booking detail" value="Buka riwayat atau detail booking" />
                            <CheckoutStatusKeyValue
                                label="Tiket digital"
                                value={bookingData ? `${bookingData.bookedTickets.length} tiket siap diunduh` : isBookingLoading ? "Menunggu data booking dimuat" : bookingError ? "Gunakan detail booking untuk verifikasi" : "Menunggu data booking dimuat"}
                            />
                            <CheckoutStatusKeyValue label="Arah berikutnya" value="Lanjut ke dashboard atau jelajahi event lain" />
                        </div>
                    </div>

                    {bookingError ? (
                        <CheckoutCallout tone="warning" title="Detail booking belum tersedia" description={bookingError} />
                    ) : null}

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
                                disabled={isDownloading || isBookingLoading || !bookingData}
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
