import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerDocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Pretty loose guard, just easier to require login so we know who is viewing
    if (!user) {
        redirect("/login?returnUrl=/docs/customer");
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    User Guide
                </p>
            </div>
            {children}
        </div>
    );
}
