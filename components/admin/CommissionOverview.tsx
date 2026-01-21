import Link from "next/link";
import { Percent, Settings } from "lucide-react";

interface CommissionOverviewProps {
    globalRate: number;
    overridesCount: number;
}

export function CommissionOverview({ globalRate, overridesCount }: CommissionOverviewProps) {
    return (
        <div className="rounded-xl shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-[var(--accent-primary)]" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        Commission Settings
                    </h3>
                </div>
                <Link
                    href="/admin/settings"
                    className="text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                >
                    <Settings className="w-4 h-4" />
                    Configure
                </Link>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <span className="text-sm text-[var(--text-muted)]">Global Default Rate</span>
                    <p className="text-3xl font-bold text-[var(--accent-primary)] mt-1">
                        {globalRate}%
                    </p>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Custom Overrides</span>
                    <span className="text-lg font-semibold text-[var(--text-primary)]">
                        {overridesCount}
                    </span>
                </div>
                {overridesCount > 0 && (
                    <Link
                        href="/admin/users?role=ORGANIZER"
                        className="block text-center text-sm text-[var(--accent-primary)] hover:underline mt-2"
                    >
                        View organizers with custom rates →
                    </Link>
                )}
            </div>
        </div>
    );
}
