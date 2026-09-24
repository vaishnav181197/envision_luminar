"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  LogOut,
  Shield,
  Vote,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { useCompetition } from "@/contexts/competition-context";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useAuth } from "@/hooks/use-auth";
import {
  votingStatusIndicator,
  votingStatusLabel,
} from "@/lib/competition/helpers";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOpen, settings } = useCompetition();
  const { isAdmin, isVoter, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const isAdminRoute = pathname.startsWith("/admin");
  const isGalleryRoute = pathname.startsWith("/gallery");

  // Project Gallery is student-only chrome — never on admin routes or for admin Auth.
  const showGalleryNav = !loading && isVoter && !isAdmin && !isAdminRoute;
  const showAdminNav = !loading && isAdmin;
  const showEnterVoting =
    !loading && !isAdmin && !isVoter && !isAdminRoute && isOpen;
  const showStudentLogout = !loading && isVoter && !isAdmin;

  const handleStudentLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/vote");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-text-primary">
              Envision
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {showGalleryNav && (
              <Link
                href="/gallery"
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isGalleryRoute
                    ? "bg-primary-50 text-primary-700"
                    : "text-text-secondary hover:bg-hover hover:text-text-primary",
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Project Gallery
              </Link>
            )}
            {showAdminNav && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isAdminRoute
                    ? "bg-primary-50 text-primary-700"
                    : "text-text-secondary hover:bg-hover hover:text-text-primary",
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <StatusIndicator
            status={votingStatusIndicator(settings)}
            label={votingStatusLabel(settings)}
            className="hidden sm:inline-flex"
          />
          {showEnterVoting && (
            <Link
              href="/vote"
              className="hidden h-8 items-center gap-1.5 rounded-md bg-primary-600 px-3 text-sm font-medium text-text-inverse shadow-sm transition-colors hover:bg-primary-700 sm:inline-flex"
            >
              <Vote className="h-3.5 w-3.5" />
              Enter voting
            </Link>
          )}
          {showStudentLogout && (
            <Button
              variant="outline"
              size="sm"
              loading={loggingOut}
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
              onClick={() => void handleStudentLogout()}
            >
              Log out
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-divider px-4 py-3 md:hidden animate-fade-in"
          aria-label="Mobile"
        >
          {showGalleryNav && (
            <Link
              href="/gallery"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-hover"
            >
              <LayoutGrid className="h-4 w-4" />
              Project Gallery
            </Link>
          )}
          {showAdminNav && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-hover"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
          {showEnterVoting && (
            <Link
              href="/vote"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-hover"
            >
              <Vote className="h-4 w-4" />
              Enter voting
            </Link>
          )}
          {showStudentLogout && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 w-full justify-start"
              loading={loggingOut}
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={() => void handleStudentLogout()}
            >
              Log out
            </Button>
          )}
        </nav>
      )}
    </header>
  );
}
