"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Loader2, Mail, Shield, Trash2, UserPlus, Users } from "lucide-react";
import {
    EmptyState,
    OrganizerMetricCard,
    OrganizerPanel,
    OrganizerStatusBadge,
    OrganizerWorkspaceHeader,
} from "@/components/organizer/organizer-workspace-primitives";

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

const ROLE_TONES: Record<string, "default" | "warning" | "success" | "info"> = {
    MANAGER: "info",
    SCANNER: "default",
    FINANCE: "success",
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

            setTeam(team.filter((member) => member.id !== memberId));
        } catch {
            alert("Terjadi kesalahan saat menghapus anggota");
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-(--accent-primary)" />
                    <p className="text-(--text-muted)">Memuat tim...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                    <p className="mb-2 font-medium text-foreground">{error}</p>
                </div>
            </div>
        );
    }

    const activeCount = team.filter((member) => member.isActive).length;
    const managerCount = team.filter((member) => member.role === "MANAGER").length;

    return (
        <>
            <div className="space-y-6">
                <OrganizerWorkspaceHeader
                    title="Manajemen tim"
                    description="Atur anggota tim organizer, pantau status akses, dan undang role operasional yang dibutuhkan untuk event."
                    actions={
                        <button
                            type="button"
                            onClick={() => setShowInviteModal(true)}
                            className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90"
                        >
                            <UserPlus className="h-4 w-4" />
                            Undang anggota
                        </button>
                    }
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <OrganizerMetricCard label="Total anggota" value={team.length} lucideIcon={Users} meta="Semua role organizer" />
                    <OrganizerMetricCard label="Anggota aktif" value={activeCount} lucideIcon={CheckCircle} tone="success" meta="Sudah menerima akses" />
                    <OrganizerMetricCard label="Manager" value={managerCount} lucideIcon={Shield} tone="accent" meta="Role dengan kontrol paling luas" />
                </div>

                <OrganizerPanel title="Daftar anggota" description="Gunakan daftar ini untuk meninjau role, status aktif, dan menghapus akses bila diperlukan.">
                    {team.length === 0 ? (
                        <EmptyState
                            title="Belum ada anggota tim"
                            description="Mulai dengan mengundang manager, scanner, atau finance untuk membantu operasional event."
                            icon={Users}
                            action={
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(true)}
                                    className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Undang anggota pertama
                                </button>
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {team.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex flex-col gap-4 rounded-[1.25rem] border border-(--border) bg-(--surface-elevated) p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        {member.user.avatarUrl ? (
                                            <img src={member.user.avatarUrl} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-(--border) bg-(--surface)">
                                                <span className="font-semibold text-(--text-muted)">{member.user.name?.charAt(0).toUpperCase() || "?"}</span>
                                            </div>
                                        )}
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-foreground">{member.user.name}</p>
                                                <OrganizerStatusBadge tone={ROLE_TONES[member.role]}>{ROLE_LABELS[member.role]}</OrganizerStatusBadge>
                                                {!member.isActive ? <OrganizerStatusBadge tone="warning">Non-aktif</OrganizerStatusBadge> : null}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                                                <Mail className="h-4 w-4" />
                                                <span className="truncate">{member.user.email}</span>
                                            </div>
                                            <p className="text-sm text-(--text-muted)">
                                                {member.acceptedAt
                                                    ? `Bergabung ${new Date(member.acceptedAt).toLocaleDateString("id-ID")}`
                                                    : `Diundang ${new Date(member.invitedAt).toLocaleDateString("id-ID")}`}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemove(member.id)}
                                        disabled={actionLoading === member.id}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.08)] px-4 py-2 text-sm font-semibold text-[rgb(185,28,28)] transition-opacity hover:opacity-90 disabled:opacity-50"
                                    >
                                        {actionLoading === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Hapus akses
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </OrganizerPanel>
            </div>

            {showInviteModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-[1.75rem] border border-(--border) bg-(--surface) p-6 shadow-(--shadow-xl)">
                        <h2 className="text-xl font-semibold text-foreground">Undang anggota tim</h2>
                        <p className="mt-1 text-sm text-(--text-secondary)">Tentukan email dan role agar akses organizer lebih terstruktur.</p>
                        <form onSubmit={handleInvite} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-(--text-secondary)">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="contoh@email.com"
                                    className="w-full rounded-xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none transition-colors focus:border-(--accent-primary)"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-(--text-secondary)">Role</label>
                                <select
                                    name="role"
                                    required
                                    className="w-full rounded-xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none transition-colors focus:border-(--accent-primary)"
                                >
                                    <option value="">Pilih role</option>
                                    <option value="MANAGER">Manager - akses penuh</option>
                                    <option value="SCANNER">Scanner - check-in tiket</option>
                                    <option value="FINANCE">Keuangan - kelola pembayaran</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="inline-flex flex-1 items-center justify-center rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm font-semibold text-foreground"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-(--accent-primary) px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                    {isSubmitting ? "Mengirim..." : "Undang anggota"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </>
    );
}
