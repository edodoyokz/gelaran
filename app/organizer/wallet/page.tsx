import Link from "next/link";
import { redirect } from "next/navigation";
import {
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle,
    Clock,
    CreditCard,
    Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { formatCurrency } from "@/lib/utils";
import {
    EmptyState,
    OrganizerMetricCard,
    OrganizerPanel,
    OrganizerStatusBadge,
    OrganizerWorkspaceHeader,
} from "@/components/organizer/organizer-workspace-primitives";

export default async function OrganizerWalletPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/organizer/wallet");
    }

    const organizer = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
            organizerProfile: {
                include: {
                    bankAccounts: true,
                    payouts: {
                        orderBy: { createdAt: "desc" },
                        take: 10,
                    },
                },
            },
        },
    });

    if (!organizer || organizer.role !== "ORGANIZER" || !organizer.organizerProfile) {
        redirect("/");
    }

    const profile = organizer.organizerProfile;
    const balance = Number(profile.walletBalance);
    const totalEarned = Number(profile.totalEarned);
    const totalWithdrawn = Number(profile.totalWithdrawn);

    return (
        <div className="space-y-6">
            <OrganizerWorkspaceHeader
                title="Wallet organizer"
                description="Pantau saldo, rekening bank, dan riwayat penarikan dalam satu permukaan yang lebih konsisten dengan workspace organizer Gelaran."
                actions={
                    <>
                        <Link
                            href="/organizer/wallet/withdraw"
                            className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90"
                        >
                            <ArrowUpRight className="h-4 w-4" />
                            Tarik dana
                        </Link>
                        <Link
                            href="/organizer/wallet/bank-account"
                            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-elevated)"
                        >
                            <CreditCard className="h-4 w-4" />
                            Rekening bank
                        </Link>
                    </>
                }
            />

            <section className="overflow-hidden rounded-4xl border border-[rgba(41,179,182,0.22)] bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(99,102,241,0.14),rgba(249,115,22,0.14))] p-6 shadow-(--shadow-lg) sm:p-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
                    <div className="space-y-4">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/70 text-(--accent-primary) shadow-(--shadow-sm)">
                            <Wallet className="h-6 w-6" />
                        </span>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-(--text-secondary)">Saldo tersedia</p>
                            <h2 className="text-4xl font-semibold tracking-(--tracking-heading) text-foreground">{formatCurrency(balance)}</h2>
                            <p className="max-w-2xl text-sm leading-7 text-(--text-secondary)">
                                Gunakan wallet ini untuk memantau saldo siap cair, total pemasukan, dan histori payout tanpa mengubah alur transaksi organizer yang sudah berjalan.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-[1.75rem] border border-white/35 bg-white/72 p-5 shadow-(--shadow-md) backdrop-blur dark:bg-[rgba(15,23,42,0.45)]">
                        <div className="space-y-3 text-sm text-(--text-secondary)">
                            <div className="flex items-center justify-between gap-3">
                                <span>Total pendapatan</span>
                                <span className="font-semibold text-foreground">{formatCurrency(totalEarned)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span>Total ditarik</span>
                                <span className="font-semibold text-foreground">{formatCurrency(totalWithdrawn)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span>Rekening terhubung</span>
                                <span className="font-semibold text-foreground">{profile.bankAccounts.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-3">
                <OrganizerMetricCard label="Saldo wallet" value={formatCurrency(balance)} lucideIcon={Wallet} tone="accent" meta="Dana yang tersedia untuk payout" />
                <OrganizerMetricCard label="Total pendapatan" value={formatCurrency(totalEarned)} lucideIcon={ArrowDownLeft} tone="success" meta="Akumulasi pendapatan organizer" />
                <OrganizerMetricCard label="Total ditarik" value={formatCurrency(totalWithdrawn)} lucideIcon={ArrowUpRight} meta="Riwayat seluruh penarikan dana" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <OrganizerPanel
                    title="Rekening bank"
                    description="Kelola rekening penerima payout organizer dan lihat status rekening utama dengan cepat."
                    action={
                        <Link
                            href="/organizer/wallet/bank-account"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent-primary) transition-opacity hover:opacity-80"
                        >
                            Tambah / kelola rekening
                        </Link>
                    }
                >
                    {profile.bankAccounts.length === 0 ? (
                        <EmptyState
                            title="Belum ada rekening bank"
                            description="Tambahkan rekening agar wallet siap dipakai untuk penarikan dana organizer."
                            icon={CreditCard}
                            action={
                                <Link
                                    href="/organizer/wallet/bank-account"
                                    className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Tambah rekening
                                </Link>
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {profile.bankAccounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex flex-col gap-4 rounded-[1.25rem] border border-(--border) bg-(--surface-elevated) p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground">{account.bankName}</p>
                                        <p className="text-sm text-(--text-secondary)">{account.accountNumber} • {account.accountHolderName}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {account.isPrimary ? <OrganizerStatusBadge tone="info">Utama</OrganizerStatusBadge> : null}
                                        {account.isVerified ? (
                                            <OrganizerStatusBadge tone="success">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Terverifikasi
                                            </OrganizerStatusBadge>
                                        ) : (
                                            <OrganizerStatusBadge tone="warning">Perlu verifikasi</OrganizerStatusBadge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </OrganizerPanel>

                <OrganizerPanel title="Riwayat penarikan" description="Riwayat payout terbaru untuk memantau request, processing, hingga completed.">
                    {profile.payouts.length === 0 ? (
                        <EmptyState
                            title="Belum ada riwayat penarikan"
                            description="Setelah organizer mengajukan payout, histori penarikan akan muncul di panel ini."
                            icon={Clock}
                        />
                    ) : (
                        <div className="space-y-3">
                            {profile.payouts.map((payout) => {
                                const tone =
                                    payout.status === "COMPLETED"
                                        ? "success"
                                        : payout.status === "REQUESTED"
                                            ? "warning"
                                            : payout.status === "PROCESSING"
                                                ? "info"
                                                : "danger";

                                const label =
                                    payout.status === "COMPLETED"
                                        ? "Selesai"
                                        : payout.status === "REQUESTED"
                                            ? "Menunggu"
                                            : payout.status === "PROCESSING"
                                                ? "Diproses"
                                                : payout.status;

                                return (
                                    <div
                                        key={payout.id}
                                        className="flex flex-col gap-3 rounded-[1.25rem] border border-(--border) bg-(--surface-elevated) p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-semibold text-foreground">{payout.payoutCode}</p>
                                            <p className="text-sm text-(--text-secondary)">
                                                {new Date(payout.requestedAt).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-start gap-2 sm:items-end">
                                            <p className="font-semibold text-foreground">{formatCurrency(Number(payout.netAmount))}</p>
                                            <OrganizerStatusBadge tone={tone}>{label}</OrganizerStatusBadge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </OrganizerPanel>
            </div>
        </div>
    );
}
