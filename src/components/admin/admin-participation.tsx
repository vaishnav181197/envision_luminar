"use client";

import { ClipboardList, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, StatCard } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/utils/format-date";
import type { VoterParticipationRow } from "@/types/admin";

export interface AdminParticipationProps {
  voted: VoterParticipationRow[];
  notVoted: VoterParticipationRow[];
  counts: { total: number; voted: number; notVoted: number };
  loading?: boolean;
}

function ParticipationTable({
  rows,
  showProject,
}: {
  rows: VoterParticipationRow[];
  showProject: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          {showProject && <TableHead>Project</TableHead>}
          {showProject && (
            <TableHead className="hidden sm:table-cell">Voted at</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium text-text-primary">
              {row.email}
            </TableCell>
            <TableCell>
              <Badge variant={row.hasVoted ? "success" : "outline"}>
                {row.hasVoted ? "Voted" : "Not voted"}
              </Badge>
            </TableCell>
            {showProject && (
              <TableCell className="text-text-secondary">
                {row.projectTitle ?? "—"}
              </TableCell>
            )}
            {showProject && (
              <TableCell className="hidden text-text-secondary sm:table-cell">
                {row.votedAt ? formatDateTime(row.votedAt) : "—"}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AdminParticipation({
  voted,
  notVoted,
  counts,
  loading,
}: AdminParticipationProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Participation
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          See which registered emails have placed a vote and which have not.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Registered voters"
          value={counts.total}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Voted"
          value={counts.voted}
          change={
            counts.total > 0
              ? `${Math.round((counts.voted / counts.total) * 100)}% of list`
              : "No voters yet"
          }
        />
        <StatCard
          label="Not voted"
          value={counts.notVoted}
          change={
            counts.total > 0
              ? `${Math.round((counts.notVoted / counts.total) * 100)}% remaining`
              : "No voters yet"
          }
        />
      </div>

      {loading ? (
        <div className="h-40 skeleton rounded-xl" />
      ) : counts.total === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title="No registered voters"
          description="Add or import emails under Voters to track participation."
        />
      ) : (
        <Card padding="none">
          <CardHeader className="border-b border-divider px-5 py-4">
            <CardTitle>Voter status</CardTitle>
            <CardDescription>
              Live view of vote completion across the eligible list.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <Tabs defaultValue="not-voted">
              <TabsList>
                <TabsTrigger value="not-voted">
                  Not voted ({counts.notVoted})
                </TabsTrigger>
                <TabsTrigger value="voted">Voted ({counts.voted})</TabsTrigger>
              </TabsList>
              <TabsContent value="not-voted" className="overflow-x-auto">
                {notVoted.length === 0 ? (
                  <p className="py-8 text-center text-sm text-text-muted">
                    Everyone on the list has voted.
                  </p>
                ) : (
                  <ParticipationTable rows={notVoted} showProject={false} />
                )}
              </TabsContent>
              <TabsContent value="voted" className="overflow-x-auto">
                {voted.length === 0 ? (
                  <p className="py-8 text-center text-sm text-text-muted">
                    No votes cast yet.
                  </p>
                ) : (
                  <ParticipationTable rows={voted} showProject />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
