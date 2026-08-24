"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { MapPin, Plus, X, ChevronDown } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { ExperienceDialog } from "@/components/career/experience-dialog";
import { MilestoneDialog } from "@/components/career/milestone-dialog";
import { GoalDialog } from "@/components/career/goal-dialog";
import { SeasonDialog } from "@/components/career/season-dialog";
import { MapStepDialog } from "@/components/career/map-step-dialog";
import { StatementDialog } from "@/components/career/statement-dialog";
import { MentorDialog } from "@/components/career/mentor-dialog";
import { ReflectionDialog } from "@/components/career/reflection-dialog";
import { OpportunityDialog } from "@/components/career/opportunity-dialog";
import { SkillStoryDialog } from "@/components/skills/skill-story-dialog";
import {
  removeExperience,
  removeMilestone,
  removeGoal,
  removeSeason,
  removeMapStep,
  removeStatement,
  removeMentor,
  removeReflection,
  removeOpportunity,
  saveMission,
} from "@/server/actions/career";
import { removeSkill } from "@/server/actions/skills";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { careerMapStages } from "@/lib/validation/career";
import type { ExperienceWithSkills } from "@/services/career";

type Skill = Tables<"skills">;
type Season = Tables<"career_seasons">;
type Milestone = Tables<"career_milestones">;
type Goal = Tables<"career_goals">;
type MapStep = Tables<"career_map_steps">;
type Statement = Tables<"career_statements">;
type Mentor = Tables<"career_mentors">;
type Reflection = Tables<"career_reflections">;
type Opportunity = Tables<"career_opportunities">;

const GOAL_STATUS_VARIANT: Record<string, "teal" | "amber" | "default"> = {
  active: "teal",
  achieved: "amber",
  abandoned: "default",
};

const VIEWS = [
  { value: "overview", label: "Overview" },
  { value: "journey", label: "Journey" },
  { value: "goals", label: "Goals" },
] as const;

type ViewValue = (typeof VIEWS)[number]["value"];

function EditDeleteRow({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="mt-4 flex gap-4">
      <button
        type="button"
        onClick={onEdit}
        className="text-[12px] font-extrabold text-faint transition-colors hover:text-teal"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="text-[12px] font-extrabold text-faint transition-colors hover:text-mahogany"
      >
        Delete
      </button>
    </div>
  );
}

function AddDashedButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 w-full rounded-[14px] border-[1.5px] border-dashed border-line py-3.5 text-[14px] font-extrabold text-muted transition-colors hover:border-teal hover:text-teal"
    >
      {children}
    </button>
  );
}

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-[11px] font-extrabold uppercase tracking-[0.15em] text-faint", className)}>
      {children}
    </div>
  );
}

