"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ChefHat, Plus } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HobbyPageHeader } from "@/components/hobbies/shared/hobby-page-header";
import { StarDisplay } from "@/components/hobbies/shared/star-rating";
import { RecipeDialog } from "@/components/hobbies/cooking/recipe-dialog";
import { CookingLogDialog } from "@/components/hobbies/cooking/cooking-log-dialog";

type Recipe = Tables<"recipes">;
type CookingLog = Tables<"cooking_logs"> & { recipe: { id: string; name: string } | null };

function RecipeCard({ recipe, hobbyId }: { recipe: Recipe; hobbyId: string }) {
  return (
    <Link
      href={`/hobbies/${hobbyId}/recipes/${recipe.id}`}
      className="flex flex-col overflow-hidden rounded-[16px] border border-line bg-surface shadow-north-sm transition-transform hover:-translate-y-0.5"
    >
      <div className="aspect-[4/3] w-full bg-surface-2">
        {recipe.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.photo_url} alt={recipe.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-faint">
            <ChefHat className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <span className="line-clamp-1 text-[14px] font-bold text-ink">{recipe.name}</span>
        {recipe.rating != null && recipe.rating > 0 && <StarDisplay value={recipe.rating} />}
      </div>
    </Link>
  );
}

export function CookingPage({
  hobbyId,
  hobbyName,
  description,
  recipes,
  logs,
}: {
  hobbyId: string;
  hobbyName: string;
  description: string | null;
  recipes: Recipe[];
  logs: CookingLog[];
}) {
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);

  const made = recipes.filter((r) => r.status === "made");
  const wantToTry = recipes.filter((r) => r.status === "want_to_try");
  const isEmpty = recipes.length === 0 && logs.length === 0;

  return (
    <div className="flex flex-col gap-9">
      <HobbyPageHeader
        name={hobbyName}
        description={description}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setRecipeDialogOpen(true)}>
              Save a recipe
            </Button>
            <Button variant="accent" onClick={() => setLogDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add what I cooked
            </Button>
          </div>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={<ChefHat className="h-8 w-8" />}
          title="Your recipe book is empty."
          description="Save something you want to make, or add something you've cooked."
          action={
            <Button variant="accent" onClick={() => setLogDialogOpen(true)}>
              Add what I cooked
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {logs.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Cooking log</h2>
              <div className="flex flex-col gap-3">
                {logs.slice(0, 8).map((log) => (
                  <div key={log.id} className="flex items-center gap-4 rounded-[16px] border border-line bg-surface p-3.5 shadow-north-sm">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-surface-2">
                      {log.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={log.photo_url} alt={log.dish_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-faint">
                          <ChefHat className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14.5px] font-bold text-ink">{log.dish_name}</span>
                        <span className="text-[11.5px] text-faint">{format(parseISO(log.occurred_on), "d MMM")}</span>
                      </div>
                      {log.rating != null && log.rating > 0 && <StarDisplay value={log.rating} />}
                      {log.note && <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted">{log.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {made.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Recipes I&apos;ve made</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {made.map((r) => (
                  <RecipeCard key={r.id} recipe={r} hobbyId={hobbyId} />
                ))}
              </div>
            </div>
          )}

          {wantToTry.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Want to try</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {wantToTry.map((r) => (
                  <RecipeCard key={r.id} recipe={r} hobbyId={hobbyId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <RecipeDialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen} hobbyId={hobbyId} />
      <CookingLogDialog open={logDialogOpen} onOpenChange={setLogDialogOpen} hobbyId={hobbyId} recipes={recipes} />
    </div>
  );
}
