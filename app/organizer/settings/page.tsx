"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    AlertCircle,
    CheckCircle,
    Facebook,
    Globe,
    ImageIcon,
    Instagram,
    Loader2,
    Save,
    Twitter,
} from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import {
    OrganizerPanel,
    OrganizerStatusBadge,
    OrganizerWorkspaceHeader,
} from "@/components/organizer/organizer-workspace-primitives";

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

    const [_user, setUser] = useState<UserData | null>(null);
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
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-(--accent-primary)" />
                    <p className="text-(--text-muted)">Memuat pengaturan...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                    <p className="mb-2 font-medium text-foreground">{error}</p>
                    <Link href="/organizer" className="text-(--accent-primary) hover:text-indigo-500">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <OrganizerWorkspaceHeader
                title="Profil organizer"
                description="Kelola identitas brand, media, dan kanal sosial organizer dalam panel yang lebih terstruktur."
                actions={
                    <button
                        type="submit"
                        form="organizer-settings-form"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? "Menyimpan..." : "Simpan perubahan"}
                    </button>
                }
                meta={
                    profile ? (
                        <div className="flex flex-wrap items-center gap-2 text-sm text-(--text-secondary)">
                            <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1 font-medium text-foreground">
                                bsc.id/o/{profile.organizationSlug}
                            </span>
                            {profile.isVerified ? (
                                <OrganizerStatusBadge tone="success">Terverifikasi</OrganizerStatusBadge>
                            ) : profile.verificationStatus === "PENDING" ? (
                                <OrganizerStatusBadge tone="warning">Menunggu verifikasi</OrganizerStatusBadge>
                            ) : (
                                <OrganizerStatusBadge tone="default">Belum terverifikasi</OrganizerStatusBadge>
                            )}
                        </div>
                    ) : null
                }
            />

            {success ? (
                <div className="flex items-center gap-3 rounded-[1.25rem] border border-[rgba(19,135,108,0.22)] bg-(--success-bg) px-4 py-3 text-(--success-text)">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{success}</p>
                </div>
            ) : null}

            {error && profile ? (
                <div className="flex items-center gap-3 rounded-[1.25rem] border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-[rgb(185,28,28)]">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            ) : null}

            <form id="organizer-settings-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <OrganizerPanel title="Informasi organisasi" description="Nama brand, slug profil, dan deskripsi utama yang tampil pada profil organizer.">
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="input-org-name" className="mb-1 block text-sm font-medium text-(--text-secondary)">
                                    Nama organisasi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="input-org-name"
                                    value={organizationName}
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                    className="w-full rounded-xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none transition-colors focus:border-(--accent-primary)"
                                    placeholder="Nama organisasi atau perusahaan"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="input-org-slug" className="mb-1 block text-sm font-medium text-(--text-secondary)">
                                    URL profil
                                </label>
                                <div className="flex items-center overflow-hidden rounded-xl border border-(--border)">
                                    <span className="bg-(--surface) px-4 py-3 text-sm text-(--text-muted)">bsc.id/o/</span>
                                    <input
                                        id="input-org-slug"
                                        value={profile?.organizationSlug || ""}
                                        disabled
                                        className="w-full bg-(--surface-elevated) px-4 py-3 text-sm text-(--text-muted) outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="input-org-desc" className="mb-1 block text-sm font-medium text-(--text-secondary)">
                                    Deskripsi
                                </label>
                                <textarea
                                    id="input-org-desc"
                                    value={organizationDescription}
                                    onChange={(e) => setOrganizationDescription(e.target.value)}
                                    rows={5}
                                    className="w-full rounded-xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none transition-colors focus:border-(--accent-primary)"
                                    placeholder="Deskripsi singkat tentang organisasi Anda"
                                    maxLength={1000}
                                />
                                <p className="mt-1 text-xs text-(--text-muted)">{organizationDescription.length}/1000 karakter</p>
                            </div>
                        </div>
                    </OrganizerPanel>

                    <OrganizerPanel title="Status verifikasi" description="Ringkasan kesiapan akun organizer untuk publikasi event.">
                        {profile ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 rounded-[1.25rem] border border-(--border) bg-(--surface-elevated) p-4">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-(--surface)">
                                        {profile.isVerified ? (
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-6 w-6 text-(--text-muted)" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground">
                                            {profile.isVerified
                                                ? "Akun terverifikasi"
                                                : profile.verificationStatus === "PENDING"
                                                    ? "Verifikasi sedang diproses"
                                                    : "Akun belum terverifikasi"}
                                        </p>
                                        <p className="text-sm leading-6 text-(--text-secondary)">
                                            {profile.isVerified
                                                ? "Organizer dapat mempublikasikan event dengan status verifikasi aktif."
                                                : "Lengkapi identitas organizer dan aset visual untuk meningkatkan kesiapan verifikasi."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.isVerified ? (
                                        <OrganizerStatusBadge tone="success">Verified organizer</OrganizerStatusBadge>
                                    ) : profile.verificationStatus === "PENDING" ? (
                                        <OrganizerStatusBadge tone="warning">Pending review</OrganizerStatusBadge>
                                    ) : (
                                        <OrganizerStatusBadge tone="default">Perlu dilengkapi</OrganizerStatusBadge>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </OrganizerPanel>
                </div>

                <OrganizerPanel title="Logo & banner" description="Asset visual organizer untuk shell, profil publik, dan area promosi.">
                    <div className="space-y-6">
                        <ImageUploadField
                            label="Logo organisasi"
                            value={organizationLogo}
                            onChange={setOrganizationLogo}
                            bucket="organizers"
                            folder="logos"
                            aspectRatio="1/1"
                            maxSizeMB={2}
                        />
                        <ImageUploadField
                            label="Banner organisasi"
                            value={organizationBanner}
                            onChange={setOrganizationBanner}
                            bucket="organizers"
                            folder="banners"
                            aspectRatio="16/5"
                            maxSizeMB={5}
                        />
                    </div>
                </OrganizerPanel>

                <OrganizerPanel title="Website & sosial media" description="Kanal publik untuk membangun kredibilitas organizer dan traffic event.">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label htmlFor="input-website" className="mb-1 block text-sm font-medium text-(--text-secondary)">
                                Website
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-muted)" />
                                <input
                                    id="input-website"
                                    type="url"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    className="w-full rounded-xl border border-(--border) bg-(--surface-elevated) py-3 pl-12 pr-4 text-foreground outline-none transition-colors focus:border-(--accent-primary)"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        <SocialInput id="input-facebook" label="Facebook" value={socialFacebook} onChange={setSocialFacebook} icon={<Facebook className="h-5 w-5" />} placeholder="username" />
                        <SocialInput id="input-instagram" label="Instagram" value={socialInstagram} onChange={setSocialInstagram} icon={<Instagram className="h-5 w-5" />} placeholder="@username" />
                        <SocialInput id="input-twitter" label="Twitter / X" value={socialTwitter} onChange={setSocialTwitter} icon={<Twitter className="h-5 w-5" />} placeholder="@username" />
                        <SocialInput id="input-tiktok" label="TikTok" value={socialTiktok} onChange={setSocialTiktok} icon={<ImageIcon className="h-5 w-5" />} placeholder="@username" />
                    </div>
                </OrganizerPanel>

                <div className="flex flex-wrap justify-end gap-3">
                    <Link
                        href="/organizer"
                        className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-elevated)"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? "Menyimpan..." : "Simpan perubahan"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function SocialInput({
    id,
    label,
    value,
    onChange,
    icon,
    placeholder,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon: React.ReactNode;
    placeholder: string;
}) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-(--text-secondary)">
                {label}
            </label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)">{icon}</span>
                <input
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-xl border border-(--border) bg-(--surface-elevated) py-3 pl-12 pr-4 text-foreground outline-none transition-colors focus:border-(--accent-primary)"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
