import { jsonError, jsonOk } from "@/lib/api/response";
import { getCompetitionSettings, getSessionUser } from "@/lib/auth/session";
import { fetchProjectsWithVotes, fetchUserVote } from "@/lib/competition/queries";

export async function GET() {
  try {
    const [projects, settings, user] = await Promise.all([
      fetchProjectsWithVotes(),
      getCompetitionSettings(),
      getSessionUser(),
    ]);

    if (!settings) {
      return jsonError("Competition settings not found", 500);
    }

    const userVote = user ? await fetchUserVote(user.id) : null;

    return jsonOk({
      projects,
      settings,
      userVote,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load competition data";
    return jsonError(message, 500);
  }
}
