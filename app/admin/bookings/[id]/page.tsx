"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
    Loader2,
    AlertCircle,
    Calendar,
    MapPin,
    User,
    Mail,
    Phone,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Ban,
    QrCode,
    ExternalLink,
    FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminWorkspacePage } from "@/components/admin/admin-workspace";
import { useToast } from "@/components/ui/toast-provider";
import {
    buildPaymentVerificationRequest,
    canReviewPaymentProof,
    getPaymentProofKind,
    getVerificationStatusMeta,
} from "@/lib/admin/payment-verification-ui";

interface BookedTicket {
    id: string;
    uniqueCode: string;
    unitPrice: string;
    finalPrice: string;
    isCheckedIn: boolean;
    checkedInAt: string | null;
    status: string;
    ticketType: {
        name: string;
    };
}

interface Transaction {
    id: string;
    transactionCode: string;
    paymentGateway: string;
    paymentMethod: string;
    paymentChannel: string | null;
    amount: string;
    status: string;
    paidAt: string | null;
    paymentProofUrl: string | null;
    paymentProofUploadedAt: string | null;
    verificationStatus: "PENDING_PROOF" | "PROOF_UPLOADED" | "VERIFIED" | "REJECTED" | null;
    verifiedAt: string | null;
    verificationNotes: string | null;
}

interface Booking {
    id: string;
    bookingCode: string;
    totalTickets: number;
    subtotal: string;
    discountAmount: string;
    taxAmount: string;
    platformFee: string;
    totalAmount: string;
    organizerRevenue: string;
    platformRevenue: string;
    status: string;
    paymentStatus: string;
    cancellationReason: string | null;
    cancelledAt: string | null;
    expiresAt: string | null;
    paidAt: string | null;
    confirmedAt: string | null;
    createdAt: string;
    guestEmail: string | null;
    guestName: string | null;
    guestPhone: string | null;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
    } | null;
    event: {
        id: string;
        title: string;
        slug: string;
        posterImage: string | null;
        organizer: {
            name: string;
            organizerProfile: {
                organizationName: string | null;
            } | null;
        };
        venue: {
            name: string;
            address: string;
            city: string;
        } | null;
        schedules: Array<{
            scheduleDate: string;
            startTime: string;
            endTime: string;
        }>;
    };
    bookedTickets: BookedTicket[];
    transaction: Transaction | null;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-(--bg-secondary) text-(--text-secondary)",
    AWAITING_PAYMENT: "bg-yellow-500/10 text-yellow-600",
    PAID: "bg-blue-500/10 text-blue-500",
    CONFIRMED: "bg-green-500/10 text-green-600",
    CANCELLED: "bg-red-500/10 text-red-500",
    REFUNDED: "bg-purple-500/10 text-purple-500",
    EXPIRED: "bg-(--bg-secondary) text-(--text-muted)",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-600",
    TRANSFERRED: "bg-blue-500/10 text-blue-500",
    CANCELLED: "bg-red-500/10 text-red-500",
    REFUNDED: "bg-purple-500/10 text-purple-500",
};

