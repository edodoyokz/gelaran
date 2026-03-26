"use client";

import Link from "next/link";
import { MapPin, Heart, Star, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EventCardProps {
    id: string;
    slug: string;
    title: string;
    date: string;
    time: string;
    location: string;
    price: number;
    image: string;
    category: string;
    organizer: string;
    rating?: number;
    reviewCount?: number;
}

export function EventCard({
    slug,
    title,
    date,
    time,
    location,
    price,
    image,
    category,
    organizer,
    rating = 4,
    reviewCount = 0,
}: EventCardProps) {
    const dateParts = date.split(" ");
    const month = dateParts[2]?.slice(0, 3).toUpperCase() || "JAN";
    const day = dateParts[1] || "01";

    return (
        <Link
            href={`/events/${slug}`}
            className="group bg-[var(--surface)] rounded-3xl overflow-hidden border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-[var(--accent-primary)]/10 transition-all duration-300 cursor-pointer flex flex-row md:flex-col h-full transform hover:-translate-y-1 relative min-w-[280px] md:min-w-0"
        >
            <div className="relative w-[120px] md:w-full md:h-52 shrink-0 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                <button
                    type="button"
                    className="hidden md:flex absolute top-3 right-3 bg-[var(--surface-overlay)] backdrop-blur-md p-2.5 rounded-full shadow-lg hover:bg-[var(--surface)] hover:scale-110 transition-all active:scale-95 z-10"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <Heart className="text-[var(--text-secondary)] hover:text-red-500 transition-colors" size={18} />
                </button>

                <div className="hidden md:block absolute top-3 left-3 bg-[var(--surface-overlay)] backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wide z-10">
                    {category}
                </div>
            </div>

            <div className="p-4 md:p-5 flex flex-col flex-1 min-w-0 justify-between">
                <div>
                    <div className="md:hidden flex items-center gap-2 mb-2 text-xs">
                        <span className="font-bold text-[var(--accent-primary)] uppercase">{category}</span>
                        <span className="text-[var(--border)]">•</span>
                        <span className="text-[var(--text-secondary)]">{date}</span>
                    </div>

                    <div className="flex gap-4 items-start mb-2">
                        <div className="hidden md:flex flex-col items-center min-w-[50px] bg-[var(--accent-primary)]/10 rounded-xl p-2 border border-[var(--border)]">
                            <span className="text-[var(--accent-primary)] font-bold text-xs uppercase tracking-wider">
                                {month}
                            </span>
                            <span className="text-[var(--text-primary)] font-black text-xl">{day}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base md:text-lg leading-tight text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent-primary)] transition-colors mb-1">
                                {title}
                            </h3>
                            <p className="text-xs md:text-sm text-[var(--text-secondary)] truncate mb-2">{organizer}</p>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center text-[var(--text-secondary)] text-xs">
                                    <MapPin size={14} className="mr-1.5 text-[var(--text-muted)] shrink-0" />
                                    <span className="truncate">{location}</span>
                                </div>
                                <div className="hidden md:flex items-center text-[var(--text-secondary)] text-xs">
                                    <Clock size={14} className="mr-1.5 text-[var(--text-muted)] shrink-0" />
                                    <span className="truncate">{time}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-3 mt-2 md:mt-4 border-t border-dashed border-[var(--border)] flex items-end justify-between">
                    <div className="hidden md:flex items-center text-[var(--warning-text)] bg-[var(--warning-bg)] px-2 py-1 rounded-lg">
                        <Star size={12} fill="currentColor" className="mr-1" />
                        <span className="text-xs font-bold text-[var(--warning-text)]">{rating}</span>
                        {reviewCount > 0 && (
                            <span className="text-[10px] text-[var(--warning-text)]/70 ml-1">({reviewCount})</span>
                        )}
                    </div>

                    <div className="flex flex-col items-end ml-auto">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Mulai dari</span>
                        <span className="font-bold text-[var(--accent-primary)] text-sm md:text-lg">
                            {price === 0 ? "Gratis" : formatCurrency(price)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
