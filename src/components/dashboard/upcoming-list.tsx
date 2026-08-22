import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export interface UpcomingItem {
  when: string;
  what: string;
  detail: string;
}

export function UpcomingList({ items }: { items: UpcomingItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing on the horizon"
        description="Due dates and target dates across North will show up here."
      />
    );
  }

  return (
    <Card className="p-7">
      <div className="relative pl-6">
        <div className="absolute bottom-1.5 left-1 top-1.5 w-px bg-line" />
        <div className="flex flex-col gap-5">
          {items.map((item, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[22px] top-1.5 h-2 w-2 rounded-full bg-amber" />
              <div className="mb-1 text-[12px] font-bold uppercase tracking-wide text-amber">
                {format(parseISO(item.when), "d MMM")}
              </div>
              <div className="text-[15px] font-bold leading-snug text-ink">{item.what}</div>
              <div className="mt-0.5 text-[12.5px] text-muted">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
