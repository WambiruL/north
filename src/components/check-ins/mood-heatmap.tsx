import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { moodBucketColor, moodLevel } from "@/lib/constants/mood";
import type { MoodGridCell } from "@/services/check-ins";

export function MoodHeatmap({ cells }: { cells: MoodGridCell[] }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="text-[11px] font-bold uppercase tracking-wider text-faint">Last 5 weeks</div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell) => (
          <div
            key={cell.date}
            title={
              cell.mood != null
                ? `${format(parseISO(cell.date), "d MMM")} · ${moodLevel(cell.mood).label}`
                : format(parseISO(cell.date), "d MMM")
            }
            className="aspect-square rounded-[4px]"
            style={{
              backgroundColor: cell.mood != null ? moodBucketColor(cell.mood) : "var(--surface-2)",
              opacity: cell.mood != null ? 1 : 0.6,
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3.5 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-amber" />
          Bright
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-teal" />
          Steady
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-mahogany" />
          Heavy
        </span>
      </div>
    </Card>
  );
}
