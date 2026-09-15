import type { LeaderboardRow } from "@/types/admin";
import type { Project } from "@/types";

export function buildLeaderboardRows(projects: Project[]): LeaderboardRow[] {
  const sorted = [...projects].sort((a, b) => b.voteCount - a.voteCount);

  return sorted.map((project, index) => ({
    id: project.id,
    rank: index + 1,
    title: project.title,
    author: project.author.name,
    authorEmail: project.author.email ?? "—",
    batch: project.author.batch ?? "—",
    votes: project.voteCount,
    demoUrl: project.demoUrl,
    submittedAt: project.createdAt ?? new Date().toISOString(),
    thumbnailUrl: project.thumbnailUrl,
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
