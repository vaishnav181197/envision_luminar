import type { Project } from "@/types";

interface ProfileRow {
  display_name: string | null;
  batch: string | null;
  email: string;
  avatar_url: string | null;
}

interface ProjectRow {
  id: string;
  student_id: string;
  title: string;
  description: string;
  demo_url: string;
  thumbnail_url: string | null;
  created_at: string;
  profiles: ProfileRow | ProfileRow[] | null;
  votes?: { count: number }[] | { count: number };
}

export function mapProjectRow(row: ProjectRow): Project {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const voteCount = Array.isArray(row.votes)
    ? (row.votes[0]?.count ?? 0)
    : (row.votes?.count ?? 0);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    demoUrl: row.demo_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    author: {
      name: profile?.display_name ?? "Unknown",
      batch: profile?.batch ?? undefined,
      email: profile?.email,
      avatarUrl: profile?.avatar_url ?? undefined,
    },
    voteCount,
    createdAt: row.created_at,
  };
}
