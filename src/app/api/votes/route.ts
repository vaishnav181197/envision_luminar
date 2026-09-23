import { jsonError, jsonOk } from "@/lib/api/response";
import { requireStudentSession } from "@/lib/auth/student-session";
import { requireCompetitionOpen } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/service";

interface VoteBody {
  projectId?: string;
}

function mapVoteError(message: string): { error: string; status: number } {
  const normalized = message.toLowerCase();
  if (normalized.includes("unauthorized")) {
    return { error: "Unauthorized", status: 401 };
  }
  if (normalized.includes("voting is closed")) {
    return { error: "Voting is closed", status: 403 };
  }
  if (normalized.includes("project not found")) {
    return { error: "Project not found", status: 404 };
  }
  return { error: message, status: 500 };
}

export async function POST(request: Request) {
  const voter = await requireStudentSession();
  if (voter.error) {
    return jsonError(voter.error, 401);
  }

  const deadline = await requireCompetitionOpen("Voting is closed");
  if (deadline.error) {
    return jsonError(deadline.error, deadline.status);
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

  const service = createServiceClient();
  if (!service) {
    return jsonError("Server is not configured", 500);
  }

  const { data: project, error: projectError } = await service
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return jsonError("Project not found", 404);
  }

  const { error: rpcError } = await service.rpc("cast_vote", {
    p_project_id: projectId,
    p_eligible_student_id: voter.session.id,
  });

  if (rpcError) {
    const mapped = mapVoteError(rpcError.message);
    return jsonError(mapped.error, mapped.status);
  }

  return jsonOk({ projectId, voted: true });
}

export async function DELETE() {
  const voter = await requireStudentSession();
  if (voter.error) {
    return jsonError(voter.error, 401);
  }

  const deadline = await requireCompetitionOpen("Voting is closed");
  if (deadline.error) {
    return jsonError(deadline.error, deadline.status);
  }

  const service = createServiceClient();
  if (!service) {
    return jsonError("Server is not configured", 500);
  }

  const { error } = await service
    .from("votes")
    .delete()
    .eq("eligible_student_id", voter.session.id);

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ voted: false });
}
