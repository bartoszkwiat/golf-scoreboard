"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import type { FollowedPlayer, LivescoreItem, LeaderboardFormat } from "@/lib/types";
import { FORMATS, GENDER_LABEL } from "@/lib/types";
import {
  formatToPar,
  toParColorClass,
  fullName,
  initials,
  countryFlag,
  medalStyle,
  positionAsNumber,
} from "@/lib/format";
import { isFollowing } from "@/lib/useFollowedPlayer";
import { Scorecard } from "@/components/Scorecard";

interface LeaderboardProps {
  items: LivescoreItem[];
  format: LeaderboardFormat;
  followed: FollowedPlayer[];
  onFollow: (player: FollowedPlayer) => void;
  onUnfollow: (player: FollowedPlayer) => void;
}

export function Leaderboard({ items, format, followed, onFollow, onUnfollow }: LeaderboardProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const formatMeta = FORMATS.find((f) => f.value === format)!;
  const scoreLabel = formatMeta.higherIsBetter ? "PTS" : "SCORE";
  const showToPar = !formatMeta.higherIsBetter;

  if (items.length === 0) {
    return (
      <div className="px-4 py-16 text-center text-sm text-neutral-400">
        No scores yet for this round and category.
      </div>
    );
  }

  const toggle = (id: string) => {
    setExpandedIds((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-tour-line text-[11px] uppercase tracking-wider text-neutral-400">
          <th className="w-12 px-3 py-2 text-left font-semibold">Pos</th>
          <th className="px-2 py-2 text-left font-semibold">Player</th>
          <th className="hidden px-2 py-2 text-right font-semibold sm:table-cell">Hcp</th>
          {showToPar && <th className="w-14 px-2 py-2 text-right font-semibold">Par</th>}
          <th className="w-16 px-3 py-2 text-right font-semibold">{scoreLabel}</th>
          <th className="w-8 px-1 py-2" />
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const followingThis = isFollowing(followed, item.first_name, item.last_name);
          const isExpanded = expandedIds.has(item.player_id);
          return (
            <Row
              key={item.player_id}
              item={item}
              isFollowed={followingThis}
              isExpanded={isExpanded}
              showToPar={showToPar}
              onToggle={() => toggle(item.player_id)}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
            />
          );
        })}
      </tbody>
    </table>
  );
}

function Row({
  item,
  isFollowed,
  isExpanded,
  showToPar,
  onToggle,
  onFollow,
  onUnfollow,
}: {
  item: LivescoreItem;
  isFollowed: boolean;
  isExpanded: boolean;
  showToPar: boolean;
  onToggle: () => void;
  onFollow: (player: FollowedPlayer) => void;
  onUnfollow: (player: FollowedPlayer) => void;
}) {
  const posNum = positionAsNumber(item.position_name);
  const medal = medalStyle(posNum);
  const flag = countryFlag(item.country_symbol);

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-tour-line/70 transition-colors hover:bg-neutral-50 ${
          isFollowed ? "bg-tour-gold/[0.06]" : ""
        }`}
      >
        <td className="px-3 py-3 align-top">
          <span
            className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[12px] font-bold tabular-nums ${
              medal ? medal.badge : "text-neutral-500"
            }`}
          >
            {item.position_name}
          </span>
        </td>
        <td className="px-2 py-3 align-top">
          <div className="flex items-center gap-2.5">
            <span
              className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-500 sm:flex ${
                medal ? medal.ring : ""
              }`}
            >
              {initials(item.first_name, item.last_name)}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {flag && <span className="text-[13px] leading-none">{flag}</span>}
                <span className="truncate text-[13.5px] font-semibold text-tour-ink">
                  {fullName(item.first_name, item.last_name)}
                </span>
                {isFollowed && (
                  <Star size={12} className="shrink-0 fill-tour-gold text-tour-gold" />
                )}
              </div>
              <div className="truncate text-[11.5px] text-neutral-400">
                {item.club} · {GENDER_LABEL[item.gender]}
              </div>
            </div>
          </div>
        </td>
        <td className="hidden px-2 py-3 text-right align-top text-neutral-500 tabular-nums sm:table-cell">
          {item.hcp}
        </td>
        {showToPar && (
          <td className={`px-2 py-3 text-right align-top tabular-nums ${toParColorClass(item.to_par)}`}>
            {formatToPar(item.to_par)}
          </td>
        )}
        <td className="px-3 py-3 text-right align-top">
          <span className="text-[15px] font-bold tabular-nums text-tour-ink">{item.sum}</span>
        </td>
        <td className="px-1 py-3 text-right align-top text-neutral-300">
          <ChevronDown
            size={15}
            className={`transition-transform ${isExpanded ? "rotate-180 text-neutral-500" : ""}`}
          />
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-tour-line/70 bg-neutral-50/60">
          <td colSpan={showToPar ? 6 : 5} className="p-0">
            <div className="flex items-center justify-end px-3 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFollowed) {
                    onUnfollow({ firstName: item.first_name.trim(), lastName: item.last_name.trim() });
                  } else {
                    onFollow({ firstName: item.first_name.trim(), lastName: item.last_name.trim() });
                  }
                }}
                className={`flex items-center gap-1 text-[11px] font-semibold hover:underline ${
                  isFollowed ? "text-neutral-400" : "text-tour-ink"
                }`}
              >
                <Star size={11} className={isFollowed ? "" : "fill-tour-gold text-tour-gold"} />
                {isFollowed ? "Unfollow" : "Follow"}
              </button>
            </div>
            <Scorecard playerId={item.player_id} />
          </td>
        </tr>
      )}
    </>
  );
}
