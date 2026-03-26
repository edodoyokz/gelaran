"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ScanLine,
    Calendar,
    ChevronRight,
    Loader2,
    AlertCircle,
    Ticket,
    QrCode,
} from "lucide-react";

interface OrganizerEvent {
    id: string;
    title: string;
    posterImage: string | null;
    status: string;
    schedules: Array<{ scheduleDate: string }>;
}

export default function OrganizerGatePage() {
    const router = useRouter();
    const [events, setEvents] = useState<OrganizerEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await fetch("/api/organizer/events?status=PUBLISHED");
                const data = await res.json();
                
                if (data.success) {
                    setEvents(data.data || []);
                }
            } catch {
                console.error("Failed to fetch events");
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchEvents();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gate & POS</h1>
                <p className="text-[var(--text-muted)]">
                    Kelola akses gate dan penjualan tiket on-site untuk event Anda
                </p>
            </div>

            <div className="bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white overflow-hidden relative">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <QrCode className="h-6 w-6 text-indigo-200" />
                            Fitur Gate & Point of Sale
                        </h2>
                        <p className="text-indigo-100 max-w-xl">
                            Gunakan fitur ini untuk memindai tiket pengunjung saat check-in atau menjual tiket secara langsung di lokasi (On-The-Spot).
                        </p>
                    </div>
                    <div className="bg-[var(--surface)]/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/50 rounded-lg">
                                <ScanLine className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-white">Scanner Cepat</p>
                                <p className="text-indigo-200">QR Code & Barcode</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-400/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[var(--accent-primary)]" />
                        Event Aktif
                    </h3>

                    {events.length === 0 ? (
                        <div className="bg-[var(--surface)] rounded-xl p-12 text-center border border-[var(--border)] shadow-sm">
                            <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Ticket className="h-8 w-8 text-[var(--text-muted)]" />
                            </div>
                            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Belum Ada Event Aktif</h3>
                            <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
                                Anda belum memiliki event yang dipublikasikan. Buat event terlebih dahulu untuk menggunakan fitur Gate & POS.
                            </p>
                            <button
                                onClick={() => router.push("/organizer/events/create")}
                                className="px-5 py-2.5 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-colors shadow-sm inline-flex items-center gap-2"
                            >
                                Buat Event Baru
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map((event) => (
                                <button
                                    key={event.id}
                                    type="button"
                                    onClick={() => router.push(`/organizer/events/${event.id}/gate`)}
                                    className="w-full bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] shadow-sm hover:shadow-md transition-all group text-left flex items-center gap-4"
                                >
                                    {event.posterImage ? (
                                        <img
                                            src={event.posterImage}
                                            alt={event.title}
                                            className="w-16 h-16 rounded-lg object-cover shrink-0 shadow-sm border border-[var(--border)]"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center shrink-0 border border-[var(--border)]">
                                            <Calendar className="h-6 w-6 text-[var(--text-muted)]" />
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-[var(--text-primary)] truncate">{event.title}</h3>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-700 border border-green-200">
                                                Aktif
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {event.schedules[0] 
                                                ? formatDate(event.schedules[0].scheduleDate) 
                                                : "Belum dijadwalkan"}
                                        </p>
                                    </div>
                                    
                                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface-hover)] group-hover:bg-[var(--accent-primary)]/10 transition-colors">
                                        <ChevronRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-[var(--accent-primary)]" />
                        Cara Menggunakan
                    </h3>
                    
                    <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] shadow-sm h-fit">
                        <ol className="relative border-l border-[var(--border)] ml-3 space-y-6 my-2">
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-4 ring-white">
                                    <span className="text-xs font-bold text-[var(--accent-primary)]">1</span>
                                </span>
                                <h4 className="font-medium text-[var(--text-primary)] text-sm">Pilih Event</h4>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Pilih event aktif dan generate PIN akses gate.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-4 ring-white">
                                    <span className="text-xs font-bold text-[var(--accent-primary)]">2</span>
                                </span>
                                <h4 className="font-medium text-[var(--text-primary)] text-sm">Bagikan PIN</h4>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Berikan PIN kepada staff yang bertugas di pintu masuk.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-4 ring-white">
                                    <span className="text-xs font-bold text-[var(--accent-primary)]">3</span>
                                </span>
                                <h4 className="font-medium text-[var(--text-primary)] text-sm">Akses Gate</h4>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Staff mengakses <span className="font-mono bg-[var(--bg-secondary)] px-1 py-0.5 rounded text-xs">/gate/access</span> dan login dengan PIN.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-4 ring-white">
                                    <span className="text-xs font-bold text-[var(--accent-primary)]">4</span>
                                </span>
                                <h4 className="font-medium text-[var(--text-primary)] text-sm">Scan & Jual</h4>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Mulai scan tiket pengunjung atau jual tiket on-the-spot.</p>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
