"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";

function FailedContent() {
    const searchParams = useSearchParams();
    const bookingCode = searchParams.get("booking");

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    {/* Failed Icon */}
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="h-12 w-12 text-red-500" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Pembayaran Gagal
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Maaf, pembayaran kamu tidak berhasil diproses. Silakan coba lagi.
                    </p>

                    {bookingCode && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-500 mb-1">Kode Booking</p>
                            <p className="text-xl font-bold font-mono text-gray-400 line-through">
                                {bookingCode}
                            </p>
                        </div>
                    )}

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-red-800">
                            Pesanan kamu telah dibatalkan. Jika ada dana yang terpotong,
                            akan dikembalikan dalam 1-3 hari kerja.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Coba Pesan Ulang
                        </Link>
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

export default function CheckoutFailedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        }>
            <FailedContent />
        </Suspense>
    );
}
