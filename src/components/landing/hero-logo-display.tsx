"use client";

import Image from "next/image";

const LOGO_SRC = "/images/elevate-logo.png";

export function HeroLogoDisplay() {
  return (
    <div className="relative flex items-center justify-center lg:justify-end">
      <div className="relative w-full max-w-[420px] animate-logo-float sm:max-w-[480px] lg:max-w-[520px]">
        {/* Soft purple glow behind logo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[12%] rounded-full bg-violet-600/20 blur-3xl"
        />

        <div className="relative aspect-square w-full">
          <Image
            src={LOGO_SRC}
            alt="ELEVATE"
            fill
            priority
            unoptimized
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 520px"
            className="object-contain drop-shadow-[0_8px_32px_rgba(139,92,246,0.35)]"
          />

          {/* Light sweep — tuned for purple mark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[18%]"
          >
            <div className="absolute inset-0 animate-logo-shimmer bg-gradient-to-r from-transparent via-white/14 to-transparent mix-blend-soft-light" />
            <div className="absolute inset-0 animate-logo-shimmer bg-gradient-to-r from-transparent via-violet-200/10 to-transparent mix-blend-overlay [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    </div>
  );
}
