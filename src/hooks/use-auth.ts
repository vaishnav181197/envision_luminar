"use client";

import { useCallback, useEffect, useState } from "react";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
  batch: string | null;
}

interface VoterSession {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [voter, setVoter] = useState<VoterSession | null>(null);
  const [loading, setLoading] = useState(true);

  const applyMePayload = useCallback(
    (data: {
      user?: AuthUser;
      voter?: { id: string; email: string; role?: "student" };
    }) => {
      if (data.user?.role === "admin") {
        setUser(data.user);
        setVoter(null);
        return;
      }

      setUser(null);

      if (data.voter) {
        setVoter({ id: data.voter.id, email: data.voter.email });
      } else {
        setVoter(null);
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) {
        setUser(null);
        setVoter(null);
        return;
      }
      const data = (await res.json()) as {
        user?: AuthUser;
        voter?: { id: string; email: string; role: "student" };
      };
      applyMePayload(data);
    } catch {
      setUser(null);
      setVoter(null);
    } finally {
      setLoading(false);
    }
  }, [applyMePayload]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/me");
        if (cancelled) return;
        if (!res.ok) {
          setUser(null);
          setVoter(null);
          return;
        }
        const data = (await res.json()) as {
          user?: AuthUser;
          voter?: { id: string; email: string; role: "student" };
        };
        if (cancelled) return;
        applyMePayload(data);
      } catch {
        if (!cancelled) {
          setUser(null);
          setVoter(null);
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
  }, [applyMePayload]);

  const isAdmin = user?.role === "admin";
  const isVoter = Boolean(voter) && !isAdmin;

  return {
    user,
    voter,
    loading,
    isAdmin,
    isVoter,
    refresh,
  };
}
