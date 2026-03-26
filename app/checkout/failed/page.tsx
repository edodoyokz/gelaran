"use client";

import { Suspense } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
    CheckoutActionBar,
    CheckoutCallout,
    CheckoutPageShell,
    CheckoutStatusHero,
    CheckoutStatusNotes,
} from "@/components/features/checkout/checkout-primitives";

function FailedContent() {
    const searchParams = useSearchParams();
    const bookingCode = searchParams.get("booking");

    return (
        <CheckoutPageShell
            title="Pembayaran tidak berhasil diselesaikan"
            description="Outcome gagal kini memakai struktur yang sama dengan halaman checkout lain agar status, tindakan berikutnya, dan referensi booking tetap mudah dipahami."
            backHref="/events"
            backLabel="Kembali ke katalog event"
        >
            <div className="space-y-6">
                <CheckoutStatusHero
                    tone="failed"
                    title="Pembayaran gagal diproses"
                    description="Booking ini belum berhasil dikonfirmasi. Kamu bisa memulai pemesanan ulang, mengecek riwayat booking, atau menunggu proses refund bila ada dana yang sempat tertahan."
                    bookingCode={bookingCode}
                    highlight={
                        <div className="rounded-2xl border border-[rgba(217,79,61,0.22)] bg-(--error-bg) px-4 py-4 shadow-(--shadow-xs)">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--error-text)">Status dana</p>
                            <p className="mt-2 text-sm leading-6 text-(--error-text)">
                                Jika ada dana terpotong, pengembalian biasanya mengikuti SLA kanal pembayaran dan dapat membutuhkan 1–3 hari kerja.
                            </p>
                        </div>
                    }
                >
                    <CheckoutCallout
                        tone="error"
                        title="Pesanan belum aktif"
                        description="Karena pembayaran tidak tuntas, tiket tidak diamankan untuk booking ini. Gunakan kode booking hanya sebagai referensi saat menghubungi penyelenggara atau support."
                    />

                    <CheckoutActionBar
                        primary={{ href: "/events", label: "Pesan ulang event" }}
                        secondary={{ href: bookingCode ? `/my-bookings/${bookingCode}` : "/my-bookings", label: "Lihat riwayat booking" }}
                        tertiary={
                            <span className="inline-flex min-h-12 items-center justify-center rounded-full border border-(--border) bg-(--surface)/90 px-5 py-3 text-sm font-medium text-(--text-secondary) shadow-(--shadow-xs)">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Siapkan metode pembayaran lain bila perlu
                            </span>
                        }
                    />
                </CheckoutStatusHero>

                <CheckoutStatusNotes />
            </div>
        </CheckoutPageShell>
    );
}

export default function CheckoutFailedPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
                </div>
            }
        >
            <FailedContent />
        </Suspense>
    );
}
