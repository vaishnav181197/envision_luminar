import { cn } from "@/lib/utils/cn";
import type { AlertVariant } from "@/types/ui";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantConfig: Record<
  AlertVariant,
  { container: string; icon: React.ReactNode }
> = {
  info: {
    container: "border-info-500/20 bg-info-50 text-info-600",
    icon: <Info className="h-4 w-4 text-info-500" />,
  },
  success: {
    container: "border-success-500/20 bg-success-50 text-success-700",
    icon: <CheckCircle2 className="h-4 w-4 text-success-500" />,
  },
  warning: {
    container: "border-warning-500/20 bg-warning-50 text-warning-600",
    icon: <AlertTriangle className="h-4 w-4 text-warning-500" />,
  },
  error: {
    container: "border-error-500/20 bg-error-50 text-error-700",
    icon: <AlertCircle className="h-4 w-4 text-error-500" />,
  },
};

export function Alert({
  className,
  variant = "info",
  title,
  children,
  dismissible,
  onDismiss,
  ...props
}: AlertProps) {
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border p-4",
        config.container,
        className,
      )}
      {...props}
    >
      <div className="mt-0.5 flex-shrink-0">{config.icon}</div>
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {children && (
          <div className={cn("text-sm opacity-90", title && "mt-1")}>{children}</div>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
