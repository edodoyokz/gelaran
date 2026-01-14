"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

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
                if (data.error && typeof data.error === 'object' && data.error.errors) {
                    const firstError = Object.values(data.error.errors)[0] as string[];
                    throw new Error(firstError[0] || "Validasi gagal");
                }
                throw new Error(data.error || "Gagal menyimpan perubahan");
            }

            router.push(`/organizer/events/${eventId}`);
            router.refresh();
        } catch (err: any) {
            setFormError(err.message || "Terjadi kesalahan saat menyimpan");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat data event...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error}</p>
                    <Link href="/organizer/events" className="text-indigo-600 hover:text-indigo-500">
                        Kembali ke daftar event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-12">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={`/organizer/events/${eventId}`}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Edit Event</h1>
                            <p className="text-sm text-gray-500">Perbarui informasi event Anda</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-600">{formError}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Informasi Dasar</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Event <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow"
                                    placeholder="Contoh: Konser Musik Meriah 2024"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi Singkat
                                </label>
                                <textarea
                                    id="shortDescription"
                                    rows={2}
                                    value={form.shortDescription}
                                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow"
                                    placeholder="Ringkasan singkat tentang event Anda (maks 200 karakter)"
                                    maxLength={200}
                                />
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                    {form.shortDescription.length}/200
                                </p>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi Lengkap <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    rows={8}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow"
                                    placeholder="Jelaskan detail event Anda selengkap mungkin..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Media</h2>
                        </div>
                        <div className="p-6 space-y-8">
                            <ImageUploadField
                                label="Poster Event"
                                value={form.posterImage}
                                onChange={(url) => setForm({ ...form, posterImage: url })}
                                bucket="events"
                                folder={`${eventId}/poster`}
                                aspectRatio="2/3"
                            />

                            <ImageUploadField
                                label="Banner Event"
                                value={form.bannerImage}
                                onChange={(url) => setForm({ ...form, bannerImage: url })}
                                bucket="events"
                                folder={`${eventId}/banner`}
                                aspectRatio="16/9"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Tipe & Lokasi</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipe Event <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="eventType"
                                    value={form.eventType}
                                    onChange={(e) => setForm({ ...form, eventType: e.target.value as "OFFLINE" | "ONLINE" | "HYBRID" })}
                                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow"
                                >
                                    <option value="OFFLINE">Offline (Tatap Muka)</option>
                                    <option value="ONLINE">Online (Daring)</option>
                                    <option value="HYBRID">Hybrid (Offline & Online)</option>
                                </select>
                            </div>

                            {(form.eventType === "ONLINE" || form.eventType === "HYBRID") && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label htmlFor="onlineMeetingUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                        Link Meeting <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        id="onlineMeetingUrl"
                                        value={form.onlineMeetingUrl}
                                        onChange={(e) => setForm({ ...form, onlineMeetingUrl: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow"
                                        placeholder="https://zoom.us/j/..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Link meeting untuk peserta online
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Kebijakan</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-1">
                                    Syarat & Ketentuan
                                </label>
                                <textarea
                                    id="termsAndConditions"
                                    rows={4}
                                    value={form.termsAndConditions}
                                    onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow"
                                    placeholder="Tuliskan syarat dan ketentuan untuk peserta..."
                                />
                            </div>

                            <div>
                                <label htmlFor="refundPolicy" className="block text-sm font-medium text-gray-700 mb-1">
                                    Kebijakan Pengembalian Dana (Refund)
                                </label>
                                <textarea
                                    id="refundPolicy"
                                    rows={4}
                                    value={form.refundPolicy}
                                    onChange={(e) => setForm({ ...form, refundPolicy: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow"
                                    placeholder="Jelaskan kebijakan refund jika ada..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 sticky bottom-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border shadow-lg border-gray-200">
                        <Link
                            href={`/organizer/events/${eventId}`}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
