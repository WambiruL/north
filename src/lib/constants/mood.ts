export interface MoodLevel {
  value: number;
  label: string;
  tone: "mahogany" | "teal" | "amber";
}

export const MOOD_LEVELS: MoodLevel[] = [
  { value: 1, label: "Heavy", tone: "mahogany" },
  { value: 2, label: "Low", tone: "mahogany" },
  { value: 3, label: "Steady", tone: "teal" },
  { value: 4, label: "Good", tone: "teal" },
  { value: 5, label: "Bright", tone: "amber" },
];

export function moodLevel(value: number): MoodLevel {
  return MOOD_LEVELS.find((m) => m.value === value) ?? MOOD_LEVELS[2];
}

export function moodBucketColor(value: number): string {
  if (value <= 2) return "var(--mahogany)";
  if (value === 3) return "var(--teal)";
  return "var(--amber)";
}
