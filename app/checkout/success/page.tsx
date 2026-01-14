"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Download, Ticket, ArrowRight, Loader2 } from "lucide-react";

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
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBookingData(data.data);
                }
            })
            .catch(() => {});
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
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

                    {downloadError && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">
                            {downloadError}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button 
                            type="button"
                            onClick={handleDownloadTickets}
                            disabled={isDownloading || !bookingData}
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Mengunduh...
                                </>
                            ) : (
                                <>
                                    <Download className="h-5 w-5" />
                                    Download E-Ticket
                                </>
                            )}
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
