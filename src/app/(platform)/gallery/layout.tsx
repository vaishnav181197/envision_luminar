import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Gallery",
  description: "Browse and vote on student UI design submissions.",
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
