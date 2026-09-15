import type { Metadata } from "next";

import { DesignSystemContent } from "@/components/design-system/design-system-content";
import { DesignSystemLayout } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Design System",
  description: "Living style guide for the ELEVATE UI Design Competition platform.",
};

const sidebarItems = [
  { id: "typography", label: "Typography" },
  { id: "colors", label: "Colors" },
  { id: "buttons", label: "Buttons" },
  { id: "inputs", label: "Form Controls" },
  { id: "cards", label: "Cards" },
  { id: "badges", label: "Badges & Tags" },
  { id: "alerts", label: "Alerts & Toasts" },
  { id: "overlays", label: "Overlays" },
  { id: "navigation", label: "Navigation" },
  { id: "table", label: "Tables" },
  { id: "status", label: "Status & Profile" },
  { id: "loading", label: "Loading & Empty" },
  { id: "admin", label: "Admin Components" },
];

export default function DesignSystemPage() {
  return (
    <DesignSystemLayout sidebarItems={sidebarItems}>
      <DesignSystemContent />
    </DesignSystemLayout>
  );
}
