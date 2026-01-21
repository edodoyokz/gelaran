# Admin Users Page Enhancement Plan

**Created**: 2026-01-22
**Status**: Draft
**Priority**: Medium-High

## Executive Summary

The admin users page currently provides basic user management functionality but lacks advanced features needed for efficient admin operations at scale. This plan outlines enhancements to improve usability, performance, and insights.

---

## Current Issues

### List Page Issues
1. ❌ No pagination - performance issues with many users
2. ❌ No export functionality
3. ❌ No bulk actions
4. ❌ Limited filters (only role-based)
5. ❌ No column sorting
6. ❌ No data visualizations

### Detail Page Issues
1. ❌ No activity timeline
2. ❌ No financial/performance charts
3. ❌ Missing analytics for customers & organizers
4. ❌ No admin notes feature
5. ❌ No comprehensive stats overview

---

## Enhancement Plan

### Phase 1: List Page Improvements (High Priority)

#### Task 1.1: Add Pagination & Performance
**Files**: `app/admin/users/page.tsx`, `app/api/admin/users/route.ts`

**Backend Changes:**
- Add query params: `page`, `limit`, `sortBy`, `sortOrder`
- Return pagination metadata: `total`, `page`, `totalPages`, `hasNext`, `hasPrev`
- Default: 20 users per page

**Frontend Changes:**
- Add pagination controls (prev, next, page numbers)
- Add "items per page" selector (10, 20, 50, 100)
- Display "Showing X-Y of Z users"

**Acceptance Criteria:**
- ✅ Can navigate between pages
- ✅ URL updates with page param
- ✅ Performance improved for large datasets

---

#### Task 1.2: Enhanced Filters
**Files**: `app/admin/users/page.tsx`

**New Filters:**
1. **Verification Status**: All / Verified / Unverified
2. **Account Status**: All / Active / Suspended
3. **Date Range**: Joined from/to dates
4. **Activity**: Has Bookings / Has Events / No Activity

**UI Design:**
- Expandable filter panel (collapsible)
- "Clear All Filters" button
- Active filter chips with X to remove

**Acceptance Criteria:**
- ✅ Multiple filters can be combined
- ✅ Filter state persists in URL
- ✅ Clear indicators for active filters

---

#### Task 1.3: Column Sorting
**Files**: `app/admin/users/page.tsx`, `app/api/admin/users/route.ts`

**Sortable Columns:**
- Name (A-Z, Z-A)
- Email (A-Z, Z-A)
- Joined Date (Newest, Oldest)
- Bookings Count (High-Low, Low-High)
- Events Count (High-Low, Low-High) - for organizers

**UI:**
- Clickable column headers
- Arrow icons for sort direction
- Visual indicator for active sort

**Acceptance Criteria:**
- ✅ Click header to toggle sort
- ✅ URL updates with sort params
- ✅ Default: Sort by joined date (newest)

---

#### Task 1.4: Export to CSV/Excel
**Files**: `app/admin/users/page.tsx`, `app/api/admin/users/export/route.ts`

**Functionality:**
- Export button in header
- Export current filtered/sorted results
- Include all user fields + stats
- Format: CSV or Excel (XLSX)

**CSV Columns:**
- ID, Name, Email, Phone, Role, Status, Verified
- Bookings Count, Events Count, Joined Date, Last Login

**Acceptance Criteria:**
- ✅ Export respects current filters
- ✅ Proper filename with timestamp
- ✅ All data properly formatted

---

#### Task 1.5: Bulk Actions
**Files**: `app/admin/users/page.tsx`, `app/api/admin/users/bulk/route.ts`

**Actions:**
1. Verify multiple users
2. Suspend multiple users
3. Change role for multiple users
4. Delete multiple users (soft delete)

**UI:**
- Checkbox column in table
- "Select All" checkbox in header
- Bulk action dropdown when items selected
- Confirmation dialog for destructive actions

**Acceptance Criteria:**
- ✅ Can select/deselect users
- ✅ Bulk operations complete successfully
- ✅ Error handling for partial failures

---

#### Task 1.6: Data Visualization
**Files**: `app/admin/users/page.tsx`

**New Charts:**
1. **User Growth Chart** - Line chart showing user registrations over time
2. **Role Distribution** - Pie chart showing customer/organizer/admin split
3. **Verification Status** - Doughnut chart verified vs unverified
4. **Activity Heatmap** - Calendar heatmap of registrations (last 90 days)

**Placement:**
- Collapsible "Analytics" section above filters
- Charts update based on filter selection

**Acceptance Criteria:**
- ✅ Charts load with data
- ✅ Charts update when filters change
- ✅ Responsive on mobile

---

### Phase 2: Detail Page Improvements (Medium Priority)

#### Task 2.1: Activity Timeline
**Files**: `app/admin/users/[id]/page.tsx`, `app/api/admin/users/[id]/timeline/route.ts`

**Timeline Events:**
- Account created
- Email verified
- Profile updated
- Booking created/cancelled
- Event created/published (organizers)
- Payout requested/completed (organizers)
- Role changed by admin
- Account suspended/reactivated

**UI:**
- Vertical timeline with icons
- Grouped by date
- Infinite scroll or pagination
- Filter by event type

**Acceptance Criteria:**
- ✅ Shows chronological events
- ✅ Each event has timestamp & details
- ✅ Can filter event types

---

#### Task 2.2: Customer Analytics Dashboard
**Files**: `app/admin/users/[id]/page.tsx`

**For CUSTOMER role, add tab "Analytics" showing:**

1. **Spending Summary**
   - Total spent (all time)
   - Average booking value
   - Last purchase date
   - Purchase frequency

