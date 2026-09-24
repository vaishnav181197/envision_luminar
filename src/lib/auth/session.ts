import type { CompetitionSettings } from "@/types/admin";
import type { VotingStatus } from "@/types/database";
import {
  isCompetitionOpen,
  isCompetitionPaused,
} from "@/lib/competition/helpers";
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

function mapSettings(row: {
  voting_end_time: string;
  voting_status?: VotingStatus | null;
}): CompetitionSettings {
  return {
    votingEndTime: row.voting_end_time,
    votingStatus: row.voting_status ?? "open",
  };
}

export async function getCompetitionSettings(): Promise<CompetitionSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("voting_end_time, voting_status")
    .eq("id", 1)
    .single();

  if (error || !data) {
    // Fallback if migration 006 is not applied yet.
    const legacy = await supabase
      .from("settings")
      .select("voting_end_time")
      .eq("id", 1)
      .single();
    if (legacy.error || !legacy.data) return null;
    return mapSettings(legacy.data);
  }

  return mapSettings(data);
}

export { isCompetitionOpen } from "@/lib/competition/helpers";

export async function requireCompetitionOpen(closedMessage: string): Promise<
  | { settings: CompetitionSettings; error: null; status: null }
  | { settings: null; error: string; status: 403 | 500 }
> {
  const settings = await getCompetitionSettings();
  if (!settings) {
    return {
      settings: null,
      error: "Competition settings not found",
      status: 500,
    };
  }

  if (isCompetitionPaused(settings)) {
    return { settings: null, error: "Voting is paused", status: 403 };
  }

  if (!isCompetitionOpen(settings)) {
    return { settings: null, error: closedMessage, status: 403 };
  }

  return { settings, error: null, status: null };
}
