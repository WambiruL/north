"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import { experienceSchema, type ExperienceInput } from "@/lib/validation/career";
import { saveExperience } from "@/server/actions/career";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SkillPicker } from "@/components/skills/skill-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Skill = Tables<"skills">;
type Experience = Tables<"career_experiences"> & { skills?: Skill[] };

export interface ExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience?: Experience;
  skills: Skill[];
  onSkillCreated?: (skill: Skill) => void;
}

function toDefaults(experience?: Experience): ExperienceInput {
  if (experience) {
    return {
      title: experience.title,
      organization: experience.organization,
      location: experience.location ?? undefined,
      startDate: experience.start_date,
      endDate: experience.end_date ?? undefined,
      isCurrent: experience.is_current,
      narrative: experience.narrative ?? undefined,
      skillIds: (experience.skills ?? []).map((s) => s.id),
    };
  }
  return {
    title: "",
    organization: "",
    location: undefined,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: undefined,
    isCurrent: true,
    narrative: undefined,
    skillIds: [],
  };
}

export function ExperienceDialog({
  open,
  onOpenChange,
  experience,
  skills,
  onSkillCreated,
}: ExperienceDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [pickerValue, setPickerValue] = useState<string | undefined>(undefined);
  const { register, handleSubmit, control, watch, setValue, reset } = useForm<ExperienceInput>({
    resolver: zodResolver(experienceSchema),
    values: toDefaults(experience),
  });

  const isCurrent = watch("isCurrent");
  const skillIds = watch("skillIds") ?? [];

  async function onSubmit(values: ExperienceInput) {
    setSubmitting(true);
    const result = await saveExperience(values, experience?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(experience ? "Experience updated" : "Experience added");
    router.refresh();
    onOpenChange(false);
    if (!experience) {
      reset(toDefaults(undefined));
      setPickerValue(undefined);
    }
  }

  function addSkill() {
    if (!pickerValue) return;
    if (!skillIds.includes(pickerValue)) {
      setValue("skillIds", [...skillIds, pickerValue]);
    }
    setPickerValue(undefined);
  }

  function removeSkill(id: string) {
    setValue(
      "skillIds",
      skillIds.filter((s) => s !== id),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{experience ? "Edit experience" : "Add an experience"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Senior Product Designer" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="organization">Organization</Label>
            <Input id="organization" placeholder="Acme Co." {...register("organization")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Remote" {...register("location")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" disabled={isCurrent} {...register("endDate")} />
            </div>
          </div>
          <label className="flex items-center gap-2.5">
            <Controller
              control={control}
              name="isCurrent"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <span className="text-[13.5px] text-ink">This is my current role</span>
          </label>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="narrative">The story behind this role</Label>
            <Textarea
              id="narrative"
              rows={4}
              placeholder="What did you set out to do, and what happened?"
              {...register("narrative")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Skills</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <SkillPicker
                  skills={skills}
                  value={pickerValue}
                  onChange={(id) => setPickerValue(id)}
                  onSkillCreated={onSkillCreated}
                />
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={addSkill} disabled={!pickerValue}>
                Add
              </Button>
            </div>
            {skillIds.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {skillIds.map((id) => {
                  const skill = skills.find((s) => s.id === id);
                  return (
                    <Badge key={id} variant="teal" className="gap-1 pr-1.5">
                      {skill?.name ?? "Skill"}
                      <button
                        type="button"
                        onClick={() => removeSkill(id)}
                        className="ml-0.5 rounded-full hover:bg-black/10"
                        aria-label={`Remove ${skill?.name ?? "skill"}`}
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : experience ? "Save changes" : "Add experience"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
