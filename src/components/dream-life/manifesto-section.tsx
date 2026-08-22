import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { AddRowButton, RowActions } from "@/components/dream-life/shared";

type ManifestoPrinciple = Tables<"manifesto_principles">;

export function ManifestoSection({
  principles,
  onAdd,
  onEdit,
  onDelete,
}: {
  principles: ManifestoPrinciple[];
  onAdd: () => void;
  onEdit: (principle: ManifestoPrinciple) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <div className="max-w-[860px] rounded-[22px] border border-line bg-surface p-11 shadow-north-sm">
        <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
          My constitution
        </div>
        <h2 className="mb-7 font-display text-[30px] font-extrabold tracking-tight text-ink">
          What I believe, and what I will not trade
        </h2>

        {principles.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-6">
            <p className="max-w-md text-[14.5px] leading-relaxed text-muted">
              The non-negotiables. The trade-offs you&rsquo;ve already made peace with. Write down
              what you won&rsquo;t compromise, so it&rsquo;s easier to notice when you&rsquo;re
              about to.
            </p>
            <Button variant="accent" onClick={onAdd}>
              Add your first principle
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-[26px]">
            {principles.map((p) => (
              <div key={p.id} className="border-b border-line-2 pb-[26px]">
                <div className="text-[11px] font-extrabold uppercase tracking-[.15em] text-teal">
                  {p.kind}
                </div>
                <p className="mt-2.5 font-display text-[21px] font-bold leading-relaxed text-ink">
                  {p.text}
                </p>
                <RowActions
                  className="mt-4"
                  onEdit={() => onEdit(p)}
                  onDelete={() => onDelete(p.id)}
                />
              </div>
            ))}
          </div>
        )}

        {principles.length > 0 && (
          <AddRowButton className="mt-[18px]" label="Add a principle" onClick={onAdd} />
        )}
      </div>
    </section>
  );
}
