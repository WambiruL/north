"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { HobbyDialog } from "@/components/hobbies/hobby-dialog";

type Hobby = Tables<"hobbies"> & { projectCount: number };

export function HobbiesClient({ hobbies }: { hobbies: Hobby[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Hobbies</h1>
          <p className="mt-1 text-[13.5px] text-muted">
            The things you do just because you like them.
          </p>
        </div>
        <Button variant="accent" onClick={() => setDialogOpen(true)}>
          New hobby
        </Button>
      </div>

      {hobbies.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="No hobbies yet"
          description="Add a hobby to start tracking projects and memories around it."
          action={
            <Button variant="accent" onClick={() => setDialogOpen(true)}>
              Add your first hobby
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hobbies.map((hobby) => (
            <Link key={hobby.id} href={`/hobbies/${hobby.id}`}>
              <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-north-md">
                <div className="aspect-[16/9] w-full bg-surface-2">
                  {hobby.cover_url ? (
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
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-[16px] font-bold tracking-tight text-ink">{hobby.name}</h3>
                  {hobby.description && (
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">
                      {hobby.description}
                    </p>
                  )}
                  <div className="mt-auto pt-2 text-[12px] font-semibold uppercase tracking-wider text-faint">
                    {hobby.projectCount} {hobby.projectCount === 1 ? "project" : "projects"}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <HobbyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
