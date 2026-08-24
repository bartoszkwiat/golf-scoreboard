"use client";

import { useCallback, useEffect, useState } from "react";
import type { FollowedPlayer } from "@/lib/types";

const STORAGE_KEY = "golf-scoreboard:followed-players";
const LEGACY_STORAGE_KEY = "golf-scoreboard:followed-player";

export function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function playerKey(p: FollowedPlayer): string {
  return normalizeName(`${p.firstName} ${p.lastName}`);
}

function readStoredPlayers(): FollowedPlayer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (p): p is FollowedPlayer =>
            p && typeof p.firstName === "string" && typeof p.lastName === "string"
        );
      }
    }
    // migrate from the older single-player key, if present
    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy && typeof legacy.firstName === "string" && typeof legacy.lastName === "string") {
        return [legacy];
      }
    }
    return [];
  } catch {
    return [];
  }
}

function persist(players: FollowedPlayer[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // localStorage unavailable (private mode, quota, etc.) - keep in-memory only
  }
}

export function useFollowedPlayer() {
  const [players, setPlayers] = useState<FollowedPlayer[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPlayers(readStoredPlayers());
    setHydrated(true);
  }, []);

  const follow = useCallback((next: FollowedPlayer) => {
    setPlayers((cur) => {
      if (cur.some((p) => playerKey(p) === playerKey(next))) return cur;
      const updated = [...cur, next];
      persist(updated);
      return updated;
    });
  }, []);

  const unfollow = useCallback((target: FollowedPlayer) => {
    setPlayers((cur) => {
      const updated = cur.filter((p) => playerKey(p) !== playerKey(target));
      persist(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setPlayers([]);
    persist([]);
  }, []);

  return { players, hydrated, follow, unfollow, clearAll };
}

export function isSamePlayer(
  followed: FollowedPlayer | null | undefined,
  firstName: string,
  lastName: string
): boolean {
  if (!followed) return false;
  return (
    normalizeName(followed.firstName) === normalizeName(firstName) &&
    normalizeName(followed.lastName) === normalizeName(lastName)
  );
}

export function isFollowing(
  followed: FollowedPlayer[],
  firstName: string,
  lastName: string
): boolean {
  return followed.some((p) => isSamePlayer(p, firstName, lastName));
}
