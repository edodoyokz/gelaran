# Admin Events List Page - Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement pagination, enhanced filters, sorting, bulk actions, export, and analytics for events list page

**Architecture:** 
- Backend: Add pagination, filtering, and sorting to API
- Frontend: Add UI controls for pagination, filters, sorting, bulk actions
- State management: URL params for shareable filtered/sorted views
- Performance: Reduce initial load, enable efficient data fetching

**Tech Stack:** 
- Next.js 15 (API Routes + Client Components)
- Prisma ORM (complex queries with filtering, sorting, pagination)
- React (useState, useEffect, useCallback)
- Recharts (data visualization)
- TypeScript

---

## Task 1: Add Backend Pagination, Filters, and Sorting

**Files:**
- Modify: `app/api/admin/events/route.ts`

**Step 1: Update GET handler to accept query params**

Update function signature and extract query parameters:

```typescript
export async function GET(request: Request) {
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

        const url = new URL(request.url);
        
        // Pagination params
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;
        
        // Filter params
        const statusFilter = url.searchParams.get('status') || '';
        const categoryFilter = url.searchParams.get('category') || '';
        const organizerFilter = url.searchParams.get('organizer') || '';
        const search = url.searchParams.get('search') || '';
        const dateFrom = url.searchParams.get('dateFrom') ? new Date(url.searchParams.get('dateFrom')!) : null;
        const dateTo = url.searchParams.get('dateTo') ? new Date(url.searchParams.get('dateTo')!) : null;
        const scheduledFrom = url.searchParams.get('scheduledFrom') ? new Date(url.searchParams.get('scheduledFrom')!) : null;
        const scheduledTo = url.searchParams.get('scheduledTo') ? new Date(url.searchParams.get('scheduledTo')!) : null;
        const cityFilter = url.searchParams.get('city') || '';
        const hasBookingsFilter = url.searchParams.get('hasBookings') || '';
        
        // Sort params
        const sortBy = url.searchParams.get('sortBy') || 'createdAt';
        const sortOrder = url.searchParams.get('sortOrder') || 'desc';
```

**Step 2: Build dynamic where clause for filters**

Add after query param extraction:

```typescript
        // Build where clause dynamically
        const where: any = {};
        
        // Status filter
        if (statusFilter) {
            where.status = statusFilter;
        }
        
        // Category filter
        if (categoryFilter) {
            where.categoryId = categoryFilter;
        }
        
        // Organizer filter
        if (organizerFilter) {
            where.organizerId = organizerFilter;
        }
        
        // Search filter (title, organizer name, organization name)
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { organizer: { name: { contains: search, mode: 'insensitive' } } },
                { organizer: { organizerProfile: { organizationName: { contains: search, mode: 'insensitive' } } } },
            ];
        }
        
        // Date range filter (created date)
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = dateFrom;
            if (dateTo) where.createdAt.lte = dateTo;
        }
        
        // Scheduled date filter (check schedules)
        if (scheduledFrom || scheduledTo) {
            where.schedules = {
                some: {
                    scheduleDate: {
                        ...(scheduledFrom && { gte: scheduledFrom }),
                        ...(scheduledTo && { lte: scheduledTo }),
                    },
                },
            };
        }
        
        // City filter
        if (cityFilter) {
            where.venue = {
                city: { contains: cityFilter, mode: 'insensitive' },
            };
        }
        
        // Has bookings filter
        if (hasBookingsFilter === 'yes') {
            where.bookings = { some: {} };
        } else if (hasBookingsFilter === 'no') {
            where.bookings = { none: {} };
        }
```

**Step 3: Build orderBy clause for sorting**

Add after where clause:

```typescript
        // Build orderBy clause
        const orderBy: any = {};
        
        if (sortBy === 'title' || sortBy === 'createdAt' || sortBy === 'status') {
            orderBy[sortBy] = sortOrder;
        } else if (sortBy === 'bookings') {
            orderBy.bookings = { _count: sortOrder };
        } else if (sortBy === 'organizer') {
            orderBy.organizer = { name: sortOrder };
        } else if (sortBy === 'scheduledDate') {
            // For scheduled date, we'll sort by the first schedule's date
            // This requires a raw query or post-processing
            orderBy.schedules = { _count: sortOrder }; // Fallback
        } else {
            orderBy.createdAt = 'desc'; // default
        }
```

**Step 4: Execute paginated query with filters and sorting**

Replace the existing `findMany` query:

