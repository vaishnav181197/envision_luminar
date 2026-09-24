import { jsonError, jsonOk } from "@/lib/api/response";
import {
  getCompetitionSettings,
  requireAdmin,
} from "@/lib/auth/session";
import {
  isCompetitionOpen,
  isDeadlinePassed,
} from "@/lib/competition/helpers";
import { createClient } from "@/lib/supabase/server";
import type { CompetitionSettings, VotingStatus } from "@/types/admin";

interface SettingsBody {
  votingEndTime?: string;
  votingStatus?: VotingStatus;
}

const VALID_STATUSES: VotingStatus[] = ["open", "paused", "stopped"];

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  let body: SettingsBody;
  try {
    body = (await request.json()) as SettingsBody;
  } catch {
    return jsonError("Invalid request body");
  }

  const current = await getCompetitionSettings();
  if (!current) {
    return jsonError("Competition settings not found", 500);
  }

  const updates: {
    voting_end_time?: string;
    voting_status?: VotingStatus;
  } = {};

  if (body.votingStatus !== undefined) {
    if (!VALID_STATUSES.includes(body.votingStatus)) {
      return jsonError("votingStatus must be open, paused, or stopped.");
    }
    updates.voting_status = body.votingStatus;

    if (body.votingStatus === "stopped") {
      updates.voting_end_time = new Date().toISOString();
    }

    if (body.votingStatus === "open") {
      const deadline = body.votingEndTime
        ? new Date(body.votingEndTime)
        : new Date(current.votingEndTime);
      if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) {
        return jsonError(
          "Set a future voting deadline before resuming open voting.",
        );
      }
      if (body.votingEndTime) {
        updates.voting_end_time = deadline.toISOString();
      }
    }
  }

  if (body.votingEndTime !== undefined && body.votingStatus !== "stopped") {
    const parsed = new Date(body.votingEndTime);
    if (Number.isNaN(parsed.getTime())) {
      return jsonError("Please enter a valid date and time.");
    }

    const nextStatus = updates.voting_status ?? current.votingStatus;
    if (nextStatus === "open" && parsed.getTime() <= Date.now()) {
      return jsonError(
        "Deadline must be in the future while the competition is open.",
      );
    }

    updates.voting_end_time = parsed.toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return jsonError("Provide votingEndTime and/or votingStatus.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .update(updates)
    .eq("id", 1)
    .select("voting_end_time, voting_status")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  const settings: CompetitionSettings = {
    votingEndTime: data.voting_end_time,
    votingStatus: (data.voting_status as VotingStatus | null) ?? "open",
  };

  return jsonOk({
    settings,
    isOpen: isCompetitionOpen(settings),
    isPaused: settings.votingStatus === "paused" && !isDeadlinePassed(settings.votingEndTime),
  });
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  const settings = await getCompetitionSettings();
  if (!settings) {
    return jsonError("Competition settings not found", 500);
  }

  return jsonOk({
    settings,
    isOpen: isCompetitionOpen(settings),
    isPaused: settings.votingStatus === "paused" && !isDeadlinePassed(settings.votingEndTime),
  });
}
