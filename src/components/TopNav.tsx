"use client";

import { Flag, ListOrdered, Trophy } from "lucide-react";

export type ViewMode = "leaderboard" | "general";

interface TopNavProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
  live: boolean;
}

export function TopNav({ view, onChange, live }: TopNavProps) {
  return (
    <div className="border-b border-white/10">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tour-green">
            <Flag size={16} strokeWidth={2.5} className="text-white" fill="white" />
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-white">
              Beginners League
              {live && (
                <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-tour-red" />
              )}
            </div>
          </div>
        </div>

        <nav className="flex gap-0.5 rounded-full bg-white/5 p-1">
          <NavButton
            active={view === "leaderboard"}
            onClick={() => onChange("leaderboard")}
            icon={<ListOrdered size={14} strokeWidth={2.25} />}
            label="Leaderboard"
          />
          <NavButton
            active={view === "general"}
            onClick={() => onChange("general")}
            icon={<Trophy size={14} strokeWidth={2.25} />}
            label="Overall"
          />
        </nav>
      </div>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-white text-tour-ink shadow-sm" : "text-neutral-300 hover:text-white"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
