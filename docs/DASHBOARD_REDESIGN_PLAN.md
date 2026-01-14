# BSC Platform - Dashboard Redesign Plan

## Overview

Dokumen ini berisi rencana komprehensif untuk redesign semua dashboard BSC Platform dengan target **Score 5/5** dalam hal:
- Modern & Professional UI/UX
- Mobile-First Responsive Design
- Dark Mode Support
- Consistent Design System

---

## Project Structure

```
BSC Platform Dashboards:
├── Customer Dashboard (/dashboard)     → App-style, Bottom Nav
├── Admin Dashboard (/admin)            → Sidebar, Back-office style
└── Organizer Dashboard (/organizer)    → Sidebar, Business style
```

---

## Design Decisions

### Customer Dashboard
| Aspect | Decision |
|--------|----------|
| Layout | **App-style** (tanpa sidebar, bottom nav + header) |
| Color Theme | Indigo/Purple gradient |
| Target UX | Mobile-first, consumer app feel |

### Admin & Organizer Dashboard
| Aspect | Decision |
|--------|----------|
| Layout | Sidebar-based (collapsible) |
| Color Theme | Dark sidebar, light content |
| Target UX | Desktop-optimized, mobile-friendly |

### Dark Mode
| Aspect | Decision |
|--------|----------|
| Support | All 3 dashboards |
| Persistence | localStorage |
| Default | Follow system preference |
| Toggle Location | Header dropdown (Customer), Sidebar footer (Admin/Organizer) |

---

## Color Palette

### Light Theme
```css
:root {
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  
  /* Text */
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  
  /* Accent (Indigo/Purple) */
  --accent-primary: #6366f1;
  --accent-secondary: #8b5cf6;
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  
  /* Surfaces */
  --surface: #ffffff;
  --surface-hover: #f8fafc;
  --surface-elevated: #ffffff;
  
  /* Borders */
  --border: #e2e8f0;
  --border-light: #f1f5f9;
  
  /* Status Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

### Dark Theme
```css
.dark {
  /* Backgrounds */
  --bg-primary: #0a0a0f;
  --bg-secondary: #111118;
  --bg-tertiary: #18181f;
  
  /* Text */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Accent (Indigo/Purple - Lighter for dark bg) */
  --accent-primary: #818cf8;
  --accent-secondary: #a78bfa;
  --accent-gradient: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  
  /* Surfaces */
  --surface: #16161d;
  --surface-hover: #1e1e28;
  --surface-elevated: #1a1a24;
  
  /* Borders */
  --border: #2d2d3a;
  --border-light: #232330;
  
  /* Shadows (more subtle in dark mode) */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.6);
}
```

---

## Implementation Phases

### FASE 1: Design System & Dark Mode Foundation

#### 1.1 Update `globals.css`
**File:** `app/globals.css`

**Changes:**
- Add comprehensive CSS variables for light/dark themes
- Add dark mode class variants
- Add utility animations
- Add safe area CSS for mobile devices
- Add scrollbar styling

#### 1.2 Create ThemeProvider
**File:** `components/providers/ThemeProvider.tsx`

**Features:**
- React Context for theme state
- Detect system preference on mount
- Persist preference to localStorage
- Provide toggle function
- Apply `.dark` class to `<html>` element

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}
```

#### 1.3 Create useTheme Hook
**File:** `lib/hooks/useTheme.ts`

**Features:**
- Access theme context
- Helper functions
- SSR safe

---

### FASE 2: Customer Dashboard Complete Redesign

#### 2.1 CustomerHeader Component
**File:** `components/customer/CustomerHeader.tsx`

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]  BSC                    [🔍] [🌙] [🔔 badge] [Avatar▼]│
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Sticky header with backdrop blur
- Search button (opens search modal)
- Theme toggle button
- Notification bell with unread badge
- User avatar with dropdown menu
- Responsive (hidden on scroll down, show on scroll up)

#### 2.2 CustomerMobileNav Component (Redesign)
**File:** `components/customer/CustomerMobileNav.tsx`

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│    🏠        🎫        [  ✨  ]        ❤️        👤         │
│   Home     Tiket      Jelajah      Wishlist    Profil       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Floating center button for "Jelajah Event"
- Active state with pill indicator animation
- Glassmorphism background
- Safe area bottom padding
- Hide on scroll down, show on scroll up
- Micro-animations on tap

