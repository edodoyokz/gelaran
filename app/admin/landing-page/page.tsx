"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
    AlertCircle,
    ArrowLeft,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

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
    siteDescription: "Secure your spot at the hottest events. Gelaran offers a seamless booking experience for concerts, workshops, and festivals.",
    siteKeywords: "tickets, events, concerts, workshops, booking, bsc",
    ogImage: "",
};

export default function AdminLandingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
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
        } catch (err) {
            console.error(err);
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
            setError(null);

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
        } catch (err) {
            console.error(err);
            setError("Failed to save changes");
        } finally {
            setIsSaving(null);
        }
    };

    const addFooterLink = () => {
        setFooter(prev => ({
            ...prev,
            links: [...prev.links, { label: "New Link", href: "/" }]
        }));
    };

    const updateFooterLink = (index: number, field: keyof FooterLink, value: string) => {
        const newLinks = [...footer.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFooter(prev => ({ ...prev, links: newLinks }));
    };

    const removeFooterLink = (index: number) => {
        setFooter(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
    };

    const addSocialLink = () => {
        setFooter(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { platform: "twitter", url: "https://" }]
        }));
    };

    const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
        const newLinks = [...footer.socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFooter(prev => ({ ...prev, socialLinks: newLinks }));
    };

    const removeSocialLink = (index: number) => {
        setFooter(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index)
        }));
    };

    const SECTIONS = [
        { id: "hero" as const, label: "Hero Section", icon: LayoutTemplate, description: "Manage the main landing banner" },
        { id: "footer" as const, label: "Footer", icon: LinkIcon, description: "Links, branding, and social media" },
        { id: "seo" as const, label: "SEO & Meta", icon: Globe, description: "Search engine optimization settings" },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--surface-hover)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Loading content...</p>
                </div>
            </div>
        );
    }

    if (error && !hero) {
        return (
            <div className="min-h-screen bg-[var(--surface-hover)] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-[var(--surface)] rounded-xl shadow-sm">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Error Loading Content</h3>
                    <p className="text-[var(--text-secondary)] mb-6">{error}</p>
                    <Link 
                        href="/admin" 
                        className="inline-flex items-center justify-center px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <AdminHeader 
                title="Landing Page" 
                subtitle="Manage your website's public content"
                backHref="/admin"
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3 space-y-4">
                        <nav className="space-y-1">
                            {SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                                        activeSection === section.id
                                            ? "bg-[var(--surface)] text-[var(--accent-primary)] shadow-sm ring-1 ring-black/5"
                                            : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] hover:shadow-sm"
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg ${
                                        activeSection === section.id ? "bg-[var(--accent-primary)]/10" : "bg-[var(--bg-secondary)] group-hover:bg-[var(--surface)]"
                                    }`}>
                                        <section.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{section.label}</p>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="lg:col-span-9 space-y-6">
                        {activeSection === "hero" && (
                            <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
                                <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-hover)]/50">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Hero Section</h2>
                                        <p className="text-sm text-[var(--text-muted)]">Customize the main banner of your landing page</p>
                                    </div>
                                    <button
                                        onClick={() => saveSection("hero", hero)}
                                        disabled={isSaving === "hero"}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-200"
                                    >
                                        {isSaving === "hero" ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : success === "hero" ? (
                                            <>
                                                <CheckCircle className="h-4 w-4" />
                                                Saved!
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-6 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                    Headline Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={hero.title}
                                                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                                                    placeholder="e.g. Find Your Next Experience"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                    Subtitle
                                                </label>
                                                <textarea
                                                    value={hero.subtitle}
                                                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all resize-none"
                                                    placeholder="e.g. Discover the best events..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                        CTA Button Text
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={hero.ctaText}
                                                        onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                                                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <ImageUploadField
                                                label="Hero Background Image"
                                                value={hero.backgroundImage}
                                                onChange={(url) => setHero({ ...hero, backgroundImage: url })}
                                                bucket="site"
                                                folder="hero"
                                                aspectRatio="16/9"
                                                className="h-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-[var(--border)]">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                            <Search className="h-4 w-4 text-indigo-500" />
                                            Search Bar Configuration
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                    Search Placeholder
                                                </label>
                                                <input
                                                    type="text"
                                                    value={hero.searchPlaceholder}
                                                    onChange={(e) => setHero({ ...hero, searchPlaceholder: e.target.value })}
                                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                    Location Placeholder
                                                </label>
                                                <input
                                                    type="text"
                                                    value={hero.locationPlaceholder}
                                                    onChange={(e) => setHero({ ...hero, locationPlaceholder: e.target.value })}
                                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
                                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Live Preview (Approximation)</p>
                                        <div className="relative rounded-lg overflow-hidden h-48 flex items-center justify-center text-center text-white isolate">
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
                                                <h1 className="text-2xl font-bold mb-2">{hero.title}</h1>
                                                <p className="text-sm opacity-90">{hero.subtitle}</p>
                                                <div className="mt-4 inline-block px-4 py-2 bg-[var(--accent-primary)] rounded-md text-xs font-bold">
                                                    {hero.ctaText}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "footer" && (
                            <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
                                <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-hover)]/50">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Footer Settings</h2>
                                        <p className="text-sm text-[var(--text-muted)]">Manage links, copyright and company info</p>
                                    </div>
                                    <button
                                        onClick={() => saveSection("footer", footer)}
                                        disabled={isSaving === "footer"}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-200"
                                    >
                                        {isSaving === "footer" ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : success === "footer" ? (
                                            <>
                                                <CheckCircle className="h-4 w-4" />
                                                Saved!
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-6 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                    Brand Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={footer.brandName}
                                                    onChange={(e) => setFooter({ ...footer, brandName: e.target.value })}
                                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                    Tagline / Description
                                                </label>
                                                <textarea
                                                    value={footer.tagline}
                                                    onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                    Copyright Text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={footer.copyrightText}
                                                    onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-[var(--text-secondary)]">
                                                        Footer Links
                                                    </label>
                                                    <button 
                                                        onClick={addFooterLink}
                                                        className="text-xs flex items-center text-[var(--accent-primary)] hover:text-[var(--accent-primary)] font-medium"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" /> Add Link
                                                    </button>
                                                </div>
                                                <div className="space-y-3 bg-[var(--surface-hover)] p-4 rounded-xl border border-[var(--border)] max-h-[300px] overflow-y-auto">
                                                    {footer.links.length === 0 && (
                                                        <p className="text-sm text-[var(--text-muted)] text-center py-4">No links added yet</p>
                                                    )}
                                                    {footer.links.map((link, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={link.label}
                                                                onChange={(e) => updateFooterLink(index, "label", e.target.value)}
                                                                placeholder="Label"
                                                                className="flex-1 px-3 py-1.5 text-sm border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={link.href}
                                                                onChange={(e) => updateFooterLink(index, "href", e.target.value)}
                                                                placeholder="/path"
                                                                className="flex-1 px-3 py-1.5 text-sm border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                                            />
                                                            <button
                                                                onClick={() => removeFooterLink(index)}
                                                                className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-[var(--text-secondary)]">
                                                        Social Media
                                                    </label>
                                                    <button 
                                                        onClick={addSocialLink}
                                                        className="text-xs flex items-center text-[var(--accent-primary)] hover:text-[var(--accent-primary)] font-medium"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" /> Add Social
                                                    </button>
                                                </div>
                                                <div className="space-y-3 bg-[var(--surface-hover)] p-4 rounded-xl border border-[var(--border)] max-h-[300px] overflow-y-auto">
                                                    {footer.socialLinks.length === 0 && (
                                                        <p className="text-sm text-[var(--text-muted)] text-center py-4">No social links added yet</p>
                                                    )}
                                                    {footer.socialLinks.map((link, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <select
                                                                value={link.platform}
                                                                onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                                                                className="w-28 px-3 py-1.5 text-sm border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
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
                                                                className="flex-1 px-3 py-1.5 text-sm border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                                            />
                                                            <button
                                                                onClick={() => removeSocialLink(index)}
                                                                className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "seo" && (
                            <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
                                <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-hover)]/50">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--text-primary)]">SEO & Meta Tags</h2>
                                        <p className="text-sm text-[var(--text-muted)]">Optimize how your site appears in search engines and social sharing</p>
                                    </div>
                                    <button
                                        onClick={() => saveSection("seo", seo)}
                                        disabled={isSaving === "seo"}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-200"
                                    >
                                        {isSaving === "seo" ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : success === "seo" ? (
                                            <>
                                                <CheckCircle className="h-4 w-4" />
                                                Saved!
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-6 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                    Site Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={seo.siteTitle}
                                                    onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                />
                                                <p className="text-xs text-[var(--text-muted)] mt-1">Recommend 50-60 characters</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                    Meta Description
                                                </label>
                                                <textarea
                                                    value={seo.siteDescription}
                                                    onChange={(e) => setSeo({ ...seo, siteDescription: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent resize-none"
                                                />
                                                <p className="text-xs text-[var(--text-muted)] mt-1">Recommend 150-160 characters</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                    Keywords
                                                </label>
                                                <input
                                                    type="text"
                                                    value={seo.siteKeywords}
                                                    onChange={(e) => setSeo({ ...seo, siteKeywords: e.target.value })}
                                                    placeholder="event, ticket, concert..."
                                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                                />
                                                <p className="text-xs text-[var(--text-muted)] mt-1">Separate with commas</p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <ImageUploadField
                                                label="Open Graph (OG) Image"
                                                value={seo.ogImage}
                                                onChange={(url) => setSeo({ ...seo, ogImage: url })}
                                                bucket="site"
                                                folder="seo"
                                                aspectRatio="1.91/1"
                                                className="mb-4"
                                            />
                                            <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg p-4 text-sm text-[var(--text-secondary)]">
                                                <p className="font-medium mb-1">What is an OG Image?</p>
                                                <p>This image is displayed when your website link is shared on social media platforms like Facebook, Twitter (X), and LinkedIn. Recommended size: 1200x630 pixels.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
