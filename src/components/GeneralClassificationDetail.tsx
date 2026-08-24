"use client";

import { Trophy } from "lucide-react";
import type { GeneralPlayerEntry } from "@/lib/types";

interface GeneralClassificationDetailProps {
  entry: GeneralPlayerEntry;
  holePar: number[];
}

export function GeneralClassificationDetail({ entry, holePar }: GeneralClassificationDetailProps) {
  const holeCount = holePar.length || entry.bestPerHole.length;
  const holeNumbers = Array.from({ length: holeCount }, (_, i) => i + 1);
  const parTotal = holePar.reduce((sum, p) => sum + p, 0);

  return (
    <div className="overflow-x-auto px-3 py-3">
      <table className="w-full min-w-[600px] border-collapse text-xs">
        <thead>
          <tr className="text-neutral-400">
            <td className="w-24 px-2 py-1 font-medium">Hole</td>
            {holeNumbers.map((n) => (
              <td key={n} className="px-1 py-1 text-center">
                {n}
              </td>
            ))}
            <td className="px-2 py-1 text-center font-semibold">Total</td>
          </tr>
          {holePar.length > 0 && (
            <tr className="text-neutral-400">
              <td className="px-2 py-1 font-medium">Par</td>
              {holePar.map((p, idx) => (
                <td key={idx} className="px-1 py-1 text-center">
                  {p}
                </td>
              ))}
              <td className="px-2 py-1 text-center font-semibold">{parTotal}</td>
            </tr>
          )}
        </thead>
        <tbody>
          {entry.rounds.map((round) => (
            <tr key={round.roundId} className="border-t border-tour-line/60">
              <td className="px-2 py-1.5 font-medium text-neutral-600">{round.roundLabel}</td>
              {holeNumbers.map((_, idx) => {
                const v = round.strokes[idx];
                const isBest = round.played && v !== null && v === entry.bestPerHole[idx];
                return (
                  <td key={idx} className="px-1 py-1 text-center">
                    {round.played ? (
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[13px] ${
                          isBest
                            ? "bg-tour-green font-semibold text-white ring-2 ring-tour-green ring-offset-1 ring-offset-white"
                            : "text-neutral-500"
                        }`}
                      >
                        {v ?? "—"}
                      </span>
                    ) : (
                      <span className="text-neutral-300">x</span>
                    )}
                  </td>
                );
              })}
              <td className="px-2 py-1.5 text-center font-medium text-neutral-500">
                {round.total ?? "—"}
              </td>
            </tr>
          ))}
          <tr className="border-t-2 border-tour-ink/20 bg-neutral-50">
            <td className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              <Trophy size={12} className="text-amber-500" /> Best of hole
            </td>
            {entry.bestPerHole.map((v, idx) => (
              <td key={idx} className="px-1 py-1.5 text-center font-semibold text-tour-ink">
                {v ?? "—"}
              </td>
            ))}
            <td className="px-2 py-1.5 text-center font-bold text-tour-ink">
              {Number.isFinite(entry.total) ? entry.total : "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
