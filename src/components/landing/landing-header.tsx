import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LandingHeader() {
  return (
    <header className="relative z-20 border-b border-white/5 bg-[#121212]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 shadow-lg shadow-primary-600/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Envision</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Admin
          </Link>
          <Link
            href="/vote"
            className="inline-flex h-8 items-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white shadow-lg shadow-primary-600/30 transition-colors hover:bg-primary-700"
          >
            Enter voting
          </Link>
        </nav>
      </div>
    </header>
  );
}
