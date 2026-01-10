"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
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
} from "lucide-react";

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
    { value: "", label: "Select Gender" },
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHER", label: "Other" },
    { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const PROVINCE_OPTIONS = [
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Banten",
    "Bali",
    "Sumatera Utara",
    "Sumatera Selatan",
    "Kalimantan Timur",
    "Sulawesi Selatan",
];

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
                setError(data.error?.message || "Failed to load profile");
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
            setError("Failed to load profile");
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

            const data = await res.json();

            if (!data.success) {
                setError(data.error?.message || "Failed to update profile");
                return;
            }

            setSuccess("Profile updated successfully!");
            await fetchProfile();
        } catch {
            setError("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error}</p>
                    <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                {error && profile && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                                        {profile?.avatarUrl ? (
                                            <img
                                                src={profile.avatarUrl}
                                                alt={profile.name}
                                                className="w-24 h-24 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl font-bold text-white">
                                                {profile?.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute bottom-0 right-0 p-2 bg-white border rounded-full shadow-sm hover:bg-gray-50"
                                    >
                                        <Camera className="h-4 w-4 text-gray-600" />
                                    </button>
                                </div>

                                <h2 className="mt-4 text-xl font-bold text-gray-900">{profile?.name}</h2>
                                <p className="text-gray-500">{profile?.email}</p>

                                <div className="mt-4 flex justify-center gap-2">
                                    {profile?.isVerified ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                            <Shield className="h-4 w-4" />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                            <AlertCircle className="h-4 w-4" />
                                            Unverified
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize">
                                        {profile?.role.toLowerCase().replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-500">Member since</span>
                                    <span className="ml-auto text-gray-900">{formatDate(profile?.createdAt || null)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-500">Last login</span>
                                    <span className="ml-auto text-gray-900">{formatDate(profile?.lastLoginAt || null)}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t space-y-2">
                                <Link
                                    href="/my-bookings"
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-medium text-gray-900">My Bookings</span>
                                    <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                                </Link>
                                <Link
                                    href="/wishlist"
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-medium text-gray-900">Wishlist</span>
                                    <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-indigo-600" />
                                    Personal Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="email"
                                                type="email"
                                                value={profile?.email || ""}
                                                disabled
                                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                                            />
                                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="+62 812 3456 7890"
                                            />
                                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            Date of Birth
                                        </label>
                                        <input
                                            id="birthDate"
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={(e) => handleInputChange("birthDate", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender
                                        </label>
                                        <select
                                            id="gender"
                                            value={formData.gender}
                                            onChange={(e) => handleInputChange("gender", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {GENDER_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-indigo-600" />
                                    Address
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address
                                        </label>
                                        <textarea
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange("address", e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                            placeholder="Enter your street address"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <input
                                                id="city"
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => handleInputChange("city", e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="City"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                                                Province
                                            </label>
                                            <select
                                                id="province"
                                                value={formData.province}
                                                onChange={(e) => handleInputChange("province", e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">Select Province</option>
                                                {PROVINCE_OPTIONS.map((p) => (
                                                    <option key={p} value={p}>
                                                        {p}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                                Postal Code
                                            </label>
                                            <input
                                                id="postalCode"
                                                type="text"
                                                value={formData.postalCode}
                                                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="12345"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-indigo-600" />
                                    Preferences
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-1">
                                            Language
                                        </label>
                                        <select
                                            id="locale"
                                            value={formData.locale}
                                            onChange={(e) => handleInputChange("locale", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="id">Bahasa Indonesia</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Timezone
                                        </label>
                                        <select
                                            id="timezone"
                                            value={formData.timezone}
                                            onChange={(e) => handleInputChange("timezone", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Asia/Jakarta">WIB (Jakarta)</option>
                                            <option value="Asia/Makassar">WITA (Makassar)</option>
                                            <option value="Asia/Jayapura">WIT (Jayapura)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link
                                    href="/"
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
