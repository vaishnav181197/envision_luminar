import { cn } from "@/lib/utils/cn";

export function Section({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 pb-16", className)}>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">{title}</h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function ComponentGrid({
  children,
  columns = 2,
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", colClass[columns])}>{children}</div>
  );
}

export function ShowcaseBox({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5", className)}>
      {label && (
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

export function ColorSwatch({
  name,
  variable,
  className,
}: {
  name: string;
  variable: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn("h-14 rounded-lg border border-border shadow-xs", className)}
        style={{ background: `var(${variable})` }}
      />
      <div>
        <p className="text-xs font-medium text-text-primary">{name}</p>
        <p className="font-mono text-[10px] text-text-muted">{variable}</p>
      </div>
    </div>
  );
}

export function TypeSample({
  label,
  className,
  sample = "The quick brown fox jumps over the lazy dog",
}: {
  label: string;
  className: string;
  sample?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-divider py-4 last:border-0">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <p className={className}>{sample}</p>
    </div>
  );
}
