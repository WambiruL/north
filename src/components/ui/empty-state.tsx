import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-line bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      {icon && <div className="text-faint">{icon}</div>}
      <h3 className="text-[18px] font-bold text-ink">{title}</h3>
      {description && (
        <p className="max-w-sm text-[13.5px] leading-relaxed text-muted">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
