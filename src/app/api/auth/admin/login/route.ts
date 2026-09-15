import { jsonError, jsonOk } from "@/lib/api/response";
import { ensureAdminRole, isAllowlistedAdminEmail, toAdminSessionUser } from "@/lib/auth/admin";
import { getProfile } from "@/lib/auth/session";
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return jsonError(error?.message ?? "Invalid email or password", 401);
  }

  let profile = await getProfile(data.user.id);

  if (profile?.role !== "admin" && isAllowlistedAdminEmail(email)) {
    const promoted = await ensureAdminRole(data.user.id, email);
    if (promoted) {
      profile = { ...promoted, avatar_url: null };
    }
  }

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return jsonError("Access denied. This account does not have admin privileges.", 403);
  }

  return jsonOk({
    user: toAdminSessionUser(profile),
    redirectTo: "/admin",
  });
}
