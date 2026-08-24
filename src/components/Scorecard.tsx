"use client";

import { useEffect, useState } from "react";
import type { ScorecardHole, ScorecardResponse } from "@/lib/types";

interface ScorecardProps {
  playerId: string;
}

function holeBadgeClass(resName: string): string {
  switch (resName) {
    case "eagle":
    case "albatross":
      return "rounded-full bg-tour-green text-white ring-2 ring-tour-green ring-offset-1 ring-offset-white font-semibold";
    case "birdie":
      return "rounded-full border-[1.5px] border-tour-green text-tour-green font-semibold";
    case "par":
      return "text-neutral-700";
    case "bogey":
      return "rounded-[3px] border-[1.5px] border-tour-red text-tour-red font-semibold";
    case "doublebogey":
    case "worse":
      return "rounded-[3px] bg-tour-red text-white ring-2 ring-tour-red ring-offset-1 ring-offset-white font-semibold";
    default:
      return "text-neutral-500";
  }
}

function HoleRow({
  holes,
  scoreKey,
  resultKey,
}: {
  holes: ScorecardHole[];
  scoreKey: "strokes";
  resultKey: "res_name";
}) {
  const total = holes.reduce((acc, h) => acc + Number(h[scoreKey] || 0), 0);
  return (
    <>
      {holes.map((h) => (
        <td key={h.number} className="px-1 py-1 text-center">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center text-[13px] ${holeBadgeClass(
              h[resultKey]
            )}`}
          >
            {h[scoreKey]}
          </span>
        </td>
      ))}
      <td className="px-2 py-1 text-center text-sm font-semibold text-tour-ink">{total}</td>
    </>
  );
}

export function Scorecard({ playerId }: ScorecardProps) {
  const [data, setData] = useState<ScorecardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/scorecard?player_id=${playerId}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  if (loading) {
    return <div className="px-4 py-3 text-xs text-neutral-400">Loading…</div>;
  }

  if (error || !data) {
    return <div className="px-4 py-3 text-xs text-neutral-400">Unavailable</div>;
  }

  return (
    <div className="overflow-x-auto px-2 py-2">
      {data.scorecard.rounds.map((round) => (
        <table key={round.no} className="w-full min-w-[560px] border-collapse text-xs">
          <thead>
            <tr className="text-neutral-400">
              <td className="px-2 py-1 font-medium">Hole</td>
              {round.holes_out.map((h) => (
                <td key={h.number} className="px-1 py-1 text-center">
                  {h.number}
                </td>
              ))}
              <td className="px-2 py-1 text-center font-semibold">OUT</td>
            </tr>
            <tr className="text-neutral-400">
              <td className="px-2 py-1 font-medium">Par</td>
              {round.holes_out.map((h) => (
                <td key={h.number} className="px-1 py-1 text-center">
                  {h.par}
                </td>
              ))}
              <td className="px-2 py-1 text-center font-semibold">
                {round.holes_out.reduce((a, h) => a + Number(h.par || 0), 0)}
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-1 text-neutral-500">Score</td>
              <HoleRow holes={round.holes_out} scoreKey="strokes" resultKey="res_name" />
            </tr>
          </tbody>
        </table>
      ))}
      <div className="mt-3 flex flex-wrap gap-3 px-2 text-[10.5px] text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-tour-green ring-2 ring-tour-green ring-offset-1 ring-offset-white" />
          Eagle+
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border-[1.5px] border-tour-green" />
          Birdie
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 border-[1.5px] border-neutral-400" /> Par
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-[2px] border-[1.5px] border-tour-red" />
          Bogey
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-[2px] bg-tour-red ring-2 ring-tour-red ring-offset-1 ring-offset-white" />
          Double+
        </span>
      </div>
    </div>
  );
}
