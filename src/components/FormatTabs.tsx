"use client";

import type { LeaderboardFormat } from "@/lib/types";

interface FormatTabsProps {
  selected: LeaderboardFormat;
  onSelect: (format: LeaderboardFormat) => void;
}

type Scoring = "stb" | "sp";
type Basis = "netto" | "brutto";

function parse(format: LeaderboardFormat): { scoring: Scoring; basis: Basis } {
  const [scoring, basis] = format.split("_") as [Scoring, Basis];
  return { scoring, basis };
}

export function FormatTabs({ selected, onSelect }: FormatTabsProps) {
  const { scoring, basis } = parse(selected);

  return (
    <div className="flex items-center gap-1.5">
      <Segmented
        value={scoring}
        options={[
          { value: "stb", label: "Stableford" },
          { value: "sp", label: "Stroke" },
        ]}
        onSelect={(v) => onSelect(`${v}_${basis}` as LeaderboardFormat)}
      />
      <Segmented
        value={basis}
        options={[
          { value: "netto", label: "Net" },
          { value: "brutto", label: "Gross" },
        ]}
        onSelect={(v) => onSelect(`${scoring}_${v}` as LeaderboardFormat)}
      />
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onSelect,
}: {
  value: T;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex shrink-0 gap-0.5 rounded-full bg-neutral-100 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
              active ? "bg-tour-ink text-white" : "text-neutral-500 hover:text-tour-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
