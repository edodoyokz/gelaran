import { CreditCard, Globe, Mail, Settings } from "lucide-react";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { DocsChecklist, DocsHero, DocsSection, DocsStat } from "@/components/docs/docs-shell";

export default function AdminSettingsDocsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Documentation", href: "/docs" },
                    { label: "Admin", href: "/docs/admin" },
                    { label: "Settings" },
                ]}
            />

            <DocsHero
                eyebrow="Platform controls"
                title="Manage global settings without breaking operational consistency"
                description="The settings workspace centralizes the platform defaults that affect organizer economics, notifications, and platform-level behavior."
                meta={
                    <div className="grid gap-4 md:grid-cols-3">
                        <DocsStat
                            label="Control type"
                            value="Global"
                            description="Changes in this area affect how multiple operational surfaces behave across Gelaran."
                        />
                        <DocsStat
                            label="Primary use"
                            value="Stewardship"
                            description="Treat settings changes as controlled updates backed by current operational context."
                        />
                        <DocsStat
                            label="Review habit"
                            value="Validate impact"
                            description="Check adjacent finance and support routes after major settings changes."
                        />
                    </div>
                }
            />

            <DocsSection
                title="Settings groups"
                description="The settings area is organized around the controls that shape brand presence, payments, communication, and commercial defaults."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <FeatureCard
                        icon={Globe}
                        title="General settings"
                        description="Maintain branding, core platform identity, and foundational public-facing defaults."
                    />
                    <FeatureCard
                        icon={CreditCard}
                        title="Payment configuration"
                        description="Review gateway credentials, environment alignment, and downstream payment behavior."
                        iconBgColor="bg-(--success-bg)"
                        iconColor="text-emerald-600"
                    />
                    <FeatureCard
                        icon={Mail}
                        title="Communication rules"
                        description="Adjust email-oriented behavior and related notification expectations for the platform."
                        iconBgColor="bg-[rgba(99,102,241,0.08)]"
                        iconColor="text-indigo-600"
                    />
                    <FeatureCard
                        icon={Settings}
                        title="Commercial defaults"
                        description="Manage platform fee expectations and other settings that affect organizer operations."
                        iconBgColor="bg-(--warning-bg)"
                        iconColor="text-amber-600"
                    />
                </div>
            </DocsSection>

            <DocsSection
                title="Critical review checklist"
                description="Use a lightweight checklist before shipping platform-level changes so finance and support teams stay aligned."
            >
                <DocsChecklist
                    items={[
                        "Confirm the intended change, why it is needed, and which operational surfaces will feel the impact first.",
                        "Validate external integrations such as payment and communication settings before applying production updates.",
                        "Check whether organizer-facing economics, customer messaging, or admin review flows need to be revalidated after the change.",
                        "Record the update in the implementation or operational plan when it materially affects procedures or expectations."
                    ]}
                />
            </DocsSection>
        </div>
    );
}
