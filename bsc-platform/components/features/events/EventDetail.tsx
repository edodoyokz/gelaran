"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Share2, Calendar, MapPin, Ticket } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TicketModal } from "./TicketModal";

interface TicketOption {
    type: string;
    price: number;
    available: number;
}

interface EventDetailProps {
    event: {
        id: string;
        title: string;
        date: string;
        time: string;
        location: string;
        price: number;
        image: string;
        category: string;
        organizer: string;
        description: string;
        tickets: TicketOption[];
    };
}

export function EventDetail({ event }: EventDetailProps) {
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Mobile Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between md:hidden">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                </Link>
                <span className="font-bold text-sm truncate max-w-[200px]">
                    {event.title}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Share2 size={20} />
                </button>
            </div>

            {/* Hero Image - Blurred Background */}
            <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden bg-gray-900">
                <img
                    src={event.image}
                    alt="bg"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

                <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
                    <div className="hidden md:block w-2/3">
                        <div className="inline-block bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                            {event.category.toUpperCase()}
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-2 leading-tight">
                            {event.title}
                        </h1>
                        <p className="text-xl text-gray-200">
                            {event.date} • {event.location}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-6 md:-mt-16 relative z-20">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
                            {/* Mobile Title */}
                            <div className="md:hidden mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {event.title}
                                </h1>
                                <div className="flex items-center text-gray-600 text-sm mb-4">
                                    <Calendar size={16} className="mr-2" />
                                    {event.date} • {event.time}
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <MapPin size={16} className="mr-2" />
                                    {event.location}
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Tentang Event
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {event.description}
                                <br />
                                <br />
                                Bergabunglah bersama ribuan penggemar lainnya dalam pengalaman
                                yang tidak akan terlupakan. Event ini diselenggarakan dengan
                                standar protokol keamanan dan kenyamanan tertinggi.
                            </p>

                            <h3 className="font-bold text-gray-900 mb-3">
                                Syarat & Ketentuan
                            </h3>
                            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mb-8">
                                <li>Tiket yang sudah dibeli tidak dapat dikembalikan (non-refundable).</li>
                                <li>Wajib membawa kartu identitas saat penukaran tiket.</li>
                                <li>Dilarang membawa senjata tajam dan obat-obatan terlarang.</li>
                            </ul>

                            {/* Organizer Info */}
                            <div className="border-t border-gray-100 pt-6 flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl mr-4">
                                    {event.organizer.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">
                                        Diselenggarakan oleh
                                    </p>
                                    <p className="font-bold text-gray-900">{event.organizer}</p>
                                </div>
                                <button className="ml-auto text-indigo-600 text-sm font-bold hover:underline">
                                    Follow
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Sidebar (Booking Card) */}
                    <div className="w-full md:w-[360px] flex-shrink-0">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-500">Harga Tiket</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {event.price === 0 ? "Gratis" : formatCurrency(event.price)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setIsTicketModalOpen(true)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 mb-4 flex items-center justify-center gap-2"
                                >
                                    <Ticket size={20} />
                                    Beli Tiket Sekarang
                                </button>

                                <div className="text-center text-xs text-gray-500">
                                    Dijamin aman oleh <span className="font-bold">BSC Guarantee</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span>Tanggal</span>
                                    <span className="font-medium">{event.date}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Waktu</span>
                                    <span className="font-medium">{event.time}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Modal */}
            <TicketModal
                isOpen={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
                event={event}
            />
        </div>
    );
}
