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
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900">Gate & POS</h1>
                <p className="text-gray-500">
                    Kelola akses gate dan penjualan tiket on-site untuk event Anda
                </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white overflow-hidden relative">
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
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
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
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        Event Aktif
                    </h3>

                    {events.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Ticket className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Event Aktif</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Anda belum memiliki event yang dipublikasikan. Buat event terlebih dahulu untuk menggunakan fitur Gate & POS.
                            </p>
                            <button
                                onClick={() => router.push("/organizer/events/create")}
                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm inline-flex items-center gap-2"
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
                                    className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group text-left flex items-center gap-4"
                                >
                                    {event.posterImage ? (
                                        <img
                                            src={event.posterImage}
                                            alt={event.title}
                                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 shadow-sm border border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                                            <Calendar className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                Aktif
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {event.schedules[0] 
                                                ? formatDate(event.schedules[0].scheduleDate) 
                                                : "Belum dijadwalkan"}
                                        </p>
                                    </div>
                                    
                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 group-hover:bg-indigo-50 transition-colors">
                                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-indigo-600" />
                        Cara Menggunakan
                    </h3>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-fit">
                        <ol className="relative border-l border-gray-200 ml-3 space-y-6 my-2">
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-4 ring-white">
                                    <span className="text-xs font-bold text-indigo-600">1</span>
                                </span>
                                <h4 className="font-medium text-gray-900 text-sm">Pilih Event</h4>
                                <p className="text-sm text-gray-500 mt-1">Pilih event aktif dan generate PIN akses gate.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-4 ring-white">
                                    <span className="text-xs font-bold text-indigo-600">2</span>
                                </span>
                                <h4 className="font-medium text-gray-900 text-sm">Bagikan PIN</h4>
                                <p className="text-sm text-gray-500 mt-1">Berikan PIN kepada staff yang bertugas di pintu masuk.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-4 ring-white">
                                    <span className="text-xs font-bold text-indigo-600">3</span>
                                </span>
                                <h4 className="font-medium text-gray-900 text-sm">Akses Gate</h4>
                                <p className="text-sm text-gray-500 mt-1">Staff mengakses <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">/gate/access</span> dan login dengan PIN.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-4 ring-white">
                                    <span className="text-xs font-bold text-indigo-600">4</span>
                                </span>
                                <h4 className="font-medium text-gray-900 text-sm">Scan & Jual</h4>
                                <p className="text-sm text-gray-500 mt-1">Mulai scan tiket pengunjung atau jual tiket on-the-spot.</p>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
