import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CompetitionStatusBanner,
} from "@/components/admin/competition-status-banner";
import { DeadlineSettingsForm } from "@/components/admin/deadline-settings-form";

export interface AdminSettingsPanelProps {
  votingEndTime: string;
  isOpen: boolean;
  isDeadlineNear: boolean;
  onSaveDeadline: (
    votingEndTime: string,
  ) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
}

export function AdminSettingsPanel({
  votingEndTime,
  isOpen,
  isDeadlineNear,
  onSaveDeadline,
}: AdminSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Competition Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Control the voting deadline and competition status for all participants.
        </p>
      </div>

      <CompetitionStatusBanner
        isOpen={isOpen}
        isDeadlineNear={isDeadlineNear}
        deadline={votingEndTime}
      />

      <Card>
        <CardHeader>
          <CardTitle>Voting Deadline</CardTitle>
          <CardDescription>
            Set when submissions and voting close. Changes apply immediately across
            the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeadlineSettingsForm
            key={votingEndTime}
            votingEndTime={votingEndTime}
            isOpen={isOpen}
            onSave={onSaveDeadline}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competition Rules</CardTitle>
          <CardDescription>Reference for admin and participant policies.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion
            items={[
              {
                id: "voting",
                title: "One vote per student",
                content:
                  "Each student may cast exactly one vote. Changing votes transfers the single vote to the new project.",
              },
              {
                id: "deadline",
                title: "Deadline enforcement",
                content:
                  "After the voting deadline, submit and upvote actions are disabled for all users. Backend validation will reject late writes in Phase 2.",
              },
              {
                id: "deletion",
                title: "Submission moderation",
                content:
                  "Admins can delete inappropriate submissions at any time. Deleted projects are removed from the public gallery and leaderboard.",
              },
            ]}
            defaultOpen="voting"
            className="border-0 shadow-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}
