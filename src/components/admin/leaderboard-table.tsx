import { ExternalLink, Trash2, Trophy } from "lucide-react";

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

export interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  onDelete?: (id: string, title: string) => void;
  compact?: boolean;
  showBatch?: boolean;
}

function AuthorCell({
  row,
  showBatch,
}: {
  row: LeaderboardRow;
  showBatch: boolean;
}) {
  return (
    <div>
      <p className="font-medium text-text-primary">{row.author}</p>
      {showBatch && (
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="font-normal">
            Batch {row.batch}
          </Badge>
        </div>
      )}
      <p className="mt-1 text-xs text-text-muted">{row.authorEmail}</p>
    </div>
  );
}

export function LeaderboardTable({
  rows,
  onDelete,
  compact = false,
  showBatch = false,
}: LeaderboardTableProps) {
  const displayBatch = showBatch || !compact;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Project</TableHead>
          {!compact && (
            <TableHead className="hidden md:table-cell">
              {displayBatch ? "Student" : "Author"}
            </TableHead>
          )}
          <TableHead className="text-right">Votes</TableHead>
          {!compact && (
            <TableHead className="hidden lg:table-cell">Submitted</TableHead>
          )}
          {onDelete && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Badge variant={row.rank === 1 ? "warning" : "outline"}>
                {row.rank === 1 ? (
                  <span className="inline-flex items-center gap-1">
                    <Trophy className="h-3 w-3" />#{row.rank}
                  </span>
                ) : (
                  `#${row.rank}`
                )}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="min-w-[140px]">
                <p className="font-medium text-text-primary">{row.title}</p>
                {compact && (
                  <div className="mt-0.5 space-y-1">
                    <p className="text-xs text-text-muted">{row.author}</p>
                    {displayBatch && (
                      <Badge variant="secondary" className="font-normal">
                        Batch {row.batch}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </TableCell>
            {!compact && (
              <TableCell className="hidden md:table-cell">
                <AuthorCell row={row} showBatch={displayBatch} />
              </TableCell>
            )}
            <TableCell className="text-right font-semibold tabular-nums">
              {row.votes}
            </TableCell>
            {!compact && (
              <TableCell className="hidden text-text-secondary lg:table-cell">
                {new Date(row.submittedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
            )}
            {onDelete && (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-error-600 hover:bg-error-50 hover:text-error-700"
                    onClick={() => onDelete(row.id, row.title)}
                    aria-label={`Delete ${row.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
