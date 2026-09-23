"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";

import { LeaderboardTable } from "@/components/admin/leaderboard-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ProjectCardSkeleton } from "@/components/ui/skeleton";
import type { LeaderboardRow } from "@/types/admin";

const PAGE_SIZE = 10;

export interface AdminSubmissionsProps {
  rows: LeaderboardRow[];
  loading?: boolean;
  onDelete: (id: string, title: string) => void;
}

export function AdminSubmissions({ rows, loading, onDelete }: AdminSubmissionsProps) {
  const [page, setPage] = useState(1);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <ProjectCardSkeleton />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          All Projects
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Review every published UI, sorted by vote count. Delete entries from here
          or manage them in Projects.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-5 w-5" />}
          title="No projects"
          description="All projects have been removed. New entries will appear here once an admin publishes them."
        />
      ) : (
        <>
          <LeaderboardTable rows={paginatedRows} onDelete={onDelete} />
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
