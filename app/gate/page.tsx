"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
    Camera,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    LogOut,
    RefreshCw,
    Loader2,
    Keyboard,
    Settings,
} from "lucide-react";
import { getGateResultDisplay, type GateDisplayResultCode } from "@/lib/gate/result-display";

const QRScanner = dynamic(() => import("@/components/gate/QRScanner"), {
    ssr: false,
    loading: () => (
        <div className="bg-(--surface) rounded-xl p-8 border border-(--border) text-center">
            <Loader2 className="h-12 w-12 mx-auto text-(--text-muted) animate-spin mb-3" />
            <p className="text-(--text-secondary)">Memuat scanner...</p>
        </div>
    ),
});

interface EventData {
    id: string;
    title: string;
    posterImage: string | null;
    venue: { name: string; city: string } | null;
    schedule: { scheduleDate: string } | null;
}

interface Stats {
    totalSold: number;
    checkedIn: number;
    remaining: number;
    checkInPercentage: number;
}

interface CheckInResult {
    result: GateDisplayResultCode;
    message?: string;
    ticket?: {
        ticketType: string;
        attendeeName: string;
        bookingCode: string;
        eventTitle: string;
        checkedInAt: string;
    };
    checkedInAt?: string;
}

type CheckInApiPayload = {
    success?: boolean;
    data?: {
        result?: GateDisplayResultCode;
        message?: string;
        ticket?: CheckInResult["ticket"];
    };
    error?: {
        message?: string;
        details?: {
            result?: GateDisplayResultCode;
            checkedInAt?: string;
        };
    };
};

