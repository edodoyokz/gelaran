"use client";

import Link from "next/link";
import { CalendarDays, Clock3, Heart, MapPin, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
    className?: string;
    featuredLabel?: string | null;
    metaTone?: "default" | "accent" | "warm";
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
    className,
    featuredLabel,
    metaTone = "accent",
}: EventCardProps) {
    const dateParts = date.split(" ");
    const month = dateParts[2]?.slice(0, 3).toUpperCase() || "JAN";
    const day = dateParts[1] || "01";

    const metaToneClassName =
        metaTone === "warm"
            ? "bg-(--warning-bg) text-(--warning-text)"
            : metaTone === "default"
                ? "bg-(--surface-muted) text-(--text-secondary)"
                : "bg-[rgba(41,179,182,0.12)] text-(--accent-primary)";

    return (
        <Link
            href={`/events/${slug}`}
            className={cn(
                "group relative flex h-full min-w-[280px] cursor-pointer flex-row overflow-hidden rounded-[calc(var(--radius-3xl)+0.1rem)] border border-(--border) bg-[rgba(255,255,255,0.88)] shadow-(--shadow-sm) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lg) md:min-w-0 md:flex-col",
                className,
            )}
        >
            <div className="relative w-[124px] shrink-0 overflow-hidden bg-[linear-gradient(135deg,rgba(1,89,89,0.92),rgba(41,179,182,0.72))] md:h-60 md:w-full">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />

                <div className="absolute inset-0 bg-linear-to-t from-[rgba(6,18,18,0.34)] via-transparent to-transparent md:from-[rgba(6,18,18,0.1)]" />

                <button
                    type="button"
                    aria-label="Simpan event"
                    className="absolute right-3 top-3 hidden h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/76 text-(--text-secondary) shadow-(--shadow-xs) backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white md:inline-flex"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                >
                    <Heart className="h-4 w-4" />
                </button>

                <div className="absolute left-3 top-3 hidden flex-col gap-2 md:flex">
                    <span className="inline-flex max-w-full items-center rounded-full border border-white/36 bg-white/84 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-(--accent-primary) shadow-(--shadow-xs) backdrop-blur-sm">
                        <span className="truncate">{category}</span>
                    </span>
                    {featuredLabel ? (
                        <span className="inline-flex w-fit items-center rounded-full border border-[rgba(251,193,23,0.32)] bg-[rgba(251,193,23,0.2)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-(--warning-text)">
                            {featuredLabel}
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between p-4 md:p-5">
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="hidden min-w-[56px] rounded-[1.4rem] border border-(--border) bg-(--surface-muted) p-2 text-center md:block">
                            <span className="block text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-(--accent-primary)">{month}</span>
                            <span className="mt-1 block text-2xl font-semibold leading-none tracking-(--tracking-heading) text-foreground">{day}</span>
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-(--text-muted) md:hidden">
                                <span className={cn("inline-flex items-center rounded-full px-2.5 py-1", metaToneClassName)}>{category}</span>
                                {featuredLabel ? <span className="text-(--warning-text)">{featuredLabel}</span> : null}
                            </div>

                            <div>
                                <h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-(--tracking-heading) text-foreground transition-colors duration-200 group-hover:text-(--accent-primary) md:text-[1.32rem]">
                                    {title}
                                </h3>
                                <p className="mt-1 truncate text-sm text-(--text-secondary)">{organizer}</p>
                            </div>

                            <div className="space-y-2 text-sm text-(--text-secondary)">
                                <div className="flex items-center gap-2.5">
                                    <CalendarDays className="h-4 w-4 shrink-0 text-(--text-muted)" />
                                    <span className="truncate">{date}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Clock3 className="h-4 w-4 shrink-0 text-(--text-muted)" />
                                    <span className="truncate">{time}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <MapPin className="h-4 w-4 shrink-0 text-(--text-muted)" />
                                    <span className="truncate">{location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-4 border-t border-dashed border-(--border) pt-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-(--warning-bg) px-3 py-1.5 text-(--warning-text)">
                        <Star className="h-3.5 w-3.5" fill="currentColor" />
                        <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
                        {reviewCount > 0 ? <span className="text-[0.7rem] text-(--warning-text)/70">({reviewCount})</span> : null}
                    </div>

                    <div className="text-right">
                        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Mulai dari</span>
                        <p className="mt-1 text-lg font-semibold tracking-(--tracking-heading) text-(--accent-primary)">
                            {price === 0 ? "Gratis" : formatCurrency(price)}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
