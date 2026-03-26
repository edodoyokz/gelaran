"use client";

import Image from "next/image";

interface BrowserFrameProps {
    src: string;
    alt: string;
    title?: string;
}

export function BrowserFrame({ src, alt, title = "https://example.com" }: BrowserFrameProps) {
    return (
        <div className="overflow-hidden rounded-[1.75rem] border border-(--border) bg-(--surface) shadow-(--shadow-lg)">
            <div className="flex items-center gap-3 border-b border-(--border-light) bg-(--surface-elevated) px-4 py-3 sm:px-5">
                <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#f97373]" />
                    <span className="h-3 w-3 rounded-full bg-[#f5c451]" />
                    <span className="h-3 w-3 rounded-full bg-[#34d399]" />
                </div>
                <div className="flex-1 rounded-full border border-(--border) bg-(--surface) px-4 py-1.5 text-center text-xs text-(--text-muted) shadow-(--shadow-xs)">
                    {title}
                </div>
            </div>
            <div className="relative aspect-video w-full overflow-hidden bg-(--surface-elevated)">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/1200x800/f8fafc/94a3b8?text=${encodeURIComponent(alt)}`;
                    }}
                />
            </div>
        </div>
    );
}
