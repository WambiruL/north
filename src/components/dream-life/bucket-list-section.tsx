import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AddRowButton, RowActions } from "@/components/dream-life/shared";
import { bucketListStatusLabels } from "@/lib/validation/dream-life";

type BucketListItem = Tables<"bucket_list_items">;

const STATUS_BADGE: Record<BucketListItem["status"], "default" | "amber" | "teal"> = {
  someday: "default",
  planned: "amber",
  done: "teal",
};

export function BucketListSection({
  items,
  onAdd,
  onEdit,
  onDelete,
}: {
  items: BucketListItem[];
  onAdd: () => void;
  onEdit: (item: BucketListItem) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <section>
        <EmptyState
          title="Nothing on the list yet"
          description="The trips, the skills, the wild ideas — the things you'd regret never trying."
          action={
            <Button variant="accent" onClick={onAdd}>
              Add something to the list
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-north-sm transition-transform hover:-translate-y-0.5"
          >
            <div className="h-[140px] bg-surface-2">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[12px] font-semibold text-faint">
                  {item.title}
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_BADGE[item.status as BucketListItem["status"]]}>
                  {bucketListStatusLabels[item.status as keyof typeof bucketListStatusLabels]}
                </Badge>
                {item.category && (
                  <span className="text-[11.5px] font-extrabold text-faint">{item.category}</span>
                )}
              </div>
              <div className="mb-2 text-[17px] font-extrabold leading-snug text-ink">
                {item.title}
              </div>
              {item.why && (
                <p className="text-[14px] leading-relaxed text-muted">{item.why}</p>
              )}
              <RowActions
                className="mt-4"
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item.id)}
              />
            </div>
          </div>
        ))}
      </div>
      <AddRowButton
        className="mt-[18px]"
        label="Add something to the list"
        onClick={onAdd}
      />
    </section>
  );
}
