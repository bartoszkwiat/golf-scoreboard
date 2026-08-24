"use client";

import { useEffect, useState } from "react";
import { ROUNDS } from "@/lib/config";
import type { Tournament } from "@/lib/types";

export interface RoundInfo {
  id: number;
  label: string;
  tournament: Tournament | null;
}

/** "0" = not started yet, anything else = registration closed / underway */
export function isRoundStarted(tournament: Tournament | null): boolean {
  if (!tournament) return false;
  return tournament.status !== "0";
}

export function useRounds() {
  const [rounds, setRounds] = useState<RoundInfo[]>(
    ROUNDS.map((r) => ({ id: r.id, label: r.label, tournament: null }))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const results = await Promise.all(
        ROUNDS.map(async (r) => {
          try {
            const res = await fetch(`/api/tournament?id=${r.id}`, { cache: "no-store" });
            if (!res.ok) return { id: r.id, label: r.label, tournament: null };
            const data = await res.json();
            return { id: r.id, label: r.label, tournament: data.tournament ?? null };
          } catch {
            return { id: r.id, label: r.label, tournament: null };
          }
        })
      );
      if (!cancelled) {
        setRounds(results);
        setLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rounds, loading };
}

export function pickDefaultRoundId(rounds: RoundInfo[]): number {
  const started = rounds.filter((r) => isRoundStarted(r.tournament));
  if (started.length > 0) return started[started.length - 1].id;
  return rounds[0]?.id ?? ROUNDS[0].id;
}
