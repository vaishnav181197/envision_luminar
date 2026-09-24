import type { AdminStats, CompetitionSettings, LeaderboardRow } from "@/types/admin";
import type { Project } from "@/types";

export function buildLeaderboardRows(projects: Project[]): LeaderboardRow[] {
  const sorted = [...projects].sort((a, b) => b.voteCount - a.voteCount);

  return sorted.map((project, index) => ({
    id: project.id,
    rank: index + 1,
    title: project.title,
    votes: project.voteCount,
    demoUrl: project.demoUrl,
    submittedAt: project.createdAt ?? new Date().toISOString(),
    thumbnailUrl: project.thumbnailUrl,
    isWinner: project.isWinner === true,
  }));
}

export function formatTimeRemaining(deadline: string): string {
  const now = Date.now();
  const end = new Date(deadline).getTime();
  const diff = end - now;

  if (diff <= 0) return "Closed";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes}m left`;
}

export function isDeadlinePassed(votingEndTime: string): boolean {
  return new Date(votingEndTime).getTime() <= Date.now();
}

export function isCompetitionOpen(settings: CompetitionSettings): boolean {
  return settings.votingStatus === "open" && !isDeadlinePassed(settings.votingEndTime);
}

export function isCompetitionPaused(settings: CompetitionSettings): boolean {
  return settings.votingStatus === "paused" && !isDeadlinePassed(settings.votingEndTime);
}

export function isCompetitionEnded(settings: CompetitionSettings): boolean {
  return settings.votingStatus === "stopped" || isDeadlinePassed(settings.votingEndTime);
}

export function isDeadlineApproaching(
  settings: CompetitionSettings,
  daysThreshold = 3,
): boolean {
  if (!isCompetitionOpen(settings)) return false;
  const diff = new Date(settings.votingEndTime).getTime() - Date.now();
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
  return diff > 0 && diff <= thresholdMs;
}

export function votingStatusLabel(settings: CompetitionSettings): string {
  if (isCompetitionPaused(settings)) return "Voting Paused";
  if (settings.votingStatus === "stopped") return "Voting Stopped";
  return isCompetitionOpen(settings) ? "Voting Open" : "Voting Closed";
}

export function votingStatusIndicator(
  settings: CompetitionSettings,
): "open" | "closed" | "pending" {
  if (isCompetitionPaused(settings)) return "pending";
  return isCompetitionOpen(settings) ? "open" : "closed";
}

export function markWinners(projects: Project[], isEnded: boolean): Project[] {
  if (!isEnded || projects.length === 0) {
    return projects.map((project) => ({ ...project, isWinner: false }));
  }

  const maxVotes = Math.max(...projects.map((project) => project.voteCount));
  if (maxVotes <= 0) {
    return projects.map((project) => ({ ...project, isWinner: false }));
  }

  return projects.map((project) => ({
    ...project,
    isWinner: project.voteCount === maxVotes,
  }));
}

export function buildAdminStats(
  projects: Project[],
  settings: CompetitionSettings,
): AdminStats {
  const leaderboard = buildLeaderboardRows(projects);
  const leader = leaderboard[0];
  const open = isCompetitionOpen(settings);

  return {
    totalSubmissions: projects.length,
    totalVotes: projects.reduce((sum, project) => sum + project.voteCount, 0),
    leadingProject: leader?.title ?? "—",
    leadingVotes: leader?.votes ?? 0,
    timeRemaining: isCompetitionPaused(settings)
      ? "Paused"
      : formatTimeRemaining(settings.votingEndTime),
    isOpen: open,
  };
}
