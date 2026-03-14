export const CATEGORIES = [
  "Technology",
  "AI",
  "Science",
  "Economics",
  "Philosophy",
  "Startups",
  "Politics",
  "Society",
  "Environment",
  "Health",
] as const;

export type Category = (typeof CATEGORIES)[number];

export enum DebateSide {
  PRO = "PRO",
  CON = "CON",
}

export enum VoteType {
  UP = "UP",
  DOWN = "DOWN",
  EVIDENCE = "EVIDENCE",
}

export const REPUTATION_LEVELS = [
  { min: 0, max: 99, label: "Novice", color: "text-slate-400" },
  { min: 100, max: 499, label: "Debater", color: "text-blue-400" },
  { min: 500, max: 999, label: "Advocate", color: "text-indigo-400" },
  { min: 1000, max: 4999, label: "Expert", color: "text-purple-400" },
  { min: 5000, max: 9999, label: "Master", color: "text-amber-400" },
  { min: 10000, max: Infinity, label: "Legend", color: "text-orange-400" },
];

export function getReputationLevel(score: number) {
  return (
    REPUTATION_LEVELS.find((l) => score >= l.min && score <= l.max) ||
    REPUTATION_LEVELS[0]
  );
}
