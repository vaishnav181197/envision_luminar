"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCompetition } from "@/contexts/competition-context";
import {
  isCompetitionOpen,
  isCompetitionPaused,
  isDeadlineApproaching,
} from "@/lib/competition/helpers";
import type { Project } from "@/types";
import type {
  AdminStats,
  AdminUser,
  CompetitionSettings,
  EligibleStudent,
  LeaderboardRow,
  VotingStatus,
} from "@/types/admin";

const EMPTY_STATS: AdminStats = {
  totalSubmissions: 0,
  totalVotes: 0,
  leadingProject: "—",
  leadingVotes: 0,
  timeRemaining: "—",
  isOpen: false,
};

const DEFAULT_SETTINGS: CompetitionSettings = {
  votingEndTime: "2099-01-01T00:00:00.000Z",
  votingStatus: "open",
};

interface LeaderboardResponse {
  leaderboard: LeaderboardRow[];
  stats: AdminStats;
  settings: CompetitionSettings;
}

interface SessionResponse {
  user: AdminUser;
}

export interface ProjectFormPayload {
  title: string;
  description: string;
  demoUrl: string;
  authorName: string;
  batch: string;
  thumbnailFile?: File | null;
  thumbnailUrl?: string;
  clearThumbnail?: boolean;
}

function toProjectFormData(input: ProjectFormPayload): FormData {
  const body = new FormData();
  body.append("title", input.title);
  body.append("description", input.description);
  body.append("demoUrl", input.demoUrl);
  body.append("authorName", input.authorName);
  body.append("batch", input.batch);

  if (input.thumbnailFile) {
    body.append("thumbnail", input.thumbnailFile);
  } else if (input.clearThumbnail) {
    body.append("clearThumbnail", "true");
  }

  return body;
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function useAdminDashboard() {
  const router = useRouter();
  const { refresh: refreshCompetition } = useCompetition();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [voters, setVoters] = useState<EligibleStudent[]>([]);
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [settings, setSettings] = useState<CompetitionSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const redirectIfUnauthorized = useCallback(
    (status: number): boolean => {
      if (status === 401) {
        router.replace("/login?redirect=/admin");
        return true;
      }
      if (status === 403) {
        router.replace("/");
        return true;
      }
      return false;
    },
    [router],
  );

  const loadLeaderboard = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/admin/leaderboard");
    if (redirectIfUnauthorized(res.status)) {
      return false;
    }
    if (!res.ok) {
      throw new Error(await readError(res, "Failed to load leaderboard"));
    }

    const data = (await res.json()) as LeaderboardResponse;
    setLeaderboard(data.leaderboard);
    setStats(data.stats);
    setSettings({
      votingEndTime: data.settings.votingEndTime,
      votingStatus: data.settings.votingStatus ?? "open",
    });
    return true;
  }, [redirectIfUnauthorized]);

  const loadProjects = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/projects");
    if (redirectIfUnauthorized(res.status)) {
      return false;
    }
    if (!res.ok) {
      throw new Error(await readError(res, "Failed to load projects"));
    }

    const data = (await res.json()) as { projects: Project[] };
    setProjects(data.projects ?? []);
    return true;
  }, [redirectIfUnauthorized]);

  const loadVoters = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/admin/voters");
    if (redirectIfUnauthorized(res.status)) {
      return false;
    }
    if (!res.ok) {
      throw new Error(await readError(res, "Failed to load voters"));
    }

    const data = (await res.json()) as { voters: EligibleStudent[] };
    setVoters(data.voters ?? []);
    return true;
  }, [redirectIfUnauthorized]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionRes = await fetch("/api/admin/session");
      if (redirectIfUnauthorized(sessionRes.status)) {
        return;
      }
      if (!sessionRes.ok) {
        throw new Error(
          await readError(sessionRes, "Failed to verify admin session"),
        );
      }

      const session = (await sessionRes.json()) as SessionResponse;
      setUser(session.user);
      await Promise.all([loadLeaderboard(), loadProjects(), loadVoters()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load admin dashboard",
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadLeaderboard, loadProjects, loadVoters, redirectIfUnauthorized]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const sessionRes = await fetch("/api/admin/session");
        if (cancelled) return;
        if (redirectIfUnauthorized(sessionRes.status)) {
          return;
        }
        if (!sessionRes.ok) {
          throw new Error(
            await readError(sessionRes, "Failed to verify admin session"),
          );
        }

        const session = (await sessionRes.json()) as SessionResponse;
        if (cancelled) return;
        setUser(session.user);

        const [leaderboardRes, projectsRes, votersRes] = await Promise.all([
          fetch("/api/admin/leaderboard"),
          fetch("/api/projects"),
          fetch("/api/admin/voters"),
        ]);

        if (cancelled) return;
        if (
          redirectIfUnauthorized(leaderboardRes.status) ||
          redirectIfUnauthorized(projectsRes.status) ||
          redirectIfUnauthorized(votersRes.status)
        ) {
          return;
        }

        if (!leaderboardRes.ok) {
          throw new Error(
            await readError(leaderboardRes, "Failed to load leaderboard"),
          );
        }
        if (!projectsRes.ok) {
          throw new Error(await readError(projectsRes, "Failed to load projects"));
        }
        if (!votersRes.ok) {
          throw new Error(await readError(votersRes, "Failed to load voters"));
        }

        const leaderboardData = (await leaderboardRes.json()) as LeaderboardResponse;
        const projectsData = (await projectsRes.json()) as { projects: Project[] };
        const votersData = (await votersRes.json()) as { voters: EligibleStudent[] };

        if (cancelled) return;
        setLeaderboard(leaderboardData.leaderboard);
        setStats(leaderboardData.stats);
        setSettings(leaderboardData.settings);
        setProjects(projectsData.projects ?? []);
        setVoters(votersData.voters ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load admin dashboard",
          );
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
  }, [redirectIfUnauthorized]);

  const deleteProject = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (redirectIfUnauthorized(res.status)) {
        return { success: false, error: "Unauthorized" };
      }
      if (!res.ok) {
        return {
          success: false,
          error: await readError(res, "Failed to delete project"),
        };
      }

      setLeaderboard((prev) => prev.filter((row) => row.id !== id));
      setProjects((prev) => prev.filter((project) => project.id !== id));
      await Promise.all([
        loadLeaderboard(),
        loadProjects(),
        refreshCompetition(),
      ]);
      return { success: true };
    },
    [loadLeaderboard, loadProjects, redirectIfUnauthorized, refreshCompetition],
  );

  const createProject = useCallback(
    async (
      input: ProjectFormPayload,
    ): Promise<{ success: boolean; error?: string }> => {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: toProjectFormData(input),
      });

      if (redirectIfUnauthorized(res.status)) {
        return { success: false, error: "Unauthorized" };
      }
      if (!res.ok) {
        return {
          success: false,
          error: await readError(res, "Failed to create project"),
        };
      }

      await Promise.all([
        loadLeaderboard(),
        loadProjects(),
        refreshCompetition(),
      ]);
      return { success: true };
    },
    [loadLeaderboard, loadProjects, redirectIfUnauthorized, refreshCompetition],
  );

  const updateProject = useCallback(
    async (
      id: string,
      input: ProjectFormPayload,
    ): Promise<{ success: boolean; error?: string }> => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        body: toProjectFormData(input),
      });

      if (redirectIfUnauthorized(res.status)) {
        return { success: false, error: "Unauthorized" };
      }
      if (!res.ok) {
        return {
          success: false,
          error: await readError(res, "Failed to update project"),
        };
      }

      await Promise.all([
        loadLeaderboard(),
        loadProjects(),
        refreshCompetition(),
      ]);
      return { success: true };
    },
    [loadLeaderboard, loadProjects, redirectIfUnauthorized, refreshCompetition],
  );

  const addVoter = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      const res = await fetch("/api/admin/voters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (redirectIfUnauthorized(res.status)) {
        return { success: false, error: "Unauthorized" };
      }
      if (!res.ok) {
        return {
          success: false,
          error: await readError(res, "Failed to add voter"),
        };
      }

      await loadVoters();
      return { success: true };
    },
    [loadVoters, redirectIfUnauthorized],
  );

  const importVoters = useCallback(
    async (
      file: File,
    ): Promise<{
      success: boolean;
      error?: string;
      imported?: number;
      found?: number;
    }> => {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/voters/import", {
        method: "POST",
        body,
      });

      if (redirectIfUnauthorized(res.status)) {
        return { success: false, error: "Unauthorized" };
      }

      const data = (await res.json()) as {
        error?: string;
        imported?: number;
        found?: number;
      };

      if (!res.ok) {
        return {
          success: false,
          error: data.error ?? "Failed to import voters",
        };
      }

      await loadVoters();
      return {
        success: true,
        imported: data.imported,
        found: data.found,
      };
    },
    [loadVoters, redirectIfUnauthorized],
  );

  const deleteVoter = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const res = await fetch(`/api/admin/voters/${id}`, { method: "DELETE" });
      if (redirectIfUnauthorized(res.status)) {
        return { success: false, error: "Unauthorized" };
      }
      if (!res.ok) {
        return {
          success: false,
          error: await readError(res, "Failed to remove voter"),
        };
      }

      setVoters((prev) => prev.filter((voter) => voter.id !== id));
      return { success: true };
    },
    [redirectIfUnauthorized],
  );

  const resetAllVoters = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
    deleted?: number;
  }> => {
    const res = await fetch("/api/admin/voters", { method: "DELETE" });
    if (redirectIfUnauthorized(res.status)) {
      return { success: false, error: "Unauthorized" };
    }
    if (!res.ok) {
      return {
        success: false,
        error: await readError(res, "Failed to reset voters"),
      };
    }

    const data = (await res.json()) as { deleted?: number };
    setVoters([]);
    await Promise.all([loadLeaderboard(), refreshCompetition()]);
    return { success: true, deleted: data.deleted ?? 0 };
  }, [loadLeaderboard, redirectIfUnauthorized, refreshCompetition]);

  const updateDeadline = useCallback(
    async (
      votingEndTime: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votingEndTime }),
      });

      if (redirectIfUnauthorized(res.status)) {
        return { success: false, error: "Unauthorized" };
      }
      if (!res.ok) {
        return {
          success: false,
          error: await readError(res, "Failed to update deadline"),
        };
      }

      const data = (await res.json()) as { settings?: CompetitionSettings };
      if (data.settings) {
        setSettings({
          votingEndTime: data.settings.votingEndTime,
          votingStatus: data.settings.votingStatus ?? "open",
        });
      }

      await Promise.all([loadLeaderboard(), refreshCompetition()]);
      return { success: true };
    },
    [loadLeaderboard, redirectIfUnauthorized, refreshCompetition],
  );

  const updateVotingStatus = useCallback(
    async (
      votingStatus: VotingStatus,
    ): Promise<{ success: boolean; error?: string }> => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votingStatus }),
      });

      if (redirectIfUnauthorized(res.status)) {
        return { success: false, error: "Unauthorized" };
      }
      if (!res.ok) {
        return {
          success: false,
          error: await readError(res, "Failed to update voting status"),
        };
      }

      const data = (await res.json()) as { settings?: CompetitionSettings };
      if (data.settings) {
        setSettings({
          votingEndTime: data.settings.votingEndTime,
          votingStatus: data.settings.votingStatus ?? "open",
        });
      }

      await Promise.all([loadLeaderboard(), refreshCompetition()]);
      return { success: true };
    },
    [loadLeaderboard, redirectIfUnauthorized, refreshCompetition],
  );

  const isOpen = isCompetitionOpen(settings);
  const isPaused = isCompetitionPaused(settings);
  const isDeadlineNear = isDeadlineApproaching(settings);

  return {
    user,
    leaderboard,
    projects,
    voters,
    stats,
    settings,
    isOpen,
    isPaused,
    isDeadlineNear,
    isLoading,
    error,
    refresh,
    createProject,
    updateProject,
    deleteProject,
    addVoter,
    importVoters,
    deleteVoter,
    resetAllVoters,
    updateDeadline,
    updateVotingStatus,
  };
}
