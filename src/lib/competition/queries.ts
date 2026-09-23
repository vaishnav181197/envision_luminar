import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { mapProjectRow } from "@/lib/competition/mappers";
import type { Project } from "@/types";

const PROJECT_SELECT = `
  id,
  title,
  description,
  demo_url,
  thumbnail_url,
  author_name,
  batch,
  created_at,
  votes ( count )
`;

const PROJECT_SELECT_LEGACY = `
  id,
  title,
  description,
  demo_url,
  thumbnail_url,
  created_at,
  votes ( count )
`;

function isMissingAuthorColumn(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("author_name") ||
    lower.includes("column projects.batch") ||
    (lower.includes("batch") && lower.includes("does not exist"))
  );
}

export async function fetchProjectsWithVotes(): Promise<Project[]> {
  const supabase = await createClient();
  const primary = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .order("created_at", { ascending: false });

  if (primary.error && isMissingAuthorColumn(primary.error.message)) {
    const fallback = await supabase
      .from("projects")
      .select(PROJECT_SELECT_LEGACY)
      .order("created_at", { ascending: false });
    if (fallback.error) throw new Error(fallback.error.message);
    return (fallback.data ?? []).map(mapProjectRow);
  }

  if (primary.error) throw new Error(primary.error.message);
  return (primary.data ?? []).map(mapProjectRow);
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const primary = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (primary.error && isMissingAuthorColumn(primary.error.message)) {
    const fallback = await supabase
      .from("projects")
      .select(PROJECT_SELECT_LEGACY)
      .eq("id", id)
      .maybeSingle();
    if (fallback.error) throw new Error(fallback.error.message);
    return fallback.data ? mapProjectRow(fallback.data) : null;
  }

  if (primary.error) throw new Error(primary.error.message);
  return primary.data ? mapProjectRow(primary.data) : null;
}

export async function fetchStudentVote(
  eligibleStudentId: string,
): Promise<string | null> {
  const service = createServiceClient() ?? (await createClient());
  const { data } = await service
    .from("votes")
    .select("project_id")
    .eq("eligible_student_id", eligibleStudentId)
    .maybeSingle();

  return data?.project_id ?? null;
}
