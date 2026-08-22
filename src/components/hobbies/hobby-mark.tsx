import { cn } from "@/lib/utils";
import { hobbyInitials, hobbyTone } from "@/components/hobbies/hobby-utils";

const TONE_CLASSES = {
  teal: "bg-teal-soft text-teal",
  amber: "bg-amber-soft text-amber",
  mahogany: "bg-mahogany-soft text-mahogany",
} as const;

export function HobbyMark({
  id,
  name,
  size = "md",
  className,
}: {
  id: string;
  name: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const tone = hobbyTone(id);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[14px] font-extrabold tracking-wide",
        size === "lg" ? "h-14 w-14 text-[17px]" : "h-11 w-11 text-[14px]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {hobbyInitials(name)}
    </span>
  );
}
