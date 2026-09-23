export type { Database, UserRole } from "./database";

export interface Project {
  id: string;
  createdBy?: string;
  title: string;
  description: string;
  demoUrl: string;
  thumbnailUrl?: string;
  author?: {
    name: string;
    batch?: string;
    email?: string;
    avatarUrl?: string;
  };
  voteCount: number;
  createdAt?: string;
  tags?: string[];
  isWinner?: boolean;
}

export interface CompetitionStatus {
  isOpen: boolean;
  deadline: string;
  totalProjects: number;
  totalVotes: number;
}

export type {
  AdminStats,
  AdminTab,
  AdminUser,
  CompetitionSettings,
  EligibleStudent,
  LeaderboardRow,
} from "./admin";