export default function AdminBookingDetailPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const params = useParams();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState("");
    const [verificationAction, setVerificationAction] = useState<"VERIFY" | "REJECT" | null>(null);

    const fetchBooking = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/admin/bookings/${bookingId}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/bookings");
                    return;
                }
                if (res.status === 403) {
                    router.push("/admin");
                    return;
                }
                if (res.status === 404) {
                    setError("Booking not found");
                    return;
                }
                setError(data.error?.message || "Failed to load booking");
                return;
            }

            if (data.success) {
                setBooking(data.data);
                setVerificationNotes(data.data.transaction?.verificationNotes || "");
            }
        } catch {
            setError("Failed to load booking");
        } finally {
            setIsLoading(false);
        }
    }, [bookingId, router]);

    useEffect(() => {
        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId, fetchBooking]);

    const handleCancel = async () => {
        if (!cancelReason.trim()) {
            showToast("Please provide a cancellation reason", "error");
            return;
        }

        try {
            setIsCancelling(true);
            const res = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "cancel",
                    reason: cancelReason.trim(),
                }),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to cancel booking", "error");
                return;
            }

            showToast("Booking cancelled", "success");
            setShowCancelModal(false);
            setCancelReason("");
            fetchBooking();
        } catch {
            showToast("Failed to cancel booking", "error");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleVerifyPayment = async (action: "VERIFY" | "REJECT") => {
        if (!booking?.transaction) {
            showToast("Transaction not found", "error");
            return;
        }

        try {
            setVerificationAction(action);
            const request = buildPaymentVerificationRequest(bookingId, action, verificationNotes);
            const res = await fetch(request.url, request.init);

            const data = await res.json();

            if (!res.ok || !data.success) {
                showToast(data.error?.message || "Failed to update payment verification", "error");
                return;
            }

            showToast(action === "VERIFY" ? "Payment verified" : "Payment proof rejected", "success");
            await fetchBooking();
        } catch {
            showToast("Failed to update payment verification", "error");
        } finally {
            setVerificationAction(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-(--bg-secondary) flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-(--accent-primary) animate-spin mx-auto mb-4" />
                    <p className="text-(--text-muted)">Loading booking...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-(--bg-secondary) flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">{error || "Booking not found"}</p>
                    <Link href="/admin/bookings" className="text-(--accent-primary) hover:text-indigo-500">
                        Back to Bookings
                    </Link>
                </div>
            </div>
        );
    }

    const canCancel = !["CANCELLED", "REFUNDED", "EXPIRED"].includes(booking.status);
    const customerName = booking.user?.name || booking.guestName || "Guest";
    const customerEmail = booking.user?.email || booking.guestEmail;
    const customerPhone = booking.user?.phone || booking.guestPhone;
    const verificationMeta = getVerificationStatusMeta(booking.transaction?.verificationStatus ?? null);
    const canReviewProof = canReviewPaymentProof(booking.transaction);
    const paymentProofKind = getPaymentProofKind(booking.transaction?.paymentProofUrl);
    const isVerificationBusy = verificationAction !== null;

    return (
        <AdminWorkspacePage
            title={`Booking ${booking.bookingCode}`}
            description={booking.event.title}
            backHref="/admin/bookings"
            actions={
                canCancel ? (
                    <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                        <Ban className="h-4 w-4" />
                        Cancel Booking
                    </button>
                ) : undefined
            }
        >

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-(--surface) rounded-xl shadow-sm p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Booking Details</h2>
                                    <p className="text-sm text-(--text-muted) font-mono">{booking.bookingCode}</p>
                                </div>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${STATUS_COLORS[booking.status]}`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-(--surface-hover) rounded-lg mb-6">
                                <Image
                                    src={booking.event.posterImage || "/placeholder.jpg"}
                                    alt=""
                                    width={80}
                                    height={80}
                                    className="object-cover rounded-lg"
                                />
                                <div>
                                    <Link
                                        href={`/events/${booking.event.slug}`}
                                        className="font-bold text-foreground hover:text-(--accent-primary)"
                                    >
                                        {booking.event.title}
                                    </Link>
                                    <div className="flex items-center gap-1 text-sm text-(--text-muted) mt-1">
                                        <Calendar className="h-4 w-4" />
                                        {booking.event.schedules?.[0] 
                                            ? new Date(booking.event.schedules[0].scheduleDate).toLocaleDateString("id-ID", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "Schedule TBD"
                                        }
                                    </div>
                                    {booking.event.venue && (
                                        <div className="flex items-center gap-1 text-sm text-(--text-muted)">
                                            <MapPin className="h-4 w-4" />
                                            {booking.event.venue.name}, {booking.event.venue.city}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-semibold text-foreground mb-3">Tickets ({booking.totalTickets})</h3>
                            <div className="space-y-3">
                                {booking.bookedTickets.map((ticket) => (
                                    <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <QrCode className="h-5 w-5 text-(--accent-primary)" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{ticket.ticketType.name}</p>
                                                <p className="text-xs text-(--text-muted) font-mono">{ticket.uniqueCode}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {ticket.isCheckedIn && (
                                                <div className="flex items-center gap-1 text-green-600 text-sm">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Checked In
                                                </div>
                                            )}
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${TICKET_STATUS_COLORS[ticket.status]}`}>
                                                {ticket.status}
                                            </span>
                                            <p className="font-medium text-foreground">{formatCurrency(Number(ticket.finalPrice))}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {booking.transaction && (
                            <div className="bg-(--surface) rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-foreground mb-4">Payment Information</h2>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-(--text-muted)">Transaction ID</p>
                                        <p className="font-mono text-foreground">{booking.transaction.transactionCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-(--text-muted)">Payment Gateway</p>
                                        <p className="text-foreground capitalize">{booking.transaction.paymentGateway}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-(--text-muted)">Payment Method</p>
                                        <p className="text-foreground">{booking.transaction.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-(--text-muted)">Status</p>
                                        <p className="text-foreground">{booking.transaction.status}</p>
                                    </div>
                                    {booking.transaction.paidAt && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-(--text-muted)">Paid At</p>
                                            <p className="text-foreground">
                                                {new Date(booking.transaction.paidAt).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="border rounded-xl p-4 space-y-4 bg-(--surface-hover)">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-foreground">Payment Proof Review</h3>
                                            <p className="text-sm text-(--text-muted)">
                                                Review uploaded payment evidence and update verification status.
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${verificationMeta.toneClassName}`}>
                                            {verificationMeta.label}
                                        </span>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                                        <div>
                                            <p className="text-(--text-muted) mb-1">Proof availability</p>
                                            <p className="text-foreground font-medium">
                                                {booking.transaction.paymentProofUrl ? "Proof uploaded" : "No proof uploaded"}
                                            </p>
                                        </div>
                                        {booking.transaction.paymentProofUploadedAt && (
                                            <div>
                                                <p className="text-(--text-muted) mb-1">Uploaded at</p>
                                                <p className="text-foreground font-medium">
                                                    {new Date(booking.transaction.paymentProofUploadedAt).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                        )}
                                        {booking.transaction.verifiedAt && (
                                            <div>
                                                <p className="text-(--text-muted) mb-1">Verified at</p>
                                                <p className="text-foreground font-medium">
                                                    {new Date(booking.transaction.verifiedAt).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                        )}
                                        {booking.transaction.paymentProofUrl && (
                                            <div className="sm:col-span-2">
                                                <p className="text-(--text-muted) mb-1">Proof URL</p>
                                                <a
                                                    href={booking.transaction.paymentProofUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-(--accent-primary) hover:underline break-all"
                                                >
                                                    {booking.transaction.paymentProofUrl}
                                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {booking.transaction.paymentProofUrl ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-(--text-muted)">Proof preview</p>
                                            {paymentProofKind === "pdf" ? (
                                                <a
                                                    href={booking.transaction.paymentProofUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 rounded-lg border bg-(--surface) px-4 py-3 text-sm text-foreground hover:bg-(--surface-hover)"
                                                >
                                                    <FileText className="h-5 w-5 text-(--text-muted)" />
                                                    <span>Open PDF proof</span>
                                                    <ExternalLink className="ml-auto h-4 w-4" />
                                                </a>
                                            ) : paymentProofKind === "image" ? (
                                                <a
                                                    href={booking.transaction.paymentProofUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block overflow-hidden rounded-lg border bg-black/5"
                                                >
                                                    <img
                                                        src={booking.transaction.paymentProofUrl}
                                                        alt="Payment proof"
                                                        className="max-h-80 w-full object-contain bg-white"
                                                    />
                                                </a>
                                            ) : (
                                                <a
                                                    href={booking.transaction.paymentProofUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm text-(--accent-primary) hover:underline"
                                                >
                                                    Open uploaded proof
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-(--text-muted)">
                                            No payment proof has been uploaded for this transaction.
                                        </div>
                                    )}

                                    {(booking.transaction.verificationNotes || !canReviewProof) && (
                                        <div>
                                            <p className="text-sm text-(--text-muted) mb-1">Verification notes</p>
                                            <div className="rounded-lg border bg-(--surface) px-4 py-3 text-sm text-foreground whitespace-pre-wrap">
                                                {booking.transaction.verificationNotes || "No verification notes recorded."}
                                            </div>
                                        </div>
                                    )}

                                    {canReviewProof ? (
                                        <div className="space-y-3 border-t pt-4">
                                            <div>
                                                <label htmlFor="verification-notes" className="block text-sm font-medium text-foreground mb-2">
                                                    Review notes
                                                </label>
                                                <textarea
                                                    id="verification-notes"
                                                    value={verificationNotes}
                                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                                    placeholder="Optional notes for verification or rejection"
                                                    rows={4}
                                                    maxLength={1000}
                                                    disabled={isVerificationBusy}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent-primary) resize-none disabled:opacity-60"
                                                />
                                                <p className="mt-1 text-xs text-(--text-muted)">
                                                    {verificationNotes.length}/1000 characters
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleVerifyPayment("REJECT")}
                                                    disabled={isVerificationBusy}
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    {verificationAction === "REJECT" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                                    Reject Proof
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleVerifyPayment("VERIFY")}
                                                    disabled={isVerificationBusy}
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {verificationAction === "VERIFY" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                    Verify Payment
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border px-4 py-3 text-sm text-(--text-secondary)">
                                            {booking.transaction.verificationStatus === "VERIFIED"
                                                ? "This payment proof has already been verified."
                                                : booking.transaction.verificationStatus === "REJECTED"
                                                  ? "This payment proof has already been rejected."
                                                  : booking.transaction.verificationStatus === "PENDING_PROOF"
                                                    ? "Verification actions are unavailable until proof is uploaded."
                                                    : "Verification actions are unavailable for the current transaction state."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {booking.cancellationReason && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-red-600">Cancellation Reason</h3>
                                        <p className="text-red-700 mt-1">{booking.cancellationReason}</p>
                                        {booking.cancelledAt && (
                                            <p className="text-sm text-red-600 mt-2">
                                                Cancelled on {new Date(booking.cancelledAt).toLocaleString("id-ID")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-(--surface) rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4">Customer</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-(--bg-secondary) rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-(--text-secondary)" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{customerName}</p>
                                        <p className="text-sm text-(--text-muted)">{booking.user ? "Registered User" : "Guest"}</p>
                                    </div>
                                </div>
                                {customerEmail && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-(--text-muted)" />
                                        <span className="text-(--text-secondary)">{customerEmail}</span>
                                    </div>
                                )}
                                {customerPhone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-(--text-muted)" />
                                        <span className="text-(--text-secondary)">{customerPhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-(--surface) rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between text-(--text-secondary)">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(Number(booking.subtotal))}</span>
                                </div>
                                {Number(booking.discountAmount) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(Number(booking.discountAmount))}</span>
                                    </div>
                                )}
                                {Number(booking.taxAmount) > 0 && (
                                    <div className="flex justify-between text-(--text-secondary)">
                                        <span>Tax</span>
                                        <span>{formatCurrency(Number(booking.taxAmount))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-(--text-secondary)">
                                    <span>Platform Fee</span>
                                    <span>{formatCurrency(Number(booking.platformFee))}</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-bold text-foreground">
                                        <span>Total</span>
                                        <span>{formatCurrency(Number(booking.totalAmount))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-(--surface) rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4">Timeline</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-(--text-muted)" />
                                    <div>
                                        <p className="text-sm text-(--text-muted)">Created</p>
                                        <p className="text-foreground">
                                            {new Date(booking.createdAt).toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                </div>
                                {booking.paidAt && (
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm text-(--text-muted)">Paid</p>
                                            <p className="text-foreground">
                                                {new Date(booking.paidAt).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {booking.confirmedAt && (
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm text-(--text-muted)">Confirmed</p>
                                            <p className="text-foreground">
                                                {new Date(booking.confirmedAt).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {booking.expiresAt && booking.status === "PENDING" && (
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                                        <div>
                                            <p className="text-sm text-(--text-muted)">Expires</p>
                                            <p className="text-foreground">
                                                {new Date(booking.expiresAt).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-(--surface) rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-500/10 rounded-full">
                                <Ban className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground text-center mb-2">
                                Cancel Booking
                            </h3>
                            <p className="text-(--text-muted) text-center mb-4">
                                This action cannot be undone. Please provide a reason for cancellation.
                            </p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Reason for cancellation..."
                                rows={3}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason("");
                                    }}
                                    disabled={isCancelling}
                                    className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-(--text-secondary) hover:bg-(--surface-hover) disabled:opacity-50"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isCancelling || !cancelReason.trim()}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCancelling ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Cancelling...
                                        </>
                                    ) : (
                                        <>
                                            <Ban className="h-4 w-4" />
                                            Cancel Booking
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminWorkspacePage>
    );
}
