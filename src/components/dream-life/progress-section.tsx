import type { DreamWithGoals } from "@/services/dream-life";
import type { Tables } from "@/types/database.types";

type VisionItem = Tables<"vision_items">;
type FutureLetter = Tables<"future_letters">;
type BucketListItem = Tables<"bucket_list_items">;

export function ProgressSection({
  dreams,
  visionItems,
  letters,
  bucketItems,
}: {
  dreams: DreamWithGoals[];
  visionItems: VisionItem[];
  letters: FutureLetter[];
  bucketItems: BucketListItem[];
}) {
  const milestonesTotal = dreams.reduce((sum, d) => sum + d.goalsTotal, 0);
  const milestonesDone = dreams.reduce((sum, d) => sum + d.goalsDone, 0);
  const dreamsWithPlans = dreams.filter((d) => d.goalsTotal > 0).length;
  const bucketDone = bucketItems.filter((b) => b.status === "done").length;

  const cards = [
    {
      head:
        dreams.length === 0
          ? "No dreams yet"
          : `${dreams.length} ${dreams.length === 1 ? "dream" : "dreams"} you're building toward`,
      sub:
        dreams.length === 0
          ? "Start with one, in Dreams into action."
          : `${dreamsWithPlans} of them have a goal and a plan behind them`,
    },
    {
      head:
        milestonesTotal === 0
          ? "No milestones set"
          : `${milestonesDone} of ${milestonesTotal} milestones hit`,
      sub:
        milestonesTotal === 0
          ? "Give a dream a milestone to track it here."
          : "Every one of them was a week you kept going",
    },
    {
      head:
        visionItems.length === 0
          ? "Nothing on the vision board"
          : `${visionItems.length} ${visionItems.length === 1 ? "piece" : "pieces"} on your vision board`,
      sub: "Images, words and colours, collected so far",
    },
    {
      head:
        letters.length === 0
          ? "No letters written yet"
          : `${letters.length} ${letters.length === 1 ? "letter" : "letters"} to your future self`,
      sub:
        bucketDone > 0
          ? `Plus ${bucketDone} thing${bucketDone === 1 ? "" : "s"} crossed off the bucket list`
          : "The most honest record of how this is going",
    },
  ];

  return (
    <section>
      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-[22px] border border-line bg-surface p-9 shadow-north-sm"
          >
            <div className="mb-2.5 font-display text-[27px] font-extrabold leading-tight tracking-tight text-ink">
              {card.head}
            </div>
            <div className="text-[15px] text-muted">{card.sub}</div>
          </div>
        ))}
      </div>
      <div className="mt-[18px] rounded-[22px] border border-line bg-surface-2 p-8">
        <p className="max-w-[44em] text-[17px] leading-relaxed text-ink">
          None of this is a score. It is a record that you kept going, on the weeks when it did
          not feel like you were.
        </p>
      </div>
    </section>
  );
}
