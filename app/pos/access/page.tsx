"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingCart,
    Loader2,
    AlertCircle,
    User,
    KeyRound,
    Smartphone,
    Ticket,
    Settings,
    ExternalLink,
    HelpCircle,
} from "lucide-react";

function generateDeviceFingerprint(): string {
    const nav = window.navigator;
    const screen = window.screen;
    
    const components = [
        nav.userAgent,
        nav.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        nav.hardwareConcurrency || "unknown",
        nav.platform,
    ];
    
    const fingerprint = components.join("|");
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36) + Date.now().toString(36);
}

function formatPin(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 4) {
        return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    return digits;
}

function formatEventSlug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 100);
}

export default function POSAccessPage() {
    const router = useRouter();
    const [eventSlug, setEventSlug] = useState("");
    const [pin, setPin] = useState("");
    const [staffName, setStaffName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEventSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEventSlug(formatEventSlug(e.target.value));
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPin(e.target.value);
        setPin(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!eventSlug.trim()) {
            setError("Kode event harus diisi");
            return;
        }

        const cleanPin = pin.replace(/\D/g, "");
        if (cleanPin.length !== 8) {
            setError("PIN harus 8 digit");
            return;
        }

        if (staffName.trim().length < 2) {
            setError("Nama kasir minimal 2 karakter");
            return;
        }

        setIsLoading(true);

        try {
            const deviceFingerprint = generateDeviceFingerprint();
            
            const res = await fetch("/api/pos/access", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventSlug: eventSlug.trim(),
                    pin: cleanPin,
                    staffName: staffName.trim(),
                    deviceFingerprint,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error?.message || "Gagal mengakses POS");
                return;
            }

            localStorage.setItem("pos_device_token", data.data.deviceToken);
            localStorage.setItem("pos_staff_name", data.data.staffName);
            localStorage.setItem("pos_event_id", data.data.event.id);
            localStorage.setItem("pos_event_title", data.data.event.title);
            localStorage.setItem("pos_event_slug", data.data.event.slug);
            
            router.push("/pos");
        } catch {
            setError("Terjadi kesalahan. Coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = eventSlug.trim().length > 0 && 
                        pin.replace(/\D/g, "").length === 8 && 
                        staffName.trim().length >= 2;

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 mb-4 shadow-lg shadow-emerald-500/30">
                        <ShoppingCart className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">POS Kasir</h1>
                    <p className="text-gray-400 mt-2">
                        Masukkan kode event dan PIN untuk akses penjualan on-site
                    </p>
                </div>

                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                <Ticket className="h-4 w-4" />
                                Kode Event
                            </label>
                            <input
                                type="text"
                                value={eventSlug}
                                onChange={handleEventSlugChange}
                                placeholder="contoh: konser-musik-2025"
                                maxLength={100}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm"
                                autoComplete="off"
                                autoFocus
                            />
                            <p className="mt-1.5 text-xs text-gray-500">
                                Dapatkan kode event dari organizer
                            </p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                <KeyRound className="h-4 w-4" />
                                PIN Akses
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={pin}
                                onChange={handlePinChange}
                                placeholder="XXXX-XXXX"
                                maxLength={9}
                                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl font-mono tracking-[0.3em] placeholder:text-gray-500 placeholder:tracking-[0.2em] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                autoComplete="off"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                <User className="h-4 w-4" />
                                Nama Kasir
                            </label>
                            <input
                                type="text"
                                value={staffName}
                                onChange={(e) => setStaffName(e.target.value)}
                                placeholder="Masukkan nama Anda"
                                maxLength={100}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                autoComplete="name"
                            />
                            <p className="mt-1.5 text-xs text-gray-500">
                                Nama akan tercatat di setiap transaksi penjualan
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-700/50 rounded-lg text-sm text-gray-400">
                            <Smartphone className="h-4 w-4 flex-shrink-0" />
                            <span>Device akan terdaftar sebagai POS Kasir</span>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="h-5 w-5" />
                                    Akses POS Kasir
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <div className="bg-gray-700/50 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <HelpCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">Butuh PIN atau Kode Event?</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Hubungi organizer untuk mendapatkan kredensial akses Gate Scanner dan POS Kasir.
                                    </p>
                                    <a
                                        href="/organizer/gate"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-3 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Pengaturan Gate & POS
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Gelaran - POS System
                </p>
            </div>
        </div>
    );
}
