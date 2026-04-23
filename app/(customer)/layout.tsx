import { redirect } from "next/navigation";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CustomerLayoutShell } from "@/components/customer/CustomerLayoutShell";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/dashboard");
    }

    return (
        <ThemeProvider defaultTheme="system" enableTransition>
            <CustomerLayoutShell>{children}</CustomerLayoutShell>
        </ThemeProvider>
    );
}
