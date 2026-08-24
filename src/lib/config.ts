export interface RoundConfig {
  id: number;
  label: string;
}

/**
 * Known tournament ids for the Beginners League 2026 series (eagle.polski.golf).
 * Fresh round names/dates/status are always fetched live from the API;
 * these labels are only used as a fallback while that request is loading.
 */
export const ROUNDS: RoundConfig[] = [
  { id: 14128, label: "Round I" },
  { id: 14129, label: "Round II" },
  { id: 14130, label: "Round III" },
  { id: 14131, label: "Round IV" },
  { id: 14132, label: "Final" },
];

export const DEFAULT_ROUND_ID = ROUNDS[ROUNDS.length - 1].id;

/** Minimum number of rounds a player must complete (regulation) to count in the general classification. */
export const MIN_ROUNDS_FOR_GENERAL = 3;

export const EAGLE_API_BASE = "https://eagle.polski.golf/api";
