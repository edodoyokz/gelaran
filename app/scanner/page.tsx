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
            return <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-500" />;
        }

        if (display.tone === "warning") {
            return <AlertCircle className="h-12 w-12 text-amber-500" />;
        }

        return <XCircle className="h-12 w-12 text-red-600 dark:text-red-500" />;
    };

    if (!eventId) {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_28%)] bg-(--background) px-4 py-10 text-foreground">
                <div className="mx-auto max-w-2xl rounded-3xl border border-(--border) bg-(--surface) p-8 text-center shadow-(--shadow-lg)">
                    <AlertCircle className="mx-auto mb-4 h-14 w-14 text-amber-500" />
                    <h1 className="text-2xl font-semibold text-foreground">Event ID required</h1>
                    <p className="mt-2 text-sm leading-7 text-(--text-secondary)">
                        Scanner membutuhkan parameter event dari organizer workspace sebelum check-in bisa dijalankan.
                    </p>
                    <Link
                        href="/organizer/events"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface-brand-soft) px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-(--surface-hover)"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke daftar event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_28%)] bg-(--background) px-4 py-6 text-foreground sm:py-8">
            <div className="mx-auto w-full max-w-3xl space-y-6">
                <header className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-lg) sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-(--accent-primary)">
                                <Camera className="h-5 w-5" />
                                <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">Scanner Utility</h1>
                            </div>
                            <p className="mt-1 text-sm text-(--text-secondary)">Mode check-in ringkas untuk operasional event.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full border border-(--border) bg-(--surface-brand-soft) px-3 py-1 text-xs font-semibold text-(--text-secondary)">
                                Event: {eventId}
                            </span>
                            <button
                                type="button"
                                onClick={fetchStats}
                                className="rounded-lg p-2 text-(--text-muted) transition-colors hover:bg-(--surface-hover) hover:text-foreground"
                                title="Refresh stats"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            <Link
                                href="/organizer/events"
                                className="rounded-lg p-2 text-(--text-muted) transition-colors hover:bg-(--surface-hover) hover:text-foreground"
                                title="Back to organizer events"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </header>

                {stats && (
                    <section className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-sm) sm:p-5">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <article className="rounded-2xl border border-(--border) bg-(--background) p-3.5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Total tiket</p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">{stats.total}</p>
                            </article>
                            <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Checked-in</p>
                                <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.checkedIn}</p>
                            </article>
                            <article className="rounded-2xl border border-(--border) bg-(--surface-brand-soft) p-3.5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-primary)">Progress</p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">{stats.percentage}%</p>
                            </article>
                        </div>
                        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-(--surface-hover)">
                            <div
                                className="h-full rounded-full bg-linear-to-r from-(--accent-primary) to-emerald-500 transition-all duration-500"
                                style={{ width: `${stats.percentage}%` }}
                            />
                        </div>
                        <p className="mt-2 text-sm text-(--text-secondary)">{stats.remaining} tiket belum check-in.</p>
                    </section>
                )}

                <div className="flex gap-2 rounded-2xl border border-(--border) bg-(--surface) p-2 shadow-(--shadow-sm)">
                    <button
                        type="button"
                        onClick={() => setMode("camera")}
                        className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${mode === "camera"
                            ? "bg-(--accent-primary) text-white"
                            : "bg-transparent text-(--text-secondary) hover:bg-(--surface-hover) hover:text-foreground"
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
                            ? "bg-(--accent-primary) text-white"
                            : "bg-transparent text-(--text-secondary) hover:bg-(--surface-hover) hover:text-foreground"
                            }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Keyboard className="h-4 w-4" />
                            Manual
                        </span>
                    </button>
                </div>

                {mode === "camera" ? (
                    <section className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-sm) sm:p-5">
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
                    <section className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-sm) sm:p-5">
                        <form onSubmit={handleManualSubmit}>
                            <label htmlFor="ticket-code" className="mb-2 block text-sm font-medium text-(--text-secondary)">
                                Kode tiket
                            </label>
                            <input
                                id="ticket-code"
                                type="text"
                                value={ticketCode}
                                onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                                placeholder="Contoh: ABCD1234"
                                className="w-full rounded-2xl border border-(--border) bg-(--background) px-4 py-4 text-center font-mono text-xl tracking-[0.2em] text-foreground placeholder:text-(--text-muted) focus:border-(--border-focus) focus:outline-none focus:ring-4 focus:ring-(--info-bg)"
                                autoComplete="off"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !ticketCode.trim()}
                                className="mt-4 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl bg-(--accent-primary) px-4 py-4 text-sm font-semibold text-white transition-all hover:bg-(--accent-primary-hover) disabled:cursor-not-allowed disabled:opacity-50"
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
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50"
                            : display.tone === "warning"
                                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50"
                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50";
                    const titleClasses =
                        display.tone === "success"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : display.tone === "warning"
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-red-700 dark:text-red-400";

                    return (
                        <section className={`rounded-3xl border p-5 ${toneClasses}`}>
                            <div className="flex items-start gap-3">
                                {getResultIcon(lastResult.result)}
                                <div className="min-w-0 flex-1">
                                    <h2 className={`text-xl font-semibold ${titleClasses}`}>{display.title}</h2>
                                    <p className="mt-1 text-sm text-(--text-secondary)">{lastResult.message || display.description}</p>
                                </div>
                            </div>
                            {lastResult.ticket && (
                                <div className="mt-4 grid gap-2 text-sm text-(--text-secondary) sm:grid-cols-2">
                                    <p><span className="text-(--text-muted)">Nama:</span> <span className="text-foreground font-medium">{lastResult.ticket.attendeeName}</span></p>
                                    <p><span className="text-(--text-muted)">Tiket:</span> <span className="text-foreground font-medium">{lastResult.ticket.ticketType}</span></p>
                                    <p><span className="text-(--text-muted)">Booking:</span> <span className="text-foreground font-mono">{lastResult.ticket.bookingCode}</span></p>
                                    <p><span className="text-(--text-muted)">Event:</span> <span className="text-foreground">{lastResult.ticket.eventTitle}</span></p>
                                </div>
                            )}
                            {lastResult.checkedInAt && (
                                <p className="mt-3 text-xs text-(--text-muted)">
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
                <div className="flex min-h-screen items-center justify-center bg-(--background)">
                    <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
                </div>
            }
        >
            <ScannerContent />
        </Suspense>
    );
}
