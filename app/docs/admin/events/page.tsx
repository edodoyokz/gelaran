import { Calendar, CheckCircle, Edit, XCircle } from "lucide-react";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { DocsChecklist, DocsHero, DocsSection, DocsStat } from "@/components/docs/docs-shell";

export default function AdminEventsDocsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Documentation", href: "/docs" },
                    { label: "Admin", href: "/docs/admin" },
                    { label: "Event moderation" },
                ]}
            />

            <DocsHero
                eyebrow="Admin moderation"
                title="Review event quality with the same patterns used in the workspace"
                description="The event moderation area helps admins inspect organizer submissions, check catalog quality, and keep publication decisions consistent across the platform."
                meta={
                    <div className="grid gap-4 md:grid-cols-3">
                        <DocsStat
                            label="Review scope"
                            value="Catalog"
                            description="Titles, schedules, pricing, venue details, and content quality all live in one moderation flow."
                        />
                        <DocsStat
                            label="Decision types"
                            value="Approve or revise"
                            description="Use clear decisions and notes so organizers know what changed and what still needs work."
                        />
                        <DocsStat
                            label="UI treatment"
                            value="Table + detail"
                            description="Shared filters, summary cards, and framed content keep moderation scanning fast."
                        />
                    </div>
                }
            />

            <DocsSection
                title="Moderation surface"
                description="Use the listing and detail views together to assess event readiness before publication."
            >
                <div className="space-y-4">
                    <BrowserFrame
                        src="/docs/images/admin-events.png"
                        title="https://bsc.com/admin/events"
                        alt="Admin event moderation workspace"
                    />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <FeatureCard
                            icon={Calendar}
                            title="Review submissions"
                            description="Scan incoming listings, event status, and organizer-linked metadata from the moderation table."
                        />
                        <FeatureCard
                            icon={CheckCircle}
                            title="Approve when ready"
                            description="Publish events that already meet content, schedule, and pricing expectations."
                            iconBgColor="bg-(--success-bg)"
                            iconColor="text-emerald-600"
                        />
                        <FeatureCard
                            icon={XCircle}
                            title="Return for revision"
                            description="Reject incomplete or inaccurate listings with clear notes that reduce repeated support loops."
                            iconBgColor="bg-[rgba(239,68,68,0.08)]"
                            iconColor="text-red-600"
                        />
                        <FeatureCard
                            icon={Edit}
                            title="Make minor adjustments"
                            description="Handle safe editorial corrections when operational accuracy matters and policy allows it."
                            iconBgColor="bg-(--warning-bg)"
                            iconColor="text-amber-600"
                        />
                    </div>
                </div>
            </DocsSection>

            <DocsSection
                title="Recommended moderation flow"
                description="A predictable review sequence helps the admin team apply the same publication standard across the catalog."
            >
                <DocsChecklist
                    items={[
                        "Use filters and status cues to identify newly submitted, draft, or problematic listings that need attention first.",
                        "Open the event detail surface to validate description quality, schedule accuracy, venue information, ticket setup, and organizer intent.",
                        "Approve listings that are operationally sound, or return them with actionable revision notes when the public experience would be affected.",
                        "Re-check high-risk categories such as pricing edits, schedule changes, and venue mismatches before final publication."
                    ]}
                />
            </DocsSection>
        </div>
    );
}
