"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
    ArrowLeft, QrCode, Users, Copy, Eye, EyeOff, 
    RefreshCw, Loader2, Smartphone, Clock, AlertTriangle, 
    CheckCircle, XCircle, DoorOpen, X, ExternalLink, ShoppingCart, Camera,
} from "lucide-react";

interface EventData {
    id: string;
    title: string;
    posterImage: string | null;
    schedules: Array<{ scheduleDate: string; startTime: string }>;
    ticketTypes: Array<{ id: string; name: string; basePrice: number; availableQuantity: number }>;
}

interface ActiveDevice {
    id: string;
    staffName: string;
    lastActiveAt: string;
    userAgent: string;
}

interface DeviceSession {
    id: string;
    sessionType: "GATE" | "POS";
    deviceLimit: number;
    isActive: boolean;
    activeDevices: ActiveDevice[];
    createdAt: string;
}

interface Stats {
    totalSold: number;
    checkedIn: number;
    remaining: number;
    onSiteSales: number;
    checkInPercentage: number;
}

interface PageData {
    event: EventData;
    gateSession: DeviceSession | null;
    posSession: DeviceSession | null;
    stats: Stats;
}

export default function GateManagementPage() {
    const params = useParams();
    const eventId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PageData | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [gateDeviceLimit, setGateDeviceLimit] = useState(3);
    const [posDeviceLimit, setPosDeviceLimit] = useState(2);
    const [generatedPin, setGeneratedPin] = useState<string | null>(null);
    const [generatedSessionType, setGeneratedSessionType] = useState<"GATE" | "POS" | null>(null);
    const [eventSlug, setEventSlug] = useState<string | null>(null);
    const [showPin, setShowPin] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRevoking, setIsRevoking] = useState<"GATE" | "POS" | null>(null);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchGateData = useCallback(async () => {
        try {
            const res = await fetch(`/api/organizer/events/${eventId}/gate`);
            const json = await res.json();
            
            if (json.success) {
                setData(json.data);
                if (json.data.gateSession) {
                    setGateDeviceLimit(json.data.gateSession.deviceLimit);
                }
                if (json.data.posSession) {
                    setPosDeviceLimit(json.data.posSession.deviceLimit);
                }
            } else {
                setError(json.error || "Gagal memuat data");
            }
        } catch {
            setError("Terjadi kesalahan jaringan");
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchGateData();
    }, [fetchGateData]);

    const handleGeneratePin = async (sessionType: "GATE" | "POS") => {
        setIsGenerating(true);
        try {
            const limit = sessionType === "GATE" ? gateDeviceLimit : posDeviceLimit;
            const res = await fetch(`/api/organizer/events/${eventId}/gate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionType, deviceLimit: limit })
            });
            const json = await res.json();

            if (json.success) {
                setGeneratedPin(json.data.pin);
                setGeneratedSessionType(sessionType);
                setEventSlug(json.data.eventSlug);
                setShowPin(true);
                setShowStaffModal(true);
                showToast(`PIN ${sessionType === "GATE" ? "Gate Scanner" : "POS Kasir"} berhasil dibuat`, "success");
                fetchGateData();
            } else {
                showToast(json.error?.message || "Gagal membuat PIN", "error");
            }
        } catch {
            showToast("Terjadi kesalahan jaringan", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRevoke = async (sessionType: "GATE" | "POS") => {
        if (!confirm(`Apakah Anda yakin ingin mencabut akses ${sessionType === "GATE" ? "Gate Scanner" : "POS Kasir"}? Semua staff akan logout.`)) return;
        
        setIsRevoking(sessionType);
        try {
            const res = await fetch(`/api/organizer/events/${eventId}/gate?sessionType=${sessionType}`, {
                method: 'DELETE'
            });
            const json = await res.json();

            if (json.success) {
                setGeneratedPin(null);
                showToast("Akses berhasil dicabut", "success");
                fetchGateData();
            } else {
                showToast(json.error || "Gagal mencabut akses", "error");
            }
        } catch {
            showToast("Terjadi kesalahan jaringan", "error");
        } finally {
            setIsRevoking(null);
        }
    };

    const copyPin = () => {
        if (generatedPin) {
            navigator.clipboard.writeText(generatedPin);
            showToast("PIN disalin ke clipboard", "success");
        }
    };

    const copyEventSlug = () => {
        if (eventSlug) {
            navigator.clipboard.writeText(eventSlug);
            showToast("Kode event disalin ke clipboard", "success");
        }
    };

    const copyCredentials = (type: "GATE" | "POS") => {
        if (!eventSlug || !generatedPin || !data) return;
        
        const url = type === "GATE" ? `/gate/access` : `/pos/access`;
        const icon = type === "GATE" ? "📷" : "🛒";
        const name = type === "GATE" ? "Gate Scanner" : "POS Kasir";
        const text = `🎫 Akses Staff - ${name}\n\nEvent: ${data.event.title}\nKode Event: ${eventSlug}\nPIN: ${generatedPin}\n\n${icon} ${name}: ${window.location.origin}${url}`;
        
        navigator.clipboard.writeText(text);
        showToast("Kredensial disalin", "success");
    };

    const formatPin = (pin: string) => {
        return `${pin.slice(0, 4)}-${pin.slice(4)}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Terjadi Kesalahan</h2>
                <p className="text-[var(--text-secondary)] mt-2">{error || "Data tidak ditemukan"}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    const { event, gateSession, posSession, stats } = data;
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-[var(--surface-hover)]/50 pb-24">
            <div className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-10 px-4 py-4 md:px-8">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={`/organizer/events/${eventId}`}
                            className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors text-[var(--text-secondary)]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">Manajemen Gate & POS</h1>
                            <p className="text-sm text-[var(--text-muted)]">Kelola akses masuk dan penjualan on-site</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 py-8 md:px-8 space-y-8">
                <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-6 flex items-start gap-6">
                    <div className="w-24 h-32 bg-[var(--bg-secondary)] rounded-lg shrink-0 overflow-hidden">
                        {event.posterImage ? (
                            <img src={event.posterImage} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                <QrCode className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">{event.title}</h2>
                        <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                            <p className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                {event.schedules[0] ? formatDate(event.schedules[0].scheduleDate) : 'Jadwal belum ditentukan'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]">
                        <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">Total Tiket</span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalSold}</p>
                    </div>
                    <div className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]">
                        <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium">Check-in</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-emerald-600">{stats.checkedIn}</p>
                            <span className="text-sm text-emerald-600/80 mb-1">({stats.checkInPercentage}%)</span>
                        </div>
                    </div>
                    <div className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]">
                        <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
                            <DoorOpen className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">Belum Masuk</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{stats.remaining}</p>
                    </div>
                    <div className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]">
                        <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
                            <Smartphone className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">Sales On-site</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{stats.onSiteSales}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Gate Scanner Session */}
                    <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                        <div className="p-4 border-b border-indigo-100 bg-[var(--accent-primary)]/10/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-[var(--accent-primary)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">Gate Scanner</h3>
                                    <p className="text-xs text-[var(--text-muted)]">Akses untuk check-in peserta</p>
                                </div>
                            </div>
                            {gateSession?.isActive && (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                    Aktif
                                </span>
                            )}
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">Batas Perangkat</label>
                                    <span className="text-sm text-[var(--text-muted)]">
                                        {gateSession?.activeDevices.length || 0}/{gateDeviceLimit}
                                    </span>
                                </div>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="20"
                                    value={gateDeviceLimit}
                                    onChange={(e) => setGateDeviceLimit(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] outline-none transition-all"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => handleGeneratePin("GATE")}
                                disabled={isGenerating}
                                className="w-full py-2.5 bg-[var(--accent-primary)] hover:opacity-90 text-white font-medium rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                                {gateSession ? "Regenerate PIN" : "Generate PIN"}
                            </button>

                            {gateSession?.isActive && (
                                <button
                                    type="button"
                                    onClick={() => handleRevoke("GATE")}
                                    disabled={isRevoking === "GATE"}
                                    className="w-full text-red-600 hover:text-red-700 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    {isRevoking === "GATE" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Cabut Akses
                                </button>
                            )}

                            {gateSession?.activeDevices && gateSession.activeDevices.length > 0 && (
                                <div className="pt-4 border-t border-[var(--border)]">
                                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Perangkat Aktif</p>
                                    <div className="space-y-2">
                                        {gateSession.activeDevices.map((device) => (
                                            <div key={device.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--accent-primary)]/10">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <Smartphone className="w-4 h-4 text-[var(--accent-primary)]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{device.staffName}</p>
                                                    <p className="text-xs text-[var(--text-muted)] truncate">{device.userAgent}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* POS Kasir Session */}
                    <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                        <div className="p-4 border-b border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">POS Kasir</h3>
                                    <p className="text-xs text-[var(--text-muted)]">Akses untuk penjualan on-site</p>
                                </div>
                            </div>
                            {posSession?.isActive && (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                    Aktif
                                </span>
                            )}
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">Batas Perangkat</label>
                                    <span className="text-sm text-[var(--text-muted)]">
                                        {posSession?.activeDevices.length || 0}/{posDeviceLimit}
                                    </span>
                                </div>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="20"
                                    value={posDeviceLimit}
                                    onChange={(e) => setPosDeviceLimit(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => handleGeneratePin("POS")}
                                disabled={isGenerating}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                                {posSession ? "Regenerate PIN" : "Generate PIN"}
                            </button>

                            {posSession?.isActive && (
                                <button
                                    type="button"
                                    onClick={() => handleRevoke("POS")}
                                    disabled={isRevoking === "POS"}
                                    className="w-full text-red-600 hover:text-red-700 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    {isRevoking === "POS" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Cabut Akses
                                </button>
                            )}

                            {posSession?.activeDevices && posSession.activeDevices.length > 0 && (
                                <div className="pt-4 border-t border-[var(--border)]">
                                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Perangkat Aktif</p>
                                    <div className="space-y-2">
                                        {posSession.activeDevices.map((device) => (
                                            <div key={device.id} className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50">
                                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <Smartphone className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{device.staffName}</p>
                                                    <p className="text-xs text-[var(--text-muted)] truncate">{device.userAgent}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--surface)] border-t border-[var(--border)] z-20">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-[var(--text-primary)]">Mode Organizer</p>
                        <p className="text-xs text-[var(--text-muted)]">Buka Gate/POS tanpa login PIN</p>
                    </div>
                    <div className="flex-1 md:flex-none flex gap-3">
                        <Link
                            href={`/gate?direct=true&eventId=${eventId}`}
                            className="flex-1 md:flex-none md:w-auto px-5 py-3 bg-[var(--accent-primary)] hover:opacity-90 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            <Camera className="w-5 h-5" />
                            <span className="hidden sm:inline">Gate Scanner</span>
                        </Link>
                        <Link
                            href={`/pos?direct=true&eventId=${eventId}`}
                            className="flex-1 md:flex-none md:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="hidden sm:inline">POS Kasir</span>
                        </Link>
                    </div>
                </div>
            </div>

            {toast && (
                <div className={`fixed bottom-24 right-4 md:right-8 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-in slide-in-from-bottom-5 fade-in z-50 flex items-center gap-2 ${
                    toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            {showStaffModal && generatedPin && eventSlug && generatedSessionType && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className={`p-6 text-white ${generatedSessionType === "GATE" ? "bg-linear-to-br from-indigo-600 to-purple-600" : "bg-linear-to-br from-emerald-600 to-teal-600"}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[var(--surface)]/20 rounded-xl flex items-center justify-center">
                                        {generatedSessionType === "GATE" ? <Camera className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Kredensial {generatedSessionType === "GATE" ? "Gate Scanner" : "POS Kasir"}</h3>
                                        <p className="text-white/80 text-sm">Bagikan ke staff yang bertugas</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowStaffModal(false)}
                                    className="p-2 hover:bg-[var(--surface)]/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-white/90 truncate">{event.title}</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Kode Event</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg px-4 py-3 font-mono text-[var(--text-primary)]">
                                        {eventSlug}
                                    </div>
                                    <button onClick={copyEventSlug} className="p-3 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg border border-[var(--border)] transition-colors">
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">PIN Akses</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg px-4 py-3 font-mono text-2xl text-center tracking-[0.3em] text-[var(--text-primary)]">
                                        {showPin ? formatPin(generatedPin) : "••••-••••"}
                                    </div>
                                    <button onClick={() => setShowPin(!showPin)} className="p-3 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg border border-[var(--border)] transition-colors">
                                        {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    <button onClick={copyPin} className="p-3 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg border border-[var(--border)] transition-colors">
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">URL Akses</label>
                                <div className="flex items-center gap-2">
                                    <div className={`flex-1 border rounded-lg px-4 py-3 text-sm truncate flex items-center gap-2 ${generatedSessionType === "GATE" ? "bg-[var(--accent-primary)]/10 border-indigo-200 text-[var(--accent-primary)]" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                                        {generatedSessionType === "GATE" ? <Camera className="w-4 h-4 shrink-0" /> : <ShoppingCart className="w-4 h-4 shrink-0" />}
                                        {typeof window !== 'undefined' ? `${window.location.origin}/${generatedSessionType === "GATE" ? "gate" : "pos"}/access` : ''}
                                    </div>
                                    <a 
                                        href={`/${generatedSessionType === "GATE" ? "gate" : "pos"}/access`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-3 rounded-lg border transition-colors ${generatedSessionType === "GATE" ? "text-indigo-500 hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 border-indigo-200" : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 border-emerald-200"}`}
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--border)] space-y-3">
                                <button
                                    onClick={() => copyCredentials(generatedSessionType)}
                                    className={`w-full py-3 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${generatedSessionType === "GATE" ? "bg-[var(--accent-primary)] hover:opacity-90" : "bg-emerald-600 hover:bg-emerald-700"}`}
                                >
                                    <Copy className="w-4 h-4" />
                                    Salin Kredensial
                                </button>
                                <p className="text-xs text-center text-[var(--text-muted)]">
                                    ⚠️ PIN hanya ditampilkan sekali. Pastikan sudah disalin.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
