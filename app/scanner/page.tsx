"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Camera,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    ArrowLeft,
    RefreshCw,
    Loader2,
    Keyboard
} from "lucide-react";

interface CheckInResult {
    result: "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID" | "WRONG_EVENT";
    ticket?: {
        ticketType: string;
        attendeeName: string;
        attendeeEmail: string;
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

function ScannerContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const eventId = searchParams.get("event");

    const [ticketCode, setTicketCode] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
    const [stats, setStats] = useState<CheckInStats | null>(null);
    const [manualMode, setManualMode] = useState(true);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        if (!eventId) return;
        try {
            const res = await fetch(`/api/check-in?eventId=${eventId}`);
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, [eventId]);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const handleScan = async (code: string) => {
        if (!code.trim()) return;

        setIsScanning(true);
        setLastResult(null);

        try {
            const res = await fetch("/api/check-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketCode: code.trim(), eventId }),
            });

            const data = await res.json();

            if (data.success) {
                setLastResult({ result: "SUCCESS", ticket: data.data.ticket });
                fetchStats();
            } else {
                setLastResult({
                    result: data.error?.data?.result || "INVALID",
                    checkedInAt: data.error?.data?.checkedInAt,
                });
            }
        } catch {
            setLastResult({ result: "INVALID" });
        } finally {
            setIsScanning(false);
            setTicketCode("");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleScan(ticketCode);
    };

    if (!eventId) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-white mb-2">Event ID Required</h1>
                    <p className="text-gray-400 mb-4">Please select an event to scan tickets.</p>
                    <Link
                        href="/organizer/events"
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Events
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/organizer" className="text-gray-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-lg font-semibold text-white">QR Scanner</h1>
                    <button
                        onClick={fetchStats}
                        className="text-gray-400 hover:text-white"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6">
                {/* Stats */}
                {stats && (
                    <div className="bg-gray-800 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-300">Check-in Progress</span>
                            </div>
                            <span className="text-2xl font-bold text-white">{stats.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                            <div
                                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${stats.percentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>{stats.checkedIn} checked in</span>
                            <span>{stats.remaining} remaining</span>
                        </div>
                    </div>
                )}

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setManualMode(true)}
                        className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${manualMode
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-800 text-gray-400"
                            }`}
                    >
                        <Keyboard className="h-5 w-5" />
                        Manual Input
                    </button>
                    <button
                        onClick={() => setManualMode(false)}
                        className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${!manualMode
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-800 text-gray-400"
                            }`}
                    >
                        <Camera className="h-5 w-5" />
                        Camera
                    </button>
                </div>

                {/* Scanner Area */}
                {manualMode ? (
                    <form onSubmit={handleSubmit} className="mb-6">
                        <input
                            type="text"
                            value={ticketCode}
                            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                            placeholder="Enter ticket code..."
                            className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-xl font-mono tracking-wider placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            autoFocus
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={isScanning || !ticketCode.trim()}
                            className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Check In
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="aspect-square bg-gray-800 rounded-xl mb-6 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>Camera scanning coming soon</p>
                            <p className="text-sm">Use manual input for now</p>
                        </div>
                    </div>
                )}

                {/* Result Display */}
                {lastResult && (
                    <div
                        className={`rounded-xl p-6 mb-6 ${lastResult.result === "SUCCESS"
                                ? "bg-green-900/50 border border-green-700"
                                : lastResult.result === "ALREADY_CHECKED_IN"
                                    ? "bg-yellow-900/50 border border-yellow-700"
                                    : "bg-red-900/50 border border-red-700"
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            {lastResult.result === "SUCCESS" ? (
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            ) : lastResult.result === "ALREADY_CHECKED_IN" ? (
                                <AlertCircle className="h-12 w-12 text-yellow-500" />
                            ) : (
                                <XCircle className="h-12 w-12 text-red-500" />
                            )}
                            <div>
                                <h3 className={`text-xl font-bold ${lastResult.result === "SUCCESS"
                                        ? "text-green-400"
                                        : lastResult.result === "ALREADY_CHECKED_IN"
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                    }`}>
                                    {lastResult.result === "SUCCESS"
                                        ? "Check-in Successful!"
                                        : lastResult.result === "ALREADY_CHECKED_IN"
                                            ? "Already Checked In"
                                            : lastResult.result === "WRONG_EVENT"
                                                ? "Wrong Event"
                                                : "Invalid Ticket"}
                                </h3>
                            </div>
                        </div>

                        {lastResult.ticket && (
                            <div className="space-y-2 text-gray-300">
                                <p><span className="text-gray-500">Name:</span> {lastResult.ticket.attendeeName}</p>
                                <p><span className="text-gray-500">Ticket:</span> {lastResult.ticket.ticketType}</p>
                                <p><span className="text-gray-500">Booking:</span> {lastResult.ticket.bookingCode}</p>
                            </div>
                        )}

                        {lastResult.checkedInAt && (
                            <p className="text-gray-400 text-sm mt-4">
                                Checked in at: {new Date(lastResult.checkedInAt).toLocaleString("id-ID")}
                            </p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ScannerPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        }>
            <ScannerContent />
        </Suspense>
    );
}
