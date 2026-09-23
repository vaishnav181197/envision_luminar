import { ExternalLink, Pencil, Trash2, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeaderboardRow } from "@/types/admin";
import { formatShortDate } from "@/lib/utils/format-date";

export interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  onDelete?: (id: string, title: string) => void;
  onEdit?: (id: string) => void;
  compact?: boolean;
}

export function LeaderboardTable({
  rows,
  onDelete,
  onEdit,
  compact = false,
}: LeaderboardTableProps) {
  const showActions = Boolean(onDelete || onEdit);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Project</TableHead>
          <TableHead className="text-right">Votes</TableHead>
          {!compact && (
            <TableHead className="hidden lg:table-cell">Submitted</TableHead>
          )}
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const showTrophy = row.isWinner ?? false;

          return (
            <TableRow key={row.id}>
              <TableCell>
                <Badge variant={showTrophy ? "warning" : "outline"}>
                  {showTrophy ? (
                    <span className="inline-flex items-center gap-1">
                      <Trophy className="h-3 w-3" />#{row.rank}
                    </span>
                  ) : (
                    `#${row.rank}`
                  )}
                </Badge>
              </TableCell>
              <TableCell>
                <p className="font-medium text-text-primary">{row.title}</p>
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {row.votes}
              </TableCell>
              {!compact && (
                <TableCell className="hidden text-text-secondary lg:table-cell">
                  {formatShortDate(row.submittedAt)}
                </TableCell>
              )}
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <a
                      href={row.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View demo for ${row.title}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(row.id)}
                        aria-label={`Edit ${row.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-error-600 hover:bg-error-50 hover:text-error-700"
                        onClick={() => onDelete(row.id, row.title)}
                        aria-label={`Delete ${row.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
