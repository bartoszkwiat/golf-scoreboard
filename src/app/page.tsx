"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";
import type { ViewMode } from "@/components/TopNav";
import { FormatTabs } from "@/components/FormatTabs";
import { GenderFilter, type GenderFilterValue } from "@/components/GenderFilter";
import { FollowControl } from "@/components/FollowControl";
import { FollowedPanel, type FollowedStatus } from "@/components/FollowedPanel";
import { Leaderboard } from "@/components/Leaderboard";
import { GeneralClassification } from "@/components/GeneralClassification";
import { useRounds, pickDefaultRoundId, isRoundStarted } from "@/lib/useRounds";
import { useLivescore } from "@/lib/useLivescore";
import { useFollowedPlayer, isSamePlayer } from "@/lib/useFollowedPlayer";
import { DEFAULT_ROUND_ID } from "@/lib/config";
import { FORMATS, type LeaderboardFormat } from "@/lib/types";
import { formatToPar, toParColorClass } from "@/lib/format";

export default function Home() {
  const { rounds, loading: roundsLoading } = useRounds();
  const [view, setView] = useState<ViewMode>("leaderboard");
  const [roundId, setRoundId] = useState<number>(DEFAULT_ROUND_ID);
  const [format, setFormat] = useState<LeaderboardFormat>("stb_netto");
  const [gender, setGender] = useState<GenderFilterValue>("all");
  const didAutoSelect = useRef(false);

  const { players: followed, follow, unfollow, clearAll } = useFollowedPlayer();
  const { items, loading, error, lastUpdated, refresh } = useLivescore(
    roundId,
    format,
    view === "leaderboard"
  );

  useEffect(() => {
    if (!roundsLoading && !didAutoSelect.current) {
      didAutoSelect.current = true;
      setRoundId(pickDefaultRoundId(rounds));
    }
  }, [roundsLoading, rounds]);

  const filteredItems = useMemo(() => {
    if (gender === "all") return items;
    return items.filter((i) => i.gender === gender);
  }, [items, gender]);

  const liveRoundActive = rounds.some((r) => isRoundStarted(r.tournament) && r.id === roundId);
  const formatMeta = FORMATS.find((f) => f.value === format)!;
  const scoreLabel = formatMeta.higherIsBetter ? "PTS" : "SCORE";
  const showToPar = !formatMeta.higherIsBetter;

  const followedStatuses: FollowedStatus[] = useMemo(
    () =>
      followed.map((player) => {
        const match = items.find((i) => isSamePlayer(player, i.first_name, i.last_name));
        if (!match) return { player, found: false };
        return {
          player,
          found: true,
          position: String(match.position_name),
          primaryValue: match.sum,
          primaryUnit: scoreLabel,
          secondaryValue: showToPar ? formatToPar(match.to_par) : undefined,
          secondaryColorClass: showToPar
            ? toParColorClass(match.to_par).replace("text-tour-red", "text-red-300")
            : undefined,
        };
      }),
    [followed, items, scoreLabel, showToPar]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        view={view}
        onChangeView={setView}
        rounds={rounds}
        selectedRoundId={roundId}
        onSelectRound={setRoundId}
        live={liveRoundActive}
      />

      <main className="mx-auto w-full max-w-4xl flex-1 pb-16">
        <div className="sticky top-0 z-20 bg-background/95 px-4 pb-3 pt-3 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {view === "leaderboard" ? (
              <FormatTabs selected={format} onSelect={setFormat} />
            ) : (
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                All rounds
              </span>
            )}
            <div className="flex items-center gap-2">
              <GenderFilter selected={gender} onSelect={setGender} />
              <FollowControl items={items} followed={followed} onFollow={follow} />
            </div>
          </div>
        </div>

        {view === "leaderboard" ? (
          <>
            <FollowedPanel
              statuses={followedStatuses}
              onUnfollow={unfollow}
              onClearAll={clearAll}
            />

            <div className="mx-4 mt-3 flex items-center justify-between text-[11px] text-neutral-400 sm:mx-6">
              <span>{loading ? "Loading…" : (error ?? `${filteredItems.length} players`)}</span>
              <button
                onClick={refresh}
                className="flex items-center gap-1 font-medium text-neutral-500 hover:text-tour-ink"
              >
                <RefreshCw size={11} />
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "Refresh"}
              </button>
            </div>

            <div className="mx-4 mt-2 overflow-hidden rounded-lg border border-tour-line bg-white shadow-sm sm:mx-6">
              {loading ? (
                <LeaderboardSkeleton />
              ) : (
                <Leaderboard
                  items={filteredItems}
                  format={format}
                  followed={followed}
                  onFollow={follow}
                  onUnfollow={unfollow}
                />
              )}
            </div>
          </>
        ) : (
          <GeneralClassification
            gender={gender}
            followed={followed}
            onFollow={follow}
            onUnfollow={unfollow}
            onClearAll={clearAll}
          />
        )}

        <p className="mx-4 mt-6 text-center text-[10.5px] text-neutral-300 sm:mx-6">
          Unofficial · data via eagle.polski.golf
        </p>
      </main>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-tour-line/70">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-3 w-6 rounded bg-neutral-100" />
          <div className="h-7 w-7 rounded-full bg-neutral-100" />
          <div className="h-3 flex-1 rounded bg-neutral-100" />
          <div className="h-3 w-10 rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}
