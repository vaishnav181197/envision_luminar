import { jsonError, jsonOk } from "@/lib/api/response";
import {
  authenticateWithPassword,
  safePostLoginRedirect,
} from "@/lib/auth/login";
import { clearStudentSessionCookie } from "@/lib/auth/student-session";

interface LoginBody {
  email?: string;
  password?: string;
  redirectTo?: string;
}

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return jsonError("Invalid request body");
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return jsonError("Email and password are required");
  }

  const result = await authenticateWithPassword(email, password);
  if (!result.user) {
    return jsonError(result.error, result.status);
  }

  // Admin sessions must not carry a student voting cookie.
  if (result.user.role === "admin") {
    await clearStudentSessionCookie();
  }

  return jsonOk({
    user: result.user,
    redirectTo: safePostLoginRedirect(body.redirectTo, result.user.role),
  });
}
