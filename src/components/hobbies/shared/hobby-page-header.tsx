import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function HobbyPageHeader({
  name,
  description,
  action,
}: {
  name: string;
  description?: string | null;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/hobbies"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to hobbies
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[32px] font-bold tracking-tight text-ink sm:text-[36px]">{name}</h1>
          {description && <p className="mt-1.5 max-w-[42em] text-[14.5px] text-muted">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
