import { CreditCard, FileText, RefreshCcw, Wallet } from "lucide-react";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { DocsChecklist, DocsHero, DocsSection, DocsStat } from "@/components/docs/docs-shell";

export default function AdminTransactionsDocsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Documentation", href: "/docs" },
                    { label: "Admin", href: "/docs/admin" },
                    { label: "Transactions" },
                ]}
            />

            <DocsHero
                eyebrow="Finance operations"
                title="Review payment flow, refunds, and payouts from connected admin surfaces"
                description="Transactions in Gelaran span booking health, refund decisions, payout handling, and finance visibility. This guide reflects those linked responsibilities rather than treating finance as a single isolated screen."
                meta={
                    <div className="grid gap-4 md:grid-cols-3">
                        <DocsStat
                            label="Finance lens"
                            value="End to end"
                            description="Track the customer payment lifecycle all the way through organizer settlement and exceptions."
                        />
                        <DocsStat
                            label="Related queues"
                            value="Bookings + payouts"
                            description="Use adjacent finance routes together for a clearer operational picture."
                        />
                        <DocsStat
                            label="Status reading"
                            value="Action driven"
                            description="Each status should suggest whether the next step belongs to support, finance, or moderation."
                        />
                    </div>
                }
            />

            <DocsSection
                title="Finance workspace snapshot"
                description="The bookings surface is often the first stop, but refund and payout routes complete the full finance picture."
            >
                <div className="space-y-4">
                    <BrowserFrame
                        src="/docs/images/admin-transactions.png"
                        title="https://bsc.com/admin/bookings"
                        alt="Admin transactions workspace"
                    />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <FeatureCard
                            icon={CreditCard}
                            title="Booking payments"
                            description="Review incoming transaction records, payment status, and order-level details."
                        />
                        <FeatureCard
                            icon={RefreshCcw}
                            title="Refund handling"
                            description="Assess reversals carefully so customer outcomes, organizer impact, and finance accuracy stay aligned."
                            iconBgColor="bg-(--warning-bg)"
                            iconColor="text-amber-600"
                        />
                        <FeatureCard
                            icon={Wallet}
                            title="Payout oversight"
                            description="Monitor organizer cash-out requests and move them through the right approval path."
                            iconBgColor="bg-(--success-bg)"
                            iconColor="text-emerald-600"
                        />
                        <FeatureCard
                            icon={FileText}
                            title="Reporting context"
                            description="Use finance summaries and audit context to support operational or accounting follow-up."
                            iconBgColor="bg-[rgba(99,102,241,0.08)]"
                            iconColor="text-indigo-600"
                        />
                    </div>
                </div>
            </DocsSection>

            <DocsSection
                title="Status interpretation"
                description="These transaction states should be read as operational cues, not only labels."
            >
                <div className="grid gap-3">
                    {[
                        {
                            label: "Pending",
                            tone: "bg-(--warning-bg) border-[rgba(251,193,23,0.28)] text-amber-700",
                            description: "Waiting for payment confirmation or next-step resolution before the order can move forward.",
                        },
                        {
                            label: "Paid / confirmed",
                            tone: "bg-(--success-bg) border-[rgba(19,135,108,0.22)] text-emerald-700",
                            description: "Payment succeeded and the booking is ready for downstream customer and organizer operations.",
                        },
                        {
                            label: "Failed / cancelled",
                            tone: "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-red-700",
                            description: "The transaction stopped before completion and may require customer support clarification.",
                        },
                        {
                            label: "Refunded",
                            tone: "bg-[rgba(99,102,241,0.08)] border-[rgba(99,102,241,0.18)] text-indigo-700",
                            description: "Funds have been reversed and should be checked against the related booking and support timeline.",
                        },
                    ].map((status) => (
                        <div
                            key={status.label}
                            className="flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${status.tone}`}>
                                {status.label}
                            </span>
                            <p className="max-w-3xl text-sm leading-7 text-(--text-secondary)">{status.description}</p>
                        </div>
                    ))}
                </div>
            </DocsSection>

            <DocsSection
                title="Recommended finance review sequence"
                description="Treat finance work as a chain of linked decisions to reduce missed dependencies."
            >
                <DocsChecklist
                    items={[
                        "Start with booking status and payment confirmation so you understand whether the order completed, stalled, or reversed.",
                        "Check refund requests alongside customer history and event timing before taking action.",
                        "Review payout queues with the same awareness of booking and refund context so organizer settlement remains accurate.",
                        "Use finance reporting and audit signals for follow-up documentation whenever a case becomes operationally sensitive."
                    ]}
                />
            </DocsSection>
        </div>
    );
}
