"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    LayoutTemplate,
    Search,
    Save,
    Loader2,
    CheckCircle,
    Globe,
    Link as LinkIcon,
    Plus,
    Trash2,
} from "lucide-react";
import {
    AdminNotice,
    AdminSurface,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useToast } from "@/components/ui/toast-provider";

interface HeroContent {
    title: string;
    subtitle: string;
    backgroundImage: string;
    searchPlaceholder: string;
    locationPlaceholder: string;
    ctaText: string;
}

interface FooterLink {
    label: string;
    href: string;
}

interface SocialLink {
    platform: string;
    url: string;
}

interface FooterContent {
    brandName: string;
    tagline: string;
    copyrightText: string;
    links: FooterLink[];
    socialLinks: SocialLink[];
}

interface SeoContent {
    siteTitle: string;
    siteDescription: string;
    siteKeywords: string;
    ogImage: string;
}

type SiteContentSection = HeroContent | FooterContent | SeoContent;

const DEFAULT_HERO: HeroContent = {
    title: "Find Your Next Experience",
    subtitle: "Discover the best events, concerts, and workshops near you.",
    backgroundImage: "",
    searchPlaceholder: "Search events, artists, or venues...",
    locationPlaceholder: "All Locations",
    ctaText: "Explore Events",
};

const DEFAULT_FOOTER: FooterContent = {
    brandName: "Gelaran",
    tagline: "Your gateway to unforgettable experiences.",
    copyrightText: "© 2024 Gelaran. All rights reserved.",
    links: [],
    socialLinks: [],
};

const DEFAULT_SEO: SeoContent = {
    siteTitle: "Gelaran - Buy Tickets for Events, Concerts & More",
    siteDescription:
        "Secure your spot at the hottest events. Gelaran offers a seamless booking experience for concerts, workshops, and festivals.",
    siteKeywords: "tickets, events, concerts, workshops, booking, bsc",
    ogImage: "",
};

const SECTIONS = [
    {
        id: "hero" as const,
        label: "Hero Section",
        icon: LayoutTemplate,
        description: "Manage the main landing banner",
    },
    {
        id: "footer" as const,
        label: "Footer",
        icon: LinkIcon,
        description: "Links, branding, and social media",
    },
    {
        id: "seo" as const,
        label: "SEO & Meta",
        icon: Globe,
        description: "Search engine optimization settings",
    },
];

const inputClass =
    "w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm text-foreground outline-none focus:border-(--accent-primary)";

function SaveButton({
    section,
    isSaving,
    success,
    onSave,
}: {
    section: string;
    isSaving: string | null;
    success: string | null;
    onSave: () => void;
}) {
    const isActive = isSaving === section;
    const isSuccess = success === section;
    return (
        <button
            type="button"
            onClick={onSave}
            disabled={isActive}
            className="inline-flex items-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-glow) disabled:opacity-50"
        >
            {isActive ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : isSuccess ? (
                <><CheckCircle className="h-4 w-4" /> Saved!</>
            ) : (
                <><Save className="h-4 w-4" /> Save changes</>
            )}
        </button>
    );
}

