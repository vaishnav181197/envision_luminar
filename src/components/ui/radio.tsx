import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const radioId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={radioId}
        className={cn(
          "group flex cursor-pointer items-start gap-3",
          props.disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-4 w-4 rounded-full border border-border bg-surface",
              "transition-all duration-200",
              "peer-hover:border-primary-300 peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring",
              "peer-checked:border-primary-600 peer-checked:border-[5px]",
              "peer-disabled:border-neutral-200 peer-disabled:bg-neutral-100",
            )}
          />
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

Radio.displayName = "Radio";

export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  className?: string;
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)} role="radiogroup">
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          description={option.description}
          checked={value === option.value}
          onChange={() => onChange?.(option.value)}
        />
      ))}
    </div>
  );
}
