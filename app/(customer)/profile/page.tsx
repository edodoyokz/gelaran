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
    ChevronRight,
} from "lucide-react";
import { uploadImage } from "@/lib/storage/upload";

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
    "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta",
    "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur",
    "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah",
    "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung",
    "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara",
    "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat",
    "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah",
    "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat",
    "Sumatera Selatan", "Sumatera Utara",
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
                        ? new Date(p.customerProfile.birthDate).toISOString().split("T")[0]
                        : "",
                    gender: p.customerProfile?.gender || "",
                    address: p.customerProfile?.address || "",
                    city: p.customerProfile?.city || "",
                    province: p.customerProfile?.province || "",
                    postalCode: p.customerProfile?.postalCode || "",
                    locale: p.locale || "id",
                    timezone: p.timezone || "Asia/Jakarta",
                });
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
            const errorMessage = err instanceof Error ? err.message : "Gagal memperbarui profil";
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
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Memuat profil...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center card p-8 max-w-md">
                    <div className="w-16 h-16 bg-[var(--error-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-[var(--error)]" />
                    </div>
                    <p className="text-[var(--text-primary)] font-bold text-lg mb-2">{error}</p>
                    <Link href="/dashboard" className="text-[var(--accent-primary)] hover:underline">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {success && (
                <div className="p-4 bg-[var(--success-bg)] border border-[var(--success)]/20 rounded-xl flex items-center gap-3 animate-fade-in-down">
                    <CheckCircle className="h-5 w-5 text-[var(--success)] flex-shrink-0" />
                    <p className="text-[var(--success-text)]">{success}</p>
                </div>
            )}

            {error && profile && (
                <div className="p-4 bg-[var(--error-bg)] border border-[var(--error)]/20 rounded-xl flex items-center gap-3 animate-fade-in-down">
                    <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0" />
                    <p className="text-[var(--error-text)]">{error}</p>
                </div>
            )}

            <div className="card p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[var(--accent-gradient)] shadow-xl relative">
                            {profile?.avatarUrl ? (
                                <Image
                                    src={profile.avatarUrl}
                                    alt={profile.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white drop-shadow-md">
                                        {profile?.name.charAt(0).toUpperCase()}
                                    </span>
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
                            className="absolute -bottom-2 -right-2 p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
                        >
                            {isUploadingAvatar ? (
                                <Loader2 className="h-4 w-4 text-[var(--text-muted)] animate-spin" />
                            ) : (
                                <Camera className="h-4 w-4 text-[var(--text-muted)]" />
                            )}
                        </button>
                    </div>

                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{profile?.name}</h1>
                        <p className="text-[var(--text-muted)]">{profile?.email}</p>

                        <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                            {profile?.isVerified ? (
                                <span className="badge badge-success">
                                    <Shield className="h-3.5 w-3.5" />
                                    Terverifikasi
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--warning-bg)] text-[var(--warning-text)] rounded-full text-xs font-medium">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Belum Terverifikasi
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-full text-xs font-medium capitalize">
                                {profile?.role.toLowerCase().replace("_", " ")}
                            </span>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <Calendar className="h-4 w-4" />
                            <span>Anggota sejak {formatDate(profile?.createdAt || null)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <Clock className="h-4 w-4" />
                            <span>Login terakhir {formatDate(profile?.lastLoginAt || null)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:hidden">
                <Link href="/my-bookings" className="card card-hover p-4 flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Ticket className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-medium text-[var(--text-primary)] text-sm">Pesanan</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                </Link>
                <Link href="/wishlist" className="card card-hover p-4 flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-xl">
                        <Heart className="h-5 w-5 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-medium text-[var(--text-primary)] text-sm">Wishlist</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card overflow-hidden">
                    <div className="border-b border-[var(--border)] overflow-x-auto">
                        <div className="flex min-w-max">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.key
                                            ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
                                            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        {activeTab === "personal" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                        Nama Lengkap *
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
                                    <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                        Alamat Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            type="email"
                                            value={profile?.email || ""}
                                            disabled
                                            className="input bg-[var(--bg-tertiary)] text-[var(--text-muted)] pr-10"
                                        />
                                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                                    </div>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">Email tidak dapat diubah</p>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                        Nomor Telepon
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
                                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="birthDate" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                        Tanggal Lahir
                                    </label>
                                    <input
                                        id="birthDate"
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                        Jenis Kelamin
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
                        )}

                        {activeTab === "address" && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                        Alamat Jalan
                                    </label>
                                    <textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                        rows={2}
                                        className="input resize-none"
                                        placeholder="Masukkan alamat jalan kamu"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
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
                                        <label htmlFor="province" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
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
                                        <label htmlFor="postalCode" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                            Kode Pos
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
                        )}

                        {activeTab === "preferences" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="locale" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                        <Globe className="inline h-4 w-4 mr-1" />
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
                                    <label htmlFor="timezone" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                        <Clock className="inline h-4 w-4 mr-1" />
                                        Zona Waktu
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
                        )}
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                    <Link
                        href="/dashboard"
                        className="btn-secondary w-full sm:w-auto rounded-full py-3 sm:py-2.5 justify-center text-center"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary w-full sm:w-auto rounded-full py-3 sm:py-2.5 justify-center flex items-center gap-2 shadow-glow"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                Simpan Perubahan
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
