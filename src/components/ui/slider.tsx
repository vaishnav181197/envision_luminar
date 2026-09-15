"use client";

import { forwardRef, useCallback } from "react";

import { cn } from "@/lib/utils/cn";

export interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  onValueChange?: (value: number) => void;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      showValue = true,
      formatValue = (v) => String(v),
      min = 0,
      max = 100,
      value,
      defaultValue,
      onValueChange,
      id,
      ...props
    },
    ref,
  ) => {
    const sliderId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const displayValue = value ?? defaultValue ?? min;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange?.(Number(e.target.value));
      },
      [onValueChange],
    );

    const percent =
      ((Number(displayValue) - Number(min)) / (Number(max) - Number(min))) * 100;

    return (
      <div className={cn("flex w-full flex-col gap-2", className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label htmlFor={sliderId} className="text-sm font-medium text-text-primary">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm tabular-nums text-text-secondary">
                {formatValue(Number(displayValue))}
              </span>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="range"
            id={sliderId}
            min={min}
            max={max}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            className={cn(
              "h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow-md",
              "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
              "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
              "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
              "[&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:shadow-md",
            )}
            style={{
              background: `linear-gradient(to right, var(--primary-600) ${percent}%, var(--neutral-200) ${percent}%)`,
            }}
            {...props}
          />
        </div>
      </div>
    );
  },
);

Slider.displayName = "Slider";
