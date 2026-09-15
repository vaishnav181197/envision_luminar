import Image from "next/image";
import { ExternalLink, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";
import { cn } from "@/lib/utils/cn";
import type { Project } from "@/types";

export interface ProjectCardProps {
  project: Project;
  voted?: boolean;
  onUpvote?: (projectId: string, voted: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ProjectCard({
  project,
  voted = false,
  onUpvote,
  loading = false,
  disabled = false,
  className,
}: ProjectCardProps) {
  return (
    <Card
      padding="none"
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-lg",
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt={`${project.title} preview`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
            <div className="flex flex-col items-center gap-2 text-text-muted">
              <div className="h-12 w-12 rounded-xl bg-white/60 shadow-sm" />
              <span className="text-xs font-medium">UI Preview</span>
            </div>
          </div>
        )}
        {project.isWinner && (
          <div className="absolute left-3 top-3">
            <Badge variant="warning" className="gap-1 shadow-sm">
              <Trophy className="h-3 w-3" />
              Winner
            </Badge>
          </div>
        )}
        {project.tags && project.tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-text-secondary backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-text-primary">
              {project.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-text-muted">
              by {project.author.name}
            </p>
          </div>
          <UpvoteButton
            count={project.voteCount}
            voted={voted}
            loading={loading}
            disabled={disabled}
            onUpvote={(v) => onUpvote?.(project.id, v)}
          />
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
          {project.description}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover"
          >
            View Demo
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </Card>
  );
}