2. **Charts**
   - Spending trend (last 12 months)
   - Favorite event categories (bar chart)
   - Booking status distribution (pie chart)

3. **Insights**
   - Most attended event type
   - Preferred booking time (weekday/weekend)
   - Average days before event for booking

**Acceptance Criteria:**
- ✅ All stats calculated correctly
- ✅ Charts display properly
- ✅ Empty state when no data

---

#### Task 2.3: Organizer Performance Dashboard
**Files**: `app/admin/users/[id]/page.tsx`

**For ORGANIZER role, enhance "Organizer" tab with:**

1. **Performance Metrics**
   - Total revenue generated
   - Average event capacity utilization
   - Average ticket price
   - Refund rate

2. **Charts**
   - Revenue trend (last 12 months)
   - Event category distribution
   - Booking sources (web, mobile, POS)
   - Top performing events (bar chart)

3. **Health Indicators**
   - Verification status progress
   - Outstanding payouts
   - Compliance issues (if any)
   - Response time (avg time to respond to customer)

**Acceptance Criteria:**
- ✅ Metrics accurate
- ✅ Charts interactive
- ✅ Health indicators color-coded

---

#### Task 2.4: Admin Notes & Tags
**Files**: `app/admin/users/[id]/page.tsx`, `app/api/admin/users/[id]/notes/route.ts`

**Features:**
1. **Internal Notes**
   - Add note with timestamp
   - Edit/delete own notes
   - Notes visible to all admins
   - Auto-save as typing (debounced)

2. **User Tags**
   - VIP, Problematic, High-Value, etc.
   - Color-coded tags
   - Filter users by tags in list page
   - Custom tags creation

**UI:**
- Notes section in overview tab
- Tags displayed near user avatar
- Rich text editor for notes (basic formatting)

**Acceptance Criteria:**
- ✅ Notes persist correctly
- ✅ Tags filterable from list
- ✅ Proper permission handling

---

#### Task 2.5: Quick Stats Overview Cards
**Files**: `app/admin/users/[id]/page.tsx`

**Add to Overview Tab (top section):**

**For All Users:**
- Account Age (days since registration)
- Login Frequency (logins per month)
- Last Active (relative time)
- Account Health Score (0-100)

**For Customers:**
- Lifetime Value (total spent)
- Bookings This Month/Year
- Average Order Value
- Customer Segment (New/Regular/VIP)

**For Organizers:**
- Active Events Count
- Pending Payouts Amount
- Total Tickets Sold
- Organization Health Score

**UI Design:**
- 4-6 small stat cards with icons
- Color-coded by metric type
- Tooltips for explanations
- Trend indicators (up/down arrows)

**Acceptance Criteria:**
- ✅ All calculations correct
- ✅ Responsive grid layout
- ✅ Tooltips informative

---

### Phase 3: Advanced Features (Low Priority)

#### Task 3.1: Email Communication History
- Show all system emails sent to user
- Resend verification email
- Send custom message to user

#### Task 3.2: Security & Login History
- Login history with IP, device, location
- Failed login attempts
- Active sessions management
- 2FA status

#### Task 3.3: Impersonate User (Admin Tool)
- "Login as user" for support
- Audit trail of impersonation
- Limited permissions during impersonation

#### Task 3.4: Advanced Reporting
- Generate custom user reports
- Schedule automated reports
- Export to PDF with charts

---

## Implementation Priority

### Immediate (Week 1-2):
1. Task 1.1: Pagination ⭐⭐⭐⭐⭐
2. Task 1.2: Enhanced Filters ⭐⭐⭐⭐
3. Task 1.3: Column Sorting ⭐⭐⭐⭐

### Short-term (Week 3-4):
4. Task 1.4: Export CSV ⭐⭐⭐⭐
5. Task 2.5: Quick Stats Cards ⭐⭐⭐
6. Task 1.6: Data Visualization ⭐⭐⭐

### Medium-term (Month 2):
7. Task 2.1: Activity Timeline ⭐⭐⭐
8. Task 2.2: Customer Analytics ⭐⭐⭐
9. Task 2.3: Organizer Performance ⭐⭐⭐
10. Task 1.5: Bulk Actions ⭐⭐

### Long-term (Month 3+):
11. Task 2.4: Admin Notes ⭐⭐
12. Task 3.1-3.4: Advanced Features ⭐

---

## Technical Considerations

### Database Impact:
- New table: `admin_notes` (userId, adminId, content, createdAt, updatedAt)
- New table: `user_tags` (userId, tag, createdAt)
- New table: `user_activity_log` (userId, eventType, metadata, createdAt)
- Index: `users.createdAt`, `users.lastLoginAt` for sorting

### Performance:
- Implement Redis caching for stats calculations
- Use database views for complex aggregations
- Background jobs for export generation
- Query optimization for large datasets

### Dependencies:
- `xlsx` for Excel export
- `recharts` for additional chart types
- `react-calendar-heatmap` for activity heatmap
- `react-select` for enhanced tag selection

---

## Success Metrics

**After Implementation:**
- Admin task completion time reduced by 50%
- User management operations 3x faster
- Improved insights into user behavior
- Reduced support time per user

---

## Next Steps

1. **Get approval** for plan & prioritization
2. **Allocate resources** - estimate 3-4 weeks dev time for Phase 1
3. **Design mockups** for new UI components
4. **Implement Phase 1** tasks in order
5. **User testing** with admin team
6. **Iterate** based on feedback

---

**Created by**: Sisyphus (AI Agent)  
**Review by**: [To be assigned]
