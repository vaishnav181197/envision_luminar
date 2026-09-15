import { jsonError, jsonOk } from "@/lib/api/response";
import { toAdminSessionUser } from "@/lib/auth/admin";
import { requireAdmin } from "@/lib/auth/session";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  return jsonOk({
    user: toAdminSessionUser(auth.profile!),
  });
}
