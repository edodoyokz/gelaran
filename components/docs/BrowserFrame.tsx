"use client";

import Image from "next/image";

interface BrowserFrameProps {
    src: string;
    alt: string;
    title?: string;
}

export function BrowserFrame({ src, alt, title = "https://example.com" }: BrowserFrameProps) {
    return (
        <div className="my-8 rounded-lg overflow-hidden border border-slate-200 shadow-xl bg-white">
            {/* Browser Header */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="ml-4 flex-1 bg-white border border-slate-200 rounded px-3 py-1 text-xs text-slate-500 font-mono truncate flex items-center justify-center">
                    {title}
                </div>
            </div>
            {/* Screenshot Content */}
            <div className="relative aspect-video bg-slate-50 w-full overflow-hidden group">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/1200x800/f1f5f9/94a3b8?text=${encodeURIComponent(alt)}`;
                    }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
            </div>
        </div>
    );
}