#### 2.3 Customer Layout Update
**File:** `app/dashboard/layout.tsx`

**Changes:**
- Remove CustomerSidebar usage
- Add CustomerHeader
- Adjust padding for header + bottom nav
- Add ThemeProvider wrapper

**New Structure:**
```tsx
<ThemeProvider>
  <div className="min-h-screen bg-bg-primary">
    <CustomerHeader user={user} />
    <main className="pt-16 pb-20 lg:pb-6">
      {children}
    </main>
    <CustomerMobileNav />
  </div>
</ThemeProvider>
```

#### 2.4 Dashboard Page Redesign
**File:** `app/dashboard/page.tsx`

**Improvements:**
- Hero greeting section with gradient text
- Stats cards with glassmorphism effect
- Mini sparkline charts in cards
- Activity chart section
- Upcoming events horizontal scroll
- Recommendations grid
- Dark mode support
- Skeleton loading states

#### 2.5 My Bookings Page Redesign
**File:** `app/my-bookings/page.tsx`

**Improvements:**
- Tab navigation (All, Confirmed, Pending, Cancelled)
- Card-based booking list
- Status badges with icons
- Quick actions (View Ticket, Download, Cancel)
- Empty state illustration
- Search & filter
- Pagination
- Dark mode support

#### 2.6 Wishlist Page Redesign
**File:** `app/wishlist/page.tsx`

**Improvements:**
- Grid layout (2 columns mobile, 3 desktop)
- Event cards with hover effects
- Quick remove button
- Price badge overlay
- Empty state with CTA
- Dark mode support

#### 2.7 Following Page Redesign
**File:** `app/following/page.tsx`

**Improvements:**
- Organizer cards with avatar
- Verified badge
- Notification toggle
- Unfollow action
- Events count
- Dark mode support

#### 2.8 Notifications Page Redesign
**File:** `app/notifications/page.tsx`

**Improvements:**
- Grouped by date (Today, Yesterday, Earlier)
- Icon based on notification type
- Mark as read on click
- Mark all as read button
- Delete action
- Empty state
- Dark mode support

#### 2.9 Profile Page Redesign
**File:** `app/profile/page.tsx`

**Improvements:**
- Profile header with large avatar
- Tab sections (Info, Address, Settings)
- Avatar upload with preview
- Form validation
- Dark mode support

---

### FASE 3: Admin Dashboard Enhancement

#### 3.1 Mobile Drawer Menu
**File:** `components/admin/AdminSidebar.tsx`

**Changes:**
- Add hamburger menu button for mobile
- Slide-in drawer overlay
- Close on outside click
- Close on navigation

#### 3.2 Dark Mode Support
**Files:** All admin components

**Changes:**
- Update color classes to use CSS variables
- Add dark mode variants
- Theme toggle in sidebar footer

#### 3.3 Enhanced Dashboard
**File:** `app/admin/page.tsx`

**Improvements:**
- More detailed stats cards
- Revenue chart
- User growth chart
- Recent activity timeline
- Quick action cards

#### 3.4 Mobile Optimized Tables
**Files:** All admin table pages

**Changes:**
- Horizontal scroll on mobile
- Card view option for mobile
- Responsive column hiding
- Touch-friendly actions

---

### FASE 4: Organizer Dashboard Enhancement

#### 4.1 Mobile Drawer Menu
**File:** `components/organizer/OrganizerSidebar.tsx`

**Changes:**
- Similar to admin mobile menu
- Organization branding in header

#### 4.2 Dark Mode Support
**Files:** All organizer components

**Changes:**
- Update color classes
- Theme toggle in sidebar

#### 4.3 Enhanced Dashboard
**File:** `app/organizer/page.tsx`

**Improvements:**
- Sales overview chart
- Ticket sales breakdown
- Upcoming events countdown
- Quick stats cards
- Recent bookings list

#### 4.4 Mobile Optimizations
**Files:** All organizer pages

**Changes:**
- Responsive event cards
- Touch-friendly forms
- Mobile-optimized analytics

---

### FASE 5: Testing & Polish

#### 5.1 Mobile Device Testing
- Test on various screen sizes
- Test touch interactions
- Test scroll behavior
- Test safe area handling

