import * as React from "react";
import { cn } from "@/lib/utils";

export function AddRowButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "mt-1 w-full rounded-[14px] border-[1.5px] border-dashed border-line px-4 py-3.5 text-[14px] font-bold text-muted transition-colors hover:border-teal hover:text-teal",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="mt-2 flex gap-3.5">
      <button
        type="button"
        onClick={onEdit}
        className="text-[12px] font-bold text-faint transition-colors hover:text-teal"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="text-[12px] font-bold text-faint transition-colors hover:text-mahogany"
      >
        Delete
      </button>
    </div>
  );
}
