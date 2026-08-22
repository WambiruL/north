import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Mark } from "@/components/ui/mark";
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

const MODULE_LABEL: Record<string, string> = {
  check_in: "Check-in",
  note: "Notes",
  collection: "Collections",
  career: "Career",
  learning: "Learning",
  work: "Work",
  finance: "Finances",
  hobby: "Hobbies",
  creative: "Creative Studio",
  dream_life: "Dream Life",
};

const MODULE_HREF: Record<string, string> = {
  check_in: "/check-ins",
  note: "/notes",
  collection: "/collections",
  career: "/career",
  learning: "/learning",
  work: "/work",
  finance: "/finances",
  hobby: "/hobbies",
  creative: "/creative-studio",
  dream_life: "/dream-life",
};

export function ResumeCards({
  items,
}: {
  items: { id: string; module: string; text: string; when: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-[24px] font-bold tracking-tight text-ink">Pick up where you left off</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={MODULE_HREF[item.module] ?? "/dashboard"}
            className="block transition-transform hover:-translate-y-0.5"
          >
            <Card className="flex items-center gap-4 p-5">
              <Mark tone={MODULE_TONE[item.module] ?? "muted"} size={9} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-faint">
                  {MODULE_LABEL[item.module] ?? item.module}
                </div>
                <div className="truncate text-[15px] font-bold text-ink">{item.text}</div>
                <div className="mt-0.5 text-[12px] text-muted">
                  {formatDistanceToNow(new Date(item.when), { addSuffix: true })}
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
