"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LifeAreaDialog } from "@/components/dream-life/life-area-dialog";
import { DreamDialog } from "@/components/dream-life/dream-dialog";
import { DreamGoalDialog } from "@/components/dream-life/dream-goal-dialog";
import { VisionItemDialog } from "@/components/dream-life/vision-item-dialog";
import {
  removeLifeArea,
  removeDream,
  removeDreamGoal,
  removeVisionItem,
  toggleDreamGoalDone,
} from "@/server/actions/dream-life";

type LifeArea = Tables<"life_areas">;
type Dream = Tables<"dreams">;
type DreamGoal = Tables<"dream_goals">;
type VisionItem = Tables<"vision_items">;

export type DreamWithGoals = Dream & {
  goals: DreamGoal[];
  goalsDone: number;
  goalsTotal: number;
  progress: number;
};

type Horizon = "this_year" | "1_3_years" | "someday";

const HORIZON_TABS: { value: Horizon; label: string }[] = [
  { value: "this_year", label: "This year" },
  { value: "1_3_years", label: "1-3 years" },
  { value: "someday", label: "Someday" },
];

const ASPECT_CYCLE = ["aspect-square", "aspect-[4/5]", "aspect-[4/5]", "aspect-square"];

export function DreamLifeClient({
  lifeAreas,
  dreams,
  visionItems,
  autoOpen,
}: {
  lifeAreas: LifeArea[];
  dreams: DreamWithGoals[];
  visionItems: VisionItem[];
  autoOpen: "dream_goal" | undefined;
}) {
  // dream dialog
  const [dreamDialogOpen, setDreamDialogOpen] = useState(autoOpen === "dream_goal" && dreams.length === 0);
  const [editingDream, setEditingDream] = useState<Dream | undefined>(undefined);

  // goal dialog
  const [goalDialogOpen, setGoalDialogOpen] = useState(autoOpen === "dream_goal" && dreams.length > 0);
  const [goalDialogDreamId, setGoalDialogDreamId] = useState<string | undefined>(undefined);

  // vision item dialog
  const [visionDialogOpen, setVisionDialogOpen] = useState(false);
  const [editingVisionItem, setEditingVisionItem] = useState<VisionItem | undefined>(undefined);

  // life area dialog
  const [lifeAreaDialogOpen, setLifeAreaDialogOpen] = useState(false);
  const [editingLifeArea, setEditingLifeArea] = useState<LifeArea | undefined>(undefined);

  const [activeHorizon, setActiveHorizon] = useState<Horizon>("this_year");

  const lifeAreaById = useMemo(() => {
    const map = new Map<string, LifeArea>();
    for (const area of lifeAreas) map.set(area.id, area);
    return map;
  }, [lifeAreas]);

  const dreamsByHorizon = useMemo(() => {
    const grouped: Record<Horizon, DreamWithGoals[]> = { this_year: [], "1_3_years": [], someday: [] };
    for (const dream of dreams) {
      const h = (dream.horizon as Horizon) ?? "someday";
      (grouped[h] ?? grouped.someday).push(dream);
    }
    return grouped;
  }, [dreams]);

  const timeline = useMemo(() => {
    const entries: { id: string; date: string; title: string; description: string | null; dreamTitle: string }[] = [];
    for (const dream of dreams) {
      for (const goal of dream.goals) {
        if (goal.target_date) {
          entries.push({
            id: goal.id,
            date: goal.target_date,
            title: goal.title,
            description: dream.description,
            dreamTitle: dream.title,
          });
        }
      }
    }
    return entries.sort((a, b) => a.date.localeCompare(b.date));
  }, [dreams]);

  function openNewDream() {
    setEditingDream(undefined);
    setDreamDialogOpen(true);
  }

  function openEditDream(dream: Dream) {
    setEditingDream(dream);
    setDreamDialogOpen(true);
  }

  function openNewGoal(dreamId?: string) {
    setGoalDialogDreamId(dreamId);
    setGoalDialogOpen(true);
  }

  function openNewVisionItem() {
    setEditingVisionItem(undefined);
    setVisionDialogOpen(true);
  }

  function openEditVisionItem(item: VisionItem) {
    setEditingVisionItem(item);
    setVisionDialogOpen(true);
  }

  function openNewLifeArea() {
    setEditingLifeArea(undefined);
    setLifeAreaDialogOpen(true);
  }

  function openEditLifeArea(area: LifeArea) {
    setEditingLifeArea(area);
    setLifeAreaDialogOpen(true);
  }

  async function handleDeleteDream(id: string) {
    await removeDream(id);
    toast.success("Dream removed");
  }

  async function handleDeleteVisionItem(id: string) {
    await removeVisionItem(id);
    toast.success("Removed from vision board");
  }

  async function handleDeleteLifeArea(id: string) {
    await removeLifeArea(id);
    toast.success("Life area removed");
  }

  async function handleDeleteGoal(id: string) {
    await removeDreamGoal(id);
    toast.success("Goal removed");
  }

  async function handleToggleGoal(goal: DreamGoal) {
    await toggleDreamGoalDone(goal.id, !goal.is_done);
  }

  return (
    <div className="flex flex-col gap-14">
      <div>
        <h1 className="text-[38px] font-bold tracking-tight text-ink">Dream Life</h1>
        <p className="mt-1 text-[13.5px] text-muted">The life I am building.</p>
      </div>

      {/* Vision board */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[26px] text-ink">Vision board</h2>
          <Button variant="secondary" size="sm" onClick={openNewVisionItem}>
            <Plus className="h-3.5 w-3.5" /> Add image
          </Button>
        </div>

        {visionItems.length === 0 ? (
          <EmptyState
            title="No vision board yet"
            description="Collect the images that show, not tell, what you're building toward."
            action={
              <Button variant="accent" onClick={openNewVisionItem}>
                Add your first image
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {visionItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => openEditVisionItem(item)}
                className={`group relative overflow-hidden rounded-[14px] border border-line bg-surface-2 text-left ${ASPECT_CYCLE[i % ASPECT_CYCLE.length]}`}
              >
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.caption} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-2 text-[12px] text-faint">
                    No image
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-3 pt-8">
                  <p className="text-[12.5px] font-semibold text-white">{item.caption}</p>
                </div>
                <div
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDeleteVisionItem(item.id);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-ink/50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Dreams into action */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[26px] text-ink">Dreams into action</h2>
          <Button variant="secondary" size="sm" onClick={openNewDream}>
            <Plus className="h-3.5 w-3.5" /> New dream
          </Button>
        </div>

        <Tabs value={activeHorizon} onValueChange={(v) => setActiveHorizon(v as Horizon)}>
          <TabsList>
            {HORIZON_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {HORIZON_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {dreamsByHorizon[tab.value].length === 0 ? (
                <EmptyState
                  title="No dreams yet"
                  description="What does the life you are building actually look like? Start with one dream."
                  action={
                    <Button variant="accent" onClick={openNewDream}>
                      Add a dream
                    </Button>
                  }
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {dreamsByHorizon[tab.value].map((dream) => {
                    const area = dream.life_area_id ? lifeAreaById.get(dream.life_area_id) : undefined;
                    return (
                      <Card key={dream.id} className="flex flex-col gap-4 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-[16px] font-bold text-ink">{dream.title}</h3>
                              {area && <Badge variant="mahogany">{area.name}</Badge>}
                            </div>
                            {dream.description && (
                              <p className="line-clamp-2 text-[13.5px] leading-relaxed text-muted">
                                {dream.description}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDream(dream)} aria-label="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDream(dream.id)}
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {dream.goalsTotal > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[11.5px] font-semibold text-muted">
                              <span>
                                {dream.goalsDone} of {dream.goalsTotal} goals done
                              </span>
                              <span>{dream.progress}%</span>
                            </div>
                            <Progress value={dream.progress} tone="amber" />
                          </div>
                        )}

                        <div className="flex flex-col gap-2">
                          {dream.goals.map((goal) => (
                            <label
                              key={goal.id}
                              className="group flex items-center gap-3 rounded-[10px] px-1 py-1 hover:bg-surface-2"
                            >
                              <Checkbox checked={goal.is_done} onChange={() => handleToggleGoal(goal)} />
                              <span
                                className={`flex-1 text-[13.5px] ${goal.is_done ? "text-faint line-through" : "text-ink"}`}
                              >
                                {goal.title}
                              </span>
                              {goal.target_date && (
                                <span className="text-[11.5px] text-faint">{goal.target_date}</span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteGoal(goal.id)}
                                aria-label="Delete goal"
                                className="text-faint opacity-0 transition-opacity hover:text-mahogany group-hover:opacity-100"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </label>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-fit"
                            onClick={() => openNewGoal(dream.id)}
                          >
                            <Plus className="h-3 w-3" /> Add goal
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Future timeline */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[26px] text-ink">Future timeline</h2>

        {timeline.length === 0 ? (
          <EmptyState
            title="Nothing on the timeline yet"
            description="Give a goal a target date and it will show up here, in order."
          />
        ) : (
          <div className="flex flex-col">
            {timeline.map((entry, i) => (
              <div key={entry.id} className="flex gap-5">
                <div className="flex w-28 shrink-0 flex-col items-end pt-0.5 text-right">
                  <span className="font-display text-[15px] text-ink">{entry.date}</span>
                </div>
                <div className="relative flex flex-col items-center">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-mahogany" />
                  {i < timeline.length - 1 && <span className="w-px flex-1 bg-line" />}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-[13.5px] font-semibold text-ink">{entry.title}</p>
                  <p className="text-[12px] text-faint">{entry.dreamTitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Beliefs / life areas */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[26px] text-ink">What I believe, and what I will not trade</h2>
          <Button variant="secondary" size="sm" onClick={openNewLifeArea}>
            <Plus className="h-3.5 w-3.5" /> New life area
          </Button>
        </div>

        {lifeAreas.length === 0 ? (
          <EmptyState
            title="No life areas yet"
            description="Name the areas of your life that matter, and the line you won't cross for each."
            action={
              <Button variant="accent" onClick={openNewLifeArea}>
                Add a life area
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {lifeAreas.map((area) => (
              <div key={area.id} className="group flex items-start justify-between gap-4 py-5 first:pt-0">
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-[20px] text-ink">{area.name}</h3>
                  {area.belief && (
                    <p className="max-w-2xl text-[14px] italic leading-relaxed text-muted">{area.belief}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" onClick={() => openEditLifeArea(area)} aria-label="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLifeArea(area.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <DreamDialog open={dreamDialogOpen} onOpenChange={setDreamDialogOpen} dream={editingDream} lifeAreas={lifeAreas} />
      <DreamGoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        dreams={dreams}
        dreamId={goalDialogDreamId}
      />
      <VisionItemDialog
        open={visionDialogOpen}
        onOpenChange={setVisionDialogOpen}
        visionItem={editingVisionItem}
        dreams={dreams}
      />
      <LifeAreaDialog open={lifeAreaDialogOpen} onOpenChange={setLifeAreaDialogOpen} lifeArea={editingLifeArea} />
    </div>
  );
}