export default function GatePage() {
    const router = useRouter();
    const [deviceToken, setDeviceToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [staffName, setStaffName] = useState<string>("");
    const [event, setEvent] = useState<EventData | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);

    const [ticketCode, setTicketCode] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<CheckInResult | null>(null);

    const fetchEventData = useCallback(async (token: string) => {
        try {
            const res = await fetch("/api/gate/event", {
                headers: { "x-device-token": token },
            });
            const data = await res.json();

            if (!data.success) {
                localStorage.removeItem("gate_device_token");
                router.push("/gate/access");
                return;
            }

            setStaffName(data.data.staffName);
            setEvent(data.data.event);
            setStats(data.data.stats);
        } catch {
            router.push("/gate/access");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem("gate_device_token");
        if (!token) {
            router.push("/gate/access");
            return;
        }
        setDeviceToken(token);
        fetchEventData(token);
    }, [router, fetchEventData]);

    useEffect(() => {
        if (!deviceToken) return;
        const interval = setInterval(() => {
            fetchEventData(deviceToken);
        }, 30000);
        return () => clearInterval(interval);
    }, [deviceToken, fetchEventData]);

    const handleLogout = () => {
        localStorage.removeItem("gate_device_token");
        localStorage.removeItem("gate_staff_name");
        localStorage.removeItem("gate_event_id");
        localStorage.removeItem("gate_event_title");
        router.push("/gate/access");
    };

    const mapCheckInResponse = (payload: CheckInApiPayload): CheckInResult => {
        if (payload?.success) {
            return {
                result: payload.data?.result || "SUCCESS",
                message: payload.data?.message,
                ticket: payload.data?.ticket,
                checkedInAt: payload.data?.ticket?.checkedInAt,
            };
        }

        return {
            result: payload?.error?.details?.result || "INVALID",
            checkedInAt: payload?.error?.details?.checkedInAt,
            message: payload?.error?.message,
        };
    };

    const getResultIcon = (result: GateDisplayResultCode) => {
        if (result === "SUCCESS") {
            return <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-500" />;
        }

        if (result === "ALREADY_CHECKED_IN") {
            return <AlertCircle className="h-12 w-12 text-amber-500" />;
        }

        if (result === "ACCESS_DENIED" || result === "SESSION_INACTIVE") {
            return <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-500" />;
        }

        return <XCircle className="h-12 w-12 text-red-600 dark:text-red-500" />;
    };

    const handleQRCheckIn = useCallback(async (code: string): Promise<CheckInResult> => {
        if (!deviceToken) {
            return { result: "ACCESS_DENIED", message: "Akses gate tidak valid. Silakan login ulang." };
        }

        try {
            const res = await fetch("/api/gate/check-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-token": deviceToken,
                },
                body: JSON.stringify({ ticketCode: code.trim().toUpperCase() }),
            });

            const data = await res.json();

            return mapCheckInResponse(data);
        } catch {
            return { result: "INVALID", message: "Gagal menghubungi layanan check-in." };
        }
    }, [deviceToken]);

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketCode.trim() || !deviceToken) return;

        setIsScanning(true);
        setScanResult(null);

        try {
            const res = await fetch("/api/gate/check-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-token": deviceToken,
                },
                body: JSON.stringify({ ticketCode: ticketCode.trim().toUpperCase() }),
            });

            const data = await res.json();

            const result = mapCheckInResponse(data);
            setScanResult(result);

            if (result.result === "SUCCESS") {
                fetchEventData(deviceToken);
            }
        } catch {
            setScanResult({ result: "INVALID", message: "Gagal menghubungi layanan check-in." });
        } finally {
            setIsScanning(false);
            setTicketCode("");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-(--background) flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-(--background)">
            <header className="bg-(--surface) border-b border-(--border) sticky top-0 z-10 transition-colors">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <Camera className="h-5 w-5 text-(--accent-primary)" />
                                <h1 className="text-lg font-semibold text-foreground truncate">{event?.title}</h1>
                            </div>
                            <p className="text-sm text-(--text-secondary) truncate">Staff: {staffName}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                type="button"
                                onClick={() => deviceToken && fetchEventData(deviceToken)}
                                className="p-2 text-(--text-secondary) hover:text-foreground hover:bg-(--surface-hover) rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            {event && (
                                <a
                                    href={`/organizer/events/${event.id}/gate`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-(--text-secondary) hover:text-foreground hover:bg-(--surface-hover) rounded-lg transition-colors"
                                    title="Pengaturan"
                                >
                                    <Settings className="h-5 w-5" />
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="p-2 text-(--error) hover:text-red-600 dark:hover:text-red-400 hover:bg-(--error-bg) rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                {stats && (
                    <div className="mb-6 rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-sm)">
                        <div className="mb-4 grid gap-3 sm:grid-cols-3">
                            <article className="rounded-xl border border-(--border) bg-(--background) p-3 shadow-(--shadow-xs)">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Total tiket</p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">{stats.totalSold}</p>
                            </article>
                            <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 shadow-(--shadow-xs)">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Checked in</p>
                                <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.checkedIn}</p>
                            </article>
                            <article className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 shadow-(--shadow-xs)">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">Belum masuk</p>
                                <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.remaining}</p>
                            </article>
                        </div>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-2 text-(--text-secondary)">
                                <Users className="h-4 w-4" />
                                Check-in progress
                            </div>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-500">{stats.checkInPercentage}%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-(--surface-hover) overflow-hidden border border-(--border)">
                            <div
                                className="h-full bg-linear-to-r from-(--accent-primary) to-emerald-500 transition-all duration-500"
                                style={{ width: `${stats.checkInPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <QRScanner
                        onCheckIn={handleQRCheckIn}
                        onScanComplete={(result) => {
                            if (deviceToken && result.result === "SUCCESS") {
                                fetchEventData(deviceToken);
                            }
                        }}
                    />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-(--border)" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-(--background) text-(--text-muted)">atau</span>
                        </div>
                    </div>

                    <form onSubmit={handleCheckIn}>
                        <div className="flex items-center gap-2 mb-3 text-(--text-secondary)">
                            <Keyboard className="h-4 w-4" />
                            <span className="text-sm font-medium">Input Manual</span>
                        </div>
                        <input
                            type="text"
                            value={ticketCode}
                            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                            placeholder="Masukkan kode tiket..."
                            className="w-full px-4 py-4 bg-(--surface) border border-(--border) rounded-xl text-foreground text-center text-xl font-mono tracking-wider placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent-primary) focus:border-transparent outline-none transition-shadow"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={isScanning || !ticketCode.trim()}
                            className="w-full mt-4 py-4 bg-(--accent-primary) text-white rounded-xl font-semibold hover:bg-(--accent-primary-hover) disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-(--shadow-sm)"
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Check In
                                </>
                            )}
                        </button>
                    </form>

                    {scanResult && (() => {
                        const display = getGateResultDisplay(scanResult.result);
                        const toneClasses =
                            display.tone === "success"
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50"
                                : display.tone === "warning"
                                    ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50"
                                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50";
                        const titleClasses =
                            display.tone === "success"
                                ? "text-emerald-700 dark:text-emerald-400"
                                : display.tone === "warning"
                                    ? "text-amber-700 dark:text-amber-400"
                                    : "text-red-700 dark:text-red-400";

                        return (
                            <div className={`rounded-xl p-6 ${toneClasses} mt-6 shadow-(--shadow-sm)`}>
                                <div className="flex items-center gap-3 mb-4">
                                    {getResultIcon(scanResult.result)}
                                    <div>
                                        <h3 className={`text-xl font-bold ${titleClasses}`}>{display.title}</h3>
                                        <p className="text-sm text-(--text-secondary) mt-1">
                                            {scanResult.message || display.description}
                                        </p>
                                    </div>
                                </div>

                                {scanResult.ticket && (
                                    <div className="space-y-2 text-foreground">
                                        <p><span className="text-(--text-muted) mr-2">Nama:</span> <span className="font-medium">{scanResult.ticket.attendeeName}</span></p>
                                        <p><span className="text-(--text-muted) mr-2">Tiket:</span> <span className="font-medium">{scanResult.ticket.ticketType}</span></p>
                                        <p><span className="text-(--text-muted) mr-2">Booking:</span> <span className="font-mono">{scanResult.ticket.bookingCode}</span></p>
                                        <p><span className="text-(--text-muted) mr-2">Event:</span> {scanResult.ticket.eventTitle}</p>
                                    </div>
                                )}

                                {scanResult.checkedInAt && (
                                    <p className="text-(--text-muted) text-sm mt-4 border-t border-(--border) pt-4">
                                        Check-in pada: {new Date(scanResult.checkedInAt).toLocaleString("id-ID")}
                                    </p>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </main>
        </div>
    );
}
