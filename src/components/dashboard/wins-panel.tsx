export function WinsPanel({ wins }: { wins: string[] }) {
  if (wins.length === 0) return null;

  return (
    <div className="rounded-[24px] border border-line bg-surface-2 p-7">
      <div className="mb-5 text-[11px] font-bold uppercase tracking-wider text-faint">
        Quietly, this week went alright
      </div>
      <div className="flex flex-wrap gap-2.5">
        {wins.map((win, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-full border border-line-2 bg-surface px-4.5 py-2.5 text-[14px]"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber" />
            <span>{win}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
