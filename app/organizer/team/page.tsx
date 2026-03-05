"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users,
    UserPlus,
    Mail,
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    Edit2,
    Trash2,
    MoreVertical,
} from "lucide-react";

interface TeamMember {
    id: string;
    userId: string;
    role: "MANAGER" | "SCANNER" | "FINANCE";
    permissions: string[] | null;
    isActive: boolean;
    invitedAt: string;
    acceptedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string | null;
    };
}

const ROLE_LABELS: Record<string, string> = {
    MANAGER: "Manager",
    SCANNER: "Scanner",
    FINANCE: "Keuangan",
};

const ROLE_COLORS: Record<string, string> = {
    MANAGER: "bg-purple-500/10 text-purple-700",
    SCANNER: "bg-blue-500/10 text-blue-700",
    FINANCE: "bg-green-500/10 text-green-700",
};

export default function OrganizerTeamPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const loadTeam = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/organizer/team");
                const data = await res.json();

                if (!data.success) {
                    setError(data.error?.message || "Gagal memuat tim");
                    return;
                }

                setTeam(data.data);
            } catch {
                setError("Terjadi kesalahan saat memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        loadTeam();
    }, []);

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;

        try {
            setIsSubmitting(true);
            const res = await fetch("/api/organizer/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role }),
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Gagal mengundang anggota");
                return;
            }

            setShowInviteModal(false);
            setTeam([...team, data.data]);
        } catch {
            alert("Terjadi kesalahan saat mengundang anggota");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = async (memberId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus anggota tim ini?")) return;

        try {
            setActionLoading(memberId);
            const res = await fetch(`/api/organizer/team?memberId=${memberId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Gagal menghapus anggota");
                return;
            }

            setTeam(team.filter((m) => m.id !== memberId));
        } catch {
            alert("Terjadi kesalahan saat menghapus anggota");
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Memuat tim...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-[var(--text-primary)] font-medium mb-2">{error}</p>
                    <Link href="/organizer" className="text-[var(--accent-primary)] hover:text-indigo-500">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            <header className="bg-[var(--surface)] border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/organizer" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                                <Users className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manajemen Tim</h1>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Kelola akses anggota tim Anda</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowInviteModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90"
                        >
                            <UserPlus className="h-4 w-4" />
                            Undang Anggota
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[var(--surface)] rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-[var(--accent-primary)]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">{team.length}</p>
                                <p className="text-sm text-[var(--text-muted)]">Total Anggota</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">{team.filter((m) => m.isActive).length}</p>
                                <p className="text-sm text-[var(--text-muted)]">Aktif</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center">
                                <Shield className="h-5 w-5 text-[var(--text-secondary)]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">
                                    {team.filter((m) => m.role === "MANAGER").length}
                                </p>
                                <p className="text-sm text-[var(--text-muted)]">Manager</p>
                            </div>
                        </div>
                    </div>
                </div>

                {team.length === 0 ? (
                    <div className="bg-[var(--surface)] rounded-xl shadow-sm p-12 text-center">
                        <Users className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Belum ada anggota tim</h3>
                        <p className="text-[var(--text-muted)] mb-6">Mulai dengan mengundang anggota untuk membantu mengelola event Anda.</p>
                        <button
                            type="button"
                            onClick={() => setShowInviteModal(true)}
                            className="inline-flex items-center gap-2 text-[var(--accent-primary)] font-medium"
                        >
                            <UserPlus className="h-4 w-4" />
                            Undang Anggota Pertama
                        </button>
                    </div>
                ) : (
                    <div className="bg-[var(--surface)] rounded-xl shadow-sm overflow-hidden">
                        <div className="divide-y">
                            {team.map((member) => (
                                <div key={member.id} className="p-6 hover:bg-[var(--surface-hover)]">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-[var(--border)] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {member.user.avatarUrl ? (
                                                    <img
                                                        src={member.user.avatarUrl}
                                                        alt=""
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-[var(--text-muted)] font-medium">
                                                        {member.user.name?.charAt(0).toUpperCase() || "?"}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-[var(--text-primary)]">{member.user.name}</h3>
                                                    <span
                                                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${ROLE_COLORS[member.role]}`}
                                                    >
                                                        {ROLE_LABELS[member.role]}
                                                    </span>
                                                    {!member.isActive && (
                                                        <span className="px-2 py-0.5 bg-red-500/10 text-red-700 text-xs rounded-full">
                                                            Non-aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span>{member.user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-2">
                                                    <Clock className="h-3 w-3.5" />
                                                    <span>Bergabung: {new Date(member.acceptedAt).toLocaleDateString("id-ID")}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(member.id)}
                                            disabled={actionLoading === member.id}
                                            className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                            title="Hapus Anggota"
                                        >
                                            {actionLoading === member.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface)] rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Undang Anggota Tim</h3>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="contoh@email.com"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
                                <select
                                    name="role"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Pilih role</option>
                                    <option value="MANAGER">Manager - Akses penuh</option>
                                    <option value="SCANNER">Scanner - Check-in tiket</option>
                                    <option value="FINANCE">Keuangan - Kelola pembayaran</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-[var(--surface-hover)]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Mengirim..." : "Undang"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
