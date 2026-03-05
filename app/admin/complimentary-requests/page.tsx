"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Gift, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminHeader";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ComplimentaryRequest {
    id: string;
    event: {
        id: string;
        title: string;
        organizer: {
            name: string;
            organizerProfile: {
                organizationName: string;
            } | null;
        };
    };
    requestedBy: {
        id: string;
        name: string;
        email: string;
    };
    guestName: string | null;
    guestEmail: string | null;
    requestedTotal: number;
    approvedTotal: number | null;
    status: RequestStatus;
    reviewedNote: string | null;
    createdAt: string;
    reviewedAt: string | null;
    items: Array<{
        id: string;
        quantity: number;
        ticketType: {
            id: string;
            name: string;
            basePrice: number;
        };
    }>;
    bookings: Array<{
        id: string;
        bookingCode: string;
        status: string;
        createdAt: string;
    }>;
}

export default function AdminComplimentaryRequestsPage() {
    const [requests, setRequests] = useState<ComplimentaryRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    const loadRequests = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (statusFilter) params.set("status", statusFilter);

            const res = await fetch(`/api/admin/complimentary-requests?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch {
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [statusFilter]);

    const reviewRequest = async (requestId: string, action: "APPROVE" | "REJECT") => {
        try {
            setIsActionLoading(requestId + action);
            const res = await fetch(`/api/admin/complimentary-requests/${requestId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (!data.success) {
                alert(data.error?.message || "Gagal memproses request");
                return;
            }
            await loadRequests();
        } catch {
            alert("Terjadi kesalahan");
        } finally {
            setIsActionLoading(null);
        }
    };

    return (
        <>
            <AdminHeader
                title="Complimentary Requests"
                subtitle="Approve/reject request tiket complimentary dari promotor"
                backHref="/admin"
                actions={
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)]"
                    >
                        <option value="">Semua Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                }
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)]" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-[var(--surface)] border rounded-xl p-10 text-center text-[var(--text-muted)]">
                        Belum ada request complimentary.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="bg-[var(--surface)] border rounded-xl p-5">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Gift className="h-4 w-4 text-pink-500" />
                                            <p className="font-semibold text-[var(--text-primary)]">{request.event.title}</p>
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Organizer: {request.event.organizer.organizerProfile?.organizationName || request.event.organizer.name}
                                        </p>
                                        <p className="text-sm text-[var(--text-secondary)]">Requested by: {request.requestedBy.name} ({request.requestedBy.email})</p>
                                        <p className="text-sm text-[var(--text-secondary)]">Guest: {request.guestName || "-"} ({request.guestEmail || "-"})</p>
                                        <p className="text-sm text-[var(--text-secondary)] mt-1">Total tiket diminta: <span className="font-semibold">{request.requestedTotal}</span></p>
                                        <div className="mt-2 space-y-1">
                                            {request.items.map((item) => (
                                                <p key={item.id} className="text-sm text-[var(--text-secondary)]">• {item.ticketType.name} x{item.quantity}</p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="lg:text-right min-w-[250px]">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                                            {request.status}
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] flex lg:justify-end items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {formatDate(request.createdAt)}
                                        </p>
                                        {request.bookings?.[0] && (
                                            <p className="text-xs text-green-700 mt-2">Booking: {request.bookings[0].bookingCode}</p>
                                        )}

                                        {request.status === "PENDING" && (
                                            <div className="flex gap-2 mt-4 lg:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => reviewRequest(request.id, "APPROVE")}
                                                    disabled={isActionLoading === request.id + "APPROVE"}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 inline-flex items-center gap-1"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" /> Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => reviewRequest(request.id, "REJECT")}
                                                    disabled={isActionLoading === request.id + "REJECT"}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1"
                                                >
                                                    <XCircle className="h-4 w-4" /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
