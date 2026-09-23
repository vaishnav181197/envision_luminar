import { jsonError, jsonOk } from "@/lib/api/response";
import { authenticateWithPassword, defaultRedirectForRole } from "@/lib/auth/login";
import { createClient } from "@/lib/supabase/server";

interface AdminLoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  let body: AdminLoginBody;

  try {
    body = (await request.json()) as AdminLoginBody;
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

  if (result.user.role !== "admin") {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return jsonError(
      "Access denied. This account does not have admin privileges.",
      403,
    );
  }

  return jsonOk({
    user: result.user,
    redirectTo: defaultRedirectForRole("admin"),
  });
}
