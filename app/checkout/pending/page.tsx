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
                    title="Selesaikan pembayaran untuk mengamankan tiket"
                    description="Booking sudah dibuat, tetapi status pembayaran masih menunggu. Ikuti instruksi yang kamu terima agar reservasi tidak otomatis dilepas."
                    bookingCode={bookingCode}
                    highlight={
                        <div className="rounded-2xl border border-[rgba(251,193,23,0.3)] bg-(--warning-bg) px-4 py-4 shadow-(--shadow-xs)">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--warning-text)">Batas waktu</p>
                            <p className="mt-2 text-sm leading-6 text-(--warning-text)">
                                Selesaikan pembayaran dalam 30 menit atau sesuai instruksi yang kamu terima untuk menjaga ketersediaan tiket di booking ini.
                            </p>
                        </div>
                    }
                >
                    <CheckoutCallout
                        tone="warning"
                        title="Instruksi pembayaran telah dikirim"
                        description="Periksa email pembeli untuk detail transfer, virtual account, atau metode lain yang sedang dipakai. Beberapa channel membutuhkan jeda verifikasi sebelum status diperbarui."
                    />

                    <CheckoutActionBar
                        primary={{ href: "/events", label: "Lihat event lain" }}
                        secondary={{ href: bookingCode ? `/my-bookings/${bookingCode}` : "/my-bookings", label: "Pantau booking" }}
                        tertiary={
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface)/90 px-5 py-3 text-sm font-semibold text-foreground shadow-(--shadow-xs) transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Cek status pembayaran
                            </button>
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
