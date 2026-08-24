export type LeaderboardFormat = "sp_netto" | "sp_brutto" | "stb_netto" | "stb_brutto";

export const FORMATS: { value: LeaderboardFormat; label: string; short: string; higherIsBetter: boolean }[] = [
  { value: "stb_netto", label: "Stableford Netto", short: "STB Netto", higherIsBetter: true },
  { value: "stb_brutto", label: "Stableford Brutto", short: "STB Brutto", higherIsBetter: true },
  { value: "sp_netto", label: "Stroke Play Netto", short: "SP Netto", higherIsBetter: false },
  { value: "sp_brutto", label: "Stroke Play Brutto", short: "SP Brutto", higherIsBetter: false },
];

export type Gender = "0" | "1";

export const GENDER_LABEL: Record<Gender, string> = {
  "0": "Men",
  "1": "Women",
};

export interface LivescoreItem {
  player_id: string;
  country_symbol: string;
  last_name: string;
  first_name: string;
  pro: string | null;
  is_patron: boolean;
  photo: string | null;
  type: string;
  gender: Gender;
  age_group: string;
  hcp: string;
  club: string;
  to_par?: string;
  position: number | string;
  position_name: number | string;
  cut: boolean;
  sum: string;
  r: string[];
}

export interface LivescoreResponse {
  items: LivescoreItem[];
  tournament_status?: string;
}

export interface TournamentRound {
  no: string;
  course_name: string;
  date: string;
  status: string;
}

export interface TournamentClassification {
  id: string | number;
  name: string;
  spnetto?: boolean;
  spbrutto?: boolean;
  stbnetto?: boolean;
  stbbrutto?: boolean;
}

export interface Tournament {
  name: string;
  main_type: string;
  status: string;
  start_date: string;
  holes: string;
  manager: string;
  organizer: string;
  course: string;
  classifications: TournamentClassification[];
  rounds: Record<string, TournamentRound>;
}

export interface TournamentResponse {
  tournament: Tournament;
}

export interface ScorecardHole {
  number: string;
  par: string;
  strokes: string;
  length: string;
  res_name: string;
  res_name_sp_netto: string;
  sp_netto: string;
  stb_netto: string;
  stb_brutto: string;
}

export interface ScorecardRound {
  no: string;
  date: string;
  course: string;
  holes_out: ScorecardHole[];
  holes_in?: ScorecardHole[];
}

export interface ScorecardPlayer {
  last_name: string;
  first_name: string;
  hcp: string;
  club: string;
  age_group: string;
  country_symbol: string;
  photo: string | null;
}

export interface ScorecardResponse {
  player: ScorecardPlayer;
  scorecard: {
    holes: number;
    one_course: boolean;
    rounds: ScorecardRound[];
  };
}

export interface FollowedPlayer {
  firstName: string;
  lastName: string;
}

export interface GeneralHole {
  number: string;
  par: number;
}

export interface GeneralRoundEntry {
  roundId: number;
  roundLabel: string;
  played: boolean;
  strokes: (number | null)[];
  total: number | null;
}

export interface GeneralPlayerEntry {
  key: string;
  firstName: string;
  lastName: string;
  club: string;
  gender: Gender;
  countrySymbol: string;
  hcp: string;
  roundsPlayed: number;
  qualified: boolean;
  rounds: GeneralRoundEntry[];
  bestPerHole: (number | null)[];
  total: number;
  position: number;
}