```typescript
        // Get total count for pagination
        const totalCount = await prisma.event.count({ where });
        
        // Get paginated events
        const events = await prisma.event.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            select: {
                id: true,
                slug: true,
                title: true,
                posterImage: true,
                status: true,
                createdAt: true,
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        organizerProfile: {
                            select: {
                                organizationName: true,
                            },
                        },
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                venue: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                schedules: {
                    select: {
                        scheduleDate: true,
                        startTime: true,
                        endTime: true,
                    },
                    orderBy: { scheduleDate: 'asc' },
                    take: 1,
                },
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
        });
        
        // Calculate revenue for each event (aggregated from bookings)
        const eventsWithRevenue = await Promise.all(
            events.map(async (event) => {
                const revenue = await prisma.booking.aggregate({
                    where: {
                        eventId: event.id,
                        status: { in: ['CONFIRMED', 'PAID'] },
                    },
                    _sum: {
                        totalAmount: true,
                        platformRevenue: true,
                    },
                });
                
                return {
                    ...event,
                    revenue: {
                        total: Number(revenue._sum.totalAmount || 0),
                        platform: Number(revenue._sum.platformRevenue || 0),
                    },
                };
            })
        );
```

**Step 5: Calculate stats and return response with pagination metadata**

Replace the return statement:

```typescript
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;
        
        // Calculate stats for all events (not just current page)
        const [
            totalEvents,
            draftCount,
            pendingCount,
            publishedCount,
            cancelledCount,
            completedCount,
        ] = await Promise.all([
            prisma.event.count(),
            prisma.event.count({ where: { status: 'DRAFT' } }),
            prisma.event.count({ where: { status: 'PENDING_REVIEW' } }),
            prisma.event.count({ where: { status: 'PUBLISHED' } }),
            prisma.event.count({ where: { status: 'CANCELLED' } }),
            prisma.event.count({ where: { status: 'COMPLETED' } }),
        ]);
        
        // Calculate total revenue across all events
        const totalRevenue = await prisma.booking.aggregate({
            where: {
                status: { in: ['CONFIRMED', 'PAID'] },
            },
            _sum: {
                totalAmount: true,
                platformRevenue: true,
            },
        });
        
        // Get categories for filter dropdown
        const categories = await prisma.eventCategory.findMany({
            select: {
                id: true,
                name: true,
                _count: { select: { events: true } },
            },
            orderBy: { name: 'asc' },
        });
        
        // Get cities for filter dropdown (distinct from venues)
        const cities = await prisma.venue.findMany({
            distinct: ['city'],
            select: { city: true },
            orderBy: { city: 'asc' },
        });
        
        return successResponse({
            events: eventsWithRevenue,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages,
                hasNext,
                hasPrev,
            },
            stats: {
                total: totalEvents,
                draft: draftCount,
                pending: pendingCount,
                published: publishedCount,
                cancelled: cancelledCount,
                completed: completedCount,
                totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
                platformRevenue: Number(totalRevenue._sum.platformRevenue || 0),
            },
            filterOptions: {
                categories: categories.map(c => ({ id: c.id, name: c.name, count: c._count.events })),
                cities: cities.map(c => c.city),
            },
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        return errorResponse("Failed to fetch events", 500);
    }
}
```

**Step 6: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 7: Commit**

```bash
git add app/api/admin/events/route.ts
git commit -m "feat: add pagination, filters, and sorting to admin events API"
```

---

## Task 2: Update Frontend Interface and State Management

**Files:**
- Modify: `app/admin/events/page.tsx`

**Step 1: Update interfaces to include pagination, stats, and chart data**

Update the interfaces at the top of the file:

```typescript
interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface StatsData {
    total: number;
    draft: number;
    pending: number;
    published: number;
    cancelled: number;
    completed: number;
    totalRevenue: number;
    platformRevenue: number;
}

interface FilterOptions {
    categories: Array<{ id: string; name: string; count: number }>;
    cities: string[];
}

interface EventRevenue {
    total: number;
    platform: number;
}

interface AdminEvent {
    id: string;
    slug: string;
    title: string;
    posterImage: string | null;
    status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
    createdAt: string;
    organizer: EventOrganizer;
    category: EventCategory | null;
    venue: EventVenue | null;
    schedules: EventSchedule[];
    revenue: EventRevenue;
    _count: {
        bookings: number;
    };
}

interface EventsResponse {
    events: AdminEvent[];
    pagination: PaginationMeta;
    stats: StatsData;
    filterOptions: FilterOptions;
}
```

**Step 2: Add new state variables for filters, pagination, and charts**

Update the state declarations:

