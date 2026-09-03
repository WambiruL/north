"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import { cookingLogSchema, type CookingLogInput } from "@/lib/validation/cooking";
import { saveCookingLog } from "@/server/actions/cooking";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/hobbies/shared/image-upload";
import { StarRating } from "@/components/hobbies/shared/star-rating";

type Recipe = Tables<"recipes">;

const NO_RECIPE = "__none__";

export function CookingLogDialog({
  open,
  onOpenChange,
  hobbyId,
  recipes,
  defaultRecipeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  recipes: Recipe[];
  defaultRecipeId?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<CookingLogInput>({
    resolver: zodResolver(cookingLogSchema) as unknown as Resolver<CookingLogInput>,
    defaultValues: {
      dishName: "",
      photoUrl: null,
      recipeId: defaultRecipeId ?? null,
      occurredOn: dateISOInTimezone(detectTimezone()),
      note: "",
    },
  });

  async function onSubmit(values: CookingLogInput) {
    setSubmitting(true);
    const result = await saveCookingLog(hobbyId, values);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Added to your cooking log");
    router.refresh();
    onOpenChange(false);
    reset({ dishName: "", photoUrl: null, recipeId: null, occurredOn: dateISOInTimezone(detectTimezone()), note: "" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>What did you cook?</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <Controller
            control={control}
            name="photoUrl"
            render={({ field }) => (
              <ImageUpload value={field.value} onChange={field.onChange} label="Add a photo" aspect="aspect-[4/3]" />
            )}
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dishName">Dish</Label>
            <Input id="dishName" placeholder="Chicken pilau" {...register("dishName")} />
          </div>
          {recipes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>From a saved recipe? (optional)</Label>
              <Controller
                control={control}
                name="recipeId"
                render={({ field }) => (
                  <Select value={field.value ?? NO_RECIPE} onValueChange={(v) => field.onChange(v === NO_RECIPE ? null : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="No recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_RECIPE}>No recipe</SelectItem>
                      {recipes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredOn">Date</Label>
              <Input id="occurredOn" type="date" {...register("occurredOn")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Rating</Label>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => <StarRating value={field.value ?? 0} onChange={field.onChange} />}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Notes</Label>
            <Textarea id="note" rows={2} placeholder="More cardamom next time…" {...register("note")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
