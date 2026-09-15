import { jsonError, jsonOk } from "@/lib/api/response";
import {
  getCompetitionSettings,
  isCompetitionOpen,
  requireAuth,
} from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

interface VoteBody {
  projectId?: string;
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) {
    return jsonError(auth.error, 401);
  }

  const settings = await getCompetitionSettings();
  if (!settings || !isCompetitionOpen(settings.votingEndTime)) {
    return jsonError("Voting is closed", 403);
  }

  let body: VoteBody;
  try {
    body = (await request.json()) as VoteBody;
  } catch {
    return jsonError("Invalid request body");
  }

  const { projectId } = body;
  if (!projectId) {
    return jsonError("projectId is required");
  }

  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return jsonError("Project not found", 404);
  }

  const { data: existingVote } = await supabase
    .from("votes")
    .select("id, project_id")
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (existingVote?.project_id === projectId) {
    return jsonOk({ projectId, voted: true });
  }

  if (existingVote) {
    const { error: deleteError } = await supabase
      .from("votes")
      .delete()
      .eq("id", existingVote.id);

    if (deleteError) {
      return jsonError(deleteError.message, 500);
    }
  }

  const { error: insertError } = await supabase.from("votes").insert({
    user_id: auth.user!.id,
    project_id: projectId,
  });

  if (insertError) {
    return jsonError(insertError.message, 500);
  }

  return jsonOk({ projectId, voted: true });
}

export async function DELETE() {
  const auth = await requireAuth();
  if (auth.error) {
    return jsonError(auth.error, 401);
  }

  const settings = await getCompetitionSettings();
  if (!settings || !isCompetitionOpen(settings.votingEndTime)) {
    return jsonError("Voting is closed", 403);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("votes").delete().eq("user_id", auth.user!.id);

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ voted: false });
}
