"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2, MapPin } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExperienceDialog } from "@/components/career/experience-dialog";
import { MilestoneDialog } from "@/components/career/milestone-dialog";
import { GoalDialog } from "@/components/career/goal-dialog";
import { removeExperience, removeMilestone, removeGoal } from "@/server/actions/career";
import type { ExperienceWithSkills } from "@/services/career";

type Skill = Tables<"skills">;
type Milestone = Tables<"career_milestones">;
type Goal = Tables<"career_goals">;

const GOAL_STATUS_VARIANT: Record<string, "teal" | "amber" | "default"> = {
  active: "teal",
  achieved: "amber",
  abandoned: "default",
};

export function CareerClient({
  experiences,
  milestones,
  goals,
  skills: skillsProp,
}: {
  experiences: ExperienceWithSkills[];
  milestones: Milestone[];
  goals: Goal[];
  skills: Skill[];
}) {
  const router = useRouter();
  // Skills created via the picker mid-dialog are merged in immediately for
  // instant UI feedback, ahead of the server revalidation that will
  // eventually fold them into `skillsProp` for good.
  const [extraSkills, setExtraSkills] = useState<Skill[]>([]);
  const skills = useMemo(() => {
    const known = new Set(skillsProp.map((s) => s.id));
    return [...skillsProp, ...extraSkills.filter((s) => !known.has(s.id))];
  }, [skillsProp, extraSkills]);

  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceWithSkills | undefined>(undefined);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>(undefined);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  function handleSkillCreated(skill: Skill) {
    setExtraSkills((prev) => (prev.some((s) => s.id === skill.id) ? prev : [...prev, skill]));
  }

  function openNewExperience() {
    setEditingExperience(undefined);
    setExperienceDialogOpen(true);
  }
  function openEditExperience(exp: ExperienceWithSkills) {
    setEditingExperience(exp);
    setExperienceDialogOpen(true);
  }
  async function handleDeleteExperience(id: string) {
    await removeExperience(id);
    toast.success("Experience removed");
    router.refresh();
  }

  function openNewMilestone() {
    setEditingMilestone(undefined);
    setMilestoneDialogOpen(true);
  }
  function openEditMilestone(m: Milestone) {
    setEditingMilestone(m);
    setMilestoneDialogOpen(true);
  }
  async function handleDeleteMilestone(id: string) {
    await removeMilestone(id);
    toast.success("Milestone removed");
    router.refresh();
  }

  function openNewGoal() {
    setEditingGoal(undefined);
    setGoalDialogOpen(true);
  }
  function openEditGoal(g: Goal) {
    setEditingGoal(g);
    setGoalDialogOpen(true);
  }
  async function handleDeleteGoal(id: string) {
    await removeGoal(id);
    toast.success("Goal removed");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Career map</h1>
          <p className="mt-1 text-[13.5px] text-muted">
            The story of your work, told through roles, milestones, and where you&apos;re headed.
          </p>
        </div>
        <Button variant="accent" onClick={openNewExperience}>
          Add experience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <EmptyState
          title="Start your career map"
          description="Add the roles that shaped your path, and the story behind each one."
          action={
            <Button variant="accent" onClick={openNewExperience}>
              Add your first experience
            </Button>
          }
        />
      ) : (
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              {experiences.map((exp) => (
                <Card key={exp.id} className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[15px] font-bold text-ink">{exp.title}</div>
                      <div className="mt-0.5 text-[13px] text-muted">{exp.organization}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-faint">
                        <span>
                          {format(parseISO(exp.start_date), "MMM yyyy")} –{" "}
                          {exp.is_current
                            ? "Present"
                            : exp.end_date
                              ? format(parseISO(exp.end_date), "MMM yyyy")
                              : "—"}
                        </span>
                        {exp.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {exp.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditExperience(exp)}
                        aria-label="Edit experience"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExperience(exp.id)}
                        aria-label="Delete experience"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {exp.narrative && (
                    <p className="border-l-2 border-line pl-3 text-[13.5px] leading-relaxed text-muted">
                      {exp.narrative}
                    </p>
                  )}
                  {exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.skills.map((skill) => (
                        <Badge key={skill.id} variant="teal">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-bold text-ink">Milestones</h2>
                <Button variant="secondary" size="sm" onClick={openNewMilestone}>
                  Add milestone
                </Button>
              </div>
              {milestones.length === 0 ? (
                <EmptyState title="No milestones yet" description="Mark the moments worth remembering." />
              ) : (
                <div className="flex flex-col gap-2">
                  {milestones.map((m) => (
                    <Card key={m.id} className="flex items-start justify-between gap-4 p-4">
                      <div>
                        <div className="text-[13.5px] font-bold text-ink">{m.title}</div>
                        <div className="mt-0.5 text-[12px] text-faint">
                          {format(parseISO(m.occurred_on), "d MMMM yyyy")}
                        </div>
                        {m.description && <p className="mt-1 text-[13px] text-muted">{m.description}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditMilestone(m)}
                          aria-label="Edit milestone"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMilestone(m.id)}
                          aria-label="Delete milestone"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="flex flex-col gap-3">
            <div className="flex items-center justify-end">
              <Button variant="secondary" size="sm" onClick={openNewGoal}>
                Add goal
              </Button>
            </div>
            {goals.length === 0 ? (
              <EmptyState title="No goals yet" description="Where do you want your career to go next?" />
            ) : (
              <div className="flex flex-col gap-2">
                {goals.map((g) => (
                  <Card key={g.id} className="flex items-start justify-between gap-4 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-bold text-ink">{g.title}</span>
                        <Badge variant={GOAL_STATUS_VARIANT[g.status] ?? "default"}>{g.status}</Badge>
                      </div>
                      {g.target_date && (
                        <div className="mt-0.5 text-[12px] text-faint">
                          Target: {format(parseISO(g.target_date), "d MMMM yyyy")}
                        </div>
                      )}
                      {g.description && <p className="mt-1 text-[13px] text-muted">{g.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditGoal(g)}
                        aria-label="Edit goal"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGoal(g.id)}
                        aria-label="Delete goal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <ExperienceDialog
        open={experienceDialogOpen}
        onOpenChange={setExperienceDialogOpen}
        experience={editingExperience}
        skills={skills}
        onSkillCreated={handleSkillCreated}
      />
      <MilestoneDialog
        open={milestoneDialogOpen}
        onOpenChange={setMilestoneDialogOpen}
        milestone={editingMilestone}
        experiences={experiences}
      />
      <GoalDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen} goal={editingGoal} />
    </div>
  );
}
