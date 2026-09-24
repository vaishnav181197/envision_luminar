import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { AdminStatsRow } from "@/components/admin/admin-stats";
import { LeaderboardTable } from "@/components/admin/leaderboard-table";
import type { AdminStats, LeaderboardRow } from "@/types/admin";

export interface AdminOverviewProps {
  stats: AdminStats;
  topRows: LeaderboardRow[];
  loading?: boolean;
  /** True while students may still vote (open + future deadline). */
  isOpen?: boolean;
  /** True when winners should be shown (stopped or deadline passed). */
  isEnded?: boolean;
}

export function AdminOverview({
  stats,
  topRows,
  loading,
  isOpen = true,
  isEnded = false,
}: AdminOverviewProps) {
  const winners = topRows.filter((row) => row.isWinner);
  const winnerLabel =
    winners.length > 1
      ? winners.map((row) => row.title).join(", ")
      : (winners[0]?.title ?? stats.leadingProject);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Monitor published projects, track votes, and manage the competition at a glance.
        </p>
      </div>

      {!loading && isEnded && winners.length > 0 && (
        <Alert variant="success" title="Winner declared">
          {winners.length > 1
            ? `Tied winners: ${winnerLabel}.`
            : `${winnerLabel} is the current winner by vote count.`}
        </Alert>
      )}

      {!loading && !isOpen && !isEnded && (
        <Alert variant="warning" title="Voting paused">
          Entry and votes are paused. Winners stay hidden until you stop voting or
          the deadline passes.
        </Alert>
      )}

      <AdminStatsRow stats={stats} loading={loading} />

      <Card padding="none">
        <CardHeader className="border-b border-divider px-5 py-4">
          <CardTitle>Top Submissions</CardTitle>
          <CardDescription>
            Leading projects by vote count. Create and edit entries in Projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {topRows.length > 0 ? (
            <LeaderboardTable rows={topRows} compact />
          ) : (
            <p className="px-5 py-8 text-center text-sm text-text-muted">
              No submissions yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
