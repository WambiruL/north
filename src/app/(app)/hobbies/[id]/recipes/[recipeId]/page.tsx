import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { getRecipeDetail } from "@/services/cooking";
import { RecipeDetailPage } from "@/components/hobbies/cooking/recipe-detail-page";

export const metadata: Metadata = { title: "Recipe" };

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string; recipeId: string }>;
}) {
  const { id, recipeId } = await params;
  const supabase = await createClient();
  const user = (await getCurrentUserAndProfile())?.user ?? null;
  if (!user) notFound();

  const detail = await getRecipeDetail(supabase, user.id, recipeId);
  if (!detail) notFound();

  return <RecipeDetailPage hobbyId={id} recipe={detail.recipe} logs={detail.logs} />;
}
