import { format, parseISO } from "date-fns";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AddRowButton, RowActions } from "@/components/dream-life/shared";

type FutureLetter = Tables<"future_letters">;

export function JournalSection({
  letters,
  onAdd,
  onEdit,
  onDelete,
}: {
  letters: FutureLetter[];
  onAdd: () => void;
  onEdit: (letter: FutureLetter) => void;
  onDelete: (id: string) => void;
}) {
  if (letters.length === 0) {
    return (
      <section>
        <EmptyState
          title="No letters yet"
          description="Write one line to the person you'll be later. It doesn't have to be long."
          action={
            <Button variant="accent" onClick={onAdd}>
              Write to your future self
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <div className="flex max-w-[900px] flex-col gap-6">
        {letters.map((letter) => (
          <div
            key={letter.id}
            className="rounded-[22px] border border-line bg-surface p-9 shadow-north-sm"
          >
            <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
              {format(parseISO(letter.created_at), "d MMMM yyyy")}
            </div>
            <h3 className="mb-4 font-display text-[23px] font-extrabold leading-snug text-ink">
              {letter.prompt}
            </h3>
            <p className="whitespace-pre-line text-[16.5px] leading-relaxed text-muted">
              {letter.body}
            </p>
            <RowActions
              className="mt-4"
              onEdit={() => onEdit(letter)}
              onDelete={() => onDelete(letter.id)}
            />
          </div>
        ))}
      </div>
      <AddRowButton
        className="mt-[18px]"
        label="Write to your future self"
        onClick={onAdd}
      />
    </section>
  );
}
