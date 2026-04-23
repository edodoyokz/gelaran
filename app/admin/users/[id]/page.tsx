"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { AdminWorkspacePage } from "@/components/admin/admin-workspace";
import { useToast } from "@/components/ui/toast-provider";
import { CommissionOverride } from "@/components/admin/CommissionOverride";

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
    CUSTOMER: "bg-(--bg-secondary) text-(--text-secondary)",
    ORGANIZER: "bg-purple-500/10 text-purple-500",
    ADMIN: "bg-red-500/10 text-red-500",
    SUPER_ADMIN: "bg-red-500/10 text-red-500",
};

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-(--bg-secondary) text-(--text-secondary)",
    PENDING_REVIEW: "bg-yellow-500/10 text-yellow-600",
    PUBLISHED: "bg-green-500/10 text-green-600",
    CANCELLED: "bg-red-500/10 text-red-500",
    ENDED: "bg-(--bg-secondary) text-(--text-secondary)",
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-600",
    AWAITING_PAYMENT: "bg-orange-100 text-orange-700",
    PAID: "bg-blue-500/10 text-blue-500",
    CONFIRMED: "bg-green-500/10 text-green-600",
    CANCELLED: "bg-red-500/10 text-red-500",
    REFUNDED: "bg-purple-500/10 text-purple-500",
    EXPIRED: "bg-(--bg-secondary) text-(--text-secondary)",
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
    const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "events" | "organizer" | "commission">("overview");

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
            <div className="min-h-screen bg-(--bg-secondary) flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-(--accent-primary) animate-spin mx-auto mb-4" />
                    <p className="text-(--text-muted)">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="min-h-screen bg-(--bg-secondary) flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">{error || "User not found"}</p>
                    <Link href="/admin/users" className="text-(--accent-primary) hover:text-indigo-500">
                        Back to Users
                    </Link>
                </div>
            </div>
        );
    }

    const isSuspended = !!userData.deletedAt;

    return (
        <>
            <AdminWorkspacePage 
                title="User Details" 
                description={userData.email}
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
            >

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <div className="bg-(--surface) rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 text-center border-b">
                                <div className="w-24 h-24 bg-(--border) rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                                    {userData.avatarUrl ? (
                                        <Image
                                            src={userData.avatarUrl}
                                            alt=""
                                            width={96}
                                            height={96}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-12 w-12 text-(--text-muted)" />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-foreground mb-1">{userData.name}</h2>
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${ROLE_COLORS[userData.role]}`}>
                                        {userData.role === "SUPER_ADMIN" && <Shield className="h-3 w-3" />}
                                        {userData.role}
                                    </span>
                                    {isSuspended ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-500">
                                            <Ban className="h-3 w-3" />
                                            Suspended
                                        </span>
                                    ) : userData.isVerified ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-600">
                                            <CheckCircle className="h-3 w-3" />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-(--bg-secondary) text-(--text-secondary)">
                                            <XCircle className="h-3 w-3" />
                                            Unverified
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-(--text-muted)" />
                                    <span className="text-sm text-(--text-secondary)">{userData.email}</span>
                                </div>
                                {userData.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-(--text-muted)" />
                                        <span className="text-sm text-(--text-secondary)">{userData.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-(--text-muted)" />
                                    <span className="text-sm text-(--text-secondary)">Joined {formatDate(userData.createdAt)}</span>
                                </div>
                                {userData.lastLoginAt && (
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-(--text-muted)" />
                                        <span className="text-sm text-(--text-secondary)">Last login {formatDateTime(userData.lastLoginAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-(--surface) rounded-xl shadow-sm p-4">
                            <h3 className="text-sm font-medium text-(--text-muted) mb-3">Activity Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-(--surface-hover) rounded-lg">
                                    <Ticket className="h-5 w-5 text-(--accent-primary) mx-auto mb-1" />
                                    <p className="text-lg font-bold text-foreground">{userData._count.bookings}</p>
                                    <p className="text-xs text-(--text-muted)">Bookings</p>
                                </div>
                                {userData.role === "ORGANIZER" && (
                                    <div className="text-center p-3 bg-(--surface-hover) rounded-lg">
                                        <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-foreground">{userData._count.events}</p>
                                        <p className="text-xs text-(--text-muted)">Events</p>
                                    </div>
                                )}
                                <div className="text-center p-3 bg-(--surface-hover) rounded-lg">
                                    <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-foreground">{userData._count.reviews}</p>
                                    <p className="text-xs text-(--text-muted)">Reviews</p>
                                </div>
                                <div className="text-center p-3 bg-(--surface-hover) rounded-lg">
                                    <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-foreground">{userData._count.wishlists}</p>
                                    <p className="text-xs text-(--text-muted)">Wishlist</p>
                                </div>
                            </div>
                        </div>

                        {userData.customerProfile && (
                            <div className="bg-(--surface) rounded-xl shadow-sm p-4">
                                <h3 className="text-sm font-medium text-(--text-muted) mb-3">Customer Profile</h3>
                                <div className="space-y-2 text-sm">
                                    {userData.customerProfile.gender && (
                                        <div className="flex justify-between">
                                            <span className="text-(--text-muted)">Gender</span>
                                            <span className="text-foreground capitalize">{userData.customerProfile.gender.toLowerCase()}</span>
                                        </div>
                                    )}
                                    {userData.customerProfile.birthDate && (
                                        <div className="flex justify-between">
                                            <span className="text-(--text-muted)">Birth Date</span>
                                            <span className="text-foreground">{formatDate(userData.customerProfile.birthDate)}</span>
                                        </div>
                                    )}
                                    {userData.customerProfile.city && (
                                        <div className="flex justify-between">
                                            <span className="text-(--text-muted)">Location</span>
                                            <span className="text-foreground">{userData.customerProfile.city}, {userData.customerProfile.province}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-(--surface) rounded-xl shadow-sm overflow-hidden">
                            <div className="border-b overflow-x-auto">
                                <div className="flex">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("overview")}
                                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === "overview"
                                                ? "border-indigo-600 text-(--accent-primary)"
                                                : "border-transparent text-(--text-muted) hover:text-(--text-secondary)"
                                        }`}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("bookings")}
                                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === "bookings"
                                                ? "border-indigo-600 text-(--accent-primary)"
                                                : "border-transparent text-(--text-muted) hover:text-(--text-secondary)"
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
                                                        ? "border-indigo-600 text-(--accent-primary)"
                                                        : "border-transparent text-(--text-muted) hover:text-(--text-secondary)"
                                                }`}
                                            >
                                                Events ({userData._count.events})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("organizer")}
                                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                                    activeTab === "organizer"
                                                        ? "border-indigo-600 text-(--accent-primary)"
                                                        : "border-transparent text-(--text-muted) hover:text-(--text-secondary)"
                                                }`}
                                            >
                                                Organizer Profile
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("commission")}
                                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                                    activeTab === "commission"
                                                        ? "border-indigo-600 text-(--accent-primary)"
                                                        : "border-transparent text-(--text-muted) hover:text-(--text-secondary)"
                                                }`}
                                            >
                                                Commission
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                {activeTab === "overview" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-(--surface-hover) rounded-lg">
                                                    <p className="text-sm text-(--text-muted) mb-1">User ID</p>
                                                    <p className="text-sm font-mono text-foreground">{userData.id}</p>
                                                </div>
                                                <div className="p-4 bg-(--surface-hover) rounded-lg">
                                                    <p className="text-sm text-(--text-muted) mb-1">Locale / Timezone</p>
                                                    <p className="text-sm text-foreground">{userData.locale} / {userData.timezone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {userData.role !== "SUPER_ADMIN" && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground mb-4">Change Role</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {["CUSTOMER", "ORGANIZER", "ADMIN"].map((role) => (
                                                        <button
                                                            key={role}
                                                            type="button"
                                                            onClick={() => handleAction("changeRole", role)}
                                                            disabled={actionLoading || userData.role === role}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                                                userData.role === role
                                                                    ? "bg-(--accent-primary) text-white"
                                                                    : "bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--border)"
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
                                                    <h3 className="text-lg font-semibold text-foreground">Recent Bookings</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab("bookings")}
                                                        className="text-sm text-(--accent-primary) hover:text-(--accent-primary)"
                                                    >
                                                        View all
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {userData.bookings.slice(0, 3).map((booking) => (
                                                        <div key={booking.id} className="flex items-center justify-between p-3 bg-(--surface-hover) rounded-lg">
                                                            <div>
                                                                <p className="font-medium text-foreground">{booking.event.title}</p>
                                                                <p className="text-sm text-(--text-muted)">{booking.bookingCode}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${BOOKING_STATUS_COLORS[booking.status]}`}>
                                                                    {booking.status}
                                                                </span>
                                                                <p className="text-sm text-foreground mt-1">{formatCurrency(booking.totalAmount)}</p>
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
                                                <Ticket className="h-12 w-12 text-(--text-muted) mx-auto mb-4" />
                                                <p className="text-(--text-muted)">No bookings yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {userData.bookings.map((booking) => (
                                                    <Link
                                                        key={booking.id}
                                                        href={`/admin/bookings/${booking.id}`}
                                                        className="flex items-center justify-between p-4 bg-(--surface-hover) rounded-lg hover:bg-(--bg-secondary) transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-foreground">{booking.event.title}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-sm font-mono text-(--text-muted)">{booking.bookingCode}</span>
                                                                <span className="text-(--text-muted)">•</span>
                                                                <span className="text-sm text-(--text-muted)">{formatDate(booking.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${BOOKING_STATUS_COLORS[booking.status]}`}>
                                                                    {booking.status}
                                                                </span>
                                                                <p className="text-sm font-medium text-foreground mt-1">{formatCurrency(booking.totalAmount)}</p>
                                                            </div>
                                                            <ChevronRight className="h-5 w-5 text-(--text-muted)" />
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
                                                <Calendar className="h-12 w-12 text-(--text-muted) mx-auto mb-4" />
                                                <p className="text-(--text-muted)">No events created</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {userData.events.map((event) => (
                                                    <Link
                                                        key={event.id}
                                                        href={`/admin/events/${event.id}`}
                                                        className="flex items-center justify-between p-4 bg-(--surface-hover) rounded-lg hover:bg-(--bg-secondary) transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-foreground">{event.title}</p>
                                                            <p className="text-sm text-(--text-muted)">{formatDate(event.createdAt)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[event.status]}`}>
                                                                    {event.status.replace(/_/g, " ")}
                                                                </span>
                                                                <p className="text-sm text-(--text-muted) mt-1">{event._count.bookings} bookings</p>
                                                            </div>
                                                            <ChevronRight className="h-5 w-5 text-(--text-muted)" />
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
                                            <div className="w-16 h-16 bg-(--border) rounded-xl flex items-center justify-center overflow-hidden">
                                                {userData.organizerProfile.organizationLogo ? (
                                                    <Image
                                                        src={userData.organizerProfile.organizationLogo}
                                                        alt=""
                                                        width={64}
                                                        height={64}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Building2 className="h-8 w-8 text-(--text-muted)" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-foreground">{userData.organizerProfile.organizationName}</h3>
                                                <p className="text-sm text-(--text-muted)">@{userData.organizerProfile.organizationSlug}</p>
                                                {userData.organizerProfile.organizationDescription && (
                                                    <p className="text-sm text-(--text-secondary) mt-2">{userData.organizerProfile.organizationDescription}</p>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                userData.organizerProfile.verificationStatus === "APPROVED"
                                                    ? "bg-green-500/10 text-green-600"
                                                    : userData.organizerProfile.verificationStatus === "REJECTED"
                                                        ? "bg-red-500/10 text-red-500"
                                                        : "bg-yellow-500/10 text-yellow-600"
                                            }`}>
                                                {userData.organizerProfile.verificationStatus}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-green-500/10 rounded-lg text-center">
                                                <p className="text-sm text-green-600 mb-1">Wallet Balance</p>
                                                <p className="text-lg font-bold text-green-700">{formatCurrency(userData.organizerProfile.walletBalance)}</p>
                                            </div>
                                            <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                                                <p className="text-sm text-blue-600 mb-1">Total Earned</p>
                                                <p className="text-lg font-bold text-blue-700">{formatCurrency(userData.organizerProfile.totalEarned)}</p>
                                            </div>
                                            <div className="p-4 bg-purple-500/10 rounded-lg text-center">
                                                <p className="text-sm text-purple-600 mb-1">Total Withdrawn</p>
                                                <p className="text-lg font-bold text-purple-700">{formatCurrency(userData.organizerProfile.totalWithdrawn)}</p>
                                            </div>
                                        </div>

                                        {(userData.organizerProfile.websiteUrl || userData.organizerProfile.socialInstagram || userData.organizerProfile.socialFacebook || userData.organizerProfile.socialTwitter) && (
                                            <div>
                                                <h4 className="text-sm font-medium text-(--text-muted) mb-3">Social Links</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {userData.organizerProfile.websiteUrl && (
                                                        <a
                                                            href={userData.organizerProfile.websiteUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-2 bg-(--bg-secondary) rounded-lg text-sm text-(--text-secondary) hover:bg-(--border)"
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
                                                            className="inline-flex items-center gap-2 px-3 py-2 bg-(--bg-secondary) rounded-lg text-sm text-(--text-secondary) hover:bg-(--border)"
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
                                                            className="inline-flex items-center gap-2 px-3 py-2 bg-(--bg-secondary) rounded-lg text-sm text-(--text-secondary) hover:bg-(--border)"
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
                                                            className="inline-flex items-center gap-2 px-3 py-2 bg-(--bg-secondary) rounded-lg text-sm text-(--text-secondary) hover:bg-(--border)"
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
                                                <h4 className="text-sm font-medium text-(--text-muted) mb-3">Bank Accounts</h4>
                                                <div className="space-y-2">
                                                    {userData.organizerProfile.bankAccounts.map((bank) => (
                                                        <div key={bank.id} className="flex items-center justify-between p-3 bg-(--surface-hover) rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <CreditCard className="h-5 w-5 text-(--text-muted)" />
                                                                <div>
                                                                    <p className="font-medium text-foreground">{bank.bankName}</p>
                                                                    <p className="text-sm text-(--text-muted)">{bank.accountNumber} - {bank.accountHolderName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {bank.isPrimary && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-(--accent-primary) rounded-full">Primary</span>
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
                                                <h4 className="text-sm font-medium text-(--text-muted) mb-3">Recent Payouts</h4>
                                                <div className="space-y-2">
                                                    {userData.organizerProfile.payouts.map((payout) => (
                                                        <div key={payout.id} className="flex items-center justify-between p-3 bg-(--surface-hover) rounded-lg">
                                                            <div>
                                                                <p className="font-mono text-sm text-(--text-secondary)">{payout.payoutCode}</p>
                                                                <p className="text-xs text-(--text-muted)">{formatDate(payout.createdAt)}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-medium text-foreground">{formatCurrency(payout.amount)}</p>
                                                                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                                                    payout.status === "COMPLETED"
                                                                        ? "bg-green-500/10 text-green-600"
                                                                        : payout.status === "REJECTED"
                                                                            ? "bg-red-500/10 text-red-500"
                                                                            : "bg-yellow-500/10 text-yellow-600"
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

                                {activeTab === "commission" && userData.organizerProfile && (
                                    <div className="space-y-6">
                                        <CommissionOverride 
                                            organizerId={userData.id}
                                            organizationName={userData.organizerProfile.organizationName}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            </AdminWorkspacePage>
        </>
    );
}
