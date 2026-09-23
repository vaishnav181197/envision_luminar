import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";

import { RootProviders } from "@/components/layout/root-providers";
import { ToastProvider } from "@/components/ui/toast";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Envision — UI Design Competition",
    template: "%s | Envision",
  },
  description:
    "A premium platform for student UI design competitions. Submit projects, browse the gallery, and vote for your favorites.",
  keywords: ["UI design", "competition", "student", "voting", "design system"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <ToastProvider>
          <RootProviders>{children}</RootProviders>
        </ToastProvider>
      </body>
    </html>
  );
}
