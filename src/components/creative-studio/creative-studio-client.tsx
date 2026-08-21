"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lightbulb, Pencil, Trash2, Sparkles, ExternalLink, ImageOff } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IdeaDialog } from "@/components/creative-studio/idea-dialog";
import { InspirationDialog } from "@/components/creative-studio/inspiration-dialog";
import { ProjectDialog } from "@/components/creative-studio/project-dialog";
import { removeIdea, removeInspirationItem, promoteIdeaAction } from "@/server/actions/creative";

type CreativeProject = Tables<"creative_projects">;
type CreativeIdea = Tables<"creative_ideas">;
type InspirationItem = Tables<"inspiration_items">;

const IDEA_STATUSES = [
  { value: "seed", label: "Seed" },
  { value: "developing", label: "Developing" },
  { value: "promoted", label: "Promoted" },
  { value: "dropped", label: "Dropped" },
] as const;

const PROJECT_STATUS_VARIANT: Record<string, "teal" | "default" | "outline"> = {
  active: "teal",
  completed: "default",
  archived: "outline",
};

function PromoteIdeaDialog({
  idea,
  open,
  onOpenChange,
}: {
  idea?: CreativeIdea;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next && idea) setTitle(idea.title);
    onOpenChange(next);
  }

  async function handlePromote() {
    if (!idea) return;
    setSubmitting(true);
    const result = await promoteIdeaAction(idea.id, title);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Idea promoted to a project");
    router.refresh();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Promote to project</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="promote-title">Project title</Label>
            <Input id="promote-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" variant="accent" disabled={submitting} onClick={handlePromote}>
              {submitting ? "Promoting…" : "Promote"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CreativeStudioClient({
  projects,
  ideas,
  inspirationItems,
  autoOpenIdea,
}: {
  projects: CreativeProject[];
  ideas: CreativeIdea[];
  inspirationItems: InspirationItem[];
  autoOpenIdea: boolean;
}) {
  const router = useRouter();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [ideaDialogOpen, setIdeaDialogOpen] = useState(autoOpenIdea);
  const [editingIdea, setEditingIdea] = useState<CreativeIdea | undefined>(undefined);
  const [promoteIdea, setPromoteIdea] = useState<CreativeIdea | undefined>(undefined);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [inspirationDialogOpen, setInspirationDialogOpen] = useState(false);

  function openNewIdea() {
    setEditingIdea(undefined);
    setIdeaDialogOpen(true);
  }

  function openEditIdea(idea: CreativeIdea) {
    setEditingIdea(idea);
    setIdeaDialogOpen(true);
  }

  function openPromote(idea: CreativeIdea) {
    setPromoteIdea(idea);
    setPromoteOpen(true);
  }

  async function handleDeleteIdea(id: string) {
    await removeIdea(id);
    toast.success("Idea removed");
    router.refresh();
  }

  async function handleDeleteInspiration(id: string) {
    await removeInspirationItem(id);
    toast.success("Removed from inspiration library");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Creative Studio</h1>
          <p className="mt-1 text-[13.5px] text-muted">Where ideas become things.</p>
        </div>
        <Button variant="accent" onClick={() => setProjectDialogOpen(true)}>
          New project
        </Button>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-ink">Idea garden</h2>
          <Button variant="secondary" size="sm" onClick={openNewIdea}>
            New idea
          </Button>
        </div>

        {ideas.length === 0 ? (
          <EmptyState
            icon={<Lightbulb className="h-6 w-6" />}
            title="No ideas yet"
            description="Plant a seed. Ideas can be promoted into real projects later."
            action={
              <Button variant="secondary" size="sm" onClick={openNewIdea}>
                Plant an idea
              </Button>
            }
          />
        ) : (
          <Tabs defaultValue="seed">
            <TabsList>
              {IDEA_STATUSES.map((s) => (
                <TabsTrigger key={s.value} value={s.value}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {IDEA_STATUSES.map((s) => {
              const filtered = ideas.filter((idea) => idea.status === s.value);
              return (
                <TabsContent key={s.value} value={s.value}>
                  {filtered.length === 0 ? (
                    <EmptyState
                      title={`No ${s.label.toLowerCase()} ideas`}
                      description="Nothing here yet."
                      className="py-10"
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {filtered.map((idea) => (
                        <Card key={idea.id} className="flex flex-col gap-2 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-[14.5px] font-bold text-ink">{idea.title}</h3>
                            <div className="flex shrink-0 gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditIdea(idea)}
                                aria-label="Edit idea"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteIdea(idea.id)}
                                aria-label="Delete idea"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          {idea.note && (
                            <p className="line-clamp-3 text-[12.5px] leading-relaxed text-muted">
                              {idea.note}
                            </p>
                          )}
                          {idea.status !== "promoted" && idea.status !== "dropped" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-1 w-fit"
                              onClick={() => openPromote(idea)}
                            >
                              Promote to project
                            </Button>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-ink">Inspiration library</h2>
          <Button variant="secondary" size="sm" onClick={() => setInspirationDialogOpen(true)}>
            Save inspiration
          </Button>
        </div>

        {inspirationItems.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            description="Collect references, images, and links that spark ideas."
            action={
              <Button variant="secondary" size="sm" onClick={() => setInspirationDialogOpen(true)}>
                Save something
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {inspirationItems.map((item) => (
              <Card key={item.id} className="flex flex-col overflow-hidden">
                <div className="aspect-square w-full bg-surface-2">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-faint">
                      <ImageOff className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <h3 className="line-clamp-1 text-[13px] font-bold text-ink">{item.title}</h3>
                  {item.note && (
                    <p className="line-clamp-2 text-[12px] leading-relaxed text-muted">
                      {item.note}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-1">
                    {item.source_url ? (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-teal hover:underline"
                      >
                        Source <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteInspiration(item.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[20px] font-bold tracking-tight text-ink">The archive</h2>

        {projects.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title="No projects yet"
            description="Start a project directly, or promote one of your ideas above."
            action={
              <Button variant="accent" onClick={() => setProjectDialogOpen(true)}>
                Start a project
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/creative-studio/${project.id}`}>
                <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-north-md">
                  <div className="aspect-[16/9] w-full bg-surface-2">
                    {project.cover_url ? (
                      <img
                        src={project.cover_url}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-faint">
                        <Sparkles className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[15px] font-bold tracking-tight text-ink">
                        {project.title}
                      </h3>
                      <Badge variant={PROJECT_STATUS_VARIANT[project.status] ?? "default"}>
                        {project.status}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted">
                        {project.description}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <ProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
      <IdeaDialog open={ideaDialogOpen} onOpenChange={setIdeaDialogOpen} idea={editingIdea} />
      <InspirationDialog open={inspirationDialogOpen} onOpenChange={setInspirationDialogOpen} />
      <PromoteIdeaDialog idea={promoteIdea} open={promoteOpen} onOpenChange={setPromoteOpen} />
    </div>
  );
}
