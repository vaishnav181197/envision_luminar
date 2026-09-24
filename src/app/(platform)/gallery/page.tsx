"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Search, Trophy } from "lucide-react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatCard } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/ui/project-card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useToast } from "@/components/ui/toast";
import { useCompetition } from "@/contexts/competition-context";
import { useAuth } from "@/hooks/use-auth";
import {
  votingStatusIndicator,
  votingStatusLabel,
} from "@/lib/competition/helpers";

export default function GalleryPage() {
  const {
    projects,
    stats,
    settings,
    isOpen,
    isPaused,
    leaderboard,
    userVote,
    castVote,
    removeVote,
  } = useCompetition();
  const { isVoter, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [votingProjectId, setVotingProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const canVote = isOpen && isVoter;
  const query = search.toLowerCase();
  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.author?.name?.toLowerCase().includes(query) ?? false) ||
      (p.author?.batch?.toLowerCase().includes(query) ?? false),
  );

  const leader = leaderboard[0];

  const handleUpvote = async (projectId: string, voted: boolean) => {
    if (!canVote) return;

    setVotingProjectId(projectId);

    const result = voted
      ? await castVote(projectId)
      : userVote === projectId
        ? await removeVote()
        : { success: false, error: "Unable to update vote" };

    setVotingProjectId(null);

    if (!result.success) {
      if (result.error === "Unauthorized") {
        router.push("/vote");
        return;
      }
      addToast({
        title: "Vote failed",
        description: result.error ?? "Something went wrong.",
        variant: "error",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Project Gallery" }]} />

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <StatusIndicator
              status={votingStatusIndicator(settings)}
              label={votingStatusLabel(settings)}
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Project Gallery
          </h1>
          <p className="mt-2 max-w-xl text-base text-text-secondary">
            Browse the published UI entries and cast one vote for the most
            creative and polished project.
          </p>
          {!authLoading && isOpen && (
            <p className="mt-3 text-sm text-text-secondary">
              Cast one vote for the project you think deserves to win.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Projects"
          value={stats.totalSubmissions}
          change={
            isPaused
              ? "Voting paused"
              : isOpen
                ? "Competition active"
                : "Competition closed"
          }
          icon={<Trophy className="h-4 w-4" />}
        />
        <StatCard
          label="Total Votes"
          value={stats.totalVotes}
          change="Community engagement"
          trend="up"
          icon={<Filter className="h-4 w-4" />}
        />
        <StatCard
          label="Leading Project"
          value={leader?.votes ?? 0}
          change={leader?.title ?? "No projects yet"}
          trend="up"
        />
      </div>

      <div className="mt-8 w-full sm:max-w-xs sm:ml-auto">
        <Input
          label="Search projects"
          placeholder="Search by title, author, or batch..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            voted={userVote === project.id}
            disabled={!canVote}
            loading={votingProjectId === project.id}
            onUpvote={handleUpvote}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <p className="mt-12 text-center text-sm text-text-muted">
          {projects.length === 0
            ? "No projects yet. Check back once the admin publishes entries."
            : "No projects match your search."}
        </p>
      )}
    </div>
  );
}
