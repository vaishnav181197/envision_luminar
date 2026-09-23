import { jsonError, jsonOk } from "@/lib/api/response";
import { verifyOtpChallenge } from "@/lib/auth/otp";
import { setStudentSessionCookie } from "@/lib/auth/student-session";
import { requireCompetitionOpen } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidEmail, normalizeEmail } from "@/lib/voters/parse-emails";

interface VerifyBody {
  email?: string;
  code?: string;
}

export async function POST(request: Request) {
  const deadline = await requireCompetitionOpen("Voting is closed");
  if (deadline.error) {
    return jsonError(deadline.error, deadline.status);
  }

  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return jsonError("Invalid request body");
  }

  const email = normalizeEmail(body.email ?? "");
  const code = (body.code ?? "").trim();

  if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
    return jsonError("Enter the email and the 6-digit code.");
  }

  const verified = await verifyOtpChallenge(email, code);
  if ("error" in verified) {
    return jsonError(verified.error, verified.status);
  }

  const service = createServiceClient();
  if (!service) {
    return jsonError("Server is not configured", 500);
  }

  const { data: student } = await service
    .from("eligible_students")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  if (!student) {
    return jsonError("This email is not registered for voting.", 403);
  }

  await setStudentSessionCookie(student);
  return jsonOk({ ok: true, redirectTo: "/gallery" });
}
