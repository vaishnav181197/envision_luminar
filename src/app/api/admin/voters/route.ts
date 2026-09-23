import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, normalizeEmail } from "@/lib/voters/parse-emails";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eligible_students")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("eligible_students")) {
      return jsonOk({ voters: [] });
    }
    return jsonError(error.message, 500);
  }

  return jsonOk({
    voters: (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return jsonError("Invalid request body");
  }

  const email = normalizeEmail(body.email ?? "");
  if (!isValidEmail(email)) {
    return jsonError("Please enter a valid email address.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eligible_students")
    .insert({
      email,
      created_by: auth.user!.id,
    })
    .select("id, email, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return jsonError("That email is already on the voter list.", 409);
    }
    return jsonError(error.message, 500);
  }

  return jsonOk(
    {
      voter: {
        id: data.id,
        email: data.email,
        createdAt: data.created_at,
      },
    },
    201,
  );
}
