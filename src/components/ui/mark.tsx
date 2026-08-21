import { cn } from "@/lib/utils";

/**
 * North's "marks instead of icons" primitive: small geometric shapes used
 * for category dots, nav indicators, and list bullets instead of a glyph
 * icon font — per the design system's documented motif.
 */
const SHAPES = {
  circle: "rounded-full",
  ring: "rounded-full border-2 bg-transparent!",
  square: "rounded-[3px]",
  diamond: "rounded-[3px] rotate-45",
} as const;

const TONES = {
  ink: "bg-ink border-ink",
  teal: "bg-teal border-teal",
  amber: "bg-amber border-amber",
  mahogany: "bg-mahogany border-mahogany",
  muted: "bg-faint border-faint",
} as const;

export interface MarkProps {
  shape?: keyof typeof SHAPES;
  tone?: keyof typeof TONES;
  size?: number;
  className?: string;
}

export function Mark({ shape = "circle", tone = "ink", size = 7, className }: MarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0", SHAPES[shape], TONES[tone], className)}
      style={{ width: size, height: size }}
    />
  );
}
