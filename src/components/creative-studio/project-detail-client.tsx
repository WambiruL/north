"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Sparkles } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectDialog } from "@/components/creative-studio/project-dialog";
import { removeProject } from "@/server/actions/creative";

type CreativeProject = Tables<"creative_projects">;

const STATUS_VARIANT: Record<string, "teal" | "default" | "outline"> = {
  active: "teal",
  completed: "default",
  archived: "outline",
};

export function ProjectDetailClient({ project }: { project: CreativeProject }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    await removeProject(project.id);
    toast.success("Project deleted");
    router.push("/creative-studio");
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/creative-studio"
        className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-semibold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Creative Studio
      </Link>

      <Card className="overflow-hidden">
        <div className="aspect-[21/9] w-full bg-surface-2">
          {project.cover_url ? (
            <img
              src={project.cover_url}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-faint">
              <Sparkles className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-4 p-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[30px] font-bold tracking-tight text-ink">{project.title}</h1>
              <Badge variant={STATUS_VARIANT[project.status] ?? "default"}>{project.status}</Badge>
            </div>
            {project.description && (
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditOpen(true)}
              aria-label="Edit project"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Delete project">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <ProjectDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
    </div>
  );
}
