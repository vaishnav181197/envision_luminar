import { BarChart3, Clock, LayoutGrid, Trophy } from "lucide-react";

import { StatCard } from "@/components/ui/empty-state";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import type { AdminStats } from "@/types/admin";
import { cn } from "@/lib/utils/cn";

export interface AdminStatsProps {
  stats: AdminStats;
  loading?: boolean;
  className?: string;
}

export function AdminStatsRow({ stats, loading, className }: AdminStatsProps) {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      <StatCard
        label="Projects"
        value={stats.totalSubmissions}
        change="Published competing UIs"
        icon={<LayoutGrid className="h-4 w-4" />}
      />
      <StatCard
        label="Total Votes"
        value={stats.totalVotes}
        change="Across all projects"
        trend="up"
        icon={<BarChart3 className="h-4 w-4" />}
      />
      <StatCard
        label={stats.isOpen ? "Current Leader" : "Winner"}
        value={stats.leadingVotes}
        change={stats.leadingProject}
        trend="up"
        icon={<Trophy className="h-4 w-4" />}
      />
      <StatCard
        label="Time Remaining"
        value={stats.timeRemaining}
        change={stats.isOpen ? "Until voting closes" : "Competition ended"}
        icon={<Clock className="h-4 w-4" />}
      />
    </div>
  );
}
