# ELEVATE — Project Context

## Philosophy

ELEVATE is a **Student UI Design Competition Platform** built for institute students to submit UI designs, browse peer submissions, and cast exactly one vote per competition cycle. The platform prioritizes:

- **Performance first** — Fast page loads, minimal JavaScript, excellent Core Web Vitals
- **Design consistency** — Every UI element follows the living design system
- **Long-term scalability** — Architecture supports thousands of simultaneous voters
- **Zero-cost deployment** — Next.js on Vercel + Supabase free tier

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (PostgreSQL, Auth, RLS) |
| Icons | lucide-react (tree-shaken) |
| Hosting | Vercel Hobby Tier |

## Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── design-system/      # Living style guide dashboard
│   ├── gallery/            # Project gallery (mock data, synced via context)
│   ├── admin/              # Admin dashboard (mock workflow)
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Redirects to /design-system
│   └── globals.css         # Design tokens + Tailwind theme
├── components/
│   ├── ui/                 # Reusable design system components
│   ├── admin/              # Admin-specific dashboard components
│   ├── layout/             # Header, Sidebar, AppProviders
│   └── design-system/      # Style guide showcase sections
├── contexts/
│   └── competition-context.tsx  # Shared mock competition state
├── hooks/
│   └── use-admin-competition.ts # Admin hook (re-exports context)
├── lib/
│   ├── supabase/           # Client, server, middleware utilities
│   ├── constants/          # Mock data, app constants
│   └── utils/              # cn(), helpers
├── types/                  # TypeScript definitions
└── middleware.ts           # Supabase session refresh
```

## Component Architecture

### Rules

1. **All UI must come from `@/components/ui`** — No ad-hoc styled elements in pages
2. **New components must be added to the Design System first** — Demonstrated in `/design-system`
3. **Use Server Components by default** — Add `"use client"` only when interactivity is required
4. **Barrel exports** — Import from `@/components/ui` index, not individual files in pages

### Component Categories

- **Primitives**: Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider
- **Display**: Card, Badge, Tag, Avatar, StatCard, StatusIndicator
- **Feedback**: Alert, Toast, Skeleton, EmptyState
- **Overlay**: Modal, Dialog, Drawer, Popover, Tooltip
- **Navigation**: Tabs, Accordion, Breadcrumbs, Pagination, Sidebar, Header
- **Domain**: ProjectCard, UpvoteButton (voting-specific)
- **Admin**: LeaderboardTable, DeadlineSettingsForm, DeleteProjectDialog, AdminLayout, CompetitionStatusBanner

## Admin Dashboard (Mock Phase)

The admin UI at `/admin` uses mock data via `CompetitionProvider`:

- **Overview** — stats row + top 3 leaderboard preview
- **Submissions** — full leaderboard table with delete actions
- **Settings** — deadline management with validation

State is shared with the gallery and header via `contexts/competition-context.tsx`. When an admin deletes a project or updates the deadline, the gallery and status indicator update immediately.

**Backend handoff:** Replace context internals with Supabase/API calls; component interfaces stay unchanged.

## Supabase Integration Strategy

### Client (`lib/supabase/client.ts`)
Browser-side Supabase client for client components (auth forms, real-time voting).

### Server (`lib/supabase/server.ts`)
Server-side client using Next.js cookies for Server Components and API routes.

### Middleware (`middleware.ts`)
Refreshes auth sessions on every request. Matcher excludes static assets.

### Phase 2 Implementation Plan
1. Run SQL migrations for `profiles`, `projects`, `votes`, `settings` tables
2. Configure Row Level Security policies
3. Implement API routes for voting with one-vote constraint
4. Connect gallery to live Supabase data

## Performance Philosophy

- **Server Components** for static content (gallery grid shell, leaderboard table)
- **Dynamic imports** for heavy client components when needed
- **Image optimization** via `next/image` with AVIF/WebP formats
- **Font optimization** via `next/font` with `display: swap`
- **Package import optimization** for lucide-react in `next.config.ts`
- **Minimal dependencies** — No UI framework libraries (Radix, MUI, etc.)
- **CSS-only animations** where possible
- **Lazy loading** for below-fold gallery images via Next.js Image

## Coding Conventions

### Naming
- Components: PascalCase (`ProjectCard.tsx`)
- Utilities: camelCase (`cn.ts`)
- Types: PascalCase interfaces in `types/`
- CSS variables: kebab-case (`--primary-600`)

### Styling
- Use semantic Tailwind tokens: `text-text-primary`, `bg-surface`, `border-border`
- Never use arbitrary colors: ~~`bg-[#6a1b9a]`~~ → `bg-primary-600`
- Use `cn()` for conditional class merging
- Spacing follows 4px grid (Tailwind default)

### TypeScript
- Strict mode enabled
- Explicit return types on exported functions
- Database types in `types/database.ts` matching Supabase schema

## Development

```bash
npm run dev      # Start on localhost:3010
npm run build    # Production build
npm run lint     # ESLint
npm run format   # Prettier
npm run typecheck # TypeScript check
```

## Current Phase

**Phase 1 (Complete):** Frontend architecture, design system, mock gallery, Supabase utilities setup.

**Phase 1.5 (Complete):** Admin dashboard UI with mock workflow (leaderboard, deadline, delete).

**Phase 2 (Next):** Backend voting logic, auth flows, RLS policies, live data wiring.
