"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        redirectTo: requestedRedirect,
      }),
    });

    const data = (await res.json()) as { error?: string; redirectTo?: string };

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Unable to sign in");
      return;
    }

    window.location.assign(data.redirectTo ?? "/admin");
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

          <h1 className="text-center text-2xl font-bold text-white">Admin sign in</h1>
          <p className="mt-2 text-center text-sm text-white/50">
            Sign in with the preset admin email and password to open the dashboard.
          </p>

          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="mt-8 space-y-4 [&_label]:text-white/80"
          >
            <Input
              label="Email"
              type="email"
              placeholder="envisionluminar@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="text-sm text-error-500" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            Student voter?{" "}
            <Link href="/vote" className="text-primary-300 hover:underline">
              Enter with your registered email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
