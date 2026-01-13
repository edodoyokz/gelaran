"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
    Camera,
    ShoppingCart,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    LogOut,
    RefreshCw,
    Loader2,
    Keyboard,
    Plus,
    Minus,
    CreditCard,
    Printer,
    ToggleLeft,
    ToggleRight,
    DollarSign,
    User,
    Phone,
    Mail,
    Ticket,
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

interface TicketType {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    availableQuantity: number;
    maxPerOrder: number;
    isFree: boolean;
}

interface EventData {
    id: string;
    title: string;
    posterImage: string | null;
    venue: { name: string; city: string } | null;
    schedule: { scheduleDate: string } | null;
    ticketTypes: TicketType[];
}

interface Stats {
    totalSold: number;
    checkedIn: number;
    remaining: number;
    onSiteSales: number;
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

interface SellResult {
    bookingCode: string;
    status: string;
    totalAmount: number;
    paymentToken?: string;
    paymentUrl?: string;
    tickets: Array<{
        id: string;
        uniqueCode: string;
        ticketType: string;
        unitPrice: number;
    }>;
}

type Mode = "SCAN" | "SELL";

declare global {
    interface Window {
        snap?: {
            pay: (token: string, options: {
                onSuccess?: (result: unknown) => void;
                onPending?: (result: unknown) => void;
                onError?: (result: unknown) => void;
                onClose?: () => void;
            }) => void;
        };
    }
}

export default function GatePage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("SCAN");
    const [deviceToken, setDeviceToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [staffName, setStaffName] = useState<string>("");
    const [event, setEvent] = useState<EventData | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    
    const [ticketCode, setTicketCode] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
    
    const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
    const [buyerName, setBuyerName] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [buyerEmail, setBuyerEmail] = useState("");
    const [autoCheckIn, setAutoCheckIn] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sellResult, setSellResult] = useState<SellResult | null>(null);
    const [sellError, setSellError] = useState<string | null>(null);

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

