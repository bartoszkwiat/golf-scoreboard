"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LeaderboardFormat, LivescoreItem } from "@/lib/types";

const POLL_INTERVAL_MS = 30_000;

export function useLivescore(roundId: number, format: LeaderboardFormat, enabled = true) {
  const [items, setItems] = useState<LivescoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const requestKeyRef = useRef<string>("");

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      const key = `${roundId}:${format}`;
      requestKeyRef.current = key;
      if (!opts?.silent) setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/livescore?id=${roundId}&format=${format}&classification=0`,
          { cache: "no-store" }
        );
        if (requestKeyRef.current !== key) return;
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const data = await res.json();
        if (requestKeyRef.current !== key) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setLastUpdated(new Date());
      } catch {
        if (requestKeyRef.current !== key) return;
        setError("Couldn't load live scores. Retrying shortly.");
      } finally {
        if (requestKeyRef.current === key) setLoading(false);
      }
    },
    [roundId, format]
  );

  useEffect(() => {
    if (!enabled) return;
    load();
    const interval = setInterval(() => load({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load, enabled]);

  return { items, loading, error, lastUpdated, refresh: () => load({ silent: true }) };
}
