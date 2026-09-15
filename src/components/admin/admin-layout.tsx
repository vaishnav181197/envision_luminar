"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  TableProperties,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { UserProfile } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";
import type { AdminTab } from "@/types/admin";

const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "submissions", label: "Submissions", icon: TableProperties },
  { id: "settings", label: "Settings", icon: Settings },
];

export interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export function AdminLayout({ activeTab, onTabChange, children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuth();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });

    addToast({
      title: "Logged out",
      description: "You have been signed out of the admin dashboard.",
      variant: "success",
    });

    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <Breadcrumbs items={[{ label: "Admin Dashboard", href: pathname }]} />
      </div>

      <div className="flex flex-col gap-8 pb-12 lg:flex-row">
        <aside className="w-full flex-shrink-0 lg:w-56">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Admin</p>
                <Badge variant="primary" className="mt-0.5">
                  Dashboard
                </Badge>
              </div>
            </div>

            <nav className="flex flex-col gap-0.5" aria-label="Admin navigation">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-text-secondary hover:bg-hover hover:text-text-primary",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-divider pt-4">
              {user && (
                <UserProfile
                  name={user.name}
                  email={user.email}
                  role={user.role}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                leftIcon={<LogOut className="h-4 w-4" />}
                onClick={handleLogout}
              >
                Log out
              </Button>
            </div>

            <Link
              href="/gallery"
              className="mt-4 block text-center text-xs text-text-muted transition-colors hover:text-primary-600"
            >
              View public gallery →
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
