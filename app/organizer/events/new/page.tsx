"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Loader2,
    FileText,
    Calendar,
    MapPin,
    Ticket,
    Image,
    Settings,
    Plus,
    Trash2,
    Globe,
    Video,
    Lock,
} from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface ScheduleItem {
    id: string;
    title: string;
    scheduleDate: string;
    startTime: string;
    endTime: string;
}

interface TicketItem {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    totalQuantity: number;
    isFree: boolean;
}

type EventType = "OFFLINE" | "ONLINE" | "HYBRID";
type Visibility = "PUBLIC" | "PRIVATE" | "PASSWORD_PROTECTED";

const STEPS = [
    { id: 1, title: "Info Dasar", icon: FileText },
    { id: 2, title: "Jadwal", icon: Calendar },
    { id: 3, title: "Lokasi", icon: MapPin },
    { id: 4, title: "Tiket", icon: Ticket },
    { id: 5, title: "Media", icon: Image },
    { id: 6, title: "Pengaturan", icon: Settings },
];

function generateId(): string {
    return Math.random().toString(36).substring(7);
}

export default function CreateEventPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [title, setTitle] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [eventType, setEventType] = useState<EventType>("OFFLINE");

    const [schedules, setSchedules] = useState<ScheduleItem[]>([
        { id: generateId(), title: "", scheduleDate: "", startTime: "09:00", endTime: "17:00" },
    ]);

    const [venueOption, setVenueOption] = useState<"new" | "online">("new");
    const [venueName, setVenueName] = useState("");
    const [venueAddress, setVenueAddress] = useState("");
    const [venueCity, setVenueCity] = useState("");
    const [venueProvince, setVenueProvince] = useState("");
    const [onlineMeetingUrl, setOnlineMeetingUrl] = useState("");

    const [ticketTypes, setTicketTypes] = useState<TicketItem[]>([
        { id: generateId(), name: "Regular", description: "", basePrice: 0, totalQuantity: 100, isFree: false },
    ]);

    const [posterImage, setPosterImage] = useState("");
    const [bannerImage, setBannerImage] = useState("");

    const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
    const [accessPassword, setAccessPassword] = useState("");
    const [termsAndConditions, setTermsAndConditions] = useState("");

    useEffect(() => {
        fetch("/api/categories")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setCategories(data.data);
                }
            })
            .catch(console.error);
    }, []);

    const addSchedule = () => {
        setSchedules([
            ...schedules,
            { id: generateId(), title: "", scheduleDate: "", startTime: "09:00", endTime: "17:00" },
        ]);
    };

    const removeSchedule = (id: string) => {
        if (schedules.length > 1) {
            setSchedules(schedules.filter((s) => s.id !== id));
        }
    };

    const updateSchedule = (id: string, field: keyof ScheduleItem, value: string) => {
        setSchedules(schedules.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const addTicket = () => {
        setTicketTypes([
            ...ticketTypes,
            { id: generateId(), name: "", description: "", basePrice: 0, totalQuantity: 100, isFree: false },
        ]);
    };

    const removeTicket = (id: string) => {
        if (ticketTypes.length > 1) {
            setTicketTypes(ticketTypes.filter((t) => t.id !== id));
        }
    };

    const updateTicket = (id: string, field: keyof TicketItem, value: string | number | boolean) => {
        setTicketTypes(ticketTypes.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
    };

    const validateStep = (step: number): boolean => {
        setError(null);
        switch (step) {
            case 1:
                if (!title.trim()) { setError("Judul event wajib diisi"); return false; }
                if (title.length < 5) { setError("Judul minimal 5 karakter"); return false; }
                if (!description.trim()) { setError("Deskripsi wajib diisi"); return false; }
                if (description.length < 20) { setError("Deskripsi minimal 20 karakter"); return false; }
                if (!categoryId) { setError("Pilih kategori"); return false; }
                return true;
            case 2:
                for (const s of schedules) {
                    if (!s.scheduleDate) { setError("Tanggal jadwal wajib diisi"); return false; }
                    if (!s.startTime || !s.endTime) { setError("Waktu mulai dan selesai wajib diisi"); return false; }
                }
                return true;
            case 3:
                if (eventType !== "ONLINE" && venueOption === "new") {
                    if (!venueName.trim()) { setError("Nama venue wajib diisi"); return false; }
                    if (!venueCity.trim()) { setError("Kota wajib diisi"); return false; }
                }
                if (eventType !== "OFFLINE" && !onlineMeetingUrl.trim()) {
                    setError("URL meeting online wajib diisi untuk event online/hybrid");
                    return false;
                }
                return true;
            case 4:
                for (const t of ticketTypes) {
                    if (!t.name.trim()) { setError("Nama tiket wajib diisi"); return false; }
                    if (t.totalQuantity < 1) { setError("Kuota tiket minimal 1"); return false; }
                }
                return true;
            case 5:
                return true;
            case 6:
                if (visibility === "PASSWORD_PROTECTED" && !accessPassword.trim()) {
                    setError("Password akses wajib diisi");
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep) && currentStep < 6) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setIsSubmitting(true);
        setError(null);

        const payload = {
            title,
            shortDescription: shortDescription || undefined,
            description,
            categoryId,
            eventType,
            venueName: eventType !== "ONLINE" ? venueName : undefined,
            venueAddress: eventType !== "ONLINE" ? venueAddress : undefined,
            venueCity: eventType !== "ONLINE" ? venueCity : undefined,
            venueProvince: eventType !== "ONLINE" ? venueProvince : undefined,
            onlineMeetingUrl: eventType !== "OFFLINE" ? onlineMeetingUrl : undefined,
            posterImage: posterImage || undefined,
            bannerImage: bannerImage || undefined,
            visibility,
            accessPassword: visibility === "PASSWORD_PROTECTED" ? accessPassword : undefined,
            termsAndConditions: termsAndConditions || undefined,
            schedules: schedules.map((s) => ({
                title: s.title || undefined,
                scheduleDate: s.scheduleDate,
                startTime: s.startTime,
                endTime: s.endTime,
            })),
            ticketTypes: ticketTypes.map((t) => ({
                name: t.name,
                description: t.description || undefined,
                basePrice: t.isFree ? 0 : t.basePrice,
                totalQuantity: t.totalQuantity,
                isFree: t.isFree,
            })),
        };

        try {
            const res = await fetch("/api/organizer/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error?.message || "Gagal membuat event");
                setIsSubmitting(false);
                return;
            }

            router.push("/organizer/events");
        } catch {
            setError("Terjadi kesalahan. Coba lagi.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="bg-[var(--surface)] border-b sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/organizer/events" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Buat Event Baru</h1>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                            currentStep > step.id
                                                ? "bg-green-500 text-white"
                                                : currentStep === step.id
                                                ? "bg-[var(--accent-primary)] text-white shadow-lg shadow-indigo-200"
                                                : "bg-[var(--border)] text-[var(--text-muted)]"
                                        }`}
                                    >
                                        {currentStep > step.id ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <step.icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs mt-2 font-medium hidden sm:block ${
                                            currentStep >= step.id ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                                        }`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={`w-8 sm:w-16 h-1 mx-2 rounded ${
                                            currentStep > step.id ? "bg-green-500" : "bg-[var(--border)]"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[var(--surface)] rounded-2xl shadow-xl p-6 sm:p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-200 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Informasi Dasar</h2>

                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Judul Event *
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                                    placeholder="Contoh: Tech Conference Jakarta 2026"
                                />
                            </div>

                            <div>
                                <label htmlFor="shortDesc" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Deskripsi Singkat
                                </label>
                                <input
                                    id="shortDesc"
                                    type="text"
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    maxLength={200}
                                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                                    placeholder="Ringkasan singkat event (maks. 200 karakter)"
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-1">{shortDescription.length}/200</p>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Deskripsi Lengkap *
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all resize-none"
                                    placeholder="Jelaskan detail event kamu..."
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Kategori *
                                    </label>
                                    <select
                                        id="category"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="eventType" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Tipe Event *
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["OFFLINE", "ONLINE", "HYBRID"] as EventType[]).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setEventType(type)}
                                                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                                                    eventType === type
                                                        ? "bg-[var(--accent-primary)] text-white border-indigo-600"
                                                        : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-indigo-300"
                                                }`}
                                            >
                                                {type === "OFFLINE" && <MapPin className="h-4 w-4 mx-auto mb-1" />}
                                                {type === "ONLINE" && <Globe className="h-4 w-4 mx-auto mb-1" />}
                                                {type === "HYBRID" && <Video className="h-4 w-4 mx-auto mb-1" />}
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Jadwal Event</h2>
                                <button
                                    type="button"
                                    onClick={addSchedule}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Jadwal
                                </button>
                            </div>

                            {schedules.map((schedule, index) => (
                                <div key={schedule.id} className="p-5 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)]">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-medium text-[var(--text-secondary)]">Jadwal {index + 1}</span>
                                        {schedules.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSchedule(schedule.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor={`schedule-title-${schedule.id}`} className="block text-sm text-[var(--text-secondary)] mb-1">
                                                Judul Sesi (opsional)
                                            </label>
                                            <input
                                                id={`schedule-title-${schedule.id}`}
                                                type="text"
                                                value={schedule.title}
                                                onChange={(e) => updateSchedule(schedule.id, "title", e.target.value)}
                                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                placeholder="Contoh: Day 1 - Workshop"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`schedule-date-${schedule.id}`} className="block text-sm text-[var(--text-secondary)] mb-1">
                                                Tanggal *
                                            </label>
                                            <input
                                                id={`schedule-date-${schedule.id}`}
                                                type="date"
                                                value={schedule.scheduleDate}
                                                onChange={(e) => updateSchedule(schedule.id, "scheduleDate", e.target.value)}
                                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`schedule-start-${schedule.id}`} className="block text-sm text-[var(--text-secondary)] mb-1">
                                                Waktu Mulai *
                                            </label>
                                            <input
                                                id={`schedule-start-${schedule.id}`}
                                                type="time"
                                                value={schedule.startTime}
                                                onChange={(e) => updateSchedule(schedule.id, "startTime", e.target.value)}
                                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`schedule-end-${schedule.id}`} className="block text-sm text-[var(--text-secondary)] mb-1">
                                                Waktu Selesai *
                                            </label>
                                            <input
                                                id={`schedule-end-${schedule.id}`}
                                                type="time"
                                                value={schedule.endTime}
                                                onChange={(e) => updateSchedule(schedule.id, "endTime", e.target.value)}
                                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Lokasi Event</h2>

                            {eventType !== "ONLINE" && (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-[var(--text-secondary)]">Venue</h3>
                                    <div>
                                        <label htmlFor="venueName" className="block text-sm text-[var(--text-secondary)] mb-1">
                                            Nama Venue *
                                        </label>
                                        <input
                                            id="venueName"
                                            type="text"
                                            value={venueName}
                                            onChange={(e) => setVenueName(e.target.value)}
                                            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                            placeholder="Contoh: Jakarta Convention Center"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="venueAddress" className="block text-sm text-[var(--text-secondary)] mb-1">
                                            Alamat
                                        </label>
                                        <input
                                            id="venueAddress"
                                            type="text"
                                            value={venueAddress}
                                            onChange={(e) => setVenueAddress(e.target.value)}
                                            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                            placeholder="Jl. Jend. Gatot Subroto No.1"
                                        />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="venueCity" className="block text-sm text-[var(--text-secondary)] mb-1">
                                                Kota *
                                            </label>
                                            <input
                                                id="venueCity"
                                                type="text"
                                                value={venueCity}
                                                onChange={(e) => setVenueCity(e.target.value)}
                                                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                placeholder="Jakarta"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="venueProvince" className="block text-sm text-[var(--text-secondary)] mb-1">
                                                Provinsi
                                            </label>
                                            <input
                                                id="venueProvince"
                                                type="text"
                                                value={venueProvince}
                                                onChange={(e) => setVenueProvince(e.target.value)}
                                                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                placeholder="DKI Jakarta"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {eventType !== "OFFLINE" && (
                                <div className="space-y-4 p-5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <h3 className="font-medium text-blue-700 flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        Detail Online
                                    </h3>
                                    <div>
                                        <label htmlFor="onlineUrl" className="block text-sm text-[var(--text-secondary)] mb-1">
                                            URL Meeting *
                                        </label>
                                        <input
                                            id="onlineUrl"
                                            type="url"
                                            value={onlineMeetingUrl}
                                            onChange={(e) => setOnlineMeetingUrl(e.target.value)}
                                            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                            placeholder="https://zoom.us/j/xxxxx atau https://meet.google.com/xxx"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Tipe Tiket</h2>
                                <button
                                    type="button"
                                    onClick={addTicket}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Tiket
                                </button>
                            </div>

                            {ticketTypes.map((ticket, index) => (
                                <div key={ticket.id} className="p-5 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)]">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-medium text-[var(--text-secondary)]">Tiket {index + 1}</span>
                                        {ticketTypes.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTicket(ticket.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor={`ticket-name-${ticket.id}`} className="block text-sm text-[var(--text-secondary)] mb-1">
                                                Nama Tiket *
                                            </label>
                                            <input
                                                id={`ticket-name-${ticket.id}`}
                                                type="text"
                                                value={ticket.name}
                                                onChange={(e) => updateTicket(ticket.id, "name", e.target.value)}
                                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                placeholder="Contoh: VIP, Regular, Early Bird"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`ticket-qty-${ticket.id}`} className="block text-sm text-[var(--text-secondary)] mb-1">
                                                Kuota *
                                            </label>
                                            <input
                                                id={`ticket-qty-${ticket.id}`}
                                                type="number"
                                                value={ticket.totalQuantity}
                                                onChange={(e) => updateTicket(ticket.id, "totalQuantity", parseInt(e.target.value) || 0)}
                                                min={1}
                                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`ticket-price-${ticket.id}`} className="block text-sm text-[var(--text-secondary)] mb-1">
                                                Harga (Rp)
                                            </label>
                                            <input
                                                id={`ticket-price-${ticket.id}`}
                                                type="number"
                                                value={ticket.basePrice}
                                                onChange={(e) => updateTicket(ticket.id, "basePrice", parseInt(e.target.value) || 0)}
                                                min={0}
                                                disabled={ticket.isFree}
                                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent disabled:bg-[var(--bg-secondary)]"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={ticket.isFree}
                                                    onChange={(e) => updateTicket(ticket.id, "isFree", e.target.checked)}
                                                    className="w-5 h-5 rounded border-[var(--border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                                                />
                                                <span className="text-sm text-[var(--text-secondary)]">Tiket Gratis</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Media</h2>

                            <div>
                                <label htmlFor="posterImage" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    URL Poster Image
                                </label>
                                <input
                                    id="posterImage"
                                    type="url"
                                    value={posterImage}
                                    onChange={(e) => setPosterImage(e.target.value)}
                                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                    placeholder="https://example.com/poster.jpg"
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-1">Gambar utama event (rasio 3:4 recommended)</p>
                            </div>

                            <div>
                                <label htmlFor="bannerImage" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    URL Banner Image
                                </label>
                                <input
                                    id="bannerImage"
                                    type="url"
                                    value={bannerImage}
                                    onChange={(e) => setBannerImage(e.target.value)}
                                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                    placeholder="https://example.com/banner.jpg"
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-1">Banner untuk halaman detail (rasio 16:9 recommended)</p>
                            </div>

                            {(posterImage || bannerImage) && (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {posterImage && (
                                        <div>
                                            <p className="text-sm text-[var(--text-secondary)] mb-2">Preview Poster</p>
                                            <img
                                                src={posterImage}
                                                alt="Poster preview"
                                                className="w-full h-48 object-cover rounded-xl border"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                            />
                                        </div>
                                    )}
                                    {bannerImage && (
                                        <div>
                                            <p className="text-sm text-[var(--text-secondary)] mb-2">Preview Banner</p>
                                            <img
                                                src={bannerImage}
                                                alt="Banner preview"
                                                className="w-full h-48 object-cover rounded-xl border"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Pengaturan & Review</h2>

                            <div>
                                <span className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Visibilitas Event</span>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {([
                                        { value: "PUBLIC", label: "Publik", icon: Globe, desc: "Semua orang bisa lihat" },
                                        { value: "PRIVATE", label: "Privat", icon: Lock, desc: "Hanya via link langsung" },
                                        { value: "PASSWORD_PROTECTED", label: "Password", icon: Lock, desc: "Perlu password" },
                                    ] as const).map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setVisibility(opt.value)}
                                            className={`p-4 rounded-xl border text-left transition-all ${
                                                visibility === opt.value
                                                    ? "bg-[var(--accent-primary)]/10 border-indigo-300 ring-2 ring-indigo-200"
                                                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border)]"
                                            }`}
                                        >
                                            <opt.icon className={`h-5 w-5 mb-2 ${visibility === opt.value ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`} />
                                            <p className="font-medium text-[var(--text-primary)]">{opt.label}</p>
                                            <p className="text-xs text-[var(--text-muted)]">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {visibility === "PASSWORD_PROTECTED" && (
                                <div>
                                    <label htmlFor="accessPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Password Akses *
                                    </label>
                                    <input
                                        id="accessPassword"
                                        type="text"
                                        value={accessPassword}
                                        onChange={(e) => setAccessPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                        placeholder="Masukkan password untuk akses event"
                                    />
                                </div>
                            )}

                            <div>
                                <label htmlFor="terms" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Syarat & Ketentuan
                                </label>
                                <textarea
                                    id="terms"
                                    value={termsAndConditions}
                                    onChange={(e) => setTermsAndConditions(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent resize-none"
                                    placeholder="Tulis syarat dan ketentuan event (opsional)"
                                />
                            </div>

                            <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Ringkasan Event</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-[var(--text-muted)]">Judul:</span> <span className="font-medium">{title || "-"}</span></p>
                                    <p><span className="text-[var(--text-muted)]">Tipe:</span> <span className="font-medium">{eventType}</span></p>
                                    <p><span className="text-[var(--text-muted)]">Kategori:</span> <span className="font-medium">{categories.find(c => c.id === categoryId)?.name || "-"}</span></p>
                                    <p><span className="text-[var(--text-muted)]">Jadwal:</span> <span className="font-medium">{schedules.length} sesi</span></p>
                                    <p><span className="text-[var(--text-muted)]">Tipe Tiket:</span> <span className="font-medium">{ticketTypes.length} tipe</span></p>
                                    <p><span className="text-[var(--text-muted)]">Visibilitas:</span> <span className="font-medium">{visibility}</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="inline-flex items-center gap-2 px-5 py-3 border border-[var(--border)] text-[var(--text-secondary)] rounded-xl font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Sebelumnya
                        </button>

                        {currentStep < 6 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-colors shadow-lg shadow-indigo-200"
                            >
                                Selanjutnya
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-200"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-5 w-5" />
                                        Buat Event
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
