import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, display_name, batch, avatar_url")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) return { user: null, profile: null, error: "Unauthorized" as const };

  const profile = await getProfile(user.id);
  if (!profile) return { user, profile: null, error: "Profile not found" as const };

  return { user, profile, error: null };
}

export async function requireAdmin() {
  const auth = await requireAuth();
  if (auth.error) return { ...auth, error: auth.error };

  if (auth.profile?.role !== "admin") {
    return { ...auth, error: "Forbidden" as const };
  }

  return auth;
}

export async function getCompetitionSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("voting_end_time")
    .eq("id", 1)
    .single();

  if (error || !data) return null;
  return { votingEndTime: data.voting_end_time };
}

export function isCompetitionOpen(votingEndTime: string) {
  return new Date(votingEndTime).getTime() > Date.now();
}
