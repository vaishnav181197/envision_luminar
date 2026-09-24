import { jsonError, jsonOk } from "@/lib/api/response";
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
} from "@/lib/competition/queries";
import { readProjectRequest } from "@/lib/competition/project-form";
import { validateProjectUpdate } from "@/lib/competition/project-validation";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types";

async function loadProjectWithWinner(id: string): Promise<Project | null> {
  const project = await fetchProjectById(id);
  if (!project) return null;

  const settings = await getCompetitionSettings();
  const ended = settings ? isCompetitionEnded(settings) : false;
  if (!ended) {
    return { ...project, isWinner: false };
  }

  const projects = await fetchProjectsWithVotes();
  return (
    markWinners(projects, true).find((row) => row.id === id) ?? {
      ...project,
      isWinner: false,
    }
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const project = await loadProjectWithWinner(id);
    if (!project) {
      return jsonError("Project not found", 404);
    }

    return jsonOk({ project });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load project";
    return jsonError(message, 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (auth.error) {
    return jsonError(auth.error, auth.error === "Forbidden" ? 403 : 401);
  }

  const project = await fetchProjectById(id);
  if (!project) {
    return jsonError("Project not found", 404);
  }

  const uploaded = await readProjectRequest(
    request,
    auth.user!.id,
    project.thumbnailUrl ?? null,
  );
  if (uploaded.error) {
    return jsonError(uploaded.error);
  }

  const parsed = validateProjectUpdate(uploaded.fields, {
    title: project.title,
    description: project.description,
    demoUrl: project.demoUrl,
    authorName: project.author?.name ?? "",
    batch: project.author?.batch ?? "",
    thumbnailUrl: project.thumbnailUrl ?? null,
  });

  if ("error" in parsed) {
    return jsonError(parsed.error);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      demo_url: parsed.data.demoUrl,
      thumbnail_url: parsed.data.thumbnailUrl,
      author_name: parsed.data.authorName,
      batch: parsed.data.batch,
    })
    .eq("id", id);

  if (error) {
    if (
      error.message.includes("author_name") ||
      error.message.toLowerCase().includes("batch")
    ) {
      return jsonError(
        "Author and batch columns are missing. Run supabase/migrations/005_project_author_batch.sql in the Supabase SQL Editor.",
        500,
      );
    }
    return jsonError(error.message, 500);
  }

  const updated = await loadProjectWithWinner(id);
  return jsonOk({ project: updated });
}

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
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !project) {
    return jsonError("Project not found", 404);
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ success: true });
}
