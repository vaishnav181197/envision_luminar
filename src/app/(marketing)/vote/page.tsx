"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VoteEntryPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    const res = await fetch("/api/auth/student/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as {
      error?: string;
      provider?: string;
      devHint?: string;
    };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Unable to send a code");
      return;
    }
    setStep("otp");
    setInfo(
      data.provider === "console"
        ? `Dev mode: check the server console for the code sent to ${email.trim().toLowerCase()}.`
        : `We sent a 6-digit code to ${email.trim().toLowerCase()}.`,
    );
  };

  const verifyCode = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/student/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = (await res.json()) as { error?: string; redirectTo?: string };
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Unable to verify that code");
      return;
    }
    window.location.assign(data.redirectTo ?? "/gallery");
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Envision</span>
          </Link>

          <h1 className="text-center text-2xl font-bold text-white">Enter voting</h1>
          <p className="mt-2 text-center text-sm text-white/50">
            Use the admission email your institute registered. We will email a
            6-digit code to that inbox.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void (step === "email" ? requestCode() : verifyCode());
            }}
            className="mt-8 space-y-4 [&_label]:text-white/80"
          >
            <Input
              label="Registered email"
              type="email"
              placeholder="you@institute.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={step === "otp"}
            />
            {step === "otp" && (
              <Input
                label="6-digit code"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                maxLength={6}
                autoComplete="one-time-code"
              />
            )}
            {info && (
              <p className="text-sm text-primary-300" role="status">
                {info}
              </p>
            )}
            {error && (
              <p className="text-sm text-error-500" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {step === "email" ? "Send code" : "Verify and continue"}
            </Button>
            {step === "otp" && (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white/70"
                  disabled={loading}
                  onClick={() => void requestCode()}
                >
                  Resend code
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white/50"
                  disabled={loading}
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError(null);
                    setInfo(null);
                  }}
                >
                  Use a different email
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
