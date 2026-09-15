import { createClient } from "@/lib/supabase/server";
import { mapProjectRow } from "@/lib/competition/mappers";

const PROJECT_SELECT = `
  id,
  student_id,
  title,
  description,
  demo_url,
  thumbnail_url,
  created_at,
  profiles!projects_student_id_fkey (
    display_name,
    batch,
    email,
    avatar_url
  ),
  votes ( count )
`;

export async function fetchProjectsWithVotes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProjectRow);
}

export async function fetchUserVote(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("votes")
    .select("project_id")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.project_id ?? null;
}
