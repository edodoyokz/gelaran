"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowRight,
    Building2,
    CheckCircle,
    ChevronRight,
    Clock,
    Facebook,
    Globe,
    Instagram,
    Loader2,
    PartyPopper,
    Shield,
    Sparkles,
    TrendingUp,
    Twitter,
    Users,
} from "lucide-react";
import {
    EditorialPanel,
    FeatureGrid,
    MarketingHero,
    PublicPageShell,
    PublicSection,
} from "@/components/shared/public-marketing";

interface ApplicationData {
    id: string;
    organizationName: string;
    organizationSlug: string;
    organizationDescription: string | null;
    websiteUrl: string | null;
    socialFacebook: string | null;
    socialInstagram: string | null;
    socialTwitter: string | null;
    socialTiktok: string | null;
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
    isVerified: boolean;
    createdAt: string;
}

interface FormData {
    organizationName: string;
    organizationDescription: string;
    websiteUrl: string;
    socialFacebook: string;
    socialInstagram: string;
    socialTwitter: string;
    socialTiktok: string;
}

const BENEFITS = [
    {
        icon: Users,
        title: "Jangkau audiens baru",
        description: "Perluas eksposur event Anda melalui pengalaman publik Gelaran yang lebih terang, terkurasi, dan mudah dipahami.",
    },
    {
        icon: TrendingUp,
        title: "Pantau performa dengan jelas",
        description: "Gunakan insight dan workflow internal untuk membaca penjualan, minat pengunjung, dan momentum event.",
    },
    {
        icon: Shield,
        title: "Operasional lebih tepercaya",
        description: "Pengelolaan tiket, pembayaran, dan akses event didukung alur yang dirancang untuk mengurangi kebingungan.",
    },
    {
        icon: Sparkles,
        title: "Brand tampil lebih rapi",
        description: "Presentasikan event dalam ekosistem visual yang konsisten dari landing page publik sampai dashboard organizer.",
    },
];

function StatusView({
    icon: Icon,
    tone,
    title,
    description,
    actions,
    children,
}: {
    icon: typeof CheckCircle;
    tone: "success" | "warning" | "error" | "accent";
    title: string;
    description: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}) {
    const toneClasses = {
        success: "border-[rgba(19,135,108,0.24)] bg-(--success-bg) text-(--success)",
        warning: "border-[rgba(251,193,23,0.28)] bg-[var(--warning-bg)] text-(--warning)",
        error: "border-[rgba(217,79,61,0.24)] bg-(--error-bg) text-(--error)",
        accent: "border-[rgba(41,179,182,0.24)] bg-[var(--info-bg)] text-(--accent-primary)",
    };

    return (
        <PublicPageShell>
            <section className="px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24">
                <div className="mx-auto max-w-3xl">
                    <EditorialPanel className="space-y-6 p-8 text-center sm:p-10 lg:p-12">
                        <span className={`mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border ${toneClasses[tone]}`}>
                            <Icon className="h-10 w-10" />
                        </span>
                        <div className="space-y-3">
                            <h1 className="font-(--font-editorial) text-4xl leading-[0.96] tracking-(--tracking-display) text-foreground sm:text-5xl">
                                {title}
                            </h1>
                            <div className="text-sm leading-8 text-(--text-secondary) sm:text-base">{description}</div>
                        </div>
                        {children}
                        {actions ? <div className="flex flex-col justify-center gap-3 sm:flex-row">{actions}</div> : null}
                    </EditorialPanel>
                </div>
            </section>
        </PublicPageShell>
    );
}

