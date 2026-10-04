import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const STUDENT_COOKIE = "envision_voter";
/** Absolute expiry encoded in the signed payload (browser session may end sooner). */
const SESSION_TTL_MS = 60 * 60 * 12 * 1000;

export interface StudentSession {
  id: string;
  email: string;
  exp: number;
}

export interface StudentCookieOptions {
  /** When true, cookie is marked Secure (HTTPS only). */
  secure: boolean;
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

/** Prefer forwarded proto (Vercel/proxies), then the request URL. */
export function requestIsHttps(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim().toLowerCase() === "https";
  }
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

function buildSessionValue(student: { id: string; email: string }): string {
  return encodeStudentSession({
    id: student.id,
    email: student.email,
    exp: Date.now() + SESSION_TTL_MS,
  });
}

/** Browser session cookie: no maxAge/expires so it clears when the browser closes. */
function cookieBaseOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
  };
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

/** Attach voting cookie on the same NextResponse that is returned to the client. */
export function applyStudentSessionCookie(
  response: NextResponse,
  student: { id: string; email: string },
  options: StudentCookieOptions,
): void {
  response.cookies.set(
    STUDENT_COOKIE,
    buildSessionValue(student),
    cookieBaseOptions(options.secure),
  );
}

export async function setStudentSessionCookie(
  student: { id: string; email: string },
  options?: Partial<StudentCookieOptions>,
): Promise<void> {
  const store = await cookies();
  store.set(STUDENT_COOKIE, buildSessionValue(student), {
    ...cookieBaseOptions(options?.secure ?? process.env.NODE_ENV === "production"),
  });
}

export async function clearStudentSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(STUDENT_COOKIE);
}

export function clearStudentSessionCookieOnResponse(response: NextResponse): void {
  response.cookies.set(STUDENT_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
