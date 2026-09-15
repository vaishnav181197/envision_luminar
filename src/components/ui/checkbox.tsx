import { forwardRef } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "group/checkbox flex cursor-pointer items-start gap-3",
          props.disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded border border-border bg-surface",
              "transition-all duration-200",
              "group-hover/checkbox:border-primary-300 group-has-[:checked]/checkbox:border-primary-600 group-has-[:checked]/checkbox:bg-primary-600",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus-ring",
              props.disabled && "border-neutral-200 bg-neutral-100",
            )}
          >
            <Check
              className="h-3 w-3 text-white opacity-0 transition-opacity group-has-[:checked]/checkbox:opacity-100"
              strokeWidth={3}
              aria-hidden="true"
            />
          </div>
        </div>
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
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
