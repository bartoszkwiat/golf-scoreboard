"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import type { FollowedPlayer, GeneralPlayerEntry } from "@/lib/types";
import { GENDER_LABEL } from "@/lib/types";
import { fullName, initials, medalStyle, countryFlag } from "@/lib/format";
import { isFollowing, isSamePlayer } from "@/lib/useFollowedPlayer";
import { useGeneralClassification } from "@/lib/useGeneralClassification";
import { MIN_ROUNDS_FOR_GENERAL, ROUNDS } from "@/lib/config";
import { GeneralClassificationDetail } from "@/components/GeneralClassificationDetail";
import { FollowedPanel, type FollowedStatus } from "@/components/FollowedPanel";
import type { GenderFilterValue } from "@/components/GenderFilter";

interface GeneralClassificationProps {
  gender: GenderFilterValue;
  followed: FollowedPlayer[];
  onFollow: (player: FollowedPlayer) => void;
  onUnfollow: (player: FollowedPlayer) => void;
  onClearAll: () => void;
}

export function GeneralClassification({
  gender,
  followed,
  onFollow,
  onUnfollow,
  onClearAll,
}: GeneralClassificationProps) {
  const { entries, holePar, loading, error, progress, refresh } = useGeneralClassification();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [showUnqualified, setShowUnqualified] = useState(false);

  const toggle = (key: string) => {
    setExpandedKeys((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = useMemo(
    () => (gender === "all" ? entries : entries.filter((e) => e.gender === gender)),
    [entries, gender]
  );
  const qualified = filtered.filter((e) => e.qualified);
  const unqualified = filtered.filter((e) => !e.qualified);
  const positionCounts = qualified.reduce<Record<number, number>>((acc, e) => {
    acc[e.position] = (acc[e.position] ?? 0) + 1;
    return acc;
  }, {});

  const followedStatuses: FollowedStatus[] = followed.map((player) => {
    const entry = entries.find((e) => isSamePlayer(player, e.firstName, e.lastName));
    if (!entry) {
      return { player, found: false, note: "no rounds yet" };
    }
    if (!entry.qualified) {
      return {
        player,
        found: false,
        note: `${entry.roundsPlayed}/${MIN_ROUNDS_FOR_GENERAL} rounds`,
      };
    }
    const tied = positionCounts[entry.position] > 1;
    return {
      player,
      found: true,
      position: tied ? `T${entry.position}` : String(entry.position),
      primaryValue: String(entry.total),
      primaryUnit: "TOTAL",
    };
  });

  return (
    <div className="mt-3">
      <FollowedPanel statuses={followedStatuses} onUnfollow={onUnfollow} onClearAll={onClearAll} />

      <div className="mx-4 mt-3 flex items-center justify-between text-[11px] text-neutral-400 sm:mx-6">
        <span>
          {loading
            ? `Loading… ${progress.done}/${progress.total || "?"}`
            : error ?? `${qualified.length} qualified`}
        </span>
        <button onClick={refresh} className="font-medium text-neutral-500 hover:text-tour-ink">
          Refresh
        </button>
      </div>

      <div className="mx-4 mt-2 overflow-hidden rounded-lg border border-tour-line bg-white sm:mx-6">
        {loading && qualified.length === 0 ? (
          <div className="animate-pulse divide-y divide-tour-line/70">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-3 w-6 rounded bg-neutral-100" />
                <div className="h-7 w-7 rounded-full bg-neutral-100" />
                <div className="h-3 flex-1 rounded bg-neutral-100" />
                <div className="h-3 w-10 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : qualified.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-neutral-400">
            No one has qualified yet.
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-tour-line text-[11px] uppercase tracking-wider text-neutral-400">
                <th className="w-12 px-3 py-2 text-left font-semibold">Pos</th>
                <th className="px-2 py-2 text-left font-semibold">Player</th>
                <th className="hidden px-2 py-2 text-right font-semibold sm:table-cell">Rounds</th>
                <th className="w-16 px-3 py-2 text-right font-semibold">Total</th>
                <th className="w-8 px-1 py-2" />
              </tr>
            </thead>
            <tbody>
              {qualified.map((entry) => (
                <Row
                  key={entry.key}
                  entry={entry}
                  holePar={holePar}
                  isTied={positionCounts[entry.position] > 1}
                  isFollowed={isFollowing(followed, entry.firstName, entry.lastName)}
                  isExpanded={expandedKeys.has(entry.key)}
                  onToggle={() => toggle(entry.key)}
                  onFollow={onFollow}
                  onUnfollow={onUnfollow}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {unqualified.length > 0 && (
        <div className="mx-4 mt-3 overflow-hidden rounded-lg border border-tour-line bg-white sm:mx-6">
          <button
            onClick={() => setShowUnqualified((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold text-neutral-500"
          >
            <span>Not yet qualified ({unqualified.length})</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${showUnqualified ? "rotate-180" : ""}`}
            />
          </button>
          {showUnqualified && (
            <ul className="divide-y divide-tour-line/70">
              {unqualified
                .sort((a, b) => b.roundsPlayed - a.roundsPlayed)
                .map((entry) => (
                  <li
                    key={entry.key}
                    className="flex items-center justify-between px-4 py-2 text-sm"
                  >
                    <span className="text-tour-ink">{fullName(entry.firstName, entry.lastName)}</span>
                    <span className="text-xs text-neutral-400">
                      {entry.roundsPlayed}/{MIN_ROUNDS_FOR_GENERAL} rounds
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  entry,
  holePar,
  isTied,
  isFollowed,
  isExpanded,
  onToggle,
  onFollow,
  onUnfollow,
}: {
  entry: GeneralPlayerEntry;
  holePar: number[];
  isTied: boolean;
  isFollowed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onFollow: (player: FollowedPlayer) => void;
  onUnfollow: (player: FollowedPlayer) => void;
}) {
  const medal = entry.position <= 3 ? medalStyle(entry.position) : null;
  const flag = countryFlag(entry.countrySymbol);

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-tour-line/70 transition-colors hover:bg-neutral-50 ${
          isFollowed ? "bg-tour-gold/[0.06]" : ""
        }`}
      >
        <td className="px-3 py-2.5 align-top">
          <span
            className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[12px] font-bold ${
              medal ? medal.badge : "text-neutral-500"
            }`}
          >
            {isTied ? `T${entry.position}` : entry.position}
          </span>
        </td>
        <td className="px-2 py-2.5 align-top">
          <div className="flex items-center gap-2.5">
            <span
              className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-500 sm:flex ${
                medal ? medal.ring : ""
              }`}
            >
              {initials(entry.firstName, entry.lastName)}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {flag && <span className="text-[13px] leading-none">{flag}</span>}
                <span className="truncate text-[13.5px] font-semibold text-tour-ink">
                  {fullName(entry.firstName, entry.lastName)}
                </span>
                {isFollowed && (
                  <Star size={12} className="shrink-0 fill-tour-gold text-tour-gold" />
                )}
              </div>
              <div className="truncate text-[11.5px] text-neutral-400">
                {entry.club} · {GENDER_LABEL[entry.gender]}
              </div>
            </div>
          </div>
        </td>
        <td className="hidden px-2 py-2.5 text-right align-top text-neutral-500 sm:table-cell">
          {entry.roundsPlayed}/{ROUNDS.length}
        </td>
        <td className="px-3 py-2.5 text-right align-top">
          <span className="text-[15px] font-bold tabular-nums text-tour-ink">{entry.total}</span>
        </td>
        <td className="px-1 py-2.5 text-right align-top text-neutral-300">
          <ChevronDown
            size={15}
            className={`transition-transform ${isExpanded ? "rotate-180 text-neutral-500" : ""}`}
          />
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-tour-line/70 bg-neutral-50/60">
          <td colSpan={5} className="p-0">
            <div className="flex items-center justify-end px-3 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFollowed) onUnfollow({ firstName: entry.firstName, lastName: entry.lastName });
                  else onFollow({ firstName: entry.firstName, lastName: entry.lastName });
                }}
                className={`flex items-center gap-1 text-[11px] font-semibold hover:underline ${
                  isFollowed ? "text-neutral-400" : "text-tour-ink"
                }`}
              >
                <Star size={11} className={isFollowed ? "" : "fill-tour-gold text-tour-gold"} />
                {isFollowed ? "Unfollow" : "Follow"}
              </button>
            </div>
            <GeneralClassificationDetail entry={entry} holePar={holePar} />
          </td>
        </tr>
      )}
    </>
  );
}
