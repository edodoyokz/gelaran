"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DocsSidebarProps {
    items: {
        title: string;
        href: string;
    }[];
}

export function DocsSidebar({ items }: DocsSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-1">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            pathname === item.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {item.title}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