    useEffect(() => {
        const script = document.createElement("script");
        script.src = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

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

    const updateTicketQuantity = (ticketTypeId: string, delta: number) => {
        setSelectedTickets((prev) => {
            const current = prev[ticketTypeId] || 0;
            const ticketType = event?.ticketTypes.find((t) => t.id === ticketTypeId);
            const max = Math.min(ticketType?.maxPerOrder || 10, ticketType?.availableQuantity || 0);
            const newValue = Math.max(0, Math.min(max, current + delta));
            
            if (newValue === 0) {
                const { [ticketTypeId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [ticketTypeId]: newValue };
        });
    };

    const calculateTotal = () => {
        if (!event) return 0;
        return Object.entries(selectedTickets).reduce((total, [id, qty]) => {
            const ticketType = event.ticketTypes.find((t) => t.id === id);
            return total + (ticketType?.basePrice || 0) * qty;
        }, 0);
    };

    const getTotalTickets = () => {
        return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    };

    const handleSell = async () => {
        if (!deviceToken || getTotalTickets() === 0 || buyerName.trim().length < 2) return;
        
        setIsProcessing(true);
        setSellError(null);
        setSellResult(null);
        
        try {
            const tickets = Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => ({
                ticketTypeId,
                quantity,
            }));
            
            const res = await fetch("/api/gate/sell", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-token": deviceToken,
                },
                body: JSON.stringify({
                    tickets,
                    buyerName: buyerName.trim(),
                    buyerPhone: buyerPhone.trim() || undefined,
                    buyerEmail: buyerEmail.trim() || undefined,
                    autoCheckIn,
                }),
            });
            
            const data = await res.json();
            
            if (!data.success) {
                setSellError(data.error?.message || "Gagal membuat pesanan");
                return;
            }
            
            if (data.data.paymentToken && window.snap) {
                window.snap.pay(data.data.paymentToken, {
                    onSuccess: () => {
                        setSellResult(data.data);
                        resetSellForm();
                        fetchEventData(deviceToken);
                    },
                    onPending: () => {
                        setSellResult(data.data);
                    },
                    onError: () => {
                        setSellError("Pembayaran gagal");
                    },
                    onClose: () => {
                        setSellError("Pembayaran dibatalkan");
                    },
                });
            } else if (data.data.status === "CONFIRMED") {
                setSellResult(data.data);
                resetSellForm();
                fetchEventData(deviceToken);
            }
        } catch {
            setSellError("Terjadi kesalahan");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetSellForm = () => {
        setSelectedTickets({});
        setBuyerName("");
        setBuyerPhone("");
        setBuyerEmail("");
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
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
                            <h1 className="text-lg font-semibold text-white truncate">{event?.title}</h1>
                            <p className="text-sm text-gray-400 truncate">Staff: {staffName}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                onClick={() => deviceToken && fetchEventData(deviceToken)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            <button
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                    <Users className="h-4 w-4" />
                                    Check-in
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {stats.checkedIn}/{stats.totalSold}
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${stats.checkInPercentage}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                    <ShoppingCart className="h-4 w-4" />
                                    Penjualan On-Site
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.onSiteSales}</div>
                                <div className="text-sm text-gray-500 mt-1">transaksi</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setMode("SCAN"); setScanResult(null); }}
                        className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                            mode === "SCAN"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                    >
                        <Camera className="h-5 w-5" />
                        Scan
                    </button>
                    <button
                        onClick={() => { setMode("SELL"); setSellResult(null); setSellError(null); }}
                        className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                            mode === "SELL"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        Jual
                    </button>
                </div>

                {mode === "SCAN" && (
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
                                className="w-full mt-4 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
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
                                        ? "bg-green-900/50 border border-green-700"
                                        : scanResult.result === "ALREADY_CHECKED_IN"
                                        ? "bg-yellow-900/50 border border-yellow-700"
                                        : "bg-red-900/50 border border-red-700"
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    {scanResult.result === "SUCCESS" ? (
                                        <CheckCircle className="h-12 w-12 text-green-500" />
                                    ) : scanResult.result === "ALREADY_CHECKED_IN" ? (
                                        <AlertCircle className="h-12 w-12 text-yellow-500" />
                                    ) : (
                                        <XCircle className="h-12 w-12 text-red-500" />
                                    )}
                                    <div>
                                        <h3
                                            className={`text-xl font-bold ${
                                                scanResult.result === "SUCCESS"
                                                    ? "text-green-400"
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
                )}

                {mode === "SELL" && (
                    <div className="space-y-6">
                        {sellResult ? (
                            <div className="bg-green-900/50 border border-green-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="h-12 w-12 text-green-500" />
                                    <div>
                                        <h3 className="text-xl font-bold text-green-400">Penjualan Berhasil!</h3>
                                        <p className="text-gray-400">Kode: {sellResult.bookingCode}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    {sellResult.tickets.map((ticket) => (
                                        <div key={ticket.id} className="bg-gray-800 rounded-lg p-3 flex items-center gap-3">
                                            <Ticket className="h-5 w-5 text-indigo-400" />
                                            <div className="flex-1">
                                                <p className="text-white font-mono text-sm">{ticket.uniqueCode}</p>
                                                <p className="text-gray-400 text-sm">{ticket.ticketType}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={handlePrint}
                                        className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
                                    >
                                        <Printer className="h-5 w-5" />
                                        Cetak Tiket
                                    </button>
                                    <button
                                        onClick={() => setSellResult(null)}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        Penjualan Baru
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                    <div className="p-4 border-b border-gray-700">
                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                            <Ticket className="h-5 w-5 text-indigo-400" />
                                            Pilih Tiket
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-700">
                                        {event?.ticketTypes.map((ticketType) => (
                                            <div key={ticketType.id} className="p-4 flex items-center justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-white">{ticketType.name}</h4>
                                                    <p className="text-sm text-gray-400">
                                                        {ticketType.isFree ? "Gratis" : formatCurrency(ticketType.basePrice)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Tersedia: {ticketType.availableQuantity}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateTicketQuantity(ticketType.id, -1)}
                                                        disabled={!selectedTickets[ticketType.id]}
                                                        className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center disabled:opacity-30 hover:bg-gray-600 transition-colors"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-8 text-center text-lg font-semibold text-white">
                                                        {selectedTickets[ticketType.id] || 0}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateTicketQuantity(ticketType.id, 1)}
                                                        disabled={
                                                            (selectedTickets[ticketType.id] || 0) >= ticketType.maxPerOrder ||
                                                            (selectedTickets[ticketType.id] || 0) >= ticketType.availableQuantity
                                                        }
                                                        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-30 hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {getTotalTickets() > 0 && (
                                    <>
                                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-4">
                                            <h3 className="font-semibold text-white flex items-center gap-2">
                                                <User className="h-5 w-5 text-indigo-400" />
                                                Data Pembeli
                                            </h3>
                                            
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">
                                                    Nama <span className="text-red-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                    <input
                                                        type="text"
                                                        value={buyerName}
                                                        onChange={(e) => setBuyerName(e.target.value)}
                                                        placeholder="Nama pembeli"
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Telepon</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                    <input
                                                        type="tel"
                                                        value={buyerPhone}
                                                        onChange={(e) => setBuyerPhone(e.target.value)}
                                                        placeholder="08xxxxxxxxxx"
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                    <input
                                                        type="email"
                                                        value={buyerEmail}
                                                        onChange={(e) => setBuyerEmail(e.target.value)}
                                                        placeholder="email@example.com"
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setAutoCheckIn(!autoCheckIn)}
                                            className="w-full bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="h-5 w-5 text-indigo-400" />
                                                <span className="text-white">Auto Check-in setelah bayar</span>
                                            </div>
                                            {autoCheckIn ? (
                                                <ToggleRight className="h-8 w-8 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="h-8 w-8 text-gray-500" />
                                            )}
                                        </button>

                                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-gray-400">Subtotal ({getTotalTickets()} tiket)</span>
                                                <span className="text-xl font-bold text-white">{formatCurrency(calculateTotal())}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                                <span>Platform Fee (5%)</span>
                                                <span>{formatCurrency(Math.round(calculateTotal() * 0.05))}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                                <span>PPN (11%)</span>
                                                <span>{formatCurrency(Math.round(calculateTotal() * 0.11))}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                                                <span className="text-white font-semibold">Total</span>
                                                <span className="text-2xl font-bold text-green-400">
                                                    {formatCurrency(calculateTotal() + Math.round(calculateTotal() * 0.05) + Math.round(calculateTotal() * 0.11))}
                                                </span>
                                            </div>
                                        </div>

                                        {sellError && (
                                            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                                <span>{sellError}</span>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleSell}
                                            disabled={isProcessing || buyerName.trim().length < 2}
                                            className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Memproses...
                                                </>
                                            ) : calculateTotal() === 0 ? (
                                                <>
                                                    <CheckCircle className="h-5 w-5" />
                                                    Buat Tiket Gratis
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="h-5 w-5" />
                                                    Proses Pembayaran
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}

                                {getTotalTickets() === 0 && (
                                    <div className="text-center py-8">
                                        <DollarSign className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                                        <p className="text-gray-400">Pilih tiket untuk memulai penjualan</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                }
            `}</style>
        </div>
    );
}
