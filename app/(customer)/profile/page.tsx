"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Camera,
    Loader2,
    AlertCircle,
    CheckCircle,
    Shield,
    Globe,
    Clock,
    Settings,
    Ticket,
    Heart,
} from "lucide-react";
import { uploadImage } from "@/lib/storage/upload";
import {
    CustomerHero,
    CustomerInfoList,
    CustomerStatusBadge,
    DashboardSection,
} from "@/components/customer/customer-dashboard-primitives";

interface CustomerProfile {
    birthDate: string | null;
    gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | null;
    address: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    isVerified: boolean;
    locale: string;
    timezone: string;
    emailVerifiedAt: string | null;
    lastLoginAt: string | null;
    createdAt: string;
    customerProfile: CustomerProfile | null;
}

const GENDER_OPTIONS = [
    { value: "", label: "Pilih Jenis Kelamin" },
    { value: "MALE", label: "Laki-laki" },
    { value: "FEMALE", label: "Perempuan" },
    { value: "OTHER", label: "Lainnya" },
    { value: "PREFER_NOT_TO_SAY", label: "Tidak ingin menyebutkan" },
];

const PROVINCE_OPTIONS = [
    "Aceh",
    "Bali",
    "Banten",
    "Bengkulu",
    "DI Yogyakarta",
    "DKI Jakarta",
    "Gorontalo",
    "Jambi",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Kalimantan Barat",
    "Kalimantan Selatan",
    "Kalimantan Tengah",
    "Kalimantan Timur",
    "Kalimantan Utara",
    "Kepulauan Bangka Belitung",
    "Kepulauan Riau",
    "Lampung",
    "Maluku",
    "Maluku Utara",
    "Nusa Tenggara Barat",
    "Nusa Tenggara Timur",
    "Papua",
    "Papua Barat",
    "Riau",
    "Sulawesi Barat",
    "Sulawesi Selatan",
    "Sulawesi Tengah",
    "Sulawesi Tenggara",
    "Sulawesi Utara",
    "Sumatera Barat",
    "Sumatera Selatan",
    "Sumatera Utara",
];

type TabKey = "personal" | "address" | "preferences";

