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
    Download,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useToast } from "@/components/ui/toast-provider";
import { LineChart, Line, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface ChartDataPoint {
    name: string;
    value: number;
}

interface GrowthDataPoint {
    date: string;
    count: number;
}

interface ChartsData {
    roleDistribution: ChartDataPoint[];
    verificationStatus: ChartDataPoint[];
    userGrowth: GrowthDataPoint[];
    genderDistribution: ChartDataPoint[];
    ageDistribution: ChartDataPoint[];
    topCities: ChartDataPoint[];
}

interface UsersResponse {
    users: AdminUser[];
    pagination: PaginationMeta;
    stats: StatsData;
    charts: ChartsData;
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
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [stats, setStats] = useState<StatsData>({
        total: 0,
        customers: 0,
        organizers: 0,
        admins: 0,
        activeLastMonth: 0,
    });
    const [charts, setCharts] = useState<ChartsData>({
        roleDistribution: [],
        verificationStatus: [],
        userGrowth: [],
        genderDistribution: [],
        ageDistribution: [],
        topCities: [],
    });
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [roleFilter, setRoleFilter] = useState<string>("");
    const [verificationFilter, setVerificationFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [activityFilter, setActivityFilter] = useState<string>("");
    
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(20);
    
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
    
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('limit', itemsPerPage.toString());
            
            if (roleFilter) params.set('role', roleFilter);
            if (verificationFilter) params.set('verification', verificationFilter);
            if (statusFilter) params.set('status', statusFilter);
            if (search) params.set('search', search);
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);
            if (activityFilter) params.set('activity', activityFilter);
            if (sortBy) params.set('sortBy', sortBy);
            if (sortOrder) params.set('sortOrder', sortOrder);
            
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
                if (data.data.charts) {
                    setCharts(data.data.charts);
                }
            }
        } catch {
            setError("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }, [router, currentPage, itemsPerPage, roleFilter, verificationFilter, statusFilter, search, dateFrom, dateTo, activityFilter, sortBy, sortOrder]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const resetFilters = () => {
        setRoleFilter("");
        setVerificationFilter("");
        setStatusFilter("");
        setSearch("");
        setDateFrom("");
        setDateTo("");
        setActivityFilter("");
        setCurrentPage(1);
    };
    
    const hasActiveFilters = !!(
        roleFilter || 
        verificationFilter || 
        statusFilter || 
        search || 
        dateFrom || 
        dateTo || 
        activityFilter
    );

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };
    
    const getSortIcon = (column: string) => {
        if (sortBy !== column) {
            return <span className="text-gray-300">⇅</span>;
        }
        return sortOrder === 'asc' ? <span className="text-indigo-600">↑</span> : <span className="text-indigo-600">↓</span>;
    };

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

    const handleExportCSV = async () => {
        try {
            const params = new URLSearchParams();
            if (roleFilter) params.set('role', roleFilter);
            if (verificationFilter) params.set('verification', verificationFilter);
            if (statusFilter) params.set('status', statusFilter);
            if (search) params.set('search', search);
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);
            if (activityFilter) params.set('activity', activityFilter);
            if (sortBy) params.set('sortBy', sortBy);
            if (sortOrder) params.set('sortOrder', sortOrder);
            
            params.set('limit', '10000');
            
            const res = await fetch(`/api/admin/users?${params.toString()}`);
            const data = await res.json();
            
            if (!data.success || !data.data.users) {
                showToast("Failed to export users", "error");
                return;
            }
            
            const csvRows = [];
            csvRows.push(['ID', 'Name', 'Email', 'Phone', 'Role', 'Verified', 'Status', 'Bookings', 'Events', 'Joined', 'Organization'].join(','));
            
            data.data.users.forEach((user: AdminUser) => {
                const row = [
                    user.id,
                    `"${user.name.replace(/"/g, '""')}"`,
                    user.email,
                    user.phone || '',
                    user.role,
                    user.isVerified ? 'Yes' : 'No',
                    user.deletedAt ? 'Suspended' : 'Active',
                    user._count.bookings,
                    user._count.events,
                    new Date(user.createdAt).toLocaleDateString('id-ID'),
                    user.organizerProfile?.organizationName ? `"${user.organizerProfile.organizationName.replace(/"/g, '""')}"` : '',
                ];
                csvRows.push(row.join(','));
            });
            
            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().split('T')[0];
            
            link.setAttribute('href', url);
            link.setAttribute('download', `users-export-${timestamp}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast(`Exported ${data.data.users.length} users`, "success");
        } catch {
            showToast("Failed to export users", "error");
        }
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === users.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(users.map(u => u.id)));
        }
    };

    const toggleSelectUser = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const handleBulkAction = async (action: 'verify' | 'suspend' | 'activate') => {
        if (selectedUsers.size === 0) {
            showToast("No users selected", "error");
            return;
        }

        const confirmMessage = 
            action === 'verify' ? `Verify ${selectedUsers.size} selected users?` :
            action === 'suspend' ? `Suspend ${selectedUsers.size} selected users?` :
            `Activate ${selectedUsers.size} selected users?`;

        if (!confirm(confirmMessage)) return;

        try {
            setIsBulkActionLoading(true);
            const userIds = Array.from(selectedUsers);
            
            const promises = userIds.map(userId => {
                const body = 
                    action === 'verify' ? { isVerified: true } :
                    action === 'suspend' ? { status: 'suspended' } :
                    { status: 'active' };

                return fetch(`/api/admin/users/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            });

            const results = await Promise.allSettled(promises);
            const successCount = results.filter(r => r.status === 'fulfilled').length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                await fetchUsers();
                setSelectedUsers(new Set());
                showToast(`${successCount} users updated${failCount > 0 ? `, ${failCount} failed` : ''}`, "success");
            } else {
                showToast("Failed to update users", "error");
            }
        } catch {
            showToast("Failed to perform bulk action", "error");
        } finally {
            setIsBulkActionLoading(false);
        }
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

    const PaginationControls = () => {
        if (!pagination) return null;
        
        const { page, totalPages, hasNext, hasPrev, total } = pagination;
        const startItem = (page - 1) * itemsPerPage + 1;
        const endItem = Math.min(page * itemsPerPage, total);
        
        return (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-medium">{startItem}</span> to{" "}
                        <span className="font-medium">{endItem}</span> of{" "}
                        <span className="font-medium">{total}</span> users
                    </p>
                    
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage(1)}
                        disabled={!hasPrev}
                        className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        First
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentPage(page - 1)}
                        disabled={!hasPrev}
                        className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_: unknown, i: number) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 text-sm border rounded-lg ${
                                        page === pageNum
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => setCurrentPage(page + 1)}
                        disabled={!hasNext}
                        className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={!hasNext}
                        className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Last
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <AdminHeader 
                title="User Management" 
                backHref="/admin"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-2xl font-bold text-green-600">{stats.activeLastMonth}</p>
                        <p className="text-sm text-gray-500">Active (30d)</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <h2 className="text-lg font-semibold text-gray-900">User Analytics</h2>
                        {showAnalytics ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>
                    
                    {showAnalytics && (
                        <div className="p-6 border-t bg-gray-50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">Role Distribution</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={charts.roleDistribution as never[]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {charts.roleDistribution.map((_, index) => {
                                                    const colors = ['#6366f1', '#a855f7', '#ef4444'];
                                                    return <Cell key={`role-${index}`} fill={colors[index % colors.length]} />;
                                                })}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">Verification Status</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={charts.verificationStatus as never[]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label
                                                outerRadius={80}
                                                innerRadius={50}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {charts.verificationStatus.map((_, index) => {
                                                    const colors = ['#10b981', '#f59e0b'];
                                                    return <Cell key={`verification-${index}`} fill={colors[index % colors.length]} />;
                                                })}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">User Growth (Last 30 Days)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={charts.userGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis 
                                            dataKey="date" 
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => {
                                                const date = new Date(value);
                                                return `${date.getMonth() + 1}/${date.getDate()}`;
                                            }}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip 
                                            labelFormatter={(value) => {
                                                const date = new Date(value);
                                                return date.toLocaleDateString('id-ID');
                                            }}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="count" 
                                            stroke="#6366f1" 
                                            strokeWidth={2}
                                            name="New Users"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">Gender Distribution</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={charts.genderDistribution as never[]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {charts.genderDistribution.map((_: ChartDataPoint, index: number) => {
                                                    const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#6b7280'];
                                                    return <Cell key={`gender-${index}`} fill={colors[index % colors.length]} />;
                                                })}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">Age Distribution</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={charts.ageDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#6366f1" name="Users" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 shadow-sm mt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">Top 10 Cities</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={charts.topCities} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" tick={{ fontSize: 12 }} />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill="#10b981" name="Users" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-4">
                    {selectedUsers.size > 0 ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                            </span>
                            <button
                                type="button"
                                onClick={() => handleBulkAction('verify')}
                                disabled={isBulkActionLoading}
                                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                Verify Selected
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkAction('suspend')}
                                disabled={isBulkActionLoading}
                                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                Suspend Selected
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkAction('activate')}
                                disabled={isBulkActionLoading}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Activate Selected
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedUsers(new Set())}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
                            >
                                Clear Selection
                            </button>
                        </div>
                    ) : (
                        <div />
                    )}
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Export to CSV
                    </button>
                </div>

                <div className="bg-white rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Roles</option>
                            <option value="CUSTOMER">Customer</option>
                            <option value="ORGANIZER">Organizer</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        
                        <select
                            value={verificationFilter}
                            onChange={(e) => {
                                setVerificationFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Verification</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </select>
                        
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        
                        <select
                            value={activityFilter}
                            onChange={(e) => {
                                setActivityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Activity</option>
                            <option value="hasBookings">Has Bookings</option>
                            <option value="hasEvents">Has Events</option>
                            <option value="noActivity">No Activity</option>
                        </select>
                        
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Joined:</span>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.size === users.length && users.length > 0}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        User
                                        {getSortIcon('name')}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('bookings')}
                                >
                                    <div className="flex items-center gap-2">
                                        Activity
                                        {getSortIcon('bookings')}
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center gap-2">
                                        Joined
                                        {getSortIcon('createdAt')}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr
                                        key={u.id}
                                        className={`hover:bg-gray-50 ${u.deletedAt ? "opacity-50" : ""}`}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(u.id)}
                                                onChange={() => toggleSelectUser(u.id)}
                                                disabled={u.role === 'SUPER_ADMIN'}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                            />
                                        </td>
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
                    
                    <PaginationControls />
                </div>
            </main>
        </>
    );
}
