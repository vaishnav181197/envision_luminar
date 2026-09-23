# Envision — Design Language

## Design Philosophy

Envision's visual language is **premium, modern, and creator-focused**. Inspired by design platforms like Dribbble, Linear, and Vercel — with a distinctive purple brand identity refined from `#6a1b9a`.

Core principles:
- **Content-first** — UI designs are the hero; chrome stays minimal
- **Generous whitespace** — Breathing room between elements
- **Subtle depth** — Layered shadows, not heavy borders
- **Purposeful motion** — Micro-interactions on voting, hover, and transitions
- **Accessibility** — WCAG 2.1 AA contrast ratios, focus rings, semantic HTML

## Typography

| Role | Font | Size | Weight | Usage |
|------|------|------|--------|-------|
| Display | Plus Jakarta Sans | 36–48px | 700 | Page heroes |
| Heading | Plus Jakarta Sans | 20–24px | 600–700 | Section titles |
| Subheading | Plus Jakarta Sans | 16–18px | 500–600 | Card titles |
| Body | Plus Jakarta Sans | 14–16px | 400 | Descriptions, forms |
| Small | Plus Jakarta Sans | 12px | 400–500 | Metadata, hints |
| Mono | Geist Mono | 12px | 400 | Code, URLs, tokens |

**Tracking:** `-0.025em` on headings (tight), default on body.

## Color System

### Brand Primary (refined from #6a1b9a)
- `primary-600` (#7c2dd9) — Primary buttons, active states
- `primary-700` (#6b21a8) — Hover on primary
- `primary-50` (#f5f0ff) — Subtle backgrounds, voted state
- `primary-100` (#ede5ff) — Badge backgrounds

### Semantic Colors
| Token | Usage |
|-------|-------|
| `success-*` | Voting open, confirmations |
| `warning-*` | Deadlines, winner badges |
| `error-*` | Validation errors, destructive actions |
| `info-*` | Informational alerts |
| `accent-*` | Creative highlights, tags |

### Surface Hierarchy
| Token | Usage |
|-------|-------|
| `background` | Page background (#faf9fc) |
| `surface` | Cards, inputs, modals |
| `surface-elevated` | Popovers, dropdowns |
| `border` | Default borders (#e8e4ef) |
| `divider` | Section separators |

### Text Hierarchy
| Token | Usage |
|-------|-------|
| `text-primary` | Headings, primary content |
| `text-secondary` | Descriptions, labels |
| `text-muted` | Placeholders, metadata |
| `text-inverse` | Text on dark/colored backgrounds |

### Dark Mode (Future)
All tokens have `.dark` overrides defined in `globals.css`. Not activated in Phase 1.

## Spacing System

Based on Tailwind's 4px grid:

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1.5` | 6px | Tight inline groups |
| `gap-2` | 8px | Button icon gaps |
| `gap-3` | 12px | Form field internal spacing |
| `gap-4` | 16px | Card content padding |
| `gap-5` | 20px | Card padding (md) |
| `gap-6` | 24px | Section spacing |
| `gap-8` | 32px | Major section breaks |

**Page padding:** `px-4 sm:px-6 lg:px-8`
**Max content width:** `max-w-7xl` (1280px)

## Elevation & Shadows

| Level | Token | Usage |
|-------|-------|-------|
| 0 | none | Flat elements, inline content |
| 1 | `shadow-xs` | Cards at rest |
| 2 | `shadow-sm` | Buttons, inputs |
| 3 | `shadow-md` | Elevated cards, dropdowns |
| 4 | `shadow-lg` | Modals, drawers |
| 5 | `shadow-xl` | Dialog overlays |
| Glow | `shadow-glow` | Voted upvote button |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-md` | 6px | Small buttons, tags |
| `rounded-lg` | 8px | Inputs, buttons |
| `rounded-xl` | 12px | Cards, upvote buttons |
| `rounded-2xl` | 16px | Modals, large containers |
| `rounded-full` | 9999px | Avatars, status pills |

## Animation Principles

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| `fade-in` | 200ms | ease-out | Content reveal |
| `slide-up` | 200ms | ease-out | Toasts, drawers |
| `scale-in` | 200ms | spring | Modals, popovers |
| `upvote-pop` | 300ms | ease-out | Vote button feedback |
| `shimmer` | 2s | linear | Skeleton loaders |

**Rules:**
- Never animate layout properties (width, height) — use transform/opacity
- Hover transitions: 200ms
- Respect `prefers-reduced-motion` (future enhancement)

## Component Patterns

### Project Card
- 16:10 aspect ratio thumbnail
- Hover: subtle scale on image (1.03), shadow elevation
- Upvote button positioned top-right of content area
- Winner badge overlay on thumbnail

### Upvote Button
- Vertical layout: chevron icon + count
- **Default:** bordered, neutral
- **Voted:** primary-50 background, primary border, glow shadow
- **Hover:** chevron translates up 2px
- **Active:** scale pop animation

### Buttons
- Primary: `primary-600` background, white text
- Height: 40px (md), 44px (lg)
- Focus: 2px ring with offset

### Admin Dashboard
- **Layout:** Sidebar navigation (Overview, Submissions, Settings) + main content area
- **Stats row:** 4-column grid of `StatCard` components on overview
- **Leaderboard table:** Rank badge (#1 uses `warning` variant with trophy icon), author email on desktop, actions column with demo link + delete
- **Deadline form:** Datetime input with inline validation, success feedback
- **Status banners:** `Alert` variants for active, approaching deadline, and closed states
- **Admin badge:** `Badge variant="primary"` in sidebar and header when on admin routes

## Responsive Strategy

| Breakpoint | Layout |
|------------|--------|
| `< 640px` | Single column, hamburger nav |
| `640–1024px` | 2-column gallery grid |
| `> 1024px` | 3-column gallery, sidebar visible |

Mobile-first utility classes. Gallery grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.

## Accessibility Rules

1. All interactive elements must be keyboard accessible
2. Focus rings on all focusable elements (`ring-focus-ring`)
3. Color contrast minimum 4.5:1 for text
4. Form inputs require associated labels
5. Images require alt text
6. Modals use native `<dialog>` with backdrop
7. Toasts use `aria-live="polite"`
8. Upvote buttons use `aria-pressed` for voted state
9. Tables use semantic `<table>`, `<thead>`, `<tbody>`

## Design Tokens Location

All tokens defined in `src/app/globals.css`:
- CSS custom properties in `:root`
- Tailwind theme mapping in `@theme inline`
- Dark mode overrides in `.dark`
