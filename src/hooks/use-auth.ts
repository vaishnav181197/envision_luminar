"use client";

import { useCallback, useEffect, useState } from "react";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
  batch: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as {
        user?: AuthUser;
        voter?: { id: string; email: string; role: "student" };
      };
      if (data.user) {
        setUser(data.user);
        return;
      }
      if (data.voter) {
        setUser({
          id: data.voter.id,
          email: data.voter.email,
          name: data.voter.email,
          role: "student",
          batch: null,
        });
        return;
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/me");
        if (cancelled) return;
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = (await res.json()) as {
          user?: AuthUser;
          voter?: { id: string; email: string; role: "student" };
        };
        if (cancelled) return;
        if (data.user) {
          setUser(data.user);
          return;
        }
        if (data.voter) {
          setUser({
            id: data.voter.id,
            email: data.voter.email,
            name: data.voter.email,
            role: "student",
            batch: null,
          });
          return;
        }
        setUser(null);
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading, isAdmin: user?.role === "admin", refresh };
}
