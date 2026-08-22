"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Sparkles, ExternalLink } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectDialog } from "@/components/creative-studio/project-dialog";
import { ProjectEntryDialog } from "@/components/creative-studio/project-entry-dialog";
import { removeProject, removeProjectEntry } from "@/server/actions/creative";

type CreativeProject = Tables<"creative_projects">;
type ProjectEntry = Tables<"creative_project_entries">;

const STATUS_VARIANT: Record<string, "teal" | "default" | "outline"> = {
  active: "teal",
  completed: "default",
  archived: "outline",
};

export function ProjectDetailClient({
  project,
  entries,
}: {
  project: CreativeProject;
  entries: ProjectEntry[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProjectEntry | undefined>(undefined);

  async function handleDelete() {
    await removeProject(project.id);
    toast.success("Project deleted");
    router.push("/creative-studio");
  }

  async function handleDeleteEntry(id: string) {
    await removeProjectEntry(project.id, id);
    toast.success("Page removed");
    router.refresh();
  }

  function openNewEntry() {
    setEditingEntry(undefined);
    setEntryDialogOpen(true);
  }

  function openEditEntry(entry: ProjectEntry) {
    setEditingEntry(entry);
    setEntryDialogOpen(true);
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
            // eslint-disable-next-line @next/next/no-img-element
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
            {project.tools && (
              <div className="mt-3 text-[13px] leading-relaxed text-muted">
                <strong className="text-ink">Made with</strong> {project.tools}
              </div>
            )}
            {project.link_url && (
              <a
                href={project.link_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-teal hover:underline"
              >
                View <ExternalLink className="h-3 w-3" />
              </a>
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

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-ink">Pages</h2>
            <p className="mt-1 text-[13px] text-muted">
              The project journal — entries as you go, not just a flat description.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={openNewEntry}>
            New page
          </Button>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            title="No pages yet"
            description="Write an entry to start this project's journal."
            action={
              <Button variant="secondary" size="sm" onClick={openNewEntry}>
                Write an entry
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="flex flex-col gap-3 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-faint">
                      {format(parseISO(entry.created_at), "d MMMM yyyy")}
                    </div>
                    <h3 className="mt-1.5 text-[17px] font-bold text-ink">{entry.title}</h3>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditEntry(entry)}
                      aria-label="Edit page"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEntry(entry.id)}
                      aria-label="Delete page"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {entry.image_url && (
                  <div className="h-48 w-full overflow-hidden rounded-[14px] bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.image_url} alt={entry.title} className="h-full w-full object-cover" />
                  </div>
                )}
                {entry.body && (
                  <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">
                    {entry.body}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <ProjectDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
      <ProjectEntryDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        projectId={project.id}
        projectTitle={project.title}
        entry={editingEntry}
      />
    </div>
  );
}
