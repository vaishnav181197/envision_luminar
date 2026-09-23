import { jsonError, jsonOk } from "@/lib/api/response";
import { getStudentSession } from "@/lib/auth/student-session";
import { requireAuth } from "@/lib/auth/session";
import { fetchStudentVote } from "@/lib/competition/queries";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.error && auth.user && auth.profile) {
    return jsonOk({
      user: {
        id: auth.user.id,
        email: auth.profile.email,
        name: auth.profile.display_name ?? auth.profile.email,
        role: auth.profile.role,
        batch: auth.profile.batch,
      },
    });
  }

  const student = await getStudentSession();
  if (student) {
    const vote = await fetchStudentVote(student.id);
    return jsonOk({
      voter: {
        id: student.id,
        email: student.email,
        role: "student" as const,
      },
      userVote: vote,
    });
  }

  return jsonError("Unauthorized", 401);
}
