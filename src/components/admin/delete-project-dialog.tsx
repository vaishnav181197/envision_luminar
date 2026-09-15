import { Dialog } from "@/components/ui/modal";

export interface DeleteProjectDialogProps {
  open: boolean;
  onClose: () => void;
  projectTitle: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteProjectDialog({
  open,
  onClose,
  projectTitle,
  onConfirm,
  loading,
}: DeleteProjectDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete submission?"
      description={`"${projectTitle}" will be permanently removed from the competition. This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      variant="destructive"
      loading={loading}
    />
  );
}
