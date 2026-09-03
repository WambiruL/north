import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className="p-0.5"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              n <= value ? "fill-amber text-amber" : "fill-transparent text-line",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-4 w-4" : "h-3 w-3";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(cls, n <= value ? "fill-amber text-amber" : "fill-transparent text-line")} />
      ))}
    </div>
  );
}
