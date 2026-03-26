import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PublicLayout } from "@/components/shared/phase-two-shells";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            <PublicLayout navbarTransparent={false} mainClassName="pt-24">
                <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <div className="space-y-6">{children}</div>
                </div>
            </PublicLayout>
        </ThemeProvider>
    );
}
