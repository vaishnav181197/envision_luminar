import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { extractEmailsFromCsv, extractEmailsFromText } from "@/lib/voters/parse-emails";

function parseSpreadsheetEmails(filename: string, buffer: Buffer): string[] {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".txt")) {
    return extractEmailsFromCsv(buffer.toString("utf8"));
  }

  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    try {
      // Lazy require keeps the route usable if the optional parser is missing.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const xlsx = require("xlsx") as {
        read: (data: Buffer, opts: { type: string }) => { SheetNames: string[]; Sheets: Record<string, unknown> };
        utils: { sheet_to_csv: (sheet: unknown) => string };
      };
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const emails = new Set<string>();
      for (const name of workbook.SheetNames) {
        const csv = xlsx.utils.sheet_to_csv(workbook.Sheets[name]);
        for (const email of extractEmailsFromCsv(csv)) {
          emails.add(email);
        }
      }
      return [...emails];
    } catch {
      return extractEmailsFromText(buffer.toString("utf8"));
    }
  }

  return extractEmailsFromCsv(buffer.toString("utf8"));
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("Upload a CSV or Excel file of email addresses.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const emails = parseSpreadsheetEmails(file.name, buffer);

  if (emails.length === 0) {
    return jsonError("No valid email addresses were found in that file.");
  }

  const supabase = await createClient();
  const rows = emails.map((email) => ({
    email,
    created_by: auth.user!.id,
  }));

  const { data, error } = await supabase
    .from("eligible_students")
    .upsert(rows, { onConflict: "email", ignoreDuplicates: true })
    .select("id, email, created_at");

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({
    imported: data?.length ?? 0,
    found: emails.length,
    voters: (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
    })),
  });
}
