import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStatsRow } from "@/components/admin/admin-stats";
import { LeaderboardTable } from "@/components/admin/leaderboard-table";
import type { AdminStats, LeaderboardRow } from "@/types/admin";

export interface AdminOverviewProps {
  stats: AdminStats;
  topRows: LeaderboardRow[];
  loading?: boolean;
}

export function AdminOverview({ stats, topRows, loading }: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Monitor submissions, track votes, and manage the competition at a glance.
        </p>
      </div>

      <AdminStatsRow stats={stats} loading={loading} />

      <Card padding="none">
        <CardHeader className="border-b border-divider px-5 py-4">
          <CardTitle>Top Submissions</CardTitle>
          <CardDescription>
            Leading projects by vote count. Full list available in Submissions.
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
