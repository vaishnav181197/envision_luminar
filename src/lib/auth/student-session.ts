import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const STUDENT_COOKIE = "envision_voter";
const MAX_AGE_SECONDS = 60 * 60 * 12;

export interface StudentSession {
  id: string;
  email: string;
  exp: number;
}

function secret(): string {
  const configured = process.env.STUDENT_SESSION_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "STUDENT_SESSION_SECRET is required in production for voting cookies.",
    );
  }

  // Local/dev only — never used when NODE_ENV=production.
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "envision-dev-student-secret"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeStudentSession(session: StudentSession): string {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function decodeStudentSession(token: string): StudentSession | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as StudentSession;
    if (!session.id || !session.email || session.exp < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const store = await cookies();
  const raw = store.get(STUDENT_COOKIE)?.value;
  if (!raw) return null;
  return decodeStudentSession(raw);
}

export async function requireStudentSession(): Promise<
  | { session: StudentSession; error: null }
  | { session: null; error: "Unauthorized" }
> {
  const session = await getStudentSession();
  if (!session) {
    return { session: null, error: "Unauthorized" };
  }
  return { session, error: null };
}

export async function setStudentSessionCookie(
  student: { id: string; email: string },
): Promise<void> {
  const store = await cookies();
  const value = encodeStudentSession({
    id: student.id,
    email: student.email,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
  });
  store.set(STUDENT_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearStudentSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(STUDENT_COOKIE);
}
