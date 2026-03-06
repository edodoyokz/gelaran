"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, ArrowRight } from "lucide-react";

interface HeroContent {
    title: string;
    subtitle: string;
    backgroundImage: string;
    searchPlaceholder: string;
    locationPlaceholder: string;
    ctaText: string;
}

const DEFAULT_CONTENT: HeroContent = {
    title: "Temukan Pengalaman\nTak Terlupakan.",
    subtitle: "Jelajahi konser, workshop, dan festival terbaik di sekitarmu.",
    backgroundImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    searchPlaceholder: "Konser, Festival...",
    locationPlaceholder: "Jakarta, Indonesia",
    ctaText: "Cari",
};

export function Hero() {
    const [content, setContent] = useState<HeroContent>(DEFAULT_CONTENT);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (loaded) return;

        const loadContent = async () => {
            try {
                const res = await fetch("/api/site-content?keys=hero");
                const data = await res.json();
                if (data.success && data.data?.hero) {
                    setContent({ ...DEFAULT_CONTENT, ...data.data.hero });
                }
            } catch {
            } finally {
                setLoaded(true);
            }
        };
        loadContent();
    }, [loaded]);

    const titleParts = content.title.split(/\n|<br\s*\/?>/i);

    return (
        <div className="relative min-h-[520px] md:min-h-[580px] w-full bg-slate-900 overflow-hidden pt-16 md:pt-20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 opacity-90 z-0" />

            <img
                src={content.backgroundImage}
                alt="Hero Background"
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay z-0"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent z-0" />

            <div className="relative flex flex-col justify-center items-center px-4 text-center z-10 py-12 md:py-16">
                <div className="space-y-4 max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-2xl">
                        {titleParts.map((part, i) => (
                            <span key={i} className="block">
                                {part}
                            </span>
                        ))}
                    </h1>
                    <p className="text-base md:text-xl text-white/80 max-w-xl mx-auto font-light leading-relaxed">
                        {content.subtitle}
                    </p>
                </div>

                <div className="w-full max-w-[92%] md:max-w-4xl mt-8 md:mt-10">
                    <div className="bg-[var(--surface-elevated)]/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-2 flex flex-col md:flex-row gap-2 md:gap-0 items-center border border-[var(--border)]">
                        <div className="flex-1 flex items-center w-full px-3 py-2.5 md:py-3 bg-[var(--bg-tertiary)] md:bg-transparent rounded-xl md:rounded-none md:border-r border-[var(--border)] group transition-colors hover:bg-[var(--surface-hover)]">
                            <Search className="text-[var(--accent-primary)] mr-3 shrink-0" size={20} />
                            <div className="flex flex-col text-left w-full">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                                    Cari Event
                                </label>
                                <input
                                    type="text"
                                    placeholder={content.searchPlaceholder}
                                    className="w-full outline-none text-[var(--text-primary)] font-semibold placeholder-[var(--text-muted)] bg-transparent text-sm md:text-base focus:placeholder-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex-1 flex items-center w-full px-3 py-2.5 md:py-3 bg-[var(--bg-tertiary)] md:bg-transparent rounded-xl md:rounded-none md:border-r border-[var(--border)] group transition-colors hover:bg-[var(--surface-hover)]">
                            <MapPin className="text-[var(--accent-primary)] mr-3 shrink-0" size={20} />
                            <div className="flex flex-col text-left w-full">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                                    Lokasi
                                </label>
                                <input
                                    type="text"
                                    placeholder={content.locationPlaceholder}
                                    className="w-full outline-none text-[var(--text-primary)] font-semibold placeholder-[var(--text-muted)] bg-transparent text-sm md:text-base focus:placeholder-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex-1 flex items-center w-full px-3 py-2.5 md:py-3 bg-[var(--bg-tertiary)] md:bg-transparent rounded-xl md:rounded-none group transition-colors hover:bg-[var(--surface-hover)]">
                            <Calendar className="text-[var(--accent-primary)] mr-3 shrink-0" size={20} />
                            <div className="flex flex-col text-left w-full">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                                    Tanggal
                                </label>
                                <input
                                    type="text"
                                    placeholder="Semua Tanggal"
                                    className="w-full outline-none text-[var(--text-primary)] font-semibold placeholder-[var(--text-muted)] bg-transparent text-sm md:text-base focus:placeholder-transparent"
                                />
                            </div>
                        </div>

                        <button className="w-full md:w-auto bg-[var(--accent-gradient)] hover:brightness-110 text-white font-bold py-3 md:py-3 px-8 rounded-xl md:rounded-xl transition-all shadow-glow transform active:scale-95 flex items-center justify-center gap-2 min-h-[48px] md:min-h-[52px] text-sm md:text-base">
                            <span>{content.ctaText}</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
