import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    Globe,
    Heart,
    Landmark,
    Shield,
    Sparkles,
} from "lucide-react";
import {
    EditorialPanel,
    FeatureGrid,
    MarketingHero,
    PublicPageShell,
    PublicSection,
} from "@/components/shared/public-marketing";

export const metadata: Metadata = {
    title: "Tentang Gelaran",
    description:
        "Gelaran adalah platform ticketing event terpercaya di Indonesia yang membantu organizer dan penonton terhubung melalui pengalaman event yang lebih terkurasi.",
};

const STATS = [
    { value: "500K+", label: "Tiket terjual" },
    { value: "2,000+", label: "Event sukses" },
    { value: "1,500+", label: "Organizer aktif" },
    { value: "50+", label: "Kota terhubung" },
];

const VALUES = [
    {
        icon: Shield,
        title: "Terpercaya",
        description: "Keamanan transaksi, kejelasan informasi, dan perlindungan data menjadi fondasi pengalaman yang kami bangun.",
    },
    {
        icon: Sparkles,
        title: "Terkurasi",
        description: "Kami merancang Gelaran agar setiap halaman publik terasa lebih editorial, fokus, dan memandu pengunjung ke event yang tepat.",
    },
    {
        icon: Heart,
        title: "Berempati",
        description: "Kami memperhatikan kebutuhan penonton dan organizer agar perjalanan dari penemuan hingga kehadiran terasa lebih manusiawi.",
    },
    {
        icon: Globe,
        title: "Inklusif",
        description: "Platform ini dirancang agar dapat dipahami oleh audiens luas, diakses lintas perangkat, dan tetap terasa dekat dengan konteks lokal.",
    },
];

const PILLARS = [
    {
        title: "Cultural discovery",
        body: "Menghubungkan audiens dengan event yang punya nilai cerita, identitas lokal, dan pengalaman yang berkesan.",
    },
    {
        title: "Operational clarity",
        body: "Membantu organizer mengelola distribusi tiket, komunikasi, dan performa event dari satu ekosistem yang jelas.",
    },
    {
        title: "Brand trust",
        body: "Membangun pengalaman yang konsisten dari halaman marketing sampai dashboard agar setiap interaksi terasa lebih profesional.",
    },
];

const TEAM = [
    { name: "Andi Wijaya", role: "CEO & Founder" },
    { name: "Sari Dewi", role: "Chief Product Officer" },
    { name: "Budi Santoso", role: "Head of Operations" },
    { name: "Maya Putri", role: "Brand & Growth Lead" },
];

