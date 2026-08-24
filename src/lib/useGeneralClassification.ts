"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ROUNDS, MIN_ROUNDS_FOR_GENERAL } from "@/lib/config";
import { mapWithConcurrency } from "@/lib/concurrency";
import { normalizeName } from "@/lib/useFollowedPlayer";
import type {
  Gender,
  GeneralPlayerEntry,
  GeneralRoundEntry,
  LivescoreItem,
  ScorecardResponse,
} from "@/lib/types";

const HOLE_COUNT = 9;

interface Accumulator {
  firstName: string;
  lastName: string;
  club: string;
  gender: Gender;
  countrySymbol: string;
  hcp: string;
  rounds: GeneralRoundEntry[];
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function useGeneralClassification() {
  const [entries, setEntries] = useState<GeneralPlayerEntry[]>([]);
  const [holePar, setHolePar] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const runIdRef = useRef(0);

  const load = useCallback(async () => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setError(null);
    setProgress({ done: 0, total: 0 });

    try {
      const perRound = await Promise.all(
        ROUNDS.map(async (round) => {
          const data = await fetchJson<{ items: LivescoreItem[] }>(
            `/api/livescore?id=${round.id}&format=sp_brutto&classification=0`
          );
          return { round, items: data?.items ?? [] };
        })
      );

      if (runIdRef.current !== runId) return;

      type Task = { roundId: number; roundLabel: string; item: LivescoreItem };
      const tasks: Task[] = [];
      for (const { round, items } of perRound) {
        for (const item of items) {
          tasks.push({ roundId: round.id, roundLabel: round.label, item });
        }
      }

      setProgress({ done: 0, total: tasks.length });

      const parByHole: number[] = [];
      const byPlayer = new Map<string, Accumulator>();

      // Pre-fill every player with a "not played" slot for every round so the
      // detail grid always shows the full Round I..Final structure.
      const ensurePlayer = (item: LivescoreItem) => {
        const key = normalizeName(`${item.first_name} ${item.last_name}`);
        let acc = byPlayer.get(key);
        if (!acc) {
          acc = {
            firstName: item.first_name.trim(),
            lastName: item.last_name.trim(),
            club: item.club,
            gender: item.gender,
            countrySymbol: item.country_symbol,
            hcp: item.hcp,
            rounds: ROUNDS.map((r) => ({
              roundId: r.id,
              roundLabel: r.label,
              played: false,
              strokes: new Array(HOLE_COUNT).fill(null),
              total: null,
            })),
          };
          byPlayer.set(key, acc);
        }
        return acc;
      };

      for (const { items } of perRound) {
        for (const item of items) ensurePlayer(item);
      }

      let done = 0;
      await mapWithConcurrency(tasks, 8, async (task) => {
        const data = await fetchJson<ScorecardResponse>(
          `/api/scorecard?player_id=${task.item.player_id}`
        );
        if (runIdRef.current !== runId) return;
        done += 1;
        setProgress({ done, total: tasks.length });

        const holes = data?.scorecard?.rounds?.[0]?.holes_out;
        if (!holes || holes.length === 0) return;

        holes.forEach((h, idx) => {
          const par = Number(h.par);
          if (!Number.isNaN(par) && parByHole[idx] === undefined) parByHole[idx] = par;
        });

        const key = normalizeName(`${task.item.first_name} ${task.item.last_name}`);
        const acc = byPlayer.get(key);
        if (!acc) return;
        const roundEntry = acc.rounds.find((r) => r.roundId === task.roundId);
        if (!roundEntry) return;

        const strokes = holes.map((h) => {
          const n = Number(h.strokes);
          return Number.isNaN(n) || n === 0 ? null : n;
        });
        roundEntry.played = strokes.some((s) => s !== null);
        roundEntry.strokes = strokes;
        roundEntry.total = strokes.every((s) => s !== null)
          ? strokes.reduce((sum, s) => sum + (s as number), 0)
          : null;
      });

      if (runIdRef.current !== runId) return;

      const result: GeneralPlayerEntry[] = [];
      byPlayer.forEach((acc, key) => {
        const playedRounds = acc.rounds.filter((r) => r.played);
        const roundsPlayed = playedRounds.length;
        const bestPerHole: (number | null)[] = new Array(HOLE_COUNT).fill(null);
        for (let hole = 0; hole < HOLE_COUNT; hole++) {
          let best: number | null = null;
          for (const r of playedRounds) {
            const v = r.strokes[hole];
            if (v !== null && (best === null || v < best)) best = v;
          }
          bestPerHole[hole] = best;
        }
        const qualified = roundsPlayed >= MIN_ROUNDS_FOR_GENERAL;
        const total = bestPerHole.every((v) => v !== null)
          ? (bestPerHole as number[]).reduce((sum, v) => sum + v, 0)
          : Number.POSITIVE_INFINITY;

        result.push({
          key,
          firstName: acc.firstName,
          lastName: acc.lastName,
          club: acc.club,
          gender: acc.gender,
          countrySymbol: acc.countrySymbol,
          hcp: acc.hcp,
          roundsPlayed,
          qualified,
          rounds: acc.rounds,
          bestPerHole,
          total,
          position: 0,
        });
      });

      result.sort((a, b) => {
        if (a.qualified !== b.qualified) return a.qualified ? -1 : 1;
        return a.total - b.total;
      });

      let rank = 0;
      let lastTotal: number | null = null;
      result.forEach((entry, idx) => {
        if (!entry.qualified) {
          entry.position = 0;
          return;
        }
        if (entry.total !== lastTotal) {
          rank = idx + 1;
          lastTotal = entry.total;
        }
        entry.position = rank;
      });

      setEntries(result);
      setHolePar(parByHole);
      setLoaded(true);
    } catch {
      if (runIdRef.current === runId) setError("Couldn't build the general classification.");
    } finally {
      if (runIdRef.current === runId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { entries, holePar, loading, error, loaded, progress, refresh: load };
}
