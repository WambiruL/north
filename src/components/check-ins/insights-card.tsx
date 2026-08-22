import { Card } from "@/components/ui/card";
import type { Insight } from "@/services/check-ins";

export function InsightsCard({ insights }: { insights: Insight[] }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="text-[11px] font-bold uppercase tracking-wider text-faint">What North notices</div>
      {insights.length === 0 ? (
        <p className="text-[13.5px] leading-relaxed text-muted">
          Check in a few more days and North will start noticing patterns.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5 text-[13.5px] leading-relaxed">
          {insights.map((insight, i) => (
            <div key={i} className={i > 0 ? "border-t border-line-2 pt-3.5" : undefined}>
              {insight.text}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
