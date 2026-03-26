import { HelpCircle, MessageCircle, Ticket, User } from "lucide-react";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { DocsCallout, DocsChecklist, DocsHero, DocsSection, DocsStat } from "@/components/docs/docs-shell";

export default function CustomerDocsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Documentation", href: "/docs" },
                    { label: "Customer" },
                ]}
            />

            <DocsHero
                eyebrow="Customer help center"
                title="Navigate buying, bookings, and account support with confidence"
                description="This guide helps customers move through discovery, checkout, booking access, and profile management using the current Gelaran product surfaces."
                meta={
                    <div className="grid gap-4 md:grid-cols-3">
                        <DocsStat
                            label="Core journeys"
                            value="4 flows"
                            description="Buying tickets, managing bookings, updating account details, and reaching support."
                        />
                        <DocsStat
                            label="Tone"
                            value="Self-service"
                            description="Written for fast answers, minimal friction, and clearer escalation when help is needed."
                        />
                        <DocsStat
                            label="Coverage"
                            value="Current UI"
                            description="Aligned with the existing customer dashboard, bookings, profile, and support surfaces."
                        />
                    </div>
                }
            />

            <DocsSection
                title="Where customers usually begin"
                description="Most users move from event discovery into checkout, then return for booking access, refunds, and profile support."
            >
                <div className="space-y-4">
                    <BrowserFrame
                        src="/docs/images/customer-home.png"
                        title="https://bsc.com"
                        alt="Gelaran customer homepage"
                    />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <FeatureCard
                            icon={Ticket}
                            title="Buy tickets"
                            description="Find events, compare ticket types, and complete checkout with the current purchase flow."
                        />
                        <FeatureCard
                            icon={User}
                            title="Manage account"
                            description="Update profile details, preferences, and other account information in one place."
                            iconBgColor="bg-[rgba(99,102,241,0.08)]"
                            iconColor="text-indigo-600"
                        />
                        <FeatureCard
                            icon={HelpCircle}
                            title="Resolve common issues"
                            description="Use the FAQ for payment, access, and booking questions before escalating to support."
                            iconBgColor="bg-(--warning-bg)"
                            iconColor="text-amber-600"
                        />
                        <FeatureCard
                            icon={MessageCircle}
                            title="Contact support"
                            description="Escalate missing tickets, payment concerns, or account problems through the help channels."
                            iconBgColor="bg-(--success-bg)"
                            iconColor="text-emerald-600"
                        />
                    </div>
                </div>
            </DocsSection>

            <DocsSection
                title="Quick start checklist"
                description="These are the fastest steps for a first-time customer to reach a successful check-in experience."
            >
                <DocsChecklist
                    items={[
                        "Browse the homepage or event listing to compare event details, dates, and venue information.",
                        "Choose a ticket type, complete checkout, and watch for confirmation in the booking flow and email.",
                        "Open My Bookings to review booking status, ticket details, and any refund or ticket access actions.",
                        "Present the issued ticket or QR code during entry and keep account details updated for future support.",
                    ]}
                />
            </DocsSection>

            <DocsCallout
                title="Customer docs are written to reduce support load"
                description="Use these guides to answer common questions quickly, then rely on the support page for edge cases that need a human handoff."
                href="/docs/customer/support"
                ctaLabel="Open support guide"
            />
        </div>
    );
}
