# Admin Dashboard UI Audit Report

## 1. Overview
The Admin Dashboard is located at `/admin` and provides a comprehensive view for platform administrators (Gelaran Management) to manage users, events, bookings, finances, categories, venues, and settings. 
The dashboard utilizes a custom design system based on Tailwind UI and CSS variables (e.g., `var(--surface)`, `var(--text-primary)`, `var(--accent-primary)`).

## 2. Common Components & Layout
- **LayoutWrapper:** Includes sidebar and header for navigation.
- **AdminHeader:** Displays title and subtitle.
- **Styling:** Hardcoded to CSS variables (e.g., `border-[var(--border)]`, `bg-[var(--surface)]`).

## 3. Main Dashboard (`/admin`)
**Strengths:**
- Good use of summary cards with icons and distinct colors (`bg-blue-500/10` for background, `text-blue-500` for icons).
- Quick links grid for easy navigation.
- Critical alerts at the top (e.g., pending payouts alert).
- Includes revenue breakdown and commission overview widgets.
- Clean "Recent Bookings" list using standard list UI.

**Areas for Improvement / Issues:**
- Some inline styles mixed with Tailwind (e.g., `style={{ background: 'var(--bg-secondary)' }}`).
- The `statusColors` mapping in recent bookings only covers `PAID` and `CONFIRMED`. It might break or show no styling for other statuses if there are any.
- The `recentBookings.map` logic has a small bug: It checks `recentBookings.length === 0` inside the map condition? Wait, no, it uses a ternary operator correctly.

## 4. Sub-pages Analysis

### General Observation Across Sub-pages
The most significant UI/UX issue identified is the **complete inconsistency in styling methodology** between the main dashboard (`/admin`), the `AdminSidebar`/`AdminHeader` components, and the sub-pages (`/admin/events`, `/admin/users`, `/admin/bookings`, `/admin/finance`, `/admin/settings`).

- The **Main Dashboard, Sidebar, and Header** are built with a dynamic theming system using CSS variables (e.g., `bg-[var(--surface)]`, `text-[var(--text-primary)]`, `border-[var(--border)]`). This robustly supports Dark Mode and theme switching.
- **Sub-pages** heavily rely on hardcoded Tailwind utility classes (e.g., `bg-white`, `text-gray-900`, `border-gray-200`, `hover:bg-gray-50`). This makes them completely unresponsive to the theme switcher and visually breaks the seamless experience when navigating from the main dashboard.

### 4.1. Events Page (`/admin/events`)
- **Features**: Event moderation, filtering, sort, search, bulk actions, CSV export.
- **Issues**:
  - Hardcoded background colors (`bg-white` for cards, `bg-gray-50` for table headers).
  - `STATUS_COLORS` mapping uses hardcoded Tailwind classes (`bg-gray-100 text-gray-700`, `bg-yellow-100 text-yellow-700`). In dark mode, these colors will lack contrast or appear glaring.
  - Table hover states are hardcoded (`hover:bg-gray-50`), which will clash with `var(--surface-hover)` in dark mode.

### 4.2. Users Page (`/admin/users`)
- **Features**: User management, filtering, search, bulk actions, CSV export, Analytics charts.
- **Issues**:
  - Similar to Events, relies entirely on hardcoded classes like `bg-white` and `border-gray-200`.
  - `ROLE_COLORS` uses hardcoded classes (`bg-purple-100 text-purple-700`).
  - The Analytics charts component uses `recharts` but passes hardcoded colors or tailwind hex codes for tooltips and grids instead of utilizing CSS variables for dynamic theming.

### 4.3. Bookings Page (`/admin/bookings`)
- **Features**: Full booking list, filtering, key stats cards.
- **Issues**:
  - Table grid, headers, and rows use hardcoded light-theme styles.
  - `STATUS_COLORS` object contains 7 status variations mapped to hardcoded colors.
  - Stats cards define static background utility classes (`bg-blue-500/10`) which are generally fine as accents, but standard text and borders should use CSS variables.

### 4.4. Finance Page (`/admin/finance`)
- **Features**: Financial overview, monthly stats charting, payouts, top events.
- **Issues**:
  - Uses gradient backgrounds (`bg-gradient-to-br from-blue-500 to-blue-600`), which limits theming flexibility and might clash with the sophisticated visual identity.
  - Hardcoded Tailwind classes for generic tables and structural elements.

### 4.5. Settings Page (`/admin/settings`)
- **Features**: Configuration for platform info, fees, payments, notifications.
- **Issues**:
  - Navigation sidebar within Settings uses `bg-white`, `hover:bg-gray-50`, `text-gray-900`.
  - Form inputs within the Settings page use hardcoded border styling (`border-gray-300`, `focus:border-indigo-500`, `bg-white`) rather than global custom form components or CSS variables, resulting in dark mode being utterly broken for inputs.

## 5. UI Components Analysis

### 5.1 AdminSidebar
- **Strengths**: Uses CSS variables beautifully (`bg-[var(--surface)]`, `text-[var(--text-secondary)]`). Implements a clean collapse logic.
- **Issues**: Standard and functions flawlessly.

### 5.2 AdminHeader
- **Strengths**: Contains a functioning Theme Toggle (Sun/Moon icon). Profile dropdown is well implemented.
- **Issues**: Theme toggle functionality only affects components utilizing CSS variables, meaning toggling it while on sub-pages yields a jarring and partial UI change.

### 5.3 AdminDashboardCharts
- **Features**: AreaChart, BarChart, PieChart.
- **Issues**: The component utilizes custom `var(--surface)` for its container, but passes hardcoded hex colors to the charts (`color="#6366f1"`). It would be better to fetch CSS variables for chart stroke/fill colors so they adapt subtly, though keeping accent colors static is acceptable.

## 6. Recommendations & Action Plan

1. **Global CSS Variable Refactor (High Priority)**:
   - Identify all standard hardcoded structural classes in sub-pages (`bg-white`, `border-gray-200`, `text-gray-900`, `text-gray-500`, `bg-gray-50`).
   - Replace them with their corresponding CSS variables (`bg-[var(--surface)]`, `border-[var(--border)]`, `text-[var(--text-primary)]`, `text-[var(--text-muted)]`, `bg-[var(--surface-active)]`).
2. **Standardize Status Badges and Role Pills**:
   - Extract `STATUS_COLORS` and `ROLE_COLORS` from individual pages into a shared utility or component.
   - Adjust their underlying colors to use semantic or generic CSS variables, or use opacity-adjusted generic colors so they work well in both Light and Dark modes.
3. **Form Elements Standardization**:
   - Ensure all `input`, `select`, and `button` elements in `/admin/settings` (and potential modals elsewhere) use generic theming classes to avoid blinding white inputs in dark mode.
4. **Code Consistency**:
   - Convert mixed inline styles like `style={{ background: 'var(--bg-secondary)' }}` in layouts to standard Tailwind class usage (`bg-[var(--bg-secondary)]`).
