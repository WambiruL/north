import type { Tables } from "@/types/database.types";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AddRowButton, RowActions } from "@/components/dream-life/shared";

type LifeArea = Tables<"life_areas">;

const RULE_CYCLE = ["bg-teal", "bg-amber", "bg-mahogany"];

export function LifeAreasSection({
  lifeAreas,
  onAdd,
  onEdit,
  onDelete,
}: {
  lifeAreas: LifeArea[];
  onAdd: () => void;
  onEdit: (area: LifeArea) => void;
  onDelete: (id: string) => void;
}) {
  if (lifeAreas.length === 0) {
    return (
      <section>
        <EmptyState
          title="No life areas yet"
          description="Name the areas of your life that matter, the question you're answering in each, and the line you won't cross."
          action={
            <Button variant="accent" onClick={onAdd}>
              Add a life area
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <div className="grid gap-6 md:grid-cols-2">
        {lifeAreas.map((area, i) => (
          <div
            key={area.id}
            className="rounded-[22px] border border-line bg-surface p-8 shadow-north-sm"
          >
            <div className={`h-[3px] w-10 rounded-full ${RULE_CYCLE[i % RULE_CYCLE.length]}`} />
            <h3 className="mb-2.5 mt-4 font-display text-[22px] font-extrabold text-ink">
              {area.name}
            </h3>
            {area.question && (
              <p className="mb-3.5 text-[15px] font-bold text-teal">{area.question}</p>
            )}
            {area.belief && (
              <p className="mb-5 text-[15.5px] leading-relaxed text-muted">{area.belief}</p>
            )}
            {area.practices.length > 0 && (
              <>
                <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
                  What that means in practice
                </div>
                <div className="flex flex-col gap-2.5">
                  {area.practices.map((practice, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span
                        className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${RULE_CYCLE[i % RULE_CYCLE.length]}`}
                      />
                      <span className="text-[14.5px] leading-snug text-ink">{practice}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <RowActions
              className="mt-4"
              onEdit={() => onEdit(area)}
              onDelete={() => onDelete(area.id)}
            />
          </div>
        ))}
      </div>
      <AddRowButton className="mt-[18px]" label="Add a life area" onClick={onAdd} />
    </section>
  );
}
