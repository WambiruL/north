import { cn } from "@/lib/utils";

export function AddRowButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[14px] border-[1.5px] border-dashed border-line px-4 py-3.5 text-[14px] font-extrabold text-muted transition-colors hover:border-teal hover:text-teal",
        className,
      )}
    >
      {label}
    </button>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h2 className="mb-1.5 font-display text-[25px] font-extrabold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle && <p className="text-[15.5px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function RowActions({
  onEdit,
  onDelete,
  className,
}: {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3.5", className)}>
      <button
        type="button"
        onClick={onEdit}
        className="text-[12px] font-extrabold text-faint transition-colors hover:text-teal"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="text-[12px] font-extrabold text-faint transition-colors hover:text-mahogany"
      >
        Delete
      </button>
    </div>
  );
}
