import Link from "next/link";
import { Sparkles } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Gallery", href: "/gallery" },
  { label: "Contest Rules", href: "#rules" },
  { label: "Sign up", href: "/register" },
  { label: "Sign in", href: "/login" },
];

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#121212]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-white">ELEVATE</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/50">
              The institute&apos;s premier UI design competition. Create, submit,
              and vote for exceptional student work.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/50 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-white/40 sm:text-left">
          © 2026 ELEVATE UI Design Competition. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
