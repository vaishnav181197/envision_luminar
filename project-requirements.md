# ELEVATE — Project Requirements

## Overview

A web platform hosting a UI design competition for institute students. Students submit designs with demo links, browse submissions, and vote. Admins manage the competition and view results.

## User Roles

### Student (default)
- View project gallery
- Submit **one** project (title, description, demo URL, optional thumbnail)
- Edit/delete own submission **before deadline**
- Cast **exactly one vote** (can change vote to a different project)
- Cannot access admin dashboard

### Admin
- All student permissions
- View admin leaderboard (sorted by vote count)
- Set/update competition deadline
- Delete any submission
- View all submissions and vote data

## Core Business Rules

### One Vote Per User
- Each authenticated user may have **at most one active vote**
- Database constraint: `UNIQUE(user_id)` on `votes` table
- Changing vote: revoke previous vote, apply new vote atomically
- Self-voting: **allowed** (consumes the user's single vote)

### Time-Bound Competition
- Global `voting_end_time` stored in `settings` table
- **Before deadline:** submissions and voting enabled
- **After deadline:** Submit and Upvote buttons disabled in UI; API rejects writes
- Frontend reads deadline and computes open/closed state

### Project Submission
| Field | Required | Validation |
|-------|----------|------------|
| Title | Yes | 3–100 characters |
| Description | Yes | 10–500 characters |
| Demo URL | Yes | Valid URL (Figma, Vercel, Netlify, etc.) |
| Thumbnail URL | No | Valid image URL if provided |

- One submission per student
- Editable/deletable by owner before deadline

### Voting Flow
1. User clicks Upvote on a project
2. If no existing vote → create vote
3. If vote exists for different project → delete old, create new
4. If vote exists for same project → toggle off (remove vote) OR keep voted (TBD: current design keeps voted state)
5. Vote count updates optimistically in UI, confirmed by API

## Database Schema

### `profiles` (extends Supabase Auth)
```sql
id          UUID PRIMARY KEY (references auth.users)
email       TEXT NOT NULL
role        TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin'))
display_name TEXT
avatar_url  TEXT
created_at  TIMESTAMPTZ DEFAULT now()
```

### `projects`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
student_id    UUID REFERENCES profiles(id) NOT NULL
title         TEXT NOT NULL
description   TEXT NOT NULL
demo_url      TEXT NOT NULL
thumbnail_url TEXT
created_at    TIMESTAMPTZ DEFAULT now()
```

### `votes`
```sql
id         UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id    UUID REFERENCES profiles(id) NOT NULL UNIQUE
project_id UUID REFERENCES projects(id) NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
```

### `settings`
```sql
id              INTEGER PRIMARY KEY DEFAULT 1
voting_end_time TIMESTAMPTZ NOT NULL
```

## API Routes (Phase 2)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/projects` | Public | List all projects with vote counts |
| POST | `/api/projects` | Student | Create submission |
| PUT | `/api/projects/[id]` | Owner | Update submission |
| DELETE | `/api/projects/[id]` | Owner/Admin | Delete submission |
| POST | `/api/votes` | Student | Cast/change vote |
| DELETE | `/api/votes` | Student | Remove vote |
| GET | `/api/admin/leaderboard` | Admin | Sorted project list |
| PUT | `/api/admin/settings` | Admin | Update deadline |

## Security Requirements

- Supabase Row Level Security on all tables
- Students can only modify own projects and own vote
- Admins identified by `role = 'admin'` in profiles
- API routes validate deadline server-side (never trust client)
- Rate limiting on vote endpoint (future)

## Pages (Full Application)

| Route | Access | Status |
|-------|--------|--------|
| `/` | Public | Redirects to design system |
| `/design-system` | Public | ✅ Phase 1 |
| `/gallery` | Public | ✅ Mock data (synced via competition context) |
| `/login` | Public | Phase 2 |
| `/register` | Public | Phase 2 |
| `/submit` | Student | Phase 2 |
| `/admin` | Admin (mock: open to all) | ✅ UI complete (mock workflow) |

## Success Metrics

- Page load < 2s on 3G
- Lighthouse Performance > 90
- One-vote constraint enforced at DB level
- Zero unauthorized data access via RLS

## Phase Roadmap

### Phase 1 ✅ — Foundation
- Next.js + Tailwind + Supabase utilities
- Complete design system
- Mock gallery
- Documentation

### Phase 1.5 ✅ — Admin UI (Mock)
- Admin dashboard at `/admin` with Overview, Submissions, Settings tabs
- Leaderboard table sorted by vote count
- Deadline management with validation
- Delete submission workflow with confirmation
- Cross-page sync via competition context (gallery + header)

### Phase 2 — Backend
- Auth (sign up, login, logout)
- Project CRUD with Supabase
- Voting API with constraints
- Wire admin dashboard to live API
- RLS policies and route guards

### Phase 3 — Polish
- Email notifications (optional)
- Dark mode toggle
