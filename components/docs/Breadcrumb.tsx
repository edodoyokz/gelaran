import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface BreadcrumbProps {
    items: {
        label: string;
        href?: string;
    }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight size={14} />}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-slate-900 transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-slate-900 font-medium">{item.label}</span>
                    )}
                </div>
            ))}
        </div>
    );
}
