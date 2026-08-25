import type { MarkProps } from "@/components/ui/mark";

export interface SpaceDef {
  key: string;
  label: string;
  href: string;
  preview: string;
  tone: NonNullable<MarkProps["tone"]>;
}

export const ALL_SPACES: SpaceDef[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", preview: "Where your life stands", tone: "amber" },
  { key: "check-ins", label: "Check-ins", href: "/check-ins", preview: "How the day is sitting", tone: "amber" },
  { key: "notes", label: "Notes", href: "/notes", preview: "Things worth writing down", tone: "muted" },
  { key: "collections", label: "Collections", href: "/collections", preview: "Lists that stop circling", tone: "muted" },
  { key: "learning", label: "Learning", href: "/learning", preview: "Your library", tone: "teal" },
  { key: "work", label: "Work", href: "/work", preview: "What moves work forward", tone: "teal" },
  { key: "finances", label: "Finances", href: "/finances", preview: "Your financial compass", tone: "teal" },
  { key: "hobbies", label: "Hobbies", href: "/hobbies", preview: "Rooms in the house", tone: "mahogany" },
  {
    key: "creative-studio",
    label: "Creative Studio",
    href: "/creative-studio",
    preview: "Where ideas become things",
    tone: "mahogany",
  },
  { key: "dream-life", label: "Dream Life", href: "/dream-life", preview: "The life you're building", tone: "mahogany" },
  { key: "settings", label: "Settings", href: "/settings", preview: "Your account", tone: "muted" },
];

export function spaceByKey(key: string): SpaceDef | undefined {
  return ALL_SPACES.find((s) => s.key === key);
}
