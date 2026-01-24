import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default function OrganizerDocsPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-indigo-500">Organizer Guide</h1>
                <p className="text-xl text-muted-foreground">
                    Comprehensive resources for creating successful events, managing sales, and tracking revenue.
                </p>
            </div>

            <Card className="overflow-hidden border-2 border-indigo-500/20 shadow-lg">
                <CardHeader className="bg-muted/50 pb-8">
                    <CardTitle className="text-2xl">Organizer Dashboard</CardTitle>
                    <CardDescription>
                        Your command center for event operations and financial insights.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative aspect-video w-full bg-muted">
                        <Image
                            src="/docs/images/organizer_dashboard_main_1769228951725.png"
                            alt="Organizer Dashboard Interface"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Gate & POS System
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted border">
                            <Image
                                src="/docs/images/organizer_gate_pos_1769230896096.png"
                                alt="Gate and POS Interface"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Manage on-site check-ins and ticket sales. Generate PINs for staff devices to scan tickets securely at the venue entrance.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Financial & Wallet</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted border">
                            <Image
                                src="/docs/images/organizer_wallet_1769230938219.png"
                                alt="Organizer Wallet Interface"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Track your earnings in real-time. View transaction history, manage bank accounts, and request payouts directly to your registered bank.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
