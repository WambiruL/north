import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { Tables } from "@/types/database.types";

type Season = Tables<"career_seasons">;
type Goal = Tables<"career_goals">;

export function SeasonHero({ season, goal }: { season: Season | null; goal: Goal | null }) {
  if (!season && !goal) return null;

  const title = season?.title ?? goal?.title ?? "";
  const description = season?.description ?? goal?.description ?? "";
  const progress = goal?.progress ?? 0;

  return (
    <Link
      href="/career"
      className="relative block overflow-hidden rounded-[28px] bg-nav px-9 py-10 text-nav-ink transition-transform hover:-translate-y-0.5"
    >
      <div
        className="pointer-events-none absolute -bottom-52 -right-32 h-[460px] w-[460px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,125,0,.24), transparent 66%)" }}
      />
      <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[.16em] text-nav-muted">
            The season you are in
          </div>
          <h2 className="mb-3 max-w-[20em] text-[28px] font-extrabold leading-[1.2] tracking-tight sm:text-[32px]">
            {title}
          </h2>
          {description && (
            <p className="mb-6 max-w-[32em] text-[15px] leading-relaxed text-nav-muted">{description}</p>
          )}
          {goal && (
            <>
              <div className="mb-3.5 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg,#15616D,#FF7D00)",
                  }}
                />
              </div>
              <div className="text-[13.5px] font-bold text-nav-muted">
                {progress}%{goal.next_step ? ` · next: ${goal.next_step}` : ""}
              </div>
            </>
          )}
        </div>
        {(season?.start_year || goal?.target_date) && (
          <div className="flex flex-col gap-3">
            {season?.start_year && (
              <div className="rounded-[16px] bg-white/[.06] px-5 py-4">
                <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[.13em] text-nav-muted">
                  Since
                </div>
                <div className="text-[19px] font-extrabold">{season.start_year}</div>
              </div>
            )}
            {goal?.target_date && (
              <div className="rounded-[16px] bg-white/[.06] px-5 py-4">
                <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[.13em] text-nav-muted">
                  Target
                </div>
                <div className="text-[19px] font-extrabold">{format(parseISO(goal.target_date), "MMM yyyy")}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
