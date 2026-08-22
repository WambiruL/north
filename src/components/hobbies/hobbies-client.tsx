"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Sparkles, Trash2, Pencil } from "lucide-react";
import type { Tables } from "@/types/database.types";
import type { HobbyDetail } from "@/services/hobbies";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HobbyDialog } from "@/components/hobbies/hobby-dialog";
import { HobbySheet } from "@/components/hobbies/hobby-sheet";
import { HobbyMark } from "@/components/hobbies/hobby-mark";
import { removeHobby } from "@/server/actions/hobbies";

type Hobby = Tables<"hobbies"> & {
  projectCount: number;
  memoryCount: number;
  stats: HobbyDetail["stats"];
};

export function HobbiesClient({
  hobbies,
  detailById,
  initialOpenId,
}: {
  hobbies: Hobby[];
  detailById: Record<string, HobbyDetail>;
  initialOpenId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openHobbyId, setOpenHobbyId] = useState<string | undefined>(
    initialOpenId && detailById[initialOpenId] ? initialOpenId : undefined,
  );

  function openHobby(id: string) {
    setOpenHobbyId(id);
    router.replace(`${pathname}?hobby=${id}`, { scroll: false });
  }

  function closeHobby(open: boolean) {
    if (!open) {
      setOpenHobbyId(undefined);
      router.replace(pathname, { scroll: false });
    }
  }

  async function handleQuickDelete(id: string) {
    await removeHobby(id);
    toast.success("Hobby deleted");
    router.refresh();
  }

  const openDetail = openHobbyId ? detailById[openHobbyId] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Hobbies</h1>
          <p className="mt-1 max-w-[38em] text-[15px] text-muted">
            Ten rooms in the house. Open one and everything about it is in there.
          </p>
        </div>
        <Button variant="accent" onClick={() => setDialogOpen(true)}>
          Add a hobby
        </Button>
      </div>

      {hobbies.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="No hobbies yet"
          description="Add a hobby to start tracking projects and moments around it."
          action={
            <Button variant="accent" onClick={() => setDialogOpen(true)}>
              Add your first hobby
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {hobbies.map((hobby) => (
            <div
              key={hobby.id}
              className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-surface shadow-north-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-north-md"
            >
              <button onClick={() => openHobby(hobby.id)} className="block w-full text-left">
                <div className="h-40 w-full bg-surface-2">
                  {hobby.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hobby.cover_url}
                      alt={hobby.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-faint">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="px-6 pb-1 pt-5">
                  <div className="mb-3.5 flex items-start gap-3.5">
                    <HobbyMark id={hobby.id} name={hobby.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[19px] font-extrabold tracking-tight text-ink">
                        {hobby.name}
                      </span>
                      <span className="mt-0.5 block text-[12px] font-bold text-faint">
                        Updated {format(parseISO(hobby.updated_at), "d MMM")} · {hobby.memoryCount}{" "}
                        logged
                      </span>
                    </span>
                  </div>
                  {hobby.description && (
                    <p className="mb-4 line-clamp-2 text-[13.5px] leading-relaxed text-muted">
                      {hobby.description}
                    </p>
                  )}
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="truncate text-[13px] font-extrabold text-ink">
                      {hobby.goal || "No goal set"}
                    </span>
                    <span className="shrink-0 text-[12px] font-bold text-muted">
                      {hobby.projectCount > 0 ? `${hobby.stats.completedProjectPct}%` : "—"}
                    </span>
                  </div>
                  <div className="h-[7px] rounded-full bg-mahogany-soft">
                    <div
                      className="h-full rounded-full bg-teal transition-all"
                      style={{ width: `${hobby.stats.completedProjectPct}%` }}
                    />
                  </div>
                  <div className="mt-3.5 flex items-center gap-2 text-[13px] text-muted">
                    <span className="font-extrabold text-teal">Latest</span>
                    <span className="min-w-0 flex-1 truncate">
                      {hobby.stats.latestMemory?.caption ?? "Nothing logged yet"}
                    </span>
                  </div>
                </div>
              </button>
              <div className="mt-auto flex items-center gap-3.5 px-6 pb-5 pt-3.5">
                <button
                  onClick={() => openHobby(hobby.id)}
                  className="text-[13px] font-extrabold text-teal transition-colors hover:text-amber"
                >
                  Open workspace
                </button>
                <span className="flex-1" />
                <button
                  onClick={() => openHobby(hobby.id)}
                  aria-label="Edit hobby"
                  className="text-faint transition-colors hover:text-teal"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleQuickDelete(hobby.id)}
                  aria-label="Delete hobby"
                  className="text-faint transition-colors hover:text-mahogany"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <HobbyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      {openDetail && <HobbySheet detail={openDetail} open={Boolean(openHobbyId)} onOpenChange={closeHobby} />}
    </div>
  );
}
