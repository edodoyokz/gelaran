"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Building2,
    Globe,
    Instagram,
    Twitter,
    Loader2,
    CheckCircle,
    AlertCircle,
    Facebook,
    Save,
    ImageIcon,
} from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

interface OrganizerProfile {
    id: string;
    organizationName: string;
    organizationSlug: string;
    organizationLogo: string | null;
    organizationBanner: string | null;
    organizationDescription: string | null;
    websiteUrl: string | null;
    socialFacebook: string | null;
    socialInstagram: string | null;
    socialTwitter: string | null;
    socialTiktok: string | null;
    isVerified: boolean;
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
}

interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
}

export default function OrganizerSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [user, setUser] = useState<UserData | null>(null);
    const [profile, setProfile] = useState<OrganizerProfile | null>(null);

    const [organizationName, setOrganizationName] = useState("");
    const [organizationDescription, setOrganizationDescription] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [socialFacebook, setSocialFacebook] = useState("");
    const [socialInstagram, setSocialInstagram] = useState("");
    const [socialTwitter, setSocialTwitter] = useState("");
    const [socialTiktok, setSocialTiktok] = useState("");
    const [organizationLogo, setOrganizationLogo] = useState("");
    const [organizationBanner, setOrganizationBanner] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/organizer/settings");
                const data = await res.json();

                if (!data.success) {
                    setError(data.error || "Gagal memuat profil");
                    return;
                }

                setUser(data.data.user);
                setProfile(data.data.profile);

                const p = data.data.profile;
                setOrganizationName(p.organizationName || "");
                setOrganizationDescription(p.organizationDescription || "");
                setWebsiteUrl(p.websiteUrl || "");
                setSocialFacebook(p.socialFacebook || "");
                setSocialInstagram(p.socialInstagram || "");
                setSocialTwitter(p.socialTwitter || "");
                setSocialTiktok(p.socialTiktok || "");
                setOrganizationLogo(p.organizationLogo || "");
                setOrganizationBanner(p.organizationBanner || "");
            } catch {
                setError("Terjadi kesalahan saat memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            setIsSaving(true);
            const res = await fetch("/api/organizer/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationName,
                    organizationDescription,
                    websiteUrl,
                    socialFacebook,
                    socialInstagram,
                    socialTwitter,
                    socialTiktok,
                    organizationLogo,
                    organizationBanner,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || "Gagal menyimpan perubahan");
                return;
            }

            setProfile(data.data);
            setSuccess("Profil berhasil diperbarui!");

            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError("Terjadi kesalahan saat menyimpan");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat pengaturan...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error}</p>
                    <Link href="/organizer" className="text-indigo-600 hover:text-indigo-500">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
                    <p className="text-gray-600">Kelola informasi organisasi Anda</p>
                </div>
            </header>

            <main className="p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <p className="text-green-700">{success}</p>
                        </div>
                    )}

                    {error && profile && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Informasi Organisasi
                                </h2>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label htmlFor="input-org-name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Organisasi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="input-org-name"
                                        value={organizationName}
                                        onChange={(e) => setOrganizationName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Nama organisasi atau perusahaan"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="input-org-slug" className="block text-sm font-medium text-gray-700 mb-1">
                                        URL Profil
                                    </label>
                                    <div className="flex items-center">
                                        <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                                            bsc.id/o/
                                        </span>
                                        <input
                                            type="text"
                                            id="input-org-slug"
                                            value={profile?.organizationSlug || ""}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg bg-gray-50 text-gray-500"
                                            disabled
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Slug tidak dapat diubah</p>
                                </div>

                                <div>
                                    <label htmlFor="input-org-desc" className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        id="input-org-desc"
                                        value={organizationDescription}
                                        onChange={(e) => setOrganizationDescription(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        placeholder="Deskripsi singkat tentang organisasi Anda"
                                        maxLength={1000}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">{organizationDescription.length}/1000 karakter</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-gray-500" />
                                    Logo & Banner
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <ImageUploadField
                                    label="Logo Organisasi"
                                    value={organizationLogo}
                                    onChange={setOrganizationLogo}
                                    bucket="organizers"
                                    folder="logos"
                                    aspectRatio="1/1"
                                    maxSizeMB={2}
                                />
                                <ImageUploadField
                                    label="Banner Organisasi"
                                    value={organizationBanner}
                                    onChange={setOrganizationBanner}
                                    bucket="organizers"
                                    folder="banners"
                                    aspectRatio="16/5"
                                    maxSizeMB={5}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-gray-500" />
                                    Website & Sosial Media
                                </h2>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label htmlFor="input-website" className="block text-sm font-medium text-gray-700 mb-1">
                                        Website
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="url"
                                            id="input-website"
                                            value={websiteUrl}
                                            onChange={(e) => setWebsiteUrl(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="input-facebook" className="block text-sm font-medium text-gray-700 mb-1">
                                            Facebook
                                        </label>
                                        <div className="relative">
                                            <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="input-facebook"
                                                value={socialFacebook}
                                                onChange={(e) => setSocialFacebook(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="input-instagram" className="block text-sm font-medium text-gray-700 mb-1">
                                            Instagram
                                        </label>
                                        <div className="relative">
                                            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="input-instagram"
                                                value={socialInstagram}
                                                onChange={(e) => setSocialInstagram(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="@username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="input-twitter" className="block text-sm font-medium text-gray-700 mb-1">
                                            Twitter / X
                                        </label>
                                        <div className="relative">
                                            <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="input-twitter"
                                                value={socialTwitter}
                                                onChange={(e) => setSocialTwitter(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="@username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="input-tiktok" className="block text-sm font-medium text-gray-700 mb-1">
                                            TikTok
                                        </label>
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <title>TikTok</title>
                                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                            </svg>
                                            <input
                                                type="text"
                                                id="input-tiktok"
                                                value={socialTiktok}
                                                onChange={(e) => setSocialTiktok(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="@username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {profile && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b">
                                    <h2 className="text-lg font-semibold text-gray-900">Status Verifikasi</h2>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            profile.isVerified 
                                                ? "bg-green-100" 
                                                : profile.verificationStatus === "PENDING"
                                                    ? "bg-yellow-100"
                                                    : "bg-gray-100"
                                        }`}>
                                            {profile.isVerified ? (
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                            ) : (
                                                <AlertCircle className={`h-6 w-6 ${
                                                    profile.verificationStatus === "PENDING" 
                                                        ? "text-yellow-600" 
                                                        : "text-gray-400"
                                                }`} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {profile.isVerified 
                                                    ? "Terverifikasi" 
                                                    : profile.verificationStatus === "PENDING"
                                                        ? "Menunggu Verifikasi"
                                                        : "Belum Terverifikasi"
                                                }
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {profile.isVerified 
                                                    ? "Akun Anda telah diverifikasi dan dapat mempublikasikan event."
                                                    : "Lengkapi profil untuk mengajukan verifikasi."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4">
                            <Link
                                href="/organizer"
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Save className="h-5 w-5" />
                                )}
                                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
