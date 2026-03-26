import { Edit, Shield, Ticket, User } from "lucide-react";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { DocsChecklist, DocsHero, DocsSection, DocsStat } from "@/components/docs/docs-shell";

export default function CustomerAccountDocsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Documentation", href: "/docs" },
                    { label: "Customer", href: "/docs/customer" },
                    { label: "My account" },
                ]}
            />

            <DocsHero
                eyebrow="Account support"
                title="Keep your profile, tickets, and access details up to date"
                description="The account area gives customers one place to maintain personal details, review ticket history, and keep their access information reliable for future bookings."
                meta={
                    <div className="grid gap-4 md:grid-cols-3">
                        <DocsStat
                            label="Primary use"
                            value="Self-service"
                            description="Customers should be able to handle basic profile maintenance without leaving the help flow."
                        />
                        <DocsStat
                            label="Linked area"
                            value="My bookings"
                            description="Account management and booking recovery often work together during support cases."
                        />
                        <DocsStat
                            label="Best practice"
                            value="Keep current"
                            description="Updated identity and contact details reduce delays when payment or ticket help is needed."
                        />
                    </div>
                }
            />

            <DocsSection
                title="What customers can manage"
                description="The current account experience focuses on profile accuracy, account safety, and visibility into purchased tickets."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <FeatureCard
                        icon={Edit}
                        title="Edit profile"
                        description="Update your displayed identity details and keep profile information current for support purposes."
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Security hygiene"
                        description="Review password and access habits so account recovery is less likely to become urgent."
                        iconBgColor="bg-(--success-bg)"
                        iconColor="text-emerald-600"
                    />
                    <FeatureCard
                        icon={Ticket}
                        title="Ticket visibility"
                        description="Use linked booking surfaces to confirm what has been purchased and what is ready for entry."
                        iconBgColor="bg-[rgba(99,102,241,0.08)]"
                        iconColor="text-indigo-600"
                    />
                    <FeatureCard
                        icon={User}
                        title="Account history"
                        description="Understand recent account changes when verifying identity or reviewing support concerns."
                        iconBgColor="bg-(--warning-bg)"
                        iconColor="text-amber-600"
                    />
                </div>
            </DocsSection>

            <DocsSection
                title="Profile maintenance checklist"
                description="A few simple habits make booking access and support much smoother over time."
            >
                <DocsChecklist
                    items={[
                        "Keep your name, email, and phone details accurate so ticket and support communication reaches you correctly.",
                        "Review your booking history after purchases so you can confirm orders before the event date arrives.",
                        "Update account access details when you notice anything outdated or suspicious, especially after device changes.",
                        "Use the support guide when a booking, payment, or ticket issue cannot be resolved through self-service screens."
                    ]}
                />
            </DocsSection>
        </div>
    );
}
