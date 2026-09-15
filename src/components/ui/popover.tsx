"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

export function Popover({
  trigger,
  children,
  align = "center",
  className,
}: PopoverProps) {
  const [open, setOpen] = useState(false);

  const alignStyles = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className={cn(
              "absolute top-full z-50 mt-2 min-w-[200px] rounded-xl border border-border bg-surface p-3 shadow-lg",
              "animate-scale-in",
              alignStyles[align],
              className,
            )}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <span
      data-tooltip={content}
      className={cn("inline-flex", side === "bottom" && "[&::after]:bottom-auto [&::after]:top-[calc(100%+6px)]")}
    >
      {children}
    </span>
  );
}
