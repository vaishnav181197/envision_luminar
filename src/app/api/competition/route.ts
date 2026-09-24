import { jsonError, jsonOk } from "@/lib/api/response";
import { getStudentSession } from "@/lib/auth/student-session";
import { getCompetitionSettings } from "@/lib/auth/session";
import {
  isCompetitionEnded,
  markWinners,
} from "@/lib/competition/helpers";
import {
  fetchProjectsWithVotes,
  fetchStudentVote,
} from "@/lib/competition/queries";

export async function GET() {
  try {
    const [projects, settings, student] = await Promise.all([
      fetchProjectsWithVotes(),
      getCompetitionSettings(),
      getStudentSession(),
    ]);

    if (!settings) {
      return jsonError("Competition settings not found", 500);
    }

    const userVote = student ? await fetchStudentVote(student.id) : null;

    return jsonOk({
      projects: markWinners(projects, isCompetitionEnded(settings)),
      settings,
      userVote,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load competition data";
    return jsonError(message, 500);
  }
}
