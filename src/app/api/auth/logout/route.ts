import { jsonOk } from "@/lib/api/response";
import { clearStudentSessionCookie } from "@/lib/auth/student-session";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearStudentSessionCookie();
  return jsonOk({ success: true });
}
