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
    <Link href={href}>
      <Card className="flex h-full flex-col gap-2 p-5 transition-colors hover:border-teal">
        <div className="flex items-center gap-2">
          <Mark tone={tone} size={7} />
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-muted">
            {label}
          </span>
        </div>
        <div className="font-display text-[30px] font-semibold text-ink">{value}</div>
        {detail && <div className="text-[12.5px] text-faint">{detail}</div>}
      </Card>
    </Link>
  );
}