```typescript
export default function AdminEventsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [stats, setStats] = useState<StatsData>({
        total: 0,
        draft: 0,
        pending: 0,
        published: 0,
        cancelled: 0,
        completed: 0,
        totalRevenue: 0,
        platformRevenue: 0,
    });
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        categories: [],
        cities: [],
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [organizerFilter, setOrganizerFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [scheduledFrom, setScheduledFrom] = useState<string>("");
    const [scheduledTo, setScheduledTo] = useState<string>("");
    const [cityFilter, setCityFilter] = useState<string>("");
    const [hasBookingsFilter, setHasBookingsFilter] = useState<string>("");
    
    // Sort states
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(20);
    
    // Bulk action states
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
    const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
    
    // Analytics state
    const [showAnalytics, setShowAnalytics] = useState(false);
    
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
```

**Step 3: Update fetchEvents to use URL params**

Replace the `fetchEvents` function:

```typescript
    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // Build query params
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('limit', itemsPerPage.toString());
            
            if (statusFilter) params.set('status', statusFilter);
            if (categoryFilter) params.set('category', categoryFilter);
            if (organizerFilter) params.set('organizer', organizerFilter);
            if (search) params.set('search', search);
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);
            if (scheduledFrom) params.set('scheduledFrom', scheduledFrom);
            if (scheduledTo) params.set('scheduledTo', scheduledTo);
            if (cityFilter) params.set('city', cityFilter);
            if (hasBookingsFilter) params.set('hasBookings', hasBookingsFilter);
            if (sortBy) params.set('sortBy', sortBy);
            if (sortOrder) params.set('sortOrder', sortOrder);
            
            const res = await fetch(`/api/admin/events?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/events");
                    return;
                }
                if (res.status === 403) {
                    router.push("/");
                    return;
                }
                setError(data.error?.message || "Failed to load events");
                return;
            }

            if (data.success) {
                setEvents(data.data.events);
                setPagination(data.data.pagination);
                setStats(data.data.stats);
                setFilterOptions(data.data.filterOptions);
            }
        } catch {
            setError("Failed to load events");
        } finally {
            setIsLoading(false);
        }
    }, [router, currentPage, itemsPerPage, statusFilter, categoryFilter, organizerFilter, search, dateFrom, dateTo, scheduledFrom, scheduledTo, cityFilter, hasBookingsFilter, sortBy, sortOrder]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);
```

**Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add app/admin/events/page.tsx
git commit -m "feat: add state management for pagination, filters, and sorting in events page"
```

---

## Task 3: Add Enhanced Filter UI

**Files:**
- Modify: `app/admin/events/page.tsx`

**Step 1: Add filter reset and helper functions**

Add after the `fetchEvents` function:

```typescript
    const resetFilters = () => {
        setStatusFilter("");
        setCategoryFilter("");
        setOrganizerFilter("");
        setSearch("");
        setDateFrom("");
        setDateTo("");
        setScheduledFrom("");
        setScheduledTo("");
        setCityFilter("");
        setHasBookingsFilter("");
        setCurrentPage(1);
    };
    
    const hasActiveFilters = !!(
        statusFilter || 
        categoryFilter || 
        organizerFilter || 
        search || 
        dateFrom || 
        dateTo || 
        scheduledFrom || 
        scheduledTo || 
        cityFilter || 
        hasBookingsFilter
    );
```

**Step 2: Replace existing filter section**

Find the filter section and replace with enhanced version:

```typescript
                <div className="bg-white rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search events, organizers..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING_REVIEW">Pending Review</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                        
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Categories</option>
                            {filterOptions.categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name} ({cat.count})
                                </option>
                            ))}
                        </select>
                        
                        <select
                            value={cityFilter}
                            onChange={(e) => {
                                setCityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Cities</option>
                            {filterOptions.cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        
                        <select
                            value={hasBookingsFilter}
                            onChange={(e) => {
                                setHasBookingsFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Events</option>
                            <option value="yes">Has Bookings</option>
                            <option value="no">No Bookings</option>
                        </select>
                        
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                    
                    {/* Date Range Filters */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Created:</span>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Scheduled:</span>
                            <input
                                type="date"
                                value={scheduledFrom}
                                onChange={(e) => {
                                    setScheduledFrom(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                                type="date"
                                value={scheduledTo}
                                onChange={(e) => {
                                    setScheduledTo(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>
```

**Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add app/admin/events/page.tsx
git commit -m "feat: add enhanced filter UI with 9 filter types for events"
```

---

## Task 4: Add Column Sorting UI

(Continued in next file due to length...)

**Status:** 3/12 tasks documented
**Next:** Continue with remaining tasks (4-12)

---

**Total Estimated Time for Phase 1:** 8-12 hours
**Difficulty:** Medium (can reuse patterns from users page)
