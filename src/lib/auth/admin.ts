import { createServiceClient } from "@/lib/supabase/service";
import type { UserRole } from "@/types/database";

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowlistedAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return getAdminEmails().includes(normalized);
}

interface ProfileRoleRow {
  id: string;
  email: string;
  role: UserRole;
  display_name: string | null;
  batch: string | null;
}

export async function ensureAdminRole(userId: string, email: string): Promise<ProfileRoleRow | null> {
  const service = createServiceClient();
  if (!service || !isAllowlistedAdminEmail(email)) {
    return null;
  }

  const { data, error } = await service
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId)
    .select("id, email, role, display_name, batch")
    .single();

  if (error || !data) {
    return null;
  }

  return data as ProfileRoleRow;
}

export function toAdminSessionUser(profile: ProfileRoleRow) {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.display_name ?? profile.email,
    role: profile.role,
    batch: profile.batch,
  };
}
