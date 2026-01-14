"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  Calendar,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Clock,
} from "lucide-react";

interface TransferInfo {
  transferId: string;
  status: string;
  expiresAt: string;
  isExpired: boolean;
  fromName: string;
  recipientEmail: string;
  event: {
    title: string;
    date: string | null;
    venue: { name: string; city: string } | null;
  };
  ticketType: string;
}

function AcceptTransferContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [transferInfo, setTransferInfo] = useState<TransferInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [acceptedTicket, setAcceptedTicket] = useState<{
    uniqueCode: string;
    eventTitle: string;
    ticketType: string;
  } | null>(null);

  const fetchTransferInfo = useCallback(async () => {
    if (!token) {
      setError("Invalid transfer link");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/tickets/transfer/accept?token=${token}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || "Transfer not found");
        setLoading(false);
        return;
      }

      setTransferInfo(data.data);
    } catch {
      setError("Failed to load transfer information");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransferInfo();
  }, [fetchTransferInfo]);

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    setError(null);

    try {
      const response = await fetch("/api/tickets/transfer/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          router.push(`/auth/login?redirect=/tickets/transfer/accept?token=${token}`);
          return;
        }
        setError(data.error?.message || "Failed to accept transfer");
        setAccepting(false);
        return;
      }

      setSuccess(true);
      setAcceptedTicket(data.data.ticket);
    } catch {
      setError("Failed to accept transfer. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Memuat informasi transfer...</p>
        </div>
      </div>
    );
  }

  if (success && acceptedTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Transfer Berhasil!</h1>
          </div>

          <div className="p-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Ticket className="w-6 h-6 text-emerald-600" />
                <span className="font-semibold text-emerald-800">Tiket Anda</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {acceptedTicket.eventTitle}
              </h2>
              <p className="text-gray-600">{acceptedTicket.ticketType}</p>
              <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-100">
                <p className="text-sm text-gray-500">Kode Tiket Baru</p>
                <p className="font-mono font-bold text-lg text-emerald-600">
                  {acceptedTicket.uniqueCode}
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm text-center mb-6">
              Tiket sudah tersedia di akun Anda. Anda dapat melihat dan mengunduh tiket di halaman My Bookings.
            </p>

            <Link
              href="/my-bookings"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Lihat Tiket Saya
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && !transferInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-500 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Transfer Tidak Ditemukan</h1>
          </div>

          <div className="p-8">
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!transferInfo) return null;

  const isExpired = transferInfo.isExpired || new Date() > new Date(transferInfo.expiresAt);
  const isAlreadyProcessed = transferInfo.status !== "PENDING";

  if (isExpired || isAlreadyProcessed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isExpired ? "Transfer Kadaluarsa" : `Transfer ${transferInfo.status.toLowerCase()}`}
            </h1>
          </div>

          <div className="p-8">
            <p className="text-gray-600 text-center mb-6">
              {isExpired
                ? "Link transfer ini sudah kadaluarsa. Silakan minta pengirim untuk mengirim ulang transfer."
                : `Transfer ini sudah ${transferInfo.status.toLowerCase()}.`}
            </p>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = transferInfo.event.date
    ? new Date(transferInfo.event.date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const expiresIn = Math.max(
    0,
    Math.floor((new Date(transferInfo.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Anda Menerima Tiket!</h1>
          <p className="text-indigo-100 mt-2">
            Dari <span className="font-semibold">{transferInfo.fromName}</span>
          </p>
        </div>

        <div className="p-8">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {transferInfo.event.title}
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Ticket className="w-5 h-5 text-indigo-600" />
                <span>{transferInfo.ticketType}</span>
              </div>

              {eventDate && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>{eventDate}</span>
                </div>
              )}

              {transferInfo.event.venue && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <span>
                    {transferInfo.event.venue.name}, {transferInfo.event.venue.city}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg mb-6">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">
              Link ini akan kadaluarsa dalam {expiresIn} jam
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {accepting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Terima Tiket
              </>
            )}
          </button>

          <p className="text-gray-500 text-xs text-center mt-4">
            Dengan menerima tiket ini, Anda menyetujui untuk terikat pada syarat dan ketentuan event.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Memuat...</p>
      </div>
    </div>
  );
}

export default function AcceptTransferPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptTransferContent />
    </Suspense>
  );
}
