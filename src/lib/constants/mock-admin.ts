import { MOCK_PROJECTS } from "@/lib/constants/mock-projects";
import type { AdminUser } from "@/types/admin";

export {
  buildLeaderboardRows,
  formatTimeRemaining,
  isCompetitionOpen,
  isDeadlineApproaching,
} from "@/lib/competition/helpers";

function defaultVotingEndTime(): string {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  date.setHours(23, 59, 0, 0);
  return date.toISOString();
}

export const MOCK_COMPETITION_SETTINGS = {
  votingEndTime: defaultVotingEndTime(),
};

export const MOCK_ADMIN_USER: AdminUser = {
  name: "Admin User",
  email: "admin@institute.edu",
  role: "admin",
};

export function getInitialProjects() {
  return MOCK_PROJECTS.map((p) => ({ ...p }));
}
