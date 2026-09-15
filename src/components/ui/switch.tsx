"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const switchId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={switchId}
        className={cn(
          "group flex cursor-pointer items-center justify-between gap-4",
          props.disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <span className="text-sm font-medium text-text-primary">{label}</span>
            )}
            {description && (
              <span className="text-xs text-text-muted">{description}</span>
            )}
          </div>
        )}
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={switchId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-6 w-11 rounded-full bg-neutral-200 transition-colors duration-200",
              "peer-hover:bg-neutral-300",
              "peer-checked:bg-primary-600 peer-checked:peer-hover:bg-primary-700",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring peer-focus-visible:ring-offset-2",
              "peer-disabled:bg-neutral-100",
            )}
          />
          <div
            className={cn(
              "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm",
              "transition-transform duration-200 ease-out",
              "peer-checked:translate-x-5",
            )}
          />
        </div>
      </label>
    );
  },
);

Switch.displayName = "Switch";
