import { createHash, randomInt, timingSafeEqual } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_GAP_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const DAILY_SEND_CAP = 8;

export function hashOtp(email: string, code: string): string {
  return createHash("sha256").update(`${email}:${code}`).digest("hex");
}

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function createOtpChallenge(
  email: string,
): Promise<{ code: string } | { error: string; status: number }> {
  const service = createServiceClient();
  if (!service) {
    return { error: "Server is not configured", status: 500 };
  }

  const { data: recent } = await service
    .from("otp_challenges")
    .select("created_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    recent &&
    Date.now() - new Date(recent.created_at).getTime() < RESEND_GAP_MS
  ) {
    return { error: "Please wait before requesting another code.", status: 429 };
  }

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const { count } = await service
    .from("otp_challenges")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", dayStart.toISOString());

  if ((count ?? 0) >= DAILY_SEND_CAP) {
    return {
      error: "Daily verification limit reached. Try again tomorrow.",
      status: 429,
    };
  }

  await service
    .from("otp_challenges")
    .update({ expires_at: new Date().toISOString() })
    .eq("email", email);

  const code = generateOtpCode();
  const { error } = await service.from("otp_challenges").insert({
    email,
    code_hash: hashOtp(email, code),
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    attempts: 0,
  });

  if (error) {
    return { error: error.message, status: 500 };
  }

  return { code };
}

export async function verifyOtpChallenge(
  email: string,
  code: string,
): Promise<{ ok: true } | { error: string; status: number }> {
  const service = createServiceClient();
  if (!service) {
    return { error: "Server is not configured", status: 500 };
  }

  const { data: challenge } = await service
    .from("otp_challenges")
    .select("id, code_hash, expires_at, attempts")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!challenge) {
    return { error: "No verification code found. Request a new one.", status: 400 };
  }

  if (new Date(challenge.expires_at).getTime() <= Date.now()) {
    await service.from("otp_challenges").delete().eq("id", challenge.id);
    return { error: "That code has expired. Request a new one.", status: 400 };
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    await service.from("otp_challenges").delete().eq("id", challenge.id);
    return { error: "Too many attempts. Request a new code.", status: 429 };
  }

  if (!hashesMatch(challenge.code_hash, hashOtp(email, code.trim()))) {
    await service
      .from("otp_challenges")
      .update({ attempts: challenge.attempts + 1 })
      .eq("id", challenge.id);
    return { error: "Invalid verification code.", status: 400 };
  }

  await service.from("otp_challenges").delete().eq("email", email);
  return { ok: true };
}
