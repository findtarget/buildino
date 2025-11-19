# AGENTS.md - Development History

## Project Overview
**Buildino** is a building management system built with Next.js 15, React 19, and TypeScript. It provides comprehensive tools for managing residential and commercial units, residents, owners, and building finances with full Persian/Farsi language support.

## Technology Stack
- **Framework**: Next.js 15.4.5 (App Router, Turbopack)
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12.23.12
- **Charts**: Chart.js 4.5.0 + React-ChartJS-2 5.3.0
- **Date/Calendar**: date-fns 4.1.0 + date-fns-jalali 4.1.0-0 + react-day-picker 9.9.0
- **UI Components**: Headless UI 2.2.7, Heroicons 2.2.0
- **Utilities**: @floating-ui/react 0.27.15, clsx, tailwind-merge

## Recent Changes

### Commit: Calendar and Units FIX (32b0838) - 2025-08-20

This was the initial project setup commit that established the complete application structure with Persian/Farsi localization and advanced date handling.

#### Core Application Features

**1. Unit Management System**
- Full CRUD operations for building units
- Support for both Residential and Commercial unit types
- Three unit statuses: Owner-Occupied, Tenant-Occupied, Vacant
- Comprehensive unit information tracking:
  - Unit number, floor, area
  - Owner details (name, contact, national ID)
  - Resident details (name, contact, national ID, resident count)
  - Property features (parking spots, storage availability)
  - Financial balance tracking
  - Occupancy dates (ownerSince, residentSince)
- Modal-based forms for adding and editing units
- Confirmation dialogs for deletion operations
- Dynamic loading of modals (SSR disabled for performance)

**2. Dashboard & Analytics**
- Real-time statistics display:
  - Total units count
  - Registered residents count
  - Fund balance (in Toman)
  - Outstanding payments
  - Average payment amounts
- Chart visualizations using Chart.js
- Persian digit conversion for all numeric displays
- Animated card layouts with staggered entrance effects

**3. Authentication & Authorization**
- Login page with form validation
- Auth context for state management
- Role-based access control system (constants/roles.ts)
- Protected routes and conditional rendering

**4. Persian/Jalali Calendar Integration**
- Custom date picker component with Persian calendar support
- Smart positioning using @floating-ui/react:
  - Auto-update on scroll/resize
  - Flip to prevent overflow
  - Shift to stay within viewport boundaries
  - Configurable offset and padding
- Persian digit display in calendar
- date-fns-jalali for accurate date conversion
- Locale support (faIR) for month/day names
- Format and parse utilities for Jalali dates

**5. Theme System**
- Three theme variants: Light, Dark, and Green
- Context-based theme management
- Persistent theme storage in localStorage
- Smooth theme transitions (200ms fade effect)
- CSS variable-based styling for easy customization
- Theme variables:
  - `--bg-color` (background)
  - `--bg-secondary` (secondary background)
  - `--text-color` (primary text)
  - `--text-secondary-color` (secondary text)
  - `--border-color` (borders)
  - `--accent-color` (accent/primary actions)

**6. Responsive Layout & Navigation**
- Mobile-responsive sidebar with hamburger menu
- Custom hooks for responsive behavior:
  - `useIsMobile`: Detects mobile devices
  - `useMediaQuery`: General media query hook
- Header component with user profile and settings
- Settings panel with theme and language options
- Client-side layout wrapper for context providers
- Smooth page transitions using Framer Motion

**7. Internationalization (i18n)**
- Full Persian/Farsi RTL support
- Vazirmatn font family (Regular, Bold, FD-NL variants)
- Persian digit conversion utility (`toPersianDigits`)
- Jalali date formatting and parsing
- RTL-aware components and layouts

#### Component Architecture

**Pages:**
- `/` - Landing page with hero section
- `/login` - Authentication page
- `/dashboard` - Main dashboard with statistics
- `/units` - Unit management interface

**Core Components:**
- `ClientLayoutWrapper.tsx` - Wraps app with context providers
- `Header.tsx` - Top navigation and user menu
- `Sidebar.tsx` - Main navigation sidebar
- `SettingsPanel.tsx` - Theme and app settings
- `DashboardCard.tsx` - Statistic display cards
- `ChartCard.tsx` - Chart visualization wrapper
- `UnitsTable.tsx` - Table view for units with edit/delete actions
- `UnitFormModal.tsx` - Form modal for unit creation/editing
- `ConfirmDeleteModal.tsx` - Confirmation dialog for deletions
- `CustomDatePicker.tsx` - Persian calendar date picker

**UI Components (Reusable):**
- `ui/Button.tsx` - Styled button component
- `ui/Card.tsx` - Card container component
- `ui/Input.tsx` - Form input component

