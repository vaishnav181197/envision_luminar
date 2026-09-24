"use client";

import { useState } from "react";
import { Calendar, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  votingStatusIndicator,
  votingStatusLabel,
} from "@/lib/competition/helpers";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format-date";
import type { CompetitionSettings } from "@/types/admin";

export interface DeadlineSettingsFormProps {
  settings: CompetitionSettings;
  isOpen: boolean;
  onSave: (
    votingEndTime: string,
  ) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  className?: string;
}

function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function DeadlineSettingsForm({
  settings,
  isOpen,
  onSave,
  className,
}: DeadlineSettingsFormProps) {
  const [value, setValue] = useState(toDatetimeLocalValue(settings.votingEndTime));
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const formattedCurrent = formatDateTime(settings.votingEndTime, "full");

  const handleSave = async () => {
    setSaving(true);
    setError(undefined);
    setSaved(false);

    const iso = new Date(value).toISOString();
    const result = await Promise.resolve(onSave(iso));

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-primary">Current deadline</p>
          <p className="mt-0.5 text-sm text-text-secondary">{formattedCurrent}</p>
        </div>
        <StatusIndicator
          status={votingStatusIndicator(settings)}
          label={votingStatusLabel(settings)}
        />
      </div>

      <Input
        label="New voting deadline"
        type="datetime-local"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(undefined);
          setSaved(false);
        }}
        error={error}
        hint="Students cannot enter or vote after this time."
        leftIcon={<Calendar className="h-4 w-4" />}
      />

      <div className="flex items-center gap-2">
        <Button
          onClick={handleSave}
          loading={saving}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Save deadline
        </Button>
        {saved && (
          <span className="text-sm font-medium text-success-600">Saved successfully</span>
        )}
        {!isOpen && settings.votingStatus === "open" && (
          <span className="text-sm text-text-tertiary">
            Deadline has passed — extend it to reopen voting.
          </span>
        )}
      </div>
    </div>
  );
}
