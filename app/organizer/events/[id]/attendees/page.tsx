"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Mail,
    Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Attendee {
    id: string;
    ticketCode: string;
    ticketType: string;
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone: string | null;
    bookingCode: string;
    isCheckedIn: boolean;
    checkedInAt: string | null;
    status: string;
    createdAt: string;
}

interface _AttendeeResponse {
    attendees: Attendee[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    stats: {
        totalAttendees: number;
        checkedIn: number;
        pending: number;
    };
}

export default function EventAttendeesPage() {
    const params = useParams();
    const eventId = params.id as string;

    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [stats, setStats] = useState<{ totalAttendees: number; checkedIn: number; pending: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [checkedInFilter, setCheckedInFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);

    const fetchAttendees = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const searchParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
                ...(checkedInFilter && { checkedIn: checkedInFilter }),
            });

            const res = await fetch(`/api/organizer/events/${eventId}/attendees?${searchParams.toString()}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Failed to fetch attendees");
            }

            setAttendees(data.data.attendees);
            setStats(data.data.stats);
            setTotalPages(data.data.pagination.totalPages);
            setTotal(data.data.pagination.total);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load attendees";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendees();
     
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, page, search, statusFilter, checkedInFilter]);

    const handleExport = () => {
        window.open(`/api/organizer/events/${eventId}/attendees?export=true`, "_blank");
    };

    const getStatusBadge = (status: string, isCheckedIn: boolean) => {
        if (isCheckedIn) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-700 text-xs font-medium rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    Check-in
                </span>
            );
        }

        switch (status) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        Aktif
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-700 text-xs font-medium rounded-full">
                        <XCircle className="h-3 w-3" />
                        Batal
                    </span>
                );
            case "REFUNDED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        <Clock className="h-3 w-3" />
                        Refund
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-medium rounded-full">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <Link
                        href={`/organizer/events/${eventId}`}
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Event</span>
                    </Link>
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Daftar Peserta</h1>
                    <p className="text-[var(--text-secondary)]">Kelola daftar peserta yang telah membeli tiket event Anda.</p>
                </div>

                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-[var(--surface)] rounded-xl p-6 shadow-sm border border-[var(--border)]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 rounded-lg">
                                    <User className="h-6 w-6 text-[var(--accent-primary)]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[var(--text-muted)]">Total Peserta</p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalAttendees}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--surface)] rounded-xl p-6 shadow-sm border border-[var(--border)]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/10 rounded-lg">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-[var(--text-muted)]">Sudah Check-in</p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.checkedIn}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--surface)] rounded-xl p-6 shadow-sm border border-[var(--border)]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-[var(--text-muted)]">Pending Check-in</p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
                    <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-hover)]">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, email, atau kode tiket..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="px-4 py-2 border rounded-lg bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent-primary)]"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="ACTIVE">Aktif</option>
                                    <option value="CANCELLED">Batal</option>
                                    <option value="REFUNDED">Refund</option>
                                </select>

                                <select
                                    value={checkedInFilter}
                                    onChange={(e) => {
                                        setCheckedInFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="px-4 py-2 border rounded-lg bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent-primary)]"
                                >
                                    <option value="">Semua Check-in</option>
                                    <option value="true">Sudah Check-in</option>
                                    <option value="false">Belum Check-in</option>
                                </select>

                                <button
                                    onClick={handleExport}
                                    className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 flex items-center gap-2 transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Export</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-12 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-[var(--accent-primary)] animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-600">
                            {error}
                        </div>
                    ) : attendees.length === 0 ? (
                        <div className="p-12 text-center text-[var(--text-muted)]">
                            <p>Tidak ada peserta ditemukan.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Kode Tiket
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Nama
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Tipe Tiket
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Check-in
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {attendees.map((attendee) => (
                                            <tr key={attendee.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm font-medium text-[var(--text-primary)]">
                                                            {attendee.ticketCode}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-indigo-100 rounded-full">
                                                            <User className="h-4 w-4 text-[var(--accent-primary)]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-[var(--text-primary)]">
                                                                {attendee.attendeeName}
                                                            </p>
                                                            {attendee.attendeePhone && (
                                                                <p className="text-xs text-[var(--text-muted)]">
                                                                    {attendee.attendeePhone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{attendee.attendeeEmail}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-2 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium rounded">
                                                        {attendee.ticketType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(attendee.status, attendee.isCheckedIn)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        {attendee.isCheckedIn ? (
                                                            <div className="flex items-center gap-1 text-green-600">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                <span className="text-xs">
                                                                    {attendee.checkedInAt ? formatDate(attendee.checkedInAt) : "-"}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[var(--text-muted)] text-xs">Belum</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-[var(--text-secondary)]">
                                                    {formatDate(attendee.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
                                <p className="text-sm text-[var(--text-muted)]">
                                    Menampilkan {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} dari {total} peserta
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