export default function AboutPage() {
    return (
        <PublicPageShell
            hero={
                <MarketingHero
                    eyebrow="About Gelaran"
                    title={<>Mengarsipkan semangat event Indonesia dalam pengalaman digital yang lebih <em className="text-(--accent-secondary) not-italic">jelas</em>.</>}
                    description={
                        <p>
                            Gelaran lahir untuk menjembatani organizer, komunitas, dan penonton dengan presentasi event yang lebih terstruktur—
                            mengutamakan konteks, kepercayaan, dan pengalaman yang mudah dipahami sejak kunjungan pertama.
                        </p>
                    }
                    primaryCta={{ href: "/events", label: "Lihat event" }}
                    secondaryCta={{ href: "/become-organizer", label: "Bergabung sebagai organizer" }}
                    stats={STATS.map((stat, index) => ({
                        label: stat.label,
                        value: stat.value,
                        tone: index === 0 ? "accent" : index === 1 ? "default" : index === 2 ? "success" : "warning",
                    }))}
                    aside={
                        <EditorialPanel className="max-w-xl space-y-5">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--text-muted)">
                                    Misi kami
                                </p>
                                <h2 className="font-(--font-editorial) text-3xl leading-tight tracking-(--tracking-display) text-foreground sm:text-4xl">
                                    Membuat event lebih mudah ditemukan, lebih mudah dipercaya, dan lebih mudah dikelola.
                                </h2>
                            </div>
                            <p className="text-sm leading-7 text-(--text-secondary) sm:text-base">
                                Kami melihat halaman event bukan hanya sebagai katalog, tetapi sebagai ruang kurasi yang membantu pengguna memahami kualitas pengalaman sebelum mereka membeli tiket.
                            </p>
                            <div className="rounded-2xl border border-(--border) bg-(--surface-brand-soft) px-5 py-4 text-sm leading-7 text-(--text-secondary)">
                                Pendekatan ini mengikuti baseline publik Gelaran yang terang, editorial, dan mengutamakan hierarki informasi yang bersih.
                            </div>
                        </EditorialPanel>
                    }
                />
            }
        >
            <PublicSection
                eyebrow="Our story"
                title="Di balik Gelaran ada obsesi untuk merapikan pengalaman event dari hulu ke hilir"
                description="Kami membangun platform ini untuk mengurangi friksi antara rasa penasaran audiens dan kebutuhan organizer akan sistem yang lebih andal."
                className="pt-0"
            >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
                    <EditorialPanel className="h-full overflow-hidden p-0">
                        <div className="flex h-full min-h-88 flex-col justify-between bg-[linear-gradient(160deg,rgba(1,89,89,0.96),rgba(41,179,182,0.72))] p-8 text-white sm:p-10">
                            <Landmark className="h-12 w-12 text-white/86" />
                            <div className="space-y-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                                    Founded in Indonesia
                                </p>
                                <h3 className="font-(--font-editorial) text-4xl leading-[0.96] tracking-(--tracking-display) sm:text-5xl">
                                    Event experiences deserve context, not clutter.
                                </h3>
                                <p className="max-w-lg text-sm leading-7 text-white/78 sm:text-base">
                                    Dari landing page hingga halaman pendukung, setiap touchpoint Gelaran dirancang untuk terasa tenang, percaya diri, dan mudah ditelusuri.
                                </p>
                            </div>
                        </div>
                    </EditorialPanel>

                    <div className="space-y-5">
                        <EditorialPanel>
                            <p className="font-(--font-editorial) text-2xl italic leading-relaxed text-foreground sm:text-3xl">
                                “Kami ingin Gelaran membantu orang memutuskan untuk hadir di sebuah event dengan keyakinan yang lebih besar.”
                            </p>
                        </EditorialPanel>
                        <EditorialPanel className="space-y-4">
                            <p className="text-sm leading-8 text-(--text-secondary) sm:text-base">
                                Banyak platform event terlihat ramai, tetapi tidak selalu membantu pengguna memahami apa yang membuat sebuah event layak diikuti. Gelaran hadir dengan pendekatan yang lebih terarah: visual yang konsisten, struktur informasi yang jelas, dan CTA yang tidak membingungkan.
                            </p>
                            <p className="text-sm leading-8 text-(--text-secondary) sm:text-base">
                                Untuk organizer, itu berarti ruang presentasi yang lebih profesional. Untuk penonton, itu berarti proses menemukan event yang terasa lebih meyakinkan. Untuk brand, itu berarti pengalaman publik yang selaras dengan sistem internal di balik layar.
                            </p>
                        </EditorialPanel>
                    </div>
                </div>
            </PublicSection>

            <PublicSection
                eyebrow="Core values"
                title="Nilai yang membentuk keputusan desain dan produk kami"
                description="Nilai-nilai ini diterjemahkan langsung ke dalam tone visual publik, treatment CTA, pola layout, dan rasa keseluruhan Gelaran."
                className="pt-0"
            >
                <FeatureGrid items={VALUES} columns={4} />
            </PublicSection>

            <PublicSection
                eyebrow="North star"
                title="Tiga pilar yang menjaga Gelaran tetap fokus"
                description="Kami menggunakan pilar ini sebagai acuan untuk menilai fitur, prioritas konten, dan bagaimana halaman-halaman publik seharusnya terasa."
                className="pt-0"
            >
                <div className="grid gap-px overflow-hidden rounded-[calc(var(--radius-3xl)+0.25rem)] border border-(--border) bg-(--border) lg:grid-cols-3">
                    {PILLARS.map((pillar, index) => (
                        <div key={pillar.title} className="bg-(--surface) p-8 sm:p-10">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--text-muted)">
                                0{index + 1}
                            </p>
                            <h3 className="mt-4 font-(--font-editorial) text-3xl leading-tight tracking-(--tracking-display) text-foreground">
                                {pillar.title}
                            </h3>
                            <p className="mt-4 text-sm leading-8 text-(--text-secondary) sm:text-base">
                                {pillar.body}
                            </p>
                        </div>
                    ))}
                </div>
            </PublicSection>

            <PublicSection
                eyebrow="People behind Gelaran"
                title="Tim yang menjaga produk, operasi, dan brand tetap seirama"
                description="Peran-peran inti ini merepresentasikan fokus lintas fungsi yang dibutuhkan untuk membuat pengalaman event terasa menyatu."
                className="pt-0"
            >
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {TEAM.map((member) => (
                        <EditorialPanel key={member.name} className="text-center">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-(--surface-brand-soft) text-2xl font-semibold text-(--accent-primary) shadow-(--shadow-xs)">
                                {member.name
                                    .split(" ")
                                    .map((part) => part[0])
                                    .join("")}
                            </div>
                            <h3 className="mt-5 text-lg font-semibold tracking-(--tracking-heading) text-foreground">
                                {member.name}
                            </h3>
                            <p className="mt-1 text-sm text-(--text-secondary)">{member.role}</p>
                        </EditorialPanel>
                    ))}
                </div>
            </PublicSection>

            <PublicSection
                title="Siap membangun event dengan fondasi yang lebih rapi?"
                className="pt-0"
                contentClassName="space-y-0"
            >
                <EditorialPanel className="overflow-hidden bg-[linear-gradient(135deg,rgba(1,89,89,0.08),rgba(249,93,0,0.1))]">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div className="space-y-4">
                            <span className="inline-flex rounded-full border border-(--border) bg-white/80 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-(--accent-primary)">
                                Continue with Gelaran
                            </span>
                            <h2 className="font-(--font-editorial) text-4xl leading-[0.96] tracking-(--tracking-display) text-foreground sm:text-5xl">
                                Siap membangun event dengan fondasi yang lebih rapi?
                            </h2>
                            <p className="max-w-2xl text-sm leading-8 text-(--text-secondary) sm:text-base">
                                Mulai dari menjelajahi event publik atau daftar sebagai organizer untuk membawa pengalaman brand kamu ke ekosistem Gelaran.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                            <Link
                                href="/become-organizer"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-(--accent-secondary) px-6 py-3 text-sm font-semibold text-white shadow-(--shadow-md) transition-colors duration-200 hover:bg-(--accent-secondary-hover)"
                            >
                                Daftar sebagai organizer
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-(--border) bg-white/80 px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-white"
                            >
                                Hubungi tim kami
                            </Link>
                        </div>
                    </div>
                </EditorialPanel>
            </PublicSection>
        </PublicPageShell>
    );
}
