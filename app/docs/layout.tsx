import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Link from "next/link";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <header className="border-b px-6 py-4 flex items-center justify-between bg-card">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-xl font-bold text-primary">
                            Gelaran Docs
                        </Link>
                    </div>
                </header>
                <div className="flex-1 container mx-auto py-8 px-4">
                    {children}
                </div>
            </div>
        </ThemeProvider>
    );
}
