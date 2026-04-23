import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";


export default function AuthRouteLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ThemeProvider>
            {children}
        </ThemeProvider>
    );
}
