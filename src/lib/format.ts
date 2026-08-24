export function formatToPar(value: string | undefined): string {
  if (value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : `${n}`;
}

export function toParColorClass(value: string | undefined): string {
  if (value === undefined || value === "") return "text-neutral-400";
  const n = Number(value);
  if (Number.isNaN(n)) return "text-neutral-500";
  if (n < 0) return "text-tour-red font-semibold";
  if (n === 0) return "text-neutral-700 font-semibold";
  return "text-neutral-500";
}

export function formatHcp(value: string | undefined): string {
  if (!value) return "—";
  return value;
}

export function positionLabel(position: number | string): string {
  return String(position);
}

export function fullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, " ");
}

export function initials(firstName: string, lastName: string): string {
  const f = firstName.trim().charAt(0);
  const l = lastName.trim().charAt(0);
  return `${f}${l}`.toUpperCase();
}

export interface MedalStyle {
  badge: string;
  ring: string;
}

/** Gold / silver / bronze treatment for the top 3 leaderboard positions. */
export function medalStyle(position: number): MedalStyle | null {
  switch (position) {
    case 1:
      return { badge: "bg-amber-400 text-amber-950", ring: "ring-2 ring-amber-300" };
    case 2:
      return { badge: "bg-neutral-300 text-neutral-800", ring: "ring-2 ring-neutral-200" };
    case 3:
      return { badge: "bg-orange-300 text-orange-950", ring: "ring-2 ring-orange-200" };
    default:
      return null;
  }
}

export function positionAsNumber(position: number | string): number {
  const n = Number(String(position).replace(/^T/i, ""));
  return Number.isNaN(n) ? 0 : n;
}
