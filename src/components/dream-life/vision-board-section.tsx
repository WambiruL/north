import { Plus } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading, RowActions } from "@/components/dream-life/shared";

type VisionItem = Tables<"vision_items">;
type LifeArea = Tables<"life_areas">;

// Cycles feature-tile sizing across the mosaic, matching the mockup's varied grid.
const CELL_CYCLE = [
  "col-span-2 row-span-2",
  "",
  "",
  "row-span-2",
  "",
  "col-span-2",
  "",
  "",
];

const PANE_TONE_CYCLE = ["bg-teal-soft", "bg-amber-soft", "bg-mahogany-soft"];

export function VisionBoardSection({
  visionItems,
  lifeAreasById,
  onAdd,
  onEdit,
  onDelete,
}: {
  visionItems: VisionItem[];
  lifeAreasById: Map<string, LifeArea>;
  onAdd: () => void;
  onEdit: (item: VisionItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <SectionHeading
        title="Vision board"
        subtitle="Images, words, quotes and colours. Everything here has a note behind it."
        action={
          <Button variant="accent" onClick={onAdd}>
            <Plus className="h-3.5 w-3.5" /> Add a piece
          </Button>
        }
      />

      {visionItems.length === 0 ? (
        <EmptyState
          title="Nothing on the board yet"
          description="Collect the images, words and colours that show — not tell — what you're building toward."
          action={
            <Button variant="accent" onClick={onAdd}>
              Add your first piece
            </Button>
          }
        />
      ) : (
        <div
          className="grid grid-cols-2 gap-3.5 md:grid-cols-4"
          style={{ gridAutoRows: "180px" }}
        >
          {visionItems.map((item, i) => {
            const isImage = !!item.image_url;
            const cell = CELL_CYCLE[i % CELL_CYCLE.length];
            const area = item.life_area_id ? lifeAreasById.get(item.life_area_id) : undefined;

            if (isImage) {
              return (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-[20px] border border-line transition-transform hover:-translate-y-0.5 ${cell}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url!}
                    alt={item.caption}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex gap-3.5 bg-ink/70 px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="text-[12px] font-extrabold text-nav-ink/70 transition-colors hover:text-nav-ink"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="text-[12px] font-extrabold text-nav-ink/70 transition-colors hover:text-amber"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            }

            const tone = PANE_TONE_CYCLE[i % PANE_TONE_CYCLE.length];
            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-[20px] border border-line p-5 transition-transform hover:-translate-y-0.5 ${tone} ${cell}`}
              >
                <div>
                  <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
                    {area?.name ?? "General"}
                  </div>
                  <p className="font-display text-[19px] font-semibold leading-snug text-ink">
                    {item.caption}
                  </p>
                </div>
                <RowActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
