"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    KeyRound,
    Loader2,
    ShoppingCart,
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

    const isFormValid =
        eventSlug.trim().length > 0 &&
        pin.replace(/\D/g, "").length === 8 &&
        staffName.trim().length >= 2;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.1),transparent_28%)] bg-(--background) px-4 py-10 text-foreground">
            <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
                <section className="rounded-[calc(var(--radius-3xl)+0.5rem)] border border-(--border) bg-(--surface) p-6 shadow-(--shadow-lg) sm:p-8 lg:p-10">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-(--accent-primary) shadow-(--shadow-xs)">
                        <ShoppingCart className="h-7 w-7 text-white" />
                    </div>
                    <div className="mt-6 space-y-4">
                        <span className="inline-flex rounded-full border border-(--border) bg-(--surface-brand-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-(--accent-primary)">
                            POS operations
                        </span>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-semibold tracking-(--tracking-heading) text-foreground sm:text-4xl">
                                Access the on-site sales terminal with a staff-issued POS session
                            </h1>
                            <p className="max-w-2xl text-sm leading-7 text-(--text-secondary) sm:text-base">
                                Use organizer-issued credentials to open the cashier terminal for event-day sales. Each device is registered so the organizer can monitor active POS usage and revoke sessions when needed.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        {[
                            {
                                label: "Credential type",
                                value: "Event slug + PIN",
                                description: "Generated in Gate & POS management.",
                            },
                            {
                                label: "Device status",
                                value: "Registered",
                                description: "This browser becomes an active cashier terminal.",
                            },
                            {
                                label: "Best use",
                                value: "On-site sales",
                                description: "Supports staffed ticket sales during live events.",
                            },
                        ].map((item) => (
                            <article
                                key={item.label}
                                className="rounded-2xl border border-(--border) bg-(--surface-brand-soft) p-4"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">
                                    {item.label}
                                </p>
                                <p className="mt-3 text-lg font-semibold text-foreground">{item.value}</p>
                                <p className="mt-2 text-sm leading-6 text-(--text-secondary)">{item.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="rounded-[calc(var(--radius-3xl)+0.5rem)] border border-(--border) bg-(--surface) p-6 shadow-(--shadow-lg) sm:p-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-foreground">POS Kasir login</h2>
                        <p className="text-sm leading-6 text-(--text-secondary)">
                            Identify the event, enter the access PIN, and register the cashier using this sales device.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Ticket className="h-4 w-4 text-(--text-muted)" />
                                Kode Event
                            </label>
                            <input
                                type="text"
                                value={eventSlug}
                                onChange={handleEventSlugChange}
                                placeholder="contoh: konser-musik-2025"
                                maxLength={100}
                                className="min-h-12 w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm font-mono text-foreground placeholder:text-(--text-muted) outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                autoComplete="off"
                                autoFocus
                            />
                            <p className="mt-1.5 text-xs text-(--text-muted)">Gunakan kode event yang dibagikan organizer.</p>
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <KeyRound className="h-4 w-4 text-(--text-muted)" />
                                PIN Akses
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={pin}
                                onChange={handlePinChange}
                                placeholder="XXXX-XXXX"
                                maxLength={9}
                                className="min-h-12 w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-4 text-center text-2xl font-mono tracking-[0.3em] text-foreground placeholder:text-(--text-muted) outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                autoComplete="off"
                            />
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <User className="h-4 w-4 text-(--text-muted)" />
                                Nama Kasir
                            </label>
                            <input
                                type="text"
                                value={staffName}
                                onChange={(e) => setStaffName(e.target.value)}
                                placeholder="Masukkan nama Anda"
                                maxLength={100}
                                className="min-h-12 w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-foreground placeholder:text-(--text-muted) outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                autoComplete="name"
                            />
                            <p className="mt-1.5 text-xs text-(--text-muted)">Nama kasir ini akan muncul pada transaksi penjualan yang diproses.</p>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface-brand-soft) px-4 py-3 text-sm text-(--text-secondary)">
                            <Smartphone className="h-4 w-4 shrink-0 text-(--accent-primary)" />
                            <span>Perangkat ini akan didaftarkan sebagai terminal POS aktif untuk event.</span>
                        </div>

                        {error ? (
                            <div className="flex items-start gap-3 rounded-2xl border border-[rgba(239,68,68,0.24)] bg-(--error-bg) px-4 py-3 text-sm text-(--error)">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-(--accent-primary) px-4 py-4 text-sm font-semibold text-white transition-all hover:bg-(--accent-primary-hover) disabled:cursor-not-allowed disabled:opacity-50"
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

                    <AccessCredentialHelp
                        accent="emerald"
                        description="Organizer dapat membuat atau mengganti kredensial kasir dari Gate & POS management pada event terkait."
                    />
                </section>
            </div>
        </div>
    );
}
