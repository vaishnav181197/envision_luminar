"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VoteEntryForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const enterVoting = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/student/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as { error?: string; redirectTo?: string };
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Unable to enter voting");
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
            Use the admission email your institute registered. Each listed email
            can place one vote.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void enterVoting();
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
            />
            {error && (
              <p className="text-sm text-error-500" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
