"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Share2,
    Calendar,
    MapPin,
    Clock,
    Users,
    Ticket,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    Globe,
    Video,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TicketType {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    totalQuantity: number;
    availableQuantity: number;
    minPerOrder: number;
    maxPerOrder: number;
    isFree: boolean;
}

interface EventSchedule {
    id: string;
    title: string | null;
    scheduleDate: string;
    startTime: string;
    endTime: string;
}

interface EventData {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    description: string | null;
    posterImage: string | null;
    bannerImage: string | null;
    eventType: "OFFLINE" | "ONLINE" | "HYBRID";
    status: string;
    isFeatured: boolean;
    termsAndConditions: string | null;
    refundPolicy: string | null;
    viewCount: number;
    category: {
        id: string;
        name: string;
        slug: string;
        colorHex: string | null;
    } | null;
    venue: {
        id: string;
        name: string;
        address: string;
        city: string;
        province: string;
    } | null;
    organizer: {
        id: string;
        name: string;
        slug: string | null;
        logo: string | null;
        description: string | null;
        isVerified: boolean;
    };
    schedules: EventSchedule[];
    ticketTypes: TicketType[];
    faqs: Array<{
        id: string;
        question: string;
        answer: string;
    }>;
}

interface EventDetailViewProps {
    event: EventData;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatTime(timeStr: string): string {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function EventDetailView({ event }: EventDetailViewProps) {
    const router = useRouter();
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
    const [showTerms, setShowTerms] = useState(false);

    const schedule = event.schedules[0];
    const eventDate = schedule ? formatDate(schedule.scheduleDate) : "Tanggal akan diumumkan";
    const eventTime = schedule
        ? `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)} WIB`
        : "Waktu akan diumumkan";

    const location =
        event.eventType === "ONLINE"
            ? "Online Event"
            : event.venue
              ? `${event.venue.name}, ${event.venue.city}`
              : "Lokasi akan diumumkan";

    const handleQtyChange = (ticketId: string, delta: number) => {
        setQuantities((prev) => {
            const current = prev[ticketId] || 0;
            const ticket = event.ticketTypes.find((t) => t.id === ticketId);
            if (!ticket) return prev;

            const maxQty = Math.min(ticket.maxPerOrder, ticket.availableQuantity);
            const newVal = Math.max(0, Math.min(maxQty, current + delta));
            return { ...prev, [ticketId]: newVal };
        });
    };

    const total = event.ticketTypes.reduce((acc, ticket) => {
        return acc + ticket.basePrice * (quantities[ticket.id] || 0);
    }, 0);

    const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

    const handleCheckout = () => {
        if (totalTickets === 0) return;

        const ticketParams = event.ticketTypes
            .filter((t) => quantities[t.id] > 0)
            .map((t) => `${t.id}:${quantities[t.id]}`)
            .join(",");

        router.push(`/checkout?event=${event.id}&tickets=${ticketParams}`);
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: event.title,
                text: event.shortDescription || "",
                url: window.location.href,
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert("Link berhasil disalin!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link
                        href="/events"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Kembali</span>
                    </Link>
                    <h1 className="font-bold text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                        {event.title}
                    </h1>
                    <button
                        onClick={handleShare}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="relative h-[250px] sm:h-[350px] lg:h-[450px] w-full overflow-hidden bg-gray-900">
                <img
                    src={event.bannerImage || event.posterImage || "/placeholder-event.jpg"}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto">
                        {event.category && (
                            <span
                                className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
                                style={{ backgroundColor: event.category.colorHex || "#6366f1" }}
                            >
                                {event.category.name}
                            </span>
                        )}
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                            {event.title}
                        </h1>
                        <p className="text-gray-300 text-sm sm:text-base max-w-2xl">
                            {event.shortDescription}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        {/* Event Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Tanggal</p>
                                        <p className="font-semibold text-gray-900">{eventDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <Clock className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Waktu</p>
                                        <p className="font-semibold text-gray-900">{eventTime}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        {event.eventType === "ONLINE" ? (
                                            <Video className="h-5 w-5 text-indigo-600" />
                                        ) : (
                                            <MapPin className="h-5 w-5 text-indigo-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Lokasi</p>
                                        <p className="font-semibold text-gray-900">{location}</p>
                                    </div>
                                </div>
                            </div>

                            {event.eventType !== "OFFLINE" && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-6">
                                    <Globe className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm text-blue-700">
                                        Event ini dapat diakses secara online
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang Event</h2>
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-600 whitespace-pre-wrap">
                                    {event.description || event.shortDescription}
                                </p>
                            </div>
                        </div>

                        {/* Organizer */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Diselenggarakan oleh</h2>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {event.organizer.logo ? (
                                        <img
                                            src={event.organizer.logo}
                                            alt={event.organizer.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        event.organizer.name.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900">{event.organizer.name}</p>
                                        {event.organizer.isVerified && (
                                            <CheckCircle className="h-4 w-4 text-blue-500" />
                                        )}
                                    </div>
                                    {event.organizer.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {event.organizer.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FAQs */}
                        {event.faqs.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">FAQ</h2>
                                <div className="space-y-3">
                                    {event.faqs.map((faq) => (
                                        <div
                                            key={faq.id}
                                            className="border border-gray-100 rounded-lg overflow-hidden"
                                        >
                                            <button
                                                onClick={() =>
                                                    setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                                                }
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900">{faq.question}</span>
                                                {expandedFaq === faq.id ? (
                                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                            {expandedFaq === faq.id && (
                                                <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Terms & Conditions */}
                        {(event.termsAndConditions || event.refundPolicy) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <button
                                    onClick={() => setShowTerms(!showTerms)}
                                    className="w-full flex items-center justify-between"
                                >
                                    <h2 className="text-xl font-bold text-gray-900">Syarat & Ketentuan</h2>
                                    {showTerms ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                                {showTerms && (
                                    <div className="mt-4 space-y-4 text-sm text-gray-600">
                                        {event.termsAndConditions && (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Ketentuan Umum</h3>
                                                <p className="whitespace-pre-wrap">{event.termsAndConditions}</p>
                                            </div>
                                        )}
                                        {event.refundPolicy && (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Kebijakan Refund</h3>
                                                <p className="whitespace-pre-wrap">{event.refundPolicy}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Ticket Selection */}
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <div className="sticky top-20 space-y-4">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        <Ticket className="h-5 w-5 text-indigo-600" />
                                        Pilih Tiket
                                    </h3>
                                </div>

                                <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                                    {event.ticketTypes.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">
                                            Tiket belum tersedia
                                        </p>
                                    ) : (
                                        event.ticketTypes.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900">{ticket.name}</p>
                                                        {ticket.description && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {ticket.description}
                                                            </p>
                                                        )}
                                                        <p className="text-indigo-600 font-semibold mt-1">
                                                            {ticket.isFree
                                                                ? "GRATIS"
                                                                : formatCurrency(ticket.basePrice)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleQtyChange(ticket.id, -1)}
                                                            disabled={!quantities[ticket.id]}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-bold w-6 text-center">
                                                            {quantities[ticket.id] || 0}
                                                        </span>
                                                        <button
                                                            onClick={() => handleQtyChange(ticket.id, 1)}
                                                            disabled={
                                                                ticket.availableQuantity === 0 ||
                                                                (quantities[ticket.id] || 0) >= ticket.maxPerOrder
                                                            }
                                                            className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Users className="h-3 w-3" />
                                                    <span>
                                                        {ticket.availableQuantity > 0
                                                            ? `Tersisa ${ticket.availableQuantity} tiket`
                                                            : "Sold Out"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-600">Total</span>
                                        <span className="text-2xl font-bold text-indigo-600">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={totalTickets === 0}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <Ticket className="h-5 w-5" />
                                        {totalTickets === 0
                                            ? "Pilih Tiket"
                                            : `Checkout (${totalTickets} tiket)`}
                                    </button>
                                    <p className="text-center text-xs text-gray-400 mt-3">
                                        Transaksi dijamin aman oleh <strong>BSC Guarantee</strong>
                                    </p>
                                </div>
                            </div>

                            {/* View Count */}
                            <div className="text-center text-sm text-gray-400">
                                {event.viewCount.toLocaleString()} orang melihat event ini
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
