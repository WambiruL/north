"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/constants/nav";
import { Mark } from "@/components/ui/mark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/server/actions/auth";

export interface SidebarProps {
  fullName: string;
  city: string | null;
  avatarUrl: string | null;
}

export function Sidebar({ fullName, city, avatarUrl }: SidebarProps) {
  const pathname = usePathname();
  const initial = fullName.trim().charAt(0).toUpperCase() || "N";

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col justify-between bg-nav px-4 py-6 text-nav-ink md:flex">
      <div className="flex flex-col gap-8">
        <Link href="/dashboard" className="px-2 font-display text-[22px] font-semibold italic">
          North
        </Link>

        <nav className="flex flex-col gap-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-0.5">
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[.16em] text-nav-muted">
                {group.label}
              </div>
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13.5px] font-semibold transition-colors",
                      active ? "bg-white/10 text-nav-ink" : "text-nav-muted hover:bg-white/5 hover:text-nav-ink",
                    )}
                  >
                    <Mark tone={item.tone} size={6} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}

          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13.5px] font-semibold transition-colors",
              pathname.startsWith("/settings")
                ? "bg-white/10 text-nav-ink"
                : "text-nav-muted hover:bg-white/5 hover:text-nav-ink",
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2.5 border-t border-nav-line pt-4">
        <Avatar className="h-[34px] w-[34px] border-white/20">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
          <AvatarFallback className="bg-white/10 text-nav-ink">{initial}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-bold leading-tight">{fullName || "You"}</div>
          {city && <div className="truncate text-[11.5px] text-nav-muted">{city}</div>}
        </div>
        <form action={signOut}>
          <button
            type="submit"
            title="Sign out"
            className="rounded-[8px] px-2 py-1.5 text-[11.5px] font-bold text-nav-muted transition-colors hover:text-amber"
          >
            Exit
          </button>
        </form>
      </div>
    </aside>
  );
}
