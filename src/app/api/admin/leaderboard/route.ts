import { jsonError, jsonOk } from "@/lib/api/response";
import {
  getCompetitionSettings,
  requireAdmin,
} from "@/lib/auth/session";
import {
  buildAdminStats,
  buildLeaderboardRows,
  isCompetitionEnded,
  markWinners,
} from "@/lib/competition/helpers";
import { fetchProjectsWithVotes } from "@/lib/competition/queries";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  try {
    const [projects, settings] = await Promise.all([
      fetchProjectsWithVotes(),
      getCompetitionSettings(),
    ]);

    if (!settings) {
      return jsonError("Competition settings not found", 500);
    }

    const ranked = markWinners(projects, isCompetitionEnded(settings));

    return jsonOk({
      leaderboard: buildLeaderboardRows(ranked),
      stats: buildAdminStats(ranked, settings),
      settings,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load leaderboard";
    return jsonError(message, 500);
  }
}
