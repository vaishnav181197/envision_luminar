import type { Project } from "@/types";

export interface LeaderboardRow {
  id: string;
  rank: number;
  title: string;
  author: string;
  authorEmail: string;
  batch: string;
  votes: number;
  demoUrl: string;
  submittedAt: string;
  thumbnailUrl?: string;
}

export interface CompetitionSettings {
  votingEndTime: string;
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

export type AdminTab = "overview" | "submissions" | "settings";

export interface AdminProject extends Project {
  authorEmail?: string;
  submittedAt?: string;
}
