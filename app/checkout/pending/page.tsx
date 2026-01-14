"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";

function PendingContent() {
    const searchParams = useSearchParams();
    const bookingCode = searchParams.get("booking");

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    {/* Pending Icon */}
                    <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                        <Clock className="h-12 w-12 text-yellow-500" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Menunggu Pembayaran
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Selesaikan pembayaran dalam waktu 30 menit untuk mengamankan tiket kamu.
                    </p>

                    {bookingCode && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-500 mb-1">Kode Booking</p>
                            <p className="text-xl font-bold font-mono text-gray-800">
                                {bookingCode}
                            </p>
                        </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-yellow-800">
                            <strong>Instruksi pembayaran</strong> sudah dikirim ke email kamu.
                            Ikuti langkah-langkah yang tertera untuk menyelesaikan pembayaran.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Cek Status Pembayaran
                        </button>
                        <Link
                            href="/"
                            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPendingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        }>
            <PendingContent />
        </Suspense>
    );
}
