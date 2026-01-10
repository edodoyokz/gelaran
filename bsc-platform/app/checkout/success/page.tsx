"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Download, Ticket, ArrowRight, Loader2 } from "lucide-react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const bookingCode = searchParams.get("booking");

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    {/* Success Icon */}
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Pembayaran Berhasil! 🎉
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Terima kasih! Tiket kamu sudah dikonfirmasi.
                    </p>

                    {bookingCode && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-500 mb-1">Kode Booking</p>
                            <p className="text-xl font-bold font-mono text-indigo-600">
                                {bookingCode}
                            </p>
                        </div>
                    )}

                    <div className="bg-indigo-50 rounded-lg p-4 mb-6 text-left">
                        <div className="flex items-start gap-3">
                            <Ticket className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900">E-Ticket Terkirim</p>
                                <p className="text-sm text-gray-600">
                                    Kami sudah mengirim e-ticket ke email kamu. Cek inbox atau folder spam.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
                            <Download className="h-5 w-5" />
                            Download E-Ticket
                        </button>
                        <Link
                            href="/"
                            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            Lihat Event Lainnya
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
