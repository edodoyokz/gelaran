import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default function CustomerDocsPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-green-600">User Guide</h1>
                <p className="text-xl text-muted-foreground">
                    Discover events, book tickets, and enjoy your experience with ease.
                </p>
            </div>

            <Card className="overflow-hidden border-2 border-green-500/20 shadow-lg">
                <CardHeader className="bg-muted/50 pb-8">
                    <CardTitle className="text-2xl">Event Discovery & Booking</CardTitle>
                    <CardDescription>
                        Seamlessly browse details and secure your spot for the hottest events in Solo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative aspect-video w-full bg-muted">
                        <Image
                            src="/docs/images/customer_event_detail_1769231203192.png"
                            alt="Event Booking Experience"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="p-6 grid gap-6 md:grid-cols-3 bg-card/50">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-green-600">Rich Information</h4>
                            <p className="text-sm text-muted-foreground">
                                Get all the details including location maps, schedules, and performer lineups in one place.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-green-600">Easy Checkout</h4>
                            <p className="text-sm text-muted-foreground">
                                Select from multiple ticket tiers (Regular, VIP) and pay securely with your preferred method.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-green-600">Digital Tickets</h4>
                            <p className="text-sm text-muted-foreground">
                                Receive QR code tickets instantly via email and access them anytime in your "My Bookings" page.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
