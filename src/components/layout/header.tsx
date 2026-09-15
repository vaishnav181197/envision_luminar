"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Palette,
  Shield,
  Trophy,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { useCompetition } from "@/contexts/competition-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/design-system", label: "Design System", icon: Palette },
  { href: "/gallery", label: "Project Gallery", icon: LayoutGrid },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOpen } = useCompetition();
  const { isAdmin } = useAuth();
  const isAdminRoute = pathname.startsWith("/admin");

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-text-primary">
              ELEVATE
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {visibleNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-text-secondary hover:bg-hover hover:text-text-primary",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.href === "/admin" && isAdminRoute && (
                    <Badge variant="primary" className="ml-0.5 px-1.5 py-0 text-[10px]">
                      Admin
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <StatusIndicator
            status={isOpen ? "open" : "closed"}
            label={isOpen ? "Voting Open" : "Voting Closed"}
            className="hidden sm:inline-flex"
          />
          <Button variant="primary" size="sm" className="hidden sm:inline-flex">
            <Trophy className="h-3.5 w-3.5" />
            Submit Project
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-divider px-4 py-3 md:hidden animate-fade-in">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-hover"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
