"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar } from "lucide-react";

interface HeroContent {
    title: string;
    subtitle: string;
    backgroundImage: string;
    searchPlaceholder: string;
    locationPlaceholder: string;
    ctaText: string;
}

const DEFAULT_CONTENT: HeroContent = {
    title: "Temukan Pengalaman Tak Terlupakan.",
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
        <div className="relative h-[550px] w-full bg-slate-900 overflow-hidden">
            <img
                src={content.backgroundImage}
                alt="Hero Background"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />

            <div className="absolute inset-0 flex flex-col justify-center items-center px-4 text-center z-10 pt-16">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
                    {titleParts.map((part, i) => (
                        <span key={i}>
                            {part}
                            {i < titleParts.length - 1 && <br />}
                        </span>
                    ))}
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl font-light">
                    {content.subtitle}
                </p>

                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-2 md:p-3 flex flex-col md:flex-row gap-2">
                    <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                        <Search className="text-gray-400 mr-3 shrink-0" size={20} />
                        <div className="flex flex-col text-left w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase">
                                Cari Event
                            </label>
                            <input
                                type="text"
                                placeholder={content.searchPlaceholder}
                                className="w-full outline-none text-gray-800 font-medium placeholder-gray-300"
                            />
                        </div>
                    </div>

                    <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                        <MapPin className="text-gray-400 mr-3 shrink-0" size={20} />
                        <div className="flex flex-col text-left w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase">
                                Lokasi
                            </label>
                            <input
                                type="text"
                                placeholder={content.locationPlaceholder}
                                className="w-full outline-none text-gray-800 font-medium placeholder-gray-300"
                            />
                        </div>
                    </div>

                    <div className="flex-1 flex items-center px-4 py-3">
                        <Calendar className="text-gray-400 mr-3 shrink-0" size={20} />
                        <div className="flex flex-col text-left w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase">
                                Tanggal
                            </label>
                            <input
                                type="text"
                                placeholder="Semua Tanggal"
                                className="w-full outline-none text-gray-800 font-medium placeholder-gray-300"
                            />
                        </div>
                    </div>

                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md transform active:scale-95">
                        {content.ctaText}
                    </button>
                </div>
            </div>
        </div>
    );
}
