import { Dialog } from "@/components/ui/modal";

export interface ResetVotersDialogProps {
  open: boolean;
  onClose: () => void;
  voterCount: number;
  onConfirm: () => void;
  loading?: boolean;
}

export function ResetVotersDialog({
  open,
  onClose,
  voterCount,
  onConfirm,
  loading,
}: ResetVotersDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Reset voter list?"
      description={`Remove all ${voterCount} registered ${voterCount === 1 ? "email" : "emails"} from the voter list. Their votes will be deleted too. This cannot be undone.`}
      confirmLabel="Reset all voters"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      variant="destructive"
      loading={loading}
    />
  );
}