export default function BecomeOrganizerPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [hasApplication, setHasApplication] = useState(false);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [application, setApplication] = useState<ApplicationData | null>(null);
    const [formData, setFormData] = useState<FormData>({
        organizationName: "",
        organizationDescription: "",
        websiteUrl: "",
        socialFacebook: "",
        socialInstagram: "",
        socialTwitter: "",
        socialTiktok: "",
    });
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

    const checkStatus = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/organizer/apply");
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/login?returnUrl=/become-organizer");
                    return;
                }
                setError(data.error?.message || "Failed to check status");
                return;
            }

            if (data.success) {
                setHasApplication(data.data.hasApplication);
                setIsOrganizer(data.data.isOrganizer);
                setApplication(data.data.application);
            }
        } catch {
            setError("Failed to check application status");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const validateForm = (): boolean => {
        const errors: Partial<FormData> = {};

        if (!formData.organizationName.trim()) {
            errors.organizationName = "Organization name is required";
        } else if (formData.organizationName.trim().length < 3) {
            errors.organizationName = "Organization name must be at least 3 characters";
        } else if (formData.organizationName.trim().length > 100) {
            errors.organizationName = "Organization name must be less than 100 characters";
        }

        if (formData.websiteUrl && !formData.websiteUrl.match(/^https?:\/\/.+/)) {
            errors.websiteUrl = "Please enter a valid URL starting with http:// or https://";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            setError(null);

            const response = await fetch("/api/organizer/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error?.message || "Failed to submit application");
                return;
            }

            setSuccess(true);
            setHasApplication(true);
            setApplication(data.data.organizerProfile);
        } catch {
            setError("Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    if (isLoading) {
        return (
            <PublicPageShell>
                <section className="flex min-h-[70vh] items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-(--accent-primary)" />
                        <p className="mt-4 text-sm font-medium text-(--text-secondary)">Memuat status organizer...</p>
                    </div>
                </section>
            </PublicPageShell>
        );
    }

    if (isOrganizer) {
        return (
            <StatusView
                icon={CheckCircle}
                tone="success"
                title="Anda sudah terdaftar sebagai organizer"
                description={
                    <p>
                        Akun Anda sudah memiliki akses organizer. Lanjutkan ke dashboard untuk mulai membuat event dan mengelola pengalaman audiens.
                    </p>
                }
                actions={
                    <>
                        <Link
                            href="/organizer/events"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-primary-hover)"
                        >
                            Buka dashboard organizer
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-(--border) bg-(--surface) px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-(--surface-hover)"
                        >
                            Kembali ke beranda
                        </Link>
                    </>
                }
            />
        );
    }

    if (hasApplication && application?.verificationStatus === "PENDING") {
        return (
            <StatusView
                icon={Clock}
                tone="warning"
                title="Pengajuan Anda sedang ditinjau"
                description={
                    <p>
                        Pengajuan untuk <strong>{application.organizationName}</strong> sedang direview oleh tim Gelaran. Kami akan memberi kabar segera setelah proses verifikasi selesai.
                    </p>
                }
                actions={
                    <Link
                        href="/"
                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-(--border) bg-(--surface) px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-(--surface-hover)"
                    >
                        Kembali ke beranda
                    </Link>
                }
            >
                <EditorialPanel className="space-y-4 text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                        What happens next
                    </p>
                    <ul className="space-y-3 text-sm leading-7 text-(--text-secondary) sm:text-base">
                        <li>• Tim kami meninjau profil organisasi Anda dalam 1–3 hari kerja.</li>
                        <li>• Anda akan menerima notifikasi email ketika status berubah.</li>
                        <li>• Setelah disetujui, dashboard organizer siap dipakai tanpa pengajuan ulang.</li>
                    </ul>
                    <p className="text-sm text-(--text-muted)">
                        Dikirim pada {new Date(application.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </EditorialPanel>
            </StatusView>
        );
    }

    if (hasApplication && application?.verificationStatus === "REJECTED") {
        return (
            <StatusView
                icon={AlertCircle}
                tone="error"
                title="Pengajuan belum dapat disetujui"
                description={
                    <p>
                        Pengajuan untuk <strong>{application.organizationName}</strong> belum dapat diproses lebih lanjut. Hubungi tim kami untuk mendapatkan detail tambahan sebelum mengajukan kembali.
                    </p>
                }
                actions={
                    <>
                        <Link
                            href="/contact"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-(--accent-secondary) px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-secondary-hover)"
                        >
                            Hubungi support
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-(--border) bg-(--surface) px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-(--surface-hover)"
                        >
                            Kembali ke beranda
                        </Link>
                    </>
                }
            />
        );
    }

    if (success) {
        return (
            <StatusView
                icon={PartyPopper}
                tone="accent"
                title="Pengajuan berhasil dikirim"
                description={
                    <p>
                        Terima kasih telah mendaftar menjadi organizer di Gelaran. Tim kami akan meninjau profil Anda dan menghubungi Anda dalam 1–3 hari kerja.
                    </p>
                }
                actions={
                    <Link
                        href="/"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-primary-hover)"
                    >
                        Kembali ke beranda
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                }
            />
        );
    }

    return (
        <PublicPageShell
            hero={
                <MarketingHero
                    eyebrow="Become an organizer"
                    title={<>Bangun event Anda di ekosistem Gelaran yang lebih <em className="text-(--accent-secondary) not-italic">rapi</em>, konsisten, dan dipercaya.</>}
                    description={
                        <p>
                            Halaman ini memadukan narasi value proposition dan formulir aplikasi dalam satu alur publik yang lebih tenang—selaras dengan baseline editorial Gelaran dan tetap fokus pada konversi organizer baru.
                        </p>
                    }
                    primaryCta={{ href: "#organizer-form", label: "Ajukan sekarang" }}
                    secondaryCta={{ href: "/contact", label: "Bicara dengan tim" }}
                    aside={
                        <EditorialPanel className="max-w-xl space-y-5">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--text-muted)">
                                    Why organizers choose Gelaran
                                </p>
                                <h2 className="font-(--font-editorial) text-3xl leading-tight tracking-(--tracking-display) text-foreground sm:text-4xl">
                                    Presentasi event yang lebih kuat, operasional yang lebih jelas, dan onboarding yang lebih ringan.
                                </h2>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-(--border) bg-(--surface) p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Events hosted</p>
                                    <p className="mt-2 text-3xl font-semibold tracking-(--tracking-heading) text-foreground">10K+</p>
                                </div>
                                <div className="rounded-2xl border border-(--border) bg-(--surface) p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Tickets sold</p>
                                    <p className="mt-2 text-3xl font-semibold tracking-(--tracking-heading) text-foreground">500K+</p>
                                </div>
                            </div>
                            <p className="text-sm leading-7 text-(--text-secondary)">
                                Isi profil organisasi Anda sekali, lalu gunakan fondasi tersebut untuk menghadirkan event yang terasa lebih profesional di setiap touchpoint publik.
                            </p>
                        </EditorialPanel>
                    }
                />
            }
        >
            <PublicSection
                eyebrow="Platform benefits"
                title="Dirancang untuk organizer yang butuh lebih dari sekadar form upload event"
                description="Kami merapikan pesan utama halaman ini agar lebih meyakinkan, mudah discan, dan tetap selaras dengan voice publik Gelaran."
                className="pt-0"
            >
                <FeatureGrid items={BENEFITS} columns={4} />
            </PublicSection>

            <PublicSection
                eyebrow="Application form"
                title="Ajukan profil organizer Anda"
                description="Lengkapi informasi inti organisasi agar tim kami dapat meninjau kesesuaian dan membantu proses onboarding dengan lebih cepat."
                className="pt-0"
            >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start">
                    <div className="space-y-5">
                        <EditorialPanel className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                                Before you submit
                            </p>
                            <ul className="space-y-3 text-sm leading-7 text-(--text-secondary) sm:text-base">
                                <li>• Gunakan nama organisasi atau brand yang akan tampil ke publik.</li>
                                <li>• Tambahkan website atau sosial media untuk mempercepat proses verifikasi.</li>
                                <li>• Jelaskan tipe event yang biasa Anda kelola agar konteks pengajuan lebih jelas.</li>
                            </ul>
                        </EditorialPanel>
                        <EditorialPanel className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                                Need assistance?
                            </p>
                            <p className="text-sm leading-7 text-(--text-secondary) sm:text-base">
                                Jika Anda membutuhkan penjelasan lebih lanjut sebelum mendaftar, tim kami siap membantu melalui halaman kontak publik Gelaran.
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex min-h-11 items-center justify-center rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-(--surface-hover)"
                            >
                                Hubungi tim Gelaran
                            </Link>
                        </EditorialPanel>
                    </div>

                    <EditorialPanel className="p-6 sm:p-8">
                        <div id="organizer-form" className="scroll-mt-32">
                            <div className="mb-6 flex items-start gap-4">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary) shadow-(--shadow-xs)">
                                    <Building2 className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-(--tracking-heading) text-foreground">
                                        Organization details
                                    </h2>
                                    <p className="text-sm text-(--text-secondary) sm:text-base">
                                        Informasi ini membantu kami memahami identitas dan kesiapan organisasi Anda.
                                    </p>
                                </div>
                            </div>

                            {error ? (
                                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[rgba(217,79,61,0.24)] bg-(--error-bg) p-4 text-sm text-(--error-text)">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            ) : null}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="organizationName" className="text-sm font-semibold text-foreground">
                                        Organization name <span className="text-(--error)">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-muted)" />
                                        <input
                                            type="text"
                                            id="organizationName"
                                            value={formData.organizationName}
                                            onChange={(e) => handleInputChange("organizationName", e.target.value)}
                                            placeholder="Nama organisasi atau brand Anda"
                                            className={`min-h-12 w-full rounded-2xl border bg-(--surface) py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors duration-200 focus:ring-4 focus:ring-(--info-bg) ${formErrors.organizationName
                                                    ? "border-(--error) focus:border-(--error)"
                                                    : "border-(--border) focus:border-(--border-focus)"
                                                }`}
                                        />
                                    </div>
                                    {formErrors.organizationName ? (
                                        <p className="text-sm text-(--error-text)">{formErrors.organizationName}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="organizationDescription" className="text-sm font-semibold text-foreground">
                                        Description
                                    </label>
                                    <textarea
                                        id="organizationDescription"
                                        rows={5}
                                        value={formData.organizationDescription}
                                        onChange={(e) => handleInputChange("organizationDescription", e.target.value)}
                                        placeholder="Ceritakan jenis event yang Anda kelola, audiens utama, dan pengalaman yang ingin Anda bangun."
                                        className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-foreground outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="websiteUrl" className="text-sm font-semibold text-foreground">
                                        Website
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-muted)" />
                                        <input
                                            type="url"
                                            id="websiteUrl"
                                            value={formData.websiteUrl}
                                            onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                                            placeholder="https://website-anda.com"
                                            className={`min-h-12 w-full rounded-2xl border bg-(--surface) py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors duration-200 focus:ring-4 focus:ring-(--info-bg) ${formErrors.websiteUrl
                                                    ? "border-(--error) focus:border-(--error)"
                                                    : "border-(--border) focus:border-(--border-focus)"
                                                }`}
                                        />
                                    </div>
                                    {formErrors.websiteUrl ? (
                                        <p className="text-sm text-(--error-text)">{formErrors.websiteUrl}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-3">
                                    <span className="text-sm font-semibold text-foreground">Social media</span>
                                    <div className="grid gap-3">
                                        <div className="relative">
                                            <Instagram className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-muted)" />
                                            <input
                                                type="text"
                                                id="socialInstagram"
                                                value={formData.socialInstagram}
                                                onChange={(e) => handleInputChange("socialInstagram", e.target.value)}
                                                placeholder="Instagram username"
                                                className="min-h-12 w-full rounded-2xl border border-(--border) bg-(--surface) py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Facebook className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-muted)" />
                                            <input
                                                type="text"
                                                id="socialFacebook"
                                                value={formData.socialFacebook}
                                                onChange={(e) => handleInputChange("socialFacebook", e.target.value)}
                                                placeholder="Facebook page URL"
                                                className="min-h-12 w-full rounded-2xl border border-(--border) bg-(--surface) py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Twitter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-muted)" />
                                            <input
                                                type="text"
                                                id="socialTwitter"
                                                value={formData.socialTwitter}
                                                onChange={(e) => handleInputChange("socialTwitter", e.target.value)}
                                                placeholder="Twitter/X username"
                                                className="min-h-12 w-full rounded-2xl border border-(--border) bg-(--surface) py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center text-(--text-muted)">
                                                ♪
                                            </span>
                                            <input
                                                type="text"
                                                id="socialTiktok"
                                                value={formData.socialTiktok}
                                                onChange={(e) => handleInputChange("socialTiktok", e.target.value)}
                                                placeholder="TikTok username"
                                                className="min-h-12 w-full rounded-2xl border border-(--border) bg-(--surface) py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-(--border) bg-(--surface-brand-soft) px-5 py-4 text-sm leading-7 text-(--text-secondary)">
                                    Dengan mengirim pengajuan ini, Anda menyetujui ketentuan privasi yang berlaku pada <Link href="/privacy" className="font-semibold text-(--accent-primary) hover:text-(--accent-primary-hover)">Kebijakan Privasi</Link> Gelaran. Halaman <code>/terms</code> belum tersedia dalam scope saat ini, sehingga tidak ditautkan di sini.
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-(--accent-secondary) px-6 py-3 text-sm font-semibold text-white shadow-(--shadow-md) transition-colors duration-200 hover:bg-(--accent-secondary-hover) disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Mengirim pengajuan...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5" />
                                            Submit application
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </EditorialPanel>
                </div>
            </PublicSection>
        </PublicPageShell>
    );
}
