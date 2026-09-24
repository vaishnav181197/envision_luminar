"use client";

import { useState } from "react";
import {
  ArrowUp,
  Heart,
  Link as LinkIcon,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";

import { Section, ComponentGrid, ShowcaseBox } from "@/components/design-system/section";
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  Drawer,
  EmptyState,
  ImageUpload,
  Input,
  Modal,
  Pagination,
  Popover,
  ProjectCard,
  RadioGroup,
  Select,
  Skeleton,
  ProjectCardSkeleton,
  StatCard,
  Slider,
  StatusIndicator,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  Textarea,
  Tooltip,
  UpvoteButton,
  UserProfile,
  useToast,
} from "@/components/ui";
import { LEADERBOARD_DATA, MOCK_PROJECTS } from "@/lib/constants/mock-projects";
import { buildLeaderboardRows } from "@/lib/constants/mock-admin";
import { cn } from "@/lib/utils/cn";
import {
  AdminProjects,
  AdminVoters,
  CompetitionStatusBanner,
  DeadlineSettingsForm,
  DeleteProjectDialog,
  LeaderboardTable,
  VotingControlsForm,
} from "@/components/admin";
import type { CompetitionSettings, EligibleStudent } from "@/types/admin";

export function DesignSystemContent() {
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sliderValue, setSliderValue] = useState(50);
  const [votedProject, setVotedProject] = useState<string | null>("1");
  const [selectedRole, setSelectedRole] = useState("student");
  const [deleteDemoOpen, setDeleteDemoOpen] = useState(false);
  const [demoThumbnail, setDemoThumbnail] = useState<File | null>(null);
  const [demoVoters, setDemoVoters] = useState<EligibleStudent[]>([
    {
      id: "v1",
      email: "student.one@institute.edu",
      createdAt: "2026-09-01T10:00:00.000Z",
    },
    {
      id: "v2",
      email: "student.two@institute.edu",
      createdAt: "2026-09-02T10:00:00.000Z",
    },
  ]);

  const adminDemoRows = buildLeaderboardRows(MOCK_PROJECTS).slice(0, 4);
  const demoDeadline = "2026-08-15T23:59:00.000Z";
  const demoClosedDeadline = "2020-01-01T00:00:00.000Z";
  const demoOpenSettings: CompetitionSettings = {
    votingEndTime: demoDeadline,
    votingStatus: "open",
  };
  const demoPausedSettings: CompetitionSettings = {
    votingEndTime: demoDeadline,
    votingStatus: "paused",
  };
  const demoStoppedSettings: CompetitionSettings = {
    votingEndTime: demoClosedDeadline,
    votingStatus: "stopped",
  };
  const demoClosedSettings: CompetitionSettings = {
    votingEndTime: demoClosedDeadline,
    votingStatus: "open",
  };

  return (
    <>
      {/* Hero */}
      <div className="mb-12">
        <Badge variant="primary" className="mb-3">
          Living Style Guide
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Envision Design System
        </h1>
        <p className="mt-3 max-w-2xl text-base text-text-secondary">
          Production-ready components for the Student UI Design Competition platform.
          Every element follows a cohesive design language built for performance,
          accessibility, and premium visual quality.
        </p>
      </div>

      {/* Typography */}
      <Section
        id="typography"
        title="Typography"
        description="Plus Jakarta Sans for UI text, Geist Mono for code and technical labels."
      >
        <ShowcaseBox>
          <p className="text-4xl font-bold tracking-tight">Display Heading</p>
          <p className="mt-4 text-2xl font-semibold tracking-tight">Section Heading</p>
          <p className="mt-4 text-lg font-medium">Subheading</p>
          <p className="mt-4 text-base text-text-secondary">
            Body text — Used for descriptions, form hints, and general content throughout
            the application.
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Small text — Metadata, timestamps, and secondary information.
          </p>
          <p className="mt-2 font-mono text-xs text-primary-600">font-mono — Code & URLs</p>
        </ShowcaseBox>
      </Section>

      {/* Colors */}
      <Section
        id="colors"
        title="Color Palette"
        description="Semantic color system inspired by brand purple (#6a1b9a), refined for premium contrast."
      >
        <ComponentGrid columns={4}>
          {[
            { name: "Primary 600", cls: "bg-primary-600" },
            { name: "Primary 100", cls: "bg-primary-100" },
            { name: "Secondary 500", cls: "bg-secondary-500" },
            { name: "Accent 500", cls: "bg-accent-500" },
            { name: "Success 500", cls: "bg-success-500" },
            { name: "Warning 500", cls: "bg-warning-500" },
            { name: "Error 500", cls: "bg-error-500" },
            { name: "Info 500", cls: "bg-info-500" },
          ].map((color) => (
            <div key={color.name} className="flex flex-col gap-2">
              <div className={cn("h-14 rounded-lg border border-border", color.cls)} />
              <p className="text-xs font-medium text-text-primary">{color.name}</p>
            </div>
          ))}
        </ComponentGrid>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ShowcaseBox label="Background" className="bg-background">
            <p className="text-sm">Page background</p>
          </ShowcaseBox>
          <ShowcaseBox label="Surface" className="bg-surface">
            <p className="text-sm">Card surface</p>
          </ShowcaseBox>
          <ShowcaseBox label="Text Primary" >
            <p className="text-text-primary text-sm font-medium">Primary text</p>
            <p className="text-text-secondary text-sm">Secondary text</p>
            <p className="text-text-muted text-sm">Muted text</p>
          </ShowcaseBox>
          <ShowcaseBox label="Interactive">
            <div className="space-y-2">
              <div className="rounded-lg bg-hover p-2 text-sm">Hover state</div>
              <div className="rounded-lg bg-active p-2 text-sm">Active state</div>
            </div>
          </ShowcaseBox>
        </div>
      </Section>

      {/* Buttons */}
      <Section
        id="buttons"
        title="Buttons"
        description="Primary actions, secondary actions, and the signature upvote interaction."
      >
        <ComponentGrid columns={2}>
          <ShowcaseBox label="Variants">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </ShowcaseBox>
          <ShowcaseBox label="Sizes">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </ShowcaseBox>
          <ShowcaseBox label="States">
            <div className="flex flex-wrap gap-2">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon={<Plus className="h-4 w-4" />}>With Icon</Button>
            </div>
          </ShowcaseBox>
          <ShowcaseBox label="Icon Buttons">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </ShowcaseBox>
        </ComponentGrid>

        <ShowcaseBox label="Upvote Button — Core Voting Interaction" className="mt-4">
          <div className="flex flex-wrap items-end gap-6">
            <div className="text-center">
              <UpvoteButton count={24} />
              <p className="mt-2 text-xs text-text-muted">Default</p>
            </div>
            <div className="text-center">
              <UpvoteButton count={42} voted />
              <p className="mt-2 text-xs text-text-muted">Voted</p>
            </div>
            <div className="text-center">
              <UpvoteButton count={18} loading />
              <p className="mt-2 text-xs text-text-muted">Loading</p>
            </div>
            <div className="text-center">
              <UpvoteButton count={0} disabled />
              <p className="mt-2 text-xs text-text-muted">Disabled</p>
            </div>
            <div className="text-center">
              <UpvoteButton
                count={MOCK_PROJECTS[0].voteCount}
                voted={votedProject === "1"}
                onUpvote={() =>
                  setVotedProject(votedProject === "1" ? null : "1")
                }
              />
              <p className="mt-2 text-xs text-text-muted">Interactive</p>
            </div>
          </div>
        </ShowcaseBox>
      </Section>

      {/* Form Inputs */}
      <Section
        id="inputs"
        title="Form Controls"
        description="Inputs, selects, and validation states for project submission."
      >
        <ComponentGrid columns={2}>
          <ShowcaseBox label="Text Input">
            <Input
              label="Project Title"
              placeholder="Enter your project name"
              hint="Keep it concise and descriptive"
            />
          </ShowcaseBox>
          <ShowcaseBox label="URL Input">
            <Input
              label="Demo URL"
              type="url"
              placeholder="https://figma.com/..."
              leftIcon={<LinkIcon className="h-4 w-4" />}
            />
          </ShowcaseBox>
          <ShowcaseBox label="Error State">
            <Input
              label="Email"
              defaultValue="invalid-email"
              error="Please enter a valid email address"
            />
          </ShowcaseBox>
          <ShowcaseBox label="Disabled">
            <Input label="Student ID" defaultValue="CS2024001" disabled />
          </ShowcaseBox>
          <ShowcaseBox label="Textarea" className="sm:col-span-2">
            <Textarea
              label="Project Description"
              placeholder="Describe your design approach, tools used, and key features..."
              rows={4}
            />
          </ShowcaseBox>
          <ShowcaseBox label="Image Upload" className="sm:col-span-2">
            <ImageUpload
              label="Thumbnail"
              value={demoThumbnail}
              onChange={setDemoThumbnail}
            />
          </ShowcaseBox>
          <ShowcaseBox label="Select">
            <Select
              label="Design Category"
              options={[
                { value: "", label: "Select a category" },
                { value: "mobile", label: "Mobile App" },
                { value: "web", label: "Web Application" },
                { value: "dashboard", label: "Dashboard" },
              ]}
            />
          </ShowcaseBox>
          <ShowcaseBox label="Slider">
            <Slider
              label="Design Complexity"
              value={sliderValue}
              onValueChange={setSliderValue}
              formatValue={(v) => `${v}%`}
            />
          </ShowcaseBox>
        </ComponentGrid>

        <ComponentGrid columns={2} >
          <ShowcaseBox label="Checkbox">
            <div className="space-y-3">
              <Checkbox label="I agree to the competition rules" defaultChecked />
              <Checkbox
                label="Notify me of results"
                description="Receive an email when voting closes"
              />
              <Checkbox label="Disabled option" disabled />
            </div>
          </ShowcaseBox>
          <ShowcaseBox label="Radio Group">
            <RadioGroup
              name="role"
              value={selectedRole}
              onChange={setSelectedRole}
              options={[
                { value: "student", label: "Student", description: "Submit and vote" },
                { value: "admin", label: "Admin", description: "Manage competition" },
              ]}
            />
          </ShowcaseBox>
          <ShowcaseBox label="Switch" className="sm:col-span-2">
            <div className="space-y-4">
              <Switch label="Email notifications" defaultChecked />
              <Switch
                label="Public profile"
                description="Show your submissions on your profile"
              />
              <Switch label="Disabled" disabled />
            </div>
          </ShowcaseBox>
        </ComponentGrid>
      </Section>

      {/* Cards */}
      <Section
        id="cards"
        title="Cards"
        description="Standard cards, statistics cards, and project gallery cards."
      >
        <ComponentGrid columns={3}>
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>Basic container for content grouping</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">
                Used for settings panels, info blocks, and general content.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">
                Action
              </Button>
            </CardFooter>
          </Card>

          <StatCard
            label="Total Votes"
            value="195"
            change="+12% from last week"
            trend="up"
            icon={<ArrowUp className="h-4 w-4" />}
          />

          <StatCard
            label="Submissions"
            value="24"
            change="6 new this week"
            trend="neutral"
            icon={<Heart className="h-4 w-4" />}
          />
        </ComponentGrid>

        <div className="mt-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-text-muted">
            Project Gallery Cards
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_PROJECTS.slice(0, 3).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                voted={votedProject === project.id}
                onUpvote={(id, voted) =>
                  setVotedProject(voted ? id : null)
                }
              />
            ))}
          </div>
        </div>
      </Section>

      {/* Badges & Tags */}
      <Section id="badges" title="Badges & Tags">
        <ShowcaseBox>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Winner</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Tag>UI Design</Tag>
            <Tag>Mobile</Tag>
            <Tag removable>Removable</Tag>
          </div>
        </ShowcaseBox>
      </Section>

      {/* Alerts & Toasts */}
      <Section id="alerts" title="Alerts & Toasts">
        <div className="space-y-3">
          <Alert variant="info" title="Voting is open">
            Cast your vote before the deadline on August 15, 2026.
          </Alert>
          <Alert variant="success" title="Project submitted">
            Your submission has been added to the gallery.
          </Alert>
          <Alert variant="warning" title="Deadline approaching">
            Only 3 days left to submit and vote.
          </Alert>
          <Alert variant="error" title="Submission failed" dismissible>
            Please check your demo URL and try again.
          </Alert>
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() =>
              addToast({
                title: "Vote recorded!",
                description: "Your upvote has been saved.",
                variant: "success",
              })
            }
          >
            Show Toast
          </Button>
        </div>
      </Section>

      {/* Overlays */}
      <Section id="overlays" title="Modals, Dialogs & Drawers">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            Open Dialog
          </Button>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            Open Drawer
          </Button>
          <Popover
            trigger={<Button variant="outline">Popover</Button>}
          >
            <p className="text-sm text-text-secondary">
              Quick actions and contextual information appear here.
            </p>
          </Popover>
          <Tooltip content="Upvote this project">
            <Button variant="ghost" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Submit Your Project"
          description="Share your UI design with the community"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Submit</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input label="Project Title" placeholder="My Awesome Design" required />
            <Textarea label="Description" placeholder="Tell us about your project..." />
            <Input label="Demo URL" type="url" placeholder="https://..." required />
          </div>
        </Modal>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Delete submission?"
          description="This action cannot be undone. Your project will be permanently removed."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={() => setDialogOpen(false)}
        />

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Filters"
          description="Refine gallery results"
        >
          <div className="space-y-4">
            <Select
              label="Category"
              options={[
                { value: "all", label: "All Categories" },
                { value: "mobile", label: "Mobile" },
                { value: "web", label: "Web" },
              ]}
            />
            <Switch label="Show winners only" />
          </div>
        </Drawer>
      </Section>

      {/* Navigation */}
      <Section id="navigation" title="Navigation">
        <ShowcaseBox label="Breadcrumbs">
          <Breadcrumbs
            items={[
              { label: "Admin", href: "/admin" },
              { label: "Projects" },
            ]}
          />
        </ShowcaseBox>
        <ShowcaseBox label="Tabs" className="mt-4">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <p className="text-sm text-text-secondary">Showing all 24 submissions.</p>
            </TabsContent>
            <TabsContent value="trending">
              <p className="text-sm text-text-secondary">Top voted projects this week.</p>
            </TabsContent>
            <TabsContent value="recent">
              <p className="text-sm text-text-secondary">Latest submissions first.</p>
            </TabsContent>
          </Tabs>
        </ShowcaseBox>
        <ShowcaseBox label="Pagination" className="mt-4">
          <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
        </ShowcaseBox>
        <ShowcaseBox label="Accordion" className="mt-4">
          <Accordion
            items={[
              {
                id: "rules",
                title: "Competition Rules",
                content:
                  "Admins publish the competing UIs. Listed students enter with their email and cast one vote before the deadline.",
              },
              {
                id: "judging",
                title: "How Winners Are Chosen",
                content:
                  "The project with the most community votes wins. Admins can view the full leaderboard.",
              },
            ]}
            defaultOpen="rules"
          />
        </ShowcaseBox>
      </Section>

      {/* Table */}
      <Section
        id="table"
        title="Admin Leaderboard Table"
        description="Sortable data table for admin dashboard."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="text-right">Votes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LEADERBOARD_DATA.map((row) => (
              <TableRow key={row.rank}>
                <TableCell>
                  <Badge variant={row.rank === 1 ? "warning" : "outline"}>
                    #{row.rank}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {row.votes}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      {/* Status & Profile */}
      <Section id="status" title="Status & User Components">
        <ComponentGrid columns={2}>
          <ShowcaseBox label="Status Indicators">
            <div className="flex flex-wrap gap-2">
              <StatusIndicator status="open" />
              <StatusIndicator status="closed" />
              <StatusIndicator status="pending" />
              <StatusIndicator status="active" />
              <StatusIndicator status="inactive" />
            </div>
          </ShowcaseBox>
          <ShowcaseBox label="User Profile">
            <UserProfile
              name="Priya Sharma"
              email="priya.sharma@institute.edu"
              role="student"
            />
          </ShowcaseBox>
          <ShowcaseBox label="Avatars">
            <div className="flex items-center gap-3">
              <Avatar name="Priya Sharma" size="xs" />
              <Avatar name="Arjun Patel" size="sm" />
              <Avatar name="Sneha Reddy" size="md" />
              <Avatar name="Rahul Verma" size="lg" />
            </div>
          </ShowcaseBox>
        </ComponentGrid>
      </Section>

      {/* Loading & Empty */}
      <Section id="loading" title="Loading & Empty States">
        <ComponentGrid columns={2}>
          <ShowcaseBox label="Skeleton Loaders">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </ShowcaseBox>
          <ShowcaseBox label="Card Skeleton">
            <ProjectCardSkeleton />
          </ShowcaseBox>
        </ComponentGrid>
        <div className="mt-4">
          <EmptyState
            title="No projects yet"
            description="Check back once the admin publishes competing UIs."
            action={<Button leftIcon={<Plus className="h-4 w-4" />}>Enter voting</Button>}
          />
        </div>
      </Section>

      {/* Admin Components */}
      <Section
        id="admin"
        title="Admin Components"
        description="Dashboard components for managing projects, voters, deadlines, and competition status."
      >
        <ShowcaseBox label="Competition Status Banner">
          <div className="space-y-3">
            <CompetitionStatusBanner
              settings={demoOpenSettings}
              isOpen
              isDeadlineNear={false}
            />
            <CompetitionStatusBanner
              settings={demoOpenSettings}
              isOpen
              isDeadlineNear
            />
            <CompetitionStatusBanner
              settings={demoPausedSettings}
              isOpen={false}
              isDeadlineNear={false}
            />
            <CompetitionStatusBanner
              settings={demoStoppedSettings}
              isOpen={false}
              isDeadlineNear={false}
            />
            <CompetitionStatusBanner
              settings={demoClosedSettings}
              isOpen={false}
              isDeadlineNear={false}
            />
          </div>
        </ShowcaseBox>

        <ShowcaseBox label="Voting Controls" className="mt-4">
          <VotingControlsForm
            settings={demoOpenSettings}
            onUpdateStatus={(status) => {
              addToast({
                title: `Voting status → ${status} (demo)`,
                variant: "success",
              });
              return { success: true };
            }}
          />
        </ShowcaseBox>

        <ShowcaseBox label="Leaderboard Table" className="mt-4">
          <LeaderboardTable
            rows={adminDemoRows}
            onDelete={(id, title) => {
              void id;
              void title;
              setDeleteDemoOpen(true);
            }}
          />
        </ShowcaseBox>

        <ShowcaseBox label="Deadline Settings Form" className="mt-4">
          <DeadlineSettingsForm
            settings={demoOpenSettings}
            isOpen
            onSave={(value) => {
              if (new Date(value).getTime() <= Date.now()) {
                return {
                  success: false,
                  error: "Deadline must be in the future while the competition is open.",
                };
              }
              addToast({
                title: "Deadline updated (demo)",
                variant: "success",
              });
              return { success: true };
            }}
          />
        </ShowcaseBox>

        <ShowcaseBox label="Delete Project Dialog" className="mt-4">
          <Button variant="destructive" onClick={() => setDeleteDemoOpen(true)}>
            Open delete dialog
          </Button>
          <DeleteProjectDialog
            open={deleteDemoOpen}
            onClose={() => setDeleteDemoOpen(false)}
            projectTitle="FinFlow Dashboard"
            onConfirm={() => setDeleteDemoOpen(false)}
          />
        </ShowcaseBox>

        <ShowcaseBox label="Admin Projects" className="mt-4">
          <AdminProjects
            rows={adminDemoRows}
            projects={MOCK_PROJECTS}
            onStartEdit={() => undefined}
            onCancelEdit={() => undefined}
            onDelete={() => setDeleteDemoOpen(true)}
            onCreate={async () => ({ success: true })}
            onUpdate={async () => ({ success: true })}
          />
        </ShowcaseBox>

        <ShowcaseBox label="Admin Voters" className="mt-4">
          <AdminVoters
            voters={demoVoters}
            onAdd={async (email) => {
              setDemoVoters((current) => [
                {
                  id: email,
                  email,
                  createdAt: "2026-09-22T00:00:00.000Z",
                },
                ...current,
              ]);
              return { success: true };
            }}
            onImport={async () => ({ success: true, imported: 0, found: 0 })}
            onDelete={async (id) => {
              setDemoVoters((current) => current.filter((voter) => voter.id !== id));
              return { success: true };
            }}
            onResetAll={async () => {
              const deleted = demoVoters.length;
              setDemoVoters([]);
              return { success: true, deleted };
            }}
          />
        </ShowcaseBox>
      </Section>
    </>
  );
}