export function CareerClient({
  experiences,
  seasons,
  milestones,
  goals,
  skills: skillsProp,
  mapSteps,
  identityStatements,
  legacyStatements,
  mentors,
  reflections,
  opportunities,
  mission: missionProp,
  careerFacts,
}: {
  experiences: ExperienceWithSkills[];
  seasons: Season[];
  milestones: Milestone[];
  goals: Goal[];
  skills: Skill[];
  mapSteps: MapStep[];
  identityStatements: Statement[];
  legacyStatements: Statement[];
  mentors: Mentor[];
  reflections: Reflection[];
  opportunities: Opportunity[];
  mission: string;
  careerFacts: { label: string; value: string }[];
}) {
  const router = useRouter();
  const confirm = useConfirm();

  const [extraSkills, setExtraSkills] = useState<Skill[]>([]);
  const skills = useMemo(() => {
    const known = new Set(skillsProp.map((s) => s.id));
    return [...skillsProp, ...extraSkills.filter((s) => !known.has(s.id))];
  }, [skillsProp, extraSkills]);

  const [activeView, setActiveView] = useState<ViewValue>("overview");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [openSeasons, setOpenSeasons] = useState<Set<string>>(new Set());

  const [mission, setMission] = useState(missionProp);
  const [missionSaving, setMissionSaving] = useState(false);

  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceWithSkills | undefined>();
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>();
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | undefined>();
  const [mapStepDialogOpen, setMapStepDialogOpen] = useState(false);
  const [editingMapStep, setEditingMapStep] = useState<MapStep | undefined>();
  const [identityDialogOpen, setIdentityDialogOpen] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState<Statement | undefined>();
  const [legacyDialogOpen, setLegacyDialogOpen] = useState(false);
  const [editingLegacy, setEditingLegacy] = useState<Statement | undefined>();
  const [mentorDialogOpen, setMentorDialogOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | undefined>();
  const [reflectionDialogOpen, setReflectionDialogOpen] = useState(false);
  const [editingReflection, setEditingReflection] = useState<Reflection | undefined>();
  const [opportunityDialogOpen, setOpportunityDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | undefined>();

  function handleSkillCreated(skill: Skill) {
    setExtraSkills((prev) => (prev.some((s) => s.id === skill.id) ? prev : [...prev, skill]));
  }

  async function handleMissionBlur() {
    if (mission === missionProp) return;
    setMissionSaving(true);
    const result = await saveMission(mission);
    setMissionSaving(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  const handleDelete = useCallback(
    async (action: () => Promise<void>, label: string, subject: string) => {
      const ok = await confirm({
        title: `Delete "${subject}"?`,
        description: "This can't be undone.",
      });
      if (!ok) return;
      await action();
      toast.success(label);
      router.refresh();
    },
    [router, confirm],
  );

  const seasonSkillLines = useMemo(() => {
    const map = new Map<string, string>();
    for (const season of seasons) {
      const names = new Set<string>();
      for (const exp of experiences) {
        if (exp.season_id === season.id) {
          for (const skill of exp.skills) names.add(skill.name);
        }
      }
      const list = Array.from(names).slice(0, 3);
      map.set(season.id, list.length ? `Grew fastest in ${list.join(", ")}` : "");
    }
    return map;
  }, [seasons, experiences]);

  const experienceById = useMemo(() => {
    const map = new Map<string, ExperienceWithSkills>();
    for (const exp of experiences) map.set(exp.id, exp);
    return map;
  }, [experiences]);

  const mapGroups = useMemo(() => {
    return careerMapStages.map((stage) => ({
      stage,
      rows: mapSteps.filter((s) => s.stage === stage),
    }));
  }, [mapSteps]);

  const journeyItems = useMemo(() => {
    const fromExperiences = experiences.map((e) => ({
      id: `exp-${e.id}`,
      date: e.start_date,
      kind: "Experience",
      title: e.title,
      sub: e.organization,
      body: e.narrative,
      tags: e.skills.map((s) => s.name),
      onEdit: () => {
        setEditingExperience(e);
        setExperienceDialogOpen(true);
      },
      onDelete: () => handleDelete(() => removeExperience(e.id), "Experience removed", e.title),
    }));
    const fromMilestones = milestones.map((m) => ({
      id: `mil-${m.id}`,
      date: m.occurred_on,
      kind: m.kind || "Milestone",
      title: m.title,
      sub: m.experience_id ? (experienceById.get(m.experience_id)?.organization ?? null) : null,
      body: m.description,
      tags: m.tags,
      onEdit: () => {
        setEditingMilestone(m);
        setMilestoneDialogOpen(true);
      },
      onDelete: () => handleDelete(() => removeMilestone(m.id), "Milestone removed", m.title),
    }));
    return [...fromExperiences, ...fromMilestones].sort((a, b) => b.date.localeCompare(a.date));
  }, [experiences, milestones, experienceById, handleDelete]);

  const directionGoal = goals.find((g) => g.status === "active");

  const nextStep = useMemo(() => {
    if (experiences.length === 0) {
      return {
        title: "Add your first experience",
        body: "Start with the most recent role or project. You can fill in the rest later.",
        cta: "Add experience",
        onGo: () => {
          setEditingExperience(undefined);
          setExperienceDialogOpen(true);
        },
      };
    }
    if (skills.length === 0) {
      return {
        title: "Name a skill",
        body: "What do people usually come to you for? That is usually the first one.",
        cta: "Add a skill",
        onGo: () => {
          setEditingSkill(undefined);
          setSkillDialogOpen(true);
        },
      };
    }
    if (directionGoal?.next_step) {
      return {
        title: directionGoal.next_step,
        body: `The next step toward "${directionGoal.title}".`,
        cta: "View goal",
        onGo: () => setActiveView("goals"),
      };
    }
    if (goals.length === 0) {
      return {
        title: "Set a direction",
        body: "A goal is the one thing that makes everything else here easier to judge.",
        cta: "Set a goal",
        onGo: () => {
          setEditingGoal(undefined);
          setGoalDialogOpen(true);
        },
      };
    }
    return {
      title: "Log what you're proud of",
      body: "Something you did recently that felt hard. That counts, even without a title.",
      cta: "Add achievement",
      onGo: () => {
        setEditingMilestone(undefined);
        setMilestoneDialogOpen(true);
      },
    };
  }, [experiences.length, skills.length, directionGoal, goals.length]);

  function toggleSeason(id: string) {
    setOpenSeasons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const captureItems = [
    {
      label: "Add experience",
      onClick: () => {
        setEditingExperience(undefined);
        setExperienceDialogOpen(true);
        setActiveView("overview");
      },
    },
    {
      label: "Log an achievement",
      onClick: () => {
        setEditingMilestone(undefined);
        setMilestoneDialogOpen(true);
        setActiveView("overview");
      },
    },
    {
      label: "Add a skill",
      onClick: () => {
        setEditingSkill(undefined);
        setSkillDialogOpen(true);
        setActiveView("overview");
      },
    },
    {
      label: "Add a season",
      onClick: () => {
        setEditingSeason(undefined);
        setSeasonDialogOpen(true);
        setActiveView("journey");
      },
    },
    {
      label: "Add a career goal",
      onClick: () => {
        setEditingGoal(undefined);
        setGoalDialogOpen(true);
        setActiveView("goals");
      },
    },
    {
      label: "Add a career map step",
      onClick: () => {
        setEditingMapStep(undefined);
        setMapStepDialogOpen(true);
        setMoreOpen(true);
      },
    },
    {
      label: "Add a statement",
      onClick: () => {
        setEditingIdentity(undefined);
        setIdentityDialogOpen(true);
        setMoreOpen(true);
      },
    },
    {
      label: "Add an influence",
      onClick: () => {
        setEditingMentor(undefined);
        setMentorDialogOpen(true);
        setMoreOpen(true);
      },
    },
    {
      label: "Write a reflection",
      onClick: () => {
        setEditingReflection(undefined);
        setReflectionDialogOpen(true);
        setMoreOpen(true);
      },
    },
    {
      label: "Add an archive entry",
      onClick: () => {
        setEditingOpportunity(undefined);
        setOpportunityDialogOpen(true);
        setMoreOpen(true);
      },
    },
    {
      label: "Add a legacy note",
      onClick: () => {
        setEditingLegacy(undefined);
        setLegacyDialogOpen(true);
        setMoreOpen(true);
      },
    },
  ];

  const heroHeadline =
    experiences.length === 0
      ? "Your career story starts here."
      : `${careerFacts[0]?.value ?? "Some"} across ${experiences.length} role${experiences.length === 1 ? "" : "s"} and ${new Set(experiences.map((e) => e.organization)).size} organization${new Set(experiences.map((e) => e.organization)).size === 1 ? "" : "s"}.`;

  return (
    <div className="max-w-[1240px]">
      <Card className="mb-[22px] rounded-[22px] p-[44px] shadow-north-md">
        <Eyebrow className="mb-4">My professional story</Eyebrow>
        <h1 className="mb-6 max-w-[20em] text-[40px] font-extrabold leading-[1.12] tracking-[-0.03em] text-ink">
          {heroHeadline}
        </h1>
        <Textarea
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          onBlur={handleMissionBlur}
          rows={3}
          placeholder="What has this career actually been about? Write the line only you could write."
          className="max-w-[46em] rounded-[18px] bg-surface-2 px-5 py-[18px] text-[17.5px] leading-[1.65]"
        />
        <div className="mt-2.5 text-[12.5px] font-bold text-faint">
          {missionSaving ? "Saving…" : mission ? "Saves when you click away." : "This is the first thing people read about your career."}
        </div>
        <div className="mt-[30px] flex flex-wrap gap-3.5 border-t border-line-2 pt-[26px]">
          {careerFacts.map((fact) => (
            <div key={fact.label} className="min-w-[170px]">
              <Eyebrow className="mb-2">{fact.label}</Eyebrow>
              <div className="text-[16px] font-extrabold leading-[1.4] text-ink">{fact.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-[26px] flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-1.5 rounded-[20px] border border-line bg-surface-2 p-[5px]">
          {VIEWS.map((view) => (
            <button
              key={view.value}
              type="button"
              onClick={() => setActiveView(view.value)}
              className={cn(
                "rounded-[13px] px-4 py-2 text-[13px] font-bold transition-colors",
                activeView === view.value ? "bg-raise text-ink shadow-north-sm" : "text-muted hover:text-ink",
              )}
            >
              {view.label}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <Button
          variant="secondary"
          size="sm"
          className="border-none bg-teal text-white hover:opacity-90"
          onClick={() => setCaptureOpen((v) => !v)}
        >
          Add to Career
        </Button>
      </div>

      {activeView === "overview" && (
        <div className="flex flex-col gap-[22px]">
          <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-[1.5fr_1fr]">
            <Card className="rounded-[22px] p-[34px_36px] shadow-north-md">
              <Eyebrow className="mb-3.5">Where you are heading</Eyebrow>
              {directionGoal ? (
                <>
                  <h2 className="mb-3 text-[28px] font-extrabold leading-[1.22] text-ink">
                    {directionGoal.title}
                  </h2>
                  {directionGoal.description && (
                    <p className="mb-5 max-w-[38em] text-[15.5px] leading-[1.7] text-muted">
                      {directionGoal.description}
                    </p>
                  )}
                  <div className="mb-3.5 h-2 rounded-full bg-mahogany-soft">
                    <Progress value={directionGoal.progress} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-6 text-[14px] text-muted">
                    {directionGoal.next_step && (
                      <span>
                        Next <strong className="text-ink">{directionGoal.next_step}</strong>
                      </span>
                    )}
                    {directionGoal.target_date && (
                      <span>
                        By{" "}
                        <strong className="text-ink">
                          {format(parseISO(directionGoal.target_date), "d MMMM yyyy")}
                        </strong>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGoal(directionGoal);
                      setGoalDialogOpen(true);
                    }}
                    className="mt-4 text-[13px] font-extrabold text-teal transition-colors hover:text-amber"
                  >
                    Edit direction
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-5 max-w-[34em] text-[16px] leading-[1.7] text-muted">
                    Nothing set yet. A direction is the one thing that makes everything else here easier to
                    judge.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGoal(undefined);
                      setGoalDialogOpen(true);
                    }}
                    className="text-[14.5px] font-extrabold text-teal transition-colors hover:text-amber"
                  >
                    Say where you would like to go
                  </button>
                </>
              )}
            </Card>

            <div className="relative overflow-hidden rounded-[22px] bg-ink p-[30px_32px] text-bg">
              <div
                className="pointer-events-none absolute -right-20 -bottom-28 h-[280px] w-[280px] rounded-full"
                style={{ background: "radial-gradient(circle, rgba(255,125,0,.22), transparent 68%)" }}
              />
              <div className="relative">
                <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[0.15em] text-bg/60">
                  A good next step
                </div>
                <div className="mb-2.5 text-[20px] font-extrabold leading-[1.35]">{nextStep.title}</div>
                <p className="mb-[22px] text-[14.5px] leading-[1.65] text-bg/70">{nextStep.body}</p>
                <Button variant="accent" size="sm" onClick={nextStep.onGo}>
                  {nextStep.cta}
                </Button>
              </div>
            </div>
          </div>

          <Card className="rounded-[22px] p-[32px_34px] shadow-north-md">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <h2 className="text-[26px] font-extrabold text-ink">Experience</h2>
              <button
                type="button"
                onClick={() => {
                  setEditingExperience(undefined);
                  setExperienceDialogOpen(true);
                }}
                className="text-[13px] font-extrabold text-teal transition-colors hover:text-amber"
              >
                Add experience
              </button>
            </div>
            {experiences.length === 0 ? (
              <p className="my-3.5 max-w-[40em] text-[15.5px] leading-[1.7] text-muted">
                Not sure what counts? Internships, freelance work, university projects, volunteering and
                meaningful personal projects can all belong here.
              </p>
            ) : (
              <div className="mt-[22px] flex flex-col gap-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-b border-line-2 pb-6 last:border-0 last:pb-0">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="text-[12px] font-extrabold uppercase tracking-wider text-faint">
                        {format(parseISO(exp.start_date), "MMM yyyy")} –{" "}
                        {exp.is_current ? "Present" : exp.end_date ? format(parseISO(exp.end_date), "MMM yyyy") : "—"}
                      </span>
                      {exp.location && (
                        <span className="inline-flex items-center gap-1 text-[12.5px] text-faint">
                          <MapPin className="h-3 w-3" /> {exp.location}
                        </span>
                      )}
                    </div>
                    <div className="mb-1 text-[23px] font-extrabold leading-[1.25] text-ink">{exp.title}</div>
                    <div className="mb-3 text-[14px] text-muted">{exp.organization}</div>
                    {exp.narrative && (
                      <p className="mb-3 max-w-[44em] text-[15.5px] leading-[1.7] text-muted">{exp.narrative}</p>
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
                    <EditDeleteRow
                      onEdit={() => {
                        setEditingExperience(exp);
                        setExperienceDialogOpen(true);
                      }}
                      onDelete={() => handleDelete(() => removeExperience(exp.id), "Experience removed", exp.title)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-2">
            <Card className="rounded-[22px] p-[32px_34px] shadow-north-md">
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 className="text-[24px] font-extrabold text-ink">Skills</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSkill(undefined);
                    setSkillDialogOpen(true);
                  }}
                  className="text-[13px] font-extrabold text-teal transition-colors hover:text-amber"
                >
                  Add skill
                </button>
              </div>
              {skills.length === 0 ? (
                <p className="text-[15px] leading-[1.7] text-muted">
                  What do people usually come to you for? That is usually the first one.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {skills.map((skill) => (
                    <div key={skill.id}>
                      <div className="mb-2 flex justify-between text-[15px] font-bold">
                        <span>{skill.name}</span>
                        <span className="text-[12.5px] text-muted">
                          {skill.level_label || `Level ${skill.proficiency}/5`}
                        </span>
                      </div>
                      <div className="h-[7px] rounded-full bg-mahogany-soft">
                        <div
                          className="h-full rounded-full bg-teal transition-[width] duration-500"
                          style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="rounded-[22px] p-[32px_34px] shadow-north-md">
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 className="text-[24px] font-extrabold text-ink">Proud of</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMilestone(undefined);
                    setMilestoneDialogOpen(true);
                  }}
                  className="text-[13px] font-extrabold text-teal transition-colors hover:text-amber"
                >
                  Add achievement
                </button>
              </div>
              {milestones.length === 0 ? (
                <p className="text-[15px] leading-[1.7] text-muted">
                  What have you done that once felt difficult? That counts, even if nobody gave you a title
                  for it.
                </p>
              ) : (
                <div className="flex flex-col gap-5">
                  {milestones.slice(0, 3).map((m) => (
                    <div key={m.id} className="border-b border-line-2 pb-5 last:border-0 last:pb-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                        <span className="text-[12px] font-extrabold uppercase tracking-wider text-faint">
                          {format(parseISO(m.occurred_on), "MMM yyyy")}
                        </span>
                        {m.kind && (
                          <Badge variant="amber" className="normal-case tracking-normal">
                            {m.kind}
                          </Badge>
                        )}
                      </div>
                      <div className="mb-1 text-[17px] font-extrabold leading-[1.35] text-ink">{m.title}</div>
                      {m.description && (
                        <p className="text-[14.5px] leading-[1.65] text-muted">{m.description}</p>
                      )}
                      <EditDeleteRow
                        onEdit={() => {
                          setEditingMilestone(m);
                          setMilestoneDialogOpen(true);
                        }}
                        onDelete={() => handleDelete(() => removeMilestone(m.id), "Milestone removed", m.title)}
                      />
                    </div>
                  ))}
                  {milestones.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setActiveView("journey")}
                      className="text-left text-[13px] font-extrabold text-teal transition-colors hover:text-amber"
                    >
                      See all in your journey
                    </button>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeView === "journey" && (
        <div className="flex flex-col gap-[26px]">
          {seasons.length > 0 && (
            <div className="flex flex-col gap-3.5">
              {seasons.map((season) => {
                const open = openSeasons.has(season.id);
                return (
                  <Card key={season.id} className="overflow-hidden rounded-[22px] shadow-north-md">
                    <button
                      type="button"
                      onClick={() => toggleSeason(season.id)}
                      className="flex w-full items-center gap-4.5 px-[30px] py-[22px] text-left"
                    >
                      <span className="h-[26px] w-[3px] shrink-0 rounded-full bg-amber" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[21px] font-extrabold tracking-[-0.01em] text-ink">
                          {season.title}
                        </span>
                        <span className="mt-1 block text-[13px] font-bold text-muted">
                          {season.start_year}
                          {season.is_current ? "–Present" : season.end_year ? `–${season.end_year}` : ""}
                          {season.chapter ? ` · ${season.chapter}` : ""}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn("h-4 w-4 shrink-0 text-faint transition-transform", open && "rotate-180")}
                      />
                    </button>
                    {open && (
                      <div className="px-[30px] pb-[26px]">
                        {season.description && (
                          <p className="mb-5 max-w-[44em] text-[15.5px] leading-[1.7] text-muted">
                            {season.description}
                          </p>
                        )}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <Eyebrow className="mb-3">What happened</Eyebrow>
                            {season.wins.length === 0 ? (
                              <p className="text-[13.5px] text-faint">Nothing logged yet.</p>
                            ) : (
                              <div className="flex flex-col gap-2.5">
                                {season.wins.map((win, i) => (
                                  <div key={i} className="flex items-start gap-2.5">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                                    <span className="text-[14.5px] leading-[1.5] text-ink">{win}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <Eyebrow className="mb-3">What it taught me</Eyebrow>
                            {season.lessons ? (
                              <p className="text-[15px] italic leading-[1.65] text-ink">{season.lessons}</p>
                            ) : (
                              <p className="text-[13.5px] text-faint">Nothing written yet.</p>
                            )}
                            {seasonSkillLines.get(season.id) && (
                              <div className="mt-3.5 text-[13px] font-bold text-muted">
                                {seasonSkillLines.get(season.id)}
                              </div>
                            )}
                          </div>
                        </div>
                        <EditDeleteRow
                          onEdit={() => {
                            setEditingSeason(season);
                            setSeasonDialogOpen(true);
                          }}
                          onDelete={() => handleDelete(() => removeSeason(season.id), "Season removed", season.title)}
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
              <AddDashedButton onClick={() => setSeasonDialogOpen(true)}>Add a season</AddDashedButton>
            </div>
          )}

          <Card className="rounded-[22px] p-[36px_38px] shadow-north-md">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <h2 className="text-[26px] font-extrabold text-ink">Your journey</h2>
              <span className="text-[12.5px] font-bold text-faint">Built from everything you add</span>
            </div>
            <p className="mb-[30px] max-w-[40em] text-[15px] text-muted">
              Every experience and milestone you add lands here in order. Nothing to maintain separately.
            </p>
            {journeyItems.length === 0 ? (
              <EmptyState
                title="Nothing here yet"
                description="Add an experience or a milestone and it will show up here in order."
              />
            ) : (
              <div className="relative pl-[30px]">
                <div className="absolute bottom-1.5 left-[5px] top-1.5 w-[2px] bg-line" />
                <div className="flex flex-col gap-9">
                  {journeyItems.map((item) => (
                    <div key={item.id} className="relative">
                      <div className="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full bg-teal" />
                      <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                        <span className="text-[12px] font-extrabold uppercase tracking-wider text-faint">
                          {format(parseISO(item.date), "MMM yyyy")}
                        </span>
                        <Badge variant="amber" className="normal-case tracking-normal">
                          {item.kind}
                        </Badge>
                      </div>
                      <div className="mb-1 text-[22px] font-extrabold text-ink">{item.title}</div>
                      {item.sub && <div className="mb-3 text-[14px] text-muted">{item.sub}</div>}
                      {item.body && (
                        <p className="mb-3.5 max-w-[44em] text-[15.5px] leading-[1.7] text-muted">{item.body}</p>
                      )}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="normal-case tracking-normal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <EditDeleteRow onEdit={item.onEdit} onDelete={item.onDelete} />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExperience(undefined);
                    setExperienceDialogOpen(true);
                  }}
                  className="mt-8 w-full rounded-[14px] border-[1.5px] border-dashed border-line py-3.5 text-[14px] font-extrabold text-muted transition-colors hover:border-teal hover:text-teal"
                >
                  Add to your journey
                </button>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeView === "goals" && (
        <div>
          {goals.length === 0 ? (
            <EmptyState
              title="No goals yet"
              description="Where do you want your career to go next?"
              action={
                <Button variant="accent" onClick={() => setGoalDialogOpen(true)}>
                  Set your first goal
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {goals.map((g) => (
                <Card key={g.id} className="rounded-[22px] p-[30px_32px] shadow-north-md">
                  <div className="mb-3.5 flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                        g.status === "achieved" ? "bg-amber" : g.status === "abandoned" ? "bg-faint" : "bg-teal",
                      )}
                    />
                    <span className="flex-1 text-[20px] font-extrabold leading-[1.35] text-ink">{g.title}</span>
                    <span className="text-[13px] font-extrabold text-muted">{g.progress}%</span>
                  </div>
                  <div className="mb-4 h-2 rounded-full bg-mahogany-soft">
                    <Progress value={g.progress} className="h-2" />
                  </div>
                  <Badge variant={GOAL_STATUS_VARIANT[g.status] ?? "default"} className="mb-3">
                    {g.status}
                  </Badge>
                  {g.description && (
                    <p className="mb-3.5 text-[14.5px] leading-[1.65] text-muted">{g.description}</p>
                  )}
                  <div className="flex flex-wrap gap-6 text-[13.5px] text-ink">
                    {g.target_date && (
                      <span>
                        <strong>By</strong> {format(parseISO(g.target_date), "d MMMM yyyy")}
                      </span>
                    )}
                    {g.next_step && (
                      <span>
                        <strong>Next</strong> {g.next_step}
                      </span>
                    )}
                  </div>
                  <EditDeleteRow
                    onEdit={() => {
                      setEditingGoal(g);
                      setGoalDialogOpen(true);
                    }}
                    onDelete={() => handleDelete(() => removeGoal(g.id), "Goal removed", g.title)}
                  />
                </Card>
              ))}
            </div>
          )}
          <AddDashedButton onClick={() => setGoalDialogOpen(true)}>Add a career goal</AddDashedButton>
        </div>
      )}

      <div className="mt-[30px] border-t border-line-2 pt-[22px]">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className="flex items-center gap-3 text-[16px] font-extrabold text-ink transition-colors hover:text-teal"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", moreOpen && "rotate-180")} />
          <span>More of your story</span>
          <span className="text-[13px] font-bold text-faint">
            Identity, skill growth, career map, influences, reflections, archive and legacy
          </span>
        </button>

        {moreOpen && (
          <div className="mt-6 flex flex-col gap-[22px]">
            <Card className="max-w-[900px] rounded-[22px] p-[32px_34px] shadow-north-md">
              <h3 className="mb-[22px] text-[23px] font-extrabold text-ink">Who I am at work</h3>
              {identityStatements.length === 0 ? (
                <EmptyState
                  title="Nothing written yet"
                  description="How would you describe yourself, professionally, in your own words?"
                />
              ) : (
                <div className="flex flex-col gap-6">
                  {identityStatements.map((s) => (
                    <div key={s.id} className="border-b border-line-2 pb-6">
                      <Eyebrow>{s.kind}</Eyebrow>
                      <p className="mt-2.5 text-[19px] font-bold leading-[1.6] text-ink">{s.statement}</p>
                      <EditDeleteRow
                        onEdit={() => {
                          setEditingIdentity(s);
                          setIdentityDialogOpen(true);
                        }}
                        onDelete={() => handleDelete(() => removeStatement(s.id), "Statement removed", s.kind)}
                      />
                    </div>
                  ))}
                </div>
              )}
              <AddDashedButton onClick={() => setIdentityDialogOpen(true)}>Add a statement</AddDashedButton>
            </Card>

            {skills.length > 0 && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {skills.map((skill) => (
                  <Card key={skill.id} className="rounded-[22px] p-[30px_32px] shadow-north-md">
                    <div className="mb-3.5 flex items-baseline justify-between gap-3.5">
                      <span className="text-[21px] font-extrabold text-ink">{skill.name}</span>
                      <span className="text-[12.5px] font-extrabold text-muted">
                        {skill.level_label || `Level ${skill.proficiency}/5`}
                      </span>
                    </div>
                    <div className="mb-6 h-2 rounded-full bg-mahogany-soft">
                      <div
                        className="h-full rounded-full bg-teal transition-[width] duration-500"
                        style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                      />
                    </div>
                    {skill.growth_steps.length > 0 && (
                      <div className="relative pl-[22px]">
                        <div className="absolute bottom-1.5 left-1 top-1.5 w-[2px] bg-line" />
                        <div className="flex flex-col gap-3.5">
                          {skill.growth_steps.map((step, i) => (
                            <div key={i} className="relative">
                              <span className="absolute -left-[22px] top-1.5 h-2 w-2 rounded-full bg-teal" />
                              <div className="text-[14.5px] leading-[1.5] text-ink">{step}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {skill.evidence && (
                      <p className="mt-3 text-[13.5px] leading-[1.6] text-muted">{skill.evidence}</p>
                    )}
                    {skill.next_step && (
                      <div className="mt-5 border-t border-line-2 pt-4 text-[14px] text-ink">
                        <strong>Next</strong> {skill.next_step}
                      </div>
                    )}
                    <EditDeleteRow
                      onEdit={() => {
                        setEditingSkill(skill);
                        setSkillDialogOpen(true);
                      }}
                      onDelete={async () => {
                        const ok = await confirm({
                          title: `Delete "${skill.name}"?`,
                          description: "This can't be undone.",
                        });
                        if (!ok) return;
                        await removeSkill(skill.id);
                        toast.success("Skill removed");
                        router.refresh();
                      }}
                    />
                  </Card>
                ))}
              </div>
            )}

            <Card className="rounded-[22px] p-[32px_34px] shadow-north-md">
              <div className="mb-1.5">
                <h3 className="text-[23px] font-extrabold text-ink">Career map</h3>
              </div>
              <p className="mb-[26px] text-[15px] text-muted">
                Where it has been, where it is, and the directions it could go.
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {mapGroups.map((group) => (
                  <div key={group.stage}>
                    <Eyebrow className="mb-3">{group.stage}</Eyebrow>
                    <div className="flex flex-col gap-3">
                      {group.rows.length === 0 ? (
                        <p className="text-[12.5px] text-faint">Nothing here yet.</p>
                      ) : (
                        group.rows.map((row) => (
                          <Card key={row.id} className="rounded-[16px] p-4">
                            <div className="mb-1.5 text-[16px] font-extrabold leading-[1.35] text-ink">
                              {row.label}
                            </div>
                            {row.note && <div className="text-[13px] leading-[1.5] text-muted">{row.note}</div>}
                            <EditDeleteRow
                              onEdit={() => {
                                setEditingMapStep(row);
                                setMapStepDialogOpen(true);
                              }}
                              onDelete={() => handleDelete(() => removeMapStep(row.id), "Step removed", row.label)}
                            />
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMapStepDialogOpen(true)}
                className="mt-5 text-[13.5px] font-extrabold text-teal transition-colors hover:text-amber"
              >
                Add a step
              </button>
            </Card>

            <div>
              {mentors.length === 0 ? (
                <EmptyState
                  title="No influences logged yet"
                  description="Who shaped how you work, and what did you take from them?"
                  action={
                    <Button variant="accent" onClick={() => setMentorDialogOpen(true)}>
                      Add your first influence
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {mentors.map((m) => {
                    const initials = m.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <Card key={m.id} className="flex gap-4.5 rounded-[22px] p-[28px_30px] shadow-north-md">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-soft text-[14px] font-extrabold text-teal">
                          {initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 text-[18px] font-extrabold text-ink">{m.name}</div>
                          {m.role && <div className="mb-3.5 text-[13px] text-muted">{m.role}</div>}
                          {m.how_helped && (
                            <p className="mb-3.5 text-[14.5px] leading-[1.65] text-muted">{m.how_helped}</p>
                          )}
                          {m.lesson && (
                            <div className="rounded-[14px] bg-surface-2 px-4 py-3.5 text-[14.5px] italic leading-[1.6] text-ink">
                              {m.lesson}
                            </div>
                          )}
                          <EditDeleteRow
                            onEdit={() => {
                              setEditingMentor(m);
                              setMentorDialogOpen(true);
                            }}
                            onDelete={() => handleDelete(() => removeMentor(m.id), "Influence removed", m.name)}
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
              <AddDashedButton onClick={() => setMentorDialogOpen(true)}>Add an influence</AddDashedButton>
            </div>

            <div>
              {reflections.length === 0 ? (
                <EmptyState
                  title="No reflections yet"
                  description="Answer a question about your career, honestly, for an audience of one."
                  action={
                    <Button variant="accent" onClick={() => setReflectionDialogOpen(true)}>
                      Write your first reflection
                    </Button>
                  }
                />
              ) : (
                <div className="flex max-w-[900px] flex-col gap-6">
                  {reflections.map((r) => (
                    <Card key={r.id} className="rounded-[22px] p-[34px_36px] shadow-north-md">
                      <h3 className="mb-4 text-[23px] font-extrabold leading-[1.35] text-ink">{r.prompt}</h3>
                      <p className="text-[16.5px] leading-[1.8] text-muted">{r.body}</p>
                      <EditDeleteRow
                        onEdit={() => {
                          setEditingReflection(r);
                          setReflectionDialogOpen(true);
                        }}
                        onDelete={() => handleDelete(() => removeReflection(r.id), "Reflection removed", r.prompt)}
                      />
                    </Card>
                  ))}
                </div>
              )}
              <AddDashedButton onClick={() => setReflectionDialogOpen(true)}>Write a reflection</AddDashedButton>
            </div>

            <Card className="max-w-[860px] rounded-[22px] p-[32px_34px] shadow-north-md">
              <Eyebrow className="mb-3">Things that came your way</Eyebrow>
              <p className="mb-7 text-[15px] text-muted">
                Offers, invitations and conversations that changed the direction — including the ones you
                turned down.
              </p>
              {opportunities.length === 0 ? (
                <EmptyState
                  title="Nothing archived yet"
                  description="Log the offers and forks in the road, even the ones you said no to."
                />
              ) : (
                <div className="flex flex-col gap-6">
                  {opportunities.map((o) => (
                    <div key={o.id} className="border-b border-line-2 pb-6">
                      <Eyebrow className="mb-2">{format(parseISO(o.occurred_on), "MMMM yyyy")}</Eyebrow>
                      <div className="mb-2 text-[18px] font-extrabold leading-[1.4] text-ink">{o.what}</div>
                      {o.note && <p className="text-[15px] leading-[1.65] text-muted">{o.note}</p>}
                      <EditDeleteRow
                        onEdit={() => {
                          setEditingOpportunity(o);
                          setOpportunityDialogOpen(true);
                        }}
                        onDelete={() => handleDelete(() => removeOpportunity(o.id), "Entry removed", o.what)}
                      />
                    </div>
                  ))}
                </div>
              )}
              <AddDashedButton onClick={() => setOpportunityDialogOpen(true)}>Add an entry</AddDashedButton>
            </Card>

            <div className="relative max-w-[900px] overflow-hidden rounded-[26px] bg-ink p-[46px_48px] text-bg">
              <div
                className="pointer-events-none absolute -right-10 -top-24 h-[460px] w-[460px] rounded-full"
                style={{ background: "radial-gradient(circle, rgba(255,125,0,.24), transparent 66%)" }}
              />
              <div className="relative">
                <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-bg/60">
                  Legacy
                </div>
                <h2 className="mb-8 max-w-[24em] text-[30px] font-extrabold tracking-[-0.02em]">
                  What the work should add up to
                </h2>
                {legacyStatements.length === 0 ? (
                  <p className="text-[14.5px] leading-relaxed text-bg/70">
                    What do you want to have been true about how you worked?
                  </p>
                ) : (
                  <div className="flex flex-col gap-7">
                    {legacyStatements.map((s) => (
                      <div key={s.id} className="border-b border-bg/15 pb-7">
                        <div className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-bg/60">
                          {s.kind}
                        </div>
                        <p className="mt-2.5 text-[19px] font-bold leading-[1.6]">{s.statement}</p>
                        <div className="mt-4 flex gap-3.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLegacy(s);
                              setLegacyDialogOpen(true);
                            }}
                            className="text-[12px] font-extrabold text-bg/60 transition-colors hover:text-amber"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(() => removeStatement(s.id), "Legacy note removed", s.kind)}
                            className="text-[12px] font-extrabold text-bg/60 transition-colors hover:text-amber"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setLegacyDialogOpen(true)}
                  className="mt-6 w-full rounded-[14px] border-[1.5px] border-dashed border-bg/25 py-3.5 text-[14px] font-extrabold text-bg/60 transition-colors hover:border-amber hover:text-amber"
                >
                  Add a legacy note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-[34px] right-[34px] z-50 flex flex-col items-end gap-3">
        {captureOpen && (
          <div className="flex flex-col gap-2 rounded-[20px] border border-line bg-surface p-3 shadow-north-hero">
            {captureItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.onClick();
                  setCaptureOpen(false);
                }}
                className="rounded-[13px] px-4.5 py-2.5 text-left text-[14.5px] font-bold text-ink transition-colors hover:bg-surface-2"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setCaptureOpen((v) => !v)}
          title="Quick capture"
          className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-amber text-white shadow-[0_5px_16px_rgba(255,125,0,.2)] transition-transform hover:-translate-y-0.5"
        >
          {captureOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>

      <ExperienceDialog
        open={experienceDialogOpen}
        onOpenChange={setExperienceDialogOpen}
        experience={editingExperience}
        skills={skills}
        seasons={seasons}
        onSkillCreated={handleSkillCreated}
      />
      <MilestoneDialog
        open={milestoneDialogOpen}
        onOpenChange={setMilestoneDialogOpen}
        milestone={editingMilestone}
        experiences={experiences}
      />
      <GoalDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen} goal={editingGoal} />
      <SeasonDialog open={seasonDialogOpen} onOpenChange={setSeasonDialogOpen} season={editingSeason} />
      <MapStepDialog open={mapStepDialogOpen} onOpenChange={setMapStepDialogOpen} step={editingMapStep} />
      <StatementDialog
        open={identityDialogOpen}
        onOpenChange={setIdentityDialogOpen}
        statement={editingIdentity}
        context="identity"
      />
      <StatementDialog
        open={legacyDialogOpen}
        onOpenChange={setLegacyDialogOpen}
        statement={editingLegacy}
        context="legacy"
      />
      <MentorDialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen} mentor={editingMentor} />
      <ReflectionDialog
        open={reflectionDialogOpen}
        onOpenChange={setReflectionDialogOpen}
        reflection={editingReflection}
      />
      <OpportunityDialog
        open={opportunityDialogOpen}
        onOpenChange={setOpportunityDialogOpen}
        opportunity={editingOpportunity}
      />
      <SkillStoryDialog
        open={skillDialogOpen}
        onOpenChange={setSkillDialogOpen}
        skill={editingSkill}
        onSaved={handleSkillCreated}
      />
    </div>
  );
}