export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("personal");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        birthDate: "",
        gender: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        locale: "id",
        timezone: "Asia/Jakarta",
    });

    const fetchProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/profile");
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/profile");
                    return;
                }
                setError(data.error?.message || "Gagal memuat profil");
                return;
            }

            if (data.success) {
                const p = data.data as UserProfile;
                setProfile(p);
                setFormData({
                    name: p.name || "",
                    phone: p.phone || "",
                    birthDate: p.customerProfile?.birthDate
                        ? new Date(p.customerProfile.birthDate)
                            .toISOString()
                            .split("T")[0]
                        : "",
                    gender: p.customerProfile?.gender || "",
                    address: p.customerProfile?.address || "",
                    city: p.customerProfile?.city || "",
                    province: p.customerProfile?.province || "",
                    postalCode: p.customerProfile?.postalCode || "",
                    locale: p.locale || "id",
                    timezone: p.timezone || "Asia/Jakarta",
                });
                setError(null);
            }
        } catch {
            setError("Gagal memuat profil");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        window.scrollTo({ top: 0, behavior: "smooth" });

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone || null,
                    birthDate: formData.birthDate || null,
                    gender: formData.gender || null,
                    address: formData.address || null,
                    city: formData.city || null,
                    province: formData.province || null,
                    postalCode: formData.postalCode || null,
                    locale: formData.locale,
                    timezone: formData.timezone,
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok || !data?.success) {
                throw new Error(data?.error?.message || "Gagal memperbarui profil");
            }

            setSuccess("Profil berhasil diperbarui!");
            await fetchProfile();

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Gagal memperbarui profil";
            setError(errorMessage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            setError("Silakan unggah gambar yang valid (JPEG, PNG, atau WebP)");
            return;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            setError("Ukuran gambar harus kurang dari 2MB");
            return;
        }

        setIsUploadingAvatar(true);
        setError(null);

        try {
            const result = await uploadImage(file, "avatars", `user-${profile?.id}`);

            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatarUrl: result.url }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error?.message || "Gagal memperbarui avatar");
                return;
            }

            setSuccess("Avatar berhasil diperbarui!");
            await fetchProfile();
            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError("Gagal mengunggah avatar");
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const tabs: { key: TabKey; label: string; icon: typeof User }[] = [
        { key: "personal", label: "Pribadi", icon: User },
        { key: "address", label: "Alamat", icon: MapPin },
        { key: "preferences", label: "Preferensi", icon: Settings },
    ];

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-(--accent-primary) animate-spin mx-auto mb-4" />
                    <p className="text-(--text-muted)">Memuat profil...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <DashboardSection>
                <div className="flex min-h-[45vh] items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-(--error)" />
                        <p className="mb-4 text-lg font-semibold text-foreground">{error}</p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white"
                        >
                            Kembali ke dashboard
                        </Link>
                    </div>
                </div>
            </DashboardSection>
        );
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <CustomerHero
                eyebrow="Account settings"
                title="Profil & pengaturan"
                description="Perbarui identitas akun, alamat, dan preferensi personal agar pengalaman checkout, tiket, dan komunikasi event tetap relevan."
                meta={
                    <>
                        {profile?.isVerified ? (
                            <CustomerStatusBadge
                                label="Akun terverifikasi"
                                tone="success"
                                icon={Shield}
                            />
                        ) : (
                            <CustomerStatusBadge
                                label="Belum terverifikasi"
                                tone="warning"
                                icon={AlertCircle}
                            />
                        )}
                        <CustomerStatusBadge
                            label={`Member sejak ${formatDate(profile?.createdAt || null)}`}
                            tone="neutral"
                            icon={Calendar}
                        />
                    </>
                }
                actions={
                    <>
                        <Link
                            href="/my-bookings"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                        >
                            <Ticket className="h-4 w-4" />
                            Pesanan saya
                        </Link>
                        <Link
                            href="/wishlist"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow)"
                        >
                            <Heart className="h-4 w-4" />
                            Wishlist
                        </Link>
                    </>
                }
            />

            {success ? (
                <div className="rounded-2xl border border-[rgba(19,135,108,0.18)] bg-(--success-bg) p-4 text-(--success-text)">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <p>{success}</p>
                    </div>
                </div>
            ) : null}

            {error && profile ? (
                <div className="rounded-2xl border border-[rgba(198,40,40,0.16)] bg-(--error-bg) p-4 text-(--error-text)">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                </div>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
                <DashboardSection
                    title="Ringkasan akun"
                    description="Foto profil, status akun, dan informasi penting yang muncul di area customer Gelaran."
                    className="h-fit"
                >
                    <div className="space-y-6">
                        <div className="flex flex-col items-start gap-5 sm:flex-row">
                            <div className="relative">
                                <div className="relative h-28 w-28 overflow-hidden rounded-4xl bg-(--accent-gradient) shadow-(--shadow-glow)">
                                    {profile?.avatarUrl ? (
                                        <Image
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                                            {profile?.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    disabled={isUploadingAvatar}
                                    className="absolute -bottom-2 -right-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-(--border) bg-(--surface) text-(--text-secondary) shadow-(--shadow-sm) transition-colors hover:bg-(--surface-hover) disabled:opacity-50"
                                >
                                    {isUploadingAvatar ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Camera className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            <div className="min-w-0 flex-1 space-y-3">
                                <div>
                                    <h2 className="text-2xl font-semibold text-foreground">
                                        {profile?.name}
                                    </h2>
                                    <p className="text-(--text-secondary)">{profile?.email}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <CustomerStatusBadge
                                        label={profile?.role.toLowerCase().replace("_", " ") || "customer"}
                                        tone="accent"
                                        icon={User}
                                    />
                                    <CustomerStatusBadge
                                        label={profile?.phone || "Nomor belum ditambahkan"}
                                        tone="neutral"
                                        icon={Phone}
                                    />
                                </div>
                            </div>
                        </div>

                        <CustomerInfoList
                            items={[
                                {
                                    icon: Calendar,
                                    label: "Member sejak",
                                    value: formatDate(profile?.createdAt || null),
                                },
                                {
                                    icon: Clock,
                                    label: "Login terakhir",
                                    value: formatDate(profile?.lastLoginAt || null),
                                },
                                {
                                    icon: Mail,
                                    label: "Verifikasi email",
                                    value: profile?.emailVerifiedAt
                                        ? formatDate(profile.emailVerifiedAt)
                                        : "Belum diverifikasi",
                                },
                            ]}
                        />
                    </div>
                </DashboardSection>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <DashboardSection
                        title="Detail profil"
                        description="Edit data personal, alamat, dan preferensi yang mendukung pengalaman booking serta komunikasi event."
                    >
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${isActive
                                                    ? "bg-(--accent-gradient) text-white"
                                                    : "border border-(--border) bg-(--surface-elevated) text-(--text-secondary) hover:bg-(--surface-hover)"
                                                }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {activeTab === "personal" ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                            Nama lengkap *
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className="input"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                            Alamat email
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="email"
                                                type="email"
                                                value={profile?.email || ""}
                                                disabled
                                                className="input bg-(--bg-secondary) pr-10 text-(--text-muted)"
                                            />
                                            <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                                        </div>
                                        <p className="mt-1 text-xs text-(--text-muted)">
                                            Email tidak dapat diubah
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                            Nomor telepon
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                                className="input pr-10"
                                                placeholder="+62 812 3456 7890"
                                            />
                                            <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="birthDate" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                            Tanggal lahir
                                        </label>
                                        <input
                                            id="birthDate"
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={(e) => handleInputChange("birthDate", e.target.value)}
                                            className="input"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                            Jenis kelamin
                                        </label>
                                        <select
                                            id="gender"
                                            value={formData.gender}
                                            onChange={(e) => handleInputChange("gender", e.target.value)}
                                            className="input"
                                        >
                                            {GENDER_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ) : null}

                            {activeTab === "address" ? (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                            Alamat jalan
                                        </label>
                                        <textarea
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange("address", e.target.value)}
                                            rows={3}
                                            className="input resize-none"
                                            placeholder="Masukkan alamat jalan kamu"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                                Kota
                                            </label>
                                            <input
                                                id="city"
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => handleInputChange("city", e.target.value)}
                                                className="input"
                                                placeholder="Kota"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="province" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                                Provinsi
                                            </label>
                                            <select
                                                id="province"
                                                value={formData.province}
                                                onChange={(e) => handleInputChange("province", e.target.value)}
                                                className="input"
                                            >
                                                <option value="">Pilih Provinsi</option>
                                                {PROVINCE_OPTIONS.map((p) => (
                                                    <option key={p} value={p}>
                                                        {p}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="postalCode" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                                Kode pos
                                            </label>
                                            <input
                                                id="postalCode"
                                                type="text"
                                                value={formData.postalCode}
                                                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                                className="input"
                                                placeholder="12345"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {activeTab === "preferences" ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="locale" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                            <Globe className="mr-1 inline h-4 w-4" />
                                            Bahasa
                                        </label>
                                        <select
                                            id="locale"
                                            value={formData.locale}
                                            onChange={(e) => handleInputChange("locale", e.target.value)}
                                            className="input"
                                        >
                                            <option value="id">Bahasa Indonesia</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="timezone" className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                                            <Clock className="mr-1 inline h-4 w-4" />
                                            Zona waktu
                                        </label>
                                        <select
                                            id="timezone"
                                            value={formData.timezone}
                                            onChange={(e) => handleInputChange("timezone", e.target.value)}
                                            className="input"
                                        >
                                            <option value="Asia/Jakarta">WIB (Jakarta)</option>
                                            <option value="Asia/Makassar">WITA (Makassar)</option>
                                            <option value="Asia/Jayapura">WIT (Jayapura)</option>
                                        </select>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </DashboardSection>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--surface-hover)"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow) disabled:opacity-60"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Simpan perubahan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
