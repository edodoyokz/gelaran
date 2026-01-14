"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Loader2,
    AlertCircle,
    User,
    Mail,
    Phone,
    Calendar,
    Building2,
    CreditCard,
    Ticket,
    Star,
    Heart,
    Shield,
    CheckCircle,
    XCircle,
    Ban,
    UserCheck,
    ExternalLink,
    Clock,
    Globe,
    Instagram,
    Twitter,
    Facebook,
    ChevronRight,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useToast } from "@/components/ui/toast-provider";

interface CustomerProfile {
    id: string;
    birthDate: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
}

interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    isPrimary: boolean;
    isVerified: boolean;
}

interface Payout {
    id: string;
    payoutCode: string;
    amount: string;
    status: string;
    createdAt: string;
}

interface OrganizerProfile {
    id: string;
    organizationName: string;
    organizationSlug: string;
    organizationLogo: string | null;
    organizationDescription: string | null;
    websiteUrl: string | null;
    socialFacebook: string | null;
    socialInstagram: string | null;
    socialTwitter: string | null;
    socialTiktok: string | null;
    walletBalance: string;
    totalEarned: string;
    totalWithdrawn: string;
    isVerified: boolean;
    verificationStatus: string;
    bankAccounts: BankAccount[];
    payouts: Payout[];
}

interface UserEvent {
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: string;
    _count: { bookings: number };
}

interface UserBooking {
    id: string;
    bookingCode: string;
    status: string;
    totalAmount: string;
    createdAt: string;
    event: {
        id: string;
        title: string;
        slug: string;
    };
}

interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    locale: string;
    timezone: string;
    lastLoginAt: string | null;
    createdAt: string;
    deletedAt: string | null;
    customerProfile: CustomerProfile | null;
    organizerProfile: OrganizerProfile | null;
    bookings: UserBooking[];
    events: UserEvent[];
    _count: {
        bookings: number;
        events: number;
        reviews: number;
        wishlists: number;
    };
}

const ROLE_COLORS: Record<string, string> = {
    CUSTOMER: "bg-gray-100 text-gray-700",
    ORGANIZER: "bg-purple-100 text-purple-700",
    ADMIN: "bg-red-100 text-red-700",
    SUPER_ADMIN: "bg-red-100 text-red-700",
};

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    ENDED: "bg-gray-100 text-gray-700",
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    AWAITING_PAYMENT: "bg-orange-100 text-orange-700",
    PAID: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-purple-100 text-purple-700",
    EXPIRED: "bg-gray-100 text-gray-700",
};

