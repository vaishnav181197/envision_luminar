import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = [
  { label: "Enter voting", href: "/vote" },
  { label: "Admin", href: "/login" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Envision</span>
        </Link>

        <nav className="flex flex-wrap gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-white/30">
          Student UI Design Competition · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