#### 5.2 Dark Mode Testing
- Test all pages in dark mode
- Check contrast ratios
- Verify transitions
- Test persistence

#### 5.3 Performance Optimization
- Lazy load images
- Code splitting
- Optimize animations
- Reduce bundle size

---

## File Changes Summary

### New Files
```
components/
├── providers/
│   └── ThemeProvider.tsx          # Theme context provider
├── customer/
│   └── CustomerHeader.tsx         # New header component
└── ui/
    └── ThemeToggle.tsx            # Theme toggle button

lib/
└── hooks/
    └── useTheme.ts                # Theme hook
```

### Modified Files
```
app/
├── globals.css                    # Add CSS variables, dark mode
├── layout.tsx                     # Add ThemeProvider
├── dashboard/
│   ├── layout.tsx                 # Remove sidebar, add header
│   └── page.tsx                   # Redesign
├── my-bookings/
│   └── page.tsx                   # Redesign
├── wishlist/
│   └── page.tsx                   # Redesign
├── following/
│   └── page.tsx                   # Redesign
├── notifications/
│   └── page.tsx                   # Redesign
├── profile/
│   └── page.tsx                   # Redesign
├── admin/
│   ├── layout.tsx                 # Add theme support
│   └── page.tsx                   # Enhance
└── organizer/
    ├── layout.tsx                 # Add theme support
    └── page.tsx                   # Enhance

components/
├── customer/
│   ├── CustomerSidebar.tsx        # DELETE or keep for reference
│   ├── CustomerMobileNav.tsx      # Redesign
│   └── index.ts                   # Update exports
├── admin/
│   ├── AdminSidebar.tsx           # Add mobile menu
│   └── AdminLayoutWrapper.tsx     # Add theme support
└── organizer/
    └── OrganizerSidebar.tsx       # Add mobile menu
```

---

## Estimated Timeline

| Phase | Description | Duration |
|-------|-------------|----------|
| 1 | Design System & Dark Mode | 30 min |
| 2 | Customer Dashboard (9 components) | 2-3 hours |
| 3 | Admin Enhancement (4 tasks) | 1 hour |
| 4 | Organizer Enhancement (4 tasks) | 1 hour |
| 5 | Testing & Polish | 30 min |
| **Total** | | **5-6 hours** |

---

## Success Criteria

### Score 5/5 Checklist

- [ ] **Modern Design**: Glassmorphism, gradients, micro-animations
- [ ] **Mobile Friendly**: Touch-optimized, responsive, bottom nav
- [ ] **Dark Mode**: Full support with smooth transitions
- [ ] **Performance**: Fast loading, skeleton states, lazy loading
- [ ] **Consistency**: Same design language across all dashboards
- [ ] **Accessibility**: Proper contrast, focus states, semantic HTML
- [ ] **Professional**: Clean, polished, enterprise-ready look

---

## Notes

### Customer vs Admin/Organizer Design Philosophy

**Customer Dashboard:**
- App-like experience (think Tokopedia, Gojek)
- Bottom navigation for easy thumb reach
- Focus on content consumption
- Minimal cognitive load
- Fun, engaging micro-interactions

**Admin/Organizer Dashboard:**
- Desktop-first but mobile-usable
- Sidebar for complex navigation
- Focus on data management
- Information density
- Professional, efficient interactions

### Dark Mode Considerations

1. **Contrast**: Ensure WCAG AA compliance (4.5:1 for text)
2. **Elevation**: Use subtle shadows/borders in dark mode
3. **Images**: Consider image brightness adjustment
4. **Charts**: Update chart colors for dark backgrounds
5. **Status Colors**: Adjust for visibility on dark backgrounds

---

## Appendix

### Reference Design Inspirations

**Customer Dashboard:**
- Tokopedia (app-style, bottom nav)
- Eventbrite (event cards, clean layout)
- Grab (modern gradient, friendly feel)

**Admin Dashboard:**
- Vercel Dashboard (dark, minimal, efficient)
- Linear (clean, keyboard-first)
- Stripe (data-rich, professional)

**Organizer Dashboard:**
- Shopify (business tools, clear hierarchy)
- Notion (flexible, powerful)
- Figma (collaboration-focused)

---

*Document Version: 1.0*
*Created: January 2025*
*Author: Sisyphus AI Assistant*
