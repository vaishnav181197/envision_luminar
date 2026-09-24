import type { Project } from "@/types";
import type { VotingStatus } from "@/types/database";

export interface LeaderboardRow {
  id: string;
  rank: number;
  title: string;
  votes: number;
  demoUrl: string;
  submittedAt: string;
  thumbnailUrl?: string;
  isWinner?: boolean;
}

export type AdminTab = "overview" | "projects" | "voters" | "settings";

export interface EligibleStudent {
  id: string;
  email: string;
  createdAt: string;
}

export interface CompetitionSettings {
  votingEndTime: string;
  votingStatus: VotingStatus;
}

export interface AdminStats {
  totalSubmissions: number;
  totalVotes: number;
  leadingProject: string;
  leadingVotes: number;
  timeRemaining: string;
  isOpen: boolean;
}

export interface AdminUser {
  name: string;
  email: string;
  role: "admin";
}

export interface AdminProject extends Project {
  authorEmail?: string;
  submittedAt?: string;
}

export type { VotingStatus };
