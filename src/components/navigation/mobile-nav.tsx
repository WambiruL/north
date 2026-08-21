"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, PenLine, Compass, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/constants/nav";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Mark } from "@/components/ui/mark";

const PRIMARY = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Check-ins", href: "/check-ins", icon: PenLine },
  { label: "Dream Life", href: "/dream-life", icon: Compass },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-raise/95 px-2 py-2 backdrop-blur md:hidden">
        {PRIMARY.map(({ label, href, icon: Icon }) => {
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
