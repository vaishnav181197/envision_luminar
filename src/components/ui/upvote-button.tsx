"use client";

import { forwardRef, useCallback, useState } from "react";
import { ChevronUp, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface UpvoteButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  count: number;
  voted?: boolean;
  loading?: boolean;
  onUpvote?: (voted: boolean) => void | Promise<void>;
}

export const UpvoteButton = forwardRef<HTMLButtonElement, UpvoteButtonProps>(
  (
    {
      count,
      voted = false,
      loading = false,
      disabled,
      onUpvote,
      className,
      ...props
    },
    ref,
  ) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const isDisabled = disabled || loading;

    const handleClick = useCallback(async () => {
      if (isDisabled) return;
      setIsAnimating(true);
      await onUpvote?.(!voted);
      setTimeout(() => setIsAnimating(false), 300);
    }, [isDisabled, onUpvote, voted]);

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        aria-pressed={voted}
        aria-label={voted ? "Remove upvote" : "Upvote project"}
        className={cn(
          "group inline-flex flex-col items-center justify-center gap-0.5",
          "min-w-[3.25rem] rounded-xl border px-3 py-2",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2",
          voted
            ? "border-primary-200 bg-primary-50 text-primary-700 shadow-glow hover:bg-primary-100"
            : "border-border bg-surface text-text-secondary hover:border-primary-200 hover:bg-hover hover:text-primary-600",
          isDisabled && "cursor-not-allowed opacity-50",
          isAnimating && "[animation:upvote-pop_0.3s_ease-out]",
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronUp
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              voted && "text-primary-600",
              !isDisabled && "group-hover:-translate-y-0.5",
            )}
            strokeWidth={2.5}
          />
        )}
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            voted ? "text-primary-700" : "text-text-secondary",
          )}
        >
          {count}
        </span>
      </button>
    );
  },
);

UpvoteButton.displayName = "UpvoteButton";
