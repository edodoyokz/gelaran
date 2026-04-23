"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
    CheckoutActionBar,
    CheckoutPageShell,
} from "@/components/features/checkout/checkout-primitives";
import {
    CheckoutCallout,
    CheckoutPendingInstructionsCard,
    CheckoutStatusHero,
    CheckoutStatusKeyValue,
    CheckoutStatusNotes,
    CheckoutStatusRefreshButton,
    CheckoutStatusSupport,
} from "@/components/features/checkout/checkout-result-primitives";

function PendingContent() {
    const searchParams = useSearchParams();
    const bookingCode = searchParams.get("booking");

    return (
        <CheckoutPageShell
            title="Pembayaran masih menunggu penyelesaian"
            description="Gunakan halaman pending sebagai pusat informasi ketika pembayaran belum terkonfirmasi sepenuhnya oleh sistem Gelaran atau payment gateway."
            backHref="/events"
            backLabel="Kembali ke katalog event"
        >
            <div className="space-y-6">
                <CheckoutStatusHero
                    tone="pending"
                    title="Payment pending, selesaikan sebelum booking berakhir"
                    description="Booking sudah dibuat dan kursi atau kuota tetap mengikuti alur saat ini, tetapi pembayaran belum tervalidasi. Gunakan instruksi yang sudah dikirim sebelum batas waktu habis."
                    bookingCode={bookingCode}
                    highlight={
                        <div className="rounded-[1.4rem] border border-[rgba(251,193,23,0.3)] bg-(--warning-bg) px-4 py-4 shadow-(--shadow-xs)">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--warning-text)">Batas waktu</p>
                            <p className="mt-2 text-sm leading-6 text-(--warning-text)">
                                Selesaikan pembayaran dalam 30 menit atau sesuai instruksi yang kamu terima untuk menjaga ketersediaan tiket di booking ini.
                            </p>
                        </div>
                    }
                    detailCard={<CheckoutPendingInstructionsCard />}
                    supportNote={
                        <CheckoutStatusSupport>
                            Status pembayaran biasanya diperbarui otomatis beberapa menit setelah transfer berhasil. Jika masih tertunda, cek kembali email instruksi atau pantau detail booking.
                        </CheckoutStatusSupport>
                    }
                >
                    <CheckoutCallout
                        tone="warning"
                        title="Instruksi pembayaran telah dikirim"
                        description="Periksa email pembeli untuk detail transfer, virtual account, atau metode lain yang sedang dipakai. Beberapa channel membutuhkan jeda verifikasi sebelum status diperbarui."
                    />

                    <div className="rounded-[1.5rem] border border-(--border-light) bg-white/80 px-5 py-5 shadow-(--shadow-xs)">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Checklist pending</p>
                        <div className="mt-4 space-y-1">
                            <CheckoutStatusKeyValue label="Instruksi" value="Buka email pembeli yang dipakai saat checkout" />
                            <CheckoutStatusKeyValue label="Verifikasi" value="Tunggu pembaruan otomatis setelah pembayaran selesai" />
                            <CheckoutStatusKeyValue label="Pantauan" value={bookingCode ? "Gunakan detail booking untuk memantau perubahan status" : "Buka riwayat booking setelah kode tersedia"} />
                        </div>
                    </div>

                    <CheckoutActionBar
                        primary={{ href: "/events", label: "Lihat event lain" }}
                        secondary={{ href: bookingCode ? `/my-bookings/${bookingCode}` : "/my-bookings", label: "Pantau booking" }}
                        tertiary={
                            <CheckoutStatusRefreshButton onClick={() => window.location.reload()} label="Cek status pembayaran" />
                        }
                    />
                </CheckoutStatusHero>

                <CheckoutStatusNotes />
            </div>
        </CheckoutPageShell>
    );
}

export default function CheckoutPendingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
                </div>
            }
        >
            <PendingContent />
        </Suspense>
    );
}
