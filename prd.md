# Product Requirements Document (PRD): Student UI Design Competition Platform

## 1. Project Overview
The objective is to build a free, responsive, and user-friendly web application that hosts a UI design competition for institute students. The platform allows students to submit their UI designs (with live demo links), browse peers' submissions, and cast exactly one vote for their favorite design within a preset timeframe. Administrators will have access to a dashboard to monitor submissions, track vote counts, and determine the winner.

## 2. Tech Stack (Zero-Cost Architecture)
- **Frontend & API Routes:** Next.js (App Router) + React
- **Styling:** Tailwind CSS (for rapid, responsive, and clean UI)
- **Database & Authentication:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Hosting:** Vercel (Hobby Tier)

## 3. User Roles
1. **Student (Participant & Voter):** Can view the gallery, submit one project, and cast one vote.
2. **Admin:** Can view all data, manage the voting timeframe, and view the final leaderboard.

## 4. Core Features & Functional Requirements

### 4.1. Authentication & Authorization
- **Sign Up / Log In:** Standard email and password authentication via Supabase.
- **Role Management:** Users are assigned roles (`student` by default, `admin` manually set in the database).

### 4.2. Project Submission (Student)
- Students can submit a project via a simple form.
- **Required Fields:** Project Title, Short Description, Live Demo URL (e.g., Figma, Vercel, Netlify), and an optional Thumbnail Image URL.
- Students can edit or delete their own submission before the deadline.

### 4.3. Voting System (Strict Constraints)
- **One Vote Rule:** A student can only upvote **one** project at any given time.
- **Vote Changing:** If a student votes for Project B while having an active vote for Project A, the vote for Project A is automatically revoked and transferred to Project B.
- **Self-Voting:** (Optional rule to define) Typically, students should be allowed or disallowed to vote for their own projects based on admin preference. Default: Allowed, but still consumes their single vote.

### 4.4. Time-Bound Competition
- The platform will have a `voting_deadline` (timestamp).
- **Pre-deadline:** Submissions and voting are open.
- **Post-deadline:** The frontend automatically disables the "Upvote" and "Submit" buttons. Backend API routes reject any POST/PUT requests for votes or submissions.

### 4.5. Admin Dashboard
- Protected route accessible only to users with the `admin` role.
- Displays a table/list of all submitted projects.
- Sorts projects automatically by **Vote Count** (Descending).
- Admin controls to set or update the competition deadline.
- Ability to delete inappropriate submissions.

## 5. Database Schema (Supabase PostgreSQL)

### `users` (managed by Supabase Auth, extended in public schema)
- `id`: UUID (Primary Key)
- `email`: String
- `role`: String ('student' or 'admin', default: 'student')

### `projects`
- `id`: UUID (Primary Key)
- `student_id`: UUID (Foreign Key -> users.id)
- `title`: String
- `description`: Text
- `demo_url`: String
- `thumbnail_url`: String (optional)
- `created_at`: Timestamp

### `votes`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> users.id)
- `project_id`: UUID (Foreign Key -> projects.id)
- `created_at`: Timestamp
- **Constraint:** `UNIQUE(user_id)` to enforce the one-vote-per-student rule at the database level.

### `settings` (for Admin controls)
- `id`: Integer (Primary Key, usually just 1 row)
- `voting_end_time`: Timestamp

## 6. UI/UX & Design Requirements
- **Vibe:** Minimalist, modern, and developer/designer-friendly. Focus on the content (the UI designs).
- **Layouts:**
  - **Home/Gallery:** Grid layout of project cards.
  - **Project Card:** Shows thumbnail (or placeholder), Title, Author, current vote count, "View Demo" button, and "Upvote" button.
  - **Submission Form:** Clean, single-column modal or separate page.
  - **Admin Dashboard:** Data table format for easy scanning of winners.
- **Responsiveness:** Must function perfectly on mobile devices (stacking grids, hamburger menus) using Tailwind CSS utility classes.

## 7. Non-Functional Requirements
- **Security:** Utilize Supabase Row Level Security (RLS) to ensure users can only modify their own submissions and votes.
- **Performance:** Next.js Server Components should be used where possible to ensure fast initial page loads for the gallery.

## 8. Cursor.ai Development Notes
*When feeding this into Cursor, instruct it to:*
1. Initialize a Next.js App Router project with Tailwind.
2. Set up Supabase client utility files.
3. Write SQL migrations for the defined schema and RLS policies.
4. Build UI components sequentially: Navbar -> Auth Forms -> Submission Modal -> Project Gallery -> Admin Dashboard.
