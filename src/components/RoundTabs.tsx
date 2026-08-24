"use client";

import type { RoundInfo } from "@/lib/useRounds";
import { isRoundStarted } from "@/lib/useRounds";

interface RoundTabsProps {
  rounds: RoundInfo[];
  selectedId: number;
  onSelect: (id: number) => void;
}

export function RoundTabs({ rounds, selectedId, onSelect }: RoundTabsProps) {
  return (
    <div className="flex justify-center gap-1 overflow-x-auto scrollbar-none px-4 sm:px-6">
      {rounds.map((round) => {
        const active = round.id === selectedId;
        const started = isRoundStarted(round.tournament);
        return (
          <button
            key={round.id}
            onClick={() => onSelect(round.id)}
            className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[13px] font-medium tracking-wide transition-colors ${
              active ? "text-white" : started ? "text-white/50 hover:text-white/80" : "text-white/25"
            }`}
          >
            {round.label}
            {active && <span className="absolute inset-x-2 -bottom-px h-[2px] bg-tour-gold" />}
          </button>
        );
      })}
    </div>
  );
}
