import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getStudentSession } from "@/lib/auth/student-session";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Project Gallery",
  description: "Browse and vote on student UI design submissions.",
};

/**
 * Student voting gallery (PRD §4.2 / §6).
 * Requires a valid voting cookie. Admins use /admin — not this route.
 */
export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin.error) {
    redirect("/admin");
  }

  const student = await getStudentSession();
  if (!student) {
    redirect("/vote");
  }

  return children;
}
