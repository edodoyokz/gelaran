"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    Loader2,
    AlertCircle,
    Calendar,
    MapPin,
    User,
    Ticket,
    Clock,
    CheckCircle,
    XCircle,
    Ban,
    Eye,
    Users,
    Building2,
    Tag,
    Globe,
    ExternalLink,
    DollarSign,
    ChevronRight,
    FileText,
    Pencil,
    X,
    Plus,
    Trash2,
    Save,
    AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useToast } from "@/components/ui/toast-provider";
import { useConfirm } from "@/components/ui/confirm-provider";

interface Schedule {
    id: string;
    scheduleDate: string;
    startTime: string;
    endTime: string;
    gateOpenTime: string | null;
}

interface TicketType {
    id: string;
    name: string;
    description: string | null;
    basePrice: string | number | null;
    price: string | number | null;
    totalQuantity: number;
    quantity: number;
    soldQuantity: number;
    soldCount: number;
    minPerOrder: number;
    maxPerOrder: number;
    isFree: boolean;
    isHidden: boolean;
    saleStartAt: string | null;
    saleEndAt: string | null;
    saleStartDate: string | null;
    saleEndDate: string | null;
    isActive: boolean;
}

interface Venue {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
}

interface Category {
    id: string;
    name: string;
    colorHex: string | null;
}

interface OrganizerProfile {
    organizationName: string | null;
    isVerified: boolean;
}

interface Organizer {
    id: string;
    name: string;
    email: string;
    organizerProfile: OrganizerProfile | null;
}

interface Revenue {
    total: number;
    organizer: number;
    platform: number;
}

interface PromoCode {
    id: string;
    code: string;
    description: string | null;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: string | number;
    maxDiscountAmount: string | number | null;
    minOrderAmount: string | number | null;
    usageLimitTotal: number | null;
    usageLimitPerUser: number | null;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
}

interface EventData {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    posterImage: string | null;
    bannerImage: string | null;
    status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "CANCELLED" | "ENDED";
    rejectionReason: string | null;
    publishedAt: string | null;
    createdAt: string;
    organizer: Organizer;
    category: Category | null;
    venue: Venue | null;
    schedules: Schedule[];
    ticketTypes: TicketType[];
    promoCodes: PromoCode[];
    revenue: Revenue;
    _count: {
        bookings: number;
        reviews: number;
    };
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-[var(--bg-secondary)] text-[var(--text-secondary)]",
    PENDING_REVIEW: "bg-yellow-500/10 text-yellow-600",
    PUBLISHED: "bg-green-500/10 text-green-600",
    CANCELLED: "bg-red-500/10 text-red-500",
    ENDED: "bg-[var(--bg-secondary)] text-[var(--text-secondary)]",
};

