import { HOBBY_TEMPLATE_LIST } from "@/lib/constants/hobby-templates";

export function HobbyKindGrid({
  onPick,
  selected,
  className,
}: {
  onPick: (kind: string) => void;
  selected?: Set<string>;
  className?: string;
}) {
  return (
    <div className={className ?? "grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"}>
      {HOBBY_TEMPLATE_LIST.map((t) => {
        const isSelected = selected?.has(t.key);
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onPick(t.key)}
            className={
              isSelected
                ? "rounded-[18px] border border-teal bg-teal-soft p-[22px_24px] text-left transition-transform hover:-translate-y-0.5"
                : "rounded-[18px] border border-line bg-surface p-[22px_24px] text-left transition-transform hover:-translate-y-0.5 hover:border-teal"
            }
          >
            <span className="mb-1.5 block text-[18px] font-extrabold text-ink">{t.label}</span>
            <span className="block text-[13.5px] leading-[1.55] text-muted">{t.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
