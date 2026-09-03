"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { recipeSchema, recipeStatuses, type RecipeInput } from "@/lib/validation/cooking";
import { saveRecipe } from "@/server/actions/cooking";
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

const STATUS_LABEL: Record<(typeof recipeStatuses)[number], string> = {
  want_to_try: "Want to try",
  made: "Made it",
};

function toDefaults(recipe?: Recipe): RecipeInput {
  if (recipe) {
    return {
      name: recipe.name,
      photoUrl: recipe.photo_url ?? null,
      ingredients: recipe.ingredients ?? undefined,
      method: recipe.method ?? undefined,
      prepMinutes: recipe.prep_minutes ?? undefined,
      cookMinutes: recipe.cook_minutes ?? undefined,
      notes: recipe.notes ?? undefined,
      rating: recipe.rating ?? undefined,
      status: recipe.status as RecipeInput["status"],
    };
  }
  return { name: "", photoUrl: null, status: "want_to_try", ingredients: "", method: "", notes: "" };
}

export function RecipeDialog({
  open,
  onOpenChange,
  hobbyId,
  recipe,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  recipe?: Recipe;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset, watch } = useForm<RecipeInput>({
    resolver: zodResolver(recipeSchema) as unknown as Resolver<RecipeInput>,
    values: toDefaults(recipe),
  });
  const status = watch("status");

  async function onSubmit(values: RecipeInput) {
    setSubmitting(true);
    const result = await saveRecipe(hobbyId, values, recipe?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(recipe ? "Recipe updated" : "Saved to your recipe book");
    router.refresh();
    onOpenChange(false);
    if (!recipe) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe ? "Edit recipe" : "Add recipe"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[110px_1fr]">
            <Controller
              control={control}
              name="photoUrl"
              render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} label="Photo" />}
            />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Chicken pilau" {...register("name")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {recipeStatuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {status === "made" && (
                <div className="flex flex-col gap-1.5">
                  <Label>Rating</Label>
                  <Controller
                    control={control}
                    name="rating"
                    render={({ field }) => <StarRating value={field.value ?? 0} onChange={field.onChange} />}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prepMinutes">Prep time (min)</Label>
              <Input id="prepMinutes" type="number" min="0" {...register("prepMinutes")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cookMinutes">Cook time (min)</Label>
              <Input id="cookMinutes" type="number" min="0" {...register("cookMinutes")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea id="ingredients" rows={4} placeholder="One per line" {...register("ingredients")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method">Method</Label>
            <Textarea id="method" rows={5} {...register("method")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} placeholder="Optional" {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : recipe ? "Save changes" : "Add recipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
