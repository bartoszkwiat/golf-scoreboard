"use client";

import { Trophy } from "lucide-react";
import type { RoundInfo } from "@/lib/useRounds";
import { RoundTabs } from "@/components/RoundTabs";
import { TopNav, type ViewMode } from "@/components/TopNav";

interface HeaderProps {
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
  rounds: RoundInfo[];
  selectedRoundId: number;
  onSelectRound: (id: number) => void;
  live: boolean;
}

export function Header({
  view,
  onChangeView,
  rounds,
  selectedRoundId,
  onSelectRound,
  live,
}: HeaderProps) {
  const selected = rounds.find((r) => r.id === selectedRoundId);
  const tournament = selected?.tournament;
  const isGeneral = view === "general";

  return (
    <header className="bg-gradient-to-b from-tour-header to-tour-header-2 text-white">
      <TopNav view={view} onChange={onChangeView} live={live} />

      <div className="mx-auto max-w-4xl px-4 pt-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl">
            {isGeneral && <Trophy size={18} className="text-tour-gold" />}
            {isGeneral
              ? "Overall Classification"
              : tournament?.name ?? selected?.label ?? "Leaderboard"}
          </h1>
          {!isGeneral && tournament && <StatusPill status={tournament.status} />}
        </div>

        <p className="mt-1 text-[12px] text-white/50">
          {isGeneral
            ? "Best score per hole across every round played"
            : [tournament?.start_date, tournament?.organizer].filter(Boolean).join(" · ") ||
              "Przytok Golf & Resort"}
        </p>
      </div>

      {!isGeneral && (
        <div className="mt-3 border-t border-white/10">
          <RoundTabs rounds={rounds} selectedId={selectedRoundId} onSelect={onSelectRound} />
        </div>
      )}
      {isGeneral && <div className="h-3.5" />}
    </header>
  );
}

function StatusPill({ status }: { status: string }) {
  const isUpcoming = status === "0";
  return (
    <span
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide ${
        isUpcoming ? "bg-white/10 text-white/60" : "bg-tour-red/20 text-red-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isUpcoming ? "bg-white/40" : "bg-tour-red"}`}
      />
      {isUpcoming ? "Upcoming" : "Live"}
    </span>
  );
}
