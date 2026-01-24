import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default function AdminDocsPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Admin Documentation</h1>
                <p className="text-xl text-muted-foreground">
                    Complete guide for platform administrators to manage users, events, and transactions.
                </p>
            </div>

            <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
                <CardHeader className="bg-muted/50 pb-8">
                    <CardTitle className="text-2xl">Administrator Dashboard</CardTitle>
                    <CardDescription>
                        The central command center for platform monitoring and quick actions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative aspect-video w-full bg-muted">
                        <Image
                            src="/docs/images/admin_dashboard_main_1769228481897.png"
                            alt="Admin Dashboard Interface"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="p-6 grid gap-6 md:grid-cols-3 bg-card/50">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-primary">Quick Actions</h4>
                            <p className="text-sm text-muted-foreground">
                                Use the "Admin Demo" button on the login page for quick access during testing phases.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-primary">Key Metrics</h4>
                            <p className="text-sm text-muted-foreground">
                                Real-time oversight of Total Revenue, User Registration count, and active Order processing.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-primary">System Health</h4>
                            <p className="text-sm text-muted-foreground">
                                Monitor server status and database connectivity directly from the dashboard widgets.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted border">
                            <Image
                                src="/docs/images/admin_users_list_1769228502877.png"
                                alt="User Management Interface"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            View all registered users including their roles (Admin, Organizer, Customer). You can verify organizers and manage account statuses directly from this list.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Event Moderation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted border">
                            <Image
                                src="/docs/images/admin_events_list_1769228524374.png"
                                alt="Event Management Interface"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Review and moderate events submitted by organizers before they go public. Ensure quality and compliance with platform guidelines.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