export default function AdminEventDetailPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    const [event, setEvent] = useState<EventData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showDescription, setShowDescription] = useState(false);
    const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
    const [ticketForm, setTicketForm] = useState({
        name: "",
        description: "",
        basePrice: 0,
        totalQuantity: 0,
        minPerOrder: 1,
        maxPerOrder: 10,
        isFree: false,
        isHidden: false,
        isActive: true,
    });
    const [ticketSaving, setTicketSaving] = useState(false);
    
    const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
    const [createTicketForm, setCreateTicketForm] = useState({
        name: "",
        description: "",
        basePrice: 0,
        totalQuantity: 100,
        minPerOrder: 1,
        maxPerOrder: 10,
        isFree: false,
        isHidden: false,
        isActive: true,
    });
    const [createTicketSaving, setCreateTicketSaving] = useState(false);
    
    const [showEditEventModal, setShowEditEventModal] = useState(false);
    const [editEventForm, setEditEventForm] = useState({
        title: "",
        shortDescription: "",
        description: "",
        posterImage: "",
        bannerImage: "",
        eventType: "OFFLINE" as "OFFLINE" | "ONLINE" | "HYBRID",
        isFeatured: false,
        termsAndConditions: "",
        refundPolicy: "",
    });
    const [editEventSaving, setEditEventSaving] = useState(false);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSaving, setDeleteSaving] = useState(false);
    
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [scheduleForm, setScheduleForm] = useState({
        title: "",
        scheduleDate: "",
        startTime: "",
        endTime: "",
        description: "",
        isActive: true,
    });
    const [scheduleSaving, setScheduleSaving] = useState(false);
    const [scheduleDeleting, setScheduleDeleting] = useState<string | null>(null);
    
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [promoForm, setPromoForm] = useState({
        code: "",
        description: "",
        discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
        discountValue: 0,
        maxDiscountAmount: 0,
        minOrderAmount: 0,
        usageLimitTotal: null as number | null,
        usageLimitPerUser: null as number | null,
        validFrom: "",
        validUntil: "",
        isActive: true,
    });
    const [promoSaving, setPromoSaving] = useState(false);
    const [promoDeleting, setPromoDeleting] = useState<string | null>(null);
    
    const [ticketDeleting, setTicketDeleting] = useState<string | null>(null);
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const fetchEvent = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/admin/events/${eventId}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/events");
                    return;
                }
                if (res.status === 403) {
                    router.push("/admin");
                    return;
                }
                if (res.status === 404) {
                    setError("Event not found");
                    return;
                }
                setError(data.error?.message || "Failed to load event");
                return;
            }

            if (data.success) {
                setEvent(data.data);
            }
        } catch {
            setError("Failed to load event");
        } finally {
            setIsLoading(false);
        }
    }, [eventId, router]);

    useEffect(() => {
        if (eventId) {
            fetchEvent();
        }
    }, [eventId, fetchEvent]);

    const handleStatusChange = async (newStatus: "PUBLISHED" | "CANCELLED" | "DRAFT") => {
        try {
            setActionLoading(newStatus);

            const body: { status: string; rejectionReason?: string } = { status: newStatus };
            if (newStatus === "CANCELLED" && rejectionReason) {
                body.rejectionReason = rejectionReason;
            }

            const res = await fetch(`/api/admin/events/${eventId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to update event", "error");
                return;
            }

            setShowRejectModal(false);
            setRejectionReason("");
            fetchEvent();
            showToast("Event updated successfully", "success");
        } catch {
            showToast("Failed to update event", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteTicket = async (ticketId: string) => {
        if (!await confirm("Are you sure you want to delete this ticket type?", {
            title: "Delete Ticket Type",
            description: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger"
        })) return;
        
        try {
            setTicketDeleting(ticketId);
            const res = await fetch(`/api/admin/ticket-types/${ticketId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to delete ticket type", "error");
                return;
            }

            fetchEvent();
            showToast("Ticket type deleted", "success");
        } catch {
            showToast("Failed to delete ticket type", "error");
        } finally {
            setTicketDeleting(null);
        }
    };

    const openEditTicket = (ticket: TicketType) => {
        setEditingTicket(ticket);
        setTicketForm({
            name: ticket.name,
            description: ticket.description || "",
            basePrice: Number(ticket.basePrice || ticket.price || 0),
            totalQuantity: ticket.totalQuantity || ticket.quantity || 0,
            minPerOrder: ticket.minPerOrder || 1,
            maxPerOrder: ticket.maxPerOrder || 10,
            isFree: ticket.isFree || false,
            isHidden: ticket.isHidden || false,
            isActive: ticket.isActive,
        });
    };

    const handleSaveTicket = async () => {
        if (!editingTicket) return;

        try {
            setTicketSaving(true);
            const res = await fetch(`/api/admin/ticket-types/${editingTicket.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ticketForm),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to update ticket", "error");
                return;
            }

            setEditingTicket(null);
            fetchEvent();
            showToast("Ticket updated successfully", "success");
        } catch {
            showToast("Failed to update ticket", "error");
        } finally {
            setTicketSaving(false);
        }
    };

    const handleCreateTicket = async () => {
        try {
            setCreateTicketSaving(true);
            const res = await fetch(`/api/admin/events/${eventId}/tickets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createTicketForm),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to create ticket", "error");
                return;
            }

            setShowCreateTicketModal(false);
            setCreateTicketForm({
                name: "",
                description: "",
                basePrice: 0,
                totalQuantity: 100,
                minPerOrder: 1,
                maxPerOrder: 10,
                isFree: false,
                isHidden: false,
                isActive: true,
            });
            fetchEvent();
            showToast("Ticket created successfully", "success");
        } catch {
            showToast("Failed to create ticket", "error");
        } finally {
            setCreateTicketSaving(false);
        }
    };

    const openEditEvent = () => {
        if (!event) return;
        setEditEventForm({
            title: event.title,
            shortDescription: event.shortDescription || "",
            description: event.description || "",
            posterImage: event.posterImage || "",
            bannerImage: event.bannerImage || "",
            eventType: "OFFLINE",
            isFeatured: false,
            termsAndConditions: "",
            refundPolicy: "",
        });
        setShowEditEventModal(true);
    };

    const handleSaveEvent = async () => {
        try {
            setEditEventSaving(true);
            const res = await fetch(`/api/admin/events/${eventId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editEventForm.title,
                    shortDescription: editEventForm.shortDescription || null,
                    description: editEventForm.description || null,
                    posterImage: editEventForm.posterImage || null,
                    bannerImage: editEventForm.bannerImage || null,
                    eventType: editEventForm.eventType,
                    isFeatured: editEventForm.isFeatured,
                    termsAndConditions: editEventForm.termsAndConditions || null,
                    refundPolicy: editEventForm.refundPolicy || null,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to update event", "error");
                return;
            }

            setShowEditEventModal(false);
            fetchEvent();
            showToast("Event updated successfully", "success");
        } catch {
            showToast("Failed to update event", "error");
        } finally {
            setEditEventSaving(false);
        }
    };

    const handleDeleteEvent = async () => {
        try {
            setDeleteSaving(true);
            const res = await fetch(`/api/admin/events/${eventId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to delete event", "error");
                return;
            }

            router.push("/admin/events");
            showToast("Event deleted successfully", "success");
        } catch {
            showToast("Failed to delete event", "error");
        } finally {
            setDeleteSaving(false);
        }
    };

    const openCreateSchedule = () => {
        setEditingSchedule(null);
        setScheduleForm({
            title: "",
            scheduleDate: "",
            startTime: "",
            endTime: "",
            description: "",
            isActive: true,
        });
        setShowScheduleModal(true);
    };

    const openEditSchedule = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        const dateOnly = schedule.scheduleDate.split("T")[0];
        setScheduleForm({
            title: "",
            scheduleDate: dateOnly,
            startTime: schedule.startTime.slice(0, 5),
            endTime: schedule.endTime.slice(0, 5),
            description: "",
            isActive: true,
        });
        setShowScheduleModal(true);
    };

    const handleSaveSchedule = async () => {
        try {
            setScheduleSaving(true);
            const url = editingSchedule
                ? `/api/admin/events/${eventId}/schedules/${editingSchedule.id}`
                : `/api/admin/events/${eventId}/schedules`;
            
            const res = await fetch(url, {
                method: editingSchedule ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scheduleForm),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to save schedule", "error");
                return;
            }

            setShowScheduleModal(false);
            setEditingSchedule(null);
            fetchEvent();
            showToast("Schedule saved successfully", "success");
        } catch {
            showToast("Failed to save schedule", "error");
        } finally {
            setScheduleSaving(false);
        }
    };

    const handleDeleteSchedule = async (scheduleId: string) => {
        if (!await confirm("Are you sure you want to delete this schedule?", {
            title: "Delete Schedule",
            description: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger"
        })) return;
        
        try {
            setScheduleDeleting(scheduleId);
            const res = await fetch(`/api/admin/events/${eventId}/schedules/${scheduleId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to delete schedule", "error");
                return;
            }

            fetchEvent();
            showToast("Schedule deleted", "success");
        } catch {
            showToast("Failed to delete schedule", "error");
        } finally {
            setScheduleDeleting(null);
        }
    };

    const openCreatePromo = () => {
        setEditingPromo(null);
        setPromoForm({
            code: "",
            description: "",
            discountType: "PERCENTAGE",
            discountValue: 0,
            maxDiscountAmount: 0,
            minOrderAmount: 0,
            usageLimitTotal: null,
            usageLimitPerUser: null,
            validFrom: "",
            validUntil: "",
            isActive: true,
        });
        setShowPromoModal(true);
    };

    const openEditPromo = (promo: PromoCode) => {
        setEditingPromo(promo);
        const validFromDate = new Date(promo.validFrom).toISOString().slice(0, 16);
        const validUntilDate = new Date(promo.validUntil).toISOString().slice(0, 16);
        setPromoForm({
            code: promo.code,
            description: promo.description || "",
            discountType: promo.discountType,
            discountValue: Number(promo.discountValue),
            maxDiscountAmount: promo.maxDiscountAmount ? Number(promo.maxDiscountAmount) : 0,
            minOrderAmount: promo.minOrderAmount ? Number(promo.minOrderAmount) : 0,
            usageLimitTotal: promo.usageLimitTotal,
            usageLimitPerUser: promo.usageLimitPerUser,
            validFrom: validFromDate,
            validUntil: validUntilDate,
            isActive: promo.isActive,
        });
        setShowPromoModal(true);
    };

    const handleSavePromo = async () => {
        try {
            setPromoSaving(true);
            const url = editingPromo
                ? `/api/admin/events/${eventId}/promo-codes/${editingPromo.id}`
                : `/api/admin/events/${eventId}/promo-codes`;
            
            const res = await fetch(url, {
                method: editingPromo ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...promoForm,
                    validFrom: new Date(promoForm.validFrom).toISOString(),
                    validUntil: new Date(promoForm.validUntil).toISOString(),
                }),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to save promo code", "error");
                return;
            }

            setShowPromoModal(false);
            setEditingPromo(null);
            fetchEvent();
            showToast("Promo code saved successfully", "success");
        } catch {
            showToast("Failed to save promo code", "error");
        } finally {
            setPromoSaving(false);
        }
    };

    const handleDeletePromo = async (promoId: string) => {
        if (!await confirm("Are you sure you want to delete this promo code?", {
            title: "Delete Promo Code",
            description: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger"
        })) return;
        
        try {
            setPromoDeleting(promoId);
            const res = await fetch(`/api/admin/events/${eventId}/promo-codes/${promoId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to delete promo code", "error");
                return;
            }

            fetchEvent();
            showToast("Promo code deleted", "success");
        } catch {
            showToast("Failed to delete promo code", "error");
        } finally {
            setPromoDeleting(null);
        }
    };

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string): string => {
        return timeStr.slice(0, 5);
    };

    const formatShortDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Loading event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-[var(--text-primary)] font-medium mb-2">{error || "Event not found"}</p>
                    <Link href="/admin/events" className="text-[var(--accent-primary)] hover:text-indigo-500">
                        Back to Events
                    </Link>
                </div>
            </div>
        );
    }

    const totalTickets = event.ticketTypes.reduce((sum, t) => sum + (t.quantity || 0), 0);
    const totalSold = event.ticketTypes.reduce((sum, t) => sum + (t.soldCount || 0), 0);

    return (
        <>
            <AdminHeader
                title="Event Details"
                subtitle={event.title}
                backHref="/admin/events"
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={openEditEvent}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)]"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Event
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 bg-[var(--surface)] text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/10"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                        <Link
                            href={`/events/${event.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)]"
                        >
                            <Eye className="h-4 w-4" />
                            View Public Page
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                        {event.status === "PENDING_REVIEW" && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange("PUBLISHED")}
                                    disabled={actionLoading !== null}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                    {actionLoading === "PUBLISHED" ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    Approve & Publish
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={actionLoading !== null}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                </button>
                            </>
                        )}
                        {event.status === "PUBLISHED" && (
                            <button
                                type="button"
                                onClick={() => setShowRejectModal(true)}
                                disabled={actionLoading !== null}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                                <Ban className="h-4 w-4" />
                                Cancel Event
                            </button>
                        )}
                        {event.status === "DRAFT" && (
                            <button
                                type="button"
                                onClick={() => handleStatusChange("PUBLISHED")}
                                disabled={actionLoading !== null}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                                {actionLoading === "PUBLISHED" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-4 w-4" />
                                )}
                                Publish Event
                            </button>
                        )}
                        {event.status === "CANCELLED" && (
                            <button
                                type="button"
                                onClick={() => handleStatusChange("DRAFT")}
                                disabled={actionLoading !== null}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                            >
                                {actionLoading === "DRAFT" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Clock className="h-4 w-4" />
                                )}
                                Move to Draft
                            </button>
                        )}
                    </div>
                }
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[var(--surface)] rounded-xl shadow-sm overflow-hidden">
                            {(event.bannerImage || event.posterImage) && (
                                <div className="h-48 bg-[var(--border)]">
                                    <img
                                        src={event.bannerImage || event.posterImage || ""}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                                            {event.title}
                                        </h1>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`px-3 py-1 text-sm font-medium rounded-full ${STATUS_COLORS[event.status]}`}
                                            >
                                                {event.status.replace(/_/g, " ")}
                                            </span>
                                            {event.category && (
                                                <span
                                                    className="px-3 py-1 text-sm font-medium rounded-full"
                                                    style={{
                                                        backgroundColor: `${event.category.colorHex}20`,
                                                        color: event.category.colorHex || "#6366f1",
                                                    }}
                                                >
                                                    <Tag className="inline h-3 w-3 mr-1" />
                                                    {event.category.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {event.shortDescription && (
                                    <p className="text-[var(--text-secondary)] mb-4">{event.shortDescription}</p>
                                )}

                                {event.description && (
                                    <div className="mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowDescription(!showDescription)}
                                            className="inline-flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                                        >
                                            <FileText className="h-4 w-4" />
                                            {showDescription ? "Hide" : "Show"} Full Description
                                        </button>
                                        {showDescription && (
                                            <div className="mt-3 p-4 bg-[var(--surface-hover)] rounded-lg">
                                                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{event.description}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Ticket className="h-5 w-5 text-indigo-500" />
                                        <div>
                                            <p className="text-sm text-[var(--text-muted)]">Tickets Sold</p>
                                            <p className="font-semibold">
                                                {totalSold} / {totalTickets}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Users className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm text-[var(--text-muted)]">Bookings</p>
                                            <p className="font-semibold">{event._count.bookings}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <DollarSign className="h-5 w-5 text-emerald-500" />
                                        <div>
                                            <p className="text-sm text-[var(--text-muted)]">Total Revenue</p>
                                            <p className="font-semibold">{formatCurrency(event.revenue.total)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <DollarSign className="h-5 w-5 text-purple-500" />
                                        <div>
                                            <p className="text-sm text-[var(--text-muted)]">Platform Fee</p>
                                            <p className="font-semibold">{formatCurrency(event.revenue.platform)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {event.status === "CANCELLED" && event.rejectionReason && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-red-600">Cancellation Reason</h3>
                                        <p className="text-red-700 mt-1">{event.rejectionReason}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Schedule & Venue</h2>
                                <button
                                    type="button"
                                    onClick={openCreateSchedule}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Schedule
                                </button>
                            </div>

                            {event.schedules.length > 0 ? (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Event Schedule</h3>
                                    <div className="space-y-2">
                                        {event.schedules.map((schedule) => (
                                            <div
                                                key={schedule.id}
                                                className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-5 w-5 text-indigo-500" />
                                                    <div>
                                                        <p className="font-medium text-[var(--text-primary)]">
                                                            {formatDate(schedule.scheduleDate)}
                                                        </p>
                                                        <p className="text-sm text-[var(--text-muted)]">
                                                            {formatTime(schedule.startTime)} -{" "}
                                                            {formatTime(schedule.endTime)}
                                                            {schedule.gateOpenTime && (
                                                                <span className="ml-2">
                                                                    (Gate: {formatTime(schedule.gateOpenTime)})
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditSchedule(schedule)}
                                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors"
                                                        title="Edit Schedule"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                                        disabled={scheduleDeleting === schedule.id}
                                                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Delete Schedule"
                                                    >
                                                        {scheduleDeleting === schedule.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4 p-4 bg-[var(--surface-hover)] rounded-lg text-center">
                                    <Calendar className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
                                    <p className="text-[var(--text-muted)] text-sm">No schedule set</p>
                                    <button
                                        type="button"
                                        onClick={openCreateSchedule}
                                        className="mt-2 text-sm text-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                                    >
                                        Add your first schedule
                                    </button>
                                </div>
                            )}

                            {event.venue ? (
                                <div>
                                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Venue</h3>
                                    <div className="flex items-start gap-3 p-3 bg-[var(--surface-hover)] rounded-lg">
                                        <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">{event.venue.name}</p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                {event.venue.address}, {event.venue.city}, {event.venue.province}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-[var(--surface-hover)] rounded-lg text-center">
                                    <MapPin className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
                                    <p className="text-[var(--text-muted)] text-sm">No venue set</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                    Ticket Types ({event.ticketTypes.length})
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateTicketModal(true)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Ticket
                                </button>
                            </div>
                            {event.ticketTypes.length > 0 ? (
                                <div className="space-y-3">
                                    {event.ticketTypes.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        ticket.isActive
                                                            ? "bg-indigo-100 text-[var(--accent-primary)]"
                                                            : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                                                    }`}
                                                >
                                                    <Ticket className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)]">
                                                        {ticket.name}
                                                        {!ticket.isActive && (
                                                            <span className="ml-2 text-xs text-[var(--text-muted)]">(Inactive)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-[var(--text-muted)]">
                                                        {ticket.soldCount || 0} / {ticket.quantity || 0} sold
                                                    </p>
                                                    {(ticket.saleStartDate || ticket.saleEndDate) && (
                                                        <p className="text-xs text-[var(--text-muted)] mt-1">
                                                            Sale: {ticket.saleStartDate ? formatShortDate(ticket.saleStartDate) : "Now"} 
                                                            {" - "}
                                                            {ticket.saleEndDate ? formatShortDate(ticket.saleEndDate) : "No end"}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="font-bold text-[var(--text-primary)]">
                                                        {!ticket.price || Number(ticket.price) === 0
                                                            ? "FREE"
                                                            : formatCurrency(Number(ticket.price))}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-muted)]">
                                                        Max {ticket.maxPerOrder || 10}/order
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditTicket(ticket)}
                                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors"
                                                        title="Edit Ticket"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteTicket(ticket.id)}
                                                        disabled={ticketDeleting === ticket.id}
                                                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Delete Ticket"
                                                    >
                                                        {ticketDeleting === ticket.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <Ticket className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
                                    <p className="text-[var(--text-muted)]">No ticket types configured</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                    Promo Codes ({event.promoCodes?.length || 0})
                                </h2>
                                <button
                                    type="button"
                                    onClick={openCreatePromo}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Promo
                                </button>
                            </div>
                            {event.promoCodes && event.promoCodes.length > 0 ? (
                                <div className="space-y-3">
                                    {event.promoCodes.map((promo) => (
                                        <div
                                            key={promo.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    promo.isActive ? "bg-green-500/10 text-green-600" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                                                }`}>
                                                    <Tag className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)] font-mono">
                                                        {promo.code}
                                                        {!promo.isActive && (
                                                            <span className="ml-2 text-xs text-[var(--text-muted)]">(Inactive)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-[var(--text-muted)]">
                                                        {promo.discountType === "PERCENTAGE"
                                                            ? `${promo.discountValue}% off`
                                                            : `${formatCurrency(Number(promo.discountValue))} off`}
                                                        {" • "}
                                                        {promo.usedCount}/{promo.usageLimitTotal || "∞"} used
                                                    </p>
                                                    <p className="text-xs text-[var(--text-muted)] mt-1">
                                                        Valid: {new Date(promo.validFrom).toLocaleDateString()} - {new Date(promo.validUntil).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditPromo(promo)}
                                                    className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors"
                                                    title="Edit Promo"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePromo(promo.id)}
                                                    disabled={promoDeleting === promo.id}
                                                    className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete Promo"
                                                >
                                                    {promoDeleting === promo.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <Tag className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
                                    <p className="text-[var(--text-muted)]">No promo codes created</p>
                                    <button
                                        type="button"
                                        onClick={openCreatePromo}
                                        className="mt-2 text-sm text-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                                    >
                                        Create your first promo code
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Organizer</h2>
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-[var(--text-primary)]">
                                        {event.organizer.organizerProfile?.organizationName ||
                                            event.organizer.name}
                                    </p>
                                    <p className="text-sm text-[var(--text-muted)]">{event.organizer.email}</p>
                                    {event.organizer.organizerProfile?.isVerified && (
                                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs font-medium bg-green-500/10 text-green-600 rounded-full">
                                            <CheckCircle className="h-3 w-3" />
                                            Verified Organizer
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Link
                                href={`/admin/users/${event.organizer.id}`}
                                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 rounded-lg hover:bg-indigo-100"
                            >
                                <User className="h-4 w-4" />
                                View Organizer Profile
                            </Link>
                        </div>

                        <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Revenue Breakdown</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Total Revenue</span>
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {formatCurrency(event.revenue.total)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Organizer Share</span>
                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(event.revenue.organizer)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Platform Fee</span>
                                    <span className="font-semibold text-purple-600">
                                        {formatCurrency(event.revenue.platform)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Statistics</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Total Bookings</span>
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {event._count.bookings}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Tickets Sold</span>
                                    <span className="font-semibold text-[var(--text-primary)]">{totalSold}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Total Capacity</span>
                                    <span className="font-semibold text-[var(--text-primary)]">{totalTickets}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Reviews</span>
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {event._count.reviews}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Timeline</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-[var(--text-muted)]" />
                                    <div>
                                        <p className="text-sm text-[var(--text-muted)]">Created</p>
                                        <p className="text-[var(--text-primary)]">
                                            {new Date(event.createdAt).toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                </div>
                                {event.publishedAt && (
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm text-[var(--text-muted)]">Published</p>
                                            <p className="text-[var(--text-primary)]">
                                                {new Date(event.publishedAt).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Quick Links</h2>
                            <div className="space-y-2">
                                <Link
                                    href={`/admin/bookings?eventId=${event.id}`}
                                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Ticket className="h-5 w-5 text-indigo-500" />
                                        <span className="font-medium text-[var(--text-primary)]">
                                            View Bookings ({event._count.bookings})
                                        </span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-[var(--surface)] rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-500/10 rounded-full">
                                <Ban className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-2">
                                {event.status === "PENDING_REVIEW"
                                    ? "Reject Event"
                                    : "Cancel Event"}
                            </h3>
                            <p className="text-[var(--text-muted)] text-center mb-4">
                                Please provide a reason for{" "}
                                {event.status === "PENDING_REVIEW" ? "rejecting" : "cancelling"} this
                                event.
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter reason..."
                                rows={3}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason("");
                                    }}
                                    disabled={actionLoading !== null}
                                    className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange("CANCELLED")}
                                    disabled={actionLoading !== null || !rejectionReason.trim()}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading === "CANCELLED" ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Ban className="h-4 w-4" />
                                            {event.status === "PENDING_REVIEW"
                                                ? "Reject Event"
                                                : "Cancel Event"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-[var(--surface)] rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Edit Ticket Type</h3>
                            <button
                                type="button"
                                onClick={() => setEditingTicket(null)}
                                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="ticket-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Ticket Name
                                </label>
                                <input
                                    id="ticket-name"
                                    type="text"
                                    value={ticketForm.name}
                                    onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                />
                            </div>
                            <div>
                                <label htmlFor="ticket-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="ticket-description"
                                    value={ticketForm.description}
                                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="ticket-price" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Price (IDR)
                                    </label>
                                    <input
                                        id="ticket-price"
                                        type="number"
                                        min="0"
                                        value={ticketForm.basePrice}
                                        onChange={(e) => setTicketForm({ ...ticketForm, basePrice: Number(e.target.value) })}
                                        disabled={ticketForm.isFree}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:bg-[var(--bg-secondary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ticket-quantity" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Total Quantity
                                    </label>
                                    <input
                                        id="ticket-quantity"
                                        type="number"
                                        min="0"
                                        value={ticketForm.totalQuantity}
                                        onChange={(e) => setTicketForm({ ...ticketForm, totalQuantity: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                    <p className="text-xs text-[var(--text-muted)] mt-1">
                                        Sold: {editingTicket.soldQuantity || editingTicket.soldCount || 0}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="ticket-min" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Min per Order
                                    </label>
                                    <input
                                        id="ticket-min"
                                        type="number"
                                        min="1"
                                        value={ticketForm.minPerOrder}
                                        onChange={(e) => setTicketForm({ ...ticketForm, minPerOrder: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ticket-max" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Max per Order
                                    </label>
                                    <input
                                        id="ticket-max"
                                        type="number"
                                        min="1"
                                        value={ticketForm.maxPerOrder}
                                        onChange={(e) => setTicketForm({ ...ticketForm, maxPerOrder: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={ticketForm.isFree}
                                        onChange={(e) => setTicketForm({ 
                                            ...ticketForm, 
                                            isFree: e.target.checked,
                                            basePrice: e.target.checked ? 0 : ticketForm.basePrice 
                                        })}
                                        className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                    />
                                    <span className="text-sm text-[var(--text-secondary)]">Free Ticket</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={ticketForm.isHidden}
                                        onChange={(e) => setTicketForm({ ...ticketForm, isHidden: e.target.checked })}
                                        className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                    />
                                    <span className="text-sm text-[var(--text-secondary)]">Hidden</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={ticketForm.isActive}
                                        onChange={(e) => setTicketForm({ ...ticketForm, isActive: e.target.checked })}
                                        className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                    />
                                    <span className="text-sm text-[var(--text-secondary)]">Active</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <button
                                type="button"
                                onClick={() => setEditingTicket(null)}
                                disabled={ticketSaving}
                                className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveTicket}
                                disabled={ticketSaving || !ticketForm.name.trim()}
                                className="flex-1 px-4 py-2.5 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {ticketSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateTicketModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-[var(--surface)] rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Create Ticket Type</h3>
                            <button
                                type="button"
                                onClick={() => setShowCreateTicketModal(false)}
                                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="create-ticket-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Ticket Name
                                </label>
                                <input
                                    id="create-ticket-name"
                                    type="text"
                                    value={createTicketForm.name}
                                    onChange={(e) => setCreateTicketForm({ ...createTicketForm, name: e.target.value })}
                                    placeholder="e.g., Regular, VIP, Early Bird"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                />
                            </div>
                            <div>
                                <label htmlFor="create-ticket-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="create-ticket-description"
                                    value={createTicketForm.description}
                                    onChange={(e) => setCreateTicketForm({ ...createTicketForm, description: e.target.value })}
                                    rows={2}
                                    placeholder="What's included with this ticket?"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="create-ticket-price" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Price (IDR)
                                    </label>
                                    <input
                                        id="create-ticket-price"
                                        type="number"
                                        min="0"
                                        value={createTicketForm.basePrice}
                                        onChange={(e) => setCreateTicketForm({ ...createTicketForm, basePrice: Number(e.target.value) })}
                                        disabled={createTicketForm.isFree}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:bg-[var(--bg-secondary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="create-ticket-quantity" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Total Quantity
                                    </label>
                                    <input
                                        id="create-ticket-quantity"
                                        type="number"
                                        min="1"
                                        value={createTicketForm.totalQuantity}
                                        onChange={(e) => setCreateTicketForm({ ...createTicketForm, totalQuantity: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="create-ticket-min" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Min per Order
                                    </label>
                                    <input
                                        id="create-ticket-min"
                                        type="number"
                                        min="1"
                                        value={createTicketForm.minPerOrder}
                                        onChange={(e) => setCreateTicketForm({ ...createTicketForm, minPerOrder: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="create-ticket-max" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Max per Order
                                    </label>
                                    <input
                                        id="create-ticket-max"
                                        type="number"
                                        min="1"
                                        value={createTicketForm.maxPerOrder}
                                        onChange={(e) => setCreateTicketForm({ ...createTicketForm, maxPerOrder: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createTicketForm.isFree}
                                        onChange={(e) => setCreateTicketForm({ 
                                            ...createTicketForm, 
                                            isFree: e.target.checked,
                                            basePrice: e.target.checked ? 0 : createTicketForm.basePrice 
                                        })}
                                        className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                    />
                                    <span className="text-sm text-[var(--text-secondary)]">Free Ticket</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createTicketForm.isHidden}
                                        onChange={(e) => setCreateTicketForm({ ...createTicketForm, isHidden: e.target.checked })}
                                        className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                    />
                                    <span className="text-sm text-[var(--text-secondary)]">Hidden</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createTicketForm.isActive}
                                        onChange={(e) => setCreateTicketForm({ ...createTicketForm, isActive: e.target.checked })}
                                        className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                    />
                                    <span className="text-sm text-[var(--text-secondary)]">Active</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <button
                                type="button"
                                onClick={() => setShowCreateTicketModal(false)}
                                disabled={createTicketSaving}
                                className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateTicket}
                                disabled={createTicketSaving || !createTicketForm.name.trim()}
                                className="flex-1 px-4 py-2.5 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {createTicketSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Create Ticket
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditEventModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-[var(--surface)] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Edit Event</h3>
                            <button
                                type="button"
                                onClick={() => setShowEditEventModal(false)}
                                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="edit-event-title" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Event Title
                                </label>
                                <input
                                    id="edit-event-title"
                                    type="text"
                                    value={editEventForm.title}
                                    onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-event-short-desc" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Short Description
                                </label>
                                <input
                                    id="edit-event-short-desc"
                                    type="text"
                                    maxLength={200}
                                    value={editEventForm.shortDescription}
                                    onChange={(e) => setEditEventForm({ ...editEventForm, shortDescription: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-1">{editEventForm.shortDescription.length}/200</p>
                            </div>
                            <div>
                                <label htmlFor="edit-event-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Full Description
                                </label>
                                <textarea
                                    id="edit-event-description"
                                    value={editEventForm.description}
                                    onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <ImageUploadField
                                        label="Poster Image"
                                        value={editEventForm.posterImage}
                                        onChange={(url) => setEditEventForm({ ...editEventForm, posterImage: url })}
                                        bucket="events"
                                        folder={eventId}
                                        aspectRatio="2/3"
                                    />
                                </div>
                                <div>
                                    <ImageUploadField
                                        label="Banner Image"
                                        value={editEventForm.bannerImage}
                                        onChange={(url) => setEditEventForm({ ...editEventForm, bannerImage: url })}
                                        bucket="events"
                                        folder={eventId}
                                        aspectRatio="16/9"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-event-type" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Event Type
                                    </label>
                                    <select
                                        id="edit-event-type"
                                        value={editEventForm.eventType}
                                        onChange={(e) => setEditEventForm({ ...editEventForm, eventType: e.target.value as "OFFLINE" | "ONLINE" | "HYBRID" })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    >
                                        <option value="OFFLINE">Offline</option>
                                        <option value="ONLINE">Online</option>
                                        <option value="HYBRID">Hybrid</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer mt-6">
                                        <input
                                            type="checkbox"
                                            checked={editEventForm.isFeatured}
                                            onChange={(e) => setEditEventForm({ ...editEventForm, isFeatured: e.target.checked })}
                                            className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">Featured Event</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="edit-event-terms" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Terms and Conditions
                                </label>
                                <textarea
                                    id="edit-event-terms"
                                    value={editEventForm.termsAndConditions}
                                    onChange={(e) => setEditEventForm({ ...editEventForm, termsAndConditions: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-event-refund" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Refund Policy
                                </label>
                                <textarea
                                    id="edit-event-refund"
                                    value={editEventForm.refundPolicy}
                                    onChange={(e) => setEditEventForm({ ...editEventForm, refundPolicy: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <button
                                type="button"
                                onClick={() => setShowEditEventModal(false)}
                                disabled={editEventSaving}
                                className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEvent}
                                disabled={editEventSaving || !editEventForm.title.trim()}
                                className="flex-1 px-4 py-2.5 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {editEventSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-[var(--surface)] rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-500/10 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-2">
                                Delete Event
                            </h3>
                            <p className="text-[var(--text-muted)] text-center mb-2">
                                Are you sure you want to delete this event?
                            </p>
                            <p className="text-sm text-[var(--text-secondary)] text-center font-medium mb-4">
                                &quot;{event.title}&quot;
                            </p>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-600">
                                    <strong>Note:</strong> This action performs a soft delete. The event will be hidden but can be recovered by a super admin. Events with confirmed bookings cannot be deleted.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteSaving}
                                    className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteEvent}
                                    disabled={deleteSaving}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleteSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4" />
                                            Delete Event
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-[var(--surface)] rounded-2xl shadow-xl max-w-lg w-full">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                {editingSchedule ? "Edit Schedule" : "Create Schedule"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowScheduleModal(false);
                                    setEditingSchedule(null);
                                }}
                                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="schedule-title" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Title (Optional)
                                </label>
                                <input
                                    id="schedule-title"
                                    type="text"
                                    value={scheduleForm.title}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                                    placeholder="Day 1, Workshop Session, etc."
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                />
                            </div>
                            <div>
                                <label htmlFor="schedule-date" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Date
                                </label>
                                <input
                                    id="schedule-date"
                                    type="date"
                                    value={scheduleForm.scheduleDate}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleDate: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="schedule-start-time" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Start Time
                                    </label>
                                    <input
                                        id="schedule-start-time"
                                        type="time"
                                        value={scheduleForm.startTime}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="schedule-end-time" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        End Time
                                    </label>
                                    <input
                                        id="schedule-end-time"
                                        type="time"
                                        value={scheduleForm.endTime}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="schedule-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    id="schedule-description"
                                    value={scheduleForm.description}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                                    rows={3}
                                    placeholder="Additional details about this schedule..."
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={scheduleForm.isActive}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, isActive: e.target.checked })}
                                    className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                />
                                <span className="text-sm text-[var(--text-secondary)]">Active</span>
                            </label>
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowScheduleModal(false);
                                    setEditingSchedule(null);
                                }}
                                disabled={scheduleSaving}
                                className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveSchedule}
                                disabled={scheduleSaving || !scheduleForm.scheduleDate || !scheduleForm.startTime || !scheduleForm.endTime}
                                className="flex-1 px-4 py-2.5 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {scheduleSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {editingSchedule ? "Save Changes" : "Create Schedule"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPromoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-[var(--surface)] rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                {editingPromo ? "Edit Promo Code" : "Create Promo Code"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPromoModal(false);
                                    setEditingPromo(null);
                                }}
                                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="promo-code" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Code
                                </label>
                                <input
                                    id="promo-code"
                                    type="text"
                                    value={promoForm.code}
                                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                                    placeholder="SUMMER2024"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] font-mono"
                                    disabled={!!editingPromo}
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-1">Use uppercase letters, numbers, hyphens, and underscores only</p>
                            </div>
                            <div>
                                <label htmlFor="promo-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    id="promo-description"
                                    value={promoForm.description}
                                    onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                                    rows={2}
                                    placeholder="What's this promo for?"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="promo-discount-type" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Discount Type
                                    </label>
                                    <select
                                        id="promo-discount-type"
                                        value={promoForm.discountType}
                                        onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as "PERCENTAGE" | "FIXED_AMOUNT" })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED_AMOUNT">Fixed Amount (IDR)</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="promo-discount-value" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Discount Value
                                    </label>
                                    <input
                                        id="promo-discount-value"
                                        type="number"
                                        min="0"
                                        max={promoForm.discountType === "PERCENTAGE" ? 100 : undefined}
                                        value={promoForm.discountValue}
                                        onChange={(e) => setPromoForm({ ...promoForm, discountValue: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="promo-min-order" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Min Order Amount (IDR)
                                    </label>
                                    <input
                                        id="promo-min-order"
                                        type="number"
                                        min="0"
                                        value={promoForm.minOrderAmount}
                                        onChange={(e) => setPromoForm({ ...promoForm, minOrderAmount: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="promo-max-discount" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Max Discount (IDR)
                                    </label>
                                    <input
                                        id="promo-max-discount"
                                        type="number"
                                        min="0"
                                        value={promoForm.maxDiscountAmount}
                                        onChange={(e) => setPromoForm({ ...promoForm, maxDiscountAmount: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="promo-usage-total" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Total Usage Limit
                                    </label>
                                    <input
                                        id="promo-usage-total"
                                        type="number"
                                        min="1"
                                        value={promoForm.usageLimitTotal || ""}
                                        onChange={(e) => setPromoForm({ ...promoForm, usageLimitTotal: e.target.value ? Number(e.target.value) : null })}
                                        placeholder="Unlimited"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="promo-usage-per-user" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Per User Limit
                                    </label>
                                    <input
                                        id="promo-usage-per-user"
                                        type="number"
                                        min="1"
                                        value={promoForm.usageLimitPerUser || ""}
                                        onChange={(e) => setPromoForm({ ...promoForm, usageLimitPerUser: e.target.value ? Number(e.target.value) : null })}
                                        placeholder="Unlimited"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="promo-valid-from" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Valid From
                                    </label>
                                    <input
                                        id="promo-valid-from"
                                        type="datetime-local"
                                        value={promoForm.validFrom}
                                        onChange={(e) => setPromoForm({ ...promoForm, validFrom: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="promo-valid-until" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Valid Until
                                    </label>
                                    <input
                                        id="promo-valid-until"
                                        type="datetime-local"
                                        value={promoForm.validUntil}
                                        onChange={(e) => setPromoForm({ ...promoForm, validUntil: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={promoForm.isActive}
                                    onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                                    className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                />
                                <span className="text-sm text-[var(--text-secondary)]">Active</span>
                            </label>
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPromoModal(false);
                                    setEditingPromo(null);
                                }}
                                disabled={promoSaving}
                                className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePromo}
                                disabled={promoSaving || !promoForm.code || !promoForm.validFrom || !promoForm.validUntil}
                                className="flex-1 px-4 py-2.5 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {promoSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {editingPromo ? "Save Changes" : "Create Promo"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
