"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UserPlus, Search, X } from "lucide-react";
import type { FollowedPlayer, LivescoreItem } from "@/lib/types";
import { fullName } from "@/lib/format";
import { normalizeName, isFollowing } from "@/lib/useFollowedPlayer";

interface FollowControlProps {
  items: LivescoreItem[];
  followed: FollowedPlayer[];
  onFollow: (player: FollowedPlayer) => void;
}

export function FollowControl({ items, followed, onFollow }: FollowControlProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = normalizeName(query);
    const seen = new Set<string>();
    const unique: LivescoreItem[] = [];
    for (const item of items) {
      const key = normalizeName(fullName(item.first_name, item.last_name));
      if (seen.has(key)) continue;
      if (q && !key.includes(q)) continue;
      seen.add(key);
      unique.push(item);
      if (unique.length >= 8) break;
    }
    return unique;
  }, [items, query]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-tour-line bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 shadow-sm transition-colors hover:border-tour-ink hover:text-tour-ink"
      >
        <UserPlus size={14} strokeWidth={2.25} />
        <span className="hidden sm:inline">Follow</span>
        {followed.length > 0 && (
          <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-tour-ink px-1 text-[10px] font-bold text-white">
            {followed.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-tour-line bg-white p-2.5 shadow-xl">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search player…"
              className="w-full rounded-md border border-tour-line py-1.5 pl-8 pr-2.5 text-sm outline-none focus:border-tour-ink"
            />
          </div>
          <ul className="mt-2 max-h-56 overflow-y-auto">
            {results.length === 0 && query.trim().length === 0 && (
              <li className="px-2 py-2 text-xs text-neutral-400">Start typing a name…</li>
            )}
            {results.length === 0 && query.trim().length > 0 && (
              <li>
                <button
                  onClick={() => {
                    const [firstName, ...rest] = query.trim().split(" ");
                    onFollow({ firstName, lastName: rest.join(" ") || "" });
                    setQuery("");
                  }}
                  className="w-full rounded-md px-2 py-1.5 text-left text-sm text-tour-red hover:bg-neutral-50"
                >
                  Follow &ldquo;{query.trim()}&rdquo;
                </button>
              </li>
            )}
            {results.map((item) => {
              const already = isFollowing(followed, item.first_name, item.last_name);
              return (
                <li key={item.player_id}>
                  <button
                    disabled={already}
                    onClick={() => {
                      onFollow({
                        firstName: item.first_name.trim(),
                        lastName: item.last_name.trim(),
                      });
                      setQuery("");
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      already ? "cursor-default opacity-40" : "hover:bg-neutral-50"
                    }`}
                  >
                    <span className="font-medium text-tour-ink">
                      {fullName(item.first_name, item.last_name)}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {already ? "Following" : item.club}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function FollowedChips({
  followed,
  onUnfollow,
  onClearAll,
}: {
  followed: FollowedPlayer[];
  onUnfollow: (p: FollowedPlayer) => void;
  onClearAll: () => void;
}) {
  if (followed.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {followed.map((p) => (
        <span
          key={normalizeName(`${p.firstName} ${p.lastName}`)}
          className="flex items-center gap-1.5 rounded-full border border-tour-gold/25 bg-tour-gold/[0.08] px-2.5 py-1 text-xs font-medium text-tour-ink"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-tour-gold" aria-hidden />
          {p.firstName} {p.lastName}
          <button
            onClick={() => onUnfollow(p)}
            aria-label={`Stop following ${p.firstName} ${p.lastName}`}
            className="text-neutral-400 hover:text-tour-ink"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      {followed.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-neutral-400 hover:text-tour-ink"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
