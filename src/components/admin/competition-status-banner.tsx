import { AlertTriangle, Info } from "lucide-react";

import { Alert } from "@/components/ui/alert";

export interface CompetitionStatusBannerProps {
  isOpen: boolean;
  isDeadlineNear: boolean;
  deadline: string;
}

export function CompetitionStatusBanner({
  isOpen,
  isDeadlineNear,
  deadline,
}: CompetitionStatusBannerProps) {
  const formattedDeadline = new Date(deadline).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (!isOpen) {
    return (
      <Alert variant="info" title="Competition closed">
        Voting and submissions ended on {formattedDeadline}. You can still review
        results and manage submissions from this dashboard.
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
