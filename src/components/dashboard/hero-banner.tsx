import Link from "next/link";
import { longDateInTimezone } from "@/lib/timezone";

export function HeroBanner({
  greeting,
  name,
  city,
  today,
  timezone,
}: {
  greeting: string;
  name: string;
  city: string | null;
  today: Date;
  timezone: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-nav px-8 py-11 text-nav-ink sm:px-12">
      <div
        className="pointer-events-none absolute -right-40 -top-36 h-[420px] w-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,125,0,.22), transparent 66%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-28 h-[360px] w-[360px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(21,97,109,.4), transparent 68%)" }}
      />
      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center gap-3.5 text-[11.5px] font-extrabold uppercase tracking-[.14em] text-nav-muted">
          <span className="text-amber">{longDateInTimezone(timezone, today)}</span>
          {city && (
            <>
              <span className="h-1 w-1 rounded-full bg-nav-muted" />
              <span>{city}</span>
            </>
          )}
        </div>
        <h1 className="max-w-[16em] text-[38px] font-extrabold leading-[1.1] tracking-tight sm:text-[46px]">
          {greeting}, {name}.
        </h1>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Link
            href="/notes?new=note"
            className="rounded-[12px] border border-nav-line bg-white/10 px-5 py-3 text-[13.5px] font-bold transition-transform hover:-translate-y-0.5"
          >
            New note
          </Link>
          <Link
            href="/finances"
            className="rounded-[12px] border border-nav-line bg-white/10 px-5 py-3 text-[13.5px] font-bold transition-transform hover:-translate-y-0.5"
          >
            Log an expense
          </Link>
          <Link
            href="/career"
            className="rounded-[12px] border border-nav-line bg-white/10 px-5 py-3 text-[13.5px] font-bold transition-transform hover:-translate-y-0.5"
          >
            Open career
          </Link>
        </div>
      </div>
    </div>
  );
}
