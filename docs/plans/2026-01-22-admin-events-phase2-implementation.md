# Admin Events Detail Page - Phase 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor monolithic detail page into maintainable components and add missing features (activity timeline, bookings management, analytics)

**Current State:** 1159+ lines, 20+ state variables, 7 modals in one file
**Target State:** < 200 lines main file, extracted components, clean architecture

**Architecture:**
- Component extraction: Break monolith into focused, reusable components
- State management: Use useReducer for complex state
- Modals: Separate modal components
- New features: Timeline, bookings, analytics
- Better organization: Logical sections

**Tech Stack:**
- Next.js 15 (Client Components)
- React (useReducer, custom hooks)
- Recharts (for analytics)
- TypeScript

---

## Task 1: Create Component Directory Structure

**Step 1: Create directory structure**

```bash
mkdir -p app/admin/events/[id]/components
mkdir -p app/admin/events/[id]/components/modals
mkdir -p app/admin/events/[id]/components/sections
```

**Step 2: Verify structure**

```bash
tree app/admin/events/[id]/components
```

Expected output:
```
app/admin/events/[id]/components/
├── modals/
└── sections/
```

---

## Task 2: Extract Modals to Separate Components

### Subtask 2.1: Extract Reject Modal

**Files:**
- Create: `app/admin/events/[id]/components/modals/RejectEventModal.tsx`

**Content:**

```typescript
"use client";

import { useState } from "react";
import { XCircle, X, Loader2 } from "lucide-react";

interface RejectEventModalProps {
    isOpen: boolean;
    eventId: string;
    onClose: () => void;
    onReject: (eventId: string, reason: string) => Promise<void>;
    isLoading: boolean;
}

export function RejectEventModal({
    isOpen,
    eventId,
    onClose,
    onReject,
    isLoading,
}: RejectEventModalProps) {
    const [rejectionReason, setRejectionReason] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!rejectionReason.trim()) return;
        await onReject(eventId, rejectionReason);
        setRejectionReason("");
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Reject Event</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="mb-4">
                    <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Rejection Reason
                    </label>
                    <textarea
                        id="rejection-reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Explain why this event is being rejected..."
                    />
                </div>
                
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading || !rejectionReason.trim()}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isLoading ? "Rejecting..." : "Reject Event"}
                    </button>
                </div>
            </div>
        </div>
    );
}
```

### Subtask 2.2: Extract Edit Event Modal

**Files:**
- Create: `app/admin/events/[id]/components/modals/EditEventModal.tsx`

**Content:**

```typescript
"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

interface EditEventModalProps {
    isOpen: boolean;
    event: {
        title: string;
        shortDescription: string | null;
        description: string | null;
        posterImage: string | null;
        bannerImage: string | null;
    };
    onClose: () => void;
    onSave: (data: EditEventFormData) => Promise<void>;
    isLoading: boolean;
}

export interface EditEventFormData {
    title: string;
    shortDescription: string;
    description: string;
    posterImage: string;
    bannerImage: string;
}

export function EditEventModal({
    isOpen,
    event,
    onClose,
    onSave,
    isLoading,
}: EditEventModalProps) {
    const [formData, setFormData] = useState<EditEventFormData>({
        title: event.title,
        shortDescription: event.shortDescription || "",
        description: event.description || "",
        posterImage: event.posterImage || "",
        bannerImage: event.bannerImage || "",
    });

    if (!isOpen) return null;

    const handleSubmit = async () => {
        await onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Edit Event</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Title
                        </label>
                        <input
                            id="event-title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="event-short-desc" className="block text-sm font-medium text-gray-700 mb-1">
                            Short Description
                        </label>
                        <textarea
                            id="event-short-desc"
                            value={formData.shortDescription}
                            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="event-desc" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Description
                        </label>
                        <textarea
                            id="event-desc"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Poster Image
                        </label>
                        <ImageUploadField
                            value={formData.posterImage}
                            onChange={(url) => setFormData({ ...formData, posterImage: url })}
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Banner Image
                        </label>
                        <ImageUploadField
                            value={formData.bannerImage}
                            onChange={(url) => setFormData({ ...formData, bannerImage: url })}
                            className="w-full"
                        />
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading || !formData.title.trim()}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Save className="h-4 w-4" />
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
```

