import type { ReactNode } from "react";
import {
    CheckCircle2,
    Clock3,
    Download,
    Info,
    RefreshCw,
    Sparkles,
    Ticket,
    XCircle,
} from "lucide-react";
import { CheckoutCallout, CheckoutCard } from "@/components/features/checkout/checkout-primitives";
import { EditorialPanel } from "@/components/shared/public-marketing";
import { cn } from "@/lib/utils";

interface CheckoutStatusHeroProps {
    tone: "success" | "pending" | "failed";
    title: string;
    description: string;
    bookingCode?: string | null;
    highlight?: ReactNode;
    detailCard?: ReactNode;
    supportNote?: ReactNode;
    children?: ReactNode;
}

const statusConfig = {
    success: {
        icon: CheckCircle2,
        badge: "Pembayaran sukses",
        iconClassName: "bg-(--success-bg) text-(--success)",
        badgeClassName: "border-[rgba(19,135,108,0.22)] bg-(--success-bg) text-(--success-text)",
        accentClassName: "from-[rgba(41,179,182,0.18)] via-[rgba(251,193,23,0.12)] to-transparent",
    },
    pending: {
        icon: Clock3,
        badge: "Menunggu konfirmasi",
        iconClassName: "bg-(--warning-bg) text-(--warning)",
        badgeClassName: "border-[rgba(251,193,23,0.3)] bg-(--warning-bg) text-(--warning-text)",
        accentClassName: "from-[rgba(251,193,23,0.2)] via-[rgba(249,93,0,0.1)] to-transparent",
    },
    failed: {
        icon: XCircle,
        badge: "Pembayaran gagal",
        iconClassName: "bg-(--error-bg) text-(--error)",
        badgeClassName: "border-[rgba(217,79,61,0.22)] bg-(--error-bg) text-(--error-text)",
        accentClassName: "from-[rgba(217,79,61,0.18)] via-[rgba(249,93,0,0.08)] to-transparent",
    },
} as const;

export function CheckoutStatusHero({
    tone,
    title,
    description,
    bookingCode,
    highlight,
    detailCard,
    supportNote,
    children,
}: CheckoutStatusHeroProps) {
    const config = statusConfig[tone];
    const Icon = config.icon;

    return (
        <EditorialPanel className="overflow-hidden rounded-[calc(var(--radius-3xl)+0.25rem)] p-0">
            <div className="relative">
                <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-br opacity-90", config.accentClassName)} />
                <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)]">
                    <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
                        <span className={cn("inline-flex rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em]", config.badgeClassName)}>
                            {config.badge}
                        </span>
                        <div className="space-y-4">
                            <span className={cn("inline-flex h-20 w-20 items-center justify-center rounded-full shadow-(--shadow-sm)", config.iconClassName)}>
                                <Icon className="h-10 w-10" />
                            </span>
                            <div className="space-y-3">
                                <h1 className="max-w-3xl font-(--font-editorial) text-4xl leading-[0.95] tracking-(--tracking-display) text-foreground sm:text-5xl lg:text-[3.5rem]">
                                    {title}
                                </h1>
                                <p className="max-w-2xl text-base leading-8 text-(--text-secondary) sm:text-lg">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children ? <div className="space-y-4 pt-2">{children}</div> : null}
                        {supportNote ? <div className="border-t border-(--border-light) pt-5">{supportNote}</div> : null}
                    </div>

                    <div className="border-t border-(--border-light) bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,250,249,0.94))] px-6 py-7 sm:px-8 sm:py-9 lg:border-l lg:border-t-0 lg:px-8 lg:py-10">
                        <div className="space-y-4">
                            <div className="rounded-[1.75rem] border border-(--border) bg-white/92 p-5 shadow-(--shadow-sm)">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Referensi transaksi</p>
                                <div className="mt-4 space-y-4">
                                    <div className="rounded-[1.4rem] border border-(--border-light) bg-(--surface-muted) px-4 py-4 shadow-(--shadow-xs)">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Kode booking</p>
                                        <p className="mt-2 break-all font-mono text-lg font-semibold text-foreground sm:text-xl">{bookingCode || "Akan muncul setelah booking dibuat"}</p>
                                    </div>
                                    {highlight ? highlight : null}
                                </div>
                            </div>
                            {detailCard ? detailCard : null}
                        </div>
                    </div>
                </div>
            </div>
        </EditorialPanel>
    );
}

interface CheckoutStatusDetailCardProps {
    title: string;
    eyebrow?: string;
    children: ReactNode;
    className?: string;
}

export function CheckoutStatusDetailCard({ title, eyebrow, children, className }: CheckoutStatusDetailCardProps) {
    return (
        <div className={cn("rounded-[1.75rem] border border-(--border-light) bg-white px-5 py-5 shadow-(--shadow-sm) sm:px-6", className)}>
            <div className="space-y-4">
                <div className="space-y-1.5">
                    {eyebrow ? <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">{eyebrow}</p> : null}
                    <h2 className="font-(--font-editorial) text-[1.65rem] leading-none tracking-(--tracking-display) text-(--accent-primary)">{title}</h2>
                </div>
                {children}
            </div>
        </div>
    );
}

interface CheckoutStatusKeyValueProps {
    label: string;
    value: ReactNode;
}

export function CheckoutStatusKeyValue({ label, value }: CheckoutStatusKeyValueProps) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-dashed border-(--border-light) py-3 first:pt-0 last:border-b-0 last:pb-0">
            <p className="text-sm font-medium text-(--text-secondary)">{label}</p>
            <div className="text-right text-sm font-semibold text-foreground">{value}</div>
        </div>
    );
}

