import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    iconBgColor?: string;
    iconColor?: string;
}

export function FeatureCard({
    icon: Icon,
    title,
    description,
    iconBgColor = "bg-(--surface-brand-soft)",
    iconColor = "text-(--accent-primary)",
}: FeatureCardProps) {
    return (
        <article className="rounded-3xl border border-(--border) bg-(--surface-elevated) p-5 shadow-(--shadow-sm) transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-md)">
            <div
                className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-(--border) shadow-(--shadow-xs)",
                    iconBgColor,
                    iconColor,
                )}
            >
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-(--text-secondary)">{description}</p>
        </article>
    );
}