### Subtask 2.3: Extract Ticket Modal

**Files:**
- Create: `app/admin/events/[id]/components/modals/TicketModal.tsx`

(Similar pattern - create/edit ticket in one modal)

### Subtask 2.4: Extract Schedule Modal

**Files:**
- Create: `app/admin/events/[id]/components/modals/ScheduleModal.tsx`

### Subtask 2.5: Extract Promo Code Modal

**Files:**
- Create: `app/admin/events/[id]/components/modals/PromoCodeModal.tsx`

### Subtask 2.6: Extract Delete Confirmation Modal

**Files:**
- Create: `app/admin/events/[id]/components/modals/DeleteEventModal.tsx`

**Commit after all modals extracted:**

```bash
git add app/admin/events/[id]/components/modals/
git commit -m "refactor: extract all modals to separate components for event detail page"
```

---

## Task 3: Extract Section Components

### Subtask 3.1: Create EventHeader Component

**Files:**
- Create: `app/admin/events/[id]/components/sections/EventHeader.tsx`

**Purpose:** Display event title, status badge, category, and action buttons

### Subtask 3.2: Create EventStats Component

**Files:**
- Create: `app/admin/events/[id]/components/sections/EventStats.tsx`

**Purpose:** Display tickets sold, bookings, revenue stats

### Subtask 3.3: Create ScheduleSection Component

**Files:**
- Create: `app/admin/events/[id]/components/sections/ScheduleSection.tsx`

**Purpose:** List schedules with edit/delete buttons

### Subtask 3.4: Create TicketTypeSection Component

**Files:**
- Create: `app/admin/events/[id]/components/sections/TicketTypeSection.tsx`

**Purpose:** List ticket types with edit/delete buttons

### Subtask 3.5: Create PromoCodeSection Component

**Files:**
- Create: `app/admin/events/[id]/components/sections/PromoCodeSection.tsx`

**Purpose:** List promo codes with edit/delete buttons

**Commit after section extraction:**

```bash
git add app/admin/events/[id]/components/sections/
git commit -m "refactor: extract section components for event detail page"
```

---

## Task 4: Create Activity Timeline Component

**Files:**
- Create: `app/admin/events/[id]/components/sections/ActivityTimeline.tsx`
- Create: `app/api/admin/events/[id]/timeline/route.ts`

**Backend (Timeline API):**

```typescript
// app/api/admin/events/[id]/timeline/route.ts
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const admin = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
            return errorResponse("Admin access required", 403);
        }

        const eventId = params.id;

        // Get event timeline (we'll build this from existing data)
        const timeline: any[] = [];

        // Event created
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                createdAt: true,
                publishedAt: true,
                status: true,
            },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        timeline.push({
            id: "created",
            action: "created",
            description: "Event was created",
            createdAt: event.createdAt,
        });

        if (event.publishedAt) {
            timeline.push({
                id: "published",
                action: "published",
                description: "Event was published",
                createdAt: event.publishedAt,
            });
        }

        // Get bookings milestones
        const bookingsCount = await prisma.booking.count({
            where: { eventId },
        });

        if (bookingsCount > 0) {
            const firstBooking = await prisma.booking.findFirst({
                where: { eventId },
                orderBy: { createdAt: 'asc' },
                select: { createdAt: true },
            });

            if (firstBooking) {
                timeline.push({
                    id: "first-booking",
                    action: "first_booking",
                    description: "First booking received",
                    createdAt: firstBooking.createdAt,
                });
            }
        }

        // Sort by date
        timeline.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return successResponse(timeline);
    } catch (error) {
        console.error("Error fetching event timeline:", error);
        return errorResponse("Failed to fetch timeline", 500);
    }
}
```

**Frontend Component:**

