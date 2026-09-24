# Envision — Project Requirements

## Overview

A web platform hosting a UI design competition for institute students. **Admins publish every competing UI** and manage the voter list and deadline. **Students only vote** after entering a pre-registered admission email.

## User Roles

### Student (voter only)

- Enter voting with a listed admission email (not a password account)
- View project gallery after a valid voting cookie
- Cast **exactly one vote** (can change to a different project)
- Cannot submit projects or access `/admin`

### Admin

- Password sign-in at `/login`
- Create, edit, and delete competing projects
- Add voter emails one-by-one or import Excel/CSV (emails only, unique)
- Remove eligible emails
- Set/update competition deadline
- Pause, resume, or stop voting from Settings
- View leaderboard and vote totals

## Core Business Rules

### One Vote Per Eligible Student

- At most one active vote per `eligible_student_id`
- Database constraint: `UNIQUE(eligible_student_id)` on `votes`
- Changing vote: revoke previous vote, apply new vote atomically
- Self-voting does not apply (students are not authors)

### Student entry

1. Student submits email
2. If not on `eligible_students` → error, no cookie
3. If listed → signed httpOnly voting cookie
4. That email can hold one active vote (`UNIQUE(eligible_student_id)`)

### Time-Bound Competition

- Global `voting_end_time` + `voting_status` (`open` | `paused` | `stopped`) in `settings`
- **Before deadline (open):** admin manages projects/voters; students may enter and vote
- **Paused:** entry/votes blocked; winners not shown; resume restores voting if deadline is still future
- **Stopped or after deadline:** upvote disabled; student enter and vote APIs reject writes; winners shown
- Reopen after stop requires a future deadline
- Admin may still review results and manage the voter list

### Project Submission (admin)

| Field | Required | Validation |
|-------|----------|------------|
| Title | Yes | 3–100 characters |
| Description | Yes | 10–500 characters |
| Demo URL | Yes | Valid URL |
| Thumbnail URL | No | Valid image URL if provided |

- Cards show title, author, batch, description, demo, votes
- Many projects per admin (no unique owner limit)

### Voting Flow

1. Student with a valid cookie clicks Upvote
2. If no existing vote → create vote
3. If vote exists for a different project → transfer atomically
4. Vote count updates in UI after API confirmation

## Database Schema

### `profiles` (admin Auth users)

```sql
id           UUID PRIMARY KEY (references auth.users)
email        TEXT NOT NULL
role         TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin'))
display_name TEXT
batch        TEXT
avatar_url   TEXT
created_at   TIMESTAMPTZ DEFAULT now()
```

### `eligible_students`

```sql
id         UUID PRIMARY KEY DEFAULT gen_random_uuid()
email      TEXT NOT NULL UNIQUE
created_by UUID REFERENCES profiles(id) NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
```

### `projects`

```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_by    UUID REFERENCES profiles(id) NOT NULL
title         TEXT NOT NULL
description   TEXT NOT NULL
demo_url      TEXT NOT NULL
thumbnail_url TEXT  -- public URL from an uploaded image file
author_name  TEXT NOT NULL
batch        TEXT NOT NULL
created_at    TIMESTAMPTZ DEFAULT now()
```

### `votes`

```sql
id                   UUID PRIMARY KEY DEFAULT gen_random_uuid()
eligible_student_id  UUID REFERENCES eligible_students(id) NOT NULL UNIQUE
project_id           UUID REFERENCES projects(id) NOT NULL
created_at           TIMESTAMPTZ DEFAULT now()
```

### `settings`

```sql
id              INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1)
voting_end_time TIMESTAMPTZ NOT NULL
voting_status   TEXT NOT NULL DEFAULT 'open'
                  CHECK (voting_status IN ('open', 'paused', 'stopped'))
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | Public | Admin password sign-in |
| POST | `/api/auth/logout` | Session | Sign out admin or student cookie |
| POST | `/api/auth/student/enter` | Public | Allowlist check + set voting cookie |
| GET | `/api/projects` | Public | List projects with vote counts |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/[id]` | Public | Get one project |
| PUT | `/api/projects/[id]` | Admin | Update project |
| DELETE | `/api/projects/[id]` | Admin | Delete project |
| POST | `/api/votes` | Student cookie | Cast/change vote (atomic) |
| DELETE | `/api/votes` | Student cookie | Remove vote |
| GET | `/api/admin/leaderboard` | Admin | Sorted projects + stats |
| GET | `/api/admin/settings` | Admin | Read deadline + voting status |
| PUT | `/api/admin/settings` | Admin | Update deadline and/or voting status |
| GET | `/api/admin/voters` | Admin | List eligible emails |
| POST | `/api/admin/voters` | Admin | Add one email |
| POST | `/api/admin/voters/import` | Admin | Import Excel/CSV emails |
| DELETE | `/api/admin/voters` | Admin | Remove all eligible emails (votes cascade) |
| DELETE | `/api/admin/voters/[id]` | Admin | Remove email |
| GET | `/api/competition` | Public | Gallery payload |
| GET | `/api/me` | Admin or student cookie | Current actor |

## Security Requirements

- RLS on all tables
- Only admins write projects and eligible emails
- Votes written via server APIs / RPC using the student cookie
- Deadline validated server-side
- Admins identified by `role = admin` in profiles

## Pages

| Route | Access |
|-------|--------|
| `/` | Redirects to `/vote` |
| `/vote` | Public listed-email entry |
| `/gallery` | Student voting cookie only (admins use `/admin`; no admin nav) |
| `/login` | Admin password sign-in |
| `/admin` | Admin only |
| `/register` | Removed from product |
| `/submit` | Removed from product |
| `/design-system` | Internal |

## Success Metrics

- Page load < 2s on 3G
- Lighthouse Performance > 90
- One-vote constraint enforced at DB level
- Unlisted emails cannot enter voting
- Zero unauthorized admin access via RLS

## Phase Roadmap

### Phase 1 ✅ — Foundation

- Next.js + Tailwind + Supabase utilities
- Design system
- Documentation

### Phase 1.5 ✅ — Admin UI shell

- Overview, leaderboard, deadline, delete

### Phase 2 — Admin-owned contest + listed-email voting

- Docs, schema, admin APIs, student enter/vote APIs, admin Projects + Voters UI
