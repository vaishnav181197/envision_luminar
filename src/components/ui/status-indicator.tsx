import { cn } from "@/lib/utils/cn";

export interface StatusIndicatorProps {
  status: "open" | "closed" | "pending" | "active" | "inactive";
  label?: string;
  showDot?: boolean;
  className?: string;
}

const statusConfig = {
  open: { dot: "bg-success-500", text: "text-success-700", bg: "bg-success-50", label: "Open" },
  closed: { dot: "bg-neutral-400", text: "text-neutral-600", bg: "bg-neutral-100", label: "Closed" },
  pending: { dot: "bg-warning-500", text: "text-warning-600", bg: "bg-warning-50", label: "Pending" },
  active: { dot: "bg-success-500 animate-pulse", text: "text-success-700", bg: "bg-success-50", label: "Active" },
  inactive: { dot: "bg-neutral-300", text: "text-neutral-500", bg: "bg-neutral-50", label: "Inactive" },
};

export function StatusIndicator({
  status,
  label,
  showDot = true,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const displayLabel = label ?? config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bg,
        config.text,
        className,
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} aria-hidden="true" />
      )}
      {displayLabel}
    </span>
  );
}
