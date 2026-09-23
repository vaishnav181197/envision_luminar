"use client";

import { useCallback, useState } from "react";

import {
  AdminLayout,
  AdminOverview,
  AdminProjects,
  AdminSettingsPanel,
  AdminVoters,
  DeleteProjectDialog,
} from "@/components/admin";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import type { AdminTab } from "@/types/admin";

export default function AdminPage() {
  const {
    user,
    settings,
    leaderboard,
    projects,
    voters,
    stats,
    isOpen,
    isDeadlineNear,
    isLoading,
    error,
    refresh,
    createProject,
    updateProject,
    deleteProject,
    addVoter,
    importVoters,
    deleteVoter,
    updateDeadline,
  } = useAdminDashboard();

  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteRequest = useCallback((id: string, title: string) => {
    setDeleteTarget({ id, title });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    const result = await deleteProject(deleteTarget.id);
    setDeleteLoading(false);

    if (!result.success) {
      addToast({
        title: "Delete failed",
        description: result.error ?? "Could not delete project.",
        variant: "error",
      });
      return;
    }

    const title = deleteTarget.title;
    if (editingId === deleteTarget.id) {
      setEditingId(null);
    }
    setDeleteTarget(null);

    addToast({
      title: "Project deleted",
      description: `"${title}" has been removed from the competition.`,
      variant: "success",
    });
  }, [deleteTarget, deleteProject, addToast, editingId]);

  const handleCreate = useCallback(
    async (values: {
      title: string;
      description: string;
      demoUrl: string;
      authorName: string;
      batch: string;
      thumbnailFile: File | null;
      thumbnailUrl: string;
      clearThumbnail: boolean;
    }) => {
      const result = await createProject(values);
      if (result.success) {
        addToast({
          title: "Project published",
          description: `"${values.title}" is now in the gallery.`,
          variant: "success",
        });
      }
      return result;
    },
    [createProject, addToast],
  );

  const handleUpdate = useCallback(
    async (
      id: string,
      values: {
        title: string;
        description: string;
        demoUrl: string;
        authorName: string;
        batch: string;
        thumbnailFile: File | null;
        thumbnailUrl: string;
        clearThumbnail: boolean;
      },
    ) => {
      const result = await updateProject(id, values);
      if (result.success) {
        setEditingId(null);
        addToast({
          title: "Project updated",
          description: `"${values.title}" has been saved.`,
          variant: "success",
        });
      }
      return result;
    },
    [updateProject, addToast],
  );

  const handleAddVoter = useCallback(
    async (email: string) => {
      const result = await addVoter(email);
      if (result.success) {
        addToast({
          title: "Voter added",
          description: `${email.trim().toLowerCase()} can now enter voting.`,
          variant: "success",
        });
      }
      return result;
    },
    [addVoter, addToast],
  );

  const handleImportVoters = useCallback(
    async (file: File) => {
      const result = await importVoters(file);
      if (result.success) {
        addToast({
          title: "Voters imported",
          description: `Added ${result.imported ?? 0} of ${result.found ?? 0} unique emails.`,
          variant: "success",
        });
      }
      return result;
    },
    [importVoters, addToast],
  );

  const handleDeleteVoter = useCallback(
    async (id: string, email: string) => {
      const result = await deleteVoter(id);
      if (result.success) {
        addToast({
          title: "Voter removed",
          description: `${email} can no longer enter voting.`,
          variant: "success",
        });
      } else {
        addToast({
          title: "Could not remove voter",
          description: result.error ?? "Please try again.",
          variant: "error",
        });
      }
      return result;
    },
    [deleteVoter, addToast],
  );

  const handleSaveDeadline = useCallback(
    async (votingEndTime: string) => {
      const result = await updateDeadline(votingEndTime);

      if (result.success) {
        addToast({
          title: "Deadline updated",
          description: "The competition deadline has been saved.",
          variant: "success",
        });
      } else {
        addToast({
          title: "Could not update deadline",
          description: result.error ?? "Please try again.",
          variant: "error",
        });
      }

      return result;
    },
    [updateDeadline, addToast],
  );

  const topRows = leaderboard.slice(0, 3);

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={user}
    >
      {error && (
        <div className="mb-6">
          <Alert variant="error" title="Dashboard failed to load">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={() => void refresh()}>
                Retry
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {activeTab === "overview" && (
        <AdminOverview
          stats={stats}
          topRows={topRows}
          loading={isLoading}
          isOpen={isOpen}
        />
      )}

      {activeTab === "projects" && (
        <AdminProjects
          rows={leaderboard}
          projects={projects}
          loading={isLoading}
          editingId={editingId}
          onStartEdit={setEditingId}
          onCancelEdit={() => setEditingId(null)}
          onDelete={handleDeleteRequest}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {activeTab === "voters" && (
        <AdminVoters
          voters={voters}
          loading={isLoading}
          onAdd={handleAddVoter}
          onImport={handleImportVoters}
          onDelete={handleDeleteVoter}
        />
      )}

      {activeTab === "settings" && (
        <AdminSettingsPanel
          votingEndTime={settings.votingEndTime}
          isOpen={isOpen}
          isDeadlineNear={isDeadlineNear}
          onSaveDeadline={handleSaveDeadline}
        />
      )}

      {deleteTarget && (
        <DeleteProjectDialog
          open
          onClose={() => setDeleteTarget(null)}
          projectTitle={deleteTarget.title}
          onConfirm={() => void handleDeleteConfirm()}
          loading={deleteLoading}
        />
      )}
    </AdminLayout>
  );
}
