"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
}

export interface SidebarProps {
  title: string;
  items: SidebarItem[];
  className?: string;
}

export function Sidebar({ title, items, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-20 hidden h-[calc(100vh-5rem)] w-56 flex-shrink-0 overflow-y-auto lg:block",
        className,
      )}
    >
      <div className="pb-8">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </p>
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const isActive = item.href ? pathname === item.href : false;
            const Component = item.href ? Link : "a";

            return (
              <Component
                key={item.id}
                href={item.href ?? `#${item.id}`}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary-50 font-medium text-primary-700"
                    : "text-text-secondary hover:bg-hover hover:text-text-primary",
                )}
              >
                {item.label}
              </Component>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export interface DesignSystemLayoutProps {
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
}

export function DesignSystemLayout({
  sidebarItems,
  children,
}: DesignSystemLayoutProps) {
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
      <Sidebar title="Components" items={sidebarItems} />
      <main className="min-w-0 flex-1 py-8">{children}</main>
    </div>
  );
}
