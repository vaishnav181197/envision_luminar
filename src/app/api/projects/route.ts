import { jsonError, jsonOk } from "@/lib/api/response";
import { getStudentSession } from "@/lib/auth/student-session";
import {
  getCompetitionSettings,
  requireAdmin,
} from "@/lib/auth/session";
import {
  isCompetitionEnded,
  markWinners,
} from "@/lib/competition/helpers";
import {
  fetchProjectById,
  fetchProjectsWithVotes,
  fetchStudentVote,
} from "@/lib/competition/queries";
import { readProjectRequest } from "@/lib/competition/project-form";
import { validateProjectCreate } from "@/lib/competition/project-validation";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const [projects, settings, student] = await Promise.all([
      fetchProjectsWithVotes(),
      getCompetitionSettings(),
      getStudentSession(),
    ]);

    const ended = settings ? isCompetitionEnded(settings) : false;
    const userVote = student ? await fetchStudentVote(student.id) : null;

    return jsonOk({
      projects: markWinners(projects, ended),
      userVote,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load projects";
    return jsonError(message, 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  const uploaded = await readProjectRequest(request, auth.user!.id);
  if (uploaded.error) {
    return jsonError(uploaded.error);
  }

  const parsed = validateProjectCreate(uploaded.fields);
  if ("error" in parsed) {
    return jsonError(parsed.error);
  }

  const supabase = await createClient();
  const payload = {
    title: parsed.data.title,
    description: parsed.data.description,
    demo_url: parsed.data.demoUrl,
    thumbnail_url: parsed.data.thumbnailUrl,
    author_name: parsed.data.authorName,
    batch: parsed.data.batch,
  };

  let insert = await supabase
    .from("projects")
    .insert({ ...payload, created_by: auth.user!.id })
    .select("id")
    .single();

  if (insert.error?.message?.includes("created_by")) {
    insert = await supabase
      .from("projects")
      .insert({ ...payload, student_id: auth.user!.id })
      .select("id")
      .single();
  }

  if (
    insert.error &&
    (insert.error.message.includes("author_name") ||
      insert.error.message.toLowerCase().includes("batch"))
  ) {
    return jsonError(
      "Author and batch columns are missing. Run supabase/migrations/005_project_author_batch.sql in the Supabase SQL Editor.",
      500,
    );
  }

  const { data, error } = insert;

  if (error || !data) {
    return jsonError(error?.message ?? "Failed to create project", 500);
  }

  const project = await fetchProjectById(data.id);
  return jsonOk(
    { project: project ? { ...project, isWinner: false } : null },
    201,
  );
}
