import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, LifeBuoy, ShieldCheck, Sparkles, Users } from "lucide-react";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import {
    DocsCallout,
    DocsHero,
    DocsLinkCard,
    DocsSection,
    DocsStat,
} from "@/components/docs/docs-shell";

export default async function DocsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userRole: string | null = null;

    if (user) {
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { role: true },
        });
        userRole = dbUser?.role ?? null;
    }

    if (userRole === "ORGANIZER") {
        redirect("/docs/organizer");
    }

    const docsCards = [
        {
            href: "/docs/admin",
            title: "Admin operations guide",
            description:
                "Platform oversight, moderation workflow, finance queues, settings controls, and workspace review patterns.",
            icon: ShieldCheck,
            tone: "admin" as const,
            badge: "Admin",
            visible: userRole === "ADMIN" || userRole === "SUPER_ADMIN",
        },
        {
            href: "/docs/organizer",
            title: "Organizer operations guide",
            description:
                "Event publishing, gate and POS access, team coordination, wallet management, and day-of-show support flows.",
            icon: Users,
            tone: "organizer" as const,
            badge: "Organizer",
            visible: ["ADMIN", "SUPER_ADMIN", "ORGANIZER"].includes(userRole ?? ""),
        },
        {
            href: "/docs/customer",
            title: "Customer help center",
            description:
                "Ticket buying, account management, booking recovery, and support guidance for the current customer experience.",
            icon: BookOpen,
            tone: "customer" as const,
            badge: "Customer",
            visible: true,
        },
    ].filter((item) => item.visible);

    return (
        <div className="space-y-8">
            <DocsHero
                eyebrow="Documentation center"
                title="Operational guidance for every Gelaran role"
                description="Browse the refreshed docs hub for admin, organizer, and customer workflows. This pass aligns the documentation language with the current Gelaran UI system and the operational surfaces already implemented in the product."
                actions={
                    user ? (
                        <div className="flex flex-wrap gap-3">
                            {docsCards.slice(0, 2).map((card) => (
                                <Link
                                    key={card.href}
                                    href={card.href}
                                    className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[rgba(41,179,182,0.28)] hover:text-(--accent-primary)"
                                >
                                    {card.badge} docs
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Link
                            href="/login?returnUrl=/docs"
                            className="inline-flex items-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-glow)"
                        >
                            Sign in to view role-specific docs
                        </Link>
                    )
                }
                meta={
                    <div className="grid gap-4 md:grid-cols-3">
                        <DocsStat
                            label="Audience"
                            value="3 roles"
                            description="Dedicated guidance for admins, organizers, and customers using the same editorial system."
                        />
                        <DocsStat
                            label="Focus"
                            value="Live ops"
                            description="Explains the currently shipped workspaces, support routes, and day-to-day platform tasks."
                        />
                        <DocsStat
                            label="Phase 10"
                            value="Refined"
                            description="Headers, cards, framing, and navigation were refreshed for consistency with the latest UI pass."
                        />
                    </div>
                }
            />

            <DocsSection
                title="Choose your guide"
                description="Each guide follows the same visual system and highlights the operational routes that matter for that role."
            >
                <div className="grid gap-4 lg:grid-cols-3">
                    {docsCards.map((card) => (
                        <DocsLinkCard
                            key={card.href}
                            href={card.href}
                            title={card.title}
                            description={card.description}
                            icon={card.icon}
                            tone={card.tone}
                            badge={card.badge}
                        />
                    ))}
                </div>
            </DocsSection>

            <DocsSection
                title="What this documentation covers"
                description="The refreshed hub is intended to be the source of truth for workspace navigation, operational responsibilities, and support expectations across the product."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            icon: ShieldCheck,
                            title: "Admin governance",
                            description: "Moderation queues, platform settings, user controls, and finance oversight.",
                        },
                        {
                            icon: Users,
                            title: "Organizer execution",
                            description: "Event setup, team permissions, gate access, POS sessions, and wallet operations.",
                        },
                        {
                            icon: Sparkles,
                            title: "Customer support",
                            description: "Bookings, account recovery, ticket access, and self-service help references.",
                        },
                        {
                            icon: LifeBuoy,
                            title: "Operational readiness",
                            description: "Reference language for support handoff, day-of-event tools, and status communication.",
                        },
                    ].map((item) => (
                        <article
                            key={item.title}
                            className="rounded-3xl border border-(--border) bg-(--surface-elevated) p-5 shadow-(--shadow-sm)"
                        >
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary) shadow-(--shadow-xs)">
                                <item.icon className="h-5 w-5" />
                            </span>
                            <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                            <p className="mt-2 text-sm leading-7 text-(--text-secondary)">{item.description}</p>
                        </article>
                    ))}
                </div>
            </DocsSection>

            {!user ? (
                <DocsCallout
                    title="Signed-in access is required for protected role guides"
                    description="Public visitors can browse the customer help center, while admin and organizer sections remain protected so operational procedures stay aligned with account permissions."
                    href="/login?returnUrl=/docs"
                    ctaLabel="Sign in"
                />
            ) : null}
        </div>
    );
}
