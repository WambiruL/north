"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { skillSchema, type SkillInput, type SkillFormInput } from "@/lib/validation/skills";
import { saveSkill, editSkill } from "@/server/actions/skills";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StringListInput } from "@/components/ui/string-list-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Skill = Tables<"skills">;

export interface SkillStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill?: Skill;
  onSaved?: (skill: Skill) => void;
}

function toDefaults(skill?: Skill): SkillInput {
  if (skill) {
    return {
      name: skill.name,
      category: skill.category ?? undefined,
      proficiency: skill.proficiency,
      levelLabel: skill.level_label ?? undefined,
      nextStep: skill.next_step ?? undefined,
      evidence: skill.evidence ?? undefined,
      hoursLogged: skill.hours_logged,
      growthSteps: skill.growth_steps,
    };
  }
  return {
    name: "",
    category: undefined,
    proficiency: 1,
    levelLabel: undefined,
    nextStep: undefined,
    evidence: undefined,
    hoursLogged: 0,
    growthSteps: [],
  };
}

/**
 * The richer skill editor — narrative fields (growth timeline, next step,
 * evidence, hours) alongside Learning's "skill map" basics.
 */
export function SkillStoryDialog({ open, onOpenChange, skill, onSaved }: SkillStoryDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, setValue, reset } = useForm<
    SkillFormInput,
    unknown,
    SkillInput
  >({
    resolver: zodResolver(skillSchema),
    values: toDefaults(skill),
  });

  const growthSteps = watch("growthSteps") ?? [];

  async function onSubmit(values: SkillInput) {
    setSubmitting(true);
    const result = skill ? await editSkill(skill.id, values) : await saveSkill(values);
    setSubmitting(false);
    if (result.error || !result.skill) {
      toast.error(result.error ?? "Couldn't save skill");
      return;
    }
    toast.success(skill ? "Skill updated" : "Skill added");
    onSaved?.(result.skill);
    router.refresh();
    onOpenChange(false);
    if (!skill) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{skill ? "Edit skill" : "Add a skill"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Skill</Label>
            <Input id="name" placeholder="Prototyping" {...register("name")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="Craft, leadership…" {...register("category")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="levelLabel">Level</Label>
              <Input id="levelLabel" placeholder="Advanced" {...register("levelLabel")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proficiency">Proficiency (1–5)</Label>
            <Input id="proficiency" type="number" min="1" max="5" {...register("proficiency")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="evidence">The evidence, not the claim</Label>
            <Textarea
              id="evidence"
              rows={3}
              placeholder="What you've actually done that proves this"
              {...register("evidence")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hoursLogged">Hours logged</Label>
            <Input id="hoursLogged" type="number" min="0" step="0.5" {...register("hoursLogged")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Growth so far</Label>
            <StringListInput
              value={growthSteps}
              onChange={(next) => setValue("growthSteps", next)}
              placeholder="A step along the way"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nextStep">Next</Label>
            <Input id="nextStep" placeholder="What comes after this" {...register("nextStep")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : skill ? "Save changes" : "Add skill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
