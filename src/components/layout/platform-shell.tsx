"use client";

import { Header } from "@/components/layout/header";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
    </>
  );
}
