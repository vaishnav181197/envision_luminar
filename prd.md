# Product Requirements Document (PRD): Envision UI Design Competition

## 1. Project Overview

Envision hosts an institute UI design competition. **Administrators publish every competing project** and run the voting window. **Students only vote.** A student enters by submitting an admission email that the admin already registered, then browses the gallery and casts exactly one changeable vote before the deadline.

## 2. Tech Stack (Zero-Cost Architecture)

- **Frontend & API Routes:** Next.js (App Router) + React
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL, Auth for admins only, Row Level Security)
- **Hosting:** Vercel (Hobby Tier)

## 3. User Roles

1. **Admin:** Password sign-in. Full control of competing UIs, the voter email list, the voting window (deadline, pause, stop), and the leaderboard.
2. **Student (voter only):** Not a password account. Enters voting with a pre-registered email, views the gallery, and casts one changeable vote.

## 4. Core Features & Functional Requirements

### 4.1. Admin Authentication

- Email and password via Supabase Auth.
- Only `profiles.role = admin` may use `/login` and `/admin`.
- `/admin/login` redirects to `/login`.
- Students do not register and do not use password login.

### 4.2. Student Entry (Listed email)

- Admin pre-loads every eligible admission email (unique).
- Student submits that email on `/vote`.
- If the email is **not** on the list, the API returns “this email is not registered for voting” and sets no cookie.
- If the email **is** listed, the server sets a signed httpOnly **voting cookie**. Students are not created in `auth.users`.
- One listed email can hold one active vote.

### 4.3. Project Submission (Admin only)

- Admin creates, edits, and deletes competing projects at any time while managing the contest.
- **Required fields:** Title, short description, live demo URL, author name, and batch. Optional thumbnail image upload (images only).
- Project cards show title, author, batch, description, demo, and vote count.
- An admin may publish many projects (no one-project-per-user limit).

### 4.4. Voter list (Admin)

- Add one email through a single-field form. Emails are stored uniquely (normalized lowercase).
- Or import many emails from an Excel or CSV file that contains email addresses only.
- Admin can list and remove emails.
- After the deadline, admin may still manage the list and review results; student entry and votes are rejected.

### 4.5. Voting System

- One active vote per eligible student (`UNIQUE(eligible_student_id)`).
- Changing a vote transfers it atomically to the new project.
- Self-voting does not apply (students are not authors).
- Voting requires a valid student cookie and an open competition.

### 4.6. Time-Bound Competition

- Global `voting_end_time` and `voting_status` (`open` | `paused` | `stopped`) in `settings`.
- **Open + pre-deadline:** admin manages projects/voters; listed students may enter and vote.
- **Paused:** entry and votes blocked; winners stay hidden. Admin can resume anytime before the deadline.
- **Stopped or post-deadline:** UI disables upvote; APIs reject student enter and vote writes; winners are shown. Admin can still view the leaderboard and manage records. Reopening requires a future deadline.

### 4.7. Admin Dashboard

Protected `/admin` with:

- **Overview** — stats and top projects / winner after close
- **Projects** — create, edit, delete competing UIs
- **Voters** — add/import/remove eligible emails
- **Settings** — voting deadline, pause, and stop
- Leaderboard sorted by vote count descending

## 5. Database Schema (Supabase PostgreSQL)

### `profiles` (admin Auth users only)

- `id`: UUID (PK, `auth.users`)
- `email`, `role` (`admin` | legacy `student`), `display_name`, `batch`, `avatar_url`, `created_at`

### `eligible_students`

- `id`: UUID (PK)
- `email`: TEXT UNIQUE NOT NULL (lowercase)
- `created_by`: UUID → `profiles.id`
- `created_at`: timestamptz

### `projects`

- `id`: UUID (PK)
- `created_by`: UUID → `profiles.id` (admin; not unique)
- `title`, `description`, `demo_url`, `author_name`, `batch`, `thumbnail_url` (optional), `created_at`

### `votes`

- `id`: UUID (PK)
- `eligible_student_id`: UUID UNIQUE → `eligible_students.id`
- `project_id`: UUID → `projects.id`
- `created_at`: timestamptz

### `settings`

- `id`: INTEGER PK (single row)
- `voting_end_time`: timestamptz
- `voting_status`: `open` | `paused` | `stopped`

## 6. UI/UX & Design Requirements

- Minimalist, modern, content-first.
- **Home / vote entry:** listed email, then gallery.
- **Project card:** thumbnail or placeholder, title, author, batch, vote count, View Demo, Upvote.
- **Admin:** data tables for projects, voters, and leaderboard; project form; single-email form; spreadsheet upload.
- Responsive on mobile.

## 7. Non-Functional Requirements

- RLS: public read of projects/vote counts; only admins write projects and voter emails; votes written only through server APIs / RPC using the student session.
- Deadline enforced on the server for student writes.
- Performance: Server Components where possible.

## 8. Implementation Notes

1. Admin Auth stays on Supabase email/password.
2. Student session is a signed cookie after the listed email is accepted.
3. Cookie signing uses `STUDENT_SESSION_SECRET`.
4. Build admin project/voter APIs first, then student enter/vote APIs, then admin UI.
