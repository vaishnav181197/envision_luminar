"use client";

import { useCallback, useState } from "react";

import {
  AdminLayout,
  AdminOverview,
  AdminSettingsPanel,
  AdminSubmissions,
  DeleteProjectDialog,
} from "@/components/admin";
import { useToast } from "@/components/ui/toast";
import { useAdminCompetition } from "@/hooks/use-admin-competition";
import type { AdminTab } from "@/types/admin";

export default function AdminPage() {
  const {
    settings,
    leaderboard,
    stats,
    isOpen,
    isDeadlineNear,
    isLoading,
    deleteProject,
    updateDeadline,
  } = useAdminCompetition();

  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
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
        description: result.error ?? "Could not delete submission.",
        variant: "error",
      });
      return;
    }

    const title = deleteTarget.title;
    setDeleteTarget(null);

    addToast({
      title: "Submission deleted",
      description: `"${title}" has been removed from the competition.`,
      variant: "success",
    });
  }, [deleteTarget, deleteProject, addToast]);

  const handleSaveDeadline = useCallback(
    async (votingEndTime: string) => {
      const result = await updateDeadline(votingEndTime);

      if (result.success) {
        addToast({
          title: "Deadline updated",
          description: "The competition deadline has been saved.",
          variant: "success",
        });
      }

      return result;
    },
    [updateDeadline, addToast],
  );

  const topRows = leaderboard.slice(0, 3);

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "overview" && (
        <AdminOverview stats={stats} topRows={topRows} loading={isLoading} />
      )}

      {activeTab === "submissions" && (
        <AdminSubmissions
          rows={leaderboard}
          loading={isLoading}
          onDelete={handleDeleteRequest}
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

      <DeleteProjectDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        projectTitle={deleteTarget?.title ?? ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </AdminLayout>
  );
}
