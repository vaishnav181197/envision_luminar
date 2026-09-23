"use client";

import { useState } from "react";
import { FolderKanban } from "lucide-react";

import { LeaderboardTable } from "@/components/admin/leaderboard-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { ProjectCardSkeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { LeaderboardRow } from "@/types/admin";
import type { Project } from "@/types";

const PAGE_SIZE = 10;

export interface ProjectFormValues {
  title: string;
  description: string;
  demoUrl: string;
  authorName: string;
  batch: string;
  thumbnailFile: File | null;
  thumbnailUrl: string;
  clearThumbnail: boolean;
}

export interface AdminProjectsProps {
  rows: LeaderboardRow[];
  projects: Project[];
  loading?: boolean;
  editingId?: string | null;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string, title: string) => void;
  onCreate: (
    values: ProjectFormValues,
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    values: ProjectFormValues,
  ) => Promise<{ success: boolean; error?: string }>;
}

const EMPTY_FORM: ProjectFormValues = {
  title: "",
  description: "",
  demoUrl: "",
  authorName: "",
  batch: "",
  thumbnailFile: null,
  thumbnailUrl: "",
  clearThumbnail: false,
};

function ProjectEditorForm({
  editing,
  onCancelEdit,
  onCreate,
  onUpdate,
}: {
  editing: Project | null;
  onCancelEdit: () => void;
  onCreate: AdminProjectsProps["onCreate"];
  onUpdate: AdminProjectsProps["onUpdate"];
}) {
  const [form, setForm] = useState<ProjectFormValues>(
    editing
      ? {
          title: editing.title,
          description: editing.description,
          demoUrl: editing.demoUrl,
          authorName: editing.author?.name ?? "",
          batch: editing.author?.batch ?? "",
          thumbnailFile: null,
          thumbnailUrl: editing.thumbnailUrl ?? "",
          clearThumbnail: false,
        }
      : EMPTY_FORM,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload: ProjectFormValues = {
      title: form.title.trim(),
      description: form.description.trim(),
      demoUrl: form.demoUrl.trim(),
      authorName: form.authorName.trim(),
      batch: form.batch.trim(),
      thumbnailFile: form.thumbnailFile,
      thumbnailUrl: form.thumbnailUrl,
      clearThumbnail: form.clearThumbnail,
    };

    const result = editing
      ? await onUpdate(editing.id, payload)
      : await onCreate(payload);

    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Could not save project");
      return;
    }

    if (!editing) {
      setForm(EMPTY_FORM);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editing ? "Edit project" : "Add project"}</CardTitle>
        <CardDescription>
          {editing
            ? `Updating ${editing.title}.`
            : "Required: title, description, demo URL, author, and batch."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            required
            maxLength={100}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            required
            maxLength={500}
          />
          <Input
            label="Demo URL"
            type="url"
            placeholder="https://"
            value={form.demoUrl}
            onChange={(event) =>
              setForm((current) => ({ ...current, demoUrl: event.target.value }))
            }
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Author"
              placeholder="Student or team name"
              value={form.authorName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  authorName: event.target.value,
                }))
              }
              required
              maxLength={100}
            />
            <Input
              label="Batch"
              placeholder="e.g. 2022–2026"
              value={form.batch}
              onChange={(event) =>
                setForm((current) => ({ ...current, batch: event.target.value }))
              }
              required
              maxLength={50}
            />
          </div>
          <ImageUpload
            label="Thumbnail"
            value={form.thumbnailFile}
            previewUrl={
              form.clearThumbnail || form.thumbnailFile
                ? null
                : form.thumbnailUrl || null
            }
            onChange={(file) =>
              setForm((current) => ({
                ...current,
                thumbnailFile: file,
                clearThumbnail: file === null,
              }))
            }
          />
          {error && (
            <p className="text-sm text-error-500" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
              {editing ? "Save changes" : "Publish project"}
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={onCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminProjects({
  rows,
  projects,
  loading,
  editingId,
  onStartEdit,
  onCancelEdit,
  onDelete,
  onCreate,
  onUpdate,
}: AdminProjectsProps) {
  const [page, setPage] = useState(1);

  const editing = editingId
    ? (projects.find((project) => project.id === editingId) ?? null)
    : null;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <ProjectCardSkeleton />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Projects
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Publish, edit, and remove competing UIs. Cards show title, author, batch,
          description, demo, and votes.
        </p>
      </div>

      <ProjectEditorForm
        key={editing?.id ?? "new"}
        editing={editing}
        onCancelEdit={onCancelEdit}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-5 w-5" />}
          title="No projects yet"
          description="Publish the first competing UI to start the gallery."
        />
      ) : (
        <>
          <LeaderboardTable
            rows={paginatedRows}
            onDelete={onDelete}
            onEdit={onStartEdit}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
