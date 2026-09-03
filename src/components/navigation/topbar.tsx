import Link from "next/link";
import { GlobalSearch } from "@/components/navigation/global-search";
import { QuickCreate } from "@/components/navigation/quick-create";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line-2 bg-bg/95 px-4 py-3 backdrop-blur md:px-8 md:py-4">
      <Link
        href="/dashboard"
        aria-label="Go to dashboard"
        className="rounded-md font-display text-[19px] font-semibold italic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal md:hidden"
      >
        North
      </Link>
      <div className="ml-auto flex items-center gap-3">
        <GlobalSearch />
        <QuickCreate />
      </div>
    </header>
  );
}
