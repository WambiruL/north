"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/types/database.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveSkill } from "@/server/actions/skills";

type Skill = Tables<"skills">;

export interface SkillPickerProps {
  skills: Skill[];
  value?: string | null;
  onChange: (skillId: string | undefined, skill?: Skill) => void;
  onSkillCreated?: (skill: Skill) => void;
  placeholder?: string;
}

export function SkillPicker({
  skills,
  value,
  onChange,
  onSkillCreated,
  placeholder = "Select a skill",
}: SkillPickerProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await saveSkill({ name, proficiency: 1 });
      if (result.error || !result.skill) {
        toast.error(result.error ?? "Couldn't create skill");
        return;
      }
      onChange(result.skill.id, result.skill);
      onSkillCreated?.(result.skill);
      toast.success(`Added skill "${result.skill.name}"`);
      setNewName("");
      setCreating(false);
    });
  }

  if (creating) {
    return (
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          placeholder="New skill name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
            if (e.key === "Escape") {
              setCreating(false);
              setNewName("");
            }
          }}
        />
        <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={handleCreate}>
          {pending ? "Adding…" : "Add"}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => {
            setCreating(false);
            setNewName("");
          }}
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select
          value={value ?? undefined}
          onValueChange={(v) => {
            const skill = skills.find((s) => s.id === v);
            onChange(v, skill);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {skills.length === 0 ? (
              <div className="px-2.5 py-2 text-[13px] text-faint">No skills yet</div>
            ) : (
              skills.map((skill) => (
                <SelectItem key={skill.id} value={skill.id}>
                  {skill.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(true)}>
        <Plus className="h-3.5 w-3.5" /> New
      </Button>
    </div>
  );
}
