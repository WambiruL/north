import { cn } from "@/lib/utils";

const TONES = [
  "bg-teal-soft text-teal",
  "bg-amber-soft text-mahogany",
  "bg-mahogany-soft text-mahogany",
];

function toneFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

export function BookCover({
  id,
  title,
  coverUrl,
  className,
}: {
  id: string;
  title: string;
  coverUrl?: string | null;
  className?: string;
}) {
  if (coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverUrl}
        alt={title}
        className={cn("aspect-[2/3] w-full rounded-[6px] object-cover shadow-north-sm", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-[2/3] w-full items-center justify-center rounded-[6px] p-3 text-center shadow-north-sm",
        toneFor(id),
        className,
      )}
    >
      <span className="line-clamp-5 text-[12.5px] font-bold leading-snug">{title}</span>
    </div>
  );
}
