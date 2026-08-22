const TONES = ["teal", "amber", "mahogany"] as const;
export type HobbyTone = (typeof TONES)[number];

/** Deterministic tone for a hobby's mark, derived from its id (not stored). */
export function hobbyTone(id: string): HobbyTone {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

/** One or two-letter monogram derived from the hobby's real name. */
export function hobbyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
