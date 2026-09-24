# Envision — Project Context

## Philosophy

Envision is a **Student UI Design Competition Platform**. Administrators publish the competing UIs and run the contest. Students enter with a pre-registered admission email, browse the gallery, and cast exactly one changeable vote. The platform prioritizes:

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
| Database | Supabase PostgreSQL + RLS |
| Admin auth | Supabase Auth (email/password) |
| Student auth | Allowlist + signed cookie |
| Icons | lucide-react (tree-shaken) |
| Hosting | Vercel Hobby Tier |

## Folder Structure

```
src/
├── app/
│   ├── (marketing)/        # Landing, /vote, /login, /register→vote
│   ├── (platform)/         # /gallery, /admin, /design-system
│   ├── api/                # Admin + student + competition APIs
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                 # Design system
│   ├── admin/              # Dashboard components
│   ├── landing/            # Marketing landing sections
│   ├── layout/             # Header, PlatformShell, providers
│   └── design-system/
├── contexts/
│   └── competition-context.tsx
├── hooks/
├── lib/
│   ├── supabase/
│   ├── auth/               # Admin + student cookie helpers
│   ├── competition/
│   ├── voters/
│   ├── storage/
│   └── utils/
├── types/
└── middleware.ts           # Admin Auth refresh + /admin gate + voter cookie redirects
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
- **Admin**: LeaderboardTable, DeadlineSettingsForm, VotingControlsForm, DeleteProjectDialog, AdminLayout, CompetitionStatusBanner, project form, voter list

## Roles and sessions

- **Admin** signs in at `/login` with email/password. Middleware and `GET /api/admin/session` guard `/admin`.
- **Student** is not a Supabase Auth user. They submit a listed email at `/vote`. The server sets a signed httpOnly voting cookie.
- `/admin/login` redirects to `/login`.
- `/register` is not part of the product.

## Admin Dashboard

The admin UI at `/admin` loads live data from admin APIs:

- **Overview** — stats row + top leaderboard preview, winner callout after the deadline
- **Projects** — create, edit, and delete competing UIs (`POST/PUT/DELETE /api/projects`)
- **Voters** — add one email, import Excel/CSV, list, and remove (`/api/admin/voters`)
- **Settings** — deadline plus pause/stop/resume (`GET/PUT /api/admin/settings`, `voting_status`)
- Winner callouts appear after stop or when the deadline passes (not while paused)

After a project, voter, or deadline change, the dashboard refreshes the admin leaderboard and the shared `CompetitionProvider`.

## Student voting

1. `POST /api/auth/student/enter` — allowlist check, set voting cookie
2. Student-only `/gallery` + `POST /api/votes` — one vote per `eligible_student_id`, change is atomic

Unlisted emails are rejected and do not receive a cookie. Cookie signing uses `STUDENT_SESSION_SECRET` (required in production; no public-key fallback). `/gallery` requires a valid voting cookie and rejects admin Auth sessions (admins use `/admin`).

## Supabase Integration Strategy

### Client (`lib/supabase/client.ts`)
Browser-side Supabase client for admin auth forms.

### Server (`lib/supabase/server.ts`)
Server-side client using Next.js cookies for admin sessions and API routes.

### Middleware (`middleware.ts`)
Refreshes admin Auth sessions. Treats `/admin` as admin-only. Student gallery/vote APIs read the voting cookie, not `auth.users`.

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

**Phase 1.5 (Complete):** Admin dashboard UI (overview, delete, deadline).

**Phase 2 (Implemented):** Admin-owned projects, eligible voter list, student email entry (allowlist → signed cookie), vote-by-cookie, pause/stop. Live schema includes `003` (voters/votes), `004` (thumbnail bucket), `005` (author/batch), `006` (voting_status), `007` (drop unused OTP challenges), and `008` (cast_vote + profile role hardening).

Required env: `STUDENT_SESSION_SECRET` (required in production), `SUPABASE_SERVICE_ROLE_KEY`, and Supabase public URL/anon key.
