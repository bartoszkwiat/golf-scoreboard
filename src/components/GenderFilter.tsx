"use client";

export type GenderFilterValue = "all" | "0" | "1";

const OPTIONS: { value: GenderFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "0", label: "M" },
  { value: "1", label: "W" },
];

interface GenderFilterProps {
  selected: GenderFilterValue;
  onSelect: (value: GenderFilterValue) => void;
}

export function GenderFilter({ selected, onSelect }: GenderFilterProps) {
  return (
    <div className="flex shrink-0 gap-1 rounded-full bg-neutral-100 p-1">
      {OPTIONS.map((opt) => {
        const active = opt.value === selected;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              active
                ? "bg-white text-tour-ink shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