export function CheckoutStatusSupport({ children }: { children: ReactNode }) {
    return <p className="text-sm leading-7 text-(--text-secondary)">{children}</p>;
}

export function CheckoutSuccessSummaryCard() {
    return (
        <CheckoutStatusDetailCard title="Akses tiket" eyebrow="Success detail">
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-(--border-light) bg-(--surface-muted) px-4 py-4 shadow-(--shadow-xs)">
                    <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-(--success-bg) text-(--success)">
                            <Download className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Unduh ulang</p>
                            <p className="mt-1 text-sm leading-6 text-(--text-secondary)">PDF tiket tetap tersedia dari halaman ini selama data booking bisa dimuat.</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-[1.4rem] border border-(--border-light) bg-(--surface-muted) px-4 py-4 shadow-(--shadow-xs)">
                    <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-brand-soft) text-(--accent-primary)">
                            <Sparkles className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Siap check-in</p>
                            <p className="mt-1 text-sm leading-6 text-(--text-secondary)">Simpan email konfirmasi atau booking detail agar proses masuk venue tetap cepat.</p>
                        </div>
                    </div>
                </div>
            </div>
        </CheckoutStatusDetailCard>
    );
}

export function CheckoutPendingInstructionsCard() {
    return (
        <CheckoutStatusDetailCard title="Instruksi pembayaran" eyebrow="Pending detail">
            <div className="space-y-1">
                {[
                    "Periksa email pembeli untuk detail virtual account, transfer, atau kanal pembayaran yang aktif.",
                    "Bayar sesuai nominal dan batas waktu yang tertera agar booking tidak otomatis dilepas.",
                    "Gunakan tombol cek status setelah transaksi selesai jika verifikasi belum diperbarui otomatis.",
                ].map((item, index) => (
                    <div key={item} className="flex gap-4 py-3">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--accent-primary) text-xs font-bold text-white">
                            {index + 1}
                        </span>
                        <p className="pt-1 text-sm leading-6 text-(--text-secondary)">{item}</p>
                    </div>
                ))}
            </div>
        </CheckoutStatusDetailCard>
    );
}

export function CheckoutFailedReasonCard() {
    return (
        <CheckoutStatusDetailCard title="Kemungkinan penyebab" eyebrow="Failure detail">
            <div className="rounded-[1.4rem] border border-[rgba(217,79,61,0.16)] bg-(--error-bg) px-4 py-4 shadow-(--shadow-xs)">
                <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-5 w-5 text-(--error-text)" />
                    <div>
                        <p className="text-sm font-semibold text-(--error-text)">Transaksi belum tervalidasi</p>
                        <p className="mt-1 text-sm leading-6 text-(--error-text)">Biasanya disebabkan saldo tidak cukup, sesi pembayaran kedaluwarsa, atau kanal pembayaran menolak otorisasi.</p>
                    </div>
                </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-(--border-light) bg-(--surface-muted) px-4 py-4 shadow-(--shadow-xs)">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Coba lagi</p>
                    <p className="mt-1 text-sm leading-6 text-(--text-secondary)">Pesan ulang event dengan metode pembayaran yang berbeda bila booking lama tidak dapat dipulihkan.</p>
                </div>
                <div className="rounded-[1.4rem] border border-(--border-light) bg-(--surface-muted) px-4 py-4 shadow-(--shadow-xs)">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Dana tertahan</p>
                    <p className="mt-1 text-sm leading-6 text-(--text-secondary)">Jika ada dana terdebet, pantau status di riwayat booking sambil menunggu SLA kanal pembayaran.</p>
                </div>
            </div>
        </CheckoutStatusDetailCard>
    );
}

export function CheckoutStatusRefreshButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface)/90 px-5 py-3 text-sm font-semibold text-foreground shadow-(--shadow-xs) transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
        >
            <RefreshCw className="h-4 w-4" />
            {label}
        </button>
    );
}

export function CheckoutStatusNotes() {
    return (
        <CheckoutCard title="Yang terjadi setelah ini" description="Gunakan halaman ini sebagai titik referensi setelah transaksi diproses." icon={Ticket}>
            <div className="grid gap-3 sm:grid-cols-3">
                {[
                    {
                        title: "Email & notifikasi",
                        copy: "Gelaran mengirim pembaruan status dan instruksi lanjutan ke email yang kamu pakai saat checkout.",
                    },
                    {
                        title: "Riwayat booking",
                        copy: "Semua perubahan status juga bisa dipantau dari area booking customer ketika akun dan email cocok.",
                    },
                    {
                        title: "Dukungan lanjutan",
                        copy: "Gunakan kode booking saat menghubungi penyelenggara atau tim bantuan agar penanganan lebih cepat.",
                    },
                ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-(--border-light) bg-(--surface) px-4 py-4 shadow-(--shadow-xs)">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-(--text-secondary)">{item.copy}</p>
                    </div>
                ))}
            </div>
        </CheckoutCard>
    );
}

export { CheckoutCallout };
