import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage submissions, track votes, and control the competition deadline.",
};

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
