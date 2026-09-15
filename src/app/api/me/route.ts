import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) {
    return jsonError(auth.error, 401);
  }

  return jsonOk({
    user: {
      id: auth.user!.id,
      email: auth.profile!.email,
      name: auth.profile!.display_name ?? auth.profile!.email,
      role: auth.profile!.role,
      batch: auth.profile!.batch,
    },
  });
}
