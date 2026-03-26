"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Check,
    FileText,
    Globe,
    Image,
    Loader2,
    Lock,
    MapPin,
    Plus,
    Settings,
    Ticket,
    Trash2,
    Video,
} from "lucide-react";
import {
    OrganizerChoiceCard,
    OrganizerHeroCard,
    OrganizerPanel,
    OrganizerStatusBadge,
    OrganizerSurface,
    OrganizerWorkflowField,
    OrganizerWorkflowSelect,
    OrganizerWorkflowSidebar,
    OrganizerWorkflowStepper,
    OrganizerWorkflowTextarea,
    OrganizerWorkspaceHeader,
} from "@/components/organizer/organizer-workspace-primitives";

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
    { id: 1, title: "Info dasar", icon: FileText },
    { id: 2, title: "Jadwal", icon: Calendar },
    { id: 3, title: "Lokasi", icon: MapPin },
    { id: 4, title: "Tiket", icon: Ticket },
    { id: 5, title: "Media", icon: Image },
    { id: 6, title: "Pengaturan", icon: Settings },
] as const;

function generateId(): string {
    return Math.random().toString(36).substring(7);
}

function getStepCopy(step: number) {
    switch (step) {
        case 1:
            return {
                title: "Susun fondasi event sebelum masuk ke operasional.",
                description:
                    "Mulai dari positioning event, kategori, dan tipe pengalaman agar alur publikasi, ticketing, dan halaman publik tetap konsisten.",
            };
        case 2:
            return {
                title: "Bangun ritme sesi dan tanggal utama.",
                description:
                    "Jadwal pertama akan menjadi anchor untuk katalog organizer dan membantu tim melihat kesiapan rundown dengan cepat.",
            };
        case 3:
            return {
                title: "Pastikan venue atau akses online sudah jelas.",
                description:
                    "Detail lokasi dipakai untuk briefing internal, halaman publik, dan referensi check-in saat event berjalan.",
            };
        case 4:
            return {
                title: "Rancang struktur ticketing yang mudah dipahami.",
                description:
                    "Pisahkan tier ticket secara jelas supaya quota, harga, dan positioning penawaran terlihat rapi sejak awal.",
            };
        case 5:
            return {
                title: "Lengkapi materi visual untuk memperkuat konversi.",
                description:
                    "Poster dan banner akan menjadi wajah utama event di katalog organizer dan experience publik Gelaran.",
            };
        case 6:
            return {
                title: "Review status akses dan final readiness sebelum simpan.",
                description:
                    "Gunakan tahap terakhir untuk memastikan visibilitas, password, dan catatan operasional sudah sesuai rencana publikasi.",
            };
        default:
            return {
                title: "Bangun event baru",
                description: "Atur detail event secara bertahap dari fondasi hingga publikasi.",
            };
    }
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
            setSchedules(schedules.filter((schedule) => schedule.id !== id));
        }
    };

    const updateSchedule = (id: string, field: keyof ScheduleItem, value: string) => {
        setSchedules(schedules.map((schedule) => (schedule.id === id ? { ...schedule, [field]: value } : schedule)));
    };

    const addTicket = () => {
        setTicketTypes([
            ...ticketTypes,
            { id: generateId(), name: "", description: "", basePrice: 0, totalQuantity: 100, isFree: false },
        ]);
    };

    const removeTicket = (id: string) => {
        if (ticketTypes.length > 1) {
            setTicketTypes(ticketTypes.filter((ticket) => ticket.id !== id));
        }
    };

    const updateTicket = (id: string, field: keyof TicketItem, value: string | number | boolean) => {
        setTicketTypes(ticketTypes.map((ticket) => (ticket.id === id ? { ...ticket, [field]: value } : ticket)));
    };

    const validateStep = (step: number): boolean => {
        setError(null);
        switch (step) {
            case 1:
                if (!title.trim()) {
                    setError("Judul event wajib diisi");
                    return false;
                }
                if (title.length < 5) {
                    setError("Judul minimal 5 karakter");
                    return false;
                }
                if (!description.trim()) {
                    setError("Deskripsi wajib diisi");
                    return false;
                }
                if (description.length < 20) {
                    setError("Deskripsi minimal 20 karakter");
                    return false;
                }
                if (!categoryId) {
                    setError("Pilih kategori");
                    return false;
                }
                return true;
            case 2:
                for (const schedule of schedules) {
                    if (!schedule.scheduleDate) {
                        setError("Tanggal jadwal wajib diisi");
                        return false;
                    }
                    if (!schedule.startTime || !schedule.endTime) {
                        setError("Waktu mulai dan selesai wajib diisi");
                        return false;
                    }
                }
                return true;
            case 3:
                if (eventType !== "ONLINE") {
                    if (!venueName.trim()) {
                        setError("Nama venue wajib diisi");
                        return false;
                    }
                    if (!venueCity.trim()) {
                        setError("Kota wajib diisi");
                        return false;
                    }
                }
                if (eventType !== "OFFLINE" && !onlineMeetingUrl.trim()) {
                    setError("URL meeting online wajib diisi untuk event online/hybrid");
                    return false;
                }
                return true;
            case 4:
                for (const ticket of ticketTypes) {
                    if (!ticket.name.trim()) {
                        setError("Nama tiket wajib diisi");
                        return false;
                    }
                    if (ticket.totalQuantity < 1) {
                        setError("Kuota tiket minimal 1");
                        return false;
                    }
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
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
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
            schedules: schedules.map((schedule) => ({
                title: schedule.title || undefined,
                scheduleDate: schedule.scheduleDate,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
            })),
            ticketTypes: ticketTypes.map((ticket) => ({
                name: ticket.name,
                description: ticket.description || undefined,
                basePrice: ticket.isFree ? 0 : ticket.basePrice,
                totalQuantity: ticket.totalQuantity,
                isFree: ticket.isFree,
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

    const selectedCategory = categories.find((category) => category.id === categoryId)?.name || "Belum dipilih";
    const stepCopy = getStepCopy(currentStep);
    const completedSteps = STEPS.filter((step) => currentStep > step.id).length;
    const firstSchedule = schedules.find((schedule) => schedule.scheduleDate);
    const eventSummary = useMemo(
        () => ({
            sessions: schedules.length,
            tickets: ticketTypes.length,
            totalQuota: ticketTypes.reduce((total, ticket) => total + ticket.totalQuantity, 0),
        }),
        [schedules, ticketTypes],
    );

    return (
        <div className="space-y-6 pb-12">
            <OrganizerWorkspaceHeader
                eyebrow="Organizer event workflow"
                title="Buat event baru"
                description="Rakit event baru dengan editor bertahap yang selaras dengan workspace organizer Gelaran, tanpa mengubah alur submit yang sudah berjalan."
                actions={
                    <Link
                        href="/organizer/events"
                        className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-elevated)"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke katalog
                    </Link>
                }
                badge={<OrganizerStatusBadge tone="info">Draft builder · {completedSteps}/6 tahap selesai</OrganizerStatusBadge>}
                meta={
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1 font-medium text-foreground">
                            CTA utama: Simpan event draft
                        </span>
                        <span>Gunakan struktur langkah ini untuk menyusun detail event, inventory tiket, dan readiness publikasi secara lebih jelas.</span>
                    </div>
                }
            />

            <OrganizerHeroCard
                icon={FileText}
                title={stepCopy.title}
                description={stepCopy.description}
                actions={
                    <div className="flex flex-wrap gap-3">
                        <OrganizerStatusBadge tone="default">Tahap {currentStep} dari 6</OrganizerStatusBadge>
                        <OrganizerStatusBadge tone={eventType === "OFFLINE" ? "info" : eventType === "ONLINE" ? "success" : "warning"}>
                            Format {eventType}
                        </OrganizerStatusBadge>
                    </div>
                }
                aside={
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-(--text-secondary)">Kesiapan editor</p>
                            <p className="mt-1 text-3xl font-semibold tracking-(--tracking-heading) text-foreground">
                                {Math.round((currentStep / STEPS.length) * 100)}%
                            </p>
                        </div>
                        <div className="grid gap-3">
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Kategori</p>
                                <p className="mt-2 text-base font-semibold text-foreground">{selectedCategory}</p>
                            </OrganizerSurface>
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Jadwal pertama</p>
                                <p className="mt-2 text-base font-semibold text-foreground">
                                    {firstSchedule?.scheduleDate || "Belum ditentukan"}
                                </p>
                            </OrganizerSurface>
                        </div>
                    </div>
                }
            />

            <OrganizerPanel title="Progress event builder" description="Setiap tahap diringkas di sini supaya organizer tahu posisi saat menyiapkan event baru.">
                <OrganizerWorkflowStepper steps={[...STEPS]} currentStep={currentStep} />
            </OrganizerPanel>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
                <div className="space-y-6">
                    {error ? (
                        <OrganizerPanel className="border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.04)]">
                            <p className="text-sm font-medium text-[rgb(185,28,28)]">{error}</p>
                        </OrganizerPanel>
                    ) : null}

                    {currentStep === 1 ? (
                        <OrganizerPanel
                            title="Informasi dasar"
                            description="Tentukan identitas event, ringkasan, dan kategori supaya halaman detail organizer dan pengalaman publik punya arah yang jelas."
                        >
                            <div className="space-y-6">
                                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                                    <OrganizerWorkflowField
                                        id="title"
                                        label="Judul event *"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Contoh: Tech Conference Jakarta 2026"
                                        hint="Gunakan judul yang spesifik agar mudah dikenali di katalog organizer dan halaman publik."
                                    />
                                    <OrganizerWorkflowSelect
                                        id="category"
                                        label="Kategori *"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                    >
                                        <option value="">Pilih kategori</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </OrganizerWorkflowSelect>
                                </div>

                                <OrganizerWorkflowTextarea
                                    id="shortDescription"
                                    label="Deskripsi singkat"
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    rows={3}
                                    maxLength={200}
                                    placeholder="Ringkasan singkat event untuk membantu preview dan discovery."
                                    hint={`${shortDescription.length}/200 karakter`}
                                />

                                <OrganizerWorkflowTextarea
                                    id="description"
                                    label="Deskripsi lengkap *"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={7}
                                    placeholder="Jelaskan agenda, target audiens, nilai utama event, dan pengalaman yang akan didapat peserta."
                                />

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Format event *</p>
                                        <p className="mt-1 text-sm leading-6 text-(--text-secondary)">
                                            Pilih format delivery utama supaya panel lokasi, akses online, dan presentasi event mengikuti kebutuhan operasional.
                                        </p>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <OrganizerChoiceCard
                                            title="Offline"
                                            description="Peserta hadir di venue fisik dengan fokus pada detail lokasi dan kapasitas."
                                            icon={MapPin}
                                            selected={eventType === "OFFLINE"}
                                            onClick={() => setEventType("OFFLINE")}
                                        />
                                        <OrganizerChoiceCard
                                            title="Online"
                                            description="Akses event penuh lewat meeting link atau streaming room tanpa venue fisik."
                                            icon={Globe}
                                            selected={eventType === "ONLINE"}
                                            onClick={() => setEventType("ONLINE")}
                                        />
                                        <OrganizerChoiceCard
                                            title="Hybrid"
                                            description="Gabungkan pengalaman onsite dan online untuk audience yang lebih luas."
                                            icon={Video}
                                            selected={eventType === "HYBRID"}
                                            onClick={() => setEventType("HYBRID")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </OrganizerPanel>
                    ) : null}

                    {currentStep === 2 ? (
                        <OrganizerPanel
                            title="Jadwal event"
                            description="Bangun struktur sesi utama. Data ini tetap memakai flow yang sama, namun tampilannya kini lebih jelas untuk scanning cepat."
                            action={
                                <button
                                    type="button"
                                    onClick={addSchedule}
                                    className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-4 py-2.5 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah jadwal
                                </button>
                            }
                        >
                            <div className="space-y-4">
                                {schedules.map((schedule, index) => (
                                    <OrganizerSurface key={schedule.id} className="space-y-5 rounded-[1.75rem] p-5 sm:p-6">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">Sesi {index + 1}</p>
                                                <p className="text-sm text-(--text-secondary)">Tentukan tanggal, jam mulai, dan jam selesai untuk sesi ini.</p>
                                            </div>
                                            {schedules.length > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSchedule(schedule.id)}
                                                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(220,38,38,0.2)] px-3 py-2 text-sm font-medium text-[rgb(185,28,28)] transition-colors hover:bg-[rgba(220,38,38,0.05)]"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Hapus
                                                </button>
                                            ) : null}
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <OrganizerWorkflowField
                                                id={`schedule-title-${schedule.id}`}
                                                label="Judul sesi"
                                                value={schedule.title}
                                                onChange={(e) => updateSchedule(schedule.id, "title", e.target.value)}
                                                placeholder="Contoh: Day 1 · Workshop"
                                                hint="Opsional, cocok untuk event multisession atau agenda bertema."
                                            />
                                            <OrganizerWorkflowField
                                                id={`schedule-date-${schedule.id}`}
                                                type="date"
                                                label="Tanggal *"
                                                value={schedule.scheduleDate}
                                                onChange={(e) => updateSchedule(schedule.id, "scheduleDate", e.target.value)}
                                            />
                                            <OrganizerWorkflowField
                                                id={`schedule-start-${schedule.id}`}
                                                type="time"
                                                label="Waktu mulai *"
                                                value={schedule.startTime}
                                                onChange={(e) => updateSchedule(schedule.id, "startTime", e.target.value)}
                                            />
                                            <OrganizerWorkflowField
                                                id={`schedule-end-${schedule.id}`}
                                                type="time"
                                                label="Waktu selesai *"
                                                value={schedule.endTime}
                                                onChange={(e) => updateSchedule(schedule.id, "endTime", e.target.value)}
                                            />
                                        </div>
                                    </OrganizerSurface>
                                ))}
                            </div>
                        </OrganizerPanel>
                    ) : null}

                    {currentStep === 3 ? (
                        <OrganizerPanel
                            title="Lokasi & akses"
                            description="Selaraskan kebutuhan venue fisik dan akses online berdasarkan format event yang dipilih."
                        >
                            <div className="space-y-6">
                                {eventType !== "ONLINE" ? (
                                    <OrganizerSurface className="space-y-5 rounded-[1.75rem] p-5 sm:p-6">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Venue fisik</p>
                                            <p className="mt-1 text-sm leading-6 text-(--text-secondary)">
                                                Informasi ini dipakai untuk detail lokasi utama dan referensi operasional event onsite.
                                            </p>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <OrganizerWorkflowField
                                                id="venueName"
                                                label="Nama venue *"
                                                value={venueName}
                                                onChange={(e) => setVenueName(e.target.value)}
                                                placeholder="Contoh: Jakarta Convention Center"
                                            />
                                            <OrganizerWorkflowField
                                                id="venueCity"
                                                label="Kota *"
                                                value={venueCity}
                                                onChange={(e) => setVenueCity(e.target.value)}
                                                placeholder="Jakarta"
                                            />
                                        </div>
                                        <OrganizerWorkflowField
                                            id="venueAddress"
                                            label="Alamat"
                                            value={venueAddress}
                                            onChange={(e) => setVenueAddress(e.target.value)}
                                            placeholder="Jl. Jend. Gatot Subroto No.1"
                                        />
                                        <OrganizerWorkflowField
                                            id="venueProvince"
                                            label="Provinsi"
                                            value={venueProvince}
                                            onChange={(e) => setVenueProvince(e.target.value)}
                                            placeholder="DKI Jakarta"
                                        />
                                    </OrganizerSurface>
                                ) : null}

                                {eventType !== "OFFLINE" ? (
                                    <OrganizerSurface className="space-y-5 rounded-[1.75rem] border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.04)] p-5 sm:p-6">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Akses online</p>
                                            <p className="mt-1 text-sm leading-6 text-(--text-secondary)">
                                                Tambahkan meeting URL utama agar peserta online bisa diarahkan dengan jelas saat event dipublikasikan.
                                            </p>
                                        </div>
                                        <OrganizerWorkflowField
                                            id="onlineUrl"
                                            type="url"
                                            label="URL meeting *"
                                            value={onlineMeetingUrl}
                                            onChange={(e) => setOnlineMeetingUrl(e.target.value)}
                                            placeholder="https://zoom.us/j/xxxxx atau https://meet.google.com/xxx"
                                        />
                                    </OrganizerSurface>
                                ) : null}
                            </div>
                        </OrganizerPanel>
                    ) : null}

                    {currentStep === 4 ? (
                        <OrganizerPanel
                            title="Tipe tiket"
                            description="Susun tier tiket utama dengan harga, kuota, dan positioning yang lebih mudah di-review oleh tim organizer."
                            action={
                                <button
                                    type="button"
                                    onClick={addTicket}
                                    className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-4 py-2.5 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah tiket
                                </button>
                            }
                        >
                            <div className="space-y-4">
                                {ticketTypes.map((ticket, index) => (
                                    <OrganizerSurface key={ticket.id} className="space-y-5 rounded-[1.75rem] p-5 sm:p-6">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">Tier tiket {index + 1}</p>
                                                <p className="text-sm text-(--text-secondary)">Pastikan nama tier dan quota mudah dibedakan agar penjualan lebih rapi.</p>
                                            </div>
                                            {ticketTypes.length > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTicket(ticket.id)}
                                                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(220,38,38,0.2)] px-3 py-2 text-sm font-medium text-[rgb(185,28,28)] transition-colors hover:bg-[rgba(220,38,38,0.05)]"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Hapus
                                                </button>
                                            ) : null}
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <OrganizerWorkflowField
                                                id={`ticket-name-${ticket.id}`}
                                                label="Nama tiket *"
                                                value={ticket.name}
                                                onChange={(e) => updateTicket(ticket.id, "name", e.target.value)}
                                                placeholder="Contoh: VIP, Regular, Early Bird"
                                            />
                                            <OrganizerWorkflowField
                                                id={`ticket-qty-${ticket.id}`}
                                                type="number"
                                                min={1}
                                                label="Kuota *"
                                                value={ticket.totalQuantity}
                                                onChange={(e) => updateTicket(ticket.id, "totalQuantity", parseInt(e.target.value, 10) || 0)}
                                            />
                                            <OrganizerWorkflowField
                                                id={`ticket-price-${ticket.id}`}
                                                type="number"
                                                min={0}
                                                label="Harga (Rp)"
                                                value={ticket.basePrice}
                                                disabled={ticket.isFree}
                                                onChange={(e) => updateTicket(ticket.id, "basePrice", parseInt(e.target.value, 10) || 0)}
                                                hint={ticket.isFree ? "Harga dinonaktifkan karena tiket ditandai gratis." : "Masukkan nilai rupiah tanpa titik pemisah."}
                                            />
                                            <div className="flex items-end">
                                                <label className="inline-flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-foreground">
                                                    <input
                                                        type="checkbox"
                                                        checked={ticket.isFree}
                                                        onChange={(e) => updateTicket(ticket.id, "isFree", e.target.checked)}
                                                        className="h-4 w-4 rounded border-(--border) text-(--accent-primary)"
                                                    />
                                                    Tandai sebagai tiket gratis
                                                </label>
                                            </div>
                                        </div>
                                        <OrganizerWorkflowTextarea
                                            id={`ticket-description-${ticket.id}`}
                                            label="Deskripsi tiket"
                                            value={ticket.description}
                                            onChange={(e) => updateTicket(ticket.id, "description", e.target.value)}
                                            rows={3}
                                            placeholder="Jelaskan benefit utama, fasilitas, atau positioning tier ini."
                                        />
                                    </OrganizerSurface>
                                ))}
                            </div>
                        </OrganizerPanel>
                    ) : null}

                    {currentStep === 5 ? (
                        <OrganizerPanel
                            title="Media event"
                            description="Tambahkan aset visual utama untuk memperkuat preview event di workspace organizer dan halaman publik."
                        >
                            <div className="space-y-6">
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <OrganizerWorkflowField
                                        id="posterImage"
                                        type="url"
                                        label="URL poster image"
                                        value={posterImage}
                                        onChange={(e) => setPosterImage(e.target.value)}
                                        placeholder="https://example.com/poster.jpg"
                                        hint="Gunakan rasio potret sekitar 3:4 untuk tampilan katalog yang lebih rapi."
                                    />
                                    <OrganizerWorkflowField
                                        id="bannerImage"
                                        type="url"
                                        label="URL banner image"
                                        value={bannerImage}
                                        onChange={(e) => setBannerImage(e.target.value)}
                                        placeholder="https://example.com/banner.jpg"
                                        hint="Rasio lebar 16:9 lebih ideal untuk header dan highlight preview."
                                    />
                                </div>

                                {posterImage || bannerImage ? (
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {posterImage ? (
                                            <OrganizerSurface className="space-y-3">
                                                <p className="text-sm font-semibold text-foreground">Preview poster</p>
                                                <img
                                                    src={posterImage}
                                                    alt="Poster preview"
                                                    className="h-64 w-full rounded-[1.25rem] border border-(--border) object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = "none";
                                                    }}
                                                />
                                            </OrganizerSurface>
                                        ) : null}
                                        {bannerImage ? (
                                            <OrganizerSurface className="space-y-3">
                                                <p className="text-sm font-semibold text-foreground">Preview banner</p>
                                                <img
                                                    src={bannerImage}
                                                    alt="Banner preview"
                                                    className="h-64 w-full rounded-[1.25rem] border border-(--border) object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = "none";
                                                    }}
                                                />
                                            </OrganizerSurface>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        </OrganizerPanel>
                    ) : null}

                    {currentStep === 6 ? (
                        <OrganizerPanel
                            title="Pengaturan & review"
                            description="Finalisasi akses event, catatan terms, dan review singkat sebelum event draft dibuat."
                        >
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Visibilitas event</p>
                                        <p className="mt-1 text-sm leading-6 text-(--text-secondary)">
                                            Pilih bagaimana event ini bisa diakses organizer lain, peserta, atau audience dari link langsung.
                                        </p>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <OrganizerChoiceCard
                                            title="Publik"
                                            description="Semua orang dapat melihat event ketika status publikasi sudah aktif."
                                            icon={Globe}
                                            selected={visibility === "PUBLIC"}
                                            onClick={() => setVisibility("PUBLIC")}
                                        />
                                        <OrganizerChoiceCard
                                            title="Privat"
                                            description="Event tetap tersembunyi dan hanya diakses melalui link langsung."
                                            icon={Lock}
                                            selected={visibility === "PRIVATE"}
                                            onClick={() => setVisibility("PRIVATE")}
                                        />
                                        <OrganizerChoiceCard
                                            title="Password"
                                            description="Tambahkan lapisan akses tambahan dengan password event."
                                            icon={Lock}
                                            selected={visibility === "PASSWORD_PROTECTED"}
                                            onClick={() => setVisibility("PASSWORD_PROTECTED")}
                                        />
                                    </div>
                                </div>

                                {visibility === "PASSWORD_PROTECTED" ? (
                                    <OrganizerWorkflowField
                                        id="accessPassword"
                                        label="Password akses *"
                                        value={accessPassword}
                                        onChange={(e) => setAccessPassword(e.target.value)}
                                        placeholder="Masukkan password untuk akses event"
                                    />
                                ) : null}

                                <OrganizerWorkflowTextarea
                                    id="terms"
                                    label="Syarat & ketentuan"
                                    value={termsAndConditions}
                                    onChange={(e) => setTermsAndConditions(e.target.value)}
                                    rows={5}
                                    placeholder="Tuliskan syarat, catatan operasional, atau ketentuan umum untuk peserta."
                                />
                            </div>
                        </OrganizerPanel>
                    ) : null}

                    <div className="sticky bottom-4 z-10 rounded-[1.75rem] border border-(--border) bg-(--surface)/95 p-4 shadow-(--shadow-lg) backdrop-blur">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-elevated) disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Sebelumnya
                            </button>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                <Link
                                    href="/organizer/events"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) px-5 py-3 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--surface-elevated)"
                                >
                                    Batalkan draft
                                </Link>
                                {currentStep < 6 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90"
                                    >
                                        Lanjut ke tahap berikutnya
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        {isSubmitting ? "Menyimpan draft..." : "Buat event"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <OrganizerWorkflowSidebar
                    title="Ringkasan event"
                    description="Sidebar ini membantu organizer memantau kualitas data inti tanpa meninggalkan editor."
                >
                    <OrganizerSurface>
                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Status build</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">Draft belum dipublikasikan</p>
                        <p className="mt-1 text-sm leading-6 text-(--text-secondary)">
                            Event akan tetap mengikuti flow submit organizer yang sama setelah proses pembuatan selesai.
                        </p>
                    </OrganizerSurface>

                    <OrganizerSurface>
                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Performa setup</p>
                        <div className="mt-3 space-y-3 text-sm text-(--text-secondary)">
                            <div className="flex items-center justify-between gap-3">
                                <span>Judul event</span>
                                <span className="font-semibold text-foreground">{title ? "Siap" : "Pending"}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span>Jadwal</span>
                                <span className="font-semibold text-foreground">{eventSummary.sessions} sesi</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span>Tiket</span>
                                <span className="font-semibold text-foreground">{eventSummary.tickets} tipe</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span>Total kuota</span>
                                <span className="font-semibold text-foreground">{eventSummary.totalQuota}</span>
                            </div>
                        </div>
                    </OrganizerSurface>

                    <OrganizerSurface>
                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Snapshot</p>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-(--text-secondary)">
                            <p>
                                <span className="font-medium text-foreground">Judul:</span> {title || "Belum diisi"}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Kategori:</span> {selectedCategory}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Tipe event:</span> {eventType}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Visibilitas:</span> {visibility}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Aset media:</span> {posterImage || bannerImage ? "Sudah ada" : "Belum ada"}
                            </p>
                        </div>
                    </OrganizerSurface>
                </OrganizerWorkflowSidebar>
            </div>
        </div>
    );
}