```typescript
// app/admin/events/[id]/components/sections/ActivityTimeline.tsx
"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, Calendar, Users, Loader2 } from "lucide-react";

interface TimelineEntry {
    id: string;
    action: string;
    description: string;
    createdAt: string;
}

interface ActivityTimelineProps {
    eventId: string;
}

const ACTION_ICONS: Record<string, any> = {
    created: Calendar,
    published: CheckCircle,
    status_changed: Clock,
    first_booking: Users,
};

export function ActivityTimeline({ eventId }: ActivityTimelineProps) {
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTimeline();
    }, [eventId]);

    const fetchTimeline = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/admin/events/${eventId}/timeline`);
            const data = await res.json();

            if (data.success) {
                setTimeline(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch timeline:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Timeline</h2>
            
            {timeline.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No activity yet</p>
            ) : (
                <div className="space-y-4">
                    {timeline.map((entry, index) => {
                        const Icon = ACTION_ICONS[entry.action] || Clock;
                        
                        return (
                            <div key={entry.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <Icon className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    {index < timeline.length - 1 && (
                                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="font-medium text-gray-900">{entry.description}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(entry.createdAt).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
```

**Commit:**

```bash
git add app/admin/events/[id]/components/sections/ActivityTimeline.tsx app/api/admin/events/[id]/timeline/
git commit -m "feat: add activity timeline component for event detail page"
```

---

## Task 5: Create Bookings Management Section

**Files:**
- Create: `app/admin/events/[id]/components/sections/BookingsSection.tsx`
- Create: `app/api/admin/events/[id]/bookings/route.ts`

(Similar pattern to users list - pagination, filters, search)

---

## Task 6: Create Revenue Analytics Component

**Files:**
- Create: `app/admin/events/[id]/components/sections/RevenueAnalytics.tsx`
- Create: `app/api/admin/events/[id]/analytics/route.ts`

**Features:**
- Daily ticket sales line chart
- Revenue by ticket type pie chart  
- Booking timeline (when people buy)
- Platform vs Organizer revenue

---

## Task 7: Refactor Main Page File

**Files:**
- Modify: `app/admin/events/[id]/page.tsx`

**Goal:** Reduce from 1159+ lines to < 200 lines by importing all extracted components

**Pattern:**

```typescript
"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { EventHeader } from "./components/sections/EventHeader";
import { EventStats } from "./components/sections/EventStats";
import { ScheduleSection } from "./components/sections/ScheduleSection";
import { TicketTypeSection } from "./components/sections/TicketTypeSection";
import { PromoCodeSection } from "./components/sections/PromoCodeSection";
import { ActivityTimeline } from "./components/sections/ActivityTimeline";
import { BookingsSection } from "./components/sections/BookingsSection";
import { RevenueAnalytics } from "./components/sections/RevenueAnalytics";

export default function AdminEventDetailPage() {
    const params = useParams();
    const eventId = params.id as string;
    
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Fetch logic here (simplified)
    
    if (isLoading) return <LoadingState />;
    if (!event) return <ErrorState />;
    
    return (
        <>
            <AdminHeader title="Event Details" backHref="/admin/events" />
            
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <EventHeader event={event} onRefresh={fetchEvent} />
                        <EventStats event={event} />
                        <ScheduleSection eventId={eventId} schedules={event.schedules} onUpdate={fetchEvent} />
                        <TicketTypeSection eventId={eventId} tickets={event.ticketTypes} onUpdate={fetchEvent} />
                        <PromoCodeSection eventId={eventId} promoCodes={event.promoCodes} onUpdate={fetchEvent} />
                        <BookingsSection eventId={eventId} />
                    </div>
                    
                    <div className="space-y-6">
                        <ActivityTimeline eventId={eventId} />
                        <RevenueAnalytics eventId={eventId} />
                    </div>
                </div>
            </main>
        </>
    );
}
```

**Commit:**

```bash
git add app/admin/events/[id]/page.tsx
git commit -m "refactor: simplify main event detail page by using extracted components"
```

---

## Task 8: Implement useReducer for State Management

**Pattern:** Replace 20+ useState with single useReducer

---

## Success Criteria

Phase 2 complete when:
- [ ] Main file < 200 lines
- [ ] 6 modals extracted
- [ ] 8+ section components created
- [ ] Activity timeline displays all actions
- [ ] Bookings section searchable/filterable
- [ ] Revenue analytics charts working
- [ ] All TypeScript errors resolved
- [ ] Build passes
- [ ] Manual testing complete

---

**Total Estimated Time:** 16-20 hours
**Complexity:** High (requires careful refactoring)
