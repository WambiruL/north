"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  PenLine,
  StickyNote,
  ListChecks,
  BookOpen,
  Briefcase,
  Wallet,
  Sparkles,
  Palette,
  Compass,
  Settings as SettingsIcon,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/constants/nav";
import { spaceByKey, type SpaceDef } from "@/lib/constants/spaces";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Mark } from "@/components/ui/mark";
import { WorkspaceSwitcher } from "@/components/navigation/workspace-switcher";
import type { Tables } from "@/types/database.types";

const SPACE_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutGrid,
  "check-ins": PenLine,
  notes: StickyNote,
  collections: ListChecks,
  learning: BookOpen,
  work: Briefcase,
  finances: Wallet,
  hobbies: Sparkles,
  "creative-studio": Palette,
  "dream-life": Compass,
  settings: SettingsIcon,
};

const HOME_KEY = "dashboard";
const FALLBACK_KEYS = ["check-ins", "work"];

/** Dashboard is always the first tab (home); the rest follow the user's own pins, in pinned order. Any slot left empty (nothing pinned, or fewer than two pins) falls back to Check-ins then Work. Never fabricates a duplicate tab just to fill a slot. */
function buildPrimaryTabs(pinnedSpaces: Tables<"pinned_spaces">[]): SpaceDef[] {
  const home = spaceByKey(HOME_KEY);
  const pinned = pinnedSpaces
    .map((p) => spaceByKey(p.space_key))
    .filter((s): s is SpaceDef => s !== undefined && s.key !== HOME_KEY);

  const chosen: SpaceDef[] = [];
  for (const space of pinned) {
    if (chosen.length >= 2) break;
    if (!chosen.some((c) => c.key === space.key)) chosen.push(space);
  }

  for (const key of FALLBACK_KEYS) {
    if (chosen.length >= 2) break;
    const fallback = spaceByKey(key);
    if (fallback && fallback.key !== home?.key && !chosen.some((c) => c.key === fallback.key)) {
      chosen.push(fallback);
    }
  }

  return home ? [home, ...chosen] : chosen;
}

export function MobileNav({
  fullName,
  pinnedSpaces,
}: {
  fullName: string;
  pinnedSpaces: Tables<"pinned_spaces">[];
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = useMemo(() => buildPrimaryTabs(pinnedSpaces), [pinnedSpaces]);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-raise/95 px-2 py-2 backdrop-blur md:hidden">
        {primary.map(({ label, href, key }) => {
          const Icon = SPACE_ICONS[key] ?? LayoutGrid;
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[10px] px-3 py-1.5 text-[10.5px] font-semibold",
                active ? "text-amber" : "text-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-1 rounded-[10px] px-3 py-1.5 text-[10.5px] font-semibold text-muted"
        >
          <MoreHorizontal className="h-5 w-5" />
          More
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Everything in North</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-2 pb-4">
            <WorkspaceSwitcher fullName={fullName} pinnedSpaces={pinnedSpaces} variant="surface" />
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-2.5 rounded-[12px] border border-line bg-surface px-3.5 py-3 text-[13.5px] font-semibold text-ink"
              >
                <Mark tone={item.tone} size={7} />
                {item.label}
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-2.5 rounded-[12px] border border-line bg-surface px-3.5 py-3 text-[13.5px] font-semibold text-ink"
            >
              <Mark tone="muted" size={7} />
              Settings
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
