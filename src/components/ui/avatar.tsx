import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeStyles = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ src, alt, name = "User", size = "md", className }: AvatarProps) {
  const initials = getInitials(name);

  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full ring-2 ring-white",
          sizeStyles[size],
          className,
        )}
      >
        <Image src={src} alt={alt ?? name} fill className="object-cover" sizes="64px" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 ring-2 ring-white",
        sizeStyles[size],
        className,
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

export interface UserProfileProps {
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  className?: string;
}

export function UserProfile({
  name,
  email,
  role,
  avatarUrl,
  className,
}: UserProfileProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar src={avatarUrl} name={name} size="md" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-primary">{name}</p>
        {email && (
          <p className="truncate text-xs text-text-muted">{email}</p>
        )}
        {role && (
          <span className="mt-0.5 inline-block text-xs font-medium capitalize text-primary-600">
            {role}
          </span>
        )}
      </div>
    </div>
  );
}
