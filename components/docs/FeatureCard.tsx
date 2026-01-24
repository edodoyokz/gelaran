import { type LucideIcon } from "lucide-react";

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
    iconBgColor = "bg-blue-100",
    iconColor = "text-blue-600",
}: FeatureCardProps) {
    return (
        <div className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-white">
            <div className={`w-10 h-10 ${iconBgColor} ${iconColor} rounded-lg flex items-center justify-center mb-4`}>
                <Icon size={20} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 text-sm">{description}</p>
        </div>
    );
}
