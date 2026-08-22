import { Check } from "lucide-react";
import type { DreamWithGoals } from "@/services/dream-life";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AddRowButton, RowActions, SectionHeading } from "@/components/dream-life/shared";

export function DreamsIntoActionSection({
  dreams,
  onAdd,
  onEdit,
  onDelete,
}: {
  dreams: DreamWithGoals[];
  onAdd: () => void;
  onEdit: (dream: DreamWithGoals) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <SectionHeading
        title="Dreams into action"
        subtitle="Dream, vision, goal, milestones, and the thing you can do this week."
      />

      {dreams.length === 0 ? (
        <EmptyState
          title="No dreams yet"
          description="What does the life you're building actually look like? Start with one dream."
          action={
            <Button variant="accent" onClick={onAdd}>
              Add a dream
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {dreams.map((dream) => {
            const pctLabel =
              dream.goalsTotal > 0
                ? `${dream.goalsDone} of ${dream.goalsTotal} milestones`
                : "No milestones set yet";
            return (
              <div
                key={dream.id}
                className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-north-sm"
              >
                <div className="bg-nav px-8 py-7 text-nav-ink">
                  <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[.14em] text-nav-muted">
                    Dream
                  </div>
                  <div className="mb-2 text-[24px] font-extrabold leading-tight">{dream.title}</div>
                  {dream.description && (
                    <div className="text-[15px] leading-relaxed text-nav-muted">
                      {dream.description}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr_1fr]">
                  <div className="border-b border-line-2 px-7 py-6 md:border-b-0 md:border-r">
                    <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
                      Goal
                    </div>
                    <div className="mb-4 text-[16.5px] font-bold leading-snug text-ink">
                      {dream.goal_statement || "No goal set yet."}
                    </div>
                    <div className="h-2 rounded-full bg-mahogany-soft">
                      <div
                        className="h-full rounded-full bg-amber transition-all"
                        style={{ width: `${dream.progress}%` }}
                      />
                    </div>
                    <div className="mt-2.5 text-[12.5px] font-extrabold text-muted">{pctLabel}</div>
                  </div>

                  <div className="border-b border-line-2 px-7 py-6 md:border-b-0 md:border-r">
                    <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
                      Milestones
                    </div>
                    {dream.milestones.length === 0 ? (
                      <p className="text-[13.5px] text-faint">None yet.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {dream.milestones.map((m) => (
                          <div key={m.id} className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                m.is_done ? "border-teal bg-teal" : "border-line"
                              }`}
                            >
                              {m.is_done && <Check className="h-2.5 w-2.5 text-white" />}
                            </span>
                            <span
                              className={`text-[14.5px] leading-snug ${m.is_done ? "text-faint line-through" : "text-ink"}`}
                            >
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-surface-2 px-7 py-6">
                    <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[.15em] text-amber">
                      This week
                    </div>
                    {dream.actions.length === 0 ? (
                      <p className="text-[13.5px] text-faint">Nothing planned this week.</p>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {dream.actions.map((a) => (
                          <div key={a.id} className="text-[14.5px] leading-snug text-ink">
                            {a.title}
                          </div>
                        ))}
                      </div>
                    )}
                    <RowActions
                      className="mt-4"
                      onEdit={() => onEdit(dream)}
                      onDelete={() => onDelete(dream.id)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dreams.length > 0 && (
        <AddRowButton className="mt-[18px]" label="Add a dream" onClick={onAdd} />
      )}
    </section>
  );
}
