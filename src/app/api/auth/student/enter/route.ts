import { jsonError, jsonOk } from "@/lib/api/response";
import { createOtpChallenge } from "@/lib/auth/otp";
import { requireCompetitionOpen } from "@/lib/auth/session";
import { sendOtpEmail } from "@/lib/mail/send-otp";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidEmail, normalizeEmail } from "@/lib/voters/parse-emails";

interface EnterBody {
  email?: string;
}

export async function POST(request: Request) {
  const deadline = await requireCompetitionOpen("Voting is closed");
  if (deadline.error) {
    return jsonError(deadline.error, deadline.status);
  }

  let body: EnterBody;
  try {
    body = (await request.json()) as EnterBody;
  } catch {
    return jsonError("Invalid request body");
  }

  const email = normalizeEmail(body.email ?? "");
  if (!isValidEmail(email)) {
    return jsonError("Please enter a valid email address.");
  }

  const service = createServiceClient();
  if (!service) {
    return jsonError("Server is not configured", 500);
  }

  const { data: student, error } = await service
    .from("eligible_students")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return jsonError(error.message, 500);
  }

  if (!student) {
    return jsonError("This email is not registered for voting.", 403);
  }

  const challenge = await createOtpChallenge(email);
  if ("error" in challenge) {
    return jsonError(challenge.error, challenge.status);
  }

  const mailed = await sendOtpEmail(email, challenge.code);
  if (mailed.error) {
    await service.from("otp_challenges").delete().eq("email", email);
    return jsonError(mailed.error, 500);
  }

  return jsonOk({
    sent: true,
    provider: mailed.provider,
    // Helps local testing when Resend is not configured.
    ...(mailed.provider === "console" ? { devHint: "Code logged on the server console" } : {}),
  });
}
