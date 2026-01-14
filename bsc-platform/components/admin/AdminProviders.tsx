"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import { ConfirmProvider } from "@/components/ui/confirm-provider";

export function AdminProviders({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <ConfirmProvider>
                {children}
            </ConfirmProvider>
        </ToastProvider>
    );
}
