"use client";

import { Suspense } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
    CheckoutActionBar,
    CheckoutPageShell,
} from "@/components/features/checkout/checkout-primitives";
import {
    CheckoutCallout,
    CheckoutFailedReasonCard,
    CheckoutStatusHero,
    CheckoutStatusKeyValue,
    CheckoutStatusNotes,
    CheckoutStatusSupport,
} from "@/components/features/checkout/checkout-result-primitives";

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
                    title="Pembayaran gagal dan booking belum aktif"
                    description="Transaksi belum tervalidasi sehingga tiket tidak diamankan untuk booking ini. Kamu tetap bisa membuka riwayat booking, memulai pesanan baru, atau menunggu pembaruan refund bila ada dana tertahan."
                    bookingCode={bookingCode}
                    highlight={
                        <div className="rounded-[1.4rem] border border-[rgba(217,79,61,0.22)] bg-(--error-bg) px-4 py-4 shadow-(--shadow-xs)">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--error-text)">Status dana</p>
                            <p className="mt-2 text-sm leading-6 text-(--error-text)">
                                Jika ada dana terpotong, pengembalian biasanya mengikuti SLA kanal pembayaran dan dapat membutuhkan 1–3 hari kerja.
                            </p>
                        </div>
                    }
                    detailCard={<CheckoutFailedReasonCard />}
                    supportNote={
                        <CheckoutStatusSupport>
                            Simpan kode booking ini sebagai referensi saat menghubungi support. Halaman ini tidak mengubah target navigasi atau alur pemesanan ulang yang sudah ada.
                        </CheckoutStatusSupport>
                    }
                >
                    <CheckoutCallout
                        tone="error"
                        title="Pesanan belum aktif"
                        description="Karena pembayaran tidak tuntas, tiket tidak diamankan untuk booking ini. Gunakan kode booking hanya sebagai referensi saat menghubungi penyelenggara atau support."
                    />

                    <div className="rounded-[1.5rem] border border-(--border-light) bg-white/80 px-5 py-5 shadow-(--shadow-xs)">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Langkah lanjutan</p>
                        <div className="mt-4 space-y-1">
                            <CheckoutStatusKeyValue label="Pemesanan baru" value="Gunakan CTA utama untuk mulai pesan ulang" />
                            <CheckoutStatusKeyValue label="Riwayat booking" value="Tetap tersedia untuk referensi transaksi" />
                            <CheckoutStatusKeyValue label="Refund" value="Ikuti SLA kanal pembayaran jika ada dana tertahan" />
                        </div>
                    </div>

                    <CheckoutActionBar
                        primary={{ href: "/events", label: "Pesan ulang event" }}
                        secondary={{ href: bookingCode ? `/my-bookings/${bookingCode}` : "/my-bookings", label: "Lihat riwayat booking" }}
                        tertiary={
                            <div className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-dashed border-[rgba(217,79,61,0.26)] bg-(--error-bg) px-5 py-3 text-sm font-medium text-(--error-text) shadow-(--shadow-xs)">
                                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                                <span>Info: siapkan metode pembayaran lain bila perlu</span>
                            </div>
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