export default function AdminLandingPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO);
    const [footer, setFooter] = useState<FooterContent>(DEFAULT_FOOTER);
    const [seo, setSeo] = useState<SeoContent>(DEFAULT_SEO);

    const [activeSection, setActiveSection] = useState<"hero" | "footer" | "seo">("hero");

    const fetchContent = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/admin/site-content");

            if (!res.ok) {
                if (res.status === 401) return router.push("/login");
                if (res.status === 403) return router.push("/admin");
                throw new Error("Failed to load content");
            }

            const data = await res.json();
            if (data.success) {
                if (data.data.hero) setHero({ ...DEFAULT_HERO, ...data.data.hero });
                if (data.data.footer) setFooter({ ...DEFAULT_FOOTER, ...data.data.footer });
                if (data.data.seo) setSeo({ ...DEFAULT_SEO, ...data.data.seo });
            }
        } catch {
            setError("Failed to load content");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const saveSection = async (key: string, value: SiteContentSection) => {
        try {
            setIsSaving(key);
            setSuccess(null);

            const res = await fetch("/api/admin/site-content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, value }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to save");
            }

            setSuccess(key);
            setTimeout(() => setSuccess(null), 3000);
            showToast("Changes saved successfully", "success");
        } catch {
            showToast("Failed to save changes", "error");
        } finally {
            setIsSaving(null);
        }
    };

    const addFooterLink = () =>
        setFooter((prev) => ({ ...prev, links: [...prev.links, { label: "New Link", href: "/" }] }));

    const updateFooterLink = (index: number, field: keyof FooterLink, value: string) => {
        const newLinks = [...footer.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFooter((prev) => ({ ...prev, links: newLinks }));
    };

    const removeFooterLink = (index: number) =>
        setFooter((prev) => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));

    const addSocialLink = () =>
        setFooter((prev) => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { platform: "twitter", url: "https://" }],
        }));

    const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
        const newLinks = [...footer.socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFooter((prev) => ({ ...prev, socialLinks: newLinks }));
    };

    const removeSocialLink = (index: number) =>
        setFooter((prev) => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index),
        }));

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <AdminWorkspacePage
                eyebrow="Admin content"
                title="Landing page editor"
                description="Manage your website's public-facing content and SEO configuration."
            >
                <AdminNotice
                    tone="warning"
                    title="Content data is unavailable"
                    description={error}
                    actionHref="/admin"
                    actionLabel="Back to dashboard"
                />
            </AdminWorkspacePage>
        );
    }

    return (
        <AdminWorkspacePage
            eyebrow="Admin content"
            title="Landing page editor"
            description="Manage your website's public-facing content and SEO configuration."
        >
            {/* Section nav */}
            <nav className="flex gap-2 flex-wrap">
                {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => setActiveSection(section.id)}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                isActive
                                    ? "bg-(--accent-gradient) text-white shadow-(--shadow-glow)"
                                    : "border border-(--border) bg-(--surface) text-(--text-secondary) hover:bg-(--surface-elevated)"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {section.label}
                        </button>
                    );
                })}
            </nav>

            {/* Hero section */}
            {activeSection === "hero" && (
                <AdminSurface
                    title="Hero Section"
                    description="Customize the main banner of your landing page."
                    action={
                        <SaveButton
                            section="hero"
                            isSaving={isSaving}
                            success={success}
                            onSave={() => saveSection("hero", hero)}
                        />
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">
                                    Headline title
                                </label>
                                <input
                                    type="text"
                                    value={hero.title}
                                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                                    className={inputClass}
                                    placeholder="e.g. Find Your Next Experience"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">
                                    Subtitle
                                </label>
                                <textarea
                                    value={hero.subtitle}
                                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                    placeholder="e.g. Discover the best events..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">
                                    CTA button text
                                </label>
                                <input
                                    type="text"
                                    value={hero.ctaText}
                                    onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                                    className={inputClass}
                                />
                            </div>

                            <div className="pt-4 border-t border-(--border)">
                                <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                                    <Search className="h-4 w-4 text-(--accent-primary)" />
                                    Search bar configuration
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs text-(--text-muted) mb-1">Search placeholder</label>
                                        <input
                                            type="text"
                                            value={hero.searchPlaceholder}
                                            onChange={(e) => setHero({ ...hero, searchPlaceholder: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-(--text-muted) mb-1">Location placeholder</label>
                                        <input
                                            type="text"
                                            value={hero.locationPlaceholder}
                                            onChange={(e) => setHero({ ...hero, locationPlaceholder: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ImageUploadField
                                label="Hero background image"
                                value={hero.backgroundImage}
                                onChange={(url) => setHero({ ...hero, backgroundImage: url })}
                                bucket="site"
                                folder="hero"
                                aspectRatio="16/9"
                                className="h-full"
                            />

                            <div className="rounded-2xl overflow-hidden bg-(--surface-elevated) border border-(--border)">
                                <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-widest px-4 pt-3 pb-2">
                                    Live preview (approximation)
                                </p>
                                <div className="relative h-44 flex items-center justify-center text-center text-white isolate">
                                    {hero.backgroundImage ? (
                                        <Image
                                            src={hero.backgroundImage}
                                            alt="Hero Preview"
                                            fill
                                            className="object-cover -z-10"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gray-900 -z-10" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 -z-10" />
                                    <div className="px-4">
                                        <h2 className="text-xl font-bold mb-2">{hero.title}</h2>
                                        <p className="text-sm opacity-90">{hero.subtitle}</p>
                                        <div className="mt-4 inline-block px-4 py-2 bg-(--accent-primary) rounded-full text-xs font-bold">
                                            {hero.ctaText}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AdminSurface>
            )}

            {/* Footer section */}
            {activeSection === "footer" && (
                <AdminSurface
                    title="Footer settings"
                    description="Manage links, copyright, and company info."
                    action={
                        <SaveButton
                            section="footer"
                            isSaving={isSaving}
                            success={success}
                            onSave={() => saveSection("footer", footer)}
                        />
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Brand name</label>
                                <input
                                    type="text"
                                    value={footer.brandName}
                                    onChange={(e) => setFooter({ ...footer, brandName: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Tagline / description</label>
                                <textarea
                                    value={footer.tagline}
                                    onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Copyright text</label>
                                <input
                                    type="text"
                                    value={footer.copyrightText}
                                    onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-(--text-secondary)">Footer links</label>
                                    <button
                                        type="button"
                                        onClick={addFooterLink}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-(--accent-primary) hover:opacity-80"
                                    >
                                        <Plus className="h-3 w-3" /> Add link
                                    </button>
                                </div>
                                <div className="space-y-2 rounded-2xl border border-(--border) bg-(--surface-elevated) p-4 max-h-64 overflow-y-auto">
                                    {footer.links.length === 0 && (
                                        <p className="text-sm text-(--text-muted) text-center py-4">No links added yet</p>
                                    )}
                                    {footer.links.map((link, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={link.label}
                                                onChange={(e) => updateFooterLink(index, "label", e.target.value)}
                                                placeholder="Label"
                                                className="flex-1 rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm text-foreground outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={link.href}
                                                onChange={(e) => updateFooterLink(index, "href", e.target.value)}
                                                placeholder="/path"
                                                className="flex-1 rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm text-foreground outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFooterLink(index)}
                                                className="p-2 text-(--text-muted) hover:text-red-600 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-(--text-secondary)">Social media</label>
                                    <button
                                        type="button"
                                        onClick={addSocialLink}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-(--accent-primary) hover:opacity-80"
                                    >
                                        <Plus className="h-3 w-3" /> Add social
                                    </button>
                                </div>
                                <div className="space-y-2 rounded-2xl border border-(--border) bg-(--surface-elevated) p-4 max-h-64 overflow-y-auto">
                                    {footer.socialLinks.length === 0 && (
                                        <p className="text-sm text-(--text-muted) text-center py-4">No social links added yet</p>
                                    )}
                                    {footer.socialLinks.map((link, index) => (
                                        <div key={index} className="flex gap-2">
                                            <select
                                                value={link.platform}
                                                onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                                                className="rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm text-foreground outline-none w-28"
                                            >
                                                <option value="twitter">Twitter</option>
                                                <option value="facebook">Facebook</option>
                                                <option value="instagram">Instagram</option>
                                                <option value="youtube">YouTube</option>
                                                <option value="linkedin">LinkedIn</option>
                                                <option value="tiktok">TikTok</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={link.url}
                                                onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                                                placeholder="https://..."
                                                className="flex-1 rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm text-foreground outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSocialLink(index)}
                                                className="p-2 text-(--text-muted) hover:text-red-600 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </AdminSurface>
            )}

            {/* SEO section */}
            {activeSection === "seo" && (
                <AdminSurface
                    title="SEO & meta tags"
                    description="Optimise how your site appears in search engines and social sharing."
                    action={
                        <SaveButton
                            section="seo"
                            isSaving={isSaving}
                            success={success}
                            onSave={() => saveSection("seo", seo)}
                        />
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Site title</label>
                                <input
                                    type="text"
                                    value={seo.siteTitle}
                                    onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                                    className={inputClass}
                                />
                                <p className="mt-1 text-xs text-(--text-muted)">Recommend 50-60 characters</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">
                                    Meta description
                                </label>
                                <textarea
                                    value={seo.siteDescription}
                                    onChange={(e) => setSeo({ ...seo, siteDescription: e.target.value })}
                                    rows={4}
                                    className={`${inputClass} resize-none`}
                                />
                                <p className="mt-1 text-xs text-(--text-muted)">Recommend 150-160 characters</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Keywords</label>
                                <input
                                    type="text"
                                    value={seo.siteKeywords}
                                    onChange={(e) => setSeo({ ...seo, siteKeywords: e.target.value })}
                                    placeholder="event, ticket, concert..."
                                    className={inputClass}
                                />
                                <p className="mt-1 text-xs text-(--text-muted)">Separate with commas</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ImageUploadField
                                label="Open Graph (OG) image"
                                value={seo.ogImage}
                                onChange={(url) => setSeo({ ...seo, ogImage: url })}
                                bucket="site"
                                folder="seo"
                                aspectRatio="1.91/1"
                                className="mb-4"
                            />
                            <div className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-4 text-sm text-(--text-secondary)">
                                <p className="font-medium mb-1">What is an OG Image?</p>
                                <p>
                                    This image is displayed when your website link is shared on social media platforms like
                                    Facebook, Twitter (X), and LinkedIn. Recommended size: 1200 × 630 pixels.
                                </p>
                            </div>
                        </div>
                    </div>
                </AdminSurface>
            )}
        </AdminWorkspacePage>
    );
}
