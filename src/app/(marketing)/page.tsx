import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { ContestRulesSection } from "@/components/landing/contest-rules-section";
import { HeroLogoDisplay } from "@/components/landing/hero-logo-display";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <LandingHeader />

      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#121212]">
        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-32">
          <div className="order-2 max-w-xl animate-fade-in lg:order-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-sm text-amber-100/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Student UI Design Competition 2026
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Where student design
              <span className="block bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                rises to the top
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/65">
              Submit your finest UI work, explore peer creations, and cast your vote
              in the institute&apos;s most ambitious design competition.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 text-base font-semibold text-white shadow-xl shadow-primary-600/40 transition-all hover:bg-primary-500 hover:shadow-primary-500/50"
              >
                Sign up to participate
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 text-base font-medium text-white/80 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
              >
                Sign in to your home
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/40">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-amber-300/80 underline-offset-4 hover:text-amber-200 hover:underline"
              >
                Sign in
              </Link>{" "}
              to access your gallery and submissions.
            </p>
          </div>

          <div className="order-1 lg:order-2">
            <HeroLogoDisplay />
          </div>
        </div>
      </section>

      <ContestRulesSection />
      <LandingFooter />
    </div>
  );
}
