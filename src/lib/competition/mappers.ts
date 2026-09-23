import type { Project } from "@/types";

interface ProjectRow {
  id: string;
  created_by?: string | null;
  student_id?: string | null;
  title: string;
  description: string;
  demo_url: string;
  thumbnail_url: string | null;
  author_name?: string | null;
  batch?: string | null;
  created_at: string;
  votes?: { count: number }[] | { count: number };
}

export function mapProjectRow(row: ProjectRow): Project {
  const voteCount = Array.isArray(row.votes)
    ? (row.votes[0]?.count ?? 0)
    : (row.votes?.count ?? 0);

  const authorName = row.author_name?.trim();
  const batch = row.batch?.trim();

  return {
    id: row.id,
    createdBy: row.created_by ?? row.student_id ?? undefined,
    title: row.title,
    description: row.description,
    demoUrl: row.demo_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    author: authorName
      ? {
          name: authorName,
          batch: batch || undefined,
        }
      : undefined,
    voteCount,
    createdAt: row.created_at,
  };
}
