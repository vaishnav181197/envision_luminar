"use client";

import { useState } from "react";
import { Pause, Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  isDeadlinePassed,
  votingStatusIndicator,
  votingStatusLabel,
} from "@/lib/competition/helpers";
import { cn } from "@/lib/utils/cn";
import type { CompetitionSettings, VotingStatus } from "@/types/admin";

export interface VotingControlsFormProps {
  settings: CompetitionSettings;
  onUpdateStatus: (
    votingStatus: VotingStatus,
  ) =>
    | { success: boolean; error?: string }
    | Promise<{ success: boolean; error?: string }>;
  className?: string;
}

export function VotingControlsForm({
  settings,
  onUpdateStatus,
  className,
}: VotingControlsFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<VotingStatus | null>(null);

  const run = async (status: VotingStatus) => {
    setLoading(status);
    setError(undefined);
    const result = await Promise.resolve(onUpdateStatus(status));
    setLoading(null);
    if (!result.success) {
      setError(result.error);
    }
  };

  const paused = settings.votingStatus === "paused";
  const stopped = settings.votingStatus === "stopped";
  const open = settings.votingStatus === "open";
  const needsFutureDeadline =
    stopped && isDeadlinePassed(settings.votingEndTime);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-primary">Voting controls</p>
          <p className="mt-0.5 text-sm text-text-secondary">
            Pause temporarily, or stop voting to lock results and show winners.
          </p>
        </div>
        <StatusIndicator
          status={votingStatusIndicator(settings)}
          label={votingStatusLabel(settings)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {open && (
          <Button
            type="button"
            variant="outline"
            loading={loading === "paused"}
            disabled={loading !== null}
            leftIcon={<Pause className="h-4 w-4" />}
            onClick={() => void run("paused")}
          >
            Pause voting
          </Button>
        )}

        {paused && (
          <Button
            type="button"
            loading={loading === "open"}
            disabled={loading !== null}
            leftIcon={<Play className="h-4 w-4" />}
            onClick={() => void run("open")}
          >
            Resume voting
          </Button>
        )}

        {!stopped && (
          <Button
            type="button"
            variant="destructive"
            loading={loading === "stopped"}
            disabled={loading !== null}
            leftIcon={<Square className="h-4 w-4" />}
            onClick={() => void run("stopped")}
          >
            Stop voting
          </Button>
        )}

        {stopped && (
          <Button
            type="button"
            loading={loading === "open"}
            disabled={loading !== null || needsFutureDeadline}
            leftIcon={<Play className="h-4 w-4" />}
            onClick={() => void run("open")}
          >
            Reopen voting
          </Button>
        )}
      </div>

      {needsFutureDeadline && (
        <p className="text-sm text-text-secondary">
          Save a future deadline below, then reopen voting.
        </p>
      )}

      {error && (
        <p className="text-sm text-error-500" role="alert">
          {error}
        </p>
      )}

      <ul className="space-y-1 text-xs text-text-tertiary">
        <li>
          <span className="font-medium text-text-secondary">Pause</span> — students
          cannot enter or vote; winners stay hidden. Resume anytime before the
          deadline.
        </li>
        <li>
          <span className="font-medium text-text-secondary">Stop</span> — ends
          voting now, shows winners. Reopen requires a future deadline.
        </li>
      </ul>
    </div>
  );
}
