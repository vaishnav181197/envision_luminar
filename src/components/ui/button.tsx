import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { ButtonProps } from "@/types/ui";

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary-600 text-text-inverse shadow-sm hover:bg-primary-700 active:bg-primary-800 disabled:bg-neutral-300 disabled:text-neutral-500",
  secondary:
    "bg-secondary-100 text-secondary-800 hover:bg-secondary-200 active:bg-secondary-300 disabled:bg-neutral-100 disabled:text-neutral-400",
  outline:
    "border border-border bg-surface text-text-primary hover:bg-hover active:bg-active disabled:border-neutral-200 disabled:text-neutral-400",
  ghost:
    "text-text-secondary hover:bg-hover hover:text-text-primary active:bg-active disabled:text-neutral-400",
  destructive:
    "bg-error-500 text-text-inverse shadow-sm hover:bg-error-600 active:bg-error-700 disabled:bg-neutral-300 disabled:text-neutral-500",
  link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 disabled:text-neutral-400",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs: "h-7 px-2.5 text-xs gap-1 rounded-md",
  sm: "h-8 px-3 text-sm gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-base gap-2 rounded-lg",
  icon: "h-10 w-10 p-0 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:shadow-none",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
