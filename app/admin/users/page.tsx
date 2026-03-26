"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Eye, Loader2, Search, Shield, UserCheck, Users } from "lucide-react";
import {
    AdminDataTable,
    AdminFilterBar,
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";

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

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface StatsData {
    total: number;
    customers: number;
    organizers: number;
    admins: number;
    activeLastMonth: number;
}

const roleTone: Record<string, "default" | "success" | "warning" | "danger" | "accent"> = {
    CUSTOMER: "default",
    ORGANIZER: "accent",
    ADMIN: "warning",
    SUPER_ADMIN: "danger",
};

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [stats, setStats] = useState<StatsData>({
        total: 0,
        customers: 0,
        organizers: 0,
        admins: 0,
        activeLastMonth: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState("");
    const [verificationFilter, setVerificationFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (roleFilter) params.set("role", roleFilter);
            if (verificationFilter) params.set("verification", verificationFilter);
            if (statusFilter) params.set("status", statusFilter);
            if (search) params.set("search", search);
            params.set("page", "1");
            params.set("limit", "20");

            const res = await fetch(`/api/admin/users?${params.toString()}`);
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
                setUsers(data.data.users);
                setPagination(data.data.pagination);
                setStats(data.data.stats);
            }
        } catch {
            setError("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }, [roleFilter, router, search, statusFilter, verificationFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <AdminWorkspacePage eyebrow="Admin users" title="Identity and access" description="Review customer, organizer, and admin accounts from a single management table.">
                <AdminNotice tone="warning" title="User data is unavailable" description={error} actionHref="/admin" actionLabel="Back to dashboard" />
            </AdminWorkspacePage>
        );
    }

    return (
        <AdminWorkspacePage eyebrow="Admin users" title="Identity and access" description="Review customer, organizer, and admin accounts from a single management table.">
            <AdminNotice
                tone="info"
                title="Account health overview"
                description={`${stats.activeLastMonth.toLocaleString("en-US")} users have logged in during the last 30 days, giving admins a quick view of active platform reach.`}
                actionHref="/admin/settings"
                actionLabel="Platform settings"
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard label="All users" value={stats.total.toLocaleString("en-US")} icon={Users} meta={`${stats.customers} customers`} />
                <AdminMetricCard label="Organizers" value={stats.organizers.toLocaleString("en-US")} icon={Activity} tone="accent" meta="Workspace-enabled seller accounts" />
                <AdminMetricCard label="Admins" value={stats.admins.toLocaleString("en-US")} icon={Shield} tone="warning" meta="Platform governance roles" />
                <AdminMetricCard label="Active in 30 days" value={stats.activeLastMonth.toLocaleString("en-US")} icon={UserCheck} tone="success" meta="Users with a recent login signal" />
            </section>

            <AdminFilterBar>
                <label className="relative block min-w-[16rem] flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name or email"
                        className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) py-3 pl-11 pr-4 text-sm text-foreground outline-none"
                    />
                </label>
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm">
                    <option value="">All roles</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="ORGANIZER">Organizer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super admin</option>
                </select>
                <select value={verificationFilter} onChange={(event) => setVerificationFilter(event.target.value)} className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm">
                    <option value="">All verification states</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                </select>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm">
                    <option value="">All account states</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
            </AdminFilterBar>

            <AdminDataTable
                columns={["User", "Role", "Verification", "Activity", "State", "Created", "Action"]}
                hasRows={users.length > 0}
                emptyTitle="No users match the current filters"
                emptyDescription="Adjust the role, verification, or account state filters to broaden the result set."
            >
                {users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-(--surface-elevated)">
                        <td className="px-5 py-4 align-top">
                            <p className="text-sm font-semibold text-foreground">{user.name}</p>
                            <p className="mt-1 text-xs text-(--text-secondary)">{user.email}</p>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <AdminStatusBadge label={user.role.replace("_", " ")} tone={roleTone[user.role] || "default"} />
                            {user.organizerProfile?.organizationName ? (
                                <p className="mt-2 text-xs text-(--text-secondary)">{user.organizerProfile.organizationName}</p>
                            ) : null}
                        </td>
                        <td className="px-5 py-4 align-top">
                            <AdminStatusBadge label={user.isVerified ? "Verified" : "Unverified"} tone={user.isVerified ? "success" : "warning"} />
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">
                            <p>{user._count.bookings.toLocaleString("en-US")} bookings</p>
                            <p className="mt-1">{user._count.events.toLocaleString("en-US")} events</p>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <AdminStatusBadge label={user.deletedAt ? "Suspended" : "Active"} tone={user.deletedAt ? "danger" : "success"} />
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">
                            {new Date(user.createdAt).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-5 py-4 align-top">
                            <Link href={`/admin/users/${user.id}`} className="inline-flex items-center gap-2 rounded-full border border-(--border) px-3 py-2 text-sm font-semibold text-foreground hover:text-(--accent-primary)">
                                <Eye className="h-4 w-4" />
                                View
                            </Link>
                        </td>
                    </tr>
                ))}
            </AdminDataTable>

            {pagination ? <div className="text-sm text-(--text-secondary)">Showing {users.length} of {pagination.total.toLocaleString("en-US")} users.</div> : null}
        </AdminWorkspacePage>
    );
}
