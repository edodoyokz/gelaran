import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthLayout } from "@/components/shared/phase-two-shells";

export default function AuthRouteLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ThemeProvider>
            <AuthLayout
                title="Masuk dan lanjutkan pengalaman Gelaran"
            >
                {children}
            </AuthLayout>
        </ThemeProvider>
    );
}
