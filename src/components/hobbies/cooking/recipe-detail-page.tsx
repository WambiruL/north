"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, ChefHat, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarDisplay } from "@/components/hobbies/shared/star-rating";
import { RecipeDialog } from "@/components/hobbies/cooking/recipe-dialog";
import { CookingLogDialog } from "@/components/hobbies/cooking/cooking-log-dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { removeRecipe } from "@/server/actions/cooking";

type Recipe = Tables<"recipes">;
type CookingLog = Tables<"cooking_logs">;

export function RecipeDetailPage({
  hobbyId,
  recipe,
  logs,
}: {
  hobbyId: string;
  recipe: Recipe;
  logs: CookingLog[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [editOpen, setEditOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  async function handleDelete() {
    const ok = await confirm({ title: `Delete "${recipe.name}"?`, description: "This can't be undone." });
    if (!ok) return;
    await removeRecipe(hobbyId, recipe.id);
    toast.success("Recipe removed");
    router.push(`/hobbies/${hobbyId}`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-7">
      <Link
        href={`/hobbies/${hobbyId}`}
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to recipe book
      </Link>

      {recipe.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={recipe.photo_url} alt={recipe.name} className="max-h-[360px] w-full rounded-[18px] object-cover" />
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-ink">{recipe.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-muted">
            {recipe.status === "made" && <Badge variant="teal">Made it</Badge>}
            {recipe.prep_minutes != null && <span>Prep {recipe.prep_minutes}m</span>}
            {recipe.cook_minutes != null && <span>Cook {recipe.cook_minutes}m</span>}
          </div>
          {recipe.rating != null && recipe.rating > 0 && <StarDisplay value={recipe.rating} size="md" />}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {recipe.ingredients && (
        <div>
          <h2 className="mb-2 text-[13px] font-extrabold uppercase tracking-wider text-faint">Ingredients</h2>
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{recipe.ingredients}</p>
        </div>
      )}

      {recipe.method && (
        <div>
          <h2 className="mb-2 text-[13px] font-extrabold uppercase tracking-wider text-faint">Method</h2>
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{recipe.method}</p>
        </div>
      )}

      {recipe.notes && (
        <div>
          <h2 className="mb-2 text-[13px] font-extrabold uppercase tracking-wider text-faint">Notes</h2>
          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-muted">{recipe.notes}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-line-2 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-ink">Times you&apos;ve made this</h2>
          <Button variant="secondary" size="sm" onClick={() => setLogOpen(true)}>
            Log it
          </Button>
        </div>
        {logs.length === 0 ? (
          <p className="text-[13.5px] text-muted">Not logged yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 rounded-[12px] border border-line bg-surface p-3">
                <ChefHat className="h-4 w-4 shrink-0 text-faint" />
                <span className="text-[12.5px] font-bold text-muted">{format(parseISO(log.occurred_on), "d MMM yyyy")}</span>
                {log.rating != null && log.rating > 0 && <StarDisplay value={log.rating} />}
                {log.note && <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{log.note}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <RecipeDialog open={editOpen} onOpenChange={setEditOpen} hobbyId={hobbyId} recipe={recipe} />
      <CookingLogDialog open={logOpen} onOpenChange={setLogOpen} hobbyId={hobbyId} recipes={[recipe]} defaultRecipeId={recipe.id} />
    </div>
  );
}
