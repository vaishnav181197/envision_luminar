import { jsonError, jsonOk } from "@/lib/api/response";
import {
  getCompetitionSettings,
  isCompetitionOpen,
  requireAdmin,
} from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

interface SettingsBody {
  votingEndTime?: string;
}

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

  const { votingEndTime } = body;
  if (!votingEndTime) {
    return jsonError("votingEndTime is required");
  }

  const parsed = new Date(votingEndTime);
  if (Number.isNaN(parsed.getTime())) {
    return jsonError("Please enter a valid date and time.");
  }

  if (parsed.getTime() <= Date.now()) {
    return jsonError("Deadline must be in the future while the competition is open.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({ voting_end_time: parsed.toISOString() })
    .eq("id", 1);

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ settings: { votingEndTime: parsed.toISOString() } });
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
    isOpen: isCompetitionOpen(settings.votingEndTime),
  });
}
