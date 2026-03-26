"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    AlertCircle,
    ArrowLeft,
    Camera,
    CheckCircle,
    Keyboard,
    Loader2,
    RefreshCw,
    Ticket,
    XCircle,
} from "lucide-react";
import QRScanner from "@/components/gate/QRScanner";
import { getGateResultDisplay, type GateDisplayResultCode } from "@/lib/gate/result-display";

interface CheckInResult {
    result: GateDisplayResultCode;
    message?: string;
    ticket?: {
        ticketType: string;
        attendeeName: string;
        attendeeEmail?: string;
        bookingCode: string;
        eventTitle: string;
        checkedInAt: string;
    };
    checkedInAt?: string;
}

interface CheckInStats {
    total: number;
    checkedIn: number;
    remaining: number;
    percentage: number;
}

type CheckInApiPayload = {
    success?: boolean;
    data?: {
        ticket?: CheckInResult["ticket"];
    };
    error?: {
        message?: string;
        data?: {
            result?: GateDisplayResultCode;
            checkedInAt?: string;
        };
    };
};

function ScannerContent() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get("event");

    const [ticketCode, setTicketCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
    const [stats, setStats] = useState<CheckInStats | null>(null);
    const [mode, setMode] = useState<"manual" | "camera">("camera");

    const fetchStats = useCallback(async () => {
        if (!eventId) return;

        try {
            const res = await fetch(`/api/check-in?eventId=${eventId}`);
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch { }
    }, [eventId]);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const mapCheckInPayload = (payload: CheckInApiPayload): CheckInResult => {
        if (payload.success) {
            return {
                result: "SUCCESS",
                ticket: payload.data?.ticket,
            };
        }

        return {
            result: payload.error?.data?.result || "INVALID",
            checkedInAt: payload.error?.data?.checkedInAt,
            message: payload.error?.message,
        };
    };

    const handleCheckIn = useCallback(
        async (code: string): Promise<CheckInResult> => {
            if (!eventId) {
                return {
                    result: "ACCESS_DENIED",
                    message: "Event tidak ditemukan. Buka scanner dari halaman event organizer.",
                };
            }

            try {
                const res = await fetch("/api/check-in", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ticketCode: code.trim().toUpperCase(), eventId }),
                });

                const payload = (await res.json()) as CheckInApiPayload;
                const result = mapCheckInPayload(payload);

                if (result.result === "SUCCESS") {
                    fetchStats();
                }

                return result;
            } catch {
                return {
                    result: "INVALID",
                    message: "Gagal menghubungi layanan check-in.",
                };
            }
        },
        [eventId, fetchStats],
    );

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketCode.trim()) return;

        setIsSubmitting(true);
        setLastResult(null);

        try {
            const result = await handleCheckIn(ticketCode);
            setLastResult(result);
        } finally {
            setIsSubmitting(false);
            setTicketCode("");
        }
    };

    const getResultIcon = (result: GateDisplayResultCode) => {
        const display = getGateResultDisplay(result);

        if (display.tone === "success") {
            return <CheckCircle className="h-12 w-12 text-emerald-500" />;
        }

        if (display.tone === "warning") {
            return <AlertCircle className="h-12 w-12 text-yellow-500" />;
        }

        return <XCircle className="h-12 w-12 text-red-500" />;
    };

    if (!eventId) {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_28%),#07111f] px-4 py-10 text-white">
                <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-slate-950/65 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur">
                    <AlertCircle className="mx-auto mb-4 h-14 w-14 text-yellow-500" />
                    <h1 className="text-2xl font-semibold text-white">Event ID required</h1>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                        Scanner membutuhkan parameter event dari organizer workspace sebelum check-in bisa dijalankan.
                    </p>
                    <Link
                        href="/organizer/events"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke daftar event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_28%),#07111f] px-4 py-6 text-white sm:py-8">
            <div className="mx-auto w-full max-w-3xl space-y-6">
                <header className="rounded-3xl border border-white/10 bg-slate-950/65 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-indigo-200">
                                <Camera className="h-5 w-5" />
                                <h1 className="truncate text-lg font-semibold text-white sm:text-xl">Scanner Utility</h1>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">Mode check-in ringkas untuk operasional event.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                                Event: {eventId}
                            </span>
                            <button
                                type="button"
                                onClick={fetchStats}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                                title="Refresh stats"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            <Link
                                href="/organizer/events"
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                                title="Back to organizer events"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </header>

                {stats && (
                    <section className="rounded-3xl border border-white/10 bg-slate-950/65 p-4 shadow-xl shadow-black/20 backdrop-blur sm:p-5">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <article className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total tiket</p>
                                <p className="mt-2 text-2xl font-semibold text-white">{stats.total}</p>
                            </article>
                            <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3.5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Checked-in</p>
                                <p className="mt-2 text-2xl font-semibold text-emerald-200">{stats.checkedIn}</p>
                            </article>
                            <article className="rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-3.5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">Progress</p>
                                <p className="mt-2 text-2xl font-semibold text-indigo-100">{stats.percentage}%</p>
                            </article>
                        </div>
                        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80">
                            <div
                                className="h-full rounded-full bg-linear-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                                style={{ width: `${stats.percentage}%` }}
                            />
                        </div>
                        <p className="mt-2 text-sm text-slate-400">{stats.remaining} tiket belum check-in.</p>
                    </section>
                )}

                <div className="flex gap-2 rounded-2xl border border-white/10 bg-slate-950/65 p-2 shadow-lg shadow-black/20 backdrop-blur">
                    <button
                        type="button"
                        onClick={() => setMode("camera")}
                        className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${mode === "camera"
                            ? "bg-indigo-600 text-white"
                            : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            Kamera
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("manual")}
                        className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${mode === "manual"
                            ? "bg-indigo-600 text-white"
                            : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Keyboard className="h-4 w-4" />
                            Manual
                        </span>
                    </button>
                </div>

                {mode === "camera" ? (
                    <section className="rounded-3xl border border-white/10 bg-slate-950/65 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5">
                        <QRScanner
                            onCheckIn={handleCheckIn}
                            onScanComplete={(result) => {
                                setLastResult(result);
                                if (result.result === "SUCCESS") {
                                    fetchStats();
                                }
                            }}
                        />
                    </section>
                ) : (
                    <section className="rounded-3xl border border-white/10 bg-slate-950/65 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5">
                        <form onSubmit={handleManualSubmit}>
                            <label htmlFor="ticket-code" className="mb-2 block text-sm font-medium text-slate-300">
                                Kode tiket
                            </label>
                            <input
                                id="ticket-code"
                                type="text"
                                value={ticketCode}
                                onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                                placeholder="Contoh: ABCD1234"
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center font-mono text-xl tracking-[0.2em] text-white placeholder:text-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                autoComplete="off"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !ticketCode.trim()}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Ticket className="h-5 w-5" />
                                        Check in tiket
                                    </>
                                )}
                            </button>
                        </form>
                    </section>
                )}

                {lastResult && mode === "manual" && (() => {
                    const display = getGateResultDisplay(lastResult.result);
                    const toneClasses =
                        display.tone === "success"
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : display.tone === "warning"
                                ? "border-yellow-500/30 bg-yellow-500/10"
                                : "border-red-500/30 bg-red-500/10";
                    const titleClasses =
                        display.tone === "success"
                            ? "text-emerald-300"
                            : display.tone === "warning"
                                ? "text-yellow-300"
                                : "text-red-300";

                    return (
                        <section className={`rounded-3xl border p-5 ${toneClasses}`}>
                            <div className="flex items-start gap-3">
                                {getResultIcon(lastResult.result)}
                                <div className="min-w-0 flex-1">
                                    <h2 className={`text-xl font-semibold ${titleClasses}`}>{display.title}</h2>
                                    <p className="mt-1 text-sm text-slate-300">{lastResult.message || display.description}</p>
                                </div>
                            </div>
                            {lastResult.ticket && (
                                <div className="mt-4 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                                    <p><span className="text-slate-400">Nama:</span> {lastResult.ticket.attendeeName}</p>
                                    <p><span className="text-slate-400">Tiket:</span> {lastResult.ticket.ticketType}</p>
                                    <p><span className="text-slate-400">Booking:</span> {lastResult.ticket.bookingCode}</p>
                                    <p><span className="text-slate-400">Event:</span> {lastResult.ticket.eventTitle}</p>
                                </div>
                            )}
                            {lastResult.checkedInAt && (
                                <p className="mt-3 text-xs text-slate-400">
                                    Check-in pada: {new Date(lastResult.checkedInAt).toLocaleString("id-ID")}
                                </p>
                            )}
                        </section>
                    );
                })()}
            </div>
        </div>
    );
}

export default function ScannerPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#07111f]">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            }
        >
            <ScannerContent />
        </Suspense>
    );
}
