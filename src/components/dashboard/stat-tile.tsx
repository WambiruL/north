import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Mark } from "@/components/ui/mark";
import type { MarkProps } from "@/components/ui/mark";

export interface StatTileProps {
  label: string;
  value: string;
  detail?: string;
  href: string;
  tone?: NonNullable<MarkProps["tone"]>;
}

export function StatTile({ label, value, detail, href, tone = "teal" }: StatTileProps) {
  return (
    <Link href={href} className="block min-w-0">
      <Card className="flex h-full min-w-0 flex-col gap-2 p-5 transition-colors hover:border-teal">
        <div className="flex items-center gap-2">
          <Mark tone={tone} size={7} />
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-muted">
            {label}
          </span>
        </div>
        <div className="break-words font-display text-[22px] font-semibold text-ink sm:text-[26px] md:text-[30px]">
          {value}
        </div>
        {detail && <div className="truncate text-[12.5px] text-faint">{detail}</div>}
      </Card>
    </Link>
  );
}
