"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, Flame, MapPin, Star } from "lucide-react";
import { EditorialPanel } from "@/components/shared/public-marketing";

interface HeroFeaturedEvent {
    title: string;
    href: string;
    location: string;
    date: string;
    price: string;
    image: string;
    category: string;
}

interface HeroSupportEvent {
    id: string;
    title: string;
    href: string;
    location: string;
}

interface HeroStat {
    label: string;
    value: ReactNode;
}

interface HeroProps {
    featuredEvent: HeroFeaturedEvent | null;
    supportEvents: HeroSupportEvent[];
    stats: HeroStat[];
}

export function Hero({ featuredEvent, supportEvents, stats }: HeroProps) {
    return (
        <section className="px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-14">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.95fr)] lg:items-center lg:gap-14">
                <div className="space-y-8">
                    <div className="space-y-5">
                        <span className="inline-flex rounded-full border border-(--border) bg-(--surface)/88 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-(--accent-primary) shadow-(--shadow-xs) backdrop-blur">
                            The cultural curator
                        </span>
                        <div className="space-y-4">
                            <h1 className="max-w-4xl font-(--font-editorial) text-5xl leading-[0.92] tracking-(--tracking-display) text-foreground sm:text-6xl lg:text-7xl">
                                Discover the <span className="italic text-(--accent-secondary)">soul</span> of Solo.
                            </h1>
                            <p className="max-w-2xl text-base leading-8 text-(--text-secondary) sm:text-lg">
                                Dari panggung tradisi hingga workshop kontemporer, Gelaran merangkai event budaya
                                Surakarta dalam halaman depan yang terasa kuratorial, terang, dan mudah dipindai.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <Link
                            href="/events"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-(--accent-secondary) px-6 py-3 text-sm font-semibold text-white shadow-(--shadow-md) transition-transform duration-200 hover:-translate-y-0.5 hover:bg-(--accent-secondary-hover)"
                        >
                            Explore now
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/become-organizer"
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-(--border) bg-(--surface)/90 px-6 py-3 text-sm font-semibold text-foreground shadow-(--shadow-xs) transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                        >
                            Become organizer
                        </Link>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {stats.map((stat) => (
                            <article
                                key={stat.label}
                                className="rounded-2xl border border-(--border) bg-(--surface)/88 p-5 shadow-(--shadow-sm) backdrop-blur"
                            >
                                <p className="text-sm font-medium text-(--text-secondary)">{stat.label}</p>
                                <p className="mt-3 text-2xl font-semibold tracking-(--tracking-heading) text-foreground sm:text-3xl">
                                    {stat.value}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>

                {featuredEvent ? (
                    <div className="space-y-4 lg:max-w-[34rem]">
                        <Link
                            href={featuredEvent.href}
                            className="group block overflow-hidden rounded-[2rem] border border-(--border) bg-white shadow-[0_24px_70px_rgba(0,32,32,0.12)]"
                        >
                            <div className="relative h-[20rem] overflow-hidden sm:h-[25rem]">
                                <img
                                    src={featuredEvent.image}
                                    alt={featuredEvent.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-[rgba(0,32,32,0.88)] via-[rgba(0,32,32,0.18)] to-transparent" />
                                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/88 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-(--accent-primary) backdrop-blur-md">
                                    <Star className="h-3.5 w-3.5" fill="currentColor" />
                                    Featured
                                </div>
                                <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 text-white sm:p-7">
                                    <div className="space-y-2">
                                        <span className="inline-flex rounded-full bg-white/14 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] backdrop-blur-md">
                                            {featuredEvent.category}
                                        </span>
                                        <h2 className="font-(--font-editorial) text-3xl leading-[1.04] tracking-(--tracking-heading) sm:text-[2.2rem]">
                                            {featuredEvent.title}
                                        </h2>
                                    </div>
                                    <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
                                        <span className="inline-flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {featuredEvent.location}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4" />
                                            {featuredEvent.date}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between gap-4 border-t border-white/18 pt-4">
                                        <div>
                                            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/60">
                                                Starting from
                                            </p>
                                            <p className="mt-1 text-2xl font-semibold text-[#ffd37f]">
                                                {featuredEvent.price}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-(--accent-primary) transition-transform duration-200 group-hover:translate-x-1">
                                            Get tickets
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <EditorialPanel className="space-y-4 border-[rgba(1,89,89,0.12)] bg-[rgba(255,255,255,0.9)] p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-(--text-muted)">
                                    This week in Solo
                                </p>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(249,93,0,0.08)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-(--accent-secondary)">
                                    <Flame className="h-3.5 w-3.5" />
                                    Curated
                                </span>
                            </div>
                            <div className="space-y-3">
                                {supportEvents.length > 0 ? (
                                    supportEvents.map((event, index) => (
                                        <Link
                                            key={event.id}
                                            href={event.href}
                                            className="group/item flex items-center gap-4 rounded-[1.4rem] border border-(--border) bg-white px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(1,89,89,0.18)]"
                                        >
                                            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-sm font-semibold text-(--accent-primary)">
                                                0{index + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {event.title}
                                                </p>
                                                <p className="truncate text-sm text-(--text-secondary)">
                                                    {event.location}
                                                </p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-(--accent-secondary) transition-transform duration-200 group-hover/item:translate-x-1" />
                                        </Link>
                                    ))
                                ) : (
                                    <div className="rounded-[1.4rem] border border-dashed border-(--border) bg-white px-5 py-6 text-sm text-(--text-secondary)">
                                        Highlight event lain akan muncul setelah data publik dimuat.
                                    </div>
                                )}
                            </div>
                        </EditorialPanel>
                    </div>
                ) : (
                    <EditorialPanel className="max-w-xl space-y-4 p-6 sm:p-7">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-(--text-muted)">
                            This week in Solo
                        </p>
                        <div className="rounded-[1.4rem] border border-dashed border-(--border) bg-white px-5 py-8 text-sm text-(--text-secondary)">
                            Featured event akan muncul setelah data publik dimuat.
                        </div>
                    </EditorialPanel>
                )}
            </div>
        </section>
    );
}
