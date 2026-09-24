import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CompetitionStatusBanner,
} from "@/components/admin/competition-status-banner";
import { DeadlineSettingsForm } from "@/components/admin/deadline-settings-form";
import { VotingControlsForm } from "@/components/admin/voting-controls-form";
import type { CompetitionSettings, VotingStatus } from "@/types/admin";

export interface AdminSettingsPanelProps {
  settings: CompetitionSettings;
  isOpen: boolean;
  isDeadlineNear: boolean;
  onSaveDeadline: (
    votingEndTime: string,
  ) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  onUpdateVotingStatus: (
    votingStatus: VotingStatus,
  ) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
}

export function AdminSettingsPanel({
  settings,
  isOpen,
  isDeadlineNear,
  onSaveDeadline,
  onUpdateVotingStatus,
}: AdminSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Competition Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Control the voting deadline, pause or stop voting, and review competition
          rules.
        </p>
      </div>

      <CompetitionStatusBanner
        settings={settings}
        isOpen={isOpen}
        isDeadlineNear={isDeadlineNear}
      />

      <Card>
        <CardHeader>
          <CardTitle>Voting status</CardTitle>
          <CardDescription>
            Pause voting temporarily, or stop it to lock results and show winners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VotingControlsForm
            key={`${settings.votingStatus}-${settings.votingEndTime}`}
            settings={settings}
            onUpdateStatus={onUpdateVotingStatus}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voting Deadline</CardTitle>
          <CardDescription>
            Set when entry and voting close. Changes apply immediately across
            the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeadlineSettingsForm
            key={settings.votingEndTime}
            settings={settings}
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
                id: "pause-stop",
                title: "Pause and stop",
                content:
                  "Pause blocks entry and votes without revealing winners. Stop ends voting immediately and shows winners. Resume/reopen requires a future deadline when status is open.",
              },
              {
                id: "deadline",
                title: "Deadline enforcement",
                content:
                  "After the voting deadline, student entry and upvote actions are disabled. The API rejects late writes even if the UI is bypassed.",
              },
              {
                id: "deletion",
                title: "Project moderation",
                content:
                  "Admins can delete projects at any time. Deleted projects are removed from the student gallery and leaderboard.",
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
