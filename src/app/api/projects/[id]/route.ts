import { jsonError, jsonOk } from "@/lib/api/response";
import {
  getCompetitionSettings,
  isCompetitionOpen,
  requireAuth,
} from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAuth();
  if (auth.error) {
    return jsonError(auth.error, 401);
  }

  const supabase = await createClient();
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("student_id")
    .eq("id", id)
    .single();

  if (fetchError || !project) {
    return jsonError("Project not found", 404);
  }

  const isOwner = project.student_id === auth.user!.id;
  const isAdmin = auth.profile!.role === "admin";

  if (!isOwner && !isAdmin) {
    return jsonError("Forbidden", 403);
  }

  if (!isAdmin) {
    const settings = await getCompetitionSettings();
    if (!settings || !isCompetitionOpen(settings.votingEndTime)) {
      return jsonError("Competition is closed", 403);
    }
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ success: true });
}
