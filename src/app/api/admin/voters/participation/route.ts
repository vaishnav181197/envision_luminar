import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { VoterParticipationRow } from "@/types/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  const supabase = await createClient();

  const { data: students, error: studentsError } = await supabase
    .from("eligible_students")
    .select("id, email, created_at")
    .order("email", { ascending: true });

  if (studentsError) {
    return jsonError(studentsError.message, 500);
  }

  const { data: voteRows, error: votesError } = await supabase
    .from("votes")
    .select("eligible_student_id, project_id, created_at, projects ( title )");

  if (votesError) {
    return jsonError(votesError.message, 500);
  }

  type VoteJoin = {
    eligible_student_id: string;
    project_id: string;
    created_at: string;
    projects: { title: string } | { title: string }[] | null;
  };

  const voteByStudent = new Map<
    string,
    { projectId: string; projectTitle: string; votedAt: string }
  >();

  for (const row of (voteRows ?? []) as VoteJoin[]) {
    const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
    voteByStudent.set(row.eligible_student_id, {
      projectId: row.project_id,
      projectTitle: project?.title ?? "Unknown project",
      votedAt: row.created_at,
    });
  }

  const voted: VoterParticipationRow[] = [];
  const notVoted: VoterParticipationRow[] = [];

  for (const student of students ?? []) {
    const vote = voteByStudent.get(student.id);
    const row: VoterParticipationRow = {
      id: student.id,
      email: student.email,
      registeredAt: student.created_at,
      hasVoted: Boolean(vote),
      projectId: vote?.projectId,
      projectTitle: vote?.projectTitle,
      votedAt: vote?.votedAt,
    };
    if (vote) {
      voted.push(row);
    } else {
      notVoted.push(row);
    }
  }

  return jsonOk({
    voted,
    notVoted,
    counts: {
      total: (students ?? []).length,
      voted: voted.length,
      notVoted: notVoted.length,
    },
  });
}
