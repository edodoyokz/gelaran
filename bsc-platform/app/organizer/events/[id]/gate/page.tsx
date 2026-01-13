"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
    ArrowLeft, QrCode, Users, ShieldCheck, Copy, Eye, EyeOff, 
    RefreshCw, Loader2, Smartphone, Clock, AlertTriangle, 
    CheckCircle, XCircle, DoorOpen, Settings, X, ExternalLink, Ticket
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

interface GateSession {
    id: string;
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
    gateSession: GateSession | null;
    stats: Stats;
}

export default function GateManagementPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PageData | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [deviceLimit, setDeviceLimit] = useState(5);
    const [generatedPin, setGeneratedPin] = useState<string | null>(null);
    const [eventSlug, setEventSlug] = useState<string | null>(null);
    const [showPin, setShowPin] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);
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
                    setDeviceLimit(json.data.gateSession.deviceLimit);
                }
            } else {
                setError(json.error || "Gagal memuat data gate");
            }
        } catch (err) {
            setError("Terjadi kesalahan jaringan");
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchGateData();
    }, [fetchGateData]);

    const handleGeneratePin = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch(`/api/organizer/events/${eventId}/gate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceLimit })
            });
            const json = await res.json();

            if (json.success) {
                setGeneratedPin(json.data.pin);
                setEventSlug(json.data.eventSlug);
                setShowPin(true);
                setShowStaffModal(true);
                showToast("PIN berhasil dibuat", "success");
                fetchGateData();
            } else {
                showToast(json.error?.message || "Gagal membuat PIN", "error");
            }
        } catch (err) {
            showToast("Terjadi kesalahan jaringan", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRevoke = async () => {
        if (!confirm("Apakah Anda yakin ingin mencabut semua akses? Semua staff akan logout otomatis.")) return;
        
        setIsRevoking(true);
        try {
            const res = await fetch(`/api/organizer/events/${eventId}/gate`, {
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
        } catch (err) {
            showToast("Terjadi kesalahan jaringan", "error");
        } finally {
            setIsRevoking(false);
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

    const copyAllCredentials = () => {
        if (generatedPin && eventSlug) {
            const gateUrl = `${window.location.origin}/gate/access`;
            const text = `🎫 Akses Gate & POS\n\nEvent: ${event.title}\nKode Event: ${eventSlug}\nPIN: ${generatedPin}\n\nURL Akses: ${gateUrl}`;
            navigator.clipboard.writeText(text);
            showToast("Semua kredensial disalin", "success");
        }
    };

    const formatPin = (pin: string) => {
        return `${pin.slice(0, 4)}-${pin.slice(4)}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Terjadi Kesalahan</h2>
                <p className="text-gray-600 mt-2">{error || "Data tidak ditemukan"}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    const { event, gateSession, stats } = data;
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 px-4 py-4 md:px-8">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={`/organizer/events/${eventId}`}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Manajemen Gate & POS</h1>
                            <p className="text-sm text-gray-500">Kelola akses masuk dan penjualan on-site</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 py-8 md:px-8 space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-6">
                    <div className="w-24 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {event.posterImage ? (
                            <img src={event.posterImage} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <QrCode className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h2>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                {event.schedules[0] ? formatDate(event.schedules[0].scheduleDate) : 'Jadwal belum ditentukan'}
                            </p>
                            <p className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                {gateSession?.isActive ? "Sistem Gate Aktif" : "Sistem Gate Non-aktif"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">Total Tiket</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalSold}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium">Check-in</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-emerald-600">{stats.checkedIn}</p>
                            <span className="text-sm text-emerald-600/80 mb-1">({stats.checkInPercentage}%)</span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <DoorOpen className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">Belum Masuk</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{stats.remaining}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Smartphone className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">Sales On-site</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{stats.onSiteSales}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-gray-500" />
                                    Konfigurasi Akses Staff
                                </h3>
                                {gateSession?.isActive && (
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">PIN Akses</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-lg text-center tracking-widest relative">
                                            {generatedPin ? (
                                                showPin ? formatPin(generatedPin) : "••••-••••"
                                            ) : gateSession?.isActive ? (
                                                <span className="text-gray-500 text-sm tracking-normal">PIN sudah dibuat (tersembunyi)</span>
                                            ) : (
                                                <span className="text-gray-400 text-sm tracking-normal">Belum ada PIN yang dibuat</span>
                                            )}
                                        </div>
                                        {generatedPin && (
                                            <>
                                                <button 
                                                    onClick={() => setShowPin(!showPin)}
                                                    className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 transition-colors"
                                                >
                                                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                                <button 
                                                    onClick={copyPin}
                                                    className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 transition-colors"
                                                >
                                                    <Copy className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => setShowStaffModal(true)}
                                                    className="p-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 bg-indigo-50 transition-colors"
                                                    title="Lihat semua kredensial"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {generatedPin 
                                            ? "PIN baru saja dibuat. Pastikan dicatat karena tidak akan tampil lagi setelah refresh." 
                                            : gateSession?.isActive 
                                                ? "PIN sudah pernah dibuat. Klik 'Regenerate PIN' untuk membuat PIN baru (PIN lama akan tidak berlaku)."
                                                : "PIN ini digunakan staff untuk login ke halaman Gate / POS."}
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Batas Perangkat</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="50"
                                            value={deviceLimit}
                                            onChange={(e) => setDeviceLimit(parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={handleGeneratePin}
                                            disabled={isGenerating}
                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                            {gateSession ? "Regenerate PIN" : "Generate PIN Baru"}
                                        </button>
                                    </div>
                                </div>

                                {gateSession?.isActive && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <button
                                            onClick={handleRevoke}
                                            disabled={isRevoking}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2 transition-colors"
                                        >
                                            {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Cabut Semua Akses (Log out semua staff)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-900 text-sm">Perangkat Aktif</h3>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                                {gateSession?.activeDevices && gateSession.activeDevices.length > 0 ? (
                                    <div className="space-y-4">
                                        {gateSession.activeDevices.map((device) => (
                                            <div key={device.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                    <Smartphone className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{device.staffName}</p>
                                                    <p className="text-xs text-gray-500 truncate">{device.userAgent}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        Aktif: {new Date(device.lastActiveAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Belum ada perangkat aktif</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-20">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900">Mode Gate Organizer</p>
                        <p className="text-xs text-gray-500">Buka gate tanpa login PIN (hanya untuk organizer)</p>
                    </div>
                    <Link
                        href={`/gate?direct=true&eventId=${eventId}`}
                        className="flex-1 md:flex-none md:w-auto px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        <DoorOpen className="w-5 h-5" />
                        Buka Mode Gate Sekarang
                    </Link>
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

            {showStaffModal && generatedPin && eventSlug && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Ticket className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Kredensial Staff</h3>
                                        <p className="text-indigo-200 text-sm">Bagikan ke tim gate & POS</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowStaffModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-indigo-100 truncate">{event.title}</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Event</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-gray-900">
                                        {eventSlug}
                                    </div>
                                    <button 
                                        onClick={copyEventSlug}
                                        className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 transition-colors"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">PIN Akses</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-2xl text-center tracking-[0.3em] text-gray-900">
                                        {showPin ? formatPin(generatedPin) : "••••-••••"}
                                    </div>
                                    <button 
                                        onClick={() => setShowPin(!showPin)}
                                        className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 transition-colors"
                                    >
                                        {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    <button 
                                        onClick={copyPin}
                                        className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 transition-colors"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">URL Akses</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 truncate">
                                        {typeof window !== 'undefined' ? `${window.location.origin}/gate/access` : '/gate/access'}
                                    </div>
                                    <a 
                                        href="/gate/access"
                                        target="_blank"
                                        className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <button
                                    onClick={copyAllCredentials}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Copy className="w-4 h-4" />
                                    Salin Semua Kredensial
                                </button>
                                <p className="text-xs text-center text-gray-500">
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
