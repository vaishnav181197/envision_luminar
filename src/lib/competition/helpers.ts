import type { AdminStats, LeaderboardRow } from "@/types/admin";
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

export function isCompetitionOpen(votingEndTime: string): boolean {
  return new Date(votingEndTime).getTime() > Date.now();
}

export function isDeadlineApproaching(
  votingEndTime: string,
  daysThreshold = 3,
): boolean {
  const diff = new Date(votingEndTime).getTime() - Date.now();
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
  return diff > 0 && diff <= thresholdMs;
}

export function markWinners(projects: Project[], isOpen: boolean): Project[] {
  if (isOpen || projects.length === 0) {
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
  votingEndTime: string,
): AdminStats {
  const leaderboard = buildLeaderboardRows(projects);
  const leader = leaderboard[0];

  return {
    totalSubmissions: projects.length,
    totalVotes: projects.reduce((sum, project) => sum + project.voteCount, 0),
    leadingProject: leader?.title ?? "—",
    leadingVotes: leader?.votes ?? 0,
    timeRemaining: formatTimeRemaining(votingEndTime),
    isOpen: isCompetitionOpen(votingEndTime),
  };
}
