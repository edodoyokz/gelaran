import { Edit, History, Shield, Users } from "lucide-react";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { DocsChecklist, DocsHero, DocsSection, DocsStat } from "@/components/docs/docs-shell";

export default function AdminUsersDocsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Documentation", href: "/docs" },
                    { label: "Admin", href: "/docs/admin" },
                    { label: "User management" },
                ]}
            />

            <DocsHero
                eyebrow="User governance"
                title="Manage platform accounts with clear status and audit awareness"
                description="The user management area helps admins review role assignments, account state, and history so customer, organizer, and internal access stays trustworthy."
                meta={
                    <div className="grid gap-4 md:grid-cols-3">
                        <DocsStat
                            label="Primary goal"
                            value="Account control"
                            description="Support healthy role mapping and reliable access across all product areas."
                        />
                        <DocsStat
                            label="Review mode"
                            value="Search + detail"
                            description="Use shared filters and detail views to move from broad scanning into account-specific action."
                        />
                        <DocsStat
                            label="Operational link"
                            value="Support ready"
                            description="Many user reviews start as support escalations, so clarity and audit context matter."
                        />
                    </div>
                }
            />

            <DocsSection
                title="User management surface"
                description="The admin user area is designed for fast scanning first, then deliberate action on individual accounts."
            >
                <div className="space-y-4">
                    <BrowserFrame
                        src="/docs/images/admin-users.png"
                        title="https://bsc.com/admin/users"
                        alt="Admin user management workspace"
                    />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <FeatureCard
                            icon={Users}
                            title="Browse user records"
                            description="Inspect the current user base with a consistent table layout and account-level context."
                        />
                        <FeatureCard
                            icon={Edit}
                            title="Adjust roles"
                            description="Update role assignments carefully so workspace access remains appropriate and auditable."
                            iconBgColor="bg-(--success-bg)"
                            iconColor="text-emerald-600"
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Manage account status"
                            description="Handle account activation or restrictions when platform safety or accuracy requires it."
                            iconBgColor="bg-(--warning-bg)"
                            iconColor="text-amber-600"
                        />
                        <FeatureCard
                            icon={History}
                            title="Review activity context"
                            description="Use available history signals to understand why an account may need intervention."
                            iconBgColor="bg-[rgba(99,102,241,0.08)]"
                            iconColor="text-indigo-600"
                        />
                    </div>
                </div>
            </DocsSection>

            <DocsSection
                title="Recommended account review flow"
                description="Follow a simple sequence so changes are justified and easy to explain later."
            >
                <DocsChecklist
                    items={[
                        "Locate the account with search or filters, then verify identity details, current role, and visible status signals.",
                        "Review the reason for intervention, especially when the request came from support, moderation, or organizer escalation.",
                        "Apply the smallest necessary change, such as updating a role or adjusting account status, instead of making broad edits.",
                        "Re-check the resulting access implications for related workspaces and note any follow-up needed by support or operations."
                    ]}
                />
            </DocsSection>
        </div>
    );
}
