"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  buildLeaderboardRows,
  formatTimeRemaining,
  isCompetitionOpen,
  isCompetitionPaused,
  isDeadlineApproaching,
} from "@/lib/competition/helpers";
import type { AdminStats, CompetitionSettings, VotingStatus } from "@/types/admin";
import type { Project } from "@/types";

interface CompetitionContextValue {
  projects: Project[];
  settings: CompetitionSettings;
  leaderboard: ReturnType<typeof buildLeaderboardRows>;
  stats: AdminStats;
  isOpen: boolean;
  isPaused: boolean;
  isDeadlineNear: boolean;
  isLoading: boolean;
  userVote: string | null;
  refresh: () => Promise<void>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateDeadline: (votingEndTime: string) => Promise<{ success: boolean; error?: string }>;
  updateVotingStatus: (
    votingStatus: VotingStatus,
  ) => Promise<{ success: boolean; error?: string }>;
  castVote: (projectId: string) => Promise<{ success: boolean; error?: string; voted?: boolean }>;
  removeVote: () => Promise<{ success: boolean; error?: string }>;
}

const CompetitionContext = createContext<CompetitionContextValue | null>(null);

const DEFAULT_SETTINGS: CompetitionSettings = {
  votingEndTime: "2099-01-01T00:00:00.000Z",
  votingStatus: "open",
};

export function CompetitionProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<CompetitionSettings>(DEFAULT_SETTINGS);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/competition");
      if (!res.ok) {
        throw new Error("Failed to load competition data");
      }

      const data = (await res.json()) as {
        projects: Project[];
        settings: CompetitionSettings;
        userVote: string | null;
      };

      setProjects(data.projects);
      setSettings({
        votingEndTime: data.settings.votingEndTime,
        votingStatus: data.settings.votingStatus ?? "open",
      });
      setUserVote(data.userVote);
    } catch {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/competition");
        if (!res.ok) {
          throw new Error("Failed to load competition data");
        }

        const data = (await res.json()) as {
          projects: Project[];
          settings: CompetitionSettings;
          userVote: string | null;
        };

        if (cancelled) return;
        setProjects(data.projects);
        setSettings({
          votingEndTime: data.settings.votingEndTime,
          votingStatus: data.settings.votingStatus ?? "open",
        });
        setUserVote(data.userVote);
      } catch {
        if (!cancelled) {
          setProjects([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isOpen = isCompetitionOpen(settings);
  const isPaused = isCompetitionPaused(settings);
  const isDeadlineNear = isDeadlineApproaching(settings);

  const leaderboard = useMemo(
    () => buildLeaderboardRows(projects),
    [projects],
  );

  const stats = useMemo((): AdminStats => {
    const totalVotes = projects.reduce((sum, p) => sum + p.voteCount, 0);
    const leader = leaderboard[0];

    return {
      totalSubmissions: projects.length,
      totalVotes,
      leadingProject: leader?.title ?? "—",
      leadingVotes: leader?.votes ?? 0,
      timeRemaining: isPaused ? "Paused" : formatTimeRemaining(settings.votingEndTime),
      isOpen,
    };
  }, [projects, leaderboard, settings.votingEndTime, isOpen, isPaused]);

  const deleteProject = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        return { success: false, error: data.error ?? "Failed to delete project" };
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (userVote === id) {
        setUserVote(null);
      }
      return { success: true };
    },
    [userVote],
  );

  const updateDeadline = useCallback(
    async (votingEndTime: string): Promise<{ success: boolean; error?: string }> => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votingEndTime }),
      });
      const data = (await res.json()) as {
        error?: string;
        settings?: CompetitionSettings;
      };

      if (!res.ok) {
        return { success: false, error: data.error ?? "Failed to update deadline" };
      }

      if (data.settings) {
        setSettings({
          votingEndTime: data.settings.votingEndTime,
          votingStatus: data.settings.votingStatus ?? "open",
        });
      }
      return { success: true };
    },
    [],
  );

  const updateVotingStatus = useCallback(
    async (votingStatus: VotingStatus): Promise<{ success: boolean; error?: string }> => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votingStatus }),
      });
      const data = (await res.json()) as {
        error?: string;
        settings?: CompetitionSettings;
      };

      if (!res.ok) {
        return { success: false, error: data.error ?? "Failed to update voting status" };
      }

      if (data.settings) {
        setSettings({
          votingEndTime: data.settings.votingEndTime,
          votingStatus: data.settings.votingStatus ?? "open",
        });
      }
      return { success: true };
    },
    [],
  );

  const castVote = useCallback(
    async (projectId: string): Promise<{ success: boolean; error?: string; voted?: boolean }> => {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as { error?: string; voted?: boolean; projectId?: string };

      if (!res.ok) {
        return { success: false, error: data.error ?? "Failed to cast vote" };
      }

      const previousVote = userVote;
      setUserVote(projectId);

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            return { ...p, voteCount: p.voteCount + 1 };
          }
          if (previousVote && p.id === previousVote) {
            return { ...p, voteCount: Math.max(0, p.voteCount - 1) };
          }
          return p;
        }),
      );

      return { success: true, voted: data.voted };
    },
    [userVote],
  );

  const removeVote = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const res = await fetch("/api/votes", { method: "DELETE" });
    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      return { success: false, error: data.error ?? "Failed to remove vote" };
    }

    const previousVote = userVote;
    setUserVote(null);

    if (previousVote) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === previousVote
            ? { ...p, voteCount: Math.max(0, p.voteCount - 1) }
            : p,
        ),
      );
    }

    return { success: true };
  }, [userVote]);

  const value = useMemo(
    () => ({
      projects,
      settings,
      leaderboard,
      stats,
      isOpen,
      isPaused,
      isDeadlineNear,
      isLoading,
      userVote,
      refresh,
      deleteProject,
      updateDeadline,
      updateVotingStatus,
      castVote,
      removeVote,
    }),
    [
      projects,
      settings,
      leaderboard,
      stats,
      isOpen,
      isPaused,
      isDeadlineNear,
      isLoading,
      userVote,
      refresh,
      deleteProject,
      updateDeadline,
      updateVotingStatus,
      castVote,
      removeVote,
    ],
  );

  return (
    <CompetitionContext.Provider value={value}>{children}</CompetitionContext.Provider>
  );
}

export function useCompetition() {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error("useCompetition must be used within CompetitionProvider");
  }
  return context;
}
