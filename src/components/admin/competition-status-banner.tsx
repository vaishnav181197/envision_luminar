import { AlertTriangle, Info, Pause } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import {
  isCompetitionPaused,
} from "@/lib/competition/helpers";
import { formatDateTime } from "@/lib/utils/format-date";
import type { CompetitionSettings } from "@/types/admin";

export interface CompetitionStatusBannerProps {
  settings: CompetitionSettings;
  isOpen: boolean;
  isDeadlineNear: boolean;
}

export function CompetitionStatusBanner({
  settings,
  isOpen,
  isDeadlineNear,
}: CompetitionStatusBannerProps) {
  const formattedDeadline = formatDateTime(settings.votingEndTime);

  if (isCompetitionPaused(settings)) {
    return (
      <Alert variant="warning" title="Voting paused">
        <span className="inline-flex items-center gap-1.5">
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          Students cannot enter or cast votes until you resume. Deadline remains{" "}
          {formattedDeadline}.
        </span>
      </Alert>
    );
  }

  if (settings.votingStatus === "stopped") {
    return (
      <Alert variant="info" title="Voting stopped">
        Voting was ended by an admin. Winners are visible to students in the
        gallery and on the leaderboard. Set a future deadline and reopen to
        accept votes again.
      </Alert>
    );
  }

  if (!isOpen) {
    return (
      <Alert variant="info" title="Competition closed">
        Voting and entry ended on {formattedDeadline}. You can still review
        results and manage projects from this dashboard.
      </Alert>
    );
  }

  if (isDeadlineNear) {
    return (
      <Alert variant="warning" title="Deadline approaching">
        Voting closes on {formattedDeadline}. Consider notifying participants before
        the deadline.
      </Alert>
    );
  }

  return (
    <Alert variant="info" title="Competition active">
      <span className="inline-flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
        Voting is open until {formattedDeadline}.
      </span>
    </Alert>
  );
}

export function CompetitionClosedBanner() {
  return (
    <Alert variant="warning" title="Deadline passed">
      <span className="inline-flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        The selected deadline is in the past. Submissions and voting will appear closed
        across the platform.
      </span>
    </Alert>
  );
}
