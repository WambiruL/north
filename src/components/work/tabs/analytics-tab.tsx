import { usd } from "@/components/work/shared";

export interface WorkAnalytics {
  activeProjects: number;
  totalProjects: number;
  outstanding: number;
  paidTotal: number;
  winsThisQuarter: number;
  totalWins: number;
  jobApplications: number;
  interviewing: number;
  openOpportunities: number;
}

export function AnalyticsTab({ analytics }: { analytics: WorkAnalytics }) {
  const tiles: { head: string; sub: string }[] = [
    {
      head: `${analytics.activeProjects} active`,
      sub: `${analytics.totalProjects} project${analytics.totalProjects === 1 ? "" : "s"} total, across every status.`,
    },
    {
      head: usd.format(analytics.outstanding),
      sub: "Invoiced but not yet paid.",
    },
    {
      head: usd.format(analytics.paidTotal),
      sub: "Paid, all time.",
    },
    {
      head: `${analytics.winsThisQuarter} win${analytics.winsThisQuarter === 1 ? "" : "s"}`,
      sub: `Logged this quarter, ${analytics.totalWins} all time.`,
    },
    {
      head: `${analytics.jobApplications} application${analytics.jobApplications === 1 ? "" : "s"}`,
      sub: `${analytics.interviewing} at the interview stage.`,
    },
    {
      head: `${analytics.openOpportunities} open`,
      sub: "Freelance leads and collaborations still in motion.",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {tiles.map((tile) => (
          <div key={tile.sub} className="rounded-[18px] border border-line bg-surface p-8 shadow-north-sm">
            <div className="mb-2 text-[24px] font-bold tracking-tight text-ink">{tile.head}</div>
            <div className="text-[14.5px] leading-relaxed text-muted">{tile.sub}</div>
          </div>
        ))}
      </div>
      <div className="rounded-[18px] border border-line bg-surface-2 p-8">
        <p className="max-w-[44em] text-[16.5px] leading-relaxed text-ink">
          Numbers here are for noticing, not for grading.
        </p>
      </div>
    </div>
  );
}
