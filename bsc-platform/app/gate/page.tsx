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

const QRScanner = dynamic(() => import("@/components/gate/QRScanner"), {
    ssr: false,
    loading: () => (
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-gray-500 animate-spin mb-3" />
            <p className="text-gray-400">Memuat scanner...</p>
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
    result: "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID" | "WRONG_EVENT";
    ticket?: {
        ticketType: string;
        attendeeName: string;
        bookingCode: string;
        eventTitle: string;
        checkedInAt: string;
    };
    checkedInAt?: string;
}

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

    const handleQRCheckIn = useCallback(async (code: string): Promise<CheckInResult> => {
        if (!deviceToken) {
            return { result: "INVALID" };
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

            if (data.success) {
                return { result: "SUCCESS", ticket: data.data.ticket };
            }
            return {
                result: data.error?.data?.result || "INVALID",
                checkedInAt: data.error?.data?.checkedInAt,
            };
        } catch {
            return { result: "INVALID" };
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
            
            if (data.success) {
                setScanResult({ result: "SUCCESS", ticket: data.data.ticket });
                fetchEventData(deviceToken);
            } else {
                setScanResult({
                    result: data.error?.data?.result || "INVALID",
                    checkedInAt: data.error?.data?.checkedInAt,
                });
            }
        } catch {
            setScanResult({ result: "INVALID" });
        } finally {
            setIsScanning(false);
            setTicketCode("");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <Camera className="h-5 w-5 text-indigo-500" />
                                <h1 className="text-lg font-semibold text-white truncate">{event?.title}</h1>
                            </div>
                            <p className="text-sm text-gray-400 truncate">Staff: {staffName}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                type="button"
                                onClick={() => deviceToken && fetchEventData(deviceToken)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            {event && (
                                <a
                                    href={`/organizer/events/${event.id}/gate`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                    title="Pengaturan"
                                >
                                    <Settings className="h-5 w-5" />
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
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
                    <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                            <Users className="h-4 w-4" />
                            Check-in Progress
                        </div>
                        <div className="flex items-end gap-4">
                            <div className="text-3xl font-bold text-white">
                                {stats.checkedIn}<span className="text-gray-500 text-xl">/{stats.totalSold}</span>
                            </div>
                            <div className="text-emerald-400 font-semibold text-lg">
                                {stats.checkInPercentage}%
                            </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${stats.checkInPercentage}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {stats.remaining} tiket belum check-in
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    <QRScanner
                        onCheckIn={handleQRCheckIn}
                        onScanComplete={() => deviceToken && fetchEventData(deviceToken)}
                    />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-gray-900 text-gray-500">atau</span>
                        </div>
                    </div>

                    <form onSubmit={handleCheckIn}>
                        <div className="flex items-center gap-2 mb-3 text-gray-400">
                            <Keyboard className="h-4 w-4" />
                            <span className="text-sm">Input Manual</span>
                        </div>
                        <input
                            type="text"
                            value={ticketCode}
                            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                            placeholder="Masukkan kode tiket..."
                            className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-xl font-mono tracking-wider placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={isScanning || !ticketCode.trim()}
                            className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
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

                    {scanResult && (
                        <div
                            className={`rounded-xl p-6 ${
                                scanResult.result === "SUCCESS"
                                    ? "bg-emerald-900/50 border border-emerald-700"
                                    : scanResult.result === "ALREADY_CHECKED_IN"
                                    ? "bg-yellow-900/50 border border-yellow-700"
                                    : "bg-red-900/50 border border-red-700"
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                {scanResult.result === "SUCCESS" ? (
                                    <CheckCircle className="h-12 w-12 text-emerald-500" />
                                ) : scanResult.result === "ALREADY_CHECKED_IN" ? (
                                    <AlertCircle className="h-12 w-12 text-yellow-500" />
                                ) : (
                                    <XCircle className="h-12 w-12 text-red-500" />
                                )}
                                <div>
                                    <h3
                                        className={`text-xl font-bold ${
                                            scanResult.result === "SUCCESS"
                                                ? "text-emerald-400"
                                                : scanResult.result === "ALREADY_CHECKED_IN"
                                                ? "text-yellow-400"
                                                : "text-red-400"
                                        }`}
                                    >
                                        {scanResult.result === "SUCCESS"
                                            ? "Check-in Berhasil!"
                                            : scanResult.result === "ALREADY_CHECKED_IN"
                                            ? "Sudah Check-in"
                                            : scanResult.result === "WRONG_EVENT"
                                            ? "Event Berbeda"
                                            : "Tiket Tidak Valid"}
                                    </h3>
                                </div>
                            </div>

                            {scanResult.ticket && (
                                <div className="space-y-2 text-gray-300">
                                    <p><span className="text-gray-500">Nama:</span> {scanResult.ticket.attendeeName}</p>
                                    <p><span className="text-gray-500">Tiket:</span> {scanResult.ticket.ticketType}</p>
                                    <p><span className="text-gray-500">Booking:</span> {scanResult.ticket.bookingCode}</p>
                                </div>
                            )}

                            {scanResult.checkedInAt && (
                                <p className="text-gray-400 text-sm mt-4">
                                    Check-in pada: {new Date(scanResult.checkedInAt).toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