**Contexts:**
- `ThemeContext.tsx` - Theme state management
- `SettingsContext.tsx` - Application settings
- `AuthContext.tsx` - Authentication state

**Hooks:**
- `useAuth.ts` - Authentication operations
- `useIsMobile.ts` - Mobile detection (768px breakpoint)
- `useMediaQuery.ts` - Generic media query hook

**Utilities:**
- `lib/utils.ts` - Helper functions (cn, toPersianDigits, formatJalaliDate, parseJalaliDate)
- `lib/mockData.ts` - Mock data for development
- `lib/auth.ts` - Authentication utilities
- `lib/api.ts` - API client setup

**Types:**
- `types/index.d.ts` - TypeScript definitions for Unit, UnitStatus, UnitType

#### Technical Highlights

**Performance Optimizations:**
- Dynamic imports for modals (SSR disabled)
- Turbopack for faster development builds
- Lazy loading of heavy components
- Efficient re-render prevention with proper state management

**Animation & UX:**
- Framer Motion for smooth page transitions
- Staggered animations for card grids
- Modal enter/exit animations
- Theme transition effects
- Hover and focus states with scale transforms

**Date Handling:**
- Smart calendar positioning with @floating-ui
- Prevents calendar overflow on mobile/small screens
- Auto-flip when space is insufficient
- Maintains viewport boundaries
- Persian number formatting in calendar
- Accurate Jalali-Gregorian conversion

**Code Quality:**
- TypeScript strict mode
- ESLint configuration
- Component-based architecture
- Clear separation of concerns
- Comprehensive type safety
- Persian comments in code (marked with "F:")

#### File Structure
```
buildino/
├── public/
│   ├── fonts/           # Vazirmatn Persian font files
│   └── [assets]         # Images and icons
├── src/
│   ├── app/
│   │   ├── context/     # React contexts
│   │   ├── dashboard/   # Dashboard page
│   │   ├── units/       # Units management page
│   │   ├── login/       # Login page
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Home page
│   ├── components/      # Reusable components
│   │   ├── ui/          # Base UI components
│   │   ├── layout/      # Layout components (placeholders)
│   │   └── buildings/   # Building-specific components (placeholders)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   ├── constants/       # Application constants
│   ├── context/         # Additional contexts
│   ├── types/           # TypeScript type definitions
│   └── styles/          # Global styles
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── next.config.ts       # Next.js config
├── tailwind.config.*    # Tailwind config
└── eslint.config.mjs    # ESLint config
```

#### Known Issues & Future Improvements
- Empty placeholder components in `components/layout/` and `components/buildings/`
- Empty files: `lib/api.ts`, `lib/auth.ts`, `constants/roles.ts`, etc.
- Mock data used instead of real API integration
- No backend/database integration yet
- Auth system not fully implemented

---

## Development Guidelines

### Working with Dates
Always use the Jalali date utilities from `lib/utils.ts`:
```typescript
import { formatJalaliDate, parseJalaliDate, toPersianDigits } from '@/lib/utils';

// Display date
const displayDate = toPersianDigits(formatJalaliDate(new Date()));

// Parse user input
const dateObj = parseJalaliDate('1403/05/28');
```

### Adding New Components
1. Create component in appropriate directory under `src/components/`
2. Use TypeScript for type safety
3. Include Persian comments marked with "F:" for important logic
4. Use CSS variables for theming support
5. Add Framer Motion for animations where appropriate
6. Ensure RTL compatibility

### Theme System
Use CSS variables in components:
```tsx
<div style={{ 
  backgroundColor: 'var(--bg-color)',
  color: 'var(--text-color)' 
}}>
```

### Persian Text & Numbers
Always convert numbers to Persian digits:
```typescript
<span>{toPersianDigits(24)}</span>
```

---

## Next Steps & Recommendations

1. **Complete Empty Components**
   - Implement layout components (Footer, Header, Sidebar in layout/)
   - Build buildings list and unit card components
   - Create reusable UI components (Button, Card, Input)

2. **Backend Integration**
   - Implement API client in `lib/api.ts`
   - Set up authentication in `lib/auth.ts`
   - Replace mock data with real API calls
   - Add data persistence

3. **Role-Based Access Control**
   - Define roles in `constants/roles.ts`
   - Implement permission checking
   - Restrict routes and actions based on roles

4. **Enhanced Features**
   - Add financial management (transactions, reports)
   - Implement notification system
   - Add file upload for documents
   - Create building profile management
   - Add resident communication features

5. **Testing & Quality**
   - Add unit tests for utilities
   - Implement integration tests
   - Add E2E tests for critical flows
   - Improve error handling and validation

6. **Performance**
   - Implement data pagination
   - Add loading states
   - Optimize bundle size
   - Add image optimization

---

*This document is maintained by AI agents and reflects the development history of the Buildino project.*
