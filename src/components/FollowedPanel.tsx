"use client";

import { Star, X } from "lucide-react";
import type { FollowedPlayer } from "@/lib/types";
import { normalizeName } from "@/lib/useFollowedPlayer";

export interface FollowedStatus {
  player: FollowedPlayer;
  found: boolean;
  position?: string;
  primaryValue?: string;
  primaryUnit?: string;
  secondaryValue?: string;
  secondaryColorClass?: string;
  note?: string;
}

interface FollowedPanelProps {
  statuses: FollowedStatus[];
  onUnfollow: (player: FollowedPlayer) => void;
  onClearAll: () => void;
}

export function FollowedPanel({ statuses, onUnfollow, onClearAll }: FollowedPanelProps) {
  if (statuses.length === 0) return null;

  return (
    <div className="sticky top-[88px] z-10 mx-4 mt-3 space-y-1.5 sm:mx-6 sm:top-[96px]">
      {statuses.map((status) => (
        <div
          key={normalizeName(`${status.player.firstName} ${status.player.lastName}`)}
          className="flex items-center justify-between gap-3 rounded-lg border border-tour-ink bg-tour-ink px-3.5 py-2 text-white shadow-md"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Star size={13} className="shrink-0 fill-tour-gold text-tour-gold" />
            {status.found ? (
              <>
                <span className="w-6 shrink-0 text-sm font-semibold text-white/50">
                  {status.position}
                </span>
                <span className="truncate text-sm font-semibold">
                  {status.player.firstName} {status.player.lastName}
                </span>
              </>
            ) : (
              <span className="truncate text-sm font-semibold">
                {status.player.firstName} {status.player.lastName}
                <span className="ml-1.5 font-normal text-white/40">
                  {status.note ?? "not in this field"}
                </span>
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {status.found && (
              <div className="flex items-center gap-3 text-right">
                {status.secondaryValue && (
                  <span className={`text-sm tabular-nums ${status.secondaryColorClass ?? "text-white/50"}`}>
                    {status.secondaryValue}
                  </span>
                )}
                {status.primaryValue && (
                  <span className="text-sm font-bold tabular-nums">
                    {status.primaryValue}{" "}
                    {status.primaryUnit && (
                      <span className="text-[10px] font-normal text-white/40">
                        {status.primaryUnit}
                      </span>
                    )}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => onUnfollow(status.player)}
              aria-label={`Stop following ${status.player.firstName} ${status.player.lastName}`}
              className="text-white/40 hover:text-white"
            >
              <X size={15} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      ))}
      {statuses.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={onClearAll}
            className="text-[11px] font-medium text-neutral-400 hover:text-tour-ink"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
