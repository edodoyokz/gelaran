"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Globe, ImageIcon, Loader2, Save, Settings, ShieldCheck, Video } from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import {
    OrganizerChoiceCard,
    OrganizerHeroCard,
    OrganizerPanel,
    OrganizerStatusBadge,
    OrganizerSurface,
    OrganizerWorkflowField,
    OrganizerWorkflowSidebar,
    OrganizerWorkflowTextarea,
    OrganizerWorkspaceHeader,
} from "@/components/organizer/organizer-workspace-primitives";

interface EventData {
    id: string;
    title: string;
    shortDescription: string | null;
    description: string;
    posterImage: string | null;
    bannerImage: string | null;
    eventType: "OFFLINE" | "ONLINE" | "HYBRID";
    onlineMeetingUrl: string | null;
    termsAndConditions: string | null;
    refundPolicy: string | null;
}

export default function EditEventPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const [form, setForm] = useState<{
        title: string;
        shortDescription: string;
        description: string;
        posterImage: string;
        bannerImage: string;
        eventType: "OFFLINE" | "ONLINE" | "HYBRID";
        onlineMeetingUrl: string;
        termsAndConditions: string;
        refundPolicy: string;
    }>({
        title: "",
        shortDescription: "",
        description: "",
        posterImage: "",
        bannerImage: "",
        eventType: "OFFLINE",
        onlineMeetingUrl: "",
        termsAndConditions: "",
        refundPolicy: "",
    });

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/organizer/events/${eventId}`);
                const data = await res.json();

                if (!data.success) {
                    setError(data.error || "Gagal memuat event");
                    return;
                }

                const event = data.data as EventData;
                setForm({
                    title: event.title || "",
                    shortDescription: event.shortDescription || "",
                    description: event.description || "",
                    posterImage: event.posterImage || "",
                    bannerImage: event.bannerImage || "",
                    eventType: event.eventType || "OFFLINE",
                    onlineMeetingUrl: event.onlineMeetingUrl || "",
                    termsAndConditions: event.termsAndConditions || "",
                    refundPolicy: event.refundPolicy || "",
                });
            } catch {
                setError("Terjadi kesalahan saat memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        loadEvent();
    }, [eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        try {
            if (!form.title) throw new Error("Judul event wajib diisi");
            if (!form.description) throw new Error("Deskripsi event wajib diisi");
            if ((form.eventType === "ONLINE" || form.eventType === "HYBRID") && !form.onlineMeetingUrl) {
                throw new Error("Link meeting wajib diisi untuk event Online/Hybrid");
            }

            const res = await fetch(`/api/organizer/events/${eventId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: form.title,
                    shortDescription: form.shortDescription || null,
                    description: form.description,
                    posterImage: form.posterImage || null,
                    bannerImage: form.bannerImage || null,
                    eventType: form.eventType,
                    onlineMeetingUrl: form.onlineMeetingUrl || null,
                    termsAndConditions: form.termsAndConditions || null,
                    refundPolicy: form.refundPolicy || null,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                if (data.error && typeof data.error === "object" && data.error.errors) {
                    const firstError = Object.values(data.error.errors)[0] as string[];
                    throw new Error(firstError[0] || "Validasi gagal");
                }
                throw new Error(data.error || "Gagal menyimpan perubahan");
            }

            router.push(`/organizer/events/${eventId}`);
            router.refresh();
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSaving(false);
        }
    };

    const readiness = useMemo(() => {
        const completed = [
            Boolean(form.title.trim()),
            Boolean(form.description.trim()),
            form.eventType === "OFFLINE" || Boolean(form.onlineMeetingUrl.trim()),
            Boolean(form.posterImage || form.bannerImage),
            Boolean(form.termsAndConditions || form.refundPolicy),
        ].filter(Boolean).length;

        return Math.round((completed / 5) * 100);
    }, [form]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-(--accent-primary)" />
                    <p className="text-(--text-muted)">Memuat data event...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                    <p className="mb-2 font-medium text-foreground">{error}</p>
                    <Link href="/organizer/events" className="text-(--accent-primary) hover:opacity-80">
                        Kembali ke daftar event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <OrganizerWorkspaceHeader
                eyebrow="Organizer event workflow"
                title="Edit event"
                description="Perbarui fondasi konten, media, dan kebijakan event di editor yang kini lebih selaras dengan baseline workspace organizer Gelaran."
                actions={
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={`/organizer/events/${eventId}`}
                            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-elevated)"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke detail event
                        </Link>
                        <button
                            type="submit"
                            form="edit-event-form"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isSaving ? "Menyimpan..." : "Simpan perubahan"}
                        </button>
                    </div>
                }
                badge={<OrganizerStatusBadge tone="warning">Mode editor · perubahan belum dipublikasikan otomatis</OrganizerStatusBadge>}
                meta={
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1 font-medium text-foreground">
                            Event ID: {eventId}
                        </span>
                        <span>Panel ini mempertahankan data flow update organizer yang sama, namun memberi hierarchy yang lebih tegas untuk konten dan CTA.</span>
                    </div>
                }
            />

            <OrganizerHeroCard
                icon={Settings}
                title="Perhalus presentasi event tanpa meninggalkan alur kerja organizer."
                description="Area edit kini memisahkan konten inti, media, tipe event, dan kebijakan ke panel-panel yang lebih mudah dibaca saat tim melakukan revisi cepat."
                actions={
                    <>
                        <OrganizerStatusBadge tone="info">Kesiapan editor {readiness}%</OrganizerStatusBadge>
                        <OrganizerStatusBadge tone={form.eventType === "OFFLINE" ? "info" : form.eventType === "ONLINE" ? "success" : "warning"}>
                            {form.eventType}
                        </OrganizerStatusBadge>
                    </>
                }
                aside={
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-(--text-secondary)">Ringkasan cepat</p>
                            <p className="mt-1 text-3xl font-semibold tracking-(--tracking-heading) text-foreground">{readiness}%</p>
                        </div>
                        <div className="grid gap-3">
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Judul</p>
                                <p className="mt-2 text-base font-semibold text-foreground">{form.title || "Belum diisi"}</p>
                            </OrganizerSurface>
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Media</p>
                                <p className="mt-2 text-base font-semibold text-foreground">{form.posterImage || form.bannerImage ? "Tersedia" : "Belum ada aset"}</p>
                            </OrganizerSurface>
                        </div>
                    </div>
                }
            />

            <form id="edit-event-form" onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
                <div className="space-y-6">
                    {formError ? (
                        <OrganizerPanel className="border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.04)]">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[rgb(185,28,28)]" />
                                <p className="text-sm font-medium text-[rgb(185,28,28)]">{formError}</p>
                            </div>
                        </OrganizerPanel>
                    ) : null}

                    <OrganizerPanel
                        title="Informasi dasar"
                        description="Edit headline event, summary, dan narasi utama agar page detail organizer maupun publik memiliki hierarchy yang lebih jelas."
                    >
                        <div className="space-y-6">
                            <OrganizerWorkflowField
                                id="title"
                                label="Nama event *"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Contoh: Konser Musik Meriah 2024"
                                required
                            />

                            <OrganizerWorkflowTextarea
                                id="shortDescription"
                                label="Deskripsi singkat"
                                rows={3}
                                value={form.shortDescription}
                                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                                placeholder="Ringkasan singkat tentang event Anda (maks 200 karakter)"
                                maxLength={200}
                                hint={`${form.shortDescription.length}/200 karakter`}
                            />

                            <OrganizerWorkflowTextarea
                                id="description"
                                label="Deskripsi lengkap *"
                                rows={8}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Jelaskan detail event Anda selengkap mungkin..."
                                required
                            />
                        </div>
                    </OrganizerPanel>

                    <OrganizerPanel
                        title="Media"
                        description="Perbarui aset visual utama yang dipakai pada katalog organizer dan pengalaman publik Gelaran."
                    >
                        <div className="space-y-8">
                            <div className="rounded-3xl border border-(--border) bg-(--surface-elevated) p-4 sm:p-5">
                                <ImageUploadField
                                    label="Poster event"
                                    value={form.posterImage}
                                    onChange={(url) => setForm({ ...form, posterImage: url })}
                                    bucket="events"
                                    folder={`${eventId}/poster`}
                                    aspectRatio="2/3"
                                />
                            </div>

                            <div className="rounded-3xl border border-(--border) bg-(--surface-elevated) p-4 sm:p-5">
                                <ImageUploadField
                                    label="Banner event"
                                    value={form.bannerImage}
                                    onChange={(url) => setForm({ ...form, bannerImage: url })}
                                    bucket="events"
                                    folder={`${eventId}/banner`}
                                    aspectRatio="16/9"
                                />
                            </div>
                        </div>
                    </OrganizerPanel>

                    <OrganizerPanel
                        title="Tipe event & akses"
                        description="Sesuaikan format delivery event. Input meeting link tetap memakai validasi yang sama seperti sebelumnya."
                    >
                        <div className="space-y-6">
                            <div className="grid gap-3 md:grid-cols-3">
                                <OrganizerChoiceCard
                                    title="Offline"
                                    description="Fokus pada event tatap muka di venue fisik."
                                    icon={Globe}
                                    selected={form.eventType === "OFFLINE"}
                                    onClick={() => setForm({ ...form, eventType: "OFFLINE" })}
                                />
                                <OrganizerChoiceCard
                                    title="Online"
                                    description="Gunakan meeting link atau ruang virtual untuk seluruh peserta."
                                    icon={Video}
                                    selected={form.eventType === "ONLINE"}
                                    onClick={() => setForm({ ...form, eventType: "ONLINE" })}
                                />
                                <OrganizerChoiceCard
                                    title="Hybrid"
                                    description="Gabungkan venue fisik dan akses digital untuk menjangkau audience lebih luas."
                                    icon={Video}
                                    selected={form.eventType === "HYBRID"}
                                    onClick={() => setForm({ ...form, eventType: "HYBRID" })}
                                />
                            </div>

                            {(form.eventType === "ONLINE" || form.eventType === "HYBRID") ? (
                                <OrganizerSurface className="space-y-4 rounded-[1.75rem] border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.04)] p-5 sm:p-6">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Meeting access</p>
                                        <p className="mt-1 text-sm leading-6 text-(--text-secondary)">
                                            Link ini akan digunakan sebagai akses utama untuk peserta online ketika event berjalan.
                                        </p>
                                    </div>
                                    <OrganizerWorkflowField
                                        id="onlineMeetingUrl"
                                        type="url"
                                        label="Link meeting *"
                                        value={form.onlineMeetingUrl}
                                        onChange={(e) => setForm({ ...form, onlineMeetingUrl: e.target.value })}
                                        placeholder="https://zoom.us/j/..."
                                        required
                                    />
                                </OrganizerSurface>
                            ) : null}
                        </div>
                    </OrganizerPanel>

                    <OrganizerPanel
                        title="Kebijakan"
                        description="Rapikan informasi operasional dan proteksi peserta agar review internal lebih cepat dan konsisten."
                    >
                        <div className="space-y-6">
                            <OrganizerWorkflowTextarea
                                id="termsAndConditions"
                                label="Syarat & ketentuan"
                                rows={5}
                                value={form.termsAndConditions}
                                onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })}
                                placeholder="Tuliskan syarat dan ketentuan untuk peserta..."
                            />

                            <OrganizerWorkflowTextarea
                                id="refundPolicy"
                                label="Kebijakan pengembalian dana (refund)"
                                rows={5}
                                value={form.refundPolicy}
                                onChange={(e) => setForm({ ...form, refundPolicy: e.target.value })}
                                placeholder="Jelaskan kebijakan refund jika ada..."
                            />
                        </div>
                    </OrganizerPanel>

                    <div className="sticky bottom-4 z-10 rounded-[1.75rem] border border-(--border) bg-(--surface)/95 p-4 shadow-(--shadow-lg) backdrop-blur">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href={`/organizer/events/${eventId}`}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-elevated)"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isSaving ? "Menyimpan perubahan..." : "Simpan perubahan"}
                            </button>
                        </div>
                    </div>
                </div>

                <OrganizerWorkflowSidebar
                    title="Ringkasan editor"
                    description="Sidebar ini merangkum kesiapan konten agar organizer bisa melakukan final check dengan cepat."
                >
                    <OrganizerSurface>
                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Kesiapan konten</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{readiness}% siap</p>
                        <p className="mt-1 text-sm leading-6 text-(--text-secondary)">
                            Penilaian ini hanya bersifat presentational dan tidak mengubah validasi backend yang sudah ada.
                        </p>
                    </OrganizerSurface>

                    <OrganizerSurface>
                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Status panel</p>
                        <div className="mt-3 space-y-3 text-sm text-(--text-secondary)">
                            <div className="flex items-center justify-between gap-3">
                                <span>Informasi dasar</span>
                                <span className="font-semibold text-foreground">{form.title && form.description ? "Siap" : "Perlu dilengkapi"}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span>Media</span>
                                <span className="font-semibold text-foreground">{form.posterImage || form.bannerImage ? "Ada aset" : "Kosong"}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span>Meeting link</span>
                                <span className="font-semibold text-foreground">
                                    {form.eventType === "OFFLINE" ? "Tidak perlu" : form.onlineMeetingUrl ? "Siap" : "Pending"}
                                </span>
                            </div>
                        </div>
                    </OrganizerSurface>

                    <OrganizerSurface>
                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Snapshot event</p>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-(--text-secondary)">
                            <p><span className="font-medium text-foreground">Judul:</span> {form.title || "Belum diisi"}</p>
                            <p><span className="font-medium text-foreground">Format:</span> {form.eventType}</p>
                            <p><span className="font-medium text-foreground">Short copy:</span> {form.shortDescription ? "Tersedia" : "Belum ada"}</p>
                            <p><span className="font-medium text-foreground">Refund policy:</span> {form.refundPolicy ? "Sudah diatur" : "Belum diatur"}</p>
                        </div>
                    </OrganizerSurface>

                    <OrganizerSurface>
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 text-(--accent-primary)" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">CTA consistency</p>
                                <p className="text-sm leading-6 text-(--text-secondary)">
                                    Semua aksi utama kini diarahkan ke simpan perubahan, sementara navigasi balik diperlakukan sebagai aksi sekunder.
                                </p>
                            </div>
                        </div>
                    </OrganizerSurface>

                    <OrganizerSurface>
                        <div className="flex items-start gap-3">
                            <ImageIcon className="mt-0.5 h-5 w-5 text-(--accent-primary)" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">Media guidance</p>
                                <p className="text-sm leading-6 text-(--text-secondary)">
                                    Poster dan banner tetap memakai uploader yang sama untuk menjaga integrasi storage tetap aman.
                                </p>
                            </div>
                        </div>
                    </OrganizerSurface>
                </OrganizerWorkflowSidebar>
            </form>
        </div>
    );
}
