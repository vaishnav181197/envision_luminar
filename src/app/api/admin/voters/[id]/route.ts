import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("eligible_students").delete().eq("id", id);

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ success: true });
}
