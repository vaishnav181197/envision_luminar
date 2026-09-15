"use client";

import { CompetitionProvider } from "@/contexts/competition-context";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return <CompetitionProvider>{children}</CompetitionProvider>;
}
