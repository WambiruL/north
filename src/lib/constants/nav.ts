import type { MarkProps } from "@/components/ui/mark";

export interface NavItem {
  label: string;
  href: string;
  tone: NonNullable<MarkProps["tone"]>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Today",
    items: [
      { label: "Dashboard", href: "/dashboard", tone: "amber" },
      { label: "Check-ins", href: "/check-ins", tone: "amber" },
    ],
  },
  {
    label: "Capture",
    items: [
      { label: "Notes", href: "/notes", tone: "muted" },
      { label: "Collections", href: "/collections", tone: "muted" },
    ],
  },
  {
    label: "Life",
    items: [
      { label: "Career", href: "/career", tone: "teal" },
      { label: "Learning", href: "/learning", tone: "teal" },
      { label: "Work", href: "/work", tone: "teal" },
      { label: "Finances", href: "/finances", tone: "teal" },
    ],
  },
  {
    label: "Self",
    items: [
      { label: "Hobbies", href: "/hobbies", tone: "mahogany" },
      { label: "Creative Studio", href: "/creative-studio", tone: "mahogany" },
      { label: "Dream Life", href: "/dream-life", tone: "mahogany" },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
