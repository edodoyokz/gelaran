"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    KeyRound,
    Loader2,
    ShieldCheck,
    Smartphone,
    Ticket,
    User,
} from "lucide-react";
import { AccessCredentialHelp } from "@/components/operations/AccessCredentialHelp";

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
        hash = (hash << 5) - hash + char;
        hash &= hash;
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

export default function GateAccessPage() {
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
        setPin(formatPin(e.target.value));
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
            setError("Nama staff minimal 2 karakter");
            return;
        }

        setIsLoading(true);

        try {
            const deviceFingerprint = generateDeviceFingerprint();

            const res = await fetch("/api/gate/access", {
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
                setError(data.error?.message || "Gagal mengakses gate");
                return;
            }

            localStorage.setItem("gate_device_token", data.data.deviceToken);
            localStorage.setItem("gate_staff_name", data.data.staffName);
            localStorage.setItem("gate_event_id", data.data.event.id);
            localStorage.setItem("gate_event_title", data.data.event.title);
            localStorage.setItem("gate_event_slug", data.data.event.slug);

            router.push("/gate");
        } catch {
            setError("Terjadi kesalahan. Coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid =
        eventSlug.trim().length > 0 &&
        pin.replace(/\D/g, "").length === 8 &&
        staffName.trim().length >= 2;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_28%),#07111f] px-4 py-10 text-white">
            <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
                <section className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur sm:p-8 lg:p-10">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
                        <ShieldCheck className="h-7 w-7 text-white" />
                    </div>
                    <div className="mt-6 space-y-4">
                        <span className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200">
                            Gate operations
                        </span>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                Access the live gate scanner with a controlled staff session
                            </h1>
                            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                Use the event slug and access PIN generated by the organizer workspace. Each login registers this device for check-in operations so the team can track who is handling entry.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        {[
                            {
                                label: "Credential type",
                                value: "Event slug + PIN",
                                description: "Shared from organizer gate operations.",
                            },
                            {
                                label: "Device status",
                                value: "Tracked",
                                description: "This browser becomes an active scanner session.",
                            },
                            {
                                label: "Best use",
                                value: "Check-in",
                                description: "Optimized for day-of-event attendee entry.",
                            },
                        ].map((item) => (
                            <article
                                key={item.label}
                                className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 shadow-lg shadow-black/10"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    {item.label}
                                </p>
                                <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="rounded-4xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-white">Gate Scanner login</h2>
                        <p className="text-sm leading-6 text-slate-400">
                            Enter the credentials provided for this event and identify the staff member using this device.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                                <Ticket className="h-4 w-4 text-indigo-300" />
                                Kode Event
                            </label>
                            <input
                                type="text"
                                value={eventSlug}
                                onChange={handleEventSlugChange}
                                placeholder="contoh: konser-musik-2025"
                                maxLength={100}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-white placeholder:text-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                autoComplete="off"
                                autoFocus
                            />
                            <p className="mt-1.5 text-xs text-slate-500">Dapatkan kode event langsung dari organizer.</p>
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                                <KeyRound className="h-4 w-4 text-indigo-300" />
                                PIN Akses
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={pin}
                                onChange={handlePinChange}
                                placeholder="XXXX-XXXX"
                                maxLength={9}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-mono tracking-[0.3em] text-white placeholder:text-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                autoComplete="off"
                            />
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                                <User className="h-4 w-4 text-indigo-300" />
                                Nama Staff
                            </label>
                            <input
                                type="text"
                                value={staffName}
                                onChange={(e) => setStaffName(e.target.value)}
                                placeholder="Masukkan nama Anda"
                                maxLength={100}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                autoComplete="name"
                            />
                            <p className="mt-1.5 text-xs text-slate-500">Nama ini disimpan untuk aktivitas check-in pada perangkat ini.</p>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                            <Smartphone className="h-4 w-4 shrink-0 text-indigo-300" />
                            <span>Perangkat ini akan didaftarkan sebagai scanner aktif untuk sesi gate.</span>
                        </div>

                        {error ? (
                            <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-5 w-5" />
                                    Akses Gate
                                </>
                            )}
                        </button>
                    </form>

                    <AccessCredentialHelp
                        accent="indigo"
                        description="Minta organizer membuka Gate & POS management pada event terkait untuk membuat atau membagikan ulang kredensial staff."
                    />
                </section>
            </div>
        </div>
    );
}
