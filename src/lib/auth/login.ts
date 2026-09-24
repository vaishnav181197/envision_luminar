import {
  ensureAdminRole,
  isAllowlistedAdminEmail,
  toAdminSessionUser,
} from "@/lib/auth/admin";
import { getProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export type SessionUser = ReturnType<typeof toAdminSessionUser>;

export function defaultRedirectForRole(role: UserRole | string): string {
  return role === "admin" ? "/admin" : "/vote";
}

export function safePostLoginRedirect(
  requested: string | null | undefined,
  role: UserRole | string,
): string {
  const fallback = defaultRedirectForRole(role);
  if (
    !requested ||
    !requested.startsWith("/") ||
    requested.startsWith("//") ||
    requested.includes("://")
  ) {
    return fallback;
  }

  if (requested.startsWith("/admin") && role !== "admin") {
    return fallback;
  }

  // Admins never land on the student gallery.
  if (requested.startsWith("/gallery") && role === "admin") {
    return "/admin";
  }

  return requested;
}

export async function authenticateWithPassword(
  email: string,
  password: string,
): Promise<
  | { user: SessionUser; error: null }
  | { user: null; error: string; status: 401 | 500 }
> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      user: null,
      error: error?.message ?? "Invalid email or password",
      status: 401,
    };
  }

  let profile = await getProfile(data.user.id);

  if (profile?.role !== "admin" && isAllowlistedAdminEmail(email)) {
    const promoted = await ensureAdminRole(data.user.id, email);
    if (promoted) {
      profile = { ...promoted, avatar_url: null };
    }
  }

  if (!profile) {
    await supabase.auth.signOut();
    return {
      user: null,
      error: "Profile not found",
      status: 500,
    };
  }

  if (profile.role !== "admin") {
    await supabase.auth.signOut();
    return {
      user: null,
      error: "Admin credentials required",
      status: 401,
    };
  }

  return { user: toAdminSessionUser(profile), error: null };
}
