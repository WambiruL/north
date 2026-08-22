"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { toast } from "sonner";
import { Lightbulb, Pencil, Trash2, Sparkles, ExternalLink, ImageOff, LayoutGrid } from "lucide-react";
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
import { MoodboardDialog } from "@/components/creative-studio/moodboard-dialog";
import {
  removeIdea,
  removeInspirationItem,
  promoteIdeaAction,
  removeMoodboard,
} from "@/server/actions/creative";

type CreativeProject = Tables<"creative_projects">;
type CreativeIdea = Tables<"creative_ideas">;
type InspirationItem = Tables<"inspiration_items">;
type Moodboard = Tables<"creative_moodboards">;
type Activity = Tables<"activities">;

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
  moodboards,
  studioActivity,
  autoOpenIdea,
}: {
  projects: CreativeProject[];
  ideas: CreativeIdea[];
  inspirationItems: InspirationItem[];
  moodboards: Moodboard[];
  studioActivity: Activity[];
  autoOpenIdea: boolean;
}) {
  const router = useRouter();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [ideaDialogOpen, setIdeaDialogOpen] = useState(autoOpenIdea);
  const [editingIdea, setEditingIdea] = useState<CreativeIdea | undefined>(undefined);
  const [promoteIdea, setPromoteIdea] = useState<CreativeIdea | undefined>(undefined);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [inspirationDialogOpen, setInspirationDialogOpen] = useState(false);
  const [moodboardDialogOpen, setMoodboardDialogOpen] = useState(false);
  const [editingMoodboard, setEditingMoodboard] = useState<Moodboard | undefined>(undefined);

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
  function openNewMoodboard() {
    setEditingMoodboard(undefined);
    setMoodboardDialogOpen(true);
  }
  function openEditMoodboard(board: Moodboard) {
    setEditingMoodboard(board);
    setMoodboardDialogOpen(true);
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
  async function handleDeleteMoodboard(id: string) {
    await removeMoodboard(id);
    toast.success("Moodboard removed");
    router.refresh();
  }

  const activeProjects = projects.filter((p) => p.status === "active");
  const archivedProjects = projects.filter((p) => p.status !== "active");
  const currentProject = activeProjects[0];
  const latestInspiration = inspirationItems[0];
  const justCaptured = ideas.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <Card className="relative overflow-hidden p-8 sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-[32em]">
            <div className="mb-3.5 text-[11px] font-bold uppercase tracking-wider text-faint">
              Creative studio
            </div>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[38px]">
              Where ideas become things.
            </h1>
            <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
              {currentProject
                ? `Currently making ${currentProject.title}.`
                : "Nothing in progress right now — start a project or plant an idea."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div className="rounded-[16px] bg-surface-2 px-5 py-4">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-faint">
                Projects
              </div>
              <div className="text-[20px] font-bold tracking-tight text-ink">{projects.length}</div>
            </div>
            <div className="rounded-[16px] bg-surface-2 px-5 py-4">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-faint">Ideas</div>
              <div className="text-[20px] font-bold tracking-tight text-ink">{ideas.length}</div>
            </div>
            <div className="rounded-[16px] bg-surface-2 px-5 py-4">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-faint">
                Moodboards
              </div>
              <div className="text-[20px] font-bold tracking-tight text-ink">{moodboards.length}</div>
            </div>
            <div className="rounded-[16px] bg-surface-2 px-5 py-4">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-faint">
                Inspiration
              </div>
              <div className="text-[20px] font-bold tracking-tight text-ink">
                {inspirationItems.length}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="home">
        <TabsList className="w-full flex-wrap justify-start">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="garden">Idea garden</TabsTrigger>
          <TabsTrigger value="moodboards">Moodboards</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="flex flex-col gap-6">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
            {currentProject ? (
              <Card className="overflow-hidden">
                <div className="aspect-[21/9] w-full bg-surface-2">
                  {currentProject.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentProject.cover_url}
                      alt={currentProject.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-faint">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-7">
                  <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-faint">
                    Currently creating
                  </div>
                  <h2 className="mb-2.5 text-[24px] font-bold tracking-tight text-ink">
                    {currentProject.title}
                  </h2>
                  {currentProject.description && (
                    <p className="max-w-[38em] text-[14.5px] leading-relaxed text-muted">
                      {currentProject.description}
                    </p>
                  )}
                  <Link
                    href={`/creative-studio/${currentProject.id}`}
                    className="mt-4 inline-block text-[13px] font-bold text-teal hover:text-amber"
                  >
                    Open the workspace
                  </Link>
                </div>
              </Card>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-6 w-6" />}
                title="Nothing in progress"
                description="Start a project directly, or promote one of your ideas."
                action={
                  <Button variant="accent" onClick={() => setProjectDialogOpen(true)}>
                    Start a project
                  </Button>
                }
              />
            )}

            <div className="flex flex-col gap-5">
              {latestInspiration ? (
                <div className="relative overflow-hidden rounded-[20px] bg-ink px-7 py-7 text-bg">
                  <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-bg/60">
                    Inspiration this week
                  </div>
                  <p className="text-[17px] font-semibold leading-snug">{latestInspiration.title}</p>
                  {latestInspiration.note && (
                    <p className="mt-2 text-[13px] text-bg/65">{latestInspiration.note}</p>
                  )}
                </div>
              ) : (
                <EmptyState title="No inspiration saved yet" className="py-8" />
              )}

              <Card className="p-6">
                <div className="mb-4 text-[11px] font-bold uppercase tracking-wider text-faint">
                  Just captured
                </div>
                {justCaptured.length === 0 ? (
                  <p className="text-[13.5px] text-muted">No ideas planted yet.</p>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {justCaptured.map((g) => (
                      <div key={g.id} className="border-b border-line-2 pb-3.5 last:border-0 last:pb-0">
                        <div className="mb-1.5 flex items-center gap-2.5">
                          <Badge variant="outline">{g.status}</Badge>
                          <span className="text-[12px] font-semibold text-faint">
                            {format(parseISO(g.created_at), "d MMM")}
                          </span>
                        </div>
                        <div className="text-[14.5px] font-bold leading-snug text-ink">{g.title}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <Card className="p-7">
            <div className="mb-5 text-[11px] font-bold uppercase tracking-wider text-faint">
              In the studio lately
            </div>
            {studioActivity.length === 0 ? (
              <p className="text-[13.5px] text-muted">Nothing logged yet — start a project to begin.</p>
            ) : (
              <div className="relative pl-6">
                <div className="absolute bottom-1.5 left-[3px] top-1.5 w-px bg-line" />
                <div className="flex flex-col gap-5">
                  {studioActivity.map((a) => (
                    <div key={a.id} className="relative">
                      <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-amber" />
                      <div className="text-[14.5px] font-semibold leading-snug text-ink">
                        You {a.verb} {a.summary}
                      </div>
                      <div className="mt-1 text-[12.5px] font-semibold text-faint">
                        {formatDistanceToNow(parseISO(a.occurred_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="garden" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-bold tracking-tight text-ink">Idea garden</h2>
              <p className="mt-1 text-[13.5px] text-muted">
                Seed, growing, developing, creating. Most of these will stay small and that is the point.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={openNewIdea}>
              Plant an idea
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
                            {idea.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {idea.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full border border-line-2 bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-muted"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
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
        </TabsContent>

        <TabsContent value="moodboards" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-bold tracking-tight text-ink">Moodboards</h2>
            <Button variant="secondary" size="sm" onClick={openNewMoodboard}>
              New moodboard
            </Button>
          </div>

          {moodboards.length === 0 ? (
            <EmptyState
              icon={<LayoutGrid className="h-6 w-6" />}
              title="No moodboards yet"
              description="Pin images together and see what wants to become something."
              action={
                <Button variant="secondary" size="sm" onClick={openNewMoodboard}>
                  New moodboard
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-6">
              {moodboards.map((board) => (
                <Card key={board.id} className="p-7">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-[19px] font-bold text-ink">{board.title}</h3>
                      {board.note && <p className="mt-1 text-[13.5px] text-muted">{board.note}</p>}
                    </div>
                    <span className="shrink-0 text-[12px] font-semibold text-faint">
                      {board.image_urls.length} pinned
                    </span>
                  </div>
                  {board.image_urls.length === 0 ? (
                    <p className="text-[13px] text-muted">Nothing pinned yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {board.image_urls.map((url, i) => (
                        <div
                          key={`${board.id}-${i}`}
                          className="aspect-square overflow-hidden rounded-[14px] bg-surface-2"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-3.5">
                    <button
                      onClick={() => openEditMoodboard(board)}
                      className="text-[12px] font-bold text-faint hover:text-teal"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMoodboard(board.id)}
                      className="text-[12px] font-bold text-faint hover:text-mahogany"
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-bold tracking-tight text-ink">In progress</h2>
              <Button variant="accent" size="sm" onClick={() => setProjectDialogOpen(true)}>
                Start a project
              </Button>
            </div>
            {activeProjects.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-6 w-6" />}
                title="Nothing active"
                description="Start a project directly, or promote one of your ideas above."
                action={
                  <Button variant="accent" onClick={() => setProjectDialogOpen(true)}>
                    Start a project
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeProjects.map((project) => (
                  <Link key={project.id} href={`/creative-studio/${project.id}`}>
                    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-north-md">
                      <div className="aspect-[16/9] w-full bg-surface-2">
                        {project.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-[22px] font-bold tracking-tight text-ink">The archive</h2>
              <p className="mt-1 text-[13.5px] text-muted">Finished work only.</p>
            </div>
            {archivedProjects.length === 0 ? (
              <EmptyState title="Nothing archived yet" description="Finished pieces will land here." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archivedProjects.map((project) => (
                  <Card key={project.id} className="flex flex-col overflow-hidden">
                    <Link href={`/creative-studio/${project.id}`}>
                      <div className="aspect-[16/9] w-full bg-surface-2">
                        {project.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
                    </Link>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[15px] font-bold tracking-tight text-ink">{project.title}</h3>
                        <Badge variant={PROJECT_STATUS_VARIANT[project.status] ?? "default"}>
                          {project.status}
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted">
                          {project.description}
                        </p>
                      )}
                      {project.tools && (
                        <div className="text-[12.5px] leading-relaxed text-muted">
                          <strong className="text-ink">Made with</strong> {project.tools}
                        </div>
                      )}
                      {project.link_url && (
                        <a
                          href={project.link_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-fit items-center gap-1 text-[12px] font-bold text-teal hover:underline"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inspiration" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-bold tracking-tight text-ink">Inspiration library</h2>
              <p className="mt-1 text-[13.5px] text-muted">
                Everything in here has a reason written under it.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setInspirationDialogOpen(true)}>
              Keep something
            </Button>
          </div>

          {inspirationItems.length === 0 ? (
            <EmptyState
              title="Nothing saved yet"
              description="Collect references, images, and links that spark ideas."
              action={
                <Button variant="secondary" size="sm" onClick={() => setInspirationDialogOpen(true)}>
                  Keep something
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {inspirationItems.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden">
                  <div className="aspect-square w-full bg-surface-2">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
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
                    {item.kind && (
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-teal">
                        {item.kind}
                      </span>
                    )}
                    <h3 className="line-clamp-1 text-[13px] font-bold text-ink">{item.title}</h3>
                    {item.note && (
                      <p className="line-clamp-2 text-[12px] leading-relaxed text-muted">{item.note}</p>
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
        </TabsContent>
      </Tabs>

      <ProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
      <IdeaDialog open={ideaDialogOpen} onOpenChange={setIdeaDialogOpen} idea={editingIdea} />
      <InspirationDialog open={inspirationDialogOpen} onOpenChange={setInspirationDialogOpen} />
      <MoodboardDialog
        open={moodboardDialogOpen}
        onOpenChange={setMoodboardDialogOpen}
        moodboard={editingMoodboard}
      />
      <PromoteIdeaDialog idea={promoteIdea} open={promoteOpen} onOpenChange={setPromoteOpen} />
    </div>
  );
}
