"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    UserCheck,
    UserX,
    Shield,
    Loader2,
    AlertCircle,
    Filter,
    Ban,
    CheckCircle,
    Eye,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useToast } from "@/components/ui/toast-provider";

interface OrganizerProfile {
    organizationName: string | null;
    isVerified: boolean;
}

interface AdminUser {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    role: "CUSTOMER" | "ORGANIZER" | "ADMIN" | "SUPER_ADMIN";
    isVerified: boolean;
    createdAt: string;
    deletedAt: string | null;
    organizerProfile: OrganizerProfile | null;
    _count: {
        bookings: number;
        events: number;
    };
}

const ROLE_COLORS: Record<string, string> = {
    CUSTOMER: "bg-gray-100 text-gray-700",
    ORGANIZER: "bg-purple-100 text-purple-700",
    ADMIN: "bg-red-100 text-red-700",
    SUPER_ADMIN: "bg-red-100 text-red-700",
};

export default function AdminUsersPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/admin/users");
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/users");
                    return;
                }
                if (res.status === 403) {
                    router.push("/");
                    return;
                }
                setError(data.error?.message || "Failed to load users");
                return;
            }

            if (data.success) {
                setUsers(data.data);
            }
        } catch {
            setError("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleVerify = async (userId: string, verify: boolean) => {
        try {
            setActionLoading(userId);
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVerified: verify }),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to update user", "error");
                return;
            }

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, isVerified: verify } : u
                )
            );
            showToast("User updated", "success");
        } catch {
            showToast("Failed to update user", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleSuspend = async (userId: string, suspend: boolean) => {
        try {
            setActionLoading(userId);
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: suspend ? "suspended" : "active" }),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to update user", "error");
                return;
            }

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId
                        ? { ...u, deletedAt: suspend ? new Date().toISOString() : null }
                        : u
                )
            );
            showToast("User updated", "success");
        } catch {
            showToast("Failed to update user", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesSearch =
            !search ||
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());

        return matchesRole && matchesSearch;
    });

    const stats = {
        total: users.length,
        customers: users.filter((u) => u.role === "CUSTOMER").length,
        organizers: users.filter((u) => u.role === "ORGANIZER").length,
        admins: users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading users...</p>
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
                    <Link href="/admin" className="text-indigo-600 hover:text-indigo-500">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <AdminHeader 
                title="User Management" 
                backHref="/admin"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-sm text-gray-500">Total Users</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
                        <p className="text-sm text-gray-500">Customers</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-2xl font-bold text-purple-600">{stats.organizers}</p>
                        <p className="text-sm text-gray-500">Organizers</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
                        <p className="text-sm text-gray-500">Admins</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">All Roles</option>
                            <option value="CUSTOMER">Customer</option>
                            <option value="ORGANIZER">Organizer</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Activity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr
                                        key={u.id}
                                        className={`hover:bg-gray-50 ${u.deletedAt ? "opacity-50" : ""}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                                    {u.avatarUrl ? (
                                                        <img
                                                            src={u.avatarUrl}
                                                            alt=""
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-500 font-medium">
                                                            {u.name?.charAt(0).toUpperCase() || "?"}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{u.name}</p>
                                                    <p className="text-sm text-gray-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${ROLE_COLORS[u.role]}`}
                                            >
                                                {u.role === "SUPER_ADMIN" && <Shield className="h-3 w-3" />}
                                                {u.role}
                                            </span>
                                            {u.organizerProfile && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {u.organizerProfile.organizationName}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.deletedAt ? (
                                                <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                                                    <Ban className="h-4 w-4" />
                                                    Suspended
                                                </span>
                                            ) : u.isVerified ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                                    <UserCheck className="h-4 w-4" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                                                    <UserX className="h-4 w-4" />
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div>
                                                {u._count.bookings} bookings
                                            </div>
                                            {u.role === "ORGANIZER" && (
                                                <div>{u._count.events} events</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    href={`/admin/users/${u.id}`}
                                                    className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                {u.role !== "SUPER_ADMIN" && (
                                                    <>
                                                        {!u.isVerified && !u.deletedAt && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleVerify(u.id, true)}
                                                                disabled={actionLoading === u.id}
                                                                className="p-2 text-green-500 hover:text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
                                                                title="Verify User"
                                                            >
                                                                {actionLoading === u.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        )}
                                                        {!u.deletedAt ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSuspend(u.id, true)}
                                                                disabled={actionLoading === u.id}
                                                                className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                                                title="Suspend User"
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSuspend(u.id, false)}
                                                                disabled={actionLoading === u.id}
                                                                className="p-2 text-green-500 hover:text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
                                                                title="Reactivate User"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
}
