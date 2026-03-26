import Link from "next/link";
import { ExternalLink, HelpCircle, Settings } from "lucide-react";

interface AccessCredentialHelpProps {
    accent: "indigo" | "emerald";
    description: string;
}

const accentClasses = {
    indigo: {
        wrapper: "border-indigo-400/20 bg-indigo-400/10",
        icon: "text-indigo-200",
        link: "text-indigo-200 hover:text-white",
    },
    emerald: {
        wrapper: "border-emerald-400/20 bg-emerald-400/10",
        icon: "text-emerald-200",
        link: "text-emerald-200 hover:text-white",
    },
} as const;

export function AccessCredentialHelp({ accent, description }: AccessCredentialHelpProps) {
    const tone = accentClasses[accent];

    return (
        <div className={`mt-6 rounded-3xl border p-4 ${tone.wrapper}`}>
            <div className="flex items-start gap-3">
                <HelpCircle className={`mt-0.5 h-5 w-5 shrink-0 ${tone.icon}`} />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Butuh PIN atau kode event?</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
                    <Link
                        href="/organizer/events"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-3 inline-flex items-center gap-2 text-sm font-medium transition-colors ${tone.link}`}
                    >
                        <Settings className="h-4 w-4" />
                        Organizer events
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
