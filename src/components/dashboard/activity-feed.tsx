import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Mark } from "@/components/ui/mark";
import { EmptyState } from "@/components/ui/empty-state";
import type { Tables } from "@/types/database.types";
import type { MarkProps } from "@/components/ui/mark";

const MODULE_TONE: Record<string, NonNullable<MarkProps["tone"]>> = {
  check_in: "amber",
  note: "muted",
  collection: "muted",
  career: "teal",
  learning: "teal",
  work: "teal",
  finance: "teal",
  hobby: "mahogany",
  creative: "mahogany",
  dream_life: "mahogany",
};

export function ActivityFeed({ activity }: { activity: Tables<"activities">[] }) {
  if (activity.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        description="Once you start capturing things across North, your recent activity shows up here."
      />
    );
  }

  return (
    <Card className="flex flex-col divide-y divide-line-2 p-0">
      {activity.map((item) => (
        <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
          <Mark tone={MODULE_TONE[item.module] ?? "muted"} size={7} className="mt-1.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] text-ink">{item.summary}</p>
            <p className="text-[11.5px] text-faint">
              {formatDistanceToNow(new Date(item.occurred_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </Card>
  );
}
