"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2, MapPin, Plus, X } from "lucide-react";
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

const TABS = [
  { value: "seasons", label: "Seasons" },
  { value: "timeline", label: "Timeline" },
  { value: "skills", label: "Skill stories" },
  { value: "map", label: "Career map" },
  { value: "goals", label: "Goals" },
  { value: "identity", label: "Identity" },
  { value: "mentors", label: "Influences" },
  { value: "reflect", label: "Reflect" },
  { value: "archive", label: "Archive" },
  { value: "legacy", label: "Legacy" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

const CAPTURE_ITEMS: { tab: TabValue; label: string }[] = [
  { tab: "seasons", label: "Add a season" },
  { tab: "timeline", label: "Add a milestone" },
  { tab: "skills", label: "Add a skill story" },
  { tab: "map", label: "Add a step" },
  { tab: "goals", label: "Add a career goal" },
  { tab: "identity", label: "Add a statement" },
  { tab: "mentors", label: "Add an influence" },
  { tab: "reflect", label: "Write a reflection" },
  { tab: "archive", label: "Add an entry" },
  { tab: "legacy", label: "Add a legacy note" },
];

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

  const [extraSkills, setExtraSkills] = useState<Skill[]>([]);
  const skills = useMemo(() => {
    const known = new Set(skillsProp.map((s) => s.id));
    return [...skillsProp, ...extraSkills.filter((s) => !known.has(s.id))];
  }, [skillsProp, extraSkills]);

  const [activeTab, setActiveTab] = useState<TabValue>(seasons.length ? "seasons" : "timeline");
  const [captureOpen, setCaptureOpen] = useState(false);

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

  function openCapture(item: (typeof CAPTURE_ITEMS)[number]) {
    setActiveTab(item.tab);
    setCaptureOpen(false);
    switch (item.tab) {
      case "seasons":
        setEditingSeason(undefined);
        setSeasonDialogOpen(true);
        break;
      case "timeline":
        setEditingMilestone(undefined);
        setMilestoneDialogOpen(true);
        break;
      case "skills":
        setEditingSkill(undefined);
        setSkillDialogOpen(true);
        break;
      case "map":
        setEditingMapStep(undefined);
        setMapStepDialogOpen(true);
        break;
      case "goals":
        setEditingGoal(undefined);
        setGoalDialogOpen(true);
        break;
      case "identity":
        setEditingIdentity(undefined);
        setIdentityDialogOpen(true);
        break;
      case "mentors":
        setEditingMentor(undefined);
        setMentorDialogOpen(true);
        break;
      case "reflect":
        setEditingReflection(undefined);
        setReflectionDialogOpen(true);
        break;
      case "archive":
        setEditingOpportunity(undefined);
        setOpportunityDialogOpen(true);
        break;
      case "legacy":
        setEditingLegacy(undefined);
        setLegacyDialogOpen(true);
        break;
    }
  }

  async function handleDelete(action: () => Promise<void>, label: string) {
    await action();
    toast.success(label);
    router.refresh();
  }

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

      <div className="mb-[26px] flex flex-wrap gap-1.5 rounded-[20px] border border-line bg-surface-2 p-[5px]">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "rounded-[13px] px-3.5 py-2 text-[13px] font-bold transition-colors",
              activeTab === tab.value ? "bg-raise text-ink shadow-north-sm" : "text-muted hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "seasons" && (
        <div>
          {seasons.length === 0 ? (
            <EmptyState
              title="No seasons yet"
              description="Group your experience into the eras that make sense to you — what each one was really about, and what it taught you."
              action={
                <Button variant="accent" onClick={() => setSeasonDialogOpen(true)}>
                  Add your first season
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-5">
              {seasons.map((season) => (
                <Card key={season.id} className="overflow-hidden rounded-[22px] shadow-north-md">
                  <div className="p-[34px_36px]">
                    <div className="h-[3px] w-12 rounded-full bg-amber" />
                    <div className="mb-2 mt-4 flex flex-wrap items-baseline gap-3">
                      <h3 className="text-[26px] font-extrabold tracking-[-0.015em] text-ink">
                        {season.title}
                      </h3>
                      <span className="text-[13px] font-extrabold text-amber">
                        {season.start_year}
                        {season.is_current ? "–Present" : season.end_year ? `–${season.end_year}` : ""}
                      </span>
                    </div>
                    {season.chapter && <Eyebrow className="mb-4">{season.chapter}</Eyebrow>}
                    {season.description && (
                      <p className="mb-6 max-w-[40em] text-[16px] leading-[1.7] text-muted">
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
                      onDelete={() => handleDelete(() => removeSeason(season.id), "Season removed")}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
          <AddDashedButton onClick={() => setSeasonDialogOpen(true)}>Add a season</AddDashedButton>
        </div>
      )}

      {activeTab === "timeline" && (
        <div>
          <div className="flex items-center justify-between">
            <Button variant="accent" size="sm" onClick={() => setExperienceDialogOpen(true)}>
              Add experience
            </Button>
          </div>
          {experiences.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
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
                        onClick={() => {
                          setEditingExperience(exp);
                          setExperienceDialogOpen(true);
                        }}
                        aria-label="Edit experience"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(() => removeExperience(exp.id), "Experience removed")}
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
          )}

          <Card className="mt-6 rounded-[22px] p-[36px_38px] shadow-north-md">
            <Eyebrow className="mb-[30px]">Milestones, in order</Eyebrow>
            {milestones.length === 0 ? (
              <EmptyState title="No milestones yet" description="Mark the moments worth remembering." />
            ) : (
              <div className="relative pl-[30px]">
                <div className="absolute bottom-1.5 left-[5px] top-1.5 w-[2px] bg-line" />
                <div className="flex flex-col gap-9">
                  {milestones.map((m) => {
                    const related = m.experience_id ? experienceById.get(m.experience_id) : undefined;
                    return (
                      <div key={m.id} className="relative">
                        <div className="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full bg-teal" />
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
                        <div className="mb-1 text-[22px] font-extrabold text-ink">{m.title}</div>
                        {related && <div className="mb-3 text-[14px] text-muted">{related.organization}</div>}
                        {m.description && (
                          <p className="mb-3.5 max-w-[44em] text-[15.5px] leading-[1.7] text-muted">
                            {m.description}
                          </p>
                        )}
                        {m.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {m.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="normal-case tracking-normal">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <EditDeleteRow
                          onEdit={() => {
                            setEditingMilestone(m);
                            setMilestoneDialogOpen(true);
                          }}
                          onDelete={() => handleDelete(() => removeMilestone(m.id), "Milestone removed")}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <AddDashedButton onClick={() => setMilestoneDialogOpen(true)}>Add a milestone</AddDashedButton>
          </Card>
        </div>
      )}

      {activeTab === "skills" && (
        <div>
          {skills.length === 0 ? (
            <EmptyState
              title="No skill stories yet"
              description="Not a skill list — the growth behind each one, and what's next."
              action={
                <Button variant="accent" onClick={() => setSkillDialogOpen(true)}>
                  Add your first skill story
                </Button>
              }
            />
          ) : (
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
                      await removeSkill(skill.id);
                      toast.success("Skill removed");
                      router.refresh();
                    }}
                  />
                </Card>
              ))}
            </div>
          )}
          <AddDashedButton onClick={() => setSkillDialogOpen(true)}>Add a skill story</AddDashedButton>
        </div>
      )}

      {activeTab === "map" && (
        <div>
          <div className="mb-5">
            <h2 className="mb-1.5 text-[25px] font-extrabold tracking-[-0.01em] text-ink">Career map</h2>
            <p className="text-[15.5px] text-muted">
              Where it has been, where it is, and the directions it could go.
            </p>
          </div>
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
                          onDelete={() => handleDelete(() => removeMapStep(row.id), "Step removed")}
                        />
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
          <AddDashedButton onClick={() => setMapStepDialogOpen(true)}>Add a step</AddDashedButton>
        </div>
      )}

      {activeTab === "goals" && (
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
                    onDelete={() => handleDelete(() => removeGoal(g.id), "Goal removed")}
                  />
                </Card>
              ))}
            </div>
          )}
          <AddDashedButton onClick={() => setGoalDialogOpen(true)}>Add a career goal</AddDashedButton>
        </div>
      )}

      {activeTab === "identity" && (
        <Card className="max-w-[900px] rounded-[22px] p-[44px] shadow-north-md">
          <Eyebrow className="mb-3.5">Professional identity</Eyebrow>
          <h2 className="mb-[30px] text-[30px] font-extrabold tracking-[-0.02em] text-ink">
            The narrative behind the CV
          </h2>
          {identityStatements.length === 0 ? (
            <EmptyState title="Nothing written yet" description="How would you describe yourself, professionally, in your own words?" />
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
                    onDelete={() => handleDelete(() => removeStatement(s.id), "Statement removed")}
                  />
                </div>
              ))}
            </div>
          )}
          <AddDashedButton onClick={() => setIdentityDialogOpen(true)}>Add a statement</AddDashedButton>
        </Card>
      )}

      {activeTab === "mentors" && (
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
                        onDelete={() => handleDelete(() => removeMentor(m.id), "Influence removed")}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          <AddDashedButton onClick={() => setMentorDialogOpen(true)}>Add an influence</AddDashedButton>
        </div>
      )}

      {activeTab === "reflect" && (
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
                    onDelete={() => handleDelete(() => removeReflection(r.id), "Reflection removed")}
                  />
                </Card>
              ))}
            </div>
          )}
          <AddDashedButton onClick={() => setReflectionDialogOpen(true)}>Write a reflection</AddDashedButton>
        </div>
      )}

      {activeTab === "archive" && (
        <Card className="max-w-[860px] rounded-[22px] p-[32px_34px] shadow-north-md">
          <Eyebrow className="mb-3">Things that came your way</Eyebrow>
          <p className="mb-7 text-[15px] text-muted">
            Offers, invitations and conversations that changed the direction — including the ones you
            turned down.
          </p>
          {opportunities.length === 0 ? (
            <EmptyState title="Nothing archived yet" description="Log the offers and forks in the road, even the ones you said no to." />
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
                    onDelete={() => handleDelete(() => removeOpportunity(o.id), "Entry removed")}
                  />
                </div>
              ))}
            </div>
          )}
          <AddDashedButton onClick={() => setOpportunityDialogOpen(true)}>Add an entry</AddDashedButton>
        </Card>
      )}

      {activeTab === "legacy" && (
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
                        onClick={() => handleDelete(() => removeStatement(s.id), "Legacy note removed")}
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
      )}

      <div className="fixed bottom-[34px] right-[34px] z-50 flex flex-col items-end gap-3">
        {captureOpen && (
          <div className="flex flex-col gap-2 rounded-[20px] border border-line bg-surface p-3 shadow-north-hero">
            {CAPTURE_ITEMS.map((item) => (
              <button
                key={item.tab}
                type="button"
                onClick={() => openCapture(item)}
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
