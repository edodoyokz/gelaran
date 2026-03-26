import { Calendar, CreditCard, Settings, Users } from "lucide-react";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { DocsCallout, DocsChecklist, DocsHero, DocsSection, DocsStat } from "@/components/docs/docs-shell";

export default function AdminDocsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Documentation", href: "/docs" },
                    { label: "Admin" },
                ]}
            />

            <DocsHero
                eyebrow="Admin operations"
                title="Run the Gelaran platform from a consistent control workspace"
                description="The admin workspace covers catalog oversight, user governance, finance-linked queues, and platform settings. This guide reflects the refreshed admin shell and the shared UI patterns used across the latest implementation phases."
                meta={
                    <div className="grid gap-4 md:grid-cols-3">
                        <DocsStat
                            label="Primary routes"
                            value="5 guides"
                            description="Overview, user controls, event moderation, transactions, and platform settings."
                        />
                        <DocsStat
                            label="UI patterns"
                            value="Shared"
                            description="Editorial headers, metric cards, notices, filter bars, and framed data tables."
                        />
                        <DocsStat
                            label="Operational goal"
                            value="Fast review"
                            description="Help admins move through moderation, support, and configuration queues with less friction."
                        />
                    </div>
                }
            />

            <DocsSection
                title="Workspace snapshot"
                description="Use the dashboard as the starting point for platform health, catalog status, revenue visibility, and quick action routing."
            >
                <div className="space-y-4">
                    <BrowserFrame
                        src="/docs/images/admin-dashboard.png"
                        title="https://bsc.com/admin"
                        alt="Admin dashboard workspace"
                    />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <FeatureCard
                            icon={Users}
                            title="User governance"
                            description="Review user records, role changes, and account status without leaving the admin workspace."
                        />
                        <FeatureCard
                            icon={Calendar}
                            title="Catalog moderation"
                            description="Monitor event quality, publishing status, and organizer submissions across the platform."
                            iconBgColor="bg-[rgba(99,102,241,0.08)]"
                            iconColor="text-indigo-600"
                        />
                        <FeatureCard
                            icon={CreditCard}
                            title="Finance visibility"
                            description="Track booking flow, refunds, payouts, and platform revenue in linked operational views."
                            iconBgColor="bg-(--success-bg)"
                            iconColor="text-emerald-600"
                        />
                        <FeatureCard
                            icon={Settings}
                            title="Platform controls"
                            description="Centralize commission defaults, notification behavior, and platform-wide settings."
                            iconBgColor="bg-(--warning-bg)"
                            iconColor="text-amber-600"
                        />
                    </div>
                </div>
            </DocsSection>

            <DocsSection
                title="Recommended admin workflow"
                description="A consistent review order keeps moderation, support escalation, and finance operations aligned."
            >
                <DocsChecklist
                    items={[
                        "Start with the control center to scan notices, metrics, and quick links for queues that need immediate attention.",
                        "Move into user and event views when moderation or account intervention is required, using shared filters and tables to narrow scope.",
                        "Review booking, refund, payout, and finance routes as a coordinated operational set rather than isolated pages.",
                        "Use platform settings after queue review so global changes are made with current operational context in mind.",
                    ]}
                />
            </DocsSection>

            <DocsCallout
                title="Admin docs mirror the current production workspace"
                description="If a screen or route changes, update the corresponding guide so operational teams always reference the same UI language and workflow expectations."
                href="/docs/admin/users"
                ctaLabel="Open user management guide"
            />
        </div>
    );
}
