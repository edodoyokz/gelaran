import { Calendar, ScanLine, Users, Wallet } from "lucide-react";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { DocsCallout, DocsChecklist, DocsHero, DocsSection, DocsStat } from "@/components/docs/docs-shell";

export default function OrganizerDocsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Documentation", href: "/docs" },
                    { label: "Organizer" },
                ]}
            />

            <DocsHero
                eyebrow="Organizer operations"
                title="Run events, teams, and day-of-show tools from one system"
                description="The organizer guide explains how the current Gelaran workspace supports event setup, staff coordination, gate operations, POS access, and wallet management."
                meta={
                    <div className="grid gap-4 md:grid-cols-3">
                        <DocsStat
                            label="Operational focus"
                            value="End to end"
                            description="From event setup and publishing through on-site execution and payout review."
                        />
                        <DocsStat
                            label="Support routes"
                            value="Gate + POS"
                            description="Includes the credential, access, and scanner flows used during event operations."
                        />
                        <DocsStat
                            label="Team workflow"
                            value="Shared UI"
                            description="Matches the same card framing, section hierarchy, and workspace patterns used in the product."
                        />
                    </div>
                }
            />

            <DocsSection
                title="Organizer workspace snapshot"
                description="Use the dashboard as the launch point for event management, performance review, team support, and live operations."
            >
                <div className="space-y-4">
                    <BrowserFrame
                        src="/docs/images/organizer-dashboard.png"
                        title="https://bsc.com/organizer"
                        alt="Organizer dashboard workspace"
                    />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <FeatureCard
                            icon={Calendar}
                            title="Event operations"
                            description="Create, update, and publish event details, tickets, schedules, and venue-linked setup."
                            iconBgColor="bg-[rgba(99,102,241,0.08)]"
                            iconColor="text-indigo-600"
                        />
                        <FeatureCard
                            icon={ScanLine}
                            title="Gate & POS"
                            description="Prepare access credentials, scan attendees, and support on-site sales during live operations."
                        />
                        <FeatureCard
                            icon={Wallet}
                            title="Wallet & payouts"
                            description="Review revenue, bank setup, and withdrawal readiness from the wallet workspace."
                            iconBgColor="bg-(--success-bg)"
                            iconColor="text-emerald-600"
                        />
                        <FeatureCard
                            icon={Users}
                            title="Team coordination"
                            description="Manage internal roles and help staff reach the right operational surfaces quickly."
                            iconBgColor="bg-(--warning-bg)"
                            iconColor="text-amber-600"
                        />
                    </div>
                </div>
            </DocsSection>

            <DocsSection
                title="Recommended organizer sequence"
                description="Follow this order to keep event prep and show-day operations aligned."
            >
                <DocsChecklist
                    items={[
                        "Set up event content, tickets, schedules, and supporting resources before opening operational tools to staff.",
                        "Review analytics and attendees as the event approaches so staffing and capacity planning are based on live demand.",
                        "Generate Gate and POS credentials from the event operations area, then distribute them only to active staff.",
                        "After the event, confirm on-site activity, monitor wallet totals, and reconcile any follow-up support issues.",
                    ]}
                />
            </DocsSection>

            <DocsCallout
                title="Day-of-show readiness depends on updated ops guides"
                description="Keep the gate and POS documentation aligned with the current live-event tooling so staff receive accurate access instructions and fallback steps."
                href="/docs/organizer/gate"
                ctaLabel="Open Gate & POS guide"
            />
        </div>
    );
}
