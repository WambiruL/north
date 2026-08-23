"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Mark } from "@/components/ui/mark";
import { ALL_SPACES, spaceByKey } from "@/lib/constants/spaces";
import { pinSpace, unpinSpace, movePinnedSpaceUp } from "@/server/actions/pinned-spaces";
import type { Tables } from "@/types/database.types";

export function WorkspaceSwitcher({
  fullName,
  pinnedSpaces,
}: {
  fullName: string;
  pinnedSpaces: Tables<"pinned_spaces">[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const pinnedKeys = useMemo(() => new Set(pinnedSpaces.map((p) => p.space_key)), [pinnedSpaces]);

  const filteredSpaces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_SPACES;
    return ALL_SPACES.filter(
      (s) => s.label.toLowerCase().includes(q) || s.preview.toLowerCase().includes(q),
    );
  }, [query]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  async function handlePin(spaceKey: string) {
    setPending(spaceKey);
    await pinSpace(spaceKey);
    setPending(null);
    router.refresh();
  }

  async function handleUnpin(spaceKey: string) {
    setPending(spaceKey);
    await unpinSpace(spaceKey);
    setPending(null);
    toast.success("Unpinned");
    router.refresh();
  }

  async function handleMoveUp(spaceKey: string) {
    setPending(spaceKey);
    await movePinnedSpaceUp(spaceKey);
    setPending(null);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="flex items-center gap-3 rounded-[12px] border border-transparent px-2 py-2 text-left transition-colors hover:border-white/15"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-nav-ink">
          <span className="h-2 w-2 rotate-45 bg-amber" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-extrabold tracking-[.18em]">NORTH</span>
          <span className="mt-0.5 block truncate text-[12.5px] font-semibold text-nav-muted">
            {fullName ? `${fullName.split(" ")[0]}'s North` : "Your North"}
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-nav-muted" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0">
          <div className="max-h-[75vh] overflow-y-auto p-6">
            <h2 className="mb-1 font-display text-[22px] font-semibold text-ink">Your North</h2>
            <p className="mb-4 text-[13px] text-muted">
              Everything you are building, learning, creating and becoming.
            </p>

            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search North"
              className="mb-5"
              autoFocus
            />

            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-faint">
              Pinned spaces
            </div>

            {pinnedSpaces.length === 0 ? (
              <EmptyState
                title="Nothing pinned yet."
                description="Pin the places you visit most to make them easier to reach."
                className="mb-5 border-none bg-transparent p-4 py-5 text-left"
              />
            ) : (
              <div className="mb-5 flex flex-col gap-0.5">
                {pinnedSpaces.map((pin, i) => {
                  const space = spaceByKey(pin.space_key);
                  if (!space) return null;
                  return (
                    <div
                      key={pin.id}
                      className="flex items-center gap-2 rounded-[10px] transition-colors hover:bg-surface-2"
                    >
                      <button
                        onClick={() => go(space.href)}
                        className="flex flex-1 items-center gap-3 px-2.5 py-2 text-left"
                      >
                        <Star className="h-3.5 w-3.5 shrink-0 fill-amber text-amber" />
                        <span className="min-w-0">
                          <span className="block text-[14px] font-bold text-ink">{space.label}</span>
                          <span className="block truncate text-[12px] text-muted">{space.preview}</span>
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-2 pr-2">
                        {i > 0 && (
                          <button
                            onClick={() => handleMoveUp(pin.space_key)}
                            disabled={pending === pin.space_key}
                            className="text-[11.5px] font-bold text-faint hover:text-teal"
                          >
                            Up
                          </button>
                        )}
                        <button
                          onClick={() => handleUnpin(pin.space_key)}
                          disabled={pending === pin.space_key}
                          className="text-[11.5px] font-bold text-faint hover:text-mahogany"
                        >
                          Unpin
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-line-2 pt-4">
              <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-faint">
                All spaces
              </div>
              <div className="flex flex-col gap-0.5">
                {filteredSpaces.map((space) => {
                  const pinned = pinnedKeys.has(space.key);
                  return (
                    <div
                      key={space.key}
                      className="flex items-center gap-2 rounded-[9px] transition-colors hover:bg-surface-2"
                    >
                      <button
                        onClick={() => go(space.href)}
                        className="flex flex-1 items-center gap-2.5 px-2.5 py-1.5 text-left"
                      >
                        <Mark tone={space.tone} size={6} />
                        <span className="text-[13.5px] font-semibold text-ink">{space.label}</span>
                      </button>
                      <button
                        onClick={() => (pinned ? handleUnpin(space.key) : handlePin(space.key))}
                        disabled={pending === space.key}
                        className="shrink-0 pr-2.5 text-[11.5px] font-bold text-faint hover:text-teal"
                      >
                        {pinned ? "Unpin" : "Pin"}
                      </button>
                    </div>
                  );
                })}
                {filteredSpaces.length === 0 && (
                  <div className="px-2.5 py-4 text-[13px] text-muted">Nothing matches that.</div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
