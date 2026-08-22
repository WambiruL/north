import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AddRowButton, RowActions, SectionHeading } from "@/components/dream-life/shared";

type FutureHorizon = Tables<"future_horizons">;

export function FutureTimelineSection({
  horizons,
  onAdd,
  onEdit,
  onDelete,
}: {
  horizons: FutureHorizon[];
  onAdd: () => void;
  onEdit: (horizon: FutureHorizon) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <SectionHeading
        title="Future timeline"
        subtitle="Written in the past tense, on purpose. Scroll sideways."
      />

      {horizons.length === 0 ? (
        <EmptyState
          title="Nothing on the timeline yet"
          description="Pick a point in time and write it as if it already happened."
          action={
            <Button variant="accent" onClick={onAdd}>
              Add a horizon
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex gap-[18px] overflow-x-auto pb-3.5">
            {horizons.map((h) => (
              <div
                key={h.id}
                className="min-w-[330px] flex-[0_0_330px] rounded-[22px] border border-line bg-surface p-8 shadow-north-sm"
              >
                <div className="mb-4 text-[11px] font-extrabold uppercase tracking-[.15em] text-amber">
                  {h.when_label}
                </div>
                <div className="mb-5 text-[20px] font-extrabold leading-snug text-ink">
                  {h.where_text}
                </div>
                <div className="flex flex-col gap-6">
                  {h.achieved && (
                    <div>
                      <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
                        Achieved
                      </div>
                      <div className="text-[14.5px] leading-relaxed text-muted">{h.achieved}</div>
                    </div>
                  )}
                  {h.learned && (
                    <div>
                      <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
                        Learned
                      </div>
                      <div className="text-[14.5px] leading-relaxed text-muted">{h.learned}</div>
                    </div>
                  )}
                  {h.feels && (
                    <div>
                      <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
                        How it feels
                      </div>
                      <div className="text-[15px] italic leading-relaxed text-ink">{h.feels}</div>
                    </div>
                  )}
                </div>
                <RowActions
                  className="mt-4"
                  onEdit={() => onEdit(h)}
                  onDelete={() => onDelete(h.id)}
                />
              </div>
            ))}
          </div>
          <AddRowButton className="mt-[18px]" label="Add a horizon" onClick={onAdd} />
        </>
      )}
    </section>
  );
}
