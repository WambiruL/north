"use client";

import { useState } from "react";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Star } from "lucide-react";
import {
  hobbyMemorySchema,
  type HobbyMemoryInput,
  type HobbyMemoryFormInput,
} from "@/lib/validation/hobbies";
import { getHobbyTemplate, type HobbyFieldDef } from "@/lib/constants/hobby-templates";
import { saveHobbyMemory } from "@/server/actions/hobbies";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface HobbyMemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  hobbyName: string;
  kind: string;
}

function defaults(): HobbyMemoryFormInput {
  return {
    caption: "",
    imageUrl: undefined,
    occurredOn: dateISOInTimezone(detectTimezone()),
    durationMinutes: undefined,
    fields: {},
  };
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className="p-0.5"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              n <= value ? "fill-amber text-amber" : "fill-transparent text-line",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function DynamicField({
  def,
  control,
}: {
  def: HobbyFieldDef;
  control: ReturnType<typeof useForm<HobbyMemoryFormInput, unknown, HobbyMemoryInput>>["control"];
}) {
  return (
    <Controller
      control={control}
      name={`fields.${def.key}`}
      render={({ field }) => {
        const stringValue = typeof field.value === "string" || typeof field.value === "number" ? String(field.value) : "";
        if (def.type === "select") {
          return (
            <div className="flex flex-col gap-1.5">
              <Label>{def.label}</Label>
              <Select value={stringValue || undefined} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick one" />
                </SelectTrigger>
                <SelectContent>
                  {(def.options ?? []).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        if (def.type === "rating") {
          return (
            <div className="flex flex-col gap-1.5">
              <Label>{def.label}</Label>
              <StarRating value={Number(field.value) || 0} onChange={field.onChange} />
            </div>
          );
        }
        if (def.type === "textarea") {
          return (
            <div className="flex flex-col gap-1.5">
              <Label>{def.label}</Label>
              <Textarea
                rows={2}
                placeholder={def.placeholder}
                value={stringValue}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-1.5">
            <Label>{def.label}</Label>
            <div className="relative">
              <Input
                type={def.type === "number" ? "number" : "text"}
                placeholder={def.placeholder}
                value={stringValue}
                onChange={(e) =>
                  field.onChange(def.type === "number" ? e.target.valueAsNumber || undefined : e.target.value)
                }
                className={def.unit ? "pr-14" : undefined}
              />
              {def.unit && (
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12.5px] font-semibold text-faint">
                  {def.unit}
                </span>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}

export function HobbyMemoryDialog({ open, onOpenChange, hobbyId, hobbyName, kind }: HobbyMemoryDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const template = getHobbyTemplate(kind);
  const { register, handleSubmit, control, reset } = useForm<HobbyMemoryFormInput, unknown, HobbyMemoryInput>({
    resolver: zodResolver(hobbyMemorySchema),
    defaultValues: defaults(),
  });

  async function onSubmit(values: HobbyMemoryInput) {
    setSubmitting(true);
    const result = await saveHobbyMemory(hobbyId, hobbyName, values);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Logged");
    router.refresh();
    onOpenChange(false);
    reset(defaults());
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{template.entryVerb}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-0.5" noValidate>
          <div className={cn("grid gap-4", template.logsDuration ? "grid-cols-2" : "grid-cols-1")}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredOn">Date</Label>
              <Input id="occurredOn" type="date" {...register("occurredOn")} />
            </div>
            {template.logsDuration && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="durationMinutes">Minutes</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={0}
                  max={1440}
                  placeholder="Optional"
                  {...register("durationMinutes")}
                />
              </div>
            )}
          </div>

          {template.fields.length > 0 && (
            <div className="flex flex-col gap-4 rounded-[16px] border border-line-2 bg-surface-2 p-4">
              {template.fields.map((def) => (
                <DynamicField key={def.key} def={def} control={control} />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Notes</Label>
            <Textarea
              id="caption"
              rows={2}
              placeholder="Anything else worth remembering? (optional)"
              {...register("caption")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrl">Photo URL</Label>
            <Input id="imageUrl" placeholder="Paste an image URL (optional)" {...register("imageUrl")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : template.entryVerb}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