export default function AdminUserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const { showToast } = useToast();
    const [userId, setUserId] = useState<string>("");
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "events" | "organizer">("overview");

    useEffect(() => {
        params.then((p) => setUserId(p.id));
    }, [params]);

    const fetchUser = useCallback(async () => {
        if (!userId) return;

        try {
            setIsLoading(true);
            const res = await fetch(`/api/admin/users/${userId}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/users");
                    return;
                }
                if (res.status === 403) {
                    router.push("/admin");
                    return;
                }
                setError(data.error?.message || "Failed to load user");
                return;
            }

            if (data.success) {
                setUserData(data.data);
            }
        } catch {
            setError("Failed to load user");
        } finally {
            setIsLoading(false);
        }
    }, [userId, router]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleAction = async (action: "verify" | "suspend" | "activate" | "changeRole", value?: string) => {
        if (!userData) return;

        try {
            setActionLoading(true);
            const body: Record<string, unknown> = {};

            switch (action) {
                case "verify":
                    body.isVerified = true;
                    break;
                case "suspend":
                    body.status = "suspended";
                    break;
                case "activate":
                    body.status = "active";
                    break;
                case "changeRole":
                    body.role = value;
                    break;
            }

            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Action failed", "error");
                return;
            }

            showToast("Action completed", "success");
            fetchUser();
        } catch {
            showToast("Action failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (dateStr: string): string => {
        return new Date(dateStr).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: string | number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error || "User not found"}</p>
                    <Link href="/admin/users" className="text-indigo-600 hover:text-indigo-500">
                        Back to Users
                    </Link>
                </div>
            </div>
        );
    }

    const isSuspended = !!userData.deletedAt;

    return (
        <>
            <AdminHeader 
                title="User Details" 
                subtitle={userData.email}
                backHref="/admin/users"
                actions={
                    userData.role !== "SUPER_ADMIN" && (
                        <div className="flex items-center gap-2">
                            {!userData.isVerified && !isSuspended && (
                                <button
                                    type="button"
                                    onClick={() => handleAction("verify")}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                    <UserCheck className="h-4 w-4" />
                                    Verify User
                                </button>
                            )}
                            {isSuspended ? (
                                <button
                                    type="button"
                                    onClick={() => handleAction("activate")}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Activate
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleAction("suspend")}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                >
                                    <Ban className="h-4 w-4" />
                                    Suspend
                                </button>
                            )}
                        </div>
                    )
                }
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 text-center border-b">
                                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                                    {userData.avatarUrl ? (
                                        <img
                                            src={userData.avatarUrl}
                                            alt=""
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-12 w-12 text-gray-400" />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{userData.name}</h2>
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${ROLE_COLORS[userData.role]}`}>
                                        {userData.role === "SUPER_ADMIN" && <Shield className="h-3 w-3" />}
                                        {userData.role}
                                    </span>
                                    {isSuspended ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                            <Ban className="h-3 w-3" />
                                            Suspended
                                        </span>
                                    ) : userData.isVerified ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                            <CheckCircle className="h-3 w-3" />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                            <XCircle className="h-3 w-3" />
                                            Unverified
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-700">{userData.email}</span>
                                </div>
                                {userData.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-700">{userData.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-700">Joined {formatDate(userData.createdAt)}</span>
                                </div>
                                {userData.lastLoginAt && (
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-700">Last login {formatDateTime(userData.lastLoginAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Activity Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Ticket className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-gray-900">{userData._count.bookings}</p>
                                    <p className="text-xs text-gray-500">Bookings</p>
                                </div>
                                {userData.role === "ORGANIZER" && (
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-gray-900">{userData._count.events}</p>
                                        <p className="text-xs text-gray-500">Events</p>
                                    </div>
                                )}
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-gray-900">{userData._count.reviews}</p>
                                    <p className="text-xs text-gray-500">Reviews</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-gray-900">{userData._count.wishlists}</p>
                                    <p className="text-xs text-gray-500">Wishlist</p>
                                </div>
                            </div>
                        </div>

                        {userData.customerProfile && (
                            <div className="bg-white rounded-xl shadow-sm p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Customer Profile</h3>
                                <div className="space-y-2 text-sm">
                                    {userData.customerProfile.gender && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Gender</span>
                                            <span className="text-gray-900 capitalize">{userData.customerProfile.gender.toLowerCase()}</span>
                                        </div>
                                    )}
                                    {userData.customerProfile.birthDate && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Birth Date</span>
                                            <span className="text-gray-900">{formatDate(userData.customerProfile.birthDate)}</span>
                                        </div>
                                    )}
                                    {userData.customerProfile.city && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Location</span>
                                            <span className="text-gray-900">{userData.customerProfile.city}, {userData.customerProfile.province}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="border-b overflow-x-auto">
                                <div className="flex">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("overview")}
                                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === "overview"
                                                ? "border-indigo-600 text-indigo-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("bookings")}
                                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === "bookings"
                                                ? "border-indigo-600 text-indigo-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        Bookings ({userData._count.bookings})
                                    </button>
                                    {userData.role === "ORGANIZER" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("events")}
                                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                                    activeTab === "events"
                                                        ? "border-indigo-600 text-indigo-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                                }`}
                                            >
                                                Events ({userData._count.events})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("organizer")}
                                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                                    activeTab === "organizer"
                                                        ? "border-indigo-600 text-indigo-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                                }`}
                                            >
                                                Organizer Profile
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                {activeTab === "overview" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-500 mb-1">User ID</p>
                                                    <p className="text-sm font-mono text-gray-900">{userData.id}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-500 mb-1">Locale / Timezone</p>
                                                    <p className="text-sm text-gray-900">{userData.locale} / {userData.timezone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {userData.role !== "SUPER_ADMIN" && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Role</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {["CUSTOMER", "ORGANIZER", "ADMIN"].map((role) => (
                                                        <button
                                                            key={role}
                                                            type="button"
                                                            onClick={() => handleAction("changeRole", role)}
                                                            disabled={actionLoading || userData.role === role}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                                                userData.role === role
                                                                    ? "bg-indigo-600 text-white"
                                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                            }`}
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {userData.bookings.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab("bookings")}
                                                        className="text-sm text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        View all
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {userData.bookings.slice(0, 3).map((booking) => (
                                                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{booking.event.title}</p>
                                                                <p className="text-sm text-gray-500">{booking.bookingCode}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${BOOKING_STATUS_COLORS[booking.status]}`}>
                                                                    {booking.status}
                                                                </span>
                                                                <p className="text-sm text-gray-900 mt-1">{formatCurrency(booking.totalAmount)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "bookings" && (
                                    <div>
                                        {userData.bookings.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500">No bookings yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {userData.bookings.map((booking) => (
                                                    <Link
                                                        key={booking.id}
                                                        href={`/admin/bookings/${booking.id}`}
                                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-900">{booking.event.title}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-sm font-mono text-gray-500">{booking.bookingCode}</span>
                                                                <span className="text-gray-300">•</span>
                                                                <span className="text-sm text-gray-500">{formatDate(booking.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${BOOKING_STATUS_COLORS[booking.status]}`}>
                                                                    {booking.status}
                                                                </span>
                                                                <p className="text-sm font-medium text-gray-900 mt-1">{formatCurrency(booking.totalAmount)}</p>
                                                            </div>
                                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "events" && userData.role === "ORGANIZER" && (
                                    <div>
                                        {userData.events.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500">No events created</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {userData.events.map((event) => (
                                                    <Link
                                                        key={event.id}
                                                        href={`/admin/events/${event.id}`}
                                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-900">{event.title}</p>
                                                            <p className="text-sm text-gray-500">{formatDate(event.createdAt)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[event.status]}`}>
                                                                    {event.status.replace(/_/g, " ")}
                                                                </span>
                                                                <p className="text-sm text-gray-500 mt-1">{event._count.bookings} bookings</p>
                                                            </div>
                                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "organizer" && userData.organizerProfile && (
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                                                {userData.organizerProfile.organizationLogo ? (
                                                    <img
                                                        src={userData.organizerProfile.organizationLogo}
                                                        alt=""
                                                        className="w-16 h-16 object-cover"
                                                    />
                                                ) : (
                                                    <Building2 className="h-8 w-8 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900">{userData.organizerProfile.organizationName}</h3>
                                                <p className="text-sm text-gray-500">@{userData.organizerProfile.organizationSlug}</p>
                                                {userData.organizerProfile.organizationDescription && (
                                                    <p className="text-sm text-gray-600 mt-2">{userData.organizerProfile.organizationDescription}</p>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                userData.organizerProfile.verificationStatus === "APPROVED"
                                                    ? "bg-green-100 text-green-700"
                                                    : userData.organizerProfile.verificationStatus === "REJECTED"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {userData.organizerProfile.verificationStatus}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-green-50 rounded-lg text-center">
                                                <p className="text-sm text-green-600 mb-1">Wallet Balance</p>
                                                <p className="text-lg font-bold text-green-700">{formatCurrency(userData.organizerProfile.walletBalance)}</p>
                                            </div>
                                            <div className="p-4 bg-blue-50 rounded-lg text-center">
                                                <p className="text-sm text-blue-600 mb-1">Total Earned</p>
                                                <p className="text-lg font-bold text-blue-700">{formatCurrency(userData.organizerProfile.totalEarned)}</p>
                                            </div>
                                            <div className="p-4 bg-purple-50 rounded-lg text-center">
                                                <p className="text-sm text-purple-600 mb-1">Total Withdrawn</p>
                                                <p className="text-lg font-bold text-purple-700">{formatCurrency(userData.organizerProfile.totalWithdrawn)}</p>
                                            </div>
                                        </div>

                                        {(userData.organizerProfile.websiteUrl || userData.organizerProfile.socialInstagram || userData.organizerProfile.socialFacebook || userData.organizerProfile.socialTwitter) && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-3">Social Links</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {userData.organizerProfile.websiteUrl && (
                                                        <a
                                                            href={userData.organizerProfile.websiteUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
                                                        >
                                                            <Globe className="h-4 w-4" />
                                                            Website
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                    {userData.organizerProfile.socialInstagram && (
                                                        <a
                                                            href={`https://instagram.com/${userData.organizerProfile.socialInstagram}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
                                                        >
                                                            <Instagram className="h-4 w-4" />
                                                            @{userData.organizerProfile.socialInstagram}
                                                        </a>
                                                    )}
                                                    {userData.organizerProfile.socialFacebook && (
                                                        <a
                                                            href={userData.organizerProfile.socialFacebook}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
                                                        >
                                                            <Facebook className="h-4 w-4" />
                                                            Facebook
                                                        </a>
                                                    )}
                                                    {userData.organizerProfile.socialTwitter && (
                                                        <a
                                                            href={`https://twitter.com/${userData.organizerProfile.socialTwitter}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
                                                        >
                                                            <Twitter className="h-4 w-4" />
                                                            @{userData.organizerProfile.socialTwitter}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {userData.organizerProfile.bankAccounts.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-3">Bank Accounts</h4>
                                                <div className="space-y-2">
                                                    {userData.organizerProfile.bankAccounts.map((bank) => (
                                                        <div key={bank.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <CreditCard className="h-5 w-5 text-gray-400" />
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{bank.bankName}</p>
                                                                    <p className="text-sm text-gray-500">{bank.accountNumber} - {bank.accountHolderName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {bank.isPrimary && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">Primary</span>
                                                                )}
                                                                {bank.isVerified && (
                                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {userData.organizerProfile.payouts.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-3">Recent Payouts</h4>
                                                <div className="space-y-2">
                                                    {userData.organizerProfile.payouts.map((payout) => (
                                                        <div key={payout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <div>
                                                                <p className="font-mono text-sm text-gray-700">{payout.payoutCode}</p>
                                                                <p className="text-xs text-gray-500">{formatDate(payout.createdAt)}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-medium text-gray-900">{formatCurrency(payout.amount)}</p>
                                                                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                                                    payout.status === "COMPLETED"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : payout.status === "REJECTED"
                                                                            ? "bg-red-100 text-red-700"
                                                                            : "bg-yellow-100 text-yellow-700"
                                                                }`}>
                                                                    {payout.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
